# Correcao de auditoria de implementacao real_dev - MF8

## Execucao 2026-07-07 - Correcao BK-MF8-18 defect report

### Resultado geral

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria`
- Escopo pedido: `BK-MF8-18`
- Findings tratados: `P1-BK-MF8-18-DEPENDENCIA-BK17-001`; `P1-BK-MF8-18-DEFECT-REPORT-001`; `P2-BK-MF8-18-PERSISTENCE-001`
- Implementation root analisado: `real_dev`
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- Resultado global: `PARCIAL`
- Estado do BK: `BLOQUEADO_AMBIENTE`
- Codigo alterado nesta execucao: `sim`
- Evidence criada nesta execucao: `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`; `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
- Commits: nenhum

### Findings tratados

| Finding | Severidade | Estado final | Evidencia de correcao |
| --- | --- | --- | --- |
| `P1-BK-MF8-18-DEPENDENCIA-BK17-001` | `P1` | `CORRIGIDO_SEM_VALIDACAO_TOTAL` | `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` foi gerado por `npm --prefix real_dev/api run mf8:final-validation` e contem o comando original `npm run test:final:prepare`, decisao `BLOQUEADO_ATE_CORRECAO`, API exit `1`, web exit `0` e planificacao exit `0`. A validacao total continua bloqueada porque a API final sem skip depende de `TEST_DATABASE_URL`. |
| `P1-BK-MF8-18-DEFECT-REPORT-001` | `P1` | `CORRIGIDO` | Criado `real_dev/api/scripts/check-mf8-defect-report.mjs`; adicionado `mf8:defect-report` a `real_dev/api/package.json`; criado `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`; `node --check real_dev/api/scripts/check-mf8-defect-report.mjs` passou; `npm --prefix real_dev/api run mf8:defect-report` passou com decisao `BLOQUEADO_AMBIENTE`. |
| `P2-BK-MF8-18-PERSISTENCE-001` | `P2` | `BLOQUEADO_AMBIENTE` | `npm --prefix real_dev/api run test:integration` falha em MF2/MF3 sem `TEST_DATABASE_URL`; a tentativa `TEST_DATABASE_URL=postgresql://opsa_test:opsa_test@localhost:5432/opsa_test npm --prefix real_dev/api run test:integration` falhou em `npx prisma migrate deploy` com `Schema engine error`; `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` passou com 2 skips explicitos. |

### Correcao aplicada

- Criado `real_dev/api/scripts/check-mf8-defect-report.mjs` com JSDoc, leitura de evidence final, validacao de secoes/campos e validacao das decisoes `CORRIGIDO_REVALIDADO`, `SEM_CORRECAO_NECESSARIA` e `BLOQUEADO_AMBIENTE`.
- O ramo `BLOQUEADO_AMBIENTE` so e aceite quando a evidence final contem marcador bloqueante e o relatorio menciona `TEST_DATABASE_URL`, `OPSA_SKIP_PERSISTENCE_TESTS` ou erro de engine.
- Adicionado `mf8:defect-report` a `real_dev/api/package.json`, preservando `mf8:final-validation` e `test:final:prepare`.
- Gerado `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` com a execucao final real do BK17.
- Criado `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`, registando que a correcao de artefactos foi aplicada, mas a revalidacao limpa permanece bloqueada por ambiente.
- Nao foram alterados endpoints, Prisma, services, controllers, frontend, BKs canonicos, RF/RNF, backlog ou mockup.

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `node --check real_dev/api/scripts/check-mf8-defect-report.mjs` | `PASS`; verificador BK18 sem erro de sintaxe. |
| `npm --prefix real_dev/api run mf8:defect-report` | `PASS`; `BK-MF8-18 validado: BLOQUEADO_AMBIENTE (npm run test:final:prepare)`. |
| `npm --prefix real_dev/api run mf8:final-validation` | `FAIL_ESPERADO_AMBIENTE`; gerou `EXECUCAO-FINAL-TESTES.md` e registou `BLOQUEADO_ATE_CORRECAO` porque API `test:final:prepare` saiu `1`. |
| `npm --prefix real_dev/api run test:integration` | `FAIL_AMBIENTE`; MF1 passou, MF2/MF3 exigiram `TEST_DATABASE_URL`. |
| `TEST_DATABASE_URL=postgresql://opsa_test:opsa_test@localhost:5432/opsa_test npm --prefix real_dev/api run test:integration` | `FAIL_AMBIENTE`; MF2/MF3 falharam em `npx prisma migrate deploy` com `Schema engine error`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` | `PASS_COM_RISCOS`; API final passou com 2 skips explicitos na integracao persistida MF2/MF3. |
| `npm --prefix real_dev/web run test:final:prepare` | `PASS`; frontend final passou com gates MF1, MF2, MF3, MF5, MF7, MF8, typecheck e build. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; scripts API, incluindo `check-mf8-defect-report.mjs`, sem erro de sintaxe. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; exit code `0`, `overall_pass=true`, `advisory_pass=false` por advisories documentais legados fora deste scope. |
| `rg -n "[ \t]+$" real_dev/api/scripts/check-mf8-defect-report.mjs real_dev/api/package.json docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md docs/evidence/MF8/CORRECAO-ERROS-REPORT.md docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` | `PASS`; sem trailing whitespace nos ficheiros tocados. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros tracked. |
| Scan estatico dirigido a `check-mf8-defect-report.mjs`, `package.json` e evidence BK17/BK18 | `PASS`; sem marcadores de implementacao pendente, storage sensivel, execucao dinamica, segredos em log, CORS permissivo, casts inseguros ou operacoes destrutivas globais. |
| Scan de drift de dominio dirigido a `check-mf8-defect-report.mjs`, `package.json` e evidence BK17/BK18 | `PASS`; sem referencias indevidas a outros produtos ou dominios. |

### Validacoes nao executadas

- A bateria API final sem skip nao passou porque o ambiente local nao disponibiliza uma base PostgreSQL efemera segura funcional para `TEST_DATABASE_URL`.
- Nao foi feita smoke browser manual; a prova frontend ficou nos scripts, typecheck e build.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `BK-MF8-16 -> BK-MF8-17` | `OK_COM_RISCOS` | `TESTES-EM-FALTA.md` existe e o orquestrador BK17 gera evidence final. |
| `BK-MF8-17 -> BK-MF8-18` | `OK_COM_BLOQUEIO_AMBIENTE` | O BK18 ja consome a evidence final e valida o relatorio de correcao, mas a decisao final honesta continua `BLOQUEADO_AMBIENTE`. |
| `MF7 -> MF8` | `OK_COM_RISCOS` | A bateria com skip explicito confirmou MF6, MF7 e MF8; a prova limpa sem skip depende de `TEST_DATABASE_URL`. |

### Ficheiros alterados

- `real_dev/api/scripts/check-mf8-defect-report.mjs`
- `real_dev/api/package.json`
- `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`
- `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

