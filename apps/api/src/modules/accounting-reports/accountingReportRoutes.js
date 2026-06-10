// apps/api/src/modules/accounting-reports/accountingReportRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { parseDateRange } from "./accountingReportFilters.js";
import { buildLedger, buildTrialBalance } from "./accountingReportService.js";
import { ledgerToPdf, trialBalanceToXlsx } from "./accountingReportExporters.js";

export function createAccountingReportRouter(prisma) {
  const router = Router();
  const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA", "AUDITOR")];
  const sendError = (res, error) => {
    const response = toHttpError(error);
    return res.status(response.status).json(response.body);
  };

  router.get("/trial-balance", guards, async (req, res) => {
    try {
      const filters = parseDateRange(req.query);
      const report = await buildTrialBalance(prisma, { companyId: req.companyId, ...filters });
      return res.json({ report });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/ledger", guards, async (req, res) => {
    try {
      const filters = parseDateRange(req.query);
      const report = await buildLedger(prisma, {
        companyId: req.companyId,
        accountId: String(req.query.accountId ?? ""),
        ...filters,
      });

      return res.json({ report });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/trial-balance.xlsx", guards, async (req, res) => {
    try {
      const filters = parseDateRange(req.query);
      const report = await buildTrialBalance(prisma, { companyId: req.companyId, ...filters });
      const buffer = await trialBalanceToXlsx(report);

      res.setHeader("content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("content-disposition", "attachment; filename=balancete.xlsx");
      return res.send(Buffer.from(buffer));
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/ledger.pdf", guards, async (req, res) => {
    try {
      const filters = parseDateRange(req.query);
      const report = await buildLedger(prisma, {
        companyId: req.companyId,
        accountId: String(req.query.accountId ?? ""),
        ...filters,
      });
      const buffer = await ledgerToPdf(report);

      res.setHeader("content-type", "application/pdf");
      res.setHeader("content-disposition", "attachment; filename=razao.pdf");
      return res.send(buffer);
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}

// apps/api/src/server.js
import { createAccountingReportRouter } from "./modules/accounting-reports/accountingReportRoutes.js";

app.use("/api/accounting/reports", createAccountingReportRouter(prisma));