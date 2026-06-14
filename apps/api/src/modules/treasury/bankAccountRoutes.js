// apps/api/src/modules/treasury/bankAccountRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateTreasuryAccountPayload } from "./bankAccountValidators.js";
import { createTreasuryAccount, listTreasuryAccounts } from "./bankAccountService.js";

/**
 * Constrói as routes de contas de tesouraria.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências da route.
 * @returns {import("express").Router} Router montado em `/api/treasury/accounts`.
 */
export function buildTreasuryAccountRoutes({ prisma }) {
    const router = Router();
    const readGuards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("CONTABILISTA", "OPERACIONAL", "GESTOR")];
    const writeGuards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("CONTABILISTA", "OPERACIONAL")];

    router.get("/", readGuards, async (req, res) => {
        try {
            const accounts = await listTreasuryAccounts(prisma, { companyId: req.companyId });
            return res.status(200).json(accounts);
        } catch (error) {
            const httpError = toHttpError(error);
            return res.status(httpError.status).json({ error: httpError.code, message: httpError.message });
        }
    });

    router.post("/", writeGuards, async (req, res) => {
        try {
            const payload = validateTreasuryAccountPayload(req.body);
            // companyId e userId vêm dos guards; o frontend nunca controla ownership.
            const account = await createTreasuryAccount(prisma, { companyId: req.companyId, userId: req.user.id, payload });
            return res.status(201).json(account);
        } catch (error) {
            const httpError = toHttpError(error);
            return res.status(httpError.status).json({ error: httpError.code, message: httpError.message });
        }
    });

    return router;
}
// apps/api/src/server.js
import { buildTreasuryAccountRoutes } from "./modules/treasury/bankAccountRoutes.js";

app.use("/api/treasury/accounts", buildTreasuryAccountRoutes({ prisma }));