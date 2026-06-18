// apps/api/src/modules/audit/auditLogService.js
/**
 * Regista operação sensível no trilho de auditoria.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma.
 * @param {{ companyId: string, userId: string, action: string, entity: string, entityId: string, details?: Record<string, unknown> }} input Dados mínimos.
 * @returns {Promise<object>} Log criado.
 */
export function recordAuditLog(prisma, input) {
    // O caller deve enviar detalhes mínimos e já sanitizados.
    // Este service padroniza a escrita, mas não deve receber payloads completos.
    const details = input.details ?? {};
    return prisma.auditLog.create({
        data: {
            // companyId e userId vêm do contexto autenticado da operação sensível.
            companyId: input.companyId,
            userId: input.userId,
            // action deve ser um nome estável, útil para filtros e evidence.
            action: input.action,
            entity: input.entity,
            entityId: input.entityId,
            details,
        },
    });
}