/**
 * @file Rotas de Demonstração de Resultados e Balanço da MF2.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { parseDateRange } from "../accounting-reports/accountingReportFilters.js";
import {
    buildBalanceSheet,
    buildIncomeStatement,
} from "./financialStatementService.js";

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
 * Monta as rotas Express das demonstrações financeiras com middlewares e tratamento de erro.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Router Express configurado para demonstrações financeiras.
 */
export function buildFinancialStatementRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ACCOUNTING_READ),
    ];

    router.get("/income-statement", guards, async (req, res) => {
        try {
            const range = parseDateRange(req.query);
            const incomeStatement = await buildIncomeStatement(prisma, {
                companyId: req.companyId,
                ...range,
            });
            return res.status(200).json({ incomeStatement });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/balance-sheet", guards, async (req, res) => {
        try {
            const range = parseDateRange(req.query);
            const balanceSheet = await buildBalanceSheet(prisma, {
                companyId: req.companyId,
                ...range,
            });
            return res.status(200).json({ balanceSheet });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
