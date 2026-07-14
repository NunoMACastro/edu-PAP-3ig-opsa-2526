/**
 * @file Pipeline canónica de análises, insights, sugestões e alertas OPSA.
 *
 * Este módulo concentra validação de scopes, lifecycle, leases, autorização
 * otimista, qualidade de fontes e auditoria funcional. Nenhuma função executa
 * ações contabilísticas: os resultados são exclusivamente informativos.
 */

import crypto from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";
import { recordAuditLog } from "../audit/auditLogService.js";
import { assertAiRecommendationOnly } from "./aiGovernancePolicy.js";
import { assertExplainableInsight } from "./aiExplainability.js";
import { executeAiTool, toAiLocalDateKey, validateMetricPeriod } from "./aiMetricCatalog.js";
import { assertAiSourceQuality } from "./aiSourceGuardrails.js";

export const AI_ANALYSIS_SCOPES = Object.freeze(["INSIGHTS", "SUGGESTIONS", "ALERTS"]);
const AI_ANALYSIS_SCOPE_SET = new Set(AI_ANALYSIS_SCOPES);
const DEFAULT_LEASE_MS = 5 * 60 * 1_000;
const DEFAULT_MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = Object.freeze([5_000, 30_000, 120_000]);

export const AI_RULE_REGISTRY = Object.freeze({
    NEGATIVE_CASHFLOW: Object.freeze({ version: 2, defaultThreshold: 0, min: -100_000_000, max: 0, priority: 100 }),
    OVERDUE_RECEIVABLES: Object.freeze({ version: 2, defaultThreshold: 50_000, min: 10_000, max: 10_000_000, priority: 80 }),
    LOW_OPERATING_MARGIN: Object.freeze({ version: 2, defaultThreshold: 1_000, min: -10_000, max: 5_000, priority: 70 }),
    STOCK_RISK: Object.freeze({ version: 2, defaultThreshold: 1, min: 1, max: 100, priority: 60 }),
    STOCKOUT_FORECAST: Object.freeze({ version: 1, defaultThreshold: 14, min: 1, max: 180, priority: 90 }),
    SLOW_MOVING_STOCK: Object.freeze({ version: 1, defaultThreshold: 90, min: 14, max: 365, priority: 50 }),
});

const STATUS_TRANSITIONS = Object.freeze({
    aiInsight: Object.freeze({
        OPEN: new Set(["ACKNOWLEDGED", "RESOLVED", "DISMISSED"]),
        ACKNOWLEDGED: new Set(["RESOLVED", "DISMISSED"]),
        RESOLVED: new Set(),
        DISMISSED: new Set(),
    }),
    smartAlert: Object.freeze({
        OPEN: new Set(["ACKNOWLEDGED", "RESOLVED", "DISMISSED"]),
        ACKNOWLEDGED: new Set(["RESOLVED", "DISMISSED"]),
        RESOLVED: new Set(),
        DISMISSED: new Set(),
    }),
    aiActionSuggestion: Object.freeze({
        OPEN: new Set(["ACCEPTED", "DISMISSED"]),
        ACCEPTED: new Set(["DONE", "DISMISSED"]),
        DISMISSED: new Set(),
        DONE: new Set(),
    }),
});

function fingerprint(ruleCode, materialValue) {
    return crypto.createHash("sha256").update(`${ruleCode}:${materialValue}`).digest("hex");
}

function severityFromScore(score) {
    if (score >= 90) return "CRITICAL";
    if (score >= 60) return "WARNING";
    return "INFO";
}

function parsePage(query = {}) {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
        throw httpError(400, "INVALID_PAGINATION", "Paginação inválida");
    }
    return { page, pageSize, skip: (page - 1) * pageSize };
}

function validatedThreshold(ruleCode, rawValue) {
    const rule = AI_RULE_REGISTRY[ruleCode];
    const value = rawValue ?? rule.defaultThreshold;
    if (!Number.isFinite(value) || value < rule.min || value > rule.max) {
        throw httpError(400, "INVALID_AI_RULE_THRESHOLD", `Threshold inválido para ${ruleCode}`);
    }
    return value;
}

