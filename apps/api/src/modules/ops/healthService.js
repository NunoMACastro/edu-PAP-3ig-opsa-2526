/**
 * @file Liveness e readiness reais da API OPSA.
 *
 * Liveness confirma apenas que o processo responde. Readiness testa as
 * dependências críticas sem revelar hosts, credenciais, nomes de bases ou
 * buckets. Cada prova tem timeout próprio para não pendurar o endpoint.
 */

import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";

const DEFAULT_TIMEOUT_MS = 1500;
const ABORT_SETTLE_GRACE_MS = 250;

function throwIfAborted(signal) {
    if (!signal?.aborted) return;
    throw signal.reason instanceof Error
        ? signal.reason
        : new Error("Dependency check aborted");
}

function combineOperationalAndCleanupError(operationError, cleanupError, message) {
    if (!operationError) return cleanupError;
    return new AggregateError([operationError, cleanupError], message, {
        cause: operationError,
    });
}

/**
 * Executa uma prova com timeout e devolve apenas estado/duração seguros.
 *
 * @param {string} name - Nome público da dependência.
 * @param {() => Promise<unknown>} check - Prova assíncrona.
 * @param {number} timeoutMs - Orçamento em milissegundos.
 * @returns {Promise<{name: string, status: "up" | "down", durationMs: number}>} Resultado seguro.
 */
async function timedDependencyCheck(name, check, timeoutMs) {
    const startedAt = performance.now();
    const controller = new AbortController();
    const checkPromise = Promise.resolve().then(() => check(controller.signal));
    let timer;
    let settleTimer;
    let timedOut = false;
    try {
        await Promise.race([
            checkPromise,
            new Promise((_, reject) => {
                timer = setTimeout(() => {
                    timedOut = true;
                    const timeoutError = new Error("timeout");
                    controller.abort(timeoutError);
                    reject(timeoutError);
                }, timeoutMs);
            }),
        ]);
        return {
            name,
            status: "up",
            durationMs: Math.round(performance.now() - startedAt),
        };
    } catch {
        if (timedOut) {
            // Adapters canceláveis entram no `finally` e executam cleanup antes
            // de o boundary devolver 503. O grace evita reintroduzir hangs em
            // drivers externos que não suportam AbortSignal.
            await Promise.race([
                checkPromise.catch(() => undefined),
                new Promise((resolve) => {
                    settleTimer = setTimeout(resolve, ABORT_SETTLE_GRACE_MS);
                }),
            ]);
        }
        return {
            name,
            status: "down",
            durationMs: Math.round(performance.now() - startedAt),
        };
    } finally {
        clearTimeout(timer);
        clearTimeout(settleTimer);
    }
}

/**
 * Cria o payload de liveness sem consultar serviços externos.
 *
 * @param {{ version: string, now?: Date }} options - Versão pública e relógio opcional.
 * @returns {{ status: "ok", service: "opsa-api", version: string, checkedAt: string }} Payload público.
 */
export function buildLiveness(options) {
    const version = String(options?.version ?? "").trim();
    const now = options?.now ?? new Date();
    if (!version || !(now instanceof Date) || Number.isNaN(now.getTime())) {
        throw new TypeError("Configuração de liveness inválida.");
    }
    return {
        status: "ok",
        service: "opsa-api",
        version,
        checkedAt: now.toISOString(),
    };
}

/**
 * Prova que a credencial PostgreSQL consegue abrir uma transação explicitamente
 * read-only, usar o schema e possuir as permissões CRUD exigidas sobre todas
 * as tabelas funcionais. A prova consulta apenas o catálogo PostgreSQL e não
 * lê nem altera linhas de negócio.
 *
 * @param {object} prisma - PrismaClient ligado ao PostgreSQL.
 * @returns {Promise<true>} Confirmação interna da prova.
 */
export async function checkPostgresOperationalAccess(prisma, signal) {
    throwIfAborted(signal);
    if (typeof prisma?.$transaction !== "function") {
        throw new TypeError("Prisma sem suporte transacional para readiness.");
    }
    await prisma.$transaction(async (transaction) => {
        throwIfAborted(signal);
        if (
            typeof transaction?.$executeRaw !== "function" ||
            typeof transaction?.$queryRaw !== "function"
        ) {
            throw new TypeError("Transação Prisma incompleta para readiness.");
        }
        await transaction.$executeRaw(Prisma.sql`SET TRANSACTION READ ONLY`);
        throwIfAborted(signal);
        const rows = await transaction.$queryRaw(Prisma.sql`
            SELECT
                has_schema_privilege(current_user, 'public', 'USAGE') AS "schemaUsage",
                COUNT(*)::integer AS "tableCount",
                COALESCE(BOOL_AND(has_table_privilege(
                    current_user,
                    format('%I.%I', table_schema, table_name),
                    'SELECT'
                )), FALSE) AS "canSelect",
                COALESCE(BOOL_AND(has_table_privilege(
                    current_user,
                    format('%I.%I', table_schema, table_name),
                    'INSERT'
                )), FALSE) AS "canInsert",
                COALESCE(BOOL_AND(has_table_privilege(
                    current_user,
                    format('%I.%I', table_schema, table_name),
                    'UPDATE'
                )), FALSE) AS "canUpdate",
                COALESCE(BOOL_AND(has_table_privilege(
                    current_user,
                    format('%I.%I', table_schema, table_name),
                    'DELETE'
                )), FALSE) AS "canDelete"
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE'
              AND table_name <> '_prisma_migrations'
        `);
        throwIfAborted(signal);
        const permissions = rows[0];
        if (
            !permissions ||
            permissions.schemaUsage !== true ||
            Number(permissions.tableCount) < 1 ||
            permissions.canSelect !== true ||
            permissions.canInsert !== true ||
            permissions.canUpdate !== true ||
            permissions.canDelete !== true
        ) {
            throw new Error("PostgreSQL readiness sem permissões operacionais.");
        }
    });
    return true;
}

