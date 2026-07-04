/**
 * @file Regras de domínio para consulta e ativação de subscrições simuladas.
 *
 * Este módulo não conhece Express. Recebe o contexto já validado pela rota,
 * consulta o catálogo canónico e grava a subscrição atual da empresa.
 */

import { httpError } from "../../lib/httpErrors.js";
import {
  SimulatedSubscriptionPlanError,
  getSimulatedSubscriptionPlan,
} from "./subscriptionPlans.js";
import { recordAuditLog } from "../audit/auditLogService.js";

const SUBSCRIPTION_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
});

const PUBLIC_STATE_BY_STATUS = Object.freeze({
  [SUBSCRIPTION_STATUS.ACTIVE]: "active",
  [SUBSCRIPTION_STATUS.CANCELLED]: "cancelled",
  [SUBSCRIPTION_STATUS.EXPIRED]: "expired",
});

/**
 * Valida o identificador da empresa ativa resolvida pelo backend.
 *
 * @param {string} companyId - Empresa ativa calculada pelo middleware multiempresa.
 * @returns {string} Empresa validada.
 */
function requireActiveCompany(companyId) {
  if (typeof companyId !== "string" || companyId.trim().length === 0) {
    throw httpError(
      403,
      "ACTIVE_COMPANY_REQUIRED",
      "É obrigatória uma empresa ativa para gerir subscrições.",
    );
  }

  return companyId.trim();
}

/**
 * Valida uma string obrigatória de domínio.
 *
 * @param {unknown} value - Valor recebido do caller.
 * @param {string} code - Código funcional da falha.
 * @param {string} message - Mensagem segura para a API.
 * @returns {string} Valor normalizado.
 */
function requireText(value, code, message) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw httpError(400, code, message);
  }

  return value.trim();
}

/**
 * Converte um estado persistido para o contrato público da API.
 *
 * @param {string} status - Estado guardado no Prisma.
 * @returns {string} Estado público.
 */
function toPublicSubscriptionState(status) {
  return PUBLIC_STATE_BY_STATUS[status] ?? "unknown";
}

/**
 * Converte uma data opcional para ISO sem expor objetos Date crus.
 *
 * @param {Date | string | null | undefined} value - Valor persistido.
 * @returns {string | null} Data ISO ou null.
 */
