/**
 * @file Validação do onboarding inicial de empresa.
 */

import { httpError } from "../../lib/httpErrors.js";
import { validateCompanyProfilePayload } from "../company-profile/companyProfileValidators.js";

const ALLOWED_FIELDS = new Set(["name", "profile", "prepareDemoData"]);
const SERVER_OWNED_FIELDS = new Set([
    "userId",
    "ownerUserId",
    "companyId",
    "role",
    "activeCompanyId",
]);

/**
 * Valida apenas nome e perfil; identidade, role e empresa vêm do servidor.
 *
 * @param {unknown} body - Corpo JSON.
 * @returns {{ name: string, profile: object, prepareDemoData: boolean }} Payload persistível.
 */
export function validateOnboardingPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }
    const profileBody = body.profile && typeof body.profile === "object" &&
        !Array.isArray(body.profile)
        ? body.profile
        : {};
    const serverOwned = [...SERVER_OWNED_FIELDS].find((field) =>
        Object.hasOwn(body, field) || Object.hasOwn(profileBody, field));
    if (serverOwned) {
        throw httpError(400, "SERVER_OWNED_FIELD", "Identidade e role são definidas pelo servidor");
    }
    const unknownField = Object.keys(body).find((field) => !ALLOWED_FIELDS.has(field));
    if (unknownField) {
        throw httpError(
            400,
            "INVALID_COMPANY_SETUP_FIELD",
            "O pedido contém um campo de criação de empresa não permitido",
        );
    }
    if (typeof body.name !== "string" || body.name.trim().length < 2) {
        throw httpError(400, "INVALID_COMPANY_NAME", "Nome da empresa inválido");
    }
    if (
        body.prepareDemoData !== undefined &&
        typeof body.prepareDemoData !== "boolean"
    ) {
        throw httpError(
            400,
            "INVALID_DEMO_DATA_OPTION",
            "prepareDemoData deve ser booleano",
        );
    }
    return {
        name: body.name.trim(),
        profile: validateCompanyProfilePayload(body.profile),
        prepareDemoData: body.prepareDemoData ?? false,
    };
}
