// apps/api/src/modules/treasury/statementImportValidators.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Valida texto obrigatório do payload de importação.
 *
 * @param {unknown} value Valor recebido no body.
 * @param {string} fieldName Nome do campo para erro pedagogico.
 * @returns {string} Texto limpo.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando falta texto.
 */
function requiredText(value, fieldName) {
    if (typeof value !== "string" || value.trim() === "") {
        throw httpError(400, "INVALID_STATEMENT_IMPORT", `${fieldName} é obrigatório`);
    }
    return value.trim();
}

/**
 * Converte euros textuais para cêntimos inteiros.
 *
 * @param {unknown} value Valor textual como `123.45` ou `123,45`.
 * @returns {number} Valor em cêntimos, com sinal.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o valor não é numérico.
 */
function eurosToCents(value) {
    const amount = Number(String(value).replace(",", "."));
    if (!Number.isFinite(amount)) throw httpError(400, "INVALID_STATEMENT_AMOUNT", "Valor inválido no extrato");
    return Math.round(amount * 100);
}

/**
 * Parseia o CSV MVP no formato `data;descrição;referência;valor`.
 *
 * @param {string} content Conteúdo textual enviado pelo frontend.
 * @returns {Array<{ bookedAt: Date, description: string, reference: string | null, amountCents: number }>} Linhas normalizadas.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando data, descrição ou valor são inválidos.
 */
function parseCsv(content) {
    return content.split(/\r?\n/).filter(Boolean).map((line, index) => {
        const [dateText, description, reference, amount] = line.split(";");
        const bookedAt = new Date(dateText);
        if (Number.isNaN(bookedAt.getTime())) throw httpError(400, "INVALID_STATEMENT_DATE", `Data inválida na linha ${index + 1}`);
        return { bookedAt, description: requiredText(description, "Descrição"), reference: reference?.trim() || null, amountCents: eurosToCents(amount) };
    });
}

/**
 * Parseia OFX simplificado com tags `DTPOSTED=`, `MEMO=` e `TRNAMT=`.
 *
 * @param {string} content Conteúdo OFX textual.
 * @returns {Array<{ bookedAt: Date, description: string, reference: null, amountCents: number }>} Linhas normalizadas.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando falta uma tag obrigatória.
 */
function parseOfx(content) {
    const blocks = content.split("STMTTRN").slice(1);
    return blocks.map((block, index) => {
        const bookedAt = new Date(requiredText(block.match(/DTPOSTED=([^\n]+)/)?.[1], "DTPOSTED"));
        const description = requiredText(block.match(/MEMO=([^\n]+)/)?.[1], "MEMO");
        const amountCents = eurosToCents(requiredText(block.match(/TRNAMT=([^\n]+)/)?.[1], "TRNAMT"));
        if (Number.isNaN(bookedAt.getTime())) throw httpError(400, "INVALID_STATEMENT_DATE", `Data inválida no movimento ${index + 1}`);
        return { bookedAt, description, reference: null, amountCents };
    });
}

/**
 * Valida payload completo da importação de extrato.
 *
 * @param {{ treasuryAccountId?: unknown, fileName?: unknown, format?: unknown, content?: unknown }} body Body HTTP da route.
 * @returns {{ treasuryAccountId: string, fileName: string, format: "CSV" | "OFX", rows: Array<{ bookedAt: Date, description: string, reference: string | null, amountCents: number }> }} DTO seguro para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 para formato ou conteúdo inválido.
 */
export function validateStatementImportPayload(body) {
    const treasuryAccountId = requiredText(body.treasuryAccountId, "Conta");
    const fileName = requiredText(body.fileName, "Nome do ficheiro");
    const format = requiredText(body.format, "Formato").toUpperCase();
    const content = requiredText(body.content, "Conteúdo");

    if (!["CSV", "OFX"].includes(format)) throw httpError(400, "INVALID_STATEMENT_FORMAT", "Formato deve ser CSV ou OFX");

    return { treasuryAccountId, fileName, format, rows: format === "CSV" ? parseCsv(content) : parseOfx(content) };
}