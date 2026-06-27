/**
 * @file Smoke textual e unitario do BK-MF6-01.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
    DOCUMENT_INSERTION_BUDGET_MS,
    measureDocumentInsertion,
} from "../src/modules/performance/documentPerformance.js";

const routeFiles = [
    "src/modules/sales/saleDocumentRoutes.js",
    "src/modules/purchases/purchaseDocumentRoutes.js",
    "src/modules/accounting/manualJournalRoutes.js",
];

assert.equal(DOCUMENT_INSERTION_BUDGET_MS, 1000);
const measured = await measureDocumentInsertion(async () => ({ ok: true }));
assert.deepEqual(measured.result, { ok: true });
assert.equal(measured.budgetMs, 1000);
assert.equal(Number.isInteger(measured.durationMs), true);

for (const file of routeFiles) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(source, /measureDocumentInsertion/, `${file} sem medicao`);
    assert.match(
        source,
        /setDocumentPerformanceHeaders/,
        `${file} sem headers de evidence`,
    );
}

console.info("MF6 document performance contract OK");
