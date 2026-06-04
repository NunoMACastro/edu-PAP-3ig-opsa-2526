import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { postSaleDocument } from "./salePostingService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildSalePostingRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA")];
    router.post("/:saleDocumentId", guards, async (req, res) => {
        try {
            const data = await postSaleDocument(prisma, req.companyId, req.user.id, req.params.saleDocumentId);
            return res.status(201).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
    });
    return router;
}