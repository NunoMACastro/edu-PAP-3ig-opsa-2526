/**
 * @file Validadores de tarefas operacionais MF4.
 */

import { httpError } from "../../lib/httpErrors.js";

const STATUSES = new Set(["OPEN", "IN_PROGRESS", "DONE", "CANCELLED"]);

/**
 * Valida texto de tarefa.
 *
 * @param {unknown} value - Valor recebido.
 * @param {string} field - Nome do campo.
 * @returns {string} Texto normalizado.
 */
function text(value, field) {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (normalized.length < 3 || normalized.length > 160) {
        throw httpError(400, "INVALID_TASK_TEXT", `${field} deve ter entre 3 e 160 caracteres`);
    }
    return normalized;
}

/**
 * Valida data ISO curta sem permitir normalizacao silenciosa do Date.
 *
 * @param {unknown} value - Valor recebido.
 * @throws {Error} Quando a data esta vazia, tem formato errado ou nao existe no calendario.
 * @returns {Date} Data validada.
 */
function dueDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw httpError(400, "INVALID_TASK_DATE", "Data de prazo obrigatoria no formato YYYY-MM-DD");
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        throw httpError(400, "INVALID_TASK_DATE", "Data de prazo invalida");
    }
    return date;
}

/**
 * Valida payload de criacao de tarefa.
 *
 * @param {unknown} body - Corpo HTTP.
 * @returns {{ title: string, description?: string, dueAt: Date, assignedToId?: string }} Payload normalizado.
 */
export function validateTaskPayload(body) {
    const description =
        typeof body?.description === "string" && body.description.trim()
            ? body.description.trim().slice(0, 500)
            : undefined;
    const assignedToId =
        typeof body?.assignedToId === "string" && body.assignedToId.trim()
            ? body.assignedToId.trim()
            : undefined;
    return {
        title: text(body?.title, "Titulo"),
        description,
        dueAt: dueDate(body?.dueAt),
        assignedToId,
    };
}

/**
 * Valida estado de tarefa.
 *
 * @param {unknown} body - Corpo HTTP.
 * @returns {{ status: string }} Estado normalizado.
 */
export function validateTaskStatusPayload(body) {
    const status = typeof body?.status === "string" ? body.status.trim().toUpperCase() : "";
    if (!STATUSES.has(status)) {
        throw httpError(400, "INVALID_TASK_STATUS", "Estado de tarefa invalido");
    }
    return { status };
}
