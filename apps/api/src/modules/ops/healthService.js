/**
 * @file Liveness e readiness reais da API OPSA.
 *
 * Liveness confirma apenas que o processo responde. Readiness usa provas
 * mínimas e read-only das dependências críticas, sem revelar configuração
 * interna. As provas operacionais profundas ficam num comando explícito.
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
 * @param {(signal: AbortSignal) => Promise<unknown>} check - Prova assíncrona.
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
 * Confirma conectividade PostgreSQL com a query read-only mais barata.
 *
 * @param {object} prisma - PrismaClient já gerido pelo processo.
 * @param {AbortSignal} [signal] - Sinal cooperativo de timeout.
 * @returns {Promise<true>} Confirmação interna da prova.
 */
export async function checkPostgresReadiness(prisma, signal) {
    throwIfAborted(signal);
    if (typeof prisma?.$queryRaw !== "function") {
        throw new TypeError("Prisma sem suporte a query de readiness.");
    }
    await prisma.$queryRaw(Prisma.sql`SELECT 1 AS "ready"`);
    throwIfAborted(signal);
    return true;
}

/**
 * Confirma conectividade Redis sem criar, ler ou remover chaves.
 *
 * @param {object} redisClient - Cliente Redis já ligado.
 * @param {AbortSignal} [signal] - Sinal cooperativo de timeout.
 * @returns {Promise<true>} Confirmação interna da prova.
 */
export async function checkRedisReadiness(redisClient, signal) {
    throwIfAborted(signal);
    if (typeof redisClient?.ping !== "function") {
        throw new TypeError("Cliente Redis sem suporte a PING.");
    }
    const pong = await redisClient.ping();
    throwIfAborted(signal);
    if (String(pong).toUpperCase() !== "PONG") {
        throw new Error("Redis readiness sem PONG.");
    }
    return true;
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
        throw new TypeError("Prisma sem suporte transacional para diagnóstico.");
    }
    await prisma.$transaction(async (transaction) => {
        throwIfAborted(signal);
        if (
            typeof transaction?.$executeRaw !== "function" ||
            typeof transaction?.$queryRaw !== "function"
        ) {
            throw new TypeError("Transação Prisma incompleta para diagnóstico.");
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
            throw new Error("PostgreSQL sem permissões operacionais.");
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
        throw new TypeError("Cliente Redis incompleto para diagnóstico.");
    }
    const prefix = String(keyPrefix ?? "").trim();
    if (!prefix || prefix.length > 128 || /[\s\u0000-\u001f]/.test(prefix)) {
        throw new TypeError("Prefixo Redis inválido para diagnóstico.");
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
 * Testa apenas as dependências compostas para o perfil ativo. As dependências
 * opcionais são informativas e nunca tornam a instância indisponível.
 *
 * @param {{ prisma: object, redisClient?: object | null, redisMode?: "local" | "redis", objectStorage: object, version: string, isProduction?: boolean, aiConfig?: object, timeoutMs?: number, now?: Date }} deps - Dependências injetadas.
 * @returns {Promise<{ httpStatus: 200 | 503, payload: object }>} Estado HTTP e payload seguro.
 */
export async function checkReadiness(deps) {
    const timeoutMs = deps?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10_000) {
        throw new TypeError("Timeout de readiness inválido.");
    }
    const redisMode = deps?.redisMode ?? (deps?.redisClient ? "redis" : "local");
    if (redisMode !== "local" && redisMode !== "redis") {
        throw new TypeError("Modo Redis de readiness inválido.");
    }
    if (
        typeof deps?.prisma?.$queryRaw !== "function" ||
        typeof deps?.objectStorage?.checkReadiness !== "function" ||
        (redisMode === "redis" && typeof deps?.redisClient?.ping !== "function")
    ) {
        throw new TypeError("Dependências de readiness incompletas.");
    }

    const checks = [
        timedDependencyCheck(
            "postgresql",
            (signal) => checkPostgresReadiness(deps.prisma, signal),
            timeoutMs,
        ),
    ];
    if (redisMode === "redis") {
        checks.push(timedDependencyCheck(
            "redis",
            (signal) => checkRedisReadiness(deps.redisClient, signal),
            timeoutMs,
        ));
    }
    checks.push(
        timedDependencyCheck(
            "storage",
            (signal) => deps.objectStorage.checkReadiness({ signal }),
            timeoutMs,
        ),
    );
    const criticalResults = await Promise.all(checks);
    const results = criticalResults.map((result) => ({
        ...result,
        required: true,
    }));
    if (redisMode === "local") {
        results.splice(1, 0, {
            name: "redis",
            status: "local",
            durationMs: 0,
            required: false,
        });
    }
    if (deps.aiConfig) {
        results.push({
            name: "openai",
            status:
                deps.aiConfig.providerMode === "openai"
                    ? "optional"
                    : "disabled",
            durationMs: 0,
            required: false,
        });
    }
    const ready = criticalResults.every((result) => result.status === "up");
    const now = deps.now ?? new Date();

    return {
        httpStatus: ready ? 200 : 503,
        payload: {
            status: ready ? "ready" : "not_ready",
            service: "opsa-api",
            version: String(deps.version ?? "unknown"),
            profile: deps.isProduction ? "production_like" : "demo",
            checkedAt: now.toISOString(),
            dependencies: results,
        },
    };
}
