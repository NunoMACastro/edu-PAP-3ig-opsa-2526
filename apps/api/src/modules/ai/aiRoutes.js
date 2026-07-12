/**
 * @file APIs canónicas da IA OPSA e adapters de compatibilidade MF4.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { createSafetyIdentifier } from "./aiChatCrypto.js";
import {
    createAnalysisRun, explainAiInsight, getAiSettings, getAnalysisRun, listAiRecords,
    updateAiRecordStatus, updateAiSettings,
} from "./aiAnalysisService.js";
import {
    acceptConsent, createChatSession, deleteChatSession, getAiCapabilities, getConsent,
    listChatMessages, listChatSessions, revokeConsent, sendChatMessage,
    setChatMessageFeedback,
} from "./aiChatService.js";
import { createAiChatProvider } from "./aiChatProvider.js";
import { validateMetricPeriod } from "./aiMetricCatalog.js";
import { reserveAtomicLimits } from "./aiProtection.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message, details: response.details });
}

function sendSse(res, event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/** Monta rotas sem efetuar qualquer chamada externa no arranque. */
export function buildAiRoutes({ prisma, apiEnv, redisClient = null, providerOverride = null }) {
    const router = Router();
    const aiConfig = apiEnv?.ai ?? {
        chatEnabled: false, providerMode: "disabled", model: null, retentionDays: 90,
        userDailyTurnLimit: 50, companyDailyTurnLimit: 500,
    };
    const provider = createAiChatProvider(aiConfig, providerOverride);
    const authenticated = [requireAuth(prisma), requireCompanyContext(prisma)];
    const chatGuards = [...authenticated, requirePermission(Permission.AI_CHAT_USE)];
    const analysisGuards = [...authenticated, requirePermission(Permission.AI_ANALYSIS_RUN)];
    const insightGuards = [...authenticated, requirePermission(Permission.AI_INSIGHTS_READ)];
    const insightManageGuards = [...authenticated, requirePermission(Permission.AI_INSIGHTS_MANAGE)];
    const suggestionGuards = [...authenticated, requirePermission(Permission.AI_SUGGESTIONS_READ)];
    const suggestionManageGuards = [...authenticated, requirePermission(Permission.AI_SUGGESTIONS_MANAGE)];
    const alertGuards = [...authenticated, requirePermission(Permission.AI_ALERTS_READ)];
    const alertManageGuards = [...authenticated, requirePermission(Permission.AI_ALERTS_MANAGE)];
    const adminGuards = [...authenticated, requirePermission(Permission.AI_SETTINGS_MANAGE)];

    async function reserveManualAnalysis(input) {
        const prefix = apiEnv?.redisKeyPrefix ?? "opsa";
        const actor = createSafetyIdentifier(input.userId, aiConfig.safetyHmacKey);
        const company = createSafetyIdentifier(input.companyId, aiConfig.safetyHmacKey);
        await reserveAtomicLimits(redisClient, [
            { key: `${prefix}:ai:analysis:user:${actor}`, limit: aiConfig.analysisUserRateLimit ?? 2, ttlMs: 600_000, code: "AI_ANALYSIS_RATE_LIMITED", message: "Limite de análises manuais do utilizador atingido." },
            { key: `${prefix}:ai:analysis:company:${company}`, limit: aiConfig.analysisCompanyRateLimit ?? 5, ttlMs: 600_000, code: "AI_ANALYSIS_RATE_LIMITED", message: "Limite de análises manuais da empresa atingido." },
        ], { failClosed: aiConfig.failClosedRateLimits });
    }

    router.post("/analysis-runs", analysisGuards, async (req, res) => {
        try {
            const period = validateMetricPeriod({ from: req.body?.from, to: req.body?.to, topN: 10 });
            await reserveManualAnalysis({ companyId: req.companyId, userId: req.user.id });
            const run = await createAnalysisRun(prisma, { companyId: req.companyId, userId: req.user.id, fromDate: period.fromDate, toDate: period.toDate, scopes: req.body?.scopes });
            return res.status(202).json({ run });
        } catch (error) { return sendError(res, error); }
    });

    router.get("/analysis-runs/:id", insightGuards, async (req, res) => {
        try { return res.json({ run: await getAnalysisRun(prisma, { companyId: req.companyId, runId: req.params.id }) }); }
        catch (error) { return sendError(res, error); }
    });

    router.get("/insights", insightGuards, async (req, res) => {
        try { const result = await listAiRecords(prisma, "aiInsight", { companyId: req.companyId, query: req.query }); return res.json({ insights: result.items, pagination: result.pagination }); }
        catch (error) { return sendError(res, error); }
    });
    router.get("/suggestions", suggestionGuards, async (req, res) => {
        try { const result = await listAiRecords(prisma, "aiActionSuggestion", { companyId: req.companyId, query: req.query }); return res.json({ suggestions: result.items, pagination: result.pagination }); }
        catch (error) { return sendError(res, error); }
    });
    router.get("/alerts", alertGuards, async (req, res) => {
        try { const result = await listAiRecords(prisma, "smartAlert", { companyId: req.companyId, query: req.query }); return res.json({ alerts: result.items, pagination: result.pagination }); }
        catch (error) { return sendError(res, error); }
    });

    router.get("/insights/:id/explanation", insightGuards, async (req, res) => {
        try { return res.json({ explanation: await explainAiInsight(prisma, { companyId: req.companyId, insightId: req.params.id }) }); }
        catch (error) { return sendError(res, error); }
    });

    for (const [path, model, guards] of [
        ["/insights/:id/status", "aiInsight", insightManageGuards],
        ["/suggestions/:id/status", "aiActionSuggestion", suggestionManageGuards],
        ["/alerts/:id/status", "smartAlert", alertManageGuards],
    ]) {
        router.patch(path, guards, async (req, res) => {
            try { const record = await updateAiRecordStatus(prisma, model, { companyId: req.companyId, userId: req.user.id, id: req.params.id, status: req.body?.status, feedback: req.body?.feedback, reason: req.body?.reason }); return res.json({ record }); }
            catch (error) { return sendError(res, error); }
        });
    }

    router.get("/settings", adminGuards, async (req, res) => {
        try {
            const result = await getAiSettings(prisma, req.companyId);
            return res.json({ ...result, provider: { mode: aiConfig.providerMode, configured: Boolean(aiConfig.providerMode === "openai" && aiConfig.openAiApiKey), model: aiConfig.model } });
        }
        catch (error) { return sendError(res, error); }
    });
    router.patch("/settings", adminGuards, async (req, res) => {
        try { return res.json({ settings: await updateAiSettings(prisma, { companyId: req.companyId, userId: req.user.id, body: req.body }) }); }
        catch (error) { return sendError(res, error); }
    });

    router.get("/capabilities", authenticated, async (req, res) => {
        try { return res.json({ capabilities: await getAiCapabilities(prisma, aiConfig, { companyId: req.companyId, userId: req.user.id }) }); }
        catch (error) { return sendError(res, error); }
    });

    router.get("/consent", chatGuards, async (req, res) => {
        try { return res.json({ consent: await getConsent(prisma, { companyId: req.companyId, userId: req.user.id }) }); }
        catch (error) { return sendError(res, error); }
    });
    router.post("/consent", chatGuards, async (req, res) => {
        try { return res.status(201).json({ consent: await acceptConsent(prisma, { companyId: req.companyId, userId: req.user.id }) }); }
        catch (error) { return sendError(res, error); }
    });
    router.delete("/consent", chatGuards, async (req, res) => {
        try { await revokeConsent(prisma, { companyId: req.companyId, userId: req.user.id }); return res.status(204).end(); }
        catch (error) { return sendError(res, error); }
    });

    router.post("/chat/sessions", chatGuards, async (req, res) => {
        try { return res.status(201).json({ session: await createChatSession(prisma, aiConfig, { companyId: req.companyId, userId: req.user.id, title: req.body?.title, redisClient, redisKeyPrefix: apiEnv?.redisKeyPrefix }) }); }
        catch (error) { return sendError(res, error); }
    });
    router.get("/chat/sessions", chatGuards, async (req, res) => {
        try { return res.json(await listChatSessions(prisma, aiConfig, { companyId: req.companyId, userId: req.user.id, cursor: req.query.cursor })); }
        catch (error) { return sendError(res, error); }
    });
    router.get("/chat/sessions/:id/messages", chatGuards, async (req, res) => {
        try { return res.json(await listChatMessages(prisma, aiConfig, { companyId: req.companyId, userId: req.user.id, sessionId: req.params.id, cursor: req.query.cursor })); }
        catch (error) { return sendError(res, error); }
    });
    router.delete("/chat/sessions/:id", chatGuards, async (req, res) => {
        try { await deleteChatSession(prisma, aiConfig, { companyId: req.companyId, userId: req.user.id, sessionId: req.params.id }); return res.status(204).end(); }
        catch (error) { return sendError(res, error); }
    });

    router.post("/chat/sessions/:id/messages", chatGuards, async (req, res) => {
        const abortController = new AbortController();
        let completed = false;
        req.once("aborted", () => abortController.abort());
        res.once("close", () => { if (!completed) abortController.abort(); });
        res.status(200);
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders?.();
        sendSse(res, "message.started", { status: "started" });
        try {
            const response = await sendChatMessage(prisma, aiConfig, provider, { companyId: req.companyId, userId: req.user.id, sessionId: req.params.id, body: req.body, redisClient, redisKeyPrefix: apiEnv?.redisKeyPrefix, signal: abortController.signal, onEvent: (event) => sendSse(res, event.type, { tool: event.tool, status: event.status }) });
            sendSse(res, "message.completed", response);
            completed = true;
            return res.end();
        } catch (error) {
            const response = toHttpError(error);
            sendSse(res, response.code === "AI_GENERATION_CANCELLED" ? "message.cancelled" : "message.failed", { code: response.code, message: response.message, fallbackAvailable: response.status >= 500 });
            completed = true;
            return res.end();
        }
    });

    router.post("/chat/messages/:id/feedback", chatGuards, async (req, res) => {
        try { const message = await setChatMessageFeedback(prisma, { companyId: req.companyId, userId: req.user.id, messageId: req.params.id, feedback: req.body?.feedback }); return res.json({ message: { id: message.id, feedback: message.feedback } }); }
        catch (error) { return sendError(res, error); }
    });

    // Adapter de um turno: não usa Conversations API nem previous_response_id.
    router.post("/questions", chatGuards, async (req, res) => {
        res.setHeader("Deprecation", "true");
        res.setHeader("Sunset", "Thu, 01 Jan 2027 00:00:00 GMT");
        res.setHeader("Link", "</api/ai/chat/sessions>; rel=\"successor-version\"");
        try {
            const session = await createChatSession(prisma, aiConfig, { companyId: req.companyId, userId: req.user.id, title: "Pergunta importada", redisClient, redisKeyPrefix: apiEnv?.redisKeyPrefix });
            const response = await sendChatMessage(prisma, aiConfig, provider, { companyId: req.companyId, userId: req.user.id, sessionId: session.id, body: { ...req.body, message: req.body?.question }, redisClient, redisKeyPrefix: apiEnv?.redisKeyPrefix });
            return res.status(201).json({ answer: { id: response.id, payloadVersion: response.payloadVersion, answer: response.answer, facts: response.facts, intent: response.mode, sources: response.sources ?? response.sourceRefs, limitations: response.limitations } });
        } catch (error) { return sendError(res, error); }
    });

    return router;
}
