/**
 * @file Testes de contrato para o health-check publico RNF29.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildHealthRoutes } from "../../src/modules/ops/healthRoutes.js";
import { buildLiveness } from "../../src/modules/ops/healthService.js";

function healthDependencies(overrides = {}) {
    const redisState = new Map();
    return {
        version: "1.0.0",
        prisma: {
            $transaction: async (callback) =>
                callback({
                    $executeRaw: async () => 0,
                    $queryRaw: async () => [{
                        schemaUsage: true,
                        tableCount: 42,
                        canSelect: true,
                        canInsert: true,
                        canUpdate: true,
                        canDelete: true,
                    }],
                }),
        },
        redisKeyPrefix: "opsa:test",
        redisClient: {
            ping: async () => "PONG",
            set: async (key, value) => {
                redisState.set(key, value);
                return "OK";
            },
            get: async (key) => redisState.get(key),
            del: async (key) => (redisState.delete(key) ? 1 : 0),
        },
        objectStorage: { checkOperationalAccess: async () => true },
        ...overrides,
    };
}

/**
 * Confirma se um router Express expoe a rota esperada.
 *
 * @param router - Router Express a inspecionar.
 * @param {string} method - Metodo HTTP esperado.
 * @param {string} path - Caminho esperado dentro do router.
 * @returns {boolean} `true` quando a rota existe.
 */
function hasRoute(router, method, path) {
    return router.stack.some(
        (layer) => layer.route?.path === path && layer.route.methods[method],
    );
}

/**
 * Executa diretamente o handler de uma rota Express simples.
 *
 * @param router - Router Express a testar sem abrir porta local.
 * @param {string} method - Metodo HTTP esperado.
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

    // A suite evita abrir portas HTTP, mantendo o contrato rapido e deterministico.
    await layer.route.stack[0].handle({}, response);

    return response;
}

test("BK-MF8-02: router expoe live, ready e alias de readiness", () => {
    const router = buildHealthRoutes(healthDependencies());

    assert.equal(hasRoute(router, "get", "/"), true);
    assert.equal(hasRoute(router, "get", "/live"), true);
    assert.equal(hasRoute(router, "get", "/ready"), true);
});

test("BK-MF8-02: servidor monta GET /api/health antes dos routers autenticados", () => {
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

    // Esta prova textual confirma a montagem publica sem arrancar a API durante a suite.
    assert.notEqual(healthImportIndex, -1, "server.js deve importar buildHealthRoutes");
    assert.notEqual(healthMountIndex, -1, "server.js deve montar /api/health");
    assert.notEqual(authMountIndex, -1, "server.js deve manter /api/auth");
    assert.equal(healthMountIndex < authMountIndex, true);
    assert.match(
        serverSource,
        /buildHealthRoutes\(\{\s*version: API_VERSION,\s*prisma,\s*redisClient,\s*redisKeyPrefix: apiEnv\.redisKeyPrefix,\s*objectStorage,\s*aiConfig: apiEnv\.ai,\s*\}\)/s,
    );
});

test("BK-MF8-02: GET /live devolve payload publico sem dependencias", async () => {
    const router = buildHealthRoutes(healthDependencies());
    const response = await requestRouter(router, "get", "/live");

    assert.equal(response.statusCode, 200);
    assert.ok(response.body);
    assert.equal(response.body.status, "ok");
    assert.equal(response.body.service, "opsa-api");
    assert.equal(response.body.version, "1.0.0");
    assert.match(response.body.checkedAt, /^\d{4}-\d{2}-\d{2}T/);

    // A lista fechada protege contra exposicao acidental de configuracao interna.
    assert.deepEqual(Object.keys(response.body).sort(), [
        "checkedAt",
        "service",
        "status",
        "version",
    ]);
});

test("BK-MF8-02: liveness usa relogio controlado nos testes", () => {
    const payload = buildLiveness({
        version: "1.0.0",
        now: new Date("2026-07-01T10:00:00.000Z"),
    });

    assert.equal(payload.checkedAt, "2026-07-01T10:00:00.000Z");
});

test("BK-MF8-02: falha sem versao configurada", () => {
    assert.throws(() => buildLiveness({ version: "" }), /liveness inválida/);
});

test("BK-MF8-02: readiness devolve 503 quando Redis falha", async () => {
    const state = new Map();
    const router = buildHealthRoutes(
        healthDependencies({
            redisClient: {
                ping: async () => {
                    throw new Error("offline");
                },
                set: async (key, value) => {
                    state.set(key, value);
                    return "OK";
                },
                get: async (key) => state.get(key),
                del: async (key) => (state.delete(key) ? 1 : 0),
            },
        }),
    );
    const response = await requestRouter(router, "get", "/ready");
    assert.equal(response.statusCode, 503);
    assert.equal(response.body.status, "not_ready");
});

test("BK-MF8-02: router rejeita configuracao invalida antes de expor readiness", () => {
    assert.throws(() => buildHealthRoutes({ version: "1.0.0" }), /incompletas/);
});
