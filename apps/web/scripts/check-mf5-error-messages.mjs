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
  feedbackHook: new URL("../src/ui/useActionFeedback.ts", import.meta.url),
  messages: new URL("../src/lib/mf5ErrorMessages.ts", import.meta.url),
  packageJson: new URL("../package.json", import.meta.url),
};

/**
 * Falha o processo quando um contrato textual esperado nao existe.
 *
 * @param {string} content - Conteudo do ficheiro.
 * @param {string | RegExp} expected - Texto ou padrao que deve existir.
 * @param {string} label - Descricao do contrato validado.
 * @returns {void}
 */
function assertContract(content, expected, label) {
  const matches =
    typeof expected === "string"
      ? content.includes(expected)
      : expected.test(content);

  if (!matches) {
    throw new Error(`Contrato MF5 em falta: ${label}`);
  }
}

const [messages, app, mf1, mf2, mf3, mf4, feedbackHook, packageJson] =
  await Promise.all([
    readFile(files.messages, "utf8"),
    readFile(files.app, "utf8"),
    readFile(files.mf1, "utf8"),
    readFile(files.mf2, "utf8"),
    readFile(files.mf3, "utf8"),
    readFile(files.mf4, "utf8"),
    readFile(files.feedbackHook, "utf8"),
    readFile(files.packageJson, "utf8"),
  ]);

assertContract(messages, "formatMf5FormErrors", "reutiliza mensagens locais do BK-MF5-05");
assertContract(messages, "toUiErrorMessage", "exporta mensagem estruturada para erros API/runtime");
assertContract(messages, "toUiValidationError", "exporta mensagem estruturada para validacao local");
assertContract(messages, "formatMf5ValidationUiError", "exporta formatador de validacao local");
assertContract(messages, "formatUiError", "exporta formatador transversal");
assertContract(messages, "FORBIDDEN", "tem orientacao para permissoes");
assertContract(messages, "INVALID_NIF", "tem orientacao para NIF");
assertContract(messages, "status: normalized.status", "preserva status HTTP da API");
assertContract(messages, "code: normalized.code", "preserva code tecnico da API");
assertContract(messages, "Proxima acao:", "mensagem final indica como resolver");
assertContract(app, "FormErrorSummary", "OperationForm resume erros locais por campo");
assertContract(app, "FieldError", "OperationForm associa erro ao controlo");
assertContract(app, "formatUiError", "App usa formatador transversal");
assertContract(mf1, /function formatError[\s\S]*formatUiError\(error\)/, "MF1 delega erros no RNF06");
assertContract(mf2, /function formatError[\s\S]*formatUiError\(error\)/, "MF2 delega erros no RNF06");
assertContract(feedbackHook, "formatUiError", "useActionFeedback traduz erros de MF3/MF4");
assertContract(mf3, "useActionFeedback", "MF3 continua ligada ao hook comum de erros");
assertContract(mf4, "useActionFeedback", "MF4 continua ligada ao hook comum de erros");
assertContract(packageJson, "\"test:mf5:errors\"", "package expoe comando RNF06");

// O output e curto para poder ser usado diretamente como evidence de PR.
console.info("MF5 error messages smoke OK");
