/**
 * @file Smoke checks textuais para garantir que os ecrãs MF3 continuam a expor os fluxos esperados.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const pages = readFileSync(new URL("../src/pages/mf3Pages.tsx", import.meta.url), "utf8");
const client = readFileSync(new URL("../src/lib/apiClient.ts", import.meta.url), "utf8");
const saftClient = readFileSync(new URL("../src/lib/saftApi.ts", import.meta.url), "utf8");

const expectedLabels = [
  "Mapa de IVA",
  "Contas e caixa",
  "Extratos bancários",
  "Previsão de tesouraria",
  "Importações",
  "SAF-T 1.04_01",
  "Relatórios operacionais",
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
  "/reports/operational",
  "/reports/executive-kpis",
]) {
  assert.match(client, new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

for (const endpoint of ["/compliance/saft/exports", "/download"]) {
  assert.match(
    saftClient,
    new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
}

assert.doesNotMatch(client, /\/compliance\/saft/);

assert.match(pages, /credentials|apiClient/);
assert.match(pages, /type="file"/);
assert.doesNotMatch(pages, /name="content"/);
console.info("MF3 pages smoke OK");
