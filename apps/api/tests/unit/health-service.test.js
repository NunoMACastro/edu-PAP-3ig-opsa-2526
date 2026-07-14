/**
 * @file Testes unitários da separação entre health barato e diagnóstico profundo.
 */

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { runReadinessDeepDiagnostic } from "../../scripts/run-readiness-deep-diagnostic.mjs";
import {
    buildLiveness,
    checkReadiness,
    checkRedisOperationalAccess,
} from "../../src/modules/ops/healthService.js";
import { LocalObjectStorage } from "../../src/modules/storage/objectStorage.js";

const FULL_POSTGRES_PERMISSIONS = Object.freeze({
    schemaUsage: true,
    tableCount: 42,
    canSelect: true,
    canInsert: true,
    canUpdate: true,
    canDelete: true,
});

/**
 * Cria dependências saudáveis com interfaces normal e profunda separadas.
 *
 * @param {object} [overrides] - Substituições focadas por cenário.
 * @returns {object} Fixture de readiness determinística.
 */
function healthyDependencies(overrides = {}) {
    return {
        version: "1.0.0",
        now: new Date("2026-07-09T12:00:00.000Z"),
        timeoutMs: 50,
        isProduction: false,
        aiConfig: { providerMode: "disabled" },
        prisma: { $queryRaw: async () => [{ ready: 1 }] },
        redisClient: { ping: async () => "PONG" },
        objectStorage: { checkReadiness: async () => true },
        ...overrides,
    };
}

test("liveness não depende de PostgreSQL, Redis ou storage", () => {
    assert.deepEqual(
        buildLiveness({
            version: "1.0.0",
            now: new Date("2026-07-09T12:00:00.000Z"),
        }),
        {
            status: "ok",
            service: "opsa-api",
            version: "1.0.0",
            checkedAt: "2026-07-09T12:00:00.000Z",
        },
    );
});

test("readiness demo representa Redis local sem tentar PING", async () => {
    const result = await checkReadiness(
        healthyDependencies({ redisMode: "local", redisClient: null }),
    );

    assert.equal(result.httpStatus, 200);
    assert.equal(result.payload.status, "ready");
    assert.equal(result.payload.profile, "demo");
    assert.deepEqual(
        result.payload.dependencies.map(({ name, status, required }) => ({
            name,
            status,
            required,
        })),
        [
            { name: "postgresql", status: "up", required: true },
            { name: "redis", status: "local", required: false },
            { name: "storage", status: "up", required: true },
            { name: "openai", status: "disabled", required: false },
        ],
    );
});

test("readiness production-like falha quando uma dependência crítica está down", async () => {
    const result = await checkReadiness(
        healthyDependencies({
            isProduction: true,
            redisClient: {
                ping: async () => {
                    throw new Error("redis://user:password@private-host");
                },
            },
        }),
    );

    assert.equal(result.httpStatus, 503);
    assert.equal(result.payload.status, "not_ready");
    assert.equal(result.payload.profile, "production_like");
    assert.equal(JSON.stringify(result).includes("private-host"), false);
    assert.equal(
        result.payload.dependencies.find(({ name }) => name === "redis").status,
        "down",
    );
});

test("provider OpenAI opcional não altera o estado global", async () => {
    const result = await checkReadiness(
        healthyDependencies({ aiConfig: { providerMode: "openai" } }),
    );

    assert.equal(result.httpStatus, 200);
    assert.deepEqual(
        result.payload.dependencies.find(({ name }) => name === "openai"),
        {
            name: "openai",
            status: "optional",
            durationMs: 0,
            required: false,
        },
    );
});

test("timeout devolve 503, aborta o adapter e não fica pendurado", async () => {
    let observedSignal;
    const result = await checkReadiness(
        healthyDependencies({
            timeoutMs: 5,
            objectStorage: {
                checkReadiness: ({ signal }) => {
                    observedSignal = signal;
                    return new Promise((resolve, reject) => {
                        signal.addEventListener(
                            "abort",
                            () => reject(signal.reason),
                            { once: true },
                        );
                    });
                },
            },
        }),
    );

    assert.equal(result.httpStatus, 503);
    assert.equal(observedSignal.aborted, true);
    assert.equal(
        result.payload.dependencies.find(({ name }) => name === "storage").status,
        "down",
    );
});

