/**
 * @file Service de cálculo do mapa de IVA interno da MF3.
 */

/**
 * Cria ou reutiliza o balde de agregação de IVA para uma taxa.
 * O mapa evita duplicar linhas para a mesma taxa enquanto acumula imposto liquidado e dedutível.
 *
 * @param buckets - Mapa de agregação onde o balde é criado ou atualizado.
 * @param key - Chave a extrair da resposta JSON.
 * @param data - Dados normalizados usados pela operação.
 * @returns Balde de IVA criado ou atualizado no mapa de agregação.
 */
function upsertVatBucket(buckets, key, data) {
    if (!buckets.has(key)) {
        buckets.set(key, {
            vatRateId: data.vatRateId,
            code: data.code,
            description: data.description,
            rateBps: data.rateBps,
            liquidatedVatCents: 0,
            deductibleVatCents: 0,
        });
    }
    return buckets.get(key);
}

/**
 * Agrupa linhas de IVA por taxa para calcular bases tributáveis e imposto liquidado ou dedutível.
 *
 * @param buckets - Mapa de agregação de IVA a atualizar.
 * @param lines - Linhas de negócio a validar ou agregar.
 * @param kind - Tipo funcional usado para classificar a linha de IVA.
 * @param side - Lado fiscal do mapa de IVA a atualizar.
 * @returns Não devolve valor; atualiza o mapa de agregação recebido.
 */
function addVatLines(buckets, lines, kind, side) {
    const sign = kind.endsWith("CREDIT_NOTE") ? -1 : 1;
    for (const line of lines) {
        const key = line.vatRateId;
        const bucket = upsertVatBucket(buckets, key, {
            vatRateId: line.vatRateId,
            code: line.vatRate.code,
            description: line.vatRate.description,
            rateBps: line.vatRate.rateBps,
        });
        if (side === "SALE") {
            bucket.liquidatedVatCents += sign * line.vatCents;
        } else {
            bucket.deductibleVatCents += sign * line.vatCents;
        }
    }
}

/**
 * Calcula e persiste uma execução do mapa de IVA.
 *
 * O diário contabilístico é a fonte de verdade para saber que documentos estão
 * contabilizados. As linhas de venda/compra só são usadas para decompor o IVA
 * por código e taxa, porque `JournalEntryLine` não guarda `vatRateId`.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input - Contexto validado.
 * @returns {Promise<object>} Mapa calculado e execução persistida.
 */
export async function buildVatMap(prisma, input) {
    const journalEntries = await prisma.journalEntry.findMany({
        where: {
            companyId: input.companyId,
            source: { in: ["SALE", "PURCHASE"] },
            entryDate: { gte: input.fromDate, lte: input.toDate },
        },
        select: { source: true, sourceId: true },
    });

    const saleIds = journalEntries
        .filter((entry) => entry.source === "SALE")
        .map((entry) => entry.sourceId);
    const purchaseIds = journalEntries
        .filter((entry) => entry.source === "PURCHASE")
        .map((entry) => entry.sourceId);

    const [saleDocuments, purchaseDocuments] = await Promise.all([
        prisma.saleDocument.findMany({
            where: { id: { in: saleIds }, companyId: input.companyId },
            include: { lines: { include: { vatRate: true } } },
        }),
        prisma.purchaseDocument.findMany({
            where: { id: { in: purchaseIds }, companyId: input.companyId },
            include: { lines: { include: { vatRate: true } } },
        }),
    ]);

    const buckets = new Map();
    for (const document of saleDocuments) {
        addVatLines(buckets, document.lines, document.kind, "SALE");
    }
    for (const document of purchaseDocuments) {
        addVatLines(buckets, document.lines, document.kind, "PURCHASE");
    }

    const rows = [...buckets.values()]
        .map((row) => ({
            ...row,
            vatBalanceCents: row.liquidatedVatCents - row.deductibleVatCents,
            source:
                "JournalEntry.source/sourceId + SaleDocumentLine/PurchaseDocumentLine.vatRate",
        }))
        .sort((a, b) => a.code.localeCompare(b.code));

    const liquidatedVatCents = rows.reduce(
        (sum, row) => sum + row.liquidatedVatCents,
        0,
    );
    const deductibleVatCents = rows.reduce(
        (sum, row) => sum + row.deductibleVatCents,
        0,
    );
    const vatBalanceCents = liquidatedVatCents - deductibleVatCents;

    const run = await prisma.vatMapRun.create({
        data: {
            companyId: input.companyId,
            fromDate: input.fromDate,
            toDate: input.toDate,
            liquidatedVatCents,
            deductibleVatCents,
            vatBalanceCents,
            generatedById: input.userId,
        },
    });

    return {
        runId: run.id,
        fromDate: input.fromDate,
        toDate: input.toDate,
        liquidatedVatCents,
        deductibleVatCents,
        vatBalanceCents,
        rows,
        sources: [
            "JournalEntry contabilizados de vendas e compras",
            "SaleDocumentLine/PurchaseDocumentLine para taxa e código de IVA",
        ],
    };
}
