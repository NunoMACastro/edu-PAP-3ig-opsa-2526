// apps/api/src/modules/inventory/stockMovementRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { createStockMovement } from "./stockMovementService.js";

export function createStockMovementRouter(prisma) {
  const router = Router();
  const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "OPERACIONAL")];

  router.post("/", guards, async (req, res) => {
    try {
      const movement = await createStockMovement(prisma, {
        companyId: req.companyId,
        userId: req.user.id,
        input: req.body,
      });
      return res.status(201).json({ movement });
    } catch (error) {
      const response = toHttpError(error);
      return res.status(response.status).json(response.body);
    }
  });

  router.get("/", guards, async (req, res) => {
    const items = await prisma.stockMovement.findMany({
      where: { companyId: req.companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.json({ items });
  });

  return router;
}