/** Valida e normaliza scopes sem aceitar dependências implícitas. */
export function validateAnalysisScopes(rawScopes) {
    const scopes = rawScopes === undefined ? [...AI_ANALYSIS_SCOPES] : rawScopes;
    if (!Array.isArray(scopes) || scopes.length === 0) {
        throw httpError(400, "INVALID_AI_ANALYSIS_SCOPES", "É necessário indicar pelo menos um scope de análise");
    }
    const unique = [...new Set(scopes.map((scope) => String(scope).trim().toUpperCase()))];
    if (unique.some((scope) => !AI_ANALYSIS_SCOPE_SET.has(scope))) {
        throw httpError(400, "INVALID_AI_ANALYSIS_SCOPES", "Scope de análise desconhecido");
    }
    if (unique.includes("SUGGESTIONS") && !unique.includes("INSIGHTS")) {
        throw httpError(400, "INVALID_AI_ANALYSIS_SCOPES", "SUGGESTIONS exige o scope INSIGHTS");
    }
    return AI_ANALYSIS_SCOPES.filter((scope) => unique.includes(scope));
}

/** Cria um run e audita atomicamente pedidos humanos. */
export async function createAnalysisRun(prisma, input) {
    const scopes = validateAnalysisScopes(input.scopes);
    const data = {
        companyId: input.companyId,
        requestedById: input.userId ?? null,
        origin: input.origin ?? "USER",
        status: "QUEUED",
        fromDate: input.fromDate,
        toDate: input.toDate,
        scopes,
        scheduleBucket: input.scheduleBucket ?? null,
    };
    if (!input.userId) return prisma.aiAnalysisRun.create({ data });
    return prisma.$transaction(async (tx) => {
        const run = await tx.aiAnalysisRun.create({ data });
        await recordAuditLog(tx, {
            companyId: input.companyId,
            userId: input.userId,
            action: "AI_ANALYSIS_RUN_CREATED",
            entity: "AiAnalysisRun",
            entityId: run.id,
            details: { scopes, from: input.fromDate, to: input.toDate },
        });
        return run;
    });
}

export async function getAnalysisRun(prisma, { companyId, runId }) {
    const run = await prisma.aiAnalysisRun.findFirst({ where: { id: runId, companyId } });
    if (!run) throw httpError(404, "AI_ANALYSIS_RUN_NOT_FOUND", "Execução não encontrada");
    return run;
}

/** Devolve explicação company-scoped sem invocar a pipeline MF4 legada. */
export async function explainAiInsight(prisma, input) {
    const insight = await prisma.aiInsight.findFirst({ where: { id: input.insightId, companyId: input.companyId } });
    if (!insight) throw httpError(404, "AI_INSIGHT_NOT_FOUND", "Insight não encontrado");
    assertExplainableInsight(insight);
    return {
        id: insight.id,
        title: insight.title,
        explanation: insight.explanation,
        source: { type: insight.sourceType, id: insight.sourceId, label: insight.sourceLabel },
        guardrail: "A IA explica e recomenda; não executa alterações automaticamente.",
    };
}

/** Reclama um run queued ou recupera um lease expirado sem dupla execução. */
export async function claimNextAnalysisRun(prisma, workerId, options = {}) {
    const now = options.now ?? new Date();
    const leaseMs = options.leaseMs ?? DEFAULT_LEASE_MS;
    const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    return prisma.$transaction(async (tx) => {
        const claimable = {
            attempts: { lt: maxAttempts },
            OR: [
                { status: "QUEUED", nextAttemptAt: { lte: now } },
                { status: "RUNNING", leaseExpiresAt: { lte: now } },
            ],
        };
        const candidate = await tx.aiAnalysisRun.findFirst({
            where: claimable,
            orderBy: [{ nextAttemptAt: "asc" }, { createdAt: "asc" }],
        });
        if (!candidate) {
            await tx.aiAnalysisRun.updateMany({
                where: {
                    status: "RUNNING",
                    attempts: { gte: maxAttempts },
                    leaseExpiresAt: { lte: now },
                },
                data: {
                    status: "FAILED",
                    errorCode: "AI_ANALYSIS_RETRIES_EXHAUSTED",
                    completedAt: now,
                    leaseExpiresAt: null,
                    claimedBy: null,
                },
            });
            return null;
        }
        const claimed = await tx.aiAnalysisRun.updateMany({
            where: { id: candidate.id, ...claimable },
            data: {
                status: "RUNNING",
                claimedBy: workerId,
                startedAt: candidate.startedAt ?? now,
                lastHeartbeatAt: now,
                leaseExpiresAt: new Date(now.getTime() + leaseMs),
                attempts: { increment: 1 },
                errorCode: null,
            },
        });
        if (claimed.count !== 1) return null;
        return tx.aiAnalysisRun.findUnique({ where: { id: candidate.id } });
    });
}