### Decisao final

Os dois findings `P1` de `BK-MF8-18` foram corrigidos ao nivel dos artefactos e validadores: a evidence final existe, o relatorio de correcao existe, o verificador existe e `mf8:defect-report` passa. O `P2-BK-MF8-18-PERSISTENCE-001` permanece `BLOQUEADO_AMBIENTE`, porque a reexecucao limpa da bateria API depende de uma base PostgreSQL efemera funcional em `TEST_DATABASE_URL`.

## Execucao 2026-07-07 - Correcao BK-MF8-17 orquestrador final

### Resultado geral

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria`
- Escopo pedido: `BK-MF8-17`
- Findings tratados: `P1-BK-MF8-17-ORQUESTRADOR-001`; `P2-BK-MF8-17-PERSISTENCE-001`
- Implementation root analisado: `real_dev`
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- Resultado global: `PARCIAL`
- Estado do BK: `BLOQUEADO_POR_SCOPE_E_AMBIENTE`
- Codigo alterado nesta execucao: `sim`
- Evidence criada nesta execucao: `nao`
- Commits: nenhum

### Findings tratados

| Finding | Severidade | Estado final | Evidencia de correcao |
| --- | --- | --- | --- |
| `P1-BK-MF8-17-ORQUESTRADOR-001` | `P1` | `PARCIALMENTE_CORRIGIDO` | Criado `real_dev/api/scripts/run-mf8-final-validation.mjs`; `real_dev/api/package.json` expoe `mf8:final-validation`; `test -f` do script passou; `node --check real_dev/api/scripts/run-mf8-final-validation.mjs` passou; `npm --prefix real_dev/api pkg get scripts.mf8:final-validation` devolveu `"node scripts/run-mf8-final-validation.mjs"`; `npm --prefix real_dev/api run syntax:check` passou. A evidence final nao foi gerada porque a prompt atual define `PERMITIR_ALTERAR_DOCS=nao` e a execucao completa escreveria `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`. |
| `P2-BK-MF8-17-PERSISTENCE-001` | `P2` | `BLOQUEADO_AMBIENTE` | `printenv TEST_DATABASE_URL` continua sem valor; `npm --prefix real_dev/api run test:final:prepare` falhou apenas na integracao persistida MF2/MF3 por falta de `TEST_DATABASE_URL`; a variante com `OPSA_SKIP_PERSISTENCE_TESTS=true` passou com 2 skips explicitos. |

### Correcao aplicada

- Criado `real_dev/api/scripts/run-mf8-final-validation.mjs` com precondicao para `docs/evidence/MF8/TESTES-EM-FALTA.md`, execucao de `test:final:prepare` na API, execucao de `test:final:prepare` na web, execucao de `bash scripts/validate-planificacao.sh` e escrita de evidence final Markdown.
- O caminho da web e derivado como diretorio irmao da API, permitindo a execucao real `real_dev/api -> real_dev/web` sem editar o guia publico dos alunos.
- Adicionado `mf8:final-validation` a `real_dev/api/package.json`, preservando `test:final:prepare`.
- Nao foi criado `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` porque esta execucao nao tinha autorizacao para alterar evidence/documentacao fora dos relatorios tecnicos.

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `test -f real_dev/api/scripts/run-mf8-final-validation.mjs` | `PASS`; orquestrador criado. |
| `node --check real_dev/api/scripts/run-mf8-final-validation.mjs` | `PASS`; sem erro de sintaxe. |
| `npm --prefix real_dev/api pkg get scripts.mf8:final-validation` | `PASS`; devolveu `"node scripts/run-mf8-final-validation.mjs"`. |
| `test -f docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` | `FAIL_ESPERADO_SCOPE`; evidence final continua ausente porque nao foi permitido escreve-la nesta prompt. |
| `printenv TEST_DATABASE_URL` | `FAIL_ESPERADO_AMBIENTE`; variavel ausente. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; inclui o novo script em `scripts/`. |
| `npm --prefix real_dev/api run test:mf8` | `PASS`; subscricoes, IA explicavel, IA governada, docs tecnicos, inventario e contratos do inventario passaram. |
| `npm --prefix real_dev/api run test:final:prepare` | `FAIL_AMBIENTE`; unitarios e contratos passaram, mas `test:integration` falhou em MF2/MF3 por falta de `TEST_DATABASE_URL`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` | `PASS_COM_RISCOS`; API final passou com 2 skips explicitos na integracao persistida MF2/MF3. |
| `npm --prefix real_dev/web run test:final:prepare` | `PASS`; frontend final passou com gates MF1, MF2, MF3, MF5, MF7, MF8, typecheck e build. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; exit code `0`, `overall_pass=true`, `advisory_pass=false` por advisories documentais legados fora deste scope. |
| `rg -n "[ \t]+$" real_dev/api/scripts/run-mf8-final-validation.mjs real_dev/api/package.json docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` | `PASS`; sem trailing whitespace nos ficheiros tocados. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros tracked. |
| `rg -n "FaithFlix\|StudyFlow\|Orelle\|cosmetica\|cosmeticos\|biometria\|streaming\|turma\|material de estudo" real_dev/api/scripts/run-mf8-final-validation.mjs real_dev/api/package.json docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` | `PASS`; sem drift de dominio nos artefactos novos/alterados relevantes. |

