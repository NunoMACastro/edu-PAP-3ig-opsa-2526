/**
 * @file Validadores de lembretes MF4.
 */

import { httpError } from "../../lib/httpErrors.js";

const TYPES = new Set(["PAYMENT", "TAX", "DEADLINE", "OTHER"]);
const STATUSES = new Set(["OPEN", "DONE", "CANCELLED"]);

/**
 * Valida texto obrigatorio com limite.
 *
 * @param {unknown} value - Valor recebido no payload.
 * @param {string} field - Nome do campo.
 * @returns {string} Texto normalizado.
 */
function text(value, field) {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (normalized.length < 3 || normalized.length > 160) {
        throw httpError(400, "INVALID_REMINDER_TEXT", `${field} deve ter entre 3 e 160 caracteres`);
    }
    return normalized;
}

/**
 * Valida data ISO curta sem permitir normalizacao silenciosa do Date.
 *
 * @param {unknown} value - Valor recebido no payload.
 * @throws {Error} Quando a data esta vazia, tem formato errado ou nao existe no calendario.
 * @returns {Date} Data validada.
 */
function dueDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw httpError(400, "INVALID_REMINDER_DATE", "Data de prazo obrigatoria no formato YYYY-MM-DD");
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        throw httpError(400, "INVALID_REMINDER_DATE", "Data de prazo invalida");
    }
    return date;
}

/**
 * Valida payload de criacao de lembrete.
 *
 * @param {unknown} body - Corpo HTTP.
 * @returns {{ title: string, description?: string, type: string, dueAt: Date }} Payload normalizado.
 */
export function validateReminderPayload(body) {
    const type = typeof body?.type === "string" ? body.type.trim().toUpperCase() : "";
    if (!TYPES.has(type)) {
        throw httpError(400, "INVALID_REMINDER_TYPE", "Tipo de lembrete invalido");
    }
    const description =
        typeof body.description === "string" && body.description.trim()
            ? body.description.trim().slice(0, 500)
            : undefined;
    return {
        title: text(body?.title, "Titulo"),
        description,
        type,
        dueAt: dueDate(body?.dueAt),
    };
}

/**
 * Valida payload de atualizacao de estado de lembrete.
 *
 * @param {unknown} body - Corpo HTTP.
 * @returns {{ status: string }} Estado normalizado.
 */
export function validateReminderStatusPayload(body) {
    const status = typeof body?.status === "string" ? body.status.trim().toUpperCase() : "";
    if (!STATUSES.has(status)) {
        throw httpError(400, "INVALID_REMINDER_STATUS", "Estado de lembrete invalido");
    }
    return { status };
}
