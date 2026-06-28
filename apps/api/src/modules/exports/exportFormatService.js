/**
 * @file Service comum para gerar ficheiros CSV, XLSX e PDF a partir de linhas já autorizadas.
 */

import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

import { httpError } from "../../lib/httpErrors.js";

export const ExportFormat = Object.freeze({
  CSV: "csv",
  XLSX: "xlsx",
  PDF: "pdf",
});

const EXPORT_CONTENT_TYPES = Object.freeze({
  [ExportFormat.CSV]: "text/csv; charset=utf-8",
  [ExportFormat.XLSX]: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  [ExportFormat.PDF]: "application/pdf",
});

/**
 * Normaliza o formato pedido pelo cliente.
 *
 * @param {string | undefined} format - Valor recebido na query string.
 * @returns {"csv" | "xlsx" | "pdf"} Formato validado.
 * @throws {Error} Erro HTTP 400 quando o formato não pertence ao contrato RNF22.
 */
export function normalizeExportFormat(format) {
  const normalizedFormat = String(format ?? "").trim().toLowerCase();

  if (!Object.values(ExportFormat).includes(normalizedFormat)) {
    throw httpError(
      400,
      "INVALID_EXPORT_FORMAT",
      "Formato de exportação inválido. Usa csv, xlsx ou pdf.",
    );
  }

  return normalizedFormat;
}

/**
 * Cria um nome base seguro para usar no header de download.
 *
 * @param {string} baseName - Nome funcional do relatório.
 * @returns {string} Nome sem caracteres perigosos.
 */
export function safeExportBaseName(baseName) {
  const safeName = String(baseName)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safeName || "opsa-export";
}

/**
 * Neutraliza valores que uma folha de cálculo poderia interpretar como fórmula.
 *
 * @param {string | number | boolean | null | undefined | Date} value - Valor original da célula.
 * @returns {string | number | boolean} Valor seguro para CSV/XLSX/PDF.
 */
