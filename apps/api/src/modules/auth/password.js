/**
 * @file Hash e verificação de palavras-passe com bcrypt.
 */

import bcrypt from "bcrypt";

export const BCRYPT_ROUNDS = 12;

/**
 * Cria um hash bcrypt para uma palavra-passe recebida apenas em memória.
 *
 * @param {string} plainPassword - Palavra-passe recebida no pedido atual.
 * @returns {Promise<string>} Hash seguro para persistência.
 */
export async function hashPassword(plainPassword) {
    if (!plainPassword || plainPassword.length < 10) {
        throw new Error("A palavra-passe deve ter pelo menos 10 caracteres.");
    }

    // O bcrypt gera salt próprio por hash; nunca guardamos o valor original.
    return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
}

/**
 * Compara uma tentativa de login com o hash guardado.
 *
 * @param {string} plainPassword - Palavra-passe recebida no login.
 * @param {string} passwordHash - Hash guardado na base de dados.
 * @returns {Promise<boolean>} Resultado da comparação bcrypt.
 */
export async function verifyPassword(plainPassword, passwordHash) {
    if (!passwordHash?.startsWith("$2")) {
        return false;
    }

    return bcrypt.compare(plainPassword, passwordHash);
}
