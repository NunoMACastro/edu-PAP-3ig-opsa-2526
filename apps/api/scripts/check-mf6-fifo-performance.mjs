/**
 * @file Smoke unitario do BK-MF6-04.
 */

import assert from "node:assert/strict";
import {
    FIFO_COST_BUDGET_MS,
    assertEnoughFifoStock,
    measureFifoCost,
} from "../src/modules/inventory/fifoPerformance.js";

assert.equal(FIFO_COST_BUDGET_MS, 1000);
assert.doesNotThrow(() => assertEnoughFifoStock(2, 3));
assert.throws(() => assertEnoughFifoStock(4, 3), {
    code: "INSUFFICIENT_FIFO_LAYERS",
});

const measured = await measureFifoCost(async () => ({
    totalCostCents: 500,
    consumptions: [{ layerId: "layer-1" }],
}));
assert.equal(measured.result.totalCostCents, 500);
assert.equal(measured.budgetMs, 1000);
assert.equal(measured.withinBudget, true);

console.info("MF6 FIFO performance contract OK");
