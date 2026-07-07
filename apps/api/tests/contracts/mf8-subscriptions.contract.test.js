/**
 * @file Testes agregados de subscricoes simuladas da MF8.
 *
 * Esta suite fecha o BK-MF8-08 ao ligar RF49, RF50 e RF51 num contrato unico:
 * catalogo de planos, subscricao da empresa ativa, ciclo de vida simulado,
 * auditoria minima e negativos sem gateway de pagamento real.
 */

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
const PAYMENT_FIELDS = Object.freeze([
    "paymentProvider",
    "checkoutUrl",
    "paymentIntentId",
    "invoiceId",
]);

/**
 * Cria uma subscricao persistida em memoria para testes de contrato.
 *
 * @param {object} overrides - Campos a especializar no registo base.
 * @returns {object} Registo coerente com o modelo `CompanySubscription`.
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
        createdAt: new Date("2026-07-01T09:00:00.000Z"),
        updatedAt: new Date("2026-07-01T09:00:00.000Z"),
        ...overrides,
    };
}

/**
 * Devolve uma copia da subscricao para impedir mutacao acidental entre asserts.
 *
 * @param {object | null} subscription - Subscricao guardada no double Prisma.
 * @returns {object | null} Copia segura para o teste.
 */
function copySubscription(subscription) {
    if (!subscription) {
        return null;
    }

    return {
        ...subscription,
        startsAt: subscription.startsAt ? new Date(subscription.startsAt) : null,
        endsAt: subscription.endsAt ? new Date(subscription.endsAt) : null,
        createdAt: subscription.createdAt ? new Date(subscription.createdAt) : null,
        updatedAt: subscription.updatedAt ? new Date(subscription.updatedAt) : null,
    };
}

/**
 * Cria um Prisma em memoria com as operacoes usadas pelos services de subscricao.
 *
 * @param {object | null} initialSubscription - Estado inicial da subscricao.
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
                    : {
                        id: "subscription-mf8-001",
                        createdAt: args.create.startsAt,
                        updatedAt: args.create.startsAt,
                        ...args.create,
                    };

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
                    updatedAt: args.data.updatedAt ?? new Date("2026-07-01T09:05:00.000Z"),
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
            // A transacao em memoria valida a fronteira do service sem abrir DB real.
            return work(this);
        },
    };

    return {
        prisma,
        calls,
        /**
         * Devolve uma cópia da subscrição em memória usada pelo fixture.
         * A cópia evita que os asserts alterem o estado partilhado do teste.
         *
         * @returns {object} Subscrição simulada no estado atual.
         */
        readSubscription() {
            return copySubscription(subscription);
        },
    };
}

/**
 * Verifica erros de dominio pelo codigo publico.
 *
 * @param {string} code - Codigo esperado no erro.
 * @returns {(error: Error & { code?: string }) => boolean} Predicado para `assert.throws`.
 */
function hasDomainCode(code) {
    /**
     * Confirma que o erro lançado expõe o código de domínio esperado.
     *
     * @param {Error & { code?: string }} error - Erro capturado pelo assert.
     * @returns {boolean} Verdadeiro quando o assert interno passa.
     */
    return function assertDomainCode(error) {
        assert.equal(error.code, code);
        return true;
    };
}

/**
 * Confirma que um payload de subscricao ou plano nao promete cobranca real.
 *
 * @param {object} payload - Plano ou subscricao publica.
 * @returns {void}
 */
function assertNoPaymentContract(payload) {
    for (const field of PAYMENT_FIELDS) {
        assert.equal(
            Object.hasOwn(payload, field),
            false,
            `Campo de pagamento real nao permitido: ${field}`,
        );
    }
}

test("RF49 lista os tres planos simulados sem contrato de pagamento real", () => {
    const plans = listSimulatedSubscriptionPlans();

    assert.deepEqual(
        plans.map((plan) => plan.code),
        ["monthly", "quarterly", "yearly"],
    );

    for (const plan of plans) {
        assert.equal(plan.currency, "EUR");
        assert.equal(plan.simulated, true);
        assertNoPaymentContract(plan);
    }
});

test("RF50 ativa subscricao para a empresa ativa e regista auditoria minima", async () => {
    const { prisma, calls, readSubscription } = createPrismaDouble();

    const result = await activateSimulatedSubscription(prisma, {
        companyId: COMPANY_ID,
        userId: USER_ID,
        planCode: "monthly",
        now: NOW,
    });

    assert.equal(result.state, "active");
    assert.equal(result.subscription.companyId, COMPANY_ID);
    assert.equal(result.subscription.planCode, "monthly");
    assert.equal(result.subscription.simulated, true);
    assertNoPaymentContract(result.subscription);

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

test("RF51 renova, cancela e reativa a subscricao sem gateway externo", async () => {
    const { prisma, calls, readSubscription } = createPrismaDouble(createSubscription());

    const renewed = await runSimulatedSubscriptionAction(prisma, {
        companyId: COMPANY_ID,
        userId: USER_ID,
        action: "renew",
        now: NOW,
    });

    assert.equal(renewed.state, "active");
    assert.equal(renewed.subscription.status, "ACTIVE");
    assert.ok(new Date(renewed.subscription.endsAt) > new Date("2026-08-01T09:00:00.000Z"));
    assertNoPaymentContract(renewed.subscription);

    const cancelled = await runSimulatedSubscriptionAction(prisma, {
        companyId: COMPANY_ID,
        userId: USER_ID,
        action: "cancel",
        now: NOW,
    });

    assert.equal(cancelled.state, "cancelled");
    assert.equal(cancelled.subscription.status, "CANCELLED");
    assertNoPaymentContract(cancelled.subscription);

    const reactivated = await runSimulatedSubscriptionAction(prisma, {
        companyId: COMPANY_ID,
        userId: USER_ID,
        action: "reactivate",
        planCode: "yearly",
        now: new Date("2026-09-01T09:00:00.000Z"),
    });

    assert.equal(reactivated.state, "active");
    assert.equal(reactivated.subscription.planCode, "yearly");
    assert.equal(reactivated.subscription.status, "ACTIVE");
    assertNoPaymentContract(reactivated.subscription);

    assert.deepEqual(
        calls.findUnique.map((call) => call.where),
        [{ companyId: COMPANY_ID }, { companyId: COMPANY_ID }, { companyId: COMPANY_ID }],
    );
    assert.deepEqual(
        calls.audit.map((call) => call.data.action),
        ["subscription.renew", "subscription.cancel", "subscription.reactivate"],
    );
    assert.ok(calls.audit.every((call) => call.data.details.simulated === true));
    assertNoPaymentContract(readSubscription());
});

test("RF51 valida negativos de transicao, plano e empresa ativa", async () => {
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
        hasDomainCode("COMPANY_CONTEXT_REQUIRED"),
    );
});
