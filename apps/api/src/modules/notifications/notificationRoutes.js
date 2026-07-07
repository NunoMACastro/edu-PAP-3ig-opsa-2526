/**
 * @file Rotas de notificacoes in-app e preferências de alertas.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import {
    listAlertPreferences,
    parseAlertPreferenceBody,
    setAlertPreference,
} from "./alertPreferenceService.js";
import {
    listNotifications,
    markNotificationRead,
    syncNotifications,
} from "./notificationService.js";

/**
 * Envia erro HTTP normalizado.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {unknown} error - Erro capturado.
 * @returns {import("express").Response} Resposta enviada.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({
        error: response.code,
        message: response.message,
        details: response.details,
    });
}

/**
 * Monta endpoints de notificacoes e preferências de alertas.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependencias.
 * @returns {Router} Router Express.
 */
export function buildNotificationRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.NOTIFICATIONS_READ),
    ];

    router.get("/", guards, async (req, res) => {
        try {
            const notifications = await listNotifications(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
            });
            return res.status(200).json({ notifications });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/sync", guards, async (req, res) => {
        try {
            const notifications = await syncNotifications(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
            });
            return res.status(200).json({ notifications });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/preferences", guards, async (req, res) => {
        try {
            const preferences = await listAlertPreferences(prisma, {
                // A empresa ativa é resolvida pelo middleware multiempresa.
                companyId: req.companyId,
                userId: req.user.id,
            });
            return res.status(200).json({ preferences });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/preferences/:type", guards, async (req, res) => {
        try {
            const body = parseAlertPreferenceBody(req.body);
            const preference = await setAlertPreference(prisma, {
                // A route aceita só o tipo no path e o booleano no body.
                companyId: req.companyId,
                userId: req.user.id,
                type: req.params.type,
                enabled: body.enabled,
            });
            return res.status(200).json({ preference });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/:id/read", guards, async (req, res) => {
        try {
            const notification = await markNotificationRead(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                notificationId: req.params.id,
            });
            return res.status(200).json({ notification });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
