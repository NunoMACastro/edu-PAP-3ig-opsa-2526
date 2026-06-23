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
import {
    measureDocumentInsert,
    toDocumentInsertLog,
} from "../performance/documentPerformance.js";

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

    /**
     * Cria um documento de venda e mede se a operação cumpre o orçamento de 1 segundo.
     *
     * @param {import("express").Request} req - Pedido autenticado com `req.companyId`, `req.user.id` e payload de venda validado pelo service.
     * @param {import("express").Response} res - Resposta HTTP que mantém o contrato `{ saleDocument }` e acrescenta cabeçalhos de performance.
     * @returns {Promise<import("express").Response>} Resposta `201` com o documento criado ou erro normalizado por `sendError`.
     */
    router.post("/", writeGuards, async (req, res) => {
        try {
            const { result: saleDocument, metric } = await measureDocumentInsert(
                "sales.document.create",
                async () =>
                    // A empresa ativa vem de `req.companyId`; o frontend nunca escolhe ownership.
                    createSaleDocument(prisma, req.companyId, req.user.id, req.body),
            );

            console.info(toDocumentInsertLog(metric));
            // Os cabeçalhos dão evidence sem alterar o JSON que o frontend já consome.
            res.set("X-OPSA-Duration-Ms", String(metric.durationMs));
            res.set("X-OPSA-Within-Budget", String(metric.withinBudget));

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
