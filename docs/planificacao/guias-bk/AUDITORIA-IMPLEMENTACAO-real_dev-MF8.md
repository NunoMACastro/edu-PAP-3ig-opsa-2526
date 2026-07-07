# Auditoria de implementacao real_dev - MF8

## Execucao 2026-07-07 - Auditoria MF8 completa

- Projeto: `OPSA`
- Pedido atual: executar prompt final com `MF_ALVO=MF8`, `BK_IDS=[]`, `MODO=auditar_implementacao`
- Escopo auditado: todos os 18 BKs canonicos de `MF8`
- Implementation root auditado: `real_dev`
- Backend/API auditado: `real_dev/api`
- Frontend/web auditado: `real_dev/web`
- Resultado global: `PASS_COM_RISCOS`
- Findings ativos: 0 `P0`, 0 `P1`, 1 `P2`, 1 `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas esta nova seccao no relatorio tecnico de auditoria.

### Contrato auditado

A matriz e o backlog definem a `MF8` como cadeia de 18 BKs: `BK-MF8-01` a `BK-MF8-18`. O escopo cobre observabilidade (`RNF28`), health-check (`RNF29`), subscricoes simuladas (`RF49`, `RF50`, `RF51`), documentacao tecnica (`RNF30`), IA explicavel e governada (`RNF31`, `RNF32`, `RNF34`), alertas configuraveis (`RNF33`), alinhamento visual/localizacao (`RNF35`, `RNF36`) e fecho de testes (`RNF37`, `RNF38`, `RNF39`).

Os caminhos `apps/api` e `apps/web` dos guias foram mapeados para `real_dev/api` e `real_dev/web`, conforme a prompt. `real_dev/` esta ignorado por git atraves de `.gitignore:4:real_dev/`, o que e esperado nesta PAP e nao e finding.

### Estado por BK

| BK | Estado | Evidencia principal |
| --- | --- | --- |
| `BK-MF8-01` | `AUDITADO_OK` | `real_dev/api/src/modules/ops/structuredLogger.js:8` aceita `info`, `warn`, `error`, `audit`; `createStructuredLogEvent` valida contexto seguro em `:66`; testes unitarios MF8 passaram dentro de `test:final:prepare`. |
| `BK-MF8-02` | `AUDITADO_OK` | `real_dev/api/src/modules/ops/healthRoutes.js:68` cria payload publico seguro; `real_dev/api/src/server.js:81` monta `/api/health` antes dos routers autenticados; contratos MF8 passaram. |
| `BK-MF8-03` | `AUDITADO_OK` | `real_dev/api/src/modules/subscriptions/subscriptionPlans.js:8` limita planos a `monthly`, `quarterly`, `yearly`; `subscriptionRoutes.js:167` expoe `GET /plans`; sem campos de pagamento real. |
| `BK-MF8-04` | `AUDITADO_OK` | `CompanySubscription` tem `companyId @unique` em `real_dev/api/prisma/schema.prisma:259`; `subscriptionRoutes.js:187` usa `req.companyId`; `subscriptionService.js:293` consulta por empresa ativa. |
| `BK-MF8-05` | `AUDITADO_OK` | `subscriptionRoutes.js:200` expoe ativacao; `subscriptionService.js:436` faz upsert por `companyId` e audita `subscription.activate` em `:463`. |
| `BK-MF8-06` | `AUDITADO_OK` | `subscriptionRoutes.js:216` expoe acoes; `subscriptionService.js:488` valida transicoes e audita `subscription.renew/cancel/reactivate` em `:520`. |
| `BK-MF8-07` | `AUDITADO_OK` | `real_dev/web/src/lib/subscriptionsApi.ts:61` carrega planos/estado; `SubscriptionsPage.tsx:180` cobre loading/error/empty; `:330` mostra ativar/renovar/cancelar/reativar. |
| `BK-MF8-08` | `AUDITADO_OK` | `real_dev/api/tests/contracts/mf8-subscriptions.contract.test.js:166` cobre RF49; `:181` cobre RF50; `:211` cobre RF51; `npm --prefix real_dev/api run test:mf8` passou. |
| `BK-MF8-09` | `AUDITADO_OK` | `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md:1` existe; `check-mf8-technical-docs.mjs:19` valida secoes e `:52` bloqueia promessas fora do MVP. |
| `BK-MF8-10` | `AUDITADO_OK` | `real_dev/api/src/modules/ai/aiService.js:228` valida explicabilidade; `:407` devolve fonte/guardrail; contrato `mf8-ai-explainability` passou. |
| `BK-MF8-11` | `AUDITADO_OK` | `aiGovernancePolicy.js:10` define denylist financeira; `:43` bloqueia acao automatica; `aiService.js:446` aplica politica antes do upsert. |
| `BK-MF8-12` | `AUDITADO_OK` | `alertPreferenceService.js:20` define tipos; `:182` lista preferencias por empresa/utilizador; `:209` faz upsert por chave composta; contrato passou. |
| `BK-MF8-13` | `AUDITADO_OK` | `aiSourceGuardrails.js:38` exige empresa/fonte/acao; `:71` exige explicacao minima; `aiService.js:451` valida qualidade da fonte antes de persistir sugestao. |
| `BK-MF8-14` | `AUDITADO_OK` | `check-mf8-ui-alignment.mjs:75` valida tokens/componentes partilhados e `:98` valida UI de governanca de IA; gate frontend passou. |
| `BK-MF8-15` | `AUDITADO_OK` | `formatters.ts:121` formata EUR; `:191` formata datas PT-PT; `:209` aplica formatacao por coluna; gate `test:mf8:formatters` passou. |
| `BK-MF8-16` | `AUDITADO_OK` | `check-mf8-test-inventory.mjs:13` define fluxos criticos `MF0..MF8`; `:79` e `:96` exigem scripts API/web; inventario passou sem lacunas. |
| `BK-MF8-17` | `BLOQUEADO` | `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md:9` esta em `BLOQUEADO_ATE_CORRECAO`; API final sem skip bloqueia em MF2/MF3 por falta de `TEST_DATABASE_URL`. |
| `BK-MF8-18` | `BLOQUEADO` | `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md:31` decide `BLOQUEADO_AMBIENTE`; `npm --prefix real_dev/api run mf8:defect-report` passou e preservou o bloqueio honesto. |

### Rastreabilidade resumida

| Area | RF/RNF | Ficheiros auditados | Validacao |
| --- | --- | --- | --- |
| Observabilidade e health | `RNF28`, `RNF29` | `structuredLogger.js`, `healthRoutes.js`, `server.js`, `structuredLogger.test.js`, contratos health | `syntax:check`, `test:final:prepare` com skip persistido, contratos MF8. |
| Subscricoes simuladas | `RF49`, `RF50`, `RF51` | `subscriptionPlans.js`, `subscriptionRoutes.js`, `subscriptionService.js`, `schema.prisma`, `subscriptionsApi.ts`, `SubscriptionsPage.tsx`, contratos MF8 | `npm --prefix real_dev/api run test:mf8`, `npm --prefix real_dev/web run test:mf8`. |
| IA e alertas | `RNF31`, `RNF32`, `RNF33`, `RNF34` | `aiService.js`, `aiGovernancePolicy.js`, `aiSourceGuardrails.js`, `aiRoutes.js`, `alertPreferenceService.js`, `notificationRoutes.js`, contratos MF8 | `test:mf8:ai-explainability`, `test:mf8:ai-governance`, contratos de fonte e preferencias. |
| UI/localizacao | `RNF35`, `RNF36` | `apiClient.ts`, `subscriptionsApi.ts`, `SubscriptionsPage.tsx`, `formatters.ts`, `check-mf8-ui-alignment.mjs`, `check-mf8-formatters.mjs` | `npm --prefix real_dev/web run test:mf8`, `npm --prefix real_dev/web run test:final:prepare`. |
| Fecho de testes | `RNF37`, `RNF38`, `RNF39` | `check-mf8-test-inventory.mjs`, `run-mf8-final-validation.mjs`, `check-mf8-defect-report.mjs`, `TESTES-EM-FALTA.md`, `EXECUCAO-FINAL-TESTES.md`, `CORRECAO-ERROS-REPORT.md` | Inventario OK; defect report OK; fecho limpo bloqueado por ambiente PostgreSQL. |

### Findings ativos

| ID | Severidade | Estado | Evidencia | Expected | Observed | Impacto | Recomendacao |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `P2-MF8-PERSISTENCE-TEST_DATABASE_URL-001` | `P2` | `BLOQUEADO_AMBIENTE` | `printenv TEST_DATABASE_URL` saiu com exit code `1`; `npm --prefix real_dev/api run test:integration` falhou apenas em MF2/MF3 com mensagem a exigir `TEST_DATABASE_URL`; `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` passou com 2 skips explicitos. | A execucao final API deve correr sem skip contra PostgreSQL efemera segura. | O ambiente atual nao tem `TEST_DATABASE_URL`; a validacao limpa de MF2/MF3 fica bloqueada. | `BK-MF8-17` e `BK-MF8-18` nao devem ser fechados como revalidados limpos. | Configurar uma base PostgreSQL efemera cujo nome contenha `test`, `audit` ou `ci`, correr `npm --prefix real_dev/api run test:integration` e depois `npm --prefix real_dev/api run test:final:prepare` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`. |
| `P3-MF8-VALIDADOR-ADVISORY-LEGADO-001` | `P3` | `NAO_APLICAVEL_A_IMPLEMENTACAO` | `bash scripts/validate-planificacao.sh` passou com `overall_pass=true`, mas `advisory_pass=false` por avisos de qualidade documental legados, incluindo guias de varias MFs. | Auditoria de implementacao deve distinguir falhas de runtime de advisories documentais. | O validador aponta avisos de guia, mas nao quebra cobertura, consistencia, naming ou links. | Nao bloqueia a implementacao MF8; e trabalho documental separado. | Tratar numa prompt propria de planificacao/hidratacao se o objetivo for limpar advisories. |

Nao ha findings `P0` nem `P1` ativos na implementacao MF8. Os BKs `BK-MF8-17` e `BK-MF8-18` ficam bloqueados apenas para fecho limpo por ambiente, nao por ausencia de artefactos ou bug novo confirmado no codigo MF8.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK_COM_RISCOS` | `test:final:prepare` com skip explicito confirmou MF6, MF7 e MF8; `test:mf7` passou dentro da bateria API final e a web final passou. A prova persistida MF2/MF3 continua dependente de `TEST_DATABASE_URL`. |
| `MF8 interna` | `OK_COM_RISCOS` | `BK-MF8-01..16` estao auditados OK; `BK-MF8-17` gera/consome evidence final; `BK-MF8-18` valida relatorio de defeitos, mas preserva `BLOQUEADO_AMBIENTE`. |
| `MF8 -> MF seguinte` | `NAO_APLICAVEL` | A matriz termina em `BK-MF8-18`; nao existe BK canonico seguinte nesta checkout. |

### Validacoes executadas nesta auditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_NOTA`; ja existiam artefactos MF8 e relatorios untracked, preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS_COM_NOTA`; `.gitignore:4:real_dev/` confirma area ignorada esperada. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`. |
| `DATABASE_URL=postgresql://opsa_test:opsa_test@localhost:5432/opsa_test npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:mf8` | `PASS`; subscricoes 4/4, IA explicavel 5/5, IA governance 5/5, docs tecnicos OK, inventario OK, contratos de inventario 2/2. |
| `npm --prefix real_dev/web run test:mf8` | `PASS`; subscriptions UI, UI alignment, formatters, typecheck e build passaram. |
| `printenv TEST_DATABASE_URL` | `FAIL_ESPERADO_AMBIENTE`; variavel ausente. |
| `npm --prefix real_dev/api run test:integration` | `FAIL_AMBIENTE`; MF1 passou 2/2, MF2/MF3 falharam com instrucao explicita para `TEST_DATABASE_URL`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` | `PASS_COM_RISCOS`; unitarios 79/79, contratos 120/120, integracao 2 pass/2 skipped, MF6/MF7/MF8 passaram. |
| `npm --prefix real_dev/api run mf8:defect-report` | `PASS`; `BK-MF8-18 validado: BLOQUEADO_AMBIENTE (npm run test:final:prepare)`. |
| `npm --prefix real_dev/web run test:final:prepare` | `PASS`; MF1, MF2, MF3, MF5, MF7, MF8, typecheck e build passaram. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false`. |
| Scan estatico de risco em `real_dev/api`, `real_dev/web`, `docs/evidence/MF8` | `PASS_COM_RUIDO_CONTROLADO`; hits em denylist/redaccao de segredos, testes negativos, gates que rejeitam RAG/OCR/embeddings e notas de limite em evidence. Sem finding novo. |
| Scan de drift de dominio em `real_dev/api`, `real_dev/web`, `docs/evidence/MF8` | `PASS`; sem referencias indevidas a FaithFlix, StudyFlow, Orelle, cosmetica, biometria, streaming, turma, sala ou material de estudo. |

### Validacoes nao executadas

- `npm --prefix real_dev/api run test:final:prepare` sem `OPSA_SKIP_PERSISTENCE_TESTS=true` nao foi repetido como bateria completa, porque `npm --prefix real_dev/api run test:integration` reproduziu diretamente o bloqueio MF2/MF3 por ausencia de `TEST_DATABASE_URL`.
- Smoke browser manual nao foi executado; a prova frontend ficou nos gates, typecheck e builds Vite.
- Nao foi executado `npm --prefix real_dev/api run mf8:final-validation`, porque esse comando reescreve `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`; o modo atual e auditoria e a evidence existente ja prova o estado bloqueado.

### Ficheiros auditados e alterados

- Auditados: documentos canonicos, guias `docs/planificacao/guias-bk/MF8`, relatorios MF8 existentes, `real_dev/api`, `real_dev/web`, `real_dev/api/prisma/schema.prisma`, scripts/tests/evidence MF8.
- Alterados: apenas `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`.
- Fora de `IMPLEMENTATION_ROOT`: sim, apenas este relatorio tecnico permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Decisao

`MF8` fica `PASS_COM_RISCOS`. A implementacao real cobre os contratos essenciais dos 18 BKs e os gates MF8 diretos passam. O risco residual e operacional: a execucao final limpa da API continua dependente de uma PostgreSQL efemera segura em `TEST_DATABASE_URL`. A proxima acao correta e configurar essa base, correr `npm --prefix real_dev/api run test:integration` e depois `npm --prefix real_dev/api run test:final:prepare` sem skip; so depois `BK-MF8-17`/`BK-MF8-18` podem passar de `BLOQUEADO_AMBIENTE` para fecho limpo.

## Execucao 2026-07-07 - Reauditoria BK-MF8-18

- Projeto: `OPSA`
- Pedido atual: reauditar implementacao de `BK-MF8-18`
- Modo executado: `auditar_implementacao`
- Escopo auditado: `BK-MF8-18`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS_COM_RISCOS`
- Estado do BK: `BLOQUEADO` (`BLOQUEADO_AMBIENTE`)
- Findings ativos: 0 `P0`, 0 `P1`, 1 `P2`, 0 `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas esta nova seccao no relatorio tecnico de auditoria.

### Contrato auditado

`BK-MF8-18 - Correcao dos erros encontrados e reexecucao dos testes afetados` continua associado a `RNF39`, prioridade `P1`, owner `Oleksii`, apoio `Andre`, sprint `S12`, dependencia `BK-MF8-17` e fecho da sequencia `BK-MF8-16 -> BK-MF8-17 -> BK-MF8-18`.

O contrato esperado e consumir `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`, identificar o primeiro comando bloqueante, produzir `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`, expor `mf8:defect-report` e provar a decisao final com um verificador repetivel. O guia BK18 enumera as decisoes limpas `CORRIGIDO_REVALIDADO` e `SEM_CORRECAO_NECESSARIA`; nesta checkout a decisao observada e `BLOQUEADO_AMBIENTE`, aceite apenas como estado honesto de bloqueio, nao como fecho limpo do RNF39.

### Evidencia objetiva

| Area | Estado | Evidencia |
| --- | --- | --- |
| Canon MF8 | `OK` | `docs/RNF.md:121` define `RNF39`; `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:113-115`, `BACKLOG-MVP.md:266-268` e `CONTRATO-CAMPOS-BK.md:125-127` confirmam `BK-MF8-16 -> BK-MF8-17 -> BK-MF8-18`. |
| Guia BK18 | `OK_COM_RESSALVA` | O guia exige evidence BK17, verificador, script npm e relatorio BK18. A ressalva e que o guia so lista as duas decisoes limpas; o estado atual usa `BLOQUEADO_AMBIENTE` para nao converter falta de PostgreSQL em sucesso artificial. |
| Evidence BK16 | `OK_COM_RISCOS` | `docs/evidence/MF8/TESTES-EM-FALTA.md` existe; inventario/testes/gates passam com ressalva explicita para integracao MF2/MF3 sem `TEST_DATABASE_URL`. |
| Evidence BK17 | `OK_COM_BLOQUEIO` | `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` existe; decisao `BLOQUEADO_ATE_CORRECAO`; API `npm run test:final:prepare` exit `1`; web exit `0`; planificacao exit `0`. |
| Relatorio BK18 | `OK_COM_BLOQUEIO` | `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` existe; aponta para a evidence BK17, identifica `npm run test:final:prepare`, causa raiz `BLOQUEADO_AMBIENTE`, reexecucao `FAIL_AMBIENTE` e risco residual ligado a `TEST_DATABASE_URL`. |
| Verificador BK18 | `OK_COM_BLOQUEIO` | `real_dev/api/scripts/check-mf8-defect-report.mjs` existe; `node --check real_dev/api/scripts/check-mf8-defect-report.mjs` passou; `npm --prefix real_dev/api run mf8:defect-report` passou com `BK-MF8-18 validado: BLOQUEADO_AMBIENTE (npm run test:final:prepare)`. |
| Script npm BK18 | `OK` | `real_dev/api/package.json` expoe `"mf8:defect-report": "node scripts/check-mf8-defect-report.mjs"`. |
| Orquestrador BK17 | `OK_COM_CUIDADO` | `real_dev/api/scripts/run-mf8-final-validation.mjs` existe e `node --check` passou. Nao foi executado nesta reauditoria porque escreve `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`, e o modo atual e audit-only. |
| Integracao persistida sem env | `BLOQUEADO_AMBIENTE` | `printenv TEST_DATABASE_URL` saiu com exit code `1`; `npm --prefix real_dev/api run test:integration` falhou em MF2/MF3 exigindo `TEST_DATABASE_URL`; MF1 passou. |
| Integracao persistida com URL local | `BLOQUEADO_AMBIENTE` | `TEST_DATABASE_URL=postgresql://opsa_test:opsa_test@localhost:5432/opsa_test npm --prefix real_dev/api run test:integration` falhou em MF2/MF3 no `npx prisma migrate deploy` com `Schema engine error`. |
| API com skip explicito | `PASS_COM_RISCOS` | `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` passou: 79 unitarios, 120 contratos, MF6/MF7/MF8 passaram, com 2 skips explicitos em MF2/MF3. |
| Web final | `PASS` | `npm --prefix real_dev/web run test:final:prepare` passou: gates MF1, MF2, MF3, MF5, MF7, MF8, typecheck e build. |
| Planificacao | `PASS_COM_RESSALVAS` | `bash scripts/validate-planificacao.sh` saiu com exit code `0`, `overall_pass=true` e `advisory_pass=false` por advisories documentais legados, incluindo avisos de qualidade de guias fora do scope BK18. |
| `real_dev` em git | `OK_COM_NOTA` | `git check-ignore -v real_dev ...` confirma `.gitignore:4:real_dev/`; isto e esperado e nao e finding. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros auditados | Prova executada |
| --- | --- | --- | --- |
| `BK-MF8-18` | `RNF39` | `docs/planificacao/guias-bk/MF8/BK-MF8-18-correcao-dos-erros-encontrados-e-reexecucao-dos-testes-afetados.md`; `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`; `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`; `real_dev/api/package.json`; `real_dev/api/scripts/check-mf8-defect-report.mjs`; `real_dev/api/scripts/run-mf8-final-validation.mjs`; `real_dev/api/tests/integration`; `real_dev/web/package.json` | `node --check`; `npm --prefix real_dev/api run mf8:defect-report`; `npm --prefix real_dev/api run test:integration`; `TEST_DATABASE_URL=... npm --prefix real_dev/api run test:integration`; `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare`; `npm --prefix real_dev/web run test:final:prepare`; `bash scripts/validate-planificacao.sh`; scans estaticos. |

### Estado por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF8-18` | `BLOQUEADO` | Os artefactos e validadores do BK18 existem e foram reauditados com sucesso. O BK nao pode fechar como `OK`/`CORRIGIDO_REVALIDADO` porque a revalidacao limpa do comando afetado ainda depende de uma base PostgreSQL efemera funcional em `TEST_DATABASE_URL`. |

### Findings

| ID | Severidade | Estado | Evidencia | Expected | Observed | Impacto | Recomendacao |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `P1-BK-MF8-18-DEPENDENCIA-BK17-001` | `P1` | `CORRIGIDO_SEM_VALIDACAO_TOTAL` | `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` existe e contem decisao `BLOQUEADO_ATE_CORRECAO`, comando API `npm run test:final:prepare` com exit `1`, web exit `0` e planificacao exit `0`. | O BK18 deve consumir uma evidence BK17 persistida com decisao final, comando original e output observavel. | A evidence existe e e consumida pelo relatorio/verificador. A validacao limpa total ainda nao existe porque a API final bloqueia em MF2/MF3 sem BD efemera. | O P1 de ausencia de evidence deixou de se reproduzir; resta risco operacional de fecho sem BD real. | Manter este finding fechado como `CORRIGIDO_SEM_VALIDACAO_TOTAL`; reexecutar o fluxo limpo quando `TEST_DATABASE_URL` estiver funcional. |
| `P1-BK-MF8-18-DEFECT-REPORT-001` | `P1` | `CORRIGIDO` | `real_dev/api/scripts/check-mf8-defect-report.mjs` existe; `real_dev/api/package.json` expoe `mf8:defect-report`; `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` existe; `node --check` passou; `npm --prefix real_dev/api run mf8:defect-report` passou. | O BK18 deve entregar verificador, script npm e relatorio unico de correcao/bloqueio, ligado a evidence BK17. | O trio de artefactos existe e valida. A decisao final e `BLOQUEADO_AMBIENTE`, suportada por evidence e nao apresentada como fecho limpo. | O P1 ja nao bloqueia RNF39 ao nivel de artefactos/validador. | Manter corrigido; quando houver BD, atualizar o relatorio BK18 para `CORRIGIDO_REVALIDADO` apenas se o comando original passar sem skip. |
| `P2-BK-MF8-18-PERSISTENCE-001` | `P2` | `BLOQUEADO_AMBIENTE` | `npm --prefix real_dev/api run test:integration` falhou em MF2/MF3 sem `TEST_DATABASE_URL`; a tentativa com `postgresql://opsa_test:opsa_test@localhost:5432/opsa_test` falhou em `npx prisma migrate deploy` com `Schema engine error`; a bateria com `OPSA_SKIP_PERSISTENCE_TESTS=true` passou com 2 skips. | A reexecucao final deve provar a bateria API sem skip ou manter o bloqueio ambiental explicito. | O ambiente atual nao fornece PostgreSQL efemero funcional para MF2/MF3. | A MF8 nao deve ser fechada como revalidada limpa; a defesa fica com ressalva tecnica ate a BD existir. | Configurar uma PostgreSQL efemera cujo nome contenha `test`, `audit` ou `ci`, correr `npm --prefix real_dev/api run test:integration` e depois reexecutar o comando afetado sem `OPSA_SKIP_PERSISTENCE_TESTS=true`. |

Nao foram encontrados findings `P0` nem `P1` ativos nesta reauditoria. Os hits de scan estatico amplo ficaram classificados como ruido controlado: validacao do modulo proprio de troca de empresa ativa em MF0, testes negativos que rejeitam `req.body.companyId`/`req.query.companyId`, denylist/redaccao de segredos, gates que impedem OCR/RAG/embeddings e checks contra storage sensivel no frontend. O scan dirigido aos artefactos BK17/BK18 nao encontrou matches; o scan de drift de dominio nao encontrou referencias indevidas.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK_COM_RISCOS` | A bateria com skip explicito confirmou MF6, MF7 e MF8; a prova persistida MF2/MF3 continua dependente de `TEST_DATABASE_URL`. |
| `BK-MF8-16 -> BK-MF8-17` | `OK_COM_BLOQUEIO_AMBIENTE` | `TESTES-EM-FALTA.md` existe e o orquestrador BK17 existe; a evidence BK17 esta persistida, mas a decisao e `BLOQUEADO_ATE_CORRECAO` por falha API sem BD. |
| `BK-MF8-17 -> BK-MF8-18` | `OK_COM_BLOQUEIO_AMBIENTE` | O BK18 consome a evidence final, valida o relatorio de correcao e preserva a decisao bloqueada em vez de declarar sucesso artificial. |
| `MF8 -> MF seguinte` | `NAO_APLICAVEL` | A matriz termina em `BK-MF8-18`; nao ha BK seguinte canonico. |

### Validacoes executadas nesta reauditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_NOTA`; existem artefactos MF8 untracked ja presentes, preservados. |
| `git check-ignore -v real_dev real_dev/api/package.json real_dev/api/scripts/check-mf8-defect-report.mjs real_dev/api/scripts/run-mf8-final-validation.mjs real_dev/web/package.json` | `PASS_COM_NOTA`; `.gitignore:4:real_dev/` confirma a area ignorada esperada. |
| `node --check real_dev/api/scripts/check-mf8-defect-report.mjs` | `PASS`. |
| `node --check real_dev/api/scripts/run-mf8-final-validation.mjs` | `PASS`. |
| `npm --prefix real_dev/api run mf8:defect-report` | `PASS`; `BK-MF8-18 validado: BLOQUEADO_AMBIENTE (npm run test:final:prepare)`. |
| `printenv TEST_DATABASE_URL` | `FAIL_ESPERADO_AMBIENTE`; exit code `1`, variavel ausente. |
| `npm --prefix real_dev/api run test:integration` | `FAIL_AMBIENTE`; MF1 passou, MF2/MF3 falharam por falta de `TEST_DATABASE_URL`. |
| `TEST_DATABASE_URL=postgresql://opsa_test:opsa_test@localhost:5432/opsa_test npm --prefix real_dev/api run test:integration` | `FAIL_AMBIENTE`; MF2/MF3 falharam em `npx prisma migrate deploy` com `Schema engine error`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` | `PASS_COM_RISCOS`; 79 unitarios, 120 contratos, MF6/MF7/MF8 passaram, com 2 skips explicitos em MF2/MF3. |
| `npm --prefix real_dev/web run test:final:prepare` | `PASS`; gates frontend, typecheck e build passaram. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `advisory_pass=false` por advisories documentais legados fora deste scope. |
| Scan estatico dirigido a BK17/BK18 | `PASS`; sem matches de risco ou drift. |
| Scan estatico amplo em `real_dev/api` e `real_dev/web` | `PASS_COM_RUIDO_CONTROLADO`; matches esperados em validadores, testes negativos, denylist de segredos e gates que impedem claims proibidos. |

### Validacoes nao executadas

- `npm --prefix real_dev/api run mf8:final-validation` nao foi executado nesta reauditoria porque reescreve `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`; o modo atual e `auditar_implementacao` e `PERMITIR_ALTERAR_DOCS=nao`.
- `npm --prefix real_dev/api run test:final:prepare` sem skip nao foi repetido como bateria completa porque `npm --prefix real_dev/api run test:integration` reproduziu diretamente o mesmo bloqueio MF2/MF3 que interrompe essa bateria.
- Smoke browser manual nao foi executado; a prova frontend ficou nos scripts, typecheck e build.

### Decisao

`BK-MF8-18` fica `BLOQUEADO_AMBIENTE`, com resultado global `PASS_COM_RISCOS`. Os findings `P1` anteriores ja nao se reproduzem no estado atual: a evidence BK17 existe, o relatorio BK18 existe, o verificador existe e `mf8:defect-report` passa. O unico finding ativo e `P2-BK-MF8-18-PERSISTENCE-001`, porque a revalidacao limpa do comando afetado depende de uma PostgreSQL efemera funcional. A proxima acao correta e disponibilizar essa BD, correr a integracao MF2/MF3 sem skip e so depois atualizar a decisao BK18 para `CORRIGIDO_REVALIDADO`, caso o comando original passe.

## Atualizacao 2026-07-07 - Correcao BK-MF8-18

- Escopo: `BK-MF8-18`
- Modo que originou a atualizacao: `corrigir_auditoria`
- Relatorio de correcao: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- Finding `P1-BK-MF8-18-DEPENDENCIA-BK17-001`: `CORRIGIDO_SEM_VALIDACAO_TOTAL`
- Evidencia da correcao P1 dependencia: `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` existe e foi gerado por `npm --prefix real_dev/api run mf8:final-validation`; contem decisao `BLOQUEADO_ATE_CORRECAO`, API exit `1`, web exit `0` e planificacao exit `0`.
- Finding `P1-BK-MF8-18-DEFECT-REPORT-001`: `CORRIGIDO`
- Evidencia da correcao P1 defect report: `real_dev/api/scripts/check-mf8-defect-report.mjs` existe; `real_dev/api/package.json` expoe `mf8:defect-report`; `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` existe; `node --check real_dev/api/scripts/check-mf8-defect-report.mjs` passou; `npm --prefix real_dev/api run mf8:defect-report` passou com decisao `BLOQUEADO_AMBIENTE`.
- Finding `P2-BK-MF8-18-PERSISTENCE-001`: `BLOQUEADO_AMBIENTE`
- Evidencia do bloqueio P2: `npm --prefix real_dev/api run test:integration` falha em MF2/MF3 sem `TEST_DATABASE_URL`; a tentativa com `TEST_DATABASE_URL=postgresql://opsa_test:opsa_test@localhost:5432/opsa_test` falhou em `npx prisma migrate deploy` com `Schema engine error`; `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` passou com 2 skips explicitos.
- Decisao atual: `BK-MF8-18` deixa de estar bloqueado por falta de artefactos P1; fica `BLOQUEADO_AMBIENTE` ate existir uma base PostgreSQL efemera funcional para revalidar a bateria API sem skip.

## Execucao 2026-07-07 - Auditoria BK-MF8-18

- Projeto: `OPSA`
- Pedido atual: auditar implementacao de `BK-MF8-18`
- Modo executado: `auditar_implementacao`
- Escopo auditado: `BK-MF8-18`
- Implementation root auditado: `real_dev`
- Resultado global: `FAIL`
- Estado do BK: `FALHA`
- Findings ativos: 0 `P0`, 2 `P1`, 1 `P2`, 0 `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas esta nova seccao no relatorio tecnico de auditoria.

### Contrato auditado

`BK-MF8-18 - Correcao dos erros encontrados e reexecucao dos testes afetados` continua associado a `RNF39`, prioridade `P1`, owner `Oleksii`, apoio `Andre`, sprint `S12`, dependencia `BK-MF8-17` e fecho da sequencia `BK-MF8-16 -> BK-MF8-17 -> BK-MF8-18`.

O contrato esperado para esta auditoria:

- consumir `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` produzido pelo `BK-MF8-17`;
- identificar o primeiro comando bloqueante, ou confirmar explicitamente que nao havia erro bloqueante;
- criar `real_dev/api/scripts/check-mf8-defect-report.mjs`, mapeando o caminho publico `apps/api/scripts/check-mf8-defect-report.mjs` para `real_dev/api/scripts/check-mf8-defect-report.mjs`;
- expor `mf8:defect-report` em `real_dev/api/package.json`;
- criar `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` com causa raiz, ficheiros corrigidos, comando original, comando reexecutado, resultado e decisao final;
- aceitar apenas as decisoes `CORRIGIDO_REVALIDADO` ou `SEM_CORRECAO_NECESSARIA`;
- nao criar funcionalidades novas nem corrigir erros fora do comando afetado.

### Evidencia objetiva

| Area | Estado | Evidencia |
| --- | --- | --- |
| Canon MF8 | `OK` | `docs/RNF.md:119-121` define `RNF37..RNF39`; `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:113-115`, `BACKLOG-MVP.md:266-268` e `CONTRATO-CAMPOS-BK.md:125-127` confirmam `BK-MF8-16 -> BK-MF8-17 -> BK-MF8-18`. |
| Guia BK18 | `OK` | `docs/planificacao/guias-bk/MF8/BK-MF8-18-correcao-dos-erros-encontrados-e-reexecucao-dos-testes-afetados.md` exige evidence final BK17, verificador `check-mf8-defect-report.mjs`, script `mf8:defect-report` e relatorio `CORRECAO-ERROS-REPORT.md`. |
| Dependencia BK17 persistida | `FALHA` | `test -f docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` devolveu exit code `1`; no estado persistido nao ha comando original, stdout/stderr, decisao final nem handoff consumivel pelo BK18. |
| Orquestrador BK17 | `PARCIAL` | `real_dev/api/scripts/run-mf8-final-validation.mjs` existe e `node --check real_dev/api/scripts/run-mf8-final-validation.mjs` passou. O comando `mf8:final-validation` existe, mas a sua execucao escreve evidence fora do escopo permitido nesta auditoria. |
| Ensaio observado do orquestrador | `BLOQUEADO` | `npm --prefix real_dev/api run mf8:final-validation -- --help` foi executado e o script nao trata `--help` como dry-run; gerou temporariamente `EXECUCAO-FINAL-TESTES.md` com decisao `BLOQUEADO_ATE_CORRECAO`, API `npm run test:final:prepare` exit `1`, web exit `0` e planificacao exit `0`. O ficheiro gerado fora do escopo foi removido nesta mesma execucao para preservar `PERMITIR_ALTERAR_DOCS=nao`; a informacao fica registada apenas neste relatorio. |
| Verificador BK18 | `FALHA` | `test -f real_dev/api/scripts/check-mf8-defect-report.mjs` devolveu exit code `1`; `node --check real_dev/api/scripts/check-mf8-defect-report.mjs` falhou com `MODULE_NOT_FOUND`. |
| Script npm BK18 | `FALHA` | `npm --prefix real_dev/api run mf8:defect-report` falhou com `Missing script: "mf8:defect-report"`; `real_dev/api/package.json` nao expoe esse comando. |
| Relatorio BK18 | `FALHA` | `test -f docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` devolveu exit code `1`; nao existe decisao `CORRIGIDO_REVALIDADO` nem `SEM_CORRECAO_NECESSARIA`. |
| Execucao API sem skip | `BLOQUEADO_AMBIENTE` | `npm --prefix real_dev/api run test:integration` falhou em MF2/MF3 por falta de `TEST_DATABASE_URL`; a execucao final API observada pelo orquestrador tambem ficou bloqueada nesse ponto. |
| Execucao API com skip explicito | `PASS_COM_RISCOS` | `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` passou: 79 unitarios, 120 contratos, MF6/MF7/MF8 passaram, com 2 skips explicitos em MF2/MF3. |
| Execucao web final | `PASS` | `npm --prefix real_dev/web run test:final:prepare` passou: MF1, MF2, MF3, MF5, MF7, MF8, typecheck e build. |
| Validador documental | `PASS_COM_RESSALVAS` | `bash scripts/validate-planificacao.sh` saiu com exit code `0`, `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true` e `advisory_pass=false` por advisories legados. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros auditados | Prova executada |
| --- | --- | --- | --- |
| `BK-MF8-18` | `RNF39` | `docs/planificacao/guias-bk/MF8/BK-MF8-18-correcao-dos-erros-encontrados-e-reexecucao-dos-testes-afetados.md`; `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`; `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`; `real_dev/api/package.json`; `real_dev/api/scripts/run-mf8-final-validation.mjs`; `real_dev/api/scripts/check-mf8-defect-report.mjs`; `real_dev/api/tests/integration`; `real_dev/web/package.json` | `test -f` dos artefactos BK17/BK18; `node --check`; `npm --prefix real_dev/api run mf8:defect-report`; `npm --prefix real_dev/api run test:integration`; `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare`; `npm --prefix real_dev/web run test:final:prepare`; `bash scripts/validate-planificacao.sh`; scans estaticos. |

### Estado por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF8-18` | `FALHA` | O contrato de `RNF39` ainda nao esta materializado: falta a evidence persistida do BK17, falta o verificador do relatorio de defeitos, falta o script npm `mf8:defect-report` e falta o relatorio `CORRECAO-ERROS-REPORT.md`. O ensaio do orquestrador BK17 mostrou um bloqueio real na bateria API sem skip, logo o BK18 nao pode fechar como `SEM_CORRECAO_NECESSARIA`. |

