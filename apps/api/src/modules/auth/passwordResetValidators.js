/**
 * @file Validadores do fluxo de recuperação de password do BK-MF0-05.
 */

import { httpError } from "../../lib/httpErrors.js";
import { validateNewPasswordPolicy } from "./passwordPolicy.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normaliza e valida email para pedido de recuperação.
 *
 * @param {unknown} email - Valor recebido no payload.
 * @returns {string} Email normalizado.
 */
function normalizeEmail(email) {
    if (typeof email !== "string") {
        throw httpError(400, "INVALID_EMAIL", "Email obrigatório");
    }

    const normalized = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
        throw httpError(400, "INVALID_EMAIL", "Email inválido");
    }

    return normalized;
}

/**
 * Normaliza e valida token recebido no link de recuperação.
 *
 * @param {unknown} token - Token recebido no payload.
 * @returns {string} Token normalizado.
 */
function normalizeToken(token) {
    if (typeof token !== "string" || token.trim().length < 32) {
        throw httpError(400, "INVALID_TOKEN", "Token inválido");
    }
    return token.trim();
}

/**
 * Valida payload de pedido de recuperação.
 *
 * @param {unknown} body - Corpo JSON do pedido.
 * @returns {{ email: string }} Payload normalizado.
 */
export function validateForgotPasswordPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return { email: normalizeEmail(body.email) };
}

/**
 * Valida payload de reposição de password.
 *
 * @param {unknown} body - Corpo JSON do pedido.
 * @returns {{ token: string, password: string }} Payload normalizado.
 */
export function validateResetPasswordPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return {
        token: normalizeToken(body.token),
        password: validateNewPasswordPolicy(body.password),
    };
}
