/**
 * @file Rotas de tabelas de IVA.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import {
    createVatRate,
    listVatRates,
    setVatRateActive,
} from "./vatRateService.js";

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
 * Constrói o router de taxas de IVA.
 * Permite listar, criar e ativar ou desativar taxas com controlo de empresa e permissões.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildVatRateRoutes({ prisma }) {
    const router = Router();
    const baseGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
    ];
    const readGuards = [
        ...baseGuards,
        requirePermission(Permission.VAT_RATES_READ),
    ];
    const writeGuards = [
        ...baseGuards,
        requirePermission(Permission.VAT_RATES_WRITE),
    ];

    router.get("/", readGuards, async (req, res) => {
        try {
            return res
                .status(200)
                .json({ vatRates: await listVatRates(prisma, req.companyId) });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/", writeGuards, async (req, res) => {
        try {
            const vatRate = await createVatRate(
                prisma,
                req.companyId,
                req.body,
            );
            return res.status(201).json({ vatRate });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/:id/active", writeGuards, async (req, res) => {
        try {
            const vatRate = await setVatRateActive(
                prisma,
                req.companyId,
                req.params.id,
                req.body?.isActive,
            );
            return res.status(200).json({ vatRate });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
