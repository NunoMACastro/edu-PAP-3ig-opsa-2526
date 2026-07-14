/**
 * @file Service de períodos fiscais e guard contabilístico.
 */

import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import {
    recordRetainedSensitiveAudit,
    recordSensitiveAudit,
} from "../audit/auditLogService.js";
import { materializeRetentionHoldsForPeriod } from "../compliance/retentionPolicy.js";

/**
 * Serializa período fiscal para resposta pública.
 *
 * @param {object} period - Período Prisma.
 * @returns {object} Período público.
 */
function serialize(period) {
    return {
        id: period.id,
        name: period.name,
        fiscalYear: period.fiscalYear ?? null,
        startDate: period.startDate.toISOString().slice(0, 10),
        endDate: period.endDate.toISOString().slice(0, 10),
        status: period.status,
        closedAt: period.closedAt,
        closedById: period.closedById,
    };
}

/**
 * Garante que não existe sobreposição de períodos para a empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {Date} startDate - Início do período.
 * @param {Date} endDate - Fim do período.
 * @returns {Promise<void>}
 */
async function assertNoOverlap(prisma, companyId, startDate, endDate) {
    const overlapping = await prisma.fiscalPeriod.findFirst({
        where: {
            companyId,
            startDate: { lte: endDate },
            endDate: { gte: startDate },
        },
    });

    if (overlapping) {
        throw httpError(
            409,
            "FISCAL_PERIOD_OVERLAP",
            "Já existe período fiscal sobreposto",
        );
    }
}

/**
 * Impede o fecho enquanto existirem documentos do período por decidir ou
 * contabilizar. A verificação corre sob o mesmo lock das mutações fiscais.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma.
 * @param {{ companyId: string, startDate: Date, endDate: Date }} period - Período alvo.
 * @returns {Promise<void>}
 */
async function assertNoPendingFiscalDocuments(tx, period) {
    const dateRange = {
        gte: period.startDate,
        lte: period.endDate,
    };

    const pendingSaleDecisions = await tx.saleDocument.count({
        where: {
            companyId: period.companyId,
            issuedAt: dateRange,
            status: { in: ["SUBMITTED", "APPROVED"] },
        },
    });
    if (pendingSaleDecisions > 0) {
        throw httpError(
            409,
            "FISCAL_PERIOD_HAS_PENDING_DOCUMENTS",
            "O período fiscal contém documentos pendentes",
        );
    }

    const issuedSales = await tx.saleDocument.findMany({
        where: {
            companyId: period.companyId,
            issuedAt: dateRange,
            status: { in: ["ISSUED", "SETTLED"] },
        },
        select: { id: true },
    });
    if (issuedSales.length > 0) {
        const postedSales = await tx.journalEntry.count({
            where: {
                companyId: period.companyId,
                source: "SALE",
                sourceId: { in: issuedSales.map(({ id }) => id) },
            },
        });
        if (postedSales !== issuedSales.length) {
            throw httpError(
                409,
                "FISCAL_PERIOD_HAS_PENDING_DOCUMENTS",
                "O período fiscal contém documentos pendentes",
            );
        }
    }

    const approvedPurchases = await tx.purchaseDocument.findMany({
        where: {
            companyId: period.companyId,
            issuedAt: dateRange,
            status: { in: ["APPROVED", "PAID"] },
        },
        select: { id: true },
    });
    if (approvedPurchases.length > 0) {
        const postedPurchases = await tx.journalEntry.count({
            where: {
                companyId: period.companyId,
                source: "PURCHASE",
                sourceId: { in: approvedPurchases.map(({ id }) => id) },
            },
        });
        if (postedPurchases !== approvedPurchases.length) {
            throw httpError(
                409,
                "FISCAL_PERIOD_HAS_PENDING_DOCUMENTS",
                "O período fiscal contém documentos pendentes",
            );
        }
    }
}

/**
 * Lista períodos fiscais da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<object[]>} Períodos ordenados.
 */
export async function listFiscalPeriods(prisma, companyId) {
    const periods = await prisma.fiscalPeriod.findMany({
        where: { companyId },
        orderBy: { startDate: "asc" },
    });

    return periods.map(serialize);
}

