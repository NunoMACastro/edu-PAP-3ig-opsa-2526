/**
 * @file Rotas de mapas de IVA da MF3.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { validateVatMapQuery } from "./vatMapFilters.js";
import { buildVatMap } from "./vatMapService.js";

/**
 * Envia erros HTTP num formato JSON consistente com o contrato da API.
 *
 * @param res - Resposta Express usada para enviar o erro ao cliente.
 * @param error - Erro capturado durante a operação.
 * @returns Resposta HTTP de erro enviada no formato JSON contratado.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res
        .status(response.status)
        .json({ error: response.code, message: response.message });
}

/**
 * Constrói o router do mapa de IVA.
 * Protege a consulta fiscal e liga a query validada ao cálculo agregado de IVA.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildVatMapRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.TAX_READ),
        requireRole("ADMIN", "CONTABILISTA", "AUDITOR"),
    ];

    router.get("/vat-maps", guards, async (req, res) => {
        try {
            const range = validateVatMapQuery(req.query);
            const vatMap = await buildVatMap(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                ...range,
            });
            return res.status(200).json({ vatMap });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
