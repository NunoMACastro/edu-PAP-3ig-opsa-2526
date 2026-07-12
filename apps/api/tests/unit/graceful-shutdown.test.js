/**
 * @file Testes da drenagem HTTP e fallback forçado do shutdown.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { closeHttpServer } from "../../src/server.js";

test("shutdown fecha ligações idle e resolve após drenagem normal", async () => {
    const calls = [];
    const server = {
        listening: true,
        close(callback) {
            calls.push("close");
            setImmediate(() => callback());
        },
        closeIdleConnections() {
            calls.push("idle");
        },
        closeAllConnections() {
            calls.push("all");
        },
    };

    assert.deepEqual(await closeHttpServer(server, { timeoutMs: 50 }), {
        forced: false,
    });
    assert.deepEqual(calls, ["close", "idle"]);
});

test("shutdown força ligações remanescentes apenas depois do timeout", async () => {
    const calls = [];
    const server = {
        listening: true,
        close() {
            calls.push("close");
        },
        closeIdleConnections() {
            calls.push("idle");
        },
        closeAllConnections() {
            calls.push("all");
        },
    };

    assert.deepEqual(await closeHttpServer(server, { timeoutMs: 5 }), {
        forced: true,
    });
    assert.deepEqual(calls, ["close", "idle", "all"]);
});