### Validacoes nao executadas

- `npm --prefix real_dev/api run mf8:final-validation` nao foi executado porque escreve `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`; a prompt atual define `PERMITIR_ALTERAR_DOCS=nao` e so autoriza relatorios tecnicos.
- A prova persistida real MF2/MF3 sem skip continua por executar porque `TEST_DATABASE_URL` nao esta configurada.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `BK-MF8-16 -> BK-MF8-17` | `OK_COM_RISCOS` | `TESTES-EM-FALTA.md` existe e o orquestrador passa a consumi-lo; falta executar o orquestrador numa prompt que permita gerar `EXECUCAO-FINAL-TESTES.md`. |
| `BK-MF8-17 -> BK-MF8-18` | `BLOQUEADO` | O proximo BK ainda nao deve arrancar como correcao de falhas finais enquanto a evidence `EXECUCAO-FINAL-TESTES.md` nao existir com a decisao observada. |
| `MF7 -> MF8` | `OK_COM_RISCOS` | A bateria com skip explicito confirmou MF6, MF7 e MF8; a prova limpa sem skip depende de `TEST_DATABASE_URL`. |

### Ficheiros alterados

- `real_dev/api/scripts/run-mf8-final-validation.mjs`
- `real_dev/api/package.json`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

### Decisao final

`P1-BK-MF8-17-ORQUESTRADOR-001` fica `PARCIALMENTE_CORRIGIDO`: o orquestrador e o script npm existem e validam sintaticamente, mas a evidence final nao foi criada por restricao explicita de scope. `P2-BK-MF8-17-PERSISTENCE-001` fica `BLOQUEADO_AMBIENTE` ate existir `TEST_DATABASE_URL` para uma base PostgreSQL efemera segura e a bateria API correr sem `OPSA_SKIP_PERSISTENCE_TESTS=true`.

## Execucao 2026-07-07 - Correcao BK-MF8-16 P2 evidence

### Resultado geral

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria`
- Escopo pedido: corrigir o primeiro `P2` de `BK-MF8-16`
- Finding alvo: `P2-BK-MF8-16-EVIDENCE-001`
- Implementation root analisado: `real_dev`
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- Resultado global: `CORRIGIDO_COM_RESSALVA`
- Estado do finding alvo: `CORRIGIDO`
- Codigo alterado nesta execucao: `nao`
- Evidence criada nesta execucao: `docs/evidence/MF8/TESTES-EM-FALTA.md`
- Commits: nenhum

### Finding corrigido

| Finding | Severidade | Estado final | Evidencia de correcao |
| --- | --- | --- | --- |
| `P2-BK-MF8-16-EVIDENCE-001` | `P2` | `CORRIGIDO` | `docs/evidence/MF8/TESTES-EM-FALTA.md` existe e regista comandos, resultados esperados, resultados observados, matriz minima, lacunas, negativos e handoff para `BK-MF8-17`. |

### Finding ainda ativo

| Finding | Severidade | Estado | Motivo |
| --- | --- | --- | --- |
| `P2-BK-MF8-16-PERSISTENCE-001` | `P2` | `BLOQUEADO` | Continua dependente de `TEST_DATABASE_URL` para base PostgreSQL efemera segura e execucao API sem `OPSA_SKIP_PERSISTENCE_TESTS=true`. |

### Correcao aplicada

- Criado `docs/evidence/MF8/TESTES-EM-FALTA.md`.
- Registados os comandos publicos do guia e os comandos reais equivalentes nesta checkout `real_dev`.
- Registada a matriz minima de cobertura `MF0..MF8`.
- Registada a evidence por camada: API unitaria, API contratos, API integracao, API scripts, web scripts e web typecheck/build.
- Registados cenarios negativos: inventario com lacuna, script MF8 em falta e integracao persistida sem base efemera.
- Registado o handoff para `BK-MF8-17`, incluindo a decisao de bloquear a prova persistida real ate existir `TEST_DATABASE_URL`.

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `test -f docs/evidence/MF8/TESTES-EM-FALTA.md` | `PASS`; evidence existe. |
| `npm --prefix real_dev/api run test:mf8:inventory` | `PASS`; matriz `MF0..MF8` toda `OK`, sem lacunas criticas. |
| `npm --prefix real_dev/api run test:mf8:inventory-contracts` | `PASS`; 2 testes, 2 pass, 0 fail. |
| `npm --prefix real_dev/api run test:integration` | `FAIL_ESPERADO_AMBIENTE`; MF1 passou, MF2/MF3 exigiram `TEST_DATABASE_URL`. |
| `env OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` | `PASS_COM_RISCOS`; API final passou com 2 skips explicitos na integracao persistida MF2/MF3. |
| `npm --prefix real_dev/web run test:final:prepare` | `PASS`; frontend final passou com typecheck e build. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; exit code `0`, `overall_pass=true`, `advisory_pass=false` por advisories documentais legados fora deste scope. |
| `rg -n "[ \t]+$" docs/evidence/MF8/TESTES-EM-FALTA.md docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` | `PASS`; sem trailing whitespace nos ficheiros revistos. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros tracked. |

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `BK-MF8-15 -> BK-MF8-16` | `OK` | A evidence confirma que o inventario continua a cobrir localizacao/formatters e a bateria MF8. |
| `BK-MF8-16 -> BK-MF8-17` | `OK_COM_RESSALVA` | A evidence de entrada para BK17 passou a existir; o handoff bloqueia apenas a prova persistida real ate haver `TEST_DATABASE_URL`. |

### Ficheiros alterados

- `docs/evidence/MF8/TESTES-EM-FALTA.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

