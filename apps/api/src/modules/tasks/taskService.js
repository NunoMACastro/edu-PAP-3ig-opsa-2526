/**
 * @file Service de tarefas operacionais MF4.
 */

import { httpError } from "../../lib/httpErrors.js";
import { validateTaskPayload, validateTaskStatusPayload } from "./taskValidators.js";

/**
 * Confirma que o utilizador atribuido pertence a empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, assignedToId?: string }} input - Dados de atribuicao.
 * @throws {Error} Quando o utilizador nao pertence a empresa ativa.
 * @returns {Promise<void>} Sem valor.
 */
async function assertAssignee(prisma, input) {
    if (!input.assignedToId) return;
    const membership = await prisma.companyMembership.findFirst({
        where: {
            companyId: input.companyId,
            userId: input.assignedToId,
            isActive: true,
        },
    });
    if (!membership) {
        throw httpError(
            400,
            "TASK_ASSIGNEE_NOT_IN_COMPANY",
            "Responsavel nao pertence a empresa ativa",
        );
    }
}

/**
 * Lista tarefas da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<object[]>} Tarefas ordenadas por prazo.
 */
export function listOperationalTasks(prisma, companyId) {
    return prisma.operationalTask.findMany({
        where: { companyId },
        orderBy: [{ status: "asc" }, { dueAt: "asc" }],
        take: 100,
    });
}

/**
 * Cria tarefa operacional com atribuicao validada.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, body: unknown }} input - Contexto e payload.
 * @returns {Promise<object>} Tarefa criada.
 */
export async function createOperationalTask(prisma, input) {
    const data = validateTaskPayload(input.body);
    await assertAssignee(prisma, {
        companyId: input.companyId,
        assignedToId: data.assignedToId,
    });
    const task = await prisma.operationalTask.create({
        data: {
            companyId: input.companyId,
            createdById: input.userId,
            ...data,
        },
    });
    await prisma.auditLog.create({
        data: {
            companyId: input.companyId,
            userId: input.userId,
            action: "TASK_CREATED",
            entity: "OperationalTask",
            entityId: task.id,
            details: { assignedToId: task.assignedToId, dueAt: task.dueAt },
        },
    });
    return task;
}

/**
 * Atualiza estado da tarefa mantendo ownership por empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, taskId: string, body: unknown }} input - Contexto.
 * @returns {Promise<object>} Tarefa atualizada.
 */
export async function updateOperationalTaskStatus(prisma, input) {
    const data = validateTaskStatusPayload(input.body);
    const task = await prisma.operationalTask.findFirst({
        where: { id: input.taskId, companyId: input.companyId },
    });
    if (!task) {
        throw httpError(404, "TASK_NOT_FOUND", "Tarefa nao encontrada");
    }
    const updated = await prisma.operationalTask.update({
        where: { id: task.id },
        data: { status: data.status },
    });
    await prisma.auditLog.create({
        data: {
            companyId: input.companyId,
            userId: input.userId,
            action: "TASK_STATUS_UPDATED",
            entity: "OperationalTask",
            entityId: task.id,
            details: { from: task.status, to: updated.status },
        },
    });
    return updated;
}
