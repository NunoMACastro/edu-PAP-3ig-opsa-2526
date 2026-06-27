/**
 * @file Smoke unitario do BK-MF6-09.
 */

import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { loadApiEnv } from "../src/config/env.js";

const apiRoot = fileURLToPath(new URL("../", import.meta.url));
const realDevRoot = fileURLToPath(new URL("../../", import.meta.url));
const currentScript = fileURLToPath(import.meta.url);

const scannedExtensions = new Set([".js", ".mjs", ".ts", ".tsx"]);
const blockedSecretPatterns = [
    /sk_live_[A-Za-z0-9_]+/,
    /pk_live_[A-Za-z0-9_]+/,
    /LIVE_VALUE_DO_NOT_COMMIT/,
    /(?:api[_-]?key|secret|token)\s*[:=]\s*["'][A-Za-z0-9][A-Za-z0-9_\-./=+]{12,}["']/i,
    /(?:API_KEY|SECRET|TOKEN)\s*=\s*[^\s#]{12,}/,
];

/**
 * Lista ficheiros textuais relevantes para o scanner MF6 sem entrar em builds.
 *
 * @param {string} targetPath - Ficheiro ou pasta inicial.
 * @returns {string[]} Ficheiros a analisar.
 */
function listScanFiles(targetPath) {
    if (!existsSync(targetPath)) {
        return [];
    }

    const stats = statSync(targetPath);
    if (stats.isFile()) {
        return [targetPath];
    }

    return readdirSync(targetPath).flatMap((entry) => {
        const fullPath = join(targetPath, entry);
        const entryStats = statSync(fullPath);

        if (entryStats.isDirectory()) {
            return listScanFiles(fullPath);
        }

        return scannedExtensions.has(extname(fullPath)) ? [fullPath] : [];
    });
}

/**
 * Bloqueia valores que parecem segredos reais nos ficheiros de codigo.
 *
 * @param {string[]} files - Ficheiros a analisar.
 * @returns {void}
 */
function assertNoHardcodedSecrets(files) {
    for (const file of files) {
        if (file === currentScript) {
            continue;
        }

        const content = readFileSync(file, "utf8");
        const matchedPattern = blockedSecretPatterns.find((pattern) =>
            pattern.test(content),
        );

        if (matchedPattern) {
            throw new Error(
                `Credencial provavel no codigo: ${relative(realDevRoot, file)}`,
            );
        }
    }
}

assert.throws(
    () =>
        loadApiEnv({
            NODE_ENV: "production",
            APP_BASE_URL: "http://opsa.example.test",
            DATABASE_URL: "postgresql://user:password@localhost:5432/opsa",
        }),
    /HTTPS/,
);

assert.throws(
    () =>
        loadApiEnv({
            NODE_ENV: "production",
            APP_BASE_URL: "https://opsa.example.test",
        }),
    /DATABASE_URL/,
);

const env = loadApiEnv({
    NODE_ENV: "production",
    PORT: "443",
    APP_BASE_URL: "https://opsa.example.test",
    DATABASE_URL: "postgresql://user:password@localhost:5432/opsa",
});
assert.equal(env.isProduction, true);
assert.equal(env.port, 443);
assert.equal(env.databaseUrlConfigured, true);

const example = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
assert.match(example, /DATABASE_URL=/);
assert.doesNotMatch(example, /api[_-]?key\s*=\s*["'][^"']+["']/i);

assertNoHardcodedSecrets(
    [
        join(apiRoot, "src"),
        join(apiRoot, "scripts"),
        join(apiRoot, ".env.example"),
        join(realDevRoot, "web", "src"),
        join(realDevRoot, "web", "scripts"),
        join(realDevRoot, "web", ".env.example"),
    ].flatMap(listScanFiles),
);

console.info("MF6 environment contract OK");
