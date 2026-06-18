// apps/api/src/modules/integrations/integrationLogRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // Mantém o mesmo contrato de erro usado no resto da API.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/** Constrói router de logs de integração RF48. */
export function buildIntegrationLogRoutes({ prisma }) {
    const router = Router();
    // RF48 restringe consulta a Admin.
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN")];

    router.get("/logs", guards, async (req, res) => {
        try {
            // A empresa vem do contexto autenticado; não é aceite como query param.
            const logs = await prisma.integrationLog.findMany({ where: { companyId: req.companyId }, orderBy: { createdAt: "desc" }, take: 100 });
            return res.status(200).json({ logs });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}