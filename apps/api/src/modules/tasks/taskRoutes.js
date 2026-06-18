// apps/api/src/modules/tasks/taskRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { validateOperationalTaskBody, validateOperationalTaskStatusBody } from "./taskValidators.js";
import { createOperationalTask, listOperationalTasks, updateOperationalTaskStatus } from "./taskService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // Normaliza erros de validação, autorização e not found no mesmo formato JSON.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/** Constrói router de OperationalTask. */
export function buildOperationalTaskRoutes({ prisma }) {
    const router = Router();
    // Todas as rotas exigem sessão, empresa ativa e um papel autorizado para RF45.
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requireRole("ADMIN", "GESTOR", "CONTABILISTA", "OPERACIONAL"),
    ];

    router.get("/", guards, async (req, res) => {
        // A listagem fica automaticamente limitada à empresa ativa.
        const items = await listOperationalTasks(prisma, { companyId: req.companyId });
        return res.status(200).json({ items });
    });

    router.post("/", guards, async (req, res) => {
        try {
            // Primeiro validamos forma dos dados; depois o service valida membership.
            const data = validateOperationalTaskBody(req.body);
            const item = await createOperationalTask(prisma, { companyId: req.companyId, userId: req.user.id, data });
            return res.status(201).json({ item });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/:id/status", guards, async (req, res) => {
        try {
            // Endpoint estreito: só aceita transição de estado, não edição geral da tarefa.
            const data = validateOperationalTaskStatusBody(req.body);
            const item = await updateOperationalTaskStatus(prisma, { companyId: req.companyId, id: req.params.id, status: data.status });
            return res.status(200).json({ item });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}