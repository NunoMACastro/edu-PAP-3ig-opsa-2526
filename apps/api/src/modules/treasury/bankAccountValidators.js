/**
 * @file Validadores de contas bancárias/caixa da MF3.
 */

import { httpError } from "../../lib/httpErrors.js";

const ACCOUNT_TYPES = new Set(["BANK", "CASH"]);

/**
 * Normaliza texto opcional removendo espaços e devolvendo undefined quando fica vazio.
 *
 * @param value - Valor a normalizar ou formatar.
 * @returns Texto normalizado, ou valor vazio quando aplicável.
 */
function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
}

/**
 * Converte valores monetários de entrada para cêntimos inteiros.
 *
 * @param value - Valor a normalizar ou formatar.
 * @param field - Campo numérico a acumular.
 * @returns Valor monetário convertido para cêntimos.
 */
function moneyCents(value, field) {
    const number = Number(value);
    if (!Number.isInteger(number)) {
        throw httpError(400, "INVALID_AMOUNT", `${field} deve estar em cêntimos`);
    }
    return number;
}

/**
 * Documenta a função ibanToNumberString no contexto deste módulo.
 *
 * @param iban - IBAN a validar.
 * @returns IBAN reduzido aos dígitos usados na validação.
 */
function ibanToNumberString(iban) {
    return iban
        .slice(4)
        .concat(iban.slice(0, 4))
        .replace(/[A-Z]/g, (letter) => String(letter.charCodeAt(0) - 55));
}

/**
 * Valida IBAN pelo algoritmo ISO 13616/mod 97.
 *
 * @param {string} iban - IBAN sem espaços.
 * @returns {boolean} `true` quando o IBAN é sintaticamente válido.
 */
export function isValidIban(iban) {
    if (!/^[A-Z]{2}[0-9A-Z]{13,32}$/.test(iban)) return false;
    const numeric = ibanToNumberString(iban);
    let remainder = 0;
    for (const digit of numeric) {
        remainder = (remainder * 10 + Number(digit)) % 97;
    }
    return remainder === 1;
}

/**
 * Valida payload de criação de conta de tesouraria.
 *
 * @param {unknown} input - Payload JSON.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando há campos inválidos.
 * @returns {object} Conta normalizada.
 */
export function validateTreasuryAccountPayload(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const type = normalizeText(input.type).toUpperCase();
    const name = normalizeText(input.name);
    const iban = normalizeText(input.iban).replace(/\s+/g, "").toUpperCase() || null;
    const currency = normalizeText(input.currency).toUpperCase() || "EUR";
    const initialBalanceCents = moneyCents(
        input.initialBalanceCents ?? 0,
        "initialBalanceCents",
    );

    if (!ACCOUNT_TYPES.has(type)) {
        throw httpError(400, "INVALID_ACCOUNT_TYPE", "Tipo de conta inválido");
    }
    if (name.length < 2 || name.length > 120) {
        throw httpError(400, "INVALID_ACCOUNT_NAME", "Nome de conta inválido");
    }
    if (currency.length !== 3) {
        throw httpError(400, "INVALID_CURRENCY", "Moeda deve usar código ISO de 3 letras");
    }
    if (type === "BANK" && (!iban || !isValidIban(iban))) {
        throw httpError(400, "INVALID_IBAN", "IBAN obrigatório e válido para conta bancária");
    }
    if (type === "CASH" && iban) {
        throw httpError(400, "IBAN_NOT_ALLOWED", "Conta de caixa não deve ter IBAN");
    }

    return { type, name, iban, currency, initialBalanceCents };
}
