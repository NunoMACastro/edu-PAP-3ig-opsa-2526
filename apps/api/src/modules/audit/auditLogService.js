/**
 * @file Service de auditoria consultavel MF4.
 */

const SENSITIVE_DETAIL_KEYS = new Set([
    "password",
    "token",
    "cookie",
    "authorization",
    "content",
    "raw",
]);

/**
 * Remove campos sensiveis de detalhes antes de expor logs na API.
 *
 * @param {unknown} details - Detalhes persistidos no AuditLog.
 * @returns {unknown} Detalhes minimizados.
 */
function sanitizeDetails(details) {
    if (!details || typeof details !== "object" || Array.isArray(details)) {
        return details ?? null;
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(details)) {
        sanitized[key] = SENSITIVE_DETAIL_KEYS.has(key.toLowerCase())
            ? "[redigido]"
            : value;
    }
    return sanitized;
}

/**
 * Regista auditoria sensivel de forma centralizada.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente ou transacao Prisma.
 * @param {{ companyId: string, userId: string, action: string, entity: string, entityId: string, details?: object }} input - Dados de auditoria.
 * @returns {Promise<object>} Log criado.
 */
export function recordAuditLog(prisma, input) {
    return prisma.auditLog.create({
        data: {
            companyId: input.companyId,
            userId: input.userId,
            action: input.action,
            entity: input.entity,
            entityId: input.entityId,
            details: sanitizeDetails(input.details),
        },
    });
}

/**
 * Lista logs de auditoria da empresa ativa com detalhes minimizados.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string }} input - Contexto.
 * @returns {Promise<object[]>} Logs de auditoria.
 */
export async function listAuditLogs(prisma, input) {
    const logs = await prisma.auditLog.findMany({
        where: { companyId: input.companyId },
        orderBy: { createdAt: "desc" },
        take: 100,
    });
    return logs.map((log) => ({
        ...log,
        details: sanitizeDetails(log.details),
    }));
}
