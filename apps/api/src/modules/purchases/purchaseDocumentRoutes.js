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
 * Constrói router `/api/purchases/documents`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @param props - Propriedades recebidas pelo componente React.
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

    /**
     * Cria um documento de compra e mede a duração sem expor linhas ou valores nos logs.
     *
     * @param {import("express").Request} req - Pedido autenticado com empresa ativa resolvida no backend e payload de compra validado pelo service.
     * @param {import("express").Response} res - Resposta HTTP que mantém o contrato `{ purchaseDocument }` e acrescenta cabeçalhos de performance.
     * @returns {Promise<import("express").Response>} Resposta `201` com o documento criado ou erro normalizado por `sendError`.
     */
    router.post("/", writeGuards, async (req, res) => {
        try {
            const { result: purchaseDocument, metric } = await measureDocumentInsert(
                "purchases.document.create",
                async () =>
                    // O fornecedor e as linhas continuam validados dentro do service de compras.
                    createPurchaseDocument(prisma, req.companyId, req.user.id, req.body),
            );

            console.info(toDocumentInsertLog(metric));
            // A route mantém o contrato `{ purchaseDocument }` e expõe a duração só por cabeçalho.
            res.set("X-OPSA-Duration-Ms", String(metric.durationMs));
            res.set("X-OPSA-Within-Budget", String(metric.withinBudget));

            return res.status(201).json({ purchaseDocument });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
