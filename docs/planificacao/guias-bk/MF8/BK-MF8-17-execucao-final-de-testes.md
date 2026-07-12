# BK-MF8-17 - Execução final de testes.

## Header

- `doc_id`: `GUIA-BK-MF8-17`
- `bk_id`: `BK-MF8-17`
- `macro`: `MF8`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-16`
- `rf_rnf`: `RNF38`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-18`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-17-execucao-final-de-testes.md`
- `last_updated`: `2026-07-10`

#### Gate final atualizado

Executa migrations desde zero, API, integração, Redis, SMTP, S3, restore, concorrência, SAF-T, web, Playwright/axe, carga, health, audits, builds e validadores documentais. O gate documental pode devolver `documentation_sync_pass=true` enquanto `overall_pass=false` por blockers runtime legítimos. Nenhum comando ignorado ou browser não iniciado é convertido em sucesso; o defect report continua fail-closed enquanto a decisão global for `NO_GO`.

#### Objetivo

Neste BK vais executar a bateria final de testes preparada no `BK-MF8-16`, guardar evidence única da execução e decidir se a equipa pode avançar para correção de erros no `BK-MF8-18`.

#### Importância

A execução final é a prova antes da entrega/defesa. Neste ponto, a equipa deixa de dizer "está pronto" e passa a mostrar comandos reais, resultados observados, falhas bloqueantes e decisão documentada.

#### Scope-in

- Rever a evidence criada no `BK-MF8-16`.
- Criar `apps/api/scripts/run-mf8-final-validation.mjs`.
- Ligar `npm run mf8:final-validation` no `apps/api/package.json`.
- Executar a bateria API `test:final:prepare`.
- Executar a bateria web `test:final:prepare`.
- Executar o validador de planificação.
- Gerar `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`.
- Classificar falhas como bloqueantes ou não bloqueantes.
- Entregar handoff objetivo para `BK-MF8-18`.

#### Scope-out

- Corrigir bugs encontrados na execução final.
- Alterar contratos de testes criados no `BK-MF8-16`.
- Apagar falhas do relatório para fazer a entrega parecer verde.
- Criar novos módulos funcionais.
- Prometer integrações externas não documentadas.
- Fazer commits automáticos.

#### Estado antes e depois

- Antes: `BK-MF8-16` deixou uma bateria base para execução final: `test:final:prepare` na API, `test:final:prepare` na web, inventário MF8, evidence `TESTES-EM-FALTA.md` e regra de falha quando houver `LACUNA`.
- Depois: `BK-MF8-17` entrega um orquestrador final, um script npm, uma evidence Markdown única e uma decisão clara para o `BK-MF8-18` corrigir apenas falhas observadas.

#### Pre-requisitos

- Ler `RNF38` em `docs/RNF.md`.
- Rever a linha de `BK-MF8-17` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF8-17` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever `docs/evidence/MF8/TESTES-EM-FALTA.md`, criado no `BK-MF8-16`.
- Confirmar que `apps/api/package.json` tem `test:final:prepare`.
- Confirmar que `apps/web/package.json` tem `test:final:prepare`.
- Confirmar que todos os caminhos publicados aos alunos usam `apps/api`, `apps/web` ou `docs/evidence`.
- Negativos: mínimo `2`.

#### Glossário

