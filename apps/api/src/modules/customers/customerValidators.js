/**
 * @file Validadores de clientes do BK-MF0-09.
 */

import { httpError } from "../../lib/httpErrors.js";
import { isValidPortugueseNif } from "../company-profile/nifValidator.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida o nome obrigatório do cliente.
 *
 * @param {unknown} value - Valor recebido.
 * @returns {string} Nome normalizado.
 */
function requiredName(value) {
    if (typeof value !== "string" || value.trim().length < 2) {
        throw httpError(
            400,
            "INVALID_CUSTOMER_NAME",
            "Nome do cliente é obrigatório",
        );
    }
    return value.trim();
}

/**
 * Normaliza um campo textual opcional de cliente.
 * Valores vazios passam a `null` para o service distinguir ausência de texto real.
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
 * Valida NIF opcional quando preenchido.
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
 * Acrescenta apenas metadata SAF-T explicitamente enviada pelo cliente HTTP.
 * A omissão preserva dados existentes e nunca assume país, conta ou indicador.
 *
 * @param {Record<string, unknown>} body - Payload recebido.
 * @param {Record<string, unknown>} result - Payload normalizado.
 * @returns {void}
 */
function appendSaftFields(body, result) {
    if (Object.hasOwn(body, "country")) {
        if (body.country === null || body.country === "") {
            result.country = null;
        } else {
            const country = String(body.country).trim().toUpperCase();
            if (!/^[A-Z]{2}$/.test(country)) {
                throw httpError(400, "INVALID_SAFT_COUNTRY", "country deve usar ISO 3166-1 alpha-2");
            }
            result.country = country;
        }
    }
    if (Object.hasOwn(body, "saftAccountId")) {
        if (body.saftAccountId === null || body.saftAccountId === "") {
            result.saftAccountId = null;
        } else {
            const accountId = String(body.saftAccountId).trim();
            if (
                accountId.length < 2 ||
                accountId.length > 30 ||
                /[\^\u0000-\u001f\u007f]/.test(accountId)
            ) {
                throw httpError(400, "INVALID_SAFT_ACCOUNT", "saftAccountId é inválido");
            }
            result.saftAccountId = accountId;
        }
    }
    if (Object.hasOwn(body, "selfBillingIndicator")) {
        const value = body.selfBillingIndicator;
        if (value === null || value === "") {
            result.selfBillingIndicator = null;
        } else if (value === 0 || value === 1) {
            result.selfBillingIndicator = value;
        } else {
            throw httpError(
                400,
                "INVALID_SAFT_SELF_BILLING",
                "selfBillingIndicator deve ser 0 ou 1",
            );
        }
    }
}

/**
 * Valida payload de cliente.
 *
 * @param {unknown} body - Corpo JSON do pedido.
 * @returns {object} Cliente normalizado.
 */
export function validateCustomerPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const result = {
        name: requiredName(body.name),
        nif: optionalNif(body.nif),
        email: optionalEmail(body.email),
        phone: optionalString(body.phone),
        addressLine: optionalString(body.addressLine),
        postalCode: optionalString(body.postalCode),
        city: optionalString(body.city),
    };
    appendSaftFields(body, result);
    return result;
}
