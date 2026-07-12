/**
 * @file Validação estrita do contrato assíncrono de exportação SAF-T.
 */

import { httpError } from "../../lib/httpErrors.js";

const ALLOWED_REQUEST_FIELDS = new Set(["type", "fiscalPeriodId"]);

/**
 * Normaliza um identificador interno sem aceitar objetos, arrays ou valores excessivos.
 *
 * @param {unknown} value - Identificador recebido do pedido HTTP.
 * @param {string} fieldName - Nome público do campo.
 * @returns {string} Identificador validado.
 */
function requiredIdentifier(value, fieldName) {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (!normalized || normalized.length > 128 || /[\u0000-\u001f\u007f]/.test(normalized)) {
        throw httpError(
            400,
            "INVALID_SAFT_REQUEST",
            `${fieldName} é obrigatório e deve ser um identificador válido.`,
        );
    }
    return normalized;
}

/**
 * Valida o body do POST de exportação integral.
 *
 * O cliente nunca fornece empresa, utilizador, estados de validação, storage key
 * ou datas arbitrárias; o backend deriva tudo do contexto autenticado e do período.
 *
 * @param {unknown} body - Body Express.
 * @returns {{ type: "FULL", fiscalPeriodId: string }} Pedido normalizado.
 */
export function validateSaftExportRequest(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_SAFT_REQUEST", "Pedido SAF-T inválido.");
    }

    const unknownFields = Object.keys(body).filter(
        (field) => !ALLOWED_REQUEST_FIELDS.has(field),
    );
    if (unknownFields.length > 0) {
        throw httpError(
            400,
            "INVALID_SAFT_REQUEST",
            "O pedido SAF-T contém campos não permitidos.",
        );
    }

    if (body.type !== "FULL") {
        throw httpError(
            400,
            "INVALID_SAFT_EXPORT_TYPE",
            "Apenas exportações SAF-T integrais (FULL) são suportadas.",
        );
    }

    return {
        type: "FULL",
        fiscalPeriodId: requiredIdentifier(body.fiscalPeriodId, "fiscalPeriodId"),
    };
}

/**
 * Valida o identificador de uma execução SAF-T recebido na rota.
 *
 * @param {unknown} value - Parâmetro `exportId`.
 * @returns {string} Identificador validado.
 */
export function validateSaftExportId(value) {
    return requiredIdentifier(value, "exportId");
}
