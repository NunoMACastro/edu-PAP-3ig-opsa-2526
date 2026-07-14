/**
 * @file Rotas de empresas e sessão multiempresa.
 */

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { buildCompanyController } from "./companyController.js";

/**
 * Constrói rotas montadas em `/api`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, env?: NodeJS.ProcessEnv | Record<string, string | undefined> }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildCompanyRoutes({ prisma, env = process.env }) {
    const router = Router();
    const controller = buildCompanyController({
        prisma,
        isProduction: env.NODE_ENV === "production",
    });
    const auth = requireAuth(prisma);

    router.post("/companies", auth, controller.create);
    router.get("/companies", auth, controller.list);
    router.post("/session/company", auth, controller.switchCompany);
    router.get("/session/context", auth, controller.context);

    return router;
}
