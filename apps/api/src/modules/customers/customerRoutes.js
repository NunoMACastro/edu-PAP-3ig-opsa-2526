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
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.CUSTOMERS_WRITE),
    ];

    router.get("/", guards, controller.list);
    router.post("/", guards, controller.create);
    router.patch("/:id", guards, controller.update);
    router.delete("/:id", guards, controller.remove);

    return router;
}
