const BLOCKED_AI_ACTIONS = new Set([
    "APPROVE_DOCUMENT",
    "POST_JOURNAL_ENTRY",
    "CHANGE_ACCOUNTING_DATA",
    "EXECUTE_PAYMENT",
]);

/**
 * Confirma que uma sugestão de IA é apenas recomendação segura.
 *
 * @param {{ actionType?: string }} suggestion - Sugestão calculada pela IA.
 * @throws {Error} Quando a sugestão tenta executar uma ação financeira/contabilística ou não declara actionType.
 * @returns {void}
 */
export function assertAiRecommendationOnly(suggestion) {
    // Validamos no backend para impedir que UI/scripts contornem a fronteira ética da IA.
    if (!suggestion || typeof suggestion.actionType !== "string" || suggestion.actionType.trim().length === 0) {
        throw new Error("A sugestão da IA precisa de indicar uma ação de recomendação.");
    }

    const actionType = suggestion.actionType.trim();

    // Estes tipos representam execução financeira; a IA só pode recomendar revisão humana.
    if (BLOCKED_AI_ACTIONS.has(actionType)) {
        throw new Error("A IA não pode executar ações financeiras ou contabilísticas.");
    }
}