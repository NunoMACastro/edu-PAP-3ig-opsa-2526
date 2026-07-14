/**
 * @file Rota autenticada de onboarding.
 */

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { buildOnboardingController } from "./onboardingController.js";

/**
 * Constrói router montado em `/api/onboarding`.
 *
 * @param {{ prisma: object, env?: NodeJS.ProcessEnv | Record<string, string | undefined> }} deps - Dependências.
 * @returns {import("express").Router} Router.
 */
export function buildOnboardingRoutes({ prisma, env = process.env }) {
    const router = Router();
    const controller = buildOnboardingController({
        prisma,
        isProduction: env.NODE_ENV === "production",
    });
    router.post("/company", requireAuth(prisma), controller.createCompany);
    return router;
}
