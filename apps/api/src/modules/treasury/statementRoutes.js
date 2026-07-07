/**
 * @file Rotas de importação de extratos bancários da MF3.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import {
    importBankStatement,
    suggestReconciliations,
} from "./statementImportService.js";

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
        .json({ error: response.code, message: response.message, details: response.details });
}

/**
 * Constrói o router de importação de extratos bancários.
 * Protege o envio de extratos e delega validação e reconciliação no service.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
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
            const result = await suggestReconciliations(prisma, {
                companyId: req.companyId,
                input: req.body,
            });
            res.set(
                "X-OPSA-Reconciliation-Duration-Ms",
                String(result.durationMs),
            );
            return res.status(200).json(result);
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