### Findings

| ID | Severidade | Estado | Evidencia | Expected | Observed | Impacto | Recomendacao |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `P1-BK-MF8-18-DEPENDENCIA-BK17-001` | `P1` | `BLOQUEADO` | `test -f docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` exit `1`; ensaio do orquestrador gerou decisao temporaria `BLOQUEADO_ATE_CORRECAO` e foi removido por scope. | O BK18 deve consumir uma evidence BK17 persistida com decisao final, comando original e output observavel. | No estado final da auditoria, a evidence BK17 nao existe. | Sem essa fonte, o BK18 nao pode provar qual comando falhou, qual teste foi afetado ou se nao havia correcao necessaria. | Numa execucao com permissao para evidence, executar `npm --prefix real_dev/api run mf8:final-validation` e persistir `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`; se continuar bloqueado por ambiente, deixar essa decisao escrita. |
| `P1-BK-MF8-18-DEFECT-REPORT-001` | `P1` | `BLOQUEADO` | `test -f real_dev/api/scripts/check-mf8-defect-report.mjs` exit `1`; `node --check` -> `MODULE_NOT_FOUND`; `npm --prefix real_dev/api run mf8:defect-report` -> `Missing script`; `test -f docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` exit `1`. | O BK18 deve entregar verificador, script npm e relatorio unico de correcao/nao-correcao, validando `CORRIGIDO_REVALIDADO` ou `SEM_CORRECAO_NECESSARIA`. | Nenhum dos tres artefactos existe. | Bloqueia `RNF39`; nao ha prova de causa raiz, correcao minima, reexecucao do comando afetado ou decisao final. | Em modo `implementar` ou `corrigir_auditoria`, criar o verificador, adicionar `mf8:defect-report` e produzir `CORRECAO-ERROS-REPORT.md` a partir da evidence BK17 real. |
| `P2-BK-MF8-18-PERSISTENCE-001` | `P2` | `BLOQUEADO_AMBIENTE` | `npm --prefix real_dev/api run test:integration` falhou em MF2/MF3 com erro explicito a pedir `TEST_DATABASE_URL`; `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` passou com 2 skips. | A correcao/reexecucao final deve provar a bateria API sem skip ou assumir o bloqueio como decisao documentada. | Nao existe `TEST_DATABASE_URL` para base PostgreSQL efemera segura; a prova persistida MF2/MF3 nao corre. | Mesmo com verificador e relatorio, a decisao final limpa nao deve ser tomada sem resolver ou documentar este bloqueio. | Configurar `TEST_DATABASE_URL` cujo nome contenha `test`, `audit` ou `ci` e reexecutar a bateria API; sem ambiente, registar no relatorio BK18 que o erro e ambiental e que nao ha correcao de codigo segura. |

Nao foram encontrados findings `P0`. Os hits de scan estatico ficaram classificados como ruido controlado: verificacoes contra `localStorage`/`sessionStorage`, denylist de OCR/RAG/embeddings, testes negativos/redaccao de segredos e nomes de configuracao segura. O scan de drift de dominio nao encontrou referencias indevidas a outros produtos.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK_COM_RISCOS` | A bateria com skip explicito executou MF6, MF7 e MF8 com sucesso; a prova persistida MF2/MF3 permanece dependente de `TEST_DATABASE_URL`. |
| `BK-MF8-16 -> BK-MF8-17` | `OK_COM_RISCOS` | `TESTES-EM-FALTA.md` existe e o orquestrador BK17 esta tecnicamente presente; falta permissao/ambiente para persistir a evidence final limpa. |
| `BK-MF8-17 -> BK-MF8-18` | `BLOQUEADO` | O BK18 depende da evidence final BK17 e ela nao existe no estado final da auditoria. O ensaio temporario confirmou `BLOQUEADO_ATE_CORRECAO`, portanto nao e seguro fechar BK18 como sem correcao necessaria. |
| `MF8 -> MF seguinte` | `NAO_APLICAVEL` | A matriz termina em `BK-MF8-18`; o handoff de fecho e interno a MF8. |

### Validacoes executadas nesta auditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_NOTA`; worktree ja tinha artefactos MF8 untracked, preservados. |
| `git check-ignore -v real_dev real_dev/api/package.json real_dev/web/package.json` | `PASS_COM_NOTA`; `.gitignore:4:real_dev/` confirma que `real_dev/` e esperado como area ignorada. |
| `test -f docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` | `FAIL`; evidence final BK17 ausente no estado persistido. |
| `test -f docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` | `FAIL`; relatorio BK18 ausente. |
| `test -f real_dev/api/scripts/check-mf8-defect-report.mjs` | `FAIL`; verificador BK18 ausente. |
| `node --check real_dev/api/scripts/check-mf8-defect-report.mjs` | `FAIL`; `MODULE_NOT_FOUND`. |
| `npm --prefix real_dev/api run mf8:defect-report` | `FAIL`; script npm inexistente. |
| `node --check real_dev/api/scripts/run-mf8-final-validation.mjs` | `PASS`; orquestrador BK17 tem sintaxe valida. |
| `npm --prefix real_dev/api run mf8:final-validation -- --help` | `FAIL_COM_EFEITO_COLATERAL_REVERTIDO`; o script executou a bateria, escreveu temporariamente `EXECUCAO-FINAL-TESTES.md`, decidiu `BLOQUEADO_ATE_CORRECAO` por API exit `1` e o ficheiro foi removido para respeitar o scope audit-only. |
| `npm --prefix real_dev/api run test:integration` | `FAIL_AMBIENTE`; MF1 passou, MF2/MF3 falharam por falta de `TEST_DATABASE_URL`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` | `PASS_COM_RISCOS`; 79 unitarios, 120 contratos, MF6/MF7/MF8 passaram, com 2 skips explicitos em MF2/MF3. |
| `npm --prefix real_dev/web run test:final:prepare` | `PASS`; MF1, MF2, MF3, MF5, MF7, MF8, typecheck e build passaram. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, com `advisory_pass=false` por advisories documentais legados. |
| Scan estatico de risco em `real_dev/api/src`, `real_dev/api/scripts`, `real_dev/api/tests`, `real_dev/web/src`, `real_dev/web/scripts`, `docs/evidence/MF8` e guia BK18 | `PASS_COM_RUIDO_CONTROLADO`; sem finding novo para BK18. |
| Scan de drift de dominio no mesmo escopo | `PASS`; sem referencias indevidas a FaithFlix, StudyFlow, Orelle, cosmetica, biometria, streaming, turma, sala ou material de estudo. |

### Validacoes nao executadas

- `npm --prefix real_dev/api run mf8:defect-report` nao pode validar o relatorio BK18 porque o script npm e o verificador nao existem.
- Reexecucao do comando afetado em modo limpo nao foi concluida porque falta `TEST_DATABASE_URL` para MF2/MF3 persistidos.
- Smoke browser manual nao foi executado; a prova frontend ficou nos scripts, typecheck e build.
- `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` e `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` nao foram deixados alterados/criados porque a prompt atual so permite atualizar o relatorio tecnico de auditoria.

### Blockers e TODOs

- `BLOQUEADO`: gerar e persistir `EXECUCAO-FINAL-TESTES.md` numa execucao que permita evidence, ou registar explicitamente a decisao bloqueante quando o ambiente nao permitir prova limpa.
- `BLOQUEADO`: criar `check-mf8-defect-report.mjs`, `mf8:defect-report` e `CORRECAO-ERROS-REPORT.md` apenas em modo de implementacao/correcao, nao nesta auditoria.
- `BLOQUEADO_AMBIENTE`: configurar `TEST_DATABASE_URL` para base PostgreSQL efemera segura antes de tentar fechar `RNF39` como revalidado.

### Decisao

`BK-MF8-18` fica `FALHA` com resultado global `FAIL`. A app real tem parte da base tecnica anterior preparada, mas o fecho de `RNF39` nao existe: nao ha evidence final persistida do BK17, nao ha relatorio de correcao, nao ha verificador e nao ha script npm de defeitos. A proxima acao correta e executar uma prompt de `implementar` ou `corrigir_auditoria` com permissao explicita para evidence, primeiro fechando/persistindo `EXECUCAO-FINAL-TESTES.md` e depois criando/validando `CORRECAO-ERROS-REPORT.md`.

## Atualizacao 2026-07-07 - Correcao parcial BK-MF8-17

- Escopo: `BK-MF8-17`
- Modo que originou a atualizacao: `corrigir_auditoria`
- Relatorio de correcao: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- Finding `P1-BK-MF8-17-ORQUESTRADOR-001`: `PARCIALMENTE_CORRIGIDO`
- Evidencia da correcao P1: `real_dev/api/scripts/run-mf8-final-validation.mjs` existe; `real_dev/api/package.json` expoe `mf8:final-validation`; `node --check real_dev/api/scripts/run-mf8-final-validation.mjs` e `npm --prefix real_dev/api run syntax:check` passaram.
- Ressalva P1 ainda ativa: `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` nao foi gerado porque a prompt de correcao definiu `PERMITIR_ALTERAR_DOCS=nao` e a execucao completa do orquestrador escreve esse ficheiro de evidence.
- Finding `P2-BK-MF8-17-PERSISTENCE-001`: `BLOQUEADO_AMBIENTE`
- Evidencia do bloqueio P2: `TEST_DATABASE_URL` continua ausente; `npm --prefix real_dev/api run test:final:prepare` falhou em MF2/MF3 persistidos; `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` passou com 2 skips explicitos.
- Decisao atual: `BK-MF8-17` fica com correcao tecnica parcial, mas continua bloqueado para fecho limpo ate ser permitido gerar `EXECUCAO-FINAL-TESTES.md` e ate existir `TEST_DATABASE_URL` para a prova persistida real.

## Execucao 2026-07-07 - Auditoria BK-MF8-17

- Projeto: `OPSA`
- Pedido atual: auditar implementacao de `BK-MF8-17`
- Modo executado: `auditar_implementacao`
- Escopo auditado: `BK-MF8-17`
- Implementation root auditado: `real_dev`
- Resultado global: `FAIL`
- Estado do BK: `FALHA`
- Findings ativos: 0 `P0`, 1 `P1`, 1 `P2`, 0 `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas esta nova seccao no relatorio tecnico de auditoria.

### Contrato auditado

`BK-MF8-17 - Execucao final de testes` continua associado a `RNF38`, prioridade `P1`, owner `Andre`, apoio `Oleksii`, sprint `S12`, dependencia `BK-MF8-16` e sequencia `BK-MF8-16 -> BK-MF8-17 -> BK-MF8-18`.

O contrato esperado para esta auditoria:

- consumir `docs/evidence/MF8/TESTES-EM-FALTA.md` criada no `BK-MF8-16`;
- criar `real_dev/api/scripts/run-mf8-final-validation.mjs`, mapeando o caminho publico `apps/api/scripts/run-mf8-final-validation.mjs` para `real_dev/api/scripts/run-mf8-final-validation.mjs`;
- expor `mf8:final-validation` em `real_dev/api/package.json`;
- executar, via orquestrador, `test:final:prepare` na API, `test:final:prepare` na web e `bash scripts/validate-planificacao.sh`;
- gerar `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` com precondicoes, comandos, stdout/stderr, exit codes, decisao final e handoff para `BK-MF8-18`;
- nao corrigir bugs nem alterar contratos de testes nesta auditoria.

### Evidencia objetiva

| Area | Estado | Evidencia |
| --- | --- | --- |
| Canon MF8 | `OK` | `docs/RNF.md:119-121` define `RNF37..RNF39`; `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:113-115`, `BACKLOG-MVP.md:266-268` e `CONTRATO-CAMPOS-BK.md:125-127` confirmam `BK-MF8-16 -> BK-MF8-17 -> BK-MF8-18`. |
| Guia BK17 | `OK` | `docs/planificacao/guias-bk/MF8/BK-MF8-17-execucao-final-de-testes.md:32-40` exige orquestrador, script npm, bateria API/web, validador de planificacao e evidence final; `:751-760` lista os criterios de aceite. |
| Evidence de entrada BK16 | `OK_COM_RISCOS` | `docs/evidence/MF8/TESTES-EM-FALTA.md:18-22` existe e documenta inventario, contratos, bateria API com skip, bateria web e bloqueio ambiental; `:57-72` exige `TEST_DATABASE_URL` antes de decidir `PODE_AVANCAR` sem ressalva. |
| Bateria API/web preparada | `PARCIAL` | `real_dev/api/package.json:13-24` e `:46` expõem `syntax:check`, unit, contracts, integration, MF8 e `test:final:prepare`; `real_dev/web/package.json:21-27` expoe `test:mf7`, `test:mf8`, `test:final:prepare` e `typecheck`. |
| Orquestrador final | `FALHA` | `test -f real_dev/api/scripts/run-mf8-final-validation.mjs` devolveu exit code `1`; `node --check real_dev/api/scripts/run-mf8-final-validation.mjs` falhou com `MODULE_NOT_FOUND`. |
| Script npm final | `FALHA` | `npm --prefix real_dev/api run mf8:final-validation` falhou com `Missing script: "mf8:final-validation"`; `real_dev/api/package.json:46-47` termina o bloco de scripts em `test:final:prepare`, sem `mf8:final-validation`. |
| Evidence final BK17 | `FALHA` | `test -f docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` devolveu exit code `1`; nao existe decisao final, stdout/stderr, exit code nem handoff gerado pelo BK17. |
| Execucao API sem skip | `BLOQUEADO` | `npm --prefix real_dev/api run test:final:prepare` falhou em MF2/MF3 porque `TEST_DATABASE_URL` nao esta definido; MF1 passou, unit e contracts passaram. |
| Execucao API com skip explicito | `PASS_COM_RISCOS` | `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` passou; 79 unitarios, 120 contratos, MF6/MF7/MF8 passaram, com 2 skips explicitos de integracao MF2/MF3. |
| Execucao web final | `PASS` | `npm --prefix real_dev/web run test:final:prepare` passou: MF1, MF2, MF3, MF5, MF7, MF8, typecheck e build. |
| Validador documental | `PASS_COM_RESSALVAS` | `bash scripts/validate-planificacao.sh` saiu com exit code `0`, `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true` e `advisory_pass=false` por advisories legados. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros auditados | Prova executada |
| --- | --- | --- | --- |
| `BK-MF8-17` | `RNF38` | `docs/planificacao/guias-bk/MF8/BK-MF8-17-execucao-final-de-testes.md`; `docs/evidence/MF8/TESTES-EM-FALTA.md`; `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`; `real_dev/api/package.json`; `real_dev/web/package.json`; `real_dev/api/scripts`; `real_dev/web/scripts` | `test -f` do orquestrador/evidence; `node --check` do orquestrador esperado; `npm --prefix real_dev/api run mf8:final-validation`; `npm --prefix real_dev/api run test:final:prepare`; `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare`; `npm --prefix real_dev/web run test:final:prepare`; `npm --prefix real_dev/api run test:mf8`; `bash scripts/validate-planificacao.sh`; scans estaticos. |

### Estado por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF8-17` | `FALHA` | O nucleo de `RNF38` ainda nao esta materializado: falta o orquestrador `run-mf8-final-validation.mjs`, falta o script npm `mf8:final-validation` e falta `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`. A bateria preparada pelo BK16 existe parcialmente, mas nao substitui a execucao final reproducivel e documentada que este BK deve entregar. |

### Findings

| ID | Severidade | Estado | Evidencia | Expected | Observed | Impacto | Recomendacao |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `P1-BK-MF8-17-ORQUESTRADOR-001` | `P1` | `BLOQUEADO` | `test -f real_dev/api/scripts/run-mf8-final-validation.mjs` exit `1`; `node --check real_dev/api/scripts/run-mf8-final-validation.mjs` -> `MODULE_NOT_FOUND`; `npm --prefix real_dev/api run mf8:final-validation` -> `Missing script`; `test -f docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` exit `1`. | O BK17 deve entregar orquestrador, script npm e evidence final unica com decisao e handoff. | Nenhum dos tres artefactos existe na implementacao real. | Bloqueia `RNF38`: nao ha execucao final reprodutivel antes de entrega/defesa, nem fonte objetiva para `BK-MF8-18`. | Em modo `implementar` ou `corrigir_auditoria`, criar `real_dev/api/scripts/run-mf8-final-validation.mjs`, adicionar `mf8:final-validation` ao package da API e gerar `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` com resultados reais. |
| `P2-BK-MF8-17-PERSISTENCE-001` | `P2` | `BLOQUEADO` | `printenv TEST_DATABASE_URL` exit `1`; `npm --prefix real_dev/api run test:final:prepare` falhou nos testes `mf2-persistence` e `mf3-persistence`; a variante com `OPSA_SKIP_PERSISTENCE_TESTS=true` passou com 2 skips explicitos. | A execucao final limpa deve correr a bateria API sem skip ou, se falhar, registar decisao bloqueante no ficheiro de evidence final. | Nao existe base PostgreSQL efemera configurada; MF2/MF3 persistidos recusam correr sem `TEST_DATABASE_URL`. | Mesmo depois de existir orquestrador, a decisao final nao deve ser `PODE_AVANCAR_PARA_BK-MF8-18` enquanto esta prova persistida nao correr ou ficar explicitamente classificada como bloqueante. | Configurar `TEST_DATABASE_URL` para base efemera cujo nome contenha `test`, `audit` ou `ci` e reexecutar a bateria API sem `OPSA_SKIP_PERSISTENCE_TESTS=true`; se nao houver ambiente, deixar a evidence final com decisao bloqueante. |

Nao foram encontrados findings `P0` nesta auditoria. Tambem nao foram abertos findings novos para os hits de scans estaticos: as ocorrencias analisadas correspondem a checks contra storage sensivel, denylist de OCR/RAG/embeddings, redaccao de segredos, testes negativos ou filtros `companyId` por contexto backend.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK_COM_RISCOS` | `test:final:prepare` com skip explicito executou MF6, MF7 e MF8; a modularidade, exportacoes/importacoes, SAF-T readiness, email e modulos criticos continuam cobertos por gates. A prova sem skip permanece bloqueada por `TEST_DATABASE_URL`. |
| `BK-MF8-16 -> BK-MF8-17` | `REGRESSAO_DE_HANDOFF` | `BK-MF8-16` entregou `TESTES-EM-FALTA.md` e os scripts `test:final:prepare`; `BK-MF8-17` nao materializou o orquestrador nem a evidence que consome esse handoff. |
| `BK-MF8-17 -> BK-MF8-18` | `BLOQUEADO` | `BK-MF8-18` depende de `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`; esse ficheiro nao existe, logo nao ha comando original, erro observado, decisao final nem teste afetado para corrigir. |
| `MF8 -> MF seguinte` | `NAO_APLICAVEL` | A matriz termina em `BK-MF8-18`; a coerencia seguinte foi avaliada pela cadeia interna `BK-MF8-17 -> BK-MF8-18`. |

### Validacoes executadas nesta auditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_NOTA`; worktree ja tinha artefactos nao versionados, incluindo relatorios/evidence MF8, preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS_COM_NOTA`; `.gitignore:4:real_dev/` confirma que `real_dev/` e esperado como area ignorada. |
| `test -f real_dev/api/scripts/run-mf8-final-validation.mjs` | `FAIL`; ficheiro ausente. |
| `node --check real_dev/api/scripts/run-mf8-final-validation.mjs` | `FAIL`; `MODULE_NOT_FOUND`. |
| `npm --prefix real_dev/api run mf8:final-validation` | `FAIL`; script npm inexistente. |
| `test -f docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` | `FAIL`; evidence final ausente. |
| `printenv TEST_DATABASE_URL` | `FAIL_AMBIENTE`; variavel ausente. |
| `npm --prefix real_dev/api run test:final:prepare` | `FAIL_AMBIENTE`; unitarios e contratos passaram, mas `test:integration` falhou em MF2/MF3 por falta de `TEST_DATABASE_URL`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` | `PASS_COM_RISCOS`; 79 unitarios, 120 contratos, MF6/MF7/MF8 passaram; 2 skips explicitos em MF2/MF3. |
| `npm --prefix real_dev/api run test:mf8` | `PASS`; subscricoes, IA explicavel, IA governada, docs tecnicos, inventario e contrato do inventario passaram. |
| `npm --prefix real_dev/web run test:final:prepare` | `PASS`; MF1, MF2, MF3, MF5, MF7, MF8, typecheck e build passaram. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, com `advisory_pass=false` por advisories documentais legados. |
| Scan estatico de risco em `real_dev/api/src`, `real_dev/api/scripts`, `real_dev/api/tests`, `real_dev/web/src`, `real_dev/web/scripts` e evidence/guia BK17 | `PASS_COM_RUIDO_CONTROLADO`; hits analisados em checks, denylist, testes negativos e redaccao de segredos; sem finding novo para BK17. |
| Scan de drift de dominio no mesmo escopo | `PASS`; sem referencias indevidas a FaithFlix, StudyFlow, Orelle, cosmetica, biometria, streaming, turma, sala ou material de estudo. |

### Validacoes nao executadas

- `npm --prefix real_dev/api run mf8:final-validation` nao pode executar a bateria final porque o script npm nao existe.
- `rg -n "Decisao final|BLOQUEANTE|PODE_AVANCAR|BLOQUEADO_ATE_CORRECAO|test:final:prepare" docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md` nao foi executado porque o ficheiro de evidence final nao existe.
- Prova persistida MF2/MF3 com base real nao foi executada porque `TEST_DATABASE_URL` nao esta configurada.
- Smoke browser manual nao foi executado; a prova frontend ficou nos scripts, typecheck e build.

### Blockers e TODOs

- `BLOQUEADO`: implementar ou corrigir o BK17 exige alterar `real_dev/api/scripts/run-mf8-final-validation.mjs`, `real_dev/api/package.json` e criar/recriar `docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md`; o modo atual e apenas auditoria.
- `BLOQUEADO_AMBIENTE`: a decisao final limpa exige `TEST_DATABASE_URL` para uma base PostgreSQL efemera segura, ou a evidence deve assumir a falha como bloqueante.
- TODO para `BK-MF8-18`: nao iniciar correcao/reexecucao ate existir `EXECUCAO-FINAL-TESTES.md` com comando original e decisao final.

### Decisao

`BK-MF8-17` fica `FALHA` com resultado global `FAIL`. A app real tem uma bateria API/web preparada pelo BK16 e parte substancial dos gates passa, mas o contrato proprio de `RNF38` esta em falta: nao existe orquestrador final, nao existe comando npm final e nao existe evidence final. A proxima acao correta e executar uma prompt de `implementar` ou `corrigir_auditoria` para criar esses artefactos e repetir a validacao com `TEST_DATABASE_URL` efemera, ou registar a decisao bloqueante na evidence final se o ambiente continuar indisponivel.

## Atualizacao 2026-07-07 - Correcao parcial BK-MF8-16

- Escopo: `BK-MF8-16`
- Finding corrigido: `P2-BK-MF8-16-EVIDENCE-001`
- Estado atual do finding: `CORRIGIDO`
- Evidence criada: `docs/evidence/MF8/TESTES-EM-FALTA.md`
- Relatorio de correcao: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- Finding ainda ativo: `P2-BK-MF8-16-PERSISTENCE-001`, bloqueado por ambiente ate existir `TEST_DATABASE_URL` para base PostgreSQL efemera segura.
- Nota: esta atualizacao nao reaudita todo o BK; apenas regista a correcao documental/evidencial autorizada posteriormente.

## Execucao 2026-07-07 - Auditoria BK-MF8-16

- Projeto: `OPSA`
- Pedido atual: auditar implementacao de `BK-MF8-16`
- Modo executado: `auditar_implementacao`
- Escopo auditado: `BK-MF8-16`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS_COM_RISCOS`
- Estado do BK: `AUDITADO_COM_FINDINGS`
- Findings ativos: 0 `P0`, 0 `P1`, 2 `P2`, 0 `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas esta nova seccao no relatorio tecnico de auditoria.

### Contrato auditado

`BK-MF8-16 - Verificacao dos testes atuais e criacao dos testes em falta` continua associado a `RNF37`, prioridade `P1`, owner `Oleksii`, apoio `Andre`, sprint `S12`, dependencias formais `-` e sequencia `BK-MF8-15 -> BK-MF8-16 -> BK-MF8-17`.

O contrato esperado para esta auditoria:

- rever testes existentes e criar testes em falta para fluxos criticos;
- manter uma matriz minima de cobertura `MF0..MF8` por camadas de prova;
- expor um gate repetivel de inventario e respetivo teste positivo/negativo;
- publicar `test:mf8` e `test:final:prepare` em API e web;
- entregar handoff concreto para `BK-MF8-17`;
- nao editar codigo, guias canonicos, RF/RNF, backlog, evidence ou commits nesta auditoria.

### Evidencia objetiva

| Area | Estado | Evidencia |
| --- | --- | --- |
| Canon MF8 | `OK` | `docs/RNF.md` define `RNF37`; `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md` confirmam `BK-MF8-16`, owner, prioridade, sprint, sem dependencias formais e proximo BK `BK-MF8-17`. |
| Guia BK16 | `OK` | `docs/planificacao/guias-bk/MF8/BK-MF8-16-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md` exige inventario, teste de contrato, scripts MF8/final, evidence `TESTES-EM-FALTA.md` e handoff para BK17. |
| Script de inventario | `OK` | `real_dev/api/scripts/check-mf8-test-inventory.mjs` declara `CRITICAL_FLOWS` de `MF0` a `MF8`, scripts obrigatorios API/web, leitura recursiva, avaliacao de lacunas e output Markdown. |
| Teste do inventario | `OK` | `real_dev/api/tests/contracts/mf8-test-inventory-contracts.test.js` cobre positivo completo e negativo sem provas/gates MF8. |
| Lacuna MF1 fechada | `OK` | `real_dev/api/tests/integration/mf1-sales-purchases-treasury-flow.test.js` cobre recebimentos/pagamentos, empresa ativa e negativo multiempresa. |
| Scripts API/web | `OK` | `real_dev/api/package.json` e `real_dev/web/package.json` expoem `test:mf8` e `test:final:prepare`; API tambem expoe `test:mf8:inventory` e `test:mf8:inventory-contracts`. |
| Evidence dedicada BK16 | `FINDING` | `test -f docs/evidence/MF8/TESTES-EM-FALTA.md` terminou com exit code `1`; o ficheiro exigido pelo guia e consumido pelo BK17 nao existe. |
| Ambiente persistido | `FINDING` | `printenv TEST_DATABASE_URL` terminou com exit code `1`; `test:final:prepare` API so foi auditado com `OPSA_SKIP_PERSISTENCE_TESTS=true`, saltando MF2/MF3 persistidos. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros auditados | Prova executada |
| --- | --- | --- | --- |
| `BK-MF8-16` | `RNF37` | `real_dev/api/scripts/check-mf8-test-inventory.mjs`; `real_dev/api/tests/contracts/mf8-test-inventory-contracts.test.js`; `real_dev/api/tests/integration/mf1-sales-purchases-treasury-flow.test.js`; `real_dev/api/package.json`; `real_dev/web/package.json`; `real_dev/web/scripts/check-mf2-pages.mjs`; `real_dev/web/scripts/check-mf5-feedback.mjs` | `test:mf8:inventory`, `test:mf8:inventory-contracts`, integracao MF1, `test:mf8` API/web, `test:final:prepare` API/web, `prisma:validate`, `validate-planificacao.sh`, scans estaticos e whitespace. |

### Estado por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF8-16` | `AUDITADO_COM_FINDINGS` | A implementacao real cumpre o nucleo executavel de `RNF37`: inventario `MF0..MF8`, gates e testes passam. O fecho completo fica com riscos porque falta a evidence dedicada `TESTES-EM-FALTA.md` e a validacao persistida MF2/MF3 nao correu sem skip por ausencia de `TEST_DATABASE_URL`. |

### Findings

| ID | Severidade | Estado | Evidencia | Expected | Observed | Impacto | Recomendacao |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `P2-BK-MF8-16-EVIDENCE-001` | `P2` | `BLOQUEADO_POR_SCOPE` | `test -f docs/evidence/MF8/TESTES-EM-FALTA.md` devolveu exit code `1`; o diretorio `docs/evidence/MF8/` nao contem esse ficheiro. | O guia BK16 pede `docs/evidence/MF8/TESTES-EM-FALTA.md` preenchido com comandos, matriz, lacunas, negativos e handoff. | A evidence dedicada nao existe; a prompt atual define `PERMITIR_ALTERAR_DOCS=nao`, portanto a auditoria nao a pode criar. | O runtime nao fica quebrado, mas o BK17 canonico consome esta evidence e deve bloquear a execucao final se ela faltar. | Quando houver permissao explicita para alterar evidence, criar/preencher `docs/evidence/MF8/TESTES-EM-FALTA.md` com os outputs auditados e decisao de lacunas. |
| `P2-BK-MF8-16-PERSISTENCE-001` | `P2` | `BLOQUEADO_AMBIENTE` | `printenv TEST_DATABASE_URL` devolveu exit code `1`; `test:integration` dentro de `test:final:prepare` passou com 2 skips explicitos por `OPSA_SKIP_PERSISTENCE_TESTS=true`. | A bateria final deve conseguir validar integracao persistida MF2/MF3 contra uma base efemera segura antes da decisao final. | MF1 integrou e passou; MF2/MF3 persistidos foram saltados explicitamente por falta de `TEST_DATABASE_URL`. | Ha cobertura estatica/contratual e inventario OK, mas falta prova persistida real para parte dos fluxos criticos inventariados. | Em `BK-MF8-17`, configurar `TEST_DATABASE_URL` para base PostgreSQL efemera com nome `test`, `audit` ou `ci` e reexecutar `npm --prefix real_dev/api run test:final:prepare` sem skip. |

Nao foram encontrados findings `P0` ou `P1` no escopo estrito de `BK-MF8-16`.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `test:final:prepare` API executou `test:mf7` e `test:mf8`; os contratos MF7 de retencao, email, exportacoes, importacoes, SAF-T, modularidade e modulos criticos passaram. |
| `BK-MF8-15 -> BK-MF8-16` | `OK` | O inventario inclui `test:mf8:formatters`; `npm --prefix real_dev/web run test:mf8` passou com subscriptions UI, UI alignment, formatters, typecheck e build. |
| `BK-MF8-16 -> BK-MF8-17` | `OK_COM_RISCOS` | Os comandos `test:final:prepare` existem e passaram com ressalva na API. O handoff fica incompleto enquanto `TESTES-EM-FALTA.md` nao existir e enquanto os testes persistidos MF2/MF3 dependerem de skip. |
| `MF8 -> MF seguinte` | `NAO_APLICAVEL` | A matriz lida termina em `MF8`; a coerencia seguinte foi avaliada pela cadeia `BK-MF8-16 -> BK-MF8-17 -> BK-MF8-18`. |

### Validacoes executadas nesta auditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_NOTA`; artefactos MF8 untracked preexistentes preservados. |
| `git check-ignore -v real_dev real_dev/api/package.json real_dev/web/package.json real_dev/api/scripts/check-mf8-test-inventory.mjs` | `PASS_COM_NOTA`; `.gitignore:4:real_dev/` confirma que `real_dev/` e esperado como area ignorada. |
| `npm --prefix real_dev/api run test:mf8:inventory` | `PASS`; matriz `MF0..MF8` toda `OK`; 8 unitarios API, 22 contratos API, 3 integracoes API, 16 scripts API e 14 scripts frontend; sem lacunas criticas. |
| `npm --prefix real_dev/api run test:mf8:inventory-contracts` | `PASS`; 2 testes, 2 pass, positivo e negativo. |
| `node --test real_dev/api/tests/integration/mf1-sales-purchases-treasury-flow.test.js` | `PASS`; 2 testes, incluindo negativo multiempresa. |
| `npm --prefix real_dev/api run test:mf8` | `PASS`; subscricoes, IA explicavel, IA governada, docs tecnicos, inventario e contrato do inventario. |
| `npm --prefix real_dev/web run test:mf8` | `PASS`; subscriptions UI, UI alignment, formatters, typecheck e build. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` | `PASS_COM_RISCOS`; 79 unitarios, 120 contratos, MF6/MF7/MF8 passaram; integracao teve 2 pass e 2 skips explicitos para MF2/MF3 persistidos. |
| `npm --prefix real_dev/web run test:final:prepare` | `PASS`; MF1, MF2, MF3, MF5, MF7, MF8, typecheck e build passaram. |
| `DATABASE_URL=postgresql://opsa_test:opsa_test@localhost:5432/opsa_test npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories documentais legados. |
| Scan estatico nos ficheiros BK16 alterados | `PASS`; sem TODO/FIXME, storage sensivel, execucao dinamica, segredos hardcoded, casts inseguros, CORS permissivo, RAG/OCR/embeddings ou drift de dominio. |
| Scan estatico amplo em `real_dev/api real_dev/web` | `PASS_COM_RUIDO_CONTROLADO`; hits apenas em denylist de segredos, testes negativos/redaccao, checks contra storage e scripts que bloqueiam OCR/RAG/embeddings. Sem finding ligado ao BK16. |
| `git diff --check` | `PASS`; sem whitespace errors tracked. |
| `rg -n "[ \\t]+$" ...ficheiros auditados...` | `PASS`; sem trailing whitespace nos ficheiros auditados antes desta escrita. |

### Validacoes nao executadas

- `npm --prefix real_dev/api run test:final:prepare` sem `OPSA_SKIP_PERSISTENCE_TESTS=true` nao foi executado porque `TEST_DATABASE_URL` nao esta configurada neste ambiente; os proprios testes MF2/MF3 exigem essa variavel ou skip explicito.
- `docs/evidence/MF8/TESTES-EM-FALTA.md` nao foi criado/preenchido porque a prompt atual define `PERMITIR_ALTERAR_DOCS=nao`; apenas este relatorio tecnico podia ser atualizado.
- Smoke browser manual nao foi executado; a prova frontend ficou em scripts, typecheck e build.

### Blockers e TODOs

- `BLOQUEADO_POR_SCOPE`: criar evidence dedicada `docs/evidence/MF8/TESTES-EM-FALTA.md` exige permissao documental explicita.
- `BLOQUEADO_AMBIENTE`: validacao persistida MF2/MF3 exige `TEST_DATABASE_URL` para base PostgreSQL efemera segura.
- TODO para `BK-MF8-17`: reexecutar a bateria API sem skip quando a base estiver disponivel, ou documentar a decisao se a defesa aceitar o skip.

### Decisao

`BK-MF8-16` fica `AUDITADO_COM_FINDINGS` com resultado `PASS_COM_RISCOS`. O nucleo executavel de `RNF37` esta presente e validado: inventario `MF0..MF8`, teste positivo/negativo, agregadores API/web e handoff tecnico existem. Os riscos restantes nao sao regressao de codigo, mas impedem chamar o fecho de totalmente limpo: falta a evidence dedicada exigida pelo guia/BK17 e falta execucao persistida MF2/MF3 sem skip.

## Execucao 2026-07-07 - Auditoria BK-MF8-15

