/**
 * @file Politica de retencao contabilistica para BK-MF7-02.
 */

const RETENTION_YEARS = 10;

export const RETAINED_ENTITIES = Object.freeze([
    "SaleDocument",
    "PurchaseDocument",
    "Receipt",
    "Payment",
    "JournalEntry",
    "VatMapRun",
    "SaftExportRun",
    "AuditLog",
]);

const RETAINED_ENTITY_SET = new Set(RETAINED_ENTITIES);

export class RetentionHoldActiveError extends Error {
    /**
     * Cria o erro de dominio usado quando a retencao legal ainda bloqueia a remocao.
     *
     * @param {{ entity: string, entityId: string, retainUntil: Date }} input - Dados da retencao ativa.
     */
    constructor(input) {
        super(
            `A entidade ${input.entity}:${input.entityId} esta protegida por retencao legal ate ${input.retainUntil.toISOString()}.`,
        );
        this.name = "RetentionHoldActiveError";
        this.code = "RETENTION_HOLD_ACTIVE";
        this.status = 409;
        this.statusCode = 409;
        this.entity = input.entity;
        this.entityId = input.entityId;
        this.retainUntil = input.retainUntil;
    }
}

/**
 * Valida se o valor recebido e uma data real.
 *
 * @param {unknown} value - Valor a validar.
 * @param {string} fieldName - Nome funcional usado na mensagem.
 * @returns {Date} Data validada.
 */
function assertValidDate(value, fieldName) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new TypeError(`${fieldName} tem de ser uma data valida.`);
    }

    return value;
}

/**
 * Valida texto obrigatorio vindo do backend ou de parametro de rota.
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
 * Calcula a data em que termina a retencao contabilistica de 10 anos.
 *
 * @param {Date} periodEndAt - Data contabilistica de referencia.
 * @returns {Date} Data final da retencao legal.
 */
export function calculateRetainUntil(periodEndAt) {
    const validPeriodEndAt = assertValidDate(periodEndAt, "periodEndAt");
    const retainUntil = new Date(validPeriodEndAt);

    // UTC evita que mudancas de fuso horario alterem o dia final de retencao.
    retainUntil.setUTCFullYear(retainUntil.getUTCFullYear() + RETENTION_YEARS);
    return retainUntil;
}

/**
 * Cria ou atualiza de forma idempotente o hold legal de uma entidade.
 *
 * O caller deve fornecer o cliente de uma transação quando o hold fizer parte
 * de uma mutação contabilística, garantindo que a operação final e a retenção
 * ficam confirmadas ou revertidas em conjunto.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma ou transação.
 * @param {{ companyId: string, entity: string, entityId: string, periodEndAt: Date, reason: string }} input - Entidade e período legal.
 * @returns {Promise<object>} Hold persistido.
 */
export function upsertRetentionHold(prisma, input) {
    const companyId = assertRequiredString(input?.companyId, "companyId");
    const entity = assertRetainedEntity(input?.entity);
    const entityId = assertRequiredString(input?.entityId, "entityId");
    const periodEndAt = assertValidDate(input?.periodEndAt, "periodEndAt");
    const reason = assertRequiredString(input?.reason, "reason");
    const retainUntil = calculateRetainUntil(periodEndAt);

    return prisma.retentionHold.upsert({
        where: {
            companyId_entity_entityId: { companyId, entity, entityId },
        },
        create: {
            companyId,
            entity,
            entityId,
            periodEndAt,
            retainUntil,
            reason,
        },
        update: {
            periodEndAt,
            retainUntil,
            reason,
        },
    });
}

/**
 * Materializa os holds das entidades contabilísticas pertencentes a um
 * período que está a ser fechado. A operação é idempotente e devolve
 * contagens por entidade para evidência e auditoria.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma do fecho fiscal.
 * @param {{ companyId: string, period: { startDate: Date, endDate: Date } }} input - Empresa e período fechado.
 * @returns {Promise<{ total: number, byEntity: Record<string, number> }>} Contagens materializadas.
 */
