import { Router } from "express";
import { buildAuthController } from "./authController.js";
import { buildPasswordResetEmailAdapter } from "./passwordResetEmailAdapter.js";
import { buildPasswordResetController } from "./passwordResetController.js";

export function buildAuthRoutes({ prisma, isProduction }) {
    const router = Router();
    const controller = buildAuthController({ prisma, isProduction });
    const passwordResetController = buildPasswordResetController({
        prisma,
        emailAdapter: buildPasswordResetEmailAdapter({
            appBaseUrl: process.env.APP_BASE_URL,
        }),
    });

    router.post("/password/forgot", passwordResetController.forgot);
    router.post("/password/reset", passwordResetController.reset);
    router.post("/register", controller.register);
    router.post("/login", controller.login);
    router.get("/me", controller.me);
    router.post("/logout", controller.logout);

    return router;
}