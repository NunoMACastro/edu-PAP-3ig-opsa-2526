/**
 * @file Rotas de convite; o token é recebido apenas no corpo dos POST.
 */

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { buildInvitationController } from "./invitationController.js";

/**
 * Constrói router montado em `/api/invitations`.
 *
 * @param {{ prisma: object }} deps - Dependências.
 * @returns {import("express").Router} Router.
 */
export function buildInvitationRoutes({ prisma }) {
    const router = Router();
    const controller = buildInvitationController({ prisma });
    router.post("/preview", controller.preview);
    router.post("/accept", requireAuth(prisma), controller.accept);
    return router;
}
