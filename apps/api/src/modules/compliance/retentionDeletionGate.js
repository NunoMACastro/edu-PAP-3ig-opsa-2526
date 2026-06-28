// apps/api/src/modules/compliance/retentionDeletionGate.js
import { recordSensitiveAudit } from "../audit/auditLogService.js";
import { assertRetainedRecordDeletionAllowed } from "./retentionPolicy.js";

export const RETENTION_AUDIT_ACTION = "retention.delete.allowed";

/**
 * Valida retenção legal e regista auditoria quando a remoção é autorizada.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{
 *   companyId: string,
 *   userId: string,
 *   entity: string,
 *   entityId: string,
 *   now?: Date
 * }} input - Contexto da operação destrutiva.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export async function assertAccountingDeletionGate(prisma, input) {
    const decision = await assertRetainedRecordDeletionAllowed(prisma, {
        companyId: input.companyId,
        entity: input.entity,
        entityId: input.entityId,
        now: input.now,
    });

    // A auditoria só é escrita depois de a política confirmar que a remoção pode avançar.
    await recordSensitiveAudit(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        action: RETENTION_AUDIT_ACTION,
        entity: input.entity,
        entityId: input.entityId,
        details: {
            retainUntil: decision.retainUntil?.toISOString() ?? null,
            retentionStatus: decision.retainUntil ? "expired" : "not_registered",
        },
    });

    return decision;
}

/**
 * Gate específico para documentos de venda.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, saleDocumentId: string, now?: Date }} input - Pedido interno.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertSaleDocumentDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        entity: "SaleDocument",
        entityId: input.saleDocumentId,
        now: input.now,
    });
}

/**
 * Gate específico para documentos de compra.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, purchaseDocumentId: string, now?: Date }} input - Pedido interno.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertPurchaseDocumentDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        entity: "PurchaseDocument",
        entityId: input.purchaseDocumentId,
        now: input.now,
    });
}

/**
 * Gate específico para lançamentos contabilísticos.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, journalEntryId: string, now?: Date }} input - Pedido interno.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertJournalEntryDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        entity: "JournalEntry",
        entityId: input.journalEntryId,
        now: input.now,
    });
}

/**
 * Gate específico para mapas de IVA.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, vatMapRunId: string, now?: Date }} input - Pedido interno.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertVatMapRunDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        entity: "VatMapRun",
        entityId: input.vatMapRunId,
        now: input.now,
    });
}

/**
 * Gate específico para exportações SAF-T.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, saftExportRunId: string, now?: Date }} input - Pedido interno.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertSaftExportRunDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        entity: "SaftExportRun",
        entityId: input.saftExportRunId,
        now: input.now,
    });
}

/**
 * Gate específico para registos de auditoria contabilística.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, auditLogId: string, now?: Date }} input - Pedido interno.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertAuditLogDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        entity: "AuditLog",
        entityId: input.auditLogId,
        now: input.now,
    });
}