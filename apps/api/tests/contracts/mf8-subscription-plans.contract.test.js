import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildSubscriptionRoutes } from "../../src/modules/subscriptions/subscriptionRoutes.js";
import {
  getSimulatedSubscriptionPlan,
  listSimulatedSubscriptionPlans,
  PLAN_NOT_FOUND_CODE,
  SimulatedSubscriptionPlanError,
} from "../../src/modules/subscriptions/subscriptionPlans.js";

const SERVER_SOURCE = readFileSync(new URL("../../src/server.js", import.meta.url), "utf8");

function findRoute(router, method, path) {
  return router.stack.find((layer) => {
    return layer.route?.path === path && layer.route.methods[method] === true;
  });
}

function createResponseRecorder() {
  return {
    statusCode: null,
    body: null,
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

function executeRoute(router, method, path, request = {}) {
  const layer = findRoute(router, method, path);
  const response = createResponseRecorder();
  const handlers = layer.route.stack.map((entry) => entry.handle);
  let index = 0;

  function next() {
    const handler = handlers[index];
    index += 1;

    if (handler) {
      // A execução em cadeia permite testar guards e handler sem abrir porta HTTP.
      handler(request, response, next);
    }
  }

  next();
  return response;
}

function deny(status, error) {
  return (_req, res) => {
    return res.status(status).json({ error });
  };
}

test("BK-MF8-03 expõe as rotas de catálogo de subscrições", () => {
  const router = buildSubscriptionRoutes({ guards: [] });

  assert.ok(findRoute(router, "get", "/plans"));
  assert.ok(findRoute(router, "get", "/plans/:code"));
});

test("BK-MF8-03 está montado no servidor principal", () => {
  assert.match(SERVER_SOURCE, /buildSubscriptionRoutes/);
  assert.match(SERVER_SOURCE, /app\.use\("\/api\/subscriptions", buildSubscriptionRoutes\(\{ prisma \}\)\)/);
});

test("GET /plans devolve três planos simulados em EUR", () => {
  const router = buildSubscriptionRoutes({ guards: [] });
  const response = executeRoute(router, "get", "/plans");

  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    response.body.plans.map((plan) => plan.code),
    ["monthly", "quarterly", "yearly"],
  );
  assert.ok(response.body.plans.every((plan) => plan.currency === "EUR"));
  assert.ok(response.body.plans.every((plan) => plan.simulated === true));
});

test("GET /plans/:code devolve um plano existente", () => {
  const router = buildSubscriptionRoutes({ guards: [] });
  const response = executeRoute(router, "get", "/plans/:code", {
    params: { code: "monthly" },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.plan.code, "monthly");
  assert.equal(response.body.plan.billingCycle, "month");
});

test("GET /plans/:code rejeita códigos desconhecidos", () => {
  const router = buildSubscriptionRoutes({ guards: [] });
  const response = executeRoute(router, "get", "/plans/:code", {
    params: { code: "enterprise" },
  });

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, PLAN_NOT_FOUND_CODE);
});

test("a rota bloqueia pedidos sem sessão", () => {
  const router = buildSubscriptionRoutes({
    guards: [deny(401, "SESSION_REQUIRED")],
  });
  const response = executeRoute(router, "get", "/plans");

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, "SESSION_REQUIRED");
});

test("a rota bloqueia papel sem acesso", () => {
  const router = buildSubscriptionRoutes({
    guards: [(_req, _res, next) => next(), deny(403, "ROLE_FORBIDDEN")],
  });
  const response = executeRoute(router, "get", "/plans");

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "ROLE_FORBIDDEN");
});

test("o serviço rejeita códigos desconhecidos com erro próprio", () => {
  assert.throws(
    () => getSimulatedSubscriptionPlan("enterprise"),
    SimulatedSubscriptionPlanError,
  );
});

test("os planos devolvidos não podem ser alterados pelo chamador", () => {
  const plans = listSimulatedSubscriptionPlans();

  assert.equal(Object.isFrozen(plans[0]), true);
  assert.throws(() => {
    // Se este teste deixasse alterar o preço, outro módulo poderia corromper o catálogo.
    plans[0].priceCents = 1;
  }, TypeError);
});

test("o catálogo simulado não expõe campos de pagamento real", () => {
  const forbiddenFields = ["gateway", "checkoutUrl", "paymentProvider", "invoiceId"];
  const plans = listSimulatedSubscriptionPlans();

  for (const plan of plans) {
    for (const field of forbiddenFields) {
      assert.equal(Object.hasOwn(plan, field), false);
    }
  }
});