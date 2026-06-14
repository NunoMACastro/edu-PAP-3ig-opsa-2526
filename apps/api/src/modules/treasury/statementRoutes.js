// apps/api/src/modules/treasury/statementRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateStatementImportPayload } from "./statementImportValidators.js";
import { importBankStatement } from "./statementImportService.js";

/**
 * Constrói as routes de importação de extratos.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências da route.
 * @returns {import("express").Router} Router montado em `/api/treasury/statements`.
 */
export function buildStatementRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("OPERACIONAL", "CONTABILISTA")];

    router.post("/import", guards, async (req, res) => {
        try {
            const payload = validateStatementImportPayload(req.body);
            // A empresa e o utilizador vêm dos guards; o payload apenas identifica a conta dentro dessa empresa.
            const result = await importBankStatement(prisma, { companyId: req.companyId, userId: req.user.id, payload });
            return res.status(201).json(result);
        } catch (error) {
            const httpError = toHttpError(error);
            return res.status(httpError.status).json({ error: httpError.code, message: httpError.message });
        }
    });

    return router;
}