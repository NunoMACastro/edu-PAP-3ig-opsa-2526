/**
 * @file Contrato HTTP e RBAC da análise de uma transação concreta.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { buildAiRoutes } from "../../src/modules/ai/aiRoutes.js";

const SALE_ID = "33333333-3333-4333-8333-333333333333";
const PURCHASE_ID = "44444444-4444-4444-8444-444444444444";

function transactionRoute() {
    const router = buildAiRoutes({ prisma: {} });
    return router.stack.find((layer) => layer.route?.path === "/transaction-analysis" && layer.route.methods.post)?.route;
}

function postRoute(path) {
    const router = buildAiRoutes({ prisma: {} });
    return router.stack.find((layer) => layer.route?.path === path && layer.route.methods.post)?.route;
}

function namedGuard(route, name) {
    return route.stack.find((layer) => layer.handle.name === name)?.handle;
}

function responseDouble() {
    return {
        statusCode: null,
        body: null,
        status(value) { this.statusCode = value; return this; },
        json(value) { this.body = value; return this; },
    };
}

test("router expõe POST /transaction-analysis com guards e controller separados", () => {
    const route = transactionRoute();
    assert.ok(route);
    assert.equal(route.stack.length >= 5, true);
    assert.ok(route.stack.find((layer) => layer.handle.name === "transactionReadPermissionMiddleware"));
});

test("guard transacional valida o body e a permissão do domínio", () => {
    const route = transactionRoute();
    const guard = route.stack.find((layer) => layer.handle.name === "transactionReadPermissionMiddleware").handle;
    let nextCalled = false;
    const allowed = { body: { documentType: "SALE", documentId: SALE_ID }, role: "ADMIN" };
    guard(allowed, responseDouble(), () => { nextCalled = true; });
    assert.equal(nextCalled, true);
    assert.deepEqual(allowed.aiTransactionInput, { documentType: "SALE", documentId: SALE_ID });

    const forbiddenResponse = responseDouble();
    guard({ body: { documentType: "SALE", documentId: SALE_ID }, role: "UNKNOWN" }, forbiddenResponse, () => {});
    assert.equal(forbiddenResponse.statusCode, 403);
    assert.equal(forbiddenResponse.body.error, "PERMISSION_FORBIDDEN");

    const injectedResponse = responseDouble();
    guard({ body: { documentType: "SALE", documentId: SALE_ID, score: 0 }, role: "ADMIN" }, injectedResponse, () => {});
    assert.equal(injectedResponse.statusCode, 400);
    assert.equal(injectedResponse.body.error, "INVALID_AI_TRANSACTION_INPUT");
});

test("chat exige SALES_READ e PURCHASES_READ apenas quando recebe contexto transacional", () => {
    const route = postRoute("/chat/sessions/:id/messages");
    const guard = namedGuard(route, "chatTransactionReadPermissionMiddleware");
    assert.ok(guard);

    for (const transaction of [
        { documentType: "SALE", documentId: SALE_ID },
        { documentType: "PURCHASE", documentId: PURCHASE_ID },
    ]) {
        let nextCalled = false;
        const request = { body: { message: "Que riscos tem?", context: { transaction } }, role: "ADMIN" };
        guard(request, responseDouble(), () => { nextCalled = true; });
        assert.equal(nextCalled, true);
        assert.deepEqual(request.body.context.transaction, transaction);

        const forbiddenResponse = responseDouble();
        guard({ body: { context: { transaction } }, role: "UNKNOWN" }, forbiddenResponse, () => {});
        assert.equal(forbiddenResponse.statusCode, 403);
        assert.equal(forbiddenResponse.body.error, "PERMISSION_FORBIDDEN");
    }

    let contextFreeNext = false;
    guard({ body: { message: "Qual é a margem?" }, role: "UNKNOWN" }, responseDouble(), () => { contextFreeNext = true; });
    assert.equal(contextFreeNext, true);
});

test("adapter /questions aplica o guard e rejeita factos injetados no contexto", () => {
    const route = postRoute("/questions");
    const guard = namedGuard(route, "chatTransactionReadPermissionMiddleware");
    assert.ok(guard);

    let nextCalled = false;
    guard({
        body: { question: "É uma boa compra?", context: { transaction: { documentType: "PURCHASE", documentId: PURCHASE_ID } } },
        role: "ADMIN",
    }, responseDouble(), () => { nextCalled = true; });
    assert.equal(nextCalled, true);

    const forbiddenResponse = responseDouble();
    guard({
        body: { question: "É uma boa venda?", context: { transaction: { documentType: "SALE", documentId: SALE_ID } } },
        role: "UNKNOWN",
    }, forbiddenResponse, () => {});
    assert.equal(forbiddenResponse.statusCode, 403);

    const injectedResponse = responseDouble();
    guard({
        body: { context: { transaction: { documentType: "SALE", documentId: SALE_ID, totalCents: 1 } } },
        role: "ADMIN",
    }, injectedResponse, () => {});
    assert.equal(injectedResponse.statusCode, 400);
    assert.equal(injectedResponse.body.error, "INVALID_AI_TRANSACTION_INPUT");
});
