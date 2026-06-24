/**
 * @file Smoke textual do BK-MF6-08.
 */

import { readFileSync } from "node:fs";

const hardening = readFileSync("src/modules/security/requestHardening.js", "utf8");
const server = readFileSync("src/server.js", "utf8");
const authLimit = readFileSync("src/modules/auth/authRateLimit.js", "utf8");

for (const required of ["UNTRUSTED_ORIGIN", "escapeHtml", "POST", "DELETE"]) {
    if (!hardening.includes(required)) {
        throw new Error(`Falta proteção esperada: ${required}`);
    }
}

if (!server.includes("requireTrustedOrigin")) {
    throw new Error("Hardening de origem não está montado.");
}

// O rate limit protege login contra muitas tentativas repetidas.
if (!authLimit.includes("429")) {
    throw new Error("Rate limit de autenticação não devolve 429.");
}