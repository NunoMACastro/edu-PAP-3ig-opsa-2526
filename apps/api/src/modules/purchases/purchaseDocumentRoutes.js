import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { createPurchaseDocument } from "./purchaseDocumentService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildPurchaseDocumentRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA", "OPERACIONAL")];
    router.post("/", guards, async (req, res) => {
        try {
            const data = await createPurchaseDocument(prisma, req.companyId, req.user.id, req.body);
            return res.status(201).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
    });
    router.get("/", guards, async (req, res) => {
        try {
            const data = await prisma.purchaseDocument.findMany({ where: { companyId: req.companyId }, include: { supplier: true, lines: true }, orderBy: { issuedAt: "desc" } });
            return res.status(200).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
    });
    return router;
}