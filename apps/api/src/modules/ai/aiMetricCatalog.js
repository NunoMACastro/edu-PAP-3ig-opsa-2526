/**
 * @file Catálogo canónico de métricas read-only da IA OPSA.
 *
 * O módulo separa validação, cálculo puro e leitura. Todas as somas percorrem o
 * conjunto integral devolvido pela base de dados; `topN` limita apenas fontes
 * apresentadas e nunca afeta um total.
 */

import { httpError } from "../../lib/httpErrors.js";

export const AI_TIMEZONE = "Europe/Lisbon";
export const AI_TOOL_NAMES = Object.freeze([
    "get_cashflow_summary",
    "get_receivables_summary",
    "get_stock_risk_summary",
    "get_margin_summary",
    "get_executive_kpis",
    "compare_periods",
    "get_insight_explanation",
]);

export function toAiLocalDateKey(date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: AI_TIMEZONE,
        year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
}

const DAY_MS = 86_400_000;

/** Devolve o desvio do fuso no instante indicado, sem dependências externas. */
function timezoneOffsetMs(instant, timezone) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    }).formatToParts(instant);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const representedAsUtc = Date.UTC(
        Number(values.year), Number(values.month) - 1, Number(values.day),
        Number(values.hour), Number(values.minute), Number(values.second),
        instant.getUTCMilliseconds(),
    );
    return representedAsUtc - instant.getTime();
}

/** Converte a meia-noite local (ou o fim do dia) para o instante UTC correto. */
export function zonedDateBoundary(dateText, { endOfDay = false } = {}) {
    if (typeof dateText !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
        throw httpError(400, "INVALID_DATE", "A data deve usar YYYY-MM-DD");
    }
    const [year, month, day] = dateText.split("-").map(Number);
    const localAsUtc = Date.UTC(
        year, month - 1, day,
        endOfDay ? 23 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 999 : 0,
    );
    let result = new Date(localAsUtc);
    result = new Date(localAsUtc - timezoneOffsetMs(result, AI_TIMEZONE));
    if (result.getUTCFullYear() < year - 1 || Number.isNaN(result.getTime())) {
        throw httpError(400, "INVALID_DATE", "Data inválida");
    }
    return result;
}

/** Valida o período comum às ferramentas analíticas. */
export function validateMetricPeriod(args) {
    const fromDate = zonedDateBoundary(args?.from);
    const toDate = zonedDateBoundary(args?.to, { endOfDay: true });
    if (fromDate > toDate) {
        throw httpError(400, "INVALID_DATE_RANGE", "O início não pode ser posterior ao fim");
    }
    const days = Math.floor((toDate - fromDate) / DAY_MS) + 1;
    if (days > 366) {
        throw httpError(400, "INVALID_DATE_RANGE", "O período não pode exceder 366 dias");
    }
    const topN = args?.topN === undefined ? 10 : Number(args.topN);
    if (!Number.isInteger(topN) || topN < 1 || topN > 10) {
        throw httpError(400, "INVALID_TOP_N", "topN deve estar entre 1 e 10");
    }
    return { fromDate, toDate, from: args.from, to: args.to, topN };
}

function movementOutflow(movement, warehouseId) {
    if (movement.fromWarehouseId !== warehouseId) return 0;
    if (["EXIT", "TRANSFER"].includes(movement.type)) return Math.abs(Number(movement.quantity));
    if (movement.type === "ADJUSTMENT" && Number(movement.quantity) < 0) return Math.abs(Number(movement.quantity));
    return 0;
}

function civilDayNumber(date) {
    const [year, month, day] = toAiLocalDateKey(date).split("-").map(Number);
    return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}

/**
 * Calcula consumo diário e dias de cobertura sem inferir procura inexistente.
 *
 * @param {{ balance: number, itemId: string, warehouseId: string, movements: object[], windowFrom: Date, windowTo: Date, minimumObservedDays?: number, minimumOutflowEvents?: number }} input - Série company-scoped já carregada.
 * @returns {object} Previsão determinística, fórmula e qualidade da amostra.
 */
