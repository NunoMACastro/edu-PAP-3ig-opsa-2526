# BK-MF8-18 - Correção dos erros encontrados e reexecução dos testes afetados

## Header
- `doc_id`: `GUIA-BK-MF8-18`
- `bk_id`: `BK-MF8-18`
- `macro`: `MF8`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-17`
- `rf_rnf`: `RNF39`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `-`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-18-correcao-dos-erros-encontrados-e-reexecucao-dos-testes-afetados.md`
- `last_updated`: `2026-07-03`

#### Objetivo

Corrigir erros bloqueantes encontrados na execução final do MF8 e provar, com evidência verificável, que o teste afetado voltou a passar depois da correção.

No fim deste BK deve existir um relatório único em `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` que liga o erro observado no BK-MF8-17 a uma causa raiz, a uma correção concreta, ao comando reexecutado e a uma decisão final.

Este BK fecha o requisito RNF39: quando a execução final encontra erros, a equipa corrige, reexecuta os testes afetados e regista a prova antes de considerar o MF8 concluído.

#### Importância

Uma execução final com erro não deve ser fechada apenas com uma nota manual. Sem uma correção rastreável, a equipa pode entregar um MF8 aparentemente validado, mas com um problema real ainda presente.

Este BK transforma a correção final num processo repetível: ler a evidência do BK-MF8-17, identificar o comando que falhou, corrigir a causa, repetir o mesmo comando e guardar a decisão final. Isto ajuda na defesa do projeto porque mostra que a equipa não ignorou falhas encontradas tarde no ciclo.

Também reduz risco operacional. Se o mesmo erro voltar a acontecer, outro elemento da equipa consegue perceber onde falhou, que ficheiros foram alterados e que teste confirma a reparação.

#### Scope-in

- Ler `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` produzido no BK-MF8-17.
- Identificar o primeiro erro bloqueante ou comando com resultado negativo.
- Corrigir apenas a causa mínima necessária para desbloquear esse erro.
- Criar o verificador `apps/api/scripts/check-mf8-defect-report.mjs`.
- Adicionar o comando `mf8:defect-report` a `apps/api/package.json`.
- Registar a evidência final em `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`.
- Reexecutar o comando afetado e guardar o resultado real.

#### Scope-out

- Criar novas funcionalidades de produto.
- Alterar regras de negócio fora do erro encontrado na execução final.
- Reescrever a suite de testes do MF8.
- Ignorar um erro e marcar o MF8 como concluído sem revalidação.
- Alterar artefactos de MF anteriores sem uma causa diretamente ligada ao erro final.
- Fazer alterações visuais sem impacto no comando que falhou.

#### Estado antes e depois

Antes deste BK, o BK-MF8-17 já executou a validação final e produziu `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`. Esse ficheiro pode indicar que tudo passou ou pode indicar um bloqueio que impede fechar o MF8.

Depois deste BK, se existir erro bloqueante, a equipa tem de ter corrigido a causa mínima, reexecutado o mesmo comando afetado e guardado `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` com decisão `CORRIGIDO_REVALIDADO`.

Se a execução final não tiver erros bloqueantes, o relatório deve declarar explicitamente que não houve correção necessária, usar a decisão `SEM_CORRECAO_NECESSARIA` e confirmar que a decisão do BK-MF8-17 permite fechar o MF8.

#### Pre-requisitos

- BK-MF8-17 concluído.
- Ficheiro `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` existente.
- Permissão para alterar apenas ficheiros necessários para corrigir o erro observado.
- Node.js instalado no ambiente de desenvolvimento.
- Conhecimento básico de `npm run`, `node --check` e leitura de logs.

Dados mínimos esperados no início:

- Positivos: pelo menos `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` existe e contém a decisão final do BK-MF8-17.
- Negativos: mínimo `2`.
  - Caso 1: a evidência final refere um comando bloqueante e o relatório de correção ainda não existe.
  - Caso 2: o relatório de correção existe, mas não prova que o comando reexecutado é o mesmo comando que tinha falhado.

#### Glossário

- Erro bloqueante: falha que impede considerar a execução final como concluída.
- Causa raiz: motivo técnico que explica por que o erro aconteceu.
- Teste afetado: comando ou teste que falhou e tem de ser repetido depois da correção.
- Reexecução: repetição do comando afetado depois de corrigir a causa.
- Evidência: ficheiro de texto com dados reais suficientes para justificar a decisão tomada.
- Decisão final: conclusão objetiva do BK, por exemplo `CORRIGIDO_REVALIDADO` ou `SEM_CORRECAO_NECESSARIA`.

#### Conceitos teóricos essenciais

