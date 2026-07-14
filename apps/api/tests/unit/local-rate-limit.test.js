/**
 * @file Contrato fail-closed do rate limiter local de desenvolvimento/teste.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    createLocalRateLimiter,
    createRedisRateLimiter,
} from "../../src/modules/auth/redisRateLimit.js";

const HMAC_KEY = "local-test-key-with-at-least-thirty-two-bytes";

test("fallback local é proibido fora de development/test", () => {
    assert.throws(
        () =>
            createLocalRateLimiter({
                nodeEnv: "production",
                hmacKey: HMAC_KEY,
            }),
        /só é permitido/,
    );
});

test("fallback local guarda apenas chave HMAC, aplica TTL e permite reset", async () => {
    let timestamp = 1_000;
    const store = new Map();
    const limiter = createLocalRateLimiter({
        nodeEnv: "test",
        hmacKey: HMAC_KEY,
        prefix: "opsa:test",
        store,
        now: () => timestamp,
    });
    const policy = { limit: 2, windowMs: 500 };

    assert.deepEqual(await limiter.consume("login-account", "user@example.test", policy), {
        count: 1,
        remaining: 1,
    });
    await limiter.consume("login-account", "user@example.test", policy);
    await assert.rejects(
        limiter.consume("login-account", "user@example.test", policy),
        { code: "RATE_LIMITED" },
    );
    const serializedKeys = [...store.keys()].join("\n");
    assert.equal(serializedKeys.includes("user@example.test"), false);

    await limiter.reset("login-account", "user@example.test");
    assert.equal(store.size, 0);
    await limiter.consume("login-account", "user@example.test", policy);
    timestamp += 501;
    assert.deepEqual(await limiter.consume("login-account", "user@example.test", policy), {
        count: 1,
        remaining: 1,
    });
});

test("falha Redis em production-like não abre bypass de rate limit", async () => {
    const limiter = createRedisRateLimiter({
        hmacKey: HMAC_KEY,
        client: {
            async eval() {
                throw new Error("Redis indisponível");
            },
            async del() {
                throw new Error("Redis indisponível");
            },
        },
    });

    await assert.rejects(
        limiter.consume("login-account", "user@example.test", {
            limit: 5,
            windowMs: 60_000,
        }),
        { code: "RATE_LIMIT_UNAVAILABLE", status: 503 },
    );
    await assert.rejects(
        limiter.reset("login-account", "user@example.test"),
        { code: "RATE_LIMIT_UNAVAILABLE", status: 503 },
    );
});
