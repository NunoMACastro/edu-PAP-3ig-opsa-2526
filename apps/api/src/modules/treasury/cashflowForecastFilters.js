/**
 * @file Validação dos filtros de previsão de tesouraria.
 */

import { httpError } from "../../lib/httpErrors.js";
import { parseStrictDateOnly } from "../../lib/strictDate.js";

const MAX_FORECAST_RANGE_DAYS = 180;
const DAY_MS = 86_400_000;

/**
 * Documenta a função addDays no contexto deste módulo.
 *
 * @param date - Data usada no cálculo.
 * @param days - Número de dias a somar ou comparar.
 * @returns Nova data deslocada pelo número de dias indicado.
 */
function addDays(date, days) {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
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
 * Valida uma data opcional de filtro sem impor valor quando o campo não foi enviado.
 *
 * @param value - Valor a normalizar ou formatar.
 * @param fallback - Data alternativa usada quando o filtro não foi enviado.
 * @returns Data validada, ou undefined quando não foi fornecida.
 */
function parseOptionalDate(value, fallback) {
    const raw = typeof value === "string" ? value.trim() : "";
    if (!raw) return fallback;
    return parseStrictDateOnly(raw, {
        code: "INVALID_FORECAST_RANGE",
        field: "Data de previsão",
    });
}

/**
 * Valida a query do forecast com limite MVP de 180 dias.
 *
 * @param {Record<string, unknown>} query - Query Express.
 * @returns {{ fromDate: Date, toDate: Date }} Intervalo validado.
 */
export function validateForecastQuery(query) {
    const today = parseStrictDateOnly(new Date().toISOString().slice(0, 10));
    const fromDate = parseOptionalDate(query.from, today);
    const toDate = parseOptionalDate(query.to, addDays(fromDate, 30));

    if (toDate < fromDate) {
        throw httpError(400, "INVALID_FORECAST_RANGE", "Intervalo de previsão inválido");
    }
    if (inclusiveDaysBetween(fromDate, toDate) > MAX_FORECAST_RANGE_DAYS) {
        throw httpError(
            400,
            "FORECAST_RANGE_TOO_LONG",
            "A previsão de tesouraria está limitada a 180 dias",
        );
    }
    return { fromDate, toDate };
}
