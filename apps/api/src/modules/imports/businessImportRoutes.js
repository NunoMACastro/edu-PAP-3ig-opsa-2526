/**
 * @file Rotas de importações de dados da MF3 reforçadas por RNF23.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { importBusinessData } from "./businessImportService.js";

/**
 * Envia erros HTTP num formato JSON consistente com o contrato da API.
 *
 * @param {import("express").Response} res - Resposta Express usada para enviar o erro.
 * @param {unknown} error - Erro capturado durante a operação.
 * @returns {import("express").Response} Resposta HTTP de erro.
 */
function sendError(res, error) {
  const response = toHttpError(error);
  return res
    .status(response.status)
    .json({ error: response.code, message: response.message, details: response.details });
}

/**
 * Constrói router `/api/imports`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildBusinessImportRoutes({ prisma }) {
  const router = Router();
  const guards = [
    requireAuth(prisma),
    requireCompanyContext(prisma),
    requirePermission(Permission.IMPORTS_WRITE),
    requireRole("ADMIN", "CONTABILISTA"),
  ];

  router.post("/business-data", guards, async (req, res) => {
    try {
      const result = await importBusinessData(prisma, {
        // A empresa e o utilizador vêm dos middlewares, não do ficheiro importado.
        companyId: req.companyId,
        userId: req.user.id,
        input: req.body,
      });
      return res.status(201).json(result);
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}