// apps/api/src/modules/ops/healthRoutes.js

import { Router } from "express";

const VALID_ENVIRONMENTS = new Set(["development", "test", "production"]);

/**
 * @typedef {{ version: string, environment: string }} HealthOptions
 */

/**
 * @typedef {{ status: "ok", service: "opsa-api", version: string, environment: string, checkedAt: string }} HealthPayload
 */

/**
 * Normaliza um campo textual obrigatório do health-check.
 *
 * @param {unknown} value - Valor recebido da configuração da API.
 * @param {string} fieldName - Nome usado na mensagem de erro.
 * @returns {string} Texto validado e sem espaços exteriores.
 * @throws {Error} Quando o campo não é uma string preenchida.
 */
function readRequiredText(value, fieldName) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`${fieldName} é obrigatório para o health-check.`);
    }

    return value.trim();
}

/**
 * Cria o payload público e seguro do endpoint de health-check.
 *
 * @param {HealthOptions} options - Configuração mínima que pode ser exposta.
 * @param {Date} [now] - Relógio usado para tornar o teste determinístico.
 * @returns {HealthPayload} Payload público do endpoint.
 * @throws {Error} Quando a versão ou o ambiente não são seguros para expor.
 */
export function buildHealthPayload(options, now = new Date()) {
    if (!options || typeof options !== "object") {
        throw new Error("Configuração de health-check inválida.");
    }

    const version = readRequiredText(options.version, "version");
    const environment = readRequiredText(options.environment, "environment");

    if (!VALID_ENVIRONMENTS.has(environment)) {
        throw new Error("Ambiente de health-check inválido.");
    }
    if (Number.isNaN(now.getTime())) {
        throw new Error("Data de health-check inválida.");
    }

    // O payload público usa uma lista fechada para não deixar escapar configuração interna.
    return {
        status: "ok",
        service: "opsa-api",
        version,
        environment,
        checkedAt: now.toISOString(),
    };
}

/**
 * Monta o router público de health-check da API OPSA.
 *
 * @param {HealthOptions} options - Configuração segura a expor na resposta.
 * @returns {Router} Router Express com `GET /`.
 */
export function buildHealthRoutes(options) {
    const router = Router();

    router.get("/", (_req, res) => {
        // A resposta é construída no momento do pedido para devolver um timestamp atual.
        const payload = buildHealthPayload(options);

        // O status 200 só é devolvido depois de a configuração mínima passar na validação.
        return res.status(200).json(payload);
    });

    return router;
}