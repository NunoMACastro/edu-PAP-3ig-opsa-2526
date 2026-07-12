/**
 * @file Gate MF8 para validar a UI de planos e gestão da subscrição simulada.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = fileURLToPath(new URL("..", import.meta.url));

const files = {
  app: "src/App.tsx",
  apiClient: "src/lib/apiClient.ts",
  subscriptionsApi: "src/lib/subscriptionsApi.ts",
  page: "src/pages/SubscriptionsPage.tsx",
  styles: "src/styles.css",
  packageJson: "package.json",
};

/**
 * Lê um ficheiro de texto relativo à raiz do frontend.
 *
 * @param {string} relativePath - Caminho do ficheiro dentro de real_dev/web.
 * @returns {string} Conteúdo textual do ficheiro.
 */
function readText(relativePath) {
  return readFileSync(join(webRoot, relativePath), "utf8");
}

/**
 * Remove comentários para que contratos obrigatórios tenham de existir em código real.
 *
 * @param {string} content - Conteúdo original.
 * @returns {string} Conteúdo sem comentários.
 */
function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

/**
 * Confirma que um ficheiro existe no frontend real.
 *
 * @param {string} relativePath - Caminho esperado.
 * @returns {void}
 */
function assertFile(relativePath) {
  assert.equal(
    existsSync(join(webRoot, relativePath)),
    true,
    `Ficheiro obrigatório em falta: ${relativePath}`,
  );
}

/**
 * Confirma um marcador textual obrigatório.
 *
 * @param {string} source - Fonte textual.
 * @param {RegExp} expected - Marcador esperado.
 * @param {string} label - Descrição curta do contrato.
 * @returns {void}
 */
function assertContract(source, expected, label) {
  assert.match(source, expected, `Contrato MF8 UI em falta: ${label}`);
}

/**
 * Confirma que um marcador proibido não existe em código executável.
 *
 * @param {string} source - Fonte textual.
 * @param {RegExp} forbidden - Marcador proibido.
 * @param {string} label - Descrição curta do negativo.
 * @returns {void}
 */
function assertNoContract(source, forbidden, label) {
  assert.doesNotMatch(source, forbidden, `Contrato MF8 UI inseguro: ${label}`);
}

for (const file of Object.values(files)) {
  assertFile(file);
}

const app = readText(files.app);
const apiClient = stripComments(readText(files.apiClient));
const subscriptionsApi = stripComments(readText(files.subscriptionsApi));
const page = stripComments(readText(files.page));
const styles = readText(files.styles);
const packageJson = readText(files.packageJson);

assertContract(apiClient, /credentials:\s*"include"/, "cliente central envia cookies HttpOnly");
assertContract(subscriptionsApi, /createApiClient\(\)/, "cliente de subscrições reutiliza cliente central");
assertContract(subscriptionsApi, /\/subscriptions\/plans/, "GET planos simulados");
assertContract(subscriptionsApi, /\/subscriptions\/current"/, "GET subscrição atual");
assertContract(subscriptionsApi, /\/subscriptions\/current\/activate/, "POST ativação simulada");
assertContract(subscriptionsApi, /\/subscriptions\/current\/actions/, "POST ações de ciclo de vida");
assertContract(subscriptionsApi, /formatPlanPrice/, "formatação PT-PT de preço");
assertContract(subscriptionsApi, /isSubscriptionActionEnabled/, "gating de UX por estado");

assertNoContract(subscriptionsApi, /\bfetch\s*\(/, "subscriptionsApi não deve chamar fetch direto");
assertNoContract(subscriptionsApi, /\blocalStorage\b|\bsessionStorage\b/, "sem storage para sessão ou empresa ativa");
assertNoContract(subscriptionsApi, /\bcompanyId\b/, "frontend não envia companyId para ownership");

assertContract(page, /loadSubscriptionOverview/, "página carrega overview");
assertContract(page, /runSubscriptionAction/, "página executa ações via cliente tipado");
assertContract(page, /StatusMessage/, "estados de loading/erro/vazio/sucesso visíveis");
assertContract(page, /useActionFeedback/, "feedback imediato transversal");
assertContract(page, /Ativar plano/, "ação de ativação visível");
assertContract(page, /Renovar/, "ação de renovação visível");
assertContract(page, /Cancelar/, "ação de cancelamento visível");
assertContract(page, /Reativar/, "ação de reativação visível");
assertContract(page, /isSubscriptionActionEnabled\(current,\s*"activate"\)/, "ativação bloqueada por estado");
assertContract(page, /isSubscriptionActionEnabled\(current,\s*"renew"\)/, "renovação bloqueada por estado");
assertContract(page, /isSubscriptionActionEnabled\(current,\s*"cancel"\)/, "cancelamento bloqueado por estado");
assertContract(page, /isSubscriptionActionEnabled\(current,\s*"reactivate"\)/, "reativação bloqueada por estado");
assertNoContract(page, /\blocalStorage\b|\bsessionStorage\b/, "página não persiste sessão, role ou empresa");
assertNoContract(page, /\bcompanyId\b/, "página não decide empresa ativa");

assertContract(app, /SubscriptionsPage/, "App importa página MF8");
assertContract(app, /mf8Pages/, "App regista lista MF8");
assertContract(app, /subscriptions/, "App expõe navegação de subscrições");
assertContract(styles, /\.subscriptionsLayout/, "estilos da página MF8");
assertContract(styles, /grid-template-columns:\s*repeat\(auto-fit, minmax/, "layout responsivo dos planos");
assertContract(packageJson, /"test:mf8:subscriptions-ui"/, "script de gate disponível");

console.info("MF8 subscriptions UI smoke OK");
