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
 * Constrói o router de armazéns e localizações.
 * Aplica guards de inventário para listar, criar armazéns e gerir localizações internas.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildWarehouseRoutes({ prisma }) {
    const router = Router();
    const controller = buildWarehouseController({ prisma });
    const readGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.WAREHOUSES_READ),
    ];
    const writeGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.WAREHOUSES_WRITE),
    ];

    router.get("/", readGuards, controller.list);
    router.post("/", writeGuards, controller.create);
    router.get("/:id/locations", readGuards, controller.listLocations);
    router.post("/:id/locations", writeGuards, controller.createLocation);

    return router;
}
