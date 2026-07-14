/**
 * @file Chat read-only OPSA com grounding integral no backend.
 *
 * O texto livre, histórico, identificadores e valores ficam na API. O provider
 * opcional recebe apenas sinais qualitativos canónicos; factos, formatação,
 * fontes e resposta final são sempre compostos localmente.
 */

import crypto from "node:crypto";
import { buildCursorPage, buildKeysetCondition, decodePageCursor } from "../../lib/cursorPagination.js";
import { httpError } from "../../lib/httpErrors.js";
import { recordAuditLog } from "../audit/auditLogService.js";
import {
    createSafetyIdentifier,
    decryptAiChatPayload,
    encryptAiChatPayload,
    hashDeletedSessionId,
    parseAiChatEncryptionKey,
} from "./aiChatCrypto.js";
import { executeAiTool, toAiLocalDateKey, validateMetricPeriod, zonedDateBoundary } from "./aiMetricCatalog.js";
import { millisecondsUntilNextLisbonDay, reserveAtomicLimits } from "./aiProtection.js";
import {
    analyzeTransaction,
    auditTransactionAnalysis,
    parseTransactionAnalysisInput,
} from "./transactionRiskService.js";

const activeGenerations = new Set();
const PAYLOAD_VERSION = 2;
const SESSION_PAGE_SIZE = 20;
const MESSAGE_PAGE_SIZE = 50;
const SUPPORTED_EXAMPLES = Object.freeze([
    "Qual é o cashflow projetado deste mês?",
    "Quanto temos vencido por receber?",
    "Qual é a margem operacional do trimestre?",
    "Que riscos de stock existem hoje?",
    "Compara os KPIs deste mês com o anterior.",
]);
const TOOL_MODULES = Object.freeze({
    get_cashflow_summary: "treasury",
    get_receivables_summary: "sales",
    get_stock_risk_summary: "inventory",
    get_margin_summary: "accounting",
    get_executive_kpis: "reporting",
    compare_periods: "reporting",
    get_insight_explanation: "ai",
});
const SOURCE_LABELS = Object.freeze({
    JOURNAL_ENTRY_LINES: "Lançamentos contabilísticos validados",
    DOCUMENT: "Documentos de venda validados",
    RECEIPT: "Recebimentos validados",
    PAYMENT: "Pagamentos validados",
    SALE_DOCUMENT: "Documentos de venda validados",
    PURCHASE_DOCUMENT: "Documentos de compra validados",
    ITEM: "Dados de stock validados",
    AI_METRIC_V2: "Métrica canónica OPSA",
});

