/**
 * @file Testes contratuais da renovacao, cancelamento e reativacao simuladas RF51.
 *
 * A suite exercita o router de subscricoes sem abrir uma porta HTTP. Assim,
 * valida o contrato publico de `POST /current/actions`, a maquina de estados,
 * o filtro por empresa ativa e a auditoria funcional minima.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { buildSubscriptionRoutes } from "../../src/modules/subscriptions/subscriptionRoutes.js";
import { runSimulatedSubscriptionAction } from "../../src/modules/subscriptions/subscriptionService.js";

const ACTIVE_COMPANY_ID = "company-active-1";
const USER_ID = "user-lifecycle-1";

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
 * Executa uma rota Express diretamente, incluindo guards e handler async.
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
 * Cria um registo Prisma de subscricao para a empresa ativa.
 *
 * @param {object} overrides - Campos a especializar no teste.
 * @returns {object} Subscricao simulada.
 */
function createSubscription(overrides = {}) {
    return {
        id: "subscription-lifecycle-1",
        companyId: ACTIVE_COMPANY_ID,
        planCode: "monthly",
        status: "ACTIVE",
        startsAt: new Date("2099-01-01T00:00:00.000Z"),
        endsAt: new Date("2099-02-01T00:00:00.000Z"),
        simulated: true,
        createdAt: new Date("2099-01-01T00:00:00.000Z"),
        updatedAt: new Date("2099-01-01T00:00:00.000Z"),
        ...overrides,
    };
}

/**
 * Cria um mock Prisma com chamadas capturadas para provar ownership e auditoria.
 *
 * @param {object | null} initialSubscription - Subscricao devolvida pela query.
 * @returns {{prisma: object, calls: {findUnique: object[], update: object[], audit: object[]}}} Prisma minimo.
 */
function createLifecyclePrisma(initialSubscription) {
    const calls = {
        findUnique: [],
        update: [],
        audit: [],
    };
    let storedSubscription = initialSubscription;

    const prisma = {
        companySubscription: {
            async findUnique(args) {
                calls.findUnique.push(args);
                return storedSubscription;
            },
            async update(args) {
                calls.update.push(args);
                storedSubscription = {
                    ...storedSubscription,
                    ...args.data,
                    updatedAt: new Date("2099-01-02T00:00:00.000Z"),
                };
                return storedSubscription;
            },
        },
        auditLog: {
            async create(args) {
                calls.audit.push(args);
                return {
                    id: "audit-lifecycle-1",
                    ...args.data,
                };
            },
        },
        async $transaction(work) {
            return work(this);
        },
    };

    return { prisma, calls };
}

/**
 * Cria um guard de sucesso com utilizador, empresa ativa e role permitida.
 *
 * @returns {Function} Middleware Express de teste.
 */
function allowCompanyContext() {
    return (req, _res, next) => {
        req.user = { id: USER_ID };
        req.session = { id: "session-1", activeCompanyId: ACTIVE_COMPANY_ID };
        req.companyId = ACTIVE_COMPANY_ID;
        req.role = "GESTOR";
        return next();
    };
}

/**
 * Cria um guard que bloqueia antes do handler.
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

/**
 * Cria um guard autenticado sem empresa ativa resolvida.
 *
 * @returns {Function} Middleware Express de teste.
 */
function withoutActiveCompany() {
    return (req, _res, next) => {
        req.user = { id: USER_ID };
        req.session = { id: "session-1", activeCompanyId: null };
        req.role = "GESTOR";
        return next();
    };
}

test("BK-MF8-06 expoe POST /current/actions no router de subscricoes", () => {
    const router = buildSubscriptionRoutes({ guards: [] });

    assert.ok(findRoute(router, "post", "/current/actions"));
});

test("POST /current/actions renova subscricao ativa a partir do fim atual", async () => {
    const { prisma, calls } = createLifecyclePrisma(createSubscription());
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [allowCompanyContext()],
    });

    const response = await executeRoute(router, "post", "/current/actions", {
        body: { action: "renew" },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.state, "active");
    assert.equal(response.body.subscription.companyId, ACTIVE_COMPANY_ID);
    assert.equal(response.body.subscription.status, "ACTIVE");
    assert.equal(response.body.subscription.planCode, "monthly");
    assert.equal(response.body.subscription.endsAt, "2099-03-01T00:00:00.000Z");

    assert.deepEqual(calls.findUnique[0], {
        where: { companyId: ACTIVE_COMPANY_ID },
    });
    assert.deepEqual(calls.update[0].where, { companyId: ACTIVE_COMPANY_ID });
    assert.equal(calls.update[0].data.status, "ACTIVE");
    assert.equal(calls.update[0].data.simulated, true);

    assert.equal(calls.audit.length, 1);
    assert.equal(calls.audit[0].data.action, "subscription.renew");
    assert.deepEqual(calls.audit[0].data.details, {
        previousStatus: "ACTIVE",
        nextStatus: "ACTIVE",
        planCode: "monthly",
        simulated: true,
    });
});

test("POST /current/actions cancela subscricao ativa sem pagamento real", async () => {
    const { prisma, calls } = createLifecyclePrisma(createSubscription());
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [allowCompanyContext()],
    });

    const response = await executeRoute(router, "post", "/current/actions", {
        body: { action: "cancel" },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.state, "cancelled");
    assert.equal(response.body.subscription.status, "CANCELLED");
    assert.equal(response.body.subscription.planCode, "monthly");
    assert.equal(Object.hasOwn(response.body.subscription, "checkoutUrl"), false);

    assert.deepEqual(calls.update[0].data, {
        status: "CANCELLED",
    });
    assert.equal(calls.audit[0].data.action, "subscription.cancel");
    assert.deepEqual(calls.audit[0].data.details, {
        previousStatus: "ACTIVE",
        nextStatus: "CANCELLED",
        planCode: "monthly",
        simulated: true,
    });
});

