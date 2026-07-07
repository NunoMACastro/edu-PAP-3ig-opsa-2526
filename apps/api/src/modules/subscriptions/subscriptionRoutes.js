/**
 * @file Rotas de catalogo de subscricoes simuladas da OPSA.
 */

import { Router } from "express";

import { httpError, toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import {
    getSimulatedSubscriptionPlan,
    listSimulatedSubscriptionPlans,
    toSubscriptionPlanErrorResponse,
} from "./subscriptionPlans.js";
import {
    activateSimulatedSubscription,
    getCurrentSubscription,
    runSimulatedSubscriptionAction,
} from "./subscriptionService.js";

const ACTIVATION_BODY_KEYS = new Set(["planCode"]);
const LIFECYCLE_BODY_KEYS = new Set(["action", "planCode"]);

/**
 * Envia um erro operacional normalizado sem expor stack traces ou queries.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {unknown} error - Erro capturado pela rota.
 * @returns {import("express").Response} Resposta JSON segura.
 */
function sendHttpError(res, error) {
    const httpError = toHttpError(error);

    return res.status(httpError.status).json({
        error: httpError.code,
        message: httpError.message,
    });
}

/**
 * Le e valida o body permitido para ativacao simulada.
 *
 * @param {unknown} body - Body JSON recebido pela rota.
 * @returns {{planCode: string}} Dados normalizados para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o body e invalido.
 */
function readActivationBody(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(
            400,
            "INVALID_SUBSCRIPTION_ACTIVATION",
            "O pedido de ativação deve enviar um objeto JSON.",
        );
    }

    const unexpectedKeys = Object.keys(body).filter(
        (key) => !ACTIVATION_BODY_KEYS.has(key),
    );

    if (unexpectedKeys.length > 0) {
        throw httpError(
            400,
            "INVALID_SUBSCRIPTION_ACTIVATION",
            "A ativação só pode receber o código do plano.",
        );
    }

    if (typeof body.planCode !== "string" || body.planCode.trim().length === 0) {
        throw httpError(
            400,
            "INVALID_SUBSCRIPTION_ACTIVATION",
            "É obrigatório indicar um planCode válido.",
        );
    }

    return { planCode: body.planCode.trim() };
}

/**
 * Le e valida o body permitido para renovacao, cancelamento e reativacao.
 *
 * @param {unknown} body - Body JSON recebido pela rota.
 * @returns {{action: string, planCode?: string}} Dados normalizados para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o body e invalido.
 */
function readLifecycleActionBody(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(
            400,
            "INVALID_SUBSCRIPTION_ACTION_BODY",
            "O pedido deve enviar um objeto JSON.",
        );
    }

    const unexpectedKeys = Object.keys(body).filter(
        (key) => !LIFECYCLE_BODY_KEYS.has(key),
    );

    if (unexpectedKeys.length > 0) {
        throw httpError(
            400,
            "INVALID_SUBSCRIPTION_ACTION_BODY",
            "A ação de subscrição só pode receber action e planCode.",
        );
    }

    if (typeof body.action !== "string" || body.action.trim().length === 0) {
        throw httpError(
            400,
            "SUBSCRIPTION_ACTION_REQUIRED",
            "É obrigatório indicar a ação da subscrição.",
        );
    }

    if (body.planCode !== undefined && typeof body.planCode !== "string") {
        throw httpError(
            400,
            "SUBSCRIPTION_PLAN_INVALID",
            "O plano deve ser identificado por texto.",
        );
    }

    const result = {
        action: body.action.trim(),
    };

    if (body.planCode !== undefined) {
        result.planCode = body.planCode.trim();
    }

    return result;
}

/**
 * Constroi os middlewares de seguranca usados pelas rotas de subscricao.
 *
 * @param {object} options - Opcoes de configuracao.
 * @param {import("@prisma/client").PrismaClient} [options.prisma] - Cliente Prisma da aplicacao.
 * @param {Function[] | null} [options.guards] - Guards alternativos usados em testes.
 * @returns {Function[]} Middlewares de Express.
 */
export function buildSubscriptionGuards({ prisma, guards = null } = {}) {
    if (Array.isArray(guards)) {
        return guards;
    }

    return [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requireRole("ADMIN", "GESTOR"),
    ];
}

/**
 * Cria as rotas HTTP do catalogo de subscricoes simuladas.
 *
 * @param {object} options - Opcoes da rota.
 * @param {import("@prisma/client").PrismaClient} [options.prisma] - Cliente Prisma da aplicacao.
 * @param {Function[] | null} [options.guards] - Guards alternativos usados em testes.
 * @returns {Router} Router configurado.
 */
export function buildSubscriptionRoutes({ prisma, guards = null } = {}) {
    const router = Router();
    const subscriptionGuards = buildSubscriptionGuards({ prisma, guards });

    router.get("/plans", subscriptionGuards, (_req, res) => {
        // A API devolve apenas catalogo simulado; nenhum pagamento externo e iniciado aqui.
        return res.status(200).json({
            plans: listSimulatedSubscriptionPlans(),
        });
    });

    router.get("/plans/:code", subscriptionGuards, (req, res) => {
        try {
            return res.status(200).json({
                plan: getSimulatedSubscriptionPlan(req.params.code),
            });
        } catch (error) {
            // A conversao centralizada mantem o mesmo erro para o frontend e para os testes.
            const response = toSubscriptionPlanErrorResponse(error);

            return res.status(response.status).json(response.body);
        }
    });

    router.get("/current", subscriptionGuards, async (req, res) => {
        try {
            const currentSubscription = await getCurrentSubscription(prisma, {
                // `req.companyId` vem do middleware multiempresa, nao do body/query.
                companyId: req.companyId,
            });

            return res.status(200).json(currentSubscription);
        } catch (error) {
            return sendHttpError(res, error);
        }
    });

    router.post("/current/activate", subscriptionGuards, async (req, res) => {
        try {
            const body = readActivationBody(req.body);
            const currentSubscription = await activateSimulatedSubscription(prisma, {
                // O browser escolhe apenas o plano; empresa e utilizador vêm dos middlewares.
                companyId: req.companyId,
                userId: req.user?.id,
                planCode: body.planCode,
            });

            return res.status(200).json(currentSubscription);
        } catch (error) {
            return sendHttpError(res, error);
        }
    });

    router.post("/current/actions", subscriptionGuards, async (req, res) => {
        try {
            const body = readLifecycleActionBody(req.body);
            const currentSubscription = await runSimulatedSubscriptionAction(prisma, {
                // A rota recebe apenas a intencao; ownership e autorizacao ficam nos guards.
                companyId: req.companyId,
                userId: req.user?.id,
                action: body.action,
                planCode: body.planCode,
            });

            return res.status(200).json(currentSubscription);
        } catch (error) {
            return sendHttpError(res, error);
        }
    });

    return router;
}
