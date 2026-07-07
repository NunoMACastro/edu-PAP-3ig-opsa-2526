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
 * Converte valores de célula Excel para texto simples sem executar fórmulas.
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

    return "";
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
            "Formato de ficheiro inválido. Usa .csv ou .xlsx.",
        );
    }
    return sourceFormat;
}

/**
 * Garante que a importação fica dentro do volume operacional documentado.
 *
 * @param {number} rowCount - Número de linhas de dados.
 * @returns {void}
 */
function assertImportRowLimit(rowCount) {
    if (rowCount > MAX_IMPORT_ROWS) {
        throw httpError(
            413,
            "IMPORT_TOO_LARGE",
            `A importação está limitada a ${MAX_IMPORT_ROWS} linhas.`,
        );
    }
}

/**
 * Constrói objetos de linha a partir de cabeçalhos e valores.
 *
 * @param {string[]} headers - Cabeçalhos normalizados.
 * @param {string[][]} valueRows - Linhas de valores normalizados.
 * @param {number} firstDataRowNumber - Número real da primeira linha de dados no ficheiro.
 * @returns {Array<Record<string, string | number>>} Linhas tabulares.
 */
function rowsFromHeader(headers, valueRows, firstDataRowNumber) {
    if (headers.length === 0 || headers.some((header) => !header)) {
        throw httpError(
            400,
            "INVALID_IMPORT_HEADERS",
            "O ficheiro deve ter cabeçalhos preenchidos.",
        );
    }
    assertImportRowLimit(valueRows.length);

    return valueRows.map((values, index) => ({
        __rowNumber: firstDataRowNumber + index,
        ...Object.fromEntries(
            headers.map((header, headerIndex) => [
                header,
                values[headerIndex] ?? "",
            ]),
        ),
    }));
}

/**
 * Converte CSV com cabeçalho em linhas de objetos simples.
 *
 * @param {string} content - Conteúdo textual CSV separado por `;`.
 * @returns {Array<Record<string, string | number>>} Linhas normalizadas por cabeçalho.
 */
export function parseCsvRows(content) {
    const lines = normalizeText(content)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    if (lines.length < 2) {
        throw httpError(
            400,
            "INVALID_IMPORT_CSV",
            "CSV deve ter cabeçalho e pelo menos uma linha",
        );
    }

    const headers = lines[0].split(";").map((header) => header.trim());
    const valueRows = lines.slice(1).map((line) =>
        line.split(";").map((value) => value.trim()),
    );

    return rowsFromHeader(headers, valueRows, 2);
}

/**
 * Converte ficheiro Excel em linhas com cabeçalhos da primeira linha da primeira folha.
 *
 * @param {string} contentBase64 - Conteúdo XLSX codificado em base64.
 * @returns {Promise<Array<Record<string, string | number>>>} Linhas normalizadas.
 */
async function parseXlsxRows(contentBase64) {
    const encoded = normalizeText(contentBase64);
    if (!encoded) {
        throw httpError(
            400,
            "INVALID_IMPORT_XLSX",
            "Conteúdo Excel em base64 obrigatório.",
        );
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(encoded, "base64"));
    const sheet = workbook.worksheets[0];
    if (!sheet || sheet.rowCount < 2) {
        throw httpError(
            400,
            "INVALID_IMPORT_XLSX",
            "Excel deve ter cabeçalho e pelo menos uma linha.",
        );
    }

    const headerRow = sheet.getRow(1);
    const headers = [];
    headerRow.eachCell({ includeEmpty: false }, (cell) => {
        headers.push(cellToText(cell.value));
    });

    const valueRows = [];
    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
        const row = sheet.getRow(rowNumber);
        const values = headers.map((_, index) =>
            cellToText(row.getCell(index + 1).value),
        );
        if (values.some((value) => value !== "")) {
            valueRows.push(values);
        }
    }

    if (valueRows.length === 0) {
        throw httpError(
            400,
            "INVALID_IMPORT_XLSX",
            "Excel sem linhas de dados para importar.",
        );
    }

    return rowsFromHeader(headers, valueRows, 2);
}

/**
 * Parseia o ficheiro indicado pelo payload para linhas tabulares.
 *
 * @param {{ fileName: string, content?: string, contentBase64?: string }} input - Dados de ficheiro vindos do pedido.
 * @returns {Promise<{ sourceFormat: "CSV" | "XLSX", rows: Array<Record<string, string | number>> }>} Formato e linhas normalizadas.
 */
export async function parseImportFileRows(input) {
    const sourceFormat = detectImportSourceFormat(input.fileName);

    if (sourceFormat === ImportSourceFormat.CSV) {
        return {
            sourceFormat,
            rows: parseCsvRows(input.content),
        };
    }

    return {
        sourceFormat,
        rows: await parseXlsxRows(input.contentBase64),
    };
}
