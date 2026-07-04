// apps/api/src/modules/subscriptions/subscriptionRoutes.js

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import {
  getSimulatedSubscriptionPlan,
  listSimulatedSubscriptionPlans,
  SimulatedSubscriptionPlanError,
} from "./subscriptionPlans.js";
import { getCurrentSubscription } from "./subscriptionService.js";

function sendError(res, error) {
  const normalized = toHttpError(error);

  return res.status(normalized.status).json({
    error: normalized.code,
    message: normalized.message,
  });
}

function sendPlanError(res, error) {
  if (error instanceof SimulatedSubscriptionPlanError) {
    return res.status(404).json({
      error: "SUBSCRIPTION_PLAN_NOT_FOUND",
      message: "O plano de subscrição simulado não existe.",
    });
  }

  return sendError(res, error);
}

/**
 * Cria os guards reais usados em produção para subscrições simuladas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @returns {import("express").RequestHandler[]} Lista de middlewares de segurança.
 */
export function buildSubscriptionGuards(prisma) {
  return [
    requireAuth(prisma),
    requireCompanyContext(prisma),
    requireRole("ADMIN", "GESTOR"),
  ];
}

/**
 * Cria o router HTTP das subscrições simuladas.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, guards?: import("express").RequestHandler[] }} dependencies - Dependências da rota.
 * @returns {Router} Router Express pronto a montar em `/api/subscriptions`.
 */
export function buildSubscriptionRoutes({
  prisma,
  guards = buildSubscriptionGuards(prisma),
}) {
  const router = Router();

  router.get("/plans", guards, (req, res) => {
    return res.status(200).json({
      plans: listSimulatedSubscriptionPlans(),
    });
  });

  router.get("/plans/:code", guards, (req, res) => {
    try {
      return res.status(200).json({
        plan: getSimulatedSubscriptionPlan(req.params.code),
      });
    } catch (error) {
      return sendPlanError(res, error);
    }
  });

  router.get("/current", guards, async (req, res) => {
    try {
      // req.companyId vem do middleware multiempresa e não de input do browser.
      const currentSubscription = await getCurrentSubscription(prisma, {
        companyId: req.companyId,
      });

      return res.status(200).json(currentSubscription);
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}