/** Renova o lease apenas se o worker ainda for o proprietário. */
export async function heartbeatAnalysisRun(prisma, input) {
    const now = input.now ?? new Date();
    const result = await prisma.aiAnalysisRun.updateMany({
        where: { id: input.runId, status: "RUNNING", claimedBy: input.workerId },
        data: {
            lastHeartbeatAt: now,
            leaseExpiresAt: new Date(now.getTime() + (input.leaseMs ?? DEFAULT_LEASE_MS)),
        },
    });
    if (result.count !== 1) throw httpError(409, "AI_RUN_LEASE_LOST", "A execução deixou de pertencer a este worker");
}

async function companyRuleConfig(prisma, companyId) {
    const configured = await prisma.aiRuleSetting.findMany({ where: { companyId } });
    const byCode = new Map(configured.map((entry) => [entry.ruleCode, entry]));
    const result = {};
    for (const [code, rule] of Object.entries(AI_RULE_REGISTRY)) {
        const setting = byCode.get(code);
        result[code] = {
            enabled: setting?.enabled ?? true,
            threshold: validatedThreshold(code, setting?.parameters?.threshold ?? rule.defaultThreshold),
            version: rule.version,
            priority: rule.priority,
        };
    }
    return result;
}

export function buildAnalysisCandidates(metrics, rules, period) {
    const candidates = [];
    const add = (ruleCode, condition, value, score, content, evidence, identity = {}) => {
        const rule = rules[ruleCode];
        if (!rule.enabled || !condition) return;
        const materialBucket = identity.materialBucket
            ?? Math.round(Number(value ?? 0) / Math.max(1, Math.abs(rule.threshold) || 10_000));
        const fingerprintMaterial = identity.materialKey === undefined
            ? materialBucket
            : `${identity.materialKey}:${materialBucket}`;
        const fp = fingerprint(ruleCode, fingerprintMaterial);
        candidates.push({
            ruleCode,
            ruleVersion: rule.version,
            fingerprint: fp,
            sourceType: "AI_METRIC_V2",
            sourceId: identity.sourceId ?? `${ruleCode}:${fp.slice(0, 16)}`,
            sourceLabel: content.sourceLabel,
            score: Math.min(100, Math.max(0, score)),
            priority: rule.priority,
            severity: severityFromScore(score),
            periodFrom: period.fromDate,
            periodTo: period.toDate,
            asOf: new Date(),
            evidence,
            ...content,
        });
    };
    const cashflow = metrics.cashflow.metrics;
    add("NEGATIVE_CASHFLOW", metrics.cashflow.quality === "COMPLETE" && cashflow.closingBalanceCents < rules.NEGATIVE_CASHFLOW.threshold, cashflow.closingBalanceCents, 95, {
        type: "NEGATIVE_CASHFLOW", title: "Tesouraria projetada negativa",
        summary: "A projeção determinística termina abaixo de zero.",
        explanation: metrics.cashflow.formula,
        suggestedAction: "Rever vencimentos e necessidades de liquidez antes de decidir.",
        sourceLabel: "Resumo canónico de tesouraria",
    }, metrics.cashflow);
    const receivables = metrics.receivables.metrics;
    add("OVERDUE_RECEIVABLES", receivables.overdueCents > rules.OVERDUE_RECEIVABLES.threshold, receivables.overdueCents, 80, {
        type: "CUSTOMER_COLLECTION_RISK", title: "Saldos de clientes vencidos",
        summary: "O valor vencido ultrapassa o threshold configurado.",
        explanation: metrics.receivables.formula,
        suggestedAction: "Priorizar validação dos documentos vencidos e contacto autorizado.",
        sourceLabel: "Resumo canónico de recebíveis",
    }, metrics.receivables);
    const margin = metrics.margin.metrics;
    add("LOW_OPERATING_MARGIN", margin.operatingMarginBps !== null && margin.operatingMarginBps < rules.LOW_OPERATING_MARGIN.threshold, margin.operatingMarginBps, 70, {
        type: "LOW_MARGIN", title: "Margem operacional abaixo do limite",
        summary: "A margem calculada sobre contas SNC está abaixo do threshold.",
        explanation: metrics.margin.formula,
        suggestedAction: "Rever custos e preços sem executar alterações automáticas.",
        sourceLabel: "Resumo contabilístico canónico",
    }, metrics.margin);
    const stock = metrics.stock.metrics;
    const stockRiskCount = stock.lowStockCount + stock.highStockCount;
    add("STOCK_RISK", metrics.stock.quality !== "INSUFFICIENT_DATA" && stockRiskCount >= rules.STOCK_RISK.threshold, stockRiskCount, 65, {
        type: "STOCK_RISK", title: "Riscos de stock detetados",
        summary: "Existem artigos fora dos thresholds de stock configurados.",
        explanation: metrics.stock.formula,
        suggestedAction: "Validar reposição, transferência ou excesso antes de agir.",
        sourceLabel: "Resumo canónico de stock",
    }, metrics.stock);
    for (const forecast of stock.forecasts ?? []) {
        const sourceLabel = `${forecast.itemSku} · ${forecast.warehouseName ?? forecast.warehouseCode}`;
        const commonMetrics = {
            itemId: forecast.itemId,
            warehouseId: forecast.warehouseId,
            balance: forecast.balance,
            totalOutflow: forecast.totalOutflow,
            averageDailyOutflow: forecast.averageDailyOutflow,
            daysOfCover: forecast.daysOfCover,
            observedDays: forecast.observedDays,
            outflowCount: forecast.outflowCount,
            daysSinceLastMovement: forecast.daysSinceLastMovement,
        };
        const identity = {
            sourceId: `STOCKOUT_FORECAST:${forecast.itemId}:${forecast.warehouseId}`,
            materialKey: `${forecast.itemId}:${forecast.warehouseId}`,
            materialBucket: forecast.daysOfCover === null ? "NO_COVER" : Math.floor(forecast.daysOfCover / 3),
        };
        const forecastEvidence = {
            metrics: commonMetrics,
            formula: forecast.formula,
            period: { from: period.fromDate, to: period.toDate },
            quality: forecast.quality,
            limitations: [],
        };
        const coverDays = forecast.daysOfCover;
        const stockoutScore = coverDays !== null && coverDays <= 3 ? 95 : coverDays !== null && coverDays <= 7 ? 85 : 75;
        add(
            "STOCKOUT_FORECAST",
            forecast.quality === "SUFFICIENT" && coverDays !== null && coverDays <= rules.STOCKOUT_FORECAST.threshold,
            coverDays,
            stockoutScore,
            {
                type: "STOCKOUT_FORECAST",
                title: "Risco de rutura de stock",
                summary: `${sourceLabel} tem cobertura estimada de ${coverDays ?? "—"} dias.`,
                explanation: `A cobertura resulta da fórmula ${forecast.formula}. Foram observados ${forecast.observedDays} dias, ${forecast.outflowCount} movimentos de saída e uma saída média diária de ${forecast.averageDailyOutflow}.`,
                suggestedAction: "Rever a necessidade de reposição com um responsável antes de criar qualquer documento.",
                sourceLabel,
            },
            forecastEvidence,
            identity,
        );
        const stoppedAfterDays = forecast.stoppedAfterDays ?? rules.SLOW_MOVING_STOCK.threshold;
        add(
            "SLOW_MOVING_STOCK",
            forecast.quality === "NO_OUTFLOW"
                && forecast.balance > 0
                && forecast.daysSinceLastMovement !== null
                && forecast.daysSinceLastMovement >= stoppedAfterDays,
            forecast.daysSinceLastMovement,
            60,
            {
                type: "SLOW_MOVING_STOCK",
                title: "Stock sem rotação recente",
                summary: `${sourceLabel} mantém saldo sem saídas recentes.`,
                explanation: `O artigo mantém saldo ${forecast.balance} e não apresenta saídas na janela observada; o último movimento ocorreu há ${forecast.daysSinceLastMovement} dias e o limite configurado é ${stoppedAfterDays} dias.`,
                suggestedAction: "Rever a rotação e o nível de stock com um responsável, sem alterar automaticamente preços ou quantidades.",
                sourceLabel,
            },
            forecastEvidence,
            { ...identity, sourceId: `SLOW_MOVING_STOCK:${forecast.itemId}:${forecast.warehouseId}`, materialBucket: Math.floor(forecast.daysSinceLastMovement / 30) },
        );
    }
    return candidates;
}