export function calculateStockoutForecast(input) {
    const movements = input.movements.filter((movement) => movement.itemId === input.itemId
        && (movement.fromWarehouseId === input.warehouseId || movement.toWarehouseId === input.warehouseId));
    const earliest = movements.reduce((value, movement) => Math.min(value, new Date(movement.createdAt).getTime()), input.windowTo.getTime());
    const observedFrom = Math.max(input.windowFrom.getTime(), earliest);
    const observedDays = movements.length
        ? Math.max(1, civilDayNumber(input.windowTo) - civilDayNumber(new Date(observedFrom)) + 1)
        : 0;
    const outflows = movements.map((movement) => movementOutflow(movement, input.warehouseId)).filter((quantity) => quantity > 0);
    const latestMovementAt = movements.reduce((value, movement) => Math.max(value, new Date(movement.createdAt).getTime()), 0);
    const totalOutflow = outflows.reduce((sum, quantity) => sum + quantity, 0);
    const averageDailyOutflow = observedDays > 0 && totalOutflow > 0 ? totalOutflow / observedDays : 0;
    const balance = Number(input.balance);
    const daysOfCover = averageDailyOutflow > 0 ? Math.max(0, balance) / averageDailyOutflow : null;
    const enoughDays = observedDays >= (input.minimumObservedDays ?? 14);
    const enoughEvents = outflows.length >= (input.minimumOutflowEvents ?? 2);
    const quality = totalOutflow === 0
        ? movements.length ? "NO_OUTFLOW" : "INSUFFICIENT_DATA"
        : enoughDays && enoughEvents ? "SUFFICIENT" : "LIMITED";
    return {
        balance: Number(balance.toFixed(3)),
        totalOutflow: Number(totalOutflow.toFixed(3)),
        averageDailyOutflow: Number(averageDailyOutflow.toFixed(6)),
        daysOfCover: daysOfCover === null ? null : Number(daysOfCover.toFixed(1)),
        observedDays,
        outflowCount: outflows.length,
        daysSinceLastMovement: latestMovementAt
            ? Math.max(0, civilDayNumber(input.windowTo) - civilDayNumber(new Date(latestMovementAt)))
            : null,
        quality,
        formula: "averageDailyOutflow = sum(outbound quantities) / observed calendar days; daysOfCover = max(balance, 0) / averageDailyOutflow",
    };
}

/** Média de dias ponderada pelo valor efetivamente recebido/pago. */
export function weightedAverageDays(events, dateField, documentField) {
    let weightedDays = 0;
    let coveredCents = 0;
    const documents = new Set();
    for (const event of events) {
        const document = event[documentField];
        if (!document || event.amountCents <= 0) continue;
        const days = Math.max(0, (event[dateField] - document.issuedAt) / DAY_MS);
        weightedDays += days * event.amountCents;
        coveredCents += event.amountCents;
        documents.add(document.id);
    }
    return {
        days: coveredCents ? weightedDays / coveredCents : null,
        coveredCents,
        eventCount: events.length,
        documentCount: documents.size,
        method: "weighted_by_paid_amount_including_partial_payments",
    };
}

/** Calcula classes contabilísticas sem inferir valores ausentes. */
export function calculateAccountingMargin(lines) {
    let revenueCents = 0;
    let operatingExpenseCents = 0;
    let ebitdaExpenseCents = 0;
    let class6Count = 0;
    let class7Count = 0;
    let depreciationLineCount = 0;

    for (const line of lines) {
        const code = String(line.account?.code ?? "");
        if (code.startsWith("7") && !code.startsWith("79")) {
            revenueCents += line.creditCents - line.debitCents;
            class7Count += 1;
        }
        if (code.startsWith("6") && !code.startsWith("69")) {
            const expense = line.debitCents - line.creditCents;
            operatingExpenseCents += expense;
            class6Count += 1;
            if (code.startsWith("64")) depreciationLineCount += 1;
            else ebitdaExpenseCents += expense;
        }
    }

    const sufficient = class6Count > 0 && class7Count > 0;
    const operatingResultCents = sufficient ? revenueCents - operatingExpenseCents : null;
    const operatingMarginBps =
        sufficient && revenueCents !== 0
            ? Math.round((operatingResultCents / revenueCents) * 10_000)
            : null;
    const ebitdaCents = sufficient
        ? revenueCents - ebitdaExpenseCents
        : null;
    return {
        revenueCents: sufficient ? revenueCents : null,
        operatingExpenseCents: sufficient ? operatingExpenseCents : null,
        operatingResultCents,
        operatingMarginBps,
        ebitdaCents,
        marginCents: operatingResultCents,
        legacyEbitdaCents: ebitdaCents,
        class6LineCount: class6Count,
        class7LineCount: class7Count,
        depreciationLineCount,
        quality: sufficient ? "ACCOUNTING_COMPLETE" : "INSUFFICIENT_DATA",
        method: "SNC classes 7/6; excludes financing prefixes 79/69; EBITDA also excludes 64",
    };
}

function resultEnvelope(tool, period, data, options = {}) {
    return {
        tool,
        period: {
            from: period.from,
            to: period.to,
            timezone: AI_TIMEZONE,
            asOf: new Date().toISOString(),
        },
        metrics: data,
        formula: options.formula,
        counts: options.counts ?? {},
        quality: options.quality ?? "COMPLETE",
        limitations: options.limitations ?? [],
        sourceRefs: (options.sourceRefs ?? []).slice(0, period.topN),
    };
}

