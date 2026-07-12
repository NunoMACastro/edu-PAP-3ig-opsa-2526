/**
 * @file Resumo operacional read-only da página inicial autenticada da OPSA.
 */

import { parseStrictDateOnly } from "../../lib/strictDate.js";
import { listStockAlerts } from "../inventory/stockAlertService.js";

/**
 * Obtém a data civil corrente no fuso funcional da aplicação.
 *
 * @returns {string} Data no formato YYYY-MM-DD em Europe/Lisbon.
 */
function currentLisbonDate() {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Lisbon",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
}

/**
 * Valida a data de referência opcional do dashboard.
 *
 * @param {unknown} value - Query parameter `asOf`.
 * @returns {{ raw: string, date: Date }} Data textual e objeto UTC validados.
 */
export function parseDashboardAsOf(value) {
    const raw = value === undefined || value === null || value === ""
        ? currentLisbonDate()
        : String(value).trim();
    return {
        raw,
        date: parseStrictDateOnly(raw, {
            code: "INVALID_DASHBOARD_DATE",
            field: "Data do dashboard",
        }),
    };
}

function countStatuses(rows, statuses) {
    const counts = Object.fromEntries(statuses.map((status) => [status, 0]));
    for (const row of rows) {
        if (row.status in counts) counts[row.status] = row._count?._all ?? 0;
    }
    return counts;
}

/**
 * Calcula o resumo sem criar runs, logs ou quaisquer outras escritas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma read-only neste fluxo.
 * @param {{ companyId: string, company: { id: string, name: string }, userId: string, asOf?: unknown }} input - Contexto autenticado.
 * @returns {Promise<object>} Resumo operacional seguro para todas as roles.
 */
export async function buildDashboardSummary(prisma, input) {
    const asOf = parseDashboardAsOf(input.asOf);
    const [
        activeFiscalPeriod,
        saleStatusRows,
        purchaseStatusRows,
        receivableRows,
        stockAlerts,
        unreadNotifications,
    ] = await Promise.all([
        prisma.fiscalPeriod.findFirst({
            where: {
                companyId: input.companyId,
                status: "OPEN",
                startDate: { lte: asOf.date },
                endDate: { gte: asOf.date },
            },
            orderBy: { startDate: "desc" },
            select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                status: true,
            },
        }),
        prisma.saleDocument.groupBy({
            by: ["status"],
            where: {
                companyId: input.companyId,
                status: { in: ["DRAFT", "SUBMITTED", "APPROVED"] },
            },
            _count: { _all: true },
        }),
        prisma.purchaseDocument.groupBy({
            by: ["status"],
            where: {
                companyId: input.companyId,
                status: { in: ["DRAFT", "APPROVED"] },
            },
            _count: { _all: true },
        }),
        prisma.saleDocument.findMany({
            where: {
                companyId: input.companyId,
                status: "ISSUED",
                kind: { not: "CREDIT_NOTE" },
                totalCents: { gt: 0 },
            },
            select: {
                totalCents: true,
                amountPaidCents: true,
                dueDate: true,
                issuedAt: true,
            },
        }),
        listStockAlerts(prisma, input.companyId),
        prisma.inAppNotification.count({
            where: {
                companyId: input.companyId,
                userId: input.userId,
                readAt: null,
            },
        }),
    ]);

    const openReceivables = receivableRows.flatMap((document) => {
        const openCents = document.totalCents - document.amountPaidCents;
        if (openCents <= 0) return [];
        return [{
            openCents,
            dueDate: document.dueDate ?? document.issuedAt,
        }];
    });
    const overdue = openReceivables.filter(({ dueDate }) => dueDate < asOf.date);
    const sales = countStatuses(saleStatusRows, ["DRAFT", "SUBMITTED", "APPROVED"]);
    const purchases = countStatuses(purchaseStatusRows, ["DRAFT", "APPROVED"]);

    return {
        asOf: asOf.raw,
        company: { id: input.company.id, name: input.company.name },
        activeFiscalPeriod: activeFiscalPeriod
            ? {
                ...activeFiscalPeriod,
                startDate: activeFiscalPeriod.startDate.toISOString().slice(0, 10),
                endDate: activeFiscalPeriod.endDate.toISOString().slice(0, 10),
            }
            : null,
        sales: {
            draft: sales.DRAFT,
            submitted: sales.SUBMITTED,
            approved: sales.APPROVED,
        },
        purchases: {
            draft: purchases.DRAFT,
            approved: purchases.APPROVED,
        },
        receivables: {
            openCount: openReceivables.length,
            overdueCount: overdue.length,
            overdueCents: overdue.reduce((total, item) => total + item.openCents, 0),
        },
        stockAlerts: {
            total: stockAlerts.length,
            lowStock: stockAlerts.filter((alert) => alert.type === "LOW_STOCK").length,
            highStock: stockAlerts.filter((alert) => alert.type === "HIGH_STOCK").length,
            stoppedItems: stockAlerts.filter((alert) => alert.type === "STOPPED_ITEM").length,
        },
        notifications: { unread: unreadNotifications },
    };
}
