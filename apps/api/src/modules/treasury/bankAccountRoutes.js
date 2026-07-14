/**
 * @file Rotas de contas de tesouraria da MF3.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import {
    createTreasuryAccount,
    listTreasuryAccounts,
} from "./bankAccountService.js";

/**
 * Envia erros HTTP num formato JSON consistente com o contrato da API.
 *
 * @param res - Resposta Express usada para enviar o erro ao cliente.
 * @param error - Erro capturado durante a operação.
 * @returns Resposta HTTP de erro enviada no formato JSON contratado.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({
        error: response.code,
        message: response.message,
        details: response.details,
    });
}

/**
 * Constrói o router de contas de tesouraria.
 * Expõe listagem e criação de contas bancárias ou caixa com permissões financeiras.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildTreasuryAccountRoutes({ prisma }) {
    const router = Router();
    const baseGuards = [requireAuth(prisma), requireCompanyContext(prisma)];
    const readGuards = [
        ...baseGuards,
        requirePermission(Permission.TREASURY_READ),
    ];
    const writeGuards = [
        ...baseGuards,
        requirePermission(Permission.TREASURY_WRITE),
    ];

    router.get("/accounts", readGuards, async (req, res) => {
        try {
            const accounts = await listTreasuryAccounts(prisma, req.companyId);
            return res.status(200).json({ accounts });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/accounts", writeGuards, async (req, res) => {
        try {
            const account = await createTreasuryAccount(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                input: req.body,
            });
            return res.status(201).json({ account });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
