/**
 * @file Service de aprovação e lançamento de compras.
 */

import { httpError } from "../../lib/httpErrors.js";
import { postPurchaseDocumentInTransaction } from "../accounting/purchasePostingService.js";

/**
 * Procura documento de compra dentro da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma/transação.
 * @param {string} companyId - Empresa ativa.
 * @param {string} id - Documento alvo.
 * @returns {Promise<object>} Documento encontrado.
 */
async function findPurchaseDocument(prisma, companyId, id) {
    const document = await prisma.purchaseDocument.findFirst({
        where: { id, companyId },
    });
    if (!document) {
        throw httpError(
            404,
            "PURCHASE_DOCUMENT_NOT_FOUND",
            "Documento de compra não encontrado",
        );
    }
    return document;
}

/**
 * Regista auditoria de workflow de compra.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} purchaseDocumentId - Documento alvo.
 * @param {string} action - Ação auditável.
 * @returns {Promise<void>}
 */
async function recordPurchaseApprovalAudit(
    tx,
    companyId,
    userId,
    purchaseDocumentId,
    action,
) {
    await tx.auditLog.create({
        data: {
            companyId,
            userId,
            action,
            entity: "PurchaseDocument",
            entityId: purchaseDocumentId,
        },
    });
}

/**
 * Aprova compra em rascunho.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} id - Documento alvo.
 * @returns {Promise<object>} Documento aprovado.
 */
export async function approvePurchaseDocument(prisma, companyId, userId, id) {
    const document = await findPurchaseDocument(prisma, companyId, id);
    if (document.status !== "DRAFT") {
        throw httpError(
            409,
            "INVALID_STATUS",
            "Apenas rascunhos podem ser aprovados",
        );
    }

    return prisma.$transaction(async (tx) => {
        const updated = await tx.purchaseDocument.update({
            where: { id },
            data: {
                status: "APPROVED",
                approvedAt: new Date(),
                approvedById: userId,
            },
        });
        await recordPurchaseApprovalAudit(
            tx,
            companyId,
            userId,
            id,
            "PURCHASE_DOCUMENT_APPROVED",
        );
        return updated;
    });
}

/**
 * Lança compra aprovada, criando diário contabilístico no mesmo fluxo.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} id - Documento alvo.
 * @returns {Promise<object>} Lançamento contabilístico criado.
 */
export async function markPurchaseDocumentPosted(prisma, companyId, userId, id) {
    return prisma.$transaction(async (tx) => {
        const document = await findPurchaseDocument(tx, companyId, id);
        if (!["APPROVED", "PAID"].includes(document.status)) {
            throw httpError(
                409,
                "INVALID_STATUS",
                "Apenas compras aprovadas ou pagas podem ser lançadas",
            );
        }
        const entry = await postPurchaseDocumentInTransaction(
            tx,
            companyId,
            userId,
            id,
        );
        return entry;
    });
}
