/**
 * @file Rotas de alertas de stock da MF2.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { listStockAlerts, saveStockAlertSetting } from "./stockAlertService.js";

/**
 * Envia erros HTTP num formato JSON consistente com o contrato da API.
 *
 * @param res - Resposta Express usada para enviar o erro ao cliente.
 * @param error - Erro capturado durante a operação.
 * @returns Resposta HTTP de erro enviada no formato JSON contratado.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res
        .status(response.status)
        .json({ error: response.code, message: response.message });
}

/**
 * Monta as rotas Express de alertas de stock com proteção por empresa e permissões.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências da API.
 * @returns Router Express configurado para alertas de stock.
 */
export function buildStockAlertRoutes({ prisma }) {
    const router = Router();
    const readGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.INVENTORY_READ),
    ];
    const writeGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.INVENTORY_WRITE),
    ];

    router.get("/stock-alerts", readGuards, async (req, res) => {
        try {
            const alerts = await listStockAlerts(prisma, req.companyId);
            return res.status(200).json({ alerts });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.put("/stock-alerts/settings", writeGuards, async (req, res) => {
        try {
            const setting = await saveStockAlertSetting(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                input: req.body,
            });
            return res.status(200).json({ setting });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
