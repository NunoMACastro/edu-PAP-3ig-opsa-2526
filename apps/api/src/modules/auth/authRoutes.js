/**
 * @file Rotas Express de autenticação e recuperação de password.
 */

import { Router } from "express";
import { buildAuthController } from "./authController.js";
import { buildPasswordResetEmailAdapter } from "./passwordResetEmailAdapter.js";
import { buildPasswordResetController } from "./passwordResetController.js";

/**
 * Constrói o router `/api/auth`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, isProduction: boolean, appBaseUrl: string }} deps - Dependências do router.
 * @returns {import("express").Router} Router Express configurado.
 */
export function buildAuthRoutes({ prisma, isProduction, appBaseUrl }) {
    const router = Router();
    const controller = buildAuthController({ prisma, isProduction });
    const passwordResetController = buildPasswordResetController({
        prisma,
        emailAdapter: buildPasswordResetEmailAdapter({ appBaseUrl }),
        isProduction,
    });

    router.post("/register", controller.register);
    router.post("/login", controller.login);
    router.get("/me", controller.me);
    router.post("/logout", controller.logout);
    router.post("/password/forgot", passwordResetController.forgot);
    router.post("/password/reset", passwordResetController.reset);

    return router;
}
