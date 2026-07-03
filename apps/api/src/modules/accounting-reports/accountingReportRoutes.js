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
import {
    buildTabularExport,
    normalizeExportFormat,
} from "../exports/exportFormatService.js";

const TRIAL_BALANCE_COLUMNS = [
    { key: "code", label: "Conta", width: 16 },
    { key: "name", label: "Nome", width: 36 },
    { key: "debit", label: "Débito", width: 14 },
    { key: "credit", label: "Crédito", width: 14 },
    { key: "balance", label: "Saldo", width: 14 },
];

const LEDGER_COLUMNS = [
    { key: "entryDate", label: "Data", width: 14 },
    { key: "description", label: "Descrição", width: 36 },
    { key: "source", label: "Origem", width: 18 },
    { key: "debit", label: "Débito", width: 14 },
    { key: "credit", label: "Crédito", width: 14 },
    { key: "balance", label: "Saldo", width: 14 },
];

/**
 * Formata valores guardados em cêntimos para exportações humanas.
 *
 * @param {number} value - Valor monetário em cêntimos.
 * @returns {string} Valor decimal com duas casas.
 */
function cents(value) {
    return (value / 100).toFixed(2);
}

/**
 * Formata datas persistidas para `YYYY-MM-DD`.
 *
 * @param {Date | string} value - Data recebida dos services contabilísticos.
 * @returns {string} Data ISO curta.
 */
function dateOnly(value) {
    return new Date(value).toISOString().slice(0, 10);
}

/**
 * Mapeia o balancete autorizado para linhas tabulares exportáveis.
 *
 * @param {object} trialBalance - Resultado de `buildTrialBalance`.
 * @returns {Array<Record<string, string>>} Linhas prontas para CSV/XLSX/PDF.
 */
function trialBalanceRows(trialBalance) {
    return [
        ...trialBalance.rows.map((row) => ({
            code: row.code,
            name: row.name,
            debit: cents(row.debitCents),
            credit: cents(row.creditCents),
            balance: cents(row.balanceCents),
        })),
        {
            code: "TOTAL",
            name: "",
            debit: cents(trialBalance.totals.debitCents),
            credit: cents(trialBalance.totals.creditCents),
            balance: cents(trialBalance.totals.balanceCents),
        },
    ];
}

/**
 * Mapeia a razão autorizada para linhas tabulares exportáveis.
 *
 * @param {object} ledger - Resultado de `buildLedger`.
 * @returns {Array<Record<string, string>>} Linhas prontas para CSV/XLSX/PDF.
 */
function ledgerRows(ledger) {
    return [
        ...ledger.rows.map((row) => ({
            entryDate: dateOnly(row.entryDate),
            description: row.description,
            source: row.source,
            debit: cents(row.debitCents),
            credit: cents(row.creditCents),
            balance: cents(row.balanceCents),
        })),
        {
            entryDate: "",
            description: "TOTAL",
            source: "",
            debit: cents(ledger.totals.debitCents),
            credit: cents(ledger.totals.creditCents),
            balance: cents(ledger.totals.balanceCents),
        },
    ];
}

/**
 * Envia um ficheiro exportado com headers HTTP seguros para download.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {{ buffer: Buffer, contentType: string, fileName: string }} file - Ficheiro gerado.
 * @returns {import("express").Response} Resposta HTTP de download.
 */
function sendFile(res, file) {
    res.setHeader("Content-Type", file.contentType);
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.fileName}"`,
    );
    return res.status(200).end(file.buffer);
}

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

    router.get("/trial-balance/export", guards, async (req, res) => {
        try {
            const range = parseDateRange(req.query);
            const format = normalizeExportFormat(req.query.format);
            const trialBalance = await buildTrialBalance(prisma, {
                companyId: req.companyId,
                ...range,
            });
            const file = await buildTabularExport({
                format,
                baseName: "balancete",
                sheetName: "Balancete",
                title: "Balancete contabilístico",
                source: trialBalance.source,
                columns: TRIAL_BALANCE_COLUMNS,
                rows: trialBalanceRows(trialBalance),
            });

            return sendFile(res, file);
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/ledger/export", guards, async (req, res) => {
        try {
            const range = parseDateRange(req.query);
            const format = normalizeExportFormat(req.query.format);
            const ledger = await buildLedger(prisma, {
                companyId: req.companyId,
                accountId: String(req.query.accountId ?? ""),
                ...range,
            });
            const file = await buildTabularExport({
                format,
                baseName: `razao-${ledger.account.code}`,
                sheetName: "Razao",
                title: `Razão contabilística - ${ledger.account.code}`,
                source: ledger.source,
                columns: LEDGER_COLUMNS,
                rows: ledgerRows(ledger),
            });

            return sendFile(res, file);
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