- Execução final: conjunto de comandos que prova a app antes da entrega/defesa.
- Bateria final: sequência mínima de gates API, gates web e validação documental.
- Falha bloqueante: erro que impede avançar para defesa sem correção.
- Falha não bloqueante: aviso registado com impacto baixo e decisão justificada.
- Evidence: ficheiro Markdown com comandos, resultados reais, falhas e decisão.
- Handoff: informação que o próximo BK consome sem voltar a adivinhar o contrato.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF38` exige uma execução final de testes antes da entrega/defesa.
- `CANONICO`: `BK-MF8-17` pertence à MF8, sprint `S12`, owner `Andre`, apoio `Oleksii`, prioridade `P1`, depende de `BK-MF8-16` e entrega handoff para `BK-MF8-18`.
- `CANONICO`: a app dos alunos usa Node.js, Express, ES Modules, Prisma, React, Vite e TypeScript nos caminhos públicos `apps/api` e `apps/web`.
- `CANONICO`: o backend deve resolver autenticação, permissões e contexto multiempresa; a execução final não pode validar apenas UI.
- `DERIVADO`: a execução final junta API, web e planificação porque a defesa avalia a aplicação como produto completo, não como ficheiros isolados.
- `DERIVADO`: uma falha de `test:final:prepare` deve bloquear a decisão final, porque esse comando foi criado no `BK-MF8-16` para representar a bateria acumulada.

Uma execução final profissional deve ser reproduzível. Se outro colega correr os mesmos comandos no mesmo estado do projeto, deve obter a mesma decisão ou conseguir explicar a diferença com base no output registado.

Este BK não corrige os erros. Ele mede, regista e encaminha. A correção pertence ao `BK-MF8-18`, onde a equipa identifica causa raiz e reexecuta apenas os testes afetados.

#### Arquitetura do BK

- Requisito: `RNF38`.
- Domínio principal: qualidade final e evidence.
- Backend público dos alunos: `apps/api`.
- Frontend público dos alunos: `apps/web`.
- Evidence de entrada: `docs/evidence/MF8/TESTES-EM-FALTA.md`.
- Evidence de saída: `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`.
- Script principal: `apps/api/scripts/run-mf8-final-validation.mjs`.
- Script npm: `apps/api/package.json` com `mf8:final-validation`.
- Bateria API: `cd apps/api && npm run test:final:prepare`.
- Bateria web: `cd apps/web && npm run test:final:prepare`.
- Validação documental: `bash scripts/validate-planificacao.sh`.
- Handoff: `BK-MF8-18`.

A decisão técnica é colocar o orquestrador em `apps/api/scripts` porque a API já concentra scripts de qualidade e tem acesso simples à raiz da app através de `../..`. Mesmo assim, o script executa a web com `cwd` próprio, para não misturar dependências nem comandos.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/scripts/run-mf8-final-validation.mjs`
- EDITAR: `apps/api/package.json`
- REVER: `apps/web/package.json`
- REVER: `docs/evidence/MF8/TESTES-EM-FALTA.md`
- CRIAR OU RECRIAR: `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`
- REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-18-correcao-dos-erros-encontrados-e-reexecucao-dos-testes-afetados.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico

1. Objetivo funcional do passo no contexto da app.

Confirmar que a equipa está a resolver `RNF38` e não a repetir o inventário do `BK-MF8-16` nem a antecipar a correção do `BK-MF8-18`.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`

3. Instruções do que fazer.

Confirma que `BK-MF8-17` continua associado a `RNF38`, prioridade `P1`, owner `Andre`, apoio `Oleksii`, dependência `BK-MF8-16` e próximo BK `BK-MF8-18`.

Confirma também que `BK-MF8-16` já definiu os comandos base. Se essa evidence ainda não existir, volta ao BK anterior antes de executar este BK.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Esta verificação protege a sequência pedagógica da MF8.

5. Explicação do código.

Não há código porque o objetivo é validar contrato e dependências. Uma execução final sem contrato confirmado pode medir comandos errados e criar evidence inútil para a defesa.

6. Validação do passo.

O aluno consegue apontar:

- `RNF38` como requisito deste BK;
- `BK-MF8-16` como origem da bateria final;
- `BK-MF8-18` como destino das falhas encontradas;
- `docs/evidence/MF8/TESTES-EM-FALTA.md` como evidence de entrada.

7. Cenário negativo/erro esperado.

Se a matriz indicar outro requisito, outro owner ou outra dependência, para antes de editar ficheiros. Esse drift deve ser resolvido nos documentos canónicos, não contornado neste BK.

### Passo 2 - Rever a evidence de entrada do BK-MF8-16

1. Objetivo funcional do passo no contexto da app.

Garantir que a execução final parte de uma bateria preparada, com lacunas conhecidas e comandos definidos.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF8/TESTES-EM-FALTA.md`
    - REVER: `apps/api/package.json`
    - REVER: `apps/web/package.json`

3. Instruções do que fazer.

Abre `docs/evidence/MF8/TESTES-EM-FALTA.md` e confirma que existem resultados para:

- `cd apps/api && npm run test:mf8:inventory`;
- `cd apps/api && npm run test:mf8:inventory-contracts`;
- `cd apps/api && npm run test:final:prepare`;
- `cd apps/web && npm run test:final:prepare`.

Depois confirma que `apps/api/package.json` e `apps/web/package.json` contêm `test:final:prepare`. Este BK não deve inventar comandos novos para substituir a bateria criada no BK anterior.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Esta revisão é uma precondição operacional.

