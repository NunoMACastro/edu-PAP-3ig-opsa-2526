/**
 * @file Gate de remocao contabilistica protegido por retencao legal.
 */

import { recordSensitiveAudit } from "../audit/auditLogService.js";
import { assertRetainedRecordDeletionAllowed } from "./retentionPolicy.js";

export const RETENTION_AUDIT_ACTION = "retention.delete.allowed";

/**
 * Valida texto obrigatorio do contexto backend.
 *
 * @param {unknown} value - Valor recebido.
 * @param {string} fieldName - Nome funcional usado na mensagem.
 * @returns {string} Texto validado.
 */
function assertRequiredString(value, fieldName) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`${fieldName} e obrigatorio.`);
    }

    return value.trim();
}

/**
 * Valida retencao legal e regista auditoria quando a remocao e autorizada.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma ou transacao.
 * @param {{ companyId: string, userId: string, entity: string, entityId: string, now?: Date }} input - Contexto destrutivo.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export async function assertAccountingDeletionGate(prisma, input) {
    const companyId = assertRequiredString(input?.companyId, "companyId");
    const userId = assertRequiredString(input?.userId, "userId");
    const entity = assertRequiredString(input?.entity, "entity");
    const entityId = assertRequiredString(input?.entityId, "entityId");

    const decision = await assertRetainedRecordDeletionAllowed(prisma, {
        companyId,
        entity,
        entityId,
        now: input?.now,
    });

    await recordSensitiveAudit(prisma, {
        companyId,
        userId,
        action: RETENTION_AUDIT_ACTION,
        entity,
        entityId,
        details: {
            retainUntil: decision.retainUntil?.toISOString() ?? null,
            retentionStatus: decision.retainUntil ? "expired" : "not_registered",
        },
    });

    return decision;
}

/**
 * Gate especifico para documentos de venda.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma ou transacao.
 * @param {{ companyId: string, userId: string, saleDocumentId: string, now?: Date }} input - Contexto da remocao.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertSaleDocumentDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input?.companyId,
        userId: input?.userId,
        entity: "SaleDocument",
        entityId: input?.saleDocumentId,
        now: input?.now,
    });
}

/**
 * Gate especifico para documentos de compra.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma ou transacao.
 * @param {{ companyId: string, userId: string, purchaseDocumentId: string, now?: Date }} input - Contexto da remocao.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertPurchaseDocumentDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input?.companyId,
        userId: input?.userId,
        entity: "PurchaseDocument",
        entityId: input?.purchaseDocumentId,
        now: input?.now,
    });
}

/**
 * Gate especifico para lancamentos contabilisticos.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma ou transacao.
 * @param {{ companyId: string, userId: string, journalEntryId: string, now?: Date }} input - Contexto da remocao.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertJournalEntryDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input?.companyId,
        userId: input?.userId,
        entity: "JournalEntry",
        entityId: input?.journalEntryId,
        now: input?.now,
    });
}

/**
 * Gate especifico para mapas de IVA.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma ou transacao.
 * @param {{ companyId: string, userId: string, vatMapRunId: string, now?: Date }} input - Contexto da remocao.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertVatMapRunDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input?.companyId,
        userId: input?.userId,
        entity: "VatMapRun",
        entityId: input?.vatMapRunId,
        now: input?.now,
    });
}

/**
 * Gate especifico para exportacoes SAF-T.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma ou transacao.
 * @param {{ companyId: string, userId: string, saftExportRunId: string, now?: Date }} input - Contexto da remocao.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertSaftExportRunDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input?.companyId,
        userId: input?.userId,
        entity: "SaftExportRun",
        entityId: input?.saftExportRunId,
        now: input?.now,
    });
}

/**
 * Gate especifico para registos de auditoria contabilistica.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma ou transacao.
 * @param {{ companyId: string, userId: string, auditLogId: string, now?: Date }} input - Contexto da remocao.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertAuditLogDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input?.companyId,
        userId: input?.userId,
        entity: "AuditLog",
        entityId: input?.auditLogId,
        now: input?.now,
    });
}
