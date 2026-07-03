/**
 * @file Service de notificacoes in-app MF4.
 */

import { httpError } from "../../lib/httpErrors.js";
import { TransactionalEmailReason } from "./transactionalEmailAdapter.js";

/**
 * Cria ou atualiza uma notificacao idempotente para um utilizador.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Cliente ou transacao Prisma.
 * @param {object} data - Dados da notificacao.
 * @returns {Promise<object>} Notificacao criada ou existente.
 */
function upsertNotification(tx, data) {
    return tx.inAppNotification.upsert({
        where: {
            companyId_userId_sourceType_sourceId: {
                companyId: data.companyId,
                userId: data.userId,
                sourceType: data.sourceType,
                sourceId: data.sourceId,
            },
        },
        update: {
            type: data.type,
            title: data.title,
            message: data.message,
        },
        create: data,
    });
}

/**
 * Lista notificacoes do utilizador autenticado.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string }} input - Contexto.
 * @returns {Promise<object[]>} Notificacoes.
 */
export function listNotifications(prisma, input) {
    return prisma.inAppNotification.findMany({
        where: { companyId: input.companyId, userId: input.userId },
        orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
        take: 100,
    });
}

/**
 * Sincroniza notificacoes a partir de lembretes e alertas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string }} input - Contexto autenticado.
 * @returns {Promise<object[]>} Notificacoes criadas/atualizadas para o utilizador atual.
 */
export async function syncNotifications(prisma, input) {
    const [memberships, reminders, alerts] = await Promise.all([
        prisma.companyMembership.findMany({
            where: { companyId: input.companyId, isActive: true },
            select: { userId: true },
        }),
        prisma.reminder.findMany({
            where: { companyId: input.companyId, status: "OPEN" },
            take: 50,
        }),
        prisma.smartAlert.findMany({
            where: { companyId: input.companyId, status: "OPEN" },
            take: 50,
        }),
    ]);

    const notifications = [];
    for (const membership of memberships) {
        for (const reminder of reminders) {
            const notification = await upsertNotification(prisma, {
                companyId: input.companyId,
                userId: membership.userId,
                type: "REMINDER",
                title: reminder.title,
                message: `Prazo: ${reminder.dueAt.toISOString().slice(0, 10)}`,
                sourceType: "Reminder",
                sourceId: reminder.id,
            });
            if (membership.userId === input.userId) notifications.push(notification);
        }
        for (const alert of alerts) {
            const notification = await upsertNotification(prisma, {
                companyId: input.companyId,
                userId: membership.userId,
                type: "SMART_ALERT",
                title: alert.title,
                message: alert.message,
                sourceType: "SmartAlert",
                sourceId: alert.id,
            });
            if (membership.userId === input.userId) notifications.push(notification);
        }
    }

    return notifications;
}

/**
 * Marca notificacao como lida garantindo ownership por empresa e utilizador.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, notificationId: string }} input - Contexto.
 * @returns {Promise<object>} Notificacao atualizada.
 */
export async function markNotificationRead(prisma, input) {
    const notification = await prisma.inAppNotification.findFirst({
        where: {
            id: input.notificationId,
            companyId: input.companyId,
            userId: input.userId,
        },
    });
    if (!notification) {
        throw httpError(404, "NOTIFICATION_NOT_FOUND", "Notificacao nao encontrada");
    }
    return prisma.inAppNotification.update({
        where: { id: notification.id },
        data: { readAt: new Date() },
    });
}

/**
 * Envia por email um conjunto de notificações já autorizadas pelo backend.
 *
 * @param {{ sendTransactionalEmail(message: object): Promise<object> }} emailAdapter - Adapter comum de MF7.
 * @param {Array<{ recipientEmail: string, type: string, title: string, message: string }>} notifications - Notificações elegíveis.
 * @returns {Promise<Array<{ status: string, reason: string }>>} Resultados seguros do envio.
 */
export async function sendNotificationEmails(emailAdapter, notifications) {
    const results = [];

    for (const notification of notifications) {
        const reason =
            notification.type === "SMART_ALERT"
                ? TransactionalEmailReason.SMART_ALERT
                : TransactionalEmailReason.PAYMENT_REMINDER;

        // A autorização e a empresa ativa já foram resolvidas antes de chegar aqui.
        const result = await emailAdapter.sendTransactionalEmail({
            to: notification.recipientEmail,
            reason,
            subject: notification.title,
            text: notification.message,
        });

        // O retorno evita devolver conteúdo sensível ao caller.
        results.push({ status: result.status, reason: result.reason });
    }

    return results;
}
