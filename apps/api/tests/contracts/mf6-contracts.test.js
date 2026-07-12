/**
 * @file Testes de contrato MF6 para routers, scripts e modulos transversais.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildStatementRoutes } from "../../src/modules/treasury/statementRoutes.js";

/**
 * Confirma se o router expoe uma rota esperada.
 *
 * @param router - Router Express a inspecionar.
 * @param method - Metodo HTTP esperado.
 * @param path - Caminho esperado.
 * @returns Booleano com existencia da rota.
 */
function hasRoute(router, method, path) {
    return router.stack.some(
        (layer) => layer.route?.path === path && layer.route.methods[method],
    );
}

test("MF6: router de tesouraria expõe sugestão de reconciliação medida", () => {
    const router = buildStatementRoutes({ prisma: {} });

    assert.equal(hasRoute(router, "post", "/statements/import"), true);
    assert.equal(
        hasRoute(router, "post", "/reconciliations/suggestions"),
        true,
    );
});

test("MF6: package expõe todos os gates test:mf6", () => {
    const packageJson = JSON.parse(
        readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
    );
    const scripts = packageJson.scripts;

    for (const script of [
        "test:mf6:documents",
        "test:mf6:concurrency",
        "test:mf6:reconciliation",
        "test:mf6:fifo",
        "test:mf6:https",
        "test:mf6:bcrypt",
        "test:mf6:session-cookie",
        "test:mf6:hardening",
        "test:mf6:env",
        "test:mf6:audit",
        "test:mf6",
    ]) {
        assert.equal(typeof scripts[script], "string", `${script} em falta`);
    }
});

test("MF6: servidor monta hardening antes dos routers de domínio", () => {
    const server = readFileSync(
        new URL("../../src/server.js", import.meta.url),
        "utf8",
    );
    const firstRouterIndex = server.indexOf('app.use("/api/auth"');

    assert.match(server, /trustProxyHops === 0 \? false : apiEnv\.trustProxyHops/);
    assert.equal(server.indexOf("enforceHttps") < firstRouterIndex, true);
    assert.equal(
        server.indexOf("requireTrustedOrigin") < firstRouterIndex,
        true,
    );
});

test("MF6: smoke de concorrência suporta modo HTTP autenticado", () => {
    const concurrencySmoke = readFileSync(
        new URL("../../scripts/check-mf6-concurrency.mjs", import.meta.url),
        "utf8",
    );

    assert.match(concurrencySmoke, /OPSA_SESSION_COOKIES_JSON/);
    assert.match(concurrencySmoke, /REQUIRED_USERS = 25/);
    assert.match(concurrencySmoke, /fetch\(new URL\(path, BASE_URL\)/);
    assert.match(concurrencySmoke, /baselineP95/);
    assert.match(concurrencySmoke, /concurrentP95/);
});
