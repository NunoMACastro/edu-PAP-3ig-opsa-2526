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

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ENTITY_LABELS = Object.freeze({
    SaleDocument: "Documento de venda",
    PurchaseDocument: "Documento de compra",
    JournalEntry: "Lançamento contabilístico",
    StockMovement: "Movimento de stock",
    Company: "Empresa",
    CompanyMembership: "Contexto de empresa",
});

function detailIdentifier(details, key) {
    if (!details || typeof details !== "object" || Array.isArray(details)) return null;
    const value = details[key];
    return typeof value === "string" && UUID_PATTERN.test(value) ? value : null;
}

function safeReferenceLabel(entity) {
    return ENTITY_LABELS[entity] ?? "Operação registada";
}

/**
 * Resolve números de documentos e descrições de journal em três queries batch,
 * sempre limitadas à empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {object[]} logs - Logs já paginados.
 * @returns {Promise<Map<string, object>>} Referências indexadas pelo ID real.
 */
async function resolveAuditReferences(prisma, companyId, logs) {
    const saleIds = new Set();
    const purchaseIds = new Set();
    const journalIds = new Set();
    for (const log of logs) {
        if (log.entity === "SaleDocument" && typeof log.entityId === "string") {
            saleIds.add(log.entityId);
        }
        if (log.entity === "PurchaseDocument" && typeof log.entityId === "string") {
            purchaseIds.add(log.entityId);
        }
        if (log.entity === "JournalEntry" && typeof log.entityId === "string") {
            journalIds.add(log.entityId);
        }
        const saleDocumentId = detailIdentifier(log.details, "saleDocumentId");
        const purchaseDocumentId = detailIdentifier(log.details, "purchaseDocumentId");
        if (saleDocumentId) saleIds.add(saleDocumentId);
        if (purchaseDocumentId) purchaseIds.add(purchaseDocumentId);
    }

    const [sales, purchases, journals] = await Promise.all([
        saleIds.size > 0 && prisma.saleDocument?.findMany
            ? prisma.saleDocument.findMany({
                where: { companyId, id: { in: [...saleIds] } },
                select: { id: true, number: true },
            })
            : [],
        purchaseIds.size > 0 && prisma.purchaseDocument?.findMany
            ? prisma.purchaseDocument.findMany({
                where: { companyId, id: { in: [...purchaseIds] } },
                select: { id: true, supplierNumber: true },
            })
            : [],
        journalIds.size > 0 && prisma.journalEntry?.findMany
            ? prisma.journalEntry.findMany({
                where: { companyId, id: { in: [...journalIds] } },
                select: { id: true, description: true },
            })
            : [],
    ]);

    const references = new Map();
    for (const document of sales) {
        references.set(`SALE:${document.id}`, {
            type: "SALE",
            id: document.id,
            label: document.number || "Rascunho de venda",
        });
    }
    for (const document of purchases) {
        references.set(`PURCHASE:${document.id}`, {
            type: "PURCHASE",
            id: document.id,
            label: document.supplierNumber || "Rascunho de compra",
        });
    }
    for (const journal of journals) {
        references.set(`JOURNAL:${journal.id}`, {
            type: "JOURNAL",
            id: journal.id,
            label: journal.description || "Lançamento contabilístico",
        });
    }
    return references;
}

function referenceForLog(log, references) {
    const detailSaleId = detailIdentifier(log.details, "saleDocumentId");
    const detailPurchaseId = detailIdentifier(log.details, "purchaseDocumentId");
    if (detailSaleId && references.has(`SALE:${detailSaleId}`)) {
        return references.get(`SALE:${detailSaleId}`);
    }
    if (detailPurchaseId && references.has(`PURCHASE:${detailPurchaseId}`)) {
        return references.get(`PURCHASE:${detailPurchaseId}`);
    }
    if (log.entity === "SaleDocument" && references.has(`SALE:${log.entityId}`)) {
        return references.get(`SALE:${log.entityId}`);
    }
    if (log.entity === "PurchaseDocument" && references.has(`PURCHASE:${log.entityId}`)) {
        return references.get(`PURCHASE:${log.entityId}`);
    }
    if (log.entity === "JournalEntry" && references.has(`JOURNAL:${log.entityId}`)) {
        return references.get(`JOURNAL:${log.entityId}`);
    }
    return {
        type: "OTHER",
        id: log.entityId,
        label: safeReferenceLabel(log.entity),
    };
}

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
        select: {
            id: true,
            userId: true,
            action: true,
            entity: true,
            entityId: true,
            details: true,
            createdAt: true,
            user: { select: { id: true, name: true, email: true } },
        },
    });
    const references = await resolveAuditReferences(prisma, input.companyId, logs);
    return buildCursorPage(logs, {
        limit,
        sortField: "createdAt",
        sortType: "date",
        serialize: (log) => ({
            id: log.id,
            action: log.action,
            entity: log.entity,
            entityId: log.entityId,
            details: sanitizeDetails(log.details),
            createdAt: log.createdAt,
            actor: {
                id: log.user?.id ?? log.userId ?? "",
                name: log.user?.name ?? null,
                email: log.user?.email ?? "",
            },
            reference: referenceForLog(log, references),
        }),
    });
}