- Projeto: `OPSA`
- Pedido atual: auditar implementacao de `BK-MF8-15`
- Modo executado: `auditar_implementacao`
- Escopo auditado: `BK-MF8-15`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS_COM_RISCOS`
- Estado do BK: `AUDITADO_OK_COM_RESSALVAS`
- Findings ativos no runtime BK15: nenhum `P0`, `P1` ou `P2`
- Ressalvas: 1 `P3` documental bloqueado por scope e 1 validacao fora do escopo BK15
- Commits: nenhum
- Alteracoes desta execucao: apenas esta nova seccao no relatorio tecnico de auditoria.

### Contrato auditado

`BK-MF8-15 - Datas, moedas e separadores no padrao europeu` continua associado a `RNF36`, prioridade `P1`, owner `Sofia`, apoio `Pedro`, sprint `S12`, dependencias formais `-` e sequencia `BK-MF8-14 -> BK-MF8-15 -> BK-MF8-16`.

O contrato esperado para esta auditoria:

- centralizar `pt-PT` no frontend para datas, euros, inteiros, decimais, percentagens e valores genericos de tabela;
- manter API, base de dados e valores tecnicos intactos, incluindo centimos, datas ISO e basis points;
- integrar a regra central em MF1, MF2, tabela responsiva transversal e subscricoes simuladas sem alterar autorizacao, roles, endpoints, Prisma ou regras contabilisticas;
- expor o gate `test:mf8:formatters` para o inventario de testes do `BK-MF8-16`;
- preservar o escopo estrito da prompt atual: sem editar codigo, guias canonicos, RF/RNF, backlog, evidence ou commits.

### Evidencia objetiva

| Area | Estado | Evidencia |
| --- | --- | --- |
| Canon MF8 | `OK` | `docs/RNF.md:110`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:111-113`, `docs/planificacao/backlogs/BACKLOG-MVP.md:136-138`, `:264-266` e `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:123-125` confirmam `RNF36`, owner, prioridade e sequencia BK14/BK15/BK16. |
| Guia BK15 | `OK` | `docs/planificacao/guias-bk/MF8/BK-MF8-15-datas-moedas-e-separadores-no-padrao-europeu.md` define formatadores PT-PT, integracoes MF1/MF2/tabela responsiva, gate `check-mf8-formatters.mjs` e evidence dedicada. |
| Formatadores centrais | `OK` | `real_dev/web/src/lib/formatters.ts` exporta `PORTUGAL_LOCALE`, `DEFAULT_CURRENCY`, `formatEuroFromCents`, `formatDecimalPt`, `formatIntegerPt`, `formatPercentFromBasisPoints`, `formatPortugueseDate` e `formatDisplayValue`; usa `Intl`, `formatToParts` e validacoes de centimos/data impossivel. |
| Integracao MF1/MF2 | `OK` | `real_dev/web/src/lib/mf1FormUtils.ts` delega em `formatDisplayValue`; `real_dev/web/src/pages/mf1Pages.tsx` e `real_dev/web/src/pages/mf2Pages.tsx` passam `column` para `formatValue(row[column], column)`. |
| Tabela transversal | `OK` | `real_dev/web/src/ui/ResponsiveDataTable.tsx` usa `formatDisplayValue(column, value)` em tabela desktop e cartoes mobile. |
| Subscricoes simuladas | `OK` | `real_dev/web/src/lib/subscriptionsApi.ts` usa `formatEuroFromCents(plan.priceCents)` e `real_dev/web/src/pages/SubscriptionsPage.tsx` usa `formatPortugueseDate` para datas da subscricao. |
| Gate BK15 | `OK` | `real_dev/web/scripts/check-mf8-formatters.mjs` valida exports, locale, moeda, separador de milhar, negativos e script no package; `real_dev/web/package.json` expoe `test:mf8:formatters`. |
| Evidence dedicada BK15 | `P3` | `test -f docs/evidence/MF8/BK-MF8-15.md` falhou. A prompt atual define `PERMITIR_ALTERAR_DOCS=nao`, pelo que a evidence dedicada nao foi criada nesta auditoria. |

### Findings e ressalvas

| ID | Severidade | Estado | Evidencia | Impacto | Recomendacao |
| --- | --- | --- | --- | --- | --- |
| `P3-BK-MF8-15-EVIDENCE-001` | `P3` | `BLOQUEADO_POR_SCOPE` | `docs/evidence/MF8/BK-MF8-15.md` nao existe; o guia BK15 pede evidence dedicada, mas a prompt atual bloqueia alteracoes documentais fora do relatorio tecnico. | Nao bloqueia o runtime nem o cumprimento de `RNF36`, mas deixa falta de artefacto dedicado para defesa/revisao. | Criar `docs/evidence/MF8/BK-MF8-15.md` quando houver permissao explicita para alterar evidence. |
| `P3-VALIDACAO-FORA_SCOPE-MF2-001` | `P3` | `FORA_SCOPE` | `npm --prefix real_dev/web run test:mf2` falhou em `Fluxo BK-MF2-07 na UI em falta: Descarregar balancete Excel`; `real_dev/web/src/pages/mf2Pages.tsx` tem labels atuais `Balancete {format.toUpperCase()}` e `Razao/Razao {format.toUpperCase()}`. | Nao e regressao BK15; a alteracao BK15 em MF2 limita-se a passar `column` ao formatador. Afeta apenas a limpeza da bateria global se o smoke MF2 continuar desalinhado. | Corrigir o smoke MF2 ou os labels numa tarefa propria de MF2, sem misturar com `BK-MF8-15`. |

Nao foram identificados findings `P0`, `P1` ou `P2` no escopo estrito de `BK-MF8-15`.

### Validacoes executadas nesta auditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_NOTA`; artefactos MF8 untracked ja existentes foram preservados. |
| `git check-ignore -v real_dev/web/src/lib/formatters.ts real_dev/web/scripts/check-mf8-formatters.mjs real_dev/web/package.json` | `PASS_COM_NOTA`; `.gitignore:4:real_dev/` confirma que a implementacao real esta ignorada por git neste checkout. |
| `test -f docs/evidence/MF8/BK-MF8-15.md` | `FAIL_ESPERADO_POR_SCOPE`; evidence dedicada ausente e nao criada porque `PERMITIR_ALTERAR_DOCS=nao`. |
| `npm --prefix real_dev/web run test:mf8:formatters` | `PASS`; `BK-MF8-15 formatters: OK`. |
| `node --experimental-strip-types --input-type=module -e "...formatters.ts..."` | `PASS`; observou `1 234,56 €`, `31/12/2026`, `23,00 %`, `formatDisplayValue("format", "pdf") -> "pdf"` e rejeitou centimos fracionarios/data impossivel. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript frontend sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluida com 50 modulos transformados. |
| `npm --prefix real_dev/web run test:mf1` | `PASS`; `MF1 frontend pages contract OK`. |
| `npm --prefix real_dev/web run test:mf5:responsive` | `PASS`; `MF5 responsive table smoke OK`. |
| `npm --prefix real_dev/web run test:mf8:subscriptions-ui` | `PASS`; `MF8 subscriptions UI smoke OK`. |
| `npm --prefix real_dev/web run test:mf8:ui-alignment` | `PASS`; `MF8 UI alignment OK`. |
| `npm --prefix real_dev/web run test:mf2` | `FAIL_FORA_SCOPE`; marcador textual legado `Descarregar balancete Excel` em falta no smoke MF2. |
| Scans estaticos de risco e drift no escopo BK15 | `PASS`; sem `TODO`, `FIXME`, `as any`, `as unknown`, `payload: unknown`, storage sensivel, execucao dinamica, segredos ou drift de dominio. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories documentais antigos fora do BK15. |
| `git diff --check` | `PASS`; sem whitespace errors no diff tracked. |
| `rg -n "[ \t]+$" ...ficheiros BK15 e relatorios...` | `PASS`; sem trailing whitespace nos ficheiros auditados antes desta escrita. |

### Coerencia MF anterior -> MF alvo -> MF seguinte

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | A modularidade frontend e a fronteira API/backend foram preservadas; nao houve alteracao de backend, Prisma, endpoints, auth, roles, ownership ou persistencia. |
| `BK-MF8-14 -> BK-MF8-15` | `OK` | O BK15 aplica localizacao em cima da UI estabilizada no BK14 e nao reabre tokens visuais, componentes de IA ou regras de layout. |
| `BK-MF8-15 -> BK-MF8-16` | `OK_COM_RESSALVA` | O gate `test:mf8:formatters` existe e esta pronto para inventario no BK16; a evidence dedicada BK15 fica pendente por bloqueio documental da prompt atual. |

### Decisao

`BK-MF8-15` fica `AUDITADO_OK_COM_RESSALVAS` com resultado `PASS_COM_RISCOS`: a implementacao runtime cumpre `RNF36`, os gates principais passam e nao ha findings `P0`, `P1` ou `P2`. Permanecem apenas a falta de evidence dedicada por `PERMITIR_ALTERAR_DOCS=nao` e o smoke MF2 desalinhado, ambos registados sem alterar codigo nem documentos canonicos.

## Execucao 2026-07-06 - Reauditoria fresca BK-MF8-14 pos-correcao

- Projeto: `OPSA`
- Pedido atual: reauditar `BK-MF8-14` apos correcao do finding documental
- Modo executado: `auditar_implementacao`
- Escopo auditado: `BK-MF8-14`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Finding revalidado: `P3-BK-MF8-14-EVIDENCE-001` permanece `CORRIGIDO`
- Commits: nenhum
- Alteracoes desta execucao: nova seccao de reauditoria neste relatorio e ajuste textual em `docs/evidence/MF8/BK-MF8-14.md` para remover falso positivo no proprio scan estatico; sem alteracao de codigo runtime.

### Contrato revalidado

`BK-MF8-14 - Aproximacao da UI a UI do mockup` continua associado a `RNF35`, prioridade `P0`, owner `Pedro`, apoio `Sofia`, sprint `S12`, tipo `UX/Hardening` e sequencia `BK-MF8-13 -> BK-MF8-14 -> BK-MF8-15`.

O contrato confirmado nesta reauditoria:

- a app real aproxima a UI ao mockup aprovado com fundo preto, sidebar `Royal Green`, botoes amarelos, cards/tabelas consistentes, estados visiveis e foco acessivel;
- a evidence dedicada e a checklist visual existem e estao preenchidas com criterios concretos, nao apenas com afirmacoes genericas;
- `sourceQuality`, fonte, limitacao e decisao humana continuam tipados e renderizados na UI de sugestoes de IA;
- `test:mf8:ui-alignment` continua a validar tokens, componentes partilhados, wrappers/paginas, consumo de `sourceQuality` e script no package;
- nao foram alterados endpoints, Prisma, permissoes, ownership, autenticacao ou regras contabilisticas.

### Evidencia objetiva revalidada

| Area | Estado | Evidencia |
| --- | --- | --- |
| Canon MF8 | `OK` | `docs/RNF.md:109`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:110-111` e `docs/planificacao/backlogs/BACKLOG-MVP.md:135-136`, `:263-264` confirmam `RNF35`, prioridade `P0` e sequencia BK13/BK14/BK15. |
| Guia BK14 | `OK` | `docs/planificacao/guias-bk/MF8/BK-MF8-14-aproximacao-da-ui-a-ui-do-mockup.md:80-83`, `:99-107`, `:118-119`, `:1187-1204` exige componentes, gate, checklist, evidence e handoff. |
| Evidence dedicada | `OK` | `docs/evidence/MF8/BK-MF8-14.md:1`, `:27-38`, `:44-55`, `:57-68`, `:74-82` contem matriz de prova, comandos, negativos, handoff e decisao. |
| Checklist mockup | `OK` | `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md:1`, `:20-38`, `:40-48` cobre fundo, paleta, sidebar, navegacao, botoes, foco, forms, tabelas, cards, estados, componentes, IA, gate e limite sem screenshot. |
| CSS real | `OK` | `real_dev/web/src/styles.css:2-11`, `:30-66`, `:174-189`, `:230-237`, `:414-537` confirma tokens OPSA, fundo, botoes, sidebar, estados, badges e painel IA. |
| Componentes partilhados | `OK` | `real_dev/web/src/ui/opsaUi.tsx:48`, `:91-97`, `:118`, `:136`, `:167-185` confirma `PageFrame`, `StatusMessage`, `ActionToolbar`, `ModuleBadge` e `AiSourceQualityPanel` acessivel. |
| Handoff BK13 -> BK14 | `OK` | `real_dev/web/src/lib/mf4Api.ts:23`, `:40-41`, `real_dev/web/src/pages/mf4Pages.tsx:257`, `:300-302`, `real_dev/api/src/modules/ai/aiService.js:452`, `:490-491` e `docs/evidence/MF8/BK-MF8-13.md:72-76` confirmam `sourceQuality`, `guardrail` e decisao humana. |
| Gate automatico | `OK` | `real_dev/web/scripts/check-mf8-ui-alignment.mjs:42-66`, `:75-100`, `:108-116` e `real_dev/web/package.json:23` confirmam o gate e o script `test:mf8:ui-alignment`. |

### Findings

| ID | Severidade | Estado | Evidencia |
| --- | --- | --- | --- |
| `P3-BK-MF8-14-EVIDENCE-001` | `P3` | `CORRIGIDO` | `test -f docs/evidence/MF8/BK-MF8-14.md` e `test -f docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` passaram; ambos foram relidos nesta reauditoria e contêm prova concreta. |

Nao foram identificados novos findings `P0`, `P1`, `P2` ou `P3` no escopo estrito de `BK-MF8-14`.

### Pesquisas estaticas

| Comando | Resultado |
| --- | --- |
| Scan de risco em CSS, componentes UI, paginas MF4, script BK14, package, AI backend, teste BK13 e evidence/checklist BK14 | `PASS`; sem marcadores de implementacao pendente, storage sensivel, execucao dinamica, segredos, casts inseguros, operacoes destrutivas globais, configuracao HTTP permissiva ou marcadores fora do contrato. |
| Scan de drift de dominio no escopo BK14/BK13/evidence | `PASS`; sem referencias indevidas a FaithFlix, StudyFlow, Orelle, cosmetica, biometria, streaming, turma, professor, sala ou material de estudo. |
| Scan direto de whitespace nos ficheiros MF8 revistos | `PASS`; sem trailing whitespace. |

### Validacoes executadas nesta reauditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_NOTA`; artefactos MF8 untracked ja existentes foram preservados. |
| `git check-ignore -v real_dev ...` | `PASS_COM_NOTA`; `real_dev/` esta ignorado por `.gitignore:4`, esperado neste projeto. |
| `test -f docs/evidence/MF8/BK-MF8-14.md` | `PASS`; evidence dedicada existe. |
| `test -f docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` | `PASS`; checklist dedicada existe. |
| `npm --prefix real_dev/web run test:mf8:ui-alignment` | `PASS`; `MF8 UI alignment OK`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript frontend sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; build Vite concluida. |
| `node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` em `real_dev/api` | `PASS`; 5 testes, 5 pass, 0 fail. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS valida. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 118 testes, 118 pass, 0 fail. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass, 0 fail. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`; `advisory_pass=false` por avisos documentais antigos fora desta reauditoria. |
| `git diff --check` | `PASS`; sem whitespace errors no diff tracked. |

### Coerencia MF anterior -> MF alvo -> MF seguinte

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | Nao houve alteracao de codigo; a modularidade frontend, contratos backend, unit tests e Prisma continuam verdes. |
| `BK-MF8-13 -> BK-MF8-14` | `OK` | A UI consome a qualidade de fonte e preserva a fronteira de recomendacao humana. |
| `BK-MF8-14 -> BK-MF8-15` | `OK` | O contrato visual, checklist e gate ficam estaveis para a localizacao PT-PT do proximo BK. |

### Validacoes nao executadas

- Review visual manual com screenshots/browser nao foi executada; a reauditoria ficou coberta por evidence/checklist, gate estatico, typecheck e build.
- Smoke HTTP autenticado real nao foi executado; este BK e visual/frontend e nao alterou endpoints ou backend runtime.

### Decisao

`BK-MF8-14` fica `AUDITADO_OK` com resultado `PASS`. O finding `P3-BK-MF8-14-EVIDENCE-001` permanece `CORRIGIDO` e nao restam findings ativos conhecidos no escopo BK14.

## Execucao 2026-07-06 - Reauditoria pos-correcao BK-MF8-14

- Projeto: `OPSA`
- Pedido atual: corrigir finding `P3-BK-MF8-14-EVIDENCE-001`
- Modo executado: `corrigir_auditoria`
- Escopo auditado: `BK-MF8-14`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Finding revalidado: `P3-BK-MF8-14-EVIDENCE-001` fica `CORRIGIDO`
- Commits: nenhum
- Alteracoes desta execucao: evidence/checklist BK14 e relatorios MF8; sem alteracao de codigo runtime.

### Contrato revalidado

`BK-MF8-14 - Aproximacao da UI a UI do mockup` continua associado a `RNF35`, prioridade `P0`, owner `Pedro`, apoio `Sofia`, sprint `S12`, tipo `UX/Hardening` e sequencia `BK-MF8-13 -> BK-MF8-14 -> BK-MF8-15`.

O contrato runtime permanece igual ao auditado anteriormente:

- UI real aproximada ao mockup aprovado por paleta OPSA, sidebar `Royal Green`, botoes amarelos, cards/tabelas consistentes e estados visiveis;
- `sourceQuality`, fonte, limitacao e decisao humana expostos nas superficies de IA vindas do BK13;
- texto PT-PT, foco visivel, `aria-live` nos estados e feedback acessivel;
- nenhum endpoint, Prisma, permissao, ownership, autenticacao ou regra contabilistica alterados;
- gate `test:mf8:ui-alignment` preservado como prova repetivel.

### Evidencia objetiva revalidada

| Area | Estado | Evidencia |
| --- | --- | --- |
| Evidence dedicada | `OK` | `docs/evidence/MF8/BK-MF8-14.md` existe e contem artefactos, matriz de prova, comandos, negativos, limites, handoff e decisao. |
| Checklist mockup | `OK` | `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` existe e cobre paleta, sidebar, navegacao, botoes, foco, forms, tabelas, cards, estados, componentes partilhados, IA e gate. |
| CSS/componentes/gate | `OK` | A reauditoria manteve a evidencia anterior em `real_dev/web/src/styles.css`, `real_dev/web/src/ui/opsaUi.tsx`, `real_dev/web/src/pages/mf4Pages.tsx`, `real_dev/web/scripts/check-mf8-ui-alignment.mjs` e `real_dev/web/package.json`. |
| Handoff BK13 -> BK14 | `OK` | `sourceQuality`, `guardrail`, fonte, limitacao e decisao humana continuam tipados e renderizados na UI de sugestoes de IA. |

### Findings

| ID | Severidade | Estado | Evidencia |
| --- | --- | --- | --- |
| `P3-BK-MF8-14-EVIDENCE-001` | `P3` | `CORRIGIDO` | `test -f docs/evidence/MF8/BK-MF8-14.md` e `test -f docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` passaram; os ficheiros foram revistos e preenchidos com matriz/checklist concretas. |

Nao restam findings ativos conhecidos no escopo estrito de `BK-MF8-14`.

### Validacoes executadas nesta reauditoria

| Comando | Resultado |
| --- | --- |
| `test -f docs/evidence/MF8/BK-MF8-14.md` | `PASS`; evidence dedicada existe. |
| `test -f docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` | `PASS`; checklist dedicada existe. |
| `npm --prefix real_dev/web run test:mf8:ui-alignment` | `PASS`; `MF8 UI alignment OK`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript frontend sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; build Vite concluida. |
| `node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` em `real_dev/api` | `PASS`; 5 testes, 5 pass, 0 fail. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| Pesquisas estaticas de risco e drift no escopo BK14 | `PASS`; sem marcadores de implementacao pendente, storage sensivel, execucao dinamica, segredos, casts inseguros, CORS permissivo ou drift de dominio. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `advisory_pass=false` por avisos documentais antigos fora desta correcao. |
| `rg -n "[ \t]+$" docs/evidence/MF8/BK-MF8-14.md docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md ...` | `PASS`; sem trailing whitespace nos ficheiros MF8 revistos. |
| `git diff --check` | `PASS`; sem whitespace errors no diff tracked. |

### Coerencia MF anterior -> MF alvo -> MF seguinte

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | Nao houve alteracao de codigo; a modularidade frontend e validacoes continuam verdes. |
| `BK-MF8-13 -> BK-MF8-14` | `OK` | A evidence documenta o consumo de `sourceQuality`, fonte, limitacao e decisao humana. |
| `BK-MF8-14 -> BK-MF8-15` | `OK` | A checklist/evidence deixam o contrato visual estavel para a localizacao PT-PT do proximo BK. |

### Validacoes nao executadas

- Review visual manual com screenshots/browser nao foi executada; a correcao foi documental/evidencial e validada por gate, typecheck, build e checklist.
- Smoke HTTP autenticado real nao foi executado; nao houve alteracao de endpoints nem de backend runtime para este BK visual.

### Decisao

`BK-MF8-14` fica `AUDITADO_OK` com resultado `PASS`. O finding `P3-BK-MF8-14-EVIDENCE-001` fica `CORRIGIDO` e nao restam findings ativos conhecidos no escopo BK14.

## Execucao 2026-07-06 - Auditoria BK-MF8-14

- Projeto: `OPSA`
- Pedido atual: auditar implementacao de `BK-MF8-14`
- Modo executado: `auditar_implementacao`
- Escopo auditado: `BK-MF8-14`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS_COM_RISCOS`
- Estado do BK: `AUDITADO_COM_FINDINGS`
- Findings ativos: 1 `P3`, nenhum `P0`, `P1` ou `P2`
- Commits: nenhum
- Alteracoes desta execucao: apenas esta atualizacao do relatorio de auditoria.

### Contrato auditado

`BK-MF8-14 - Aproximacao da UI a UI do mockup` esta associado a `RNF35`, prioridade `P0`, owner `Pedro`, apoio `Sofia`, sprint `S12`, tipo `UX/Hardening` e sequencia `BK-MF8-13 -> BK-MF8-14 -> BK-MF8-15`.

O contrato esperado para esta auditoria:

- aproximar a UI real do OPSA ao mockup aprovado, com preto de fundo, sidebar `Royal Green`, botoes amarelos, cards/tabelas consistentes e estados visiveis;
- expor `sourceQuality`, fonte, limitacao e decisao humana nas superficies de IA vindas do BK13;
- manter texto PT-PT, foco visivel, `aria-live` nos estados e feedback acessivel;
- nao alterar endpoints, Prisma, permissoes, ownership, autenticacao ou regras contabilisticas;
- manter o gate tecnico `test:mf8:ui-alignment` como prova reexecutavel.

### Evidencia objetiva

| Area | Estado | Evidencia |
| --- | --- | --- |
| Canon MF8 | `OK` | `docs/RNF.md:104-110`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:110-112` e `docs/planificacao/backlogs/BACKLOG-MVP.md:263-265` confirmam `RNF35`, prioridade `P0` e sequencia BK13/BK14/BK15. |
| Guia BK14 | `OK` | `docs/planificacao/guias-bk/MF8/BK-MF8-14-aproximacao-da-ui-a-ui-do-mockup.md:24-50`, `:57-67`, `:80-108` e `:112-125` definem objetivo, scope-in, scope-out, prerequisites, arquitetura e ficheiros esperados. |
| Mockup aprovado | `OK` | `mockup/PALETA-CORES.md:7-14`, `:20-38`, `:42-50`, `:62-86` e `:100-118`, mais `mockup/src/app/components/Layout.tsx:40-68` e `:86-103`, confirmam paleta, sidebar, header, botoes, badges, tabelas e cards. |
| CSS real | `OK` | `real_dev/web/src/styles.css:1-27`, `:48-52`, `:61-89`, `:174-238`, `:288-320`, `:328-375`, `:413-439`, `:444-489`, `:491-524` e `:526-539` implementam tokens, fundo preto, botoes amarelos, foco, sidebar verde, tabelas/cards, estados e painel de fonte IA. |
| Componentes partilhados | `OK` | `real_dev/web/src/ui/opsaUi.tsx:48-74`, `:91-103`, `:118-139` e `:141-188` implementam `PageFrame`, `StatusMessage`, `ActionToolbar`, `ModuleBadge` e `AiSourceQualityPanel`. |
| Handoff BK13 -> BK14 | `OK` | `real_dev/web/src/lib/mf4Api.ts:23-42`, `real_dev/web/src/pages/mf4Pages.tsx:36`, `:257-309`, `real_dev/api/src/modules/ai/aiService.js:452`, `:490-491` e `docs/evidence/MF8/BK-MF8-13.md:72-75` confirmam `sourceQuality`, `guardrail`, fonte, limitacao e decisao humana na UI. |
| Gate automatico | `OK` | `real_dev/web/scripts/check-mf8-ui-alignment.mjs:1-3`, `:42-50`, `:75-90`, `:98-100` e `:108-116`, mais `real_dev/web/package.json:21-24`, confirmam o script e o comando `test:mf8:ui-alignment`. |
| Evidence dedicada BK14 | `P3` | `find docs/evidence/MF8 -maxdepth 1 -type f -name '*BK-MF8-14*' -print` e `find docs/evidence/MF8 -maxdepth 1 -type f -name '*UI-MOCKUP-CHECKLIST*' -print` nao devolveram ficheiros. |

### Findings

| ID | Severidade | Estado | Evidencia | Impacto | Recomendacao |
| --- | --- | --- | --- | --- | --- |
| `P3-BK-MF8-14-EVIDENCE-001` | `P3` | `BLOQUEADO_POR_SCOPE` | Nao existem `docs/evidence/MF8/BK-MF8-14.md` nem `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md`; a prompt atual define `PERMITIR_ALTERAR_DOCS=nao`. | Nao bloqueia o runtime nem a coerencia MF8, mas deixa falta de artefacto defensavel dedicado para apresentacao/revisao visual. | Criar a checklist e a evidence BK14 quando houver permissao explicita para alterar docs/evidence. |

Nao foram identificados findings `P0`, `P1` ou `P2` no escopo estrito de `BK-MF8-14`.

### Pesquisas estaticas

| Comando | Resultado |
| --- | --- |
| Scan de risco em CSS, componentes UI, paginas MF4, script BK14, package, AI backend e teste BK13 | `PASS`; sem `TODO implementar`, `FIXME`, implementacao pendente, storage sensivel, `dangerouslySetInnerHTML`, `eval`, `new Function`, logs de segredos, `as any`, `payload: unknown`, CORS permissivo, operacoes destrutivas globais ou marcadores RAG/OCR fora do contrato. |
| Scan de drift de dominio no escopo BK14/BK13 | `PASS`; sem referencias indevidas a FaithFlix, StudyFlow, Orelle, cosmetica, biometria, streaming, turma, professor, sala ou material de estudo. |

### Validacoes executadas nesta auditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_NOTA`; artefactos MF8 untracked ja existentes foram preservados. |
| `git check-ignore -v real_dev ...` | `PASS_COM_NOTA`; `real_dev/` esta ignorado por `.gitignore:4`, esperado neste projeto. |
| `npm --prefix real_dev/web run test:mf8:ui-alignment` | `PASS`; `MF8 UI alignment OK`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript frontend sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; build Vite concluida. |
| `npm --prefix real_dev/web run test:mf8:subscriptions-ui` | `PASS`; smoke UI MF8 mantido. |
| `node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` em `real_dev/api` | `PASS`; 5 testes, 5 pass, 0 fail. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS valida. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 118 testes, 118 pass, 0 fail. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass, 0 fail. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`; `advisory_pass=false` por avisos documentais antigos fora da correcao permitida. |
| `git diff --check` | `PASS`; sem whitespace errors no diff tracked. |

### Coerencia MF anterior -> MF alvo -> MF seguinte

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | O trabalho BK14 e apenas frontend/shared UI/gate; suites backend, Prisma e contratos continuam verdes. |
| `BK-MF8-13 -> BK-MF8-14` | `OK` | A UI consome `sourceQuality`/`guardrail` e mostra fonte, limitacao e decisao humana. |
| `BK-MF8-14 -> BK-MF8-15` | `OK_COM_RESSALVA` | A base visual e os componentes partilhados estao estaveis para localizacao; falta apenas evidence/checklist dedicada por bloqueio de permissao documental. |

### Validacoes nao executadas

- Review visual manual com screenshots/browser nao foi executada; a auditoria usou gate estatico, typecheck e build.
- `docs/evidence/MF8/BK-MF8-14.md` e `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` nao foram criados porque a prompt atual define `PERMITIR_ALTERAR_DOCS=nao`.
- Smoke HTTP autenticado real nao foi executado por nao ser necessario para este BK visual e para evitar ampliar o escopo.

### Decisao

`BK-MF8-14` fica `AUDITADO_COM_FINDINGS` com resultado `PASS_COM_RISCOS`: a implementacao runtime cumpre o contrato RNF35/BK14 e a coerencia com BK13/BK15, mas existe um finding `P3` documental/evidencial bloqueado pelo scope atual.

## Execucao 2026-07-06 - Reauditoria fresca BK-MF8-13

- Projeto: `OPSA`
- Pedido atual: reauditar `BK-MF8-13` apos correcao de evidence
- Modo executado: `auditar_implementacao`
- Escopo auditado: `BK-MF8-13`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Finding revalidado: `P3-BK-MF8-13-EVIDENCE-001` permanece `CORRIGIDO`
- Commits: nenhum
- Alteracoes desta execucao: apenas esta atualizacao do relatorio de auditoria.

### Contrato revalidado

`BK-MF8-13 - IA deve evitar enviesamentos e sugerir acoes baseadas em dados reais` continua associado a `RNF34`, prioridade `P1`, owner `Oleksii`, apoio `Pedro`, dependencias `-`, sprint `S12`, tipo `Core` e proximo BK `BK-MF8-14`.

O contrato runtime confirmado nesta reauditoria:

- `assertAiSourceQuality()` exige empresa ativa, fonte rastreavel, acao recomendada e explicacao defensavel.
- `generateAiSuggestions()` filtra insights `OPEN` por `companyId`.
- `assertAiRecommendationOnly()` continua antes de `assertAiSourceQuality()`, preservando o contrato de recomendacao segura do `BK-MF8-11`.
- `assertAiSourceQuality()` corre antes de `prisma.aiActionSuggestion.upsert`, impedindo persistencia de sugestoes sem fonte.
- A resposta publica mantem `sourceQuality` e `guardrail`, prontos para consumo pelo `BK-MF8-14`.
- A evidence dedicada `docs/evidence/MF8/BK-MF8-13.md` existe e documenta matriz de prova, comandos, negativos, limites e handoff.

### Evidencia objetiva revalidada

| Area | Estado | Evidencia |
| --- | --- | --- |
| Canon/guia | `OK` | `docs/RNF.md:100`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:110`, `docs/planificacao/backlogs/BACKLOG-MVP.md:135`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:122` e `docs/planificacao/guias-bk/MF8/BK-MF8-13-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais.md:1-118` confirmam identidade, `RNF34` e handoff para BK14. |
| Evidence dedicada | `OK` | `docs/evidence/MF8/BK-MF8-13.md:1-78` existe e inclui artefactos, matriz de prova, comandos observados, negativos, limites e handoff. |
| Guardrail | `OK` | `real_dev/api/src/modules/ai/aiSourceGuardrails.js:1-108` valida `companyId`, `sourceType`, `sourceId`, `sourceLabel`, `actionType`, explicacao minima e devolve `sourceQuality`. |
| Service | `OK` | `real_dev/api/src/modules/ai/aiService.js:438-495` filtra por empresa ativa, aplica BK11/RNF32 e BK13/RNF34 antes do `upsert`. |
| Teste dedicado | `OK` | `real_dev/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js:70-124` cobre positivo, fonte ausente, empresa ausente, explicacao fraca e bloqueio antes de persistir. |
| Handoff BK14 | `OK` | `docs/planificacao/guias-bk/MF8/BK-MF8-14-aproximacao-da-ui-a-ui-do-mockup.md:38`, `:64`, `:75`, `:705` e `:719` consomem `sourceQuality`, fonte, limitacao e decisao humana vindas de BK13. |

### Findings

| ID | Severidade | Estado | Evidencia |
| --- | --- | --- | --- |
| `P3-BK-MF8-13-EVIDENCE-001` | `P3` | `CORRIGIDO` | `test -f docs/evidence/MF8/BK-MF8-13.md` passou; a evidence foi lida e tem matriz de prova, negativos, limites e handoff. |

Nao foram identificados novos findings `P0`, `P1`, `P2` ou `P3` no escopo estrito de `BK-MF8-13`.

### Pesquisas estaticas

| Comando | Resultado |
| --- | --- |
| Scan de risco em `real_dev/api/src/modules/ai` e teste BK13 | `PASS`; sem TODO/FIXME, implementacao pendente, storage sensivel, execucao dinamica, segredos, casts inseguros, operacoes destrutivas globais, CORS permissivo ou ownership vindo de body/query. |
| Scan de placeholders em `docs/evidence/MF8/BK-MF8-13.md` | `PASS`; sem `TODO`, `FIXME`, `PREENCHER`, `placeholder`, `por preencher` ou texto generico "funciona". |
| Scan de drift de dominio no escopo AI/BK13/evidence | `PASS`; sem referencias indevidas a FaithFlix, StudyFlow, Orelle, cosmetica, biometria, streaming, turma, professor, sala ou material de estudo. |

### Validacoes executadas nesta reauditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_NOTA`; artefactos MF8 untracked ja existentes foram preservados. |
| `test -f docs/evidence/MF8/BK-MF8-13.md` | `PASS`; evidence dedicada existe. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` em `real_dev/api` | `PASS`; 5 testes, 5 pass, 0 fail. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 118 testes, 118 pass, 0 fail. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass, 0 fail. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript frontend sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; build Vite concluida. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por avisos documentais antigos, incluindo BK13. |
| `git diff --check` | `PASS`; sem whitespace errors no diff tracked. |
| `rg -n "[ \t]+$" docs/evidence/MF8/BK-MF8-13.md ...` | `PASS`; sem trailing whitespace na evidence e relatorios MF8 relevantes. |

### Coerencia MF anterior -> MF alvo -> MF seguinte

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | Auth, empresa ativa, permissoes, Prisma e suites backend/frontend continuam verdes. |
| `BK-MF8-10 -> BK-MF8-13` | `OK` | BK13 consome os campos de explicabilidade e origem entregues por BK10. |
| `BK-MF8-11 -> BK-MF8-13` | `OK` | A fronteira de recomendacao humana continua antes da qualidade da fonte. |
| `BK-MF8-12 -> BK-MF8-13` | `OK` | Sem dependencia runtime direta; preferencias `ai` continuam a nao executar acoes. |
| `BK-MF8-13 -> BK-MF8-14` | `OK` | Handoff de `sourceQuality`, fonte, limitacao e decisao humana esta documentado e consumivel pela UI. |

### Validacoes nao executadas

- Smoke HTTP autenticado com servidor real nao foi executado; a prova ficou em router/service/testes de contrato sem abrir listener.
- Integracao persistida contra base de dados real nao foi executada; Prisma validou o schema e o contrato dedicado cobriu o dominio com double controlado.

### Decisao

`BK-MF8-13` fica `AUDITADO_OK` com resultado `PASS`. O finding `P3-BK-MF8-13-EVIDENCE-001` permanece `CORRIGIDO` e nao restam findings ativos conhecidos no escopo BK13. Proxima acao recomendada: avancar para `BK-MF8-14`, consumindo `sourceQuality` na UI.

## Execucao 2026-07-06 - Reauditoria BK-MF8-13 pos-correcao

- Projeto: `OPSA`
- Pedido atual: corrigir e reauditar `P3-BK-MF8-13-EVIDENCE-001`
- Modo executado: `corrigir_auditoria`
- Escopo reaudited: `BK-MF8-13`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Finding reavaliado: `P3-BK-MF8-13-EVIDENCE-001` fica `CORRIGIDO`
- Commits: nenhum
- Alteracoes desta execucao: evidence dedicada BK13 e atualizacao dos relatorios permitidos.

### Contrato revalidado

`BK-MF8-13 - IA deve evitar enviesamentos e sugerir acoes baseadas em dados reais` continua associado a `RNF34`, prioridade `P1`, owner `Oleksii`, apoio `Pedro`, dependencias `-`, sprint `S12`, tipo `Core` e proximo BK `BK-MF8-14`.

O contrato runtime continua o mesmo:

- Sugestoes de IA so podem ser geradas a partir de dados reais e rastreaveis da empresa ativa.
- `generateAiSuggestions()` le apenas insights `OPEN` da empresa ativa.
- `assertAiRecommendationOnly()` preserva a fronteira de recomendacao segura do `BK-MF8-11`.
- `assertAiSourceQuality()` exige `companyId`, fonte rastreavel, acao e explicacao antes do `upsert`.
- A resposta publica inclui `sourceQuality` e `guardrail`, permitindo handoff limpo para `BK-MF8-14`.
- A IA continua sem executar acoes financeiras, contabilisticas ou operacionais automaticas.

### Evidencia objetiva revalidada

| Area | Estado | Evidencia |
| --- | --- | --- |
| Evidence dedicada | `OK` | `docs/evidence/MF8/BK-MF8-13.md` existe e inclui matriz de prova, comandos, negativos, limites e handoff. |
| Guia/canon | `OK` | `docs/planificacao/guias-bk/MF8/BK-MF8-13-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais.md:1-118`, `docs/RNF.md:100`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:110`, `docs/planificacao/backlogs/BACKLOG-MVP.md:135` e `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:122` confirmam `RNF34`, prioridade `P1`, owner/apoio e handoff para BK14. |
| Guardrail de fonte | `OK` | `real_dev/api/src/modules/ai/aiSourceGuardrails.js:1-108` mantem validacao de empresa ativa, fonte rastreavel, actionType, explicacao minima e `sourceQuality`. |
| Integracao no service | `OK` | `real_dev/api/src/modules/ai/aiService.js:438-495` filtra por `companyId`, aplica `assertAiRecommendationOnly()` e `assertAiSourceQuality()` antes de persistir sugestoes. |
| Rotas e ownership | `OK` | `real_dev/api/src/modules/ai/aiRoutes.js:44-53` aplica auth, empresa ativa, permissao `AI_READ` e roles; `:81-87` passa `req.companyId` ao service. |
| Teste dedicado | `OK` | `real_dev/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js:70-124` cobre positivo e negativos sem fonte, sem empresa, explicacao fraca e bloqueio antes de persistencia. |

