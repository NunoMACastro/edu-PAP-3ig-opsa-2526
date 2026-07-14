/**
 * @file Rotas de consulta de auditoria MF4.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { listAuditLogs } from "./auditLogService.js";

/**
 * Envia erro HTTP normalizado.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {unknown} error - Erro capturado.
 * @returns {import("express").Response} Resposta enviada.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({
        error: response.code,
        message: response.message,
        details: response.details,
    });
}

/**
 * Monta rota de auditoria.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependencias.
 * @returns {Router} Router Express.
 */
export function buildAuditLogRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.AUDIT_READ),
    ];

    router.get("/logs", guards, async (req, res) => {
        try {
            const result = await listAuditLogs(prisma, {
                companyId: req.companyId,
                cursor: req.query.cursor,
                limit: req.query.limit,
            });
            return res.status(200).json(result);
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
