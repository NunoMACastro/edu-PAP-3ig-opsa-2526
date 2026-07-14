/**
 * @file Resumo operacional read-only da página inicial autenticada da OPSA.
 */

import { parseStrictDateOnly } from "../../lib/strictDate.js";
import { listStockAlerts } from "../inventory/stockAlertService.js";

const RECENT_TRANSACTION_LIMIT = 10;

function toDateOnly(value) {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value ?? "").slice(0, 10);
}

function countDocumentMovements(lines, sourceType, movementCounts) {
    return (lines ?? []).reduce(
        (total, line) => total + (movementCounts.get(`${sourceType}:${line.id}`) ?? 0),
        0,
    );
}

/**
 * Combina as últimas vendas e compras sem carregar documentos completos nem
 * executar uma query por linha. O estado contabilístico vem de `postedAt` e o
 * efeito de stock é contado pelas origens idempotentes publicadas pelo domínio.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma read-only.
 * @param {string} companyId - Empresa ativa obtida no backend.
 * @returns {Promise<object[]>} Até dez operações recentes, ordenadas de forma estável.
 */
export async function listRecentTransactions(prisma, companyId) {
    // Mantém compatibilidade com doubles históricos mínimos; no runtime Prisma
    // estes dois models existem sempre.
    if (!prisma.saleDocument?.findMany || !prisma.purchaseDocument?.findMany) return [];

    const documentSelect = {
        id: true,
        issuedAt: true,
        totalCents: true,
        status: true,
        postedAt: true,
        lines: {
            select: {
                id: true,
                item: { select: { type: true } },
            },
        },
    };
    const [sales, purchases] = await Promise.all([
        prisma.saleDocument.findMany({
            where: { companyId },
            orderBy: [{ issuedAt: "desc" }, { id: "desc" }],
            take: RECENT_TRANSACTION_LIMIT,
            select: {
                ...documentSelect,
                number: true,
                customer: { select: { name: true } },
            },
        }),
        prisma.purchaseDocument.findMany({
            where: { companyId },
            orderBy: [{ issuedAt: "desc" }, { id: "desc" }],
            take: RECENT_TRANSACTION_LIMIT,
            select: {
                ...documentSelect,
                supplierNumber: true,
                supplier: { select: { name: true } },
            },
        }),
    ]);

    const saleLineIds = sales.flatMap((document) =>
        (document.lines ?? []).map((line) => line.id));
    const purchaseLineIds = purchases.flatMap((document) =>
        (document.lines ?? []).map((line) => line.id));
    const originFilters = [
        ...(saleLineIds.length > 0
            ? [{ sourceType: "SALE_DOCUMENT_LINE", sourceId: { in: saleLineIds } }]
            : []),
        ...(purchaseLineIds.length > 0
            ? [{ sourceType: "PURCHASE_DOCUMENT_LINE", sourceId: { in: purchaseLineIds } }]
            : []),
    ];
    const movementRows = originFilters.length > 0 && prisma.stockMovement?.groupBy
        ? await prisma.stockMovement.groupBy({
            by: ["sourceType", "sourceId"],
            where: { companyId, OR: originFilters },
            _count: { _all: true },
        })
        : [];
    const movementCounts = new Map(
        movementRows.map((row) => [
            `${row.sourceType}:${row.sourceId}`,
            row._count?._all ?? 0,
        ]),
    );

    const normalizedSales = sales.flatMap((document) => {
        if (typeof document.id !== "string") return [];
        return [{
            documentType: "SALE",
            documentId: document.id,
            number: document.number || "Rascunho de venda",
            counterpartyName: document.customer?.name ?? "Cliente não identificado",
            issuedAt: toDateOnly(document.issuedAt),
            totalCents: document.totalCents,
            status: document.status,
            postedAt: document.postedAt?.toISOString?.() ?? document.postedAt ?? null,
            productLineCount: (document.lines ?? [])
                .filter((line) => line.item?.type === "PRODUCT").length,
            stockMovementCount: countDocumentMovements(
                document.lines,
                "SALE_DOCUMENT_LINE",
                movementCounts,
            ),
        }];
    });
    const normalizedPurchases = purchases.flatMap((document) => {
        if (typeof document.id !== "string") return [];
        return [{
            documentType: "PURCHASE",
            documentId: document.id,
            number: document.supplierNumber || "Rascunho de compra",
            counterpartyName: document.supplier?.name ?? "Fornecedor não identificado",
            issuedAt: toDateOnly(document.issuedAt),
            totalCents: document.totalCents,
            status: document.status,
            postedAt: document.postedAt?.toISOString?.() ?? document.postedAt ?? null,
            productLineCount: (document.lines ?? [])
                .filter((line) => line.item?.type === "PRODUCT").length,
            stockMovementCount: countDocumentMovements(
                document.lines,
                "PURCHASE_DOCUMENT_LINE",
                movementCounts,
            ),
        }];
    });

    return [...normalizedSales, ...normalizedPurchases]
        .sort((left, right) => (
            right.issuedAt.localeCompare(left.issuedAt) ||
            right.documentId.localeCompare(left.documentId)
        ))
        .slice(0, RECENT_TRANSACTION_LIMIT);
}

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
        recentTransactions,
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
        listRecentTransactions(prisma, input.companyId),
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
        recentTransactions,
    };
}
