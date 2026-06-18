// apps/api/src/modules/audit/auditLogRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // A API devolve erros controlados em vez de expor exceções internas.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/** Constrói router de auditoria RF47. */
export function buildAuditLogRoutes({ prisma }) {
    const router = Router();
    // Só Admin e Auditor podem consultar o trilho de auditoria.
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "AUDITOR")];

    router.get("/logs", guards, async (req, res) => {
        try {
            // A consulta usa sempre a empresa ativa e limita o volume devolvido.
            const logs = await prisma.auditLog.findMany({ where: { companyId: req.companyId }, orderBy: { createdAt: "desc" }, take: 100 });
            return res.status(200).json({ logs });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}