### Validacoes nao executadas

- Integracao persistida real MF2/MF3 sem skip continua por executar porque `TEST_DATABASE_URL` nao existe neste ambiente.
- Nao foram feitos commits porque nao houve autorizacao para commit.

### Decisao final

`P2-BK-MF8-16-EVIDENCE-001` fica `CORRIGIDO`. O primeiro `P2` ja nao bloqueia `BK-MF8-16`, porque a evidence dedicada existe e contem o handoff para `BK-MF8-17`. Permanece ativo apenas o `P2-BK-MF8-16-PERSISTENCE-001`, que e ambiental.

## Execucao 2026-07-07 - Correcao BK-MF8-16 findings P2

### Resultado geral

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria`
- Escopo pedido: `BK-MF8-16`
- Finding ids pedidos: todos os findings ativos do BK no relatorio fonte
- Implementation root analisado: `real_dev`
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- Resultado global: `BLOQUEADO`
- Estado do BK: `BLOQUEADO`
- Codigo alterado nesta execucao: `nao`
- Evidence criada nesta execucao: `nao`
- Commits: nenhum
- Ficheiro tecnico atualizado: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

### Findings tratados

| Finding | Severidade | Estado final | Causa confirmada | Decisao |
| --- | --- | --- | --- | --- |
| `P2-BK-MF8-16-EVIDENCE-001` | `P2` | `BLOQUEADO_POR_SCOPE` | `docs/evidence/MF8/TESTES-EM-FALTA.md` nao existe e e exigido por `BK-MF8-16`/`BK-MF8-17`. | Nao foi criado porque a prompt atual define `PERMITIR_ALTERAR_DOCS=nao`; criar evidence fora deste relatorio violaria o scope. |
| `P2-BK-MF8-16-PERSISTENCE-001` | `P2` | `BLOQUEADO` | `TEST_DATABASE_URL` nao esta configurada; a integracao persistida MF2/MF3 falha sem base PostgreSQL efemera segura. | Nao houve alteracao de codigo; a correcao depende de ambiente de teste com `TEST_DATABASE_URL` valido e execucao sem `OPSA_SKIP_PERSISTENCE_TESTS=true`. |

### Causa raiz

Os dois findings continuam confirmados e nao sao corrigiveis por patch de runtime dentro deste contrato:

- a evidence dedicada de `BK-MF8-16` e um artefacto documental/evidencial consumido por `BK-MF8-17`, mas a prompt atual bloqueia alteracoes documentais exceto este relatorio tecnico;
- a validacao persistida MF2/MF3 depende de uma base PostgreSQL efemera segura, indicada por `TEST_DATABASE_URL`; sem essa variavel os testes recusam correr, como esperado.

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `test -f docs/evidence/MF8/TESTES-EM-FALTA.md` | `FAIL_ESPERADO_SCOPE`; exit code `1`, ficheiro ausente. |
| `printenv TEST_DATABASE_URL` | `FAIL_ESPERADO_AMBIENTE`; exit code `1`, variavel ausente. |
| `npm --prefix real_dev/api run test:mf8:inventory` | `PASS`; matriz `MF0..MF8` toda `OK`, sem lacunas criticas. |
| `npm --prefix real_dev/api run test:mf8:inventory-contracts` | `PASS`; 2 testes, 2 pass. |
| `npm --prefix real_dev/api run test:integration` | `FAIL_ESPERADO_AMBIENTE`; MF1 passou, MF2/MF3 recusaram correr sem `TEST_DATABASE_URL`. |
| `env OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RISCOS`; 2 pass e 2 skips explicitos por `OPSA_SKIP_PERSISTENCE_TESTS=true`. |
| `env OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` | `PASS_COM_RISCOS`; API final passou, mantendo 2 skips explicitos na integracao persistida. |
| `npm --prefix real_dev/web run test:final:prepare` | `PASS`; MF1, MF2, MF3, MF5, MF7, MF8, typecheck e build passaram. |
| `grep -n "TESTES-EM-FALTA\|TEST_DATABASE_URL\|BK-MF8-16\|BK-MF8-17\|test:final:prepare" docs/planificacao/guias-bk/MF8/BK-MF8-17-execucao-final-de-testes.md` | `PASS`; BK17 consome a evidence BK16 e deve bloquear quando ela faltar. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; exit code `0`, `overall_pass=true`, `advisory_pass=false` por advisories documentais legados fora deste scope. |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` | `PASS`; sem trailing whitespace no relatorio atualizado. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros tracked. |

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK_COM_RISCOS` | Os gates finais API/web passam com a ressalva ja conhecida de persistencia saltada explicitamente na API. |
| `BK-MF8-15 -> BK-MF8-16` | `OK` | O inventario MF8 continua a reconhecer formatters/localizacao e os scripts finais continuam publicados. |
| `BK-MF8-16 -> BK-MF8-17` | `BLOQUEADO` | `BK-MF8-17` declara `docs/evidence/MF8/TESTES-EM-FALTA.md` como evidence de entrada e deve terminar antes da bateria final se ela nao existir. |

### Ficheiros alterados

- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

### Validacoes nao executadas

- Nao foi executada a integracao persistida real MF2/MF3 com PostgreSQL porque `TEST_DATABASE_URL` nao existe neste ambiente.
- Nao foi criada `docs/evidence/MF8/TESTES-EM-FALTA.md` porque a prompt atual define `PERMITIR_ALTERAR_DOCS=nao`.
- Nao foram feitos commits porque a prompt atual define `PERMITIR_COMMITS=nao`.

### Decisao final

`BK-MF8-16` nao recebeu patch de codigo nem evidence nova. Os findings `P2-BK-MF8-16-EVIDENCE-001` e `P2-BK-MF8-16-PERSISTENCE-001` ficam explicitamente tratados no relatorio como bloqueios confirmados: o primeiro por scope documental e o segundo por ambiente de base de dados. O nucleo executavel continua verde com ressalvas, mas o fecho limpo de `BK-MF8-16` exige permissao para criar a evidence e uma execucao com `TEST_DATABASE_URL` real antes de `BK-MF8-17`.

## Execucao 2026-07-06 - Correcao BK-MF8-14 evidence/checklist

### Resultado geral

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria`
- Escopo pedido: corrigir finding ativo da auditoria MF8/BK14
- Finding alvo: `P3-BK-MF8-14-EVIDENCE-001`
- Implementation root analisado: `real_dev`
- Resultado global: `CORRIGIDO`
- Estado do BK: `CORRIGIDO`
- Codigo alterado nesta execucao: `nao`
- Commits: nenhum
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- Evidence criada: `docs/evidence/MF8/BK-MF8-14.md`
- Checklist criada: `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md`

