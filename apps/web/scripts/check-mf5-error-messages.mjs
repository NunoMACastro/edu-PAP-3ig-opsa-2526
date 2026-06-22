/**
 * @file Smoke textual para contratos de mensagens de erro MF5.
 */

import { readFile } from "node:fs/promises";

const files = {
  app: new URL("../src/App.tsx", import.meta.url),
  mf1: new URL("../src/pages/mf1Pages.tsx", import.meta.url),
  mf2: new URL("../src/pages/mf2Pages.tsx", import.meta.url),
  mf3: new URL("../src/pages/mf3Pages.tsx", import.meta.url),
  mf4: new URL("../src/pages/mf4Pages.tsx", import.meta.url),
  messages: new URL("../src/lib/mf5ErrorMessages.ts", import.meta.url),
  packageJson: new URL("../package.json", import.meta.url),
};

/**
 * Falha o processo quando um contrato textual esperado não existe.
 *
 * @param content - Conteúdo do ficheiro.
 * @param expected - Texto que deve existir.
 * @param label - Descrição do contrato validado.
 */
function assertIncludes(content, expected, label) {
  if (!content.includes(expected)) {
    throw new Error(`Contrato MF5 em falta: ${label}`);
  }
}

const [messages, app, mf1, mf2, mf3, mf4, packageJson] = await Promise.all([
  readFile(files.messages, "utf8"),
  readFile(files.app, "utf8"),
  readFile(files.mf1, "utf8"),
  readFile(files.mf2, "utf8"),
  readFile(files.mf3, "utf8"),
  readFile(files.mf4, "utf8"),
  readFile(files.packageJson, "utf8"),
]);

assertIncludes(messages, "formatMf5FormErrors", "reutiliza mensagens locais do BK-MF5-05");
assertIncludes(messages, "formatMf5ValidationUiError", "exporta formatador de validação local");
assertIncludes(messages, "formatUiError", "exporta formatador transversal");
assertIncludes(messages, "FORBIDDEN", "tem orientação para permissões");
assertIncludes(messages, "INVALID_NIF", "tem orientação para NIF");
assertIncludes(app, "formatMf5ValidationUiError", "OperationForm usa mensagens locais melhoradas");
assertIncludes(app, "formatUiError", "App usa formatador transversal");
assertIncludes(`${mf1}${mf2}${mf3}${mf4}`, "formatUiError", "páginas dedicadas usam RNF06");
assertIncludes(packageJson, '"test:mf5:errors"', "package expõe comando RNF06");

// O output é curto para poder ser usado diretamente como evidence de PR.
console.log("MF5 error messages smoke OK");
