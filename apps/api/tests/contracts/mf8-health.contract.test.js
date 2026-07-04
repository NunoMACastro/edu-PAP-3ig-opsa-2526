// apps/api/tests/contracts/mf8-health.contract.test.js

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
    buildHealthPayload,
    buildHealthRoutes,
} from "../../src/modules/ops/healthRoutes.js";

/**
 * Confirma se o router expõe a rota esperada.
 *
 * @param router - Router Express a inspecionar.
 * @param {string} method - Método HTTP esperado.
 * @param {string} path - Caminho esperado dentro do router.
 * @returns {boolean} Verdadeiro quando a rota existe.
 */
function hasRoute(router, method, path) {
    return router.stack.some(
        (layer) => layer.route?.path === path && layer.route.methods[method],
    );
}

/**
 * Executa diretamente o handler de uma rota Express simples.
 *
 * @param router - Router Express a testar.
 * @param {string} method - Método HTTP a procurar.
 * @param {string} path - Caminho dentro do router.
 * @returns {Promise<{ statusCode: number, body: Record<string, string> | undefined }>} Resposta observada.
 */
async function requestRouter(router, method, path) {
    const layer = router.stack.find(
        (item) => item.route?.path === path && item.route.methods[method],
    );
    assert.ok(layer, `Rota ${method.toUpperCase()} ${path} em falta`);

    const response = {
        statusCode: 0,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };

    // O teste chama o handler sem abrir porta HTTP, mantendo a suite rápida e determinística.
    await layer.route.stack[0].handle({}, response);

    return response;
}

test("MF8 health: router expõe GET /", () => {
    const router = buildHealthRoutes({ version: "1.0.0", environment: "test" });

    assert.equal(hasRoute(router, "get", "/"), true);
});

test("MF8 health: servidor monta GET /api/health antes dos routers autenticados", () => {
    const serverSource = readFileSync(
        new URL("../../src/server.js", import.meta.url),
        "utf8",
    );

    const healthImportIndex = serverSource.search(
        /import\s+\{\s*buildHealthRoutes\s*\}\s+from\s+"\.\/modules\/ops\/healthRoutes\.js";/,
    );
    const healthMountIndex = serverSource.search(
        /app\.use\(\s*"\/api\/health",\s*buildHealthRoutes\(\{/s,
    );
    const authMountIndex = serverSource.indexOf('app.use("/api/auth"');

    // Esta prova textual evita abrir portas locais e falha se a montagem pública for esquecida.
    assert.notEqual(healthImportIndex, -1, "server.js deve importar buildHealthRoutes");
    assert.notEqual(healthMountIndex, -1, "server.js deve montar /api/health");
    assert.notEqual(authMountIndex, -1, "server.js deve manter /api/auth");
    assert.equal(healthMountIndex < authMountIndex, true);
    assert.match(
        serverSource,
        /buildHealthRoutes\(\{\s*version: API_VERSION,\s*environment: apiEnv\.nodeEnv,\s*\}\)/s,
    );
});

test("MF8 health: GET / devolve payload público seguro", async () => {
    const router = buildHealthRoutes({ version: "1.0.0", environment: "test" });
    const response = await requestRouter(router, "get", "/");

    assert.equal(response.statusCode, 200);
    assert.ok(response.body);
    assert.equal(response.body.status, "ok");
    assert.equal(response.body.service, "opsa-api");
    assert.equal(response.body.version, "1.0.0");
    assert.equal(response.body.environment, "test");
    assert.match(response.body.checkedAt, /^\d{4}-\d{2}-\d{2}T/);

    // A lista fechada impede que detalhes internos entrem por engano na resposta pública.
    assert.deepEqual(Object.keys(response.body).sort(), [
        "checkedAt",
        "environment",
        "service",
        "status",
        "version",
    ]);
});

test("MF8 health: payload usa relógio controlado nos testes", () => {
    const payload = buildHealthPayload(
        { version: "1.0.0", environment: "test" },
        new Date("2026-07-01T10:00:00.000Z"),
    );

    assert.equal(payload.checkedAt, "2026-07-01T10:00:00.000Z");
});

test("MF8 health: falha sem versão configurada", () => {
    assert.throws(
        () => buildHealthPayload({ version: "", environment: "test" }),
        /version é obrigatório/,
    );
});

test("MF8 health: falha com ambiente desconhecido", () => {
    assert.throws(
        () => buildHealthPayload({ version: "1.0.0", environment: "staging" }),
        /Ambiente de health-check inválido/,
    );
});