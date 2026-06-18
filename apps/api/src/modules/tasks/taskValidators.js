// apps/api/src/modules/tasks/taskValidators.js
import { httpError } from "../../lib/httpErrors.js";

const allowedTaskStatuses = new Set(["OPEN", "IN_PROGRESS", "DONE", "CANCELLED"]);

/** Valida texto obrigatório. */
function requiredText(value, field) {
    // A API só aceita strings reais; números, objetos ou null não passam como texto válido.
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) throw httpError(400, "INVALID_OPERATIONALTASK", field + " é obrigatório");
    return text;
}

/** Valida data obrigatória de uma tarefa. */
function requiredDate(value, field) {
    const raw = requiredText(value, field);
    // A conversão para Date transforma a string recebida num valor que pode ser persistido.
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_OPERATIONALTASK", field + " deve ser uma data válida");
    }
    return date;
}

/** Valida status dentro da lista permitida. */
function allowedStatus(value) {
    const status = requiredText(value, "status");
    // Estados fechados evitam que o workflow fique com valores impossíveis na base de dados.
    if (!allowedTaskStatuses.has(status)) {
        throw httpError(400, "INVALID_OPERATIONALTASK", "status tem um valor inválido");
    }
    return status;
}

/** Valida payload de tarefa. */
export function validateOperationalTaskBody(body) {
    return {
        title: requiredText(body.title, "title"),
        // A descrição é opcional; se não for string, guardamos null em vez de aceitar ruído.
        description: typeof body.description === "string" ? body.description.trim() : null,
        dueDate: requiredDate(body.dueDate, "dueDate"),
        // Uma tarefa nova fica OPEN se a UI não indicar outro estado permitido.
        status: body.status === undefined ? "OPEN" : allowedStatus(body.status),
        // O responsável é obrigatório porque RF45 exige ownership humano da tarefa.
        assignedToId: requiredText(body.assignedToId, "assignedToId"),
    };
}

/** Valida payload de mudança de estado. */
export function validateOperationalTaskStatusBody(body) {
    return {
        status: allowedStatus(body.status),
    };
}