5. Explicação do código.

Não há código porque a decisão importante é de fluxo: `BK-MF8-17` consome evidence anterior. Se a evidence do `BK-MF8-16` disser que ainda há lacunas bloqueantes, a execução final deve falhar ou ficar bloqueada até a equipa decidir o que corrigir.

6. Validação do passo.

O aluno consegue responder:

- que comando executa a bateria API;
- que comando executa a bateria web;
- que lacunas impedem a execução final;
- que lacunas foram justificadas e aceites.

7. Cenário negativo/erro esperado.

Se `docs/evidence/MF8/TESTES-EM-FALTA.md` não existir, `run-mf8-final-validation.mjs` deve terminar com erro antes de correr comandos. Isso impede que a equipa faça uma execução final sem inventário prévio.

### Passo 3 - Criar o orquestrador final

1. Objetivo funcional do passo no contexto da app.

Criar um script repetível que executa a bateria final, guarda output real e falha quando alguma validação obrigatória falha.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/run-mf8-final-validation.mjs`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria `apps/api/scripts/run-mf8-final-validation.mjs` com o código completo abaixo.

O script deve ser executado a partir de `apps/api`, porque é aí que o comando npm será registado. Ele calcula a raiz do projeto, valida a evidence de entrada do `BK-MF8-16`, corre API, corre web, corre planificação e escreve `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Orquestrador da execução final de testes da MF8.
 *
 * Este script cumpre o contrato do BK-MF8-17: executar a bateria final
 * preparada no BK-MF8-16, guardar evidence Markdown e bloquear a entrega
 * quando existir falha em API, web ou planificação.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const apiRoot = process.cwd();
const repoRoot = resolve(apiRoot, "../..");
const webRoot = resolve(repoRoot, "apps/web");
const evidencePath = resolve(repoRoot, "docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md");
const testInventoryEvidencePath = resolve(repoRoot, "docs/evidence/MF8/TESTES-EM-FALTA.md");

const requiredPreconditions = [
    {
        label: "Evidence de testes em falta criada no BK-MF8-16",
        path: testInventoryEvidencePath,
        expected: "O ficheiro existe antes da execução final."
    }
];

const finalCommands = [
    {
        area: "API",
        command: "npm",
        args: ["run", "test:final:prepare"],
        cwd: apiRoot,
        expected: "syntax, unitários, contratos, integração, MF6, MF7 e MF8 sem falhas."
    },
    {
        area: "WEB",
        command: "npm",
        args: ["run", "test:final:prepare"],
        cwd: webRoot,
        expected: "gates frontend, typecheck e build sem falhas."
    },
    {
        area: "PLANIFICACAO",
        command: "bash",
        args: ["scripts/validate-planificacao.sh"],
        cwd: repoRoot,
        expected: "documentation_sync_pass=true; overall_pass reflete separadamente blockers runtime."
    }
];

/**
 * Converte comando e argumentos numa string legível para evidence.
 *
 * @param {{ command: string, args: string[] }} commandSpec - Comando a formatar.
 * @returns {string} Comando completo para mostrar no relatório.
 */
function formatCommand(commandSpec) {
    return [commandSpec.command, ...commandSpec.args].join(" ");
}

/**
 * Lê uma amostra curta do ficheiro de entrada para facilitar a auditoria.
 *
 * @param {string} filePath - Caminho absoluto do ficheiro a ler.
 * @returns {string} Primeiras linhas relevantes do ficheiro, ou aviso de ausência.
 */
function readPreview(filePath) {
    if (!existsSync(filePath)) {
        return "Ficheiro ausente.";
    }

    return readFileSync(filePath, "utf8")
        .split("\n")
        .slice(0, 12)
        .join("\n")
        .trim();
}

/**
 * Valida se os ficheiros obrigatórios existem antes de iniciar a bateria final.
 *
 * @returns {{ ok: boolean, checks: Array<{ label: string, path: string, expected: string, observed: string, decision: string }> }} Resultado das precondições.
 */
function validatePreconditions() {
    const checks = requiredPreconditions.map((item) => {
        const exists = existsSync(item.path);

        return {
            label: item.label,
            path: item.path,
            expected: item.expected,
            observed: exists ? "Encontrado." : "Ausente.",
            decision: exists ? "OK" : "BLOQUEANTE"
        };
    });

    return {
        ok: checks.every((check) => check.decision === "OK"),
        checks
    };
}

