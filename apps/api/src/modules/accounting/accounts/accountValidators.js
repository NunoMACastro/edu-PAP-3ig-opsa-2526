/**
 * @file Validadores do plano de contas SNC do BK-MF0-07.
 */

import { httpError } from "../../../lib/httpErrors.js";

const ACCOUNT_CODE_PATTERN = /^\d{1,8}$/;

/**
 * Valida código SNC numérico simples.
 *
 * @param {unknown} code - Código recebido.
 * @returns {string} Código normalizado.
 */
function validateCode(code) {
    if (typeof code !== "string" || !ACCOUNT_CODE_PATTERN.test(code.trim())) {
        throw httpError(
            400,
            "INVALID_ACCOUNT_CODE",
            "Código SNC deve ser numérico e ter entre 1 e 8 dígitos",
        );
    }
    return code.trim();
}

/**
 * Valida nome da conta.
 *
 * @param {unknown} name - Nome recebido.
 * @returns {string} Nome normalizado.
 */
function validateName(name) {
    if (typeof name !== "string" || name.trim().length < 3) {
        throw httpError(
            400,
            "INVALID_ACCOUNT_NAME",
            "Nome da conta deve ter pelo menos 3 caracteres",
        );
    }
    return name.trim();
}

/**
 * Deriva nível contabilístico a partir do comprimento do código.
 *
 * @param {string} code - Código SNC validado.
 * @returns {number} Nível derivado.
 */
function accountLevelFromCode(code) {
    return code.length;
}

/**
 * Valida uma conta manual ou uma linha de importação.
 *
 * @param {unknown} body - Payload de conta.
 * @returns {{ code: string, name: string, parentCode: string | null, level: number, isActive: boolean }} Conta normalizada.
 */
export function validateAccountPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const code = validateCode(body.code);
    const parentCode = body.parentCode ? validateCode(body.parentCode) : null;

    return {
        code,
        name: validateName(body.name),
        parentCode,
        level: accountLevelFromCode(code),
        isActive: body.isActive !== false,
    };
}

/**
 * Valida payload de importação com linhas já normalizadas.
 *
 * @param {unknown} body - Payload da importação.
 * @returns {Array<ReturnType<typeof validateAccountPayload>>} Linhas validadas.
 */
export function validateImportPayload(body) {
    if (!body || typeof body !== "object" || !Array.isArray(body.rows)) {
        throw httpError(
            400,
            "INVALID_IMPORT",
            "Importação deve receber rows normalizadas",
        );
    }

    return body.rows.map(validateAccountPayload);
}
