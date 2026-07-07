/**
 * Gate MF8 para validar consistência visual mínima com o mockup OPSA.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const pagesDir = join("src", "pages");
const pageModules = ["mf1Pages.tsx", "mf2Pages.tsx", "mf3Pages.tsx", "mf4Pages.tsx"];

/**
 * Lê um ficheiro de texto relativo à pasta `real_dev/web`.
 *
 * @param {string} filePath - Caminho relativo ao package frontend.
 * @returns {string} Conteúdo do ficheiro.
 */
function readProjectFile(filePath) {
  return readFileSync(filePath, "utf8");
}

/**
 * Garante que um ficheiro contém todos os marcadores esperados.
 *
 * @param {string} filePath - Caminho relativo ao package frontend.
 * @param {string[]} markers - Textos obrigatórios.
 * @returns {void}
 */
function expectMarkers(filePath, markers) {
  const text = readProjectFile(filePath);
  const missing = markers.filter((marker) => !text.includes(marker));
  if (missing.length > 0) {
    throw new Error(`${filePath} não contém: ${missing.join(", ")}`);
  }
}

/**
 * Valida se um ficheiro wrapper apenas reexporta uma página agregada.
 *
 * @param {string} filePath - Caminho relativo ao package frontend.
 * @returns {void}
 */
function expectWrapperOrPageFrame(filePath) {
  const text = readProjectFile(filePath);
  const isWrapper = /^export\s+\{[\s\S]+from\s+"\.\/mf\dPages";?\s*$/m.test(text.trim());

  // Wrappers não renderizam UI; o contrato visual vive no módulo agregador que eles reexportam.
  if (isWrapper) return;

  expectMarkers(filePath, ["PageFrame", "StatusMessage"]);
}

/**
 * Verifica wrappers e módulos agregadores de páginas sem gerar falsos negativos.
 *
 * @returns {void}
 */
function checkPages() {
  const pageFiles = readdirSync(pagesDir).filter((file) => file.endsWith(".tsx"));
  for (const file of pageFiles) {
    const filePath = join(pagesDir, file);
    if (pageModules.includes(file)) {
      expectMarkers(filePath, ["PageFrame", "StatusMessage"]);
      continue;
    }

    expectWrapperOrPageFrame(filePath);
  }
}

/**
 * Verifica estilos e componentes partilhados exigidos pelo RNF35.
 *
 * @returns {void}
 */
function checkSharedUi() {
  expectMarkers("src/styles.css", [
    "--opsa-royal-green: #004E53",
    "--opsa-yellow: #FAF227",
    ".appShell",
    ".sidebar",
    ".pageFrame",
    ".statusMessage",
    ".aiSourceQuality",
  ]);

  expectMarkers("src/ui/opsaUi.tsx", [
    "export function PageFrame",
    "export function StatusMessage",
    "export function AiSourceQualityPanel",
  ]);
}

/**
 * Verifica se a UI consome o handoff de qualidade de fonte vindo do BK-MF8-13.
 *
 * @returns {void}
 */
function checkAiGovernanceUi() {
  expectMarkers("src/lib/mf4Api.ts", ["AiSourceQuality", "sourceQuality"]);
  expectMarkers(join(pagesDir, "mf4Pages.tsx"), ["AiSourceQualityPanel", "Decisão humana"]);
}

/**
 * Verifica se o package expõe o comando de gate para PR e defesa.
 *
 * @returns {void}
 */
function checkPackageScript() {
  expectMarkers("package.json", ["test:mf8:ui-alignment"]);
}

checkSharedUi();
checkPages();
checkAiGovernanceUi();
checkPackageScript();
console.log("MF8 UI alignment OK");
