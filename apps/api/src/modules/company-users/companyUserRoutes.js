/**
 * @file Rotas de gestão de utilizadores da empresa.
 */

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { buildInvitationEmailAdapter } from "./invitationEmailAdapter.js";
import { buildCompanyUserController } from "./companyUserController.js";

/**
 * Constrói router montado em `/api/company`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, appBaseUrl: string, emailOutbox: { enqueue: Function } }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildCompanyUserRoutes({ prisma, appBaseUrl, emailOutbox }) {
    const router = Router();
    const controller = buildCompanyUserController({
        prisma,
        emailAdapter: buildInvitationEmailAdapter({ appBaseUrl, emailOutbox }),
    });

    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.USERS_MANAGE),
    ];

    router.get("/users", guards, controller.list);
    router.get("/invitations", guards, controller.listInvitations);
    router.post("/invitations", guards, controller.invite);
    router.post(
        "/invitations/:id/resend",
        guards,
        controller.resendInvitation,
    );
    router.post(
        "/invitations/:id/revoke",
        guards,
        controller.revokeInvitation,
    );
    router.patch("/users/:id/role", guards, controller.updateRole);
    router.delete("/users/:id", guards, controller.remove);

    return router;
}
