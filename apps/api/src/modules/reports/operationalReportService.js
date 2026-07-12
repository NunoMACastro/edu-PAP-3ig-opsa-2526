/**
 * @file Service de relatórios operacionais de vendas, compras, margem e stock.
 */

import { recordAuditLog } from "../audit/auditLogService.js";
import { calculateAccountingMargin } from "../ai/aiMetricCatalog.js";

/**
 * Aplica o sinal contabilístico correto a vendas e notas de crédito.
 * Em relatórios operacionais, notas de crédito reduzem vendas para manter margem e totais coerentes.
 *
 * @param document - Documento de negócio a processar.
 * @returns Total de venda com sinal contabilístico aplicado.
 */
function signedSaleTotal(document) {
    return document.kind === "CREDIT_NOTE" ? -document.totalCents : document.totalCents;
}

/**
 * Aplica sinal contabilístico correto a compras e notas de crédito em relatórios.
 *
 * @param document - Documento de negócio a processar.
 * @returns Total de compra com sinal contabilístico aplicado.
 */
function signedPurchaseTotal(document) {
    return document.kind === "SUPPLIER_CREDIT_NOTE"
        ? -document.totalCents
        : document.totalCents;
}

/**
 * Agrega dados reais para reporting operacional.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input - Contexto.
 * @returns {Promise<object>} Relatório operacional.
 */
export async function buildOperationalReport(prisma, input) {
    const [saleDocuments, purchaseDocuments, stockBalances, journalLines] = await Promise.all([
        prisma.saleDocument.findMany({
            where: {
                companyId: input.companyId,
                issuedAt: { gte: input.fromDate, lte: input.toDate },
                status: { in: ["ISSUED", "SETTLED"] },
            },
            orderBy: { issuedAt: "asc" },
        }),
        prisma.purchaseDocument.findMany({
            where: {
                companyId: input.companyId,
                issuedAt: { gte: input.fromDate, lte: input.toDate },
                status: { in: ["APPROVED", "POSTED", "PAID"] },
            },
            orderBy: { issuedAt: "asc" },
        }),
        prisma.stockBalance.findMany({
            where: { companyId: input.companyId },
            include: { item: true, warehouse: true },
            orderBy: [{ itemId: "asc" }, { warehouseId: "asc" }],
        }),
        prisma.journalEntryLine.findMany({
            where: {
                journalEntry: {
                    companyId: input.companyId,
                    entryDate: { gte: input.fromDate, lte: input.toDate },
                },
            },
            select: {
                debitCents: true,
                creditCents: true,
                account: { select: { code: true } },
            },
        }),
    ]);

    const documentRevenueCents = saleDocuments.reduce(
        (sum, document) => sum + signedSaleTotal(document), 0,
    );
    const documentPurchaseCents = purchaseDocuments.reduce(
        (sum, document) => sum + signedPurchaseTotal(document), 0,
    );
    const accounting = calculateAccountingMargin(journalLines);
    const revenueCents = accounting.revenueCents;
    const purchaseCents = accounting.operatingExpenseCents;
    const stockRows = stockBalances.map((balance) => {
        const quantity = Number(balance.quantity);
        const stockValueCents = Math.round(quantity * balance.item.costCents);
        return {
            itemId: balance.itemId,
            sku: balance.item.sku,
            name: balance.item.name,
            warehouseId: balance.warehouseId,
            warehouse: balance.warehouse.name,
            quantity,
            unitCostCents: balance.item.costCents,
            stockValueCents,
            source: "StockBalance.quantity * Item.costCents",
        };
    });
    const stockValueCents = stockRows.reduce(
        (sum, row) => sum + row.stockValueCents,
        0,
    );
    const marginCents = accounting.operatingResultCents;
    const sources = [
        "JournalEntryLine + Account.code (classes SNC 6/7)",
        "StockBalance.quantity + Item.costCents",
    ];

    const run = await prisma.$transaction(async (tx) => {
        const created = await tx.operationalReportRun.create({
            data: {
                companyId: input.companyId,
                fromDate: input.fromDate,
                toDate: input.toDate,
                revenueCents,
                purchaseCents,
                marginCents,
                operatingResultCents: accounting.operatingResultCents,
                operatingMarginBps: accounting.operatingMarginBps,
                accountingMethod: accounting.method,
                dataQuality: accounting.quality,
                stockValueCents,
                sources,
                generatedById: input.userId,
            },
        });
        await recordAuditLog(tx, {
            companyId: input.companyId,
            userId: input.userId,
            action: "OPERATIONAL_REPORT_GENERATED",
            entity: "OperationalReportRun",
            entityId: created.id,
            details: { sourceCount: sources.length },
        });
        return created;
    });

    return {
        runId: run.id,
        fromDate: input.fromDate,
        toDate: input.toDate,
        sales: {
            count: saleDocuments.length,
            totalCents: revenueCents,
            documentControlTotalCents: documentRevenueCents,
            source: "Lançamentos contabilísticos em contas SNC de rendimentos",
        },
        purchases: {
            count: purchaseDocuments.length,
            totalCents: purchaseCents,
            documentControlTotalCents: documentPurchaseCents,
            source: "Lançamentos contabilísticos em contas SNC de gastos operacionais",
        },
        margin: {
            totalCents: marginCents,
            operatingMarginBps: accounting.operatingMarginBps,
            method: accounting.method,
            quality: accounting.quality,
            source: "Resultado operacional contabilístico sobre classes SNC",
        },
        stock: {
            totalValueCents: stockValueCents,
            rows: stockRows,
        },
        sources,
        note: accounting.quality === "INSUFFICIENT_DATA"
            ? "INSUFFICIENT_DATA: faltam lançamentos suficientes nas classes SNC 6 e 7."
            : "Indicador operacional interno; não substitui demonstrações legais certificadas.",
    };
}
