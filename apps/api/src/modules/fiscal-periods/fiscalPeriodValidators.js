/**
 * @file Validadores dos períodos fiscais do BK-MF0-08.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Valida e converte uma data ISO simples YYYY-MM-DD.
 *
 * @param {unknown} value - Valor recebido.
 * @param {string} field - Nome do campo.
 * @returns {Date} Data em UTC.
 */
function parseDateOnly(value, field) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw httpError(
            400,
            "INVALID_DATE",
            `${field} deve usar formato YYYY-MM-DD`,
        );
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
        Number.isNaN(date.getTime()) ||
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw httpError(400, "INVALID_DATE", `${field} inválida`);
    }

    return date;
}

/**
 * Valida payload de criação de período fiscal.
 *
 * @param {unknown} body - Corpo JSON do pedido.
 * @returns {{ name: string, startDate: Date, endDate: Date }} Payload normalizado.
 */
export function validateFiscalPeriodPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    if (typeof body.name !== "string" || body.name.trim().length < 4) {
        throw httpError(400, "INVALID_PERIOD_NAME", "Nome do período inválido");
    }

    const startDate = parseDateOnly(body.startDate, "startDate");
    const endDate = parseDateOnly(body.endDate, "endDate");

    if (endDate <= startDate) {
        throw httpError(
            400,
            "INVALID_PERIOD_RANGE",
            "Data final deve ser posterior a data inicial",
        );
    }

    return {
        name: body.name.trim(),
        startDate,
        endDate,
    };
}
