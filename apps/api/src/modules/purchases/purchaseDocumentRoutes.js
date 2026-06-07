/**
 * @file Rotas de documentos de compra.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import {
    createPurchaseDocument,
    listPurchaseDocuments,
} from "./purchaseDocumentService.js";

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
 * Constrói router `/api/purchases/documents`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildPurchaseDocumentRoutes({ prisma }) {
    const router = Router();
    const readGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.PURCHASES_READ),
    ];
    const writeGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.PURCHASES_WRITE),
    ];

    router.get("/", readGuards, async (req, res) => {
        try {
            return res.status(200).json({
                purchaseDocuments: await listPurchaseDocuments(
                    prisma,
                    req.companyId,
                ),
            });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/", writeGuards, async (req, res) => {
        try {
            const purchaseDocument = await createPurchaseDocument(
                prisma,
                req.companyId,
                req.user.id,
                req.body,
            );
            return res.status(201).json({ purchaseDocument });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
