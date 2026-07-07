/**
 * @file Validação de filtros do mapa de IVA da MF3.
 */

import { httpError } from "../../lib/httpErrors.js";

const MAX_RANGE_DAYS = 366;
const DAY_MS = 86_400_000;

/**
 * Converte uma query string de data num `Date` seguro.
 *
 * @param {unknown} value - Valor recebido em `req.query`.
 * @param {string} fieldName - Nome funcional do campo.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando a data é inválida.
 * @returns {Date} Data validada.
 */
function requiredDate(value, fieldName) {
    const raw = typeof value === "string" ? value.trim() : "";
    const date = new Date(raw);
    if (!raw || Number.isNaN(date.getTime())) {
        throw httpError(
            400,
            "INVALID_DATE_RANGE",
            `${fieldName} deve ser uma data válida`,
        );
    }
    return date;
}

/**
 * Calcula dias incluindo início e fim para relatórios que trabalham por intervalo fechado.
 *
 * @param fromDate - Data inicial do intervalo.
 * @param toDate - Data final do intervalo.
 * @returns Número de dias do intervalo incluindo início e fim.
 */
function inclusiveDaysBetween(fromDate, toDate) {
    return Math.ceil((toDate.getTime() - fromDate.getTime()) / DAY_MS) + 1;
}

/**
 * Valida o intervalo usado pelo mapa de IVA.
 *
 * @param {Record<string, unknown>} query - Query string Express.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o intervalo é inválido.
 * @returns {{ fromDate: Date, toDate: Date }} Intervalo validado.
 */
export function validateVatMapQuery(query) {
    const fromDate = requiredDate(query.from, "from");
    const toDate = requiredDate(query.to, "to");

    if (toDate < fromDate) {
        throw httpError(
            400,
            "INVALID_DATE_RANGE",
            "O período do mapa de IVA deve estar ordenado e ter no máximo 366 dias",
        );
    }

    if (inclusiveDaysBetween(fromDate, toDate) > MAX_RANGE_DAYS) {
        throw httpError(
            400,
            "INVALID_DATE_RANGE",
            "O período do mapa de IVA deve estar ordenado e ter no máximo 366 dias",
        );
    }

    return { fromDate, toDate };
}
