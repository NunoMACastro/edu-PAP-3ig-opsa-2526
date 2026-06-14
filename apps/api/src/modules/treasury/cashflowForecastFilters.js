// apps/api/src/modules/treasury/cashflowForecastFilters.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte uma data da query string para Date.
 *
 * @param {unknown} value Valor recebido em `req.query`.
 * @param {string} field Nome do campo para mensagem de erro.
 * @returns {Date} Data validada.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando a data é inválida.
 */
function parseDate(value, field) {
    const date = new Date(value);
    if (typeof value !== "string" || Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_FORECAST_RANGE", `${field} deve ser uma data válida`);
    }
    return date;
}

/**
 * Valida o período da previsão de tesouraria.
 *
 * @param {Record<string, unknown>} query Query string Express.
 * @returns {{ fromDate: Date, toDate: Date }} Período seguro para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 para intervalo inválido ou superior a 180 dias.
 */
export function validateForecastQuery(query) {
    const fromDate = parseDate(query.from, "from");
    const toDate = parseDate(query.to, "to");
    if (fromDate > toDate) throw httpError(400, "INVALID_FORECAST_RANGE", "Data inicial posterior a data final");
    const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
    if (days > 180) throw httpError(400, "FORECAST_RANGE_TOO_LONG", "A previsão não deve exceder 180 dias");
    return { fromDate, toDate };
}