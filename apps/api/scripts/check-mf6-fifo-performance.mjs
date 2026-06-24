/**
 * @file Smoke textual do BK-MF6-04.
 */

import { readFileSync } from "node:fs";

const perf = readFileSync("src/modules/inventory/fifoPerformance.js", "utf8");
const service = readFileSync("src/modules/inventory/fifoCostService.js", "utf8");
const routes = readFileSync("src/modules/inventory/fifoCostRoutes.js", "utf8");

if (!perf.includes("FIFO_COST_BUDGET_MS")) {
    throw new Error("Falta orçamento FIFO.");
}

if (!service.includes("measureFifoCost")) {
    throw new Error("O service FIFO não mede duração.");
}

// Stock insuficiente deve falhar antes de qualquer alteração crítica.
if (!service.includes("assertEnoughFifoStock")) {
    throw new Error("Falta validação de stock suficiente.");
}

if (!service.includes("write: false")) {
    throw new Error("O preview FIFO deve ser consultivo e não gravar consumos.");
}

if (!routes.includes("requireCompanyContext(prisma)")) {
    throw new Error("A rota FIFO deve exigir empresa ativa.");
}