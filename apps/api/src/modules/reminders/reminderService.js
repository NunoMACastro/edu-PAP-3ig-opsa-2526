/**
 * @file Service de lembretes MF4.
 */

import { httpError } from "../../lib/httpErrors.js";
import {
    validateReminderPayload,
    validateReminderStatusPayload,
} from "./reminderValidators.js";

/**
 * Lista lembretes da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<object[]>} Lembretes ordenados por prazo.
 */
export function listReminders(prisma, companyId) {
    return prisma.reminder.findMany({
        where: { companyId },
        orderBy: [{ status: "asc" }, { dueAt: "asc" }],
        take: 100,
    });
}

/**
 * Cria lembrete sem aceitar companyId externo.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, body: unknown }} input - Contexto e payload.
 * @returns {Promise<object>} Lembrete criado.
 */
export async function createReminder(prisma, input) {
    const data = validateReminderPayload(input.body);
    return prisma.$transaction(async (tx) => {
        const reminder = await tx.reminder.create({
            data: {
                companyId: input.companyId,
                createdById: input.userId,
                ...data,
            },
        });
        await tx.auditLog.create({
            data: {
                companyId: input.companyId,
                userId: input.userId,
                action: "REMINDER_CREATED",
                entity: "Reminder",
                entityId: reminder.id,
                details: { type: reminder.type, dueAt: reminder.dueAt },
            },
        });
        return reminder;
    });
}

/**
 * Atualiza estado de lembrete validando ownership por empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, reminderId: string, body: unknown }} input - Contexto.
 * @returns {Promise<object>} Lembrete atualizado.
 */
export async function updateReminderStatus(prisma, input) {
    const data = validateReminderStatusPayload(input.body);
    return prisma.$transaction(async (tx) => {
        const reminder = await tx.reminder.findFirst({
            where: { id: input.reminderId, companyId: input.companyId },
        });
        if (!reminder) {
            throw httpError(404, "REMINDER_NOT_FOUND", "Lembrete nao encontrado");
        }
        const claimed = await tx.reminder.updateMany({
            where: {
                id: reminder.id,
                companyId: input.companyId,
                status: reminder.status,
            },
            data: { status: data.status, updatedById: input.userId },
        });
        if (claimed.count !== 1) {
            throw httpError(409, "STALE_STATE", "O lembrete foi alterado por outra operação");
        }
        const updated = await tx.reminder.findFirst({
            where: { id: reminder.id, companyId: input.companyId },
        });
        await tx.auditLog.create({
            data: {
                companyId: input.companyId,
                userId: input.userId,
                action: "REMINDER_STATUS_UPDATED",
                entity: "Reminder",
                entityId: reminder.id,
                details: { from: reminder.status, to: updated.status },
            },
        });
        return updated;
    });
}
