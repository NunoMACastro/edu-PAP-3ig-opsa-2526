import { httpError } from "../../lib/httpErrors.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
    if (typeof email !== "string")
        throw httpError(400, "INVALID_EMAIL", "Email obrigatorio");
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized))
        throw httpError(400, "INVALID_EMAIL", "Email invalido");
    return normalized;
}

function normalizeToken(token) {
    if (typeof token !== "string" || token.trim().length < 32) {
        throw httpError(400, "INVALID_TOKEN", "Token invalido");
    }
    return token.trim();
}

function validateNewPassword(password) {
    if (typeof password !== "string" || password.length < 10) {
        throw httpError(
            400,
            "WEAK_PASSWORD",
            "A password deve ter pelo menos 10 caracteres",
        );
    }
    return password;
}

export function validateForgotPasswordPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return { email: normalizeEmail(body.email) };
}

export function validateResetPasswordPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return {
        token: normalizeToken(body.token),
        password: validateNewPassword(body.password),
    };
}