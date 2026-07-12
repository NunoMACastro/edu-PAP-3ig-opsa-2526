/**
 * @file Rotas de documentos de compra.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import {
    measureDocumentInsertion,
    setDocumentPerformanceHeaders,
} from "../performance/documentPerformance.js";
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
 * Constrói o router de documentos de compra.
 * Agrupa leitura e criação medidas pelo RNF08 sob autenticação, empresa e permissões.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências backend usadas para montar guards e services de compras.
 * @returns {import("express").Router} Router Express com leitura e criação medida pelo RNF08.
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
            const result = await listPurchaseDocuments(prisma, req.companyId, {
                cursor: req.query.cursor,
                limit: req.query.limit,
            });
            return res.status(200).json(result);
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/", writeGuards, async (req, res) => {
        try {
            const measured = await measureDocumentInsertion(() =>
                createPurchaseDocument(
                    prisma,
                    req.companyId,
                    req.user.id,
                    req.body,
                ),
            );
            setDocumentPerformanceHeaders(res, measured);
            return res
                .status(201)
                .json({ purchaseDocument: measured.result });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
