import { httpError } from "../../lib/httpErrors.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function normalizeEmail(email) {
    if (typeof email !== "string") {
        throw httpError(400, "INVALID_EMAIL", "O email e obrigatorio");
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

function validatePassword(password) {
    if (typeof password !== "string" || password.length < 10) {
        throw httpError(
            400,
            "WEAK_PASSWORD",
            "A password deve ter pelo menos 10 caracteres",
        );
    }

    return password;
}

export function validateRegisterPayload(body) {
    const payload = asObject(body);

    return {
        email: normalizeEmail(payload.email),
        password: validatePassword(payload.password),
        name:
            typeof payload.name === "string"
                ? payload.name.trim() || null
                : null,
    };
}

export function validateLoginPayload(body) {
    const payload = asObject(body);

    return {
        email: normalizeEmail(payload.email),
        password: validatePassword(payload.password),
    };
}