/**
 * @file Exportadores XLSX/PDF para relatórios contabilísticos.
 */

import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

import { neutralizeSpreadsheetCell } from "../exports/exportFormatService.js";

/**
 * Formata valores em cêntimos no formato monetário usado nos exportadores.
 *
 * @param value - Valor a normalizar ou formatar.
 * @returns Valor formatado em euros a partir de cêntimos.
 */
function cents(value) {
    return (value / 100).toFixed(2);
}

/**
 * Exporta balancete para XLSX real.
 *
 * @param {object} trialBalance - Resultado de `buildTrialBalance`.
 * @returns {Promise<Buffer>} Ficheiro XLSX.
 */
export async function exportTrialBalanceXlsx(trialBalance) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Balancete");
    sheet.columns = [
        { header: "Conta", key: "code", width: 16 },
        { header: "Nome", key: "name", width: 36 },
        { header: "Débito", key: "debit", width: 14 },
        { header: "Crédito", key: "credit", width: 14 },
        { header: "Saldo", key: "balance", width: 14 },
    ];
    for (const row of trialBalance.rows) {
        sheet.addRow({
            code: neutralizeSpreadsheetCell(row.code),
            name: neutralizeSpreadsheetCell(row.name),
            debit: cents(row.debitCents),
            credit: cents(row.creditCents),
            balance: cents(row.balanceCents),
        });
    }
    sheet.addRow({});
    sheet.addRow({
        code: "TOTAL",
        debit: cents(trialBalance.totals.debitCents),
        credit: cents(trialBalance.totals.creditCents),
        balance: cents(trialBalance.totals.balanceCents),
    });
    return Buffer.from(await workbook.xlsx.writeBuffer());
}

/**
 * Exporta razão para PDF real.
 *
 * @param {object} ledger - Resultado de `buildLedger`.
 * @returns {Promise<Buffer>} Ficheiro PDF.
 */
export async function exportLedgerPdf(ledger) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40 });
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("error", reject);
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        doc.fontSize(16).text("Razão contabilístico", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Conta: ${ledger.account.code} - ${ledger.account.name}`);
        doc.text(`Fonte: ${ledger.source}`);
        doc.moveDown();

        for (const row of ledger.rows) {
            doc
                .fontSize(9)
                .text(
                    `${row.entryDate.toISOString().slice(0, 10)} | ${row.description} | Débito ${cents(row.debitCents)} | Crédito ${cents(row.creditCents)} | Saldo ${cents(row.balanceCents)}`,
                );
        }
        doc.moveDown();
        doc
            .fontSize(10)
            .text(
                `Totais: débito ${cents(ledger.totals.debitCents)}, crédito ${cents(ledger.totals.creditCents)}, saldo ${cents(ledger.totals.balanceCents)}`,
            );
        doc.end();
    });
}
