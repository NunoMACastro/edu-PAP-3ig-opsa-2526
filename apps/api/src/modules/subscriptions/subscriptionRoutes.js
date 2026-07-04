import { Router } from "express";

import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import {
  getSimulatedSubscriptionPlan,
  listSimulatedSubscriptionPlans,
  toSubscriptionPlanErrorResponse,
} from "./subscriptionPlans.js";

/**
 * Constrói os middlewares de segurança usados pelas rotas de subscrição.
 *
 * @param {object} options Opções de configuração.
 * @param {import("@prisma/client").PrismaClient} options.prisma Cliente Prisma da aplicação.
 * @param {Function[] | null} [options.guards] Guards alternativos usados em testes.
 * @returns {Function[]} Middlewares de Express.
 */
export function buildSubscriptionGuards({ prisma, guards = null }) {
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
 * Cria as rotas HTTP do catálogo de subscrições simuladas.
 *
 * @param {object} options Opções da rota.
 * @param {import("@prisma/client").PrismaClient} options.prisma Cliente Prisma da aplicação.
 * @param {Function[] | null} [options.guards] Guards alternativos usados em testes.
 * @returns {Router} Router configurado.
 */
export function buildSubscriptionRoutes({ prisma, guards = null } = {}) {
  const router = Router();
  const subscriptionGuards = buildSubscriptionGuards({ prisma, guards });

  router.get("/plans", subscriptionGuards, (_req, res) => {
    // A API devolve apenas catálogo simulado; nenhum pagamento externo é iniciado aqui.
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
      // A conversão centralizada mantém o mesmo erro para o frontend e para os testes.
      const response = toSubscriptionPlanErrorResponse(error);

      return res.status(response.status).json(response.body);
    }
  });

  return router;
}