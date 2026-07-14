/**
 * @file Testes de request ID e logs sem dados do pedido.
 */

import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";
import {
    createRequestObservability,
    logUnhandledRequestError,
    resolveRequestId,
} from "../../src/modules/ops/requestObservability.js";

test("request ID externo só é aceite quando é UUID", () => {
    const valid = "123e4567-e89b-42d3-a456-426614174000";
    assert.equal(resolveRequestId(valid), valid);
    assert.match(resolveRequestId("<script>"), /^[0-9a-f-]{36}$/i);
});

test("middleware regista um único terminal com route template e sem URL/body", () => {
    const events = [];
    const times = [10, 17];
    const middleware = createRequestObservability({
        write: (event) => events.push(event),
        clock: () => times.shift(),
    });
    const req = Object.assign(new EventEmitter(), {
        method: "GET",
        originalUrl: "/api/customers/customer-secret?token=secret",
        body: { password: "secret" },
        baseUrl: "/api/customers",
        route: { path: "/:id" },
        get: () => undefined,
    });
    const res = new EventEmitter();
    res.statusCode = 200;
    res.set = (name, value) => {
        res[name] = value;
    };

    let nextCalled = false;
    middleware(req, res, () => {
        nextCalled = true;
    });
    res.emit("finish");
    res.emit("close");
    req.emit("aborted");
    logUnhandledRequestError(new Error("late secret"), req, (event) => events.push(event));

    assert.equal(nextCalled, true);
    assert.equal(events.length, 1);
    assert.equal(events[0].event, "http.request.finish");
    assert.equal(events[0].context.outcome, "finished");
    assert.equal(events[0].context.routeTemplate, "/api/customers/:id");
    assert.equal(events[0].context.durationMs, 7);
    const serialized = JSON.stringify(events);
    assert.equal(serialized.includes("customer-secret"), false);
    assert.equal(serialized.includes("password"), false);
});

test("OPSA-E2E-P2-016: pedido abortado emite um único terminal redigido", () => {
    const events = [];
    const times = [20, 29];
    const middleware = createRequestObservability({
        write: (event) => events.push(event),
        clock: () => times.shift(),
    });
    const req = Object.assign(new EventEmitter(), {
        method: "POST",
        originalUrl: "/api/imports/business-data?token=secret",
        body: { password: "secret" },
        baseUrl: "/api/imports",
        route: { path: "/business-data" },
        get: () => undefined,
    });
    const res = new EventEmitter();
    res.statusCode = 200;
    res.headersSent = false;
    res.set = () => {};

    middleware(req, res, () => {});
    req.emit("aborted");
    res.emit("close");
    res.emit("finish");

    assert.equal(events.length, 1);
    assert.equal(events[0].event, "http.request.aborted");
    assert.equal(events[0].level, "warn");
    assert.deepEqual(events[0].context, {
        requestId: req.requestId,
        method: "POST",
        routeTemplate: "/api/imports/business-data",
        durationMs: 9,
        outcome: "aborted",
    });
    const serialized = JSON.stringify(events);
    assert.equal(serialized.includes("token=secret"), false);
    assert.equal(serialized.includes("password"), false);
});

test("OPSA-E2E-P2-016: close prematuro e finish posterior não duplicam terminal", () => {
    const events = [];
    const times = [40, 43];
    const middleware = createRequestObservability({
        write: (event) => events.push(event),
        clock: () => times.shift(),
    });
    const req = Object.assign(new EventEmitter(), {
        method: "GET",
        baseUrl: "/api/customers",
        route: { path: "/" },
        get: () => undefined,
    });
    const res = new EventEmitter();
    res.statusCode = 200;
    res.headersSent = true;
    res.set = () => {};

    middleware(req, res, () => {});
    res.emit("close");
    res.emit("finish");

    assert.equal(events.length, 1);
    assert.equal(events[0].event, "http.request.close");
    assert.equal(events[0].context.statusCode, 200);
    assert.equal(events[0].context.durationMs, 3);
});

test("OPSA-E2E-P2-016: error boundary vence finish e não expõe a mensagem", () => {
    const events = [];
    const times = [50, 56];
    const middleware = createRequestObservability({
        write: (event) => events.push(event),
        clock: () => times.shift(),
    });
    const req = Object.assign(new EventEmitter(), {
        method: "POST",
        baseUrl: "/api/auth",
        route: { path: "/login" },
        get: () => undefined,
    });
    const res = new EventEmitter();
    res.statusCode = 500;
    res.headersSent = false;
    res.set = () => {};

    middleware(req, res, () => {});
    const error = new Error("password=secret host=private");
    error.name = "password=secret";
    logUnhandledRequestError(error, req, (event) => events.push(event));
    res.emit("finish");
    res.emit("close");

    assert.equal(events.length, 1);
    assert.equal(events[0].event, "http.request.error");
    assert.equal(events[0].context.statusCode, 500);
    assert.equal(events[0].context.durationMs, 6);
    assert.equal(events[0].context.errorType, "UnknownError");
    assert.equal(JSON.stringify(events).includes("private"), false);
    assert.equal(JSON.stringify(events).includes("password=secret"), false);
});

test("OPSA-E2E-P2-016: nome de erro plausível mas não aprovado fica redigido", () => {
    const events = [];
    const middleware = createRequestObservability({
        write: (event) => events.push(event),
        clock: () => 10,
    });
    const req = Object.assign(new EventEmitter(), {
        method: "GET",
        baseUrl: "/api/auth",
        route: { path: "/me" },
        get: () => undefined,
    });
    const res = new EventEmitter();
    res.statusCode = 500;
    res.headersSent = false;
    res.set = () => {};

    middleware(req, res, () => {});
    const error = new Error("não guardar este segredo");
    error.name = "TokenABC123";
    logUnhandledRequestError(error, req, (event) => events.push(event));

    assert.equal(events.at(-1).context.errorType, "UnknownError");
    assert.equal(JSON.stringify(events).includes("TokenABC123"), false);
});

test("OPSA-E2E-P2-016: falha do writer não interrompe o pedido", () => {
    const middleware = createRequestObservability({
        write: () => {
            throw new Error("logger offline");
        },
        clock: () => 10,
    });
    const req = Object.assign(new EventEmitter(), {
        method: "GET",
        get: () => undefined,
    });
    const res = new EventEmitter();
    res.statusCode = 204;
    res.set = () => {};
    let nextCalls = 0;

    assert.doesNotThrow(() =>
        middleware(req, res, () => {
            nextCalls += 1;
        }),
    );
    assert.doesNotThrow(() => res.emit("finish"));
    assert.equal(nextCalls, 1);
});

test("erro não tratado é redigido para tipo e request ID", () => {
    const events = [];
    logUnhandledRequestError(
        new Error("password=secret host=private"),
        {
            requestId: "123e4567-e89b-42d3-a456-426614174000",
            method: "POST",
            baseUrl: "/api/auth",
            route: { path: "/login" },
        },
        (event) => events.push(event),
    );
    assert.equal(events[0].context.errorType, "Error");
    assert.equal(events[0].context.durationMs, null);
    assert.equal(JSON.stringify(events).includes("private"), false);
});