### Finding corrigido

| Finding | Severidade | Estado | Evidencia de correcao |
| --- | --- | --- | --- |
| `P3-BK-MF8-14-EVIDENCE-001` | `P3` | `CORRIGIDO` | `docs/evidence/MF8/BK-MF8-14.md` e `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` existem e registam matriz de prova, checklist concreta, comandos, negativos, limites e handoff. |

### Causa raiz

O `BK-MF8-14` ja estava implementado e auditado em `real_dev`, mas a execucao original tinha `PERMITIR_ALTERAR_DOCS=nao`. Por isso a evidence visual ficou nos relatorios de implementacao/auditoria e nao nos ficheiros dedicados pedidos pelo guia canonico.

### Correcao aplicada

- Criado `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` com criterios concretos de mockup: paleta, fundo, sidebar, navegacao, botoes, foco, forms, tabelas, cards, estados, componentes partilhados, IA e gate.
- Criado `docs/evidence/MF8/BK-MF8-14.md` com matriz de prova para `RNF35`.
- Registados artefactos reais: guia canonico, mockup, CSS, componentes UI, cliente MF4, paginas MF4/IA, gate frontend, package e relatorios.
- Registados comandos executados e resultados observados, sem declarar screenshot/browser ou smoke HTTP que nao foram executados.
- Registados negativos cobertos pelo gate sem aplicar mutacoes destrutivas temporarias ao codigo.
- Atualizado o relatorio de auditoria para deixar a verdade operacional atual como `PASS` / `AUDITADO_OK`.

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `test -f docs/evidence/MF8/BK-MF8-14.md` | `PASS`; ficheiro existe. |
| `test -f docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` | `PASS`; ficheiro existe. |
| `npm --prefix real_dev/web run test:mf8:ui-alignment` | `PASS`; `MF8 UI alignment OK`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript frontend sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; build Vite concluida. |
| `node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` em `real_dev/api` | `PASS`; 5 testes, 5 pass, 0 fail. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| Pesquisa estatica de risco no escopo BK14 | `PASS`; sem matches de risco. |
| Pesquisa de drift de dominio no escopo BK14 | `PASS`; sem referencias indevidas a outros produtos/dominios. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `advisory_pass=false` por advisories documentais antigos. |
| `rg -n "[ \t]+$" docs/evidence/MF8/BK-MF8-14.md docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md ...` | `PASS`; sem trailing whitespace nos ficheiros MF8 revistos. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | Nao houve alteracao de codigo; o gate frontend, typecheck e build continuam verdes. |
| `BK-MF8-13 -> BK-MF8-14` | `OK` | A evidence documenta a apresentacao de `sourceQuality`, fonte, limitacao e decisao humana. |
| `BK-MF8-14 -> BK-MF8-15` | `OK` | A checklist visual deixa o contrato UI estavel para o BK de localizacao PT-PT. |

### Ficheiros alterados

