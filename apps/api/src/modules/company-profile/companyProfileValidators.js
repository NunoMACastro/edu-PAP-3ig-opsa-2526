/**
 * @file Validadores do perfil da empresa do BK-MF0-06.
 */

import { httpError } from "../../lib/httpErrors.js";
import { isValidPortugueseNif } from "./nifValidator.js";

/**
 * Valida uma string obrigatória e devolve o valor sem espaços laterais.
 *
 * @param {unknown} value - Valor recebido.
 * @param {string} field - Nome do campo para mensagem de erro.
 * @returns {string} String normalizada.
 */
function requiredString(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw httpError(400, "INVALID_FIELD", `${field} é obrigatório`);
    }
    return value.trim();
}

/**
 * Normaliza uma string opcional.
 *
 * @param {unknown} value - Valor recebido.
 * @returns {string | null} String normalizada ou `null`.
 */
function optionalString(value) {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value !== "string") {
        throw httpError(400, "INVALID_FIELD", "Campo inválido");
    }
    return value.trim();
}

/**
 * Valida a data fiscal base em mês/dia.
 *
 * @param {unknown} month - Mês fiscal.
 * @param {unknown} day - Dia fiscal.
 * @returns {{ month: number, day: number }} Data fiscal validada.
 */
function validateFiscalDate(month, day) {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
        throw httpError(400, "INVALID_FISCAL_PERIOD", "Mês fiscal inválido");
    }
    if (!Number.isInteger(day) || day < 1) {
        throw httpError(400, "INVALID_FISCAL_PERIOD", "Dia fiscal inválido");
    }
    const date = new Date(Date.UTC(2025, month - 1, day));
    if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        throw httpError(400, "INVALID_FISCAL_PERIOD", "Dia fiscal inválido");
    }
    return { month, day };
}

/**
 * Valida payload completo de perfil da empresa.
 *
 * @param {unknown} body - Corpo JSON do pedido.
 * @returns {object} Payload normalizado para persistência.
 */
export function validateCompanyProfilePayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const nif = requiredString(body.nif, "nif");
    if (!isValidPortugueseNif(nif)) {
        throw httpError(400, "INVALID_NIF", "NIF português inválido");
    }

    if (body.currency !== undefined && body.currency !== "EUR") {
        throw httpError(
            400,
            "INVALID_CURRENCY",
            "A moeda base documentada para o MVP e EUR",
        );
    }

    const fiscalDate = validateFiscalDate(
        body.fiscalYearStartMonth,
        body.fiscalYearStartDay,
    );

    return {
        legalName: requiredString(body.legalName, "legalName"),
        nif,
        addressLine1: requiredString(body.addressLine1, "addressLine1"),
        addressLine2: optionalString(body.addressLine2),
        postalCode: requiredString(body.postalCode, "postalCode"),
        city: requiredString(body.city, "city"),
        country: body.country ? requiredString(body.country, "country") : "PT",
        currency: "EUR",
        logoUrl: optionalString(body.logoUrl),
        fiscalYearStartMonth: fiscalDate.month,
        fiscalYearStartDay: fiscalDate.day,
    };
}
