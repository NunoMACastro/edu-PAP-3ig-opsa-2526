import { httpError } from "../../lib/httpErrors.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map();

export function assertPasswordResetRateLimit(key, now = Date.now()) {
    const entry = attempts.get(key);

    if (!entry || entry.resetAt <= now) {
        attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return;
    }

    if (entry.count >= MAX_ATTEMPTS) {
        throw httpError(
            429,
            "RATE_LIMITED",
            "Demasiados pedidos de recuperacao",
        );
    }

    entry.count += 1;
}