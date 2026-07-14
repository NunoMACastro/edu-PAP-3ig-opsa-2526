/**
 * @file Contrato Supertest do bootstrap sem `listen` no import.
 */

import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../../src/server.js";

test("createApp é importável, desconfia de proxies por omissão e serve health", async () => {
    const app = createApp({
        prisma: {
            $queryRaw: async () => [{ ready: 1 }],
        },
        apiEnv: {
            nodeEnv: "test",
            isProduction: false,
            appBaseUrl: "http://localhost:5173",
            trustProxyHops: 0,
            redisKeyPrefix: "opsa:test",
        },
        rateLimiter: { consume: async () => {}, reset: async () => {} },
        emailOutbox: { enqueue: async () => ({}) },
        redisClient: {
            ping: async () => "PONG",
        },
        objectStorage: { checkReadiness: async () => true },
    });
    assert.equal(app.get("trust proxy"), false);
    const live = await request(app).get("/api/health/live").expect(200);
    assert.equal(live.body.status, "ok");
    const ready = await request(app).get("/api/health").expect(200);
    assert.equal(ready.body.status, "ready");
});
