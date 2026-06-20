/**
 * @file Rotas de lembretes MF4.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import {
    createReminder,
    listReminders,
    updateReminderStatus,
} from "./reminderService.js";

/**
 * Responde com erro JSON consistente.
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
 * Monta endpoints de lembretes.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependencias.
 * @returns {Router} Router Express.
 */
export function buildReminderRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.REMINDERS_WRITE),
    ];

    router.get("/", guards, async (req, res) => {
        try {
            const reminders = await listReminders(prisma, req.companyId);
            return res.status(200).json({ reminders });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/", guards, async (req, res) => {
        try {
            const reminder = await createReminder(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                body: req.body,
            });
            return res.status(201).json({ reminder });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/:id", guards, async (req, res) => {
        try {
            const reminder = await updateReminderStatus(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                reminderId: req.params.id,
                body: req.body,
            });
            return res.status(200).json({ reminder });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
