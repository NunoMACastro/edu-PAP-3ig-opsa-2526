// apps/api/src/modules/compliance/saftRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateSaftExportQuery } from "./saftValidators.js";
import { buildSaftXml } from "./saftService.js";

/**
 * Constrói a route de exportação SAF-T MVP.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências da route.
 * @returns {import("express").Router} Router montado em `/api/compliance/saft`.
 */
export function buildSaftRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("CONTABILISTA", "AUDITOR")];
    router.get("/", guards, async (req, res) => {
        try {
            const filters = validateSaftExportQuery(req.query);
            // companyId vem do contexto autenticado para impedir exportação de outra empresa.
            return res.status(200).json(await buildSaftXml(prisma, { companyId: req.companyId, userId: req.user.id, ...filters }));
        } catch (error) {
            const httpError = toHttpError(error);
            return res.status(httpError.status).json({ error: httpError.code, message: httpError.message });
        }
    });
    return router;
}