##### 1. Corrigir a causa, não apenas o sintoma

Um erro de teste pode aparecer como uma mensagem simples, mas a origem pode estar noutro ponto. Por exemplo, um contrato pode falhar porque um campo obrigatório deixou de ser devolvido pela API. A mensagem do teste é o sintoma; a causa raiz é a alteração que quebrou o contrato.

Neste BK, a correção só é aceite quando a evidência explica a causa e aponta os ficheiros corrigidos.

##### 2. Reexecutar o mesmo comando que falhou

Depois da correção, não basta correr um comando diferente e dizer que o problema desapareceu. O comando reexecutado deve ser o mesmo comando identificado na execução final ou um comando mais específico que cubra diretamente o teste afetado.

O verificador deste BK exige que `Comando original` e `Comando reexecutado` coincidam. Isto evita fechar o BK com uma validação que não cobre o erro observado.

##### 3. Evidência rastreável

A evidência tem de responder a cinco perguntas:

- Que comando falhou?
- Que erro foi observado?
- Qual foi a causa raiz?
- Que ficheiros foram corrigidos?
- Que comando passou depois da correção?

Se faltar uma destas respostas, a defesa fica dependente de memória oral da equipa. O objetivo deste BK é deixar a decisão documentada.

##### 4. Menor alteração correta

Este BK acontece no fim do MF8. Por isso, a correção deve ser pequena, orientada ao erro real e validada com testes. Alterações grandes nesta fase aumentam o risco de quebrar trabalho já validado.

#### Arquitetura do BK

O fluxo de qualidade fica assim:

1. `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` guarda o resultado da validação final do BK-MF8-17.
2. A equipa lê esse ficheiro e identifica o comando afetado.
3. A equipa corrige a causa mínima no código ou configuração relevante.
4. A equipa reexecuta o comando afetado.
5. `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` guarda a ligação entre erro, correção e reexecução.
6. `apps/api/scripts/check-mf8-defect-report.mjs` valida que o relatório contém os campos obrigatórios, que referencia a execução final e que aceita apenas `CORRIGIDO_REVALIDADO` ou `SEM_CORRECAO_NECESSARIA`.
7. `npm run mf8:defect-report` torna a validação repetível.

Este BK não introduz uma nova camada de produto. Ele introduz uma guarda operacional para impedir que erros finais sejam fechados sem prova.

#### Ficheiros a criar/editar/rever

- `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`
  - Rever.
  - Fonte da verdade sobre o comando que falhou na execução final.

- `apps/api/scripts/check-mf8-defect-report.mjs`
  - Criar.
  - Verifica a estrutura e a consistência do relatório de correção.

- `apps/api/package.json`
  - Editar.
  - Adiciona o comando `mf8:defect-report`.

- `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
  - Criar.
  - Evidência única deste BK.

#### Tutorial técnico linear

### Passo 1 - Rever a execução final do BK-MF8-17

1. Objetivo funcional do passo no contexto da app.

Ler a evidência entregue pelo BK-MF8-17 para decidir se este BK vai corrigir um erro real ou apenas registar que não havia erro bloqueante a corrigir.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`
    - LOCALIZAÇÃO: ficheiro completo, com atenção à decisão final e à primeira linha que menciona `BLOQUEADO_ATE_CORRECAO`, `BLOQUEANTE`, `FAIL` ou `PODE_AVANCAR_PARA_BK-MF8-18`.

3. Instruções do que fazer.

Abre `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`, procura a decisão final e identifica se existe um comando com resultado bloqueante. Se existir falha, copia o comando exato e a mensagem de erro mais relevante. Se não existir falha, regista que o relatório deste BK deve fechar com `SEM_CORRECAO_NECESSARIA`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo é uma leitura de evidência. A decisão técnica importante é não começar por alterar ficheiros: primeiro confirma-se o estado real deixado pelo BK anterior. Isto evita corrigir uma suspeita sem ligação ao comando que bloqueou a execução final.

6. Validação do passo.

O passo fica correto quando consegues responder por escrito a uma destas duas opções:

- houve erro bloqueante e o comando afetado é conhecido;
- não houve erro bloqueante e a evidência permite a decisão `SEM_CORRECAO_NECESSARIA`.

7. Cenário negativo/erro esperado.

Se `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` não existir, não avances. O BK-MF8-18 depende dessa evidência e não deve inventar o resultado da execução final.

### Passo 2 - Isolar a causa raiz

1. Objetivo funcional do passo no contexto da app.

Transformar a falha observada num diagnóstico concreto, para que a correção seja pequena e ligada ao erro real.

