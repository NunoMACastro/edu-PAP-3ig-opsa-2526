// apps/api/src/modules/tasks/taskService.js
import { httpError } from "../../lib/httpErrors.js";

/** Lista tarefas da empresa ativa. */
export function listOperationalTasks(prisma, input) {
    // A empresa vem do middleware de contexto, não de filtros escolhidos pelo utilizador.
    return prisma.operationalTask.findMany({ where: { companyId: input.companyId }, orderBy: { createdAt: "desc" } });
}

/** Garante que o responsável é membro ativo da empresa. */
async function assertAssignableUser(prisma, input) {
    // A tarefa só pode ser atribuída a alguém que pertence à mesma empresa ativa.
    const membership = await prisma.companyMembership.findFirst({
        where: {
            companyId: input.companyId,
            userId: input.assignedToId,
            // isActive evita atribuir trabalho a utilizadores removidos ou suspensos.
            isActive: true,
        },
    });
    if (!membership) {
        throw httpError(400, "TASK_ASSIGNEE_NOT_IN_COMPANY", "Só podes atribuir tarefas a utilizadores da empresa ativa");
    }
}

/** Cria tarefa para a empresa ativa. */
export async function createOperationalTask(prisma, input) {
    // Antes de escrever a tarefa, validamos a relação entre empresa e responsável.
    await assertAssignableUser(prisma, { companyId: input.companyId, assignedToId: input.data.assignedToId });
    // createdById guarda quem criou; assignedToId guarda quem deve executar.
    return prisma.operationalTask.create({ data: { companyId: input.companyId, createdById: input.userId, ...input.data } });
}

/** Atualiza estado depois de confirmar ownership por empresa. */
export async function updateOperationalTaskStatus(prisma, input) {
    // O filtro id + companyId impede atualizar tarefas que pertencem a outra empresa.
    const existing = await prisma.operationalTask.findFirst({ where: { id: input.id, companyId: input.companyId } });
    if (!existing) throw httpError(404, "OPERATIONALTASK_NOT_FOUND", "Tarefa não encontrada");
    // A mudança é intencionalmente limitada ao status.
    return prisma.operationalTask.update({ where: { id: input.id }, data: { status: input.status } });
}