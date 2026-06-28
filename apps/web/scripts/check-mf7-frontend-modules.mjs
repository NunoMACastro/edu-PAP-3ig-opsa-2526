/**
 * @file Verifica que o frontend reutiliza páginas, clientes API e componentes comuns.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = fileURLToPath(new URL("..", import.meta.url));
const requiredFiles = [
  "src/ui/opsaUi.tsx",
  "src/ui/ResponsiveDataTable.tsx",
  "src/ui/useActionFeedback.ts",
  "src/lib/apiClient.ts",
];
const requiredDomains = [
  {
    id: "sales",
    pageMarkers: ["sales-documents", "SaleDocumentsPage", "SalesOpenItemsPage"],
    apiMarkers: ["sales:", "/sales/"],
  },
  {
    id: "purchases",
    pageMarkers: ["purchase-documents", "PurchaseDocumentsPage", "PurchaseApprovalPage"],
    apiMarkers: ["purchases:", "/purchases/"],
  },
  {
    id: "inventory",
    pageMarkers: ["inventory-counts", "StockMovementsPage", "FifoCostPage"],
    apiMarkers: ["inventory:", "/inventory/"],
  },
  {
    id: "treasury",
    pageMarkers: ["treasury-accounts", "TreasuryAccountsPage", "PaymentsPage"],
    apiMarkers: ["treasury:", "/treasury/"],
  },
  {
    id: "accounting",
    pageMarkers: ["accounting-reports", "AccountingReportsPage", "ManualJournalPage"],
    apiMarkers: ["accounting:", "accountingReports:", "/accounting/"],
  },
];

/**
 * Indica se pelo menos um marcador esperado existe no texto analisado.
 *
 * @param {string} content - Conteúdo textual do ficheiro.
 * @param {string[]} markers - Marcadores que provam o contrato.
 * @returns {boolean} `true` quando o contrato foi encontrado.
 */
function hasAnyMarker(content, markers) {
  return markers.some((marker) => content.includes(marker));
}

/**
 * Remove comentários antes de validar contratos que têm de existir em código executável.
 *
 * @param {string} content - Conteúdo textual do ficheiro.
 * @returns {string} Conteúdo sem comentários de bloco ou de linha.
 */
function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

/**
 * Confirma contratos reutilizáveis mínimos do frontend.
 *
 * @returns {void}
 */
export function checkFrontendModules() {
  for (const file of requiredFiles) {
    assert.equal(existsSync(join(webRoot, file)), true, "Contrato frontend em falta: " + file);
  }
  const app = readFileSync(join(webRoot, "src/App.tsx"), "utf8");
  const apiClient = readFileSync(join(webRoot, "src/lib/apiClient.ts"), "utf8");
  const apiClientExecutable = stripComments(apiClient);

  // A App deve compor páginas e UI partilhada; lógica HTTP nova fica em src/lib.
  assert.match(app, /PageFrame/);
  assert.match(app, /StatusMessage/);

  // O cookie HttpOnly só acompanha chamadas feitas com credentials: "include" em código real.
  assert.match(apiClientExecutable, /credentials:\s*"include"/);

  for (const domain of requiredDomains) {
    // Validamos a UI e o apiClient em conjunto para não confundir nomes de página com namespaces HTTP.
    assert.equal(
      hasAnyMarker(app, domain.pageMarkers),
      true,
      "Página ou rota frontend em falta para domínio: " + domain.id,
    );
    assert.equal(
      hasAnyMarker(apiClientExecutable, domain.apiMarkers),
      true,
      "Cliente API em falta para domínio: " + domain.id,
    );
  }
}

checkFrontendModules();
console.log("MF7 frontend modular: OK");