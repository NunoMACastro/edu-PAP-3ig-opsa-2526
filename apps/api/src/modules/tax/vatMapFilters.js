// apps/api/src/modules/tax/vatMapFilters.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte uma query string de data num objeto Date seguro para o backend.
 *
 * @param {unknown} value Valor recebido em `req.query`.
 * @param {string} fieldName Nome do campo usado na mensagem de erro.
 * @returns {Date} Data validada.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o campo falta ou não é uma data válida.
 */
function parseDate(value, fieldName) {
    if (typeof value !== "string" || value.trim() === "") {
        throw httpError(400, "INVALID_DATE_RANGE", `${fieldName} é obrigatório`);
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_DATE_RANGE", `${fieldName} deve ser uma data válida`);
    }

    return date;
}

/**
 * Valida o período pedido para o mapa de IVA.
 *
 * O DTO devolvido é pequeno de propósito: o service recebe datas já normalizadas e nunca recebe `companyId`
 * vindo do frontend, preservando a regra multiempresa da MF0.
 *
 * @param {Record<string, unknown>} query Query string Express.
 * @returns {{ fromDate: Date, toDate: Date }} Período validado para consulta fiscal.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o intervalo é inválido ou demasiado largo.
 */
export function validateVatMapQuery(query) {
    const fromDate = parseDate(query.from, "from");
    const toDate = parseDate(query.to, "to");

    if (fromDate > toDate) {
        throw httpError(400, "INVALID_DATE_RANGE", "A data inicial não pode ser posterior a data final");
    }

    const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
    if (days > 366) {
        throw httpError(400, "INVALID_DATE_RANGE", "O intervalo máximo do mapa de IVA é de 366 dias");
    }

    return { fromDate, toDate };
}