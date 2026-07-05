// apps/api/src/modules/notifications/alertPreferenceService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Tipos de alertas suportados pela API de preferências.
 *
 * @type {Array<{
 *   type: string,
 *   label: string,
 *   enabledByDefault: boolean,
 *   canDisable: boolean
 * }>}
 */
export const ALERT_TYPE_DEFINITIONS = [
    {
        type: "stock",
        label: "Stock",
        enabledByDefault: true,
        canDisable: true,
    },
    {
        type: "deadline",
        label: "Prazos",
        enabledByDefault: true,
        canDisable: true,
    },
    {
        type: "cashflow",
        label: "Caixa",
        enabledByDefault: true,
        canDisable: true,
    },
    {
        type: "ai",
        label: "Sugestões assistidas",
        enabledByDefault: true,
        canDisable: true,
    },
    {
        type: "security",
        label: "Segurança",
        enabledByDefault: true,
        canDisable: false,
    },
];

const alertTypesByCode = new Map(
    ALERT_TYPE_DEFINITIONS.map((definition) => [definition.type, definition]),
);

/**
 * Devolve a lista pública de tipos suportados.
 *
 * @returns {Array<object>} Cópia defensiva dos tipos configuráveis.
 */
export function listSupportedAlertTypes() {
    return ALERT_TYPE_DEFINITIONS.map((definition) => ({ ...definition }));
}

/**
 * Valida o body recebido por `PATCH /notifications/preferences/:type`.
 *
 * @param {unknown} body - Body JSON recebido da route.
 * @returns {{ enabled: boolean }} Payload normalizado.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o body não cumpre o contrato.
 */
export function parseAlertPreferenceBody(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "ALERT_PREFERENCE_BODY_INVALID", "O body deve ser um objeto JSON.");
    }

    if (typeof body.enabled !== "boolean") {
        throw httpError(
            400,
            "ALERT_PREFERENCE_ENABLED_REQUIRED",
            "O campo enabled deve ser booleano.",
        );
    }

    // Só devolvemos o campo permitido para impedir alterações escondidas no body.
    return { enabled: body.enabled };
}

/**
 * Resolve a definição de um tipo de alerta.
 *
 * @param {string} type - Tipo recebido na rota.
 * @returns {object} Definição interna do tipo.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o tipo é vazio ou inválido.
 */
function getAlertDefinition(type) {
    if (typeof type !== "string" || type.trim() === "") {
        throw httpError(400, "ALERT_TYPE_REQUIRED", "O tipo de alerta é obrigatório.");
    }

    const normalizedType = type.trim().toLowerCase();
    const definition = alertTypesByCode.get(normalizedType);

    if (!definition) {
        throw httpError(400, "ALERT_TYPE_INVALID", "Tipo de alerta inválido.", {
            type: normalizedType,
        });
    }

    return definition;
}

/**
 * Confirma que a route entregou contexto autenticado suficiente.
 *
 * @param {{ companyId?: string, userId?: string }} input - Contexto vindo dos guards.
 * @returns {void}
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando falta sessão ou empresa ativa.
 */
function assertCompanyUserContext({ companyId, userId }) {
    if (!companyId || !userId) {
        throw httpError(
            403,
            "ALERT_PREFERENCE_CONTEXT_REQUIRED",
            "É necessário existir empresa ativa e utilizador autenticado.",
        );
    }
}

/**
 * Impede a desativação de tipos obrigatórios.
 *
 * @param {{ type: string, canDisable: boolean }} definition - Definição do alerta.
 * @param {boolean} enabled - Estado pedido pelo utilizador.
 * @returns {void}
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o tipo obrigatório é desligado.
 */
function assertCanPersistPreference(definition, enabled) {
    if (!definition.canDisable && enabled === false) {
        throw httpError(
            403,
            "ALERT_TYPE_MANDATORY",
            "Este tipo de alerta é obrigatório e não pode ser desativado.",
            { type: definition.type },
        );
    }
}

/**
 * Converte definição e linha persistida na resposta pública da API.
 *
 * @param {object} definition - Definição do tipo de alerta.
 * @param {object | null | undefined} storedPreference - Preferência guardada, se existir.
 * @returns {object} DTO devolvido ao frontend.
 */
function toPreferenceResponse(definition, storedPreference) {
    const hasStoredValue = Boolean(storedPreference);

    return {
        type: definition.type,
        label: definition.label,
        enabled: hasStoredValue ? storedPreference.enabled : definition.enabledByDefault,
        defaultEnabled: definition.enabledByDefault,
        canDisable: definition.canDisable,
        source: hasStoredValue ? "stored" : "default",
        updatedAt: storedPreference?.updatedAt?.toISOString?.() ?? null,
    };
}

/**
 * Lista as preferências efetivas do utilizador autenticado na empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string }} input - Contexto autenticado.
 * @returns {Promise<Array<object>>} Lista de tipos com estado efetivo.
 */
export async function listAlertPreferences(prisma, input) {
    assertCompanyUserContext(input);

    const storedPreferences = await prisma.alertPreference.findMany({
        where: {
            companyId: input.companyId,
            userId: input.userId,
        },
    });

    // Os defaults são combinados em memória para não criar linhas desnecessárias.
    const storedPreferencesByType = new Map(
        storedPreferences.map((preference) => [preference.type, preference]),
    );

    return ALERT_TYPE_DEFINITIONS.map((definition) =>
        toPreferenceResponse(definition, storedPreferencesByType.get(definition.type)),
    );
}

/**
 * Cria ou atualiza uma preferência do utilizador autenticado na empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, type: string, enabled: boolean }} input - Pedido normalizado.
 * @returns {Promise<object>} Preferência atualizada em formato público.
 */
export async function setAlertPreference(prisma, input) {
    assertCompanyUserContext(input);

    const definition = getAlertDefinition(input.type);
    assertCanPersistPreference(definition, input.enabled);

    const storedPreference = await prisma.alertPreference.upsert({
        where: {
            companyId_userId_type: {
                companyId: input.companyId,
                userId: input.userId,
                type: definition.type,
            },
        },
        update: {
            enabled: input.enabled,
        },
        create: {
            companyId: input.companyId,
            userId: input.userId,
            type: definition.type,
            enabled: input.enabled,
        },
    });

    return toPreferenceResponse(definition, storedPreference);
}