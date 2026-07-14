/**
 * @file Política de passwords compatível com o limite de entrada do bcrypt.
 *
 * O bcrypt considera, no máximo, os primeiros 72 bytes da password. Validar
 * bytes UTF-8 antes de criar um hash impede que duas passwords visivelmente
 * diferentes produzam credenciais equivalentes por truncagem silenciosa.
 */

import { httpError } from "../../lib/httpErrors.js";

export const MIN_PASSWORD_CHARACTERS = 10;
export const BCRYPT_MAX_PASSWORD_BYTES = 72;

/**
 * Valida uma password nova antes de esta chegar ao bcrypt.
 *
 * O limite superior é medido em bytes UTF-8, não em unidades UTF-16 de
 * JavaScript. A função não normaliza nem altera a password recebida.
 *
 * @param {unknown} password - Password escolhida no registo ou no reset.
 * @returns {string} A mesma password, pronta para hashing.
 * @throws {ReturnType<typeof httpError>} Quando a política não é cumprida.
 */
export function validateNewPasswordPolicy(password) {
    if (
        typeof password !== "string" ||
        password.length < MIN_PASSWORD_CHARACTERS
    ) {
        throw httpError(
            400,
            "WEAK_PASSWORD",
            `A password deve ter pelo menos ${MIN_PASSWORD_CHARACTERS} caracteres`,
        );
    }

    if (Buffer.byteLength(password, "utf8") > BCRYPT_MAX_PASSWORD_BYTES) {
        throw httpError(
            400,
            "PASSWORD_TOO_LONG",
            `A password não pode exceder ${BCRYPT_MAX_PASSWORD_BYTES} bytes em UTF-8`,
        );
    }

    return password;
}