2. Ficheiros envolvidos:
    - REVER: ficheiro, teste, configuração ou relatório indicado pela mensagem de erro.
    - REVER: `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`
    - LOCALIZAÇÃO: primeira falha real do comando afetado.

3. Instruções do que fazer.

Parte do comando que falhou, não de uma suspeita vaga. Corre localmente apenas o comando afetado, lê a primeira falha real e identifica o ficheiro ou configuração que explica a falha. Antes de editar, escreve uma frase objetiva no formato: "A causa raiz é ...".

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque o passo ainda é analítico. O objetivo é impedir alterações largas no fim da MF8. A causa raiz deve explicar por que o comando falhou e que alteração mínima repõe o contrato esperado.

6. Validação do passo.

O passo fica validado quando a causa raiz aponta para um ficheiro ou decisão concreta e está ligada ao comando original. Se a causa raiz não explicar a primeira falha do comando, continua a investigação.

7. Cenário negativo/erro esperado.

Se correres outro comando e ele passar, isso não prova que o erro original ficou resolvido. O comando afetado continua a ser a referência obrigatória.

### Passo 3 - Criar o verificador do relatório de correção

1. Objetivo funcional do passo no contexto da app.

Criar uma validação automática para impedir que a equipa feche o MF8 com um relatório incompleto, com comando errado ou com uma decisão final não suportada pela evidência do BK-MF8-17.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/check-mf8-defect-report.mjs`
    - REVER: `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`
    - REVER: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria `apps/api/scripts/check-mf8-defect-report.mjs` com ES Modules. O script deve ler a execução final, ler o relatório de correção, validar secções obrigatórias, validar campos obrigatórios e aceitar apenas duas decisões: `CORRIGIDO_REVALIDADO` quando houve correção, ou `SEM_CORRECAO_NECESSARIA` quando a execução final já permitia fechar o MF8.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/scripts/check-mf8-defect-report.mjs
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, "../../..");

const FINAL_EXECUTION_PATH = join(
  PROJECT_ROOT,
  "docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md",
);

const DEFECT_REPORT_PATH = join(
  PROJECT_ROOT,
  "docs/evidence/MF8/CORRECAO-ERROS-REPORT.md",
);

const CORRECTED_DECISION = "CORRIGIDO_REVALIDADO";
const NO_CORRECTION_DECISION = "SEM_CORRECAO_NECESSARIA";
const NO_CORRECTION_COMMAND = "SEM_ERRO_BLOQUEANTE";
const NOT_APPLICABLE = "NAO_APLICAVEL";

const REQUIRED_SECTIONS = [
  "## Identificação",
  "## Erro observado",
  "## Causa raiz",
  "## Correção aplicada",
  "## Teste afetado reexecutado",
  "## Decisão final",
  "## Risco residual",
];

const REQUIRED_FIELDS = [
  "BK",
  "Requisito",
  "Fonte",
  "Comando original",
  "Resultado observado",
  "Causa raiz resumida",
  "Ficheiros corrigidos",
  "Correção aplicada",
  "Comando reexecutado",
  "Resultado da reexecução",
  "Decisão final",
  "Risco residual",
];

const ALLOWED_DECISIONS = [CORRECTED_DECISION, NO_CORRECTION_DECISION];
const PASS_MARKERS = ["PODE_AVANCAR_PARA_BK-MF8-18", "PASS"];
const BLOCKING_MARKERS = ["BLOQUEADO_ATE_CORRECAO", "BLOQUEANTE", "FAIL"];

/**
 * Lê um ficheiro obrigatório e devolve o seu conteúdo textual.
 *
 * @param {string} filePath Caminho absoluto do ficheiro a ler.
 * @param {string} label Nome humano usado nas mensagens de erro.
 * @returns {string} Conteúdo do ficheiro.
 * @throws {Error} Quando o ficheiro não existe ou está vazio.
 */
export function readRequiredFile(filePath, label) {
  if (!existsSync(filePath)) {
    throw new Error(`${label} não existe: ${filePath}`);
  }

  const content = readFileSync(filePath, "utf8").trim();

  if (content.length === 0) {
    throw new Error(`${label} existe, mas está vazio.`);
  }

  return content;
}

/**
 * Escapa texto para ser usado de forma segura numa expressão regular.
 *
 * @param {string} value Texto literal a escapar.
 * @returns {string} Texto pronto para usar numa expressão regular.
 */
export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Confirma que uma secção obrigatória existe no relatório.
 *
 * @param {string} report Conteúdo do relatório de correção.
 * @param {string} section Título da secção obrigatória.
 * @throws {Error} Quando a secção não existe.
 */
export function assertSection(report, section) {
  if (!report.includes(section)) {
    throw new Error(`Secção obrigatória em falta: ${section}`);
  }
}

/**
 * Extrai um campo escrito no formato "- Nome: valor".
 *
 * @param {string} report Conteúdo do relatório de correção.
 * @param {string} fieldName Nome do campo a procurar.
 * @returns {string} Valor textual do campo.
 * @throws {Error} Quando o campo não existe ou está vazio.
 */
export function extractField(report, fieldName) {
  const fieldPattern = new RegExp(
    `^- ${escapeRegExp(fieldName)}:\\s*(.+)$`,
    "mu",
  );
  const match = report.match(fieldPattern);

  if (!match || match[1].trim().length === 0) {
    throw new Error(`Campo obrigatório em falta: ${fieldName}`);
  }

  return match[1].trim();
}

/**
 * Confirma que o comando corrigido vem da execução final do BK-MF8-17.
 *
 * @param {string} finalExecution Conteúdo da evidência do BK-MF8-17.
 * @param {string} originalCommand Comando que falhou na execução final.
 * @throws {Error} Quando o comando não aparece na evidência original.
 */
export function assertOriginalCommandWasExecuted(finalExecution, originalCommand) {
  if (!finalExecution.includes(originalCommand)) {
    throw new Error(
      "O comando original não aparece em docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md.",
    );
  }
}

/**
 * Confirma que a decisão final pertence ao contrato deste BK.
 *
 * @param {string} decision Decisão extraída do relatório.
 * @throws {Error} Quando a decisão não é reconhecida.
 */
export function assertAllowedDecision(decision) {
  if (!ALLOWED_DECISIONS.includes(decision)) {
    throw new Error(
      `Decisão final inválida. Usa ${ALLOWED_DECISIONS.join(" ou ")}.`,
    );
  }
}

/**
 * Valida o ramo em que houve erro e correção efetiva.
 *
 * @param {string} finalExecution Conteúdo da evidência do BK-MF8-17.
 * @param {string} originalCommand Comando que falhou na execução final.
 * @param {string} rerunCommand Comando repetido depois da correção.
 * @param {string} rerunResult Resultado textual da reexecução.
 * @throws {Error} Quando o relatório não prova a correção do comando afetado.
 */
export function assertCorrectedPath(
  finalExecution,
  originalCommand,
  rerunCommand,
  rerunResult,
) {
  assertOriginalCommandWasExecuted(finalExecution, originalCommand);

  if (rerunCommand !== originalCommand) {
    throw new Error("O comando reexecutado deve ser igual ao comando original.");
  }

  if (!rerunResult.includes("PASS")) {
    throw new Error("O resultado da reexecução deve incluir PASS.");
  }
}

/**
 * Valida o ramo em que a execução final já não tinha erro bloqueante.
 *
 * @param {string} finalExecution Conteúdo da evidência do BK-MF8-17.
 * @param {string} originalCommand Valor do campo "Comando original".
 * @param {string} rerunCommand Valor do campo "Comando reexecutado".
 * @param {string} rerunResult Valor do campo "Resultado da reexecução".
 * @throws {Error} Quando a evidência não suporta a ausência de correção.
 */
export function assertNoCorrectionWasNeeded(
  finalExecution,
  originalCommand,
  rerunCommand,
  rerunResult,
) {
  if (originalCommand !== NO_CORRECTION_COMMAND) {
    throw new Error(`Sem correção, o comando original deve ser ${NO_CORRECTION_COMMAND}.`);
  }

  if (rerunCommand !== NOT_APPLICABLE || rerunResult !== NOT_APPLICABLE) {
    throw new Error(`Sem correção, usa ${NOT_APPLICABLE} na reexecução.`);
  }

  const hasPassMarker = PASS_MARKERS.some((marker) => finalExecution.includes(marker));
  const hasBlockingMarker = BLOCKING_MARKERS.some((marker) =>
    finalExecution.includes(marker),
  );

  // Este ramo só é seguro quando a própria evidência final já permite avançar.
  if (!hasPassMarker || hasBlockingMarker) {
    throw new Error(
      "A execução final não prova que era seguro fechar sem correção.",
    );
  }
}

/**
 * Valida a evidência de correção do BK-MF8-18.
 *
 * @returns {{ originalCommand: string, rerunCommand: string, decision: string }} Resumo validado.
 * @throws {Error} Quando a evidência não prova a correção do erro afetado.
 */
export function validateDefectReport() {
  const finalExecution = readRequiredFile(
    FINAL_EXECUTION_PATH,
    "Evidência da execução final",
  );
  const report = readRequiredFile(
    DEFECT_REPORT_PATH,
    "Relatório de correção de erros",
  );

  for (const section of REQUIRED_SECTIONS) {
    assertSection(report, section);
  }

  for (const fieldName of REQUIRED_FIELDS) {
    extractField(report, fieldName);
  }

  const source = extractField(report, "Fonte");
  const originalCommand = extractField(report, "Comando original");
  const rerunCommand = extractField(report, "Comando reexecutado");
  const rerunResult = extractField(report, "Resultado da reexecução");
  const decision = extractField(report, "Decisão final");

  if (source !== "docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md") {
    throw new Error("A fonte deve ser docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md.");
  }

  assertAllowedDecision(decision);

  if (decision === NO_CORRECTION_DECISION) {
    assertNoCorrectionWasNeeded(
      finalExecution,
      originalCommand,
      rerunCommand,
      rerunResult,
    );
  } else {
    // A correção só é aceite se partir do comando realmente registado no BK-MF8-17.
    assertCorrectedPath(finalExecution, originalCommand, rerunCommand, rerunResult);
  }

  return {
    originalCommand,
    rerunCommand,
    decision,
  };
}

const executedFileUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";

if (import.meta.url === executedFileUrl) {
  const result = validateDefectReport();
  console.log(
    `BK-MF8-18 validado: ${result.decision} (${result.rerunCommand})`,
  );
}
```

