import { httpError } from "../../lib/httpErrors.js";

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
            "Ja existe periodo fiscal sobreposto",
        );
    }
}

export async function listFiscalPeriods(prisma, companyId) {
    const periods = await prisma.fiscalPeriod.findMany({
        where: { companyId },
        orderBy: { startDate: "asc" },
    });

    return periods.map(serialize);
}

export async function createFiscalPeriod(prisma, companyId, input) {
    await assertNoOverlap(prisma, companyId, input.startDate, input.endDate);

    const period = await prisma.fiscalPeriod.create({
        data: { companyId, ...input },
    });

    return serialize(period);
}

export async function closeFiscalPeriod(
    prisma,
    { companyId, periodId, actorUserId, now = new Date() },
) {
    const period = await prisma.fiscalPeriod.findFirst({
        where: { id: periodId, companyId },
    });
    if (!period)
        throw httpError(
            404,
            "FISCAL_PERIOD_NOT_FOUND",
            "Periodo fiscal nao encontrado",
        );
    if (period.status === "CLOSED") {
        throw httpError(
            409,
            "FISCAL_PERIOD_ALREADY_CLOSED",
            "Periodo fiscal ja esta fechado",
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

    if (!period)
        throw httpError(
            400,
            "FISCAL_PERIOD_MISSING",
            "Nao existe periodo fiscal para a data",
        );
    if (period.status === "CLOSED") {
        throw httpError(
            409,
            "FISCAL_PERIOD_CLOSED",
            "Periodo fiscal fechado para esta data",
        );
    }

    return period;
}