function actionTypeForCandidate(candidate) {
    return candidate.type === "LOW_MARGIN" ? "REVIEW_PRICING"
        : candidate.type === "CUSTOMER_COLLECTION_RISK" ? "NEGOTIATE_CUSTOMER"
            : ["STOCK_RISK", "STOCKOUT_FORECAST", "SLOW_MOVING_STOCK"].includes(candidate.type) ? "REVIEW_STOCK"
                : "REVIEW_CASHFLOW";
}

function validateCandidate(candidate, companyId) {
    if (typeof candidate.explanation !== "string" || candidate.explanation.trim().length < 40) {
        throw httpError(422, "AI_INSIGHT_NOT_EXPLAINABLE", "Insight sem explicação suficiente");
    }
    const actionType = assertAiRecommendationOnly({ actionType: actionTypeForCandidate(candidate) });
    const sourceQuality = assertAiSourceQuality({
        companyId,
        sourceType: candidate.sourceType,
        sourceId: candidate.sourceId,
        sourceLabel: candidate.sourceLabel,
        explanation: candidate.explanation,
        actionType,
        evidence: candidate.evidence,
    });
    return { actionType, sourceQuality };
}

async function persistLifecycle(prisma, run, candidates) {
    const scopes = validateAnalysisScopes(run.scopes ?? undefined);
    return prisma.$transaction(async (tx) => {
        const now = new Date();
        const activeSourceIds = [];
        let insightCount = 0;
        let suggestionCount = 0;
        let alertCount = 0;
        for (const candidate of candidates) {
            activeSourceIds.push(candidate.sourceId);
            const prepared = validateCandidate(candidate, run.companyId);
            let insight = null;
            if (scopes.includes("INSIGHTS")) {
                const insightWhere = { companyId_type_sourceType_sourceId: { companyId: run.companyId, type: candidate.type, sourceType: candidate.sourceType, sourceId: candidate.sourceId } };
                insight = await tx.aiInsight.upsert({
                    where: insightWhere,
                    create: { companyId: run.companyId, generatedById: run.requestedById, origin: run.origin, status: "OPEN", firstDetectedAt: now, lastDetectedAt: now, occurrenceCount: 1, ...candidate },
                    update: { generatedById: run.requestedById, origin: run.origin, lastDetectedAt: now, occurrenceCount: { increment: 1 }, ...candidate },
                });
                insightCount += 1;
            }
            if (scopes.includes("SUGGESTIONS") && insight) {
                await tx.aiActionSuggestion.upsert({
                    where: { companyId_insightId_actionType: { companyId: run.companyId, insightId: insight.id, actionType: prepared.actionType } },
                    create: { companyId: run.companyId, insightId: insight.id, actionType: prepared.actionType, title: candidate.suggestedAction, rationale: candidate.explanation, sourceLabel: candidate.sourceLabel, status: "OPEN", createdById: run.requestedById ?? insight.generatedById },
                    update: { title: candidate.suggestedAction, rationale: candidate.explanation, sourceLabel: candidate.sourceLabel },
                });
                suggestionCount += 1;
            }
            if (scopes.includes("ALERTS")) {
                const alertData = {
                    type: candidate.type, severity: candidate.severity, title: candidate.title, message: candidate.summary,
                    sourceType: candidate.sourceType, sourceId: candidate.sourceId, sourceLabel: candidate.sourceLabel,
                    ruleCode: candidate.ruleCode, ruleVersion: candidate.ruleVersion, fingerprint: candidate.fingerprint,
                    score: candidate.score, priority: candidate.priority, evidence: candidate.evidence,
                    periodFrom: candidate.periodFrom, periodTo: candidate.periodTo, asOf: candidate.asOf,
                };
                const alertWhere = { companyId_type_sourceType_sourceId: { companyId: run.companyId, type: candidate.type, sourceType: candidate.sourceType, sourceId: candidate.sourceId } };
                await tx.smartAlert.upsert({
                    where: alertWhere,
                    create: { companyId: run.companyId, generatedById: run.requestedById, origin: run.origin, status: "OPEN", firstDetectedAt: now, lastDetectedAt: now, occurrenceCount: 1, ...alertData },
                    update: { generatedById: run.requestedById, origin: run.origin, lastDetectedAt: now, occurrenceCount: { increment: 1 }, ...alertData },
                });
                alertCount += 1;
            }
        }
        const missingWhere = { companyId: run.companyId, status: { in: ["OPEN", "ACKNOWLEDGED"] }, sourceType: "AI_METRIC_V2", ...(activeSourceIds.length ? { sourceId: { notIn: activeSourceIds } } : {}) };
        const resolvedInsights = scopes.includes("INSIGHTS")
            ? await tx.aiInsight.updateMany({ where: missingWhere, data: { status: "RESOLVED", resolvedAt: now } })
            : { count: 0 };
        const resolvedAlerts = scopes.includes("ALERTS")
            ? await tx.smartAlert.updateMany({ where: missingWhere, data: { status: "RESOLVED", resolvedAt: now } })
            : { count: 0 };
        if (scopes.includes("ALERTS")) {
            const resolvedAlertRows = await tx.smartAlert.findMany({
                where: { companyId: run.companyId, sourceType: "AI_METRIC_V2", status: "RESOLVED" },
                select: { id: true },
            });
            await tx.inAppNotification.updateMany({
                where: { companyId: run.companyId, sourceType: "SmartAlert", sourceId: { in: resolvedAlertRows.map((alert) => alert.id) }, status: "OPEN" },
                data: { status: "RESOLVED", resolvedAt: now },
            });
        }
        return { insightCount, suggestionCount, alertCount, resolvedInsights: resolvedInsights.count, resolvedAlerts: resolvedAlerts.count };
    });
}