5. Explicação do código.

Este script começa por localizar a raiz do projeto a partir de `apps/api/scripts`, porque a evidência vive fora da pasta da API. As funções `readRequiredFile`, `assertSection` e `extractField` tornam a validação repetível: se faltar um ficheiro, uma secção ou um campo, o erro aparece de forma explícita.

O ramo `CORRIGIDO_REVALIDADO` exige que o comando original exista na evidência do BK-MF8-17, que o comando reexecutado seja igual ao original e que o resultado inclua `PASS`. Isto evita fechar o RNF39 com um comando diferente do que falhou.

O ramo `SEM_CORRECAO_NECESSARIA` existe para a situação em que o BK-MF8-17 já terminou com `PODE_AVANCAR_PARA_BK-MF8-18`. Nesse caso, o relatório usa `SEM_ERRO_BLOQUEANTE` e `NAO_APLICAVEL`, e o script rejeita o fecho se a evidência original ainda tiver marcadores bloqueantes.

6. Validação do passo.

Executa `cd apps/api && node --check scripts/check-mf8-defect-report.mjs`. O comando deve terminar sem erro de sintaxe.

7. Cenário negativo/erro esperado.

Se `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` não existir, o script deve falhar com uma mensagem a indicar que o relatório de correção está em falta.

### Passo 4 - Adicionar o comando npm de validação

