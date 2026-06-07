/**
 * @file Rotas de contabilização automática de compras.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { postPurchaseDocument } from "./purchasePostingService.js";

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
 * Constrói router `/api/accounting/purchase-postings`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildPurchasePostingRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ACCOUNTING_WRITE),
    ];

    router.post("/:purchaseDocumentId", guards, async (req, res) => {
        try {
            const journalEntry = await postPurchaseDocument(
                prisma,
                req.companyId,
                req.user.id,
                req.params.purchaseDocumentId,
            );
            return res.status(201).json({ journalEntry });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
