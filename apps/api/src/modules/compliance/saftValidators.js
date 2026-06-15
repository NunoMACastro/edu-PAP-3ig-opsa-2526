// apps/api/src/modules/compliance/saftValidators.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte uma data de query string para Date.
 *
 * @param {unknown} value Valor recebido em `req.query`.
 * @param {string} field Nome do campo para mensagem de erro.
 * @returns {Date} Data validada.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando a data é inválida.
 */
function parseDate(value, field) {
    const date = new Date(value);
    if (typeof value !== "string" || Number.isNaN(date.getTime())) throw httpError(400, "INVALID_SAFT_RANGE", `${field} deve ser uma data válida`);
    return date;
}

/**
 * Valida o período pedido para exportação SAF-T.
 *
 * @param {Record<string, unknown>} query Query string Express.
 * @returns {{ fromDate: Date, toDate: Date }} Período validado.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o intervalo é inválido.
 */
export function validateSaftExportQuery(query) {
    const fromDate = parseDate(query.from, "from");
    const toDate = parseDate(query.to, "to");
    if (fromDate > toDate) throw httpError(400, "INVALID_SAFT_RANGE", "Data inicial posterior a data final");
    return { fromDate, toDate };
}