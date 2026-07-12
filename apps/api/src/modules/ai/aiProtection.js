/**
 * @file Reservas atómicas Redis para quotas e rate limits da IA.
 *
 * Os identificadores usados nas chaves devem chegar já pseudonimizados. O
 * script valida todos os limites antes de incrementar qualquer contador, para
 * que concorrência entre processos não permita ultrapassar a política.
 */

import { httpError } from "../../lib/httpErrors.js";

const RESERVE_SCRIPT = `
for index = 1, #KEYS do
  local current = tonumber(redis.call('get', KEYS[index]) or '0')
  local limit = tonumber(ARGV[(index - 1) * 2 + 1])
  if current >= limit then
    return {0, index, current}
  end
end
local result = {1}
for index = 1, #KEYS do
  local ttl = tonumber(ARGV[(index - 1) * 2 + 2])
  local nextValue = redis.call('incr', KEYS[index])
  if nextValue == 1 then redis.call('pexpire', KEYS[index], ttl) end
  table.insert(result, nextValue)
end
return result
`;

/** Reserva em simultâneo todos os contadores indicados. */
export async function reserveAtomicLimits(redisClient, entries, options = {}) {
    if (!Array.isArray(entries) || entries.length === 0) {
        throw new TypeError("É necessário indicar pelo menos um limite de IA.");
    }
    if (!redisClient?.isOpen) {
        if (options.failClosed) {
            throw httpError(503, "AI_RATE_LIMIT_UNAVAILABLE", "A proteção de limites da IA está temporariamente indisponível.");
        }
        return { reserved: false, bypassed: true, counts: [] };
    }
    const keys = entries.map((entry) => entry.key);
    const args = entries.flatMap((entry) => [String(entry.limit), String(entry.ttlMs)]);
    const result = await redisClient.eval(RESERVE_SCRIPT, { keys, arguments: args });
    if (!Array.isArray(result) || Number(result[0]) !== 1) {
        const failedIndex = Math.max(0, Number(result?.[1] ?? 1) - 1);
        const failed = entries[failedIndex];
        throw httpError(failed?.status ?? 429, failed?.code ?? "AI_RATE_LIMITED", failed?.message ?? "Limite de IA atingido.");
    }
    return { reserved: true, bypassed: false, counts: result.slice(1).map(Number) };
}

/** Calcula a duração até à próxima meia-noite civil de Lisboa. */
export function millisecondsUntilNextLisbonDay(now, toLocalDateKey, zonedDateBoundary) {
    const localDate = toLocalDateKey(now);
    const noonUtc = new Date(`${localDate}T12:00:00.000Z`);
    noonUtc.setUTCDate(noonUtc.getUTCDate() + 1);
    const nextDate = noonUtc.toISOString().slice(0, 10);
    return Math.max(1_000, zonedDateBoundary(nextDate).getTime() - now.getTime());
}
