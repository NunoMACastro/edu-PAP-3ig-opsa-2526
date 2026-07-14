/**
 * @file Validadores da gestão de utilizadores da empresa.
 */

import { httpError } from "../../lib/httpErrors.js";

const VALID_ROLES = new Set([
    "ADMIN",
    "GESTOR",
    "CONTABILISTA",
    "OPERACIONAL",
    "AUDITOR",
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normaliza e valida email de convite.
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
 * Valida uma role canónica RF02.
 *
 * @param {unknown} role - Role recebida no payload.
 * @returns {string} Role validada.
 */
function normalizeRole(role) {
    if (typeof role !== "string" || !VALID_ROLES.has(role)) {
        throw httpError(400, "INVALID_ROLE", "Papel inválido");
    }
    return role;
}

/**
 * Valida payload de convite.
 *
 * @param {unknown} body - Corpo JSON do pedido.
 * @returns {{ email: string, role: string }} Payload normalizado.
 */
export function validateInvitationPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return {
        email: normalizeEmail(body.email),
        role: normalizeRole(body.role),
    };
}

/**
 * Valida o identificador de convite vindo do path sem o aceitar do body.
 *
 * @param {unknown} value - Parâmetro `:id` da rota.
 * @returns {string} Identificador normalizado.
 */
export function validateInvitationIdParam(value) {
    const invitationId = String(value ?? "").trim();
    if (!invitationId) {
        throw httpError(
            400,
            "INVITATION_ID_REQUIRED",
            "Identificador do convite obrigatório",
        );
    }
    return invitationId;
}

/**
 * Valida payload de alteração de role.
 *
 * @param {unknown} body - Corpo JSON do pedido.
 * @returns {{ role: string }} Payload normalizado.
 */
export function validateRolePayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return { role: normalizeRole(body.role) };
}
