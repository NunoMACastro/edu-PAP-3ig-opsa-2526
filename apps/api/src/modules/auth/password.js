/**
 * @file Hash e verificação de passwords para o BK-MF0-01.
 * 
 * A password nunca é guardada em texto puro. Este módulo isola o detalhe do
 * bcrypt para que services de autenticação e recuperação reutilizem a mesma
 * política.
 */

import bcrypt from "bcrypt";

export const BCRYPT_ROUNDS = 12;

/**
 * Gera um hash bcrypt com salt seguro para a password recebida.
 *
 * @param {string} password - Password em texto claro recebida apenas em memória.
 * @returns {Promise<string>} Hash bcrypt persistível na base de dados.
 */
export async function hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compara uma password em texto claro com o hash guardado.
 *
 * @param {string} password - Password fornecida pelo utilizador no login/reset.
 * @param {string} passwordHash - Hash bcrypt guardado na base de dados.
 * @returns {Promise<boolean>} `true` quando a password corresponde ao hash.
 */
export async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}
