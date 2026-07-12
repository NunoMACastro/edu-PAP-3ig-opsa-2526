/**
 * @file Regressões de atomicidade e minimização da auditoria dos fluxos AI.
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
    generateAiInsights,
    generateAiSuggestions,
    generateSmartAlerts,
} from "../../src/modules/ai/aiService.js";

const RANGE_INPUT = Object.freeze({
    companyId: "company-ai-audit",
    userId: "user-ai-audit",
    fromDate: new Date("2026-01-01T00:00:00.000Z"),
    toDate: new Date("2026-01-31T00:00:00.000Z"),
});

/**
 * Simula commit/rollback de uma interactive transaction sem escrever em disco.
 * Só transfere writes e auditorias para o estado confirmado se o callback
 * terminar integralmente, reproduzindo a fronteira que os services devem usar.
 *
 * @param {object} prisma - Double com as leituras externas do fluxo.
 * @param {{ modelName: string, method?: "upsert" | "create", failAudit?: boolean, failWriteAt?: number }} options - Falhas injetáveis.
 * @returns {{ committed: object[], audits: object[], events: string[], getWriteAttempts(): number }} Estado observável.
 */
function attachTransactionalWriter(prisma, options) {
    const committed = [];
    const audits = [];
    const events = [];
    let writeAttempts = 0;
    const method = options.method ?? "upsert";

    prisma.$transaction = async (callback) => {
        const staged = [];
        const stagedAudits = [];
        const write = async (args) => {
            writeAttempts += 1;
            events.push(`write:${writeAttempts}`);
            if (writeAttempts === options.failWriteAt) {
                throw new Error("AI_UPSERT_FAILED");
            }
            const data = args.create ?? args.data;
            const row = {
                id: `${options.modelName}-${writeAttempts}`,
                ...data,
            };
            staged.push(row);
            return row;
        };
        const tx = {
            [options.modelName]: { [method]: write },
            auditLog: {
                async create({ data }) {
                    events.push("audit");
                    if (options.failAudit) {
                        throw new Error("AUDIT_WRITE_FAILED");
                    }
                    const audit = { id: `audit-${stagedAudits.length + 1}`, ...data };
                    stagedAudits.push(audit);
                    return audit;
                },
            },
        };

        const result = await callback(tx);
        committed.push(...staged);
        audits.push(...stagedAudits);
        return result;
    };

    return {
        committed,
        audits,
        events,
        getWriteAttempts: () => writeAttempts,
    };
}

/**
 * Cria duas fontes explicáveis para provar rollback após um upsert parcial.
 *
 * @returns {object} Prisma de leitura para geração de insights.
 */
function insightPrisma() {
    return {
        operationalReportRun: {
            findFirst: async () => ({
                id: "report-sensitive-id",
                revenueCents: 10_000,
                marginCents: 1_000,
            }),
        },
        executiveKpiRun: { findFirst: async () => null },
        saleDocument: {
            findMany: async () => [
                {
                    id: "sale-sensitive-id",
                    issuedAt: new Date("2026-01-01T00:00:00.000Z"),
                    dueDate: new Date("2026-01-05T00:00:00.000Z"),
                    totalCents: 5_000,
                    amountPaidCents: 0,
                },
            ],
        },
        stockAlertSetting: { findMany: async () => [] },
    };
}

/**
 * Cria dois insights válidos para o fluxo recomendatório.
 *
 * @returns {object} Prisma de leitura para geração de sugestões.
 */
function suggestionPrisma() {
    return {
        aiInsight: {
            findMany: async () => [
                {
                    id: "insight-sensitive-1",
                    type: "LOW_MARGIN",
                    suggestedAction: "Rever artigos com margem reduzida",
                    explanation:
                        "A regra compara margem operacional MVP com receita do relatorio MF3.",
                    sourceType: "OperationalReportRun",
                    sourceId: "report-sensitive-id",
                    sourceLabel: "Relatorio operacional MF3",
                },
                {
                    id: "insight-sensitive-2",
                    type: "CASH_CONVERSION_RISK",
                    suggestedAction: "Rever tesouraria antes de assumir nova despesa",
                    explanation:
                        "A regra compara PMR e PMP da empresa para apoiar decisao humana.",
                    sourceType: "ExecutiveKpiRun",
                    sourceId: "kpi-sensitive-id",
                    sourceLabel: "KPIs executivos MF3",
                },
            ],
        },
    };
}

/**
 * Cria dois alertas candidatos: cashflow negativo e stock baixo.
 *
 * @returns {object} Prisma de leitura para smart alerts.
 */
