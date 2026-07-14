/**
 * @file Gate MF7 para validar modularidade frontend, UI partilhada e cliente API central.
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
 * @param {string} content - Conteudo textual do ficheiro.
 * @param {string[]} markers - Marcadores que provam o contrato.
 * @returns {boolean} Verdadeiro quando algum marcador foi encontrado.
 */
function hasAnyMarker(content, markers) {
  return markers.some((marker) => content.includes(marker));
}

/**
 * Remove comentarios antes de validar contratos que precisam de existir em codigo executavel.
 *
 * @param {string} content - Conteudo textual do ficheiro.
 * @returns {string} Conteudo sem comentarios de bloco ou de linha.
 */
function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

/**
 * Remove marcadores de um dominio quando um negativo controlado e pedido por variavel de ambiente.
 *
 * @param {string} content - Conteudo textual original.
 * @param {string | undefined} simulatedDomain - Dominio a simular como incompleto.
 * @param {(domain: (typeof requiredDomains)[number]) => string[]} pickMarkers - Marcadores a remover.
 * @returns {string} Conteudo final para validacao.
 */
function removeSimulatedDomainMarkers(content, simulatedDomain, pickMarkers) {
  const domain = requiredDomains.find((candidate) => candidate.id === simulatedDomain);
  if (!domain) return content;

  return pickMarkers(domain).reduce(
    (updatedContent, marker) => updatedContent.split(marker).join(""),
    content,
  );
}

/**
 * Aplica simulacoes negativas sem alterar ficheiros reais do frontend.
 *
 * @param {{ app: string, apiClient: string }} sources - Fontes reais lidas do projeto.
 * @returns {{ app: string, apiClient: string }} Fontes possivelmente alteradas para teste negativo.
 */
function applyNegativeSimulations(sources) {
  let app = removeSimulatedDomainMarkers(
    sources.app,
    process.env.OPSA_MF7_FRONTEND_SIMULATE_MISSING_APP_DOMAIN,
    (domain) => domain.pageMarkers,
  );
  let apiClient = removeSimulatedDomainMarkers(
    sources.apiClient,
    process.env.OPSA_MF7_FRONTEND_SIMULATE_MISSING_API_DOMAIN,
    (domain) => domain.apiMarkers,
  );

  if (process.env.OPSA_MF7_FRONTEND_SIMULATE_NO_CREDENTIALS === "true") {
    apiClient = apiClient.replace(/credentials:\s*"include",?/g, "");
  }

  return { app, apiClient };
}

/**
 * Confirma contratos reutilizaveis minimos do frontend OPSA.
 *
 * @returns {void}
 */
export function checkFrontendModules() {
  for (const file of requiredFiles) {
    assert.equal(existsSync(join(webRoot, file)), true, "Contrato frontend em falta: " + file);
  }

  const sources = applyNegativeSimulations({
    app: readFileSync(join(webRoot, "src/App.tsx"), "utf8"),
    apiClient: readFileSync(join(webRoot, "src/lib/apiClient.ts"), "utf8"),
  });
  const apiClientExecutable = stripComments(sources.apiClient);

  // A App deve compor paginas e UI partilhada; logica HTTP nova fica em src/lib.
  assert.ok(sources.app.includes("PageFrame"), "App.tsx deve compor paginas com PageFrame");
  assert.ok(sources.app.includes("StatusMessage"), "App.tsx deve reutilizar StatusMessage");

  // O cookie HttpOnly so acompanha chamadas feitas com credentials: "include" em codigo real.
  assert.ok(
    /credentials:\s*"include"/.test(apiClientExecutable),
    'Cliente API deve manter credentials: "include" para enviar o cookie de sessao',
  );

  for (const domain of requiredDomains) {
    // UI e apiClient sao validados em conjunto para nao confundir rotas visuais com namespaces HTTP.
    assert.equal(
      hasAnyMarker(sources.app, domain.pageMarkers),
      true,
      "Pagina ou rota frontend em falta para dominio: " + domain.id,
    );
    assert.equal(
      hasAnyMarker(apiClientExecutable, domain.apiMarkers),
      true,
      "Cliente API em falta para dominio: " + domain.id,
    );
  }
}

try {
  checkFrontendModules();
  console.log("MF7 frontend modular: OK");
} catch (error) {
  console.error(error?.message ?? String(error));
  process.exitCode = 1;
}
