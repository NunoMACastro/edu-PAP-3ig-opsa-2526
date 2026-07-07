/**
 * @file Rotas do plano de contas.
 */

import { Router } from "express";
import { requireAuth } from "../../auth/authMiddleware.js";
import { requireCompanyContext } from "../../companies/companyContext.js";
import { Permission } from "../../permissions/permissions.js";
import { requirePermission } from "../../permissions/permissionMiddleware.js";
import { buildAccountController } from "./accountController.js";

/**
 * Constrói o router do plano de contas em `/api/accounting/accounts`.
 * Liga leitura, criação e importação aos guards de autenticação, empresa e permissão.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildAccountRoutes({ prisma }) {
    const router = Router();
    const controller = buildAccountController({ prisma });

    router.get(
        "/",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ACCOUNTING_READ),
        controller.list,
    );

    router.post(
        "/",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ACCOUNTING_WRITE),
        controller.create,
    );

    router.post(
        "/import",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ACCOUNTING_WRITE),
        controller.importRows,
    );

    return router;
}
