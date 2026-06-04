import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { createVatRate, listVatRates, setVatRateActive } from "./vatRateService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildVatRateRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA")];

    router.get("/", guards, async (req, res) => {
        try {
            const data = await listVatRates(prisma, req.companyId);
            return res.status(200).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/", guards, async (req, res) => {
        try {
            const data = await createVatRate(prisma, req.companyId, req.body);
            return res.status(201).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/:id/active", guards, async (req, res) => {
        try {
            const data = await setVatRateActive(prisma, req.companyId, req.params.id, req.body.isActive);
            return res.status(200).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}