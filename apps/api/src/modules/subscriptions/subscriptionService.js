/**
 * @file Service da subscricao simulada atual da empresa ativa.
 *
 * Este modulo concentra a regra multiempresa de leitura da subscricao. A rota
 * HTTP passa apenas o `companyId` calculado pelos middlewares da API; nenhum
 * identificador de empresa vindo do browser decide ownership.
 */

import { httpError } from "../../lib/httpErrors.js";
import { recordAuditLog } from "../audit/auditLogService.js";
import {
    getSimulatedSubscriptionPlan,
    SimulatedSubscriptionPlanError,
} from "./subscriptionPlans.js";

export const SUBSCRIPTION_STATUS = Object.freeze({
    ACTIVE: "ACTIVE",
    CANCELLED: "CANCELLED",
    EXPIRED: "EXPIRED",
});

export const SUBSCRIPTION_STATE = Object.freeze({
    NONE: "none",
    ACTIVE: "active",
    CANCELLED: "cancelled",
    EXPIRED: "expired",
});

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
 * Garante que a consulta tem empresa ativa resolvida pelo backend.
 *
 * @param {string | null | undefined} companyId - Empresa ativa injetada no pedido.
 * @returns {string} Empresa ativa validada.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando falta contexto de empresa.
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
 * Converte uma data opcional para o contrato JSON da API.
 *
 * @param {Date | string | null | undefined} value - Valor devolvido pelo Prisma.
 * @returns {string | null} Data em ISO 8601 ou `null`.
 */
function toOptionalIsoString(value) {
    if (!value) {
        return null;
    }

    return value instanceof Date
        ? value.toISOString()
        : new Date(value).toISOString();
}

/**
 * Valida uma string obrigatoria recebida de um contexto ja autenticado.
 *
 * @param {unknown} value - Valor recebido do caller.
 * @param {string} code - Codigo funcional da falha.
 * @param {string} message - Mensagem segura para resposta HTTP.
 * @returns {string} Texto normalizado.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o valor nao e texto.
 */
function requireText(value, code, message) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw httpError(400, code, message);
    }

    return value.trim();
}

/**
 * Resolve o plano guardado na subscricao contra o catalogo canonico do BK-MF8-03.
 *
 * @param {string} planCode - Codigo persistido na subscricao.
 * @returns {import("./subscriptionPlans.js").SimulatedSubscriptionPlan} Plano publico.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o codigo ja nao existe.
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
 * Resolve um plano escolhido pelo utilizador para ativacao simulada.
 *
 * @param {string} planCode - Codigo recebido no body validado pela rota.
 * @returns {import("./subscriptionPlans.js").SimulatedSubscriptionPlan} Plano canonico.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o plano nao existe.
 */
function getPlanForActivation(planCode) {
    try {
        return getSimulatedSubscriptionPlan(planCode);
    } catch (error) {
        if (error instanceof SimulatedSubscriptionPlanError) {
            throw httpError(
                error.status,
                error.code,
                "O plano de subscrição pedido não existe.",
            );
        }

        throw error;
    }
}

/**
 * Normaliza a acao de ciclo de vida antes de qualquer escrita.
 *
 * @param {unknown} action - Acao recebida da rota protegida.
 * @returns {"renew" | "cancel" | "reactivate"} Acao aceite por RF51.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando a acao e invalida.
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
 * Valida o input minimo das acoes de ciclo de vida.
 *
 * @param {{companyId?: unknown, userId?: unknown, action?: unknown, planCode?: unknown}} input - Dados recebidos da rota.
 * @returns {{companyId: string, userId: string, action: "renew" | "cancel" | "reactivate", planCode: string | null}} Dados normalizados.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando falta contexto ou ha payload invalido.
 */
function readSubscriptionLifecycleInput(input) {
    const action = readSubscriptionLifecycleAction(input?.action);
    const planCode = input?.planCode === undefined || input?.planCode === null
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

    if (action !== SUBSCRIPTION_LIFECYCLE_ACTION.REACTIVATE && planCode) {
        throw httpError(
            400,
            "SUBSCRIPTION_PLAN_NOT_ALLOWED",
            "O plano só pode ser indicado na reativação da subscrição.",
        );
    }

    return {
        companyId: requireActiveCompanyId(input?.companyId),
        userId: requireText(
            input?.userId,
            "SUBSCRIPTION_USER_REQUIRED",
            "É obrigatório identificar o utilizador autenticado.",
        ),
        action,
        planCode,
    };
}

/**
 * Calcula a data final da subscricao a partir do contrato do catalogo.
 *
 * @param {Date} startsAt - Data inicial do ciclo.
 * @param {{billingCycle: string, intervalCount: number}} plan - Plano canonico.
 * @returns {Date} Data final calculada.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o plano tem ciclo invalido.
 */
export function calculateSubscriptionCycleEnd(startsAt, plan) {
    if (!Number.isInteger(plan.intervalCount) || plan.intervalCount <= 0) {
        throw httpError(
            409,
            "INVALID_SUBSCRIPTION_INTERVAL",
            "O plano simulado tem um intervalo inválido.",
        );
    }

    // A copia evita efeitos colaterais no objeto Date recebido pelo caller.
    const endsAt = new Date(startsAt.getTime());

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
 * Normaliza o registo Prisma para o payload publico da API.
 *
 * @param {object | null} subscription - Registo `CompanySubscription` ou ausencia dele.
 * @returns {{state: string, subscription: object | null}} Estado atual da subscricao.
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
 * Consulta a subscricao atual da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{companyId: string}} context - Contexto multiempresa resolvido pela API.
 * @returns {Promise<{state: string, subscription: object | null}>} Payload publico.
 */
