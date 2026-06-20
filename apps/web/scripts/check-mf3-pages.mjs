/**
 * @file Smoke checks textuais para garantir que os ecrãs MF3 continuam a expor os fluxos esperados.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const pages = readFileSync(new URL("../src/pages/mf3Pages.tsx", import.meta.url), "utf8");
const client = readFileSync(new URL("../src/lib/apiClient.ts", import.meta.url), "utf8");

const expectedLabels = [
  "Mapa de IVA",
  "Contas e caixa",
  "Extratos bancarios",
  "Previsao tesouraria",
  "Importacoes",
  "SAF-T MVP",
  "Relatorios operacionais",
  "KPIs executivos",
];

for (const label of expectedLabels) {
  assert.match(app, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

for (const endpoint of [
  "/tax/vat-maps",
  "/treasury/accounts",
  "/treasury/statements/import",
  "/treasury/forecast",
  "/imports/business-data",
  "/compliance/saft",
  "/reports/operational",
  "/reports/executive-kpis",
]) {
  assert.match(client, new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

assert.match(pages, /credentials|apiClient/);
console.info("MF3 pages smoke OK");