1. Objetivo funcional do passo no contexto da app.

Expor o verificador como comando npm para que a equipa e a defesa consigam repetir a validação do relatório sem memorizar o caminho do script.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: propriedade `scripts`.

3. Instruções do que fazer.

Abre `apps/api/package.json`, preserva todos os scripts que já existirem e acrescenta apenas `"mf8:defect-report": "node scripts/check-mf8-defect-report.mjs"`. Os comandos `test:final:prepare` e `mf8:final-validation` vêm dos BKs anteriores e não devem ser removidos neste BK.

4. Código completo, correto e integrado com a app final.

```json
{
  "scripts": {
    "dev": "node src/server.js",
    "prisma:generate": "prisma generate",
    "prisma:validate": "prisma validate",
    "migration:precheck-mf0": "node scripts/precheck-mf0-migration.js",
    "syntax:check": "find src tests scripts -name '*.js' -print0 | xargs -0 -n 1 node --check",
    "test": "npm run test:unit && npm run test:contracts",
    "test:unit": "node --test tests/unit/*.test.js",
    "test:contracts": "node --test tests/contracts/*.test.js",
    "test:integration": "node --test tests/integration/*.test.js",
    "test:mf6:documents": "node scripts/check-mf6-document-performance.mjs",
    "test:mf6:concurrency": "node scripts/check-mf6-concurrency.mjs",
    "test:mf6:reconciliation": "node scripts/check-mf6-reconciliation-performance.mjs",
    "test:mf6:fifo": "node scripts/check-mf6-fifo-performance.mjs",
    "test:mf6:https": "node scripts/check-mf6-https.mjs",
    "test:mf6:bcrypt": "node scripts/check-mf6-bcrypt.mjs",
    "test:mf6:session-cookie": "node scripts/check-mf6-session-cookie.mjs",
    "test:mf6:hardening": "node scripts/check-mf6-hardening.mjs",
    "test:mf6:env": "node scripts/check-mf6-env.mjs",
    "test:mf6:audit": "node scripts/check-mf6-audit-gate.mjs",
    "test:mf6": "npm run test:mf6:documents && npm run test:mf6:concurrency && npm run test:mf6:reconciliation && npm run test:mf6:fifo && npm run test:mf6:https && npm run test:mf6:bcrypt && npm run test:mf6:session-cookie && npm run test:mf6:hardening && npm run test:mf6:env && npm run test:mf6:audit",
    "mf7:backup": "node scripts/run-daily-backup.mjs",
    "mf7:backup:verify": "node scripts/verify-backup-restore.mjs",
    "test:mf7:retention": "node --test tests/unit/retentionPolicy.test.js",
    "test:mf7:email": "node --test tests/contracts/mf7-email-contracts.test.js",
    "test:mf7:exports": "node --test tests/contracts/mf7-export-contracts.test.js",
    "test:mf7:imports": "node --test tests/contracts/mf7-import-contracts.test.js",
    "test:mf7:saft": "node --test tests/contracts/mf7-saft-contracts.test.js",
    "check:mf7:backend-modules": "node scripts/check-mf7-backend-modules.mjs",
    "test:mf7:critical-modules": "node --test tests/contracts/mf7-critical-modules.test.js",
    "test:mf7": "npm run test:mf7:retention && npm run test:mf7:email && npm run test:mf7:exports && npm run test:mf7:imports && npm run test:mf7:saft && npm run check:mf7:backend-modules && npm run test:mf7:critical-modules",
    "test:mf8:inventory": "node scripts/check-mf8-test-inventory.mjs",
    "test:mf8:inventory-contracts": "node --test tests/contracts/mf8-test-inventory-contracts.test.js",
    "test:mf8": "npm run test:mf8:inventory && npm run test:mf8:inventory-contracts",
    "test:final:prepare": "npm run syntax:check && npm run test:unit && npm run test:contracts && npm run test:integration && npm run test:mf6 && npm run test:mf7 && npm run test:mf8",
    "mf8:final-validation": "node scripts/run-mf8-final-validation.mjs",
    "mf8:defect-report": "node scripts/check-mf8-defect-report.mjs"
  }
}
```

