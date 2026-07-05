// apps/api/src/modules/ai/aiSourceGuardrails.js
const MIN_EXPLANATION_LENGTH = 40;

const TRUSTED_SOURCE_TYPES = new Set([
    "OperationalReportRun",
    "ExecutiveKpiRun",
    "SaleDocument",
    "StockAlertSetting",
    "CashflowForecastRun",
]);

/**
 * Normaliza texto técnico recebido de uma fonte de IA.
 *
 * @param {unknown} value - Valor vindo do insight ou da sugestão.
 * @returns {string} Texto aparado, ou string vazia quando o valor não é texto.
 */
function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
}

/**
 * Classifica a qualidade das fontes usadas por uma sugestão de IA.
 *
 * @param {{ companyId?: string, sourceType?: string, sourceId?: string, sourceLabel?: string, explanation?: string, actionType?: string }} input - Dados já filtrados pelo backend.
 * @returns {{ confidence: "low" | "medium" | "high", limitation: string, source: { type: string, id: string, label: string } }} Metadados de qualidade para a UI/evidence.
 * @throws {Error} Quando a sugestão não tem fonte real suficiente.
 */
export function classifyAiSourceQuality(input) {
    const companyId = cleanText(input?.companyId);
    const sourceType = cleanText(input?.sourceType);
    const sourceId = cleanText(input?.sourceId);
    const sourceLabel = cleanText(input?.sourceLabel);
    const explanation = cleanText(input?.explanation);
    const actionType = cleanText(input?.actionType);

    if (!companyId) {
        throw new Error("A empresa ativa é obrigatória para avaliar uma sugestão de IA.");
    }

    if (!sourceType || !sourceId || !sourceLabel) {
        throw new Error("A IA não deve sugerir ações sem fonte real rastreável.");
    }

    if (!actionType) {
        throw new Error("A sugestão da IA precisa de indicar a ação recomendada.");
    }

    if (explanation.length < MIN_EXPLANATION_LENGTH) {
        throw new Error("A explicação da sugestão é demasiado curta para defesa.");
    }

    const limitations = [];
    if (!TRUSTED_SOURCE_TYPES.has(sourceType)) {
        limitations.push("Fonte não está na lista de famílias OPSA revistas; requer validação humana.");
    }

    // Uma só fonte pode ser válida, mas deve ser apresentada com prudência para reduzir enviesamento.
    limitations.push("Sugestão baseada numa família de dados; confirma o contexto antes de decidir.");

    return {
        confidence: TRUSTED_SOURCE_TYPES.has(sourceType) ? "medium" : "low",
        limitation: limitations.join(" "),
        source: {
            type: sourceType,
            id: sourceId,
            label: sourceLabel,
        },
    };
}

/**
 * Bloqueia sugestões sem fonte real e devolve metadados para a resposta pública.
 *
 * @param {{ companyId?: string, sourceType?: string, sourceId?: string, sourceLabel?: string, explanation?: string, actionType?: string }} input - Dados da sugestão candidata.
 * @returns {{ confidence: "low" | "medium" | "high", limitation: string, source: { type: string, id: string, label: string } }} Resultado de qualidade.
 */
export function assertAiSourceQuality(input) {
    return classifyAiSourceQuality(input);
}