async function getMarginSummary(prisma, companyId, period) {
    const grouped = await prisma.journalEntryLine.groupBy({
        by: ["accountId"],
        where: {
            journalEntry: {
                companyId,
                entryDate: { gte: period.fromDate, lte: period.toDate },
            },
        },
        _sum: { debitCents: true, creditCents: true },
        _count: { _all: true },
    });
    const accounts = grouped.length ? await prisma.account.findMany({
        where: { companyId, id: { in: grouped.map((entry) => entry.accountId) } },
        select: { id: true, code: true },
    }) : [];
    const accountCodes = new Map(accounts.map((account) => [account.id, account.code]));
    const lines = grouped.map((entry) => ({
        debitCents: entry._sum.debitCents ?? 0,
        creditCents: entry._sum.creditCents ?? 0,
        account: { code: accountCodes.get(entry.accountId) ?? "" },
    }));
    const journalLineCount = grouped.reduce((sum, entry) => sum + entry._count._all, 0);
    const metrics = calculateAccountingMargin(lines);
    return resultEnvelope("get_margin_summary", period, metrics, {
        formula: metrics.method,
        counts: { journalLineCount, accountCount: grouped.length },
        quality: metrics.quality,
        limitations: metrics.quality === "INSUFFICIENT_DATA"
            ? ["Não existem lançamentos suficientes nas classes SNC 6 e 7 para o período."]
            : [],
        sourceRefs: [{ type: "JOURNAL_ENTRY_LINES", count: journalLineCount }],
    });
}

async function getReceivablesSummary(prisma, companyId, period) {
    const [summaryRows, sources] = await Promise.all([
        prisma.$queryRaw`
            WITH paid AS (
                SELECT "saleDocumentId", COALESCE(SUM("amountCents"), 0)::bigint AS "paidCents"
                FROM "Receipt"
                WHERE "companyId" = ${companyId} AND "receivedAt" <= ${period.toDate}
                GROUP BY "saleDocumentId"
            ), open_documents AS (
                SELECT d.id, d."customerId", COALESCE(d."dueDate", d."issuedAt") AS "dueAt",
                       GREATEST(d."totalCents"::bigint - COALESCE(p."paidCents", 0), 0)::bigint AS "openCents"
                FROM "SaleDocument" d
                LEFT JOIN paid p ON p."saleDocumentId" = d.id
                WHERE d."companyId" = ${companyId}
                  AND d.kind <> 'CREDIT_NOTE'
                  AND d.status IN ('ISSUED', 'SETTLED')
                  AND d."issuedAt" <= ${period.toDate}
            )
            SELECT COALESCE(SUM("openCents"), 0)::bigint AS "totalOpenCents",
                   COALESCE(SUM(CASE WHEN "dueAt" < ${period.toDate} THEN "openCents" ELSE 0 END), 0)::bigint AS "overdueCents",
                   COUNT(*)::bigint AS "documentCount",
                   COUNT(*) FILTER (WHERE "openCents" > 0)::bigint AS "openDocumentCount",
                   COUNT(*) FILTER (WHERE "openCents" > 0 AND "dueAt" < ${period.toDate})::bigint AS "overdueDocumentCount"
            FROM open_documents
        `,
        prisma.$queryRaw`
            WITH paid AS (
                SELECT "saleDocumentId", COALESCE(SUM("amountCents"), 0)::bigint AS "paidCents"
                FROM "Receipt"
                WHERE "companyId" = ${companyId} AND "receivedAt" <= ${period.toDate}
                GROUP BY "saleDocumentId"
            )
            SELECT d.id AS "documentId", d."customerId" AS "entityId",
                   GREATEST(d."totalCents"::bigint - COALESCE(p."paidCents", 0), 0)::bigint AS "openCents"
            FROM "SaleDocument" d
            LEFT JOIN paid p ON p."saleDocumentId" = d.id
            WHERE d."companyId" = ${companyId}
              AND d.kind <> 'CREDIT_NOTE'
              AND d.status IN ('ISSUED', 'SETTLED')
              AND d."issuedAt" <= ${period.toDate}
              AND COALESCE(d."dueDate", d."issuedAt") < ${period.toDate}
              AND d."totalCents"::bigint - COALESCE(p."paidCents", 0) > 0
            ORDER BY "openCents" DESC, d.id ASC
            LIMIT ${period.topN}
        `,
    ]);
    const summary = summaryRows[0] ?? {};
    const totalOpenCents = Number(summary.totalOpenCents ?? 0);
    const overdueCents = Number(summary.overdueCents ?? 0);
    const documentCount = Number(summary.documentCount ?? 0);
    return resultEnvelope("get_receivables_summary", period, {
        totalOpenCents, overdueCents,
        overdueShareBps: totalOpenCents ? Math.round(overdueCents / totalOpenCents * 10_000) : null,
    }, {
        formula: "sum(max(totalCents - amountPaidCents, 0)); overdue at period end",
        counts: { documentCount, openDocumentCount: Number(summary.openDocumentCount ?? 0), overdueDocumentCount: Number(summary.overdueDocumentCount ?? 0) },
        quality: documentCount ? "COMPLETE" : "INSUFFICIENT_DATA",
        limitations: ["O saldo é reconstruído por documentos e recebimentos registados até ao fim do período."],
        sourceRefs: sources.map((source) => ({ type: "DOCUMENT", entityType: "CUSTOMER", entityId: source.entityId, documentId: source.documentId, amountCents: Number(source.openCents) })),
    });
}

