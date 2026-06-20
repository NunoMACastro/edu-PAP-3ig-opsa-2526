/**
 * @file Validadores do export SAF-T MVP.
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
        throw httpError(400, "INVALID_SAFT_RANGE", `${fieldName} deve ser uma data válida`);
    }
    return date;
}

/**
 * Valida intervalo de exportação SAF-T.
 *
 * @param {Record<string, unknown>} query - Query Express.
 * @returns {{ fromDate: Date, toDate: Date }} Intervalo validado.
 */
export function validateSaftExportQuery(query) {
    const fromDate = requiredDate(query.from, "from");
    const toDate = requiredDate(query.to, "to");
    if (toDate < fromDate) {
        throw httpError(400, "INVALID_SAFT_RANGE", "Intervalo SAF-T inválido");
    }
    return { fromDate, toDate };
}