function alertPrisma() {
    return {
        cashflowForecastRun: {
            findFirst: async () => ({
                id: "forecast-sensitive-id",
                closingBalanceCents: -10_000,
            }),
        },
        stockAlertSetting: {
            findMany: async () => [
                {
                    itemId: "item-sensitive-id",
                    warehouseId: "warehouse-sensitive-id",
                    minQuantity: 5,
                    maxQuantity: null,
                    stoppedAfterDays: 90,
                    item: {
                        id: "item-sensitive-id",
                        sku: "SKU-SECRET",
                        costCents: 100,
                    },
                    warehouse: {
                        id: "warehouse-sensitive-id",
                        name: "Armazem privado",
                    },
                },
            ],
        },
        stockBalance: { findUnique: async () => ({ quantity: 0 }) },
        stockMovement: { findFirst: async () => null },
    };
}

/**
 * Devolve os fluxos legados persistentes ainda cobertos por regressão.
 *
 * @returns {Array<object>} Casos independentes para testes parametrizados.
 */
function auditCases() {
    return [
        {
            name: "insights",
            prisma: insightPrisma(),
            modelName: "aiInsight",
            action: "AI_INSIGHTS_GENERATED",
            details: { generatedCount: 2 },
            run: (prisma) => generateAiInsights(prisma, RANGE_INPUT),
        },
        {
            name: "suggestions",
            prisma: suggestionPrisma(),
            modelName: "aiActionSuggestion",
            action: "AI_SUGGESTIONS_GENERATED",
            details: { generatedCount: 2 },
            run: (prisma) =>
                generateAiSuggestions(prisma, {
                    companyId: RANGE_INPUT.companyId,
                    userId: RANGE_INPUT.userId,
                }),
        },
        {
            name: "alerts",
            prisma: alertPrisma(),
            modelName: "smartAlert",
            action: "AI_ALERTS_GENERATED",
            details: { generatedCount: 2 },
            run: (prisma) => generateSmartAlerts(prisma, RANGE_INPUT),
        },
    ];
}

test("P2-013: fluxos AI legados confirmam writes e auditoria minimizada juntos", async () => {
    for (const flow of auditCases()) {
        const state = attachTransactionalWriter(flow.prisma, flow);
        await flow.run(flow.prisma);

        assert.ok(state.committed.length > 0, `${flow.name} sem write confirmado`);
        assert.equal(state.audits.length, 1, `${flow.name} sem auditoria única`);
        assert.equal(state.events.at(-1), "audit");
        assert.equal(state.audits[0].companyId, RANGE_INPUT.companyId);
        assert.equal(state.audits[0].userId, RANGE_INPUT.userId);
        assert.equal(state.audits[0].action, flow.action);
        assert.deepEqual(state.audits[0].details, flow.details);

        const serializedAudit = JSON.stringify(state.audits[0]);
        for (const forbidden of [
            "Qual e a margem operacional recente?",
            "25.00 EUR",
            "report-sensitive-id",
            "sale-sensitive-id",
            "kpi-sensitive-id",
            "forecast-sensitive-id",
            "SKU-SECRET",
            "Armazem privado",
        ]) {
            assert.equal(
                serializedAudit.includes(forbidden),
                false,
                `${flow.name} expôs conteúdo sensível no AuditLog`,
            );
        }
    }
});

test("P2-013: falha de auditoria reverte cada fluxo AI persistente", async () => {
    for (const flow of auditCases()) {
        const state = attachTransactionalWriter(flow.prisma, {
            ...flow,
            failAudit: true,
        });
        await assert.rejects(() => flow.run(flow.prisma), /AUDIT_WRITE_FAILED/);
        assert.ok(state.getWriteAttempts() > 0, `${flow.name} não chegou ao write`);
        assert.deepEqual(state.committed, [], `${flow.name} confirmou write órfão`);
        assert.deepEqual(state.audits, [], `${flow.name} confirmou audit incompleto`);
    }
});

test("P2-013: falha no segundo upsert reverte o primeiro sem audit enganador", async () => {
    for (const flow of auditCases().filter((candidate) => candidate.method !== "create")) {
        const state = attachTransactionalWriter(flow.prisma, {
            ...flow,
            failWriteAt: 2,
        });
        await assert.rejects(() => flow.run(flow.prisma), /AI_UPSERT_FAILED/);
        assert.equal(state.getWriteAttempts(), 2, `${flow.name} não provou falha parcial`);
        assert.deepEqual(state.committed, [], `${flow.name} confirmou primeiro upsert`);
        assert.deepEqual(state.audits, [], `${flow.name} criou audit após falha parcial`);
        assert.equal(state.events.includes("audit"), false);
    }
});
