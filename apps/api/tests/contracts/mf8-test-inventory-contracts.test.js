// apps/api/tests/contracts/mf8-test-inventory-contracts.test.js
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
    buildInventory,
    evaluateInventory,
    formatMarkdownReport
} from "../../scripts/check-mf8-test-inventory.mjs";

const API_SCRIPTS = {
    "syntax:check": "find src tests scripts -name '*.js' -print0 | xargs -0 -n 1 node --check",
    "test:unit": "node --test tests/unit/*.test.js",
    "test:contracts": "node --test tests/contracts/*.test.js",
    "test:integration": "node --test tests/integration/*.test.js",
    "test:mf6": "node scripts/check-mf6-hardening.mjs",
    "test:mf7": "node scripts/check-mf7-backend-modules.mjs",
    "test:mf8": "node scripts/check-mf8-test-inventory.mjs"
};

const WEB_SCRIPTS = {
    typecheck: "tsc --noEmit",
    build: "vite build",
    "test:mf1": "node scripts/check-mf1-pages.mjs",
    "test:mf2": "node scripts/check-mf2-pages.mjs",
    "test:mf3": "node scripts/check-mf3-pages.mjs",
    "test:mf5:forms": "node scripts/check-mf5-form-validation.mjs",
    "test:mf5:errors": "node scripts/check-mf5-error-messages.mjs",
    "test:mf5:performance": "node scripts/check-mf5-performance.mjs",
    "test:mf7": "node scripts/check-mf7-browser-compatibility.mjs",
    "test:mf8": "node scripts/check-mf8-formatters.mjs"
};

const REQUIRED_FILES = [
    "tests/unit/mf0-auth-session-membership.test.js",
    "tests/contracts/mf0-auth-role-contracts.test.js",
    "tests/unit/mf1-sale-purchase-vat.test.js",
    "tests/contracts/mf1-payment-receipt-contracts.test.js",
    "tests/integration/mf1-sale-purchase-flow.test.js",
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
    "scripts/check-mf8-test-inventory.mjs"
];

const REQUIRED_WEB_FILES = [
    "scripts/check-mf5-form-validation.mjs",
    "scripts/check-mf5-error-messages.mjs",
    "scripts/check-mf5-performance.mjs",
    "scripts/check-mf7-browser-compatibility.mjs",
    "scripts/check-mf8-formatters.mjs"
];

/**
 * Garante que uma pasta existe antes de escrever ficheiros de fixture.
 *
 * @param {string} filePath - Ficheiro que será criado.
 * @returns {void}
 */
function ensureParentDir(filePath) {
    mkdirSync(dirname(filePath), { recursive: true });
}

/**
 * Cria uma app temporária mínima para testar o inventário sem depender do projeto real.
 *
 * @param {object} options - Opções da fixture.
 * @param {boolean} [options.includeMf8=true] - Define se as provas de MF8 são criadas.
 * @returns {{ root: string, apiRoot: string, webRoot: string, cleanup: () => void }} Fixture criada.
 */
function createFixture({ includeMf8 = true } = {}) {
    const root = mkdtempSync(join(tmpdir(), "opsa-mf8-inventory-"));
    const apiRoot = join(root, "apps/api");
    const webRoot = join(root, "apps/web");

    mkdirSync(apiRoot, { recursive: true });
    mkdirSync(webRoot, { recursive: true });

    const apiScripts = includeMf8 ? API_SCRIPTS : { ...API_SCRIPTS, "test:mf8": undefined };
    const webScripts = includeMf8 ? WEB_SCRIPTS : { ...WEB_SCRIPTS, "test:mf8": undefined };

    for (const [scriptName, command] of Object.entries(apiScripts)) {
        if (command === undefined) {
            delete apiScripts[scriptName];
        }
    }

    for (const [scriptName, command] of Object.entries(webScripts)) {
        if (command === undefined) {
            delete webScripts[scriptName];
        }
    }

    writeFileSync(join(apiRoot, "package.json"), JSON.stringify({ scripts: apiScripts }, null, 2));
    writeFileSync(join(webRoot, "package.json"), JSON.stringify({ scripts: webScripts }, null, 2));

    const apiFiles = includeMf8
        ? REQUIRED_FILES
        : REQUIRED_FILES.filter((filePath) => !filePath.includes("mf8"));

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
        root,
        apiRoot,
        webRoot,
        cleanup: () => rmSync(root, { recursive: true, force: true })
    };
}

test("aprova inventário com camadas mínimas para fluxos críticos", () => {
    const fixture = createFixture();

    try {
        const inventory = buildInventory({ apiRoot: fixture.apiRoot, webRoot: fixture.webRoot });
        const result = evaluateInventory(inventory);
        const report = formatMarkdownReport(inventory, result);

        // O positivo prova que a matriz aceita uma app com camadas mínimas completas.
        assert.equal(result.ok, true);
        assert.equal(result.gaps.length, 0);
        assert.match(report, /Matriz mínima de testes por prioridade/);
        assert.match(report, /Resultado final: OK/);
    } finally {
        fixture.cleanup();
    }
});

test("falha quando MF8 não tem gate e contrato suficientes", () => {
    const fixture = createFixture({ includeMf8: false });

    try {
        const inventory = buildInventory({ apiRoot: fixture.apiRoot, webRoot: fixture.webRoot });
        const result = evaluateInventory(inventory);
        const report = formatMarkdownReport(inventory, result);

        // O negativo confirma que o gate não passa por coincidência de pastas ou nomes genéricos.
        assert.equal(result.ok, false);
        assert.ok(result.gaps.some((gap) => gap.flowId === "MF8-subscricoes-localizacao-fecho"));
        assert.ok(result.missingApiScripts.includes("test:mf8"));
        assert.ok(result.missingWebScripts.includes("test:mf8"));
        assert.match(report, /LACUNA/);
    } finally {
        fixture.cleanup();
    }
});