// apps/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js

import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import express from "express";
import { buildSubscriptionRoutes } from "../../src/modules/subscriptions/subscriptionRoutes.js";

const COMPANY_ID = "company-001";
const USER_ID = "user-001";

/**
 * Cria uma subscrição persistida em memória.
 *
 * @param {object} overrides - Campos a substituir na subscrição base.
 * @returns {object} Subscrição pronta para o teste.
 */
function createSubscription(overrides = {}) {
  return {
    id: "subscription-001",
    companyId: COMPANY_ID,
    planCode: "monthly",
    status: "ACTIVE",
    startsAt: new Date("2026-07-01T00:00:00.000Z"),
    endsAt: new Date("2026-08-01T00:00:00.000Z"),
    simulated: true,
    ...overrides,
  };
}

/**
 * Cria Prisma em memória com as operações usadas pelo service.
 *
 * @param {object | null} initialSubscription - Estado inicial da subscrição.
 * @returns {{ prisma: object, calls: object }} Cliente de teste e chamadas capturadas.
 */
function createPrismaDouble(initialSubscription) {
  const calls = {
    findUnique: [],
    update: [],
    audit: [],
  };
  let subscription = initialSubscription;

  const prisma = {
    companySubscription: {
      async findUnique(args) {
        calls.findUnique.push(args);
        return subscription;
      },
      async update(args) {
        calls.update.push(args);
        // O update em memória imita a linha devolvida pelo Prisma depois da alteração.
        subscription = {
          ...subscription,
          ...args.data,
          companyId: COMPANY_ID,
          id: subscription.id,
        };
        return subscription;
      },
    },
    auditLog: {
      async create(args) {
        calls.audit.push(args);
        return { id: "audit-001", ...args.data };
      },
    },
    async $transaction(work) {
      // O teste usa uma transação síncrona em memória para validar a fronteira do service.
      return work(this);
    },
  };

  return { prisma, calls };
}

/**
 * Cria guard de sucesso com sessão, empresa ativa e role autorizada.
 *
 * @returns {import("express").RequestHandler} Middleware Express.
 */
function allowSubscriptionAction() {
  return function allowedGuard(req, _res, next) {
    req.user = { id: USER_ID };
    req.companyId = COMPANY_ID;
    req.role = "GESTOR";
    return next();
  };
}

/**
 * Cria guard que simula role sem acesso.
 *
 * @returns {import("express").RequestHandler} Middleware Express.
 */
function denyRole() {
  return function deniedGuard(_req, res) {
    return res.status(403).json({
      error: "ROLE_FORBIDDEN",
      message: "Papel sem acesso a esta operação.",
    });
  };
}

/**
 * Cria guard autenticado sem empresa ativa.
 *
 * @returns {import("express").RequestHandler} Middleware Express.
 */
function withoutCompany() {
  return function missingCompanyGuard(req, _res, next) {
    req.user = { id: USER_ID };
    req.role = "GESTOR";
    return next();
  };
}

/**
 * Sobe uma app Express real para testar o contrato HTTP.
 *
 * @param {object} prisma - Cliente Prisma em memória.
 * @param {import("express").RequestHandler[]} guards - Guards injetados no router.
 * @returns {Promise<{ baseUrl: string, close: () => Promise<void> }>} Servidor temporário.
 */
async function createHttpServer(prisma, guards) {
  const app = express();
  app.use(express.json());
  app.use("/api/subscriptions", buildSubscriptionRoutes({ prisma, guards }));

  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  assert.equal(typeof address, "object");

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    }),
  };
}

test("POST /api/subscriptions/current/actions renova subscrição ativa", async () => {
  const { prisma, calls } = createPrismaDouble(createSubscription());
  const server = await createHttpServer(prisma, [allowSubscriptionAction()]);

  try {
    // A renovação só envia a intenção; a empresa ativa vem do guard backend.
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "renew" }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.active, true);
    assert.equal(body.state, "active");
    assert.equal(body.subscription.status, "ACTIVE");
    assert.equal(calls.update[0].where.companyId, COMPANY_ID);
    assert.equal(calls.audit[0].data.action, "subscription.renew");
    assert.equal(calls.audit[0].data.details.previousStatus, "ACTIVE");
    assert.equal(calls.audit[0].data.details.nextStatus, "ACTIVE");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/actions cancela subscrição ativa", async () => {
  const { prisma, calls } = createPrismaDouble(createSubscription());
  const server = await createHttpServer(prisma, [allowSubscriptionAction()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.state, "cancelled");
    assert.equal(body.subscription.status, "CANCELLED");
    assert.equal(calls.audit[0].data.action, "subscription.cancel");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/actions reativa subscrição cancelada", async () => {
  const { prisma, calls } = createPrismaDouble(createSubscription({ status: "CANCELLED" }));
  const server = await createHttpServer(prisma, [allowSubscriptionAction()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reactivate", planCode: "yearly" }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.state, "active");
    assert.equal(body.subscription.planCode, "yearly");
    assert.equal(calls.audit[0].data.action, "subscription.reactivate");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/actions bloqueia transição inválida", async () => {
  const { prisma } = createPrismaDouble(createSubscription({ status: "CANCELLED" }));
  const server = await createHttpServer(prisma, [allowSubscriptionAction()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "renew" }),
    });
    const body = await response.json();

    assert.equal(response.status, 409);
    assert.equal(body.error, "INVALID_SUBSCRIPTION_TRANSITION");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/actions exige plano na reativação", async () => {
  const { prisma } = createPrismaDouble(createSubscription({ status: "EXPIRED" }));
  const server = await createHttpServer(prisma, [allowSubscriptionAction()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reactivate" }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, "SUBSCRIPTION_PLAN_REQUIRED");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/actions bloqueia role sem acesso", async () => {
  const { prisma } = createPrismaDouble(createSubscription());
  const server = await createHttpServer(prisma, [denyRole()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(body.error, "ROLE_FORBIDDEN");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/actions exige empresa ativa", async () => {
  const { prisma } = createPrismaDouble(createSubscription());
  const server = await createHttpServer(prisma, [withoutCompany()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "renew" }),
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(body.error, "ACTIVE_COMPANY_REQUIRED");
  } finally {
    await server.close();
  }
});