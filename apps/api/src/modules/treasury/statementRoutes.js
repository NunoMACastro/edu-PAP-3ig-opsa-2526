/**
 * @file Rotas de importação de extratos e sugestões de reconciliação.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { importBankStatement, suggestReconciliations } from "./statementImportService.js";

/**
 * Envia erros HTTP no formato comum da API.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {Error | { code?: string, message?: string }} error - Erro apanhado na rota.
 * @returns {import("express").Response} Resposta HTTP formatada.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res
        .status(response.status)
        .json({ error: response.code, message: response.message });
}

/**
 * Constrói as rotas de extratos bancários e reconciliação.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências da rota.
 * @returns {import("express").Router} Router Express.
 */
export function buildStatementRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.TREASURY_WRITE),
        requireRole("ADMIN", "CONTABILISTA", "OPERACIONAL"),
    ];

    router.post("/statements/import", guards, async (req, res) => {
        try {
            const result = await importBankStatement(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                input: req.body,
            });
            return res.status(201).json(result);
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/reconciliations/suggestions", guards, async (req, res) => {
        try {
            // A empresa vem do contexto autenticado; o body nunca decide ownership.
            const result = await suggestReconciliations(prisma, {
                companyId: req.companyId,
                input: req.body,
            });

            res.set("X-OPSA-Reconciliation-Duration-Ms", String(result.durationMs));
            return res.status(200).json(result);
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}