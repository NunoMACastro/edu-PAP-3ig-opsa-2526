/**
 * @file Configuracao de ambiente da API OPSA.
 *
 * Este modulo centraliza nomes de variaveis e validacoes sem expor valores
 * sensiveis. A aplicacao continua a ler segredos do ambiente, nunca do codigo.
 */

const DEFAULT_PORT = 3000;
const DEFAULT_APP_BASE_URL = "http://localhost:5173";

/**
 * Le uma variavel com fallback explicito.
 *
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env - Ambiente fonte.
 * @param {string} key - Nome da variavel.
 * @param {string | undefined} fallback - Valor por omissao.
 * @returns {string | undefined} Valor normalizado.
 */
function readEnv(env, key, fallback = undefined) {
    const value = env[key];
    if (typeof value !== "string" || value.trim() === "") {
        return fallback;
    }
    return value.trim();
}

/**
 * Converte porta de texto para inteiro seguro.
 *
 * @param {string | undefined} value - Valor recebido por ambiente.
 * @returns {number} Porta normalizada.
 */
function parsePort(value) {
    const parsed = Number.parseInt(value ?? String(DEFAULT_PORT), 10);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        throw new Error("PORT deve estar entre 1 e 65535.");
    }
    return parsed;
}

/**
 * Carrega configuracao operacional da API.
 *
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env - Ambiente fonte.
 * @returns {{ nodeEnv: string, isProduction: boolean, port: number, appBaseUrl: string, databaseUrlConfigured: boolean }} Configuracao publica segura.
 */
export function loadApiEnv(env = process.env) {
    const nodeEnv = readEnv(env, "NODE_ENV", "development");
    const isProduction = nodeEnv === "production";
    const appBaseUrl = readEnv(env, "APP_BASE_URL", DEFAULT_APP_BASE_URL);
    const databaseUrl = readEnv(env, "DATABASE_URL");

    if (!appBaseUrl) {
        throw new Error("APP_BASE_URL e obrigatorio.");
    }
    const appUrl = new URL(appBaseUrl);
    if (isProduction && appUrl.protocol !== "https:") {
        throw new Error("APP_BASE_URL deve usar HTTPS em producao.");
    }
    if (isProduction && !databaseUrl) {
        throw new Error("DATABASE_URL e obrigatorio em producao.");
    }

    return {
        nodeEnv,
        isProduction,
        port: parsePort(readEnv(env, "PORT")),
        appBaseUrl,
        databaseUrlConfigured: Boolean(databaseUrl),
    };
}