/**
 * Executa um comando da bateria final e preserva stdout/stderr para evidence.
 *
 * @param {{ area: string, command: string, args: string[], cwd: string, expected: string }} commandSpec - Comando a executar.
 * @returns {{ area: string, command: string, cwd: string, expected: string, status: number, stdout: string, stderr: string, decision: string }} Resultado observado.
 */
function runFinalCommand(commandSpec) {
    // Cada comando corre no seu diretório para respeitar dependências e scripts próprios de API/web.
    const result = spawnSync(commandSpec.command, commandSpec.args, {
        cwd: commandSpec.cwd,
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 20
    });

    const status = typeof result.status === "number" ? result.status : 1;

    return {
        area: commandSpec.area,
        command: formatCommand(commandSpec),
        cwd: commandSpec.cwd,
        expected: commandSpec.expected,
        status,
        stdout: result.stdout?.trim() ?? "",
        stderr: result.stderr?.trim() || result.error?.message || "",
        decision: status === 0 ? "OK" : "BLOQUEANTE"
    };
}

/**
 * Escapa quebras de linha para manter a tabela Markdown legível.
 *
 * @param {string} value - Texto original.
 * @returns {string} Texto compacto para tabela.
 */
function compactCell(value) {
    const clean = value.replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
    return clean.length > 1800 ? `${clean.slice(0, 1800)}...` : clean;
}

/**
 * Gera a evidence Markdown da execução final.
 *
 * @param {object} report - Dados observados.
 * @param {string} report.generatedAt - Data ISO da execução.
 * @param {{ ok: boolean, checks: Array<object> }} report.preconditions - Resultado das precondições.
 * @param {Array<object>} report.results - Resultados dos comandos.
 * @returns {string} Conteúdo Markdown final.
 */
function buildEvidenceMarkdown({ generatedAt, preconditions, results }) {
    const finalDecision = preconditions.ok && results.every((result) => result.decision === "OK")
        ? "PODE_AVANCAR_PARA_BK-MF8-18"
        : "BLOQUEADO_ATE_CORRECAO";

    const lines = [
        "# Execução final de testes MF8",
        "",
        "## Identificação",
        "",
        "- BK: BK-MF8-17",
        "- Requisito: RNF38",
        "- Data/hora: " + generatedAt,
        "- Evidence de entrada: `docs/evidence/MF8/TESTES-EM-FALTA.md`",
        "- Decisão final: `" + finalDecision + "`",
        "",
        "## Precondições",
        "",
        "| Verificação | Resultado esperado | Resultado observado | Decisão |",
        "| --- | --- | --- | --- |"
    ];

    for (const check of preconditions.checks) {
        lines.push(`| ${check.label} | ${check.expected} | ${check.observed} | ${check.decision} |`);
    }

    lines.push(
        "",
        "## Resumo da evidence do BK-MF8-16",
        "",
        "```md",
        readPreview(testInventoryEvidencePath),
        "```",
        "",
        "## Comandos executados",
        "",
        "| Área | Diretório | Comando | Resultado esperado | Exit code | Decisão |",
        "| --- | --- | --- | --- | ---: | --- |"
    );

    for (const result of results) {
        lines.push(
            `| ${result.area} | \`${result.cwd}\` | \`${result.command}\` | ${result.expected} | ${result.status} | ${result.decision} |`
        );
    }

    lines.push("", "## Output observado");

    for (const result of results) {
        lines.push(
            "",
            "### " + result.area + " - " + result.command,
            "",
            "- Diretório: `" + result.cwd + "`",
            "- Exit code: `" + result.status + "`",
            "- Decisão: `" + result.decision + "`",
            "",
            "#### stdout",
            "",
            "```text",
            compactCell(result.stdout || "Sem stdout."),
            "```",
            "",
            "#### stderr",
            "",
            "```text",
            compactCell(result.stderr || "Sem stderr."),
            "```"
        );
    }

    lines.push(
        "",
        "## Cenários negativos",
        "",
        "| Cenário | Resultado esperado | Decisão |",
        "| --- | --- | --- |",
        "| `TESTES-EM-FALTA.md` ausente | Script termina antes da bateria final com decisão `BLOQUEANTE`. | Coberto por precondição. |",
        "| `test:final:prepare` falha na API ou na web | Evidence regista exit code diferente de zero e decisão `BLOQUEANTE`. | Coberto por execução real. |",
        "",
        "## Handoff para BK-MF8-18",
        "",
        "- Se a decisão final for `PODE_AVANCAR_PARA_BK-MF8-18`, o próximo BK só precisa verificar se não há falhas residuais.",
        "- Se a decisão final for `BLOQUEADO_ATE_CORRECAO`, o próximo BK deve começar pelo primeiro comando com decisão `BLOQUEANTE`.",
        "- Nunca apagar outputs antigos sem guardar a nova execução.",
        "",
        "## Decisão",
        "",
        "Decisão final: `" + finalDecision + "`",
        ""
    );

    return lines.join("\n");
}

