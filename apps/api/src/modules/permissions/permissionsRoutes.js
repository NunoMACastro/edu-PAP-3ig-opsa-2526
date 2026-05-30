import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { buildPermissionsController } from "./permissionsController.js";

export function buildPermissionsRoutes({ prisma }) {
    const router = Router();
    const controller = buildPermissionsController();

    // O BK-MF0-03 exporta uma factory; aqui instanciamos o middleware com prisma.
    router.get(
        "/me",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        controller.me,
    );

    return router;
}