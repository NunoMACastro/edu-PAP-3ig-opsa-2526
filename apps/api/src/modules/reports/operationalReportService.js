// apps/api/src/modules/reports/operationalReportService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Soma um campo monetario em cêntimos numa lista de registos.
 *
 * @param {Array<Record<string, unknown>>} rows Linhas vindas do Prisma.
 * @param {string} field Campo a somar.
 * @returns {number} Soma em cêntimos.
 */
function sumCents(rows, field) {
    return rows.reduce((sum, row) => sum + (Number.isFinite(row[field]) ? row[field] : 0), 0);
}

/**
 * Gera relatório operacional de vendas, compras, margem simples e stock.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input Contexto multiempresa e período.
 * @returns {Promise<{ runId: string, totals: { salesCents: number, purchasesCents: number, marginCents: number, stockUnits: number }, sales: Array<object>, purchases: Array<object>, stock: Array<object>, sources: string[] }>} Relatório pronto para UI e KPIs.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 quando não há empresa ativa.
 */
export async function buildOperationalReport(prisma, { companyId, userId, fromDate, toDate }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    const [sales, purchases, stockBalances] = await Promise.all([
        prisma.saleDocument.findMany({ where: { companyId, issuedAt: { gte: fromDate, lte: toDate }, status: { in: ["ISSUED", "SETTLED"] } }, select: { id: true, number: true, totalCents: true } }),
        prisma.purchaseDocument.findMany({ where: { companyId, issuedAt: { gte: fromDate, lte: toDate }, status: { in: ["APPROVED", "POSTED", "PAID"] } }, select: { id: true, supplierNumber: true, totalCents: true } }),
        prisma.stockBalance.findMany({ where: { companyId }, select: { itemId: true, quantity: true, item: { select: { sku: true, name: true } } } }),
    ]);

    const salesCents = sumCents(sales, "totalCents");
    const purchasesCents = sumCents(purchases, "totalCents");
    // Margem MVP: indicador operacional simples, não margem contabilística por custo de stock.
    const marginCents = salesCents - purchasesCents;
    const stockUnits = stockBalances.reduce((sum, row) => sum + Number(row.quantity), 0);
    const purchaseRows = purchases.map((document) => ({ id: document.id, number: document.supplierNumber, totalCents: document.totalCents }));

    const run = await prisma.operationalReportRun.create({ data: { companyId, fromDate, toDate, salesCents, purchasesCents, marginCents, stockUnits, generatedById: userId } });

    return {
        runId: run.id,
        totals: { salesCents, purchasesCents, marginCents, stockUnits },
        sales,
        purchases: purchaseRows,
        stock: stockBalances.map((row) => ({ itemId: row.itemId, sku: row.item.sku, name: row.item.name, quantity: Number(row.quantity) })),
        sources: ["SaleDocument", "PurchaseDocument", "StockBalance"],
    };
}