test("readiness normal não usa transações, chaves Redis nem objetos", async () => {
    const calls = [];
    const result = await checkReadiness(
        healthyDependencies({
            prisma: {
                $queryRaw: async (query) => {
                    calls.push(String(query.strings?.join("")));
                    return [{ ready: 1 }];
                },
                $transaction: async () => {
                    throw new Error("readiness não deve abrir transação");
                },
            },
            redisClient: {
                ping: async () => {
                    calls.push("PING");
                    return "PONG";
                },
                set: async () => {
                    throw new Error("readiness não deve escrever chaves");
                },
                get: async () => {
                    throw new Error("readiness não deve ler chaves funcionais");
                },
                del: async () => {
                    throw new Error("readiness não deve apagar chaves");
                },
            },
            objectStorage: {
                checkReadiness: async () => {
                    calls.push("STORAGE_METADATA");
                    return true;
                },
                checkOperationalAccess: async () => {
                    throw new Error("readiness não deve criar objetos");
                },
            },
        }),
    );

    assert.equal(result.httpStatus, 200);
    assert.match(calls[0], /SELECT 1/);
    assert.deepEqual(calls.slice(1).sort(), ["PING", "STORAGE_METADATA"]);
});

test("payload público tem forma fechada e não contém configuração interna", async () => {
    const result = await checkReadiness(healthyDependencies());
    const serialized = JSON.stringify(result.payload);

    assert.deepEqual(Object.keys(result.payload).sort(), [
        "checkedAt",
        "dependencies",
        "profile",
        "service",
        "status",
        "version",
    ]);
    for (const forbidden of [
        "postgresql://",
        "redis://",
        "bucket",
        "database",
        "credential",
        "secret",
    ]) {
        assert.equal(serialized.toLowerCase().includes(forbidden), false);
    }
});

test("adapter local faz readiness read-only sobre a raiz já preparada", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-health-readonly-"));
    const storage = new LocalObjectStorage(root);
    try {
        assert.equal(await storage.checkReadiness(), true);
        assert.deepEqual(await storage.listObjects("health"), []);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("diagnóstico profundo explícito mantém provas mutáveis com cleanup", async () => {
    const redisState = new Map();
    const calls = [];
    const results = await runReadinessDeepDiagnostic({
        redisKeyPrefix: "opsa:test",
        prisma: {
            $transaction: async (callback) =>
                callback({
                    $executeRaw: async () => {
                        calls.push("postgres-read-only");
                        return 0;
                    },
                    $queryRaw: async () => [FULL_POSTGRES_PERMISSIONS],
                }),
        },
        redisClient: {
            ping: async () => "PONG",
            set: async (key, value) => {
                calls.push("redis-set");
                redisState.set(key, value);
                return "OK";
            },
            get: async (key) => redisState.get(key),
            del: async (key) => {
                calls.push("redis-del");
                return redisState.delete(key) ? 1 : 0;
            },
        },
        objectStorage: {
            checkOperationalAccess: async () => {
                calls.push("storage-operational");
                return true;
            },
        },
    });

    assert.deepEqual(results, [
        { name: "postgresql", status: "up" },
        { name: "redis", status: "up" },
        { name: "storage", status: "up" },
    ]);
    assert.deepEqual(calls, [
        "postgres-read-only",
        "redis-set",
        "redis-del",
        "storage-operational",
    ]);
    assert.equal(redisState.size, 0);
});

test("diagnóstico Redis agrega falha operacional e falha de cleanup", async () => {
    const operationError = new Error("GET failed");
    const cleanupError = new Error("DEL failed");
    await assert.rejects(
        checkRedisOperationalAccess(
            {
                ping: async () => "PONG",
                set: async () => "OK",
                get: async () => {
                    throw operationError;
                },
                del: async () => {
                    throw cleanupError;
                },
            },
            "opsa:test",
        ),
        (error) => {
            assert.ok(error instanceof AggregateError);
            assert.equal(error.cause, operationError);
            assert.deepEqual(error.errors, [operationError, cleanupError]);
            return true;
        },
    );
});