export async function getCurrentSubscription(prisma, context) {
    const companyId = requireActiveCompanyId(context?.companyId);

    // A query fica presa ao contexto backend para impedir leitura cruzada entre empresas.
    const subscription = await prisma.companySubscription.findUnique({
        where: { companyId },
    });

    return formatCurrentSubscription(subscription);
}

/**
 * Confirma que uma subscricao reutilizada pertence a empresa ativa.
 *
 * @param {object | null} subscription - Subscricao persistida para reutilizacao.
 * @param {string} companyId - Empresa ativa resolvida pelo backend.
 * @returns {object | null} A subscricao original quando pertence a empresa ativa.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando ha cruzamento de empresas.
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

/**
 * Confirma se a transicao de ciclo de vida e valida para o estado persistido.
 *
 * @param {object | null} subscription - Subscricao atual da empresa ativa.
 * @param {"renew" | "cancel" | "reactivate"} action - Acao normalizada.
 * @returns {void}
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando nao existe subscricao ou a transicao nao e permitida.
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

    // A maquina de estados fica no backend; a UI nunca decide transicoes finais.
    if (!allowedActions?.has(action)) {
        throw httpError(
            409,
            "INVALID_SUBSCRIPTION_TRANSITION",
            `A subscrição não pode executar ${action} a partir do estado ${subscription.status}.`,
        );
    }
}

/**
 * Calcula os campos persistidos para renovar, cancelar ou reativar.
 *
 * @param {{subscription: object, action: "renew" | "cancel" | "reactivate", planCode: string | null, now: Date}} input - Contexto validado da transicao.
 * @returns {{data: object, planCode: string, nextStatus: string}} Dados para Prisma e auditoria.
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

    if (input.action === SUBSCRIPTION_LIFECYCLE_ACTION.REACTIVATE) {
        const plan = getPlanForActivation(input.planCode);

        return {
            data: {
                planCode: plan.code,
                status: SUBSCRIPTION_STATUS.ACTIVE,
                startsAt: input.now,
                endsAt: calculateSubscriptionCycleEnd(input.now, plan),
                simulated: true,
            },
            planCode: plan.code,
            nextStatus: SUBSCRIPTION_STATUS.ACTIVE,
        };
    }

    const plan = getPlanForStoredSubscription(input.subscription.planCode);
    const currentEndsAt = input.subscription.endsAt
        ? new Date(input.subscription.endsAt)
        : input.now;
    const baseDate = currentEndsAt > input.now ? currentEndsAt : input.now;

    return {
        data: {
            planCode: plan.code,
            status: SUBSCRIPTION_STATUS.ACTIVE,
            startsAt: input.subscription.startsAt,
            endsAt: calculateSubscriptionCycleEnd(baseDate, plan),
            simulated: true,
        },
        planCode: plan.code,
        nextStatus: SUBSCRIPTION_STATUS.ACTIVE,
    };
}

/**
 * Valida o input minimo da ativacao antes de escrever em base de dados.
 *
 * @param {{companyId?: unknown, userId?: unknown, planCode?: unknown}} input - Dados recebidos da rota.
 * @returns {{companyId: string, userId: string, planCode: string}} Dados normalizados.
 */
function readActivationInput(input) {
    return {
        companyId: requireActiveCompanyId(input?.companyId),
        userId: requireText(
            input?.userId,
            "SUBSCRIPTION_USER_REQUIRED",
            "É obrigatório identificar o utilizador autenticado.",
        ),
        planCode: requireText(
            input?.planCode,
            "SUBSCRIPTION_PLAN_REQUIRED",
            "É obrigatório indicar o plano de subscrição.",
        ),
    };
}

/**
 * Ativa ou substitui a subscricao simulada da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{companyId: string, userId: string, planCode: string, now?: Date}} input - Pedido de ativacao validado pela rota.
 * @returns {Promise<{state: string, subscription: object | null}>} Subscricao atualizada.
 */
export async function activateSimulatedSubscription(prisma, input) {
    const activation = readActivationInput(input);
    const plan = getPlanForActivation(activation.planCode);
    const startsAt = input.now instanceof Date ? input.now : new Date();
    const endsAt = calculateSubscriptionCycleEnd(startsAt, plan);

    const subscription = await prisma.$transaction(async (tx) => {
        const savedSubscription = await tx.companySubscription.upsert({
            // A chave unica vem do BK-MF8-04 e impede duplicados por empresa.
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
 * Executa renovacao, cancelamento ou reativacao simulada da subscricao atual.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{companyId: string, userId: string, action: string, planCode?: string, now?: Date}} input - Pedido de ciclo de vida validado pela rota.
 * @returns {Promise<{state: string, subscription: object | null}>} Subscricao atualizada.
 */
export async function runSimulatedSubscriptionAction(prisma, input) {
    const lifecycleInput = readSubscriptionLifecycleInput(input);
    const now = input.now instanceof Date ? input.now : new Date();

    const subscription = await prisma.$transaction(async (tx) => {
        const currentSubscription = await tx.companySubscription.findUnique({
            // O filtro usa a empresa ativa resolvida no backend, nunca `companyId` do body.
            where: { companyId: lifecycleInput.companyId },
        });

        assertSubscriptionBelongsToActiveCompany(
            currentSubscription,
            lifecycleInput.companyId,
        );
        assertSubscriptionLifecycleTransition(
            currentSubscription,
            lifecycleInput.action,
        );

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
