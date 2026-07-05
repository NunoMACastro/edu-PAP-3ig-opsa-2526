// apps/api/tests/contracts/mf8-subscriptions.contract.test.js

import assert from "node:assert/strict";
import test from "node:test";
import { listSimulatedSubscriptionPlans } from "../../src/modules/subscriptions/subscriptionPlans.js";
import {
  activateSimulatedSubscription,
  assertSubscriptionLifecycleTransition,
  runSimulatedSubscriptionAction,
} from "../../src/modules/subscriptions/subscriptionService.js";

const COMPANY_ID = "company-mf8-001";
const USER_ID = "user-mf8-001";
const NOW = new Date("2026-07-01T09:00:00.000Z");

/**
 * Cria uma subscrição persistida em memória para os testes de contrato.
 *
 * @param {object} overrides - Campos a substituir na subscrição base.
 * @returns {object} Subscrição coerente com o modelo CompanySubscription.
 */
function createSubscription(overrides = {}) {
  return {
    id: "subscription-mf8-001",
    companyId: COMPANY_ID,
    planCode: "monthly",
    status: "ACTIVE",
    startsAt: new Date("2026-07-01T09:00:00.000Z"),
    endsAt: new Date("2026-08-01T09:00:00.000Z"),
    simulated: true,
    ...overrides,
  };
}

/**
 * Devolve uma cópia da subscrição para impedir mutação acidental entre asserts.
 *
 * @param {object | null} subscription - Subscrição guardada no double Prisma.
 * @returns {object | null} Cópia segura para o teste.
 */
function copySubscription(subscription) {
  if (!subscription) return null;

  return {
    ...subscription,
    startsAt: new Date(subscription.startsAt),
    endsAt: new Date(subscription.endsAt),
  };
}

/**
 * Cria um Prisma em memória com as operações usadas pelos services da MF8.
 *
 * @param {object | null} initialSubscription - Estado inicial da subscrição.
 * @returns {{ prisma: object, calls: object, readSubscription: () => object | null }} Double Prisma e chamadas capturadas.
 */
function createPrismaDouble(initialSubscription = null) {
  let subscription = copySubscription(initialSubscription);
  const calls = {
    upsert: [],
    findUnique: [],
    update: [],
    audit: [],
  };

  const prisma = {
    companySubscription: {
      async upsert(args) {
        calls.upsert.push(args);

        const data = subscription
          ? { ...subscription, ...args.update }
          : { id: "subscription-mf8-001", ...args.create };

        subscription = copySubscription(data);
        return copySubscription(subscription);
      },
      async findUnique(args) {
        calls.findUnique.push(args);
        return copySubscription(subscription);
      },
      async update(args) {
        calls.update.push(args);
        subscription = copySubscription({
          ...subscription,
          ...args.data,
        });
        return copySubscription(subscription);
      },
    },
    auditLog: {
      async create(args) {
        calls.audit.push(args);
        return { id: `audit-${calls.audit.length}`, ...args.data };
      },
    },
    async $transaction(work) {
      // O teste usa transação em memória para validar a fronteira do service sem abrir base de dados.
      return work(this);
    },
  };

  return {
    prisma,
    calls,
    readSubscription() {
      return copySubscription(subscription);
    },
  };
}

/**
 * Verifica erros de domínio pelo código público.
 *
 * @param {string} code - Código esperado no erro.
 * @returns {(error: Error & { code?: string }) => boolean} Predicado para assert.throws/assert.rejects.
 */
function hasDomainCode(code) {
  return function assertDomainCode(error) {
    assert.equal(error.code, code);
    return true;
  };
}

