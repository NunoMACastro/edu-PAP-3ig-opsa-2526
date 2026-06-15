// apps/api/src/modules/reports/operationalReportRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateOperationalReportQuery } from "./operationalReportFilters.js";
import { buildOperationalReport } from "./operationalReportService.js";

/**
 * Constrói a route de relatórios operacionais.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências da route.
 * @returns {import("express").Router} Router montado em `/api/reports/operational`.
 */
export function buildOperationalReportRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("GESTOR", "OPERACIONAL")];
    router.get("/", guards, async (req, res) => {
        try {
            const filters = validateOperationalReportQuery(req.query);
            // A empresa vem do contexto autenticado para impedir reporting cross-company.
            return res.status(200).json(await buildOperationalReport(prisma, { companyId: req.companyId, userId: req.user.id, ...filters }));
        } catch (error) {
            const httpError = toHttpError(error);
            return res.status(httpError.status).json({ error: httpError.code, message: httpError.message });
        }
    });
    return router;
}
// apps/api/src/server.js
import { buildOperationalReportRoutes } from "./modules/reports/operationalReportRoutes.js";

app.use("/api/reports/operational", buildOperationalReportRoutes({ prisma }));