/**
 * @file Rate limit pedagógico para recuperação de password.
 *
 * O guia MF0 documenta que este limite em memória é aceitável apenas para
 * desenvolvimento. Em produção deve ser substituído por armazenamento partilhado.
 */

import { httpError } from "../../lib/httpErrors.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map();

/**
 * Bloqueia pedidos excessivos de recuperação para a mesma chave.
 *
 * @param {string} key - Chave composta, por exemplo IP + email normalizado.
 * @param {number} [now] - Timestamp atual em milissegundos, injetável em testes.
 * @returns {void}
 */
export function assertPasswordResetRateLimit(
    key,
    { now = Date.now(), isProduction = false } = {},
) {
    if (
        isProduction &&
        process.env.ALLOW_IN_MEMORY_PASSWORD_RESET_RATE_LIMIT !== "true"
    ) {
        throw httpError(
            503,
            "RATE_LIMIT_STORE_REQUIRED",
            "Rate limit de recuperação de password requer armazenamento partilhado em produção",
        );
    }

    const entry = attempts.get(key);

    if (!entry || entry.resetAt <= now) {
        attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return;
    }

    if (entry.count >= MAX_ATTEMPTS) {
        throw httpError(
            429,
            "RATE_LIMITED",
            "Demasiados pedidos de recuperação",
        );
    }

    entry.count += 1;
}
