/**
 * @file Rotas de artigos e serviços.
 */

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { buildItemController } from "./itemController.js";

/**
 * Constrói o router de artigos e serviços.
 * Separa guards de leitura e escrita para proteger criação, edição e desativação de itens.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildItemRoutes({ prisma }) {
    const router = Router();
    const controller = buildItemController({ prisma });
    const readGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ITEMS_READ),
    ];
    const writeGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ITEMS_WRITE),
    ];

    router.get("/", readGuards, controller.list);
    router.post("/", writeGuards, controller.create);
    router.patch("/:id", writeGuards, controller.update);
    router.delete("/:id", writeGuards, controller.remove);

    return router;
}
