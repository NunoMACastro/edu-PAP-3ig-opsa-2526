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
 * Lista apenas os dados mínimos necessários para atribuir uma tarefa.
 *
 * A consulta é limitada às memberships ativas da empresa em contexto e não
 * expõe email, role ou dados de outras empresas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<Array<{id: string, name: string}>>} Responsáveis disponíveis.
 */
export async function listTaskAssignees(prisma, companyId) {
    const memberships = await prisma.companyMembership.findMany({
        where: { companyId, isActive: true },
        select: {
            userId: true,
            user: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 100,
    });

    return memberships.map((membership) => ({
        id: membership.userId,
        name: membership.user.name?.trim() || "Utilizador sem nome",
    }));
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
    return prisma.$transaction(async (tx) => {
        await assertAssignee(tx, {
            companyId: input.companyId,
            assignedToId: data.assignedToId,
        });
        const task = await tx.operationalTask.create({
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
                action: "TASK_CREATED",
                entity: "OperationalTask",
                entityId: task.id,
                details: { assignedToId: task.assignedToId, dueAt: task.dueAt },
            },
        });
        return task;
    });
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
    return prisma.$transaction(async (tx) => {
        const task = await tx.operationalTask.findFirst({
            where: { id: input.taskId, companyId: input.companyId },
        });
        if (!task) {
            throw httpError(404, "TASK_NOT_FOUND", "Tarefa nao encontrada");
        }
        const claimed = await tx.operationalTask.updateMany({
            where: {
                id: task.id,
                companyId: input.companyId,
                status: task.status,
            },
            data: { status: data.status },
        });
        if (claimed.count !== 1) {
            throw httpError(409, "STALE_STATE", "A tarefa foi alterada por outra operação");
        }
        const updated = await tx.operationalTask.findFirst({
            where: { id: task.id, companyId: input.companyId },
        });
        await tx.auditLog.create({
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
    });
}
