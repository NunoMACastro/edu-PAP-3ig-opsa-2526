/**
 * @file Politica de governanca da IA assistiva.
 *
 * O OPSA permite que a IA explique dados e recomende revisao humana, mas nao
 * permite que a IA aprove documentos, crie lancamentos ou execute pagamentos.
 */

import { httpError } from "../../lib/httpErrors.js";

export const BLOCKED_AI_ACTION_TYPES = Object.freeze([
    "APPROVE_DOCUMENT",
    "APPROVE_SALE_DOCUMENT",
    "APPROVE_PURCHASE_DOCUMENT",
    "POST_JOURNAL_ENTRY",
    "CREATE_JOURNAL_ENTRY",
    "CHANGE_ACCOUNTING_DATA",
    "POST_SALE_DOCUMENT",
    "POST_PURCHASE_DOCUMENT",
    "EXECUTE_PAYMENT",
    "REGISTER_PAYMENT",
    "REGISTER_RECEIPT",
]);

const blockedAiActionTypes = new Set(BLOCKED_AI_ACTION_TYPES);

/**
 * Normaliza tipos de acao internos antes de aplicar a denylist de RNF32.
 *
 * @param {string} actionType - Tipo de acao calculado pela IA.
 * @returns {string} Tipo normalizado para comparacao e persistencia.
 */
function normalizeActionType(actionType) {
    return actionType.trim().toUpperCase().replace(/[\s-]+/g, "_");
}

/**
 * Confirma que uma sugestao de IA continua a ser apenas recomendacao humana.
 *
 * @param {{ actionType?: string }} suggestion - Sugestao calculada pela IA.
 * @returns {string} `actionType` normalizado e seguro para persistir.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando a sugestao e ambigua ou cruza a fronteira financeira/contabilistica.
 */
export function assertAiRecommendationOnly(suggestion) {
    if (!suggestion || typeof suggestion.actionType !== "string") {
        throw httpError(
            422,
            "AI_SUGGESTION_ACTION_REQUIRED",
            "A sugestao da IA precisa de indicar uma acao de recomendacao",
        );
    }

    const actionType = normalizeActionType(suggestion.actionType);
    if (actionType.length === 0) {
        throw httpError(
            422,
            "AI_SUGGESTION_ACTION_REQUIRED",
            "A sugestao da IA precisa de indicar uma acao de recomendacao",
        );
    }

    // A lista e intencionalmente explicita: bloqueia execucao financeira, mas deixa passar revisoes humanas.
    if (blockedAiActionTypes.has(actionType)) {
        throw httpError(
            422,
            "AI_AUTOMATED_FINANCIAL_ACTION_BLOCKED",
            "A IA nao pode executar acoes financeiras ou contabilisticas",
            { actionType },
        );
    }

    return actionType;
}