### Finding corrigido

| ID | Severidade | Estado | Evidencia de correcao |
| --- | --- | --- | --- |
| `P3-BK-MF8-13-EVIDENCE-001` | `P3` | `CORRIGIDO` | `docs/evidence/MF8/BK-MF8-13.md` existe, regista comandos executados, resultados observados, negativos, limites e handoff para BK14. |

### Validacoes executadas nesta reauditoria

| Comando | Resultado |
| --- | --- |
| `test -f docs/evidence/MF8/BK-MF8-13.md` | `PASS`; evidence dedicada existe. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` em `real_dev/api` | `PASS`; 5 testes, 5 pass, 0 fail. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 118 testes, 118 pass, 0 fail. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `advisory_pass=false` por advisories documentais antigos, incluindo BK13. |
| `git diff --check` | `PASS`; sem whitespace errors no diff tracked. |
| `rg -n "[ \t]+$" docs/evidence/MF8/BK-MF8-13.md ...` | `PASS`; sem trailing whitespace na evidence BK13 e relatorios MF8 editados. |

### Coerencia MF anterior -> MF alvo -> MF seguinte

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | Nao houve alteracao de codigo; syntax, Prisma e contratos continuam verdes. |
| `BK-MF8-10 -> BK-MF8-13` | `OK` | A evidence documenta que BK13 consome explicacao e fonte dos insights entregues por BK10. |
| `BK-MF8-11 -> BK-MF8-13` | `OK` | A evidence confirma que a qualidade da fonte vem depois da fronteira de recomendacao segura. |
| `BK-MF8-12 -> BK-MF8-13` | `OK` | Sem dependencia runtime direta; preferencias de alerta `ai` nao executam acoes. |
| `BK-MF8-13 -> BK-MF8-14` | `OK` | Handoff formal fechado: `sourceQuality`, `guardrail`, fonte, limitacao e decisao humana estao documentados. |

### Validacoes nao executadas

- `npm --prefix real_dev/api run test:unit`, `npm --prefix real_dev/web run typecheck` e `npm --prefix real_dev/web run build` nao foram reexecutados nesta correcao documental; ja tinham passado na auditoria imediatamente anterior e nenhum codigo runtime foi alterado.
- Smoke HTTP autenticado com servidor real nao foi executado; a prova continua em router/service/teste de contrato sem abrir listener.
- Integracao persistida contra base de dados real nao foi executada; Prisma validou o schema e o contrato dedicado cobriu o dominio com double controlado.

### Decisao

`BK-MF8-13` fica `AUDITADO_OK` com resultado `PASS`. O finding `P3-BK-MF8-13-EVIDENCE-001` foi reavaliado e fica `CORRIGIDO`; nao restam findings ativos conhecidos no escopo BK13.

## Execucao 2026-07-06 - Auditoria BK-MF8-13

- Projeto: `OPSA`
- Pedido atual: auditar implementacao de `BK-MF8-13`
- Modo executado: `auditar_implementacao`
- Escopo auditado: `BK-MF8-13`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS_COM_RISCOS`
- Estado do BK: `AUDITADO_COM_FINDINGS`
- Findings ativos: 1 `P3`; nenhum `P0`, `P1` ou `P2`
- Commits: nenhum
- Alteracoes desta execucao: apenas esta atualizacao do relatorio de auditoria.

### Contrato auditado

`BK-MF8-13 - Evitar vies e usar dados reais nas sugestoes` esta associado a `RNF34`, prioridade `P1`, owner `Oleksii`, apoio `Pedro`, dependencias `-`, sprint `S12`, tipo `Core` e proximo BK `BK-MF8-14`.

Contrato funcional validado:

- Sugestoes de IA so podem ser geradas a partir de dados reais e rastreaveis da empresa ativa.
- Cada sugestao deve transportar `sourceType`, `sourceId`, `sourceLabel`, `companyId`, `explanation` e `actionType`.
- A validacao deve acontecer antes de persistir ou devolver sugestoes ao cliente.
- O guardrail de BK10/RNF23 continua a exigir explicabilidade.
- O guardrail de BK11/RNF32 continua a bloquear acoes financeiras ou contabilisticas automaticas.
- Nao ha provider externo novo, metricas estatisticas de bias, novas tabelas Prisma, UI rewrite ou execucao automatica de acoes.

### Evidencia objetiva

| Area | Estado | Evidencia |
| --- | --- | --- |
| Guia/canon | `OK` | `docs/planificacao/guias-bk/MF8/BK-MF8-13-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais.md:1-118`, `docs/RNF.md:100`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:110`, `docs/planificacao/backlogs/BACKLOG-MVP.md:135` e `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:122` confirmam `RNF34`, prioridade `P1`, owner/apoio e handoff para BK14. |
| Guardrail de fonte | `OK` | `real_dev/api/src/modules/ai/aiSourceGuardrails.js:1-108` implementa normalizacao, source trace obrigatorio, empresa ativa obrigatoria, actionType, tamanho minimo de explicacao e classificacao `sourceQuality`. |
| Integracao no service | `OK` | `real_dev/api/src/modules/ai/aiService.js:438-495` filtra insights `OPEN` por `companyId`, chama `assertAiRecommendationOnly`, aplica `assertAiSourceQuality` antes de `upsert` e devolve `sourceQuality`/`guardrail`. |
| Fontes reais internas | `OK` | `real_dev/api/src/modules/ai/aiService.js:64-117` gera insights de alertas de stock com `companyId`, `sourceType`, `sourceId`, `sourceLabel` e explicacao concreta. |
| Rotas e ownership | `OK` | `real_dev/api/src/modules/ai/aiRoutes.js:44-53` aplica auth, empresa ativa, permissao `AI_READ` e roles; `:81-87` chama o service com `req.companyId` e `req.user.id`. |
| Teste dedicado | `OK` | `real_dev/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js:70-124` cobre positivo, source ausente, empresa ausente, explicacao fraca e bloqueio antes de persistencia. |
| Evidence dedicada | `P3` | `docs/evidence/MF8/BK-MF8-13.md` nao existe. A prompt atual permite atualizar apenas este relatorio, por isso a evidencia dedicada fica registada como pendente documental, nao como falha runtime. |

### Findings

| ID | Severidade | Estado | Descricao | Evidencia | Acao recomendada |
| --- | --- | --- | --- | --- | --- |
| `P3-BK-MF8-13-EVIDENCE-001` | `P3` | `BLOQUEADO_POR_SCOPE` | Falta a evidence dedicada de BK13 para PR/defesa, embora a implementacao runtime e os testes dedicados estejam presentes. | `find docs/evidence/MF8 -maxdepth 1 -type f -name '*BK-MF8-13*' -print` nao devolveu ficheiros. | Quando houver permissao para docs/evidence, criar `docs/evidence/MF8/BK-MF8-13.md` com matriz de prova, comandos executados, negativos, limites e handoff para BK14. |

### Pesquisas estaticas

| Comando | Resultado |
| --- | --- |
| Scan de risco em `real_dev/api/src/modules/ai` e testes BK13/BK11 | `PASS`; sem TODO/FIXME, casts inseguros, storage sensivel, execucao dinamica, segredos em log, operacoes destrutivas globais, CORS permissivo ou escopo indevido. |
| Scan de drift de dominio no escopo AI/BK13 | `PASS`; sem referencias indevidas a FaithFlix, StudyFlow, Orelle, cosmetica, biometria, streaming, turma, professor, sala ou material de estudo. |
| `rg -n "req\.(body\|query)\.companyId\|body\.companyId\|query\.companyId" real_dev/api/src/modules/ai ...` | `PASS`; nenhum uso de `companyId` vindo de body/query no modulo AI auditado. |
| `git check-ignore -v real_dev ...` | `INFO`; `real_dev/` esta ignorado por `.gitignore:4`, conforme esperado para esta prompt. |

### Validacoes executadas nesta auditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_NOTA`; artefactos MF8 untracked ja existentes foram preservados. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` em `real_dev/api` | `PASS`; 5 testes, 5 pass, 0 fail. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 118 testes, 118 pass, 0 fail. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass, 0 fail. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript frontend sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; build Vite concluida. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, mas `advisory_pass=false` por avisos documentais antigos de qualidade dos guias, incluindo BK13. |
| `git diff --check` | `PASS`; sem whitespace errors no diff tracked. |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` | `PASS`; sem trailing whitespace no relatorio untracked. |

### Coerencia MF anterior -> MF alvo -> MF seguinte

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | Nao houve regressao visivel de auth, empresa ativa, permissoes, schema Prisma ou suites backend/frontend. |
| `BK-MF8-10 -> BK-MF8-13` | `OK` | BK13 reutiliza a fronteira de explicabilidade antes de persistir sugestoes. |
| `BK-MF8-11 -> BK-MF8-13` | `OK` | `assertAiRecommendationOnly` continua a correr antes do guardrail de fonte; as sugestoes mantem natureza recomendatoria. |
| `BK-MF8-12 -> BK-MF8-13` | `OK` | Sem dependencia runtime direta; preferencias de alerta `ai` nao enfraquecem os guardrails AI. |
| `BK-MF8-13 -> BK-MF8-14` | `OK_COM_RESSALVA` | O payload inclui `sourceQuality` e `guardrail`, util para UX; falta apenas a evidence dedicada BK13 para handoff formal. |

### Validacoes nao executadas

- Smoke HTTP autenticado com servidor real nao foi executado; a prova ficou em router/service e teste de contrato sem abrir listener.
- Integracao persistida contra base de dados real nao foi executada; Prisma validou o schema e o contrato dedicado cobriu o dominio com double controlado.
- Criacao de `docs/evidence/MF8/BK-MF8-13.md` nao foi executada porque `PERMITIR_ALTERAR_DOCS=nao` e o modo atual permite apenas relatorio.

### Decisao

`BK-MF8-13` fica `AUDITADO_COM_FINDINGS` com resultado `PASS_COM_RISCOS`. A implementacao runtime cumpre `RNF34` sem findings `P0`, `P1` ou `P2`; o unico risco ativo e documental/operacional (`P3-BK-MF8-13-EVIDENCE-001`) e esta bloqueado pelo scope da prompt atual.

## Execucao 2026-07-06 - Reauditoria BK-MF8-12 pos-correcao

- Projeto: `OPSA`
- Pedido atual: reauditar `BK-MF8-12` apos correcao do finding documental.
- Modo executado: `auditar_implementacao`
- Escopo reaudited: `BK-MF8-12`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Finding reavaliado: `P3-BK-MF8-12-EVIDENCE-001` permanece `CORRIGIDO`
- Commits: nenhum
- Alteracoes desta execucao: apenas esta atualizacao do relatorio de auditoria.

### Contrato revalidado

`BK-MF8-12 - Alertas configuraveis (ativar/desativar tipos)` continua associado a `RNF33`, prioridade `P1`, owner `Andre`, apoio `Oleksii`, dependencias `-`, sprint `S12`, tipo `Core` e proximo BK `BK-MF8-13`.

O contrato runtime continua o mesmo:

- `AlertPreference` por empresa ativa, utilizador autenticado e tipo.
- Endpoints protegidos `GET /api/notifications/preferences` e `PATCH /api/notifications/preferences/:type`.
- Body publico estrito `{ enabled: boolean }`.
- `companyId` vem do backend (`req.companyId`), nao do body/query.
- `security` continua ativo e nao desligavel.
- Categoria `ai` permanece preferencia de alerta/notificacao, sem execucao contabilistica ou financeira automatica.

### Evidencia objetiva revalidada

| Area | Estado | Evidencia |
| --- | --- | --- |
| Evidence dedicada | `OK` | `docs/evidence/MF8/BK-MF8-12.md` existe e inclui matriz de prova, comandos, negativos, limites e handoff. |
| Modelo Prisma | `OK` | `real_dev/api/prisma/schema.prisma:170`, `:252` e `:1252-1267` mantem relacoes `User`/`Company`, modelo `AlertPreference`, unicidade por `companyId/userId/type` e indices. |
| Service | `OK` | `alertPreferenceService.js:20-51` define tipos suportados; `:73-92` valida body; `:143-152` bloqueia `security`; `:182-234` lista/upsert por contexto autenticado. |
| Router | `OK` | `notificationRoutes.js:46-50` aplica auth, empresa ativa e permissao; `:76-99` expoe as rotas de preferencias usando `req.companyId` e `req.user.id`. |
| Testes | `OK` | `mf8-alert-preferences.contract.test.js:85-187` cobre defaults, `companyId` forjado, negativos e rotas. |
| Finding anterior | `CORRIGIDO` | `test -f docs/evidence/MF8/BK-MF8-12.md` passou; a ausencia de evidence ja nao se reproduz. |

### Pesquisas estaticas

| Comando | Resultado |
| --- | --- |
| `rg -n "alertPreferences|model AlertPreference|...|BK-MF8-12" real_dev/api ... docs/evidence/MF8/BK-MF8-12.md` | `PASS`; confirmou schema, service, router, teste e evidence. |
| Scan de risco em `real_dev/api/src/modules/notifications`, teste BK12 e evidence | `PASS`; sem TODO/FIXME, storage sensivel, execucao dinamica, segredos, casts inseguros, payload sem validacao ou ownership por body/query. |
| Scan de drift de dominio no escopo BK12 | `PASS`; sem referencias indevidas a FaithFlix, StudyFlow, Orelle, cosmetica, biometria, streaming, turma, professor, sala ou material de estudo. |
| `rg -n "npm --prefix real_dev/api run prisma:validate|...|test:unit" docs/evidence/MF8/BK-MF8-12.md` | `PASS`; evidence regista os comandos principais executados. |

### Validacoes executadas nesta reauditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_NOTA`; artefactos MF8 untracked ja existentes foram preservados. |
| `test -f docs/evidence/MF8/BK-MF8-12.md` | `PASS`; evidence dedicada existe. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `node --test tests/contracts/mf8-alert-preferences.contract.test.js` em `real_dev/api` | `PASS`; 4 testes, 4 pass, 0 fail. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 113 testes, 113 pass, 0 fail. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass, 0 fail. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories documentais antigos, incluindo BK12. |

### Coerencia MF anterior -> MF alvo -> MF seguinte

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | Nao houve regressao de auth, empresa ativa, permissoes ou Prisma; suites backend continuam verdes. |
| `MF4 -> BK-MF8-12` | `OK` | BK12 reutiliza o router de notificacoes e os guards ja existentes. |
| `BK-MF8-11 -> BK-MF8-12` | `OK` | Alertas `ai` continuam apenas preferencia/notificacao, sem enfraquecer a fronteira RNF32. |
| `BK-MF8-12 -> BK-MF8-13` | `OK` | Evidence e contrato entregam a categoria `ai` como handoff estavel para o proximo BK. |

### Validacoes nao executadas

- `npm --prefix real_dev/web run typecheck` e `npm --prefix real_dev/web run build` nao foram executados porque `BK-MF8-12` e backend-only e a UI frontend esta em scope-out.
- Smoke HTTP autenticado com servidor real nao foi executado; a prova ficou em router/service e teste de contrato sem abrir listener.
- Integracao persistida contra base de dados real nao foi executada; Prisma validou o schema e o contrato dedicado cobriu o dominio com double controlado.

### Decisao

`BK-MF8-12` fica `AUDITADO_OK` com resultado `PASS`. O finding `P3-BK-MF8-12-EVIDENCE-001` foi reavaliado e permanece `CORRIGIDO`; nao restam findings ativos conhecidos no escopo BK12.

## Execucao 2026-07-06 - Pos-correcao BK-MF8-12

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria` com revalidacao documental
- Escopo corrigido: `BK-MF8-12`
- Finding corrigido: `P3-BK-MF8-12-EVIDENCE-001`
- Implementation root auditado: `real_dev`
- Resultado global atual: `PASS`
- Estado atual do BK: `AUDITADO_OK`
- Findings ativos atuais: nenhum `P0`, `P1`, `P2` ou `P3`
- Commits: nenhum
- Alteracoes desta execucao: criada evidence dedicada e actualizados relatorios permitidos.

### Evidencia da correcao

| Area | Estado | Evidencia |
| --- | --- | --- |
| Evidence dedicada | `OK` | `docs/evidence/MF8/BK-MF8-12.md` existe e documenta artefactos, matriz de prova, comandos, negativos, limites e handoff. |
| Finding anterior | `CORRIGIDO` | `P3-BK-MF8-12-EVIDENCE-001` apontava para absence de `docs/evidence/MF8/BK-MF8-12.md`; `test -f docs/evidence/MF8/BK-MF8-12.md` passou. |
| Contrato runtime | `OK` | Nao houve alteracao de codigo; `syntax:check`, `prisma:validate`, teste dedicado, `test:contracts` e `test:unit` continuam verdes. |
| Handoff | `OK` | A evidence explicita que `ai` e preferencia de alerta/notificacao e nao execucao automatica. |

### Validacoes pos-correcao

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` |
| `node --test tests/contracts/mf8-alert-preferences.contract.test.js` em `real_dev/api` | `PASS`; 4 testes, 4 pass. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 113 testes, 113 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| Pesquisa estatica de risco no escopo BK12 | `PASS` |
| Pesquisa de drift de dominio no escopo BK12 | `PASS` |
| `test -f docs/evidence/MF8/BK-MF8-12.md` | `PASS` |

### Decisao atual

`BK-MF8-12` passa a `AUDITADO_OK` com resultado `PASS`. A auditoria historica abaixo permanece preservada para rastreabilidade, mas o finding documental P3 foi corrigido por criacao de `docs/evidence/MF8/BK-MF8-12.md`.

## Execucao 2026-07-06 - Auditoria BK-MF8-12

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- Escopo pedido: `BK_IDS=[BK-MF8-12]`
- Escopo normalizado: `BK-MF8-12`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS_COM_RISCOS`
- Estado do BK: `AUDITADO_COM_FINDINGS`
- Findings ativos: nenhum `P0`, `P1` ou `P2`; um `P3` documental bloqueado por scope.
- Commits: nenhum
- Alteracoes desta execucao: apenas atualizacao deste relatorio de auditoria, permitido por `OUTPUT_MODE=relatorio_e_resumo`.
- Nota de worktree: antes da auditoria ja existiam artefactos nao rastreados em `docs/evidence/MF8/`, `AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`, `CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` e `IMPLEMENTACAO-REAL_DEV-MF8.md`; foram preservados.

### Contrato canonico revalidado

`BK-MF8-12 - Alertas configuraveis (ativar/desativar tipos)` continua associado a `RNF33`, prioridade `P1`, owner `Andre`, apoio `Oleksii`, dependencias `-`, sprint `S12`, tipo `Core` e proximo BK `BK-MF8-13`.

Fontes revistas nesta auditoria:

- `docs/RNF.md:99`: confirma `RNF33` como "Alertas configuraveis (ativar/desativar tipos)".
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:108-109`: confirma a cadeia `BK-MF8-11 -> BK-MF8-12 -> BK-MF8-13`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md:133-134` e `:261-262`: confirmam prioridade, requisito, owner, apoio, fase, guia e handoff.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:121`: confirma `S12`, owner, `RNF33`, dependencias `-` e tipo `Core`.
- `docs/planificacao/backlogs/MF-VIEWS.md:238` e `:252`: confirma a presenca sequencial de `BK-MF8-12` na MF8 e a ligacao ao guia.
- `docs/planificacao/sprints/PLANO-SPRINTS.md:67`: confirma a recalibracao da sprint `S12` para `BK-MF8-10` a `BK-MF8-12`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-alertas-configuraveis-ativar-desativar-tipos.md:24-51`: define objetivo, endpoints, contexto multiempresa, tipos configuraveis, tipo obrigatorio `security`, testes e evidence.
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-alertas-configuraveis-ativar-desativar-tipos.md:53-63`: coloca UI, email/SMS, motor de notificacoes, novas permissoes e acoes financeiras/contabilisticas fora de scope.
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-alertas-configuraveis-ativar-desativar-tipos.md:95-123`: confirma defaults, empresa ativa decidida no backend, `AlertPreference`, endpoints, payload `{ enabled: boolean }`, evidence e handoff.

### Inventario do BK auditado

| Campo | Valor |
| --- | --- |
| Objetivo | Persistir preferencias efetivas de alertas por empresa ativa, utilizador autenticado e tipo, permitindo ativar/desativar apenas tipos configuraveis. |
| RF/RNF | `RNF33` |
| Dependencias declaradas | `-` |
| Contratos consumidos | Auth, empresa ativa backend, permissao `Permission.NOTIFICATIONS_READ`, router de notificacoes e fronteira RNF32 de IA apenas recomendatoria. |
| Handoff | `BK-MF8-13` pode consumir a categoria `ai` como preferencia de notificacao, sem execucao automatica. |
| Modelo persistente | `real_dev/api/prisma/schema.prisma` e migration `20260706120000_mf8_alert_preferences`. |
| Service principal | `real_dev/api/src/modules/notifications/alertPreferenceService.js` |
| Router principal | `real_dev/api/src/modules/notifications/notificationRoutes.js` |
| Teste principal | `real_dev/api/tests/contracts/mf8-alert-preferences.contract.test.js` |
| Evidence dedicada | `docs/evidence/MF8/BK-MF8-12.md` ausente nesta checkout. |
| Scope-out | UI frontend, email/SMS, motor gerador de notificacoes, novas permissoes, alertas criticos desligaveis, acoes financeiras/contabilisticas e integracoes externas. |

### Evidencia objetiva no codigo real

| Area | Estado | Evidencia |
| --- | --- | --- |
| Relacoes Prisma | `OK` | `real_dev/api/prisma/schema.prisma:170` liga `User` a `AlertPreference`; `:252` liga `Company` a `AlertPreference`. |
| Modelo `AlertPreference` | `OK` | `schema.prisma:1252-1267` define `companyId`, `userId`, `type`, `enabled`, relacoes com cascade, `@@unique([companyId, userId, type])` e indices. |
| Migration | `OK` | `real_dev/api/prisma/migrations/20260706120000_mf8_alert_preferences/migration.sql:3-32` cria tabela, unique/indexes e foreign keys para `Company` e `User`. |
| Tipos suportados | `OK` | `alertPreferenceService.js:20-51` centraliza `stock`, `deadline`, `cashflow`, `ai` e `security`, com `security` `canDisable: false`. |
| DTO/validator | `OK` | `alertPreferenceService.js:73-92` aceita apenas body objeto com `enabled` booleano e devolve `{ enabled }`, ignorando ownership vindo do cliente. |
| Validacao de tipo | `OK` | `alertPreferenceService.js:101-115` normaliza e rejeita tipos vazios/desconhecidos com erro de dominio. |
| Contexto multiempresa | `OK` | `alertPreferenceService.js:125-133` exige `companyId` e `userId` vindos dos guards; `notificationRoutes.js:76-99` passa `req.companyId` e `req.user.id`. |
| Bloqueio de `security` | `OK` | `alertPreferenceService.js:143-152` rejeita `enabled=false` quando `canDisable=false` com `ALERT_TYPE_MANDATORY`. |
| Defaults e listagem | `OK` | `alertPreferenceService.js:182-199` lista preferencias por `companyId`/`userId` e compoe defaults sem criar linhas desnecessarias. |
| Persistencia | `OK` | `alertPreferenceService.js:209-234` faz `upsert` por `companyId_userId_type`, com `companyId` e `userId` do contexto autenticado. |
| Rotas protegidas | `OK` | `notificationRoutes.js:46-50` aplica `requireAuth`, `requireCompanyContext` e `requirePermission(Permission.NOTIFICATIONS_READ)`; `:76-99` expoe `GET /preferences` e `PATCH /preferences/:type`. |
| Testes de contrato | `OK` | `mf8-alert-preferences.contract.test.js:85-187` cobre defaults/stored, rejeicao de `companyId` forjado no body, body invalido, tipo invalido, `security` obrigatorio e rotas expostas. |
| Relatorio de implementacao | `OK_COM_RESSALVA` | `IMPLEMENTACAO-REAL_DEV-MF8.md:7-15` marca o BK como implementado e declara que `docs/evidence` nao foi alterado por proibicao do prompt; `:121-126` documenta a validacao nao executada/criada para evidence dedicada. |

### Scope-out respeitado

- Nao foi criada UI frontend nem cliente API web para gerir preferencias.
- Nao foram adicionados email, SMS, gateways externos ou integracoes de tesouraria.
- O motor existente de notificacoes nao foi alterado para filtrar emissao por preferencia; o BK entrega o contrato persistente de preferencias.
- Nao foram criadas novas permissoes; as rotas reutilizam `Permission.NOTIFICATIONS_READ`.
- `security` continua visivel, ativo por default e nao desligavel.
- A categoria `ai` continua apenas preferencia de rececao de alertas; nao aprova documentos, nao cria lancamentos, nao altera dados contabilisticos e nao executa pagamentos.
- O browser nao decide ownership: nao ha `req.body.companyId`, `req.query.companyId`, `body.companyId` ou `query.companyId` no caminho auditado.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Evidencia |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | Auth, empresa ativa backend, permissoes e Prisma continuam validos; `syntax:check`, `prisma:validate`, `test:contracts` e `test:unit` passaram. |
| `MF4 -> BK-MF8-12` | `OK` | A rota entra no router real de notificacoes e preserva os guards usados por listagem/sync/read de notificacoes. |
| `BK-MF8-11 -> BK-MF8-12` | `OK` | Alertas `ai` continuam preferencias de notificacao; nao enfraquecem a policy RNF32 de IA apenas recomendatoria. |
| `BK-MF8-12 -> BK-MF8-13` | `OK_COM_RESSALVAS` | O contrato de categoria `ai` esta estavel para o BK seguinte; falta apenas a evidence dedicada `docs/evidence/MF8/BK-MF8-12.md`, bloqueada pelo scope documental atual. |

### Pesquisas estaticas de risco

| Comando | Resultado |
| --- | --- |
| `rg -n "BK-MF8-12|RNF33|Alertas configur|alertas configur" ...` em docs canonicos, backlogs, sprints e guias MF7/MF8 | `PASS`; confirmou RNF33, cadeia BK11/BK12/BK13, sprint S12, guia e pre-condicoes. |
| Scan de TODO/FIXME/mock/storage sensivel/eval/segredos/CORS/RAG/OCR/casts inseguros em `real_dev/api/src/modules/notifications`, teste BK12 e schema | `PASS`; sem ocorrencias no caminho BK12 auditado. |
| Scan de drift de dominio em codigo/teste/schema/guia BK12 | `PASS`; sem referencias indevidas a FaithFlix, StudyFlow, Orelle, cosmetica, biometria, streaming, turma, professor, sala ou material de estudo. |
| `rg -n "req\\.(body|query)\\.companyId|body\\.companyId|query\\.companyId|companyId" ...` | `PASS_COM_NOTA`; hits esperados em schema, contexto backend e testes; nao ha `req.body.companyId`, `req.query.companyId`, `body.companyId` nem `query.companyId` no caminho real. |
| `git check-ignore -v real_dev ...` | `PASS_COM_NOTA`; `real_dev/` esta ignorado por `.gitignore:4`, esperado nesta PAP. |
| `test -f docs/evidence/MF8/BK-MF8-12.md` | `FINDING_P3`; devolveu `MISSING`. |

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_COM_RESSALVAS`; confirmou artefactos untracked pre-existentes, preservados. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; `node --check` sem erros. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `node --test tests/contracts/mf8-alert-preferences.contract.test.js` em `real_dev/api` | `PASS`; 4 testes, 4 pass, 0 fail. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 113 testes, 113 pass, 0 fail. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass, 0 fail. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories pedagogicos/documentais antigos, incluindo BK12. |

### Validacoes nao executadas

- `npm --prefix real_dev/web run typecheck` e `npm --prefix real_dev/web run build` nao foram executados nesta auditoria porque `BK-MF8-12` e backend-only e o guia coloca UI frontend em scope-out.
- Smoke HTTP autenticado com servidor real nao foi executado; a prova ficou no router/service e no teste de contrato sem abrir listener.
- Integracao persistida contra base de dados real nao foi executada; Prisma validou o schema e os testes de contrato cobriram o dominio com double controlado.
- Nao foi criado `docs/evidence/MF8/BK-MF8-12.md`, porque `PERMITIR_ALTERAR_DOCS=nao` proibe criar/corrigir evidence fora do relatorio permitido.

### Findings

#### `P3-BK-MF8-12-EVIDENCE-001` - Evidence dedicada ausente

- Severidade: `P3`
- Estado: `BLOQUEADO_POR_SCOPE`
- BK/RNF: `BK-MF8-12`, `RNF33`
- Evidencia objetiva: o guia exige evidence em `docs/evidence/MF8/BK-MF8-12.md` (`BK-MF8-12...md:51`, `:122`, `:131`), mas `test -f docs/evidence/MF8/BK-MF8-12.md` devolveu `MISSING`.
- Expected: existir evidence tecnica dedicada com comandos, resultados, negativos e decisao final do BK.
- Observed: a evidence tecnica esta registada no relatorio de implementacao, mas o ficheiro dedicado nao existe.
- Impacto: lacuna documental/evidence; nao bloqueia a execucao runtime, os endpoints, Prisma, guards, validadores ou testes do BK.
- Correcao recomendada: quando uma prompt permitir editar `docs/evidence`, criar `docs/evidence/MF8/BK-MF8-12.md` com a matriz de prova ja validada nesta auditoria.
- Bloqueia MF: nao.

### Decisao

`BK-MF8-12` fica `AUDITADO_COM_FINDINGS` com resultado `PASS_COM_RISCOS`: a implementacao real cumpre o contrato essencial de `RNF33`, preserva contexto multiempresa/permissoes no backend, bloqueia `security`, nao aceita ownership do browser e tem testes automatizados verdes. O unico finding ativo e `P3` documental, limitado a evidence dedicada ausente e bloqueado pelo scope atual.

## Execucao 2026-07-06 - Reauditoria BK-MF8-11

- Projeto: `OPSA`
- Pedido atual: reauditar `BK-MF8-11`
- Nota de modo: a prompt anexada mantinha `MODO=implementar`, mas o pedido textual atual foi `re-auditar`; esta execucao foi tratada como `auditar_implementacao`, sem editar codigo.
- Escopo pedido: `BK_IDS=[BK-MF8-11]`
- Escopo normalizado: `BK-MF8-11`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas atualizacao deste relatorio de auditoria, permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Nota de worktree: antes da reauditoria ja existiam `docs/evidence/MF8/`, `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` e `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` como artefactos nao rastreados; foram preservados.

### Contrato revalidado

`BK-MF8-11 - IA nao altera dados contabilisticos; apenas analisa e recomenda` continua alinhado com `RNF32`, prioridade `P0`, owner `Oleksii`, apoio `Pedro`, dependencias `-`, sprint `S12`, tipo `Reforco` e handoff para `BK-MF8-12`.

Fontes reconsultadas nesta reauditoria:

