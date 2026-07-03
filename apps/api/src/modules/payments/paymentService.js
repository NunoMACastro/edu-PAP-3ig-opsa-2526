/**
 * @file Service de pagamentos de compras.
 */

import { httpError } from "../../lib/httpErrors.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

const methods = new Set(["CASH", "BANK_TRANSFER", "CARD", "OTHER"]);

/**
 * Valida payload de pagamento.
 *
 * @param {unknown} input - Payload JSON.
 * @returns {{ amountCents: number, paidAt: Date, method: string, reference: string | null, notes: string | null }} Pagamento validado.
 */
function parsePaymentInput(input) {
    if (!input || typeof input !== "object") {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const amountCents = Number(input.amountCents);
    const paidAt = new Date(input.paidAt);
    const method = String(input.method ?? "").toUpperCase();

    if (!Number.isInteger(amountCents) || amountCents <= 0) {
        throw httpError(400, "INVALID_AMOUNT", "Valor pago inválido");
    }
    if (Number.isNaN(paidAt.getTime())) {
        throw httpError(400, "INVALID_DATE", "Data de pagamento inválida");
    }
    if (!methods.has(method)) {
        throw httpError(400, "INVALID_METHOD", "Método de pagamento inválido");
    }

    return {
        amountCents,
        paidAt,
        method,
        reference: String(input.reference ?? "").trim() || null,
        notes: String(input.notes ?? "").trim() || null,
    };
}

/**
 * Regista pagamento parcial ou total de documento de compra.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} purchaseDocumentId - Documento alvo.
 * @param {unknown} input - Payload JSON.
 * @returns {Promise<object>} Pagamento criado.
 */
export async function registerPayment(
    prisma,
    companyId,
    userId,
    purchaseDocumentId,
    input,
) {
    const data = parsePaymentInput(input);
    await assertOpenFiscalPeriod(prisma, {
        companyId,
        documentDate: data.paidAt,
    });

    return prisma.$transaction(async (tx) => {
        const document = await tx.purchaseDocument.findFirst({
            where: { id: purchaseDocumentId, companyId },
        });
        if (!document) {
            throw httpError(
                404,
                "PURCHASE_DOCUMENT_NOT_FOUND",
                "Documento de compra não encontrado",
            );
        }
        if (document.kind === "SUPPLIER_CREDIT_NOTE") {
            throw httpError(
                409,
                "CREDIT_NOTE_NOT_PAYABLE",
                "Notas de crédito não recebem pagamentos",
            );
        }
        if (!["APPROVED", "POSTED", "PAID"].includes(document.status)) {
            throw httpError(
                409,
                "INVALID_STATUS",
                "Apenas compras aprovadas ou lançadas podem receber pagamentos",
            );
        }

        const openAmount = document.totalCents - document.amountPaidCents;
        if (openAmount <= 0) {
            throw httpError(409, "DOCUMENT_ALREADY_PAID", "Documento já pago");
        }
        if (data.amountCents > openAmount) {
            throw httpError(
                400,
                "AMOUNT_EXCEEDS_OPEN",
                "Valor excede o montante em aberto",
            );
        }

        const nextPaid = document.amountPaidCents + data.amountCents;
        const updated = await tx.purchaseDocument.updateMany({
            where: {
                id: document.id,
                companyId,
                amountPaidCents: document.amountPaidCents,
                status: document.status,
            },
            data: {
                amountPaidCents: { increment: data.amountCents },
            },
        });
        if (updated.count !== 1) {
            throw httpError(
                409,
                "STALE_BALANCE",
                "O saldo do documento foi alterado; tente novamente",
            );
        }

        const payment = await tx.payment.create({
            data: { ...data, companyId, purchaseDocumentId, createdById: userId },
        });
        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "PAYMENT_REGISTERED",
                entity: "Payment",
                entityId: payment.id,
                details: {
                    purchaseDocumentId,
                    amountCents: data.amountCents,
                    resultingAmountPaidCents: nextPaid,
                },
            },
        });

        return payment;
    });
}
