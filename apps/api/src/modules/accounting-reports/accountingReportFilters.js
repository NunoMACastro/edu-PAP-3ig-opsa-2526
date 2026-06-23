/**
 * @file Validação de filtros para relatórios contabilísticos.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Valida intervalo de datas.
 *
 * @param {object} query - Query string Express.
 * @returns {{ from: Date, to: Date }} Intervalo normalizado.
 */
export function parseDateRange(query) {
    const from = new Date(String(query.from ?? ""));
    const to = new Date(String(query.to ?? ""));
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
        throw httpError(400, "INVALID_DATE_RANGE", "Intervalo de datas inválido");
    }
    return { from, to };
}
