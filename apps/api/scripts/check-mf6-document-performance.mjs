/**
 * @file Smoke textual do BK-MF6-01.
 */

import { readFileSync } from "node:fs";

const files = [
    "src/modules/performance/documentPerformance.js",
    "src/modules/sales/saleDocumentRoutes.js",
    "src/modules/purchases/purchaseDocumentRoutes.js",
    "src/modules/accounting/manualJournalRoutes.js",
];

// A lista cobre as três superfícies do RNF08 para evitar validar só vendas.
for (const file of files) {
    const content = readFileSync(file, "utf8");
    if (!content.includes("measureDocumentInsert")) {
        throw new Error(`Falta medição RNF08 em ${file}`);
    }
}

for (const file of files.slice(1)) {
    const content = readFileSync(file, "utf8");
    // Os cabeçalhos dão evidence sem registar o payload financeiro completo.
    if (!content.includes("X-OPSA-Duration-Ms")) {
        throw new Error(`Falta cabeçalho de duração controlada em ${file}`);
    }
    if (!content.includes("X-OPSA-Within-Budget")) {
        throw new Error(`Falta cabeçalho de orçamento em ${file}`);
    }
}