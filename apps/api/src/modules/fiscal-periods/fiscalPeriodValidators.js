import { httpError } from "../../lib/httpErrors.js";

function parseDateOnly(value, field) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw httpError(
            400,
            "INVALID_DATE",
            `${field} deve usar formato YYYY-MM-DD`,
        );
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_DATE", `${field} invalida`);
    }

    return date;
}

export function validateFiscalPeriodPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    if (typeof body.name !== "string" || body.name.trim().length < 4) {
        throw httpError(400, "INVALID_PERIOD_NAME", "Nome do periodo invalido");
    }

    const startDate = parseDateOnly(body.startDate, "startDate");
    const endDate = parseDateOnly(body.endDate, "endDate");

    if (endDate <= startDate) {
        throw httpError(
            400,
            "INVALID_PERIOD_RANGE",
            "Data final deve ser posterior a data inicial",
        );
    }

    return {
        name: body.name.trim(),
        startDate,
        endDate,
    };
}