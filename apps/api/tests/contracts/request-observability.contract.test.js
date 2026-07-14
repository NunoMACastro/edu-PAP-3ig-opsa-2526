/**
 * @file Contrato do evento terminal de observabilidade HTTP.
 */

import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import test from "node:test";
import express from "express";
import request from "supertest";
import {
    createRequestObservability,
    logUnhandledRequestError,
} from "../../src/modules/ops/requestObservability.js";
import { enforceHttps } from "../../src/modules/security/transportSecurity.js";

const SERVER_SOURCE = readFileSync(
    new URL("../../src/server.js", import.meta.url),
    "utf8",
);

/**
 * Cria doubles Node/Express suficientes para exercitar o contrato público.
 *
 * @param {number[]} times - Leituras determinísticas do relógio.
 * @returns {{ events: object[], req: EventEmitter, res: EventEmitter, middleware: Function }} Fixture.
 */
function createFixture(times) {
    const events = [];
    const req = Object.assign(new EventEmitter(), {
        method: "POST",
        baseUrl: "/api/tasks",
        route: { path: "/:id" },
        get: () => "not-a-valid-request-id",
    });
    const res = new EventEmitter();
    res.statusCode = 202;
    res.headersSent = true;
    res.set = () => {};
    const middleware = createRequestObservability({
        write: (event) => events.push(event),
        clock: () => times.shift(),
    });
    return { events, req, res, middleware };
}

test("OPSA-E2E-P2-016: contrato terminal é único perante eventos concorrentes", () => {
    const { events, req, res, middleware } = createFixture([100, 108]);
    middleware(req, res, () => {});

    req.emit("aborted");
    res.emit("close");
    res.emit("finish");
    logUnhandledRequestError(new Error("segredo tardio"), req);

    assert.equal(events.length, 1);
    assert.equal(events[0].event, "http.request.aborted");
    assert.deepEqual(Object.keys(events[0].context).sort(), [
        "durationMs",
        "method",
        "outcome",
        "requestId",
        "routeTemplate",
        "statusCode",
    ]);
    assert.match(events[0].context.requestId, /^[0-9a-f-]{36}$/i);
    assert.equal(events[0].context.routeTemplate, "/api/tasks/:id");
    assert.equal(events[0].context.statusCode, 202);
});

test("OPSA-E2E-P2-016: contrato de erro contém classificação e não mensagem", () => {
    const { events, req, res, middleware } = createFixture([200, 205]);
    res.statusCode = 500;
    middleware(req, res, () => {});

    logUnhandledRequestError(new TypeError("token-super-secreto"), req);
    res.emit("finish");

    const terminal = events.at(-1);
    assert.equal(terminal.event, "http.request.error");
    assert.equal(terminal.level, "error");
    assert.equal(terminal.context.errorType, "TypeError");
    assert.equal(terminal.context.durationMs, 5);
    assert.equal(terminal.context.statusCode, 500);
    assert.equal(JSON.stringify(terminal).includes("token-super-secreto"), false);
});

test("OPSA-E2E-P2-016: rejeição HTTPS precoce mantém request ID e terminal único", async () => {
    const events = [];
    const app = express();
    app.set("trust proxy", false);
    app.use(createRequestObservability({ write: (event) => events.push(event) }));
    app.use(enforceHttps({ isProduction: true }));

    const response = await request(app).get("/api/auth/me").expect(403);

    assert.match(response.headers["x-request-id"], /^[0-9a-f-]{36}$/i);
    assert.equal(events.length, 1);
    assert.equal(events[0].event, "http.request.finish");
    assert.equal(events[0].context.statusCode, 403);
    assert.equal(events[0].context.routeTemplate, "unmatched");
});

test("OPSA-E2E-P2-016: composição real monta observabilidade antes do transporte", () => {
    const observabilityIndex = SERVER_SOURCE.indexOf(
        "app.use(createRequestObservability())",
    );
    const httpsIndex = SERVER_SOURCE.indexOf(
        "app.use(enforceHttps({ isProduction }))",
    );
    const hstsIndex = SERVER_SOURCE.indexOf(
        "app.use(applyStrictTransportSecurity({ isProduction }))",
    );

    assert.ok(observabilityIndex >= 0);
    assert.ok(httpsIndex > observabilityIndex);
    assert.ok(hstsIndex > httpsIndex);
});