- `docs/RNF.md:97-100`: `RNF32` confirma a fronteira de IA apenas analitica/recomendatoria.
- `docs/RF.md:179-185`: criterios de aceitacao mantem insights/sugestoes com explicacao/fonte e sem alteracao contabilistica automatica.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:107-109`: confirma cadeia `BK-MF8-10 -> BK-MF8-11 -> BK-MF8-12`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md:132-134`: confirma guia, prioridade, requisito e proximo BK.
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda.md:22-58`: define objetivo, scope-in, scope-out e negativos minimos.
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda.md:170-305`: exige policy, denylist, chamada antes do `upsert` e persistencia apenas recomendatoria.
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-alertas-configuraveis-ativar-desativar-tipos.md:24-39`: confirma que a categoria `ai` em alertas nao alarga RNF32 para execucao automatica.

### Evidencia objetiva no codigo real

| Area | Estado | Evidencia |
| --- | --- | --- |
| Policy RNF32 | `OK` | `real_dev/api/src/modules/ai/aiGovernancePolicy.js:1-8` documenta a fronteira assistiva; `:10-22` define `BLOCKED_AI_ACTION_TYPES`; `:43-72` rejeita sugestoes ambiguas e acoes financeiras/contabilisticas. |
| Normalizacao anti-bypass | `OK` | `aiGovernancePolicy.js:26-34` normaliza `actionType` antes da denylist, cobrindo espacos, hifens e minusculas. |
| Integracao antes da persistencia | `OK` | `real_dev/api/src/modules/ai/aiService.js:437-450` chama `assertAiRecommendationOnly()` antes de `prisma.aiActionSuggestion.upsert`. |
| Persistencia recomendatoria | `OK` | `aiService.js:450-478` grava sugestoes `OPEN` com `companyId`, `insightId`, `actionType`, `title`, `rationale`, `sourceLabel` e `createdById`; nao cria pagamento, lancamento, aprovacao ou alteracao contabilistica. |
| Rota protegida | `OK` | `real_dev/api/src/modules/ai/aiRoutes.js:42-53` aplica auth, empresa ativa, permissao `AI_READ` e roles; `:81-90` usa `req.companyId` e `req.user.id` no endpoint de sugestoes. |
| Modelo Prisma | `OK` | `real_dev/api/prisma/schema.prisma:1129-1148` modela `AiActionSuggestion` como recomendacao por empresa/insight/actionType, sem campos de execucao automatica. |
| Testes RNF32 | `OK` | `real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js:72-148` cobre positivos, denylist completa, `actionType` ausente/vazio, ordem policy-before-upsert e ausencia de campos `execute`, `journalEntryId` e `paymentId`. |
| Evidence existente | `OK` | `docs/evidence/MF8/BK-MF8-11.md:22-79` documenta matriz de prova, negativos, limites e handoff para `BK-MF8-12`. |

### Pesquisas estaticas

| Comando | Resultado |
| --- | --- |
| `rg -n "assertAiRecommendationOnly|AI_AUTOMATED_FINANCIAL_ACTION_BLOCKED|AI_SUGGESTION_ACTION_REQUIRED|BLOCKED_AI_ACTION_TYPES|aiActionSuggestion\\.upsert|generateAiSuggestions|suggestionActionType" real_dev/api/src/modules/ai real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js` | `PASS`; confirmou policy, chamada antes do `upsert`, erros funcionais e teste contratual. |
| `rg -n "\\b(APPROVE_DOCUMENT|APPROVE_SALE|APPROVE_PURCHASE|POST_JOURNAL_ENTRY|CREATE_JOURNAL_ENTRY|CHANGE_ACCOUNTING_DATA|POST_SALE|POST_PURCHASE|EXECUTE_PAYMENT|REGISTER_PAYMENT|REGISTER_RECEIPT|executePayment|postJournal|createJournal|approveDocument)\\b" real_dev/api/src/modules/ai real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js real_dev/api/prisma/schema.prisma` | `PASS`; os verbos proibidos aparecem no modulo auditado apenas como denylist/policy. |
| `rg -n "req\\.(body|query)\\.companyId|body\\.companyId|query\\.companyId|companyId" real_dev/api/src/modules/ai real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js real_dev/api/prisma/schema.prisma` | `PASS_COM_NOTA`; ha hits esperados em `req.companyId`, Prisma e testes; nao ha `req.body.companyId`, `req.query.companyId`, `body.companyId` ou `query.companyId`. |
| Scan de risco em `real_dev/api/src/modules/ai` e `mf8-ai-governance.contract.test.js` para TODO/FIXME/storage sensivel/eval/segredos/RAG/OCR/embeddings/casts inseguros | `PASS`; sem ocorrencias. |
| Scan de drift de dominio em codigo/teste/evidence BK11 | `PASS`; sem referencias a FaithFlix, StudyFlow, Orelle, cosmetica, biometria, streaming, turma, sala ou material de estudo. |
| `git check-ignore -v real_dev/api/src/modules/ai/aiGovernancePolicy.js real_dev/api/src/modules/ai/aiService.js real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js docs/evidence/MF8/BK-MF8-11.md || true` | `PASS_COM_NOTA`; `real_dev/` esta ignorado por `.gitignore:4`, esperado nesta PAP; evidence nao apareceu como ignorada. |

### Validacoes executadas nesta reauditoria

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run test:mf8:ai-governance` | `PASS`; 5 testes, 5 pass, 0 fail. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; `node --check` sem erros. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 109 testes, 109 pass, 0 fail. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass, 0 fail. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes skipped explicitamente por `OPSA_SKIP_PERSISTENCE_TESTS=true`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido com 49 modulos transformados. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_NOTA`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por avisos pedagogicos antigos, incluindo BK-MF8-11. |

### Coerencia MF anterior -> MF alvo -> MF seguinte

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | A reauditoria nao encontrou enfraquecimento de auth, empresa ativa, permissoes ou contratos financeiros anteriores; suites unit/contract continuam verdes. |
| `BK-MF8-10 -> BK-MF8-11` | `OK` | BK11 consome insights explicaveis/fonteados de BK10 e acrescenta fronteira RNF32 antes da persistencia de sugestoes. |
| `BK-MF8-11 -> BK-MF8-12` | `OK` | BK12 declara alertas `ai` como preferencia/notificacao; nao cria execucao contabilistica ou financeira automatica. |
| `MF8 -> fase seguinte` | `OK_COM_RESSALVAS` | Nao houve DB persistente real nem browser autenticado; a prova ficou em contrato backend, schema, suites automatizadas, typecheck e build. |

### Findings

Nenhum finding ativo. A implementacao atual satisfaz `RNF32`: a IA recomenda e explica, mas nao aprova documentos, nao cria/posta lancamentos, nao altera dados contabilisticos, nao executa pagamentos/recebimentos e falha antes de persistir sugestoes proibidas.

### Decisao

`BK-MF8-11` permanece `AUDITADO_OK` com resultado `PASS`. A unica ressalva desta reauditoria continua externa ao codigo auditado: `validate-planificacao.sh` reporta `advisory_pass=false` por avisos pedagogicos antigos nos guias, mas mantem `overall_pass=true`; como esta execucao e reauditoria sem edicao de docs canonicos, esses avisos nao foram corrigidos.

## Execucao 2026-07-06 - Auditoria BK-MF8-11

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- Escopo pedido: `BK_IDS=[BK-MF8-11]`
- Escopo normalizado: `BK-MF8-11`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas atualizacao deste relatorio de auditoria, permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Nota de worktree: `real_dev/` esta ignorado por `.gitignore`, esperado nesta PAP; os ficheiros reais foram lidos diretamente. Ja existiam artefactos nao rastreados em `docs/evidence/MF8/`, `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` e `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`, preservados sem limpeza.

### Contrato canonico revalidado

`BK-MF8-11 - IA nao altera dados contabilisticos; apenas analisa e recomenda` continua associado a `RNF32`, prioridade `P0`, owner `Oleksii`, apoio `Pedro`, dependencias `-`, sprint `S12`, tipo `Reforco` e proximo BK `BK-MF8-12`.

Fontes revistas nesta auditoria:

- `docs/RNF.md:98`: confirma `RNF32` como requisito de que a IA nao altera dados contabilisticos e apenas analisa/recomenda.
- `docs/RF.md:183`: confirma que a camada de IA deve gerar insights/sugestoes com explicacao e fonte, sem alterar dados contabilisticos automaticamente.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:107-108`: confirma a cadeia `BK-MF8-10 -> BK-MF8-11`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:108`: confirma prioridade, owner, apoio, requisito, sprint, tipo e proximo BK.
- `docs/planificacao/backlogs/BACKLOG-MVP.md:133` e `:261`: confirmam o contrato de backlog para `BK-MF8-11`.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:120`: confirma `S12`, owner, `RNF32`, dependencia `-` e tipo `Reforco`.
- `docs/planificacao/backlogs/MF-VIEWS.md:238-251`: confirma MF8 e a presenca sequencial de `BK-MF8-11`.
- `docs/planificacao/sprints/PLANO-SPRINTS.md:67`: confirma a recalibracao da sprint `S12` para `BK-MF8-10` a `BK-MF8-12`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda.md`: exige policy backend, denylist de acoes financeiras/contabilisticas, integracao antes do `upsert`, negativos e evidence.

### Inventario do BK auditado

| Campo | Valor |
| --- | --- |
| Objetivo | Garantir que a IA so cria recomendacoes humanas e falha cedo antes de qualquer aprovacao, lancamento, alteracao contabilistica, pagamento ou sugestao ambigua. |
| RF/RNF | `RNF32` |
| Dependencias declaradas | `-` |
| Contratos consumidos | MF4/MF8: service/rotas de IA, `AiInsight`, `AiActionSuggestion`, explicabilidade de `BK-MF8-10`, empresa ativa backend e permissao `AI_READ`. |
| Handoff | `BK-MF8-12` pode configurar alertas sabendo que a categoria `ai` continua apenas notificacional/recomendatoria e nao executa acoes. |
| Policy principal | `real_dev/api/src/modules/ai/aiGovernancePolicy.js` |
| Service principal | `real_dev/api/src/modules/ai/aiService.js` |
| Router principal | `real_dev/api/src/modules/ai/aiRoutes.js` |
| Modelo persistente | `real_dev/api/prisma/schema.prisma` |
| Teste principal | `real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js` |
| Evidence | `docs/evidence/MF8/BK-MF8-11.md` |
| Scope-out | Motor autonomo de decisao, aprovacao por IA, lancamentos contabilisticos por IA, pagamentos/recebimentos por IA, permissao nova, gateway externo, alteracao de dados contabilisticos e ownership decidido no browser. |

### Evidencia objetiva no codigo real

| Area | Estado | Evidencia |
| --- | --- | --- |
| Limite geral da IA | `OK` | `real_dev/api/src/modules/ai/aiGovernancePolicy.js:1-6` declara que a IA pode explicar/recomendar, mas nao aprovar documentos, criar lancamentos nem executar pagamentos. |
| Denylist RNF32 | `OK` | `aiGovernancePolicy.js:10-22` bloqueia `APPROVE_DOCUMENT`, aprovacoes de venda/compra, `POST_JOURNAL_ENTRY`, `CREATE_JOURNAL_ENTRY`, `CHANGE_ACCOUNTING_DATA`, postagens de venda/compra, `EXECUTE_PAYMENT`, `REGISTER_PAYMENT` e `REGISTER_RECEIPT`. |
| Normalizacao | `OK` | `aiGovernancePolicy.js:26-34` normaliza `actionType` antes da validacao, evitando bypass por espacos, hifens ou minusculas. |
| Falha cedo | `OK` | `aiGovernancePolicy.js:36-72` rejeita sugestoes sem `actionType` com `AI_SUGGESTION_ACTION_REQUIRED` e acoes proibidas com `AI_AUTOMATED_FINANCIAL_ACTION_BLOCKED`. |
| Integracao antes da persistencia | `OK` | `real_dev/api/src/modules/ai/aiService.js:445-450` chama `assertAiRecommendationOnly()` antes de `prisma.aiActionSuggestion.upsert`. |
| Persistencia limitada | `OK` | `aiService.js:450-475` grava apenas `companyId`, `insightId`, `actionType`, `title`, `rationale`, `sourceLabel`, `status: "OPEN"` e `createdById`; nao ha execucao de pagamento, lancamento ou aprovacao. |
| Empresa ativa backend | `OK` | `real_dev/api/src/modules/ai/aiRoutes.js:81-90` usa `managerGuards`, `req.companyId` e `req.user.id` no endpoint de sugestoes; o browser nao decide `companyId`. |
| Permissoes | `OK` | `real_dev/api/src/modules/ai/aiRoutes.js:42-53` aplica `requireAuth`, `requireCompanyContext`, `AI_READ` e role `ADMIN/GESTOR`; `permissions.js:37-38`, `:70-71` e `:97` expõem permissoes coerentes. |
| Modelo persistente | `OK` | `real_dev/api/prisma/schema.prisma:1129-1148` define `AiActionSuggestion` como sugestao por empresa/insight/actionType, sem campos de execucao como `execute`, `journalEntryId`, `paymentId` ou aprovacao. |
| Testes de contrato | `OK` | `mf8-ai-governance.contract.test.js:72-148` cobre recomendacoes permitidas, denylist completa, ausencia/blank `actionType`, ordem policy-before-upsert e payload persistido apenas para revisao humana. |
| Evidence | `OK` | `docs/evidence/MF8/BK-MF8-11.md:22-79` regista matriz RNF32, comandos, negativos, limites e decisao final do BK. |
| Relatorio de implementacao | `OK` | `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md:3-15` marca `BK-MF8-11` como implementado com decisao `PASS`; `:29-43` lista os contratos entregues. |

### Scope-out respeitado

- Nao foi encontrado caminho de execucao por IA para aprovar documentos, criar/postar lancamentos, alterar dados contabilisticos, executar pagamentos, registar pagamentos ou registar recebimentos.
- Os verbos financeiros/contabilisticos proibidos aparecem no modulo auditado apenas como denylist de bloqueio, nao como services executores.
- A persistencia de sugestoes continua humana e aberta para revisao; `AiActionSuggestion` nao contem campos de execucao automatica.
- O endpoint de sugestoes usa empresa ativa e utilizador autenticado do backend; nao aceita ownership vindo do browser.
- Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, `apps/` ou `mockup/`.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Evidencia |
| --- | --- | --- |
| MF7 -> MF8 | `OK` | MF7 fecha interoperabilidade/exportacao/importacao/modularidade; `BK-MF8-11` nao muda contratos de backup, exportacao, importacao ou browser compatibility. |
| BK-MF8-10 -> BK-MF8-11 | `OK` | `BK-MF8-10` entrega explicacao/fonte; `BK-MF8-11` aplica uma fronteira adicional nas sugestoes geradas a partir desses insights. |
| BK-MF8-11 -> BK-MF8-12 | `OK` | O guia de `BK-MF8-12` declara que a categoria `ai` em alertas e apenas preferencia/notificacao, sem alterar a fronteira RNF32. |
| MF8 -> fases seguintes | `OK_COM_RESSALVAS` | A auditoria validou codigo, contratos, build e planificacao; nao executou browser real nem persistencia com base de dados real local. |

### Pesquisas estaticas de risco

| Comando | Resultado |
| --- | --- |
| `rg -n "assertAiRecommendationOnly|AI_AUTOMATED_FINANCIAL_ACTION_BLOCKED|AI_SUGGESTION_ACTION_REQUIRED|BLOCKED_AI_ACTION_TYPES|aiActionSuggestion\\.upsert|generateAiSuggestions|suggestionActionType" real_dev/api/src/modules/ai real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js` | `PASS`; encontrou policy, chamada antes do `upsert`, erros de dominio e testes especificos de RNF32. |
| `rg -n "\\b(APPROVE_DOCUMENT|APPROVE_SALE|APPROVE_PURCHASE|POST_JOURNAL_ENTRY|CREATE_JOURNAL_ENTRY|CHANGE_ACCOUNTING_DATA|POST_SALE|POST_PURCHASE|EXECUTE_PAYMENT|REGISTER_PAYMENT|REGISTER_RECEIPT|executePayment|postJournal|createJournal|approveDocument)\\b" real_dev/api/src/modules/ai real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js real_dev/api/prisma/schema.prisma` | `PASS`; no modulo de IA, estes termos aparecem apenas na denylist/policy auditada. |
| `rg -n "companyId|req\\.companyId|requirePermission|AI_READ|AI_WRITE|managerGuards" real_dev/api/src/modules/ai real_dev/api/src/modules/permissions/permissions.js real_dev/api/prisma/schema.prisma` | `PASS`; confirmou empresa ativa no backend, permissoes e modelos por `companyId`. |
| `rg -n "BK-MF8-11|RNF32|IA nao altera|IA não altera|altera dados contabil|apenas analisa|apenas recomenda|sugest" docs/RF.md docs/RNF.md docs/planificacao/backlogs docs/planificacao/guias-bk/MF8 docs/evidence/MF8 real_dev/api/src/modules/ai real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js` | `PASS`; confirmou rastreabilidade em RF/RNF, matriz, backlog, guia, evidence, policy, service e testes. |
| `git check-ignore -v real_dev/api/src/modules/ai/aiGovernancePolicy.js real_dev/api/src/modules/ai/aiService.js real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js docs/evidence/MF8/BK-MF8-11.md || true` | `PASS_COM_NOTA`; `real_dev/` esta ignorado por `.gitignore:4`, enquanto `docs/evidence/MF8/BK-MF8-11.md` nao apareceu como ignorado. |

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run test:mf8:ai-governance` | `PASS`; 5 testes, 5 pass, 0 fail. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; `node --check` sem erros. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 109 testes, 109 pass, 0 fail. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass, 0 fail. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes ignorados explicitamente por `OPSA_SKIP_PERSISTENCE_TESTS=true`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; `tsc --noEmit` sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build gerou 49 modulos. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_NOTA`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por avisos antigos de qualidade pedagogica dos guias, incluindo `BK-MF8-11`. |

### Validacoes nao executadas

- Nao executei testes de persistencia real sem `OPSA_SKIP_PERSISTENCE_TESTS=true`, porque esta auditoria nao deve depender de uma base de dados local externa e a suite declarou skips explicitos.
- Nao executei browser/E2E visual, porque `BK-MF8-11` e um contrato backend de governanca da IA sem alteracao de UI no escopo auditado.

### Findings

Nenhum finding ativo. A implementacao atual cumpre `RNF32` no codigo real auditado: a IA pode gerar sugestoes abertas para revisao humana, mas a policy falha antes da persistencia quando a sugestao e ambigua ou tenta cruzar a fronteira financeira/contabilistica.

### Decisao

`BK-MF8-11` fica `AUDITADO_OK` com resultado `PASS`. A unica ressalva operacional desta execucao e externa ao codigo auditado: `validate-planificacao.sh` continua a reportar `advisory_pass=false` por avisos pedagogicos pre-existentes nos guias, mas o proprio validador manteve `overall_pass=true`. Como `PERMITIR_ALTERAR_DOCS=nao`, esses avisos nao foram corrigidos nesta execucao.

## Execucao 2026-07-06 - Auditoria BK-MF8-10

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- Escopo pedido: `BK_IDS=[BK-MF8-10]`
- Escopo normalizado: `BK-MF8-10`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas atualizacao deste relatorio de auditoria, permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Nota de worktree: `real_dev/` esta ignorado por `.gitignore`, esperado nesta PAP; os ficheiros reais foram lidos diretamente. Ja existiam artefactos nao rastreados em `docs/evidence/MF8/`, `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` e `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`, preservados sem limpeza.

### Contrato canonico revalidado

`BK-MF8-10 - Insights devem incluir explicacao e origem dos dados usados` continua associado a `RNF31`, prioridade `P0`, owner `Oleksii`, apoio `Andre`, dependencias `-`, sprint `S12`, tipo `Core` e proximo BK `BK-MF8-11`.

Fontes revistas nesta auditoria:

- `docs/RNF.md:97`: confirma `RNF31` como requisito de explicacao e origem dos dados usados nos insights.
- `docs/RNF.md:98`: confirma `RNF32`, relevante para o handoff seguinte, como garantia de que a IA apenas analisa e recomenda.
- `docs/RF.md:144`, `docs/RF.md:146` e `docs/RF.md:183`: confirmam perguntas/insights com dados internos, fontes e explicacao, sem alteracao contabilistica automatica.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:106-108`: confirma a cadeia `BK-MF8-09 -> BK-MF8-10 -> BK-MF8-11`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md:131-133`: confirma prioridade, owner, apoio, requisito, guia canonico e proximo BK.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:119`: confirma `S12`, `RNF31`, ausencia de dependencias declaradas e tipo `Core`.
- `docs/planificacao/backlogs/MF-VIEWS.md:238-251`: confirma MF8 como fase de integracoes, subscricoes simuladas, qualidade final e fecho, incluindo `BK-MF8-10`.
- `docs/planificacao/sprints/PLANO-SPRINTS.md:67`: confirma a recalibracao da sprint `S12` para `BK-MF8-10` a `BK-MF8-12`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-insights-devem-incluir-explicacao-e-origem-dos-dados-usados.md`: exige validacao de `explanation`, `sourceType`, `sourceId`, `sourceLabel`, endpoint protegido `GET /api/ai/insights/:id/explanation`, negativos de explicabilidade e evidence.

### Inventario do BK auditado

| Campo | Valor |
| --- | --- |
| Objetivo | Garantir que cada insight de IA tem explicacao concreta e origem rastreavel, sem inventar fontes nem executar acoes automaticas. |
| RF/RNF | `RNF31` |
| Dependencias declaradas | `-` |
| Contratos consumidos | MF4: service/rotas de IA, `AiInsight`, `AiActionSuggestion`, frontend `AiInsightsPage`; MF7/MF8: auth, empresa ativa backend, permissao `AI_READ`, limites de IA documentados em BK09. |
| Handoff | `BK-MF8-11` pode reutilizar o guardrail e o endpoint para provar que a IA recomenda, mas nao altera dados contabilisticos. |
| Service principal | `real_dev/api/src/modules/ai/aiService.js` |
| Router principal | `real_dev/api/src/modules/ai/aiRoutes.js` |
| Modelo persistente | `real_dev/api/prisma/schema.prisma` |
| Cliente/pagina frontend | `real_dev/web/src/lib/mf4Api.ts`; `real_dev/web/src/pages/mf4Pages.tsx` |
| Teste principal | `real_dev/api/tests/contracts/mf8-ai-explainability.contract.test.js` |
| Evidence | `docs/evidence/MF8/BK-MF8-10.md` |
| Scope-out | Provider generativo novo, OCR/RAG/embeddings, pagamentos, checkout, webhooks, alteracao contabilistica automatica, fonte inventada, dados cross-company, `companyId` vindo do browser. |

### Evidencia objetiva no codigo real

| Area | Estado | Evidencia |
| --- | --- | --- |
| Limite geral da IA | `OK` | `real_dev/api/src/modules/ai/aiService.js:1-7` declara que a IA e assistiva, explica fonte e nao aprova, contabiliza, altera precos ou repoe stock automaticamente. |
| Candidatos com explicacao/fonte | `OK` | `aiService.js:62-115` converte alertas de stock em insights com `companyId`, `title`, `explanation`, `sourceType`, `sourceId` e `sourceLabel`; `:266-358` cria candidatos a partir de reports, KPIs, documentos de venda e alertas da empresa ativa. |
| Chave multiempresa | `OK` | `aiService.js:200-209` usa chave composta `companyId_type_sourceType_sourceId`, evitando colisoes entre empresas/fonte. |
| Validador RNF31 | `OK` | `aiService.js:211-257` define `EXPLAINABLE_INSIGHT_FIELDS` e `assertExplainableInsight()`, rejeitando campos vazios com `AI_INSIGHT_NOT_EXPLAINABLE` e explicacao curta com `AI_INSIGHT_EXPLANATION_TOO_SHORT`. |
| Bloqueio antes da persistencia | `OK` | `aiService.js:368-396` chama `assertExplainableInsight(candidate)` antes do `upsert`, impedindo insight sem fonte/explicacao de entrar no modelo persistente. |
| Endpoint de explicacao | `OK` | `aiService.js:405-427` consulta `aiInsight.findFirst` por `{ id: input.insightId, companyId: input.companyId }`, revalida o registo e devolve `id`, `title`, `explanation`, `source` e `guardrail`. |
| Sugestoes nao executam acoes | `OK` | `aiService.js:436-475` gera sugestoes a partir de insights persistidos com `explanation` e `sourceLabel`; nao executa a acao recomendada. |
| Perguntas continuam source-grounded | `OK` | `aiService.js:484-548` usa `companyId`, valida a pergunta e devolve fontes internas no payload de resposta. |
| Router protegido | `OK` | `real_dev/api/src/modules/ai/aiRoutes.js:42-53` aplica `requireAuth`, `requireCompanyContext` e `requirePermission(Permission.AI_READ)`; `:69-79` expoe `GET /insights/:id/explanation` usando `req.companyId`, nao payload do browser. |
| Montagem real | `OK` | `real_dev/api/src/server.js:46` importa `buildAiRoutes`; `:136` monta `/api/ai`. |
| Permissao funcional | `OK` | `real_dev/api/src/modules/permissions/permissions.js:37-38` define `AI_READ`/`AI_WRITE`; `:70-71` e `:97` atribuem `AI_READ` a roles operacionais relevantes. |
| Modelo persistente | `OK` | `real_dev/api/prisma/schema.prisma:1101-1127` define `AiInsight` com `explanation`, `sourceType`, `sourceId`, `sourceLabel`, relacao por `companyId` e unicidade por empresa/tipo/fonte. |
| Cliente frontend tipado | `OK` | `real_dev/web/src/lib/mf4Api.ts:9-21` tipa `AiInsight`; `:50-56` tipa `InsightExplanation`; `:140-144` chama `/ai/insights/:id/explanation` apenas com `id` codificado. |
| Pagina consumidora | `OK` | `real_dev/web/src/pages/mf4Pages.tsx:202-253` mostra insights, pede a explicacao via `getInsightExplanation(item.id)` e apresenta o resultado sem enviar `companyId`. |
| Teste contratual | `OK` | `real_dev/api/tests/contracts/mf8-ai-explainability.contract.test.js:21-28` define fixture valida; `:57-75` verifica query por `id + companyId`; `:77-139` cobre positivo, rota, payload e negativos. |
| Evidence | `OK` | `docs/evidence/MF8/BK-MF8-10.md:23-47` regista matriz RNF31, comandos e resultados; `:49-64` documenta negativos e limites. |
| Relatorio de implementacao | `OK` | `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md:3-15` marca o BK como implementado; `:35-42` lista contratos entregues; `:99-122` regista comandos e validacoes nao executadas. |

### Scope-out respeitado

- Nao foi encontrado provider generativo novo, OCR, RAG, embeddings, gateway de pagamento, checkout, invoice, webhook ou integracao externa nova no escopo auditado.
- A IA continua explicavel e recomendatoria; nao aprova documentos, nao altera dados contabilisticos e nao executa acoes automaticamente.
- O endpoint de explicacao usa empresa ativa resolvida no backend e retorna `AI_INSIGHT_NOT_FOUND` quando o insight nao pertence a empresa autenticada.
- O frontend envia apenas o `id` do insight; nao envia `companyId`, nao persiste contexto sensivel e nao contorna o cliente API tipado.
- Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, `apps/` ou `mockup/`.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `syntax:check`, `prisma:validate`, `test:contracts`, `test:unit`, `typecheck` e `build` passaram; auth, empresa ativa, permissoes e modularidade nao foram enfraquecidos. |
| `BK-MF8-09 -> BK-MF8-10` | `OK` | O BK consome a documentacao tecnica minima de IA explicavel/recomendatoria e materializa essa regra no service, endpoint, teste e evidence. |
| `BK-MF8-10 -> BK-MF8-11` | `OK` | O proximo BK pode reutilizar `assertExplainableInsight()`, `explainAiInsight()` e o `guardrail` para provar RNF32. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | Nao houve smoke manual em browser autenticado nem integracao persistida com DB real; a prova ficou em contratos deterministas, typecheck/build e validacoes estaticas. |

### Pesquisa estatica

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n "TODO implementar|FIXME|temporario|temporary|demo only|implementar depois|pseudo-codigo|payload: unknown|as any|localStorage|sessionStorage|dangerouslySetInnerHTML|eval\\(|new Function|password.*console|token.*console|cookie.*console|console\\.log\\(.*password|console\\.log\\(.*token|secret|api[_-]?key|deleteMany\\(\\{\\}\\)|delete\\(\\{\\}\\)|updateMany\\(\\{\\}\\)|CORS|Access-Control-Allow-Origin|RAG|embeddings|OCR|chunking semantico" real_dev/api/src/modules/ai real_dev/api/tests/contracts/mf8-ai-explainability.contract.test.js real_dev/web/src/lib/mf4Api.ts real_dev/web/src/pages/mf4Pages.tsx docs/evidence/MF8/BK-MF8-10.md --glob '!**/node_modules/**' --glob '!**/dist/**'` | `PASS`; sem matches. | Sem marcador de implementacao incompleta, storage sensivel, execucao dinamica, segredo/log perigoso ou drift tecnico no escopo BK10. |
| `rg -n "FaithFlix|StudyFlow|Orelle|cosmetica|cosmetica|biometria|streaming|pool solidaria|turma|professor|sala|material de estudo" real_dev/api/src/modules/ai real_dev/api/tests/contracts/mf8-ai-explainability.contract.test.js real_dev/web/src/lib/mf4Api.ts real_dev/web/src/pages/mf4Pages.tsx docs/evidence/MF8/BK-MF8-10.md --glob '!**/node_modules/**' --glob '!**/dist/**'` | `PASS`; sem matches. | Sem drift de dominio no codigo/evidence BK10 auditado. |
| `rg -n "openai|anthropic|llm|provider|gateway|checkout|invoice|webhook|payment|pagamento real|executa alteracoes|altera dados contabilisticos|automaticamente" real_dev/api/src/modules/ai real_dev/api/tests/contracts/mf8-ai-explainability.contract.test.js real_dev/web/src/lib/mf4Api.ts real_dev/web/src/pages/mf4Pages.tsx docs/evidence/MF8/BK-MF8-10.md --glob '!**/node_modules/**' --glob '!**/dist/**'` | `PASS_COM_RESSALVAS`; hits apenas em comentarios/guardrails que negam execucao automatica ou provider externo. | O escopo proibido aparece como limite explicito, nao como capacidade implementada. |
| `rg -n "req\\.(body|query)\\.companyId|body\\.companyId|query\\.companyId|companyId" real_dev/api/src/modules/ai real_dev/api/tests/contracts/mf8-ai-explainability.contract.test.js real_dev/web/src/lib/mf4Api.ts real_dev/web/src/pages/mf4Pages.tsx --glob '!**/node_modules/**' --glob '!**/dist/**'` | `PASS_COM_RESSALVAS`; matches esperados em `req.companyId`, inputs internos e asserts de teste; sem `req.body.companyId`, `req.query.companyId`, `body.companyId` ou `query.companyId`. | Ownership permanece no backend; o browser nao decide empresa ativa. |
| `git check-ignore -v real_dev real_dev/api/src/modules/ai/aiService.js real_dev/api/tests/contracts/mf8-ai-explainability.contract.test.js real_dev/web/dist/index.html` | `INFO`; `.gitignore:4:real_dev/`. | Esperado nesta PAP; auditoria leu o codigo real diretamente e nao tratou `real_dev/` como finding. |

### Validacoes executadas nesta auditoria

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run test:mf8:ai-explainability` | `PASS`; 5 testes, 5 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 104 testes, 104 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes skipped explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido com 49 modulos transformados. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories documentais legados fora da implementacao auditada. |

### Validacoes nao executadas

- Smoke manual em browser real com sessao autenticada viva nao foi executado; a prova ficou em contrato backend, typecheck e build frontend.
- Integracao persistida real com DB nao foi executada porque nao existe `TEST_DATABASE_URL`; a suite de integracao foi corrida com skip explicito via `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- E2E complexo com navegador real nao foi executado; o guia BK10 pede contrato de backend, endpoint, evidence e confirmacao frontend basica, todos auditados pelos artefactos acima.

### Findings

Nenhum finding ativo.

### Conclusao

`BK-MF8-10` esta implementado em `real_dev` e cumpre o contrato auditado: insights sem explicacao/fonte sao bloqueados antes de persistir ou sair em payload publico, o endpoint `GET /api/ai/insights/:id/explanation` esta protegido por auth, empresa ativa e `AI_READ`, o acesso e filtrado por `{ id, companyId }`, o frontend consome a explicacao sem enviar `companyId`, e os negativos de explicabilidade/cross-company estao cobertos por teste contratual. Resultado: `PASS`.

## Execucao 2026-07-05 - Auditoria BK-MF8-09

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- Escopo pedido: `BK_IDS=[BK-MF8-09]`
- Escopo normalizado: `BK-MF8-09`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas atualizacao deste relatorio de auditoria
- Nota de worktree: `real_dev/` esta ignorado por `.gitignore`, esperado nesta PAP; os ficheiros reais foram lidos diretamente. Ja existiam artefactos nao rastreados em `docs/evidence/MF8/`, `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` e `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`, preservados sem limpeza.

### Contrato canonico revalidado

`BK-MF8-09 - Documentacao tecnica minima (arquitetura, modelos, fluxo contabilistico)` continua associado a `RNF30`, prioridade `P1`, owner `Pedro`, apoio `Oleksii`, dependencias `-`, sprint `S12`, tipo `Core` e proximo BK `BK-MF8-10`.

Fontes revistas nesta auditoria:

- `docs/RNF.md:83-88`: confirma `RNF30` como documentacao tecnica minima de arquitetura, modelos e fluxo contabilistico.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:105-107`: confirma a posicao `BK-MF8-08 -> BK-MF8-09 -> BK-MF8-10`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md:130-132`: confirma prioridade, owner, apoio, requisito, guia canonico e proximo BK.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:117-119`: confirma `S12`, `RNF30`, ausencia de dependencias declaradas e tipo `Core`.
- `docs/planificacao/backlogs/MF-VIEWS.md:236-250`: confirma MF8 como fase de integracoes, subscricoes simuladas, qualidade final e fecho, incluindo `BK-MF8-09` e `BK-MF8-10`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico.md:5-19`: confirma header, owner, prioridade, requisito, sprint e proximo BK.
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico.md:30-44`: exige documento tecnico, evidence, arquitetura, modelos, separacao contabilistica, checklist e scope-out legal/fiscal.
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico.md:101-113`: exige gate `check-mf8-technical-docs.mjs`, ligacao ao package e revisao de Prisma/server/App.
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-testes-e-evidencia-de-subscricoes-simuladas.md`: confirma a evidence de subscricoes simuladas como input imediato para a documentacao tecnica minima.
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-insights-devem-incluir-explicacao-e-origem-dos-dados-usados.md`: confirma o handoff seguinte para explicacao e origem dos insights.

### Inventario do BK auditado

| Campo | Valor |
| --- | --- |
| Objetivo | Criar documentacao tecnica minima que explica arquitetura, modelos, fluxos e limites contabilisticos sem transformar o MVP numa promessa legal/fiscal. |
| RF/RNF | `RNF30` |
| Dependencias declaradas | `-` |
| Contratos consumidos | MF0..MF7: auth por cookie HttpOnly, empresa ativa no backend, permissoes, dados mestre, vendas, compras, inventario, tesouraria, contabilidade, IA explicavel, auditoria, hardening e gates de qualidade; BK08: evidence de subscricoes simuladas. |
| Handoff | `BK-MF8-10` pode usar as secoes de IA, fontes, limites e subscricao simulada para auditar explicacao/origem dos insights. |
| Documento tecnico principal | `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md` |
| Evidence PR/defesa | `docs/evidence/MF8/BK-MF8-09.md` |
| Gate principal | `real_dev/api/scripts/check-mf8-technical-docs.mjs` |
| Script npm | `npm --prefix real_dev/api run test:mf8:technical-docs` |
| Scope-out | Manual legal completo, certificacao fiscal, integracoes bancarias reais, OCR/RAG/embeddings, automacao contabilistica, pagamento real e alteracao de RF/RNF/matriz. |

### Evidencia objetiva no codigo e artefactos reais

| Area | Estado | Evidencia |
| --- | --- | --- |
| Documento tecnico existe | `OK` | `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md:1-7` declara o documento como resposta a `RNF30` e limita o escopo a factos observados no codigo atual. |
| Arquitetura backend/frontend | `OK` | `ARQUITETURA-TECNICA-MINIMA.md:9-26` documenta API Express por dominios, `PrismaClient`, routers/services e frontend React/Vite com cliente central `credentials: "include"`. |
| Modelos relevantes | `OK` | `ARQUITETURA-TECNICA-MINIMA.md:28-52` cobre modelos estruturais, operacionais, contabilisticos, IA e `CompanySubscription`. |
| Fluxos contabilisticos | `OK` | `ARQUITETURA-TECNICA-MINIMA.md:54-80` separa vendas/recebimentos/contabilidade, compras/pagamentos/contabilidade, inventario, tesouraria, reporting e fiscalidade. |
| Limite da IA | `OK` | `ARQUITETURA-TECNICA-MINIMA.md:82-84` declara IA como explicavel e recomendatoria, sem aprovar documentos, alterar dados contabilisticos, criar movimentos ou executar sugestoes. |
| Subscricao simulada | `OK` | `ARQUITETURA-TECNICA-MINIMA.md:86-97` documenta planos e ciclo de vida simulados, endpoints, empresa ativa e ausencia de cobranca/fatura/recibo/pagamento/checkout/webhook/lancamento automatico. |
| Limites do MVP | `OK` | `ARQUITETURA-TECNICA-MINIMA.md:99-107` rejeita certificacao fiscal, integracoes bancarias reais, OCR, RAG, embeddings, automacoes contabilisticas, storage sensivel no frontend e decisoes legais inventadas. |
| Checklist documental | `OK` | `ARQUITETURA-TECNICA-MINIMA.md:109-115` define manutencao futura da documentacao e preserva multiempresa/limites. |
| Evidence BK09 | `OK` | `docs/evidence/MF8/BK-MF8-09.md:12-17` lista artefactos verificados; `:21-25` mapeia RNF30 para prova positiva e negativos; `:53-61` entrega handoff e decisao. |
| Gate tecnico | `OK` | `real_dev/api/scripts/check-mf8-technical-docs.mjs:1-7` declara objetivo do gate; `:19-28` exige secoes obrigatorias; `:30-50` exige marcadores tecnicos; `:52-61` rejeita promessas fora do MVP. |
| Negativos controlados | `OK` | `check-mf8-technical-docs.mjs:70-85` aplica mutacoes `remove-limits` e `add-fiscal-certification` sem editar o documento real; `:94-117` devolve erros auditaveis. |
| Execucao do gate | `OK` | `check-mf8-technical-docs.mjs:124-149` valida existencia do documento, aplica mutacao controlada e falha com mensagem clara. |
| Script npm | `OK` | `real_dev/api/package.json:13-19` expoe `syntax:check`, `test:contracts`, `test:mf8:subscriptions`, `test:mf8:technical-docs` e `test:integration`. |
| Server real | `OK` | `real_dev/api/src/server.js:13-56` importa routers por dominio; `:81-141` monta health, auth, empresas, vendas, compras, inventario, contabilidade, tesouraria, compliance, reports, subscriptions, IA, audit e integrations. |
| Modelos reais referenciados | `OK` | `real_dev/api/prisma/schema.prisma:257-272` define `CompanySubscription`; `:538-565` define `JournalEntry`/`JournalEntryLine`; `:1103-1146` define `AiInsight`/`AiActionSuggestion`. |
| Frontend real | `OK` | `real_dev/web/src/App.tsx:1-23` importa paginas reais; `:953-1004` regista paginas MF4/MF8; `real_dev/web/src/lib/apiClient.ts:74-88` envia cookies com `credentials: "include"`. |

