// real_dev/api/src/modules/ai/aiSuggestionRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { buildActionSuggestions } from "./aiSuggestionService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // Mantém o contrato de erro igual ao BK-MF4-01 para a UI tratar falhas
    // de forma consistente em todos os ecrãs de IA.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/** Constrói router de suggestions. */
export function buildAiSuggestionRoutes({ prisma }) {
    const router = Router();
    const guards = [
        // Sugestões são decisões de apoio à gestão, por isso a role é mais restrita
        // do que uma consulta operacional comum.
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.REPORTS_READ),
        requireRole("ADMIN", "GESTOR"),
    ];

    router.get("/suggestions", guards, async (req, res) => {
        try {
            // A empresa e o utilizador vêm dos middlewares; a UI não controla ownership.
            const suggestions = await buildActionSuggestions(prisma, { companyId: req.companyId, userId: req.user.id });
            return res.status(200).json({ suggestions });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}