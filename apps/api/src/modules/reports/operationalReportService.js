/**
 * @file Service de relatórios operacionais de vendas, compras, margem e stock.
 * @param document - Documento de negócio a processar.
 * 
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
    const [saleDocuments, purchaseDocuments, stockBalances] = await Promise.all([
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
    ]);

    const revenueCents = saleDocuments.reduce(
        (sum, document) => sum + signedSaleTotal(document),
        0,
    );
    const purchaseCents = purchaseDocuments.reduce(
        (sum, document) => sum + signedPurchaseTotal(document),
        0,
    );
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
    const marginCents = revenueCents - purchaseCents;
    const sources = [
        "SaleDocument.totalCents",
        "PurchaseDocument.totalCents",
        "StockBalance.quantity + Item.costCents",
    ];

    const run = await prisma.operationalReportRun.create({
        data: {
            companyId: input.companyId,
            fromDate: input.fromDate,
            toDate: input.toDate,
            revenueCents,
            purchaseCents,
            marginCents,
            stockValueCents,
            sources,
            generatedById: input.userId,
        },
    });

    return {
        runId: run.id,
        fromDate: input.fromDate,
        toDate: input.toDate,
        sales: {
            count: saleDocuments.length,
            totalCents: revenueCents,
            source: "SaleDocument emitidos/liquidados no período",
        },
        purchases: {
            count: purchaseDocuments.length,
            totalCents: purchaseCents,
            source: "PurchaseDocument aprovados/lançados/pagos no período",
        },
        margin: {
            totalCents: marginCents,
            source: "Margem operacional MVP = vendas - compras",
        },
        stock: {
            totalValueCents: stockValueCents,
            rows: stockRows,
        },
        sources,
        note: "Margem operacional MVP; não substitui margem bruta FIFO nem demonstrações legais.",
    };
}