### Scope-out respeitado

- Nao foram criados endpoints, schemas, migrations, servicos ou componentes fora do contrato documental/gate.
- Nao ha declaracao de certificacao fiscal, submissao legal completa, integracao bancaria real, OCR, RAG, embeddings ou automacao contabilistica.
- A subscricao continua explicitamente simulada e sem gateway, checkout, fatura, recibo, invoice, webhook, pagamento real ou lancamento contabilistico automatico.
- A IA continua descrita como analise/recomendacao com fonte; nao executa acoes.
- Nao foram alterados BKs, RF/RNF, matriz, backlog, guias canonicos, `apps/` ou `mockup/`.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `syntax:check`, `prisma:validate`, `test:contracts`, `test:unit`, `typecheck` e `build` passaram; a auditoria nao encontrou regressao em modularidade, cookies, empresa ativa, permissoes ou gates. |
| `BK-MF8-08 -> BK-MF8-09` | `OK` | O documento tecnico consome a evidence de subscricoes simuladas e reforca que a subscricao nao gera efeitos contabilisticos nem pagamento real. |
| `BK-MF8-09 -> BK-MF8-10` | `OK` | A evidence `BK-MF8-09.md:53-57` deixa o handoff para explicacao/origem dos insights com limites de IA, fontes e subscricao simulada. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | A documentacao e o gate deixam limites explicitos; nao houve smoke manual em browser real nem integracao persistida com `TEST_DATABASE_URL`, porque o BK09 nao adiciona fluxo runtime novo. |

### Pesquisa estatica

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n "TODO implementar\|FIXME\|temporario\|temporary\|demo only\|implementar depois\|pseudo-codigo\|payload: unknown\|as any\|localStorage\|sessionStorage\|dangerouslySetInnerHTML\|eval\(\|new Function\|password.*console\|token.*console\|cookie.*console\|console\\.log\\(.*password\|console\\.log\\(.*token\|secret\|api[_-]?key\|deleteMany\\(\\{\\}\\)\|delete\\(\\{\\}\\)\|updateMany\\(\\{\\}\\)\|CORS\|Access-Control-Allow-Origin\|RAG\|embeddings\|OCR\|chunking semantico" real_dev/api real_dev/web --glob '!**/node_modules/**' --glob '!**/dist/**'` | `PASS_COM_RESSALVAS`; hits em denylist/gates/testes negativos/storage privado e comentarios de seguranca. | Sem finding ligado ao BK09; ocorrencias sao mecanismos que impedem segredos/storage ou testes que provam redacao. |
| `rg -n "FaithFlix\|StudyFlow\|Orelle\|cosmetica\|cosmética\|biometria\|streaming\|pool solidaria\|turma\|professor\|sala\|material de estudo" real_dev/api real_dev/web docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md docs/evidence/MF8/BK-MF8-09.md --glob '!**/node_modules/**' --glob '!**/dist/**'` | `PASS`; sem matches. | Sem drift de dominio no codigo/evidence BK09 auditado. |
| `rg -n "certificacao fiscal\|gateway de pagamento real\|checkout real\|usa OCR\|OCR ativo\|usa RAG\|RAG ativo\|usa embeddings\|embeddings ativos\|executa automacao contabilistica\|IA altera dados contabilisticos" docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md docs/evidence/MF8/BK-MF8-09.md real_dev/api/scripts/check-mf8-technical-docs.mjs` | `PASS_COM_RESSALVAS`; hits apenas em negacoes explicitas, regex do gate e negativos controlados. | O documento nao promete capacidades proibidas; o gate testa que essas promessas falham. |
| `git check-ignore -v real_dev real_dev/api/scripts/check-mf8-technical-docs.mjs real_dev/api/package.json real_dev/web/dist/index.html` | `INFO`; `.gitignore:4:real_dev/`. | Esperado nesta PAP; auditoria leu o codigo real diretamente e nao tratou `real_dev/` como finding. |

### Validacoes executadas nesta auditoria

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run test:mf8:technical-docs` | `PASS`; `Documentacao tecnica minima MF8 validada.` |
| `OPSA_MF8_TECH_DOC_MUTATION=remove-limits npm --prefix real_dev/api run test:mf8:technical-docs` | `PASS_NEGATIVO`; exit code `1` esperado com `Falta seccao obrigatoria: ## Limites`. |
| `OPSA_MF8_TECH_DOC_MUTATION=add-fiscal-certification npm --prefix real_dev/api run test:mf8:technical-docs` | `PASS_NEGATIVO`; exit code `1` esperado por promessa fora do MVP. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 99 testes, 99 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes skipped explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run test:mf8:subscriptions-ui` | `PASS`; `MF8 subscriptions UI smoke OK`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido com 49 modulos transformados. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories documentais legados fora da implementacao auditada. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |

### Validacoes nao executadas

- Smoke manual em browser real com sessao autenticada viva nao foi executado; `BK-MF8-09` entrega documentacao tecnica e gate, sem fluxo UI novo.
- Integracao persistida real com DB nao foi executada porque nao existe `TEST_DATABASE_URL`; a suite de integracao foi corrida com skip explicito via `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- Validacao legal/fiscal externa nao foi executada e nao e prometida pelo BK; o documento marca esses pontos como limites.

### Findings

Nenhum finding ativo.

### Conclusao

`BK-MF8-09` esta implementado em `real_dev` e cumpre o contrato auditado: documentacao tecnica minima existe, cobre arquitetura/modelos/fluxos/limites, separa documento operacional/pagamento-recebimento/lancamento contabilistico, documenta a subscricao como simulada, preserva limites de IA, entrega evidence de PR/defesa e possui gate automatico com positivos e negativos. Resultado: `PASS`.

## Execucao 2026-07-05 - Auditoria BK-MF8-08

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- Escopo pedido: `BK_IDS=[BK-MF8-08]`
- Escopo normalizado: `BK-MF8-08`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas atualizacao deste relatorio de auditoria
- Nota de worktree: `real_dev/` esta ignorado por `.gitignore`, esperado nesta PAP; os ficheiros reais foram lidos diretamente. Ja existiam artefactos nao rastreados em `docs/evidence/MF8/`, `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` e `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`, preservados sem limpeza.

### Contrato canonico revalidado

`BK-MF8-08 - Testes e evidencia de subscricoes simuladas` continua associado a `RF49`, `RF50` e `RF51`, prioridade `P1`, owner `Oleksii`, apoio `Andre`, dependencias `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06` e `BK-MF8-07`, sprint `S12`, tipo `Core` e proximo BK `BK-MF8-09`.

Fontes revistas nesta auditoria:

- `docs/RF.md:173-175` e `185`: confirma planos simulados mensal/trimestral/anual, gestao da subscricao da empresa ativa, renovacao/cancelamento/reativacao e ausencia de pagamento real.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:100-105`: confirma a cadeia `BK-MF8-03 -> BK-MF8-04 -> BK-MF8-05 -> BK-MF8-06 -> BK-MF8-07 -> BK-MF8-08`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md:125-130`: confirma prioridade, owners, dependencias, RFs e guia canonico.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:112-117`: confirma sprint, requisito, dependencias, guia e tipo `Core`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-testes-e-evidencia-de-subscricoes-simuladas.md:5-19`: confirma header, owner, prioridade, dependencias, RFs, sprint, tipo e proximo BK.
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-testes-e-evidencia-de-subscricoes-simuladas.md:30-42`: exige matriz de testes, positivos/negativos, `docs/evidence/MF8/BK-MF8-08.md`, comando `test:mf8:subscriptions` e confirmacao de que nao ha cobranca real.
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-testes-e-evidencia-de-subscricoes-simuladas.md:177-179`: exige reutilizar os exports reais `listSimulatedSubscriptionPlans`, `activateSimulatedSubscription`, `runSimulatedSubscriptionAction` e `assertSubscriptionLifecycleTransition`.
- `docs/evidence/MF8/BK-MF8-08.md:20-35`: contem matriz RF49/RF50/RF51 e negativos de transicao, plano, empresa ativa e campos de pagamento.

### Inventario do BK auditado

| Campo | Valor |
| --- | --- |
| Objetivo | Fechar a funcionalidade de subscricoes simuladas com teste contratual agregador, smoke frontend e evidence organizada. |
| RF/RNF | `RF49`, `RF50`, `RF51` |
| Dependencias | `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06`, `BK-MF8-07` |
| Handoff | `BK-MF8-09` pode documentar arquitetura/modelos/fluxos com evidence consolidada de que a subscricao e simulada. |
| Contrato principal | `real_dev/api/tests/contracts/mf8-subscriptions.contract.test.js` |
| Script principal | `npm --prefix real_dev/api run test:mf8:subscriptions` |
| Evidence | `docs/evidence/MF8/BK-MF8-08.md` |
| Scope-out | E2E complexo com navegador real, gateway externo, checkout, cartoes, recibos, faturas, invoices, webhooks, cobranca real e reabrir BK03-BK07 sem finding concreto. |

### Evidencia objetiva no codigo real

| Area | Estado | Evidencia |
| --- | --- | --- |
| Contrato agregador | `OK` | `real_dev/api/tests/contracts/mf8-subscriptions.contract.test.js:1-7` declara a suite como contrato de evidence para `RF49`, `RF50` e `RF51`; `:12-17` importa os exports reais exigidos pelo guia. |
| Double Prisma controlado | `OK` | `mf8-subscriptions.contract.test.js:76-135` cria double em memoria com transacao, `upsert`, `findUnique`, `update` e auditoria capturada, sem depender de DB real para este contrato. |
| Ausencia de pagamento real | `OK` | `mf8-subscriptions.contract.test.js:22-27` lista campos proibidos; `:156-164` verifica que `paymentProvider`, `checkoutUrl`, `paymentIntentId` e `invoiceId` nao aparecem nos payloads publicos testados. |
| `RF49` | `OK` | `mf8-subscriptions.contract.test.js:166-179` valida `monthly`, `quarterly`, `yearly`, moeda `EUR`, `simulated: true`, `billingCycle`/`intervalCount` e ausencia de contrato de pagamento real. |
| `RF50` | `OK` | `mf8-subscriptions.contract.test.js:181-209` ativa subscricao pela empresa ativa, confirma `state=active`, `planCode=monthly`, `simulated=true`, auditoria `subscription.activate` e sem campos de pagamento real. |
| `RF51` | `OK` | `mf8-subscriptions.contract.test.js:211-260` renova, cancela e reativa via `runSimulatedSubscriptionAction`, confirma auditorias `subscription.renew`, `subscription.cancel` e `subscription.reactivate`, e preserva ausencia de gateway externo. |
| Negativos | `OK` | `mf8-subscriptions.contract.test.js:262-291` cobre transicao invalida, reativacao sem plano e ativacao sem empresa ativa. |
| Script npm backend | `OK` | `real_dev/api/package.json:17` expoe `test:mf8:subscriptions`. |
| Catalogo herdado BK03 | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionPlans.js:8-12` define codigos canonicos; `:16-41` define planos mensal/trimestral/anual; `:75-83` devolve planos publicos clonados, `EUR` e `simulated: true`. |
| Subscricao atual/ativacao/ciclo de vida | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionService.js:55-65` exige empresa ativa; `:224-251` calcula ciclos; `:293-301` consulta por `companyId` backend; `:436-479` ativa; `:488-538` renova/cancela/reativa com ownership e auditoria. |
| Rotas e guards | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js:48-78` e `:87-132` restringem bodies; `:143-152` aplica auth, empresa ativa e roles; `:167-230` expoe planos, estado atual, ativacao e acoes usando `req.companyId`/`req.user?.id`. |
| Montagem no servidor | `OK` | `real_dev/api/src/server.js:56` importa o router; `:135` monta `/api/subscriptions`. |
| Modelo persistente | `OK` | `real_dev/api/prisma/schema.prisma:133-137` define estados; `:257-272` define `CompanySubscription` com `companyId @unique`, `planCode`, `status`, datas e `simulated`. |
| Cliente frontend herdado BK07 | `OK` | `real_dev/web/src/lib/subscriptionsApi.ts:60-73` carrega planos e estado; `:84-114` executa ativacao e acoes; `:174-187` faz gating visual por estado. |
| UI herdada BK07 | `OK` | `real_dev/web/src/pages/SubscriptionsPage.tsx:147-180` executa acoes via cliente tipado; `:246-365` mostra estado, planos e acoes; `:362-365` comunica que as acoes sao simuladas e validadas no backend. |
| Gate frontend | `OK` | `real_dev/web/scripts/check-mf8-subscriptions-ui.mjs:92-125` valida cookies HttpOnly via cliente central, endpoints, acoes, navegacao, estilos e negativos: sem `fetch` direto, sem storage sensivel e sem `companyId` na UI de subscricoes. |
| Script npm frontend | `OK` | `real_dev/web/package.json:22` expoe `test:mf8:subscriptions-ui`. |
| Evidence tecnica | `OK` | `docs/evidence/MF8/BK-MF8-08.md:37-50` regista comandos executados e resultados; `:52-65` documenta limites, ausencia de cobranca real e handoff para `BK-MF8-09`. |

### Scope-out respeitado

- Nao ha gateway externo, checkout, cartao, recibo, fatura, invoice, webhook, provider de pagamento ou cobranca real no contrato auditado.
- O frontend de subscricoes nao envia `companyId`, nao guarda sessao/role/empresa ativa em `localStorage` ou `sessionStorage`, e nao chama `fetch` diretamente.
- O browser recolhe apenas intencao de plano/acao; empresa ativa, utilizador autenticado, role e ownership final continuam resolvidos no backend.
- Nao foram reabertos os BKs `BK-MF8-03` a `BK-MF8-07`; foram revalidados como dependencias do contrato agregador.
- Nao foram adicionadas dependencias novas.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `syntax:check`, `test:contracts`, `test:unit`, `typecheck`, `build` e `prisma:validate` continuam verdes; hardening, cookies HttpOnly, empresa ativa e roles nao foram enfraquecidos. |
| `BK-MF8-03 -> BK-MF8-08` | `OK` | O contrato valida os tres planos canonicos, `EUR`, `billingCycle`, `intervalCount` e `simulated: true`. |
| `BK-MF8-04 -> BK-MF8-08` | `OK` | A prova usa `CompanySubscription` por empresa ativa e valida ausencia de subscricao/empresa ativa nos negativos. |
| `BK-MF8-05 -> BK-MF8-08` | `OK` | A ativacao simulada e testada com `activateSimulatedSubscription`, auditoria minima e sem pagamento real. |
| `BK-MF8-06 -> BK-MF8-08` | `OK` | Renovacao, cancelamento e reativacao sao testados com `runSimulatedSubscriptionAction` e `assertSubscriptionLifecycleTransition`. |
| `BK-MF8-07 -> BK-MF8-08` | `OK` | O gate `test:mf8:subscriptions-ui` passou e confirma cliente/pagina/navegacao sem ownership no browser. |
| `BK-MF8-08 -> BK-MF8-09` | `OK` | Evidence e matriz RF49/RF50/RF51 estao consolidadas para documentacao tecnica minima. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | Nao foi feito smoke manual em browser real autenticado nem integracao persistida com `TEST_DATABASE_URL`; estes limites estao documentados na evidence e nao bloqueiam o contrato agregador pedido. |

### Pesquisa estatica

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n 'TODO implementar\|FIXME\|req\.(body\|query)\.companyId\|body\.companyId\|query\.companyId' real_dev/api/src/modules/subscriptions real_dev/api/tests/contracts/mf8-subscriptions.contract.test.js real_dev/web/src/lib/subscriptionsApi.ts real_dev/web/src/pages/SubscriptionsPage.tsx real_dev/web/scripts/check-mf8-subscriptions-ui.mjs` | `PASS`; sem matches. | Sem TODO/FIXME ou ownership vindo de body/query no escopo BK08. |
| `rg -n 'companyId\|localStorage\|sessionStorage\|fetch\(' real_dev/web/src/lib/subscriptionsApi.ts real_dev/web/src/pages/SubscriptionsPage.tsx` | `PASS`; sem matches. | Cliente/pagina MF8 nao enviam empresa ativa, nao persistem contexto sensivel e nao contornam o cliente central. |
| `rg -n 'FaithFlix\|StudyFlow\|Orelle\|cosmetica\|cosmética\|skin\|beleza\|treino\|workout\|filme\|movie' real_dev/api real_dev/web docs/planificacao/guias-bk/MF8/BK-MF8-08-testes-e-evidencia-de-subscricoes-simuladas.md docs/evidence/MF8/BK-MF8-08.md` | `PASS`; sem matches. | Sem drift de dominio no codigo/evidence BK08 auditado. |
| `rg -n 'stripe\|checkout\|gateway\|paymentProvider\|webhook\|receipt\|invoice\|cartao\|cartão\|fatura\|pagamento\|payment\|recibo' ...` | `PASS_COM_RESSALVAS`; hits apenas em comentarios/negativos/evidence que afirmam ou testam ausencia de pagamento real. | Sem integracao de pagamento real no escopo auditado. |
| `git check-ignore -v real_dev real_dev/api/tests/contracts/mf8-subscriptions.contract.test.js real_dev/web/src/pages/SubscriptionsPage.tsx` | `INFO`; `.gitignore:4:real_dev/`. | Esperado nesta PAP; auditoria leu os ficheiros reais diretamente. |

### Validacoes executadas nesta auditoria

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run test:mf8:subscriptions` | `PASS`; 4 testes, 4 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 99 testes, 99 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes skipped explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run test:mf8:subscriptions-ui` | `PASS`; `MF8 subscriptions UI smoke OK`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido com 49 modulos transformados. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `advisory_pass=false` por advisories documentais legados fora da implementacao auditada. |

### Validacoes nao executadas

- Smoke manual em browser real com sessao autenticada viva nao foi executado; o scope do guia exclui E2E complexo com navegador real e o gate estatico `test:mf8:subscriptions-ui`, `typecheck` e `build` passaram.
- Integracao persistida real com DB nao foi executada porque nao existe `TEST_DATABASE_URL` nesta execucao; a suite de integracao foi corrida com skip explicito via `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- Gateway externo, checkout, cartoes, recibos, faturas, invoices e webhooks nao foram executados por estarem fora de scope e por a funcionalidade ser explicitamente simulada.

### Findings

Nenhum finding ativo.

### Conclusao

`BK-MF8-08` esta implementado em `real_dev` e cumpre o contrato auditado: existe teste contratual agregador para `RF49`, `RF50` e `RF51`, script npm dedicado, evidence tecnica com matriz e negativos, revalidacao do gate frontend, ausencia de pagamento real e coerencia com `BK-MF8-03` a `BK-MF8-07`. Resultado: `PASS`.

## Execucao 2026-07-04 - Auditoria BK-MF8-07

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- Escopo pedido: `BK_IDS=[BK-MF8-07]`
- Escopo normalizado: `BK-MF8-07`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas atualizacao deste relatorio de auditoria
- Nota de worktree: `real_dev/` esta ignorado por `.gitignore`, esperado nesta PAP; os ficheiros reais foram lidos diretamente. Ja existiam artefactos nao rastreados em `docs/evidence/MF8/BK-MF8-04.md`, `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` e `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`, preservados sem limpeza.

### Contrato canonico revalidado

`BK-MF8-07 - UI de planos e gestao da subscricao` continua associado a `RF49`, `RF50` e `RF51`, prioridade `P0`, owner `Andre`, apoio `Pedro`, dependencias `BK-MF8-03`, `BK-MF8-04` e `BK-MF8-06`, sprint `S12`, tipo `UI` e proximo BK `BK-MF8-08`.

Fontes revistas nesta auditoria:

- `docs/RF.md:173-175`: confirma planos, gestao da subscricao ativa e renovacao/cancelamento/reativacao.
- `docs/RNF.md:27-32`: confirma requisitos transversais de usabilidade, feedback, acessibilidade, responsividade e desempenho.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:100-105`: confirma a cadeia `BK-MF8-03 -> BK-MF8-04 -> BK-MF8-05 -> BK-MF8-06 -> BK-MF8-07 -> BK-MF8-08`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md:125-130` e `253-258`: confirma prioridade, owner, apoio, dependencias, requisito e guia canonico.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:112-117`: confirma sprint, RFs, dependencias, tipo e guia.
- `docs/planificacao/backlogs/MF-VIEWS.md:238`, `244`, `247` e `269`: confirma MF8, subscricoes simuladas e ausencia de pagamento real.
- `docs/planificacao/sprints/PLANO-SPRINTS.md:66`: confirma a recalibracao da sprint `S12` para `RF49..RF51`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-ui-de-planos-e-gestao-da-subscricao.md`: exige UI React para consultar planos, estado atual e executar ativacao, renovacao, cancelamento e reativacao sem pagamento real.
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-renovacao-cancelamento-e-reativacao-simuladas.md`: confirma o endpoint herdado `POST /api/subscriptions/current/actions`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-testes-e-evidence-de-subscricoes-simuladas.md`: confirma que o proximo BK deve fechar testes/evidence agregada sobre a UI e cliente MF8.

### Inventario do BK auditado

| Campo | Valor |
| --- | --- |
| Objetivo | Disponibilizar uma pagina React para consultar planos simulados, ver a subscricao atual e gerir ativacao, renovacao, cancelamento e reativacao. |
| RF/RNF | `RF49`, `RF50`, `RF51`; RNFs transversais de feedback, acessibilidade, responsividade e desempenho. |
| Dependencias | `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-06` |
| Handoff | `BK-MF8-08` deve reutilizar a pagina, o cliente `subscriptionsApi` e o gate `test:mf8:subscriptions-ui`. |
| Endpoints consumidos | `GET /api/subscriptions/plans`, `GET /api/subscriptions/current`, `POST /api/subscriptions/current/activate`, `POST /api/subscriptions/current/actions` |
| Contexto/seguranca | Sessao autenticada por cookie HttpOnly; empresa ativa e role validadas no backend. |
| Scope-out | Pagamento real, checkout, cartoes, recibos, faturas, cobranca automatica, storage de sessao/role/empresa ativa no browser e envio de `companyId` pelo frontend. |

### Evidencia objetiva no codigo real

| Area | Estado | Evidencia |
| --- | --- | --- |
| Cliente MF8 tipado | `OK` | `real_dev/web/src/lib/subscriptionsApi.ts:7-48` define tipos de planos, estado e payloads; `:50` reutiliza `createApiClient()`. |
| Consulta de planos e estado | `OK` | `subscriptionsApi.ts:60-73` carrega `GET /subscriptions/plans` e `GET /subscriptions/current` em paralelo. |
| Acoes simuladas | `OK` | `subscriptionsApi.ts:84-114` valida `planCode` para `activate/reactivate`, chama `POST /subscriptions/current/activate` e `POST /subscriptions/current/actions`. |
| Formatacao PT-PT | `OK` | `subscriptionsApi.ts:122-145` formata preco em `pt-PT` e descreve `billingCycle`/`intervalCount` sem transformar o fluxo em pagamento real. |
| Gating de UX | `OK` | `subscriptionsApi.ts:153-187` traduz estados publicos e ativa/desativa acoes conforme `none`, `active`, `cancelled` ou `expired`. |
| Erros seguros | `OK` | `subscriptionsApi.ts:195-215` traduz `401`, `403`, `404` e `409` para mensagens de UI sem expor stack ou dados sensiveis. |
| Pagina React | `OK` | `real_dev/web/src/pages/SubscriptionsPage.tsx:91-147` gere estado, carregamento, erro e selecao de plano; `:147-180` executa acoes via cliente tipado. |
| Estados visiveis | `OK` | `SubscriptionsPage.tsx:182-226` cobre loading, erro e vazio; `:246-287` mostra estado atual e datas; `:368-375` mostra feedback da acao. |
| Planos selecionaveis | `OK` | `SubscriptionsPage.tsx:289-324` renderiza planos simulados como radios com nome, preco, ciclo e descricao. |
| Acoes de gestao | `OK` | `SubscriptionsPage.tsx:326-365` expõe `Ativar plano`, `Renovar`, `Cancelar` e `Reativar`, com disabled por estado e nota de validacao backend. |
| Navegacao | `OK` | `real_dev/web/src/App.tsx:23` importa `SubscriptionsPage`; `:995-1013` regista `mf8Pages`; `:1080-1089` expoe o botao de navegacao. |
| Cliente central | `OK` | `real_dev/web/src/lib/apiClient.ts:61-88` envia `credentials: "include"` em todas as chamadas JSON. |
| Layout responsivo | `OK` | `real_dev/web/src/styles.css:528-632` define layout MF8; `:581-585` usa grid `auto-fit`; `:685-723` ajusta mobile. |
| Gate de frontend | `OK` | `real_dev/web/scripts/check-mf8-subscriptions-ui.mjs:81-127` valida ficheiros, endpoints, cookies, acoes, estilos, script e negativos de seguranca. |
| Script npm | `OK` | `real_dev/web/package.json:22` expoe `test:mf8:subscriptions-ui`. |
| Guards backend herdados | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js:143-152` aplica auth, empresa ativa e roles `ADMIN`/`GESTOR`; `:167-230` expoe os endpoints consumidos pela UI usando `req.companyId`/`req.user?.id`. |

### Scope-out respeitado

- Nao ha pagamento real, gateway, checkout, cartao, recibo, fatura, invoice, webhook ou provider externo na UI auditada.
- O frontend nao envia `companyId`, nao decide ownership, nao escolhe role e nao persiste sessao/empresa ativa em `localStorage` ou `sessionStorage`.
- `subscriptionsApi.ts` nao chama `fetch` diretamente; a comunicacao passa pelo cliente central com cookies HttpOnly.
- Nao foram alterados os endpoints backend dos BKs `BK-MF8-03` a `BK-MF8-06`.
- Nao foram adicionadas dependencias novas ao frontend.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | A UI reutiliza o cliente central com `credentials: "include"`, componentes partilhados e gates existentes; `typecheck`, `build`, contratos e unit tests continuam verdes. |
| `BK-MF8-03 -> BK-MF8-07` | `OK` | A pagina consome o catalogo canonico de planos e usa `billingCycle`/`intervalCount`. |
| `BK-MF8-04 -> BK-MF8-07` | `OK` | A pagina consome `GET /subscriptions/current` e mostra estado/datas da subscricao atual. |
| `BK-MF8-05 -> BK-MF8-07` | `OK` | A ativacao usa o endpoint dedicado `/subscriptions/current/activate` com `planCode`. |
| `BK-MF8-06 -> BK-MF8-07` | `OK` | Renovacao, cancelamento e reativacao usam `/subscriptions/current/actions`. |
| `BK-MF8-07 -> BK-MF8-08` | `OK` | Existe gate `test:mf8:subscriptions-ui`; a evidence manual/browser autenticada fica para o BK de testes/evidence. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | A auditoria nao abriu browser autenticado nem exercitou uma base persistida real; os contratos, gates estaticos e builds passaram. |

### Pesquisa estatica

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n "companyId|localStorage|sessionStorage|fetch\\(" real_dev/web/src/lib/subscriptionsApi.ts real_dev/web/src/pages/SubscriptionsPage.tsx` | `PASS`; sem matches. | A UI auditada nao envia empresa ativa, nao persiste contexto sensivel e nao contorna o cliente central. |
| `rg -n "payment|pagamento|checkout|invoice|fatura|receipt|recibo|card|stripe|companyId|localStorage|sessionStorage|fetch\\(" real_dev/web/src/lib/subscriptionsApi.ts real_dev/web/src/pages/SubscriptionsPage.tsx real_dev/web/scripts/check-mf8-subscriptions-ui.mjs` | `PASS_COM_RESSALVAS`; apenas comentario de "sem pagamento real" e asserts negativos do gate. | Sem pagamento real ou storage inseguro no codigo executavel da UI. |
| `git check-ignore -v real_dev real_dev/web/src/lib/subscriptionsApi.ts real_dev/web/src/pages/SubscriptionsPage.tsx docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` | `INFO`; `real_dev/` ignorado, relatorio nao ignorado. | Esperado nesta PAP; auditoria leu o codigo real diretamente. |

### Validacoes executadas nesta auditoria

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/web run test:mf8:subscriptions-ui` | `PASS`; `MF8 subscriptions UI smoke OK`. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido. |
| `node --test real_dev/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js` | `PASS`; 11 testes, 11 pass. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 95 testes, 95 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes skipped explicitamente por falta de `TEST_DATABASE_URL`. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, com `advisory_pass=false` por advisories legados de qualidade de guias fora deste scope. |

Nota: `npm --prefix real_dev/api run prisma:validate` sem `DATABASE_URL` falhou inicialmente com `P1012`; a validacao foi repetida com `DATABASE_URL` local dummy e passou. A falha inicial foi ambiental, nao finding do BK.

### Validacoes nao executadas

- Smoke manual em browser com sessao autenticada real nao foi executado nesta auditoria; o gate estatico MF8, `typecheck` e `build` cobrem a integracao frontend sem abrir browser.
- Integracao persistida real com DB nao foi executada porque nao existe `TEST_DATABASE_URL` nesta execucao; o comando de integracao foi corrido com skip explicito, conforme contrato dos testes locais.
- Nao foi criado `docs/evidence/MF8/BK-MF8-07.md` porque esta prompt permite apenas relatorio de auditoria no output e define `PERMITIR_ALTERAR_DOCS=nao` fora desse relatorio.

### Findings

Nenhum finding ativo.

### Conclusao

`BK-MF8-07` esta implementado em `real_dev` e cumpre o contrato auditado: a UI lista planos simulados, mostra a subscricao atual, executa ativacao/renovacao/cancelamento/reativacao pelos endpoints canonicos, reutiliza cookies HttpOnly do cliente central, nao envia `companyId`, nao persiste contexto sensivel no browser e nao introduz pagamento real. Resultado: `PASS`.

## Execucao 2026-07-04 - Auditoria BK-MF8-06

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- Escopo pedido: `BK_IDS=[BK-MF8-06]`
- Escopo normalizado: `BK-MF8-06`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas atualizacao deste relatorio de auditoria
- Nota de worktree: `real_dev/` esta ignorado por `.gitignore`, esperado nesta PAP; os ficheiros reais foram lidos diretamente. Ja existiam artefactos nao rastreados em `docs/evidence/MF8/BK-MF8-04.md`, `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` e `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`, preservados sem limpeza.

### Contrato canonico revalidado

`BK-MF8-06 - Renovacao, cancelamento e reativacao simuladas` continua associado a `RF51`, prioridade `P0`, owner `Pedro`, apoio `Andre`, dependencia `BK-MF8-05`, sprint `S12`, tipo `Reforco` e proximo BK `BK-MF8-07`.

Fontes revistas nesta auditoria:

- `docs/RF.md:173-175` e `185`: confirma `RF49`, `RF50`, `RF51` e a fronteira de subscricoes simuladas sem pagamento real.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:100-105`: confirma a cadeia `BK-MF8-03 -> BK-MF8-04 -> BK-MF8-05 -> BK-MF8-06 -> BK-MF8-07`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md:125-130` e `253-258`: confirma prioridade, dependencia, requisito e guia canonico.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:112-117`: confirma sprint, owner, requisito, dependencia e tipo.
- `docs/planificacao/backlogs/MF-VIEWS.md:236-248`: confirma a sequencia MF8 e dependencias posteriores.
- `docs/planificacao/sprints/PLANO-SPRINTS.md:65-66`: confirma a recalibracao da sprint `S12` para `RF49..RF51`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-renovacao-cancelamento-e-reativacao-simuladas.md`: exige `runSimulatedSubscriptionAction`, `POST /api/subscriptions/current/actions`, acoes `renew`, `cancel`, `reactivate`, datas por `billingCycle`/`intervalCount`, transicoes controladas, auditoria e testes contratuais.
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-ativacao-simulada-de-subscricao.md`: confirma os contratos herdados de ativacao e subscricao ativa.
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-ui-de-planos-e-gestao-da-subscricao.md`: confirma que a UI deve consumir este contrato backend e fica fora do BK auditado.
- Inventario completo de `docs/planificacao/guias-bk/MF8/*.md`: MF8 contem 18 BKs e o alvo desta auditoria e apenas `BK-MF8-06`.

### Inventario do BK auditado

| Campo | Valor |
| --- | --- |
| Objetivo | Renovar uma subscricao ativa, cancelar uma subscricao ativa e reativar uma subscricao cancelada ou expirada. |
| RF/RNF | `RF51` |
| Dependencias | `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05` |
| Handoff | `BK-MF8-07` deve consumir `POST /api/subscriptions/current/actions`. |
| Modelo | `CompanySubscription` |
| Endpoint esperado | `POST /api/subscriptions/current/actions` |
| Body esperado | `{ "action": "renew" }`, `{ "action": "cancel" }`, `{ "action": "reactivate", "planCode": "monthly" }` |
| Roles/contexto | Sessao autenticada, empresa ativa no backend, roles `ADMIN`/`GESTOR` |
| Auditoria | `subscription.renew`, `subscription.cancel`, `subscription.reactivate` |
| Scope-out | Pagamento real, checkout, cartoes, recibos, faturas, cobranca automatica, outro modelo de subscricao e UI do BK07. |

### Evidencia objetiva no codigo real

| Area | Estado | Evidencia |
| --- | --- | --- |
| Modelo persistente | `OK` | `real_dev/api/prisma/schema.prisma:133-137` define `CompanySubscriptionStatus`; `schema.prisma:257-272` define `CompanySubscription` com `companyId @unique`, `planCode`, `status`, `startsAt`, `endsAt`, `simulated` e indices. |
| Catalogo reutilizado | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionPlans.js` mantem planos canonicos `monthly`, `quarterly`, `yearly`, `billingCycle` e `intervalCount`; o service usa `getSimulatedSubscriptionPlan`. |
| Acoes e maquina de estados | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionService.js:29-44` define `renew`, `cancel`, `reactivate` e transicoes permitidas: `ACTIVE -> renew/cancel`, `CANCELLED/EXPIRED -> reactivate`. |
| Validacao de input | `OK` | `subscriptionService.js:153-205` valida acao, exige `planCode` em `reactivate` e rejeita `planCode` fora de `reactivate`; `subscriptionRoutes.js:23` e `:87-130` restringem o body a `action` e `planCode`. |
| Datas/ciclo | `OK` | `subscriptionService.js:224-253` calcula datas por `billingCycle` e `intervalCount`; `subscriptionService.js:361-403` prolonga renovacao a partir de `endsAt` futuro ou de `now`, e recalcula reativacao a partir de `now`. |
| Transicoes invalidas | `OK` | `subscriptionService.js:334-355` devolve `404 SUBSCRIPTION_NOT_FOUND` quando nao ha subscricao e `409 INVALID_SUBSCRIPTION_TRANSITION` quando a acao nao e permitida para o estado atual. |
| Service principal | `OK` | `subscriptionService.js:488-537` implementa `runSimulatedSubscriptionAction` com transacao, consulta por `companyId` da empresa ativa, update da subscricao atual, auditoria e resposta via `formatCurrentSubscription`. |
| Ownership multiempresa | `OK` | `subscriptionService.js:312-329` valida que a subscricao pertence a empresa ativa; `subscriptionService.js:494` consulta por `companyId` vindo do backend; `subscriptionRoutes.js:219-224` passa `req.companyId` e `req.user?.id`, nao valores do body/query. |
| Guards/roles | `OK` | `subscriptionRoutes.js:143-151` aplica `requireAuth(prisma)`, `requireCompanyContext(prisma)` e `requireRole("ADMIN", "GESTOR")`. |
| Endpoint | `OK` | `subscriptionRoutes.js:216-230` expoe `POST /current/actions`, montado em `/api/subscriptions` pelo servidor existente. |
| Auditoria funcional | `OK` | `subscriptionService.js:520-532` regista `subscription.${action}` com `previousStatus`, `nextStatus`, `planCode` e `simulated: true`, sem payload completo nem dados de pagamento. |
| Teste contratual | `OK` | `real_dev/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js:193-429` cobre exposicao da rota, renovacao, cancelamento, reativacao de cancelada/expirada, falta de `planCode`, transicao invalida, ownership forjado, acao desconhecida, role bloqueada e empresa ativa em falta. |
| Frontend/UI | `NAO_APLICAVEL` | O BK06 entrega contrato backend; UI fica em `BK-MF8-07`. |
| Pagamento real | `NAO_APLICAVEL` | Pesquisa focada encontrou apenas teste negativo de ausencia de `checkoutUrl` e texto de ciclo de faturacao; nao ha gateway, checkout, cartao, recibo, fatura, invoice, webhook ou provider externo no modulo auditado. |

