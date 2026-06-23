/**
 * @file Rotas de documentos de venda.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import {
    createSaleDocument,
    issueSaleDocument,
    listSaleDocuments,
} from "./saleDocumentService.js";

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
 * Constrói router `/api/sales/documents`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @param props - Propriedades recebidas pelo componente React.
 * @returns {import("express").Router} Router Express.
 */
export function buildSaleDocumentRoutes({ prisma }) {
    const router = Router();
    const readGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.SALES_READ),
    ];
    const writeGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.SALES_WRITE),
    ];

    router.get("/", readGuards, async (req, res) => {
        try {
            return res.status(200).json({
                saleDocuments: await listSaleDocuments(prisma, req.companyId),
            });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/", writeGuards, async (req, res) => {
        try {
            const saleDocument = await createSaleDocument(
                prisma,
                req.companyId,
                req.user.id,
                req.body,
            );
            return res.status(201).json({ saleDocument });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/:id/issue", writeGuards, async (req, res) => {
        try {
            const saleDocument = await issueSaleDocument(
                prisma,
                req.companyId,
                req.user.id,
                req.params.id,
            );
            return res.status(200).json({ saleDocument });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
