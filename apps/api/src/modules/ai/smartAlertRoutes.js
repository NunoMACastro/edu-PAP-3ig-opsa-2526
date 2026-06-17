// apps/api/src/modules/ai/smartAlertRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import {
    requirePermission,
    requireRole,
} from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { generateSmartAlerts } from "./smartAlertService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // Formato comum de erro para a UI conseguir mostrar uma mensagem em PT-PT.
    return res
        .status(response.status)
        .json({ error: response.code, message: response.message });
}

/** Constrói router de alerts. */
export function buildSmartAlertRoutes({ prisma }) {
    const router = Router();
    const guards = [
        // Alertas inteligentes podem influenciar decisões de gestão,
        // por isso exigem autenticação, empresa ativa, permissão e role.
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.REPORTS_READ),
        requireRole("ADMIN", "GESTOR"),
    ];

    router.get("/alerts", guards, async (req, res) => {
        try {
            // A rota não recebe companyId; usa o contexto multiempresa resolvido no backend.
            const alerts = await generateSmartAlerts(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
            });
            return res.status(200).json({ alerts });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}