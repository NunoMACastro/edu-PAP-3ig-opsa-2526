/**
 * @file Rotas de previsão de tesouraria da MF3.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { validateForecastQuery } from "./cashflowForecastFilters.js";
import { buildCashflowForecast } from "./cashflowForecastService.js";

/**
 * Envia erros HTTP num formato JSON consistente com o contrato da API.
 *
 * @param res - Resposta Express usada para enviar o erro ao cliente.
 * @param error - Erro capturado durante a operação.
 * @returns Resposta HTTP de erro enviada no formato JSON contratado.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/**
 * Constrói router `/api/treasury/forecast`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @param props - Propriedades recebidas pelo componente React.
 * @returns {import("express").Router} Router Express.
 */
export function buildCashflowForecastRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.REPORTS_READ),
        requireRole("ADMIN", "GESTOR"),
    ];

    router.get("/forecast", guards, async (req, res) => {
        try {
            const range = validateForecastQuery(req.query);
            const forecast = await buildCashflowForecast(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                ...range,
            });
            return res.status(200).json({ forecast });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