5. Explicação do código.

O bloco mostra a propriedade `scripts` preservada e acrescenta apenas o comando novo deste BK. Os scripts de MF6, MF7, inventário MF8 e execução final continuam presentes porque foram criados ou consumidos pelos BKs anteriores. A linha `mf8:defect-report` chama o verificador criado no passo 3 e não substitui `mf8:final-validation`.

6. Validação do passo.

Executa `cd apps/api && npm run mf8:defect-report` depois de criares a evidência. Se o script ainda não existir ou se o JSON estiver inválido, o npm deve falhar antes de validar o relatório.

7. Cenário negativo/erro esperado.

Remove a linha `mf8:defect-report` apenas numa cópia local de teste. O comando `npm run mf8:defect-report` deve falhar por script inexistente. Volta a repor a linha antes de fechar o BK.

### Passo 5 - Criar a evidência de correção

1. Objetivo funcional do passo no contexto da app.

Criar a evidência final deste BK com uma decisão auditável: correção revalidada quando houve erro, ou ausência de correção necessária quando a execução final já estava limpa.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
    - REVER: `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`
    - LOCALIZAÇÃO: ficheiro completo da evidência final.

3. Instruções do que fazer.

Cria `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`. Se houve erro, escreve o comando original exatamente como aparece na execução final, descreve a causa raiz, lista os ficheiros corrigidos e regista o comando reexecutado. Se não houve erro, usa os valores `SEM_ERRO_BLOQUEANTE`, `NAO_APLICAVEL` e decisão `SEM_CORRECAO_NECESSARIA`.

4. Código completo, correto e integrado com a app final.

```md
# Correção de erros MF8

## Identificação

- BK: BK-MF8-18
- Requisito: RNF39
- Fonte: docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md

## Erro observado

- Comando original: npm run mf8:final-validation
- Resultado observado: FAIL
- Impacto: a execução final do MF8 não podia ser fechada.

## Causa raiz

- Causa raiz resumida: o contrato validado pelo comando final não estava alinhado com a implementação corrigida.

## Correção aplicada

- Ficheiros corrigidos: caminhos reais alterados pela equipa
- Correção aplicada: ajuste mínimo que repõe o contrato esperado pelo teste afetado.

## Teste afetado reexecutado

- Comando reexecutado: npm run mf8:final-validation
- Resultado da reexecução: PASS

## Decisão final

- Decisão final: CORRIGIDO_REVALIDADO

## Risco residual

- Risco residual: sem risco residual conhecido depois da reexecução do comando afetado.
```

5. Explicação do código.

