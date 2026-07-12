/**
 * @file Guardrails de qualidade das fontes para sugestoes de IA.
 *
 * Este modulo transforma RNF34 numa fronteira pequena e testavel: uma sugestao
 * de IA so pode ser apresentada quando nasce de dados reais, rastreaveis e da
 * empresa ativa resolvida no backend.
 */

import { httpError } from "../../lib/httpErrors.js";

const MIN_EXPLANATION_LENGTH = 40;

const TRUSTED_SOURCE_TYPES = new Set([
    "OperationalReportRun",
    "ExecutiveKpiRun",
    "SaleDocument",
    "StockAlertSetting",
    "CashflowForecastRun",
    "AI_METRIC_V2",
]);

/**
 * Normaliza texto tecnico recebido de insights ou sugestoes.
 *
 * @param {unknown} value - Valor a normalizar.
 * @returns {string} Texto aparado, ou string vazia quando nao for texto.
 */
function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
}

/**
 * Classifica a qualidade da fonte usada por uma sugestao de IA.
 *
 * @param {{ companyId?: string, sourceType?: string, sourceId?: string, sourceLabel?: string, explanation?: string, actionType?: string }} input - Sugestao candidata ja filtrada pelo backend.
 * @returns {{ confidence: "low" | "medium" | "high", limitation: string, source: { type: string, id: string, label: string } }} Metadados publicos de qualidade.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando faltam empresa ativa, fonte, acao ou explicacao defensavel.
 */
export function classifyAiSourceQuality(input) {
    const companyId = cleanText(input?.companyId);
    const sourceType = cleanText(input?.sourceType);
    const sourceId = cleanText(input?.sourceId);
    const sourceLabel = cleanText(input?.sourceLabel);
    const explanation = cleanText(input?.explanation);
    const actionType = cleanText(input?.actionType);

    if (!companyId) {
        throw httpError(
            422,
            "AI_SOURCE_COMPANY_REQUIRED",
            "A empresa ativa e obrigatoria para avaliar uma sugestao de IA.",
        );
    }

    if (!sourceType || !sourceId || !sourceLabel) {
        throw httpError(
            422,
            "AI_SOURCE_TRACE_REQUIRED",
            "A IA nao deve sugerir acoes sem fonte real rastreavel.",
            { missing: { sourceType: !sourceType, sourceId: !sourceId, sourceLabel: !sourceLabel } },
        );
    }

    if (!actionType) {
        throw httpError(
            422,
            "AI_SOURCE_ACTION_REQUIRED",
            "A sugestao da IA precisa de indicar a acao recomendada.",
        );
    }

    if (explanation.length < MIN_EXPLANATION_LENGTH) {
        throw httpError(
            422,
            "AI_SOURCE_EXPLANATION_TOO_SHORT",
            "A explicacao da sugestao e demasiado curta para defesa.",
            { minimumLength: MIN_EXPLANATION_LENGTH },
        );
    }

    const evidenceIsStructured = sourceType !== "AI_METRIC_V2"
        || Boolean(input?.evidence && typeof input.evidence === "object" && input.evidence.metrics && input.evidence.formula);
    if (sourceType === "AI_METRIC_V2" && !evidenceIsStructured) {
        throw httpError(422, "AI_SOURCE_EVIDENCE_REQUIRED", "A métrica IA v2 exige evidência e fórmula estruturadas.");
    }
    const sourceTypeIsTrusted = TRUSTED_SOURCE_TYPES.has(sourceType) && evidenceIsStructured;
    const limitations = [];

    if (!sourceTypeIsTrusted) {
        limitations.push("Fonte fora da lista de familias OPSA revistas; requer validacao humana.");
    }

    // Uma fonte unica pode ser real, mas deve ser apresentada com prudencia.
    limitations.push("Sugestao baseada numa familia de dados; confirma o contexto antes de decidir.");

    return {
        confidence: sourceType === "AI_METRIC_V2" ? "high" : sourceTypeIsTrusted ? "medium" : "low",
        limitation: limitations.join(" "),
        source: {
            type: sourceType,
            id: sourceId,
            label: sourceLabel,
        },
    };
}

/**
 * Bloqueia sugestoes sem fonte real e devolve metadados para a API/UI.
 *
 * @param {{ companyId?: string, sourceType?: string, sourceId?: string, sourceLabel?: string, explanation?: string, actionType?: string }} input - Sugestao candidata.
 * @returns {{ confidence: "low" | "medium" | "high", limitation: string, source: { type: string, id: string, label: string } }} Resultado de qualidade.
 */
export function assertAiSourceQuality(input) {
    return classifyAiSourceQuality(input);
}
