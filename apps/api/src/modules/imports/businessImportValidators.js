/**
 * @file Validadores para importações CSV/Excel de dados mestre.
 */

import { httpError } from "../../lib/httpErrors.js";
import {
    detectImportSourceFormat,
    ImportSourceFormat,
    parseCsvRows as parseCsvFileRows,
} from "./importFileParser.js";

const IMPORT_TYPES = new Set(["CUSTOMERS", "SUPPLIERS", "ITEMS", "STATEMENTS"]);

/**
 * Normaliza texto opcional removendo espaços e devolvendo undefined quando fica vazio.
 *
 * @param value - Valor a normalizar ou formatar.
 * @returns Texto normalizado, ou valor vazio quando aplicável.
 */
function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
}

/**
 * Converte CSV com cabeçalho no contrato legado da MF3, sem metadados internos.
 *
 * @param {string} content - Conteúdo textual CSV separado por `;`.
 * @returns {Array<Record<string, string>>} Linhas normalizadas por cabeçalho.
 */
export function parseCsvRows(content) {
    return parseCsvFileRows(content).map(({ __rowNumber: _rowNumber, ...row }) => row);
}

/**
 * Valida payload base de importação.
 *
 * @param {unknown} input - Descriptor interno derivado do multipart.
 * @returns {object} Payload normalizado.
 */
export function validateBusinessImportPayload(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw httpError(400, "INVALID_IMPORT_INPUT", "Dados internos de importação inválidos");
    }

    const type = normalizeText(input.type).toUpperCase();
    const fileName = normalizeText(input.fileName) || `${type.toLowerCase()}.csv`;
    const fileBuffer = Buffer.isBuffer(input.fileBuffer) ? input.fileBuffer : null;
    const treasuryAccountId = normalizeText(input.treasuryAccountId) || null;

    if (!IMPORT_TYPES.has(type)) {
        throw httpError(400, "INVALID_IMPORT_TYPE", "Tipo de importação inválido");
    }
    const sourceFormat = detectImportSourceFormat(fileName);
    if (!fileBuffer || fileBuffer.length === 0) {
        throw httpError(
            400,
            sourceFormat === ImportSourceFormat.CSV
                ? "INVALID_IMPORT_CSV"
                : "INVALID_IMPORT_XLSX",
            "Ficheiro multipart obrigatório.",
        );
    }

    return { type, fileName, fileBuffer, sourceFormat, treasuryAccountId };
}
