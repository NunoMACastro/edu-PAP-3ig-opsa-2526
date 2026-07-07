/**
 * @file Rotas de fornecedores.
 */

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { buildSupplierController } from "./supplierController.js";

/**
 * Constrói o router de fornecedores em `/api/suppliers`.
 * Aplica autenticação, empresa ativa e permissões diferentes para leitura e escrita.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildSupplierRoutes({ prisma }) {
    const router = Router();
    const controller = buildSupplierController({ prisma });
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.SUPPLIERS_WRITE),
    ];

    router.get("/", guards, controller.list);
    router.post("/", guards, controller.create);
    router.patch("/:id", guards, controller.update);
    router.delete("/:id", guards, controller.remove);

    return router;
}