async function getCashflowSummary(prisma, companyId, period) {
    const historical = period.toDate < new Date();
    if (historical) {
        const [accounts, snapshots, receipts, payments] = await Promise.all([
            prisma.treasuryAccount.findMany({
                where: { companyId, createdAt: { lte: period.fromDate } },
                select: { id: true },
            }),
            prisma.treasuryBalanceSnapshot.findMany({
                where: { companyId, snapshotAt: { lte: period.toDate } },
                orderBy: { snapshotAt: "asc" },
                select: { treasuryAccountId: true, balanceCents: true, snapshotAt: true },
            }),
            prisma.receipt.findMany({ where: { companyId, receivedAt: { gte: period.fromDate, lte: period.toDate } }, select: { id: true, amountCents: true } }),
            prisma.payment.findMany({ where: { companyId, paidAt: { gte: period.fromDate, lte: period.toDate } }, select: { id: true, amountCents: true } }),
        ]);
        const openingByAccount = new Map();
        for (const snapshot of snapshots) {
            if (snapshot.snapshotAt <= period.fromDate) openingByAccount.set(snapshot.treasuryAccountId, snapshot.balanceCents);
        }
        const missingAccountCount = accounts.filter((account) => !openingByAccount.has(account.id)).length;
        const hasAnyCoverage = accounts.length > 0 && openingByAccount.size > 0;
        const openingBalanceCents = hasAnyCoverage
            ? [...openingByAccount.values()].reduce((sum, value) => sum + value, 0)
            : null;
        const inflowCents = receipts.reduce((sum, receipt) => sum + receipt.amountCents, 0);
        const outflowCents = payments.reduce((sum, payment) => sum + payment.amountCents, 0);
        return resultEnvelope("get_cashflow_summary", period, {
            openingBalanceCents,
            inflowCents,
            outflowCents,
            closingBalanceCents: openingBalanceCents === null ? null : openingBalanceCents + inflowCents - outflowCents,
            historical: true,
        }, {
            formula: "latest treasury snapshots at period start + receipts - payments",
            counts: { accountCount: accounts.length, coveredAccountCount: openingByAccount.size, missingAccountCount, snapshotCount: snapshots.length, receiptCount: receipts.length, paymentCount: payments.length },
            quality: openingBalanceCents === null ? "INSUFFICIENT_DATA" : missingAccountCount > 0 ? "PARTIAL" : "COMPLETE",
            limitations: openingBalanceCents === null
                ? ["Não existe snapshot de tesouraria suficiente para reconstruir o saldo inicial histórico."]
                : missingAccountCount > 0
                    ? ["A cobertura histórica é parcial: existem contas criadas antes do período sem snapshot inicial."]
                    : [],
            sourceRefs: [...receipts.map((entry) => ({ type: "RECEIPT", id: entry.id })), ...payments.map((entry) => ({ type: "PAYMENT", id: entry.id }))],
        });
    }
    const [accounts, sales, purchases] = await Promise.all([
        prisma.treasuryAccount.findMany({ where: { companyId, isActive: true }, select: { currentBalanceCents: true } }),
        prisma.saleDocument.findMany({
            where: { companyId, kind: { not: "CREDIT_NOTE" }, status: { in: ["ISSUED", "SETTLED"] } },
            select: { id: true, dueDate: true, issuedAt: true, totalCents: true, amountPaidCents: true },
        }),
        prisma.purchaseDocument.findMany({
            where: { companyId, kind: { not: "SUPPLIER_CREDIT_NOTE" }, status: { in: ["APPROVED", "POSTED", "PAID"] } },
            select: { id: true, dueDate: true, issuedAt: true, totalCents: true, amountPaidCents: true },
        }),
    ]);
    const inRange = (date) => date >= period.fromDate && date <= period.toDate;
    const inflows = sales.filter((d) => inRange(d.dueDate ?? d.issuedAt));
    const outflows = purchases.filter((d) => inRange(d.dueDate ?? d.issuedAt));
    const openingBalanceCents = accounts.reduce((sum, account) => sum + account.currentBalanceCents, 0);
    const inflowCents = inflows.reduce((sum, d) => sum + Math.max(0, d.totalCents - d.amountPaidCents), 0);
    const outflowCents = outflows.reduce((sum, d) => sum + Math.max(0, d.totalCents - d.amountPaidCents), 0);
    return resultEnvelope("get_cashflow_summary", period, {
        openingBalanceCents, inflowCents, outflowCents,
        closingBalanceCents: openingBalanceCents + inflowCents - outflowCents,
        historical: false,
    }, {
        formula: "current treasury balance + open receivables due - open payables due",
        counts: { accountCount: accounts.length, inflowDocumentCount: inflows.length, outflowDocumentCount: outflows.length },
        quality: accounts.length ? "COMPLETE" : "INSUFFICIENT_DATA",
        limitations: ["Previsão por vencimentos; não representa movimentos bancários futuros confirmados."],
        sourceRefs: [
            ...inflows.map((d) => ({ type: "SALE_DOCUMENT", documentId: d.id })),
            ...outflows.map((d) => ({ type: "PURCHASE_DOCUMENT", documentId: d.id })),
        ],
    });
}

