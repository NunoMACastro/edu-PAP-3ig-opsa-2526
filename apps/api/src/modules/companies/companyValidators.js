import { httpError } from "../../lib/httpErrors.js";

export function validateSwitchCompanyPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(
            400,
            "INVALID_BODY",
            "O corpo do pedido deve ser um objeto JSON",
        );
    }

    if (
        typeof body.companyId !== "string" ||
        body.companyId.trim().length === 0
    ) {
        throw httpError(400, "INVALID_COMPANY_ID", "companyId e obrigatorio");
    }

    return { companyId: body.companyId.trim() };
}