### Scope-out respeitado

- Nao ha pagamento real, gateway, checkout, cartao, recibo, fatura, invoice ou webhook.
- Nao foi criado outro modelo de subscricao; a operacao atualiza a linha unica de `CompanySubscription`.
- Nao ha historico completo de versoes de subscricao, que esta fora de scope.
- Nao foram alteradas roles/permissoes; a rota reutiliza guards existentes.
- A UI `BK-MF8-07` nao foi implementada neste BK.
- O frontend/browser nao decide `companyId`, role, userId, permissao ou ownership final.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `test:unit`, `test:contracts`, `syntax:check`, `typecheck`, `build` e `prisma:validate` continuam verdes; `real_dev/` ignorado em Git nao e finding. |
| `BK-MF8-03 -> BK-MF8-06` | `OK` | Renovacao e reativacao reutilizam o catalogo canonico e nao introduzem `intervalMonths` nem outro contrato de planos. |
| `BK-MF8-04 -> BK-MF8-06` | `OK` | O service reutiliza `CompanySubscription.companyId @unique`, estados persistidos e helper de ownership por empresa ativa. |
| `BK-MF8-05 -> BK-MF8-06` | `OK` | O ciclo de vida atua sobre a subscricao ativada e reutiliza calculo de datas, resposta publica, auditoria e estado `ACTIVE`. |
| `BK-MF8-06 -> BK-MF8-07` | `OK` | A UI seguinte pode consumir `POST /api/subscriptions/current/actions`, estados publicos e negativos do contrato. |
| `BK-MF8-06 -> BK-MF8-08` | `OK` | A suite contratual dedicada deixa base verificavel para evidence agregada de subscricoes simuladas. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | Persistencia real em DB nao foi exercitada nesta auditoria por falta de `TEST_DATABASE_URL`; schema, router, service e contratos passaram. |

### Pesquisa estatica

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n --glob '!node_modules/**' --glob '!dist/**' 'TODO implementar|FIXME|...|req\\.(body|query)\\.companyId|body\\.companyId|query\\.companyId' real_dev/api real_dev/web` | `PASS_COM_RESSALVAS`; hits globais em sanitizacao de segredos, testes negativos, storage privado, validadores MF6/MF7 e selecao de empresa no modulo proprio de contexto. | Sem evidencia de risco ligado ao `BK-MF8-06`; no modulo de subscricoes nao ha ownership vindo do body/query. |
| `rg -n --glob '!node_modules/**' --glob '!dist/**' 'FaithFlix|StudyFlow|Orelle|cosmetica|...' real_dev/api real_dev/web` | `PASS`; sem matches. | Sem drift de dominio no codigo real. |
| `rg -n --glob '!node_modules/**' --glob '!dist/**' 'stripe|checkout|gateway|paymentProvider|webhook|receipt|invoice|cartao|cartão|fatura' real_dev/api/src/modules/subscriptions real_dev/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js` | `PASS_COM_RESSALVAS`; apenas `checkoutUrl` em teste negativo e texto de ciclo de faturacao. | Sem pagamento real ou integracao externa no BK auditado. |
| `test -f docs/evidence/MF8/BK-MF8-06.md` | `PASS_COM_RESSALVAS`; ficheiro separado nao existe. | A execucao de implementacao ja registou evidence tecnica em `IMPLEMENTACAO-REAL_DEV-MF8.md` por `PERMITIR_ALTERAR_DOCS=nao`; esta auditoria atualiza o relatorio tecnico permitido. |
| `git check-ignore -v real_dev/api/src/modules/subscriptions/subscriptionService.js real_dev/api/src/modules/subscriptions/subscriptionRoutes.js real_dev/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js real_dev/web/dist/index.html` | `INFO`; `.gitignore:4:real_dev/`. | Esperado nesta PAP; a auditoria leu os ficheiros reais diretamente. |

### Validacoes executadas nesta auditoria

| Comando | Resultado |
| --- | --- |
| `node --test real_dev/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js` | `PASS`; 11 testes, 11 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 95 testes, 95 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes de persistencia skipped explicitamente por variavel de ambiente. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories legados de qualidade dos guias fora deste scope. |

### Validacoes nao executadas

- Smoke HTTP com servidor local nao foi executado porque `mf8-subscription-lifecycle.contract.test.js` exercita a rota Express diretamente sem abrir porta local.
- Integracao persistida real com DB nao foi executada porque nao existe `TEST_DATABASE_URL` nesta execucao; `test:integration` foi corrido com `OPSA_SKIP_PERSISTENCE_TESTS=true` e registou skip explicito.
- `prisma:generate` nao foi executado porque esta auditoria nao alterou `schema.prisma` nem migrations.

### Findings

Nao foram encontrados findings ativos.

| Finding ID | Severidade | Estado | Evidencia |
| --- | --- | --- | --- |
| - | - | - | Sem findings `P0`, `P1`, `P2` ou `P3` para `BK-MF8-06`. |

### Limitacoes e TODOs

- `docs/evidence/MF8/BK-MF8-06.md` nao existe como ficheiro separado. Nao foi criado nesta auditoria porque a prompt define `MODO=auditar_implementacao` e `PERMITIR_ALTERAR_DOCS=nao`; a evidence tecnica auditavel ficou consolidada em `IMPLEMENTACAO-REAL_DEV-MF8.md` e nesta secao do relatorio de auditoria.
- Persistencia real com DB de teste fica por validar quando existir `TEST_DATABASE_URL`.

### Conclusao

`BK-MF8-06` fica em estado `AUDITADO_OK` em `real_dev`. A auditoria confirmou rota `POST /api/subscriptions/current/actions`, service `runSimulatedSubscriptionAction`, maquina de estados, validacao de payload e transicoes, ownership por empresa ativa, guards `ADMIN`/`GESTOR`, auditoria funcional minima, ausencia de pagamento real e cobertura contratual positiva/negativa. Nao ha findings ativos; a proxima acao natural e implementar ou auditar `BK-MF8-07 - UI de planos e gestao da subscricao`.

## Execucao 2026-07-04 - Auditoria BK-MF8-05

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- Escopo pedido: `BK_IDS=[BK-MF8-05]`
- Escopo normalizado: `BK-MF8-05`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas atualizacao deste relatorio de auditoria
- Nota de worktree: `real_dev/` esta ignorado por `.gitignore`, esperado nesta PAP; os ficheiros reais foram lidos diretamente. Ja existiam artefactos nao rastreados em `docs/evidence/MF8/BK-MF8-04.md`, `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` e `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`, preservados sem limpeza.

### Contrato canonico revalidado

`BK-MF8-05 - Ativacao simulada de subscricao` continua associado a `RF50`, prioridade `P0`, owner `Andre`, apoio `Pedro`, dependencia `BK-MF8-04`, sprint `S12`, tipo `Reforco` e proximo BK `BK-MF8-06`.

Fontes revistas nesta auditoria:

- `docs/RF.md:174-175`: confirma `RF50` para gestao da subscricao simulada da empresa ativa e `RF51` como fase seguinte de renovacao/cancelamento/reativacao.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:100-105`: confirma a cadeia `BK-MF8-03 -> BK-MF8-04 -> BK-MF8-05 -> BK-MF8-06`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md:125-130` e `252-258`: confirmam prioridade, dependencia, requisito e guia canonico.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:112-117`: confirma sprint, owner, requisito, dependencia e tipo.
- `docs/planificacao/backlogs/MF-VIEWS.md:238-245`: confirma a sequencia MF8 de subscricoes simuladas.
- `docs/planificacao/sprints/PLANO-SPRINTS.md:65-66`: confirma a recalibracao da sprint `S12`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-ativacao-simulada-de-subscricao.md:32-36`: exige `activateSimulatedSubscription`, calculo de `startsAt`/`endsAt`, atualizacao de `CompanySubscription`, rota `POST /api/subscriptions/current/activate` e validacao de `planCode`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-ativacao-simulada-de-subscricao.md:179-186`: define body aceito, status de sucesso e erros `404`, `400`, `401`, `403`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-ativacao-simulada-de-subscricao.md:194-199`: confirma que o body transporta apenas `planCode`; empresa, utilizador e role vem dos middlewares.
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-renovacao-cancelamento-e-reativacao-simuladas.md`: confirma que renovacao, cancelamento e reativacao pertencem ao BK seguinte.
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-ui-de-planos-e-gestao-da-subscricao.md`: confirma que UI de planos e gestao fica fora do BK atual.

### Evidencia objetiva no codigo real

| Area | Estado | Evidencia |
| --- | --- | --- |
| Catalogo reutilizado | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionPlans.js:8-12` fixa `monthly`, `quarterly`, `yearly`; `subscriptionPlans.js:16-40` define `billingCycle` e `intervalCount`; `subscriptionPlans.js:93-104` expoe `getSimulatedSubscriptionPlan`. |
| Modelo persistente | `OK` | `real_dev/api/prisma/schema.prisma:133-137` define `CompanySubscriptionStatus`; `schema.prisma:252` liga `Company.subscriptions`; `schema.prisma:257-272` define `CompanySubscription` com `companyId @unique`, `planCode`, `status`, datas, `simulated` e indices. |
| Service de ativacao | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionService.js:104-125` converte plano inexistente para erro HTTP controlado; `subscriptionService.js:135-162` calcula fim de ciclo por `billingCycle`/`intervalCount`; `subscriptionService.js:237-257` valida `companyId`, `userId` e `planCode`; `subscriptionService.js:266-309` implementa `activateSimulatedSubscription`. |
| Persistencia unica por empresa | `OK` | `subscriptionService.js:272-291` usa transacao e `companySubscription.upsert` com `where: { companyId: activation.companyId }`, atualizando/criando `planCode`, `ACTIVE`, `startsAt`, `endsAt` e `simulated: true`. |
| Auditoria funcional | `OK` | `subscriptionService.js:293-303` regista `AuditLog` com `action: "subscription.activate"`, entidade `CompanySubscription`, `companyId`, `userId` e detalhes minimos `{ planCode, simulated: true }`. |
| Rota HTTP | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js:21` restringe body a `planCode`; `subscriptionRoutes.js:46-76` rejeita body invalido, chaves inesperadas e `planCode` vazio; `subscriptionRoutes.js:86-96` aplica `requireAuth`, `requireCompanyContext` e `requireRole("ADMIN", "GESTOR")`; `subscriptionRoutes.js:143-157` expoe `POST /current/activate` e passa `companyId`/`userId` do contexto backend. |
| Montagem | `OK` | `real_dev/api/src/server.js:56` importa `buildSubscriptionRoutes`; `server.js:135` monta `/api/subscriptions`. |
| Teste contratual BK05 | `OK` | `real_dev/api/tests/contracts/mf8-subscription-activation.contract.test.js:170-174` confirma a rota; `:176-213` cobre sucesso mensal, ownership por empresa ativa, ciclo, ausencia de `checkoutUrl`, upsert e auditoria; `:215-232` cobre calculo por mes/ano; `:234-320` cobre plano inexistente, body invalido, `companyId` forjado, role proibida e empresa ativa em falta. |
| Frontend/UI | `NAO_APLICAVEL` | O BK05 entrega contrato backend; a UI fica no `BK-MF8-07`. |
| Pagamento real | `NAO_APLICAVEL` | Nao ha gateway, checkout, cartoes, recibos, faturas, invoice, webhook ou provider externo no modulo auditado. |

### Scope-out respeitado

- Nao foi aceite `companyId`, `activeCompanyId` ou ownership vindo de `body`/`query`; a empresa ativa vem de `req.companyId`.
- Nao foi implementada renovacao, cancelamento ou reativacao; a unica ocorrencia relevante em pesquisa estatica e o estado canonico `CANCELLED`, herdado do modelo usado por BKs seguintes.
- Nao foi criada UI frontend, rota de checkout, pagamento real, fatura, recibo, cartao ou webhook.
- A ativacao substitui/ativa a linha unica de `CompanySubscription` por empresa, sem criar um segundo modelo de subscricao.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | Suites globais de backend, frontend, schema e build continuam verdes; `real_dev/` ignorado em Git nao e finding. |
| `BK-MF8-03 -> BK-MF8-05` | `OK` | A ativacao valida `planCode` com `getSimulatedSubscriptionPlan` e calcula datas apenas com `billingCycle`/`intervalCount` canonicos. |
| `BK-MF8-04 -> BK-MF8-05` | `OK` | O service reutiliza `CompanySubscription` e a chave unica `companyId`, sem receber ownership do browser. |
| `BK-MF8-05 -> BK-MF8-06` | `OK` | `activateSimulatedSubscription`, `calculateSubscriptionCycleEnd`, `formatCurrentSubscription`, `recordAuditLog` e o modelo persistente deixam handoff funcional para lifecycle simulado; o lifecycle em si continua fora do BK05. |
| `BK-MF8-05 -> BK-MF8-07/BK-MF8-08` | `OK_COM_RESSALVAS` | A rota backend e os testes contratuais existem; UI e evidence agregada final pertencem aos BKs proprios. |

### Pesquisa estatica

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n '(req\.(body\|query)\.companyId|companyId\s*[:=]\s*req\.(body\|query)|body\.companyId|query\.companyId|activeCompanyId...)' real_dev/api/src/modules/subscriptions real_dev/api/tests/contracts/mf8-subscription-activation.contract.test.js` | `PASS`; sem matches. | Nao ha empresa ativa decidida por input do browser no modulo auditado. |
| `rg -n '(renew|cancel|reactivat|/current/actions|router\.(put|patch|delete))' real_dev/api/src/modules/subscriptions ...` | `PASS_COM_RESSALVAS`; match apenas em `SUBSCRIPTION_STATE.CANCELLED`. | Nao ha rota ou service de renovacao/cancelamento/reativacao no BK05. |
| `rg -n 'router\.(get|post|put|patch|delete)' real_dev/api/src/modules/subscriptions/subscriptionRoutes.js` | `PASS`; rotas atuais: `GET /plans`, `GET /plans/:code`, `GET /current`, `POST /current/activate`. | A unica mutacao nova em subscricoes e a ativacao simulada contratada. |
| `rg -n '(stripe|checkout|gateway|payment|webhook|receipt|invoice|fatura|cartao|cartão)' ...` | `PASS_COM_RESSALVAS`; matches apenas em testes negativos (`checkoutUrl`, `gateway`, `paymentProvider`, `invoiceId`), guia scope-out e texto de faturacao/ciclo. | Sem integracao de pagamento real no codigo auditado. |
| `rg -n --glob '!real_dev/web/dist/**' '(FaithFlix|StudyFlow|Orelle|...)' real_dev/api real_dev/web` | `PASS`; sem matches. | Sem drift de dominio no codigo real. |
| `rg -n --glob '!real_dev/web/dist/**' '(TODO implementar|FIXME|HACK|XXX|api[_-]?key|secret|password|token)' real_dev/api real_dev/web` | `PASS_COM_RESSALVAS`; matches globais em autenticacao, redacao de logs, testes negativos e validadores MF6/MF7. | Sem evidencia de risco ligado ao BK-MF8-05. |
| `git check-ignore -v real_dev/api/src/modules/subscriptions/subscriptionService.js real_dev/api/src/modules/subscriptions/subscriptionRoutes.js real_dev/api/tests/contracts/mf8-subscription-activation.contract.test.js real_dev/web/src/App.tsx` | `INFO`; `.gitignore:4:real_dev/`. | Esperado neste repo; a auditoria leu os ficheiros diretamente. |

### Validacoes executadas nesta auditoria

| Comando | Resultado |
| --- | --- |
| `node --test real_dev/api/tests/contracts/mf8-subscription-activation.contract.test.js` | `PASS`; 8 testes, 8 pass. |
| `node --test real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js` | `PASS`; 6 testes, 6 pass. |
| `node --test real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js` | `PASS`; 10 testes, 10 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `env DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 84 testes, 84 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `env OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes skipped explicitamente por `OPSA_SKIP_PERSISTENCE_TESTS=true`. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `advisory_pass=false` por divida documental antiga fora desta auditoria. |
| `git diff --check` | `PASS`; sem whitespace errors em diffs rastreados. |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` | `PASS`; sem trailing whitespace no relatorio atualizado. |

### Validacoes nao executadas

- Smoke HTTP com servidor local nao foi executado porque a suite `mf8-subscription-activation.contract.test.js` exercita o router Express diretamente sem abrir porta local.
- Integracao persistida real com DB de teste nao foi executada porque nao existe `TEST_DATABASE_URL` nesta execucao; a suite de integracao foi corrida com skip explicito.
- Nao foi executado `prisma:generate`, porque esta auditoria nao alterou schema nem codigo e `prisma:validate` foi suficiente para o contrato auditado.

### Findings

Nao foram encontrados findings ativos.

| Finding ID | Severidade | Estado | Evidencia |
| --- | --- | --- | --- |
| - | - | - | Sem findings `P0`, `P1`, `P2` ou `P3` para `BK-MF8-05`. |

### Conclusao

`BK-MF8-05` fica em estado `AUDITADO_OK` em `real_dev`. A auditoria confirmou rota `POST /api/subscriptions/current/activate`, guards, validacao estrita de body, rejeicao de ownership vindo do cliente, validacao de plano canonico, calculo de ciclo por `billingCycle`/`intervalCount`, persistencia unica por empresa em `CompanySubscription`, auditoria funcional minima e cobertura contratual positiva/negativa. O scope-out de pagamento real, UI e lifecycle simulado posterior foi respeitado.

## Execucao 2026-07-04 - Reauditoria BK-MF8-04 pos-correcao de evidence

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- Escopo pedido: `BK_IDS=[BK-MF8-04]`
- Escopo normalizado: `BK-MF8-04`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas atualizacao deste relatorio de auditoria
- Nota de worktree: `real_dev/` esta ignorado por `.gitignore`, esperado nesta PAP; `docs/evidence/MF8/BK-MF8-04.md` ja existe e foi auditado, nao alterado nesta reauditoria.

### Contrato canonico revalidado

`BK-MF8-04 - Subscricao por empresa ativa` continua associado a `RF50`, prioridade `P0`, owner `Oleksii`, apoio `Andre`, dependencia `BK-MF8-03`, sprint `S12`, tipo `Reforco` e proximo BK `BK-MF8-05`.

Fontes revistas nesta reauditoria:

- `README.md`: confirma OPSA como ERP financeiro multiempresa com seguranca, auditoria e separacao entre recomendacao e execucao automatica.
- `docs/RF.md:173-175` e `185`: confirma `RF49`, `RF50`, `RF51` e a fronteira de subscricoes simuladas sem pagamento real.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:100-105`: confirma a cadeia `BK-MF8-03 -> BK-MF8-04 -> BK-MF8-05`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md:125-130` e `252-258`: confirma prioridade, dependencia, requisito e guia canonico.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:112-117`: confirma sprint, owner, requisito, dependencia e tipo.
- `docs/planificacao/backlogs/MF-VIEWS.md:236-248`: confirma a sequencia MF8 e dependencias posteriores.
- `docs/planificacao/sprints/PLANO-SPRINTS.md:66`: confirma a recalibracao da sprint `S12` para `RF49..RF51`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-subscricao-por-empresa-ativa.md`: confirma scope-in, scope-out, criterios de aceite, evidence e handoff.
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`: confirma catalogo `monthly`, `quarterly`, `yearly`, `billingCycle` e `intervalCount`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-ativacao-simulada-de-subscricao.md`: confirma que o BK seguinte deve reutilizar `CompanySubscription`, `companyId`, `planCode`, `billingCycle` e `intervalCount`.

### Evidencia objetiva no codigo real

| Area | Estado | Evidencia |
| --- | --- | --- |
| Modelo persistente | `OK` | `real_dev/api/prisma/schema.prisma:133-137` define `CompanySubscriptionStatus`; `schema.prisma:252` adiciona `Company.subscriptions`; `schema.prisma:257-272` define `CompanySubscription` com `companyId @unique`, `planCode`, `status`, datas, `simulated` e indices. |
| Migration | `OK` | `real_dev/api/prisma/migrations/20260704120000_mf8_company_subscriptions/migration.sql:3-31` cria enum, tabela, unique por empresa, indices e FK para `Company`. |
| Catalogo consumido | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionPlans.js:8-12` fixa os codigos `monthly`, `quarterly`, `yearly`; `subscriptionPlans.js:16-40` inclui `billingCycle` e `intervalCount`; `subscriptionPlans.js:93-104` expoe `getSimulatedSubscriptionPlan`. |
| Service | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionService.js:29-39` exige `companyId` de contexto; `subscriptionService.js:64-78` trata drift de plano com `409 SUBSCRIPTION_PLAN_DRIFT`; `subscriptionService.js:86-129` devolve `state`/`subscription`; `subscriptionService.js:139-151` entrega helper de ownership para BKs seguintes. |
| Rota HTTP | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js:47-50` aplica `requireAuth`, `requireCompanyContext` e `requireRole("ADMIN", "GESTOR")`; `subscriptionRoutes.js:86-97` expoe `GET /current` e usa `req.companyId`, nao body/query. |
| Montagem | `OK` | `real_dev/api/src/server.js:56` importa o router de subscricoes; `server.js:135` monta `/api/subscriptions`. |
| Testes de contrato | `OK` | `real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js:146-241` cobre rota, sucesso, `state: "none"`, role bloqueada, empresa ativa em falta e drift de plano. |
| Evidence | `OK` | `docs/evidence/MF8/BK-MF8-04.md` existe, regista ficheiros verificados, comandos executados, resultados observados, limites confirmados e handoff. |
| Frontend/UI | `NAO_APLICAVEL` | O guia deixa UI para `BK-MF8-07`; este BK entrega contrato backend. |
| Pagamento real | `NAO_APLICAVEL` | Nao ha checkout, gateway, provider externo, invoice/fatura, webhook, ativacao, renovacao, cancelamento ou reativacao neste BK. |

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | Unit, contracts, syntax, Prisma, typecheck e build continuam verdes; `real_dev/` ignorado em Git nao e finding. |
| `BK-MF8-03 -> BK-MF8-04` | `OK` | `planCode` e validado contra o catalogo canonico e reutiliza `billingCycle`/`intervalCount` do plano. |
| `BK-MF8-04 -> BK-MF8-05` | `OK` | `CompanySubscription`, `getCurrentSubscription` e `assertSubscriptionBelongsToActiveCompany` deixam base reutilizavel para ativacao simulada. |
| `BK-MF8-04 -> BK-MF8-07/BK-MF8-08` | `OK` | Endpoint e evidence existem; UI e fluxo completo continuam nos BKs proprios. |

### Pesquisa estatica

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n 'req\.(body|query)\.companyId|companyId\s*[:=]\s*req\.(body|query)|body\.companyId|query\.companyId' real_dev/api/src/modules/subscriptions real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js` | `PASS`; sem matches. | A empresa ativa nao vem de input do browser no modulo auditado. |
| `rg -n 'router\.(post|put|patch|delete)|checkout|stripe|payment|invoice|gateway|activate|renew|reactivate' real_dev/api/src/modules/subscriptions ...` | `PASS`; sem matches. | O BK nao expande scope para operacoes mutaveis nem pagamento real. |
| `rg -n --glob '!real_dev/web/dist/**' 'TODO implementar|FIXME|...|api[_-]?key|...' real_dev/api real_dev/web` | `PASS_COM_RESSALVAS`; matches globais apenas em listas de redacao de segredos, testes negativos, storage privado e validadores MF6/MF7. | Sem evidencia de risco ligado a `BK-MF8-04`. |
| `rg -n --glob '!real_dev/web/dist/**' 'FaithFlix|StudyFlow|Orelle|cosmetica|...' real_dev/api real_dev/web` | `PASS`; sem matches. | Sem drift de dominio no codigo real. |
| `git check-ignore -v real_dev/api/src/modules/subscriptions/subscriptionService.js ...` | `INFO` | `.gitignore:4` ignora `real_dev/`; esperado nesta PAP. |
| `test -f docs/evidence/MF8/BK-MF8-04.md` | `PASS` | Evidence separada existe. |

### Validacoes executadas nesta reauditoria

| Comando | Resultado |
| --- | --- |
| `node --test real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js` | `PASS`; 6 testes, 6 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 76 testes, 76 pass. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes skipped explicitamente por nao haver `TEST_DATABASE_URL`. A suite de integracao existente cobre MF2/MF3, nao este BK. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `advisory_pass=false` por divida documental antiga fora deste BK. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |
| `rg -n '[ \t]+$' docs/evidence/MF8/BK-MF8-04.md docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md ...` | `PASS`; sem trailing whitespace nos ficheiros auditados/editados. |

### Validacoes nao executadas

- Smoke HTTP com servidor local nao foi executado porque `mf8-current-subscription.contract.test.js` exercita a rota Express diretamente sem abrir porta local.
- Integracao persistida real com DB nao foi executada porque nao existe `TEST_DATABASE_URL` nesta execucao; o comando foi corrido com `OPSA_SKIP_PERSISTENCE_TESTS=true` e registou skip explicito. A cobertura essencial deste BK ficou em schema/migration, service, router e contratos.

### Findings

Nao foram encontrados findings ativos.

| Finding ID | Severidade | Estado | Evidencia |
| --- | --- | --- | --- |
| `P3-BK-MF8-04-EVIDENCE-001` | `P3` | `CORRIGIDO` | Evidence existe em `docs/evidence/MF8/BK-MF8-04.md` e `test -f` passa. |

### Conclusao

`BK-MF8-04` mantem estado `AUDITADO_OK` em `real_dev`. A reauditoria confirmou modelo persistente, migration, service, endpoint `GET /api/subscriptions/current`, guards, montagem, testes negativos, evidence separada e coerencia com `BK-MF8-03` e `BK-MF8-05`. Nao ha findings ativos; proximos trabalhos naturais continuam nos BKs seguintes da cadeia de subscricoes simuladas.

## Execucao 2026-07-04 - Auditoria BK-MF8-04

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- Escopo pedido: `BK_IDS=[BK-MF8-04]`
- Escopo normalizado: `BK-MF8-04`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Findings resolvidos nesta correcao: `P3-BK-MF8-04-EVIDENCE-001`
- Commits: nenhum
- Alteracoes desta execucao: criacao de `docs/evidence/MF8/BK-MF8-04.md` e atualizacao deste relatorio de auditoria
- Nota de worktree: `real_dev/` esta ignorado por `.gitignore`, esperado nesta PAP; esta auditoria leu os ficheiros reais diretamente e confirmou o ignore com `git check-ignore`.

### Contrato canonico confirmado

`BK-MF8-04 - Subscricao por empresa ativa` esta associado a `RF50`, prioridade `P0`, owner `Oleksii`, apoio `Andre`, dependencia `BK-MF8-03`, sprint `S12`, tipo `Reforco` e proximo BK `BK-MF8-05`.

Fontes revistas nesta auditoria:

- `docs/RF.md:174-175`: `RF50` gere a subscricao simulada da empresa ativa e depende de `RF49`; `RF51` vem a seguir.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:100-105`: confirma a cadeia `BK-MF8-03 -> BK-MF8-04 -> BK-MF8-05`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md:125-130` e `252-258`: confirma prioridade, dependencia, requisito e guia canonico.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:112-117`: confirma sprint `S12`, owner, requisito `RF50`, dependencia e tipo.
- `docs/planificacao/backlogs/MF-VIEWS.md:238-245`: confirma a sequencia MF8.
- `docs/planificacao/sprints/PLANO-SPRINTS.md:66`: confirma a recalibracao da sprint `S12` para `RF49..RF51`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-subscricao-por-empresa-ativa.md`: confirma scope-in, scope-out, modelo esperado, rota `GET /api/subscriptions/current`, guards e testes minimos.

### Evidencia objetiva no codigo real

| Area | Estado | Evidencia |
| --- | --- | --- |
| Modelo persistente | `OK` | `real_dev/api/prisma/schema.prisma:133-137` define `CompanySubscriptionStatus`; `schema.prisma:252` adiciona `Company.subscriptions`; `schema.prisma:257-272` define `CompanySubscription` com `companyId @unique`, `planCode`, `status`, datas, `simulated` e indices. |
| Migration | `OK` | `real_dev/api/prisma/migrations/20260704120000_mf8_company_subscriptions/migration.sql:3-31` cria enum, tabela, unique por empresa, indices e FK para `Company`. |
| Service | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionService.js:29-39` exige `companyId` ativo; `subscriptionService.js:64-78` valida `planCode` contra o catalogo do `BK-MF8-03`; `subscriptionService.js:86-129` devolve `state`, `subscription` e plano enriquecido; `subscriptionService.js:139-151` fornece helper de ownership para BKs seguintes. |
| Rota HTTP | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js:49-50` aplica `requireCompanyContext` e `requireRole("ADMIN", "GESTOR")`; `subscriptionRoutes.js:86-97` expoe `GET /current`, usa `req.companyId` e nao aceita `companyId` do browser. |
| Montagem | `OK` | `real_dev/api/src/server.js:135` monta `buildSubscriptionRoutes({ prisma })` em `/api/subscriptions`. |
| Testes de contrato | `OK` | `real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js:146-241` cobre exposicao da rota, sucesso com subscricao ativa, `state: "none"`, role proibida, empresa em falta e drift de plano com `SUBSCRIPTION_PLAN_DRIFT`. |
| Frontend/UI | `NAO_APLICAVEL` | O guia deixa UI para `BK-MF8-07`; este BK entrega contrato backend. |
| Pagamento real | `NAO_APLICAVEL` | Nao ha checkout, gateway, provider externo, invoice/fatura ou webhooks no modulo de subscricoes auditado. |

### Scope-out respeitado

- Nao foram criadas rotas de ativacao, renovacao, cancelamento ou reativacao; essas operacoes pertencem a `BK-MF8-05` e `BK-MF8-06`.
- Nao foi criado pagamento real, gateway, checkout, fatura, provider externo ou webhook.
- Nao foi aceite `companyId` via `body` ou `query`; a subscricao e resolvida pela empresa ativa em `req.companyId`.
- Nao foi criada UI frontend; o ecra de planos e gestao pertence a `BK-MF8-07`.
- O catalogo do `BK-MF8-03` foi reutilizado por `getSimulatedSubscriptionPlan(code)`, sem duplicar planos.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `test:unit`, `test:contracts`, `syntax:check`, `typecheck`, `build` e `prisma:validate` continuam verdes. |
| `BK-MF8-03 -> BK-MF8-04` | `OK` | `CompanySubscription.planCode` e validado contra `getSimulatedSubscriptionPlan`, preservando o catalogo canonico mensal/trimestral/anual. |
| `BK-MF8-04 -> BK-MF8-05` | `OK` | O modelo `CompanySubscription` e o helper `assertSubscriptionBelongsToActiveCompany` deixam base reutilizavel para ativacao simulada. |
| `BK-MF8-04 -> BK-MF8-07/BK-MF8-08` | `OK` | O endpoint `GET /api/subscriptions/current` esta estavel e a evidence separada pedida pelo guia existe em `docs/evidence/MF8/BK-MF8-04.md`. |

### Pesquisa estatica

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n 'req\.(body\|query)\.companyId|companyId\s*[:=]\s*req\.(body\|query)|body\.companyId|query\.companyId' ...` | `PASS`; sem matches. | Nao ha `companyId` vindo do browser no modulo/teste auditado. |
| `rg -n 'router\.(post\|put\|patch\|delete)|checkout|stripe|payment|invoice|gateway|req\.(body\|query)\.companyId' real_dev/api/src/modules/subscriptions ...` | `PASS`; sem matches. | O modulo de subscricoes nao exposto operacoes mutaveis nem sinais de pagamento real neste BK. |
| `rg -n 'activate|renew|cancel|reactivate|checkout|stripe|payment|invoice|fatura|gateway' ...` | `PASS_COM_RESSALVAS`; hits em `Company.payments`/`PurchaseDocument.payments` do schema global, no estado canonico `CANCELLED` e em JSDoc de faturacao do catalogo. | Hits nao indicam fluxos de pagamento real nem rotas de cancelamento/renovacao no modulo auditado. |
| `git check-ignore -v real_dev/api/src/modules/subscriptions/subscriptionService.js ...` | `INFO` | `.gitignore:4` ignora `real_dev/`; esperado neste repo. |
| `test -f docs/evidence/MF8/BK-MF8-04.md` | `PASS` | Artefacto de evidence separado pedido pelo guia foi criado. |

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `node --test real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js` | `PASS`; 6 testes, 6 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `npm --prefix real_dev/api run prisma:validate` | `FAIL_ESPERADO`; `Prisma P1012` por falta de `DATABASE_URL` no ambiente. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:generate` | `PASS`; Prisma Client gerado. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 76 testes, 76 pass. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `advisory_pass=false` por divida documental antiga fora do BK. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |

### Correcao executada

- Criado `docs/evidence/MF8/BK-MF8-04.md` com data, ficheiros verificados, resumo das alteracoes, comandos reais executados, resultado observado, notas de risco e limites confirmados.
- Reexecutados comandos essenciais para evitar evidence inventada: teste especifico do BK, `syntax:check`, `prisma:validate`, `test:contracts` e `validate-planificacao.sh`.
- Confirmado que a evidence documenta os limites do BK: sem pagamento real, checkout, faturacao, gateway, provider externo, webhook, ativacao, renovacao, cancelamento ou reativacao.

### Validacoes nao executadas

- `npm --prefix real_dev/api run test:integration` nao foi executado nesta auditoria porque o contrato relevante ficou coberto por schema/migration, service, router e testes de contrato sem abrir DB real. A validacao Prisma foi executada com `DATABASE_URL` configurado.
- Smoke HTTP com servidor local nao foi executado porque `mf8-current-subscription.contract.test.js` exercita o router sem porta local, evitando o ruido recorrente de `listen EPERM` neste ambiente.

### Findings

| Finding ID | Severidade | Estado | Evidencia | Recomendacao |
| --- | --- | --- | --- | --- |
| `P3-BK-MF8-04-EVIDENCE-001` | `P3` | `RESOLVIDO` | O guia canonico pede `docs/evidence/MF8/BK-MF8-04.md`; o ficheiro foi criado nesta correcao e `test -f docs/evidence/MF8/BK-MF8-04.md` passa. | Sem acao pendente. |

### Conclusao

`BK-MF8-04` fica `AUDITADO_OK`: o modelo persistente, migration, service, endpoint `GET /api/subscriptions/current`, guards, montagem e testes de contrato cumprem `RF50`, preservam o scope-out de pagamentos reais e operacoes mutaveis, e a evidence separada exigida pelo guia existe em `docs/evidence/MF8/BK-MF8-04.md`.

