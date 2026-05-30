import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { buildCompanyController } from "./companyController.js";

export function buildCompanyRoutes({ prisma }) {
    const router = Router();
    const controller = buildCompanyController({ prisma });
    const auth = requireAuth(prisma);

    router.get("/companies", auth, controller.list);
    router.post("/session/company", auth, controller.switchCompany);
    router.get("/session/context", auth, controller.context);

    return router;
}