export async function materializeRetentionHoldsForPeriod(tx, input) {
    const companyId = assertRequiredString(input?.companyId, "companyId");
    const startDate = assertValidDate(input?.period?.startDate, "period.startDate");
    const endDate = assertValidDate(input?.period?.endDate, "period.endDate");
    const inPeriod = { gte: startDate, lte: endDate };

    const sources = await Promise.all([
        tx.saleDocument.findMany({
            where: {
                companyId,
                issuedAt: inPeriod,
                status: { in: ["ISSUED", "SETTLED"] },
            },
            select: { id: true },
        }),
        tx.purchaseDocument.findMany({
            where: {
                companyId,
                issuedAt: inPeriod,
                status: { in: ["POSTED", "PAID"] },
            },
            select: { id: true },
        }),
        tx.receipt.findMany({
            where: { companyId, receivedAt: inPeriod },
            select: { id: true },
        }),
        tx.payment.findMany({
            where: { companyId, paidAt: inPeriod },
            select: { id: true },
        }),
        tx.journalEntry.findMany({
            where: { companyId, entryDate: inPeriod },
            select: { id: true },
        }),
        tx.vatMapRun.findMany({
            where: {
                companyId,
                fromDate: { gte: startDate },
                toDate: { lte: endDate },
            },
            select: { id: true },
        }),
        tx.saftExportRun.findMany({
            where: {
                companyId,
                fromDate: { gte: startDate },
                toDate: { lte: endDate },
            },
            select: { id: true },
        }),
        tx.auditLog.findMany({
            where: { companyId, createdAt: inPeriod },
            select: { id: true },
        }),
    ]);
    const entities = [
        "SaleDocument",
        "PurchaseDocument",
        "Receipt",
        "Payment",
        "JournalEntry",
        "VatMapRun",
        "SaftExportRun",
        "AuditLog",
    ];
    const byEntity = {};

    for (const [index, records] of sources.entries()) {
        const entity = entities[index];
        byEntity[entity] = records.length;
        for (const record of records) {
            await upsertRetentionHold(tx, {
                companyId,
                entity,
                entityId: record.id,
                periodEndAt: endDate,
                reason: "FISCAL_PERIOD_CLOSED",
            });
        }
    }

    return {
        total: Object.values(byEntity).reduce((sum, count) => sum + count, 0),
        byEntity,
    };
}

/**
 * Garante que a entidade pertence ao conjunto contabilistico protegido.
 *
 * @param {unknown} entity - Nome tecnico da entidade.
 * @returns {string} Entidade validada.
 */
export function assertRetainedEntity(entity) {
    const normalizedEntity = assertRequiredString(entity, "entity");

    if (!RETAINED_ENTITY_SET.has(normalizedEntity)) {
        throw new RangeError(
            `A entidade ${normalizedEntity} nao esta abrangida pela retencao contabilistica MF7.`,
        );
    }

    return normalizedEntity;
}

/**
 * Determina se a retencao ainda bloqueia a remocao.
 *
 * @param {{ retainUntil: Date, now: Date }} input - Datas da avaliacao.
 * @returns {boolean} Verdadeiro quando a remocao ainda deve ficar bloqueada.
 */
export function isRetentionActive(input) {
    const retainUntil = assertValidDate(input?.retainUntil, "retainUntil");
    const now = assertValidDate(input?.now, "now");

    return retainUntil.getTime() > now.getTime();
}

/**
 * Confirma se uma entidade contabilistica pode ser removida.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, entity: string, entityId: string, now?: Date }} input - Contexto da entidade.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 * @throws {RetentionHoldActiveError} Quando existe retencao ativa.
 */
export async function assertRetainedRecordDeletionAllowed(prisma, input) {
    const companyId = assertRequiredString(input?.companyId, "companyId");
    const entity = assertRetainedEntity(input?.entity);
    const entityId = assertRequiredString(input?.entityId, "entityId");
    const now = input?.now ?? new Date();

    const hold = await prisma.retentionHold.findFirst({
        where: {
            companyId,
            entity,
            entityId,
        },
        select: {
            retainUntil: true,
        },
    });

    if (!hold) {
        return {
            allowed: true,
            retainUntil: null,
        };
    }

    if (isRetentionActive({ retainUntil: hold.retainUntil, now })) {
        throw new RetentionHoldActiveError({
            entity,
            entityId,
            retainUntil: hold.retainUntil,
        });
    }

    return {
        allowed: true,
        retainUntil: hold.retainUntil,
    };
}
