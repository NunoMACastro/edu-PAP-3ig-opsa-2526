// real_dev/api/src/modules/ai/aiInsightFilters.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte um valor da query string numa data válida.
 *
 * @param {unknown} value Valor recebido de req.query.
 * @param {string} field Nome do campo usado na mensagem de erro.
 * @returns {Date} Data validada para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando a data é inválida.
 */
function parseDate(value, field) {
    const date = new Date(value);
    if (typeof value !== "string" || Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_INSIGHT_RANGE", field + " deve ser uma data válida");
    }
    return date;
}

/**
 * Valida o período usado para gerar insights.
 *
 * @param {Record<string, unknown>} query Query string Express.
 * @returns {{ fromDate: Date, toDate: Date }} Intervalo seguro para consulta.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o intervalo é inválido.
 */
export function validateInsightQuery(query) {
    const fromDate = parseDate(query.from, "from");
    const toDate = parseDate(query.to, "to");
    if (fromDate > toDate) {
        throw httpError(400, "INVALID_INSIGHT_RANGE", "Data inicial posterior à data final");
    }
    return { fromDate, toDate };
}