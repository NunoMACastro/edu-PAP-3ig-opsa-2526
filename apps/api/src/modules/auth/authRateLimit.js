/**
 * @file Rate limit em memória para endpoints de autenticação da MF0.
 *
 * Este limite é suficiente para desenvolvimento e smoke tests locais. Em
 * produção deve existir armazenamento partilhado, caso contrário a API falha
 * explicitamente para não fingir proteção distribuída.
 */

import { httpError } from "../../lib/httpErrors.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map();

/**
 * Bloqueia excesso de pedidos de autenticação para uma chave funcional.
 *
 * @param {string} key - Chave composta, por exemplo endpoint + IP + email.
 * @param {{ now?: number, isProduction?: boolean }} [options] - Opções de execução.
 * @returns {void}
 */
export function assertAuthRateLimit(
    key,
    { now = Date.now(), isProduction = false } = {},
) {
    if (
        isProduction &&
        process.env.ALLOW_IN_MEMORY_AUTH_RATE_LIMIT !== "true"
    ) {
        throw httpError(
            503,
            "RATE_LIMIT_STORE_REQUIRED",
            "Rate limit de autenticação requer armazenamento partilhado em produção",
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
            "Demasiados pedidos de autenticação",
        );
    }

    entry.count += 1;
}
