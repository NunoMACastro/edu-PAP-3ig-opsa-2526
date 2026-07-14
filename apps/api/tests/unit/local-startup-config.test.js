/**
 * @file Contratos da configuração e do arranque da demo académica local.
 *
 * Estes testes exercitam o comportamento sem abrir sockets nem contactar
 * PostgreSQL, Redis, S3, SMTP ou OpenAI.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import http from "node:http";
import test from "node:test";
import { parseEnv } from "node:util";

import { assertApiStartupEnv, loadApiEnv } from "../../src/config/env.js";
import { createObjectStorage } from "../../src/modules/storage/objectStorage.js";

const DEMO_ENV = Object.freeze({
    NODE_ENV: "development",
    DATABASE_URL: "postgresql://opsa:local@127.0.0.1:5432/opsa_dev",
    EMAIL_OUTBOX_ENCRYPTION_KEY:
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    DEMO_EMAIL_INBOX_ACCESS_KEY: "opsa-demo-2026",
    AI_CHAT_ENABLED: "true",
    AI_PROVIDER_MODE: "disabled",
    AI_CHAT_ENCRYPTION_KEY:
        "AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI=",
});

const PRODUCTION_ENV = Object.freeze({
    NODE_ENV: "production",
    PORT: "443",
    APP_BASE_URL: "https://opsa.example.test",
    DATABASE_URL: "postgresql://opsa:secret@db.example.test:5432/opsa",
    REDIS_URL: "rediss://redis.example.test:6379",
    REDIS_KEY_PREFIX: "opsa:production",
    RATE_LIMIT_HMAC_KEY: "a-production-hmac-key-with-more-than-32-bytes",
    EMAIL_OUTBOX_ENCRYPTION_KEY:
        "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=",
    AI_CHAT_ENABLED: "false",
    SMTP_HOST: "smtp.example.test",
    SMTP_REQUIRE_TLS: "true",
    EMAIL_FROM: "OPSA <no-reply@example.test>",
});

test("configuração mínima da demo mantém chat determinístico ativo", () => {
    const config = loadApiEnv({ ...DEMO_ENV });
    assert.doesNotThrow(() => assertApiStartupEnv(config));

    assert.equal(config.nodeEnv, "development");
    assert.equal(config.port, 3000);
    assert.equal(config.databaseUrlConfigured, true);
    assert.deepEqual(config.providers, {
        redis: "local",
        storage: "local",
        email: "simulated",
    });
    assert.equal(config.ai.chatEnabled, true);
    assert.equal(config.ai.providerMode, "disabled");
    assert.equal(config.ai.openAiApiKey, undefined);
    assert.equal(config.demoEmailInbox.enabled, true);
    assert.deepEqual(config.saft, {
        enabled: false,
        validationMode: "external",
    });
});

test("arranque da API rejeita demo sem PostgreSQL ou chave da outbox", () => {
    const { DATABASE_URL: _databaseUrl, ...withoutDatabase } = DEMO_ENV;
    assert.throws(
        () => assertApiStartupEnv(loadApiEnv(withoutDatabase)),
        /DATABASE_URL/,
    );

    const { EMAIL_OUTBOX_ENCRYPTION_KEY: _outboxKey, ...withoutOutboxKey } = DEMO_ENV;
    assert.throws(
        () => assertApiStartupEnv(loadApiEnv(withoutOutboxKey)),
        /EMAIL_OUTBOX_ENCRYPTION_KEY/,
    );
});

test("production-like incompleto falha e bloqueia chaves demonstrativas", () => {
    const { REDIS_URL: _redisUrl, ...withoutRedis } = PRODUCTION_ENV;
    assert.throws(() => loadApiEnv(withoutRedis), /REDIS_URL/);

    assert.throws(
        () =>
            loadApiEnv({
                ...PRODUCTION_ENV,
                EMAIL_OUTBOX_ENCRYPTION_KEY:
                    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
            }),
        /demonstrativas/,
    );
    assert.equal(loadApiEnv({ ...PRODUCTION_ENV }).isProduction, true);
    assert.throws(
        () => loadApiEnv({
            ...PRODUCTION_ENV,
            DATABASE_URL:
                "postgresql://opsa_app:opsa-local-postgres-2026@127.0.0.1:5433/opsa_dev",
        }),
        /académicas do Docker Compose/,
    );
    assert.doesNotThrow(() => loadApiEnv({
        ...PRODUCTION_ENV,
        DATABASE_URL: "postgresql://production_app:private@127.0.0.1:5432/opsa",
    }));
    for (const providers of [
        { REDIS_PROVIDER: "local" },
        { STORAGE_PROVIDER: "local" },
        { EMAIL_PROVIDER: "simulated" },
    ]) {
        assert.throws(
            () => loadApiEnv({ ...PRODUCTION_ENV, ...providers }),
            /Produção exige/,
        );
    }
});

test("booleanos, portas e URLs inválidos continuam rejeitados", () => {
    for (const [override, pattern] of [
        [{ AI_CHAT_ENABLED: "yes" }, /booleana/],
        [{ PORT: "3000x" }, /PORT/],
        [{ SMTP_PORT: "1025x" }, /SMTP_PORT/],
        [{ DATABASE_URL: "https://db.example.test/opsa" }, /DATABASE_URL/],
        [{ APP_BASE_URL: "ftp://localhost:5173" }, /APP_BASE_URL/],
        [{ REDIS_URL: "http://127.0.0.1:6379" }, /REDIS_URL/],
    ]) {
        assert.throws(() => loadApiEnv({ ...DEMO_ENV, ...override }), pattern);
    }
});

test("inbox demo exige provider simulado, código suficiente e nunca existe em produção", () => {
    assert.throws(
        () => loadApiEnv({
            ...DEMO_ENV,
            DEMO_EMAIL_INBOX_ACCESS_KEY: "curta",
        }),
        /12 caracteres/,
    );
    assert.throws(
        () => loadApiEnv({
            ...DEMO_ENV,
            EMAIL_PROVIDER: "smtp",
        }),
        /EMAIL_PROVIDER=simulated/,
    );
    assert.throws(
        () => loadApiEnv({
            ...PRODUCTION_ENV,
            DEMO_EMAIL_INBOX_ACCESS_KEY: "production-forbidden",
        }),
        /não é permitida em produção/,
    );
    assert.equal(
        loadApiEnv({
            ...DEMO_ENV,
            DEMO_EMAIL_INBOX_ACCESS_KEY: undefined,
        }).demoEmailInbox.enabled,
        false,
    );
});

test("SAF-T académico é configuração exclusiva de não produção", () => {
    const config = loadApiEnv({
        ...DEMO_ENV,
        SAFT_EXPORT_ENABLED: "true",
        SAFT_VALIDATION_MODE: "academic",
    });
    assert.deepEqual(config.saft, {
        enabled: true,
        validationMode: "academic",
    });
    assert.throws(
        () => loadApiEnv({
            ...PRODUCTION_ENV,
            SAFT_EXPORT_ENABLED: "true",
            SAFT_VALIDATION_MODE: "academic",
        }),
        /não é permitido em produção/,
    );
    assert.throws(
        () => loadApiEnv({ ...DEMO_ENV, SAFT_VALIDATION_MODE: "inventado" }),
        /academic ou external/,
    );
});

test(".env.example seleciona chat local e não ativa providers remotos", async () => {
    const source = await readFile(new URL("../../.env.example", import.meta.url), "utf8");
    const example = parseEnv(source);
    const config = loadApiEnv(example);
    const storage = createObjectStorage(example);

    assert.equal(config.ai.chatEnabled, true);
    assert.equal(config.ai.providerMode, "disabled");
    assert.equal(config.ai.openAiApiKey, undefined);
    assert.equal(config.demoEmailInbox.enabled, true);
    assert.deepEqual(config.saft, {
        enabled: true,
        validationMode: "academic",
    });
    assert.deepEqual(config.providers, {
        redis: "local",
        storage: "local",
        email: "simulated",
    });
    assert.equal(storage.provider, "LOCAL");
    assert.equal("REDIS_URL" in example, false);
    assert.equal("SMTP_HOST" in example, false);
    assert.equal("S3_ENDPOINT" in example, false);
});

test("importar server.js não abre listener", async () => {
    const originalListen = http.Server.prototype.listen;
    const signalListenersBefore = {
        SIGINT: process.listenerCount("SIGINT"),
        SIGTERM: process.listenerCount("SIGTERM"),
    };
    let listenCalls = 0;
    http.Server.prototype.listen = function blockedListen() {
        listenCalls += 1;
        throw new Error("O import tentou abrir um socket.");
    };

    try {
        await import(`../../src/server.js?import-smoke=${Date.now()}`);
    } finally {
        http.Server.prototype.listen = originalListen;
    }
    assert.equal(listenCalls, 0);
    assert.deepEqual(
        {
            SIGINT: process.listenerCount("SIGINT"),
            SIGTERM: process.listenerCount("SIGTERM"),
        },
        signalListenersBefore,
    );
});

test("erro de arranque é acionável e nunca inclui valores sensíveis", async () => {
    const { formatStartupFailure } = await import("../../src/server.js");
    const secret = "postgresql://user:password@private.example.test:5432/opsa";
    const error = new Error(`connection refused: ${secret}`);
    Object.defineProperty(error, "startupStage", { value: "postgresql" });

    const failure = formatStartupFailure(error);
    const serialized = JSON.stringify(failure);
    assert.equal(failure.code, "POSTGRESQL_UNAVAILABLE");
    assert.match(failure.message, /DATABASE_URL/);
    assert.equal(serialized.includes(secret), false);
    assert.equal(serialized.includes("password"), false);
});

test("startServer demo ignora cliente Redis e preserva stop idempotente", async () => {
    const { startServer } = await import("../../src/server.js");
    const calls = { connectDb: 0, disconnectDb: 0, connectRedis: 0, quitRedis: 0, close: 0 };
    const prisma = {
        async $connect() { calls.connectDb += 1; },
        async $disconnect() { calls.disconnectDb += 1; },
    };
    const redisClient = {
        isOpen: false,
        on() {},
        async connect() { calls.connectRedis += 1; this.isOpen = true; },
        async quit() { calls.quitRedis += 1; this.isOpen = false; },
        async ping() { return "PONG"; },
        async set() { return "OK"; },
        async get() { return null; },
        async del() { return 1; },
    };
    const server = {
        listening: true,
        close(callback) {
            calls.close += 1;
            this.listening = false;
            callback();
        },
        closeIdleConnections() {},
        closeAllConnections() {},
    };

    const resources = await startServer({
        env: { ...DEMO_ENV },
        logger: { error() {} },
        registerSignalHandlers: false,
        runtime: {
            prisma,
            redisClient,
            objectStorage: {
                async checkHealth() { return true; },
                async checkReadiness() { return true; },
            },
            rateLimiter: { async consume() {}, async reset() {} },
            emailOutbox: { async enqueue() {} },
            async listen() { return server; },
        },
    });

    await resources.stop();
    await resources.stop();
    assert.equal(resources.redisClient, null);
    assert.deepEqual(calls, {
        connectDb: 1,
        disconnectDb: 1,
        connectRedis: 0,
        quitRedis: 0,
        close: 1,
    });
});

test("scripts antigos mantêm-se e proxy Vite coincide com o guia", async () => {
    const manifest = JSON.parse(
        await readFile(new URL("../../package.json", import.meta.url), "utf8"),
    );
    const viteConfig = await readFile(
        new URL("../../../web/vite.config.ts", import.meta.url),
        "utf8",
    );

    assert.equal(manifest.scripts.dev, "node src/server.js");
    assert.equal(manifest.scripts["demo:check"], "npm run config:check");
    assert.equal(
        manifest.scripts["health:deep-check"],
        "node scripts/run-readiness-deep-diagnostic.mjs",
    );
    assert.equal(manifest.scripts["db:seed:demo"], "node prisma/seed.js --profile demo");
    assert.match(
        viteConfig,
        /VITE_API_PROXY_TARGET \?\? "http:\/\/127\.0\.0\.1:3000"/,
    );
    assert.match(viteConfig, /"\/api": apiProxyTarget/);
});