/**
 * Executa a validação final e escreve o ficheiro de evidence.
 *
 * @returns {{ ok: boolean, evidencePath: string }} Resultado da execução final.
 */
function runFinalValidation() {
    const generatedAt = new Date().toISOString();
    const preconditions = validatePreconditions();
    const results = preconditions.ok ? finalCommands.map(runFinalCommand) : [];
    const markdown = buildEvidenceMarkdown({ generatedAt, preconditions, results });

    // A pasta de evidence pode ainda não existir numa instalação limpa dos alunos.
    mkdirSync(dirname(evidencePath), { recursive: true });
    writeFileSync(evidencePath, markdown, "utf8");

    return {
        ok: preconditions.ok && results.every((result) => result.decision === "OK"),
        evidencePath
    };
}

const execution = runFinalValidation();

if (!execution.ok) {
    console.error(`Execução final bloqueada. Consulta ${execution.evidencePath}.`);
    process.exitCode = 1;
} else {
    console.log(`Execução final concluída. Evidence: ${execution.evidencePath}`);
}
```

5. Explicação do código.

Este ficheiro transforma `RNF38` num contrato executável. A entrada é o estado atual da app e a evidence `TESTES-EM-FALTA.md` criada no `BK-MF8-16`. A saída é `EXECUCAO-FINAL-TESTES.md`, com precondições, comandos, outputs e decisão final.

`validatePreconditions` impede que a equipa salte o inventário anterior. `runFinalCommand` executa cada comando no diretório correto, para que a API use os seus scripts e a web use os seus scripts. `buildEvidenceMarkdown` gera um relatório legível para PR/defesa. `runFinalValidation` grava a evidence e devolve sucesso apenas quando todas as precondições e comandos passam.

A regra de segurança deste BK é indireta mas importante: a bateria final inclui testes e gates já criados para autenticação, permissões, contexto multiempresa, auditoria, IA explicável, hardening e frontend. Assim, a execução final não substitui validações de domínio por uma verificação superficial.

O erro evitado é declarar a aplicação pronta apenas porque `test:contracts` passou. A app OPSA é full-stack; por isso a decisão final tem de incluir API, web, build e planificação.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check scripts/run-mf8-final-validation.mjs
```

Resultado esperado:

- o ficheiro não tem erro de sintaxe;
- os imports usam apenas módulos nativos de Node.js;
- não há dependências externas novas;
- o ficheiro não contém caminhos privados.

7. Cenário negativo/erro esperado.

Remove temporariamente `docs/evidence/MF8/TESTES-EM-FALTA.md` numa cópia local. O script deve criar `EXECUCAO-FINAL-TESTES.md` com precondição `BLOQUEANTE` e terminar com exit code `1`.

### Passo 4 - Ligar o comando no package da API

1. Objetivo funcional do passo no contexto da app.

Tornar a execução final acessível por comando npm estável, sem obrigar o aluno a memorizar o caminho do ficheiro.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/package.json`
    - REVER: `apps/web/package.json`

3. Instruções do que fazer.

Em `apps/api/package.json`, preserva os scripts existentes e acrescenta `mf8:final-validation`. Se o bloco `scripts` já incluir `test:final:prepare` vindo do `BK-MF8-16`, mantém esse comando.

Não edites `apps/web/package.json` neste BK, salvo se o `BK-MF8-16` ainda não tiver materializado `test:final:prepare`. Neste guia, o frontend é consumido pela bateria final, não redefinido.

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
    "mf8:final-validation": "node scripts/run-mf8-final-validation.mjs"
  }
}
```

5. Explicação do código.

O novo comando `mf8:final-validation` chama o script criado no passo anterior. Ele não substitui `test:final:prepare`; ele orquestra `test:final:prepare` da API, `test:final:prepare` da web e `validate-planificacao.sh`.

