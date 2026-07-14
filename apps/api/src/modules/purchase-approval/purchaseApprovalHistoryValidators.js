/**
 * @file Validadores do histórico de decisões de compras da MF2.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Normaliza a justificação opcional de aprovação.
 *
 * @param {unknown} input - Payload JSON.
 * @returns {string} Justificação funcional.
 */
export function parseApprovalReason(input) {
    const reason = String(input?.reason ?? "").trim();
    return reason || "Aprovação registada sem observações adicionais.";
}

/**
 * Valida a justificação obrigatória de reprovação.
 *
 * @param {unknown} input - Payload JSON.
 * @returns {string} Justificação funcional.
 */
export function parseRejectionReason(input) {
    const reason = String(input?.reason ?? "").trim();
    if (reason.length < 8) {
        throw httpError(
            400,
            "REJECTION_REASON_REQUIRED",
            "Indica uma justificação de reprovação com pelo menos 8 caracteres",
        );
    }
    return reason;
}
