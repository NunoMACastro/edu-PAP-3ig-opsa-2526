/**
 * @file Contratos do inventario de testes criado para o BK-MF8-16.
 */

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
    REQUIRED_API_SCRIPTS,
    REQUIRED_WEB_SCRIPTS,
    buildInventory,
    evaluateInventory,
    formatMarkdownReport,
} from "../../scripts/check-mf8-test-inventory.mjs";

const REQUIRED_API_FILES = [
    "tests/unit/mf0-auth-session-membership.test.js",
    "tests/contracts/mf0-auth-role-contracts.test.js",
    "tests/unit/mf1-sale-purchase-vat.test.js",
    "tests/contracts/mf1-payment-receipt-contracts.test.js",
    "tests/integration/mf1-sale-purchase-payment-flow.test.js",
    "tests/unit/mf2-inventory-stock-fifo.test.js",
    "tests/contracts/mf2-ledger-report-contracts.test.js",
    "tests/integration/mf2-inventory-report-flow.test.js",
    "tests/unit/mf3-bank-reconciliation.test.js",
    "tests/contracts/mf3-saft-cashflow-contracts.test.js",
    "tests/integration/mf3-bank-report-flow.test.js",
    "tests/unit/mf4-ai-insight-source.test.js",
    "tests/contracts/mf4-audit-insight-contracts.test.js",
    "tests/contracts/mf6-security-cookie-contracts.test.js",
    "scripts/check-mf6-hardening.mjs",
    "tests/contracts/mf7-export-import-contracts.test.js",
    "scripts/check-mf7-backend-modules.mjs",
    "tests/contracts/mf8-subscription-billing-contracts.test.js",
    "scripts/check-mf8-test-inventory.mjs",
];

const REQUIRED_WEB_FILES = [
    "scripts/check-mf5-form-validation.mjs",
    "scripts/check-mf5-error-messages.mjs",
    "scripts/check-mf5-performance.mjs",
    "scripts/check-mf7-browser-compatibility.mjs",
    "scripts/check-mf8-formatters.mjs",
];

/**
 * Cria um mapa de scripts ficticio mas completo para a fixture.
 *
 * @param {string[]} scriptNames - Nomes de scripts exigidos.
 * @returns {Record<string, string>} Scripts npm simulados.
 */
function buildScriptMap(scriptNames) {
    return Object.fromEntries(
        scriptNames.map((scriptName) => [scriptName, `echo ${scriptName}`]),
    );
}

/**
 * Garante que a pasta pai existe antes de escrever a fixture.
 *
 * @param {string} filePath - Ficheiro a criar.
 * @returns {void}
 */
function ensureParentDir(filePath) {
    mkdirSync(dirname(filePath), { recursive: true });
}

/**
 * Cria uma app temporaria minima para testar o inventario sem tocar no projeto real.
 *
 * @param {object} options - Opcoes da fixture.
 * @param {boolean} [options.includeMf8=true] - Define se as provas de MF8 sao criadas.
 * @returns {{ apiRoot: string, webRoot: string, cleanup: () => void }} Fixture criada.
 */
function createFixture({ includeMf8 = true } = {}) {
    const root = mkdtempSync(join(tmpdir(), "opsa-mf8-inventory-"));
    const apiRoot = join(root, "apps/api");
    const webRoot = join(root, "apps/web");

    mkdirSync(apiRoot, { recursive: true });
    mkdirSync(webRoot, { recursive: true });

    const apiScripts = buildScriptMap(
        includeMf8
            ? REQUIRED_API_SCRIPTS
            : REQUIRED_API_SCRIPTS.filter((scriptName) => !scriptName.includes("mf8")),
    );
    const webScripts = buildScriptMap(
        includeMf8
            ? REQUIRED_WEB_SCRIPTS
            : REQUIRED_WEB_SCRIPTS.filter((scriptName) => !scriptName.includes("mf8")),
    );

    writeFileSync(join(apiRoot, "package.json"), JSON.stringify({ scripts: apiScripts }, null, 2));
    writeFileSync(join(webRoot, "package.json"), JSON.stringify({ scripts: webScripts }, null, 2));

    const apiFiles = includeMf8
        ? REQUIRED_API_FILES
        : REQUIRED_API_FILES.filter((filePath) => !filePath.includes("mf8"));
    const webFiles = includeMf8
        ? REQUIRED_WEB_FILES
        : REQUIRED_WEB_FILES.filter((filePath) => !filePath.includes("mf8"));

    for (const relativePath of apiFiles) {
        const filePath = join(apiRoot, relativePath);
        ensureParentDir(filePath);
        writeFileSync(filePath, "export const covered = true;\n");
    }

    for (const relativePath of webFiles) {
        const filePath = join(webRoot, relativePath);
        ensureParentDir(filePath);
        writeFileSync(filePath, "export const covered = true;\n");
    }

    return {
        apiRoot,
        webRoot,
        /**
         * Remove a fixture temporária criada para validar o inventário de testes.
         * A limpeza evita deixar ficheiros fora do ciclo de vida do teste.
         *
         * @returns {void}
         */
        cleanup: () => rmSync(root, { recursive: true, force: true }),
    };
}

test("aprova inventario com camadas minimas para fluxos criticos", () => {
    const fixture = createFixture();

    try {
        const inventory = buildInventory({ apiRoot: fixture.apiRoot, webRoot: fixture.webRoot });
        const result = evaluateInventory(inventory);
        const report = formatMarkdownReport(inventory, result);

        // O positivo prova que a matriz aceita uma app com camadas minimas completas.
        assert.equal(result.ok, true);
        assert.equal(result.gaps.length, 0);
        assert.match(report, /Matriz minima de testes por prioridade/);
        assert.match(report, /Resultado final: OK/);
    } finally {
        fixture.cleanup();
    }
});

test("falha quando MF8 nao tem gate e contrato suficientes", () => {
    const fixture = createFixture({ includeMf8: false });

    try {
        const inventory = buildInventory({ apiRoot: fixture.apiRoot, webRoot: fixture.webRoot });
        const result = evaluateInventory(inventory);
        const report = formatMarkdownReport(inventory, result);

        // O negativo confirma que o gate nao passa por coincidencia de pastas ou nomes genericos.
        assert.equal(result.ok, false);
        assert.ok(result.gaps.some((gap) => gap.flowId === "MF8-subscricoes-localizacao-fecho"));
        assert.ok(result.missingApiScripts.includes("test:mf8"));
        assert.ok(result.missingWebScripts.includes("test:mf8"));
        assert.match(report, /LACUNA/);
    } finally {
        fixture.cleanup();
    }
});