O bloco preserva os scripts anteriores para não quebrar contratos de MF0 a MF7. A linha nova fica no fim da sequência de qualidade, porque depende dos scripts de preparação já existentes.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run mf8:final-validation
```

Resultado esperado:

- se tudo passar, o comando termina com exit code `0`;
- se alguma bateria falhar, o comando termina com exit code `1`;
- em ambos os casos, `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` é gerado.

7. Cenário negativo/erro esperado.

Remove temporariamente a linha `mf8:final-validation` do `package.json` numa cópia local. O comando `npm run mf8:final-validation` deve falhar por script inexistente. Essa falha prova porque este passo é obrigatório.

### Passo 5 - Executar a bateria final e classificar falhas

1. Objetivo funcional do passo no contexto da app.

Executar a validação final de forma reproduzível e decidir se há bloqueios para corrigir no `BK-MF8-18`.

2. Ficheiros envolvidos:
    - EXECUTAR: `apps/api/scripts/run-mf8-final-validation.mjs`
    - CRIAR OU RECRIAR: `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`
    - REVER: `docs/evidence/MF8/TESTES-EM-FALTA.md`

3. Instruções do que fazer.

Executa o comando principal a partir de `apps/api`.

```bash
cd apps/api
npm run mf8:final-validation
```

Depois abre `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` e confirma a decisão final:

- `PODE_AVANCAR_PARA_BK-MF8-18`: todos os comandos obrigatórios passaram;
- `BLOQUEADO_ATE_CORRECAO`: pelo menos uma precondição ou comando falhou.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo. O código executado é o script completo criado no Passo 3.

5. Explicação do código.

Este passo usa o orquestrador em vez de correr comandos soltos. Assim, a evidence não depende de memória humana nem de copiar outputs manualmente de três terminais diferentes.

A decisão de classificar cada falha como `BLOQUEANTE` evita uma armadilha comum: tratar um comando vermelho como simples aviso. Na execução final, falha em API, web ou planificação bloqueia a entrega até haver correção ou justificação explícita.

6. Validação do passo.

Confirma que a evidence contém:

- secção `Precondições`;
- secção `Comandos executados`;
- secção `Output observado`;
- secção `Cenários negativos`;
- secção `Handoff para BK-MF8-18`;
- decisão final.

7. Cenário negativo/erro esperado.

Se `apps/web/package.json` não tiver `test:final:prepare`, a etapa web deve falhar e aparecer como `BLOQUEANTE` na evidence. Não edites a evidence para esconder a falha; corrige a causa no BK certo.

### Passo 6 - Rever segurança, domínio e evidence

1. Objetivo funcional do passo no contexto da app.

Garantir que a execução final não validou apenas sintaxe, mas também preservou os contratos críticos da aplicação OPSA.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`
    - REVER: `docs/evidence/MF8/TESTES-EM-FALTA.md`
    - REVER: outputs dos comandos executados

3. Instruções do que fazer.

Revê a evidence e confirma se a bateria final cobre:

- autenticação, sessão e permissões;
- contexto multiempresa no backend;
- validação de dados financeiros;
- auditoria e logs sensíveis;
- IA explicável e apenas recomendatória;
- frontend com typecheck e build;
- validação documental da planificação.

Se uma destas áreas falhar, regista como bloqueante para `BK-MF8-18`.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo. A validação é uma revisão orientada sobre a evidence criada pelo script.

5. Explicação do código.

Não há código novo porque a execução já aconteceu. O trabalho agora é interpretar o resultado com responsabilidade profissional: uma falha de teste pode indicar bug funcional, risco de segurança, contrato partido ou simples comando mal ligado.

6. Validação do passo.

A evidence deve permitir responder:

- que comando falhou;
- em que diretório falhou;
- qual foi o exit code;
- qual foi o output relevante;
- se a falha bloqueia ou não a entrega;
- que próximo ficheiro ou BK deve ser corrigido.

7. Cenário negativo/erro esperado.

Se a evidence disser apenas "funciona" ou "falhou" sem comando, output e decisão, a execução final está incompleta e o BK não pode fechar.

### Passo 7 - Preparar handoff para BK-MF8-18

1. Objetivo funcional do passo no contexto da app.