/**
 * Prova PING e permissões efémeras de SET/GET/DEL. A chave usa TTL como rede
 * de segurança e o DELETE corre em `finally`, inclusive quando GET falha.
 *
 * @param {object} redisClient - Cliente Redis ligado.
 * @param {string} keyPrefix - Prefixo isolado desta instalação.
 * @returns {Promise<true>} Confirmação interna da prova.
 */
export async function checkRedisOperationalAccess(redisClient, keyPrefix, signal) {
    if (
        typeof redisClient?.ping !== "function" ||
        typeof redisClient?.set !== "function" ||
        typeof redisClient?.get !== "function" ||
        typeof redisClient?.del !== "function"
    ) {
        throw new TypeError("Cliente Redis incompleto para readiness.");
    }
    const prefix = String(keyPrefix ?? "").trim();
    if (!prefix || prefix.length > 128 || /[\s\u0000-\u001f]/.test(prefix)) {
        throw new TypeError("Prefixo Redis inválido para readiness.");
    }
    const key = `${prefix}:health:${randomUUID()}`;
    const value = randomUUID();
    throwIfAborted(signal);
    const pong = await redisClient.ping();
    throwIfAborted(signal);
    if (String(pong).toUpperCase() !== "PONG") {
        throw new Error("Redis readiness sem PONG.");
    }
    let setAttempted = false;
    let operationError;
    try {
        setAttempted = true;
        const stored = await redisClient.set(key, value, { EX: 10, NX: true });
        throwIfAborted(signal);
        if (stored !== "OK") {
            throw new Error("Redis readiness não criou a chave efémera.");
        }
        if ((await redisClient.get(key)) !== value) {
            throw new Error("Redis readiness não leu a chave efémera.");
        }
        throwIfAborted(signal);
        return true;
    } catch (error) {
        operationError = error;
        throw error;
    } finally {
        if (setAttempted) {
            try {
                const deleted = await redisClient.del(key);
                if (Number(deleted) !== 1) {
                    throw new Error("Redis readiness não removeu a chave efémera.");
                }
            } catch (cleanupError) {
                throw combineOperationalAndCleanupError(
                    operationError,
                    cleanupError,
                    "Redis readiness falhou e o cleanup também falhou.",
                );
            }
        }
    }
}

/**
 * Testa PostgreSQL, Redis e storage crítico em paralelo.
 *
 * @param {{ prisma: object, redisClient: object, redisKeyPrefix: string, objectStorage: object, version: string, timeoutMs?: number, now?: Date }} deps - Dependências injetadas.
 * @returns {Promise<{ httpStatus: 200 | 503, payload: object }>} Estado HTTP e payload seguro.
 */
export async function checkReadiness(deps) {
    const timeoutMs = deps?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10_000) {
        throw new TypeError("Timeout de readiness inválido.");
    }
    if (
        typeof deps?.prisma?.$transaction !== "function" ||
        typeof deps?.redisClient?.ping !== "function" ||
        typeof deps?.redisClient?.set !== "function" ||
        typeof deps?.redisClient?.get !== "function" ||
        typeof deps?.redisClient?.del !== "function" ||
        !String(deps?.redisKeyPrefix ?? "").trim() ||
        typeof deps?.objectStorage?.checkOperationalAccess !== "function"
    ) {
        throw new TypeError("Dependências de readiness incompletas.");
    }

    const results = await Promise.all([
        timedDependencyCheck(
            "postgresql",
            (signal) => checkPostgresOperationalAccess(deps.prisma, signal),
            timeoutMs,
        ),
        timedDependencyCheck(
            "redis",
            (signal) =>
                checkRedisOperationalAccess(
                    deps.redisClient,
                    deps.redisKeyPrefix,
                    signal,
                ),
            timeoutMs,
        ),
        timedDependencyCheck(
            "storage",
            (signal) => deps.objectStorage.checkOperationalAccess({ signal }),
            timeoutMs,
        ),
    ]);
    if (deps.aiConfig?.chatEnabled) {
        results.push({
            name: "ai_chat",
            status: deps.aiConfig.chatEncryptionKey ? "up" : "down",
            durationMs: 0,
        });
    }
    const ready = results.every((result) => result.status === "up");
    const now = deps.now ?? new Date();

    return {
        httpStatus: ready ? 200 : 503,
        payload: {
            status: ready ? "ready" : "not_ready",
            service: "opsa-api",
            version: String(deps.version ?? "unknown"),
            checkedAt: now.toISOString(),
            dependencies: results,
        },
    };
}
