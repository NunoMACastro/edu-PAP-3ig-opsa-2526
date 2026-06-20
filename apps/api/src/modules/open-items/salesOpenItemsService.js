/**
 * @file Service de títulos de venda em aberto e antiguidade de saldos.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Valida data de referência.
 *
 * @param {unknown} value - Valor opcional recebido por query string.
 * @returns {Date} Data de referência.
 */
function parseAsOfDate(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_DATE", "Data de referência inválida");
    }
    return date;
}

/**
 * Classifica antiguidade do saldo.
 *
 * @param {number} daysOverdue - Dias vencidos.
 * @returns {string} Bucket funcional.
 */
function bucketFor(daysOverdue) {
    if (daysOverdue <= 0) return "NOT_DUE";
    if (daysOverdue <= 30) return "DAYS_1_30";
    if (daysOverdue <= 60) return "DAYS_31_60";
    if (daysOverdue <= 90) return "DAYS_61_90";
    return "DAYS_90_PLUS";
}

/**
 * Lista documentos de venda emitidos com saldo em aberto.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {{ asOfDate?: unknown }} query - Query string.
 * @returns {Promise<object[]>} Títulos em aberto.
 */
export async function listSalesOpenItems(prisma, companyId, query = {}) {
    const asOfDate = parseAsOfDate(query.asOfDate);
    const documents = await prisma.saleDocument.findMany({
        where: {
            companyId,
            totalCents: { gt: 0 },
            status: "ISSUED",
            kind: { not: "CREDIT_NOTE" },
        },
        include: { customer: true },
        orderBy: [{ dueDate: "asc" }, { issuedAt: "asc" }],
    });

    return documents
        .map((document) => {
            const openAmountCents =
                document.totalCents - document.amountPaidCents;
            const dueDate = document.dueDate ?? document.issuedAt;
            const daysOverdue = Math.floor(
                (asOfDate.getTime() - dueDate.getTime()) / 86400000,
            );
            return {
                id: document.id,
                number: document.number,
                customerName: document.customer.name,
                issuedAt: document.issuedAt,
                dueDate,
                totalCents: document.totalCents,
                amountPaidCents: document.amountPaidCents,
                openAmountCents,
                daysOverdue,
                bucket: bucketFor(daysOverdue),
            };
        })
        .filter((item) => item.openAmountCents > 0);
}
