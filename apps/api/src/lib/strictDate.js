/**
 * @file Parser central de datas civis recebidas pela API.
 *
 * Datas contabilísticas não são timestamps: representam um dia de calendário.
 * Este módulo rejeita valores que o construtor `Date` normalizaria silenciosamente,
 * como `2026-02-30`, e devolve sempre a meia-noite UTC desse dia.
 */

import { httpError } from "./httpErrors.js";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Converte uma data civil `YYYY-MM-DD` numa `Date` UTC sem aceitar normalização.
 *
 * @param {unknown} value - Valor externo a validar.
 * @param {{ code?: string, field?: string }} [options] - Código HTTP e nome humano do campo.
 * @returns {Date} Data na meia-noite UTC do dia indicado.
 * @throws {Error} Erro HTTP 400 quando formato ou dia de calendário são inválidos.
 */
export function parseStrictDateOnly(value, options = {}) {
    const code = options.code ?? "INVALID_DATE";
    const field = options.field ?? "Data";
    const raw = typeof value === "string" ? value.trim() : "";
    const match = DATE_ONLY_PATTERN.exec(raw);

    if (!match) {
        throw httpError(400, code, `${field} deve usar o formato YYYY-MM-DD`);
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw httpError(400, code, `${field} contém um dia de calendário inválido`);
    }

    return date;
}

/**
 * Converte uma data civil opcional, mantendo `null` quando o campo está vazio.
 *
 * @param {unknown} value - Valor externo opcional.
 * @param {{ code?: string, field?: string }} [options] - Código HTTP e nome humano do campo.
 * @returns {Date | null} Data validada ou `null`.
 */
export function parseOptionalStrictDateOnly(value, options = {}) {
    if (value === undefined || value === null || value === "") return null;
    return parseStrictDateOnly(value, options);
}

