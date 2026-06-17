// real_dev/api/src/modules/ai/aiInsightRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { validateInsightQuery } from "./aiInsightFilters.js";
import { generateAiInsights } from "./aiInsightService.js";
import { getInsightExplanation } from "./aiExplanationService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // A API devolve sempre o mesmo formato de erro para a UI conseguir mostrar
    // mensagens claras sem conhecer detalhes internos do Express ou do Prisma.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/**
 * Constrói router de insights automáticos.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildAiInsightRoutes({ prisma }) {
    const router = Router();
    const guards = [
        // A ordem dos guards é pedagógica e funcional:
        // primeiro confirma sessão, depois empresa ativa, depois permissão e role.
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.REPORTS_READ),
        requireRole("ADMIN", "GESTOR", "CONTABILISTA"),
    ];

    router.get("/insights", guards, async (req, res) => {
        try {
            const range = validateInsightQuery(req.query);
            // O frontend só envia datas; empresa e utilizador vêm da sessão.
            // Isto protege ownership e mantém a UI fora das decisões de autorização.
            const insights = await generateAiInsights(prisma, { companyId: req.companyId, userId: req.user.id, ...range });
            return res.status(200).json({ insights });
        } catch (error) {
            return sendError(res, error);
        }
    });

    // adicionar dentro de buildAiInsightRoutes, antes de `return router`
    router.get("/insights/:id/explanation", guards, async (req, res) => {
        try {
            // `req.params.id` identifica o insight; `req.companyId` confirma ownership.
            // O aluno deve evitar endpoints que procuram apenas por id global.
            const explanation = await getInsightExplanation(prisma, { companyId: req.companyId, insightId: req.params.id });
            return res.status(200).json({ explanation });
        } catch (error) {
            return sendError(res, error);
        }
    });
    return router;
}