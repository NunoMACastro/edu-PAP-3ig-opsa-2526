/**
 * @file Smoke textual para contratos de validação de formulários MF5.
 */

import { readFile } from "node:fs/promises";

const files = {
  validators: new URL("../src/lib/mf5FormValidators.ts", import.meta.url),
  app: new URL("../src/App.tsx", import.meta.url),
  mf1: new URL("../src/pages/mf1Pages.tsx", import.meta.url),
  packageJson: new URL("../package.json", import.meta.url),
};

/**
 * Falha o smoke quando uma evidência textual crítica não existe.
 *
 * @param source - Conteúdo do ficheiro analisado.
 * @param expected - Texto que deve existir.
 * @param description - Explicação do contrato verificado.
 */
function assertIncludes(source, expected, description) {
  if (!source.includes(expected)) {
    throw new Error(`MF5 forms em falta: ${description}`);
  }
}

const [validators, app, mf1, packageJson] = await Promise.all(
  Object.values(files).map((fileUrl) => readFile(fileUrl, "utf8")),
);

assertIncludes(validators, "validatePortugueseIban", "validação de IBAN português");
assertIncludes(validators, "toISOString().slice(0, 10)", "datas usam roundtrip ISO");
assertIncludes(validators, "validateVatBps", "IVA técnico separado de percentagem visual");
assertIncludes(validators, "validateKnownId", "identificadores validados como seleção");
assertIncludes(validators, "validateMf5FormData", "formulários dedicados conseguem usar FormData");
assertIncludes(app, "validateMf5Form", "OperationForm valida antes da API");
assertIncludes(app, "new Error(formatMf5FormErrors", "feedback recebe Error");
assertIncludes(mf1, "validateMf5FormData", "MF1 valida datas e IVA antes da API");
assertIncludes(packageJson, "\"test:mf5:forms\"", "package expõe comando RNF05");

console.log("MF5 form validation smoke OK");