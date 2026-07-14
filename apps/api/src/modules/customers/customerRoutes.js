/**
 * @file Rotas de clientes.
 */

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { buildCustomerController } from "./customerController.js";

/**
 * Constrói o router de clientes em `/api/customers`.
 * Aplica autenticação, empresa ativa e permissões diferentes para leitura e escrita.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildCustomerRoutes({ prisma }) {
    const router = Router();
    const controller = buildCustomerController({ prisma });
    const readGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.CUSTOMERS_READ),
    ];
    const writeGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.CUSTOMERS_WRITE),
    ];

    router.get("/", readGuards, controller.list);
    router.post("/", writeGuards, controller.create);
    router.patch("/:id", writeGuards, controller.update);
    router.delete("/:id", writeGuards, controller.remove);

    return router;
}
