/**
 * @file Service de pagamentos de compras.
 */

import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import { parseStrictDateOnly } from "../../lib/strictDate.js";
import { recordRetainedAuditLog } from "../audit/auditLogService.js";
import { upsertRetentionHold } from "../compliance/retentionPolicy.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

const methods = new Set(["CASH", "BANK_TRANSFER", "CARD", "OTHER"]);

/**
 * Valida payload de pagamento.
 *
 * @param {unknown} input - Payload JSON.
 * @returns {{ treasuryAccountId: string, amountCents: number, paidAt: Date, method: string, reference: string | null, notes: string | null }} Pagamento validado.
 */
function parsePaymentInput(input) {
    if (!input || typeof input !== "object") {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const amountCents = Number(input.amountCents);
    const treasuryAccountId = String(input.treasuryAccountId ?? "").trim();
    const paidAt = parseStrictDateOnly(input.paidAt, {
        code: "INVALID_DATE",
        field: "Data de pagamento",
    });
    const method = String(input.method ?? "").toUpperCase();

    if (!Number.isInteger(amountCents) || amountCents <= 0) {
        throw httpError(400, "INVALID_AMOUNT", "Valor pago inválido");
    }
    if (!treasuryAccountId) {
        throw httpError(
            400,
            "TREASURY_ACCOUNT_REQUIRED",
            "Conta de tesouraria obrigatória",
        );
    }
    if (!methods.has(method)) {
        throw httpError(400, "INVALID_METHOD", "Método de pagamento inválido");
    }

    return {
        treasuryAccountId,
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
    return prisma.$transaction(async (tx) => {
        await acquireTransactionLock(tx, "fiscal", companyId);
        const fiscalPeriod = await assertOpenFiscalPeriod(tx, {
            companyId,
            documentDate: data.paidAt,
        });
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
        if (data.paidAt < document.issuedAt) {
            throw httpError(
                400,
                "INVALID_PAYMENT_CHRONOLOGY",
                "A data de pagamento não pode ser anterior à data do documento",
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

        const treasuryAccount = await tx.treasuryAccount.findFirst({
            where: {
                id: data.treasuryAccountId,
                companyId,
                isActive: true,
            },
            select: { id: true },
        });
        if (!treasuryAccount) {
            throw httpError(
                404,
                "TREASURY_ACCOUNT_NOT_FOUND",
                "Conta de tesouraria não encontrada",
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
                status:
                    nextPaid === document.totalCents ? "PAID" : document.status,
            },
        });
        if (updated.count !== 1) {
            throw httpError(
                409,
                "STALE_BALANCE",
                "O saldo do documento foi alterado; tente novamente",
            );
        }


        const accountUpdated = await tx.treasuryAccount.updateMany({
            where: {
                id: treasuryAccount.id,
                companyId,
                isActive: true,
            },
            data: {
                currentBalanceCents: { decrement: data.amountCents },
            },
        });
        if (accountUpdated.count !== 1) {
            throw httpError(
                409,
                "TREASURY_ACCOUNT_UNAVAILABLE",
                "A conta de tesouraria deixou de estar disponível; tente novamente",
            );
        }
        const resultingAccount = await tx.treasuryAccount.findFirst({
            where: { id: treasuryAccount.id, companyId },
            select: { currentBalanceCents: true },
        });
        if (!resultingAccount) {
            throw httpError(
                409,
                "TREASURY_ACCOUNT_UNAVAILABLE",
                "A conta de tesouraria deixou de estar disponível; tente novamente",
            );
        }

        const payment = await tx.payment.create({
            data: { ...data, companyId, purchaseDocumentId, createdById: userId },
        });
        await upsertRetentionHold(tx, {
            companyId,
            entity: "Payment",
            entityId: payment.id,
            periodEndAt: fiscalPeriod.endDate,
            reason: "PAYMENT_REGISTERED",
        });
        await recordRetainedAuditLog(tx, {
            companyId,
            userId,
            action: "PAYMENT_REGISTERED",
            entity: "Payment",
            entityId: payment.id,
            periodEndAt: fiscalPeriod.endDate,
            retentionReason: "PAYMENT_AUDIT_RETAINED",
            details: {
                purchaseDocumentId,
                treasuryAccountId: treasuryAccount.id,
                amountCents: data.amountCents,
                resultingAmountPaidCents: nextPaid,
                resultingTreasuryBalanceCents:
                    resultingAccount.currentBalanceCents,
            },
        });

        return payment;
    });
}
