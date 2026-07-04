/**
 * @file Testes contratuais da ativação simulada de subscrição MF8.
 *
 * Estes testes usam dependências em memória para validar o contrato HTTP sem
 * depender de uma base de dados externa durante a verificação rápida.
 */

import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import express from "express";
import { buildSubscriptionRoutes } from "../../src/modules/subscriptions/subscriptionRoutes.js";

const COMPANY_ID = "company-001";
const USER_ID = "user-001";

/**
 * Cria uma implementação mínima do contrato Prisma usado pela rota.
 *
 * @returns {{ prisma: object, calls: object }} Cliente em memória e chamadas capturadas.
 */
function createInMemoryPrisma() {
  const calls = {
    upsert: [],
    audit: [],
  };

  // Guardamos as chamadas para provar que a rota usa a empresa ativa correta.
  const prisma = {
    companySubscription: {
      async findUnique() {
        return null;
      },
      async upsert(args) {
        calls.upsert.push(args);
        // A resposta simula a linha persistida que o service depois formata para a API.
        return {
          id: "subscription-001",
          companyId: args.create.companyId,
          planCode: args.create.planCode,
          status: args.create.status,
          startsAt: args.create.startsAt,
          endsAt: args.create.endsAt,
          simulated: args.create.simulated,
        };
      },
    },
    auditLog: {
      async create(args) {
        calls.audit.push(args);
        return { id: "audit-001", ...args.data };
      },
    },
    async $transaction(work) {
      return work(this);
    },
  };

  return { prisma, calls };
}

/**
 * Cria guard de sucesso com sessão, utilizador, empresa e role.
 *
 * @returns {import("express").RequestHandler} Middleware Express.
 */
function allowAsManager() {
  return function allowedGuard(req, _res, next) {
    // O guard simula o que os middlewares reais já teriam colocado no request.
    req.user = { id: USER_ID };
    req.companyId = COMPANY_ID;
    req.role = "GESTOR";
    return next();
  };
}

/**
 * Cria guard que simula role sem acesso funcional.
 *
 * @returns {import("express").RequestHandler} Middleware Express.
 */
function denyRole() {
  return function deniedGuard(_req, res) {
    return res.status(403).json({
      error: "ROLE_FORBIDDEN",
      message: "Papel sem acesso a esta operação",
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
 * @param {object} prisma - Cliente Prisma ou equivalente de teste.
 * @param {import("express").RequestHandler[]} guards - Guards a usar no router.
 * @returns {Promise<{ baseUrl: string, close: () => Promise<void> }>} Cliente HTTP mínimo.
 */
async function createHttpServer(prisma, guards) {
  const app = express();
  app.use(express.json());
  app.use("/api/subscriptions", buildSubscriptionRoutes({ prisma, guards }));

  // A porta dinâmica evita conflitos locais quando a suite corre em paralelo.
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

test("POST /api/subscriptions/current/activate ativa plano mensal para a empresa ativa", async () => {
  const { prisma, calls } = createInMemoryPrisma();
  const server = await createHttpServer(prisma, [allowAsManager()]);

  try {
    // O pedido envia só o plano; empresa e utilizador são injetados pelo guard.
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/activate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planCode: "monthly" }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.active, true);
    assert.equal(body.state, "active");
    assert.equal(body.subscription.planCode, "monthly");
    assert.equal(body.subscription.status, "ACTIVE");
    assert.equal(body.subscription.simulated, true);

    assert.equal(calls.upsert.length, 1);
    assert.deepEqual(calls.upsert[0].where, { companyId: COMPANY_ID });
    assert.equal(calls.upsert[0].create.companyId, COMPANY_ID);
    assert.equal(calls.upsert[0].create.status, "ACTIVE");

    assert.equal(calls.audit.length, 1);
    assert.equal(calls.audit[0].data.companyId, COMPANY_ID);
    assert.equal(calls.audit[0].data.userId, USER_ID);
    assert.equal(calls.audit[0].data.action, "subscription.activate");
    assert.equal(calls.audit[0].data.details.planCode, "monthly");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/activate rejeita plano inexistente", async () => {
  const { prisma } = createInMemoryPrisma();
  const server = await createHttpServer(prisma, [allowAsManager()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/activate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planCode: "enterprise" }),
    });
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.error, "SUBSCRIPTION_PLAN_NOT_FOUND");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/activate rejeita body sem planCode", async () => {
  const { prisma } = createInMemoryPrisma();
  const server = await createHttpServer(prisma, [allowAsManager()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/activate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, "INVALID_SUBSCRIPTION_ACTIVATION");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/activate bloqueia role sem acesso", async () => {
  const { prisma } = createInMemoryPrisma();
  const server = await createHttpServer(prisma, [denyRole()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/activate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planCode: "monthly" }),
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(body.error, "ROLE_FORBIDDEN");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/activate exige empresa ativa", async () => {
  const { prisma } = createInMemoryPrisma();
  const server = await createHttpServer(prisma, [withoutCompany()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/activate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planCode: "monthly" }),
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(body.error, "ACTIVE_COMPANY_REQUIRED");
  } finally {
    await server.close();
  }
});