/** Processa um run reclamado e requeue/termina falhas de forma previsível. */
export async function processAnalysisRun(prisma, run, options = {}) {
    const heartbeat = options.heartbeat ?? (async () => {});
    const toolBudgetMs = options.toolBudgetMs ?? 5_000;
    const toolDurationsMs = {};
    const executeMeasured = async (toolName, args) => {
        const startedAt = Date.now();
        const result = await executeAiTool(prisma, { companyId: run.companyId, toolName, args });
        const durationMs = Date.now() - startedAt;
        toolDurationsMs[toolName] = durationMs;
        options.onToolMetric?.({ tool: toolName, durationMs, withinBudget: durationMs <= toolBudgetMs });
        if (durationMs > toolBudgetMs) throw httpError(503, "AI_TOOL_BUDGET_EXCEEDED", "Uma ferramenta analítica excedeu o orçamento operacional");
        return result;
    };
    try {
        const args = { from: toAiLocalDateKey(run.fromDate), to: toAiLocalDateKey(run.toDate), topN: 10 };
        const cashflow = await executeMeasured("get_cashflow_summary", args);
        await heartbeat();
        const receivables = await executeMeasured("get_receivables_summary", args);
        await heartbeat();
        const stock = await executeMeasured("get_stock_risk_summary", args);
        await heartbeat();
        const margin = await executeMeasured("get_margin_summary", args);
        await heartbeat();
        const rules = await companyRuleConfig(prisma, run.companyId);
        const candidates = buildAnalysisCandidates({ cashflow, receivables, stock, margin }, rules, run);
        const summary = { ...await persistLifecycle(prisma, run, candidates), toolDurationsMs };
        const completed = await prisma.aiAnalysisRun.updateMany({
            where: { id: run.id, status: "RUNNING", claimedBy: run.claimedBy },
            data: { status: "COMPLETED", resultSummary: summary, completedAt: new Date(), leaseExpiresAt: null, claimedBy: null },
        });
        if (completed.count !== 1) throw httpError(409, "AI_RUN_LEASE_LOST", "A execução perdeu o lease antes de concluir");
        return summary;
    } catch (error) {
        if (error?.code === "AI_RUN_LEASE_LOST") throw error;
        const exhausted = run.attempts >= (options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS);
        const nextDelay = RETRY_DELAYS_MS[Math.max(0, Math.min(RETRY_DELAYS_MS.length - 1, run.attempts - 1))];
        await prisma.aiAnalysisRun.updateMany({
            where: { id: run.id, status: "RUNNING", claimedBy: run.claimedBy },
            data: exhausted ? {
                status: "FAILED", errorCode: "AI_ANALYSIS_RETRIES_EXHAUSTED", completedAt: new Date(), leaseExpiresAt: null, claimedBy: null,
            } : {
                status: "QUEUED", errorCode: error?.code ?? "AI_ANALYSIS_FAILED", nextAttemptAt: new Date(Date.now() + nextDelay), leaseExpiresAt: null, claimedBy: null,
            },
        });
        throw error;
    }
}

