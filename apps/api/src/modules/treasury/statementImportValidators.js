/**
 * @file Validação e parsing de extratos bancários CSV/OFX simplificados.
 */

import { httpError } from "../../lib/httpErrors.js";

const FORMATS = new Set(["CSV", "OFX"]);

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

    if (!treasuryAccountId) {
        throw httpError(400, "TREASURY_ACCOUNT_REQUIRED", "Conta de tesouraria obrigatória");
    }
    if (!FORMATS.has(format)) {
        throw httpError(400, "INVALID_STATEMENT_FORMAT", "Formato de extrato inválido");
    }
    if (!content) {
        throw httpError(400, "INVALID_STATEMENT_FORMAT", "Conteúdo do extrato obrigatório");
    }

    const parsed = format === "CSV" ? parseCsv(content) : parseOfx(content);
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
