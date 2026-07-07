/**
 * @file Endpoint publico de health-check da API OPSA para RNF29.
 *
 * Este modulo expoe readiness operacional minima sem consultar base de dados
 * e sem revelar configuracao interna, empresas, roles, credenciais ou dados
 * financeiros.
 */

import { Router } from "express";

const VALID_ENVIRONMENTS = new Set(["development", "test", "production"]);

/**
 * @typedef {{ version: string, environment: string }} HealthOptions
 */

/**
 * @typedef {{ status: "ok", service: "opsa-api", version: string, environment: string, checkedAt: string }} HealthPayload
 */

/**
 * Normaliza um campo textual obrigatorio do health-check.
 *
 * @param {unknown} value - Valor recebido da configuracao da API.
 * @param {string} fieldName - Nome usado na mensagem de erro.
 * @returns {string} Texto validado e sem espacos exteriores.
 * @throws {Error} Quando o campo nao e uma string preenchida.
 */
function readRequiredText(value, fieldName) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`${fieldName} e obrigatorio para o health-check.`);
    }

    return value.trim();
}

/**
 * Valida a configuracao minima e devolve uma copia segura para o router.
 *
 * @param {unknown} options - Configuracao recebida pelo ponto de entrada da API.
 * @returns {HealthOptions} Configuracao operacional segura.
 * @throws {Error} Quando a versao ou o ambiente nao cumprem RNF29.
 */
function normalizeHealthOptions(options) {
    if (!options || typeof options !== "object" || Array.isArray(options)) {
        throw new Error("Configuracao de health-check invalida.");
    }

    const version = readRequiredText(options.version, "version");
    const environment = readRequiredText(options.environment, "environment");

    if (!VALID_ENVIRONMENTS.has(environment)) {
        throw new Error("Ambiente de health-check invalido.");
    }

    // A copia impede que uma mutacao externa altere o contrato publico da rota.
    return { version, environment };
}

/**
 * Cria o payload publico e seguro do endpoint de health-check.
 *
 * @param {HealthOptions} options - Configuracao minima que pode ser exposta.
 * @param {Date} [now] - Relogio usado para tornar o teste deterministico.
 * @returns {HealthPayload} Payload publico do endpoint.
 * @throws {Error} Quando a versao, o ambiente ou o relogio nao sao validos.
 */
export function buildHealthPayload(options, now = new Date()) {
    const normalizedOptions = normalizeHealthOptions(options);

    if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
        throw new Error("Data de health-check invalida.");
    }

    // Lista fechada de campos: o endpoint publico nao deve vazar detalhes internos.
    return {
        status: "ok",
        service: "opsa-api",
        version: normalizedOptions.version,
        environment: normalizedOptions.environment,
        checkedAt: now.toISOString(),
    };
}

/**
 * Monta o router publico de health-check da API OPSA.
 *
 * @param {HealthOptions} options - Configuracao segura a expor na resposta.
 * @returns {Router} Router Express com `GET /`.
 */
export function buildHealthRoutes(options) {
    const safeOptions = normalizeHealthOptions(options);
    const router = Router();

    router.get("/", (_req, res) => {
        // O timestamp e criado no pedido, mas a configuracao ja foi validada ao montar a rota.
        return res.status(200).json(buildHealthPayload(safeOptions));
    });

    return router;
}
