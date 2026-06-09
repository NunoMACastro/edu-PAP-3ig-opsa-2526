// apps/api/src/modules/inventory/fifoCostRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { previewFifoCost } from "./fifoCostService.js";

export function createFifoCostRouter(prisma) {
  const router = Router();
  const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA")];

  router.get("/preview", guards, async (req, res) => {
    try {
      const result = await previewFifoCost(prisma, {
        companyId: req.companyId,
        itemId: String(req.query.itemId ?? ""),
        warehouseId: String(req.query.warehouseId ?? ""),
        quantity: Number(req.query.quantity),
      });
      return res.json(result);
    } catch (error) {
      const response = toHttpError(error);
      return res.status(response.status).json(response.body);
    }
  });
  return router;
}