/**
 * @file Rotas de balancete, razão e exportações contabilísticas.
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
import {
  buildContentDisposition,
  buildExportFile,
  ExportFormat,
  normalizeExportFormat,
} from "../exports/exportFormatService.js";

const trialBalanceColumns = [
  { key: "code", label: "Conta" },
  { key: "name", label: "Descrição" },
  { key: "debit", label: "Débito" },
  { key: "credit", label: "Crédito" },
  { key: "balance", label: "Saldo" },
];

const ledgerColumns = [
  { key: "entryDate", label: "Data" },
  { key: "description", label: "Descrição" },
  { key: "source", label: "Origem" },
  { key: "debit", label: "Débito" },
  { key: "credit", label: "Crédito" },
  { key: "balance", label: "Saldo" },
];

/**
 * Envia erros HTTP num formato JSON consistente com o contrato da API.
 *
 * @param res - Resposta Express usada para enviar o erro ao cliente.
 * @param error - Erro capturado durante a operação.
 * @returns Resposta HTTP de erro.
 */
function sendError(res, error) {
  const response = toHttpError(error);
  return res
    .status(response.status)
    .json({ error: response.code, message: response.message });
}

/**
 * Formata valores em cêntimos para apresentação nos ficheiros.
 *
 * @param {number} value - Valor monetário em cêntimos.
 * @returns {string} Valor em euros com duas casas decimais.
 */
function cents(value) {
  return (Number(value ?? 0) / 100).toFixed(2);
}

/**
 * Formata datas de relatório no padrão ISO curto.
 *
 * @param {Date | string} value - Data vinda do service contabilístico.
 * @returns {string} Data no formato YYYY-MM-DD.
 */
function dateOnly(value) {
  return new Date(value).toISOString().slice(0, 10);
}

/**
 * Converte o balancete real da MF2 para linhas tabulares de exportação.
 *
 * @param {object} trialBalance - Resultado de `buildTrialBalance`.
 * @returns {Array<Record<string, string>>} Linhas prontas para CSV/XLSX/PDF.
 */
function toTrialBalanceRows(trialBalance) {
  return trialBalance.rows.map((row) => ({
    code: row.code,
    name: row.name,
    debit: cents(row.debitCents),
    credit: cents(row.creditCents),
    balance: cents(row.balanceCents),
  }));
}

/**
 * Converte a razão real da MF2 para linhas tabulares de exportação.
 *
 * @param {object} ledger - Resultado de `buildLedger`.
 * @returns {Array<Record<string, string>>} Linhas prontas para CSV/XLSX/PDF.
 */
function toLedgerRows(ledger) {
  return ledger.rows.map((row) => ({
    entryDate: dateOnly(row.entryDate),
    description: row.description,
    source: row.source,
    debit: cents(row.debitCents),
    credit: cents(row.creditCents),
    balance: cents(row.balanceCents),
  }));
}

/**
 * Envia um ficheiro de relatório contabilístico na resposta HTTP.
 *
 * @param res - Resposta Express.
 * @param {object} input - Pedido de exportação validado.
 * @returns {Promise<object>} Resposta HTTP final.
 */
async function sendAccountingReportFile(res, input) {
  const file = await buildExportFile(input);

  res.setHeader("Content-Type", file.contentType);
  res.setHeader("Content-Disposition", buildContentDisposition(file.fileName));
  return res.status(200).end(file.body);
}

/**
 * Monta as rotas Express dos relatórios contabilísticos.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} input - Dependências do router.
 * @returns Router Express configurado para relatórios e exportações.
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
        // A empresa vem do contexto autenticado para impedir exportação de outra empresa.
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
      res.setHeader("Content-Disposition", 'attachment; filename="balancete.xlsx"');
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

  router.get("/trial-balance/export", guards, async (req, res) => {
    try {
      const format = normalizeExportFormat(req.query.format);
      const range = parseDateRange(req.query);
      const trialBalance = await buildTrialBalance(prisma, {
        companyId: req.companyId,
        ...range,
      });

      return sendAccountingReportFile(res, {
        format,
        baseName: "opsa-balancete",
        title: "Balancete OPSA",
        rows: toTrialBalanceRows(trialBalance),
        columns: trialBalanceColumns,
        // O XLSX especializado preserva o layout contabilístico já entregue em BK-MF2-07.
        xlsx:
          format === ExportFormat.XLSX
            ? () => exportTrialBalanceXlsx(trialBalance)
            : undefined,
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/ledger/export", guards, async (req, res) => {
    try {
      const format = normalizeExportFormat(req.query.format);
      const range = parseDateRange(req.query);
      const ledger = await buildLedger(prisma, {
        companyId: req.companyId,
        accountId: String(req.query.accountId ?? ""),
        ...range,
      });

      return sendAccountingReportFile(res, {
        format,
        baseName: "opsa-razao",
        title: "Razão OPSA",
        rows: toLedgerRows(ledger),
        columns: ledgerColumns,
        // O PDF especializado preserva o layout contabilístico já entregue em BK-MF2-07.
        pdf: format === ExportFormat.PDF ? () => exportLedgerPdf(ledger) : undefined,
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}