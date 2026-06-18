// apps/api/src/modules/reminders/reminderValidators.js
import { httpError } from "../../lib/httpErrors.js";

const allowedReminderTypes = new Set(["DEADLINE", "PAYMENT", "TAX"]);
const allowedReminderStatuses = new Set(["OPEN", "DONE", "CANCELLED"]);

/** Valida texto obrigatório. */
function requiredText(value, field) {
    // O backend não confia que o frontend enviou strings bem formadas.
    // Por isso converte apenas strings reais e remove espaços acidentais.
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) throw httpError(400, "INVALID_REMINDER", field + " é obrigatório");
    return text;
}

/** Valida data obrigatória recebida pelo body. */
function requiredDate(value, field) {
    const raw = requiredText(value, field);
    // A conversão para Date permite detetar valores impossíveis antes de chegar ao Prisma.
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_REMINDER", field + " deve ser uma data válida");
    }
    return date;
}

/** Valida valor pertencente a uma lista fechada. */
function allowedText(value, field, allowedValues) {
    const text = requiredText(value, field);
    // Set.has torna claro que só aceitamos os valores de domínio previstos no BK.
    if (!allowedValues.has(text)) {
        throw httpError(400, "INVALID_REMINDER", field + " tem um valor inválido");
    }
    return text;
}

/** Valida payload de lembrete. */
export function validateReminderBody(body) {
    return {
        // O tipo continua simples: prazo, pagamento ou imposto, sem inventar cálculo fiscal.
        type: allowedText(body.type, "type", allowedReminderTypes),
        title: requiredText(body.title, "title"),
        dueDate: requiredDate(body.dueDate, "dueDate"),
        // Se a UI não enviar status, o lembrete nasce aberto por defeito.
        status: body.status === undefined ? "OPEN" : allowedText(body.status, "status", allowedReminderStatuses),
        // Notes é opcional; quando não vem como string, guardamos null em vez de lixo do body.
        notes: typeof body.notes === "string" ? body.notes.trim() : null,
    };
}

/** Valida payload de atualização de estado. */
export function validateReminderStatusBody(body) {
    return {
        status: allowedText(body.status, "status", allowedReminderStatuses),
    };
}