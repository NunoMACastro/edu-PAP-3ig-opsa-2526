/**
 * @file Smoke textual MF5 para contratos básicos de acessibilidade.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const opsaUi = readFileSync(new URL("../src/ui/opsaUi.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const packageJson = readFileSync(new URL("../package.json", import.meta.url), "utf8");

/**
 * Confirma que um contrato textual existe no ficheiro analisado.
 *
 * @param source - Conteúdo do ficheiro.
 * @param expected - Texto obrigatório para o contrato.
 * @param context - Descrição curta da regra validada.
 */
function assertIncludes(source, expected, context) {
  assert.ok(source.includes(expected), `${context} em falta: ${expected}`);
}

const uiContracts = [
  ["aria-labelledby", "PageFrame liga heading ao conteúdo"],
  ["aria-live", "StatusMessage anuncia alterações de estado"],
  ["role={role}", "StatusMessage escolhe status ou alert"],
  ["statusMessage__title", "Mensagens têm título textual"],
];

for (const [expected, context] of uiContracts) {
  // Cada assert protege um contrato de acessibilidade criado nos componentes comuns.
  assertIncludes(opsaUi, expected, context);
}

const styleContracts = [
  [":focus-visible", "Foco visível por teclado"],
  ["line-height", "Legibilidade do texto"],
  ["prefers-reduced-motion", "Preferência de movimento reduzido"],
  ["--opsa-text-strong", "Cor base de texto com contraste"],
];

for (const [expected, context] of styleContracts) {
  // O CSS é validado por texto para apanhar regressões simples antes do browser.
  assertIncludes(styles, expected, context);
}

assertIncludes(app, "PageFrame", "App usa a moldura comum");
assertIncludes(packageJson, "\"test:mf5:a11y\"", "Package expõe smoke de acessibilidade");

console.info("MF5 accessibility contract OK");