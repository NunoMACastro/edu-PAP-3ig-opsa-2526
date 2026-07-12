/**
 * @file Validadores dos payloads de registo e login.
 *
 * Estes validadores impedem que formatos inválidos cheguem ao service ou ao
 * Prisma. A validação no backend é obrigatória mesmo que a UI também valide.
 */

import { httpError } from "../../lib/httpErrors.js";
import { validateNewPasswordPolicy } from "./passwordPolicy.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Garante que o body recebido é um objeto JSON simples.
 *
 * @param {unknown} body - Corpo recebido pelo Express.
 * @returns {Record<string, unknown>} Objeto validado.
 */
function asObject(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(
            400,
            "INVALID_BODY",
            "O corpo do pedido deve ser um objeto JSON",
        );
    }
    return body;
}

/**
 * Normaliza e valida um email.
 *
 * @param {unknown} email - Valor recebido no payload.
 * @returns {string} Email em minúsculas, pronto para persistência/consulta.
 */
function normalizeEmail(email) {
    if (typeof email !== "string") {
        throw httpError(400, "INVALID_EMAIL", "O email é obrigatório");
    }

    const normalized = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
        throw httpError(
            400,
            "INVALID_EMAIL",
            "O email deve ter formato valido",
        );
    }

    return normalized;
}

/**
 * Valida apenas a presença da password no login.
 *
 * A política de força aplica-se ao registo e ao reset. No login, uma password
 * curta pode simplesmente estar errada; devolver `WEAK_PASSWORD` revelaria uma
 * validação que o contrato do BK-MF0-01 reserva para criação/alteração.
 *
 * @param {unknown} password - Password recebida no payload.
 * @returns {string} Password recebida para comparação segura no service.
 */
function validateLoginPassword(password) {
    if (typeof password !== "string" || password.length === 0) {
        throw httpError(401, "INVALID_CREDENTIALS", "Credenciais inválidas");
    }

    return password;
}

/**
 * Valida e normaliza o payload de registo.
 *
 * @param {unknown} body - Corpo JSON do pedido `POST /api/auth/register`.
 * @returns {{ email: string, password: string, name: string | null }} Payload normalizado.
 */
export function validateRegisterPayload(body) {
    const payload = asObject(body);

    return {
        email: normalizeEmail(payload.email),
        password: validateNewPasswordPolicy(payload.password),
        name:
            typeof payload.name === "string"
                ? payload.name.trim() || null
                : null,
    };
}

/**
 * Valida e normaliza o payload de login.
 *
 * @param {unknown} body - Corpo JSON do pedido `POST /api/auth/login`.
 * @returns {{ email: string, password: string }} Payload normalizado.
 */
export function validateLoginPayload(body) {
    const payload = asObject(body);

    return {
        email: normalizeEmail(payload.email),
        password: validateLoginPassword(payload.password),
    };
}
