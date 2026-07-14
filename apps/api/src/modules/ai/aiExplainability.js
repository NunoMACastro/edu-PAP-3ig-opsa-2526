/**
 * @file Contrato partilhado de explicabilidade dos insights OPSA.
 */

import { httpError } from "../../lib/httpErrors.js";

const EXPLAINABLE_INSIGHT_FIELDS = Object.freeze(["title", "explanation", "sourceType", "sourceId", "sourceLabel"]);

export function assertExplainableInsight(insight) {
    if (!insight || typeof insight !== "object") {
        throw httpError(422, "AI_INSIGHT_NOT_EXPLAINABLE", "Insight sem explicabilidade mínima", { missing: EXPLAINABLE_INSIGHT_FIELDS });
    }
    const missing = EXPLAINABLE_INSIGHT_FIELDS.filter((field) => typeof insight[field] !== "string" || insight[field].trim().length === 0);
    if (missing.length > 0) throw httpError(422, "AI_INSIGHT_NOT_EXPLAINABLE", "Insight sem explicabilidade mínima", { missing });
    if (insight.explanation.trim().length < 40) {
        throw httpError(422, "AI_INSIGHT_EXPLANATION_TOO_SHORT", "Explicação do insight demasiado curta", { minimumLength: 40 });
    }
}
