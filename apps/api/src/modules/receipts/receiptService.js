/**
 * @file Service de recebimentos de vendas.
 */

import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import { parseStrictDateOnly } from "../../lib/strictDate.js";
import { recordRetainedAuditLog } from "../audit/auditLogService.js";
import { upsertRetentionHold } from "../compliance/retentionPolicy.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

const methods = new Set(["CASH", "BANK_TRANSFER", "CARD", "OTHER"]);

/**
 * Valida payload de recebimento.
 *
 * @param {unknown} input - Payload JSON.
 * @returns {{ treasuryAccountId: string, amountCents: number, receivedAt: Date, method: string, reference: string | null, notes: string | null }} Recebimento validado.
 */
function parseReceiptInput(input) {
    if (!input || typeof input !== "object") {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const amountCents = Number(input.amountCents);
    const treasuryAccountId = String(input.treasuryAccountId ?? "").trim();
    const receivedAt = parseStrictDateOnly(input.receivedAt, {
        code: "INVALID_DATE",
        field: "Data de recebimento",
    });
    const method = String(input.method ?? "").toUpperCase();

    if (!Number.isInteger(amountCents) || amountCents <= 0) {
        throw httpError(400, "INVALID_AMOUNT", "Valor recebido inválido");
    }
    if (!treasuryAccountId) {
        throw httpError(
            400,
            "TREASURY_ACCOUNT_REQUIRED",
            "Conta de tesouraria obrigatória",
        );
    }
    if (!methods.has(method)) {
        throw httpError(400, "INVALID_METHOD", "Método de recebimento inválido");
    }

    return {
        treasuryAccountId,
        amountCents,
        receivedAt,
        method,
        reference: String(input.reference ?? "").trim() || null,
        notes: String(input.notes ?? "").trim() || null,
    };
}

/**
 * Regista recebimento parcial ou total de documento de venda.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} saleDocumentId - Documento alvo.
 * @param {unknown} input - Payload JSON.
 * @returns {Promise<object>} Recebimento criado.
 */
export async function registerReceipt(
    prisma,
    companyId,
    userId,
    saleDocumentId,
    input,
) {
    const data = parseReceiptInput(input);
    return prisma.$transaction(async (tx) => {
        await acquireTransactionLock(tx, "fiscal", companyId);
        const fiscalPeriod = await assertOpenFiscalPeriod(tx, {
            companyId,
            documentDate: data.receivedAt,
        });
        const document = await tx.saleDocument.findFirst({
            where: { id: saleDocumentId, companyId },
        });
        if (!document) {
            throw httpError(
                404,
                "SALE_DOCUMENT_NOT_FOUND",
                "Documento de venda não encontrado",
            );
        }
        if (data.receivedAt < document.issuedAt) {
            throw httpError(
                400,
                "INVALID_RECEIPT_CHRONOLOGY",
                "A data de recebimento não pode ser anterior à data do documento",
            );
        }
        if (document.kind === "CREDIT_NOTE") {
            throw httpError(
                409,
                "CREDIT_NOTE_NOT_RECEIVABLE",
                "Notas de crédito não recebem recebimentos",
            );
        }
        if (!["ISSUED", "SETTLED"].includes(document.status)) {
            throw httpError(
                409,
                "INVALID_STATUS",
                "Apenas documentos emitidos podem receber valores",
            );
        }

        const openAmount = document.totalCents - document.amountPaidCents;
        if (openAmount <= 0) {
            throw httpError(
                409,
                "DOCUMENT_ALREADY_SETTLED",
                "Documento já liquidado",
            );
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
        const updated = await tx.saleDocument.updateMany({
            where: {
                id: document.id,
                companyId,
                amountPaidCents: document.amountPaidCents,
                status: document.status,
            },
            data: {
                amountPaidCents: { increment: data.amountCents },
                status:
                    nextPaid === document.totalCents ? "SETTLED" : document.status,
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
                currentBalanceCents: { increment: data.amountCents },
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

        const receipt = await tx.receipt.create({
            data: { ...data, companyId, saleDocumentId, createdById: userId },
        });
        await upsertRetentionHold(tx, {
            companyId,
            entity: "Receipt",
            entityId: receipt.id,
            periodEndAt: fiscalPeriod.endDate,
            reason: "RECEIPT_REGISTERED",
        });
        await recordRetainedAuditLog(tx, {
            companyId,
            userId,
            action: "RECEIPT_REGISTERED",
            entity: "Receipt",
            entityId: receipt.id,
            periodEndAt: fiscalPeriod.endDate,
            retentionReason: "RECEIPT_AUDIT_RETAINED",
            details: {
                saleDocumentId,
                treasuryAccountId: treasuryAccount.id,
                amountCents: data.amountCents,
                resultingAmountPaidCents: nextPaid,
                resultingTreasuryBalanceCents:
                    resultingAccount.currentBalanceCents,
            },
        });

        return receipt;
    });
}
