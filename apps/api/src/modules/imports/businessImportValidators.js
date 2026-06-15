// apps/api/src/modules/imports/businessImportValidators.js
import { httpError } from "../../lib/httpErrors.js";

const importTypes = new Set(["CUSTOMERS", "SUPPLIERS", "ITEMS", "STATEMENTS"]);

/**
 * Parseia CSV separado por ponto e vírgula com cabeçalho na primeira linha.
 *
 * @param {string} content Conteúdo CSV textual.
 * @returns {Array<{ lineNumber: number, row: Record<string, string>, errors: string[] }>} Linhas com número original e lista de erros.
 */
function parseCsv(content) {
    const [headerLine, ...lines] = content.split(/\r?\n/).filter(Boolean);
    const headers = headerLine.split(";").map((header) => header.trim());
    return lines.map((line, index) => {
        const values = line.split(";");
        const row = Object.fromEntries(headers.map((header, position) => [header, values[position]?.trim() ?? ""]));
        return { lineNumber: index + 2, row, errors: [] };
    });
}

/**
 * Marca uma coluna obrigatória como erro da linha quando esta vazia.
 *
 * @param {{ row: Record<string, string>, errors: string[] }} parsedRow Linha em validação.
 * @param {string} column Nome da coluna.
 * @returns {void}
 */
function requireColumn(parsedRow, column) {
    if (!parsedRow.row[column]) parsedRow.errors.push(`${column} é obrigatório`);
}

/**
 * Valida uma coluna de data.
 *
 * @param {{ row: Record<string, string>, errors: string[] }} parsedRow Linha em validação.
 * @param {string} column Nome da coluna.
 * @returns {void}
 */
function requireDate(parsedRow, column) {
    requireColumn(parsedRow, column);
    if (parsedRow.row[column] && Number.isNaN(new Date(parsedRow.row[column]).getTime())) {
        parsedRow.errors.push(`${column} deve ser uma data válida`);
    }
}

/**
 * Valida uma coluna monetária textual em euros.
 *
 * @param {{ row: Record<string, string>, errors: string[] }} parsedRow Linha em validação.
 * @param {string} column Nome da coluna.
 * @returns {void}
 */
function requireAmount(parsedRow, column) {
    requireColumn(parsedRow, column);
    const amount = Number(String(parsedRow.row[column]).replace(",", "."));
    if (parsedRow.row[column] && !Number.isFinite(amount)) {
        parsedRow.errors.push(`${column} deve ser um valor numérico`);
    }
}

/**
 * Valida uma coluna numérica inteira.
 *
 * @param {{ row: Record<string, string>, errors: string[] }} parsedRow Linha em validação.
 * @param {string} column Nome da coluna.
 * @param {{ min?: number, max?: number }} options Limites aceites.
 * @returns {void}
 */
function requireInteger(parsedRow, column, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
    requireColumn(parsedRow, column);
    const value = Number(parsedRow.row[column]);
    if (parsedRow.row[column] && (!Number.isInteger(value) || value < min || value > max)) {
        parsedRow.errors.push(`${column} deve ser um inteiro válido`);
    }
}

/**
 * Valida a importação completa antes de qualquer escrita em base de dados.
 *
 * @param {{ type?: unknown, fileName?: unknown, content?: unknown }} body Body HTTP da route.
 * @returns {{ type: "CUSTOMERS" | "SUPPLIERS" | "ITEMS" | "STATEMENTS", fileName: string, rows: Array<{ lineNumber: number, row: Record<string, string>, errors: string[] }> }} DTO validado para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 para tipo ou conteúdo inválido.
 */
export function validateBusinessImportPayload(body) {
    const type = String(body.type ?? "").toUpperCase();
    if (!importTypes.has(type)) throw httpError(400, "INVALID_IMPORT_TYPE", "Tipo de importação inválido");
    if (typeof body.content !== "string" || body.content.trim() === "") throw httpError(400, "INVALID_IMPORT_FILE", "Conteúdo CSV obrigatório");

    const parsedRows = parseCsv(body.content);
    for (const parsedRow of parsedRows) {
        if (type === "CUSTOMERS" || type === "SUPPLIERS") {
            requireColumn(parsedRow, "name");
            requireColumn(parsedRow, "nif");
        }
        if (type === "ITEMS") {
            requireColumn(parsedRow, "sku");
            requireColumn(parsedRow, "name");
            requireInteger(parsedRow, "costCents", { min: 0 });
            requireInteger(parsedRow, "priceCents", { min: 1 });
            requireInteger(parsedRow, "vatRateBps", { min: 0, max: 10000 });
        }
        if (type === "STATEMENTS") {
            requireColumn(parsedRow, "treasuryAccountId");
            requireDate(parsedRow, "bookedAt");
            requireColumn(parsedRow, "description");
            requireAmount(parsedRow, "amount");
        }
    }

    return { type, fileName: String(body.fileName ?? "import.csv"), rows: parsedRows };
}