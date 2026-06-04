import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { createSaleDocument, issueSaleDocument } from "./saleDocumentService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildSaleDocumentRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA", "OPERACIONAL")];

    router.post("/", guards, async (req, res) => {
        try {
            const data = await createSaleDocument(prisma, req.companyId, req.user.id, req.body);
            return res.status(201).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/", guards, async (req, res) => {
        try {
            const data = await prisma.saleDocument.findMany({ where: { companyId: req.companyId }, include: { customer: true, lines: true }, orderBy: { issuedAt: "desc" } });
            return res.status(200).json({ data });
        } catch (error) { return sendError(res, error); }
    });

    router.post("/:id/issue", guards, async (req, res) => {
        try {
            const data = await issueSaleDocument(prisma, req.companyId, req.user.id, req.params.id);
            return res.status(200).json({ data });
        } catch (error) { return sendError(res, error); }
    });

    return router;
}