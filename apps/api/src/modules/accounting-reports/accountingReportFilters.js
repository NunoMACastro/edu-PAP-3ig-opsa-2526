/**
 * @file Validação de filtros para relatórios contabilísticos.
 */

import { httpError } from "../../lib/httpErrors.js";
import { parseStrictDateOnly } from "../../lib/strictDate.js";

/**
 * Valida intervalo de datas.
 *
 * @param {object} query - Query string Express.
 * @returns {{ from: Date, to: Date }} Intervalo normalizado.
 */
export function parseDateRange(query) {
    const from = parseStrictDateOnly(query.from, {
        code: "INVALID_DATE_RANGE",
        field: "Data inicial",
    });
    const to = parseStrictDateOnly(query.to, {
        code: "INVALID_DATE_RANGE",
        field: "Data final",
    });
    if (from > to) {
        throw httpError(400, "INVALID_DATE_RANGE", "Intervalo de datas inválido");
    }
    return { from, to };
}