async function getStockForecasts(prisma, companyId, period) {
    const balances = await prisma.stockBalance.findMany({
        where: { companyId, item: { type: "PRODUCT" } },
        include: {
            item: { select: { id: true, sku: true, name: true } },
            warehouse: { select: { id: true, code: true, name: true } },
        },
        orderBy: [{ warehouseId: "asc" }, { itemId: "asc" }],
    });
    if (balances.length === 0) return [];
    const itemIds = [...new Set(balances.map((balance) => balance.itemId))];
    const warehouseIds = [...new Set(balances.map((balance) => balance.warehouseId))];
    const [movements, settings] = await Promise.all([
        prisma.stockMovement.findMany({
            where: {
                companyId,
                itemId: { in: itemIds },
                createdAt: { gte: period.fromDate, lte: period.toDate },
                OR: [{ fromWarehouseId: { in: warehouseIds } }, { toWarehouseId: { in: warehouseIds } }],
            },
            select: { itemId: true, type: true, quantity: true, fromWarehouseId: true, toWarehouseId: true, createdAt: true },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        }),
        prisma.stockAlertSetting.findMany({
            where: { companyId, itemId: { in: itemIds }, warehouseId: { in: warehouseIds } },
            select: { itemId: true, warehouseId: true, minQuantity: true, maxQuantity: true, stoppedAfterDays: true },
        }),
    ]);
    const settingByKey = new Map(settings.map((setting) => [`${setting.itemId}:${setting.warehouseId}`, setting]));
    return balances.map((balance) => {
        const metric = calculateStockoutForecast({
            balance: Number(balance.quantity),
            itemId: balance.itemId,
            warehouseId: balance.warehouseId,
            movements,
            windowFrom: period.fromDate,
            windowTo: period.toDate,
        });
        const setting = settingByKey.get(`${balance.itemId}:${balance.warehouseId}`);
        return {
            itemId: balance.itemId,
            warehouseId: balance.warehouseId,
            itemSku: balance.item.sku,
            itemName: balance.item.name,
            warehouseCode: balance.warehouse.code,
            warehouseName: balance.warehouse.name,
            minQuantity: setting?.minQuantity == null ? null : Number(setting.minQuantity),
            maxQuantity: setting?.maxQuantity == null ? null : Number(setting.maxQuantity),
            stoppedAfterDays: setting?.stoppedAfterDays ?? 90,
            ...metric,
        };
    });
}

