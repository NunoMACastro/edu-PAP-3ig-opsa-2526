// apps/api/src/modules/reminders/reminderService.js
import { httpError } from "../../lib/httpErrors.js";

/** Lista lembretes da empresa ativa. */
export function listReminders(prisma, input) {
    // A listagem nunca recebe companyId do query string; usa o contexto autenticado.
    return prisma.reminder.findMany({ where: { companyId: input.companyId }, orderBy: { createdAt: "desc" } });
}

/** Cria lembrete para a empresa ativa. */
export function createReminder(prisma, input) {
    // companyId e createdById vêm da sessão/contexto, não do body enviado pelo browser.
    return prisma.reminder.create({ data: { companyId: input.companyId, createdById: input.userId, ...input.data } });
}

/** Atualiza estado depois de confirmar ownership por empresa. */
export async function updateReminderStatus(prisma, input) {
    // Primeiro procuramos por id + companyId para impedir alterações entre empresas.
    const existing = await prisma.reminder.findFirst({ where: { id: input.id, companyId: input.companyId } });
    if (!existing) throw httpError(404, "REMINDER_NOT_FOUND", "Lembrete não encontrado");
    // Só depois da confirmação de ownership é que usamos update por id.
    return prisma.reminder.update({ where: { id: input.id }, data: { status: input.status } });
}