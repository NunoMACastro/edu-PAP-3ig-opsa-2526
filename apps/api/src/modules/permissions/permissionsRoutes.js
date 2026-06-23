/**
 * @file Rotas de permissões.
 */

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { buildPermissionsController } from "./permissionsController.js";

/**
 * Constrói o router `/api/permissions`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @param props - Propriedades recebidas pelo componente React.
 * @returns {import("express").Router} Router Express.
 */
export function buildPermissionsRoutes({ prisma }) {
    const router = Router();
    const controller = buildPermissionsController();

    router.get(
        "/me",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        controller.me,
    );

    return router;
}
