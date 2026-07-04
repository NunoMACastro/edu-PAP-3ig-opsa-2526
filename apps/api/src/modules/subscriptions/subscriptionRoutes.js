// apps/api/src/modules/subscriptions/subscriptionRoutes.js

/**
 * @file Rotas HTTP para planos e subscrições simuladas.
 *
 * A rota de ativação aceita apenas a intenção do utilizador: o código do plano.
 * Autenticação, empresa ativa e role são resolvidas por middlewares do backend.
 */

import { Router } from "express";
import { httpError, toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import {
  SimulatedSubscriptionPlanError,
  getSimulatedSubscriptionPlan,
  listSimulatedSubscriptionPlans,
} from "./subscriptionPlans.js";
import {
  activateSimulatedSubscription,
  getCurrentSubscription,
  rethrowSubscriptionError,
} from "./subscriptionService.js";

const SUBSCRIPTION_ROLES = Object.freeze(["ADMIN", "GESTOR"]);

/**
 * Envia erros HTTP no formato estável da API.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {unknown} error - Erro capturado.
 * @returns {import("express").Response} Resposta JSON.
 */
function sendError(res, error) {
  const httpErrorResponse = toHttpError(error);
  return res.status(httpErrorResponse.status).json({
    error: httpErrorResponse.code,
    message: httpErrorResponse.message,
  });
}

/**
 * Normaliza erros do catálogo para resposta HTTP.
 *
 * @param {unknown} error - Erro capturado.
 * @returns {unknown} Erro normalizado para `sendError`.
 */
function normalizeSubscriptionError(error) {
  if (error instanceof SimulatedSubscriptionPlanError) {
    return httpError(error.status, error.code, error.message);
  }

  try {
    rethrowSubscriptionError(error);
  } catch (normalizedError) {
    return normalizedError;
  }

  return error;
}

/**
 * Lê o body da ativação e valida apenas o campo permitido.
 *
 * @param {unknown} body - Body JSON recebido.
 * @returns {{ planCode: string }} Dados normalizados para o service.
 */
function readActivationBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError(
      400,
      "INVALID_SUBSCRIPTION_ACTIVATION",
      "O pedido de ativação deve enviar um objeto JSON.",
    );
  }

  const { planCode } = body;
  if (typeof planCode !== "string" || planCode.trim().length === 0) {
    throw httpError(
      400,
      "INVALID_SUBSCRIPTION_ACTIVATION",
      "É obrigatório indicar um planCode válido.",
    );
  }

  return { planCode: planCode.trim() };
}

/**
 * Cria a sequência de middlewares usada pelas rotas protegidas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @returns {import("express").RequestHandler[]} Guards Express.
 */
function buildSubscriptionGuards(prisma) {
  return [
    // A ordem importa: primeiro identifica o utilizador, depois a empresa, só depois a role.
    requireAuth(prisma),
    requireCompanyContext(prisma),
    requireRole(...SUBSCRIPTION_ROLES),
  ];
}

/**
 * Constrói o router de subscrições simuladas.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, guards?: import("express").RequestHandler[] }} options - Dependências da rota.
 * @returns {Router} Router Express.
 */
export function buildSubscriptionRoutes(options) {
  const router = Router();
  const prisma = options.prisma;
  const protectedGuards = options.guards ?? buildSubscriptionGuards(prisma);

  router.get("/plans", (_req, res) => {
    return res.status(200).json({
      plans: listSimulatedSubscriptionPlans(),
    });
  });

  router.get("/plans/:code", (req, res) => {
    try {
      return res.status(200).json({
        plan: getSimulatedSubscriptionPlan(req.params.code),
      });
    } catch (error) {
      return sendError(res, normalizeSubscriptionError(error));
    }
  });

  router.get("/current", protectedGuards, async (req, res) => {
    try {
      const result = await getCurrentSubscription(prisma, {
        // req.companyId vem do middleware multiempresa, não de body ou query string.
        companyId: req.companyId,
      });

      return res.status(200).json(result);
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.post("/current/activate", protectedGuards, async (req, res) => {
    try {
      const body = readActivationBody(req.body);
      const result = await activateSimulatedSubscription(prisma, {
        // O cliente escolhe só o plano; empresa e utilizador vêm do contexto autenticado.
        companyId: req.companyId,
        userId: req.user.id,
        planCode: body.planCode,
      });

      return res.status(200).json(result);
    } catch (error) {
      return sendError(res, normalizeSubscriptionError(error));
    }
  });

  return router;
}

// apps/api/src/modules/subscriptions/subscriptionRoutes.js

import {
  activateSimulatedSubscription,
  getCurrentSubscription,
  rethrowSubscriptionError,
  runSimulatedSubscriptionAction,
} from "./subscriptionService.js";

/**
 * Lê o body das ações de ciclo de vida da subscrição.
 *
 * @param {object} body - Body JSON recebido pela rota.
 * @returns {{ action: string, planCode?: string }} Dados normalizados para o service.
 */
function readLifecycleActionBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError(
      400,
      "INVALID_SUBSCRIPTION_ACTION_BODY",
      "O pedido deve enviar um objeto JSON.",
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

  return {
    action: body.action.trim(),
    planCode: body.planCode?.trim(),
  };
}

router.post("/current/actions", protectedGuards, async (req, res) => {
  try {
    const body = readLifecycleActionBody(req.body);
    const result = await runSimulatedSubscriptionAction(prisma, {
      // Empresa e utilizador vêm dos middlewares, não do browser.
      companyId: req.companyId,
      userId: req.user.id,
      action: body.action,
      planCode: body.planCode,
    });

    return res.status(200).json(result);
  } catch (error) {
    // Erros de catálogo e erros HTTP do service são devolvidos de forma controlada.
    return sendError(res, normalizeSubscriptionError(error));
  }
});