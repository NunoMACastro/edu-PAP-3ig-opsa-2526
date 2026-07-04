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
// apps/api/src/modules/subscriptions/subscriptionService.js

export const SUBSCRIPTION_LIFECYCLE_ACTION = Object.freeze({
  RENEW: "renew",
  CANCEL: "cancel",
  REACTIVATE: "reactivate",
});

const ALLOWED_LIFECYCLE_TRANSITIONS = Object.freeze({
  [SUBSCRIPTION_STATUS.ACTIVE]: new Set([
    SUBSCRIPTION_LIFECYCLE_ACTION.RENEW,
    SUBSCRIPTION_LIFECYCLE_ACTION.CANCEL,
  ]),
  [SUBSCRIPTION_STATUS.CANCELLED]: new Set([
    SUBSCRIPTION_LIFECYCLE_ACTION.REACTIVATE,
  ]),
  [SUBSCRIPTION_STATUS.EXPIRED]: new Set([
    SUBSCRIPTION_LIFECYCLE_ACTION.REACTIVATE,
  ]),
});

/**
 * Normaliza a ação pedida antes de tocar na base de dados.
 *
 * @param {string} action - Ação recebida no pedido HTTP.
 * @returns {"renew" | "cancel" | "reactivate"} Ação validada.
 * @throws {HttpError} Quando a ação não pertence ao contrato de RF51.
 */
function readSubscriptionLifecycleAction(action) {
  const normalizedAction = requireText(
    action,
    "SUBSCRIPTION_ACTION_REQUIRED",
    "É obrigatório indicar a ação da subscrição.",
  );

  if (!Object.values(SUBSCRIPTION_LIFECYCLE_ACTION).includes(normalizedAction)) {
    throw httpError(
      400,
      "INVALID_SUBSCRIPTION_ACTION",
      "A ação da subscrição deve ser renew, cancel ou reactivate.",
    );
  }

  return normalizedAction;
}

/**
 * Valida os dados de entrada do service de ciclo de vida.
 *
 * @param {{ companyId: string, userId: string, action: string, planCode?: string }} input - Dados vindos da rota protegida.
 * @returns {{ companyId: string, userId: string, action: "renew" | "cancel" | "reactivate", planCode: string | null }} Dados normalizados.
 */
function readSubscriptionLifecycleInput(input) {
  const action = readSubscriptionLifecycleAction(input.action);
  const planCode = input.planCode === undefined || input.planCode === null
    ? null
    : requireText(
      input.planCode,
      "SUBSCRIPTION_PLAN_REQUIRED",
      "É obrigatório indicar um plano válido para reativar a subscrição.",
    );

  if (action === SUBSCRIPTION_LIFECYCLE_ACTION.REACTIVATE && !planCode) {
    throw httpError(
      400,
      "SUBSCRIPTION_PLAN_REQUIRED",
      "A reativação precisa de um plano de subscrição.",
    );
  }

  return {
    companyId: requireActiveCompany(input.companyId),
    userId: requireText(
      input.userId,
      "SUBSCRIPTION_USER_REQUIRED",
      "É obrigatório identificar o utilizador autenticado.",
    ),
    action,
    planCode,
  };
}

/**
 * Confirma que a transição pedida é permitida para o estado atual.
 *
 * @param {{ status: string } | null} subscription - Subscrição atual da empresa.
 * @param {"renew" | "cancel" | "reactivate"} action - Ação validada.
 * @returns {void}
 * @throws {HttpError} Quando não existe subscrição ou a transição é inválida.
 */
export function assertSubscriptionLifecycleTransition(subscription, action) {
  if (!subscription) {
    throw httpError(
      404,
      "SUBSCRIPTION_NOT_FOUND",
      "A empresa ativa ainda não tem uma subscrição para alterar.",
    );
  }

  const allowedActions = ALLOWED_LIFECYCLE_TRANSITIONS[subscription.status];

  // A decisão fica no backend para impedir que a UI force estados impossíveis.
  if (!allowedActions?.has(action)) {
    throw httpError(
      409,
      "INVALID_SUBSCRIPTION_TRANSITION",
      `A subscrição não pode executar ${action} a partir do estado ${subscription.status}.`,
    );
  }
}

/**
 * Calcula os campos Prisma a alterar para a ação pedida.
 *
 * @param {{ subscription: object, action: "renew" | "cancel" | "reactivate", planCode: string | null, now: Date }} input - Contexto da transição.
 * @returns {{ data: object, planCode: string | null, nextStatus: string }} Dados para `update`.
 */
function buildSubscriptionLifecycleUpdate(input) {
  if (input.action === SUBSCRIPTION_LIFECYCLE_ACTION.CANCEL) {
    return {
      data: {
        status: SUBSCRIPTION_STATUS.CANCELLED,
      },
      planCode: input.subscription.planCode,
      nextStatus: SUBSCRIPTION_STATUS.CANCELLED,
    };
  }

  const planCode = input.action === SUBSCRIPTION_LIFECYCLE_ACTION.REACTIVATE
    ? input.planCode
    : input.subscription.planCode;
  const plan = getSimulatedSubscriptionPlan(planCode);
  const currentEndsAt = input.subscription.endsAt
    ? new Date(input.subscription.endsAt)
    : input.now;
  const baseDate = currentEndsAt > input.now ? currentEndsAt : input.now;
  const startsAt = input.action === SUBSCRIPTION_LIFECYCLE_ACTION.REACTIVATE
    ? input.now
    : input.subscription.startsAt;
  const endsAt = calculateSubscriptionCycleEnd(baseDate, plan);

  return {
    data: {
      planCode: plan.code,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      startsAt,
      endsAt,
      simulated: true,
    },
    planCode: plan.code,
    nextStatus: SUBSCRIPTION_STATUS.ACTIVE,
  };
}

/**
 * Executa renovação, cancelamento ou reativação da subscrição atual.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, action: string, planCode?: string, now?: Date }} input - Pedido validado pela rota.
 * @returns {Promise<object>} Payload público da subscrição atualizada.
 */
export async function runSimulatedSubscriptionAction(prisma, input) {
  const lifecycleInput = readSubscriptionLifecycleInput(input);
  const now = input.now instanceof Date ? input.now : new Date();

  const subscription = await prisma.$transaction(async (tx) => {
    const currentSubscription = await tx.companySubscription.findUnique({
      // A pesquisa usa a empresa ativa do backend, nunca um valor escolhido no body.
      where: { companyId: lifecycleInput.companyId },
    });

    assertSubscriptionBelongsToActiveCompany(
      currentSubscription,
      lifecycleInput.companyId,
    );
    assertSubscriptionLifecycleTransition(currentSubscription, lifecycleInput.action);

    const previousStatus = currentSubscription.status;
    const update = buildSubscriptionLifecycleUpdate({
      subscription: currentSubscription,
      action: lifecycleInput.action,
      planCode: lifecycleInput.planCode,
      now,
    });

    const savedSubscription = await tx.companySubscription.update({
      where: { companyId: lifecycleInput.companyId },
      data: update.data,
    });

    // A auditoria guarda a intenção e a transição, sem payload completo nem dados financeiros.
    await recordAuditLog(tx, {
      companyId: lifecycleInput.companyId,
      userId: lifecycleInput.userId,
      action: `subscription.${lifecycleInput.action}`,
      entity: "CompanySubscription",
      entityId: savedSubscription.id,
      details: {
        previousStatus,
        nextStatus: update.nextStatus,
        planCode: update.planCode,
        simulated: true,
      },
    });

    return savedSubscription;
  });

  return formatCurrentSubscription(subscription);
}