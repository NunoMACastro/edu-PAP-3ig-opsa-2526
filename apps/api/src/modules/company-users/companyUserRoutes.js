import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { buildInvitationEmailAdapter } from "./invitationEmailAdapter.js";
import { buildCompanyUserController } from "./companyUserController.js";

export function buildCompanyUserRoutes({ prisma, appBaseUrl }) {
    const router = Router();
    const controller = buildCompanyUserController({
        prisma,
        emailAdapter: buildInvitationEmailAdapter({ appBaseUrl }),
    });

    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.USERS_MANAGE),
    ];

    router.get("/users", guards, controller.list);
    router.post("/invitations", guards, controller.invite);
    router.patch("/users/:id/role", guards, controller.updateRole);
    router.delete("/users/:id", guards, controller.remove);

    return router;
}