function parseListFilters(model, query = {}) {
    const where = {};
    if (query.status) where.status = String(query.status).trim().toUpperCase();
    let periodFilter = null;
    if (query.from !== undefined || query.to !== undefined) {
        if (!query.from || !query.to) throw httpError(400, "INVALID_DATE_RANGE", "from e to são obrigatórios em conjunto");
        const period = validateMetricPeriod({ from: query.from, to: query.to, topN: 10 });
        periodFilter = { periodFrom: { gte: period.fromDate }, periodTo: { lte: period.toDate } };
    }
    const metadata = {};
    if (query.ruleCode) {
        const ruleCode = String(query.ruleCode).trim().toUpperCase();
        if (!AI_RULE_REGISTRY[ruleCode]) throw httpError(400, "INVALID_AI_RULE", "Regra desconhecida");
        metadata.ruleCode = ruleCode;
    }
    if (query.origin) {
        const origin = String(query.origin).trim().toUpperCase();
        if (!new Set(["USER", "SYSTEM"]).has(origin)) throw httpError(400, "INVALID_AI_ORIGIN", "Origem inválida");
        metadata.origin = origin;
    }
    if (model === "aiActionSuggestion") {
        if (periodFilter || Object.keys(metadata).length) where.insight = { ...periodFilter, ...metadata };
    } else Object.assign(where, periodFilter ?? {}, metadata);
    return where;
}