Este bloco Markdown é o formato do relatório de evidência. A secção `Erro observado` liga o BK-MF8-18 ao resultado do BK-MF8-17. A secção `Correção aplicada` impede que a equipa diga apenas "corrigido" sem explicar que ficheiro mudou. A secção `Teste afetado reexecutado` prova o RNF39 porque repete o comando que falhou.

Se a execução final não tiver erro bloqueante, mantém as mesmas secções e usa estes valores: `Comando original: SEM_ERRO_BLOQUEANTE`, `Resultado observado: PASS`, `Causa raiz resumida: SEM_CORRECAO_NECESSARIA`, `Ficheiros corrigidos: NAO_APLICAVEL`, `Correção aplicada: NAO_APLICAVEL`, `Comando reexecutado: NAO_APLICAVEL`, `Resultado da reexecução: NAO_APLICAVEL`, `Decisão final: SEM_CORRECAO_NECESSARIA`.

6. Validação do passo.

Confirma que todas as secções existem e que os valores não são genéricos. Se houve correção, `Ficheiros corrigidos` deve conter apenas caminhos reais alterados pela equipa.

7. Cenário negativo/erro esperado.

Se o relatório disser `CORRIGIDO_REVALIDADO`, mas `Comando reexecutado` for diferente de `Comando original`, o verificador deve falhar.

### Passo 6 - Validar a correção

1. Objetivo funcional do passo no contexto da app.

Provar que o script novo compila, que o comando final do BK-MF8-17 foi executado novamente e que o relatório do BK-MF8-18 é coerente com a evidência.

2. Ficheiros envolvidos:
    - EXECUTAR: `apps/api/scripts/check-mf8-defect-report.mjs`
    - EXECUTAR: `apps/api/scripts/run-mf8-final-validation.mjs`
    - REVER: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
    - LOCALIZAÇÃO: terminal em `apps/api`.

3. Instruções do que fazer.

Entra em `apps/api`, valida a sintaxe do novo script, executa `npm run mf8:final-validation`, atualiza a evidência conforme o resultado e só depois executa `npm run mf8:defect-report`. Se o verificador falhar, corrige a evidência antes de fechar o BK.

4. Código completo, correto e integrado com a app final.

```bash
cd apps/api
node --check scripts/check-mf8-defect-report.mjs
npm run mf8:final-validation
npm run mf8:defect-report
```

5. Explicação do código.

O primeiro comando entra na API porque os scripts npm vivem em `apps/api/package.json`. O `node --check` deteta erros de sintaxe no verificador sem executar a lógica. O `npm run mf8:final-validation` recria a evidência da execução final do BK-MF8-17. O `npm run mf8:defect-report` valida a decisão final deste BK contra essa evidência.

6. Validação do passo.

O passo fica correto quando `node --check` passa, `npm run mf8:final-validation` produz uma decisão coerente e `npm run mf8:defect-report` aceita o relatório final.

7. Cenário negativo/erro esperado.

Se o relatório final tiver `Decisão final: SEM_CORRECAO_NECESSARIA`, mas a execução final tiver `BLOQUEADO_ATE_CORRECAO`, o verificador deve falhar.

### Passo 7 - Fazer o handoff final do MF8

1. Objetivo funcional do passo no contexto da app.

Fechar o MF8 com uma decisão clara e com evidência suficiente para PR ou defesa.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
    - REVER: `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`
    - LOCALIZAÇÃO: secções `## Decisão final` e `## Risco residual`.

3. Instruções do que fazer.

Confirma que `npm run mf8:defect-report` passou, que a evidência final existe e que a decisão é `CORRIGIDO_REVALIDADO` ou `SEM_CORRECAO_NECESSARIA`. Atualiza o teu quadro de trabalho e prepara a explicação para a defesa. Indica que não existe próximo BK dentro da MF8.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo é de handoff. A saída técnica já foi produzida pelos passos anteriores; aqui apenas se confirma que a evidência é apresentável e que a MF8 fica fechada sem erro pendente.

6. Validação do passo.

O handoff está pronto quando o relatório final contém a decisão, o risco residual e o resultado de `npm run mf8:defect-report`.

7. Cenário negativo/erro esperado.

Se a decisão final estiver ausente ou usar outro valor, o BK não deve ser considerado concluído.

#### Critérios de aceite

