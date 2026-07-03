/**
 * @file Politica de retencao contabilistica para BK-MF7-02.
 */

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
