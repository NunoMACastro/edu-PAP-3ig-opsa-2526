// apps/api/src/modules/subscriptions/subscriptionService.js

import { httpError } from "../../lib/httpErrors.js";
import {
  getSimulatedSubscriptionPlan,
  SimulatedSubscriptionPlanError,
} from "./subscriptionPlans.js";

export const SUBSCRIPTION_STATE = Object.freeze({
  NONE: "none",
  ACTIVE: "active",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
});

/**
 * Garante que existe empresa ativa antes de consultar dados persistentes.
 *
 * @param {string | null | undefined} companyId - Empresa ativa resolvida pela API.
 * @returns {string} Empresa ativa validada.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando não existe empresa ativa.
 */
export function requireActiveCompanyId(companyId) {
  if (typeof companyId !== "string" || companyId.trim().length === 0) {
    throw httpError(
      403,
      "COMPANY_CONTEXT_REQUIRED",
      "É necessário selecionar uma empresa ativa para consultar a subscrição.",
    );
  }

  return companyId;
}

/**
 * Converte datas opcionais para o formato JSON estável da API.
 *
 * @param {Date | string | null | undefined} value - Data vinda do Prisma.
 * @returns {string | null} Data em ISO string ou null.
 */
function toOptionalIsoString(value) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/**
 * Resolve o plano guardado numa subscrição.
 *
 * @param {string} planCode - Código do plano guardado na subscrição.
 * @returns {object} Plano simulado público.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o plano guardado já não existe.
 */
function getPlanForStoredSubscription(planCode) {
  try {
    return getSimulatedSubscriptionPlan(planCode);
  } catch (error) {
    if (error instanceof SimulatedSubscriptionPlanError) {
      throw httpError(
        409,
        "SUBSCRIPTION_PLAN_DRIFT",
        "A subscrição guardada referencia um plano que já não existe no catálogo simulado.",
      );
    }

    throw error;
  }
}

/**
 * Normaliza o registo Prisma para o payload público da rota.
 *
 * @param {object | null} subscription - Registo `CompanySubscription` devolvido pelo Prisma.
 * @returns {object} Payload público de `GET /api/subscriptions/current`.
 */
export function formatCurrentSubscription(subscription) {
  if (!subscription) {
    return {
      state: SUBSCRIPTION_STATE.NONE,
      subscription: null,
    };
  }

  const plan = getPlanForStoredSubscription(subscription.planCode);

  return {
    state: String(subscription.status).toLowerCase(),
    subscription: {
      id: subscription.id,
      companyId: subscription.companyId,
      planCode: subscription.planCode,
      plan,
      status: subscription.status,
      startsAt: toOptionalIsoString(subscription.startsAt),
      endsAt: toOptionalIsoString(subscription.endsAt),
      simulated: subscription.simulated === true,
      createdAt: toOptionalIsoString(subscription.createdAt),
      updatedAt: toOptionalIsoString(subscription.updatedAt),
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
  const companyId = requireActiveCompanyId(context.companyId);

  // A query usa a empresa resolvida pelo backend para evitar leitura cruzada entre empresas.
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
 * @returns {object | null} A subscrição original quando pertence à empresa ativa.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando existe tentativa de cruzar empresas.
 */
export function assertSubscriptionBelongsToActiveCompany(subscription, companyId) {
  const expectedCompanyId = requireActiveCompanyId(companyId);

  if (subscription && subscription.companyId !== expectedCompanyId) {
    throw httpError(
      403,
      "SUBSCRIPTION_COMPANY_FORBIDDEN",
      "A subscrição consultada não pertence à empresa ativa.",
    );
  }

  return subscription;
}