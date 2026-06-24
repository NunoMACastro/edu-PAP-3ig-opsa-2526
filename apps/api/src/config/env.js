/**
 * @file Configuração da API OPSA lida a partir do ambiente.
 */

const requiredVariables = ["DATABASE_URL"];

/**
 * Lê uma variável obrigatória e falha cedo quando está ausente.
 *
 * @param {string} name - Nome da variável.
 * @returns {string} Valor configurado no ambiente.
 */
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Variável obrigatória em falta: ${name}`);
    }

    return value;
}

/**
 * Valida a configuração obrigatória da API.
 *
 * @returns {{ databaseUrl: string, appBaseUrl: string }}
 */
export function loadEnv() {
    for (const name of requiredVariables) {
        requireEnv(name);
    }

    // O ficheiro central evita credenciais espalhadas por services e scripts.
    return {
        databaseUrl: requireEnv("DATABASE_URL"),
        appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:5173",
    };
}