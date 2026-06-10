// apps/api/src/modules/financial-statements/financialStatementRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { parseDateRange } from "../accounting-reports/accountingReportFilters.js";
import { buildBalanceSheet, buildIncomeStatement } from "./financialStatementService.js";

export function createFinancialStatementRouter(prisma) {
  const router = Router();
  const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA", "AUDITOR")];
  const sendError = (res, error) => {
    const response = toHttpError(error);
    return res.status(response.status).json(response.body);
  };

  router.get("/income-statement", guards, async (req, res) => {
    try {
      const filters = parseDateRange(req.query);
      const statement = await buildIncomeStatement(prisma, { companyId: req.companyId, ...filters });
      return res.json({ statement });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/balance-sheet", guards, async (req, res) => {
    try {
      const filters = parseDateRange(req.query);
      const statement = await buildBalanceSheet(prisma, { companyId: req.companyId, ...filters });
      return res.json({ statement });
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}

// apps/api/src/server.js
import { createFinancialStatementRouter } from "./modules/financial-statements/financialStatementRoutes.js";

app.use("/api/accounting/statements", createFinancialStatementRouter(prisma));