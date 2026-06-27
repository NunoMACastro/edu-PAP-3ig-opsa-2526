/**
 * @file Rotas de armazéns e localizações.
 */

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { buildWarehouseController } from "./warehouseController.js";

/**
 * Constrói router `/api/warehouses`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildWarehouseRoutes({ prisma }) {
    const router = Router();
    const controller = buildWarehouseController({ prisma });
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.WAREHOUSES_WRITE),
    ];

    router.get("/", guards, controller.list);
    router.post("/", guards, controller.create);
    router.get("/:id/locations", guards, controller.listLocations);
    router.post("/:id/locations", guards, controller.createLocation);

    return router;
}
