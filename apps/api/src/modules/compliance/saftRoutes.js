/**
 * @file Rotas de compliance fiscal da MF3.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { validateSaftExportQuery } from "./saftValidators.js";
import { buildSaftExport } from "./saftService.js";

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
 * Constrói o router de compliance fiscal da API.
 * Liga o endpoint SAF-T aos guards de leitura contabilística e ao service de exportação.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildSaftRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.COMPLIANCE_READ),
        requireRole("ADMIN", "CONTABILISTA", "AUDITOR"),
    ];

    router.get("/saft", guards, async (req, res) => {
        try {
            const range = validateSaftExportQuery(req.query);
            const exportResult = await buildSaftExport(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                ...range,
            });
            return res.status(200).json(exportResult);
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
