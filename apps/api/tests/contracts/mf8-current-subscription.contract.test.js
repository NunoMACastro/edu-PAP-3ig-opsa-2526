/**
 * @file Testes de contrato para a subscricao atual por empresa ativa RF50.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { buildSubscriptionRoutes } from "../../src/modules/subscriptions/subscriptionRoutes.js";

const ACTIVE_COMPANY_ID = "company-active-1";

/**
 * Procura uma rota dentro de um router Express.
 *
 * @param router - Router Express a inspecionar.
 * @param {string} method - Metodo HTTP esperado.
 * @param {string} path - Caminho esperado dentro do router.
 * @returns {import("express").Layer | undefined} Layer encontrada.
 */
function findRoute(router, method, path) {
    return router.stack.find((layer) => {
        return layer.route?.path === path && layer.route.methods[method] === true;
    });
}

/**
 * Cria uma resposta Express minima para testes deterministas.
 *
 * @returns {{statusCode: number | null, body: unknown, status: Function, json: Function}} Resposta de teste.
 */
function createResponseRecorder() {
    return {
        statusCode: null,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
}

/**
 * Executa uma rota Express diretamente, incluindo guards e handlers async.
 *
 * @param router - Router Express a testar sem abrir porta local.
 * @param {string} method - Metodo HTTP esperado.
 * @param {string} path - Caminho dentro do router.
 * @param {object} [request] - Pedido Express minimo.
 * @returns {Promise<{statusCode: number | null, body: unknown}>} Resposta observada.
 */
async function executeRoute(router, method, path, request = {}) {
    const layer = findRoute(router, method, path);
    assert.ok(layer, `Rota ${method.toUpperCase()} ${path} em falta`);

    const response = createResponseRecorder();
    const handlers = layer.route.stack.map((entry) => entry.handle);

    for (const handler of handlers) {
        let calledNext = false;

        await handler(request, response, () => {
            calledNext = true;
        });

        if (!calledNext) {
            break;
        }
    }

    return response;
}

/**
 * Cria um mock Prisma que prova a consulta por empresa ativa.
 *
 * @param {object | null} subscription - Registo devolvido pela query.
 * @param {string} [expectedCompanyId] - Empresa que o service deve consultar.
 * @returns {{companySubscription: {findUnique: Function}}} Prisma minimo para o teste.
 */
function createPrismaWithSubscription(
    subscription,
    expectedCompanyId = ACTIVE_COMPANY_ID,
) {
    return {
        companySubscription: {
            async findUnique(query) {
                assert.deepEqual(query, {
                    where: { companyId: expectedCompanyId },
                });

                return subscription;
            },
        },
    };
}

/**
 * Cria um mock Prisma que falha se a rota tentar consultar sem empresa ativa.
 *
 * @returns {{companySubscription: {findUnique: Function}}} Prisma minimo para o teste.
 */
function createPrismaThatMustNotQuery() {
    return {
        companySubscription: {
            async findUnique() {
                assert.fail("A rota nao deve consultar Prisma sem empresa ativa.");
            },
        },
    };
}

/**
 * Cria um guard que representa auth, contexto multiempresa e role autorizada.
 *
 * @param {string} [companyId] - Empresa ativa a injetar no pedido.
 * @param {string} [role] - Role funcional ativa.
 * @returns {Function} Middleware Express de teste.
 */
function allowCompanyContext(companyId = ACTIVE_COMPANY_ID, role = "ADMIN") {
    return (req, _res, next) => {
        req.user = { id: "user-1" };
        req.session = { id: "session-1", activeCompanyId: companyId };
        req.companyId = companyId;
        req.role = role;
        return next();
    };
}

/**
 * Cria um guard de teste que bloqueia antes do service.
 *
 * @param {number} status - Status HTTP esperado.
 * @param {string} error - Codigo funcional esperado.
 * @returns {Function} Middleware Express de teste.
 */
function deny(status, error) {
    return (_req, res) => {
        return res.status(status).json({ error });
    };
}

test("BK-MF8-04 expoe GET /current no router de subscricoes", () => {
    const router = buildSubscriptionRoutes({ guards: [] });

    assert.ok(findRoute(router, "get", "/current"));
});

test("GET /current devolve a subscricao ativa da empresa autenticada", async () => {
    const router = buildSubscriptionRoutes({
        prisma: createPrismaWithSubscription({
            id: "subscription-1",
            companyId: ACTIVE_COMPANY_ID,
            planCode: "monthly",
            status: "ACTIVE",
            startsAt: new Date("2026-07-01T00:00:00.000Z"),
            endsAt: new Date("2026-08-01T00:00:00.000Z"),
            simulated: true,
            createdAt: new Date("2026-07-01T00:00:00.000Z"),
            updatedAt: new Date("2026-07-02T00:00:00.000Z"),
        }),
        guards: [allowCompanyContext()],
    });

    const response = await executeRoute(router, "get", "/current", {});

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.state, "active");
    assert.equal(response.body.subscription.companyId, ACTIVE_COMPANY_ID);
    assert.equal(response.body.subscription.planCode, "monthly");
    assert.equal(response.body.subscription.plan.code, "monthly");
    assert.equal(response.body.subscription.plan.billingCycle, "month");
    assert.equal(response.body.subscription.plan.intervalCount, 1);
    assert.equal(response.body.subscription.simulated, true);
    assert.equal(response.body.subscription.startsAt, "2026-07-01T00:00:00.000Z");
    assert.equal(response.body.subscription.endsAt, "2026-08-01T00:00:00.000Z");
});

test("GET /current devolve state none quando a empresa nao tem subscricao", async () => {
    const router = buildSubscriptionRoutes({
        prisma: createPrismaWithSubscription(null),
        guards: [allowCompanyContext()],
    });

    const response = await executeRoute(router, "get", "/current", {});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, {
        state: "none",
        subscription: null,
    });
});

test("GET /current bloqueia role sem acesso antes de consultar subscricoes", async () => {
    const router = buildSubscriptionRoutes({
        prisma: createPrismaThatMustNotQuery(),
        guards: [allowCompanyContext(), deny(403, "ROLE_FORBIDDEN")],
    });

    const response = await executeRoute(router, "get", "/current", {});

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.error, "ROLE_FORBIDDEN");
});

test("GET /current bloqueia pedido sem empresa ativa", async () => {
    const router = buildSubscriptionRoutes({
        prisma: createPrismaThatMustNotQuery(),
        guards: [allowCompanyContext("")],
    });

    const response = await executeRoute(router, "get", "/current", {});

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.error, "COMPANY_CONTEXT_REQUIRED");
});

test("GET /current devolve erro controlado quando o plano persistido ja nao existe", async () => {
    const router = buildSubscriptionRoutes({
        prisma: createPrismaWithSubscription({
            id: "subscription-2",
            companyId: ACTIVE_COMPANY_ID,
            planCode: "enterprise",
            status: "ACTIVE",
            startsAt: null,
            endsAt: null,
            simulated: true,
            createdAt: new Date("2026-07-01T00:00:00.000Z"),
            updatedAt: new Date("2026-07-02T00:00:00.000Z"),
        }),
        guards: [allowCompanyContext()],
    });

    const response = await executeRoute(router, "get", "/current", {});

    assert.equal(response.statusCode, 409);
    assert.equal(response.body.error, "SUBSCRIPTION_PLAN_DRIFT");
});