test("POST /current/actions reativa subscricao cancelada com plano canonico", async () => {
    const { prisma, calls } = createLifecyclePrisma(
        createSubscription({
            status: "CANCELLED",
            planCode: "monthly",
        }),
    );
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [allowCompanyContext()],
    });

    const response = await executeRoute(router, "post", "/current/actions", {
        body: { action: "reactivate", planCode: "quarterly" },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.state, "active");
    assert.equal(response.body.subscription.status, "ACTIVE");
    assert.equal(response.body.subscription.planCode, "quarterly");
    assert.equal(response.body.subscription.plan.billingCycle, "month");
    assert.equal(response.body.subscription.plan.intervalCount, 3);

    assert.equal(calls.update[0].data.planCode, "quarterly");
    assert.equal(calls.update[0].data.status, "ACTIVE");
    assert.ok(calls.update[0].data.startsAt instanceof Date);
    assert.ok(calls.update[0].data.endsAt instanceof Date);
    assert.equal(calls.audit[0].data.action, "subscription.reactivate");
    assert.deepEqual(calls.audit[0].data.details, {
        previousStatus: "CANCELLED",
        nextStatus: "ACTIVE",
        planCode: "quarterly",
        simulated: true,
    });
});

test("runSimulatedSubscriptionAction reativa subscricao expirada com datas deterministicas", async () => {
    const { prisma, calls } = createLifecyclePrisma(
        createSubscription({
            status: "EXPIRED",
            planCode: "monthly",
            startsAt: new Date("2026-01-01T00:00:00.000Z"),
            endsAt: new Date("2026-02-01T00:00:00.000Z"),
        }),
    );

    const response = await runSimulatedSubscriptionAction(prisma, {
        companyId: ACTIVE_COMPANY_ID,
        userId: USER_ID,
        action: "reactivate",
        planCode: "yearly",
        now: new Date("2026-07-04T00:00:00.000Z"),
    });

    assert.equal(response.state, "active");
    assert.equal(response.subscription.planCode, "yearly");
    assert.equal(response.subscription.startsAt, "2026-07-04T00:00:00.000Z");
    assert.equal(response.subscription.endsAt, "2027-07-04T00:00:00.000Z");
    assert.equal(calls.audit[0].data.action, "subscription.reactivate");
});

test("POST /current/actions rejeita reativacao sem planCode", async () => {
    const { prisma, calls } = createLifecyclePrisma(
        createSubscription({ status: "CANCELLED" }),
    );
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [allowCompanyContext()],
    });

    const response = await executeRoute(router, "post", "/current/actions", {
        body: { action: "reactivate" },
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.error, "SUBSCRIPTION_PLAN_REQUIRED");
    assert.equal(calls.update.length, 0);
    assert.equal(calls.audit.length, 0);
});

test("POST /current/actions rejeita transicao invalida", async () => {
    const { prisma, calls } = createLifecyclePrisma(
        createSubscription({ status: "CANCELLED" }),
    );
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [allowCompanyContext()],
    });

    const response = await executeRoute(router, "post", "/current/actions", {
        body: { action: "renew" },
    });

    assert.equal(response.statusCode, 409);
    assert.equal(response.body.error, "INVALID_SUBSCRIPTION_TRANSITION");
    assert.equal(calls.update.length, 0);
    assert.equal(calls.audit.length, 0);
});

test("POST /current/actions rejeita ownership vindo do body", async () => {
    const { prisma, calls } = createLifecyclePrisma(createSubscription());
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [allowCompanyContext()],
    });

    const response = await executeRoute(router, "post", "/current/actions", {
        body: {
            action: "cancel",
            companyId: "company-forged",
        },
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.error, "INVALID_SUBSCRIPTION_ACTION_BODY");
    assert.equal(calls.findUnique.length, 0);
    assert.equal(calls.update.length, 0);
    assert.equal(calls.audit.length, 0);
});

test("POST /current/actions rejeita acao desconhecida", async () => {
    const { prisma, calls } = createLifecyclePrisma(createSubscription());
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [allowCompanyContext()],
    });

    const response = await executeRoute(router, "post", "/current/actions", {
        body: { action: "pause" },
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.error, "INVALID_SUBSCRIPTION_ACTION");
    assert.equal(calls.update.length, 0);
    assert.equal(calls.audit.length, 0);
});

test("POST /current/actions bloqueia role sem acesso antes do service", async () => {
    const { prisma, calls } = createLifecyclePrisma(createSubscription());
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [allowCompanyContext(), deny(403, "ROLE_FORBIDDEN")],
    });

    const response = await executeRoute(router, "post", "/current/actions", {
        body: { action: "cancel" },
    });

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.error, "ROLE_FORBIDDEN");
    assert.equal(calls.findUnique.length, 0);
    assert.equal(calls.update.length, 0);
    assert.equal(calls.audit.length, 0);
});

test("POST /current/actions exige empresa ativa resolvida pelo backend", async () => {
    const { prisma, calls } = createLifecyclePrisma(createSubscription());
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [withoutActiveCompany()],
    });

    const response = await executeRoute(router, "post", "/current/actions", {
        body: { action: "cancel" },
    });

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.error, "COMPANY_CONTEXT_REQUIRED");
    assert.equal(calls.update.length, 0);
    assert.equal(calls.audit.length, 0);
});
