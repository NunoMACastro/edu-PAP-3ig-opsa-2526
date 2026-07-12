/**
 * @file Rota autenticada de onboarding.
 */

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { buildOnboardingController } from "./onboardingController.js";

/**
 * Constrói router montado em `/api/onboarding`.
 *
 * @param {{ prisma: object }} deps - Dependências.
 * @returns {import("express").Router} Router.
 */
export function buildOnboardingRoutes({ prisma }) {
    const router = Router();
    const controller = buildOnboardingController({ prisma });
    router.post("/company", requireAuth(prisma), controller.createCompany);
    return router;
}
