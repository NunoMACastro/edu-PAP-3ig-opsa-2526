/**
 * @file Rotas de empresas e sessão multiempresa.
 */

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { buildCompanyController } from "./companyController.js";

/**
 * Constrói rotas montadas em `/api`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildCompanyRoutes({ prisma }) {
    const router = Router();
    const controller = buildCompanyController({ prisma });
    const auth = requireAuth(prisma);

    router.get("/companies", auth, controller.list);
    router.post("/session/company", auth, controller.switchCompany);
    router.get("/session/context", auth, controller.context);

    return router;
}
