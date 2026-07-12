/**
 * @file Service de aprovação e lançamento de compras.
 */

import { httpError } from "../../lib/httpErrors.js";
import { postPurchaseDocumentInTransaction } from "../accounting/purchasePostingService.js";
import {
    parseApprovalReason,
    parseRejectionReason,
} from "./purchaseApprovalHistoryValidators.js";

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
 * @param details - Detalhes adicionais registados para auditoria ou erro.
 * @returns {Promise<void>}
 */
async function recordPurchaseApprovalAudit(
    tx,
    companyId,
    userId,
    purchaseDocumentId,
    action,
    details,
) {
    await tx.auditLog.create({
        data: {
            companyId,
            userId,
            action,
            entity: "PurchaseDocument",
            entityId: purchaseDocumentId,
            details,
        },
    });
}

/**
 * Regista histórico funcional de decisão de compra.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma.
 * @param {{ companyId: string, userId: string, purchaseDocumentId: string, action: "APPROVED" | "REJECTED", reason: string }} input - Decisão.
 * @returns {Promise<object>} Histórico criado.
 */
async function createApprovalHistory(tx, input) {
    return tx.purchaseApprovalHistory.create({
        data: {
            companyId: input.companyId,
            purchaseDocumentId: input.purchaseDocumentId,
            action: input.action,
            reason: input.reason,
            decidedById: input.userId,
        },
    });
}

/**
 * Faz uma transição condicional para impedir duas decisões concorrentes.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma.
 * @param {{ id: string, companyId: string, expectedStatuses: string[], data: object }} input - Estado esperado e mutação.
 * @returns {Promise<object>} Documento depois da transição.
 */
async function claimPurchaseStatus(tx, input) {
    const claimed = await tx.purchaseDocument.updateMany({
        where: {
            id: input.id,
            companyId: input.companyId,
            status: { in: input.expectedStatuses },
        },
        data: input.data,
    });

    if (claimed.count !== 1) {
        throw httpError(
            409,
            "STALE_STATE",
            "O estado da compra foi alterado por outra operação",
        );
    }

    return tx.purchaseDocument.findFirst({
        where: { id: input.id, companyId: input.companyId },
    });
}

/**
 * Aprova compra em rascunho.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} id - Documento alvo.
 * @param input - Dados de entrada recebidos para validação ou normalização.
 * @returns {Promise<object>} Documento aprovado.
 */
export async function approvePurchaseDocument(
    prisma,
    companyId,
    userId,
    id,
    input = {},
) {
    const reason = parseApprovalReason(input);
    const document = await findPurchaseDocument(prisma, companyId, id);
    if (document.status !== "DRAFT") {
        throw httpError(
            409,
            "INVALID_STATUS",
            "Apenas rascunhos podem ser aprovados",
        );
    }

    return prisma.$transaction(async (tx) => {
        const updated = await claimPurchaseStatus(tx, {
            id,
            companyId,
            expectedStatuses: ["DRAFT"],
            data: {
                status: "APPROVED",
                approvedAt: new Date(),
                approvedById: userId,
            },
        });
        const history = await createApprovalHistory(tx, {
            companyId,
            userId,
            purchaseDocumentId: id,
            action: "APPROVED",
            reason,
        });
        await recordPurchaseApprovalAudit(
            tx,
            companyId,
            userId,
            id,
            "PURCHASE_DOCUMENT_APPROVED",
            { historyId: history.id, reasonRecordedInWorkflow: true },
        );
        return updated;
    });
}

/**
 * Reprova compra em rascunho ou aprovada, preservando histórico.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} id - Documento alvo.
 * @param {unknown} input - Payload JSON com justificação.
 * @returns {Promise<object>} Documento reprovado.
 */
export async function rejectPurchaseDocument(
    prisma,
    companyId,
    userId,
    id,
    input,
) {
    const reason = parseRejectionReason(input);
    const document = await findPurchaseDocument(prisma, companyId, id);
    if (!["DRAFT", "APPROVED"].includes(document.status)) {
        throw httpError(
            409,
            "INVALID_STATUS",
            "Apenas compras em rascunho ou aprovadas podem ser reprovadas",
        );
    }

    return prisma.$transaction(async (tx) => {
        const updated = await claimPurchaseStatus(tx, {
            id,
            companyId,
            expectedStatuses: [document.status],
            data: {
                status: "REJECTED",
                approvedAt: null,
                approvedById: null,
            },
        });
        const history = await createApprovalHistory(tx, {
            companyId,
            userId,
            purchaseDocumentId: id,
            action: "REJECTED",
            reason,
        });
        await recordPurchaseApprovalAudit(
            tx,
            companyId,
            userId,
            id,
            "PURCHASE_DOCUMENT_REJECTED",
            { historyId: history.id, reasonRecordedInWorkflow: true },
        );
        return updated;
    });
}

/**
 * Lista histórico de decisões de uma compra da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} id - Documento alvo.
 * @returns {Promise<object[]>} Histórico cronológico.
 */
export async function listPurchaseApprovalHistory(prisma, companyId, id) {
    await findPurchaseDocument(prisma, companyId, id);
    return prisma.purchaseApprovalHistory.findMany({
        where: { companyId, purchaseDocumentId: id },
        include: { decidedBy: { select: { id: true, email: true, name: true } } },
        orderBy: { decidedAt: "asc" },
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
