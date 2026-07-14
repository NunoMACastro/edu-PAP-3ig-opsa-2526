/**
 * @file Smoke textual MF5 para contratos basicos de acessibilidade.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const files = {
  app: new URL("../src/App.tsx", import.meta.url),
  mf1: new URL("../src/pages/mf1Pages.tsx", import.meta.url),
  mf2: new URL("../src/pages/mf2Pages.tsx", import.meta.url),
  mf3: new URL("../src/pages/mf3Pages.tsx", import.meta.url),
  mf4: new URL("../src/pages/mf4Pages.tsx", import.meta.url),
  opsaUi: new URL("../src/ui/opsaUi.tsx", import.meta.url),
  styles: new URL("../src/styles.css", import.meta.url),
  packageJson: new URL("../package.json", import.meta.url),
};

/**
 * Le um ficheiro de texto do projeto web.
 *
 * @param {URL} url - URL local do ficheiro.
 * @returns {string} Conteudo textual do ficheiro.
 */
function readText(url) {
  return readFileSync(url, "utf8");
}

/**
 * Confirma que um contrato textual existe no ficheiro analisado.
 *
 * @param {string} source - Conteudo do ficheiro.
 * @param {RegExp} expected - Padrao obrigatorio para o contrato.
 * @param {string} context - Descricao curta da regra validada.
 * @returns {void}
 */
function assertContract(source, expected, context) {
  assert.match(source, expected, `MF5 acessibilidade em falta: ${context}`);
}

const app = readText(files.app);
const mf1 = readText(files.mf1);
const mf2 = readText(files.mf2);
const mf3 = readText(files.mf3);
const mf4 = readText(files.mf4);
const opsaUi = readText(files.opsaUi);
const styles = readText(files.styles);
const packageJson = readText(files.packageJson);

const uiContracts = [
  [/aria-labelledby=\{safeHeadingId\}/, "PageFrame liga heading ao conteudo"],
  [/aria-live=\{live\}/, "StatusMessage anuncia alteracoes de estado"],
  [/role=\{role\}/, "StatusMessage escolhe status ou alert"],
  [/statusMessage__title/, "Mensagens têm titulo textual"],
  [/pageFrame__body/, "PageFrame tem corpo semantico estilavel"],
];

for (const [expected, context] of uiContracts) {
  // Cada assert protege um contrato de acessibilidade criado nos componentes comuns.
  assertContract(opsaUi, expected, context);
}

const styleContracts = [
  [/:focus-visible/, "Foco visivel por teclado"],
  [/line-height/, "Legibilidade do texto"],
  [/prefers-reduced-motion/, "Preferencia de movimento reduzido"],
  [/--opsa-text-strong/, "Cor base de texto com contraste"],
  [/statusMessage__title/, "Titulo textual da mensagem tem estilo proprio"],
];

for (const [expected, context] of styleContracts) {
  // O CSS e validado por texto para apanhar regressoes simples antes do browser.
  assertContract(styles, expected, context);
}

const pageContracts = [
  [app, /PageFrame/, "App usa a moldura comum"],
  [mf1, /StatusMessage/, "MF1 usa mensagens acessiveis"],
  [mf2, /StatusMessage/, "MF2 usa mensagens acessiveis"],
  [mf3, /StatusMessage/, "MF3 usa mensagens acessiveis"],
  [mf4, /StatusMessage/, "MF4 usa mensagens acessiveis"],
];

for (const [source, expected, context] of pageContracts) {
  assertContract(source, expected, context);
}

assertContract(packageJson, /"test:mf5:a11y"/, "package expoe smoke de acessibilidade");

console.info("MF5 accessibility contract OK");
