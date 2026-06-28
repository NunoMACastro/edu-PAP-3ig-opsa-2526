// apps/web/scripts/check-mf7-browser-compatibility.mjs
/**
 * @file Gate MF7 para validar compatibilidade do frontend em Chrome, Edge e Firefox.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

const sourceFiles = [
  "src/App.tsx",
  "src/lib/apiClient.ts",
  "src/styles.css",
  "src/ui/ResponsiveDataTable.tsx",
  "src/ui/opsaUi.tsx",
];

const forbiddenPatterns = [
  {
    pattern: /\bnavigator\.userAgent\b/i,
    reason: "usa identificação do browser em vez de feature detection",
  },
  {
    pattern: /\bwindow\.chrome\b/i,
    reason: "cria ramo específico para Chrome ou Edge",
  },
  {
    pattern: /\bInstallTrigger\b/i,
    reason: "cria ramo específico para Firefox",
  },
  {
    pattern: /@-moz-document/i,
    reason: "cria CSS específico para Firefox",
  },
  {
    pattern: /::-webkit-/i,
    reason: "cria seletor CSS específico para motores WebKit/Blink",
  },
  {
    pattern: /@supports\s*\([^)]*-webkit-/i,
    reason: "usa suporte CSS como atalho para escolher browser",
  },
];

const requiredContracts = [
  {
    file: "src/lib/apiClient.ts",
    pattern: /credentials:\s*"include"/,
    reason: "o cliente HTTP deve enviar o cookie de sessão de forma automática",
  },
  {
    file: "src/styles.css",
    pattern: /:focus-visible/,
    reason: "o foco por teclado deve ser visível nos browsers alvo",
  },
  {
    file: "src/styles.css",
    pattern: /@media\s*\(max-width:\s*640px\)/,
    reason: "a interface deve manter adaptação mobile sem lógica por browser",
  },
  {
    file: "src/ui/ResponsiveDataTable.tsx",
    pattern: /export function ResponsiveDataTable/,
    reason: "as tabelas responsivas de MF5 devem continuar disponíveis",
  },
];

/**
 * Lê um ficheiro do frontend a partir da raiz de `apps/web`.
 *
 * @param {string} relativePath - Caminho relativo dentro de `apps/web`.
 * @returns {string} Conteúdo textual do ficheiro.
 */
function readWebFile(relativePath) {
  return readFileSync(join(projectRoot, relativePath), "utf8");
}

/**
 * Confirma que o ficheiro não contém padrões proibidos por `RNF20`.
 *
 * @param {string} relativePath - Caminho relativo do ficheiro analisado.
 * @param {string} source - Conteúdo textual do ficheiro.
 * @returns {void}
 */
function assertNoBrowserBranch(relativePath, source) {
  for (const { pattern, reason } of forbiddenPatterns) {
    // O gate falha cedo para impedir que a UI tenha caminhos diferentes por browser.
    assert.equal(
      pattern.test(source),
      false,
      `${relativePath} contém regra proibida: ${reason}`,
    );
  }
}

/**
 * Confirma contratos de frontend que devem sobreviver nos três browsers alvo.
 *
 * @returns {void}
 */
function assertRequiredContracts() {
  for (const { file, pattern, reason } of requiredContracts) {
    const source = readWebFile(file);
    // Estes contratos foram escolhidos porque protegem sessão, foco e layout responsivo.
    assert.match(source, pattern, `${file} não cumpre contrato MF7: ${reason}`);
  }
}

/**
 * Executa o gate de compatibilidade browser da MF7.
 *
 * @returns {void}
 */
export function checkMf7BrowserCompatibility() {
  for (const file of sourceFiles) {
    const source = readWebFile(file);
    assertNoBrowserBranch(file, source);
  }

  assertRequiredContracts();
}

checkMf7BrowserCompatibility();
console.info("MF7 browser compatibility gate OK");