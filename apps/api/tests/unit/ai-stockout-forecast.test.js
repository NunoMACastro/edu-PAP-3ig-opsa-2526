/**
 * @file Provas unitárias da previsão académica de rutura e do agendamento IA.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    calculateStockoutForecast,
    executeAiTool,
    toAiLocalDateKey,
    zonedDateBoundary,
} from "../../src/modules/ai/aiMetricCatalog.js";
import {
    AI_RULE_REGISTRY,
    buildAnalysisCandidates,
} from "../../src/modules/ai/aiAnalysisService.js";
import {
    enqueueHourlyCompanyRuns,
    rollingAnalysisPeriod,
} from "../../src/modules/ai/aiAnalysisWorker.js";

function movement(overrides) {
    return {
        itemId: "item-1",
        type: "EXIT",
        quantity: 5,
        fromWarehouseId: "warehouse-1",
        toWarehouseId: null,
        createdAt: new Date("2026-07-01T12:00:00.000Z"),
        ...overrides,
    };
}

test("previsão calcula média diária e dias de cobertura com fórmula rastreável", () => {
    const result = calculateStockoutForecast({
        balance: 10,
        itemId: "item-1",
        warehouseId: "warehouse-1",
        movements: [movement({ quantity: 4 }), movement({ quantity: 6, createdAt: new Date("2026-07-10T12:00:00.000Z") })],
        windowFrom: zonedDateBoundary("2026-07-01"),
        windowTo: zonedDateBoundary("2026-07-20", { endOfDay: true }),
    });

    assert.equal(result.observedDays, 20);
    assert.equal(result.totalOutflow, 10);
    assert.equal(result.averageDailyOutflow, 0.5);
    assert.equal(result.daysOfCover, 20);
    assert.equal(result.quality, "SUFFICIENT");
    assert.match(result.formula, /daysOfCover/);
});

test("amostras fracas e ausência de saídas não inventam uma previsão", () => {
    const shortSample = calculateStockoutForecast({
        balance: 10,
        itemId: "item-1",
        warehouseId: "warehouse-1",
        movements: [movement({})],
        windowFrom: zonedDateBoundary("2026-07-01"),
        windowTo: zonedDateBoundary("2026-07-05", { endOfDay: true }),
    });
    const noOutflow = calculateStockoutForecast({
        balance: 10,
        itemId: "item-1",
        warehouseId: "warehouse-1",
        movements: [movement({ type: "ENTRY", fromWarehouseId: null, toWarehouseId: "warehouse-1" })],
        windowFrom: zonedDateBoundary("2026-07-01"),
        windowTo: zonedDateBoundary("2026-07-20", { endOfDay: true }),
    });

    assert.equal(shortSample.quality, "LIMITED");
    assert.equal(noOutflow.averageDailyOutflow, 0);
    assert.equal(noOutflow.daysOfCover, null);
    assert.equal(noOutflow.quality, "NO_OUTFLOW");
});

test("saldo esgotado produz cobertura zero sem divisão inválida", () => {
    const result = calculateStockoutForecast({
        balance: -2,
        itemId: "item-1",
        warehouseId: "warehouse-1",
        movements: [movement({ quantity: 2 }), movement({ quantity: 3, createdAt: new Date("2026-07-10T12:00:00.000Z") })],
        windowFrom: zonedDateBoundary("2026-07-01"),
        windowTo: zonedDateBoundary("2026-07-20", { endOfDay: true }),
    });

    assert.equal(result.daysOfCover, 0);
    assert.equal(Number.isFinite(result.averageDailyOutflow), true);
});

test("ferramenta de stock mantém company scope e expõe previsões atuais", async () => {
    const observedWhere = [];
    let rawCall = 0;
    const prisma = {
        $queryRaw: async () => {
            rawCall += 1;
            return rawCall === 1
                ? [{ settingCount: 1n, lowStockCount: 0n, highStockCount: 0n }]
                : [];
        },
        stockBalance: { findMany: async ({ where }) => {
            observedWhere.push(where);
            return [{
                itemId: "item-1", warehouseId: "warehouse-1", quantity: 3,
                item: { id: "item-1", sku: "P-001", name: "Produto" },
                warehouse: { id: "warehouse-1", code: "ARM", name: "Armazém" },
            }];
        } },
        stockMovement: { findMany: async ({ where }) => {
            observedWhere.push(where);
            return [
                movement({ quantity: 5, createdAt: new Date("2099-01-01T12:00:00.000Z") }),
                movement({ quantity: 5, createdAt: new Date("2099-01-15T12:00:00.000Z") }),
            ];
        } },
        stockAlertSetting: { findMany: async ({ where }) => {
            observedWhere.push(where);
            return [{ itemId: "item-1", warehouseId: "warehouse-1", minQuantity: 2, maxQuantity: 20, stoppedAfterDays: 90 }];
        } },
    };

    const result = await executeAiTool(prisma, {
        companyId: "company-1",
        toolName: "get_stock_risk_summary",
        args: { from: "2099-01-01", to: "2099-01-31", topN: 10 },
    });

    assert.equal(observedWhere.every((where) => where.companyId === "company-1"), true);
    assert.equal(result.metrics.forecasts.length, 1);
    assert.equal(result.metrics.forecasts[0].quality, "SUFFICIENT");
    assert.equal(result.counts.forecastCount, 1);
});

function defaultRules() {
    return Object.fromEntries(Object.entries(AI_RULE_REGISTRY).map(([ruleCode, rule]) => [ruleCode, {
        enabled: true,
        threshold: rule.defaultThreshold,
        version: rule.version,
        priority: rule.priority,
    }]));
}

function candidateMetrics(daysOfCover) {
    return {
        cashflow: { metrics: { closingBalanceCents: 1_000 }, quality: "COMPLETE", formula: "current treasury balance plus receivables less payables in the requested period", counts: {} },
        receivables: { metrics: { overdueCents: 0 }, quality: "COMPLETE", formula: "sum of open receivables after their due date in the requested period", counts: {} },
        margin: { metrics: { operatingMarginBps: 2_000 }, quality: "ACCOUNTING_COMPLETE", formula: "revenue from SNC class seven less operating costs from SNC class six", counts: {} },
        stock: {
            metrics: {
                lowStockCount: 0,
                highStockCount: 0,
                forecasts: [{
                    itemId: "item-1", warehouseId: "warehouse-1", itemSku: "P-001", warehouseName: "Armazém",
                    balance: 3, totalOutflow: 30, averageDailyOutflow: 1, daysOfCover,
                    observedDays: 30, outflowCount: 3, daysSinceLastMovement: 1,
                    quality: "SUFFICIENT", stoppedAfterDays: 90,
                    formula: "averageDailyOutflow = sum(outbound quantities) / observed calendar days; daysOfCover = max(balance, 0) / averageDailyOutflow",
                }],
            },
            quality: "COMPLETE",
            formula: "StockBalance versus configured thresholds and deterministic stock coverage",
            counts: {},
        },
    };
}

test("deduplicação mantém a identidade e muda fingerprint quando o risco muda materialmente", () => {
    const period = { fromDate: new Date("2026-04-16T00:00:00.000Z"), toDate: new Date("2026-07-14T22:59:59.999Z") };
    const first = buildAnalysisCandidates(candidateMetrics(12), defaultRules(), period).find((entry) => entry.ruleCode === "STOCKOUT_FORECAST");
    const repeated = buildAnalysisCandidates(candidateMetrics(12), defaultRules(), period).find((entry) => entry.ruleCode === "STOCKOUT_FORECAST");
    const worsened = buildAnalysisCandidates(candidateMetrics(5), defaultRules(), period).find((entry) => entry.ruleCode === "STOCKOUT_FORECAST");

    assert.equal(first.sourceId, "STOCKOUT_FORECAST:item-1:warehouse-1");
    assert.equal(repeated.sourceId, first.sourceId);
    assert.equal(repeated.fingerprint, first.fingerprint);
    assert.equal(worsened.sourceId, first.sourceId);
    assert.notEqual(worsened.fingerprint, first.fingerprint);
    assert.equal(first.evidence.metrics.daysOfCover, 12);
    assert.equal(first.evidence.quality, "SUFFICIENT");
});

test("janela móvel usa 90 dias civis inclusive através da mudança de hora", () => {
    const period = rollingAnalysisPeriod(new Date("2026-03-29T12:00:00.000Z"));
    assert.equal(toAiLocalDateKey(period.fromDate), "2025-12-30");
    assert.equal(toAiLocalDateKey(period.toDate), "2026-03-29");
});

test("bucket horário impede dois runs da mesma empresa e hora", async () => {
    const keys = new Set();
    const prisma = {
        company: { findMany: async () => [{ id: "company-1" }] },
        aiAnalysisRun: { create: async ({ data }) => {
            const key = `${data.companyId}:${data.scheduleBucket}`;
            if (keys.has(key)) {
                const error = new Error("duplicate");
                error.code = "P2002";
                throw error;
            }
            keys.add(key);
            return { id: "run-1", ...data };
        } },
    };
    const now = new Date("2026-07-14T10:30:00.000Z");

    assert.equal(await enqueueHourlyCompanyRuns(prisma, now), 1);
    assert.equal(await enqueueHourlyCompanyRuns(prisma, now), 0);
    assert.equal(keys.size, 1);
});
