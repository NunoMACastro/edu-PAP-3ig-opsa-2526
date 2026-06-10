import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export async function trialBalanceToXlsx(report) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Balancete");
  sheet.columns = [{ header: "Conta", key: "code" }, { header: "Nome", key: "name" }, { header: "Débito", key: "debit" }, { header: "Crédito", key: "credit" }];
  report.rows.forEach((row) => sheet.addRow({ code: row.code, name: row.name, debit: row.debitCents / 100, credit: row.creditCents / 100 }));
  return workbook.xlsx.writeBuffer();
}

export function ledgerToPdf(report) {
  const doc = new PDFDocument();
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.text("Razão " + report.account.code + " " + report.account.name);
  report.rows.forEach((row) => doc.text(String(row.date) + " " + row.description));
  doc.end();
  return new Promise((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));
}
