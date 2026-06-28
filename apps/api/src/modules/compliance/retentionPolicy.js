// apps/api/src/modules/compliance/retentionPolicy.js
const RETENTION_YEARS = 10;

export const RETAINED_ENTITIES = Object.freeze([
    "SaleDocument",
    "PurchaseDocument",
    "JournalEntry",
    "VatMapRun",
    "SaftExportRun",
    "AuditLog",
]);

const RETAINED_ENTITY_SET = new Set(RETAINED_ENTITIES);

export class RetentionHoldActiveError extends Error {
    /**
     * Erro de domínio usado quando uma entidade ainda está dentro do prazo legal.
     *
     * @param {{ entity: string, entityId: string, retainUntil: Date }} input - Dados da retenção ativa.
     */
    constructor(input) {
        super(`A entidade ${input.entity}:${input.entityId} está protegida por retenção legal até ${input.retainUntil.toISOString()}.`);
        this.name = "RetentionHoldActiveError";
        this.code = "RETENTION_HOLD_ACTIVE";
        this.statusCode = 409;
        this.entity = input.entity;
        this.entityId = input.entityId;
        this.retainUntil = input.retainUntil;
    }
}

/**
 * Valida se o valor recebido é uma data real.
 *
 * @param {Date} value - Valor a validar.
 * @param {string} fieldName - Nome do campo usado na mensagem de erro.
 * @returns {Date} Data validada.
 */
function assertValidDate(value, fieldName) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new TypeError(`${fieldName} tem de ser uma data válida.`);
    }

    return value;
}

/**
 * Valida identificadores recebidos do contexto backend ou da rota.
 *
 * @param {unknown} value - Valor recebido.
 * @param {string} fieldName - Nome do campo usado na mensagem de erro.
 * @returns {string} Texto validado.
 */
function assertRequiredString(value, fieldName) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`${fieldName} é obrigatório.`);
    }

    return value.trim();
}

/**
 * Calcula a data final de retenção contabilística.
 *
 * @param {Date} periodEndAt - Data contabilística de referência.
 * @returns {Date} Data em que a retenção termina.
 */
export function calculateRetainUntil(periodEndAt) {
    const validPeriodEndAt = assertValidDate(periodEndAt, "periodEndAt");
    const retainUntil = new Date(validPeriodEndAt);

    // Usar UTC evita que mudanças de fuso horário alterem o dia final da retenção.
    retainUntil.setUTCFullYear(retainUntil.getUTCFullYear() + RETENTION_YEARS);
    return retainUntil;
}

/**
 * Garante que a entidade pertence ao conjunto contabilístico protegido.
 *
 * @param {string} entity - Nome técnico da entidade.
 * @returns {string} Entidade validada.
 */
export function assertRetainedEntity(entity) {
    const normalizedEntity = assertRequiredString(entity, "entity");

    if (!RETAINED_ENTITY_SET.has(normalizedEntity)) {
        throw new RangeError(`A entidade ${normalizedEntity} não está abrangida pela retenção contabilística MF7.`);
    }

    return normalizedEntity;
}

/**
 * Determina se uma retenção ainda bloqueia a remoção no instante indicado.
 *
 * @param {{ retainUntil: Date, now: Date }} input - Datas da avaliação.
 * @returns {boolean} Verdadeiro se a remoção ainda estiver bloqueada.
 */
export function isRetentionActive(input) {
    const retainUntil = assertValidDate(input.retainUntil, "retainUntil");
    const now = assertValidDate(input.now, "now");

    return retainUntil.getTime() > now.getTime();
}

/**
 * Confirma se uma entidade contabilística pode ser removida.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, entity: string, entityId: string, now?: Date }} input - Contexto da entidade.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export async function assertRetainedRecordDeletionAllowed(prisma, input) {
    const companyId = assertRequiredString(input.companyId, "companyId");
    const entity = assertRetainedEntity(input.entity);
    const entityId = assertRequiredString(input.entityId, "entityId");
    const now = input.now ?? new Date();

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

    // Sem retenção persistida, a política não bloqueia a operação.
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