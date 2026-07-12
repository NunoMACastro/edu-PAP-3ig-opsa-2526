/**
 * @file Parser comum para importações CSV e Excel do OPSA.
 */

import { Worker } from "node:worker_threads";

import { httpError } from "../../lib/httpErrors.js";
import { inspectXlsxArchive } from "../../lib/xlsxArchiveLimits.js";

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
 * O workbook é processado num worker terminável para que o timeout seja real,
 * mesmo quando o parser fica ocupado com dados hostis.
 *
 * @param {Buffer} fileBuffer - Conteúdo XLSX binário.
 * @param {{ timeoutMs?: number }} [options] - Orçamento temporal para testes/operação.
 * @returns {Promise<Array<Record<string, string | number>>>} Linhas normalizadas.
 */
async function parseXlsxRows(fileBuffer, options = {}) {
    if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
        throw httpError(
            400,
            "INVALID_IMPORT_XLSX",
            "Ficheiro Excel binário obrigatório.",
        );
    }
    inspectXlsxArchive(fileBuffer);
    const timeoutMs = options.timeoutMs ?? 5000;

    return new Promise((resolve, reject) => {
        const worker = new Worker(new URL("./xlsxParserWorker.js", import.meta.url));
        let settled = false;
        const finish = (callback, value) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            void worker.terminate();
            callback(value);
        };
        const timer = setTimeout(
            () =>
                finish(
                    reject,
                    httpError(
                        408,
                        "XLSX_PARSE_TIMEOUT",
                        "O parsing do XLSX excedeu o tempo permitido.",
                    ),
                ),
            timeoutMs,
        );
        worker.once("message", (message) => {
            if (message?.ok) {
                finish(resolve, message.rows);
                return;
            }
            finish(
                reject,
                httpError(
                    400,
                    "INVALID_IMPORT_XLSX",
                    message?.message ?? "Não foi possível ler o XLSX.",
                ),
            );
        });
        worker.once("error", () =>
            finish(
                reject,
                httpError(
                    400,
                    "INVALID_IMPORT_XLSX",
                    "Não foi possível ler o XLSX.",
                ),
            ),
        );

        const transferable = Uint8Array.from(fileBuffer);
        worker.postMessage(transferable, [transferable.buffer]);
    });
}

/**
 * Parseia o ficheiro indicado pelo payload para linhas tabulares.
 *
 * @param {{ fileName: string, fileBuffer: Buffer, xlsxTimeoutMs?: number }} input - Dados binários multipart.
 * @returns {Promise<{ sourceFormat: "CSV" | "XLSX", rows: Array<Record<string, string | number>> }>} Formato e linhas normalizadas.
 */
export async function parseImportFileRows(input) {
    const sourceFormat = detectImportSourceFormat(input.fileName);

    if (sourceFormat === ImportSourceFormat.CSV) {
        if (!Buffer.isBuffer(input.fileBuffer)) {
            throw httpError(400, "INVALID_IMPORT_CSV", "Ficheiro CSV binário obrigatório.");
        }
        return {
            sourceFormat,
            rows: parseCsvRows(new TextDecoder("utf-8", { fatal: true }).decode(input.fileBuffer)),
        };
    }

    return {
        sourceFormat,
        rows: await parseXlsxRows(input.fileBuffer, {
            timeoutMs: input.xlsxTimeoutMs,
        }),
    };
}
