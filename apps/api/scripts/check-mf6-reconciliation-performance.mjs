/**
 * @file Smoke textual do BK-MF6-03.
 */

import { readFileSync } from "node:fs";

const performanceModule = readFileSync(
    "src/modules/treasury/reconciliationPerformance.js",
    "utf8",
);
const routes = readFileSync("src/modules/treasury/statementRoutes.js", "utf8");
const service = readFileSync("src/modules/treasury/statementImportService.js", "utf8");

if (!performanceModule.includes("RECONCILIATION_BUDGET_MS = 3000")) {
    throw new Error("Falta orçamento de 3 segundos.");
}

if (!performanceModule.includes("RECONCILIATION_MAX_CANDIDATES")) {
    throw new Error("Falta limite de candidatos.");
}

if (!service.includes("export async function suggestReconciliations")) {
    throw new Error("Falta service completo de sugestão de reconciliação.");
}

// A rota deve expor duração para evidence sem confirmar matches automaticamente.
if (!routes.includes("X-OPSA-Reconciliation-Duration-Ms")) {
    throw new Error("Falta cabeçalho de duração da reconciliação.");
}

if (!routes.includes("requireCompanyContext(prisma)")) {
    throw new Error("A rota deve exigir empresa ativa.");
}

if (!routes.includes('import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";')) {
    throw new Error("A rota deve importar roles e permissões do middleware real de permissões.");
}

if (routes.includes("../users/roleMiddleware.js")) {
    throw new Error("A rota não deve importar roleMiddleware inexistente.");
}