test("RF49 lista os três planos simulados sem contrato de pagamento real", () => {
  const plans = listSimulatedSubscriptionPlans();

  assert.deepEqual(
    plans.map((plan) => plan.code),
    ["monthly", "quarterly", "yearly"],
  );

  for (const plan of plans) {
    assert.equal(plan.currency, "EUR");
    assert.equal(plan.simulated, true);
    assert.equal(Object.prototype.hasOwnProperty.call(plan, "paymentProvider"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(plan, "checkoutUrl"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(plan, "paymentIntentId"), false);
  }
});

test("RF50 ativa subscrição para a empresa ativa e regista auditoria mínima", async () => {
  const { prisma, calls, readSubscription } = createPrismaDouble();

  const result = await activateSimulatedSubscription(prisma, {
    companyId: COMPANY_ID,
    userId: USER_ID,
    planCode: "monthly",
    now: NOW,
  });

  assert.equal(result.active, true);
  assert.equal(result.state, "active");
  assert.equal(result.subscription.planCode, "monthly");
  assert.equal(result.subscription.simulated, true);

  assert.deepEqual(calls.upsert[0].where, { companyId: COMPANY_ID });
  assert.equal(calls.audit[0].data.companyId, COMPANY_ID);
  assert.equal(calls.audit[0].data.userId, USER_ID);
  assert.equal(calls.audit[0].data.action, "subscription.activate");
  assert.deepEqual(calls.audit[0].data.details, {
    planCode: "monthly",
    simulated: true,
  });

  const stored = readSubscription();
  assert.equal(stored.status, "ACTIVE");
  assert.equal(stored.simulated, true);
});

test("RF51 renova, cancela e reativa a subscrição sem gateway externo", async () => {
  const { prisma, calls, readSubscription } = createPrismaDouble(createSubscription());

  const renewed = await runSimulatedSubscriptionAction(prisma, {
    companyId: COMPANY_ID,
    userId: USER_ID,
    action: "renew",
    now: NOW,
  });

  assert.equal(renewed.active, true);
  assert.equal(renewed.subscription.status, "ACTIVE");
  assert.ok(new Date(renewed.subscription.endsAt) > new Date("2026-08-01T09:00:00.000Z"));

  const cancelled = await runSimulatedSubscriptionAction(prisma, {
    companyId: COMPANY_ID,
    userId: USER_ID,
    action: "cancel",
    now: NOW,
  });

  assert.equal(cancelled.active, false);
  assert.equal(cancelled.state, "cancelled");
  assert.equal(cancelled.subscription.status, "CANCELLED");

  const reactivated = await runSimulatedSubscriptionAction(prisma, {
    companyId: COMPANY_ID,
    userId: USER_ID,
    action: "reactivate",
    planCode: "yearly",
    now: new Date("2026-09-01T09:00:00.000Z"),
  });

  assert.equal(reactivated.active, true);
  assert.equal(reactivated.subscription.planCode, "yearly");
  assert.equal(reactivated.subscription.status, "ACTIVE");

  assert.deepEqual(
    calls.findUnique.map((call) => call.where),
    [{ companyId: COMPANY_ID }, { companyId: COMPANY_ID }, { companyId: COMPANY_ID }],
  );
  assert.deepEqual(
    calls.audit.map((call) => call.data.action),
    ["subscription.renew", "subscription.cancel", "subscription.reactivate"],
  );
  assert.ok(calls.audit.every((call) => call.data.details.simulated === true));
  assert.equal(Object.prototype.hasOwnProperty.call(readSubscription(), "paymentIntentId"), false);
});

test("RF51 rejeita transições inválidas e contexto incompleto", async () => {
  assert.throws(
    () => assertSubscriptionLifecycleTransition(createSubscription({ status: "CANCELLED" }), "cancel"),
    hasDomainCode("INVALID_SUBSCRIPTION_TRANSITION"),
  );

  const { prisma } = createPrismaDouble(createSubscription({ status: "CANCELLED" }));

  await assert.rejects(
    () =>
      runSimulatedSubscriptionAction(prisma, {
        companyId: COMPANY_ID,
        userId: USER_ID,
        action: "reactivate",
        now: NOW,
      }),
    hasDomainCode("SUBSCRIPTION_PLAN_REQUIRED"),
  );

  await assert.rejects(
    () =>
      activateSimulatedSubscription(prisma, {
        companyId: "",
        userId: USER_ID,
        planCode: "monthly",
        now: NOW,
      }),
    hasDomainCode("ACTIVE_COMPANY_REQUIRED"),
  );
});