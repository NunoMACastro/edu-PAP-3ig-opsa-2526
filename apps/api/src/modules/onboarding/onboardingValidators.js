/**
 * @file Validação do onboarding inicial de empresa.
 */

import { httpError } from "../../lib/httpErrors.js";
import { validateCompanyProfilePayload } from "../company-profile/companyProfileValidators.js";

/**
 * Valida apenas nome e perfil; identidade, role e empresa vêm do servidor.
 *
 * @param {unknown} body - Corpo JSON.
 * @returns {{ name: string, profile: object }} Payload persistível.
 */
export function validateOnboardingPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }
    if (body.userId !== undefined || body.companyId !== undefined || body.role !== undefined) {
        throw httpError(400, "SERVER_OWNED_FIELD", "Identidade e role são definidas pelo servidor");
    }
    if (typeof body.name !== "string" || body.name.trim().length < 2) {
        throw httpError(400, "INVALID_COMPANY_NAME", "Nome da empresa inválido");
    }
    return {
        name: body.name.trim(),
        profile: validateCompanyProfilePayload(body.profile),
    };
}