function normalize(text) {
    return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function classifyChatIntent(question) {
    const text = normalize(question);
    if (/compara|comparacao|periodo anterior/.test(text)) return { intent: "comparison", tool: "compare_periods" };
    if (/cash|caixa|tesour|liquidez|saldo projetado/.test(text)) return { intent: "cashflow", tool: "get_cashflow_summary" };
    if (/cliente|receber|recebive|vencid|cobranca|pmr/.test(text)) return { intent: "receivables", tool: "get_receivables_summary" };
    if (/stock|inventario|artigo|rutura|ruptura|armazen|armazem|excesso/.test(text)) return { intent: "stock", tool: "get_stock_risk_summary" };
    if (/margem|resultado operacional|receita|gasto|ebitda/.test(text)) return { intent: "margin", tool: "get_margin_summary" };
    if (/kpi|pmp|indicadores? (?:executivos?|de gestao)/.test(text)) return { intent: "kpis", tool: "get_executive_kpis" };
    if (/insight|explica|explicacao/.test(text)) return { intent: "insight", tool: "get_insight_explanation" };
    return null;
}

/** Identifica perguntas que pedem avaliação da transação selecionada. */
export function isTransactionAnalysisQuestion(question) {
    const text = normalize(String(question ?? ""));
    return /\b(?:venda|compra|transacao|documento|aconselhavel|boa|risco|riscos|proceder|avancar|futuro|seguir|recomenda|margem|stock|cliente|fornecedor)\b/.test(text);
}

function explicitlyRequestsTransaction(question) {
    const text = normalize(String(question ?? ""));
    return /\b(?:venda|compra|transacao|documento)\b/.test(text)
        && /\b(?:aconselhavel|boa|risco|riscos|proceder|avancar|futuro|seguir|recomenda|analis)\b/.test(text);
}

function assertChatEnabled(aiConfig) {
    if (!aiConfig.chatEnabled) throw httpError(503, "AI_CHAT_DISABLED", "O chat de IA não está ativo nesta instalação.");
}

function requireEncryptionKey(aiConfig) {
    assertChatEnabled(aiConfig);
    try {
        return parseAiChatEncryptionKey(aiConfig.chatEncryptionKey);
    } catch {
        throw httpError(503, "AI_CHAT_NOT_CONFIGURED", "O histórico cifrado de IA não está configurado.");
    }
}

function sessionExpiry(retentionDays) {
    return new Date(Date.now() + retentionDays * 86_400_000);
}

function protectedKey(input, suffix) {
    const prefix = input.redisKeyPrefix ?? "opsa";
    return `${prefix}:ai:${suffix}`;
}

async function acquireDistributedGenerationLock(client, key) {
    if (!client?.isOpen) return null;
    const token = crypto.randomUUID();
    const result = await client.set(key, token, { NX: true, PX: 120_000 });
    return result === "OK" ? token : false;
}

async function releaseDistributedGenerationLock(client, key, token) {
    if (!client?.isOpen || !token) return;
    await client.eval(
        "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
        { keys: [key], arguments: [token] },
    );
}

async function ownedSession(prisma, input) {
    const session = await prisma.aiChatSession.findFirst({
        where: { id: input.sessionId, companyId: input.companyId, userId: input.userId },
    });
    if (!session) throw httpError(404, "AI_CHAT_SESSION_NOT_FOUND", "Conversa não encontrada");
    return session;
}

async function reserveSessionCreation(aiConfig, input) {
    const actor = createSafetyIdentifier(input.userId, aiConfig.safetyHmacKey);
    await reserveAtomicLimits(input.redisClient, [{
        key: protectedKey(input, `session-create:${actor}`),
        limit: aiConfig.sessionCreateHourlyLimit ?? 10,
        ttlMs: 3_600_000,
        code: "AI_RATE_LIMITED",
        message: "Limite horário de novas conversas atingido.",
    }], { failClosed: aiConfig.failClosedRateLimits });
}

export async function createChatSession(prisma, aiConfig, input) {
    const key = requireEncryptionKey(aiConfig);
    const activeCount = await prisma.aiChatSession.count({
        where: { companyId: input.companyId, userId: input.userId, expiresAt: { gt: new Date() } },
    });
    if (activeCount >= (aiConfig.maxActiveSessionsPerUser ?? 20)) {
        throw httpError(409, "AI_SESSION_LIMIT_REACHED", "Elimine ou deixe expirar uma conversa antes de criar outra.");
    }
    await reserveSessionCreation(aiConfig, input);
    const title = typeof input.title === "string" && input.title.trim() ? input.title.trim().slice(0, 80) : "Nova conversa";
    return prisma.aiChatSession.create({
        data: {
            companyId: input.companyId,
            userId: input.userId,
            titleEncrypted: encryptAiChatPayload({ title }, key),
            aliasMapEncrypted: encryptAiChatPayload({}, key),
            expiresAt: sessionExpiry(aiConfig.retentionDays),
        },
        select: { id: true, createdAt: true, updatedAt: true, expiresAt: true },
    });
}

export async function listChatSessions(prisma, aiConfig, input) {
    const key = requireEncryptionKey(aiConfig);
    const cursor = decodePageCursor(input.cursor, "date");
    const condition = buildKeysetCondition(cursor, { sortField: "updatedAt", direction: "desc" });
    const sessions = await prisma.aiChatSession.findMany({
        where: { companyId: input.companyId, userId: input.userId, ...(condition ? { AND: [condition] } : {}) },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: SESSION_PAGE_SIZE + 1,
    });
    const page = buildCursorPage(sessions, {
        limit: SESSION_PAGE_SIZE,
        sortField: "updatedAt",
        sortType: "date",
        serialize: (session) => ({
            id: session.id,
            title: session.titleEncrypted ? decryptAiChatPayload(session.titleEncrypted, key).title : "Conversa",
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            expiresAt: session.expiresAt,
        }),
    });
    return { sessions: page.items, pageInfo: page.pageInfo };
}

function normalizeStoredPayload(payload) {
    if (payload?.payloadVersion === PAYLOAD_VERSION) return payload;
    return {
        ...payload,
        payloadVersion: 1,
        facts: Array.isArray(payload?.facts) ? payload.facts : Array.isArray(payload?.claims)
            ? payload.claims.map((claim, index) => ({ id: `legacy_${index + 1}`, metric: claim.metric, value: claim.value, formattedValue: claim.value === null ? "Indisponível" : String(claim.value), unit: "unknown", sourceRef: claim.sourceRef }))
            : [],
    };
}

export async function listChatMessages(prisma, aiConfig, input) {
    const key = requireEncryptionKey(aiConfig);
    const session = await ownedSession(prisma, input);
    const cursor = decodePageCursor(input.cursor, "date");
    const condition = buildKeysetCondition(cursor, { sortField: "createdAt", direction: "desc" });
    const messages = await prisma.aiChatMessage.findMany({
        where: { sessionId: session.id, ...(condition ? { AND: [condition] } : {}) },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: MESSAGE_PAGE_SIZE + 1,
    });
    const page = buildCursorPage(messages, {
        limit: MESSAGE_PAGE_SIZE,
        sortField: "createdAt",
        sortType: "date",
        serialize: (message) => ({
            id: message.id,
            role: message.role,
            status: message.status,
            provider: message.provider,
            model: message.model,
            feedback: message.feedback,
            createdAt: message.createdAt,
            ...normalizeStoredPayload(decryptAiChatPayload(message.payloadEncrypted, key)),
        }),
    });
    return { messages: page.items.reverse(), pageInfo: page.pageInfo };
}

export async function deleteChatSession(prisma, aiConfig, input) {
    const key = requireEncryptionKey(aiConfig);
    const session = await ownedSession(prisma, input);
    await prisma.$transaction(async (tx) => {
        await tx.aiDeletionAudit.create({ data: { companyId: input.companyId, actorUserId: input.userId, deletedOwnerId: input.userId, sessionIdHash: hashDeletedSessionId(session.id, key), reason: input.reason ?? "USER_REQUEST" } });
        await tx.aiUsageEvent.updateMany({ where: { sessionId: session.id }, data: { sessionId: null } });
        await tx.aiChatSession.delete({ where: { id: session.id } });
        await recordAuditLog(tx, { companyId: input.companyId, userId: input.userId, action: "AI_CHAT_SESSION_DELETED", entity: "AiChatSession", entityId: hashDeletedSessionId(session.id, key), details: { reason: input.reason ?? "USER_REQUEST" } });
    });
}

export async function purgeExpiredChatSessions(prisma, aiConfig, now = new Date()) {
    if (!aiConfig.chatEnabled) return 0;
    const key = requireEncryptionKey(aiConfig);
    const expired = await prisma.aiChatSession.findMany({ where: { expiresAt: { lte: now } }, select: { id: true, companyId: true, userId: true } });
    for (const session of expired) {
        await prisma.$transaction(async (tx) => {
            await tx.aiDeletionAudit.create({ data: { companyId: session.companyId, deletedOwnerId: session.userId, sessionIdHash: hashDeletedSessionId(session.id, key), reason: "RETENTION_90_DAYS" } });
            await tx.aiUsageEvent.updateMany({ where: { sessionId: session.id }, data: { sessionId: null } });
            await tx.aiChatSession.delete({ where: { id: session.id } });
        });
    }
    return expired.length;
}

export async function getConsent(prisma, input) {
    const settings = await prisma.companyAiSettings.findUnique({ where: { companyId: input.companyId } });
    const policyVersion = settings?.policyVersion ?? "2026-01";
    const consent = await prisma.aiUserConsent.findUnique({ where: { companyId_userId: { companyId: input.companyId, userId: input.userId } } });
    return { policyVersion, accepted: Boolean(consent && !consent.revokedAt && consent.policyVersion === policyVersion), acceptedAt: consent?.acceptedAt ?? null, revokedAt: consent?.revokedAt ?? null };
}

export async function acceptConsent(prisma, input) {
    return prisma.$transaction(async (tx) => {
        const settings = await tx.companyAiSettings.findUnique({ where: { companyId: input.companyId } });
        const policyVersion = settings?.policyVersion ?? "2026-01";
        const consent = await tx.aiUserConsent.upsert({
            where: { companyId_userId: { companyId: input.companyId, userId: input.userId } },
            create: { companyId: input.companyId, userId: input.userId, policyVersion },
            update: { policyVersion, acceptedAt: new Date(), revokedAt: null },
        });
        await recordAuditLog(tx, { companyId: input.companyId, userId: input.userId, action: "AI_CONSENT_ACCEPTED", entity: "AiUserConsent", entityId: consent.id, details: { policyVersion } });
        return consent;
    });
}

export async function revokeConsent(prisma, input) {
    return prisma.$transaction(async (tx) => {
        const consent = await tx.aiUserConsent.findUnique({ where: { companyId_userId: { companyId: input.companyId, userId: input.userId } } });
        if (!consent) return null;
        const revoked = await tx.aiUserConsent.update({ where: { id: consent.id }, data: { revokedAt: new Date() } });
        await recordAuditLog(tx, { companyId: input.companyId, userId: input.userId, action: "AI_CONSENT_REVOKED", entity: "AiUserConsent", entityId: consent.id, details: { policyVersion: consent.policyVersion } });
        return revoked;
    });
}

export async function getAiCapabilities(prisma, aiConfig, input) {
    const [settings, consent] = await Promise.all([
        prisma.companyAiSettings.findUnique({ where: { companyId: input.companyId } }),
        getConsent(prisma, input),
    ]);
    const providerConfigured = aiConfig.providerMode === "openai" && Boolean(aiConfig.openAiApiKey && aiConfig.model);
    return {
        chatAvailable: Boolean(aiConfig.chatEnabled),
        effectiveMode: !aiConfig.chatEnabled ? "disabled" : providerConfigured && settings?.openAiEnabled && consent.accepted ? "openai" : "deterministic",
        providerConfigured,
        companyOptIn: Boolean(settings?.openAiEnabled),
        consentAccepted: consent.accepted,
        policyVersion: consent.policyVersion,
        limits: {
            activeSessions: aiConfig.maxActiveSessionsPerUser ?? 20,
            messagesPerSession: aiConfig.maxMessagesPerSession ?? 200,
            messagesPerMinute: aiConfig.messageRateLimit ?? 5,
            sessionsPerHour: aiConfig.sessionCreateHourlyLimit ?? 10,
            userDailyTurns: Math.min(settings?.userDailyTurnLimit ?? aiConfig.userDailyTurnLimit, aiConfig.userDailyTurnLimit),
            companyDailyTurns: Math.min(settings?.companyDailyTurnLimit ?? aiConfig.companyDailyTurnLimit, aiConfig.companyDailyTurnLimit),
        },
    };
}

function defaultPeriod(body) {
    const now = new Date();
    const from = body?.context?.period?.from ?? body?.from ?? `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
    const to = body?.context?.period?.to ?? body?.to ?? now.toISOString().slice(0, 10);
    validateMetricPeriod({ from, to, topN: 10 });
    return { from, to, topN: 10 };
}

async function validateAuthorizedContext(prisma, companyId, context) {
    const transaction = context?.transaction
        ? parseTransactionAnalysisInput({
            documentType: context.transaction.documentType,
            documentId: context.transaction.documentId,
        })
        : null;
    const entityType = String(context?.entity?.type ?? "").toUpperCase();
    const entityId = typeof context?.entity?.id === "string" ? context.entity.id : null;
    if (!entityId) return { insightId: null, transaction };
    const delegates = { CUSTOMER: prisma.customer, SUPPLIER: prisma.supplier, ITEM: prisma.item, WAREHOUSE: prisma.warehouse, INSIGHT: prisma.aiInsight };
    const delegate = delegates[entityType];
    if (!delegate) throw httpError(400, "INVALID_AI_CONTEXT", "Tipo de contexto não suportado.");
    const entity = await delegate.findFirst({ where: { id: entityId, companyId }, select: { id: true } });
    if (!entity) throw httpError(404, "AI_CONTEXT_NOT_FOUND", "O contexto indicado não está acessível nesta empresa.");
    return { insightId: entityType === "INSIGHT" ? entity.id : null, transaction };
}

function composeTransactionResponse(analysis) {
    const facts = analysis.facts.map((fact, index) => ({ id: `transaction_fact_${index + 1}`, ...fact }));
    const sources = analysis.sources.map((source) => ({ ref: `${source.type}:${source.id}`, label: source.label }));
    return {
        payloadVersion: PAYLOAD_VERSION,
        status: "ANSWERED",
        narrative: analysis.summary,
        answer: `${analysis.summary} ${analysis.guardrail}`,
        facts,
        claims: facts.map(({ metric, value, sourceRef }) => ({ metric, value, sourceRef })),
        sources,
        sourceRefs: sources.map((source) => source.ref),
        limitations: analysis.limitations,
        followUpSuggestions: ["Que riscos têm maior impacto?", "O que devo confirmar antes de decidir?", "Como foi calculado o stock projetado?"],
        mode: "deterministic",
        period: null,
        quality: analysis.dataQuality,
        analysis,
    };
}

function comparisonArgs(period, body) {
    const previous = body?.context?.comparisonPeriod;
    if (previous?.from && previous?.to) return { ...period, previousFrom: previous.from, previousTo: previous.to, metric: body?.context?.metric ?? "get_executive_kpis" };
    const start = new Date(`${period.from}T00:00:00.000Z`);
    const end = new Date(`${period.to}T00:00:00.000Z`);
    const duration = end - start + 86_400_000;
    const previousTo = new Date(start.getTime() - 86_400_000);
    const previousFrom = new Date(previousTo.getTime() - duration + 86_400_000);
    return { ...period, previousFrom: previousFrom.toISOString().slice(0, 10), previousTo: previousTo.toISOString().slice(0, 10), metric: body?.context?.metric ?? "get_executive_kpis" };
}

function factUnit(path) {
    const leaf = path.split(".").at(-1) ?? path;
    if (/Cents$/.test(leaf)) return "EUR";
    if (/Bps$/.test(leaf)) return "percent";
    if (/Days$/.test(leaf)) return "days";
    if (/Count$/.test(leaf)) return "count";
    return "number";
}

function formatFact(value, unit) {
    if (value === null) return "Indisponível";
    if (unit === "EUR") return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value / 100);
    if (unit === "percent") return new Intl.NumberFormat("pt-PT", { style: "percent", maximumFractionDigits: 2 }).format(value / 10_000);
    if (unit === "days") return `${new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 1 }).format(value)} dias`;
    return new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 2 }).format(value);
}

export function buildBackendFacts(result) {
    const facts = [];
    const visit = (value, path) => {
        if ((typeof value === "number" || value === null) && facts.length < 40) {
            const unit = factUnit(path);
            facts.push({ id: `fact_${facts.length + 1}`, metric: path, value, formattedValue: formatFact(value, unit), unit, sourceRef: result.tool });
        } else if (Array.isArray(value)) {
            value.forEach((entry, index) => visit(entry, `${path}.${index}`));
        } else if (value && typeof value === "object") {
            for (const [key, nested] of Object.entries(value)) visit(nested, path ? `${path}.${key}` : key);
        }
    };
    visit(result.metrics, "");
    return facts;
}

function canonicalSources(result) {
    const seen = new Set();
    return result.sourceRefs.flatMap((source) => {
        const type = SOURCE_LABELS[source.type] ? source.type : result.tool;
        if (seen.has(type)) return [];
        seen.add(type);
        return [{ ref: type, label: SOURCE_LABELS[type] ?? "Fonte canónica OPSA" }];
    }).slice(0, 10);
}

function qualitativeSignals(result) {
    const signs = [];
    const visit = (value) => {
        if (typeof value === "number") signs.push(value < 0 ? "negative" : value === 0 ? "neutral" : "positive");
        else if (value && typeof value === "object") Object.values(value).forEach(visit);
    };
    visit(result.metrics);
    return [...new Set(signs)].slice(0, 3);
}

export function validateQualitativeNarrative(response) {
    if (!response || typeof response.narrative !== "string" || !Array.isArray(response.limitations) || !Array.isArray(response.followUpSuggestions)) return false;
    const text = [response.narrative, ...response.limitations, ...response.followUpSuggestions].join(" ");
    return !/[0-9€$£%]|\b[A-Z][A-Z0-9]+_[0-9]+\b|\b[0-9a-f]{8}-[0-9a-f-]{27,}\b|https?:\/\/|\b(?:segundo|conforme|fonte|referência|relatório externo)\b/iu.test(text);
}

/** Compatibilidade temporária para callers/testes v1; claims continuam verificáveis localmente. */
export function validateProviderClaims(response, toolResults) {
    if (!response || !Array.isArray(response.claims)) return false;
    const allowed = new Map(buildBackendFacts(toolResults[0] ?? { tool: "unknown", metrics: {}, sourceRefs: [] }).map((fact) => [`${fact.metric}:${fact.value}`, fact]));
    return response.claims.every((claim) => allowed.has(`${claim.metric}:${claim.value}`));
}

function deterministicNarrative(intent, result, degraded = false) {
    const base = result.quality === "INSUFFICIENT_DATA"
        ? "Não existem dados suficientes para apresentar uma conclusão segura."
        : ({
            cashflow: "A tesouraria foi analisada com os dados disponíveis para o período autorizado.",
            receivables: "Os recebíveis foram analisados com base nos documentos e recebimentos registados.",
            stock: "Os riscos de stock foram avaliados face aos limites configurados.",
            margin: "A margem foi apurada a partir dos lançamentos contabilísticos elegíveis.",
            kpis: "Os indicadores executivos foram calculados pela pipeline canónica.",
            comparison: "Os dois períodos foram comparados pela mesma metodologia canónica.",
            insight: "A explicação foi reconstruída a partir da evidência guardada no insight.",
        }[intent] ?? "O pedido foi analisado pela pipeline canónica OPSA.");
    return `${base}${degraded ? " O enquadramento externo não estava disponível; foi usado o modo determinístico." : ""}`;
}

function composeResponse({ intent, result, narrative, providerMode, providerLimitations = [] }) {
    const facts = buildBackendFacts(result);
    const factualText = facts.length ? ` Factos validados: ${facts.map((fact) => `${fact.metric}: ${fact.formattedValue}`).join("; ")}.` : "";
    const sources = canonicalSources(result);
    return {
        payloadVersion: PAYLOAD_VERSION,
        status: result.quality === "INSUFFICIENT_DATA" ? "INSUFFICIENT_DATA" : "ANSWERED",
        narrative,
        answer: `${narrative}${factualText}`,
        facts,
        claims: facts.map(({ metric, value, sourceRef }) => ({ metric, value, sourceRef })),
        sources,
        sourceRefs: sources.map((source) => source.ref),
        limitations: [...new Set([...result.limitations, ...providerLimitations])],
        followUpSuggestions: SUPPORTED_EXAMPLES.slice(0, 3),
        mode: providerMode,
        period: result.period,
        quality: result.quality,
    };
}

async function persistMessage(prisma, key, data) {
    return prisma.aiChatMessage.create({
        data: {
            sessionId: data.sessionId,
            role: data.role,
            status: data.status ?? "COMPLETED",
            payloadEncrypted: encryptAiChatPayload(data.payload, key),
            provider: data.provider,
            model: data.model,
            inputTokens: data.inputTokens ?? 0,
            outputTokens: data.outputTokens ?? 0,
        },
    });
}

async function reserveChatAttempt(aiConfig, settings, input) {
    const now = new Date();
    const actor = createSafetyIdentifier(input.userId, aiConfig.safetyHmacKey);
    const company = createSafetyIdentifier(input.companyId, aiConfig.safetyHmacKey);
    const day = toAiLocalDateKey(now);
    const dayTtl = millisecondsUntilNextLisbonDay(now, toAiLocalDateKey, zonedDateBoundary);
    await reserveAtomicLimits(input.redisClient, [
        { key: protectedKey(input, `turn:user:${actor}:${day}`), limit: Math.min(settings?.userDailyTurnLimit ?? aiConfig.userDailyTurnLimit, aiConfig.userDailyTurnLimit), ttlMs: dayTtl, code: "AI_DAILY_QUOTA_EXCEEDED", message: "Limite diário do utilizador atingido." },
        { key: protectedKey(input, `turn:company:${company}:${day}`), limit: Math.min(settings?.companyDailyTurnLimit ?? aiConfig.companyDailyTurnLimit, aiConfig.companyDailyTurnLimit), ttlMs: dayTtl, code: "AI_DAILY_QUOTA_EXCEEDED", message: "Limite diário da empresa atingido." },
        { key: protectedKey(input, `turn:minute:${actor}`), limit: aiConfig.messageRateLimit ?? 5, ttlMs: 60_000, code: "AI_RATE_LIMITED", message: "Limite de tentativas por minuto atingido." },
    ], { failClosed: aiConfig.failClosedRateLimits });
}

function throwIfAborted(signal) {
    if (signal?.aborted) throw httpError(499, "AI_GENERATION_CANCELLED", "A geração foi cancelada.");
}

/** Turno canónico usado por SSE e pelo adapter legado. */
export async function sendChatMessage(prisma, aiConfig, provider, input) {
    const startedAt = Date.now();
    const key = requireEncryptionKey(aiConfig);
    const lockKey = `${input.companyId}:${input.userId}`;
    if (activeGenerations.has(lockKey)) throw httpError(409, "AI_GENERATION_IN_PROGRESS", "Já existe uma resposta em geração.");
    const distributedKey = protectedKey(input, `generation:${createSafetyIdentifier(input.userId, aiConfig.safetyHmacKey)}`);
    const distributedToken = await acquireDistributedGenerationLock(input.redisClient, distributedKey);
    if (distributedToken === false) throw httpError(409, "AI_GENERATION_IN_PROGRESS", "Já existe uma resposta em geração.");
    activeGenerations.add(lockKey);
    let session = null;
    let providerName = "deterministic";
    let model = null;
    let inputTokens = 0;
    let outputTokens = 0;
    let outcome = null;
    let accepted = false;
    const usedTools = [];
    try {
        session = await ownedSession(prisma, input);
        const question = typeof input.body?.message === "string" ? input.body.message.trim() : typeof input.body?.question === "string" ? input.body.question.trim() : "";
        if (!question || question.length > 2_000) throw httpError(400, "INVALID_AI_QUESTION", "A pergunta deve ter entre um e dois mil caracteres.");
        const messageCount = await prisma.aiChatMessage.count({ where: { sessionId: session.id } });
        if (messageCount + 2 > (aiConfig.maxMessagesPerSession ?? 200)) {
            throw httpError(409, "AI_MESSAGE_LIMIT_REACHED", "Esta conversa atingiu o limite de mensagens. Crie uma nova conversa.");
        }
        const settings = await prisma.companyAiSettings.findUnique({ where: { companyId: input.companyId } });
        await reserveChatAttempt(aiConfig, settings, input);
        accepted = true;
        await persistMessage(prisma, key, { sessionId: session.id, role: "user", provider: "local", payload: { payloadVersion: PAYLOAD_VERSION, text: question, context: input.body?.context ?? null } });
        throwIfAborted(input.signal);
        const transactionReference = input.body?.context?.transaction
            ? parseTransactionAnalysisInput({
                documentType: input.body.context.transaction.documentType,
                documentId: input.body.context.transaction.documentId,
            })
            : null;
        if (!transactionReference && explicitlyRequestsTransaction(question)) {
            outcome = "REFUSED";
            const response = {
                payloadVersion: PAYLOAD_VERSION,
                status: "INSUFFICIENT_DATA",
                narrative: "Selecione uma venda ou compra antes de pedir a análise da transação.",
                answer: "Abra o documento pretendido e escolha «Analisar com IA». O assistente receberá apenas o tipo e o identificador autorizado.",
                facts: [], claims: [], sources: [], sourceRefs: [],
                limitations: ["Não foi indicado um documento autorizado da empresa ativa."],
                followUpSuggestions: ["Abrir uma venda", "Abrir uma compra"],
                mode: "deterministic", period: null, quality: "INSUFFICIENT_DATA",
            };
            const stored = await persistMessage(prisma, key, { sessionId: session.id, role: "assistant", provider: "deterministic", payload: response });
            await prisma.aiChatSession.update({ where: { id: session.id }, data: { aliasMapEncrypted: encryptAiChatPayload({}, key), expiresAt: sessionExpiry(aiConfig.retentionDays) } });
            return { id: stored.id, ...response };
        }
        const transactionRequested = Boolean(transactionReference && isTransactionAnalysisQuestion(question));
        const classified = transactionRequested
            ? { intent: "transaction", tool: "analyze_transaction" }
            : classifyChatIntent(question);
        if (!classified) {
            outcome = "REFUSED";
            const response = {
                payloadVersion: PAYLOAD_VERSION,
                status: "REFUSED",
                narrative: "Este assistente responde apenas sobre dados financeiros e operacionais autorizados da empresa.",
                answer: `Este assistente responde apenas sobre dados financeiros e operacionais autorizados da empresa. Exemplos: ${SUPPORTED_EXAMPLES.join("; ")}`,
                facts: [], claims: [], sources: [], sourceRefs: [],
                limitations: ["Pedido fora dos domínios suportados."],
                followUpSuggestions: SUPPORTED_EXAMPLES.slice(0, 3), mode: "deterministic", period: null, quality: "NOT_APPLICABLE",
            };
            const stored = await persistMessage(prisma, key, { sessionId: session.id, role: "assistant", provider: "deterministic", payload: response });
            await prisma.aiChatSession.update({ where: { id: session.id }, data: { aliasMapEncrypted: encryptAiChatPayload({}, key), expiresAt: sessionExpiry(aiConfig.retentionDays) } });
            return { id: stored.id, ...response };
        }
        const context = await validateAuthorizedContext(prisma, input.companyId, input.body?.context);
        if (classified.tool === "analyze_transaction") {
            throwIfAborted(input.signal);
            input.onEvent?.({ type: "tool.started", tool: classified.tool });
            const result = await analyzeTransaction(prisma, {
                companyId: input.companyId,
                ...context.transaction,
            });
            usedTools.push(classified.tool);
            input.onEvent?.({ type: "tool.completed", tool: classified.tool, status: "completed" });
            await auditTransactionAnalysis(prisma, {
                companyId: input.companyId,
                userId: input.userId,
                analysis: result.analysis,
            });
            const response = composeTransactionResponse(result.analysis);
            const stored = await persistMessage(prisma, key, { sessionId: session.id, role: "assistant", provider: "deterministic", payload: response });
            await prisma.aiChatSession.update({
                where: { id: session.id },
                data: { aliasMapEncrypted: encryptAiChatPayload({}, key), summaryEncrypted: null, expiresAt: sessionExpiry(aiConfig.retentionDays) },
            });
            outcome = "COMPLETED";
            return { id: stored.id, ...response };
        }
        const period = defaultPeriod(input.body);
        const args = classified.tool === "get_insight_explanation"
            ? { insightId: context.insightId }
            : classified.tool === "compare_periods" ? comparisonArgs(period, input.body) : period;
        if (classified.tool === "get_insight_explanation" && !args.insightId) throw httpError(400, "INVALID_AI_CONTEXT", "Selecione um insight autorizado para pedir a explicação.");
        throwIfAborted(input.signal);
        input.onEvent?.({ type: "tool.started", tool: classified.tool });
        const result = await executeAiTool(prisma, { companyId: input.companyId, toolName: classified.tool, args });
        usedTools.push(classified.tool);
        input.onEvent?.({ type: "tool.completed", tool: classified.tool, status: "completed" });
        throwIfAborted(input.signal);
        const consent = await getConsent(prisma, input);
        const externalAllowed = Boolean(provider && aiConfig.providerMode === "openai" && settings?.openAiEnabled && consent.accepted);
        let narrative = deterministicNarrative(classified.intent, result, false);
        let providerLimitations = [];
        if (externalAllowed) {
            try {
                const generated = await provider.generate({
                    canonical: {
                        intent: classified.intent,
                        module: TOOL_MODULES[classified.tool],
                        quality: result.quality,
                        signals: qualitativeSignals(result),
                        limitationCodes: result.limitations.map((_, index) => `LIMITATION_${index + 1}`),
                    },
                    safetyIdentifier: createSafetyIdentifier(input.userId, aiConfig.safetyHmacKey),
                    signal: input.signal,
                });
                throwIfAborted(input.signal);
                if (!validateQualitativeNarrative(generated.response)) throw new Error("AI_QUALITATIVE_OUTPUT_REJECTED");
                narrative = generated.response.narrative;
                providerLimitations = generated.response.limitations;
                providerName = generated.provider;
                model = generated.model;
                inputTokens = generated.inputTokens;
                outputTokens = generated.outputTokens;
            } catch (error) {
                if (input.signal?.aborted || error?.name === "AbortError") throw httpError(499, "AI_GENERATION_CANCELLED", "A geração foi cancelada.");
                outcome = "FALLBACK";
                narrative = deterministicNarrative(classified.intent, result, true);
                providerLimitations = ["O enquadramento externo foi rejeitado ou ficou indisponível."];
            }
        }
        const response = composeResponse({ intent: classified.intent, result, narrative, providerMode: providerName === "openai" ? "openai" : "deterministic", providerLimitations });
        const stored = await persistMessage(prisma, key, { sessionId: session.id, role: "assistant", provider: providerName, model, inputTokens, outputTokens, payload: response });
        await prisma.aiChatSession.update({
            where: { id: session.id },
            data: { aliasMapEncrypted: encryptAiChatPayload({}, key), summaryEncrypted: null, expiresAt: sessionExpiry(aiConfig.retentionDays) },
        });
        outcome ??= "COMPLETED";
        return { id: stored.id, ...response };
    } catch (error) {
        if (accepted) {
            outcome = error?.code === "AI_GENERATION_CANCELLED" || input.signal?.aborted ? "CANCELLED" : "FAILED";
            if (session) {
                await prisma.aiChatSession.update({ where: { id: session.id }, data: { aliasMapEncrypted: encryptAiChatPayload({}, key), summaryEncrypted: null } }).catch(() => {});
            }
            if (outcome === "CANCELLED" && session) {
                await persistMessage(prisma, key, { sessionId: session.id, role: "assistant", status: "CANCELLED", provider: providerName, model, payload: { payloadVersion: PAYLOAD_VERSION, status: "CANCELLED", facts: [], answer: "Geração cancelada.", limitations: [] } }).catch(() => {});
            }
        }
        throw error;
    } finally {
        if (accepted && session && outcome) {
            await prisma.aiUsageEvent.create({ data: { companyId: input.companyId, userId: input.userId, sessionId: session.id, provider: providerName, model, toolCodes: [...new Set(usedTools)], outcome, durationMs: Date.now() - startedAt, inputTokens, outputTokens } }).catch(() => {});
        }
        activeGenerations.delete(lockKey);
        await releaseDistributedGenerationLock(input.redisClient, distributedKey, distributedToken).catch(() => {});
    }
}

export async function setChatMessageFeedback(prisma, input) {
    if (!new Set(["USEFUL", "NOT_USEFUL"]).has(input.feedback)) throw httpError(400, "INVALID_AI_FEEDBACK", "Feedback inválido");
    const message = await prisma.aiChatMessage.findFirst({ where: { id: input.messageId, role: "assistant", session: { companyId: input.companyId, userId: input.userId } } });
    if (!message) throw httpError(404, "AI_CHAT_MESSAGE_NOT_FOUND", "Mensagem não encontrada");
    return prisma.aiChatMessage.update({ where: { id: message.id }, data: { feedback: input.feedback } });
}