Entregar ao próximo BK uma lista objetiva de falhas observadas e de comandos a reexecutar depois da correção.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-18-correcao-dos-erros-encontrados-e-reexecucao-dos-testes-afetados.md`
    - LOCALIZAÇÃO: secções `Decisão` e `Handoff para BK-MF8-18`.

3. Instruções do que fazer.

No fim do BK, confirma que `EXECUCAO-FINAL-TESTES.md` indica:

- primeiro comando bloqueante, se existir;
- output suficiente para reproduzir;
- decisão final;
- comandos que o `BK-MF8-18` deve reexecutar depois da correção.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo. O handoff é documental e operacional.

5. Explicação do código.

O handoff evita que o `BK-MF8-18` corrija por tentativa. O próximo BK deve começar pela falha observada, identificar causa raiz, corrigir o ficheiro certo e reexecutar o teste afetado.

6. Validação do passo.

Confirma que a secção `Handoff` deste guia lista:

- `BK-MF8-18` como próximo BK;
- `apps/api/scripts/run-mf8-final-validation.mjs` como script principal;
- `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` como evidence principal;
- `npm run mf8:final-validation` como comando final;
- `test:final:prepare` API/web como bateria consumida.

7. Cenário negativo/erro esperado.

Se o `BK-MF8-18` precisar de adivinhar que comando falhou, volta ao Passo 5 e melhora a evidence antes de fechar este BK.

#### Critérios de aceite

- O guia preserva `BK-MF8-17`, `RNF38`, owner, apoio, prioridade, esforço, sprint, dependência e próximo BK definidos pela matriz.
- O guia consome explicitamente `docs/evidence/MF8/TESTES-EM-FALTA.md` vindo do `BK-MF8-16`.
- O script `apps/api/scripts/run-mf8-final-validation.mjs` existe, tem JSDoc, comentários didáticos, precondições, execução API, execução web, validação de planificação e output Markdown.
- `apps/api/package.json` expõe `mf8:final-validation`.
- A execução final cobre `test:final:prepare` na API e na web.
- A evidence final é `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`.
- A evidence regista comando, diretório, resultado esperado, output observado, exit code e decisão.
- Existem pelo menos dois cenários negativos: evidence de entrada ausente e falha em `test:final:prepare`.
- O handoff para `BK-MF8-18` identifica falhas bloqueantes e comandos a reexecutar.
- Não há caminhos privados, comandos inventados, actions automáticas de IA, pagamentos reais ou integrações externas novas.

#### Validação final

Executa:

```bash
cd apps/api
node --check scripts/run-mf8-final-validation.mjs
npm run mf8:final-validation
```

Depois confirma a evidence:

```bash
rg -n "Decisão final|BLOQUEANTE|PODE_AVANCAR|BLOQUEADO_ATE_CORRECAO|test:final:prepare" ../../docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md
```

Resultados esperados:

- `node --check` termina sem erros de sintaxe.
- `npm run mf8:final-validation` cria ou recria `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`.
- Se todos os comandos passarem, a decisão final é `PODE_AVANCAR_PARA_BK-MF8-18`.
- Se algum comando falhar, a decisão final é `BLOQUEADO_ATE_CORRECAO`.
- A evidence inclui API, web e planificação.

#### Evidence para PR/defesa

- Output de `cd apps/api && node --check scripts/run-mf8-final-validation.mjs`.
- Output de `cd apps/api && npm run mf8:final-validation`.
- Ficheiro `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`.
- Decisão final registada.
- Lista de comandos bloqueantes, se existir.
- Indicação do primeiro comando a reexecutar no `BK-MF8-18`.

#### Handoff

- Próximo BK recomendado: `BK-MF8-18`
- Contrato entregue: execução final de testes ligada a `RNF38`.
- Script principal: `apps/api/scripts/run-mf8-final-validation.mjs`.
- Script npm: `cd apps/api && npm run mf8:final-validation`.
- Evidence principal: `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`.
- Evidence consumida: `docs/evidence/MF8/TESTES-EM-FALTA.md`.
- Bateria consumida: `test:final:prepare` em API e web.
- Risco a vigiar: não avançar para defesa se a decisão final for `BLOQUEADO_ATE_CORRECAO`.

#### Changelog

- `2026-07-03`: guia corrigido para cumprir `RNF38` com orquestrador final completo, comando npm ligado, evidence Markdown única, consumo do handoff do `BK-MF8-16`, bateria API/web e handoff objetivo para `BK-MF8-18`.
- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com caminhos públicos, passos técnicos lineares, código completo, validação e evidence.