- `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md`
- `docs/evidence/MF8/BK-MF8-14.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Validacoes nao executadas

- Screenshot/browser manual nao foi executado; a correcao e documental/evidencial e o runtime foi coberto por gate, typecheck e build.
- Smoke HTTP autenticado com servidor real nao foi executado; o BK14 nao alterou endpoints nem backend runtime.

### Decisao final

`P3-BK-MF8-14-EVIDENCE-001` fica `CORRIGIDO`. Nao restam findings ativos conhecidos para `BK-MF8-14`; a implementacao real continua sem alteracoes de codigo e com validacoes frontend/backend essenciais verdes.

## Execucao 2026-07-06 - Correcao BK-MF8-13 evidence

### Resultado geral

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria`
- Escopo pedido: corrigir finding ativo da auditoria MF8/BK13
- Finding alvo: `P3-BK-MF8-13-EVIDENCE-001`
- Implementation root analisado: `real_dev`
- Resultado global: `CORRIGIDO`
- Estado do BK: `CORRIGIDO`
- Codigo alterado nesta execucao: `nao`
- Commits: nenhum
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- Evidence criada: `docs/evidence/MF8/BK-MF8-13.md`

### Finding corrigido

| Finding | Severidade | Estado | Evidencia de correcao |
| --- | --- | --- | --- |
| `P3-BK-MF8-13-EVIDENCE-001` | `P3` | `CORRIGIDO` | `docs/evidence/MF8/BK-MF8-13.md` existe, regista comandos executados, resultados observados, negativos, limites e handoff. |

### Causa raiz

O `BK-MF8-13` ja estava implementado e auditado em `real_dev`, mas a execucao de implementacao original tinha `PERMITIR_ALTERAR_DOCS=nao`. Por isso a evidence tecnica ficou no relatorio de implementacao/auditoria e nao no ficheiro dedicado pedido pelo guia canonico.

### Correcao aplicada

- Criado `docs/evidence/MF8/BK-MF8-13.md` com matriz de prova para `RNF34`.
- Registados artefactos reais: guia canonico, guardrail, service, router, politica de governanca AI, teste de contrato e relatorios.
- Registados comandos executados e resultados observados, sem declarar smoke HTTP, browser ou base de dados real que nao foram executados.
- Registados negativos validados: sem fonte rastreavel, sem empresa ativa, explicacao fraca, bloqueio antes de persistencia e ownership por contexto backend.
- Atualizado o relatorio de auditoria para deixar a verdade operacional atual como `PASS` / `AUDITADO_OK`.
- Atualizado o relatorio de implementacao com nota de correcao posterior da evidence.

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `test -f docs/evidence/MF8/BK-MF8-13.md` | `PASS`; ficheiro existe. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` em `real_dev/api` | `PASS`; 5 testes, 5 pass, 0 fail. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 118 testes, 118 pass, 0 fail. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `advisory_pass=false` por advisories documentais antigos, incluindo `BK-MF8-13`. |
| `rg -n "[ \t]+$" docs/evidence/MF8/BK-MF8-13.md ...` | `PASS`; sem trailing whitespace na evidence BK13 e relatorios MF8 editados. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | Nao houve alteracao de codigo; syntax, Prisma e contratos continuam verdes. |
| `BK-MF8-10 -> BK-MF8-13` | `OK` | A evidence documenta consumo de fonte e explicacao dos insights entregues por BK10. |
| `BK-MF8-11 -> BK-MF8-13` | `OK` | A evidence documenta que a IA continua a recomendar e nao executa acoes automaticas. |
| `BK-MF8-13 -> BK-MF8-14` | `OK` | A evidence fecha o handoff de `sourceQuality`, fonte, limitacao e decisao humana para a UI. |

### Ficheiros alterados

- `docs/evidence/MF8/BK-MF8-13.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Validacoes nao executadas

- `npm --prefix real_dev/api run test:unit`, `npm --prefix real_dev/web run typecheck` e `npm --prefix real_dev/web run build` nao foram reexecutados nesta correcao documental; ja tinham passado na auditoria imediatamente anterior e nenhum codigo runtime foi alterado.
- Smoke HTTP autenticado com servidor real nao foi executado; a prova continua em router/service/teste de contrato.
- Integracao persistida contra base de dados real nao foi executada; Prisma validou o schema e o contrato dedicado cobriu o dominio com double controlado.

### Decisao final

`P3-BK-MF8-13-EVIDENCE-001` fica `CORRIGIDO`. Nao restam findings ativos conhecidos para `BK-MF8-13`; a implementacao real continua sem alteracoes de codigo e com validacoes backend verdes.

## Execucao 2026-07-06 - Correcao BK-MF8-12 evidence

