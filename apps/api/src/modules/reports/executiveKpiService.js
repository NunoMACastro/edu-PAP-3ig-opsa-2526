// apps/api/src/modules/reports/executiveKpiService.js
import { httpError } from "../../lib/httpErrors.js";

const dayMs = 86400000;

/**
 * Soma um campo monetario em cêntimos.
 *
 * @param {Array<Record<string, unknown>>} rows Linhas vindas do Prisma.
 * @param {string} field Campo a somar.
 * @returns {number} Soma em cêntimos.
 */
function sum(rows, field) {
    return rows.reduce((total, row) => total + (Number.isFinite(row[field]) ? row[field] : 0), 0);
}

/**
 * Calcula média de dias entre duas datas.
 *
 * @param {Array<Record<string, Date>>} rows Linhas com datas de início e fim.
 * @param {string} startField Campo da data inicial.
 * @param {string} endField Campo da data final.
 * @returns {number | null} Média arredondada a uma casa, ou null sem dados.
 */
function averageDays(rows, startField, endField) {
    if (rows.length === 0) return null;
    const total = rows.reduce((acc, row) => acc + Math.max(0, (row[endField].getTime() - row[startField].getTime()) / dayMs), 0);
    return Number((total / rows.length).toFixed(1));
}

/**
 * Calcula KPIs executivos a partir de documentos e liquidações reais.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input Contexto multiempresa e período.
 * @returns {Promise<{ runId: string, revenueCents: number, costCents: number, ebitdaCents: number, pmrDays: number | null, pmpDays: number | null, sources: string[] }>} KPIs prontos para UI e MF4.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 quando não há empresa ativa.
 */
export async function buildExecutiveKpis(prisma, { companyId, userId, fromDate, toDate }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    const [sales, purchases, receipts, payments] = await Promise.all([
        prisma.saleDocument.findMany({ where: { companyId, issuedAt: { gte: fromDate, lte: toDate }, status: { in: ["ISSUED", "SETTLED"] } }, select: { id: true, issuedAt: true, totalCents: true } }),
        prisma.purchaseDocument.findMany({ where: { companyId, issuedAt: { gte: fromDate, lte: toDate }, status: { in: ["APPROVED", "POSTED", "PAID"] } }, select: { id: true, issuedAt: true, totalCents: true } }),
        prisma.receipt.findMany({ where: { companyId, receivedAt: { gte: fromDate, lte: toDate } }, select: { saleDocument: { select: { issuedAt: true } }, receivedAt: true } }),
        prisma.payment.findMany({ where: { companyId, paidAt: { gte: fromDate, lte: toDate } }, select: { purchaseDocument: { select: { issuedAt: true } }, paidAt: true } }),
    ]);

    const revenueCents = sum(sales, "totalCents");
    const costCents = sum(purchases, "totalCents");
    // EBITDA MVP: indicador operacional simples, não demonstracao financeira oficial.
    const ebitdaCents = revenueCents - costCents;
    const pmrDays = averageDays(receipts.map((row) => ({ issuedAt: row.saleDocument.issuedAt, receivedAt: row.receivedAt })), "issuedAt", "receivedAt");
    const pmpDays = averageDays(payments.map((row) => ({ issuedAt: row.purchaseDocument.issuedAt, paidAt: row.paidAt })), "issuedAt", "paidAt");

    const run = await prisma.executiveKpiRun.create({ data: { companyId, fromDate, toDate, revenueCents, costCents, ebitdaCents, pmrDays, pmpDays, generatedById: userId } });
    return { runId: run.id, revenueCents, costCents, ebitdaCents, pmrDays, pmpDays, sources: ["SaleDocument", "PurchaseDocument", "Receipt", "Payment"] };
}