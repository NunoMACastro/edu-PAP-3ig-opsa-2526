/**
 * @file Rotas do perfil da empresa.
 */

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { buildCompanyProfileController } from "./companyProfileController.js";

/**
 * Constrói o router do perfil fiscal e operacional da empresa.
 * Centraliza leitura e atualização do perfil sob autenticação e contexto multiempresa.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildCompanyProfileRoutes({ prisma }) {
    const router = Router();
    const controller = buildCompanyProfileController({ prisma });

    router.get(
        "/",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.COMPANY_READ),
        controller.get,
    );

    router.put(
        "/",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.COMPANY_WRITE),
        controller.update,
    );

    return router;
}
