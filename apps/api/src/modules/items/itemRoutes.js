import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { buildItemController } from "./itemController.js";

export function buildItemRoutes({ prisma }) {
    const router = Router();
    const controller = buildItemController({ prisma });
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ITEMS_WRITE),
    ];

    router.get("/", guards, controller.list);
    router.post("/", guards, controller.create);
    router.patch("/:id", guards, controller.update);
    router.delete("/:id", guards, controller.remove);

    return router;
}