/**
 * Cria período fiscal aberto.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, actorUserId: string, input: { name: string, startDate: Date, endDate: Date, fiscalYear?: number } }} context - Contexto autenticado e dados validados.
 * @returns {Promise<object>} Período criado.
 */
export async function createFiscalPeriod(prisma, context) {
    const period = await prisma.$transaction(async (tx) => {
        await acquireTransactionLock(tx, "fiscal", context.companyId);
        await assertNoOverlap(
            tx,
            context.companyId,
            context.input.startDate,
            context.input.endDate,
        );
        const created = await tx.fiscalPeriod.create({
            data: { companyId: context.companyId, ...context.input },
        });
        await recordSensitiveAudit(tx, {
            companyId: context.companyId,
            userId: context.actorUserId,
            action: "fiscalPeriod.create",
            entity: "FiscalPeriod",
            entityId: created.id,
            details: {
                result: "success",
                status: created.status,
            },
        });
        return created;
    });

    return serialize(period);
}

/**
 * Fecha período fiscal aberto.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, periodId: string, actorUserId: string, now?: Date }} input - Dados de fecho.
 * @returns {Promise<object>} Período fechado.
 */
export async function closeFiscalPeriod(
    prisma,
    { companyId, periodId, actorUserId, now },
) {
    return prisma.$transaction(async (tx) => {
        await acquireTransactionLock(tx, "fiscal", companyId);
        // Captura o instante efetivo apenas depois de adquirir o lock. Se outra
        // mutação contabilística estava à frente, `closedAt` nunca fica
        // artificialmente anterior a essa operação por tempo de espera.
        const effectiveClosedAt = now ?? new Date();
        const period = await tx.fiscalPeriod.findFirst({
            where: { id: periodId, companyId },
        });
        if (!period) {
            throw httpError(
                404,
                "FISCAL_PERIOD_NOT_FOUND",
                "Período fiscal não encontrado",
            );
        }
        if (period.status === "CLOSED") {
            throw httpError(
                409,
                "FISCAL_PERIOD_ALREADY_CLOSED",
                "Período fiscal já está fechado",
            );
        }

        await assertNoPendingFiscalDocuments(tx, period);

        const claimed = await tx.fiscalPeriod.updateMany({
            where: { id: period.id, companyId, status: "OPEN" },
            data: {
                status: "CLOSED",
                closedAt: effectiveClosedAt,
                closedById: actorUserId,
            },
        });
        if (claimed.count !== 1) {
            throw httpError(
                409,
                "STALE_STATE",
                "O período fiscal foi alterado por outra operação",
            );
        }
        const closed = await tx.fiscalPeriod.findFirst({
            where: { id: period.id, companyId },
        });

        const retentionHolds = await materializeRetentionHoldsForPeriod(tx, {
            companyId,
            period: closed,
        });

        // O fecho fiscal altera bloqueios contabilisticos; fica auditado como operacao sensivel.
        await recordRetainedSensitiveAudit(tx, {
            companyId,
            userId: actorUserId,
            action: "fiscalPeriod.close",
            entity: "FiscalPeriod",
            entityId: closed.id,
            periodEndAt: closed.endDate,
            retentionReason: "FISCAL_PERIOD_CLOSE_AUDIT_RETAINED",
            details: {
                result: "success",
                status: closed.status,
                closedAt: closed.closedAt?.toISOString() ?? null,
                retentionHolds,
            },
        });

        return serialize(closed);
    });
}

/**
 * Guard reutilizável para impedir documentos em período fechado.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, documentDate: Date | string }} input - Empresa e data do documento.
 * @returns {Promise<object>} Período aberto encontrado.
 */
export async function assertOpenFiscalPeriod(
    prisma,
    { companyId, documentDate },
) {
    const date =
        documentDate instanceof Date ? documentDate : new Date(documentDate);

    const period = await prisma.fiscalPeriod.findFirst({
        where: {
            companyId,
            startDate: { lte: date },
            endDate: { gte: date },
        },
    });

    if (!period) {
        throw httpError(
            400,
            "FISCAL_PERIOD_MISSING",
            "Não existe período fiscal para a data",
        );
    }
    if (period.status === "CLOSED") {
        throw httpError(
            409,
            "FISCAL_PERIOD_CLOSED",
            "Período fiscal fechado para esta data",
        );
    }

    return period;
}
