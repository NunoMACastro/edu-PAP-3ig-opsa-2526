/**
 * @file Validadores para importações CSV e Excel de dados de negócio.
 */

import { httpError } from "../../lib/httpErrors.js";
import { parseCsvRows, parseImportRows } from "./importFileParser.js";

export { parseCsvRows };

const IMPORT_TYPES = new Set(["CUSTOMERS", "SUPPLIERS", "ITEMS", "STATEMENTS"]);

/**
 * Normaliza texto opcional removendo espaços exteriores.
 *
 * @param {unknown} value - Valor recebido do body JSON.
 * @returns {string} Texto normalizado.
 */
function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Valida payload base de importação de negócio.
 *
 * @param {unknown} input - Body JSON recebido em `POST /api/imports/business-data`.
 * @returns {Promise<{ type: string, fileName: string, content: string, contentBase64: string, treasuryAccountId: string | null, sourceFormat: string, rows: Array<Record<string, string>> }>} Payload normalizado e linhas parseadas.
 */
export async function validateBusinessImportPayload(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
  }

  const type = normalizeText(input.type).toUpperCase();
  if (!IMPORT_TYPES.has(type)) {
    throw httpError(400, "INVALID_IMPORT_TYPE", "Tipo de importação inválido");
  }

  const fileName = normalizeText(input.fileName) || `${type.toLowerCase()}.csv`;
  const content = normalizeText(input.content);
  const contentBase64 = normalizeText(input.contentBase64);
  const treasuryAccountId = normalizeText(input.treasuryAccountId) || null;

  if (type === "STATEMENTS" && !treasuryAccountId) {
    throw httpError(400, "TREASURY_ACCOUNT_REQUIRED", "Conta de tesouraria obrigatória");
  }

  // O parser é chamado no validator para falhar antes da transação e antes de qualquer escrita.
  const parsed = await parseImportRows({ fileName, content, contentBase64 });

  return {
    type,
    fileName,
    content,
    contentBase64,
    treasuryAccountId,
    sourceFormat: parsed.sourceFormat,
    rows: parsed.rows,
  };
}