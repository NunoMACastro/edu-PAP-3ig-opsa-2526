// apps/api/src/modules/imports/businessImportRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateBusinessImportPayload } from "./businessImportValidators.js";
import { importBusinessData } from "./businessImportService.js";

/**
 * Constrói as routes de importação operacional.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências da route.
 * @returns {import("express").Router} Router montado em `/api/imports/business-data`.
 */
export function buildBusinessImportRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "CONTABILISTA")];
    router.post("/", guards, async (req, res) => {
        try {
            const payload = validateBusinessImportPayload(req.body);
            // A role e o companyId são verificados no backend antes de qualquer escrita sensível.
            return res.status(201).json(await importBusinessData(prisma, { companyId: req.companyId, userId: req.user.id, payload }));
        } catch (error) {
            const httpError = toHttpError(error);
            return res.status(httpError.status).json({ error: httpError.code, message: httpError.message });
        }
    });
    return router;
}