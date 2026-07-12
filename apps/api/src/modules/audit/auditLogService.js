/**
 * @file Service de auditoria consultavel MF4.
 */

import {
    buildCursorPage,
    buildKeysetCondition,
    decodePageCursor,
    parsePageLimit,
} from "../../lib/cursorPagination.js";
import { upsertRetentionHold } from "../compliance/retentionPolicy.js";

const SENSITIVE_DETAIL_KEYS = new Set([
    "password",
    "secret",
    "token",
    "cookie",
    "authorization",
    "content",
    "raw",
    "email",
    "recipientemail",
    "ip",
]);

const SENSITIVE_ACTIONS = new Set([
    "permissions.update",
    "fiscalPeriod.create",
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
function sanitizeDetails(details, depth = 0) {
    if (details === null || details === undefined) return null;
    if (details instanceof Date) return details.toISOString();
    if (Buffer.isBuffer(details)) return "[redigido]";
    if (typeof details !== "object") return details;
    if (depth >= 5) return "[redigido]";
    if (Array.isArray(details)) {
        return details
            .slice(0, 100)
            .map((value) => sanitizeDetails(value, depth + 1));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(details).slice(0, 100)) {
        sanitized[key] = SENSITIVE_DETAIL_KEYS.has(key.toLowerCase())
            ? "[redigido]"
            : sanitizeDetails(value, depth + 1);
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
 * Regista auditoria contabilística e materializa o respetivo hold legal.
 *
 * O caller deve fornecer um cliente de transação. Desta forma, a operação de
 * negócio, o AuditLog e a retenção são confirmados ou revertidos em conjunto.
 * A função não abre uma transação própria para continuar utilizável dentro de
 * transações Prisma já existentes.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente da transação Prisma.
 * @param {{ companyId: string, userId: string, action: string, entity: string, entityId: string, periodEndAt: Date, retentionReason: string, details?: object }} input - Auditoria e período legal.
 * @returns {Promise<object>} AuditLog protegido por retenção.
 */
export async function recordRetainedAuditLog(prisma, input) {
    const auditLog = await recordAuditLog(prisma, input);
    await upsertRetentionHold(prisma, {
        companyId: input.companyId,
        entity: "AuditLog",
        entityId: auditLog.id,
        periodEndAt: input.periodEndAt,
        reason: input.retentionReason,
    });
    return auditLog;
}

/**
 * Regista uma ação da allowlist sensível e protege o AuditLog na mesma unidade.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente da transação Prisma.
 * @param {{ companyId: string, userId: string, action: string, entity: string, entityId: string, periodEndAt: Date, retentionReason: string, details?: Record<string, unknown> }} input - Auditoria sensível e referência legal.
 * @returns {Promise<object>} AuditLog criado e protegido.
 */
export async function recordRetainedSensitiveAudit(prisma, input) {
    const auditLog = await recordSensitiveAudit(prisma, input);
    await upsertRetentionHold(prisma, {
        companyId: input.companyId,
        entity: "AuditLog",
        entityId: auditLog.id,
        periodEndAt: input.periodEndAt,
        reason: input.retentionReason,
    });
    return auditLog;
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
 * @param {{ companyId: string, cursor?: string, limit?: string | number }} input - Contexto e paginação.
 * @returns {Promise<{items: object[], pageInfo: object}>} Página de logs.
 */
export async function listAuditLogs(prisma, input) {
    const limit = parsePageLimit(input.limit);
    const cursor = decodePageCursor(input.cursor, "date");
    const keyset = buildKeysetCondition(cursor, {
        sortField: "createdAt",
        direction: "desc",
    });
    const baseWhere = { companyId: input.companyId };
    const logs = await prisma.auditLog.findMany({
        where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
    });
    return buildCursorPage(logs, {
        limit,
        sortField: "createdAt",
        sortType: "date",
        serialize: (log) => ({
            ...log,
            details: sanitizeDetails(log.details),
        }),
    });
}
