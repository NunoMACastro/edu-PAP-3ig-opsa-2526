/**
 * @file Testes contratuais da ativacao simulada de subscricao RF50.
 *
 * A suite exercita o router sem abrir uma porta HTTP local. Assim, os contratos
 * de guards, body, service, persistencia e auditoria ficam cobertos sem depender
 * de rede no ambiente de validacao.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { buildSubscriptionRoutes } from "../../src/modules/subscriptions/subscriptionRoutes.js";
import { calculateSubscriptionCycleEnd } from "../../src/modules/subscriptions/subscriptionService.js";

const ACTIVE_COMPANY_ID = "company-active-1";
const USER_ID = "user-activation-1";

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
 * Cria um mock Prisma com chamadas capturadas para provar ownership e auditoria.
 *
 * @returns {{prisma: object, calls: {upsert: object[], audit: object[]}}} Prisma minimo.
 */
function createActivationPrisma() {
    const calls = {
        upsert: [],
        audit: [],
    };

    const prisma = {
        companySubscription: {
            async upsert(args) {
                calls.upsert.push(args);
                return {
                    id: "subscription-activation-1",
                    companyId: args.create.companyId,
                    planCode: args.create.planCode,
                    status: args.create.status,
                    startsAt: args.create.startsAt,
                    endsAt: args.create.endsAt,
                    simulated: args.create.simulated,
                    createdAt: args.create.startsAt,
                    updatedAt: args.create.startsAt,
                };
            },
        },
        auditLog: {
            async create(args) {
                calls.audit.push(args);
                return {
                    id: "audit-activation-1",
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

test("BK-MF8-05 expoe POST /current/activate no router de subscricoes", () => {
    const router = buildSubscriptionRoutes({ guards: [] });

    assert.ok(findRoute(router, "post", "/current/activate"));
});

test("POST /current/activate ativa plano mensal para a empresa ativa", async () => {
    const { prisma, calls } = createActivationPrisma();
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [allowCompanyContext()],
    });

    const response = await executeRoute(router, "post", "/current/activate", {
        body: { planCode: "monthly" },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.state, "active");
    assert.equal(response.body.subscription.companyId, ACTIVE_COMPANY_ID);
    assert.equal(response.body.subscription.planCode, "monthly");
    assert.equal(response.body.subscription.status, "ACTIVE");
    assert.equal(response.body.subscription.simulated, true);
    assert.equal(response.body.subscription.plan.billingCycle, "month");
    assert.equal(response.body.subscription.plan.intervalCount, 1);
    assert.equal(Object.hasOwn(response.body.subscription, "checkoutUrl"), false);

    assert.equal(calls.upsert.length, 1);
    assert.deepEqual(calls.upsert[0].where, { companyId: ACTIVE_COMPANY_ID });
    assert.equal(calls.upsert[0].create.companyId, ACTIVE_COMPANY_ID);
    assert.equal(calls.upsert[0].create.planCode, "monthly");
    assert.equal(calls.upsert[0].create.status, "ACTIVE");
    assert.equal(calls.upsert[0].create.simulated, true);

    assert.equal(calls.audit.length, 1);
    assert.equal(calls.audit[0].data.companyId, ACTIVE_COMPANY_ID);
    assert.equal(calls.audit[0].data.userId, USER_ID);
    assert.equal(calls.audit[0].data.action, "subscription.activate");
    assert.equal(calls.audit[0].data.entity, "CompanySubscription");
    assert.deepEqual(calls.audit[0].data.details, {
        planCode: "monthly",
        simulated: true,
    });
});

test("calculateSubscriptionCycleEnd usa billingCycle e intervalCount do catalogo", () => {
    const startsAt = new Date("2026-07-04T00:00:00.000Z");

    assert.equal(
        calculateSubscriptionCycleEnd(startsAt, {
            billingCycle: "month",
            intervalCount: 3,
        }).toISOString(),
        "2026-10-04T00:00:00.000Z",
    );
    assert.equal(
        calculateSubscriptionCycleEnd(startsAt, {
            billingCycle: "year",
            intervalCount: 1,
        }).toISOString(),
        "2027-07-04T00:00:00.000Z",
    );
});

test("POST /current/activate rejeita plano inexistente sem escrever dados", async () => {
    const { prisma, calls } = createActivationPrisma();
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [allowCompanyContext()],
    });

    const response = await executeRoute(router, "post", "/current/activate", {
        body: { planCode: "enterprise" },
    });

    assert.equal(response.statusCode, 404);
    assert.equal(response.body.error, "SUBSCRIPTION_PLAN_NOT_FOUND");
    assert.equal(calls.upsert.length, 0);
    assert.equal(calls.audit.length, 0);
});

test("POST /current/activate rejeita body sem planCode", async () => {
    const { prisma, calls } = createActivationPrisma();
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [allowCompanyContext()],
    });

    const response = await executeRoute(router, "post", "/current/activate", {
        body: {},
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.error, "INVALID_SUBSCRIPTION_ACTIVATION");
    assert.equal(calls.upsert.length, 0);
    assert.equal(calls.audit.length, 0);
});

test("POST /current/activate rejeita ownership vindo do body", async () => {
    const { prisma, calls } = createActivationPrisma();
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [allowCompanyContext()],
    });

    const response = await executeRoute(router, "post", "/current/activate", {
        body: {
            planCode: "monthly",
            companyId: "company-forged",
        },
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.error, "INVALID_SUBSCRIPTION_ACTIVATION");
    assert.equal(calls.upsert.length, 0);
    assert.equal(calls.audit.length, 0);
});

test("POST /current/activate bloqueia role sem acesso antes do service", async () => {
    const { prisma, calls } = createActivationPrisma();
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [allowCompanyContext(), deny(403, "ROLE_FORBIDDEN")],
    });

    const response = await executeRoute(router, "post", "/current/activate", {
        body: { planCode: "monthly" },
    });

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.error, "ROLE_FORBIDDEN");
    assert.equal(calls.upsert.length, 0);
    assert.equal(calls.audit.length, 0);
});

test("POST /current/activate exige empresa ativa resolvida pelo backend", async () => {
    const { prisma, calls } = createActivationPrisma();
    const router = buildSubscriptionRoutes({
        prisma,
        guards: [withoutActiveCompany()],
    });

    const response = await executeRoute(router, "post", "/current/activate", {
        body: { planCode: "monthly" },
    });

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.error, "COMPANY_CONTEXT_REQUIRED");
    assert.equal(calls.upsert.length, 0);
    assert.equal(calls.audit.length, 0);
});
