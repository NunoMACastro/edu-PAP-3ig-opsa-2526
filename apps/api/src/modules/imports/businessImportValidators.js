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
 * @param {unknown} input - Payload JSON.
 * @returns {object} Payload normalizado.
 */
export function validateBusinessImportPayload(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const type = normalizeText(input.type).toUpperCase();
    const fileName = normalizeText(input.fileName) || `${type.toLowerCase()}.csv`;
    const content = normalizeText(input.content);
    const contentBase64 = normalizeText(input.contentBase64);
    const treasuryAccountId = normalizeText(input.treasuryAccountId) || null;

    if (!IMPORT_TYPES.has(type)) {
        throw httpError(400, "INVALID_IMPORT_TYPE", "Tipo de importação inválido");
    }
    const sourceFormat = detectImportSourceFormat(fileName);
    if (sourceFormat === ImportSourceFormat.CSV && !content) {
        throw httpError(400, "INVALID_IMPORT_CSV", "Conteúdo CSV obrigatório");
    }
    if (sourceFormat === ImportSourceFormat.XLSX && !contentBase64) {
        throw httpError(
            400,
            "INVALID_IMPORT_XLSX",
            "Conteúdo Excel em base64 obrigatório",
        );
    }

    return { type, fileName, content, contentBase64, sourceFormat, treasuryAccountId };
}
