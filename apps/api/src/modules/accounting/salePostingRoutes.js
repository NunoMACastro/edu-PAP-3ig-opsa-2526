/**
 * @file Rotas de contabilização automática de vendas.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { postSaleDocument } from "./salePostingService.js";

/**
 * Envia erro JSON seguro.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {unknown} error - Erro capturado.
 * @returns {import("express").Response} Resposta HTTP.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res
        .status(response.status)
        .json({ error: response.code, message: response.message });
}

/**
 * Constrói o router de contabilização automática de vendas.
 * Expõe a ação protegida que transforma uma venda emitida em lançamento contabilístico.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildSalePostingRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ACCOUNTING_WRITE),
    ];

    router.post("/:saleDocumentId", guards, async (req, res) => {
        try {
            const journalEntry = await postSaleDocument(
                prisma,
                req.companyId,
                req.user.id,
                req.params.saleDocumentId,
            );
            return res.status(201).json({ journalEntry });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
