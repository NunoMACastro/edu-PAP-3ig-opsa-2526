import { httpError } from "../../lib/httpErrors.js";
import { isValidPortugueseNif } from "./nifValidator.js";

function requiredString(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw httpError(400, "INVALID_FIELD", `${field} e obrigatorio`);
    }
    return value.trim();
}

function optionalString(value) {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value !== "string")
        throw httpError(400, "INVALID_FIELD", "Campo invalido");
    return value.trim();
}

function validateFiscalDate(month, day) {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
        throw httpError(400, "INVALID_FISCAL_PERIOD", "Mes fiscal invalido");
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
        throw httpError(400, "INVALID_FISCAL_PERIOD", "Dia fiscal invalido");
    }
    return { month, day };
}

export function validateCompanyProfilePayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const nif = requiredString(body.nif, "nif");
    if (!isValidPortugueseNif(nif)) {
        throw httpError(400, "INVALID_NIF", "NIF portugues invalido");
    }

    if (body.currency !== "EUR") {
        throw httpError(
            400,
            "INVALID_CURRENCY",
            "A moeda base documentada para o MVP e EUR",
        );
    }

    const fiscalDate = validateFiscalDate(
        body.fiscalYearStartMonth,
        body.fiscalYearStartDay,
    );

    return {
        legalName: requiredString(body.legalName, "legalName"),
        nif,
        addressLine1: requiredString(body.addressLine1, "addressLine1"),
        addressLine2: optionalString(body.addressLine2),
        postalCode: requiredString(body.postalCode, "postalCode"),
        city: requiredString(body.city, "city"),
        country: body.country ? requiredString(body.country, "country") : "PT",
        currency: "EUR",
        logoUrl: optionalString(body.logoUrl),
        fiscalYearStartMonth: fiscalDate.month,
        fiscalYearStartDay: fiscalDate.day,
    };
}