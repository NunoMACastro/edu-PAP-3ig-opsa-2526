/**
 * @file Regressões mínimas do gate académico executável.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
    new URL("../../scripts/run-academic-release-gate.mjs", import.meta.url),
    "utf8",
);

test("gate académico executa E2E mockado e seeded", () => {
    assert.match(source, /"test:e2e"/);
    assert.match(source, /"test:e2e:seeded"/);
});

test("gate prova seed idempotente e não confunde as URLs de integração", () => {
    assert.match(source, /"test:seed:integration"/);
    assert.match(source, /"db:seed:demo"/);
    assert.match(source, /"db:seed:verify"/);
    assert.match(source, /delete integrationTestEnvironment\.DATABASE_URL/);
});

test("XSD só é obrigatório no modo SAF-T externo", () => {
    assert.match(source, /saftMode === "external"/);
    assert.match(source, /SAFT_VALIDATION_MODE/);
    const requiredEnvironmentBlock = source.slice(
        source.indexOf("const REQUIRED_ENVIRONMENT"),
        source.indexOf("const FORBIDDEN_SKIP_PATTERNS"),
    );
    assert.doesNotMatch(requiredEnvironmentBlock, /SAFT_XSD_PATH/);
});
