// apps/api/src/modules/tax/vatMapService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Normaliza valores monetários em cêntimos antes de os somar.
 *
 * @param {number | null | undefined} value Valor monetario vindo da base de dados.
 * @returns {number} Valor seguro para agregação.
 */
function cents(value) {
    return Number.isFinite(value) ? value : 0;
}

/**
 * Agrega IVA por código e taxa.
 *
 * @param {Map<string, { vatCode: string, vatRateBps: number, liquidatedVatCents: number, deductibleVatCents: number }>} map Buckets acumulados.
 * @param {string} key Chave composta por código e taxa.
 * @param {{ vatCode: string, vatRateBps: number, liquidatedVatCents?: number, deductibleVatCents?: number }} patch Valores a somar ao bucket.
 * @returns {void}
 */
function addToBucket(map, key, patch) {
    const current = map.get(key) ?? {
        vatCode: patch.vatCode,
        vatRateBps: patch.vatRateBps,
        liquidatedVatCents: 0,
        deductibleVatCents: 0,
    };

    current.liquidatedVatCents += cents(patch.liquidatedVatCents);
    current.deductibleVatCents += cents(patch.deductibleVatCents);
    map.set(key, current);
}

/**
 * Gera o mapa de IVA interno da empresa ativa.
 *
 * A fonte canónica de inclusão é `JournalEntry`: só entram documentos contabilizados pelos BKs MF1-04 e MF1-09.
 * As linhas de venda/compra são usadas de forma derivada para obter código/taxa de IVA, porque o diário guarda
 * a conta SNC de IVA mas não guarda a taxa fiscal original da linha.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input Contexto multiempresa e período validado.
 * @returns {Promise<{ runId: string, from: string, to: string, totals: { liquidatedVatCents: number, deductibleVatCents: number, vatBalanceCents: number }, rows: Array<{ vatCode: string, vatRateBps: number, liquidatedVatCents: number, deductibleVatCents: number, balanceCents: number }>, sources: string[] }>} Resultado fiscal pronto para frontend e evidence.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 quando não há empresa ativa.
 */
export async function buildVatMap(prisma, { companyId, userId, fromDate, toDate }) {
    if (!companyId) {
        throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");
    }

    const [saleEntries, purchaseEntries] = await Promise.all([
        prisma.journalEntry.findMany({
            where: {
                companyId,
                source: "SALE",
                entryDate: { gte: fromDate, lte: toDate },
            },
            select: { sourceId: true },
        }),
        prisma.journalEntry.findMany({
            where: {
                companyId,
                source: "PURCHASE",
                entryDate: { gte: fromDate, lte: toDate },
            },
            select: { sourceId: true },
        }),
    ]);

    const saleDocumentIds = saleEntries.map((entry) => entry.sourceId);
    const purchaseDocumentIds = purchaseEntries.map((entry) => entry.sourceId);

    // O diário contabilístico decide que documentos entram; as linhas operacionais dao a taxa fiscal detalhada.
    const [sales, purchases] = await Promise.all([
        prisma.saleDocumentLine.findMany({
            where: {
                saleDocumentId: { in: saleDocumentIds },
                saleDocument: {
                    companyId,
                },
            },
            select: {
                vatCents: true,
                vatRate: { select: { code: true, rateBps: true } },
            },
        }),
        prisma.purchaseDocumentLine.findMany({
            where: {
                purchaseDocumentId: { in: purchaseDocumentIds },
                purchaseDocument: {
                    companyId,
                },
            },
            select: {
                vatCents: true,
                vatRate: { select: { code: true, rateBps: true } },
            },
        }),
    ]);

    const rowsByRate = new Map();

    for (const line of sales) {
        const key = `${line.vatRate.code}-${line.vatRate.rateBps}`;
        addToBucket(rowsByRate, key, {
            vatCode: line.vatRate.code,
            vatRateBps: line.vatRate.rateBps,
            liquidatedVatCents: line.vatCents,
        });
    }

    for (const line of purchases) {
        const key = `${line.vatRate.code}-${line.vatRate.rateBps}`;
        addToBucket(rowsByRate, key, {
            vatCode: line.vatRate.code,
            vatRateBps: line.vatRate.rateBps,
            deductibleVatCents: line.vatCents,
        });
    }

    const rows = [...rowsByRate.values()].map((row) => ({
        ...row,
        balanceCents: row.liquidatedVatCents - row.deductibleVatCents,
    }));

    const totals = rows.reduce(
        (acc, row) => ({
            liquidatedVatCents: acc.liquidatedVatCents + row.liquidatedVatCents,
            deductibleVatCents: acc.deductibleVatCents + row.deductibleVatCents,
            vatBalanceCents: acc.vatBalanceCents + row.balanceCents,
        }),
        { liquidatedVatCents: 0, deductibleVatCents: 0, vatBalanceCents: 0 },
    );

    const run = await prisma.vatMapRun.create({
        data: {
            companyId,
            generatedById: userId,
            fromDate,
            toDate,
            ...totals,
        },
    });

    return {
        runId: run.id,
        from: fromDate.toISOString().slice(0, 10),
        to: toDate.toISOString().slice(0, 10),
        totals,
        rows,
        sources: ["JournalEntry", "SaleDocumentLine", "PurchaseDocumentLine"],
    };
}