/**
 * @file Worker isolado para parsing de workbooks XLSX.
 *
 * O processo principal pode terminar este worker quando o orçamento temporal é
 * excedido. Nenhuma fórmula é executada; apenas valores/resultados já gravados
 * no ficheiro são convertidos para texto simples.
 */

import ExcelJS from "exceljs";
import { isMainThread, parentPort } from "node:worker_threads";

export const MAX_XLSX_ROWS = 5000;
export const MAX_XLSX_COLUMNS = 100;
export const MAX_XLSX_CELLS = 100_000;

/**
 * Converte um valor Excel para texto sem avaliar fórmulas.
 *
 * @param {unknown} value - Valor guardado na célula.
 * @returns {string} Representação segura.
 */
function cellToText(value) {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value !== "object") return String(value).trim();
    if ("text" in value) return String(value.text ?? "").trim();
    if ("result" in value) return String(value.result ?? "").trim();
    if ("richText" in value && Array.isArray(value.richText)) {
        return value.richText.map((part) => String(part.text ?? "")).join("").trim();
    }
    return "";
}

/**
 * Parseia o primeiro worksheet e aplica limites de linhas, colunas e células.
 *
 * @param {Buffer} buffer - Workbook já aprovado pelo ZIP guard.
 * @returns {Promise<Array<Record<string, string | number>>>} Linhas normalizadas.
 */
export async function parseWorkbookBuffer(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.worksheets[0];
    if (!sheet || sheet.rowCount < 2) {
        throw new Error("Excel deve ter cabeçalho e pelo menos uma linha.");
    }
    if (sheet.rowCount - 1 > MAX_XLSX_ROWS) {
        throw new Error(`A importação está limitada a ${MAX_XLSX_ROWS} linhas.`);
    }

    const columnCount = Math.max(sheet.actualColumnCount, sheet.columnCount);
    if (columnCount < 1 || columnCount > MAX_XLSX_COLUMNS) {
        throw new Error(`O Excel está limitado a ${MAX_XLSX_COLUMNS} colunas.`);
    }
    if (sheet.rowCount * columnCount > MAX_XLSX_CELLS) {
        throw new Error(`O Excel está limitado a ${MAX_XLSX_CELLS} células.`);
    }

    const headers = Array.from({ length: columnCount }, (_, index) =>
        cellToText(sheet.getRow(1).getCell(index + 1).value),
    );
    if (headers.some((header) => !header) || new Set(headers).size !== headers.length) {
        throw new Error("O Excel deve ter cabeçalhos preenchidos e únicos.");
    }

    const rows = [];
    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
        const row = sheet.getRow(rowNumber);
        const values = headers.map((_, index) =>
            cellToText(row.getCell(index + 1).value),
        );
        if (values.some((value) => value !== "")) {
            rows.push({
                __rowNumber: rowNumber,
                ...Object.fromEntries(
                    headers.map((header, index) => [header, values[index]]),
                ),
            });
        }
    }
    if (rows.length === 0) {
        throw new Error("Excel sem linhas de dados para importar.");
    }
    return rows;
}

if (!isMainThread && parentPort) {
    parentPort.once("message", async (bytes) => {
        try {
            const rows = await parseWorkbookBuffer(Buffer.from(bytes));
            parentPort.postMessage({ ok: true, rows });
        } catch (error) {
            parentPort.postMessage({
                ok: false,
                message: error instanceof Error ? error.message : "XLSX inválido.",
            });
        }
    });
}
