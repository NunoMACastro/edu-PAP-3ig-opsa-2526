/**
 * @file Validadores de armazéns e localizações do BK-MF0-12.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Normaliza código obrigatório.
 *
 * @param {unknown} value - Valor recebido.
 * @param {string} field - Nome do campo.
 * @returns {string} Código normalizado.
 */
function normalizeCode(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw httpError(400, "INVALID_CODE", `${field} é obrigatório`);
    }
    return value.trim().toUpperCase();
}

/**
 * Normaliza nome obrigatório.
 *
 * @param {unknown} value - Valor recebido.
 * @param {string} field - Nome do campo.
 * @returns {string} Nome normalizado.
 */
function normalizeName(value, field) {
    if (typeof value !== "string" || value.trim().length < 2) {
        throw httpError(
            400,
            "INVALID_NAME",
            `${field} deve ter pelo menos 2 caracteres`,
        );
    }
    return value.trim();
}

/**
 * Valida payload de armazém.
 *
 * @param {unknown} body - Corpo JSON do pedido.
 * @returns {{ code: string, name: string }} Payload normalizado.
 */
export function validateWarehousePayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return {
        code: normalizeCode(body.code, "code"),
        name: normalizeName(body.name, "name"),
    };
}

/**
 * Valida payload de localização de armazém.
 *
 * @param {unknown} body - Corpo JSON do pedido.
 * @returns {{ code: string, name: string }} Payload normalizado.
 */
export function validateWarehouseLocationPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return {
        code: normalizeCode(body.code, "code"),
        name: normalizeName(body.name, "name"),
    };
}
