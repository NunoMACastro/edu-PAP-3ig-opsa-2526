// apps/api/src/modules/inventory/inventoryCountRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import {
  createInventoryCount,
  postInventoryCount,
  saveInventoryCountLines,
} from "./inventoryCountService.js";

export function createInventoryCountRouter(prisma) {
  const router = Router();
  const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "OPERACIONAL")];
  const sendError = (res, error) => {
    const response = toHttpError(error);
    return res.status(response.status).json(response.body);
  };

  router.post("/", guards, async (req, res) => {
    try {
      const count = await createInventoryCount(prisma, {
        companyId: req.companyId,
        userId: req.user.id,
        input: req.body,
      });

      return res.status(201).json({ count });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.patch("/:id/lines", guards, async (req, res) => {
    try {
      const lines = await saveInventoryCountLines(prisma, {
        companyId: req.companyId,
        countId: req.params.id,
        input: req.body,
      });

      return res.json({ lines });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.post("/:id/post", guards, async (req, res) => {
    try {
      const count = await postInventoryCount(prisma, {
        companyId: req.companyId,
        userId: req.user.id,
        countId: req.params.id,
      });

      return res.json({ count });
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}

// apps/api/src/server.js
import { createInventoryCountRouter } from "./modules/inventory/inventoryCountRoutes.js";

app.use("/api/inventory/counts", createInventoryCountRouter(prisma));