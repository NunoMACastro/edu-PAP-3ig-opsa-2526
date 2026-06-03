import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { registerPayment } from "./paymentService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({
        error: response.code,
        message: response.message,
    });
}

export function buildPaymentRoutes({ prisma }) {
    const router = Router();

    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requireRole("ADMIN", "GESTOR", "CONTABILISTA", "OPERACIONAL"),
    ];

    // POST /api/purchases/documents/:id/payments
    router.post("/:id/payments", guards, async (req, res) => {
        try {
            const payment = await registerPayment(
                prisma,
                req.companyId,
                req.user.id,
                req.params.id,
                req.body
            );

            return res.status(201).json({ data: payment });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}