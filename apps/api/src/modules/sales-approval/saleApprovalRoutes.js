import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { approveSaleDocument, rejectSaleDocument, submitSaleDocument } from "./saleApprovalService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildSaleApprovalRoutes({ prisma }) {
    const router = Router();
    router.post("/:id/submit", requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "OPERACIONAL"), async (req, res) => {
        try {
            const data = await submitSaleDocument(prisma, req.companyId, req.user.id, req.params.id);
            return res.status(200).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
    });
    router.post("/:id/approve", requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR"), async (req, res) => {
        try {
            const data = await approveSaleDocument(prisma, req.companyId, req.user.id, req.params.id);
            return res.status(200).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
    });
    router.post("/:id/reject", requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR"), async (req, res) => {
        try {
            const data = await rejectSaleDocument(prisma, req.companyId, req.user.id, req.params.id, req.body);
            return res.status(200).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
    });
    return router;
}