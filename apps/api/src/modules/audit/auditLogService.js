/**
 * @file Service de auditoria consultavel MF4.
 */

const SENSITIVE_DETAIL_KEYS = new Set([
    "password",
    "secret",
    "token",
    "cookie",
    "authorization",
    "content",
    "raw",
]);

const SENSITIVE_ACTIONS = new Set([
    "permissions.update",
    "fiscalPeriod.close",
    "document.issue",
    "security.setting.update",
    "retention.delete.allowed",
]);

const FORBIDDEN_DETAIL_KEYS = new Set([
    "password",
    "token",
    "secret",
    "authorization",
    "cookie",
    "rawpayload",
    "documentlines",
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
 * Confirma se a acao pertence ao contrato sensivel de MF6.
 *
 * @param {string} action - Acao funcional a auditar.
 * @returns {void}
 */
function assertSensitiveAction(action) {
    if (!SENSITIVE_ACTIONS.has(action)) {
        throw new Error(`Acao sensivel nao declarada: ${action}`);
    }
}

/**
 * Impede guardar payloads completos ou credenciais em detalhes de auditoria.
 *
 * @param {Record<string, unknown>} details - Detalhes minimos da operacao.
 * @returns {Record<string, unknown>} Detalhes aprovados.
 */
function assertSafeDetails(details) {
    for (const key of Object.keys(details)) {
        if (FORBIDDEN_DETAIL_KEYS.has(key.toLowerCase())) {
            throw new Error(`Detalhe sensivel proibido no audit log: ${key}`);
        }
    }

    return details;
}

/**
 * Regista uma operacao sensivel usando o contrato AuditLog da MF4.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente ou transacao Prisma.
 * @param {{ companyId: string, userId: string, action: string, entity: string, entityId: string, details?: Record<string, unknown> }} input - Dados minimos.
 * @returns {Promise<object>} Log criado.
 */
export function recordSensitiveAudit(prisma, input) {
    assertSensitiveAction(input.action);

    // A empresa e o utilizador vem do contexto autenticado no backend.
    return recordAuditLog(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        details: assertSafeDetails(input.details ?? {}),
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
