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
 * @throws {import("../../lib/httpErrors.js").HttpError} Erro HTTP 400 quando o formato não pertence ao RNF22.
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
 * Neutraliza valores que folhas de cálculo poderiam interpretar como fórmulas.
 *
 * @param {unknown} value - Valor bruto vindo de linhas já autorizadas.
 * @returns {string | number | boolean | null} Valor seguro para CSV/XLSX.
 */
export function neutralizeSpreadsheetCell(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === "number" || typeof value === "boolean") return value;

    const text = String(value);
    const trimmedStart = text.trimStart();
    if (/^[=+\-@]/.test(trimmedStart)) {
        return `'${text}`;
    }
    return text;
}

/**
 * Serializa uma célula CSV com separador português `;`.
 *
 * @param {unknown} value - Valor seguro para exportação.
 * @returns {string} Célula CSV escapada.
 */
function csvCell(value) {
    const safeValue = neutralizeSpreadsheetCell(value);
    if (safeValue === null) return "";
    const text = String(safeValue);
    return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Gera um ficheiro CSV com cabeçalhos e linhas normalizadas.
 *
 * @param {Array<{ key: string, label: string }>} columns - Colunas exportadas.
 * @param {Array<Record<string, unknown>>} rows - Linhas já autorizadas pelo backend.
 * @returns {Buffer} Conteúdo CSV.
 */
function buildCsvBuffer(columns, rows) {
    const csvRows = [
        columns.map((column) => csvCell(column.label)).join(";"),
        ...rows.map((row) =>
            columns.map((column) => csvCell(row[column.key])).join(";"),
        ),
    ];

    return Buffer.from(`\uFEFF${csvRows.join("\n")}\n`, "utf8");
}

/**
 * Gera um ficheiro XLSX real com colunas estáveis.
 *
 * @param {string} sheetName - Nome da folha Excel.
 * @param {Array<{ key: string, label: string, width?: number }>} columns - Colunas exportadas.
 * @param {Array<Record<string, unknown>>} rows - Linhas já autorizadas pelo backend.
 * @returns {Promise<Buffer>} Conteúdo XLSX.
 */
async function buildXlsxBuffer(sheetName, columns, rows) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "OPSA";
    const sheet = workbook.addWorksheet(sheetName.slice(0, 31) || "Export");
    sheet.columns = columns.map((column) => ({
        header: column.label,
        key: column.key,
        width: column.width ?? 18,
    }));

    for (const row of rows) {
        sheet.addRow(
            Object.fromEntries(
                columns.map((column) => [
                    column.key,
                    neutralizeSpreadsheetCell(row[column.key]),
                ]),
            ),
        );
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
}

/**
 * Gera um PDF simples para arquivo/leitura sem alterar dados contabilísticos.
 *
 * @param {string} title - Título funcional do relatório.
 * @param {string | undefined} source - Origem de dados usada no service contabilístico.
 * @param {Array<{ key: string, label: string }>} columns - Colunas exportadas.
 * @param {Array<Record<string, unknown>>} rows - Linhas já autorizadas pelo backend.
 * @returns {Promise<Buffer>} Conteúdo PDF.
 */
async function buildPdfBuffer(title, source, columns, rows) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40 });
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("error", reject);
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        doc.fontSize(16).text(title, { underline: true });
        if (source) {
            doc.moveDown(0.5);
            doc.fontSize(9).text(`Fonte: ${source}`);
        }
        doc.moveDown();

        for (const [index, row] of rows.entries()) {
            const line = columns
                .map((column) => `${column.label}: ${row[column.key] ?? ""}`)
                .join(" | ");
            doc.fontSize(8).text(line);
            if ((index + 1) % 20 === 0) doc.moveDown(0.5);
        }

        doc.end();
    });
}

/**
 * Gera ficheiro tabular no formato pedido e devolve metadados HTTP.
 *
 * @param {{ format: "csv" | "xlsx" | "pdf", baseName: string, sheetName: string, title: string, source?: string, columns: Array<{ key: string, label: string, width?: number }>, rows: Array<Record<string, unknown>> }} input - Pedido de exportação.
 * @returns {Promise<{ buffer: Buffer, contentType: string, fileName: string }>} Ficheiro e headers associados.
 */
export async function buildTabularExport(input) {
    const format = normalizeExportFormat(input.format);
    const baseName = safeExportBaseName(input.baseName);
    const fileName = `${baseName}.${format}`;

    if (format === ExportFormat.CSV) {
        return {
            buffer: buildCsvBuffer(input.columns, input.rows),
            contentType: EXPORT_CONTENT_TYPES[format],
            fileName,
        };
    }

    if (format === ExportFormat.XLSX) {
        return {
            buffer: await buildXlsxBuffer(input.sheetName, input.columns, input.rows),
            contentType: EXPORT_CONTENT_TYPES[format],
            fileName,
        };
    }

    return {
        buffer: await buildPdfBuffer(
            input.title,
            input.source,
            input.columns,
            input.rows,
        ),
        contentType: EXPORT_CONTENT_TYPES[format],
        fileName,
    };
}
