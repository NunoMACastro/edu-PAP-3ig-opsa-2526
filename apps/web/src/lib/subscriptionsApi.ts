/**
 * @file Cliente frontend para planos e subscrições simuladas da MF8.
 */

import { ApiError, createApiClient } from "./apiClient";
import { formatEuroFromCents } from "./formatters";

export type SimulatedSubscriptionPlanCode = "monthly" | "quarterly" | "yearly";
export type SimulatedSubscriptionBillingCycle = "month" | "year";
export type SubscriptionState = "none" | "active" | "cancelled" | "expired";
export type SubscriptionAction = "activate" | "renew" | "cancel" | "reactivate";

export interface SimulatedSubscriptionPlan {
  code: SimulatedSubscriptionPlanCode;
  name: string;
  description: string;
  priceCents: number;
  currency: "EUR";
  billingCycle: SimulatedSubscriptionBillingCycle;
  intervalCount: number;
  simulated: true;
}

export interface PublicCompanySubscription {
  id: string;
  planCode: SimulatedSubscriptionPlanCode;
  plan: SimulatedSubscriptionPlan;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
  startsAt: string | null;
  endsAt: string | null;
  simulated: true;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SubscriptionStateResponse {
  state: SubscriptionState;
  subscription: PublicCompanySubscription | null;
}

export interface SubscriptionOverview {
  plans: SimulatedSubscriptionPlan[];
  current: SubscriptionStateResponse;
}

export interface SubscriptionActionRequest {
  action: SubscriptionAction;
  planCode?: SimulatedSubscriptionPlanCode;
}

const api = createApiClient();

/**
 * Carrega os planos simulados e a subscrição atual da empresa ativa.
 *
 * O cliente central acrescenta `/api` e envia cookies HttpOnly. Por isso, este
 * módulo usa caminhos relativos ao domínio de subscrições.
 *
 * @returns Planos e estado atual necessários para desenhar a página.
 */
export async function loadSubscriptionOverview(): Promise<SubscriptionOverview> {
  const [plansResponse, current] = await Promise.all([
    api.request<{ plans: SimulatedSubscriptionPlan[] }>(
      "GET",
      "/subscriptions/plans",
    ),
    api.request<SubscriptionStateResponse>("GET", "/subscriptions/current"),
  ]);

  return {
    plans: plansResponse.plans,
    current,
  };
}

/**
 * Executa uma ação simulada de subscrição no backend.
 *
 * `activate` usa o endpoint de ativação do BK-MF8-05. As restantes ações usam
 * o endpoint de ciclo de vida do BK-MF8-06.
 *
 * @param request - Ação pedida pela UI e plano quando a ação precisa dele.
 * @returns Estado atualizado da subscrição.
 */
export async function runSubscriptionAction(
  request: SubscriptionActionRequest,
): Promise<SubscriptionStateResponse> {
  if (
    (request.action === "activate" || request.action === "reactivate") &&
    !request.planCode
  ) {
    throw new Error("Escolhe um plano antes de executar esta ação.");
  }

  if (request.action === "activate") {
    return api.request<SubscriptionStateResponse>(
      "POST",
      "/subscriptions/current/activate",
      {
        body: { planCode: request.planCode },
      },
    );
  }

  const body =
    request.action === "reactivate"
      ? { action: request.action, planCode: request.planCode }
      : { action: request.action };

  return api.request<SubscriptionStateResponse>(
    "POST",
    "/subscriptions/current/actions",
    { body },
  );
}

/**
 * Formata o preço de um plano para apresentação em português de Portugal.
 *
 * @param plan - Plano simulado devolvido pelo backend.
 * @returns Preço formatado em euros.
 */
export function formatPlanPrice(plan: SimulatedSubscriptionPlan): string {
  return formatEuroFromCents(plan.priceCents);
}

/**
 * Descreve o ciclo de faturação simulado sem transformar a ação em pagamento real.
 *
 * @param plan - Plano simulado devolvido pelo backend.
 * @returns Texto curto para a UI.
 */
export function formatBillingCycle(plan: SimulatedSubscriptionPlan): string {
  if (plan.billingCycle === "year") {
    return plan.intervalCount === 1
      ? "ciclo anual simulado"
      : `${plan.intervalCount} ciclos anuais simulados`;
  }

  return plan.intervalCount === 1
    ? "ciclo mensal simulado"
    : `${plan.intervalCount} meses simulados`;
}

/**
 * Converte o estado técnico da subscrição numa etiqueta curta.
 *
 * @param state - Estado público devolvido pela API.
 * @returns Etiqueta em português de Portugal.
 */
export function formatSubscriptionState(state: SubscriptionState): string {
  const labels: Record<SubscriptionState, string> = {
    none: "Sem subscrição",
    active: "Ativa",
    cancelled: "Cancelada",
    expired: "Expirada",
  };

  return labels[state];
}

/**
 * Indica se uma ação deve estar disponível na UI para o estado atual.
 *
 * Esta função melhora a experiência do utilizador, mas não substitui validação
 * backend. O servidor continua a rejeitar transições inválidas.
 *
 * @param current - Estado público atual.
 * @param action - Ação pedida.
 * @returns `true` quando a UI deve mostrar a ação como disponível.
 */
export function isSubscriptionActionEnabled(
  current: SubscriptionStateResponse,
  action: SubscriptionAction,
): boolean {
  if (action === "activate") {
    return current.state === "none";
  }

  if (action === "renew" || action === "cancel") {
    return current.state === "active";
  }

  return current.state === "cancelled" || current.state === "expired";
}

/**
 * Traduz erros comuns da API para mensagens seguras para a interface.
 *
 * @param error - Erro capturado na chamada HTTP.
 * @returns Mensagem curta para apresentar ao utilizador.
 */
export function explainSubscriptionApiError(error: Error): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "A sessão expirou. Entra novamente antes de gerir a subscrição.";
    }

    if (error.status === 403) {
      return "A tua role atual não permite gerir a subscrição desta empresa.";
    }

    if (error.status === 404) {
      return "O plano ou a subscrição pedidos não existem no contexto atual.";
    }

    if (error.status === 409) {
      return error.message;
    }
  }

  return error.message || "Não foi possível concluir a operação.";
}
