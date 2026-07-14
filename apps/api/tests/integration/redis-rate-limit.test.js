/**
 * @file Prova de rate limiting partilhado por duas instâncias Redis reais.
 *
 * A ausência de REDIS_URL/RATE_LIMIT_HMAC_KEY falha o teste de propósito; um
 * gate funcional nunca pode transformar falta de Redis em PASS.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createClient } from "redis";
import { createRedisRateLimiter } from "../../src/modules/auth/redisRateLimit.js";

test("duas instâncias partilham contador, TTL e reset sem guardar IP em claro", async () => {
    const redisUrl = String(process.env.REDIS_URL ?? "").trim();
    const hmacKey = String(process.env.RATE_LIMIT_HMAC_KEY ?? "").trim();
    if (!redisUrl || !hmacKey) {
        throw new Error(
            "REDIS_URL e RATE_LIMIT_HMAC_KEY são obrigatórios para a integração Redis.",
        );
    }
    const prefix = `${process.env.REDIS_KEY_PREFIX ?? "opsa:test"}:integration:${randomUUID()}`;
    const firstClient = createClient({ url: redisUrl });
    const secondClient = createClient({ url: redisUrl });
    try {
        await Promise.all([firstClient.connect(), secondClient.connect()]);
        const firstInstance = createRedisRateLimiter({
            client: firstClient,
            hmacKey,
            prefix,
        });
        const secondInstance = createRedisRateLimiter({
            client: secondClient,
            hmacKey,
            prefix,
        });
        const policy = { limit: 2, windowMs: 30_000 };
        const sensitiveKey = "203.0.113.45|person@example.test";

        assert.equal(
            (await firstInstance.consume("LOGIN_ACCOUNT", sensitiveKey, policy)).count,
            1,
        );
        assert.equal(
            (await secondInstance.consume("LOGIN_ACCOUNT", sensitiveKey, policy)).count,
            2,
        );
        await assert.rejects(
            () => firstInstance.consume("LOGIN_ACCOUNT", sensitiveKey, policy),
            { status: 429, code: "RATE_LIMITED" },
        );

        const matchingKeys = [];
        for await (const keyOrKeys of firstClient.scanIterator({
            MATCH: `${prefix}:*`,
            COUNT: 10,
        })) {
            matchingKeys.push(
                ...(Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]),
            );
        }
        assert.equal(matchingKeys.length, 1);
        assert.equal(matchingKeys[0].includes("203.0.113.45"), false);
        assert.equal(matchingKeys[0].includes("person@example.test"), false);

        await secondInstance.reset("LOGIN_ACCOUNT", sensitiveKey);
        assert.equal(
            (await firstInstance.consume("LOGIN_ACCOUNT", sensitiveKey, policy)).count,
            1,
        );
        await firstInstance.reset("LOGIN_ACCOUNT", sensitiveKey);
    } finally {
        await Promise.allSettled([
            firstClient.isOpen ? firstClient.quit() : Promise.resolve(),
            secondClient.isOpen ? secondClient.quit() : Promise.resolve(),
        ]);
    }
});
