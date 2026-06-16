/**
 * @file Validadores de contexto multiempresa do BK-MF0-03.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Valida payload de troca de empresa ativa.
 *
 * @param {unknown} body - Corpo JSON do pedido.
 * @returns {{ companyId: string }} Payload normalizado.
 */
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
        throw httpError(400, "INVALID_COMPANY_ID", "companyId é obrigatório");
    }

    return { companyId: body.companyId.trim() };
}
