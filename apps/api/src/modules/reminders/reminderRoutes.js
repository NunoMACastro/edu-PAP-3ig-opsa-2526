// apps/api/src/modules/reminders/reminderRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { validateReminderBody, validateReminderStatusBody } from "./reminderValidators.js";
import { createReminder, listReminders, updateReminderStatus } from "./reminderService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // Todos os erros saem no mesmo formato para a UI conseguir mostrá-los de forma consistente.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/** Constrói router de Reminder. */
export function buildReminderRoutes({ prisma }) {
    const router = Router();
    // Guards comuns: primeiro sessão, depois empresa ativa, depois autorização por papel.
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requireRole("ADMIN", "GESTOR", "CONTABILISTA", "OPERACIONAL", "AUDITOR"),
    ];

    router.get("/", guards, async (req, res) => {
        // req.companyId foi calculado pelo middleware; não vem do browser.
        const items = await listReminders(prisma, { companyId: req.companyId });
        return res.status(200).json({ items });
    });

    router.post("/", guards, async (req, res) => {
        try {
            // Validamos antes de chamar o service para evitar writes com dados incompletos.
            const data = validateReminderBody(req.body);
            const item = await createReminder(prisma, { companyId: req.companyId, userId: req.user.id, data });
            return res.status(201).json({ item });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/:id/status", guards, async (req, res) => {
        try {
            // Este endpoint só muda estado; o validator impede alterações escondidas no body.
            const data = validateReminderStatusBody(req.body);
            const item = await updateReminderStatus(prisma, { companyId: req.companyId, id: req.params.id, status: data.status });
            return res.status(200).json({ item });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}