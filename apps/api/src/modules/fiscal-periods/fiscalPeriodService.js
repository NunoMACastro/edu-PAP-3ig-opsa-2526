/**
 * @file Service de períodos fiscais e guard contabilístico.
 */

import { httpError } from "../../lib/httpErrors.js";

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
 * @param {string} companyId - Empresa ativa.
 * @param {{ name: string, startDate: Date, endDate: Date }} input - Dados validados.
 * @returns {Promise<object>} Período criado.
 */
export async function createFiscalPeriod(prisma, companyId, input) {
    await assertNoOverlap(prisma, companyId, input.startDate, input.endDate);

    const period = await prisma.fiscalPeriod.create({
        data: { companyId, ...input },
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
    { companyId, periodId, actorUserId, now = new Date() },
) {
    const period = await prisma.fiscalPeriod.findFirst({
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

    const closed = await prisma.fiscalPeriod.update({
        where: { id: period.id },
        data: {
            status: "CLOSED",
            closedAt: now,
            closedById: actorUserId,
        },
    });

    return serialize(closed);
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
