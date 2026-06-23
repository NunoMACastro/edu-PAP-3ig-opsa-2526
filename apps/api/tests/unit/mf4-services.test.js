/**
 * @file Testes unitarios das regras criticas MF4.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    answerAiQuestion,
    generateAiInsights,
    generateAiSuggestions,
    generateSmartAlerts,
} from "../../src/modules/ai/aiService.js";
import { validateQuestionPayload } from "../../src/modules/ai/aiValidators.js";
import { validateReminderPayload } from "../../src/modules/reminders/reminderValidators.js";
import { createOperationalTask } from "../../src/modules/tasks/taskService.js";
import { validateTaskPayload } from "../../src/modules/tasks/taskValidators.js";
import { recordIntegrationLog } from "../../src/modules/integrations/integrationLogService.js";

test("BK-MF4-03: pergunta mutável é bloqueada pela IA read-only", () => {
    assert.throws(
        () => validateQuestionPayload({ question: "Aprova esta fatura agora" }),
        { code: "AI_READ_ONLY" },
    );
});

test("BK-MF4-06: lembrete rejeita tipo fora do contrato", () => {
    assert.throws(
        () =>
            validateReminderPayload({
                title: "IVA mensal",
                type: "RANDOM",
                dueAt: "2026-06-30",
            }),
        { code: "INVALID_REMINDER_TYPE" },
    );
});

test("BK-MF4-06/BK-MF4-07: datas inexistentes são rejeitadas sem normalização", () => {
    assert.throws(
        () =>
            validateReminderPayload({
                title: "IVA mensal",
                type: "TAX",
                dueAt: "2026-02-31",
            }),
        { code: "INVALID_REMINDER_DATE" },
    );

    assert.throws(
        () =>
            validateTaskPayload({
                title: "Validar fecho",
                dueAt: "2026-02-31",
            }),
        { code: "INVALID_TASK_DATE" },
    );
});

test("BK-MF4-01/BK-MF4-02: insights persistem fonte e sugestões não executam ações", async () => {
    const insightsUpserted = [];
    const suggestionsUpserted = [];
    const prisma = {
        operationalReportRun: {
            findFirst: async () => ({
                id: "report-1",
                revenueCents: 10000,
                marginCents: 1000,
            }),
        },
        executiveKpiRun: { findFirst: async () => null },
        saleDocument: { findMany: async () => [] },
        stockAlertSetting: { findMany: async () => [] },
        stockBalance: { findUnique: async () => null },
        stockMovement: { findFirst: async () => null },
        aiInsight: {
            upsert: async ({ create }) => {
                const row = { id: `insight-${insightsUpserted.length + 1}`, ...create };
                insightsUpserted.push(row);
                return row;
            },
            findMany: async () => insightsUpserted,
        },
        aiActionSuggestion: {
            upsert: async ({ create }) => {
                const row = { id: `suggestion-${suggestionsUpserted.length + 1}`, ...create };
                suggestionsUpserted.push(row);
                return row;
            },
        },
    };

    const insights = await generateAiInsights(prisma, {
        companyId: "company-1",
        userId: "user-1",
        fromDate: new Date("2026-01-01"),
        toDate: new Date("2026-01-31"),
    });
    const suggestions = await generateAiSuggestions(prisma, {
        companyId: "company-1",
        userId: "user-1",
    });

    assert.equal(insights[0].sourceType, "OperationalReportRun");
    assert.equal(insights[0].suggestedAction.includes("Rever"), true);
    assert.equal(suggestions[0].actionType, "REVIEW_PRICING");
    assert.equal("execute" in suggestions[0], false);
});

test("BK-MF4-01: insights de stock usam alertas MF2 calculados", async () => {
    const insightsUpserted = [];
    const prisma = {
        operationalReportRun: { findFirst: async () => null },
        executiveKpiRun: { findFirst: async () => null },
        saleDocument: { findMany: async () => [] },
        stockAlertSetting: {
            findMany: async () => [
                {
                    itemId: "item-1",
                    warehouseId: "warehouse-1",
                    minQuantity: 5,
                    maxQuantity: null,
                    stoppedAfterDays: 90,
                    item: { id: "item-1", sku: "SKU-1", costCents: 2500 },
                    warehouse: { id: "warehouse-1", name: "Armazem A" },
                },
            ],
        },
        stockBalance: { findUnique: async () => ({ quantity: 2 }) },
        stockMovement: { findFirst: async () => ({ createdAt: new Date() }) },
        aiInsight: {
            upsert: async ({ create }) => {
                const row = { id: `insight-${insightsUpserted.length + 1}`, ...create };
                insightsUpserted.push(row);
                return row;
            },
        },
    };

    const insights = await generateAiInsights(prisma, {
        companyId: "company-1",
        userId: "user-1",
        fromDate: new Date("2026-01-01"),
        toDate: new Date("2026-01-31"),
    });

    assert.equal(insights.length, 1);
    assert.equal(insights[0].type, "LOW_STOCK_RISK");
    assert.equal(insights[0].sourceType, "StockAlertSetting");
    assert.match(insights[0].explanation, /StockBalance\.quantity/);
});

test("BK-MF4-04: alertas inteligentes materializam risco de rutura calculado", async () => {
    const alertsUpserted = [];
    const prisma = {
        cashflowForecastRun: { findFirst: async () => null },
        stockAlertSetting: {
            findMany: async () => [
                {
                    itemId: "item-1",
                    warehouseId: "warehouse-1",
                    minQuantity: 10,
                    maxQuantity: null,
                    stoppedAfterDays: 90,
                    item: { id: "item-1", sku: "SKU-1", costCents: 2500 },
                    warehouse: { id: "warehouse-1", name: "Armazem A" },
                },
            ],
        },
        stockBalance: { findUnique: async () => ({ quantity: 0 }) },
        stockMovement: { findFirst: async () => null },
        smartAlert: {
            upsert: async ({ create }) => {
                const row = { id: `alert-${alertsUpserted.length + 1}`, ...create };
                alertsUpserted.push(row);
                return row;
            },
        },
    };

    const alerts = await generateSmartAlerts(prisma, {
        companyId: "company-1",
        userId: "user-1",
        fromDate: new Date("2026-01-01"),
        toDate: new Date("2026-01-31"),
    });

    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].type, "STOCK_RUPTURE_RISK");
    assert.equal(alerts[0].severity, "CRITICAL");
    assert.match(alerts[0].message, /abaixo do minimo/);
});

test("BK-MF4-03: resposta de IA inclui fontes internas", async () => {
    const prisma = {
        operationalReportRun: {
            findFirst: async () => ({ id: "report-1", marginCents: 2500, stockValueCents: 1000 }),
        },
        executiveKpiRun: { findFirst: async () => null },
        cashflowForecastRun: { findFirst: async () => null },
        aiQuestionRun: {
            create: async ({ data }) => ({ id: "question-1", ...data }),
        },
    };

    const result = await answerAiQuestion(prisma, {
        companyId: "company-1",
        userId: "user-1",
        body: { question: "Qual e a margem operacional recente?" },
    });

    assert.equal(result.intent, "margem");
    assert.equal(result.sources[0].type, "OperationalReportRun");
});

test("BK-MF4-07: tarefa não pode ser atribuída fora da empresa ativa", async () => {
    const prisma = {
        companyMembership: { findFirst: async () => null },
    };

    await assert.rejects(
        () =>
            createOperationalTask(prisma, {
                companyId: "company-1",
                userId: "user-1",
                body: {
                    title: "Validar prazo",
                    dueAt: "2026-06-30",
                    assignedToId: "user-out",
                },
            }),
        { code: "TASK_ASSIGNEE_NOT_IN_COMPANY" },
    );
});

test("BK-MF4-10: logs de integração redigem mensagens sensíveis", async () => {
    const created = [];
    const prisma = {
        integrationLog: {
            create: async ({ data }) => {
                created.push(data);
                return { id: "log-1", ...data };
            },
        },
    };

    const log = await recordIntegrationLog(prisma, {
        companyId: "company-1",
        userId: "user-1",
        integrationType: "SAFT",
        operation: "EXPORT",
        status: "EXPORTED",
        fileName: "/tmp/saft.xml",
        message: "token secreto exposto",
    });

    assert.equal(log.fileName, "saft.xml");
    assert.equal(log.message.includes("redigida"), true);
});
