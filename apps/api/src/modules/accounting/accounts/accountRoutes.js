import { Router } from "express";
import { requireAuth } from "../../auth/authMiddleware.js";
import { requireCompanyContext } from "../../companies/companyContext.js";
import { Permission } from "../../permissions/permissions.js";
import { requirePermission } from "../../permissions/permissionMiddleware.js";
import { buildAccountController } from "./accountController.js";

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