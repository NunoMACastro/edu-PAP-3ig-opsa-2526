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
    const readGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.SUPPLIERS_READ),
    ];
    const writeGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.SUPPLIERS_WRITE),
    ];

    router.get("/", readGuards, controller.list);
    router.post("/", writeGuards, controller.create);
    router.patch("/:id", writeGuards, controller.update);
    router.delete("/:id", writeGuards, controller.remove);

    return router;
}
