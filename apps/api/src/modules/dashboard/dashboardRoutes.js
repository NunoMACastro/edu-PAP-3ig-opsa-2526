/**
 * @file Endpoint autenticado e read-only do dashboard OPSA.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { buildDashboardSummary } from "./dashboardService.js";

/**
 * Monta a rota GET sem qualquer efeito de escrita.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências da rota.
 * @returns {Router} Router Express do dashboard.
 */
export function buildDashboardRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.DASHBOARD_READ),
    ];

    router.get("/summary", guards, async (req, res) => {
        try {
            const summary = await buildDashboardSummary(prisma, {
                companyId: req.companyId,
                company: req.company,
                userId: req.user.id,
                asOf: req.query.asOf,
            });
            return res.status(200).json({ summary });
        } catch (error) {
            const response = toHttpError(error);
            return res.status(response.status).json({
                error: response.code,
                message: response.message,
            });
        }
    });

    return router;
}