async function getStockRiskSummary(prisma, companyId, period) {
    const today = new Date();
    const isCurrent = period.toDate >= today;
    const [summaryRows, risks, forecasts] = isCurrent ? await Promise.all([
        prisma.$queryRaw`
            WITH risks AS (
                SELECT s."itemId", s."warehouseId", COALESCE(b.quantity, 0) AS quantity,
                       CASE WHEN s."minQuantity" IS NOT NULL AND COALESCE(b.quantity, 0) < s."minQuantity" THEN 'LOW_STOCK'
                            WHEN s."maxQuantity" IS NOT NULL AND COALESCE(b.quantity, 0) > s."maxQuantity" THEN 'HIGH_STOCK' END AS type
                FROM "StockAlertSetting" s
                LEFT JOIN "StockBalance" b ON b."companyId" = s."companyId" AND b."itemId" = s."itemId" AND b."warehouseId" = s."warehouseId"
                WHERE s."companyId" = ${companyId}
            )
            SELECT COUNT(*)::bigint AS "settingCount", COUNT(*) FILTER (WHERE type = 'LOW_STOCK')::bigint AS "lowStockCount",
                   COUNT(*) FILTER (WHERE type = 'HIGH_STOCK')::bigint AS "highStockCount"
            FROM risks
        `,
        prisma.$queryRaw`
            SELECT s."itemId", s."warehouseId", COALESCE(b.quantity, 0) AS quantity,
                   CASE WHEN s."minQuantity" IS NOT NULL AND COALESCE(b.quantity, 0) < s."minQuantity" THEN 'LOW_STOCK' ELSE 'HIGH_STOCK' END AS type
            FROM "StockAlertSetting" s
            LEFT JOIN "StockBalance" b ON b."companyId" = s."companyId" AND b."itemId" = s."itemId" AND b."warehouseId" = s."warehouseId"
            WHERE s."companyId" = ${companyId} AND ((s."minQuantity" IS NOT NULL AND COALESCE(b.quantity, 0) < s."minQuantity") OR (s."maxQuantity" IS NOT NULL AND COALESCE(b.quantity, 0) > s."maxQuantity"))
            ORDER BY type ASC, s."itemId" ASC, s."warehouseId" ASC
            LIMIT ${period.topN}
        `,
        getStockForecasts(prisma, companyId, period),
    ]) : await Promise.all([
        prisma.$queryRaw`
            WITH deltas AS (
                SELECT "itemId", "fromWarehouseId" AS "warehouseId", -quantity AS quantity FROM "StockMovement"
                WHERE "companyId" = ${companyId} AND "createdAt" <= ${period.toDate} AND "fromWarehouseId" IS NOT NULL
                UNION ALL
                SELECT "itemId", "toWarehouseId" AS "warehouseId", quantity FROM "StockMovement"
                WHERE "companyId" = ${companyId} AND "createdAt" <= ${period.toDate} AND "toWarehouseId" IS NOT NULL
            ), quantities AS (
                SELECT "itemId", "warehouseId", SUM(quantity) AS quantity FROM deltas GROUP BY "itemId", "warehouseId"
            ), risks AS (
                SELECT s."itemId", s."warehouseId", COALESCE(q.quantity, 0) AS quantity,
                       CASE WHEN s."minQuantity" IS NOT NULL AND COALESCE(q.quantity, 0) < s."minQuantity" THEN 'LOW_STOCK'
                            WHEN s."maxQuantity" IS NOT NULL AND COALESCE(q.quantity, 0) > s."maxQuantity" THEN 'HIGH_STOCK' END AS type
                FROM "StockAlertSetting" s LEFT JOIN quantities q ON q."itemId" = s."itemId" AND q."warehouseId" = s."warehouseId"
                WHERE s."companyId" = ${companyId}
            )
            SELECT COUNT(*)::bigint AS "settingCount", COUNT(*) FILTER (WHERE type = 'LOW_STOCK')::bigint AS "lowStockCount",
                   COUNT(*) FILTER (WHERE type = 'HIGH_STOCK')::bigint AS "highStockCount",
                   (SELECT COUNT(*) FROM "StockMovement" WHERE "companyId" = ${companyId} AND "createdAt" <= ${period.toDate})::bigint AS "movementCount"
            FROM risks
        `,
        prisma.$queryRaw`
            WITH deltas AS (
                SELECT "itemId", "fromWarehouseId" AS "warehouseId", -quantity AS quantity FROM "StockMovement"
                WHERE "companyId" = ${companyId} AND "createdAt" <= ${period.toDate} AND "fromWarehouseId" IS NOT NULL
                UNION ALL
                SELECT "itemId", "toWarehouseId" AS "warehouseId", quantity FROM "StockMovement"
                WHERE "companyId" = ${companyId} AND "createdAt" <= ${period.toDate} AND "toWarehouseId" IS NOT NULL
            ), quantities AS (SELECT "itemId", "warehouseId", SUM(quantity) AS quantity FROM deltas GROUP BY "itemId", "warehouseId")
            SELECT s."itemId", s."warehouseId", COALESCE(q.quantity, 0) AS quantity,
                   CASE WHEN s."minQuantity" IS NOT NULL AND COALESCE(q.quantity, 0) < s."minQuantity" THEN 'LOW_STOCK' ELSE 'HIGH_STOCK' END AS type
            FROM "StockAlertSetting" s LEFT JOIN quantities q ON q."itemId" = s."itemId" AND q."warehouseId" = s."warehouseId"
            WHERE s."companyId" = ${companyId} AND ((s."minQuantity" IS NOT NULL AND COALESCE(q.quantity, 0) < s."minQuantity") OR (s."maxQuantity" IS NOT NULL AND COALESCE(q.quantity, 0) > s."maxQuantity"))
            ORDER BY type ASC, s."itemId" ASC, s."warehouseId" ASC LIMIT ${period.topN}
        `,
        Promise.resolve([]),
    ]);
    const summary = summaryRows[0] ?? {};
    const lowStockCount = Number(summary.lowStockCount ?? 0);
    const highStockCount = Number(summary.highStockCount ?? 0);
    const movementCount = Number(summary.movementCount ?? 0);
    return resultEnvelope("get_stock_risk_summary", period, {
        lowStockCount,
        highStockCount,
        forecasts,
        historical: !isCurrent,
    }, {
        formula: isCurrent
            ? "StockBalance versus configured thresholds; average daily outflow = outbound quantity / observed days; days of cover = balance / average daily outflow"
            : "sum movements into/out of warehouse up to period end",
        counts: { settingCount: Number(summary.settingCount ?? 0), movementCount, forecastCount: forecasts.length },
        quality: !isCurrent && movementCount === 0 ? "INSUFFICIENT_DATA" : "COMPLETE",
        limitations: !isCurrent && movementCount === 0
            ? ["Não há movimentos suficientes para reconstruir o stock histórico."]
            : !isCurrent
                ? ["A reconstrução histórica pressupõe que o histórico de movimentos começa no saldo zero e está completo."]
                : [],
        sourceRefs: [
            ...risks.map((risk) => ({ type: "ITEM", entityType: "ITEM", entityId: risk.itemId, warehouseId: risk.warehouseId, riskType: risk.type })),
            ...forecasts.map((forecast) => ({
                type: "ITEM",
                entityType: "ITEM",
                entityId: forecast.itemId,
                warehouseId: forecast.warehouseId,
                riskType: "STOCKOUT_FORECAST",
            })),
        ],
    });
}

