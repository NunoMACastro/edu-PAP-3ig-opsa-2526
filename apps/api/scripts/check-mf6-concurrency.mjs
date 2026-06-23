/**
 * @file Smoke de concorrência local para o BK-MF6-02.
 */

const BASE_URL = process.env.OPSA_API_BASE_URL ?? "http://127.0.0.1:3000";
const REQUIRED_USERS = 25;
const MAX_LOCAL_P95_MS = 2000;
const MAX_DEGRADATION_RATIO = 2;
const TARGET_PATHS = (process.env.OPSA_CONCURRENCY_PATHS ?? "/api/customers,/api/items")
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean);

/**
 * Lê uma lista JSON de cookies de sessão.
 *
 * @returns {string[]} Cookies de sessão prontos a enviar no cabeçalho HTTP.
 */
function readSessionCookies() {
    const raw = process.env.OPSA_SESSION_COOKIES_JSON ?? "[]";
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
        throw new Error("OPSA_SESSION_COOKIES_JSON deve ser um array JSON.");
    }

    const cookies = parsed.map((cookie) => String(cookie).trim()).filter(Boolean);
    if (cookies.length < REQUIRED_USERS) {
        throw new Error(`São necessárias ${REQUIRED_USERS} sessões de teste válidas.`);
    }

    return cookies.slice(0, REQUIRED_USERS);
}

/**
 * Calcula percentil 95 de uma lista de durações.
 *
 * @param {number[]} durations - Durações em milissegundos.
 * @returns {number} Percentil 95.
 */
function percentile95(durations) {
    const sorted = [...durations].sort((a, b) => a - b);
    return sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)] ?? 0;
}

/**
 * Executa um pedido autenticado e devolve a duração observada.
 *
 * @param {{ cookie: string, index: number, path: string }} input - Pedido de carga.
 * @returns {Promise<{ index: number, ok: boolean, status: number, durationMs: number }>}
 */
async function runRequest({ cookie, index, path }) {
    const startedAt = performance.now();
    const response = await fetch(`${BASE_URL}${path}`, {
        headers: {
            cookie,
            "x-opsa-load-user": String(index),
        },
    });

    // Cada cookie representa uma sessão real; a empresa ativa continua resolvida no backend.
    return {
        index,
        ok: response.ok,
        status: response.status,
        durationMs: Math.round(performance.now() - startedAt),
    };
}

/**
 * Resume um conjunto de respostas de carga.
 *
 * @param {Array<{ ok: boolean, durationMs: number }>} results - Resultados medidos.
 * @returns {{ failures: number, p95: number }}
 */
function summarize(results) {
    return {
        failures: results.filter((result) => !result.ok).length,
        p95: percentile95(results.map((result) => result.durationMs)),
    };
}

/**
 * Mede uma superfície com baseline sequencial e carga concorrente.
 *
 * @param {string} path - Endpoint autenticado a medir.
 * @param {string[]} cookies - Sessões de teste.
 * @returns {Promise<void>}
 */
async function measurePath(path, cookies) {
    const baselineResults = [];
    for (const [index, cookie] of cookies.slice(0, 5).entries()) {
        // O baseline pequeno ajuda a separar lentidão normal de degradação sob concorrência.
        baselineResults.push(await runRequest({ cookie, index: index + 1, path }));
    }

    const concurrentResults = await Promise.all(
        cookies.map((cookie, index) => runRequest({ cookie, index: index + 1, path })),
    );

    const baseline = summarize(baselineResults);
    const concurrent = summarize(concurrentResults);
    const allowedP95 = Math.max(
        MAX_LOCAL_P95_MS,
        baseline.p95 * MAX_DEGRADATION_RATIO,
    );

    console.info({
        event: "mf6_concurrency_smoke",
        path,
        users: cookies.length,
        baselineP95: baseline.p95,
        concurrentP95: concurrent.p95,
        allowedP95,
        failures: concurrent.failures,
    });

    if (baseline.failures > 0 || concurrent.failures > 0) {
        throw new Error(`Falhas HTTP detetadas em ${path}.`);
    }
    if (concurrent.p95 > allowedP95) {
        throw new Error(`Degradação relevante em ${path}: p95=${concurrent.p95}ms.`);
    }
}

const sessionCookies = readSessionCookies();
for (const path of TARGET_PATHS) {
    await measurePath(path, sessionCookies);
}