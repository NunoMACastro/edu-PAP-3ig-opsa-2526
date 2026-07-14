/**
 * @file Validação de filtros dos KPIs executivos MF3.
 */

import { httpError } from "../../lib/httpErrors.js";
import { parseStrictDateOnly } from "../../lib/strictDate.js";
import { zonedDateBoundary } from "../ai/aiMetricCatalog.js";

/**
 * Valida datas obrigatórias de filtros e devolve objetos Date consistentes.
 *
 * @param value - Valor a normalizar ou formatar.
 * @param fieldName - Nome do campo usado na mensagem de validação.
 * @returns Data obrigatória validada.
 */
function requiredDate(value, fieldName, endOfDay = false) {
    parseStrictDateOnly(value, {
        code: "INVALID_KPI_RANGE",
        field: fieldName,
    });
    return zonedDateBoundary(value, { endOfDay });
}

/**
 * Valida intervalo de KPIs executivos.
 *
 * @param {Record<string, unknown>} query - Query Express.
 * @returns {{ fromDate: Date, toDate: Date }} Intervalo validado.
 */
export function validateExecutiveKpiQuery(query) {
    const fromDate = requiredDate(query.from, "from");
    const toDate = requiredDate(query.to, "to", true);
    if (toDate < fromDate) {
        throw httpError(400, "INVALID_KPI_RANGE", "Intervalo de KPIs inválido");
    }
    return { fromDate, toDate };
}