async function getExecutiveKpis(prisma, companyId, period) {
    const [margin, receiptRows, paymentRows] = await Promise.all([
        getMarginSummary(prisma, companyId, period),
        prisma.$queryRaw`
            SELECT COALESCE(SUM(r."amountCents"), 0)::bigint AS "coveredCents",
                   COALESCE(SUM(r."amountCents" * GREATEST(EXTRACT(EPOCH FROM (r."receivedAt" - d."issuedAt")) / 86400, 0)), 0) AS "weightedDays",
                   COUNT(*)::bigint AS "eventCount", COUNT(DISTINCT d.id)::bigint AS "documentCount"
            FROM "Receipt" r JOIN "SaleDocument" d ON d.id = r."saleDocumentId" AND d."companyId" = r."companyId"
            WHERE r."companyId" = ${companyId} AND r."receivedAt" BETWEEN ${period.fromDate} AND ${period.toDate}
        `,
        prisma.$queryRaw`
            SELECT COALESCE(SUM(p."amountCents"), 0)::bigint AS "coveredCents",
                   COALESCE(SUM(p."amountCents" * GREATEST(EXTRACT(EPOCH FROM (p."paidAt" - d."issuedAt")) / 86400, 0)), 0) AS "weightedDays",
                   COUNT(*)::bigint AS "eventCount", COUNT(DISTINCT d.id)::bigint AS "documentCount"
            FROM "Payment" p JOIN "PurchaseDocument" d ON d.id = p."purchaseDocumentId" AND d."companyId" = p."companyId"
            WHERE p."companyId" = ${companyId} AND p."paidAt" BETWEEN ${period.fromDate} AND ${period.toDate}
        `,
    ]);
    const coverage = (row = {}) => {
        const coveredCents = Number(row.coveredCents ?? 0);
        return {
            days: coveredCents ? Number(row.weightedDays ?? 0) / coveredCents : null,
            coveredCents,
            eventCount: Number(row.eventCount ?? 0),
            documentCount: Number(row.documentCount ?? 0),
            method: "weighted_by_paid_amount_including_partial_payments",
        };
    };
    const pmr = coverage(receiptRows[0]);
    const pmp = coverage(paymentRows[0]);
    return resultEnvelope("get_executive_kpis", period, {
        ...margin.metrics,
        pmrDays: pmr.days,
        pmpDays: pmp.days,
        pmrCoverage: pmr,
        pmpCoverage: pmp,
    }, {
        formula: `${margin.formula}; PMR/PMP weighted by each partial payment amount`,
        counts: { ...margin.counts, receiptCount: pmr.eventCount, paymentCount: pmp.eventCount },
        quality: margin.quality,
        limitations: margin.limitations,
        sourceRefs: margin.sourceRefs,
    });
}

