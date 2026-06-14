// apps/api/src/modules/treasury/bankAccountValidators.js
import { httpError } from "../../lib/httpErrors.js";

const accountTypes = new Set(["BANK", "CASH"]);

/**
 * Valida texto obrigatório vindo do payload HTTP.
 *
 * @param {unknown} value Valor recebido no body.
 * @param {string} fieldName Nome do campo para mensagem ao utilizador.
 * @returns {string} Texto limpo.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o campo falta ou e demasiado curto.
 */
function requiredText(value, fieldName) {
    if (typeof value !== "string" || value.trim().length < 2) {
        throw httpError(400, "INVALID_TREASURY_ACCOUNT", `${fieldName} é obrigatório`);
    }
    return value.trim();
}

/**
 * Confirma que o saldo chega em cêntimos inteiros.
 *
 * @param {unknown} value Valor enviado pelo frontend.
 * @returns {number} Saldo inicial em cêntimos.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o valor não é inteiro.
 */
function parseInitialBalance(value) {
    if (!Number.isInteger(value)) {
        throw httpError(400, "INVALID_INITIAL_BALANCE", "Saldo inicial deve estar em cêntimos");
    }
    return value;
}

/**
 * Valida o IBAN português para contas bancárias e remove IBAN de contas caixa.
 *
 * @param {string} type Tipo de conta validado.
 * @param {unknown} iban IBAN enviado no payload.
 * @returns {string | null} IBAN normalizado ou null para caixa.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando uma conta bancária não tem IBAN português válido.
 */
function assertIban(type, iban) {
    if (type === "CASH") return null;
    const normalized = requiredText(iban, "IBAN").replace(/\s+/g, "").toUpperCase();
    if (!/^PT50\d{21}$/.test(normalized)) {
        throw httpError(400, "INVALID_IBAN", "IBAN português inválido");
    }
    return normalized;
}

/**
 * Valida o payload de criação de conta de tesouraria.
 *
 * A empresa e o utilizador não entram neste DTO porque vêm da sessão e dos guards da MF0.
 *
 * @param {{ type?: unknown, name?: unknown, iban?: unknown, currency?: unknown, initialBalanceCents?: unknown }} body Body HTTP recebido pela route.
 * @returns {{ name: string, type: "BANK" | "CASH", iban: string | null, currency: string, initialBalanceCents: number }} Payload seguro para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando algum campo funcional é inválido.
 */
export function validateTreasuryAccountPayload(body) {
    const type = requiredText(body.type, "Tipo");
    if (!accountTypes.has(type)) {
        throw httpError(400, "INVALID_TREASURY_ACCOUNT_TYPE", "Tipo deve ser BANK ou CASH");
    }

    return {
        name: requiredText(body.name, "Nome"),
        type,
        iban: assertIban(type, body.iban),
        currency: requiredText(body.currency ?? "EUR", "Moeda").toUpperCase(),
        initialBalanceCents: parseInitialBalance(body.initialBalanceCents ?? 0),
    };
}