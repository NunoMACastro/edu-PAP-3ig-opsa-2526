import { httpError } from "../../lib/httpErrors.js";
import { isValidPortugueseNif } from "../company-profile/nifValidator.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requiredName(value) {
    if (typeof value !== "string" || value.trim().length < 2) {
        throw httpError(
            400,
            "INVALID_CUSTOMER_NAME",
            "Nome do cliente e obrigatorio",
        );
    }
    return value.trim();
}

function optionalString(value) {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value !== "string")
        throw httpError(400, "INVALID_FIELD", "Campo invalido");
    return value.trim();
}

function optionalNif(value) {
    const nif = optionalString(value);
    if (!nif) return null;
    if (!isValidPortugueseNif(nif))
        throw httpError(400, "INVALID_NIF", "NIF portugues invalido");
    return nif;
}

function optionalEmail(value) {
    const email = optionalString(value);
    if (!email) return null;
    if (!EMAIL_PATTERN.test(email))
        throw httpError(400, "INVALID_EMAIL", "Email invalido");
    return email.toLowerCase();
}

export function validateCustomerPayload(body) {
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