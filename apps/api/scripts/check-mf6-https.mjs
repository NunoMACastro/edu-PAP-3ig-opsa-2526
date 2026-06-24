/**
 * @file Smoke textual do BK-MF6-05.
 */

import { readFileSync } from "node:fs";

/**
 * Procura um contrato textual obrigatório e devolve a sua posição no ficheiro.
 *
 * @param {string} content - Conteúdo lido do ficheiro.
 * @param {string} marker - Texto exato que deve existir.
 * @param {string} errorMessage - Erro claro para orientar a correção.
 * @returns {number} Índice onde o contrato foi encontrado.
 */
function requireMarker(content, marker, errorMessage) {
    const index = content.indexOf(marker);
    if (index === -1) {
        throw new Error(errorMessage);
    }

    return index;
}

const security = readFileSync("src/modules/security/transportSecurity.js", "utf8");
const server = readFileSync("src/server.js", "utf8");

// Primeiro validamos o middleware isolado, porque sem ele o servidor não tem regra para montar.
requireMarker(security, "HTTPS_REQUIRED", "Falta erro HTTPS_REQUIRED.");
requireMarker(security, "Strict-Transport-Security", "Falta cabeçalho HSTS.");

const trustProxyIndex = requireMarker(
    server,
    'app.set("trust proxy", 1)',
    "Falta app.set(\"trust proxy\", 1) antes dos routers.",
);
const enforceHttpsIndex = requireMarker(
    server,
    "app.use(enforceHttps({ isProduction }))",
    "Middleware HTTPS não está montado no servidor.",
);
const hstsIndex = requireMarker(
    server,
    "app.use(applyStrictTransportSecurity({ isProduction }))",
    "Middleware HSTS não está montado no servidor.",
);
const firstAuthRouteIndex = requireMarker(
    server,
    'app.use("/api/auth"',
    "Não foi possível encontrar a primeira rota de autenticação.",
);

// A ordem é parte do contrato: proxy primeiro, depois bloqueio HTTPS e HSTS antes das rotas.
if (
    !(
        trustProxyIndex < enforceHttpsIndex &&
        enforceHttpsIndex < hstsIndex &&
        hstsIndex < firstAuthRouteIndex
    )
) {
    throw new Error("A segurança de transporte tem de ser montada antes das rotas.");
}