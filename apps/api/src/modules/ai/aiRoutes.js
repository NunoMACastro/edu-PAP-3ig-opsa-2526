/**
 * @file Rotas MF4 para IA assistiva, insights, sugestoes, perguntas e alertas.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import {
    answerAiQuestion,
    explainAiInsight,
    generateAiInsights,
    generateAiSuggestions,
    generateSmartAlerts,
} from "./aiService.js";
import { validateInsightRange } from "./aiValidators.js";

/**
 * Envia erro HTTP normalizado.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {unknown} error - Erro capturado.
 * @returns {import("express").Response} Resposta JSON.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({
        error: response.code,
        message: response.message,
        details: response.details,
    });
}

/**
 * Monta as rotas de IA MF4.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependencias.
 * @returns {Router} Router Express configurado.
 */
export function buildAiRoutes({ prisma }) {
    const router = Router();
    const baseGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.AI_READ),
    ];
    const managerGuards = [...baseGuards, requireRole("ADMIN", "GESTOR")];
    const analystGuards = [
        ...baseGuards,
        requireRole("ADMIN", "GESTOR", "CONTABILISTA"),
    ];

    router.get("/insights", analystGuards, async (req, res) => {
        try {
            const range = validateInsightRange(req.query);
            const insights = await generateAiInsights(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                ...range,
            });
            return res.status(200).json({ insights });
        } catch (error) {
            return sendError(res, error);
        }
    });

    // apps/api/src/modules/ai/aiRoutes.js
    router.get("/insights/:id/explanation", baseGuards, async (req, res) => {
        try {
            const explanation = await explainAiInsight(prisma, {
                // A empresa ativa é resolvida pelos guards no backend; nunca vem do body ou query string.
                companyId: req.companyId,
                insightId: req.params.id,
            });

            return res.status(200).json({ explanation });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/suggestions", managerGuards, async (req, res) => {
        try {
            const suggestions = await generateAiSuggestions(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
            });
            return res.status(200).json({ suggestions });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/questions", analystGuards, async (req, res) => {
        try {
            const answer = await answerAiQuestion(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                body: req.body,
            });
            return res.status(201).json({ answer });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/alerts", managerGuards, async (req, res) => {
        try {
            const range = validateInsightRange(req.query);
            const alerts = await generateSmartAlerts(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                ...range,
            });
            return res.status(200).json({ alerts });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