- `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` existe.
- `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` existe.
- O relatório de correção usa `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` como fonte.
- Se houve erro bloqueante, o relatório identifica o comando original que falhou.
- Se houve erro bloqueante, o comando reexecutado é igual ao comando original.
- Se houve erro bloqueante, o resultado da reexecução inclui `PASS`.
- Se não houve erro bloqueante, o relatório usa `SEM_ERRO_BLOQUEANTE`, `NAO_APLICAVEL` e decisão `SEM_CORRECAO_NECESSARIA`.
- A decisão final é `CORRIGIDO_REVALIDADO` ou `SEM_CORRECAO_NECESSARIA`.
- `apps/api/scripts/check-mf8-defect-report.mjs` tem JSDoc nas funções principais.
- `node --check scripts/check-mf8-defect-report.mjs` passa.
- `npm run mf8:final-validation` é executado antes do verificador do relatório.
- `npm run mf8:defect-report` passa.
- Não existem dados sensíveis no relatório.
- A correção altera apenas os ficheiros necessários para resolver o erro observado.
- O BK não fecha a execução final com erro pendente.
- Existem pelo menos dois cenários negativos considerados:
  - relatório de correção inexistente;
  - comando reexecutado diferente do comando original.

#### Validação final

Executa:

```bash
cd apps/api
node --check scripts/check-mf8-defect-report.mjs
npm run mf8:final-validation
npm run mf8:defect-report
npm run test:contracts
```

Explicação do código.

Este bloco valida primeiro a sintaxe do script novo, depois reexecuta a validação final do BK-MF8-17, valida o relatório deste BK e fecha com contratos da API. A ordem é importante: o relatório só deve ser aceite depois de existir uma execução final atualizada.

Depois volta à raiz do projeto e confirma a evidência:

```bash
cd ../..
rg -n "CORRIGIDO_REVALIDADO|SEM_CORRECAO_NECESSARIA|Comando original|Comando reexecutado|Resultado da reexecução" docs/evidence/MF8/CORRECAO-ERROS-REPORT.md
git diff --check
bash scripts/validate-planificacao.sh
```

Explicação do código.

O `rg` confirma que a evidência final tem os campos e uma decisão permitida. O `git diff --check` evita whitespace ou marcas de conflito. O validador de planificação confirma que a documentação continua coerente com a matriz de BKs.

Resultado esperado:

- `node --check` sem erros.
- `npm run mf8:final-validation` executado e refletido na evidência.
- `npm run mf8:defect-report` com decisão `CORRIGIDO_REVALIDADO` ou `SEM_CORRECAO_NECESSARIA`.
- `npm run test:contracts` sem falhas.
- `rg` encontra os campos essenciais da evidência.
- `git diff --check` sem erros.
- `bash scripts/validate-planificacao.sh` sem erros críticos associados ao BK-MF8-18.

#### Evidence para PR/defesa

Inclui no PR ou na defesa:

- Caminho da evidência final: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`.
- Comando original que falhou, ou `SEM_ERRO_BLOQUEANTE`.
- Causa raiz resumida, ou `SEM_CORRECAO_NECESSARIA`.
- Ficheiros corrigidos, ou `NAO_APLICAVEL`.
- Comando reexecutado, ou `NAO_APLICAVEL`.
- Resultado de `npm run mf8:final-validation`.
- Resultado de `npm run mf8:defect-report`.
- Resultado de `npm run test:contracts`.
- Confirmação de que RNF39 ficou validado.

Exemplo de resumo aceitável:

```md
BK-MF8-18 corrigiu o erro bloqueante encontrado na execução final do MF8.
O comando original foi reexecutado depois da correção e passou.
A evidência está em docs/evidence/MF8/CORRECAO-ERROS-REPORT.md.
Decisão final: CORRIGIDO_REVALIDADO.
```

Explicação do código.

Este bloco Markdown é um resumo curto para PR ou defesa. Se a execução final não tiver erro bloqueante, troca a primeira frase por "BK-MF8-18 confirmou que não havia correção necessária depois da execução final do MF8" e usa `Decisão final: SEM_CORRECAO_NECESSARIA`.

#### Handoff

- Handoff para: encerramento do MF8.
- Evidência a entregar: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`.
- Comando mínimo a demonstrar: `cd apps/api && npm run mf8:final-validation && npm run mf8:defect-report`.
- Próximo BK recomendado: `-`.

#### Changelog

- 2026-07-03: corrigida a estrutura dos passos para o formato 1 a 7, adicionadas explicações após todos os blocos de código, criado o ramo `SEM_CORRECAO_NECESSARIA`, tornado o exemplo de `package.json` aditivo e alinhada a validação final com `mf8:final-validation`.
- 2026-07-03: corrigido o guia para exigir um relatório único de correção, validar a ligação com `EXECUCAO-FINAL-TESTES.md`, adicionar JSDoc ao verificador, reexecutar o comando afetado e fechar RNF39 com evidência verificável.
- 2026-06-30: versão inicial do guia BK-MF8-18.
