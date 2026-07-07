/**
 * @file Smoke textual para contratos de validação de formulários MF5.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const files = {
  validators: new URL("../src/lib/mf5FormValidators.ts", import.meta.url),
  app: new URL("../src/App.tsx", import.meta.url),
  mf1: new URL("../src/pages/mf1Pages.tsx", import.meta.url),
  mf2: new URL("../src/pages/mf2Pages.tsx", import.meta.url),
  mf3: new URL("../src/pages/mf3Pages.tsx", import.meta.url),
  mf4: new URL("../src/pages/mf4Pages.tsx", import.meta.url),
  packageJson: new URL("../package.json", import.meta.url),
};

/**
 * Lê um ficheiro de texto do projeto web.
 *
 * @param {URL} url - URL local do ficheiro.
 * @returns {string} Conteúdo textual do ficheiro.
 */
function readText(url) {
  return readFileSync(url, "utf8");
}

/**
 * Falha o smoke quando uma evidência textual crítica não existe.
 *
 * @param {string} source - Conteúdo do ficheiro analisado.
 * @param {RegExp} expected - Expressão regular que deve existir.
 * @param {string} description - Explicação do contrato verificado.
 * @returns {void}
 */
function assertContract(source, expected, description) {
  assert.match(source, expected, `MF5 forms em falta: ${description}`);
}

const validators = readText(files.validators);
const app = readText(files.app);
const mf1 = readText(files.mf1);
const mf2 = readText(files.mf2);
const mf3 = readText(files.mf3);
const mf4 = readText(files.mf4);
const packageJson = readText(files.packageJson);

assertContract(validators, /validateNif/, "validação de NIF português");
assertContract(validators, /hasValidNifChecksum/, "NIF usa checksum alinhado ao backend");
assertContract(validators, /validatePortugueseIban/, "validação de IBAN português");
assertContract(validators, /toISOString\(\)\.slice\(0, 10\)/, "datas usam roundtrip ISO");
assertContract(validators, /validateVatBps/, "IVA técnico separado de percentagem visual");
assertContract(validators, /validateVatPercent/, "IVA percentual separado de basis points");
assertContract(validators, /validateKnownId/, "identificadores validados como seleção");
assertContract(validators, /validateSncAccount/, "contas SNC validadas explicitamente");
assertContract(validators, /assertMf5FormData/, "formulários dedicados validam FormData");
assertContract(validators, /assertMf5FormValues/, "formulários genéricos validam valores normalizados");

assertContract(app, /validateMf5Form[\s\S]*operation\.run/, "OperationForm valida antes da API");
assertContract(app, /formatMf5ValidationUiError/, "OperationForm preserva validacao local com mensagens RNF06");
assertContract(app, /mf5ValidationName: "accountCode"/, "Plano de contas valida código SNC sem afetar outros códigos");
assertContract(mf1, /assertMf5FormData/, "MF1 valida datas e IVA antes da API");
assertContract(mf2, /assertMf5FormData/, "MF2 valida datas contabilísticas antes da API");
assertContract(mf3, /assertMf5FormData/, "MF3 valida intervalos e IBAN antes da API");
assertContract(mf4, /assertMf5FormData/, "MF4 valida intervalos e prazos antes da API");
assertContract(packageJson, /"test:mf5:forms"/, "package expõe comando RNF05");

console.info("MF5 form validation smoke OK");
