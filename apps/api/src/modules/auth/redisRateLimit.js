/**
 * @file Rate limiting distribuído de autenticação suportado por Redis.
 */

import crypto from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";

const CONSUME_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return {current, ttl}
`;

export const AUTH_RATE_LIMIT_POLICIES = Object.freeze({
    REGISTER_IP: Object.freeze({ limit: 10, windowMs: 15 * 60 * 1000 }),
    LOGIN_IP: Object.freeze({ limit: 50, windowMs: 15 * 60 * 1000 }),
    LOGIN_ACCOUNT: Object.freeze({ limit: 5, windowMs: 15 * 60 * 1000 }),
    PASSWORD_FORGOT_IP: Object.freeze({ limit: 10, windowMs: 15 * 60 * 1000 }),
    PASSWORD_FORGOT_ACCOUNT: Object.freeze({ limit: 5, windowMs: 15 * 60 * 1000 }),
    PASSWORD_RESET_IP: Object.freeze({ limit: 20, windowMs: 15 * 60 * 1000 }),
});

/**
 * Esconde a chave funcional antes de a enviar para Redis.
 *
 * @param {string} scope - Âmbito funcional.
 * @param {string} key - IP/email normalizado.
 * @param {Buffer} hmacKey - Chave secreta de separação do domínio Redis.
 * @returns {string} Digest HMAC estável.
 */
function digestKey(scope, key, hmacKey) {
    return crypto
        .createHmac("sha256", hmacKey)
        .update(`${scope}:${key}`)
        .digest("hex");
}

/**
 * Constrói o rate limiter Redis partilhado por todas as instâncias da API.
 *
 * @param {{ client: { eval: Function, del: Function }, hmacKey: string | Buffer, prefix?: string }} options - Cliente Redis ligado e chave HMAC.
 * @returns {{ consume(scope: string, key: string, policy: { limit: number, windowMs: number }): Promise<object>, reset(scope: string, key: string): Promise<void> }} Rate limiter.
 */
export function createRedisRateLimiter({
    client,
    hmacKey,
    prefix = "opsa:auth-rate-limit",
}) {
    if (!client || typeof client.eval !== "function" || typeof client.del !== "function") {
        throw new TypeError("Cliente Redis válido é obrigatório para rate limiting.");
    }
    const normalizedHmacKey = Buffer.isBuffer(hmacKey)
        ? hmacKey
        : Buffer.from(String(hmacKey ?? ""), "utf8");
    if (normalizedHmacKey.length < 32) {
        throw new TypeError("RATE_LIMIT_HMAC_KEY deve ter pelo menos 32 bytes.");
    }

    const redisKey = (scope, key) =>
        `${prefix}:${scope}:${digestKey(scope, key, normalizedHmacKey)}`;

    return {
        async consume(scope, key, policy) {
            if (!Number.isInteger(policy?.limit) || !Number.isInteger(policy?.windowMs)) {
                throw new TypeError("Política de rate limit inválida.");
            }

            try {
                const [count, ttlMs] = await client.eval(CONSUME_SCRIPT, {
                    keys: [redisKey(scope, key)],
                    arguments: [String(policy.windowMs)],
                });

                if (Number(count) > policy.limit) {
                    throw httpError(
                        429,
                        "RATE_LIMITED",
                        "Demasiados pedidos de autenticação",
                        { retryAfterMs: Math.max(0, Number(ttlMs)) },
                    );
                }

                return { count: Number(count), remaining: policy.limit - Number(count) };
            } catch (error) {
                if (error?.code === "RATE_LIMITED") throw error;
                throw httpError(
                    503,
                    "RATE_LIMIT_UNAVAILABLE",
                    "Proteção de autenticação temporariamente indisponível",
                );
            }
        },

        async reset(scope, key) {
            try {
                await client.del(redisKey(scope, key));
            } catch {
                throw httpError(
                    503,
                    "RATE_LIMIT_UNAVAILABLE",
                    "Proteção de autenticação temporariamente indisponível",
                );
            }
        },
    };
}

/**
 * Cria o único fallback local permitido: desenvolvimento e testes unitários
 * explícitos. As chaves continuam protegidas por HMAC e nunca guardam IP/email.
 * Este adapter não deve ser usado por processos equivalentes a produção.
 *
 * @param {{ nodeEnv: "development" | "test", hmacKey: string | Buffer, prefix?: string, store?: Map<string, {count: number, expiresAt: number}>, now?: () => number }} options - Contrato local fechado.
 * @returns {{ consume(scope: string, key: string, policy: { limit: number, windowMs: number }): Promise<object>, reset(scope: string, key: string): Promise<void> }} Rate limiter local.
 */
export function createLocalRateLimiter({
    nodeEnv,
    hmacKey,
    prefix = "opsa:local-auth-rate-limit",
    store = new Map(),
    now = Date.now,
}) {
    if (nodeEnv !== "development" && nodeEnv !== "test") {
        throw new TypeError(
            "O rate limiter local só é permitido em development ou test.",
        );
    }
    if (!(store instanceof Map) || typeof now !== "function") {
        throw new TypeError("Store e relógio locais inválidos.");
    }
    const normalizedHmacKey = Buffer.isBuffer(hmacKey)
        ? hmacKey
        : Buffer.from(String(hmacKey ?? ""), "utf8");
    if (normalizedHmacKey.length < 32) {
        throw new TypeError("RATE_LIMIT_HMAC_KEY deve ter pelo menos 32 bytes.");
    }
    const localKey = (scope, key) =>
        `${prefix}:${scope}:${digestKey(scope, key, normalizedHmacKey)}`;

    return {
        async consume(scope, key, policy) {
            if (
                !Number.isInteger(policy?.limit) ||
                policy.limit < 1 ||
                !Number.isInteger(policy?.windowMs) ||
                policy.windowMs < 1
            ) {
                throw new TypeError("Política de rate limit inválida.");
            }
            const timestamp = now();
            const keyHash = localKey(scope, key);
            const current = store.get(keyHash);
            const entry =
                !current || current.expiresAt <= timestamp
                    ? { count: 0, expiresAt: timestamp + policy.windowMs }
                    : current;
            entry.count += 1;
            store.set(keyHash, entry);
            if (entry.count > policy.limit) {
                throw httpError(
                    429,
                    "RATE_LIMITED",
                    "Demasiados pedidos de autenticação",
                    { retryAfterMs: Math.max(0, entry.expiresAt - timestamp) },
                );
            }
            return { count: entry.count, remaining: policy.limit - entry.count };
        },

        async reset(scope, key) {
            store.delete(localKey(scope, key));
        },
    };
}
