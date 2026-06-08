// apps/api/src/modules/purchase-approval/purchaseApprovalRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import {
  approvePurchaseDocument,
  listPurchaseApprovalHistory,
  markPurchaseDocumentPosted,
  rejectPurchaseDocument,
} from "./purchaseApprovalService.js";

function sendError(res, error) {
  const response = toHttpError(error);
  return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildPurchaseApprovalRoutes({ prisma }) {
  const router = Router();
  const decisionGuards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR")];
  const accountingGuards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "CONTABILISTA")];
  const historyGuards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "AUDITOR")];

  router.post("/:id/approve", decisionGuards, async (req, res) => {
    try {
      const data = await approvePurchaseDocument(prisma, req.companyId, req.user.id, req.params.id, req.body);

      return res.status(200).json({ data });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.post("/:id/reject", decisionGuards, async (req, res) => {
    try {
      const data = await rejectPurchaseDocument(prisma, req.companyId, req.user.id, req.params.id, req.body);

      return res.status(200).json({ data });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.post("/:id/post-state", accountingGuards, async (req, res) => {
    try {
      const data = await markPurchaseDocumentPosted(prisma, req.companyId, req.user.id, req.params.id);

      return res.status(200).json({ data });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/:id/approval-history", historyGuards, async (req, res) => {
    try {
      const items = await listPurchaseApprovalHistory(prisma, {
        companyId: req.companyId,
        purchaseDocumentId: req.params.id,
      });

      return res.json({ items });
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}