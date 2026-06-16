/**
 * @file Validadores de artigos e serviços do BK-MF0-11.
 */

import { httpError } from "../../lib/httpErrors.js";

const VALID_TYPES = new Set(["PRODUCT", "SERVICE"]);

/**
 * Valida string obrigatória.
 *
 * @param {unknown} value - Valor recebido.
 * @param {string} field - Nome do campo.
 * @returns {string} Valor normalizado.
 */
function requiredString(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw httpError(400, "INVALID_FIELD", `${field} é obrigatório`);
    }
    return value.trim();
}

/**
 * Valida dinheiro guardado em cêntimos.
 *
 * @param {unknown} value - Valor recebido.
 * @param {string} field - Nome do campo.
 * @param {{ allowZero: boolean }} options - Política sobre zero.
 * @param props - Propriedades recebidas pelo componente React.
 * @returns {number} Valor validado em cêntimos.
 */
function moneyCents(value, field, { allowZero }) {
    if (!Number.isInteger(value)) {
        throw httpError(
            400,
            "INVALID_MONEY",
            `${field} deve ser inteiro em centimos`,
        );
    }
    if (value < 0 || (!allowZero && value === 0)) {
        throw httpError(400, "INVALID_MONEY", `${field} tem valor inválido`);
    }
    return value;
}

/**
 * Valida taxa de IVA em basis points.
 *
 * @param {unknown} value - Valor recebido.
 * @returns {number} Taxa validada.
 */
function vatRateBps(value) {
    if (!Number.isInteger(value) || value < 0 || value > 10000) {
        throw httpError(
            400,
            "INVALID_VAT_RATE",
            "IVA deve estar entre 0 e 10000 basis points",
        );
    }
    return value;
}

/**
 * Valida payload de artigo/serviço.
 *
 * @param {unknown} body - Corpo JSON do pedido.
 * @returns {object} Item normalizado.
 */
export function validateItemPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const type = requiredString(body.type, "type").toUpperCase();
    if (!VALID_TYPES.has(type)) {
        throw httpError(
            400,
            "INVALID_ITEM_TYPE",
            "Tipo de artigo/serviço inválido",
        );
    }

    return {
        sku: requiredString(body.sku, "sku").toUpperCase(),
        name: requiredString(body.name, "name"),
        type,
        costCents: moneyCents(body.costCents, "costCents", { allowZero: true }),
        priceCents: moneyCents(body.priceCents, "priceCents", {
            allowZero: false,
        }),
        vatRateBps: vatRateBps(body.vatRateBps),
    };
}
