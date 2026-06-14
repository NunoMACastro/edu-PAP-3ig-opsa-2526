// apps/api/src/modules/treasury/cashflowForecastRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateForecastQuery } from "./cashflowForecastFilters.js";
import { buildCashflowForecast } from "./cashflowForecastService.js";

/**
 * Constrói a route de previsão de tesouraria.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências da route.
 * @returns {import("express").Router} Router montado em `/api/treasury/forecast`.
 */
export function buildCashflowForecastRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("GESTOR")];
    router.get("/", guards, async (req, res) => {
        try {
            const filters = validateForecastQuery(req.query);
            // A empresa vem do contexto autenticado; a previsão nunca aceita companyId por query.
            return res.status(200).json(await buildCashflowForecast(prisma, { companyId: req.companyId, userId: req.user.id, ...filters }));
        } catch (error) {
            const httpError = toHttpError(error);
            return res.status(httpError.status).json({ error: httpError.code, message: httpError.message });
        }
    });
    return router;
}