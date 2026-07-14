/**
 * @file Validação dos endpoints públicos de convite.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Valida o token opaco enviado exclusivamente no corpo JSON.
 *
 * @param {unknown} body - Corpo do pedido.
 * @returns {{ token: string }} Token normalizado.
 */
export function validateInvitationTokenPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }
    if (typeof body.token !== "string" || body.token.trim().length < 32) {
        throw httpError(400, "INVALID_INVITATION_TOKEN", "Token de convite inválido");
    }
    return { token: body.token.trim() };
}
