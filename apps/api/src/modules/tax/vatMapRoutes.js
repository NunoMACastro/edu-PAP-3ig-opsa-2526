// apps/api/src/modules/tax/vatMapRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateVatMapQuery } from "./vatMapFilters.js";
import { buildVatMap } from "./vatMapService.js";

/**
 * Constrói as routes HTTP do mapa de IVA.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências injetadas pelo servidor.
 * @returns {import("express").Router} Router montado em `/api/tax/vat-maps`.
 */
export function buildVatMapRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("CONTABILISTA", "AUDITOR")];

    router.get("/", guards, async (req, res) => {
        try {
            const filters = validateVatMapQuery(req.query);
            const result = await buildVatMap(prisma, {
                // O companyId vem da sessão ativa; o browser nunca escolhe a empresa por query string.
                companyId: req.companyId,
                userId: req.user.id,
                ...filters,
            });
            return res.status(200).json(result);
        } catch (error) {
            const httpError = toHttpError(error);
            return res.status(httpError.status).json({ error: httpError.code, message: httpError.message });
        }
    });

    return router;
}