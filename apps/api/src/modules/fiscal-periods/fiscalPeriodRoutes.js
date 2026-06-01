/**
 * @file Rotas de períodos fiscais.
 */

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { buildFiscalPeriodController } from "./fiscalPeriodController.js";

/**
 * Constrói router `/api/fiscal-periods`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildFiscalPeriodRoutes({ prisma }) {
    const router = Router();
    const controller = buildFiscalPeriodController({ prisma });

    router.get(
        "/",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.FISCAL_PERIODS_READ),
        controller.list,
    );

    router.post(
        "/",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.FISCAL_PERIODS_MANAGE),
        controller.create,
    );

    router.post(
        "/:id/close",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.FISCAL_PERIODS_MANAGE),
        controller.close,
    );

    return router;
}
