/**
 * @file Catálogo canónico dos planos de subscrição simulados da OPSA.
 *
 * Este módulo não conhece Express nem base de dados. A sua responsabilidade é
 * devolver planos estáveis para a API e para os BKs seguintes de subscrição.
 */

export const SIMULATED_PLAN_CODES = Object.freeze(["monthly", "quarterly", "yearly"]);

export const PLAN_NOT_FOUND_CODE = "SUBSCRIPTION_PLAN_NOT_FOUND";

const RAW_PLANS = Object.freeze([
  Object.freeze({
    code: "monthly",
    name: "Plano Mensal",
    description: "Acesso mensal à gestão operacional da empresa.",
    priceCents: 990,
    billingCycle: "month",
    intervalCount: 1,
  }),
  Object.freeze({
    code: "quarterly",
    name: "Plano Trimestral",
    description: "Acesso trimestral com valor reduzido face ao plano mensal.",
    priceCents: 2490,
    billingCycle: "month",
    intervalCount: 3,
  }),
  Object.freeze({
    code: "yearly",
    name: "Plano Anual",
    description: "Acesso anual com o melhor valor para equipas estáveis.",
    priceCents: 8990,
    billingCycle: "year",
    intervalCount: 1,
  }),
]);

/**
 * @typedef {object} SimulatedSubscriptionPlan
 * @property {string} code Identificador técnico do plano.
 * @property {string} name Nome apresentado ao utilizador.
 * @property {string} description Texto curto sobre o plano.
 * @property {number} priceCents Preço em cêntimos.
 * @property {"EUR"} currency Moeda usada pelo catálogo.
 * @property {"month" | "year"} billingCycle Ciclo de faturação.
 * @property {number} intervalCount Quantidade de ciclos por cobrança simulada.
 * @property {true} simulated Indica que o plano não aciona pagamento real.
 */

export class SimulatedSubscriptionPlanError extends Error {
  /**
   * Cria um erro de domínio para plano inexistente.
   *
   * @param {string} code Código de plano recebido pela API.
   */
  constructor(code) {
    super("Plano de subscrição simulado inválido.");
    this.name = "SimulatedSubscriptionPlanError";
    this.code = PLAN_NOT_FOUND_CODE;
    this.status = 404;
    this.planCode = code;
  }
}

/**
 * Devolve uma cópia imutável de todos os planos simulados.
 *
 * @returns {SimulatedSubscriptionPlan[]} Lista ordenada de planos.
 */
export function listSimulatedSubscriptionPlans() {
  return RAW_PLANS.map((plan) =>
    Object.freeze({
      // A cópia impede que outro módulo altere a lista interna por acidente.
      ...plan,
      currency: "EUR",
      simulated: true,
    }),
  );
}

/**
 * Procura um plano pelo código público usado pela API.
 *
 * @param {string} code Código do plano.
 * @returns {SimulatedSubscriptionPlan} Plano encontrado.
 * @throws {SimulatedSubscriptionPlanError} Quando o código não existe.
 */
export function getSimulatedSubscriptionPlan(code) {
  const plan = listSimulatedSubscriptionPlans().find((candidate) => candidate.code === code);

  if (!plan) {
    // O erro próprio deixa a rota devolver sempre o mesmo contrato HTTP.
    throw new SimulatedSubscriptionPlanError(code);
  }

  return plan;
}

/**
 * Converte erros do catálogo para uma resposta HTTP estável.
 *
 * @param {unknown} error Erro capturado pela rota.
 * @returns {{status: number, body: {error: string, message: string}}} Resposta para Express.
 */
export function toSubscriptionPlanErrorResponse(error) {
  if (error instanceof SimulatedSubscriptionPlanError) {
    return {
      status: error.status,
      body: {
        error: error.code,
        message: "O plano de subscrição pedido não existe.",
      },
    };
  }

  return {
    status: 500,
    body: {
      error: "SUBSCRIPTION_PLAN_UNEXPECTED_ERROR",
      message: "Não foi possível obter o plano de subscrição.",
    },
  };
}