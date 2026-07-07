/**
 * @file Smoke textual do BK-MF6-03.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
    RECONCILIATION_BUDGET_MS,
    RECONCILIATION_MAX_CANDIDATES,
    limitReconciliationCandidates,
    measureReconciliation,
} from "../src/modules/treasury/reconciliationPerformance.js";

assert.equal(RECONCILIATION_BUDGET_MS, 3000);
assert.equal(RECONCILIATION_MAX_CANDIDATES, 250);

const candidates = Array.from({ length: 300 }, (_value, index) => ({ index }));
const limited = limitReconciliationCandidates(candidates);
assert.equal(limited.selected.length, 250);
assert.equal(limited.partial, true);

const measured = await measureReconciliation(async () => limited.selected);
assert.equal(measured.result.length, 250);
assert.equal(measured.budgetMs, 3000);
assert.equal(measured.withinBudget, true);

const routes = readFileSync(
    new URL("../src/modules/treasury/statementRoutes.js", import.meta.url),
    "utf8",
);
const service = readFileSync(
    new URL("../src/modules/treasury/statementImportService.js", import.meta.url),
    "utf8",
);

assert.match(routes, /\/reconciliations\/suggestions/);
assert.match(routes, /X-OPSA-Reconciliation-Duration-Ms/);
assert.match(service, /export async function suggestReconciliations/);

console.info("MF6 reconciliation performance contract OK");
