/**
 * @file Contrato Supertest do bootstrap sem `listen` no import.
 */

import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../../src/server.js";

test("createApp é importável, desconfia de proxies por omissão e serve health", async () => {
    const redisState = new Map();
    const app = createApp({
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
            set: async (key, value) => {
                redisState.set(key, value);
                return "OK";
            },
            get: async (key) => redisState.get(key),
            del: async (key) => (redisState.delete(key) ? 1 : 0),
        },
        objectStorage: { checkOperationalAccess: async () => true },
    });
    assert.equal(app.get("trust proxy"), false);
    const live = await request(app).get("/api/health/live").expect(200);
    assert.equal(live.body.status, "ok");
    const ready = await request(app).get("/api/health").expect(200);
    assert.equal(ready.body.status, "ready");
});
