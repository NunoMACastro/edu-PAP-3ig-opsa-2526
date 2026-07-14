/**
 * @file Service de aprovação simples de documentos de venda.
 */

import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

/**
 * Procura documento de venda dentro da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} id - Documento alvo.
 * @returns {Promise<object>} Documento encontrado.
 */
async function findSaleDocument(prisma, companyId, id) {
    const document = await prisma.saleDocument.findFirst({
        where: { id, companyId },
    });
    if (!document) {
        throw httpError(
            404,
            "SALE_DOCUMENT_NOT_FOUND",
            "Documento de venda não encontrado",
        );
    }
    return document;
}

/**
 * Regista auditoria de workflow de venda.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} saleDocumentId - Documento alvo.
 * @param {string} action - Ação auditável.
 * @param {object} [details] - Detalhes seguros.
 * @param details - Detalhes adicionais registados para auditoria ou erro.
 * @returns {Promise<void>}
 */
async function recordSaleApprovalAudit(
    tx,
    companyId,
    userId,
    saleDocumentId,
    action,
    details = {},
) {
    await tx.auditLog.create({
        data: {
            companyId,
            userId,
            action,
            entity: "SaleDocument",
            entityId: saleDocumentId,
            details,
        },
    });
}

/**
 * Faz claim atómico do estado esperado antes de criar histórico/auditoria.
 *
 * A leitura funcional anterior continua a produzir mensagens específicas, mas
 * apenas este update condicional decide qual pedido concorrente vence.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma.
 * @param {{ id: string, companyId: string, expectedStatus: string, data: object }} input - Claim pretendido.
 * @returns {Promise<object>} Documento depois da transição.
 */
async function claimSaleStatus(tx, input) {
    const claimed = await tx.saleDocument.updateMany({
        where: {
            id: input.id,
            companyId: input.companyId,
            status: input.expectedStatus,
        },
        data: input.data,
    });

    if (claimed.count !== 1) {
        throw httpError(
            409,
            "STALE_STATE",
            "O estado do documento foi alterado por outra operação",
        );
    }

    return tx.saleDocument.findFirst({
        where: { id: input.id, companyId: input.companyId },
    });
}

/**
 * Submete documento de venda em rascunho.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} id - Documento alvo.
 * @returns {Promise<object>} Documento atualizado.
 */
export async function submitSaleDocument(prisma, companyId, userId, id) {
    const document = await findSaleDocument(prisma, companyId, id);
    if (document.status !== "DRAFT") {
        throw httpError(
            409,
            "INVALID_STATUS",
            "Apenas rascunhos podem ser submetidos",
        );
    }

    return prisma.$transaction(async (tx) => {
        await acquireTransactionLock(tx, "fiscal", companyId);
        await assertOpenFiscalPeriod(tx, {
            companyId,
            documentDate: document.issuedAt,
        });
        const updated = await claimSaleStatus(tx, {
            id,
            companyId,
            expectedStatus: "DRAFT",
            data: {
                status: "SUBMITTED",
                submittedAt: new Date(),
                submittedById: userId,
                rejectedAt: null,
                rejectedById: null,
                rejectionReason: null,
            },
        });
        await recordSaleApprovalAudit(
            tx,
            companyId,
            userId,
            id,
            "SALE_DOCUMENT_SUBMITTED",
        );
        return updated;
    });
}

/**
 * Aprova documento de venda submetido.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} id - Documento alvo.
 * @returns {Promise<object>} Documento atualizado.
 */
export async function approveSaleDocument(prisma, companyId, userId, id) {
    const document = await findSaleDocument(prisma, companyId, id);
    if (document.status !== "SUBMITTED") {
        throw httpError(
            409,
            "INVALID_STATUS",
            "Apenas documentos submetidos podem ser aprovados",
        );
    }
    if (document.submittedById === userId) {
        throw httpError(
            403,
            "SEGREGATION_REQUIRED",
            "Outro utilizador deve aprovar o documento",
        );
    }

    return prisma.$transaction(async (tx) => {
        const updated = await claimSaleStatus(tx, {
            id,
            companyId,
            expectedStatus: "SUBMITTED",
            data: {
                status: "APPROVED",
                approvedAt: new Date(),
                approvedById: userId,
            },
        });
        await recordSaleApprovalAudit(
            tx,
            companyId,
            userId,
            id,
            "SALE_DOCUMENT_APPROVED",
        );
        return updated;
    });
}

/**
 * Rejeita documento de venda submetido.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} id - Documento alvo.
 * @param {unknown} input - Payload JSON.
 * @returns {Promise<object>} Documento atualizado.
 */
export async function rejectSaleDocument(prisma, companyId, userId, id, input) {
    const reason = String(input?.reason ?? "").trim();
    if (reason.length < 3) {
        throw httpError(
            400,
            "INVALID_REASON",
            "Motivo de rejeição obrigatório",
        );
    }

    const document = await findSaleDocument(prisma, companyId, id);
    if (document.status !== "SUBMITTED") {
        throw httpError(
            409,
            "INVALID_STATUS",
            "Apenas documentos submetidos podem ser rejeitados",
        );
    }
    if (document.submittedById === userId) {
        throw httpError(
            403,
            "SEGREGATION_REQUIRED",
            "Outro utilizador deve rejeitar o documento",
        );
    }

    return prisma.$transaction(async (tx) => {
        const updated = await claimSaleStatus(tx, {
            id,
            companyId,
            expectedStatus: "SUBMITTED",
            data: {
                status: "REJECTED",
                rejectedAt: new Date(),
                rejectedById: userId,
                rejectionReason: reason,
            },
        });
        await recordSaleApprovalAudit(
            tx,
            companyId,
            userId,
            id,
            "SALE_DOCUMENT_REJECTED",
            { reasonRecordedInWorkflow: true },
        );
        return updated;
    });
}
