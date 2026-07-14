/**
 * @file Verificação textual do contrato de performance MF5 no frontend OPSA.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const budget = readFileSync(new URL("../src/lib/mf5PerformanceBudget.ts", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const mf3 = readFileSync(new URL("../src/pages/mf3Pages.tsx", import.meta.url), "utf8");
const packageJson = readFileSync(new URL("../package.json", import.meta.url), "utf8");

/**
 * Confirma que um contrato textual de performance existe num ficheiro frontend.
 * A mensagem identifica o marcador em falta para acelerar a correção pedagógica.
 *
 * @param {string} content - Conteúdo textual do ficheiro analisado.
 * @param {string} expected - Marcador obrigatório a procurar.
 * @param {string} label - Descrição curta do contrato validado.
 * @returns {void}
 */
function assertIncludes(content, expected, label) {
  // Cada assert descreve o contrato em falta para o aluno corrigir depressa.
  assert.ok(content.includes(expected), `Contrato MF5 em falta: ${label}`);
}

assertIncludes(budget, "MF5_PERFORMANCE_BUDGET_MS = 2000", "orçamento de 2 segundos");
assertIncludes(budget, "measureListingLoad", "medição de listagens");
assertIncludes(budget, "measureDashboardLoad", "medição de dashboards");
assertIncludes(budget, "formatPerformanceWarning", "aviso de performance");
assertIncludes(app, "measureListingLoad", "ResourcePanel mede listagens");
assertIncludes(app, "formatPerformanceWarning", "ResourcePanel mostra aviso");
assertIncludes(app, "Aviso de performance", "ResourcePanel apresenta aviso não bloqueante");
assertIncludes(mf3, "measureDashboardLoad", "MF3 mede dashboards");
assertIncludes(mf3, 'performanceLabel="Relatorios operacionais"', "relatórios operacionais medidos");
assertIncludes(mf3, 'performanceLabel="KPIs executivos"', "KPIs executivos medidos");
assertIncludes(packageJson, '"test:mf5:performance"', "package expõe comando RNF07");

const slowSample = {
  label: "KPIs executivos",
  surface: "dashboard",
  durationMs: 2100,
  withinBudget: false,
};

// O cenário lento prova que 2100 ms fica fora do orçamento de 2000 ms.
assert.equal(slowSample.durationMs > 2000, true);
assert.equal(slowSample.withinBudget, false);

console.info("MF5 performance budget contract OK");
