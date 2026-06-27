/**
 * @file Smoke textual da MF5 para confirmar feedback imediato nas acoes principais.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const files = {
  app: new URL("../src/App.tsx", import.meta.url),
  hook: new URL("../src/ui/useActionFeedback.ts", import.meta.url),
  mf3: new URL("../src/pages/mf3Pages.tsx", import.meta.url),
  mf4: new URL("../src/pages/mf4Pages.tsx", import.meta.url),
  packageJson: new URL("../package.json", import.meta.url),
};

/**
 * Le um ficheiro de texto do projeto web.
 *
 * @param url - URL local do ficheiro.
 * @returns Conteudo textual do ficheiro.
 */
function readText(url) {
  return readFileSync(url, "utf8");
}

/**
 * Falha o smoke quando um contrato textual obrigatorio nao existe.
 *
 * @param source - Conteudo onde procurar.
 * @param expected - Expressao regular obrigatoria.
 * @param label - Descricao curta do contrato.
 * @returns Nao devolve valor; lanca erro se o contrato nao existir.
 */
function assertContract(source, expected, label) {
  assert.match(source, expected, `MF5 feedback em falta: ${label}`);
}

/**
 * Falha o smoke quando um padrao proibido reaparece nos ficheiros cobertos pelo RNF03.
 *
 * @param source - Conteudo onde procurar.
 * @param forbidden - Expressao regular proibida.
 * @param label - Descricao curta do contrato negativo.
 * @returns Nao devolve valor; lanca erro se o padrao existir.
 */
function assertNoContract(source, forbidden, label) {
  assert.doesNotMatch(source, forbidden, `MF5 feedback incompleto: ${label}`);
}

const app = readText(files.app);
const hook = readText(files.hook);
const mf3 = readText(files.mf3);
const mf4 = readText(files.mf4);
const packageJson = readText(files.packageJson);

assertContract(hook, /export function useActionFeedback/, "hook exportado");
assertContract(hook, /phase: "running"/, "estado de execucao");
assertContract(hook, /phase: "success"/, "estado de sucesso");
assertContract(hook, /phase: "error"/, "estado de erro");

assertContract(app, /useActionFeedback/, "App consome o hook");
assertContract(app, /StatusMessage/, "App apresenta mensagens comuns");
assertContract(app, /A validar e enviar dados/, "feedback de submissao");
assertContract(app, /A atualizar dados/, "feedback de listagem");

assertContract(mf3, /useActionFeedback/, "MF3 cobre importacoes");
assertContract(mf3, /A validar e importar/, "mensagem de importacao");
assertContract(mf3, /StatusMessage/, "MF3 usa mensagem transversal");
assertContract(mf3, /function DateRangeForm[\s\S]*useActionFeedback/, "MF3 DateRangeForm usa feedback comum");
assertContract(mf3, /Contas atualizadas\./, "MF3 listagem de tesouraria confirma sucesso");
assertContract(mf3, /Conta criada com sucesso\./, "MF3 criacao de conta confirma sucesso");
assertNoContract(mf3, /function Feedback/, "MF3 nao pode voltar ao componente local Feedback");
assertNoContract(mf3, /setBusy\(|setError\(/, "MF3 nao pode voltar a busy/error local nas acoes RNF03");

assertContract(mf4, /StatusMessage/, "MF4 usa mensagem transversal");
assertContract(mf4, /useActionFeedback/, "MF4 cobre acoes dedicadas");
assertContract(mf4, /function DateRangeForm[\s\S]*useActionFeedback/, "MF4 DateRangeForm usa feedback comum");
assertContract(mf4, /Explicacao carregada\./, "MF4 explicacao de insight confirma sucesso");
assertContract(mf4, /Sugestoes atualizadas\./, "MF4 sugestoes confirmam sucesso");
assertContract(mf4, /Resposta gerada com sucesso\./, "MF4 perguntas confirmam sucesso");
assertContract(mf4, /Alertas gerados com sucesso\./, "MF4 alertas confirmam sucesso");
assertNoContract(mf4, /function Feedback/, "MF4 nao pode voltar ao componente local Feedback");
assertNoContract(mf4, /setBusy\(|setError\(/, "MF4 nao pode voltar a busy/error local nas acoes RNF03");
assertContract(packageJson, /"test:mf5:feedback"/, "script disponivel no package.json");

console.info("MF5 feedback smoke OK");
