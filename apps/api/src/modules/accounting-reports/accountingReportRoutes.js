/**
 * @file Rotas de balancete, razão e exportação da MF2.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { parseDateRange } from "./accountingReportFilters.js";
import {
    buildLedger,
    buildTrialBalance,
} from "./accountingReportService.js";
import {
    exportLedgerPdf,
    exportTrialBalanceXlsx,
} from "./accountingReportExporters.js";

/**
 * Envia erros HTTP num formato JSON consistente com o contrato da API.
 *
 * @param res - Resposta Express usada para enviar o erro ao cliente.
 * @param error - Erro capturado durante a operação.
 * @returns Resposta HTTP de erro enviada no formato JSON contratado.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res
        .status(response.status)
        .json({ error: response.code, message: response.message });
}

/**
 * Monta as rotas Express dos relatórios contabilísticos com middlewares e tratamento de erro.
 *
 * @returns Router Express configurado para relatórios contabilísticos.
 */
export function buildAccountingReportRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ACCOUNTING_READ),
    ];

    router.get("/trial-balance", guards, async (req, res) => {
        try {
            const range = parseDateRange(req.query);
            const trialBalance = await buildTrialBalance(prisma, {
                companyId: req.companyId,
                ...range,
            });
            return res.status(200).json({ trialBalance });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/ledger", guards, async (req, res) => {
        try {
            const range = parseDateRange(req.query);
            const ledger = await buildLedger(prisma, {
                companyId: req.companyId,
                accountId: String(req.query.accountId ?? ""),
                ...range,
            });
            return res.status(200).json({ ledger });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/trial-balance.xlsx", guards, async (req, res) => {
        try {
            const range = parseDateRange(req.query);
            const trialBalance = await buildTrialBalance(prisma, {
                companyId: req.companyId,
                ...range,
            });
            const file = await exportTrialBalanceXlsx(trialBalance);
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            );
            res.setHeader(
                "Content-Disposition",
                'attachment; filename="balancete.xlsx"',
            );
            return res.status(200).end(file);
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/ledger.pdf", guards, async (req, res) => {
        try {
            const range = parseDateRange(req.query);
            const ledger = await buildLedger(prisma, {
                companyId: req.companyId,
                accountId: String(req.query.accountId ?? ""),
                ...range,
            });
            const file = await exportLedgerPdf(ledger);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", 'attachment; filename="razao.pdf"');
            return res.status(200).end(file);
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