## Execucao 2026-07-04 - Auditoria BK-MF8-03

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- Escopo pedido: `BK_IDS=[BK-MF8-03]`
- Escopo normalizado: `BK-MF8-03`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas atualizacao deste relatorio de auditoria
- Nota de worktree: `real_dev/` esta ignorado por `.gitignore`, esperado nesta PAP; os relatorios `AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` e `IMPLEMENTACAO-REAL_DEV-MF8.md` ja surgiam como untracked no inicio da auditoria.

### Contrato canonico confirmado

`BK-MF8-03 - Catalogo de planos de subscricao simulados` esta associado a `RF49`, prioridade `P0`, owner `Pedro`, apoio `Andre`, sem dependencia formal, sprint `S12`, tipo `Core` e proximo BK `BK-MF8-04`.

Fontes revistas nesta auditoria:

- `docs/RF.md`: `RF49` define consulta de tres planos simulados mensal, trimestral e anual por Admin/Gestor, sem pagamento real.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: confirma `BK-MF8-03 -> RF49 -> BK-MF8-04`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: confirma prioridade, ownership, requisito e guia canonico.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`: confirma sprint `S12`, owner `Pedro`, requisito `RF49`, dependencias `-` e tipo `Core`.
- `docs/planificacao/backlogs/MF-VIEWS.md`: confirma a sequencia da MF8 e a passagem de health-check para catalogo de subscricoes simuladas.
- `docs/planificacao/backlogs/PLANO-SPRINTS.md`: confirma a inclusao do BK na sprint `S12`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`: confirma scope-in, scope-out, arquitetura, testes minimos e handoff.
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-estado-da-subscricao-da-empresa.md`: confirma que o BK seguinte deve validar plano por `getSimulatedSubscriptionPlan(code)`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-ecras-de-subscricao-e-planos.md`: confirma consumo futuro de `GET /api/subscriptions/plans`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-testes-de-fluxo-completo-de-subscricao.md`: confirma reutilizacao futura das rotas e funcoes deste catalogo.

### Evidencia objetiva no codigo real

| Area | Estado | Evidencia |
| --- | --- | --- |
| Modulo principal | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionPlans.js:8-14` fixa os codigos `monthly`, `quarterly` e `yearly`; `subscriptionPlans.js:16-41` define os tres planos simulados. |
| Contrato de dados | `OK` | `subscriptionPlans.js:75-83` devolve copias imutaveis com `currency: "EUR"` e `simulated: true`; `subscriptionPlans.js:43-53` documenta `code`, `name`, `description`, `priceCents`, `currency`, `billingCycle`, `intervalCount` e `simulated`. |
| Validacao de plano | `OK` | `subscriptionPlans.js:93-104` implementa `getSimulatedSubscriptionPlan(code)`; `subscriptionPlans.js:55-68` e `112-130` estabilizam erro `SUBSCRIPTION_PLAN_NOT_FOUND` com HTTP `404`. |
| Rotas HTTP | `OK` | `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js:48-53` expoe `GET /plans`; `subscriptionRoutes.js:55-65` expoe `GET /plans/:code`. |
| Autenticacao e autorizacao | `OK` | `subscriptionRoutes.js:24-33` aplica `requireAuth`, `requireCompanyContext` e `requireRole("ADMIN", "GESTOR")` quando nao recebe guards de teste. |
| Montagem no servidor | `OK` | `real_dev/api/src/server.js:56` importa `buildSubscriptionRoutes`; `server.js:135` monta `/api/subscriptions`. |
| Testes de contrato | `OK` | `real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js` cobre lista, detalhe, montagem, erro 404, ausencia de sessao, role proibida, erro proprio, imutabilidade e ausencia de campos de pagamento real. |
| Persistencia | `NAO_APLICAVEL` | O BK nao altera schema Prisma, migrations, modelos nem dados por empresa; o catalogo e estatico e simulado. |
| Frontend/UI | `NAO_APLICAVEL` | O guia deixa UI para `BK-MF8-07`; este BK entrega apenas API/modulo reutilizavel. |
| Pagamento real | `NAO_APLICAVEL` | Nao ha gateway, checkout, invoice, provider externo, webhooks ou criacao de cobranca. |

### Scope-out respeitado

- Nao foi criado pagamento real, gateway, checkout, fatura ou integracao externa.
- Nao foi criada persistencia de subscricoes por empresa; isso pertence aos BKs seguintes.
- Nao foi criada UI frontend; o ecra de planos pertence a `BK-MF8-07`.
- Nao ha `companyId` vindo do browser; as rotas usam contexto de empresa via middleware.
- Nao foram misturados fluxos de renovacao, cancelamento, reativacao ou historico.
- Nao foram tocados modulos de IA, fiscalidade, SAF-T, tesouraria, documentos financeiros ou MF7.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `test:unit`, `test:contracts`, `syntax:check`, `typecheck` e `build` continuam verdes; a implementacao do catalogo nao altera contratos de MF7. |
| `BK-MF8-02 -> BK-MF8-03` | `OK` | O health-check permanece separado em `/api/health`; o catalogo fica isolado em `/api/subscriptions/plans`. |
| `BK-MF8-03 -> BK-MF8-04` | `OK` | `getSimulatedSubscriptionPlan(code)` existe para o estado de subscricao validar codigos de plano sem duplicar catalogo. |
| `BK-MF8-03 -> BK-MF8-07` | `OK` | `GET /api/subscriptions/plans` devolve os tres planos necessarios ao ecra de subscricao. |
| `BK-MF8-03 -> BK-MF8-08` | `OK` | Rotas e testes de contrato deixam uma base reutilizavel para o fluxo completo de subscricao simulada. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | Esta auditoria confirma apenas `RF49`; `RF50` e `RF51` continuam fora de scope ate aos BKs proprios. |

### Pesquisa estatica

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n 'TODO implementar|FIXME|temporario|temporary|demo only|implementar depois|pseudo-codigo|payload: unknown|as any|localStorage|sessionStorage|dangerouslySetInnerHTML|eval\\(|new Function|password.*console|token.*console|cookie.*console|console\\.log\\(.*password|console\\.log\\(.*token|secret|api[_-]?key|deleteMany\\(\\{\\}\\)|delete\\(\\{\\}\\)|updateMany\\(\\{\\}\\)|CORS|Access-Control-Allow-Origin|RAG|embeddings|OCR|chunking semantico|companyId' real_dev/api/src/modules/subscriptions/subscriptionPlans.js real_dev/api/src/modules/subscriptions/subscriptionRoutes.js real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js` | `PASS` | Sem matches nos ficheiros diretamente auditados. |
| `rg -n 'FaithFlix|StudyFlow|Orelle|cosmetica|cosmetica|biometria|streaming|pool solidaria|turma|professor|sala|material de estudo' real_dev/api/src/modules/subscriptions/subscriptionPlans.js real_dev/api/src/modules/subscriptions/subscriptionRoutes.js real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js` | `PASS` | Sem drift de dominio nos ficheiros do BK. |
| `rg -n 'gateway|checkoutUrl|paymentProvider|invoiceId' real_dev/api/src/modules/subscriptions/subscriptionPlans.js real_dev/api/src/modules/subscriptions/subscriptionRoutes.js real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js` | `PASS_COM_RESSALVAS` | Matches apenas na lista negativa do teste de contrato que prova a ausencia desses campos na resposta. |
| `rg -n --glob '!real_dev/web/dist/**' 'TODO implementar|FIXME|temporario|temporary|demo only|implementar depois|pseudo-codigo|payload: unknown|as any|localStorage|sessionStorage|dangerouslySetInnerHTML|eval\\(|new Function|password.*console|token.*console|cookie.*console|console\\.log\\(.*password|console\\.log\\(.*token|secret|api[_-]?key|deleteMany\\(\\{\\}\\)|delete\\(\\{\\}\\)|updateMany\\(\\{\\}\\)|CORS|Access-Control-Allow-Origin|RAG|embeddings|OCR|chunking semantico' real_dev/api real_dev/web` | `PASS_COM_RESSALVAS` | Hits globais sao denylist/negativos de testes, helpers de redacao/segredos, storage privado e validadores ja existentes. Sem evidencia de risco ligado a `BK-MF8-03`. |
| `rg -n --glob '!real_dev/web/dist/**' 'FaithFlix|StudyFlow|Orelle|cosmetica|cosmetica|biometria|streaming|pool solidaria|turma|professor|sala|material de estudo' real_dev/api real_dev/web` | `PASS` | Sem drift de dominio externo no codigo real auditado. |
| `git check-ignore -v real_dev/api/src/modules/subscriptions/subscriptionPlans.js real_dev/api/src/modules/subscriptions/subscriptionRoutes.js real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js real_dev/web/dist/index.html` | `INFO` | `.gitignore:4` ignora `real_dev/`; isto e esperado e nao e finding. |

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `node --test real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js` | `PASS`; 10 testes, 10 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `npm --prefix real_dev/api run prisma:validate` | `FAIL_ESPERADO`; `Prisma P1012` por falta de `DATABASE_URL` no ambiente. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 70 testes, 70 pass. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |
| `rg -n '[ \\t]+$' real_dev/api/src/modules/subscriptions/subscriptionPlans.js real_dev/api/src/modules/subscriptions/subscriptionRoutes.js real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` | `PASS`; sem trailing whitespace. |

### Validacoes nao executadas

- `npm --prefix real_dev/api run test:integration` nao foi executado porque `BK-MF8-03` nao altera persistencia, schema, repositorios ou fluxos com base de dados. A validacao relevante ficou coberta por contrato, unidade, sintaxe e `prisma:validate` com `DATABASE_URL`.
- Smoke HTTP real com servidor local nao foi executado porque a montagem em `/api/subscriptions` e as respostas dos routers ficaram cobertas por `mf8-subscription-plans.contract.test.js` sem abrir porta local.
- Teste especifico de UI de subscricao nao foi executado porque a UI pertence a `BK-MF8-07`; ainda assim `typecheck` e `build` do frontend passaram.

### Nota operacional

Uma pesquisa exploratoria aos headers/handoffs dos guias foi inicialmente lancada com quoting incorreto no shell, causando interpretacao de backticks pelo `zsh`. O comando foi repetido com aspas corretas e a leitura canonica foi confirmada; isto nao gerou alteracao de produto nem afeta o resultado da auditoria.

### Findings

Nao foram encontrados findings ativos.

| Finding ID | Severidade | Estado | Evidencia |
| --- | --- | --- | --- |
| - | - | - | Sem findings `P0`, `P1`, `P2` ou `P3` nesta auditoria. |

### Conclusao

`BK-MF8-03` fica `AUDITADO_OK` em `real_dev`. A implementacao materializa `RF49` com catalogo estatico de tres planos simulados, rotas autenticadas e autorizadas para Admin/Gestor, montagem em `/api/subscriptions`, ausencia de pagamento real e cobertura de contrato suficiente para positivos, negativos e invariantes de scope-out. O proximo passo natural da MF8 e `BK-MF8-04 - Estado da subscricao da empresa`.

## Execucao 2026-07-03 - Reauditoria BK-MF8-02

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- Nota de normalizacao: o pedido direto foi `re-auditar`; a prompt anexada ainda trazia `MODO: implementar`, por isso esta execucao foi tratada como re-auditoria sem edicao de codigo de produto.
- Escopo pedido: `BK_IDS=[BK-MF8-02]`
- Escopo normalizado: `BK-MF8-02`
- Implementation root auditado: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas atualizacao deste relatorio de auditoria

### Contrato canonico confirmado

`BK-MF8-02 - Endpoint de health-check` continua associado a `RNF29`, prioridade `P1`, owner `Sofia`, apoio `Oleksii`, sem dependencia formal, sprint `S12`, tipo `Core` e proximo BK `BK-MF8-03`.

Fontes revistas nesta reauditoria:

- `docs/RNF.md`: `RNF29` define `Endpoint de health-check` como requisito operacional `Should`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: confirma `BK-MF8-02 -> RNF29 -> BK-MF8-03`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: confirma prioridade, ownership, requisito e guia canonico.
- `docs/planificacao/backlogs/MF-VIEWS.md`: confirma a sequencia da MF8.
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-endpoint-de-health-check.md`: confirma scope-in, scope-out, payload seguro, negativos minimos e handoff.
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md`: confirma a base `ops` e a regra de nao gerar log por pedido de health-check.
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`: confirma que subscricoes simuladas pertencem ao BK seguinte, nao ao health-check.

### Evidencia objetiva no codigo real

| Area | Estado | Evidencia |
| --- | --- | --- |
| Modulo principal | `OK` | `real_dev/api/src/modules/ops/healthRoutes.js:1-6` declara readiness operacional minima sem BD, configuracao interna, empresas, roles, credenciais ou dados financeiros; `healthRoutes.js:91-100` exporta o router Express. |
| Endpoint | `OK` | `real_dev/api/src/server.js:55` importa `buildHealthRoutes`; `server.js:81-87` monta `/api/health`; `server.js:89` deixa `/api/auth` depois do health-check. |
| Payload publico | `OK` | `healthRoutes.js:75-82` devolve apenas `status`, `service`, `version`, `environment` e `checkedAt`. |
| Validacao minima | `OK` | `healthRoutes.js:44-57` valida objeto, versao e ambiente; `healthRoutes.js:71-72` rejeita relogio invalido. |
| Segurança operacional | `OK` | `server.js:74-78` aplica hardening transversal antes da rota; a rota nao le sessao, empresa ativa, BD, documentos financeiros, variaveis completas nem segredos. |
| Testes de contrato | `OK` | `real_dev/api/tests/contracts/mf8-health.contract.test.js:60-141` cobre rota, montagem antes de `/api/auth`, payload fechado, relogio controlado e negativos de versao/ambiente/configuracao. |
| Prisma/persistencia | `NAO_APLICAVEL` | O BK nao altera schema, modelos, migrations, repositorios ou dados por empresa. |
| Frontend/UI | `NAO_APLICAVEL` | O guia declara UI fora de scope; nao ha cliente frontend para este BK. |
| IA/contabilidade/fiscalidade | `NAO_APLICAVEL` | O endpoint e operacional; nao executa IA, documentos, lancamentos, recebimentos, pagamentos, SAF-T ou automatismos contabilisticos. |

### Scope-out respeitado

- Nao foi criado painel de monitorizacao.
- Nao ha ping a base de dados nem dependencia de persistencia.
- Nao sao expostas URLs internas, credenciais, `DATABASE_URL`, variaveis de ambiente completas, empresas, documentos financeiros, roles ou permissoes.
- O endpoint nao exige autenticacao porque o contrato de `RNF29` pede readiness publico e seguro.
- Nao foi criado fornecedor externo de observabilidade.
- Nao foi criada UI frontend.
- Nao houve gateway de pagamento, checkout, faturas, subscricoes, IA ou scope de BK futuro.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `npm --prefix real_dev/api run test:contracts` passou com 60 testes, preservando os contratos criticos auditados antes da MF8. |
| `BK-MF8-01 -> BK-MF8-02` | `OK` | `server.js` preserva o evento estruturado `api.started`; `healthRoutes.js` nao escreve log por pedido, evitando ruido operacional. |
| `BK-MF8-02 -> BK-MF8-03` | `OK` | `GET /api/health` entrega readiness basica sem misturar catalogo de planos, subscricoes, pagamentos ou autorizacao administrativa. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | Esta reauditoria confirma apenas `RNF29`; subscricoes, UI, IA, formatacao final e fecho global continuam nos BKs proprios. |

### Pesquisa estatica

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n 'TODO implementar|FIXME|temporario|temporary|demo only|implementar depois|pseudo-codigo|payload: unknown|as any|localStorage|sessionStorage|dangerouslySetInnerHTML|eval\\(|new Function|password.*console|token.*console|cookie.*console|console\\.log\\(.*password|console\\.log\\(.*token|secret|api[_-]?key|deleteMany\\(\\{\\}\\)|delete\\(\\{\\}\\)|updateMany\\(\\{\\}\\)|CORS|Access-Control-Allow-Origin|RAG|embeddings|OCR|chunking semantico' real_dev/api/src/modules/ops/healthRoutes.js real_dev/api/src/server.js real_dev/api/tests/contracts/mf8-health.contract.test.js` | `PASS` | Sem matches nos ficheiros diretamente auditados. |
| `rg -n 'FaithFlix|StudyFlow|Orelle|cosmetica|cosmetica|biometria|streaming|pool solidaria|turma|professor|sala|material de estudo' real_dev/api/src/modules/ops/healthRoutes.js real_dev/api/src/server.js real_dev/api/tests/contracts/mf8-health.contract.test.js` | `PASS` | Sem drift de dominio nos ficheiros do BK. |
| `rg -n --glob '!real_dev/web/dist/**' 'TODO implementar|FIXME|temporario|temporary|demo only|implementar depois|pseudo-codigo|payload: unknown|as any|localStorage|sessionStorage|dangerouslySetInnerHTML|eval\\(|new Function|password.*console|token.*console|cookie.*console|console\\.log\\(.*password|console\\.log\\(.*token|secret|api[_-]?key|deleteMany\\(\\{\\}\\)|delete\\(\\{\\}\\)|updateMany\\(\\{\\}\\)|CORS|Access-Control-Allow-Origin|RAG|embeddings|OCR|chunking semantico' real_dev/api real_dev/web` | `PASS_COM_RESSALVAS` | Hits globais sao denylist/negativos de testes, adapters que provam que nao registam tokens, helpers de token secreto e storage privado. Sem evidencia de segredo hardcoded ou risco ligado a `BK-MF8-02`. |
| `rg -n --glob '!real_dev/web/dist/**' 'FaithFlix|StudyFlow|Orelle|cosmetica|cosmetica|biometria|streaming|pool solidaria|turma|professor|sala|material de estudo' real_dev/api real_dev/web` | `PASS` | Sem drift de dominio externo no codigo real auditado. |
| `git check-ignore -v real_dev/api/src/modules/ops/healthRoutes.js real_dev/api/src/server.js real_dev/api/tests/contracts/mf8-health.contract.test.js` | `INFO` | `.gitignore:4` ignora `real_dev/`; isto e esperado nesta PAP e nao e finding. |

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `node --check real_dev/api/src/modules/ops/healthRoutes.js` | `PASS` |
| `node --check real_dev/api/src/server.js` | `PASS` |
| `node --check real_dev/api/tests/contracts/mf8-health.contract.test.js` | `PASS` |
| `node --test real_dev/api/tests/contracts/mf8-health.contract.test.js` | `PASS`; 7 testes, 7 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/opsa_test npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 60 testes, 60 pass. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |

### Validacoes nao executadas

- Smoke HTTP com `curl http://localhost:3000/api/health` nao foi executado porque exigiria arrancar o servidor e abrir porta local. A prova relevante ficou coberta por `node --test real_dev/api/tests/contracts/mf8-health.contract.test.js`, que valida router, payload e montagem em `server.js` sem depender de rede local.
- `npm --prefix real_dev/api run test:integration` nao foi executado porque `BK-MF8-02` nao altera persistencia, schema, repositorios nem fluxos com base de dados.

### Findings

Nao foram encontrados findings ativos.

| Finding ID | Severidade | Estado | Evidencia |
| --- | --- | --- | --- |
| - | - | - | Sem findings `P0`, `P1`, `P2` ou `P3` nesta reauditoria. |

### Conclusao

`BK-MF8-02` fica re-auditado como `AUDITADO_OK` em `real_dev`. A implementacao continua a materializar `RNF29` com `GET /api/health`, payload publico fechado, validacao minima, montagem antes dos routers autenticados e cobertura de contrato suficiente para positivos e negativos principais. O proximo passo natural continua a ser `BK-MF8-03 - Catalogo de planos de subscricao simulados`.

## Execucao 2026-07-03 - BK-MF8-02

- Projeto: `OPSA`
- Modo: `auditar_implementacao`
- Escopo pedido: `BK_IDS=[BK-MF8-02]`
- Escopo normalizado: `BK-MF8-02`
- Implementation root: `real_dev`
- Resultado global: `PASS`
- Estado do BK: `AUDITADO_OK`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas atualizacao deste relatorio de auditoria

### Contrato canonico confirmado

`BK-MF8-02 - Endpoint de health-check` esta associado a `RNF29`, prioridade `P1`, owner `Sofia`, apoio `Oleksii`, sem dependencia formal, sprint `S12`, tipo `Core` e proximo BK `BK-MF8-03`.

Fontes revistas:

- `docs/RNF.md`: `RNF29` define `Endpoint de health-check` como requisito operacional `Should`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: confirma `BK-MF8-02 -> RNF29 -> BK-MF8-03`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: confirma prioridade, ownership, requisito e guia canonico.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`: confirma sprint `S12`, owner `Sofia`, requisito `RNF29`, dependencias `-` e tipo `Core`.
- `docs/planificacao/backlogs/MF-VIEWS.md`: confirma a sequencia `BK-MF8-01 -> BK-MF8-02 -> BK-MF8-03`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-endpoint-de-health-check.md`: confirma scope-in, scope-out, payload seguro, negativos minimos e handoff.
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md`: confirma a base `ops` e a decisao de nao gerar log por pedido de health-check.
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`: confirma que o proximo BK deve tratar subscricoes simuladas separadamente do health-check.
- `README.md`, `docs/RF.md`, `docs/planificacao/README.md`, `CONTRATO-STACK-IMPLEMENTACAO.md`, `DISTRIBUICAO-RESPONSABILIDADES.md`, `PLANO-IMPLEMENTACAO-TOTAL.md`, `PLANO-SPRINTS.md`, `guias-bk/README.md`, `_TEMPLATE-BK.md` e headers/handoffs dos BKs `MF0..MF8`.

### Evidencia de implementacao

| Area | Estado | Evidencia |
| --- | --- | --- |
| Modulo principal | `OK` | `real_dev/api/src/modules/ops/healthRoutes.js` existe e exporta `buildHealthPayload` e `buildHealthRoutes`. |
| Endpoint | `OK` | `real_dev/api/src/server.js:55` importa `buildHealthRoutes`; `server.js:81-87` monta `/api/health`; `server.js:89` deixa `/api/auth` depois do health-check. |
| Payload publico | `OK` | `healthRoutes.js:76-82` devolve apenas `status`, `service`, `version`, `environment` e `checkedAt`. |
| Validacao minima | `OK` | `healthRoutes.js:44-57` valida objeto, versao e ambiente; `healthRoutes.js:71-72` rejeita data invalida. |
| Segurança operacional | `OK` | `healthRoutes.js:1-6` declara explicitamente que nao consulta BD nem expoe configuracao interna, empresas, roles, credenciais ou dados financeiros. |
| Middleware transversal | `OK` | `server.js:74-78` aplica HTTPS/HSTS/JSON/origem confiavel antes de montar a rota. |
| Testes de contrato | `OK` | `mf8-health.contract.test.js:60-141` cobre rota, montagem em `server.js`, payload fechado, relogio controlado e negativos de versao/ambiente/configuracao. |
| Prisma/persistencia | `NAO_APLICAVEL` | O BK nao altera schema, modelos, migrations, repositorios nem dados por empresa. |
| Frontend/UI | `NAO_APLICAVEL` | O guia declara UI fora de scope; nao ha cliente frontend para este BK. |
| IA/contabilidade/fiscalidade | `NAO_APLICAVEL` | O endpoint e operacional e nao executa IA, documentos, lancamentos, recebimentos, pagamentos ou SAF-T. |

### Scope-out respeitado

- Nao foi criado painel de monitorizacao.
- Nao ha ping a base de dados nem dependencia de persistencia.
- Nao sao expostas URLs internas, credenciais, `DATABASE_URL`, variaveis de ambiente completas, empresas, documentos financeiros, roles ou permissoes.
- O endpoint nao exige autenticacao porque o contrato de `RNF29` pede readiness publico e seguro.
- Nao foi criado fornecedor externo de observabilidade.
- Nao foi criada UI frontend.
- Nao houve gateway de pagamento, checkout, faturas, subscricoes, IA ou scope de BK futuro.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `test:contracts` continua verde com 60 testes e preserva contratos criticos de MF7. |
| `BK-MF8-01 -> BK-MF8-02` | `OK` | `healthRoutes.js` usa o modulo `ops`; `server.js` preserva o logger `api.started`; nao ha log por cada pedido de health-check. |
| `BK-MF8-02 -> BK-MF8-03` | `OK` | `GET /api/health` entrega readiness basica; nao mistura o futuro catalogo de planos simulados com operacao. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | A auditoria confirma apenas `RNF29`; subscricoes, UI, IA e fecho final ficam para os BKs proprios. |

### Pesquisa estatica

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n "TODO implementar|FIXME|temporario|temporary|demo only|implementar depois|pseudo-codigo|payload: unknown|as any|localStorage|sessionStorage|dangerouslySetInnerHTML|eval\\(|new Function|password.*console|token.*console|cookie.*console|console\\.log\\(.*password|console\\.log\\(.*token|secret|api[_-]?key|deleteMany\\(\\{\\}\\)|delete\\(\\{\\}\\)|updateMany\\(\\{\\}\\)|CORS|Access-Control-Allow-Origin|RAG|embeddings|OCR|chunking semantico" real_dev/api/src/modules/ops/healthRoutes.js real_dev/api/src/server.js real_dev/api/tests/contracts/mf8-health.contract.test.js` | `PASS` | Sem matches nos ficheiros diretamente auditados. |
| `rg -n "TODO implementar|FIXME|temporario|temporary|demo only|implementar depois|pseudo-codigo|payload: unknown|as any|localStorage|sessionStorage|dangerouslySetInnerHTML|eval\\(|new Function|password.*console|token.*console|cookie.*console|console\\.log\\(.*password|console\\.log\\(.*token|secret|api[_-]?key|deleteMany\\(\\{\\}\\)|delete\\(\\{\\}\\)|updateMany\\(\\{\\}\\)|CORS|Access-Control-Allow-Origin|RAG|embeddings|OCR|chunking semantico" real_dev/api real_dev/web` | `PASS_COM_RESSALVAS` | Hits globais sao denylist/negativos de testes, adapters que provam que nao registam tokens, helper de token secreto e storage privado. Sem evidencia de segredo hardcoded ou risco ligado a `BK-MF8-02`. |
| `rg -n "FaithFlix|StudyFlow|Orelle|cosmetica|cosmética|biometria|streaming|pool solidaria|turma|professor|sala|material de estudo" real_dev/api/src/modules/ops/healthRoutes.js real_dev/api/src/server.js real_dev/api/tests/contracts/mf8-health.contract.test.js` | `PASS` | Sem drift de dominio nos ficheiros do BK. |
| `rg -n "FaithFlix|StudyFlow|Orelle|cosmetica|cosmética|biometria|streaming|pool solidaria|turma|professor|sala|material de estudo" real_dev/api real_dev/web` | `PASS` | Sem drift de dominio externo no codigo real auditado. |
| `git check-ignore -v real_dev/api/src/modules/ops/healthRoutes.js real_dev/api/src/server.js real_dev/api/tests/contracts/mf8-health.contract.test.js` | `INFO` | `real_dev/` esta ignorado por `.gitignore`; isto e esperado e nao e finding. |

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `node --check real_dev/api/src/modules/ops/healthRoutes.js` | `PASS` |
| `node --check real_dev/api/src/server.js` | `PASS` |
| `node --check real_dev/api/tests/contracts/mf8-health.contract.test.js` | `PASS` |
| `node --test real_dev/api/tests/contracts/mf8-health.contract.test.js` | `PASS`; 7 testes, 7 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/opsa_test npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 60 testes, 60 pass. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |

### Validacoes nao executadas

- Smoke HTTP com `curl http://localhost:3000/api/health` nao foi executado porque exigiria arrancar o servidor e abrir porta local. A prova relevante nesta auditoria ficou coberta por `node --test real_dev/api/tests/contracts/mf8-health.contract.test.js`, que valida router, payload e montagem em `server.js` sem depender de rede local.
- `npm --prefix real_dev/api run test:integration` nao foi executado porque `BK-MF8-02` nao altera persistencia, schema, repositorios nem fluxos com base de dados.

### Findings

Nao foram encontrados findings ativos.

| Finding ID | Severidade | Estado | Evidencia |
| --- | --- | --- | --- |
| - | - | - | Sem findings `P0`, `P1`, `P2` ou `P3` nesta auditoria. |

### Conclusao

`BK-MF8-02` fica `AUDITADO_OK` em `real_dev`. A implementacao materializa `RNF29` com `GET /api/health`, payload publico fechado, validacao minima, montagem antes dos routers autenticados e testes de contrato suficientes para positivos e negativos principais. O proximo passo natural da MF8 e `BK-MF8-03 - Catalogo de planos de subscricao simulados`, mantendo subscricoes simuladas fora do endpoint operacional.

## Execucao 2026-07-03 - BK-MF8-01

- Projeto: `OPSA`
- Modo: `auditar_implementacao`
- Escopo pedido: `BK_IDS=[BK-MF8-1]`
- Escopo normalizado: `BK-MF8-01`
- Implementation root: `real_dev`
- Resultado global: `PASS`
- Findings ativos: nenhum `P0`, `P1`, `P2` ou `P3`
- Commits: nenhum
- Alteracoes desta execucao: apenas criacao deste relatorio de auditoria

### Contrato canonico confirmado

`BK-MF8-01 - Logs estruturados (info, warn, error, audit)` esta associado a `RNF28`, prioridade `P0`, owner `Oleksii`, apoio `Pedro`, sem dependencia formal e com proximo BK `BK-MF8-02`.

Fontes revistas:

- `docs/RNF.md`: `RNF28` define logs estruturados com niveis `info`, `warn`, `error` e `audit`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: `BK-MF8-01` mapeia para `RNF28` e prepara `BK-MF8-02`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: confirma prioridade, ownership, requisito e proximo BK.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`: confirma sprint `S12`, owner e guia canonico.
- `docs/planificacao/backlogs/MF-VIEWS.md`: confirma a sequencia da MF8.
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md`: confirma scope-in, scope-out, criterios de aceite e handoff.
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-endpoint-de-health-check.md`: confirma que o proximo BK reutiliza `ops` e nao deve criar logs por cada pedido de health-check.
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-reconciliacao.md`: confirma o handoff MF7 -> MF8.

### Evidencia de implementacao

| Area | Estado | Evidencia |
| --- | --- | --- |
| Modulo principal | `OK` | `real_dev/api/src/modules/ops/structuredLogger.js` existe e implementa `createStructuredLogEvent` e `writeStructuredLog`. |
| Niveis RNF28 | `OK` | `ALLOWED_LEVELS` aceita exatamente `info`, `warn`, `error` e `audit`. |
| Campos obrigatorios | `OK` | O evento exige `level`, `event`, `module` e `requirement` textuais e nao vazios. |
| Contexto seguro | `OK` | O contexto aceita apenas metadados primitivos e rejeita objetos, arrays e chaves sensiveis normalizadas. |
| Dados sensiveis | `OK` | A denylist bloqueia variacoes de `password`, `token`, `secret`, `apiKey`, `authorization`, `cookie`, `headers`, `rawPayload`, `iban`, `nif` e similares. |
| Writer central | `OK` | `error` usa `console.error`, `warn` usa `console.warn` e `info`/`audit` usam `console.info`. |
| Arranque API | `OK` | `real_dev/api/src/server.js` cria evento `api.started` com `requirement: "RNF28"` e contexto limitado a `port` e `environment`. |
| Testes | `OK` | `real_dev/api/tests/unit/structuredLogger.test.js` cobre positivos dos quatro niveis e negativos de nivel invalido, campos obrigatorios, chaves sensiveis e objetos/arrays aninhados. |

### Scope-out respeitado

- Nao foi criado endpoint novo neste BK.
- Nao houve alteracao de Prisma, migrations ou modelos persistentes.
- Nao houve alteracao ao modelo `AuditLog`; o logger operacional fica separado da auditoria persistente de MF4/MF6.
- Nao houve UI frontend para este BK.
- Nao ha ownership vindo do browser, nem decisao de `companyId`/roles no frontend.
- Nao foram guardados headers, cookies, variaveis de ambiente completas, credenciais, documentos financeiros completos ou payloads brutos.

### Coerencia entre MFs e BKs vizinhos

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `BK-MF7-10` continua validado em `test:contracts`; `BK-MF8-01` acrescenta observabilidade operacional sem alterar os modulos criticos. |
| `BK-MF8-01 -> BK-MF8-02` | `OK` | O modulo `ops/structuredLogger.js` pode ser reutilizado por eventos operacionais relevantes; o guia de `BK-MF8-02` confirma que `GET /api/health` nao deve gerar log por pedido para evitar ruido. |
| `MF4/MF6 -> MF8` | `OK` | `AuditLog` e auditoria sensivel permanecem separados do logger operacional RNF28. |

### Pesquisa estatica

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n "TODO|FIXME|temporario|temporario|temporary|placeholder|pseudo|demo only|implementar depois|payload: unknown|as any|localStorage|sessionStorage|dangerouslySetInnerHTML|eval\\(|new Function|console\\.log|console\\.(info|warn|error)|process\\.env|password|secret|token|apiKey|authorization|cookie|headers|rawPayload|documentLines|iban|nif" real_dev/api/src/modules/ops/structuredLogger.js real_dev/api/src/server.js real_dev/api/tests/unit/structuredLogger.test.js` | `PASS_COM_RESSALVAS` | Os hits sao esperados: chaves proibidas na denylist, testes negativos e chamadas `console.*` encapsuladas no writer. Nao foram encontrados TODO/FIXME/placeholders ou `console.log`. |
| `rg -n "FaithFlix|StudyFlow|Orelle|cosmetica|cosmetica|biometria|streaming|pool solidaria|turma|professor|sala|material de estudo" real_dev/api/src real_dev/api/tests real_dev/api/scripts real_dev/web/src real_dev/web/scripts` | `PASS` | Sem drift de dominio externo encontrado. |
| `rg -n "buildHealthRoutes|healthRoutes|GET /api/health|/api/health" real_dev/api/src real_dev/api/tests` | `PASS` | Sem implementacao antecipada de `BK-MF8-02`; o escopo de `BK-MF8-01` ficou contido. |
| `git check-ignore -v real_dev real_dev/api/src/modules/ops/structuredLogger.js real_dev/api/src/server.js real_dev/api/tests/unit/structuredLogger.test.js` | `INFO` | `real_dev/` esta ignorado por `.gitignore`, por isso a auditoria usou leitura direta e comandos, nao apenas `git status`. |

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `node --check real_dev/api/src/modules/ops/structuredLogger.js` | `PASS` |
| `node --check real_dev/api/src/server.js` | `PASS` |
| `node --check real_dev/api/tests/unit/structuredLogger.test.js` | `PASS` |
| `node --test real_dev/api/tests/unit/structuredLogger.test.js` | `PASS`; 5 testes, 5 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/opsa_test npm --prefix real_dev/api run prisma:validate` | `PASS` |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 53 testes, 53 pass. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS` |

### Validacoes nao executadas

- `npm --prefix real_dev/api run test:integration` nao foi executado porque `BK-MF8-01` nao altera persistencia, schema, repositorios nem fluxos HTTP com base de dados.
- Smoke HTTP/browser nao foi executado porque este BK nao cria endpoint nem UI. O primeiro endpoint operacional pertence a `BK-MF8-02`.

### Findings

Nao foram encontrados findings ativos.

| Finding ID | Severidade | Estado | Evidencia |
| --- | --- | --- | --- |
| - | - | - | Sem findings `P0`, `P1`, `P2` ou `P3` nesta auditoria. |

### Conclusao

`BK-MF8-01` fica `AUDITADO_OK` em `real_dev`. A implementacao materializa `RNF28` com logs estruturados seguros, separa observabilidade operacional de `AuditLog`, valida o arranque `api.started` e possui testes unitarios repetiveis. O proximo passo natural da MF8 e `BK-MF8-02 - Endpoint de health-check`, reutilizando o modulo `ops` apenas para eventos operacionais relevantes.
