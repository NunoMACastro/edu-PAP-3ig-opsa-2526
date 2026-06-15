// apps/api/src/modules/reports/operationalReportFilters.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte data textual da query para Date.
 *
 * @param {unknown} value Valor recebido em `req.query`.
 * @param {string} field Nome do campo para erro.
 * @returns {Date} Data validada.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando a data é inválida.
 */
function parseDate(value, field) {
    const date = new Date(value);
    if (typeof value !== "string" || Number.isNaN(date.getTime())) throw httpError(400, "INVALID_REPORT_RANGE", `${field} deve ser uma data válida`);
    return date;
}

/**
 * Valida período de relatório operacional.
 *
 * @param {Record<string, unknown>} query Query string Express.
 * @returns {{ fromDate: Date, toDate: Date }} Período seguro para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o intervalo é inválido.
 */
export function validateOperationalReportQuery(query) {
    const fromDate = parseDate(query.from, "from");
    const toDate = parseDate(query.to, "to");
    if (fromDate > toDate) throw httpError(400, "INVALID_REPORT_RANGE", "Data inicial posterior a data final");
    return { fromDate, toDate };
}