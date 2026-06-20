/**
 * @file Rotas de pagamentos.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { registerPayment } from "./paymentService.js";

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
 * @param props - Propriedades recebidas pelo componente React.
 * @returns {import("express").Router} Router Express.
 */
export function buildPaymentRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.PURCHASES_WRITE),
    ];

    router.post("/:id/payments", guards, async (req, res) => {
        try {
            const payment = await registerPayment(
                prisma,
                req.companyId,
                req.user.id,
                req.params.id,
                req.body,
            );
            return res.status(201).json({ payment });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