/** Executa uma ferramenta do catálogo após validar empresa e argumentos. */
export async function executeAiTool(prisma, { companyId, toolName, args }) {
    if (!companyId || !AI_TOOL_NAMES.includes(toolName)) {
        throw httpError(400, "INVALID_AI_TOOL", "Ferramenta analítica inválida");
    }
    if (toolName === "get_insight_explanation") {
        if (typeof args?.insightId !== "string" || !args.insightId) {
            throw httpError(400, "INVALID_INSIGHT", "insightId é obrigatório");
        }
        const insight = await prisma.aiInsight.findFirst({ where: { id: args.insightId, companyId } });
        if (!insight) throw httpError(404, "AI_INSIGHT_NOT_FOUND", "Insight não encontrado");
        return {
            tool: toolName,
            period: { from: insight.periodFrom, to: insight.periodTo, asOf: insight.asOf, timezone: AI_TIMEZONE },
            metrics: insight.evidence ?? {},
            formula: insight.explanation,
            counts: { occurrenceCount: insight.occurrenceCount },
            quality: insight.evidence ? "COMPLETE" : "LEGACY",
            limitations: insight.evidence ? [] : ["Insight legado sem evidência estruturada."],
            sourceRefs: [{ type: insight.sourceType, id: insight.sourceId }],
        };
    }
    const period = validateMetricPeriod(args);
    if (toolName === "get_margin_summary") return getMarginSummary(prisma, companyId, period);
    if (toolName === "get_receivables_summary") return getReceivablesSummary(prisma, companyId, period);
    if (toolName === "get_cashflow_summary") return getCashflowSummary(prisma, companyId, period);
    if (toolName === "get_stock_risk_summary") return getStockRiskSummary(prisma, companyId, period);
    if (toolName === "get_executive_kpis") return getExecutiveKpis(prisma, companyId, period);
    if (toolName === "compare_periods") {
        const metric = args.metric;
        const allowed = new Set(["get_cashflow_summary", "get_receivables_summary", "get_stock_risk_summary", "get_margin_summary", "get_executive_kpis"]);
        if (!allowed.has(metric)) throw httpError(400, "INVALID_COMPARISON_METRIC", "Métrica de comparação inválida");
        const current = await executeAiTool(prisma, { companyId, toolName: metric, args });
        const previous = await executeAiTool(prisma, {
            companyId,
            toolName: metric,
            args: { from: args.previousFrom, to: args.previousTo, topN: args.topN },
        });
        return { tool: toolName, period: current.period, metrics: { current: current.metrics, previous: previous.metrics }, formula: "side-by-side canonical metric comparison", counts: { current: current.counts, previous: previous.counts }, quality: current.quality === "COMPLETE" && previous.quality === "COMPLETE" ? "COMPLETE" : "PARTIAL", limitations: [...current.limitations, ...previous.limitations], sourceRefs: [...current.sourceRefs, ...previous.sourceRefs].slice(0, period.topN) };
    }
    throw httpError(400, "INVALID_AI_TOOL", "Ferramenta analítica inválida");
}

const periodProperties = {
    from: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    to: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    topN: { type: "integer", minimum: 1, maximum: 10 },
};

/** Schemas estritos expostos ao provider; não incluem IDs reais nem acesso técnico. */
export const AI_FUNCTION_TOOLS = Object.freeze([
    ...AI_TOOL_NAMES.filter((name) => !["compare_periods", "get_insight_explanation"].includes(name)).map((name) => ({
        type: "function", name, strict: true,
        description: `Consulta read-only OPSA: ${name}`,
        parameters: { type: "object", additionalProperties: false, properties: periodProperties, required: ["from", "to", "topN"] },
    })),
    {
        type: "function", name: "compare_periods", strict: true,
        description: "Compara a mesma métrica em dois períodos.",
        parameters: {
            type: "object", additionalProperties: false,
            properties: {
                ...periodProperties,
                previousFrom: periodProperties.from,
                previousTo: periodProperties.to,
                metric: { type: "string", enum: AI_TOOL_NAMES.filter((name) => !["compare_periods", "get_insight_explanation"].includes(name)) },
            },
            required: ["from", "to", "previousFrom", "previousTo", "metric", "topN"],
        },
    },
    {
        type: "function", name: "get_insight_explanation", strict: true,
        description: "Explica um insight OPSA já autorizado.",
        parameters: { type: "object", additionalProperties: false, properties: { insightId: { type: "string", minLength: 1 } }, required: ["insightId"] },
    },
]);