export function neutralizeSpreadsheetFormula(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  const text = String(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

/**
 * Escapa uma célula CSV usando `;` como separador europeu.
 *
 * @param {string | number | boolean | null | undefined | Date} value - Valor original.
 * @returns {string} Célula segura para CSV.
 */
export function csvCell(value) {
  const safeValue = neutralizeSpreadsheetFormula(value);
  const text = String(safeValue);

  if (/[",\n\r;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

/**
 * Valida que a exportação recebeu linhas tabulares.
 *
 * @param {Array<Record<string, unknown>>} rows - Linhas já autorizadas pelo backend.
 * @throws {Error} Erro HTTP 500 quando o service recebe uma shape inválida.
 */
function assertRows(rows) {
  if (!Array.isArray(rows)) {
    throw httpError(500, "INVALID_EXPORT_ROWS", "As linhas da exportação devem ser uma lista.");
  }

  for (const row of rows) {
    if (row === null || typeof row !== "object" || Array.isArray(row)) {
      throw httpError(500, "INVALID_EXPORT_ROW", "Cada linha da exportação deve ser um objeto.");
    }
  }
}

/**
 * Resolve as colunas usadas por CSV, XLSX e PDF.
 *
 * @param {Array<Record<string, unknown>>} rows - Linhas a exportar.
 * @param {Array<{ key: string, label: string }> | undefined} columns - Colunas explícitas.
 * @returns {Array<{ key: string, label: string }>} Colunas finais.
 */
function resolveColumns(rows, columns) {
  if (Array.isArray(columns) && columns.length > 0) {
    return columns.map((column) => ({ key: column.key, label: column.label }));
  }

  if (rows.length === 0) {
    throw httpError(
      500,
      "INVALID_EXPORT_COLUMNS",
      "Exportações sem linhas precisam de colunas explícitas.",
    );
  }

  return Object.keys(rows[0]).map((key) => ({ key, label: key }));
}

/**
 * Gera um ficheiro CSV em memória.
 *
 * @param {{ rows: Array<Record<string, unknown>>, columns?: Array<{ key: string, label: string }> }} input - Dados tabulares.
 * @returns {Buffer} Conteúdo CSV.
 */
export function buildCsvBuffer({ rows, columns }) {
  assertRows(rows);
  const resolvedColumns = resolveColumns(rows, columns);

  const header = resolvedColumns.map((column) => csvCell(column.label)).join(";");
  const body = rows.map((row) =>
    resolvedColumns.map((column) => csvCell(row[column.key])).join(";"),
  );

  return Buffer.from([header, ...body].join("\n"), "utf8");
}

/**
 * Gera um ficheiro XLSX genérico em memória.
 *
 * @param {{ title: string, rows: Array<Record<string, unknown>>, columns?: Array<{ key: string, label: string }> }} input - Dados tabulares.
 * @returns {Promise<Buffer>} Conteúdo XLSX.
 */
export async function buildXlsxBuffer({ title, rows, columns }) {
  assertRows(rows);
  const resolvedColumns = resolveColumns(rows, columns);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title.slice(0, 31) || "Export");

  worksheet.columns = resolvedColumns.map((column) => ({
    header: column.label,
    key: column.key,
    width: Math.max(14, Math.min(36, column.label.length + 6)),
  }));

  for (const row of rows) {
    const safeRow = {};

    // A neutralização é centralizada para proteger todos os relatórios exportados.
    for (const column of resolvedColumns) {
      safeRow[column.key] = neutralizeSpreadsheetFormula(row[column.key]);
    }

    worksheet.addRow(safeRow);
  }

  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

/**
 * Gera um PDF tabular simples em memória.
 *
 * @param {{ title: string, rows: Array<Record<string, unknown>>, columns?: Array<{ key: string, label: string }> }} input - Dados tabulares.
 * @returns {Promise<Buffer>} Conteúdo PDF.
 */
export function buildPdfBuffer({ title, rows, columns }) {
  assertRows(rows);
  const resolvedColumns = resolveColumns(rows, columns);

  return new Promise((resolve, reject) => {
    const chunks = [];
    const document = new PDFDocument({ margin: 40, size: "A4" });

    document.on("data", (chunk) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    document.fontSize(16).text(title, { underline: true });
    document.moveDown();

    for (const row of rows) {
      // O PDF usa pares label/valor para ser legível mesmo quando há muitas colunas.
      for (const column of resolvedColumns) {
        const value = neutralizeSpreadsheetFormula(row[column.key]);
        document.fontSize(9).text(`${column.label}: ${value}`);
      }

      document.moveDown(0.5);
    }

    document.end();
  });
}

/**
 * Gera o ficheiro final e os metadados necessários para a resposta HTTP.
 *
 * @param {{ format: string, baseName: string, title: string, rows: Array<Record<string, unknown>>, columns?: Array<{ key: string, label: string }>, xlsx?: () => Promise<Buffer>, pdf?: () => Promise<Buffer> }} input - Pedido de exportação.
 * @returns {Promise<{ contentType: string, fileName: string, body: Buffer }>} Ficheiro e metadados.
 */
export async function buildExportFile({ format, baseName, title, rows, columns, xlsx, pdf }) {
  const normalizedFormat = normalizeExportFormat(format);
  const safeBaseName = safeExportBaseName(baseName);
  const fileName = `${safeBaseName}.${normalizedFormat}`;

  if (normalizedFormat === ExportFormat.CSV) {
    return {
      contentType: EXPORT_CONTENT_TYPES[normalizedFormat],
      fileName,
      body: buildCsvBuffer({ rows, columns }),
    };
  }

  if (normalizedFormat === ExportFormat.XLSX) {
    return {
      contentType: EXPORT_CONTENT_TYPES[normalizedFormat],
      fileName,
      body: xlsx ? await xlsx() : await buildXlsxBuffer({ title, rows, columns }),
    };
  }

  return {
    contentType: EXPORT_CONTENT_TYPES[normalizedFormat],
    fileName,
    body: pdf ? await pdf() : await buildPdfBuffer({ title, rows, columns }),
  };
}

/**
 * Cria o valor final do header `Content-Disposition`.
 *
 * @param {string} fileName - Nome do ficheiro já validado.
 * @returns {string} Header seguro para download.
 */
export function buildContentDisposition(fileName) {
  const extension = String(fileName).split(".").pop();
  const baseName = safeExportBaseName(String(fileName).replace(/\.[a-z0-9]+$/i, ""));
  return `attachment; filename="${baseName}.${extension}"`;
}