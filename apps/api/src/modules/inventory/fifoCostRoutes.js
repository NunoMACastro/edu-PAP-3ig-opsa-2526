/**
 * @file Rotas de preview FIFO da MF2 com métrica de performance da MF6.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { previewFifoCost } from "./fifoCostService.js";

/**
 * Envia erros HTTP num formato JSON consistente com o contrato da API.
 *
 * @param {import("express").Response} res - Resposta Express usada para enviar o erro ao cliente.
 * @param {Error | { code?: string, message?: string }} error - Erro capturado durante a operação.
 * @returns {import("express").Response} Resposta HTTP de erro enviada no formato JSON contratado.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res
        .status(response.status)
        .json({ error: response.code, message: response.message });
}

/**
 * Constrói router de custo FIFO.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildFifoCostRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.INVENTORY_READ),
    ];

    router.get("/fifo-cost/preview", guards, async (req, res) => {
        try {
            // O preview usa a empresa autenticada e nunca consome camadas FIFO.
            const preview = await previewFifoCost(prisma, {
                companyId: req.companyId,
                itemId: String(req.query.itemId ?? ""),
                warehouseId: String(req.query.warehouseId ?? ""),
                quantity: Number(req.query.quantity),
            });

            return res.status(200).json({ preview });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