function toOptionalIsoString(value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/**
 * Calcula a data final de uma subscrição a partir do contrato do catálogo.
 *
 * @param {Date} startsAt - Data inicial do ciclo.
 * @param {{ billingCycle: "month" | "year", intervalCount: number }} plan - Plano canónico.
 * @returns {Date} Data final calculada.
 */
export function calculateSubscriptionCycleEnd(startsAt, plan) {
  if (!Number.isInteger(plan.intervalCount) || plan.intervalCount <= 0) {
    throw httpError(
      409,
      "INVALID_SUBSCRIPTION_INTERVAL",
      "O plano simulado tem um intervalo inválido.",
    );
  }

  // Trabalhamos numa cópia da data inicial para não alterar o objeto recebido pelo caller.
  const endsAt = new Date(startsAt);

  if (plan.billingCycle === "month") {
    endsAt.setMonth(endsAt.getMonth() + plan.intervalCount);
    return endsAt;
  }

  if (plan.billingCycle === "year") {
    endsAt.setFullYear(endsAt.getFullYear() + plan.intervalCount);
    return endsAt;
  }

  throw httpError(
    409,
    "INVALID_SUBSCRIPTION_CYCLE",
    "O plano simulado tem um ciclo de faturação inválido.",
  );
}

/**
 * Acrescenta dados públicos do plano à subscrição persistida.
 *
 * @param {object | null} subscription - Subscrição persistida.
 * @returns {object} Payload público da subscrição atual.
 */
export function formatCurrentSubscription(subscription) {
  if (!subscription) {
    return {
      active: false,
      state: "none",
      subscription: null,
    };
  }

  const plan = getSimulatedSubscriptionPlan(subscription.planCode);

  return {
    active: subscription.status === SUBSCRIPTION_STATUS.ACTIVE,
    state: toPublicSubscriptionState(subscription.status),
    subscription: {
      id: subscription.id,
      planCode: subscription.planCode,
      planName: plan.name,
      status: subscription.status,
      state: toPublicSubscriptionState(subscription.status),
      startsAt: toOptionalIsoString(subscription.startsAt),
      endsAt: toOptionalIsoString(subscription.endsAt),
      simulated: Boolean(subscription.simulated),
    },
  };
}

/**
 * Consulta a subscrição atual da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string }} context - Contexto multiempresa calculado pela API.
 * @returns {Promise<object>} Payload público da subscrição atual.
 */
export async function getCurrentSubscription(prisma, context) {
  const companyId = requireActiveCompany(context.companyId);

  const subscription = await prisma.companySubscription.findUnique({
    where: { companyId },
  });

  return formatCurrentSubscription(subscription);
}

/**
 * Confirma que um registo reutilizado pertence à empresa ativa.
 *
 * @param {object | null} subscription - Subscrição persistida.
 * @param {string} companyId - Empresa ativa resolvida pela API.
 * @returns {object | null} Subscrição original quando pertence à empresa ativa.
 */
export function assertSubscriptionBelongsToActiveCompany(subscription, companyId) {
  const expectedCompany = requireActiveCompany(companyId);

  if (subscription && subscription.companyId !== expectedCompany) {
    throw httpError(
      403,
      "SUBSCRIPTION_COMPANY_FORBIDDEN",
      "A subscrição consultada não pertence à empresa ativa.",
    );
  }

  return subscription;
}

/**
 * Valida o input mínimo da ativação antes de abrir a transação.
 *
 * @param {{ companyId: unknown, userId: unknown, planCode: unknown }} input - Dados de ativação.
 * @returns {{ companyId: string, userId: string, planCode: string }} Dados normalizados.
 */
function readActivationInput(input) {
  return {
    companyId: requireActiveCompany(input.companyId),
    userId: requireText(
      input.userId,
      "SUBSCRIPTION_USER_REQUIRED",
      "É obrigatório identificar o utilizador autenticado.",
    ),
    planCode: requireText(
      input.planCode,
      "SUBSCRIPTION_PLAN_REQUIRED",
      "É obrigatório indicar o plano de subscrição.",
    ),
  };
}

/**
 * Ativa ou substitui a subscrição simulada da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, planCode: string, now?: Date }} input - Dados de ativação vindos da rota.
 * @returns {Promise<object>} Payload público da subscrição ativa.
 */
export async function activateSimulatedSubscription(prisma, input) {
  const activation = readActivationInput(input);
  const plan = getSimulatedSubscriptionPlan(activation.planCode);
  const startsAt = input.now instanceof Date ? input.now : new Date();
  const endsAt = calculateSubscriptionCycleEnd(startsAt, plan);

  // A transação mantém a subscrição e a auditoria alinhadas para a mesma ativação.
  const subscription = await prisma.$transaction(async (tx) => {
    const savedSubscription = await tx.companySubscription.upsert({
      // A empresa vem do contexto backend; isto impede duplicados e ownership vindo do browser.
      where: { companyId: activation.companyId },
      update: {
        planCode: plan.code,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        startsAt,
        endsAt,
        simulated: true,
      },
      create: {
        companyId: activation.companyId,
        planCode: plan.code,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        startsAt,
        endsAt,
        simulated: true,
      },
    });

    // A auditoria guarda só dados mínimos, sem body completo nem informação de pagamento.
    await recordAuditLog(tx, {
      companyId: activation.companyId,
      userId: activation.userId,
      action: "subscription.activate",
      entity: "CompanySubscription",
      entityId: savedSubscription.id,
      details: {
        planCode: plan.code,
        simulated: true,
      },
    });

    return savedSubscription;
  });

  return formatCurrentSubscription(subscription);
}

/**
 * Converte erro de catálogo em erro HTTP já esperado pela API.
 *
 * @param {unknown} error - Erro capturado no controller.
 * @returns {never} Lança sempre o erro normalizado.
 */
export function rethrowSubscriptionError(error) {
  if (error instanceof SimulatedSubscriptionPlanError) {
    throw httpError(error.status, error.code, error.message);
  }

  throw error;
}