/**
 * @file Service de auditoria operacional da OPSA.
 */

const SENSITIVE_ACTIONS = new Set([
    "permissions.update",
    "fiscalPeriod.close",
    "document.issue",
    "security.setting.update",
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

/**
 * Confirma se a ação pertence ao contrato sensível de MF6.
 *
 * @param {string} action - Ação funcional a auditar.
 * @returns {void}
 */
function assertSensitiveAction(action) {
    if (!SENSITIVE_ACTIONS.has(action)) {
        throw new Error(`Ação sensível não declarada: ${action}`);
    }
}

/**
 * Impede guardar payloads completos ou credenciais em `details`.
 *
 * @param {Record<string, unknown>} details - Detalhes mínimos da operação.
 * @returns {Record<string, unknown>} Detalhes aprovados para auditoria.
 */
function assertSafeDetails(details) {
    for (const key of Object.keys(details)) {
        // O Set está em minúsculas para bloquear chaves perigosas em qualquer capitalização.
        const normalizedKey = key.toLowerCase();
        if (FORBIDDEN_DETAIL_KEYS.has(normalizedKey)) {
            throw new Error(`Detalhe sensível proibido no audit log: ${key}`);
        }
    }

    return details;
}

/**
 * Regista uma operação sensível usando o contrato `AuditLog` já criado em MF4.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma ou transação.
 * @param {{ companyId: string, userId: string, action: string, entity: string, entityId: string, details?: Record<string, unknown> }} input - Dados mínimos de auditoria.
 * @returns {Promise<object>} Log criado.
 */
export function recordSensitiveAudit(prisma, input) {
    assertSensitiveAction(input.action);
    const details = assertSafeDetails(input.details ?? {});

    // A empresa e o utilizador vêm do backend autenticado; o frontend não decide ownership.
    return recordAuditLog(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        // O resultado fica dentro de details para não inventar colunas Prisma fora do schema.
        details,
    });
}