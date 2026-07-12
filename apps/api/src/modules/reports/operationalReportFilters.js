/**
 * @file Validação de filtros dos relatórios operacionais MF3.
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
        code: "INVALID_REPORT_RANGE",
        field: fieldName,
    });
    return zonedDateBoundary(value, { endOfDay });
}

/**
 * Valida intervalo de relatório operacional.
 *
 * @param {Record<string, unknown>} query - Query Express.
 * @returns {{ fromDate: Date, toDate: Date }} Intervalo validado.
 */
export function validateOperationalReportQuery(query) {
    const fromDate = requiredDate(query.from, "from");
    const toDate = requiredDate(query.to, "to", true);
    if (toDate < fromDate) {
        throw httpError(400, "INVALID_REPORT_RANGE", "Intervalo de relatório inválido");
    }
    return { fromDate, toDate };
}
