/**
 * @file Validação de filtros dos KPIs executivos MF3.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Valida datas obrigatórias de filtros e devolve objetos Date consistentes.
 *
 * @param value - Valor a normalizar ou formatar.
 * @param fieldName - Nome do campo usado na mensagem de validação.
 * @returns Data obrigatória validada.
 */
function requiredDate(value, fieldName) {
    const raw = typeof value === "string" ? value.trim() : "";
    const date = new Date(raw);
    if (!raw || Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_KPI_RANGE", `${fieldName} inválida`);
    }
    return date;
}

/**
 * Valida intervalo de KPIs executivos.
 *
 * @param {Record<string, unknown>} query - Query Express.
 * @returns {{ fromDate: Date, toDate: Date }} Intervalo validado.
 */
export function validateExecutiveKpiQuery(query) {
    const fromDate = requiredDate(query.from, "from");
    const toDate = requiredDate(query.to, "to");
    if (toDate < fromDate) {
        throw httpError(400, "INVALID_KPI_RANGE", "Intervalo de KPIs inválido");
    }
    return { fromDate, toDate };
}