### Resultado geral

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria`
- Escopo pedido: corrigir findings ativos da auditoria MF8/BK12
- Finding alvo: `P3-BK-MF8-12-EVIDENCE-001`
- Implementation root analisado: `real_dev`
- Resultado global: `CORRIGIDO`
- Estado do BK: `CORRIGIDO`
- Codigo alterado nesta execucao: `nao`
- Commits: nenhum
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- Evidence criada: `docs/evidence/MF8/BK-MF8-12.md`

### Finding corrigido

| Finding | Severidade | Estado | Evidencia de correcao |
| --- | --- | --- | --- |
| `P3-BK-MF8-12-EVIDENCE-001` | `P3` | `CORRIGIDO` | `docs/evidence/MF8/BK-MF8-12.md` existe, regista comandos executados, resultados observados, negativos, limites e handoff. |

### Causa raiz

O `BK-MF8-12` ja estava implementado e auditado em `real_dev`, mas a execucao de implementacao anterior tinha `PERMITIR_ALTERAR_DOCS=nao`. Por isso a evidence tecnica ficou no relatorio de implementacao e nao no ficheiro dedicado pedido pelo guia canonico.

### Correcao aplicada

- Criado `docs/evidence/MF8/BK-MF8-12.md` com matriz de prova para `RNF33`.
- Registados artefactos reais: schema, migration, service, router, teste de contrato e relatorios.
- Registados comandos executados e resultados observados, sem declarar smoke HTTP, browser ou base de dados real que nao foram executados.
- Registados negativos validados: body invalido, tipo invalido, `security` obrigatorio, ownership pelo contexto backend e guards de auth/empresa/permissao.
- Atualizado o relatorio de auditoria para deixar a verdade operacional atual como `PASS` / `AUDITADO_OK`.
- Atualizado o relatorio de implementacao com nota de correcao posterior da evidence.

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `node --test tests/contracts/mf8-alert-preferences.contract.test.js` em `real_dev/api` | `PASS`; 4 testes, 4 pass, 0 fail. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 113 testes, 113 pass, 0 fail. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass, 0 fail. |
| Pesquisa estatica de risco no escopo BK12 | `PASS`; sem matches apos remover falso positivo textual na propria evidence. |
| Pesquisa de drift de dominio no escopo BK12 | `PASS`; sem referencias indevidas a outros produtos/dominios. |
| `test -f docs/evidence/MF8/BK-MF8-12.md` | `PASS`; ficheiro existe. |

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | Nao houve alteracao de codigo; schema, contratos e unit continuam verdes. |
| `MF4 -> BK-MF8-12` | `OK` | A evidence documenta que BK12 reutiliza o router de notificacoes e os guards existentes. |
| `BK-MF8-11 -> BK-MF8-12` | `OK` | A categoria `ai` continua apenas preferencia de alerta, sem execucao automatica. |
| `BK-MF8-12 -> BK-MF8-13` | `OK` | A evidence explicita o handoff da categoria `ai` para o BK seguinte. |

### Ficheiros alterados

- `docs/evidence/MF8/BK-MF8-12.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Validacoes nao executadas

- `npm --prefix real_dev/web run typecheck` e `npm --prefix real_dev/web run build` nao foram executados porque a correcao e documental/evidence e BK12 e backend-only no guia.
- Smoke HTTP autenticado com servidor real nao foi executado; a prova continua em router/service/teste de contrato.
- Integracao persistida contra base de dados real nao foi executada; Prisma validou o schema e o contrato dedicado cobriu o dominio com double controlado.

### Decisao final

`P3-BK-MF8-12-EVIDENCE-001` fica `CORRIGIDO`. Nao restam findings ativos conhecidos para `BK-MF8-12`; a implementacao real continua sem alteracoes de codigo e com validacoes backend verdes.

## Execucao 2026-07-06 - BK-MF8-12

### Resultado geral

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria`
- Escopo pedido: `MF8`, `BK_IDS=[BK-MF8-12]`
- Implementation root analisado: `real_dev`
- Resultado global: `BLOQUEADO`
- Estado do BK: `BLOQUEADO`
- Codigo alterado nesta execucao: `nao`
- Commits: nenhum
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`
- Relatorio criado nesta execucao: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

### Decisao de bloqueio

A prompt atual exige `MODO=corrigir_auditoria`, ou seja, corrigir apenas findings confirmados por relatorio de auditoria. O relatorio de auditoria auto-detectado para `MF8` nao contem uma seccao de auditoria propria para `BK-MF8-12` nem findings `P0`, `P1`, `P2` ou `P3` ligados a este BK.

O ficheiro `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` contem uma execucao de implementacao para `BK-MF8-12` e declara o BK como `IMPLEMENTADO`, mas nao e um relatorio de auditoria com findings a corrigir. Por isso, seguindo a propria prompt, a correcao fica bloqueada por falta de relatorio de auditoria suficiente. Nenhum ficheiro de codigo foi editado.

### Findings alvo

| Finding | Severidade | Estado | Justificacao |
| --- | --- | --- | --- |
| N/A | N/A | `BLOQUEADO` | Nao foi encontrado finding confirmado para `BK-MF8-12` em `AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`. |

### Evidencia consultada

