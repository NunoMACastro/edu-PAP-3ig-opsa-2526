/**
 * @file Validação e parsing de extratos bancários CSV/OFX simplificados.
 */

import { httpError } from "../../lib/httpErrors.js";

const FORMATS = new Set(["CSV", "OFX", "XLSX"]);

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
 * Interpreta datas de extrato nos formatos aceites e rejeita datas inválidas.
 *
 * @param value - Valor a normalizar ou formatar.
 * @returns Data de extrato validada.
 */
function parseStatementDate(value) {
    const text = normalizeText(value);
    const normalizedOfx = /^\d{8}/.test(text)
        ? `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`
        : text;
    const date = new Date(normalizedOfx);
    if (Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_STATEMENT_DATE", "Data de extrato inválida");
    }
    return date;
}

/**
 * Converte valores monetários portugueses ou simples para cêntimos inteiros.
 *
 * @param value - Valor a normalizar ou formatar.
 * @returns Valor monetário convertido para cêntimos.
 */
function parseMoneyToCents(value) {
    const text = normalizeText(value)
        .replace(/\s/g, "")
        .replace(/\.(?=\d{3}(,|$))/g, "")
        .replace(",", ".");
    const amount = Number(text);
    if (!Number.isFinite(amount)) {
        throw httpError(400, "INVALID_STATEMENT_AMOUNT", "Valor de extrato inválido");
    }
    return Math.round(amount * 100);
}

/**
 * Converte conteúdo CSV simples de extrato bancário em linhas normalizadas.
 *
 * @param content - Conteúdo textual a analisar.
 * @returns Linhas de extrato e erros extraídos do CSV.
 */
function parseCsv(content) {
    const rows = [];
    const errors = [];
    const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    for (const [index, line] of lines.entries()) {
        const parts = line.split(";").map((part) => part.trim());
        const headerLike = index === 0 && /data|date/i.test(parts[0] ?? "");
        if (headerLike) continue;
        try {
            const [date, description, maybeReference, maybeAmount] = parts;
            const amountRaw = maybeAmount ?? maybeReference;
            rows.push({
                lineNumber: index + 1,
                entryDate: parseStatementDate(date),
                description: description || "Movimento bancário",
                reference: maybeAmount ? maybeReference || null : null,
                amountCents: parseMoneyToCents(amountRaw),
                raw: { line },
            });
        } catch (error) {
            errors.push({ line: index + 1, message: error.message });
        }
    }
    return { rows, errors, totalLines: lines.length };
}

/**
 * Obtém o primeiro valor existente numa linha tabular importada.
 *
 * @param {Record<string, unknown>} row - Linha normalizada pelo parser comum.
 * @param {string[]} keys - Nomes de coluna aceites.
 * @returns {unknown} Valor encontrado ou vazio.
 */
function pickRowValue(row, keys) {
    const normalizedEntries = Object.entries(row).map(([key, value]) => [
        key.trim().toLowerCase(),
        value,
    ]);
    for (const expectedKey of keys) {
        const found = normalizedEntries.find(([key]) => key === expectedKey);
        if (found) return found[1];
    }
    return "";
}

/**
 * Converte linhas CSV/XLSX já parseadas para o contrato interno de extratos.
 *
 * @param {Array<Record<string, unknown>>} inputRows - Linhas tabulares com cabeçalhos.
 * @returns {{ rows: object[], errors: object[], totalLines: number }} Linhas e erros de validação.
 */
function parseTabularRows(inputRows) {
    const rows = [];
    const errors = [];

    for (const [index, row] of inputRows.entries()) {
        if (!row || typeof row !== "object" || Array.isArray(row)) {
            errors.push({
                line: index + 2,
                message: "Linha de extrato inválida",
            });
            continue;
        }
        const lineNumber = Number.isInteger(row.__rowNumber) ? row.__rowNumber : index + 2;
        try {
            const date = pickRowValue(row, ["data", "date", "entrydate"]);
            const description = pickRowValue(row, [
                "descricao",
                "descrição",
                "description",
            ]);
            const reference = pickRowValue(row, ["referencia", "referência", "reference"]);
            const amount = pickRowValue(row, ["valor", "amount", "amountcents"]);

            rows.push({
                lineNumber,
                entryDate: parseStatementDate(date),
                description: normalizeText(description) || "Movimento bancário",
                reference: normalizeText(reference) || null,
                amountCents: parseMoneyToCents(amount),
                raw: { row },
            });
        } catch (error) {
            errors.push({ line: lineNumber, message: error.message });
        }
    }

    return { rows, errors, totalLines: inputRows.length };
}

/**
 * Extrai o conteúdo de uma tag simples num documento OFX simplificado.
 *
 * @param block - Bloco de texto onde a tag é procurada.
 * @param tag - Nome da tag XML/OFX a extrair.
 * @returns Valor textual extraído da tag indicada.
 */
function tagValue(block, tag) {
    return block.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, "i"))?.[1]?.trim() ?? "";
}

/**
 * Extrai transações de um OFX simplificado para o formato interno de linhas de extrato.
 *
 * @param content - Conteúdo textual a analisar.
 * @returns Linhas de extrato e erros extraídos do OFX simplificado.
 */
function parseOfx(content) {
    const blocks = content.match(/<STMTTRN>[\s\S]*?(?=<STMTTRN>|<\/BANKTRANLIST>|$)/gi) ?? [];
    const rows = [];
    const errors = [];
    for (const [index, block] of blocks.entries()) {
        try {
            rows.push({
                lineNumber: index + 1,
                entryDate: parseStatementDate(tagValue(block, "DTPOSTED")),
                description:
                    tagValue(block, "NAME") ||
                    tagValue(block, "MEMO") ||
                    "Movimento bancário",
                reference: tagValue(block, "FITID") || null,
                amountCents: parseMoneyToCents(tagValue(block, "TRNAMT")),
                raw: { block },
            });
        } catch (error) {
            errors.push({ line: index + 1, message: error.message });
        }
    }
    return { rows, errors, totalLines: blocks.length };
}

/**
 * Valida payload de importação de extrato.
 *
 * @param {unknown} input - Payload JSON.
 * @returns {object} Importação normalizada.
 */
export function validateStatementImportPayload(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const treasuryAccountId = normalizeText(input.treasuryAccountId);
    const format = normalizeText(input.format).toUpperCase();
    const fileName = normalizeText(input.fileName) || `extrato.${format.toLowerCase()}`;
    const content = normalizeText(input.content);
    const rows = Array.isArray(input.rows) ? input.rows : null;

    if (!treasuryAccountId) {
        throw httpError(400, "TREASURY_ACCOUNT_REQUIRED", "Conta de tesouraria obrigatória");
    }
    if (!FORMATS.has(format)) {
        throw httpError(400, "INVALID_STATEMENT_FORMAT", "Formato de extrato inválido");
    }
    if (!content && !rows) {
        throw httpError(400, "INVALID_STATEMENT_FORMAT", "Conteúdo do extrato obrigatório");
    }

    const parsed = rows
        ? parseTabularRows(rows)
        : format === "CSV"
          ? parseCsv(content)
          : parseOfx(content);
    if (parsed.rows.length === 0) {
        throw httpError(
            400,
            "INVALID_STATEMENT_FORMAT",
            "Extrato sem linhas válidas para importar",
            parsed.errors,
        );
    }

    return { treasuryAccountId, format, fileName, ...parsed };
}
