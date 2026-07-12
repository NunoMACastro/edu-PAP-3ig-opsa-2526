/**
 * @file Rotas de aprovação e lançamento de compras.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import {
    approvePurchaseDocument,
    listPurchaseApprovalHistory,
    markPurchaseDocumentPosted,
    rejectPurchaseDocument,
} from "./purchaseApprovalService.js";

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
 * Constrói router montado em `/api/purchases/documents`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildPurchaseApprovalRoutes({ prisma }) {
    const router = Router();
    const approvalGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.PURCHASES_APPROVE),
    ];
    const postingGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ACCOUNTING_WRITE),
    ];
    const historyGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.PURCHASE_APPROVAL_HISTORY_READ),
    ];

    router.post("/:id/approve", approvalGuards, async (req, res) => {
        try {
            const purchaseDocument = await approvePurchaseDocument(
                prisma,
                req.companyId,
                req.user.id,
                req.params.id,
                req.body,
            );
            return res.status(200).json({ purchaseDocument });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/:id/reject", approvalGuards, async (req, res) => {
        try {
            const purchaseDocument = await rejectPurchaseDocument(
                prisma,
                req.companyId,
                req.user.id,
                req.params.id,
                req.body,
            );
            return res.status(200).json({ purchaseDocument });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/:id/approval-history", historyGuards, async (req, res) => {
        try {
            const history = await listPurchaseApprovalHistory(
                prisma,
                req.companyId,
                req.params.id,
            );
            return res.status(200).json({ history });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/:id/post-state", postingGuards, async (req, res) => {
        try {
            const journalEntry = await markPurchaseDocumentPosted(
                prisma,
                req.companyId,
                req.user.id,
                req.params.id,
            );
            return res.status(200).json({ journalEntry });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
