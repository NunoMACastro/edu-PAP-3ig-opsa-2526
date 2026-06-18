// apps/api/src/modules/notifications/notificationRoutes.js
import { Router } from "express";
import { httpError, toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { syncNotifications } from "./notificationService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // Mantém resposta de erro uniforme para a página de notificações.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/** Constrói router de notificações internas RF46. */
export function buildNotificationRoutes({ prisma }) {
    const router = Router();
    // Notificações são pessoais, mas continuam dependentes da empresa ativa.
    const guards = [requireAuth(prisma), requireCompanyContext(prisma)];

    router.get("/", guards, async (req, res) => {
        // A lista é filtrada por empresa e pelo utilizador autenticado.
        const notifications = await prisma.inAppNotification.findMany({ where: { companyId: req.companyId, userId: req.user.id }, orderBy: { createdAt: "desc" } });
        return res.status(200).json({ notifications });
    });

    router.post("/sync", guards, async (req, res) => {
        try {
            // A sincronização cria apenas notificações em falta para este utilizador.
            const notifications = await syncNotifications(prisma, { companyId: req.companyId, userId: req.user.id });
            return res.status(200).json({ notifications });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/:id/read", guards, async (req, res) => {
        try {
            // Antes de marcar como lida, confirmamos que a notificação pertence ao utilizador.
            const existing = await prisma.inAppNotification.findFirst({
                where: {
                    id: req.params.id,
                    companyId: req.companyId,
                    userId: req.user.id,
                },
            });
            if (!existing) {
                // 404 evita revelar se o id existe noutra empresa ou conta.
                throw httpError(404, "NOTIFICATION_NOT_FOUND", "Notificação não encontrada");
            }
            const notification = await prisma.inAppNotification.update({
                where: { id: existing.id },
                data: { readAt: new Date() },
            });
            return res.status(200).json({ notification });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}