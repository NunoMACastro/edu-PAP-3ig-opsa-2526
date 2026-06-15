// apps/api/src/modules/reports/executiveKpiRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateExecutiveKpiQuery } from "./executiveKpiFilters.js";
import { buildExecutiveKpis } from "./executiveKpiService.js";

/**
 * Constrói a route de KPIs executivos.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências da route.
 * @returns {import("express").Router} Router montado em `/api/reports/executive-kpis`.
 */
export function buildExecutiveKpiRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("GESTOR")];
    router.get("/", guards, async (req, res) => {
        try {
            const filters = validateExecutiveKpiQuery(req.query);
            // companyId fica no backend para impedir que um gestor consulte outra empresa por URL.
            return res.status(200).json(await buildExecutiveKpis(prisma, { companyId: req.companyId, userId: req.user.id, ...filters }));
        } catch (error) {
            const httpError = toHttpError(error);
            return res.status(httpError.status).json({ error: httpError.code, message: httpError.message });
        }
    });
    return router;
}