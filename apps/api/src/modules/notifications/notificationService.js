/**
 * @file Service de notificacoes in-app MF4.
 */

import { httpError } from "../../lib/httpErrors.js";
import { hasPermission, Permission } from "../permissions/permissions.js";
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
            status: data.status,
            resolvedAt: data.resolvedAt,
        },
        create: data,
    });
}

/**
 * Associa uma notificação a uma preferência configurável do utilizador.
 *
 * @param {{ sourceType: string, alertType?: string }} input - Origem funcional.
 * @returns {string} Código usado em AlertPreference.
 */
function preferenceTypeForNotification(input) {
    if (input.sourceType === "Reminder") return "deadline";
    const alertType = String(input.alertType ?? "").toUpperCase();
    if (alertType.includes("STOCK")) return "stock";
    if (alertType.includes("CASH") || alertType.includes("FLOW")) return "cashflow";
    return "ai";
}

/**
 * Confirma a preferência efetiva; a ausência de linha mantém o default ativo.
 *
 * @param {Map<string, boolean>} preferences - Índice userId:type.
 * @param {string} userId - Destinatário.
 * @param {string} type - Tipo configurável.
 * @returns {boolean} Se deve existir entrega por email.
 */
function isDeliveryEnabled(preferences, userId, type) {
    return preferences.get(`${userId}:${type}`) ?? true;
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
 * @param {{ companyId: string }} input - Empresa processada pelo worker interno.
 * @param {{ enqueue(tx: object, message: object, options: { dedupeKey: string }): Promise<object> }} emailOutbox - Outbox cifrada comum.
 * @returns {Promise<{recipients: number, sources: number, notificationsMaterialized: number, emailsQueued: number}>} Resumo seguro do ciclo empresarial.
 */
export async function materializeCompanyNotifications(prisma, input, emailOutbox) {
    if (!emailOutbox?.enqueue) {
        throw new Error("EmailOutbox é obrigatória para sincronizar notificações.");
    }

    return prisma.$transaction(async (tx) => {
        const [memberships, reminders, alerts, storedPreferences] = await Promise.all([
            tx.companyMembership.findMany({
                where: { companyId: input.companyId, isActive: true },
                select: { userId: true, role: true, user: { select: { email: true } } },
            }),
            tx.reminder.findMany({
                where: { companyId: input.companyId, status: "OPEN" },
                orderBy: [{ dueAt: "asc" }, { id: "asc" }],
            }),
            tx.smartAlert.findMany({
                where: { companyId: input.companyId, status: "OPEN" },
                orderBy: [{ score: "desc" }, { priority: "desc" }, { generatedAt: "desc" }],
            }),
            tx.alertPreference.findMany({
                where: { companyId: input.companyId },
                select: { userId: true, type: true, enabled: true },
            }),
        ]);
        const preferences = new Map(
            storedPreferences.map((item) => [
                `${item.userId}:${item.type}`,
                item.enabled,
            ]),
        );
        let notificationsMaterialized = 0;
        let emailsQueued = 0;

        for (const membership of memberships) {
            const candidates = [
                ...reminders.map((reminder) => ({
                    type: "REMINDER",
                    title: reminder.title,
                    message: `Prazo: ${reminder.dueAt.toISOString().slice(0, 10)}`,
                    sourceType: "Reminder",
                    sourceId: reminder.id,
                    preferenceType: preferenceTypeForNotification({
                        sourceType: "Reminder",
                    }),
                    emailReason: TransactionalEmailReason.PAYMENT_REMINDER,
                })),
                ...(hasPermission(membership.role, Permission.AI_ALERTS_READ) ? alerts.map((alert) => ({
                    type: "SMART_ALERT",
                    title: alert.title,
                    message: alert.message,
                    sourceType: "SmartAlert",
                    sourceId: alert.id,
                    preferenceType: preferenceTypeForNotification({
                        sourceType: "SmartAlert",
                        alertType: alert.type,
                    }),
                    emailReason: TransactionalEmailReason.SMART_ALERT,
                })) : []),
            ];

            for (const candidate of candidates) {
                if (!isDeliveryEnabled(preferences, membership.userId, candidate.preferenceType)) {
                    continue;
                }
                await upsertNotification(tx, {
                    companyId: input.companyId,
                    userId: membership.userId,
                    type: candidate.type,
                    title: candidate.title,
                    message: candidate.message,
                    sourceType: candidate.sourceType,
                    sourceId: candidate.sourceId,
                    status: "OPEN",
                    resolvedAt: null,
                });
                notificationsMaterialized += 1;
                {
                    await emailOutbox.enqueue(
                        tx,
                        {
                            to: membership.user.email,
                            reason: candidate.emailReason,
                            subject: `OPSA — ${candidate.title}`,
                            text: `Notificação OPSA: ${candidate.message}`,
                        },
                        {
                            dedupeKey: [
                                "notification",
                                input.companyId,
                                membership.userId,
                                candidate.sourceType,
                                candidate.sourceId,
                            ].join(":"),
                        },
                    );
                    emailsQueued += 1;
                }
            }
        }

        return {
            recipients: memberships.length,
            sources: reminders.length + alerts.length,
            notificationsMaterialized,
            emailsQueued,
        };
    });
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
