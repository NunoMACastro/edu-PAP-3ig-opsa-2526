// apps/api/tests/contracts/mf8-current-subscription.contract.test.js

import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";
import { buildSubscriptionRoutes } from "../../src/modules/subscriptions/subscriptionRoutes.js";

function createPrismaWithSubscription(subscription) {
  return {
    companySubscription: {
      async findUnique(query) {
        // O service só pode consultar a empresa ativa injetada pelo backend.
        assert.deepEqual(query, {
          where: { companyId: "company-active-1" },
        });

        return subscription;
      },
    },
  };
}

function createAllowedCompanyGuard(companyId = "company-active-1") {
  return function allowedCompanyGuard(req, res, next) {
    // Estes campos representam o resultado dos guards reais de sessão e empresa.
    req.user = { id: "user-1" };
    req.session = { id: "session-1" };
    req.companyId = companyId;
    req.role = "ADMIN";
    return next();
  };
}

function createBlockedRoleGuard() {
  return function blockedRoleGuard(req, res) {
    return res.status(403).json({
      error: "ROLE_FORBIDDEN",
      message: "Papel sem acesso a esta operação",
    });
  };
}

function createApp(prisma, guards) {
  const app = express();

  app.use(express.json());
  app.use("/api/subscriptions", buildSubscriptionRoutes({ prisma, guards }));

  return app;
}

async function createHttpClient(app) {
  const server = app.listen(0, "127.0.0.1");

  await Promise.race([
    once(server, "listening"),
    once(server, "error").then(([error]) => {
      throw error;
    }),
  ]);

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    async get(path) {
      const response = await fetch(`${baseUrl}${path}`);

      return {
        status: response.status,
        body: await response.json(),
      };
    },
    close() {
      return new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    },
  };
}

test("GET /api/subscriptions/current devolve a subscrição ativa da empresa", async () => {
  const subscription = {
    id: "subscription-1",
    companyId: "company-active-1",
    planCode: "monthly",
    status: "ACTIVE",
    startsAt: new Date("2026-01-01T00:00:00.000Z"),
    endsAt: new Date("2026-02-01T00:00:00.000Z"),
    simulated: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  };
  const app = createApp(createPrismaWithSubscription(subscription), [
    createAllowedCompanyGuard(),
  ]);
  const client = await createHttpClient(app);

  try {
    const response = await client.get("/api/subscriptions/current");

    assert.equal(response.status, 200);
    assert.equal(response.body.state, "active");
    assert.equal(response.body.subscription.planCode, "monthly");
    assert.equal(response.body.subscription.plan.code, "monthly");
    assert.equal(response.body.subscription.simulated, true);
    assert.equal(response.body.subscription.startsAt, "2026-01-01T00:00:00.000Z");
  } finally {
    await client.close();
  }
});

test("GET /api/subscriptions/current devolve state none sem subscrição", async () => {
  const app = createApp(createPrismaWithSubscription(null), [
    createAllowedCompanyGuard(),
  ]);
  const client = await createHttpClient(app);

  try {
    const response = await client.get("/api/subscriptions/current");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      state: "none",
      subscription: null,
    });
  } finally {
    await client.close();
  }
});

test("GET /api/subscriptions/current bloqueia role sem acesso", async () => {
  const app = createApp(createPrismaWithSubscription(null), [
    createBlockedRoleGuard(),
  ]);
  const client = await createHttpClient(app);

  try {
    const response = await client.get("/api/subscriptions/current");

    assert.equal(response.status, 403);
    assert.equal(response.body.error, "ROLE_FORBIDDEN");
  } finally {
    await client.close();
  }
});

test("GET /api/subscriptions/current bloqueia pedido sem empresa ativa", async () => {
  const app = createApp(createPrismaWithSubscription(null), [
    createAllowedCompanyGuard(""),
  ]);
  const client = await createHttpClient(app);

  try {
    const response = await client.get("/api/subscriptions/current");

    assert.equal(response.status, 403);
    assert.equal(response.body.error, "COMPANY_CONTEXT_REQUIRED");
  } finally {
    await client.close();
  }
});