| Area | Evidencia |
| --- | --- |
| Relatorio de auditoria | `rg -n "^## .*BK-MF8-12\|BK-MF8-12\|MF8-12\|alertas configuraveis\|alertas configuráveis\|Finding\|findings\|P[0-3].*BK-MF8-12\|TODO \\(BLOCKER\\).*BK-MF8-12" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` encontrou `BK-MF8-12` apenas como handoff/contrato vizinho de `BK-MF8-11`, sem seccao ou finding proprio. |
| Relatorio de implementacao | `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md:3-135` declara `BK-MF8-12` como `IMPLEMENTADO`, lista ficheiros reais, validacoes e sem findings ativos. |
| Contrato canonico | `docs/RNF.md:99` define `RNF33`; `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:109`, `BACKLOG-MVP.md:134`, `CONTRATO-CAMPOS-BK.md:121`, `MF-VIEWS.md:238` e `MF-VIEWS.md:252` confirmam `BK-MF8-12` e handoff para `BK-MF8-13`. |
| Implementacao existente | `real_dev/api/prisma/schema.prisma` contem `AlertPreference`; `real_dev/api/src/modules/notifications/alertPreferenceService.js` contem defaults, validacao de body, bloqueio de `security` e `upsert`; `real_dev/api/src/modules/notifications/notificationRoutes.js` monta `GET /preferences` e `PATCH /preferences/:type` com auth, empresa ativa e permissao. |
| Teste existente | `real_dev/api/tests/contracts/mf8-alert-preferences.contract.test.js` cobre defaults/stored preferences, escrita sem aceitar `companyId` do body, negativos de body/tipo/`security` e exposicao das rotas protegidas. |

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_NOTA`; ja existiam artefactos MF8 nao rastreados, preservados. |
| `test -f docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` antes da escrita | `PASS_COM_NOTA`; exit code `1`, sem relatorio de correcao MF8 previo. |
| `rg -n "AlertPreference\|alertPreferences\|notifications/preferences\|ALERT\|alertPreference\|security\|NOTIFICATIONS_READ\|requireCompanyContext\|req\\.companyId\|body\\.companyId\|req\\.body\\.companyId\|enabled" real_dev/api/prisma/schema.prisma real_dev/api/src/modules/notifications real_dev/api/tests/contracts/mf8-alert-preferences.contract.test.js` | `PASS`; confirmou o contrato implementado e ausencia de ownership vindo de `body.companyId`/`req.body.companyId`. |
| `rg -n "BK-MF8-12\|RNF33\|Alertas configur" docs/RNF.md docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md docs/planificacao/backlogs/BACKLOG-MVP.md docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md docs/planificacao/backlogs/MF-VIEWS.md docs/planificacao/sprints/PLANO-SPRINTS.md docs/planificacao/guias-bk/README.md` | `PASS`; confirmou rastreabilidade canonica. |
| `rg -n "TODO implementar\|FIXME\|temporario\|temporary\|demo only\|implementar depois\|pseudo-codigo\|payload: unknown\|as any\|localStorage\|sessionStorage\|dangerouslySetInnerHTML\|eval\\(\|new Function\|password.*console\|token.*console\|cookie.*console\|console\\.log\\(.*password\|console\\.log\\(.*token\|secret\|api[_-]?key\|deleteMany\\(\\{\\}\\)\|delete\\(\\{\\}\\)\|updateMany\\(\\{\\}\\)\|CORS\|Access-Control-Allow-Origin\|RAG\|embeddings\|OCR\|chunking semantico\|req\\.(body\|query)\\.companyId\|body\\.companyId\|query\\.companyId" real_dev/api/src/modules/notifications real_dev/api/tests/contracts/mf8-alert-preferences.contract.test.js` | `PASS`; exit code `1`, sem matches de risco no escopo BK12 analisado. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `node --test tests/contracts/mf8-alert-preferences.contract.test.js` em `real_dev/api` | `PASS`; 4 testes, 4 pass, 0 fail. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 113 testes, 113 pass, 0 fail. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, mas `advisory_pass=false` por advisories documentais antigos, incluindo `BK-MF8-12`. Como `PERMITIR_ALTERAR_DOCS=nao`, esses avisos nao foram corrigidos. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | As validacoes de contratos e Prisma continuam verdes; nao houve alteracao de auth, empresa ativa, permissoes ou persistencia nesta execucao. |
| `BK-MF8-11 -> BK-MF8-12` | `OK_COM_RESSALVAS` | `BK-MF8-12` preserva a fronteira de `BK-MF8-11`: alertas `ai` sao preferencia/notificacao, sem execucao contabilistica automatica. A ressalva e apenas a ausencia de auditoria propria BK12. |
| `BK-MF8-12 -> BK-MF8-13` | `OK_COM_RESSALVAS` | O contrato existente expoe categoria `ai` para preferencias; sem auditoria propria BK12 nao foi feita correcao adicional para o handoff. |

### Ficheiros alterados

- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

### Ficheiros nao alterados

- Nenhum ficheiro em `real_dev/` foi alterado.
- Nenhum BK, RF/RNF, matriz, backlog, guia canonico, prompt, `apps/` ou `mockup/` foi alterado.
- Nenhum ficheiro em `docs/evidence/` foi alterado.

### Validacoes nao executadas

- Nao executei `npm --prefix real_dev/web run typecheck` nem `npm --prefix real_dev/web run build`, porque a execucao ficou bloqueada antes de correcao e `BK-MF8-12` e backend-only no relatorio de implementacao consultado.
- Nao executei `npm --prefix real_dev/api run test:unit` nem `test:integration`, porque nao houve alteracao de codigo e a correcao ficou bloqueada por falta de finding auditado; foram executados o teste dedicado e `test:contracts`.
- Nao executei browser/E2E autenticado real; sem correcao de codigo nem finding auditado, a validacao proporcional ficou em contratos backend e schema.

### Blockers e TODOs

- `BLOQUEADO`: falta um relatorio de auditoria suficiente para `BK-MF8-12` com findings confirmados a corrigir.
- `TODO`: executar uma auditoria `BK-MF8-12` em `auditar_implementacao` antes de pedir `corrigir_auditoria`, ou fornecer `AUDIT_REPORT_PATH`/`FINDING_IDS` com findings confirmados.
- `TODO` documental fora do scope atual: `validate-planificacao.sh` continua com advisories antigos de qualidade pedagogica nos guias; nao foram corrigidos por `PERMITIR_ALTERAR_DOCS=nao`.

### Decisao final

Esta execucao fica `BLOQUEADO` para correcao de auditoria: nao ha finding confirmado para `BK-MF8-12` no relatorio de auditoria auto-detectado. A implementacao existente foi lida e validada de forma proporcional, mas nao foi alterada, porque corrigir sem finding confirmado violaria o modo `corrigir_auditoria`.
