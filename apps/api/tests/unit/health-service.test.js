/**
 * @file Testes positivos e negativos de liveness/readiness.
 */

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
    buildLiveness,
    checkRedisOperationalAccess,
    checkReadiness,
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

function healthyDependencies(overrides = {}) {
    const redisState = new Map();
    return {
        version: "1.0.0",
        now: new Date("2026-07-09T12:00:00.000Z"),
        timeoutMs: 50,
        prisma: {
            $transaction: async (callback) =>
                callback({
                    $executeRaw: async () => 0,
                    $queryRaw: async () => [FULL_POSTGRES_PERMISSIONS],
                }),
        },
        redisKeyPrefix: "opsa:test",
        redisClient: {
            ping: async () => "PONG",
            set: async (key, value) => {
                if (redisState.has(key)) return null;
                redisState.set(key, value);
                return "OK";
            },
            get: async (key) => redisState.get(key) ?? null,
            del: async (key) => (redisState.delete(key) ? 1 : 0),
        },
        objectStorage: { checkOperationalAccess: async () => true },
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

test("readiness devolve 200 apenas quando as três dependências estão ativas", async () => {
    const result = await checkReadiness(healthyDependencies());
    assert.equal(result.httpStatus, 200);
    assert.equal(result.payload.status, "ready");
    assert.deepEqual(
        result.payload.dependencies.map(({ name, status }) => ({ name, status })),
        [
            { name: "postgresql", status: "up" },
            { name: "redis", status: "up" },
            { name: "storage", status: "up" },
        ],
    );
});

test("readiness falha quando o chat está ativo sem chave de cifra", async () => {
    const result = await checkReadiness(healthyDependencies({ aiConfig: { chatEnabled: true, chatEncryptionKey: null } }));
    assert.equal(result.httpStatus, 503);
    assert.deepEqual(result.payload.dependencies.find(({ name }) => name === "ai_chat"), { name: "ai_chat", status: "down", durationMs: 0 });
});

test("readiness devolve 503 e não expõe a mensagem interna da falha", async () => {
    const state = new Map();
    const result = await checkReadiness(
        healthyDependencies({
            redisClient: {
                ping: async () => {
                    throw new Error("redis://user:password@private-host");
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
    assert.equal(result.httpStatus, 503);
    assert.equal(result.payload.status, "not_ready");
    assert.equal(JSON.stringify(result).includes("private-host"), false);
    assert.equal(
        result.payload.dependencies.find(({ name }) => name === "redis").status,
        "down",
    );
});

test("timeout de dependência também produz 503", async () => {
    const result = await checkReadiness(
        healthyDependencies({
            timeoutMs: 5,
            objectStorage: {
                checkOperationalAccess: () => new Promise(() => {}),
            },
        }),
    );
    assert.equal(result.httpStatus, 503);
    assert.equal(
        result.payload.dependencies.find(({ name }) => name === "storage").status,
        "down",
    );
});

test("readiness PostgreSQL usa transação read-only antes do probe de permissões", async () => {
    const calls = [];
    const result = await checkReadiness(
        healthyDependencies({
            prisma: {
                $transaction: async (callback) => {
                    calls.push("transaction");
                    return callback({
                        $executeRaw: async (query) => {
                            calls.push(String(query.strings?.join("")));
                            return 0;
                        },
                        $queryRaw: async (query) => {
                            calls.push(String(query.strings?.join("")));
                            return [FULL_POSTGRES_PERMISSIONS];
                        },
                    });
                },
            },
        }),
    );

    assert.equal(result.httpStatus, 200);
    assert.equal(calls.length, 3);
    assert.deepEqual(calls.slice(0, 2), [
        "transaction",
        "SET TRANSACTION READ ONLY",
    ]);
    assert.match(calls[2], /has_schema_privilege/);
    assert.match(calls[2], /has_table_privilege/);
    assert.match(calls[2], /_prisma_migrations/);
});

test("readiness PostgreSQL exige CRUD sobre todas as tabelas funcionais", async () => {
    const result = await checkReadiness(
        healthyDependencies({
            prisma: {
                $transaction: async (callback) => callback({
                    $executeRaw: async () => 0,
                    $queryRaw: async () => [{
                        ...FULL_POSTGRES_PERMISSIONS,
                        canDelete: false,
                    }],
                }),
            },
        }),
    );

    assert.equal(result.httpStatus, 503);
    const postgres = result.payload.dependencies.find(
        ({ name }) => name === "postgresql",
    );
    assert.deepEqual(Object.keys(postgres).sort(), ["durationMs", "name", "status"]);
    assert.equal(postgres.status, "down");
    assert.equal(JSON.stringify(result).includes("canDelete"), false);
});

test("readiness Redis remove a chave efémera quando a leitura falha", async () => {
    let storedKey;
    let deletedKey;
    const result = await checkReadiness(
        healthyDependencies({
            redisClient: {
                ping: async () => "PONG",
                set: async (key) => {
                    storedKey = key;
                    return "OK";
                },
                get: async () => {
                    throw new Error("falha privada de leitura");
                },
                del: async (key) => {
                    deletedKey = key;
                    return 1;
                },
            },
        }),
    );

    assert.equal(result.httpStatus, 503);
    assert.match(storedKey, /^opsa:test:health:/);
    assert.equal(deletedKey, storedKey);
    assert.equal(JSON.stringify(result).includes("falha privada"), false);
});

test("readiness devolve 503 quando o cleanup Redis não é confirmado", async () => {
    const result = await checkReadiness(
        healthyDependencies({
            redisClient: {
                ping: async () => "PONG",
                set: async () => "OK",
                get: async (_key) => null,
                del: async () => 0,
            },
        }),
    );

    assert.equal(result.httpStatus, 503);
    assert.equal(
        result.payload.dependencies.find(({ name }) => name === "redis").status,
        "down",
    );
});

test("readiness Redis agrega a falha operacional e a falha de cleanup", async () => {
    const operationError = new Error("GET failed");
    const cleanupError = new Error("DEL failed");
    let failure;
    try {
        await checkRedisOperationalAccess({
            ping: async () => "PONG",
            set: async () => "OK",
            get: async () => {
                throw operationError;
            },
            del: async () => {
                throw cleanupError;
            },
        }, "opsa:test");
    } catch (error) {
        failure = error;
    }

    assert.ok(failure instanceof AggregateError);
    assert.equal(failure.cause, operationError);
    assert.deepEqual(failure.errors, [operationError, cleanupError]);
});

test("timeout aborta adapter cancelável e aguarda o respetivo finally", async () => {
    let observedSignal;
    let cleanupRan = false;
    const result = await checkReadiness(
        healthyDependencies({
            timeoutMs: 5,
            objectStorage: {
                checkOperationalAccess: ({ signal }) => {
                    observedSignal = signal;
                    return new Promise((resolve, reject) => {
                        signal.addEventListener("abort", () => {
                            try {
                                cleanupRan = true;
                                reject(signal.reason);
                            } catch (error) {
                                reject(error);
                            }
                        }, { once: true });
                    });
                },
            },
        }),
    );

    assert.equal(result.httpStatus, 503);
    assert.equal(observedSignal.aborted, true);
    assert.equal(cleanupRan, true);
});

test("readiness devolve 503 quando DELETE do storage é no-op", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-health-storage-noop-"));
    const storage = new LocalObjectStorage(root);
    storage.deleteObject = async () => undefined;
    try {
        const result = await checkReadiness(
            healthyDependencies({ objectStorage: storage }),
        );
        assert.equal(result.httpStatus, 503);
        assert.equal(
            result.payload.dependencies.find(({ name }) => name === "storage").status,
            "down",
        );
        assert.equal((await storage.listObjects("health")).length, 1);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});
