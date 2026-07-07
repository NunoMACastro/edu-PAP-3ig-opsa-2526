/**
 * @file Validadores de fornecedores do BK-MF0-10.
 */

import { httpError } from "../../lib/httpErrors.js";
import { isValidPortugueseNif } from "../company-profile/nifValidator.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida o nome obrigatório do fornecedor.
 *
 * @param {unknown} value - Valor recebido.
 * @returns {string} Nome normalizado.
 */
function requiredName(value) {
    if (typeof value !== "string" || value.trim().length < 2) {
        throw httpError(
            400,
            "INVALID_SUPPLIER_NAME",
            "Nome do fornecedor é obrigatório",
        );
    }
    return value.trim();
}

/**
 * Normaliza um campo textual opcional de fornecedor.
 * Valores vazios são convertidos para `null` para simplificar a persistência.
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
 * Valida NIF opcional do fornecedor.
 *
 * @param {unknown} value - Valor recebido.
 * @returns {string | null} NIF validado ou `null`.
 */
function optionalNif(value) {
    const nif = optionalString(value);
    if (!nif) return null;
    if (!isValidPortugueseNif(nif)) {
        throw httpError(400, "INVALID_NIF", "NIF português inválido");
    }
    return nif;
}

/**
 * Valida email opcional quando preenchido.
 *
 * @param {unknown} value - Valor recebido.
 * @returns {string | null} Email normalizado ou `null`.
 */
function optionalEmail(value) {
    const email = optionalString(value);
    if (!email) return null;
    if (!EMAIL_PATTERN.test(email)) {
        throw httpError(400, "INVALID_EMAIL", "Email inválido");
    }
    return email.toLowerCase();
}

/**
 * Valida payload de fornecedor.
 *
 * @param {unknown} body - Corpo JSON do pedido.
 * @returns {object} Fornecedor normalizado.
 */
export function validateSupplierPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return {
        name: requiredName(body.name),
        nif: optionalNif(body.nif),
        email: optionalEmail(body.email),
        phone: optionalString(body.phone),
        addressLine: optionalString(body.addressLine),
        postalCode: optionalString(body.postalCode),
        city: optionalString(body.city),
    };
}