function serializeSuggestion(suggestion) {
    const sourceQuality = assertAiSourceQuality({
        companyId: suggestion.companyId,
        sourceType: suggestion.insight.sourceType,
        sourceId: suggestion.insight.sourceId,
        sourceLabel: suggestion.insight.sourceLabel,
        explanation: suggestion.insight.explanation,
        actionType: suggestion.actionType,
        evidence: suggestion.insight.evidence,
    });
    const { insight, ...record } = suggestion;
    return { ...record, sourceQuality, guardrail: "A IA recomenda com fonte rastreável; a decisão continua humana." };
}

export async function listAiRecords(prisma, model, { companyId, query }) {
    const allowedModels = new Set(["aiInsight", "aiActionSuggestion", "smartAlert"]);
    if (!allowedModels.has(model)) throw new TypeError("Modelo de IA inválido");
    const { page, pageSize, skip } = parsePage(query);
    const where = { companyId, ...parseListFilters(model, query) };
    const orderBy = model === "aiActionSuggestion"
        ? [{ updatedAt: "desc" }, { id: "desc" }]
        : [{ score: "desc" }, { priority: "desc" }, { generatedAt: "desc" }];
    const findOptions = { where, orderBy, skip, take: pageSize, ...(model === "aiActionSuggestion" ? { include: { insight: true } } : {}) };
    const [rows, total] = await Promise.all([
        prisma[model].findMany(findOptions),
        prisma[model].count({ where }),
    ]);
    const items = model === "aiActionSuggestion" ? rows.map(serializeSuggestion) : rows;
    return { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

/** Atualiza lifecycle com transição fechada, claim otimista e auditoria atómica. */
export async function updateAiRecordStatus(prisma, model, input) {
    if (!STATUS_TRANSITIONS[model]) throw httpError(400, "INVALID_AI_STATUS", "Modelo de lifecycle inválido");
    const nextStatus = String(input.status ?? "").trim().toUpperCase();
    return prisma.$transaction(async (tx) => {
        const record = await tx[model].findFirst({ where: { id: input.id, companyId: input.companyId } });
        if (!record) throw httpError(404, "AI_RECORD_NOT_FOUND", "Registo não encontrado");
        if (!STATUS_TRANSITIONS[model][record.status]?.has(nextStatus)) {
            throw httpError(409, "INVALID_AI_STATUS_TRANSITION", `Transição ${record.status} -> ${nextStatus} não permitida`);
        }
        const claimed = await tx[model].updateMany({
            where: { id: record.id, companyId: input.companyId, status: record.status, updatedAt: record.updatedAt },
            data: {
                status: nextStatus,
                ...(model === "aiActionSuggestion"
                    ? { feedback: input.feedback ?? null, feedbackReason: input.reason ?? null, completedAt: nextStatus === "DONE" ? new Date() : null }
                    : { resolvedAt: nextStatus === "RESOLVED" ? new Date() : null }),
            },
        });
        if (claimed.count !== 1) throw httpError(409, "STALE_STATE", "O registo de IA foi alterado por outra operação");
        const updated = await tx[model].findUnique({ where: { id: record.id } });
        await recordAuditLog(tx, {
            companyId: input.companyId,
            userId: input.userId,
            action: "AI_RECORD_STATUS_UPDATED",
            entity: model,
            entityId: record.id,
            details: { from: record.status, to: nextStatus },
        });
        return updated;
    });
}

export async function getAiSettings(prisma, companyId) {
    const settings = await prisma.companyAiSettings.findUnique({ where: { companyId } });
    const rules = await prisma.aiRuleSetting.findMany({ where: { companyId }, orderBy: { ruleCode: "asc" } });
    return { settings: settings ?? { companyId, openAiEnabled: false, policyVersion: "2026-01", userDailyTurnLimit: 50, companyDailyTurnLimit: 500 }, rules, registry: AI_RULE_REGISTRY };
}

/** Atualiza settings e regras como uma única decisão administrativa auditada. */
export async function updateAiSettings(prisma, input) {
    const openAiEnabled = Boolean(input.body?.openAiEnabled);
    const policyVersion = typeof input.body?.policyVersion === "string" ? input.body.policyVersion.trim() : "2026-01";
    if (!/^\d{4}-\d{2}$/.test(policyVersion)) throw httpError(400, "INVALID_AI_POLICY_VERSION", "Versão de política inválida");
    const userDailyTurnLimit = Number(input.body?.userDailyTurnLimit ?? 50);
    const companyDailyTurnLimit = Number(input.body?.companyDailyTurnLimit ?? 500);
    if (!Number.isInteger(userDailyTurnLimit) || userDailyTurnLimit < 1 || userDailyTurnLimit > 500 || !Number.isInteger(companyDailyTurnLimit) || companyDailyTurnLimit < 1 || companyDailyTurnLimit > 5_000) {
        throw httpError(400, "INVALID_AI_QUOTA", "Quotas de IA inválidas");
    }
    const preparedRules = (Array.isArray(input.body?.rules) ? input.body.rules : []).map((entry) => {
        if (!AI_RULE_REGISTRY[entry.ruleCode]) throw httpError(400, "INVALID_AI_RULE", "Regra desconhecida");
        return { ruleCode: entry.ruleCode, enabled: entry.enabled !== false, threshold: validatedThreshold(entry.ruleCode, Number(entry.threshold)) };
    });
    return prisma.$transaction(async (tx) => {
        const previous = await tx.companyAiSettings.findUnique({ where: { companyId: input.companyId } });
        const settings = await tx.companyAiSettings.upsert({
            where: { companyId: input.companyId },
            create: { companyId: input.companyId, openAiEnabled, policyVersion, userDailyTurnLimit, companyDailyTurnLimit, enabledById: openAiEnabled ? input.userId : null, enabledAt: openAiEnabled ? new Date() : null },
            update: { openAiEnabled, policyVersion, userDailyTurnLimit, companyDailyTurnLimit, enabledById: openAiEnabled ? input.userId : null, enabledAt: openAiEnabled ? new Date() : null },
        });
        for (const entry of preparedRules) {
            await tx.aiRuleSetting.upsert({
                where: { companyId_ruleCode: { companyId: input.companyId, ruleCode: entry.ruleCode } },
                create: { companyId: input.companyId, ruleCode: entry.ruleCode, enabled: entry.enabled, parameters: { threshold: entry.threshold }, updatedById: input.userId },
                update: { enabled: entry.enabled, parameters: { threshold: entry.threshold }, updatedById: input.userId },
            });
        }
        await recordAuditLog(tx, {
            companyId: input.companyId,
            userId: input.userId,
            action: "AI_SETTINGS_UPDATED",
            entity: "CompanyAiSettings",
            entityId: settings.id,
            details: { openAiEnabled: { from: previous?.openAiEnabled ?? false, to: openAiEnabled }, policyVersion, ruleCount: preparedRules.length },
        });
        return settings;
    });
}
