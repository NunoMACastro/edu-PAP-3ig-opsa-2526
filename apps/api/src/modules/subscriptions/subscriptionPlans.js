/**
 * @file Catalogo canonico dos planos de subscricao simulados da OPSA.
 *
 * Este modulo nao conhece Express nem base de dados. A sua responsabilidade e
 * devolver planos estaveis para a API e para os BKs seguintes de subscricao.
 */

export const SIMULATED_PLAN_CODES = Object.freeze([
    "monthly",
    "quarterly",
    "yearly",
]);

export const PLAN_NOT_FOUND_CODE = "SUBSCRIPTION_PLAN_NOT_FOUND";

const RAW_PLANS = Object.freeze([
    Object.freeze({
        code: "monthly",
        name: "Plano Mensal",
        description: "Acesso mensal a gestao operacional da empresa.",
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
        description: "Acesso anual com o melhor valor para equipas estaveis.",
        priceCents: 8990,
        billingCycle: "year",
        intervalCount: 1,
    }),
]);

/**
 * @typedef {object} SimulatedSubscriptionPlan
 * @property {string} code - Identificador tecnico do plano.
 * @property {string} name - Nome apresentado ao utilizador.
 * @property {string} description - Texto curto sobre o plano.
 * @property {number} priceCents - Preco em centimos.
 * @property {"EUR"} currency - Moeda usada pelo catalogo.
 * @property {"month" | "year"} billingCycle - Ciclo de faturacao.
 * @property {number} intervalCount - Quantidade de ciclos por cobranca simulada.
 * @property {true} simulated - Indica que o plano nao aciona pagamento real.
 */

export class SimulatedSubscriptionPlanError extends Error {
    /**
     * Cria um erro de dominio para plano inexistente.
     *
     * @param {string} code - Codigo de plano recebido pela API.
     */
    constructor(code) {
        super("Plano de subscricao simulado invalido.");
        this.name = "SimulatedSubscriptionPlanError";
        this.code = PLAN_NOT_FOUND_CODE;
        this.status = 404;
        this.planCode = code;
    }
}

/**
 * Devolve uma copia imutavel de todos os planos simulados.
 *
 * @returns {SimulatedSubscriptionPlan[]} Lista ordenada de planos.
 */
export function listSimulatedSubscriptionPlans() {
    return RAW_PLANS.map((plan) =>
        Object.freeze({
            // A copia impede que outro modulo altere a lista interna por acidente.
            ...plan,
            currency: "EUR",
            simulated: true,
        }),
    );
}

/**
 * Procura um plano pelo codigo publico usado pela API.
 *
 * @param {string} code - Codigo do plano.
 * @returns {SimulatedSubscriptionPlan} Plano encontrado.
 * @throws {SimulatedSubscriptionPlanError} Quando o codigo nao existe.
 */
export function getSimulatedSubscriptionPlan(code) {
    const plan = listSimulatedSubscriptionPlans().find(
        (candidate) => candidate.code === code,
    );

    if (!plan) {
        // O erro proprio deixa a rota devolver sempre o mesmo contrato HTTP.
        throw new SimulatedSubscriptionPlanError(code);
    }

    return plan;
}

/**
 * Converte erros do catalogo para uma resposta HTTP estavel.
 *
 * @param {unknown} error - Erro capturado pela rota.
 * @returns {{status: number, body: {error: string, message: string}}} Resposta para Express.
 */
export function toSubscriptionPlanErrorResponse(error) {
    if (error instanceof SimulatedSubscriptionPlanError) {
        return {
            status: error.status,
            body: {
                error: error.code,
                message: "O plano de subscricao pedido nao existe.",
            },
        };
    }

    return {
        status: 500,
        body: {
            error: "SUBSCRIPTION_PLAN_UNEXPECTED_ERROR",
            message: "Nao foi possivel obter o plano de subscricao.",
        },
    };
}
