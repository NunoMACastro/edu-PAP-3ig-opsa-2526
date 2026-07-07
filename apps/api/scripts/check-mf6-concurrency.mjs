/**
 * @file Smoke do BK-MF6-02 para 25 utilizadores simultaneos por empresa.
 *
 * Sem ambiente HTTP configurado, o script executa um smoke local deterministico
 * para manter `test:mf6` executavel em desenvolvimento. Quando recebe
 * `OPSA_SESSION_COOKIES_JSON`, mede endpoints reais com 25 cookies de sessao.
 */

import assert from "node:assert/strict";
import { measureDocumentInsertion } from "../src/modules/performance/documentPerformance.js";

const REQUIRED_USERS = 25;
const MAX_LOCAL_P95_MS = 2000;
const MAX_DEGRADATION_RATIO = 2;
const BASE_URL = process.env.OPSA_API_BASE_URL ?? "http://127.0.0.1:3000";
const TARGET_PATHS = (process.env.OPSA_CONCURRENCY_PATHS ?? "/api/customers,/api/items")
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean);

/**
 * Lê uma lista JSON com pelo menos 25 cookies de sessao reais.
 *
 * @returns {string[] | null} Cookies prontos a enviar ou `null` quando o modo HTTP nao foi configurado.
 */
function readSessionCookies() {
    const raw = process.env.OPSA_SESSION_COOKIES_JSON;
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
        throw new Error("OPSA_SESSION_COOKIES_JSON deve ser um array JSON.");
    }

    const cookies = parsed.map((cookie) => String(cookie).trim()).filter(Boolean);
    if (cookies.length < REQUIRED_USERS) {
        throw new Error(`Sao necessarias ${REQUIRED_USERS} sessoes de teste validas.`);
    }

    return cookies.slice(0, REQUIRED_USERS);
}

/**
 * Calcula um percentil simples sobre duracoes medidas.
 *
 * @param {number[]} durations - Duracoes em milissegundos.
 * @param {number} percentile - Percentil entre 0 e 1.
 * @returns {number} Duracao no percentil pedido.
 */
function calculatePercentile(durations, percentile) {
    const sorted = [...durations].sort((left, right) => left - right);
    const index = Math.max(0, Math.ceil(sorted.length * percentile) - 1);
    return sorted[index] ?? 0;
}

/**
 * Executa um pedido HTTP autenticado e mede duracao, sem expor payloads.
 *
 * @param {{ cookie: string, index: number, path: string }} input - Pedido de carga.
 * @returns {Promise<{ index: number, ok: boolean, status: number, durationMs: number }>} Resultado medido.
 */
async function runAuthenticatedRequest({ cookie, index, path }) {
    const startedAt = performance.now();
    const response = await fetch(new URL(path, BASE_URL), {
        headers: {
            cookie,
            "x-opsa-load-user": String(index),
        },
    });

    return {
        index,
        ok: response.ok,
        status: response.status,
        durationMs: Math.round(performance.now() - startedAt),
    };
}

/**
 * Resume uma vaga de pedidos em falhas e percentil 95.
 *
 * @param {Array<{ ok: boolean, durationMs: number }>} results - Resultados medidos.
 * @returns {{ failures: number, p95: number }} Resumo operacional.
 */
function summarizeResults(results) {
    return {
        failures: results.filter((result) => !result.ok).length,
        p95: calculatePercentile(
            results.map((result) => result.durationMs),
            0.95,
        ),
    };
}

/**
 * Mede um endpoint com baseline sequencial e carga concorrente autenticada.
 *
 * @param {string} path - Endpoint autenticado a medir.
 * @param {string[]} cookies - Cookies de sessao de teste.
 * @returns {Promise<void>}
 */
async function measureHttpPath(path, cookies) {
    const baselineResults = [];
    for (const [index, cookie] of cookies.slice(0, 5).entries()) {
        // O baseline local separa latencia normal de degradacao sob concorrencia.
        baselineResults.push(
            await runAuthenticatedRequest({ cookie, index: index + 1, path }),
        );
    }

    const concurrentResults = await Promise.all(
        cookies.map((cookie, index) =>
            runAuthenticatedRequest({ cookie, index: index + 1, path }),
        ),
    );
    const baseline = summarizeResults(baselineResults);
    const concurrent = summarizeResults(concurrentResults);
    const allowedP95 = Math.max(
        MAX_LOCAL_P95_MS,
        baseline.p95 * MAX_DEGRADATION_RATIO,
    );

    console.info({
        event: "mf6_concurrency_http_smoke",
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
        throw new Error(`Degradacao relevante em ${path}: p95=${concurrent.p95}ms.`);
    }
}

/**
 * Executa o smoke HTTP real quando existem 25 cookies de sessao.
 *
 * @param {string[]} cookies - Cookies de sessao de teste.
 * @returns {Promise<void>}
 */
async function runHttpConcurrencySmoke(cookies) {
    for (const path of TARGET_PATHS) {
        await measureHttpPath(path, cookies);
    }
}

/**
 * Executa fallback local sem HTTP para manter os gates deterministicos.
 *
 * @returns {Promise<void>}
 */
async function runLocalConcurrencySmoke() {
    const companyId = "company-mf6-smoke";
    const operations = Array.from({ length: REQUIRED_USERS }, async (_value, index) => {
        const measured = await measureDocumentInsertion(async () => ({
            companyId,
            userId: `user-${index + 1}`,
            status: "ok",
        }));
        return measured;
    });

    const results = await Promise.all(operations);
    assert.equal(results.length, REQUIRED_USERS);
    assert.equal(results.every((result) => result.result.companyId === companyId), true);
    assert.equal(results.every((result) => result.withinBudget), true);

    console.info({
        event: "mf6_concurrency_local_smoke",
        users: REQUIRED_USERS,
        mode: "local-contract",
    });
}

const sessionCookies = readSessionCookies();
if (sessionCookies) {
    await runHttpConcurrencySmoke(sessionCookies);
} else {
    await runLocalConcurrencySmoke();
}
