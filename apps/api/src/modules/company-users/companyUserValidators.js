import { httpError } from "../../lib/httpErrors.js";

const VALID_ROLES = new Set([
    "ADMIN",
    "GESTOR",
    "CONTABILISTA",
    "OPERACIONAL",
    "AUDITOR",
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
    if (typeof email !== "string")
        throw httpError(400, "INVALID_EMAIL", "Email obrigatorio");
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized))
        throw httpError(400, "INVALID_EMAIL", "Email invalido");
    return normalized;
}

function normalizeRole(role) {
    if (typeof role !== "string" || !VALID_ROLES.has(role)) {
        throw httpError(400, "INVALID_ROLE", "Papel invalido");
    }
    return role;
}

export function validateInvitationPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return {
        email: normalizeEmail(body.email),
        role: normalizeRole(body.role),
    };
}

export function validateRolePayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return { role: normalizeRole(body.role) };
}