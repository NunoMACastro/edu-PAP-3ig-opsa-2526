/**
 * @file Provas negativas dos limites, scopes, leases e lifecycle da IA v2.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    claimNextAnalysisRun,
    createAnalysisRun,
    listAiRecords,
    processAnalysisRun,
    updateAiRecordStatus,
    validateAnalysisScopes,
} from "../../src/modules/ai/aiAnalysisService.js";
import { reserveAtomicLimits } from "../../src/modules/ai/aiProtection.js";
import { encryptAiChatPayload } from "../../src/modules/ai/aiChatCrypto.js";
import { createChatSession, listChatMessages, listChatSessions, sendChatMessage } from "../../src/modules/ai/aiChatService.js";
import { FakeProvider } from "../../src/modules/ai/aiChatProvider.js";
import { loadApiEnv } from "../../src/config/env.js";

test("scopes rejeitam códigos desconhecidos e SUGGESTIONS sem INSIGHTS", () => {
    assert.deepEqual(validateAnalysisScopes(["alerts", "insights"]), ["INSIGHTS", "ALERTS"]);
    assert.throws(() => validateAnalysisScopes(["SUGGESTIONS"]), { code: "INVALID_AI_ANALYSIS_SCOPES" });
    assert.throws(() => validateAnalysisScopes(["INSIGHTS", "UNKNOWN"]), { code: "INVALID_AI_ANALYSIS_SCOPES" });
});

test("criação humana do run e AuditLog usam a mesma transação", async () => {
    let transactionCount = 0;
    let auditData;
    const prisma = {
        $transaction: async (callback) => { transactionCount += 1; return callback(prisma); },
        aiAnalysisRun: { create: async ({ data }) => ({ id: "run-1", ...data }) },
        auditLog: { create: async ({ data }) => { auditData = data; return { id: "audit-1", ...data }; } },
    };
    const run = await createAnalysisRun(prisma, { companyId: "company", userId: "user", fromDate: new Date("2026-01-01"), toDate: new Date("2026-01-31"), scopes: ["INSIGHTS"] });
    assert.equal(transactionCount, 1);
    assert.equal(run.status, "QUEUED");
    assert.equal(auditData.entityId, run.id);
    assert.deepEqual(auditData.details.scopes, ["INSIGHTS"]);
});

test("filtros de período, status, regra e origem alteram a query persistida", async () => {
    let receivedWhere;
    const prisma = { aiInsight: {
        findMany: async ({ where }) => { receivedWhere = where; return []; },
        count: async () => 0,
    } };
    await listAiRecords(prisma, "aiInsight", { companyId: "company", query: { from: "2026-01-01", to: "2026-01-31", status: "open", ruleCode: "LOW_OPERATING_MARGIN", origin: "system" } });
    assert.equal(receivedWhere.companyId, "company");
    assert.equal(receivedWhere.status, "OPEN");
    assert.equal(receivedWhere.ruleCode, "LOW_OPERATING_MARGIN");
    assert.equal(receivedWhere.origin, "SYSTEM");
    assert.equal(receivedWhere.periodFrom.gte instanceof Date, true);
    assert.equal(receivedWhere.periodTo.lte instanceof Date, true);
});

function fakeRedis() {
    const counters = new Map();
    return {
        isOpen: true,
        counters,
        async eval(_script, { keys, arguments: args }) {
            for (let index = 0; index < keys.length; index += 1) {
                const current = counters.get(keys[index]) ?? 0;
                if (current >= Number(args[index * 2])) return [0, index + 1, current];
            }
            const values = keys.map((key) => {
                const next = (counters.get(key) ?? 0) + 1;
                counters.set(key, next);
                return next;
            });
            return [1, ...values];
        },
    };
}

test("reserva Redis concorrente nunca ultrapassa o menor limite", async () => {
    const redis = fakeRedis();
    const attempts = await Promise.allSettled(Array.from({ length: 20 }, () => reserveAtomicLimits(redis, [
        { key: "user", limit: 2, ttlMs: 60_000, code: "AI_RATE_LIMITED" },
        { key: "company", limit: 5, ttlMs: 60_000, code: "AI_RATE_LIMITED" },
    ], { failClosed: true })));
    assert.equal(attempts.filter((entry) => entry.status === "fulfilled").length, 2);
    assert.equal(redis.counters.get("user"), 2);
    assert.equal(redis.counters.get("company"), 2);
});

test("proteção de quota falha fechada quando Redis não está disponível", async () => {
    await assert.rejects(
        reserveAtomicLimits(null, [{ key: "user", limit: 1, ttlMs: 60_000 }], { failClosed: true }),
        { code: "AI_RATE_LIMIT_UNAVAILABLE" },
    );
});

test("chat ativo exige cifra e modo OpenAI exige modelo explícito", () => {
    assert.throws(() => loadApiEnv({ AI_CHAT_ENABLED: "true" }), /AI_CHAT_ENCRYPTION_KEY/);
    assert.throws(() => loadApiEnv({
        AI_CHAT_ENABLED: "true",
        AI_CHAT_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString("base64"),
        AI_PROVIDER_MODE: "openai",
        OPENAI_API_KEY: "test-only",
    }), /OPENAI_MODEL/);
});

test("lease ativo não é roubado e lease expirado é reclamado", async () => {
    const now = new Date("2026-07-12T20:00:00.000Z");
    const active = { id: "run-active", status: "RUNNING", attempts: 1, leaseExpiresAt: new Date(now.getTime() + 60_000), createdAt: now };
    const expired = { id: "run-expired", status: "RUNNING", attempts: 1, leaseExpiresAt: new Date(now.getTime() - 1), createdAt: now, startedAt: now };
    let selected = active;
    const prisma = {
        $transaction: async (callback) => callback(prisma),
        aiAnalysisRun: {
            findFirst: async () => selected === active ? null : selected,
            updateMany: async ({ where, data }) => {
                if (where.id !== expired.id) return { count: 0 };
                const nextAttempts = expired.attempts + 1;
                Object.assign(expired, data, { attempts: nextAttempts });
                return { count: 1 };
            },
            findUnique: async () => expired,
        },
    };
    assert.equal(await claimNextAnalysisRun(prisma, "worker-a", { now }), null);
    selected = expired;
    const claimed = await claimNextAnalysisRun(prisma, "worker-b", { now, leaseMs: 30_000 });
    assert.equal(claimed.claimedBy, "worker-b");
    assert.equal(claimed.attempts, 2);
});

test("a terceira falha termina definitivamente com código estável", async () => {
    let terminalUpdate;
    const prisma = {
        treasuryAccount: { findMany: async () => [{ currentBalanceCents: 0 }] },
        saleDocument: { findMany: async () => [] },
        purchaseDocument: { findMany: async () => [] },
        aiAnalysisRun: { updateMany: async (query) => { terminalUpdate = query; return { count: 1 }; } },
    };
    await assert.rejects(processAnalysisRun(prisma, {
        id: "run", companyId: "company", claimedBy: "worker", attempts: 3,
        fromDate: new Date("2026-01-01T00:00:00Z"), toDate: new Date("2026-01-31T23:59:59Z"),
    }, { maxAttempts: 3, toolBudgetMs: -1 }));
    assert.equal(terminalUpdate.data.status, "FAILED");
    assert.equal(terminalUpdate.data.errorCode, "AI_ANALYSIS_RETRIES_EXHAUSTED");
});

test("lifecycle otimista tem um único vencedor e estados terminais não reabrem", async () => {
    const row = { id: "insight-1", companyId: "company", status: "OPEN", updatedAt: new Date("2026-07-12T20:00:00Z") };
    let auditCount = 0;
    const prisma = {
        $transaction: async (callback) => callback(prisma),
        aiInsight: {
            findFirst: async () => ({ ...row }),
            updateMany: async ({ where, data }) => {
                if (row.status !== where.status || row.updatedAt.getTime() !== where.updatedAt.getTime()) return { count: 0 };
                Object.assign(row, data, { updatedAt: new Date(row.updatedAt.getTime() + 1) });
                return { count: 1 };
            },
            findUnique: async () => ({ ...row }),
        },
        auditLog: { create: async ({ data }) => { auditCount += 1; return { id: "audit", ...data }; } },
    };
    const outcomes = await Promise.allSettled([
        updateAiRecordStatus(prisma, "aiInsight", { id: row.id, companyId: row.companyId, userId: "user", status: "RESOLVED" }),
        updateAiRecordStatus(prisma, "aiInsight", { id: row.id, companyId: row.companyId, userId: "user", status: "DISMISSED" }),
    ]);
    assert.equal(outcomes.filter((entry) => entry.status === "fulfilled").length, 1);
    assert.equal(auditCount, 1);
    await assert.rejects(
        updateAiRecordStatus(prisma, "aiInsight", { id: row.id, companyId: row.companyId, userId: "user", status: "OPEN" }),
        { code: "INVALID_AI_STATUS_TRANSITION" },
    );
});

test("provider recebe apenas intenção canónica e a API executa uma única tool local", async () => {
    const encryptionKey = Buffer.alloc(32, 9);
    const session = { id: "session", companyId: "company", userId: "user", aliasMapEncrypted: encryptAiChatPayload({ OLD_ALIAS: { entityKey: "ITEM:id" } }, encryptionKey) };
    const storedMessages = [];
    let groupByCalls = 0;
    let entityQueries = 0;
    const forbiddenScan = async () => { throw new Error("scan de entidades proibido"); };
    const prisma = {
        aiChatSession: {
            findFirst: async () => session,
            update: async ({ data }) => { Object.assign(session, data); return session; },
        },
        aiChatMessage: {
            count: async () => 0,
            create: async ({ data }) => { const row = { id: `message-${storedMessages.length + 1}`, createdAt: new Date(), ...data }; storedMessages.push(row); return row; },
        },
        companyAiSettings: { findUnique: async () => ({ openAiEnabled: true, policyVersion: "2026-01", userDailyTurnLimit: 50, companyDailyTurnLimit: 500 }) },
        aiUserConsent: { findUnique: async () => ({ policyVersion: "2026-01", acceptedAt: new Date(), revokedAt: null }) },
        aiUsageEvent: { create: async ({ data }) => data },
        journalEntryLine: { groupBy: async () => { groupByCalls += 1; return [
            { accountId: "revenue", _sum: { debitCents: 0, creditCents: 10_000 }, _count: { _all: 1 } },
            { accountId: "cost", _sum: { debitCents: 5_000, creditCents: 0 }, _count: { _all: 1 } },
        ]; } },
        account: { findMany: async () => [{ id: "revenue", code: "71" }, { id: "cost", code: "62" }] },
        customer: { findMany: forbiddenScan, findFirst: async () => { entityQueries += 1; return { id: "customer-real" }; } }, supplier: { findMany: forbiddenScan }, item: { findMany: forbiddenScan },
    };
    const redisClient = {
        isOpen: true,
        set: async () => "OK",
        eval: async (_script, options) => options.arguments.length === 1 ? 1 : [1, 1, 1, 1],
    };
    const provider = new FakeProvider(async ({ canonical }) => ({
        response: { status: "ANSWERED", narrative: "A margem requer acompanhamento humano.", limitations: [], followUpSuggestions: ["Rever o período anterior?"] },
        inputTokens: 8, outputTokens: 5, model: "test-model", provider: "openai", canonical,
    }));
    const response = await sendChatMessage(prisma, {
        chatEnabled: true,
        chatEncryptionKey: encryptionKey.toString("base64"),
        safetyHmacKey: "test-safety-key-with-at-least-32-bytes",
        retentionDays: 90,
        providerMode: "openai",
        userDailyTurnLimit: 50,
        companyDailyTurnLimit: 500,
        maxMessagesPerSession: 200,
        messageRateLimit: 5,
        failClosedRateLimits: true,
    }, provider, {
        companyId: "company", userId: "user", sessionId: session.id,
        body: { message: "Qual é a margem com receita de 500 euros?", context: { module: "accounting", entity: { type: "CUSTOMER", id: "customer-real" }, period: { from: "2026-01-01", to: "2026-01-31" } } },
        redisClient,
    });
    assert.equal(groupByCalls, 1);
    assert.equal(entityQueries, 1);
    assert.equal(response.payloadVersion, 2);
    assert.equal(response.facts.some((fact) => fact.metric === "operatingMarginBps"), true);
    assert.deepEqual(provider.payloads[0].canonical.intent, "margin");
    const outbound = JSON.stringify(provider.payloads[0]);
    assert.equal(outbound.includes("Qual é a margem"), false);
    assert.equal(outbound.includes("500"), false);
    assert.equal(outbound.includes("company"), false);
    assert.equal(storedMessages.length, 2);
});

test("recusas, cancelamentos e falhas aceites consomem turno e geram outcome", async () => {
    const encryptionKey = Buffer.alloc(32, 4);
    const session = { id: "session-outcomes", companyId: "company", userId: "user", aliasMapEncrypted: encryptAiChatPayload({}, encryptionKey) };
    const messages = [];
    const outcomes = [];
    const prisma = {
        aiChatSession: { findFirst: async () => session, update: async ({ data }) => Object.assign(session, data) },
        aiChatMessage: {
            count: async () => messages.length,
            create: async ({ data }) => { const row = { id: `m-${messages.length + 1}`, ...data }; messages.push(row); return row; },
        },
        companyAiSettings: { findUnique: async () => ({ openAiEnabled: false, policyVersion: "2026-01" }) },
        aiUserConsent: { findUnique: async () => null },
        aiUsageEvent: { create: async ({ data }) => { outcomes.push(data.outcome); return data; } },
    };
    const redisClient = { isOpen: true, set: async () => "OK", eval: async (_script, options) => options.arguments.length === 1 ? 1 : [1, 1, 1, 1] };
    const config = {
        chatEnabled: true, chatEncryptionKey: encryptionKey.toString("base64"), safetyHmacKey: "test-safety-key-with-at-least-32-bytes",
        retentionDays: 90, providerMode: "disabled", userDailyTurnLimit: 50, companyDailyTurnLimit: 500,
        maxMessagesPerSession: 200, messageRateLimit: 5, failClosedRateLimits: true,
    };
    await sendChatMessage(prisma, config, null, { companyId: "company", userId: "user", sessionId: session.id, body: { message: "Como está o tempo?" }, redisClient });
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(
        sendChatMessage(prisma, config, null, { companyId: "company", userId: "user", sessionId: session.id, body: { message: "Qual é a margem?" }, redisClient, signal: controller.signal }),
        { code: "AI_GENERATION_CANCELLED" },
    );
    await assert.rejects(
        sendChatMessage(prisma, config, null, { companyId: "company", userId: "user", sessionId: session.id, body: { message: "Qual é a margem?", context: { period: { from: "2026-01-01", to: "2026-01-31" } } }, redisClient }),
    );
    assert.deepEqual(outcomes, ["REFUSED", "CANCELLED", "FAILED"]);
});

test("paginação preserva as sessões e mensagens mais recentes acima dos caps de página", async () => {
    const key = Buffer.alloc(32, 6);
    const config = { chatEnabled: true, chatEncryptionKey: key.toString("base64") };
    const sessions = Array.from({ length: 21 }, (_, index) => ({
        id: `session-${String(index).padStart(2, "0")}`,
        companyId: "company", userId: "user",
        titleEncrypted: encryptAiChatPayload({ title: `Conversa ${index}` }, key),
        createdAt: new Date(2026, 0, 1, 0, index), updatedAt: new Date(2026, 0, 1, 0, index), expiresAt: new Date(2027, 0, 1),
    })).reverse();
    const messageRows = Array.from({ length: 201 }, (_, index) => ({
        id: `message-${String(index).padStart(3, "0")}`,
        sessionId: "session-20", role: index % 2 ? "assistant" : "user", status: "COMPLETED", provider: "local", model: null, feedback: null,
        createdAt: new Date(2026, 0, 1, 0, index), payloadEncrypted: encryptAiChatPayload({ payloadVersion: 2, text: `Mensagem ${index}`, facts: [] }, key),
    })).reverse();
    let messagePage = 0;
    const prisma = {
        aiChatSession: {
            findMany: async () => sessions,
            findFirst: async () => sessions.find((entry) => entry.id === "session-20"),
        },
        aiChatMessage: { findMany: async () => messageRows.slice(messagePage++ * 50, messagePage * 50 + 1) },
    };
    const sessionPage = await listChatSessions(prisma, config, { companyId: "company", userId: "user" });
    assert.equal(sessionPage.sessions.length, 20);
    assert.equal(sessionPage.sessions[0].title, "Conversa 20");
    assert.equal(sessionPage.pageInfo.hasNextPage, true);
    const first = await listChatMessages(prisma, config, { companyId: "company", userId: "user", sessionId: "session-20" });
    assert.equal(first.messages.length, 50);
    assert.equal(first.messages.at(-1).text, "Mensagem 200");
    const second = await listChatMessages(prisma, config, { companyId: "company", userId: "user", sessionId: "session-20", cursor: first.pageInfo.nextCursor });
    assert.equal(second.messages.length, 50);
    assert.equal(new Set([...first.messages, ...second.messages].map((message) => message.id)).size, 100);
});

test("caps bloqueiam apenas novas sessões e novos envios com erros estáveis", async () => {
    const key = Buffer.alloc(32, 8);
    const config = { chatEnabled: true, chatEncryptionKey: key.toString("base64"), safetyHmacKey: "test-safety-key-with-at-least-32-bytes", maxActiveSessionsPerUser: 20, maxMessagesPerSession: 200, retentionDays: 90 };
    await assert.rejects(
        createChatSession({ aiChatSession: { count: async () => 20 } }, config, { companyId: "company", userId: "user" }),
        { code: "AI_SESSION_LIMIT_REACHED" },
    );
    const prisma = {
        aiChatSession: { findFirst: async () => ({ id: "full", companyId: "company", userId: "user", aliasMapEncrypted: encryptAiChatPayload({}, key) }) },
        aiChatMessage: { count: async () => 199 },
    };
    await assert.rejects(
        sendChatMessage(prisma, config, null, { companyId: "company", userId: "user", sessionId: "full", body: { message: "Qual é a margem?" } }),
        { code: "AI_MESSAGE_LIMIT_REACHED" },
    );
});
