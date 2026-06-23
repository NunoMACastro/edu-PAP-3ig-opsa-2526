/**
 * @file Rotas de movimentos de stock da MF2.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import {
    createStockMovement,
    listStockMovements,
} from "./stockMovementService.js";

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
 * Constrói router de inventário.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @param props - Propriedades recebidas pelo componente React.
 * @returns {import("express").Router} Router Express.
 */
export function buildStockMovementRoutes({ prisma }) {
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

    router.get("/stock-movements", readGuards, async (req, res) => {
        try {
            const movements = await listStockMovements(prisma, req.companyId);
            return res.status(200).json({ movements });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/stock-movements", writeGuards, async (req, res) => {
        try {
            const movement = await createStockMovement(
                prisma,
                req.companyId,
                req.user.id,
                req.body,
            );
            return res.status(201).json({ movement });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
