import { Router } from "express";
import { buildAuthController } from "./authController.js";

export function buildAuthRoutes({ prisma, isProduction }) {
    const router = Router();
    const controller = buildAuthController({ prisma, isProduction });

    router.post("/register", controller.register);
    router.post("/login", controller.login);
    router.get("/me", controller.me);
    router.post("/logout", controller.logout);

    return router;
}