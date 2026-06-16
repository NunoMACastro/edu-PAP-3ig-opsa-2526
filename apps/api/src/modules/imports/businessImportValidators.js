/**
 * @file Validadores para importações CSV de dados mestre da MF3.
 */

import { httpError } from "../../lib/httpErrors.js";

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
 * Converte CSV com cabeçalho em linhas de objetos simples.
 *
 * @param {string} content - Conteúdo textual CSV separado por `;`.
 * @returns {Array<Record<string, string>>} Linhas normalizadas por cabeçalho.
 */
export function parseCsvRows(content) {
    const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length < 2) {
        throw httpError(400, "INVALID_IMPORT_CSV", "CSV deve ter cabeçalho e pelo menos uma linha");
    }
    const headers = lines[0].split(";").map((header) => header.trim());
    return lines.slice(1).map((line) => {
        const values = line.split(";").map((value) => value.trim());
        return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    });
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
    const treasuryAccountId = normalizeText(input.treasuryAccountId) || null;

    if (!IMPORT_TYPES.has(type)) {
        throw httpError(400, "INVALID_IMPORT_TYPE", "Tipo de importação inválido");
    }
    if (!content) {
        throw httpError(400, "INVALID_IMPORT_CSV", "Conteúdo CSV obrigatório");
    }

    return { type, fileName, content, treasuryAccountId };
}
