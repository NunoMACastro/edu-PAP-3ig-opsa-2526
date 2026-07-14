/**
 * @file Rotas de tarefas operacionais MF4.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import {
    createOperationalTask,
    listOperationalTasks,
    listTaskAssignees,
    updateOperationalTaskStatus,
} from "./taskService.js";

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
 * Monta rotas de tarefas.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependencias.
 * @returns {Router} Router Express.
 */
export function buildOperationalTaskRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.TASKS_WRITE),
    ];

    router.get("/assignees", guards, async (req, res) => {
        try {
            const assignees = await listTaskAssignees(prisma, req.companyId);
            return res.status(200).json({ assignees });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/", guards, async (req, res) => {
        try {
            const tasks = await listOperationalTasks(prisma, req.companyId);
            return res.status(200).json({ tasks });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/", guards, async (req, res) => {
        try {
            const task = await createOperationalTask(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                body: req.body,
            });
            return res.status(201).json({ task });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/:id/status", guards, async (req, res) => {
        try {
            const task = await updateOperationalTaskStatus(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                taskId: req.params.id,
                body: req.body,
            });
            return res.status(200).json({ task });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
