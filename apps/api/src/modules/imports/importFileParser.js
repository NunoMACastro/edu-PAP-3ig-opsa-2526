/**
 * @file Parser comum para importações CSV e Excel do OPSA.
 */

import ExcelJS from "exceljs";
import { httpError } from "../../lib/httpErrors.js";

export const ImportSourceFormat = Object.freeze({
  CSV: "CSV",
  XLSX: "XLSX",
});

export const MAX_IMPORT_ROWS = 5000;

const FORMAT_BY_EXTENSION = new Map([
  [".csv", ImportSourceFormat.CSV],
  [".xlsx", ImportSourceFormat.XLSX],
]);

/**
 * Normaliza texto recebido de payloads ou células de folha de cálculo.
 *
 * @param {unknown} value - Valor recebido.
 * @returns {string} Texto sem espaços exteriores.
 */
function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Converte valores de célula Excel para texto simples.
 *
 * @param {unknown} value - Valor de uma célula Excel.
 * @returns {string} Texto seguro para os validators de domínio.
 */
function cellToText(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value !== "object") return String(value).trim();

  if ("text" in value) return normalizeText(value.text);
  if ("result" in value) return normalizeText(value.result);
  if ("richText" in value && Array.isArray(value.richText)) {
    return value.richText.map((part) => normalizeText(part.text)).join("").trim();
  }

  return String(value).trim();
}

/**
 * Extrai a extensão final do nome do ficheiro.
 *
 * @param {string} fileName - Nome recebido no pedido.
 * @returns {string} Extensão normalizada, incluindo o ponto.
 */
export function extensionOf(fileName) {
  const safeName = normalizeText(fileName);
  const index = safeName.lastIndexOf(".");
  return index === -1 ? "" : safeName.slice(index).toLowerCase();
}

/**
 * Deteta o formato de importação a partir do nome do ficheiro.
 *
 * @param {string} fileName - Nome do ficheiro recebido.
 * @returns {"CSV" | "XLSX"} Formato suportado pela API.
 */
export function detectImportSourceFormat(fileName) {
  const sourceFormat = FORMAT_BY_EXTENSION.get(extensionOf(fileName));
  if (!sourceFormat) {
    throw httpError(
      400,
      "INVALID_IMPORT_FILE_FORMAT",
      "Formato de importação inválido. Usa csv ou xlsx.",
    );
  }
  return sourceFormat;
}

/**
 * Garante que os cabeçalhos existem antes de processar linhas.
 *
 * @param {string[]} headers - Cabeçalhos lidos do ficheiro.
 * @returns {string[]} Cabeçalhos validados.
 */
function assertHeaders(headers) {
  const cleanHeaders = headers.map((header) => normalizeText(header)).filter(Boolean);
  if (cleanHeaders.length === 0) {
    throw httpError(400, "INVALID_IMPORT_HEADERS", "Importação sem cabeçalhos úteis");
  }
  return cleanHeaders;
}

/**
 * Valida o número de linhas úteis da importação.
 *
 * @param {number} rowCount - Total de linhas de dados.
 * @returns {number} Total aprovado.
 */
export function assertImportRowLimit(rowCount) {
  if (!Number.isInteger(rowCount) || rowCount <= 0) {
    throw httpError(400, "INVALID_IMPORT_ROWS", "Importação sem linhas úteis");
  }
  if (rowCount > MAX_IMPORT_ROWS) {
    throw httpError(413, "IMPORT_TOO_LARGE", "Importação excede o limite de linhas");
  }
  return rowCount;
}

/**
 * Converte CSV com cabeçalho em linhas de objetos simples.
 *
 * @param {string} content - Conteúdo textual CSV separado por ponto e vírgula.
 * @returns {Array<Record<string, string>>} Linhas normalizadas por cabeçalho.
 */
export function parseCsvRows(content) {
  const lines = normalizeText(content)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw httpError(400, "INVALID_IMPORT_CSV", "CSV deve ter cabeçalho e pelo menos uma linha");
  }

  const headers = assertHeaders(lines[0].split(";"));

  // A primeira linha é o cabeçalho; só as linhas seguintes representam dados de negócio.
  const rows = lines.slice(1).map((line) => {
    const values = line.split(";").map((value) => value.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });

  assertImportRowLimit(rows.length);
  return rows;
}

/**
 * Converte uma folha Excel em linhas de objetos simples.
 *
 * @param {string} contentBase64 - Conteúdo `.xlsx` codificado em base64.
 * @returns {Promise<Array<Record<string, string>>>} Linhas normalizadas por cabeçalho.
 */
async function parseXlsxRows(contentBase64) {
  const safeBase64 = normalizeText(contentBase64);
  if (!safeBase64) {
    throw httpError(400, "INVALID_IMPORT_XLSX", "Conteúdo Excel em base64 obrigatório");
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(safeBase64, "base64"));

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw httpError(400, "INVALID_IMPORT_XLSX", "Excel sem folha de dados");
  }

  const headers = [];
  worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, columnNumber) => {
    headers[columnNumber - 1] = cellToText(cell.value);
  });

  const cleanHeaders = assertHeaders(headers);
  const rows = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    const record = {};
    for (const [index, header] of cleanHeaders.entries()) {
      record[header] = cellToText(row.getCell(index + 1).value);
    }

    // Linhas totalmente vazias são ignoradas para não criar rejeições artificiais.
    if (Object.values(record).some(Boolean)) rows.push(record);
  });

  assertImportRowLimit(rows.length);
  return rows;
}

/**
 * Converte um ficheiro CSV ou Excel em linhas normalizadas.
 *
 * @param {{ fileName: string, content?: string, contentBase64?: string }} input - Ficheiro recebido.
 * @returns {Promise<{ sourceFormat: "CSV" | "XLSX", rows: Array<Record<string, string>> }>} Resultado do parser.
 */
export async function parseImportRows(input) {
  const sourceFormat = detectImportSourceFormat(input.fileName);
  const rows =
    sourceFormat === ImportSourceFormat.CSV
      ? parseCsvRows(input.content)
      : await parseXlsxRows(input.contentBase64);

  return { sourceFormat, rows };
}

/**
 * Constrói o input correto para `recordIntegrationLog`.
 *
 * @param {{ context: { companyId: string, userId: string }, data: { type: string, sourceFormat: string }, run: { id: string, fileName: string, totalRows: number }, acceptedRows: number, rejectedRows: number }} input - Dados finais da importação.
 * @returns {{ companyId: string, userId: string, integrationType: string, operation: string, status: string, sourceId: string, fileName: string, totalRows: number, successRows: number, errorRows: number, message: string }} Input sanitizável pelo service de logs.
 */
export function buildImportLogInput({ context, data, run, acceptedRows, rejectedRows }) {
  return {
    companyId: context.companyId,
    userId: context.userId,
    integrationType: data.type,
    operation: "IMPORT",
    status: rejectedRows > 0 ? "PARTIAL" : "IMPORTED",
    sourceId: run.id,
    fileName: run.fileName,
    totalRows: run.totalRows,
    successRows: acceptedRows,
    errorRows: rejectedRows,
    message: `Importacao ${data.sourceFormat} de ${data.type} concluida com validacao por linha.`,
  };
}