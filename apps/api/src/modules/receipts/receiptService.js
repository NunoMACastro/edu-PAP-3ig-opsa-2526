import { httpError } from "../../lib/httpErrors.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

const methods = new Set(["CASH", "BANK_TRANSFER", "CARD", "OTHER"]);

function parseReceiptInput(input) {
    if (!input || typeof input !== "object") {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const amountCents = Number(input.amountCents);
    const receivedAt = new Date(input.receivedAt);
    const method = String(input.method ?? "").toUpperCase();

    if (!Number.isInteger(amountCents) || amountCents <= 0) {
        throw httpError(400, "INVALID_AMOUNT", "Valor inválido");
    }

    if (Number.isNaN(receivedAt.getTime())) {
        throw httpError(400, "INVALID_DATE", "Data inválida");
    }

    if (!methods.has(method)) {
        throw httpError(400, "INVALID_METHOD", "Método inválido");
    }

    return {
        amountCents,
        receivedAt,
        method,
        reference: String(input.reference ?? "").trim() || null,
        notes: String(input.notes ?? "").trim() || null,
    };
}

export async function registerReceipt(
    prisma,
    companyId,
    userId,
    saleDocumentId,
    input
) {
    const data = parseReceiptInput(input);

    await assertOpenFiscalPeriod(prisma, {
        companyId,
        documentDate: data.receivedAt,
    });

    return prisma.$transaction(async (tx) => {
        const document = await tx.saleDocument.findFirst({
            where: { id: saleDocumentId, companyId },
        });

        if (!document) {
            throw httpError(404, "SALE_DOCUMENT_NOT_FOUND", "Documento de venda não encontrado");
        }

        if (document.kind === "CREDIT_NOTE") {
            throw httpError(409, "CREDIT_NOTE_NOT_RECEIVABLE", "Notas de crédito não recebem recebimentos");
        }

        if (!["ISSUED", "SETTLED"].includes(document.status)) {
            throw httpError(
                409,
                "INVALID_STATUS",
                "Apenas documentos emitidos podem receber valores"
            );
        }

        const openAmount = document.totalCents - document.amountPaidCents;

        if (openAmount <= 0) {
            throw httpError(409, "DOCUMENT_ALREADY_SETTLED", "Documento já liquidado");
        }

        if (data.amountCents > openAmount) {
            throw httpError(400, "AMOUNT_EXCEEDS_OPEN", "Valor excede o montante em aberto");
        }

        const receipt = await tx.receipt.create({
            data: {
                ...data,
                companyId,
                saleDocumentId,
                createdById: userId,
            },
        });

        const nextPaid = document.amountPaidCents + data.amountCents;

        await tx.saleDocument.update({
            where: { id: document.id },
            data: {
                amountPaidCents: nextPaid,
                status: nextPaid === document.totalCents ? "SETTLED" : document.status,
            },
        });

        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "RECEIPT_REGISTERED",
                entity: "Receipt",
                entityId: receipt.id,
                details: {
                    saleDocumentId,
                    amountCents: data.amountCents,
                    resultingAmountPaidCents: nextPaid,
                },
            },
        });

        return receipt;
    });
}