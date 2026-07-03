/**
 * @file Rotas de contagens físicas da MF2.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import {
    createInventoryCount,
    listInventoryCounts,
    postInventoryCount,
    saveInventoryCountLines,
} from "./inventoryCountService.js";

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
 * Monta as rotas Express de contagens físicas com autenticação, empresa e permissões.
 *
 * @returns Router Express configurado para contagens físicas.
 */
export function buildInventoryCountRoutes({ prisma }) {
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

    router.get("/counts", readGuards, async (req, res) => {
        try {
            const counts = await listInventoryCounts(prisma, req.companyId);
            return res.status(200).json({ counts });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/counts", writeGuards, async (req, res) => {
        try {
            const count = await createInventoryCount(
                prisma,
                req.companyId,
                req.user.id,
                req.body,
            );
            return res.status(201).json({ count });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/counts/:id/lines", writeGuards, async (req, res) => {
        try {
            const lines = await saveInventoryCountLines(
                prisma,
                req.companyId,
                req.user.id,
                req.params.id,
                req.body,
            );
            return res.status(200).json({ lines });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/counts/:id/post", writeGuards, async (req, res) => {
        try {
            const count = await postInventoryCount(
                prisma,
                req.companyId,
                req.user.id,
                req.params.id,
            );
            return res.status(200).json({ count });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
