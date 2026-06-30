# Auditoria de implementacao real_dev - MF7

## Auditoria consolidada - MF7 completa - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK_IDS=[]`, ou seja, `BK-MF7-01` a `BK-MF7-10`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`
- Relatorio fonte: `auto`; relatorios MF7 existentes foram confrontados com o codigo real atual.
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Relatorio de correcao consultado: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Permissao de codigo: sem alteracoes de codigo.
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.
- Commits: nao executados.

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, todos os guias `docs/planificacao/guias-bk/MF7/`, guia anterior de coerencia `BK-MF6-10` e handoff para MF8.
- Relatorios existentes: `AUDITORIA-HIDRATACAO-MF7.md`, `IMPLEMENTACAO-REAL_DEV-MF7.md`, este relatorio de auditoria e `CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`.
- Codigo real: `real_dev/api/package.json`, `real_dev/web/package.json`, `real_dev/api/prisma/schema.prisma`, scripts, tests, evidence e modulos MF7 relevantes em `real_dev/api` e `real_dev/web`.

### Resultado geral

Estado geral da MF7: `PASS_COM_RISCOS`.

A implementacao real da MF7 esta materializada em `real_dev` e os gates automatizados principais passaram: `syntax:check`, `prisma:validate`, `test:unit`, `test:contracts`, `test:mf6`, `test:mf7` da API, `test:mf7` da web, `test:integration` com skip explicito, scans estaticos, `validate-planificacao.sh` e `git diff --check`.

Nao foram confirmados findings `P0`. Existem dois findings `P1` ativos, ambos ambientais/operacionais e ja isolados:

- `BK-MF7-01` tem scripts e negativos de backup/restauro, mas falta prova positiva porque `pg_dump` e `pg_restore` nao estao disponiveis no ambiente.
- `BK-MF7-03` tem gates automaticos de compatibilidade e build/typecheck verdes, mas falta smoke manual real em Chrome, Edge e Firefox porque os browsers alvo nao estao disponiveis neste ambiente.

O finding `P3-MF7-06-01` de nomenclatura de importacao ja esta `CORRIGIDO` no relatorio de correcao e nao fica ativo nesta auditoria consolidada.

### Estado por BK

| BK | RNF/RF | Estado auditado | Evidencia resumida |
| --- | --- | --- | --- |
| `BK-MF7-01` | `RNF18` | `PARCIAL` / `AUDITADO_COM_FINDINGS` | Scripts `mf7:backup` e `mf7:backup:verify` existem; negativos passam; prova positiva bloqueada por ausencia de `pg_dump`/`pg_restore`. |
| `BK-MF7-02` | `RNF19` | `OK` / `AUDITADO_OK` | `RetentionHold`, gate de retencao, auditoria sensivel e `test:mf7:retention` passam. |
| `BK-MF7-03` | `RNF20` | `PARCIAL` / `AUDITADO_COM_FINDINGS` | Gate browser, modularidade frontend, typecheck e build passam; falta smoke manual em Chrome, Edge e Firefox. |
| `BK-MF7-04` | `RNF21`, `RF05`, `RF46` | `OK` / `AUDITADO_OK` | Adapter transaccional de email, password reset, alertas/lembretes e `test:mf7:email` passam. |
| `BK-MF7-05` | `RNF22`, `RF29` | `OK` / `AUDITADO_OK` | Exportacoes CSV/XLSX/PDF, formatos invalidos, headers/downloads e `test:mf7:exports` passam. |
| `BK-MF7-06` | `RNF23` | `OK` / `AUDITADO_OK` | Importacoes CSV/XLSX, logs, auditoria, migration XLSX e `test:mf7:imports` passam; P3 anterior corrigido. |
| `BK-MF7-07` | `RNF24`, `RF36`, `RF48` | `OK_COM_RISCOS_OPERACIONAIS` | SAF-T MVP com readiness, logs e `test:mf7:saft` passam; smoke live/validacao oficial externa nao executados. |
| `BK-MF7-08` | `RNF25` | `OK` / `AUDITADO_OK` | Gate `check:mf7:backend-modules` e agregador API MF7 passam. |
| `BK-MF7-09` | `RNF26` | `OK` / `AUDITADO_OK` | Gate `check:mf7:frontend-modules`, `credentials: "include"`, typecheck e build passam. |
| `BK-MF7-10` | `RNF27` | `OK` / `AUDITADO_OK` | Suite `mf7-critical-modules.test.js` cobre faturacao, IVA, balancetes e reconciliacao; agregador MF7 passa. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Ficheiros principais auditados | Testes/gates |
| --- | --- | --- |
| `BK-MF7-01` | `real_dev/api/scripts/run-daily-backup.mjs`; `real_dev/api/scripts/verify-backup-restore.mjs`; `real_dev/api/package.json` | `mf7:backup`; `mf7:backup:verify`; `syntax:check`; `test:mf7`; checks `pg_dump`/`pg_restore`. |
| `BK-MF7-02` | `real_dev/api/prisma/schema.prisma`; `retentionPolicy.js`; `retentionDeletionGate.js`; `auditLogService.js`; `retentionPolicy.test.js` | `test:mf7:retention`; `test:unit`; `test:contracts`; `prisma:validate`. |
| `BK-MF7-03` | `real_dev/web/scripts/check-mf7-browser-compatibility.mjs`; `real_dev/web/evidence/mf7-browser-compatibility.md`; `App.tsx`; `styles.css`; `apiClient.ts` | `test:mf7:browser-compatibility`; `npm --prefix real_dev/web run test:mf7`; browser availability checks. |
| `BK-MF7-04` | `transactionalEmailAdapter.js`; `passwordResetEmailAdapter.js`; `passwordResetService.js`; `notificationService.js`; `mf7-email-contracts.test.js` | `test:mf7:email`; `test:mf7`; `test:contracts`. |
| `BK-MF7-05` | `exportFormatService.js`; `accountingReportRoutes.js`; `accountingReportExporters.js`; `apiClient.ts`; `mf7-export-contracts.test.js` | `test:mf7:exports`; `test:mf7`; web `test:mf7`. |
| `BK-MF7-06` | `importFileParser.js`; `businessImportService.js`; `businessImportRoutes.js`; `integrationLogService.js`; `mf7-import-contracts.test.js` | `test:mf7:imports`; `test:mf7`; migration enum XLSX check. |
| `BK-MF7-07` | `saftComplianceChecklist.js`; `saftService.js`; `saftRoutes.js`; `integrationLogService.js`; `mf7-saft-contracts.test.js` | `test:mf7:saft`; `test:mf7`; `prisma:validate`. |
| `BK-MF7-08` | `check-mf7-backend-modules.mjs`; `real_dev/api/src/server.js`; routes/services por dominio | `check:mf7:backend-modules`; `test:mf7`; negativos simulados historicos. |
| `BK-MF7-09` | `check-mf7-frontend-modules.mjs`; `App.tsx`; `apiClient.ts`; UI reutilizavel; evidence frontend | `check:mf7:frontend-modules`; web `test:mf7`; typecheck/build. |
| `BK-MF7-10` | `mf7-critical-modules.test.js`; services de vendas, IVA, balancetes e tesouraria; evidence critica | `test:mf7:critical-modules`; `test:mf7`; `test:contracts`. |

### Contratos consumidos

- `MF0`: autenticacao, sessao, empresa ativa, roles e permissoes continuam a ser resolvidas no backend.
- `MF1/MF2/MF3`: vendas, compras, inventario, contabilidade, tesouraria, mapas fiscais, reporting e SAF-T fornecem os dominios que MF7 valida, exporta, importa e protege.
- `MF4`: auditoria e logs de integracao sao reutilizados por retencao, importacoes e SAF-T.
- `MF5`: componentes reutilizaveis, feedback e responsividade sao consumidos pela web MF7.
- `MF6`: hardening, cookies, bcrypt, ambiente, HTTPS, auditoria sensivel e disciplina de nao aceitar ownership do frontend foram revalidados por `test:mf6`.

### Contratos entregues

- `mf7:backup` e `mf7:backup:verify` como contrato operacional de backup/restauro, ainda pendente de prova positiva com ferramentas PostgreSQL.
- `RetentionHold`, politica/gate de retencao e acao sensivel `retention.delete.allowed`.
- Gates web/API MF7 para compatibilidade, modularidade backend/frontend e modulos criticos.
- Exportacoes CSV/XLSX/PDF e importacoes CSV/XLSX com logs/evidence.
- Readiness SAF-T MVP com rastreabilidade e limite honesto: nao substitui certificacao fiscal externa.
- Baseline tecnica para MF8, sobretudo logs estruturados, health-check, documentacao, subscricoes simuladas e estabilizacao final.

### Coerencia entre MFs

- `MF6 -> MF7`: `OK_COM_RISCOS`. Os gates MF6 passaram e os contratos de seguranca/auditoria continuam preservados. Os riscos remanescentes sao operacionais: ferramentas PostgreSQL e browsers alvo ausentes.
- `MF7 interna`: `OK_COM_RISCOS`. A sequencia `BK-MF7-01 -> BK-MF7-10` esta integrada; os dois BKs parciais sao parciais por evidence de ambiente, nao por ausencia de codigo estrutural.
- `MF7 -> MF8`: `OK_COM_RISCOS`. A MF8 pode consumir a baseline MF7, mas o fecho final deve exigir evidence real de backup/restauro, smoke manual browser e, quando aplicavel, BD persistente/smoke live.

### Findings ativos

| Finding | Severidade | BK/RNF | Estado | Impacto |
| --- | --- | --- | --- | --- |
| `MF7-IMP-AUD-20260630-BK01-F01` | `P1` | `BK-MF7-01` / `RNF18` | `BLOQUEADO_AMBIENTE` | Bloqueia `PASS` absoluto do backup/restauro ate existir evidence `restorable: true`. |
| `MF7-IMP-AUD-20260630-BK03-F01` | `P1` | `BK-MF7-03` / `RNF20` | `BLOQUEADO_AMBIENTE` | Bloqueia `PASS` absoluto da compatibilidade ate haver smoke real nos tres browsers alvo. |

### Findings por severidade

| Severidade | Quantidade ativa | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 2 | Dois blockers ambientais/operacionais: PostgreSQL tools e browsers alvo. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum P3 ativo; `P3-MF7-06-01` esta corrigido. |

### Pesquisa estatica obrigatoria

- Scan de risco em `real_dev/api` e `real_dev/web`: `PASS_COM_RUIDO_CONTROLADO`. Os matches encontrados eram defensivos/contextuais: listas de redacao de `secret/token/password`, tokens falsos em testes, comentarios de protecao, storage privado e scanner de `.env`. Nao foi confirmado segredo hardcoded, sessao/token/role em storage local, `dangerouslySetInnerHTML`, `eval`, `new Function`, `as any`, `payload: unknown`, CORS permissivo ou operacao Prisma global aplicavel ao escopo auditado.
- Scan de drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo): `PASS`, sem matches em `real_dev/api` e `real_dev/web`.
- Scan dirigido a `companyId`: `PASS_COM_OBSERVACAO`. A ocorrencia de `body.companyId` pertence ao fluxo legitimo `POST /api/session/company`; services financeiros e MF7 usam `req.companyId`/contexto backend, e testes MF7 cobrem companyId forjado em importacoes e services criticos.

### Comandos executados nesta consolidacao

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja tinha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` esta ignorado por `.gitignore:4`, esperado nesta PAP. |
| `command -v pg_dump` | `BLOQUEADO_AMBIENTE` | Exit code `1`; ferramenta ausente. |
| `command -v pg_restore` | `BLOQUEADO_AMBIENTE` | Exit code `1`; ferramenta ausente. |
| `DATABASE_URL= npm --prefix real_dev/api run mf7:backup` | `NEGATIVO_PASS` | Falhou corretamente com `DATABASE_URL em falta para executar backup`. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa_test OPSA_BACKUP_DIR=/private/tmp/opsa-mf7-backup-validation npm --prefix real_dev/api run mf7:backup` | `BLOQUEADO_AMBIENTE` | Falhou com `pg_dump nao arrancou`. |
| `npm --prefix real_dev/api run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou corretamente por falta de ficheiro. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/empty.dump npm --prefix real_dev/api run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou corretamente com ficheiro vazio. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/fake.dump npm --prefix real_dev/api run mf7:backup:verify` | `BLOQUEADO_AMBIENTE` | Falhou com `pg_restore nao arrancou`. |
| `command -v google-chrome`, `chromium`, `firefox`, `microsoft-edge` | `BLOQUEADO_AMBIENTE` | Nenhum browser alvo no `PATH`. |
| `find /Applications /Users/nuno/Applications ...` | `BLOQUEADO_AMBIENTE` | Apenas `Chromium Apps.localized`; sem app executavel alvo. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | 32 testes/gates MF7: retencao, email, exports, imports, SAF-T, backend modules e critical modules. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility gate, frontend modules, typecheck e Vite build passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram. |
| `npm --prefix real_dev/api run test:mf6` | `PASS` | Gates MF6 passaram; concorrencia em `mode: local-contract`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados explicitamente por falta de `TEST_DATABASE_URL`. |
| `rg` de risco em `real_dev/api real_dev/web` | `PASS_COM_RUIDO_CONTROLADO` | Matches defensivos/contextuais; sem finding novo. |
| `rg` de drift de dominio em `real_dev/api real_dev/web` | `PASS` | Sem matches. |
| `rg` dirigido a `companyId` | `PASS_COM_OBSERVACAO` | Fluxo legitimo de troca de empresa ativa; sem ownership arbitrario em services financeiros auditados. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por divida documental historica/preexistente. |
| `git diff --check` | `PASS` | Sem erros de whitespace antes desta atualizacao. |

### Validacoes nao executadas

- Fluxo feliz real `mf7:backup` + `mf7:backup:verify`: bloqueado por falta de `pg_dump` e `pg_restore`.
- Smoke manual em Chrome, Edge e Firefox: bloqueado por falta de browsers alvo neste ambiente.
- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado por falta de `TEST_DATABASE_URL` efemera/persistente configurada.
- Smokes HTTP live autenticados para exportacoes, importacoes e SAF-T com BD real: nao executados nesta auditoria consolidada; cobertura atual e por contratos, services, gates e build.
- Validacao oficial externa de SAF-T: nao executada e nao prometida pelo BK; fica como prova operacional/legal futura se o objetivo for conformidade fiscal plena.
- Instalacao de ferramentas PostgreSQL ou browsers: nao executada por falta de autorizacao explicita e por ser alteracao de ambiente fora do repositorio.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits nesta execucao de auditoria consolidada.

### Blockers e TODOs

- `BLOCKER_AMBIENTE`: disponibilizar `pg_dump` e `pg_restore` no ambiente de validacao, ou executar a prova de backup/restauro num ambiente com ferramentas PostgreSQL.
- `BLOCKER_AMBIENTE`: executar smoke manual em Chrome, Edge e Firefox e registar versoes/resultados em `real_dev/web/evidence/mf7-browser-compatibility.md`.
- `TODO_OPERACIONAL`: configurar `TEST_DATABASE_URL` efemera/persistente e correr `npm --prefix real_dev/api run test:integration` sem skip.
- `TODO_OPERACIONAL`: executar smokes live autenticados para downloads, importacoes e SAF-T quando houver BD real/controlada.
- `ADVISORY_DOCUMENTAL`: `validate-planificacao.sh` mantem `advisory_pass=false` por qualidade historica de guias; esta prompt nao permite corrigir documentos canonicos.

### Proxima acao recomendada

Preparar um ambiente de validacao com PostgreSQL client tools e Chrome/Edge/Firefox. Depois reexecutar apenas as provas pendentes de `BK-MF7-01` e `BK-MF7-03`; se ambas forem positivas, a MF7 pode passar de `PASS_COM_RISCOS` para `PASS` operacional sem novas alteracoes de codigo.

## Reauditoria atual - BK-MF7-10 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-10`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`, apenas para coerencia com `BK-MF7-09`.
- Relatorio fonte: `auto`; relatorios MF7 existentes confrontados com o codigo real atual.
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Relatorio de correcao consultado: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Permissao de codigo: sem alteracoes de codigo.
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.
- Commits: nao executados.

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-10]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, guia alvo `BK-MF7-10`, guia anterior `BK-MF7-09`, guia seguinte `BK-MF8-01` e relatorios MF7 existentes.
- Codigo real: `real_dev/api/package.json`, `real_dev/api/tests/contracts/mf7-critical-modules.test.js`, `real_dev/api/evidence/mf7-critical-modules.md`, `real_dev/api/src/modules/sales/saleDocumentService.js`, `real_dev/api/src/modules/tax/vatMapService.js`, `real_dev/api/src/modules/accounting-reports/accountingReportService.js`, `real_dev/api/src/modules/treasury/statementImportService.js`, `real_dev/api/scripts/check-mf7-backend-modules.mjs` e gates web MF7 para coerencia.

### Resultado geral

Estado geral do BK alvo: `PASS`

`BK-MF7-10` esta implementado e auditado no core de `RNF27`. A implementacao real contem uma suite `node:test` dedicada (`mf7-critical-modules.test.js`) que valida contratos minimos dos modulos criticos de faturacao, IVA, balancetes e reconciliacao. A suite confirma marcadores reais nos services, exige `companyId` como contexto backend e rejeita regressao para `req.body.companyId` ou `req.query.companyId` nos services criticos.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` nesta ronda. As ressalvas existentes sao operacionais: a suite de integracao sem skip depende de `TEST_DATABASE_URL`, nao foi executado smoke HTTP end-to-end com PostgreSQL real e dados contabilisticos seedados, e `validate-planificacao.sh` mantem `advisory_pass=false` por qualidade historica/preexistente de guias fora do scope desta auditoria. Nenhuma dessas ressalvas bloqueia `BK-MF7-10`.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-10` | `RNF27` | `OK` / `AUDITADO_OK` | `mf7-critical-modules.test.js` existe; `package.json` expoe `test:mf7:critical-modules` e inclui a suite no agregador `test:mf7`; prova positiva passou com 3 testes; tres negativos controlados falharam nos marcadores esperados; `test:mf7`, `test:contracts`, `test:unit`, `syntax:check`, `prisma:validate` e `npm --prefix real_dev/web run test:mf7` passaram. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-10` | `RNF27`; matriz/backlog MF7; guia `BK-MF7-10` | `real_dev/api/tests/contracts/mf7-critical-modules.test.js`; `real_dev/api/package.json`; `real_dev/api/evidence/mf7-critical-modules.md`; `real_dev/api/src/modules/sales/saleDocumentService.js`; `real_dev/api/src/modules/tax/vatMapService.js`; `real_dev/api/src/modules/accounting-reports/accountingReportService.js`; `real_dev/api/src/modules/treasury/statementImportService.js` | `node --check`; `test:mf7:critical-modules`; tres simulacoes negativas; `test:mf7`; `check:mf7:backend-modules`; `npm --prefix real_dev/web run test:mf7`; `syntax:check`; `prisma:validate`; `test:contracts`; `test:unit`; `test:integration` com skip explicito; scans estaticos; `validate-planificacao.sh`; `git diff --check`. |

### Implementacao encontrada

- `real_dev/api/tests/contracts/mf7-critical-modules.test.js` usa `node:test`, `assert` e leitura controlada dos services reais para validar contratos minimos de `RNF27`.
- A suite cobre quatro dominios criticos:
  - faturacao: `createSaleDocument`, `issueSaleDocument`, `assertOpenFiscalPeriod`, `totalCents`, `vatCents`, `auditLog.create`, `companyId`;
  - IVA: `buildVatMap`, `fromDate`, `toDate`, `liquidatedVatCents`, `deductibleVatCents`, `vatBalanceCents`, `companyId`;
  - balancetes: `buildTrialBalance`, `buildLedger`, `journalEntry`, `debitCents`, `creditCents`, `balanceCents`, `companyId`;
  - reconciliacao: `importBankStatement`, `deduplicateStatementRows`, `buildSuggestions`, `bankReconciliationSuggestion`, `recordIntegrationLog`, `companyId`.
- A suite rejeita marcadores obsoletos (`totalGrossCents`, `trialBalance`) para evitar regressao para nomes conceptuais que nao pertencem aos services reais.
- `applyNegativeSimulation` permite validar negativos por `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER`, sem alterar temporariamente ficheiros reais.
- `real_dev/api/package.json` expoe `test:mf7:critical-modules` e inclui esse gate no agregador `test:mf7`.
- `real_dev/api/evidence/mf7-critical-modules.md` regista prova positiva, negativos, multiempresa e handoff para `BK-MF8-01`.

### Contratos consumidos de MFs e BKs anteriores

- `MF1`: faturacao continua a calcular totais/IVA no backend, validar periodo fiscal aberto e registar auditoria.
- `MF2`: balancetes/razao continuam assentes em `journalEntry`, contas SNC e agregacoes por empresa.
- `MF3`: IVA e reconciliacao continuam ligados a mapas fiscais, extratos bancarios, sugestoes e logs de integracao.
- `MF6`: seguranca, contexto multiempresa e auditoria obrigatoria em operacoes sensiveis continuam preservados nos contratos criticos.
- `BK-MF7-08`: backend modular passa antes do contrato de regressao dos services criticos.
- `BK-MF7-09`: frontend modular passa e nao interfere com a decisao backend de ownership, empresa ativa, role ou permissao.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF8-01` recebe baseline automatizada para acrescentar logs estruturados sobre services criticos que continuam testaveis e previsiveis.
- `MF8` recebe uma cadeia de regressao rapida para confirmar que faturacao, IVA, balancetes e reconciliacao continuam presentes antes de estabilizacao final.
- O agregador `npm --prefix real_dev/api run test:mf7` passa a servir como gate de fecho tecnico da MF7 para os contratos automatizados atuais.

### Coerencia entre MFs e BKs vizinhos

- `MF6 -> MF7`: `OK`. A auditoria confirmou preservacao de contexto multiempresa, auditoria/logs sensiveis e separacao entre empresa ativa backend e input vindo do frontend.
- `BK-MF7-09 -> BK-MF7-10`: `OK`. O gate web MF7 passou, e o contrato critico backend passa isoladamente e dentro de `test:mf7`.
- `MF7 -> MF8`: `OK_COM_RISCOS`. `BK-MF8-01` existe e recebe handoff coerente para logs estruturados, mas smoke HTTP end-to-end com PostgreSQL real e dados contabilisticos seedados continua operacionalmente pendente.

### Findings atuais

Nao foram encontrados findings ativos para `BK-MF7-10` nesta ronda.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Pesquisa estatica obrigatoria

- Scan amplo de risco em `real_dev/api` e `real_dev/web`: `PASS_COM_RUIDO_CONTROLADO`. Os matches eram defensivos ou de teste, incluindo redacao de `secret/token/password`, tokens falsos em testes negativos, scanner de `.env`, adapters seguros e `OPSA_PRIVATE_STORAGE_ROOT`. Nao foi confirmado segredo hardcoded, sessao em `localStorage`/`sessionStorage`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `as any`, `payload: unknown`, operacao Prisma global aplicavel ao BK alvo ou CORS permissivo.
- Scan de drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo) em `real_dev/api` e `real_dev/web`: `PASS`, sem matches.
- Scan dirigido a `companyId` vindo de body/query: `PASS_COM_OBSERVACAO`. A ocorrencia real em `validateSwitchCompanyPayload` pertence ao fluxo legitimo de troca de empresa ativa; o teste `mf7-critical-modules.test.js` rejeita explicitamente `req.body.companyId` e `req.query.companyId` nos services criticos. Os restantes matches sao assinaturas/comentarios contextuais.
- `real_dev` esta ignorado por Git via `.gitignore:4:real_dev/`; isto e esperado nesta PAP e nao foi tratado como problema.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja tinha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` confirmado como root ignorado por Git. |
| `node --check real_dev/api/tests/contracts/mf7-critical-modules.test.js` | `PASS` | Sintaxe valida, sem output. |
| `npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS` | 3 testes passaram. |
| `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=faturacao:assertOpenFiscalPeriod npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS_NEGATIVO` | Falhou como esperado no marcador `assertOpenFiscalPeriod`. |
| `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=balancetes:buildTrialBalance npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS_NEGATIVO` | Falhou como esperado no marcador `buildTrialBalance`. |
| `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=reconciliacao:recordIntegrationLog npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS_NEGATIVO` | Falhou como esperado no marcador `recordIntegrationLog`. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, modularidade backend e modulos criticos passaram. |
| `npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS` | Output `MF7 backend modular: OK`. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility gate, modularidade frontend, `tsc --noEmit` e Vite build passaram. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados explicitamente por falta de BD persistente efemera. |
| `rg` de risco em `real_dev/api` e `real_dev/web` | `PASS_COM_RUIDO_CONTROLADO` | Matches defensivos/contextuais; sem finding para `BK-MF7-10`. |
| `rg` de drift de dominio em `real_dev/api` e `real_dev/web` | `PASS` | Sem matches. |
| `rg` dirigido a `companyId` vindo de body/query | `PASS_COM_OBSERVACAO` | Apenas fluxo legitimo de troca de empresa ativa, teste contratual e assinaturas/comentarios contextuais. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por qualidade historica/preexistente de guias fora do scope desta auditoria. |
| `git diff --check` | `PASS` | Sem erros de whitespace nas alteracoes tracked existentes. |

### Validacoes nao executadas

- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado por falta de `TEST_DATABASE_URL` efemera configurada.
- Smoke HTTP end-to-end dos modulos criticos contra PostgreSQL real: nao executado por falta de ambiente seedado para faturacao, IVA, balancetes e reconciliacao.
- Refactor de services, rotas ou testes: nao executado porque o modo e auditoria e o codigo atual satisfaz o contrato.

### Ficheiros auditados principais

- `real_dev/api/tests/contracts/mf7-critical-modules.test.js`
- `real_dev/api/package.json`
- `real_dev/api/evidence/mf7-critical-modules.md`
- `real_dev/api/src/modules/sales/saleDocumentService.js`
- `real_dev/api/src/modules/tax/vatMapService.js`
- `real_dev/api/src/modules/accounting-reports/accountingReportService.js`
- `real_dev/api/src/modules/treasury/statementImportService.js`
- `real_dev/api/scripts/check-mf7-backend-modules.mjs`
- `real_dev/web/scripts/check-mf7-frontend-modules.mjs`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- Nenhum blocker de codigo para `BK-MF7-10`.
- `TODO_OPERACIONAL`: quando existir BD efemera de CI para OPSA, correr `npm --prefix real_dev/api run test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- `TODO_OPERACIONAL`: quando existirem dados seedados de faturacao, IVA, balancetes e reconciliacao, correr smoke HTTP end-to-end dos modulos criticos contra PostgreSQL real.
- `ADVISORY_DOCUMENTAL`: `validate-planificacao.sh` mantem `advisory_pass=false` por qualidade historica/preexistente de guias; esta auditoria nao tem permissao para corrigir documentos canonicos.

### Proxima acao recomendada

Manter `BK-MF7-10` como `AUDITADO_OK`. A proxima acao tecnica natural e usar `npm --prefix real_dev/api run test:mf7` como gate de regressao de fecho da MF7 antes de iniciar/validar `BK-MF8-01`.

## Reauditoria atual - BK-MF7-09 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-09`
- Implementation root auditado: `real_dev`
- Frontend auditado: `real_dev/web`
- Backend auditado: `real_dev/api`, apenas para coerencia com `BK-MF7-08` e `BK-MF7-10`.
- Relatorio fonte: `auto`; relatorios MF7 existentes confrontados com o codigo real atual.
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Relatorio de correcao consultado: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Permissao de codigo: sem alteracoes de codigo.
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.
- Commits: nao executados.

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-09]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, guia alvo `BK-MF7-09`, guia anterior `BK-MF7-08`, guia seguinte `BK-MF7-10` e relatorios MF7 existentes.
- Codigo real: `real_dev/web/package.json`, `real_dev/web/scripts/check-mf7-frontend-modules.mjs`, `real_dev/web/evidence/mf7-frontend-modules.md`, `real_dev/web/src/App.tsx`, `real_dev/web/src/lib/apiClient.ts`, `real_dev/web/src/ui/opsaUi.tsx`, `real_dev/web/src/ui/ResponsiveDataTable.tsx`, `real_dev/web/src/ui/useActionFeedback.ts`, paginas MF1-MF4 consumidas pela shell web e gates MF7 de backend para coerencia.

### Resultado geral

Estado geral do BK alvo: `PASS`

`BK-MF7-09` esta implementado e auditado no core de `RNF26`. O frontend real tem um gate estatico dedicado (`check:mf7:frontend-modules`) que valida componentes reutilizaveis, cliente API central, envio de cookie de sessao por `credentials: "include"` em codigo executavel, paginas/rotas por dominio em `App.tsx` e namespaces/paths por dominio em `apiClient.ts`.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` nesta ronda. As ressalvas existentes sao operacionais e herdadas da MF7 global: testes de integracao sem skip dependem de `TEST_DATABASE_URL`, validacao live autenticada em browser nao foi executada, e alguns advisories documentais historicos mantem `advisory_pass=false` no validador de planificacao. Nenhuma dessas ressalvas bloqueia `BK-MF7-09`.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-09` | `RNF26` | `OK` / `AUDITADO_OK` | `check-mf7-frontend-modules.mjs` existe; `package.json` expoe `check:mf7:frontend-modules`; prova positiva devolveu `MF7 frontend modular: OK`; tres negativos controlados falharam com mensagens esperadas; `test:mf7` web, `test:mf7` API, `test:contracts`, `test:unit`, `syntax:check` e `prisma:validate` passaram. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-09` | `RNF26`; matriz/backlog MF7; guia `BK-MF7-09` | `real_dev/web/scripts/check-mf7-frontend-modules.mjs`; `real_dev/web/package.json`; `real_dev/web/evidence/mf7-frontend-modules.md`; `real_dev/web/src/App.tsx`; `real_dev/web/src/lib/apiClient.ts`; `real_dev/web/src/ui/opsaUi.tsx`; `real_dev/web/src/ui/ResponsiveDataTable.tsx`; `real_dev/web/src/ui/useActionFeedback.ts`; paginas web por dominio | `node --check`; `check:mf7:frontend-modules`; tres simulacoes negativas; `npm --prefix real_dev/web run test:mf7`; `check:mf7:backend-modules`; `test:mf7:critical-modules`; `npm --prefix real_dev/api run test:mf7`; `syntax:check`; `prisma:validate`; `test:contracts`; `test:unit`; `test:integration` com skip explicito; scans estaticos; `validate-planificacao.sh`; `git diff --check`. |

### Implementacao encontrada

- `real_dev/web/scripts/check-mf7-frontend-modules.mjs` define ficheiros obrigatorios para a camada UI (`opsaUi.tsx`, `ResponsiveDataTable.tsx`, `useActionFeedback.ts`) e para o cliente HTTP central (`apiClient.ts`).
- O gate valida que `App.tsx` usa `PageFrame` e `StatusMessage`, e que existem marcadores reais de paginas/rotas para `sales`, `purchases`, `inventory`, `treasury` e `accounting`.
- O gate valida que `apiClient.ts` centraliza os namespaces e paths dos mesmos dominios, incluindo `sales:`, `purchases:`, `inventory:`, `treasury:`, `accounting:`, `accountingReports:` e paths `/sales/`, `/purchases/`, `/inventory/`, `/treasury/`, `/accounting/`.
- O gate remove comentarios antes de verificar `credentials: "include"`, evitando falso positivo documental; a prova atual confirma o envio de cookies de sessao a partir do codigo executavel do cliente API.
- As variaveis `OPSA_MF7_FRONTEND_SIMULATE_NO_CREDENTIALS`, `OPSA_MF7_FRONTEND_SIMULATE_MISSING_APP_DOMAIN` e `OPSA_MF7_FRONTEND_SIMULATE_MISSING_API_DOMAIN` suportam negativos reproduziveis sem apagar nem alterar ficheiros reais.
- `real_dev/web/package.json` expoe `check:mf7:frontend-modules` e inclui esse gate no agregador `test:mf7`, juntamente com compatibilidade de browser, `tsc --noEmit` e `vite build`.
- `real_dev/web/evidence/mf7-frontend-modules.md` regista o comando positivo, os negativos esperados e a decisao de o frontend consumir empresa ativa por sessao/cookie, sem decidir ownership, role, permissao ou empresa de dominio financeiro.

### Contratos consumidos de MFs e BKs anteriores

- `MF0`: sessao autenticada, empresa ativa, roles e permissoes continuam resolvidas no backend.
- `MF1` a `MF4`: os dominios funcionais expostos no frontend (`sales`, `purchases`, `inventory`, `treasury`, `accounting` e reporting) ja existem como API real e paginas operacionais.
- `MF5`: componentes base reutilizaveis continuam a ser consumidos por `PageFrame`, `StatusMessage`, `ResponsiveDataTable` e `useActionFeedback`.
- `MF6`: o frontend preserva sessao por cookie via `credentials: "include"` e nao reintroduz storage local para credenciais.
- `BK-MF7-08`: o backend modular passa antes de validar a modularidade frontend.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF7-10` recebe frontend e cliente API organizados por dominio, com gate reutilizavel dentro de `npm --prefix real_dev/web run test:mf7`.
- `MF8` recebe baseline para alinhamento visual/operacional com componentes partilhados e cliente HTTP centralizado.
- A cadeia de regressao passa a poder validar UI e API markers separadamente, reduzindo falsos positivos quando uma pagina existe mas o namespace HTTP correspondente desaparece, ou o inverso.

### Coerencia entre MFs e BKs vizinhos

- `MF6 -> MF7`: `OK`. A auditoria confirmou `credentials: "include"` no cliente central e nao encontrou regressao para `localStorage`, `sessionStorage`, `eval`, `new Function` ou `dangerouslySetInnerHTML`.
- `BK-MF7-08 -> BK-MF7-09`: `OK`. O gate backend `check:mf7:backend-modules` passou, e o frontend consome dominios coerentes com a API modular.
- `BK-MF7-09 -> BK-MF7-10`: `OK`. `test:mf7:critical-modules` e `npm --prefix real_dev/api run test:mf7` passaram, mantendo os contratos criticos que dependem da organizacao modular.
- `MF7 -> MF8`: `OK_COM_RISCOS`. Nao ha blocker novo criado por `BK-MF7-09`; permanecem apenas riscos globais ja registados na MF7, como integracao sem BD efemera persistente, validacao live autenticada em browser e advisories documentais historicos.

### Findings atuais

Nao foram encontrados findings ativos para `BK-MF7-09` nesta ronda.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Pesquisa estatica obrigatoria

- Scan amplo de risco em `real_dev/api` e `real_dev/web`: `PASS_COM_RUIDO_CONTROLADO`. Os matches eram defensivos ou de teste, incluindo redacao de `secret/token/password`, tokens falsos em testes negativos, scanner de `.env`, comentarios de adapters seguros e `OPSA_PRIVATE_STORAGE_ROOT`. Nao foi confirmado segredo hardcoded, sessao em `localStorage`/`sessionStorage`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `as any`, `payload: unknown`, operacao Prisma global aplicavel ao BK alvo ou CORS permissivo.
- Scan de drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo) em `real_dev/api` e `real_dev/web`: `PASS`, sem matches.
- Scan dirigido a `companyId` vindo de body/query: `PASS_COM_OBSERVACAO`. A ocorrencia real em `validateSwitchCompanyPayload` pertence a `POST /api/session/company`, fluxo legitimo de troca de empresa ativa; o service valida membership ativa por `userId`, `companyId` e `isActive: true` antes de atualizar a sessao. Os services criticos continuam protegidos por teste contratual contra `req.body.companyId` e `req.query.companyId`.
- `real_dev` esta ignorado por Git via `.gitignore:4:real_dev/`; isto e esperado nesta PAP e nao foi tratado como problema.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` confirmado como root ignorado por Git. |
| `node --check real_dev/web/scripts/check-mf7-frontend-modules.mjs` | `PASS` | Sintaxe do gate valida. |
| `npm --prefix real_dev/web run check:mf7:frontend-modules` | `PASS` | Output `MF7 frontend modular: OK`. |
| `OPSA_MF7_FRONTEND_SIMULATE_NO_CREDENTIALS=true npm --prefix real_dev/web run check:mf7:frontend-modules` | `PASS_NEGATIVO` | Falhou como esperado com `Cliente API deve manter credentials: "include" para enviar o cookie de sessao`. |
| `OPSA_MF7_FRONTEND_SIMULATE_MISSING_APP_DOMAIN=purchases npm --prefix real_dev/web run check:mf7:frontend-modules` | `PASS_NEGATIVO` | Falhou como esperado com `Pagina ou rota frontend em falta para dominio: purchases`. |
| `OPSA_MF7_FRONTEND_SIMULATE_MISSING_API_DOMAIN=purchases npm --prefix real_dev/web run check:mf7:frontend-modules` | `PASS_NEGATIVO` | Falhou como esperado com `Cliente API em falta para dominio: purchases`. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility gate, modularidade frontend, `tsc --noEmit` e Vite build passaram. |
| `npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS` | Output `MF7 backend modular: OK`. |
| `npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS` | 3 testes passaram. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, modularidade backend e modulos criticos passaram. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados explicitamente por falta de BD persistente efemera. |
| `rg` de risco em `real_dev/api` e `real_dev/web` | `PASS_COM_RUIDO_CONTROLADO` | Matches defensivos/contextuais; sem finding para `BK-MF7-09`. |
| `rg` de drift de dominio em `real_dev/api` e `real_dev/web` | `PASS` | Sem matches. |
| `rg` dirigido a `companyId` vindo de body/query | `PASS_COM_OBSERVACAO` | Apenas fluxo legitimo de troca de empresa ativa, teste contratual e assinaturas contextuais. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por qualidade historica/preexistente de guias fora do scope desta auditoria. |

### Validacoes nao executadas

- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado por falta de `TEST_DATABASE_URL` efemera configurada.
- Smoke live autenticado em browser: nao executado nesta ronda, porque o contrato alvo e coberto por gate estatico, typecheck e build; deve ser acrescentado quando houver ambiente com sessao e dados seedados.
- Refactor de paginas, componentes ou cliente API: nao executado porque o modo e auditoria e o codigo atual satisfaz o contrato.

### Ficheiros auditados principais

- `real_dev/web/scripts/check-mf7-frontend-modules.mjs`
- `real_dev/web/package.json`
- `real_dev/web/evidence/mf7-frontend-modules.md`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/ui/opsaUi.tsx`
- `real_dev/web/src/ui/ResponsiveDataTable.tsx`
- `real_dev/web/src/ui/useActionFeedback.ts`
- `real_dev/web/src/pages/mf1Pages.tsx`
- `real_dev/web/src/pages/mf2Pages.tsx`
- `real_dev/web/src/pages/mf3Pages.tsx`
- `real_dev/web/src/pages/mf4Pages.tsx`
- `real_dev/api/scripts/check-mf7-backend-modules.mjs`
- `real_dev/api/tests/contracts/mf7-critical-modules.test.js`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- Nenhum blocker de codigo para `BK-MF7-09`.
- `TODO_OPERACIONAL`: quando existir BD efemera de CI para OPSA, correr `npm --prefix real_dev/api run test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- `TODO_OPERACIONAL`: quando existir sessao autenticada e seed operacional, correr smoke browser live para confirmar navegacao visual entre paginas por dominio.
- `ADVISORY_DOCUMENTAL`: `validate-planificacao.sh` mantem `advisory_pass=false` por qualidade historica/preexistente de guias; esta auditoria nao tem permissao para corrigir documentos canonicos.

### Proxima acao recomendada

Manter `BK-MF7-09` como `AUDITADO_OK`. A proxima acao tecnica natural e usar `npm --prefix real_dev/web run test:mf7` como gate de regressao antes de trabalho visual/operacional de `MF8`, e manter `npm --prefix real_dev/api run test:mf7` como garantia de coerencia com `BK-MF7-08` e `BK-MF7-10`.

## Reauditoria atual - BK-MF7-08 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-08`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`, apenas para coerencia com `BK-MF7-09`.
- Relatorio fonte: `auto`; relatorios MF7 existentes confrontados com o codigo real atual.
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Relatorio de correcao consultado: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Permissao de codigo: sem alteracoes de codigo.
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.
- Commits: nao executados.

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-08]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, guia alvo `BK-MF7-08`, guia anterior `BK-MF7-07`, guia seguinte `BK-MF7-09`, guia `BK-MF7-10` e relatorios MF7 existentes.
- Codigo real: `real_dev/api/package.json`, `real_dev/web/package.json`, `real_dev/api/scripts/check-mf7-backend-modules.mjs`, `real_dev/api/src/server.js`, routes/services dos dominios `sales`, `purchases`, `inventory`, `treasury`, `accounting`, `accounting-reports`, `tax`, `financial-statements`, `compliance`, `ai`, `real_dev/api/evidence/mf7-backend-modules.md`, `real_dev/web/scripts/check-mf7-frontend-modules.mjs`.

### Resultado geral

Estado geral do BK alvo: `PASS`

`BK-MF7-08` esta implementado e auditado no core de `RNF25`. O backend real tem um gate estatico dedicado (`check:mf7:backend-modules`) que valida os dominios principais com nomes reais da API, confirma pares route/service, confirma exports de service e protege a fronteira de `real_dev/api/src/server.js` para manter o servidor como ponto de montagem de routers, sem importar services, controllers, validators, middlewares ou contextos internos de dominio.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` nesta ronda. As ressalvas existentes sao operacionais e herdadas da MF7 global: testes de integracao sem skip dependem de `TEST_DATABASE_URL`, e alguns advisories documentais historicos mantem `advisory_pass=false` no validador de planificacao. Nenhuma dessas ressalvas bloqueia `BK-MF7-08`.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-08` | `RNF25` | `OK` / `AUDITADO_OK` | `check-mf7-backend-modules.mjs` existe; `package.json` expoe `check:mf7:backend-modules`; prova positiva devolveu `MF7 backend modular: OK`; tres negativos controlados falharam com mensagens esperadas; `test:mf7`, `test:contracts`, `test:unit`, `prisma:validate` e `npm --prefix real_dev/web run test:mf7` passaram. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-08` | `RNF25`; matriz/backlog MF7; guia `BK-MF7-08` | `real_dev/api/scripts/check-mf7-backend-modules.mjs`; `real_dev/api/package.json`; `real_dev/api/src/server.js`; `real_dev/api/evidence/mf7-backend-modules.md`; routes/services dos dominios `sales`, `purchases`, `inventory`, `treasury`, `accounting`, `accounting-reports`, `tax`, `financial-statements`, `compliance`, `ai` | `node --check`; `check:mf7:backend-modules`; tres simulacoes negativas; `syntax:check`; `test:mf7`; `test:contracts`; `test:unit`; `prisma:validate`; `test:integration` com skip explicito; `npm --prefix real_dev/web run test:mf7`; scans estaticos; `validate-planificacao.sh`; `git diff --check`. |

### Implementacao encontrada

- `real_dev/api/scripts/check-mf7-backend-modules.mjs` define `domainContracts` para vendas, compras, inventario, bancos/tesouraria, contabilidade, reporting contabilistico, mapas fiscais, demonstracoes financeiras, compliance fiscal e IA.
- O gate valida que cada route esperada existe e importa o service do mesmo dominio por caminho relativo, por exemplo `./saleDocumentService.js`, `./purchaseDocumentService.js`, `./stockMovementService.js`, `./statementImportService.js`, `./accountingReportService.js`, `./saftService.js` e `./aiService.js`.
- O gate valida que cada service exporta funcoes de service, evitando falsos positivos em ficheiros vazios ou apenas documentais.
- `assertServerBoundaries` confirma que `server.js` nao importa diretamente ficheiros internos de dominio com sufixos `Service`, `Controller`, `Validator`, `Middleware` ou `Context`.
- O mesmo gate exige que os route builders de cada dominio sejam importados e usados em `app.use`, usando a regra de pelo menos duas ocorrencias por builder.
- As variaveis `OPSA_MF7_SIMULATE_MISSING` e `OPSA_MF7_SIMULATE_FORBIDDEN_SERVER_IMPORT` suportam negativos reproduziveis sem apagar nem alterar ficheiros reais.
- `real_dev/api/src/server.js` monta route builders para os dominios principais e continua sem regra de negocio direta; os imports diretos de `transportSecurity` e `requestHardening` sao middlewares globais de seguranca, fora dos dominios de negocio validados pelo BK.
- `real_dev/api/package.json` expoe `check:mf7:backend-modules` e inclui esse gate no agregador `test:mf7`.
- `real_dev/api/evidence/mf7-backend-modules.md` regista o comando positivo e os tres negativos exigidos pelo guia.

### Contratos consumidos de MFs e BKs anteriores

- `MF0`: sessao autenticada, empresa ativa e roles/permissoes continuam resolvidas no backend.
- `MF1` e `MF2`: vendas, compras, inventario e contabilidade existem como dominios backend separados por routes/services reais.
- `MF3`: tesouraria, mapas fiscais, reporting e SAF-T MVP fornecem parte dos dominios validados pelo gate.
- `MF4`: IA, auditoria e logs de integracao continuam isolados em modulos proprios.
- `MF6`: hardening, contexto multiempresa e disciplina de nao aceitar ownership vindo do browser sao preservados.
- `BK-MF7-07`: o modulo `compliance`/SAF-T fica separado e montado por `buildSaftRoutes`, entrando no gate de modularidade.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF7-09` recebe uma API organizada por dominios, validada antes do gate de modularidade frontend.
- `BK-MF7-10` recebe um comando de qualidade reutilizavel dentro de `test:mf7`.
- `MF8` recebe baseline tecnica para logs estruturados e fecho de produto sobre services e routes previsiveis.

### Coerencia entre MFs e BKs vizinhos

- `MF6 -> MF7`: `OK`. A auditoria nao encontrou regressao em seguranca, sessao, empresa ativa, permissao ou separacao de responsabilidades backend.
- `BK-MF7-07 -> BK-MF7-08`: `OK`. `compliance/saftRoutes.js` e `compliance/saftService.js` existem, sao montados por `buildSaftRoutes` e fazem parte do gate.
- `BK-MF7-08 -> BK-MF7-09`: `OK`. O backend modular passa e o gate web MF7 tambem passou nesta ronda.
- `BK-MF7-08 -> BK-MF7-10`: `OK`. O agregador `test:mf7` inclui o gate backend e a suite de modulos criticos passa.
- `MF7 -> MF8`: `OK_COM_RISCOS`. Nao ha blocker novo criado por `BK-MF7-08`; permanecem apenas riscos globais ja registados na MF7, como integracao sem BD efemera persistente e advisories documentais historicos.

### Findings atuais

Nao foram encontrados findings ativos para `BK-MF7-08` nesta ronda.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Pesquisa estatica obrigatoria

- Scan amplo de risco em `real_dev/api` e `real_dev/web`: `PASS_COM_RUIDO_CONTROLADO`. Os matches eram defensivos ou de teste, incluindo redacao de `secret/token/password`, tokens falsos em testes negativos, scanner de `.env` e `OPSA_PRIVATE_STORAGE_ROOT`. Nao foi confirmado segredo hardcoded, sessao em `localStorage`/`sessionStorage`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `as any`, `payload: unknown`, operacao Prisma global aplicavel ao BK alvo ou CORS permissivo.
- Scan de drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo) em `real_dev/api` e `real_dev/web`: `PASS`, sem matches.
- Scan dirigido a `companyId` vindo de body/query: `PASS_COM_OBSERVACAO`. A ocorrencia real em `validateSwitchCompanyPayload` pertence a `POST /api/session/company`, fluxo legitimo de troca de empresa ativa; o service valida membership ativa por `userId`, `companyId` e `isActive: true` antes de atualizar a sessao. Nao e ownership arbitrario em fluxo de dominio financeiro.
- `real_dev` esta ignorado por Git via `.gitignore:4:real_dev/`; isto e esperado nesta PAP e nao foi tratado como problema.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja tinha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` confirmado como root ignorado por Git. |
| `node --check real_dev/api/scripts/check-mf7-backend-modules.mjs` | `PASS` | Sintaxe do gate valida. |
| `npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS` | Output `MF7 backend modular: OK`. |
| `OPSA_MF7_SIMULATE_MISSING=src/modules/ai/aiRoutes.js npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS_NEGATIVO` | Falhou como esperado com `Ficheiro obrigatorio em falta: src/modules/ai/aiRoutes.js`. |
| `OPSA_MF7_SIMULATE_FORBIDDEN_SERVER_IMPORT=sales/saleDocumentService.js npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS_NEGATIVO` | Falhou como esperado com `server.js importa ficheiros internos de dominio: from "./modules/sales/saleDocumentService.js"`. |
| `OPSA_MF7_SIMULATE_MISSING=src/modules/inventory/stockMovementService.js npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS_NEGATIVO` | Falhou como esperado com `Ficheiro obrigatorio em falta: src/modules/inventory/stockMovementService.js`. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, modularidade backend e modulos criticos passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados explicitamente por falta de BD persistente efemera. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility gate, modularidade frontend, `tsc --noEmit` e Vite build passaram. |
| `rg` de risco em `real_dev/api` e `real_dev/web` | `PASS_COM_RUIDO_CONTROLADO` | Matches defensivos/contextuais; sem finding para `BK-MF7-08`. |
| `rg` de drift de dominio em `real_dev/api` e `real_dev/web` | `PASS` | Sem matches. |
| `rg` dirigido a `companyId` vindo de body/query | `PASS_COM_OBSERVACAO` | Apenas fluxo legitimo de troca de empresa ativa e testes/assinaturas contextuais. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por qualidade historica/preexistente de guias fora do scope desta auditoria. |
| `git diff --check` | `PASS` | Sem erros de whitespace nas alteracoes tracked existentes. |

### Validacoes nao executadas

- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado por falta de `TEST_DATABASE_URL` efemera configurada.
- Smoke HTTP live especifico para `BK-MF7-08`: nao aplicavel nesta ronda, porque o BK entrega um gate estatico de manutencao e nao endpoints funcionais novos.
- Reorganizacao manual de modulos ou refactor de `server.js`: nao executado porque o modo e auditoria e o codigo atual ja satisfaz o contrato.

### Ficheiros auditados principais

- `real_dev/api/scripts/check-mf7-backend-modules.mjs`
- `real_dev/api/package.json`
- `real_dev/api/src/server.js`
- `real_dev/api/evidence/mf7-backend-modules.md`
- `real_dev/api/src/modules/sales/saleDocumentRoutes.js`
- `real_dev/api/src/modules/sales/saleDocumentService.js`
- `real_dev/api/src/modules/purchases/purchaseDocumentRoutes.js`
- `real_dev/api/src/modules/purchases/purchaseDocumentService.js`
- `real_dev/api/src/modules/inventory/*Routes.js`
- `real_dev/api/src/modules/inventory/*Service.js`
- `real_dev/api/src/modules/treasury/*Routes.js`
- `real_dev/api/src/modules/treasury/*Service.js`
- `real_dev/api/src/modules/accounting/*Routes.js`
- `real_dev/api/src/modules/accounting/*Service.js`
- `real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js`
- `real_dev/api/src/modules/accounting-reports/accountingReportService.js`
- `real_dev/api/src/modules/tax/vatMapRoutes.js`
- `real_dev/api/src/modules/tax/vatMapService.js`
- `real_dev/api/src/modules/financial-statements/financialStatementRoutes.js`
- `real_dev/api/src/modules/financial-statements/financialStatementService.js`
- `real_dev/api/src/modules/compliance/saftRoutes.js`
- `real_dev/api/src/modules/compliance/saftService.js`
- `real_dev/api/src/modules/ai/aiRoutes.js`
- `real_dev/api/src/modules/ai/aiService.js`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- Nenhum blocker de codigo para `BK-MF7-08`.
- `TODO_OPERACIONAL`: quando existir BD efemera de CI para OPSA, correr `npm --prefix real_dev/api run test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- `ADVISORY_DOCUMENTAL`: `validate-planificacao.sh` mantem `advisory_pass=false` por qualidade historica/preexistente de guias; esta auditoria nao tem permissao para corrigir documentos canonicos.

### Proxima acao recomendada

Manter `BK-MF7-08` como `AUDITADO_OK`. A proxima acao tecnica natural e usar `npm --prefix real_dev/api run test:mf7` como gate de regressao antes de qualquer trabalho de MF8 que dependa de modulos backend estaveis.

## Reauditoria atual - BK-MF7-07 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-07`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`, apenas para coerencia com o cliente MF3 que consome `/compliance/saft`.
- Relatorio fonte: `auto`; relatorios MF7 existentes confrontados com o codigo real atual.
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Relatorio de correcao consultado: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Permissao de codigo: sem alteracoes de codigo.
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.
- Commits: nao executados.

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-07]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, guia alvo `BK-MF7-07`, guia anterior `BK-MF7-06`, guia seguinte `BK-MF7-08`, guias relevantes `BK-MF3-06`, `BK-MF4-10`, `BK-MF6-10` e relatorios MF7 existentes.
- Codigo real: `real_dev/api/package.json`, `real_dev/web/package.json`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/src/modules/compliance/saftComplianceChecklist.js`, `real_dev/api/src/modules/compliance/saftService.js`, `real_dev/api/src/modules/compliance/saftRoutes.js`, `real_dev/api/src/modules/compliance/saftValidators.js`, `real_dev/api/src/modules/integrations/integrationLogService.js`, `real_dev/api/src/server.js`, `real_dev/api/tests/contracts/mf7-saft-contracts.test.js`, `real_dev/api/evidence/mf7-saft-readiness.md`, `real_dev/web/src/lib/apiClient.ts`, `real_dev/web/src/pages/mf3Pages.tsx`.

### Resultado geral

Estado geral do BK alvo: `PASS_COM_RISCOS`

`BK-MF7-07` esta funcionalmente implementado no core de `RNF24`, com base funcional em `RF36` e `RF48`: o endpoint `GET /api/compliance/saft` existe, mantem autenticacao, empresa ativa, permissao `COMPLIANCE_READ` e roles `ADMIN`/`CONTABILISTA`/`AUDITOR`; o service le `CompanyProfile`, documentos de venda, documentos de compra e lancamentos por `companyId` do backend; a checklist `assertSaftReadiness` bloqueia periodo invalido, perfil fiscal incompleto e periodo sem documentos/lancamentos antes de criar `SaftExportRun` e `IntegrationLog`.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` nesta ronda. O estado fica `PASS_COM_RISCOS` porque ainda nao foi executado smoke HTTP live com sessao real e base PostgreSQL persistente, a suite de integracao foi corrida com skip explicito de persistencia, e nao houve validacao oficial externa do XML SAF-T gerado. Esta ultima validacao e uma ressalva operacional/legal; o guia alvo explicita que o BK nao substitui certificacao fiscal nem promete validacao oficial externa.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-07` | `RNF24`; base `RF36` e `RF48` | `OK` / `AUDITADO_OK_COM_RISCOS_OPERACIONAIS` | `assertSaftReadiness` existe e e chamada antes de `saftExportRun.create`; rota protegida por sessao/empresa/permissao/role; `test:mf7:saft` passou com 5/5 testes; `test:mf7`, `test:contracts`, `test:unit`, `prisma:validate` e gate web MF7 passaram. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-07` | `RNF24`; `RF36`; `RF48`; matriz/backlog MF7; guia `BK-MF7-07` | `real_dev/api/src/modules/compliance/saftComplianceChecklist.js`; `real_dev/api/src/modules/compliance/saftService.js`; `real_dev/api/src/modules/compliance/saftRoutes.js`; `real_dev/api/src/modules/compliance/saftValidators.js`; `real_dev/api/src/modules/integrations/integrationLogService.js`; `real_dev/api/prisma/schema.prisma`; `real_dev/api/tests/contracts/mf7-saft-contracts.test.js`; `real_dev/api/evidence/mf7-saft-readiness.md`; `real_dev/web/src/lib/apiClient.ts`; `real_dev/web/src/pages/mf3Pages.tsx` | `syntax:check`; `test:mf7:saft`; `test:mf7`; `test:contracts`; `test:unit`; `prisma:validate`; `test:integration` com skip explicito; `npm --prefix real_dev/web run test:mf7`; scans estaticos; `git diff --check`. |

### Implementacao encontrada

- `real_dev/api/src/modules/compliance/saftComplianceChecklist.js` valida datas, perfil fiscal minimo (`legalName`, `nif`, `addressLine1`, `postalCode`, `city`, `currency`), contagens nao negativas e existencia de pelo menos uma linha fiscal antes de permitir a exportacao.
- `assertSaftReadiness` devolve `ready`, `checkedAt`, `totalRows` e periodo validado, e usa erros de dominio previsiveis: `INVALID_SAFT_RANGE`, `COMPANY_PROFILE_INCOMPLETE`, `EMPTY_SAFT_PERIOD` e `INVALID_SAFT_COUNTER`.
- `real_dev/api/src/modules/compliance/saftService.js` carrega dados por `input.companyId`, chama `assertSaftReadiness` antes de criar nome de ficheiro, XML, `SaftExportRun` e `IntegrationLog`, e devolve nota explicita de que o SAF-T e MVP rastreavel e nao substitui validacao legal oficial.
- `real_dev/api/src/modules/compliance/saftRoutes.js` expoe `GET /api/compliance/saft` atraves de `requireAuth`, `requireCompanyContext`, `requirePermission(Permission.COMPLIANCE_READ)` e `requireRole("ADMIN", "CONTABILISTA", "AUDITOR")`; o cliente envia apenas `from` e `to`, enquanto `companyId` e `userId` vêm de `req.companyId` e `req.user.id`.
- `real_dev/api/src/modules/integrations/integrationLogService.js` sanitiza `fileName`, limita `message` e redige termos sensiveis como `authorization`, `cookie`, `password`, `private_key`, `secret` e `token`; o XML completo nao e guardado em `IntegrationLog`.
- `real_dev/api/prisma/schema.prisma` contem `CompanyProfile`, `SaftExportRun` e `IntegrationLog`, com relacoes por empresa e indices compativeis com a rastreabilidade exigida.
- `real_dev/api/tests/contracts/mf7-saft-contracts.test.js` cobre caso positivo, periodo invertido, perfil sem NIF, periodo sem linhas e ligacao estatica do service a readiness, `saftExportRun.create` e `recordIntegrationLog`.
- `real_dev/api/evidence/mf7-saft-readiness.md` regista contrato, seguranca, comandos e limitações conhecidas.
- O frontend MF3 continua a consumir `/compliance/saft` pelo `apiClient`; esta auditoria nao exigia novo frontend para download porque o guia alvo coloca esse ponto em scope-out.

### Contratos consumidos de MFs anteriores

- `MF0`: sessao autenticada, roles/permissoes, empresa ativa e `CompanyProfile` continuam a ser resolvidos no backend.
- `MF3`: exportador SAF-T MVP, `SaftExportRun`, documentos e lancamentos contabilisticos reais continuam a ser a base funcional de `RF36`.
- `MF4`: `IntegrationLog` e `recordIntegrationLog` sao reutilizados para rastreabilidade operacional de SAF-T (`RF48`).
- `MF6`: hardening, contexto multiempresa e regra de nao aceitar empresa final vinda do browser sao preservados.
- `BK-MF7-06`: importacoes e logs operacionais continuam separados do endpoint SAF-T, mas podem alimentar dados e evidence operacional usados pelo readiness fiscal.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF7-08` recebe o dominio `compliance` com service/route separados e aptos a serem validados por gate modular backend.
- `BK-MF7-10` recebe um contrato SAF-T testavel por suite contratual e por marcadores criticos.
- `MF8` recebe um baseline fiscal rastreavel, mas ainda deve exigir smoke live com BD persistente e validacao externa quando o objetivo for conformidade fiscal operacional plena.

### Coerencia entre MFs e BKs vizinhos

- `MF6 -> MF7`: `OK`. A auditoria nao encontrou regressao em guards, permissao, empresa ativa, redacao de logs ou separacao entre decisao backend e input do browser.
- `BK-MF7-06 -> BK-MF7-07`: `OK`. Importacoes e SAF-T mantem responsabilidades separadas; o handoff e apenas de dados/evidence, nao de acoplamento entre endpoints.
- `BK-MF7-07 -> BK-MF7-08`: `OK`. SAF-T continua encapsulado no modulo `compliance`, compativel com o gate de modularidade backend.
- `MF7 -> MF8`: `OK_COM_RISCOS`. Nao ha blocker funcional novo; permanecem riscos operacionais globais de BD persistente, smoke live e validacao fiscal externa quando aplicavel.

### Findings atuais

Nao foram encontrados findings ativos para `BK-MF7-07` nesta ronda.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Pesquisa estatica obrigatoria

- Scan amplo de risco em `real_dev/api` e `real_dev/web`: `PASS_COM_RUIDO_CONTROLADO`. Os matches eram defensivos ou de teste, como listas de redacao de `secret/token/password`, tokens falsos em testes negativos, scanner de `.env` e `OPSA_PRIVATE_STORAGE_ROOT`; nenhum confirmou exposicao de segredo, sessao em `localStorage`/`sessionStorage`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `as any`, `payload: unknown`, operacoes Prisma globais aplicaveis ao BK alvo ou CORS permissivo.
- Scan de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo) em `real_dev/api` e `real_dev/web`: `PASS`, sem matches.
- Scan dirigido de `companyId` nos ficheiros SAF-T: `PASS_COM_OBSERVACOES`. O service usa `input.companyId` recebido da route autenticada; a route passa `req.companyId`; o frontend SAF-T nao envia `companyId` para escolher empresa ativa. A ocorrencia em `apiClient.ts` e de outro fluxo de selecao de empresa, fora do BK alvo.
- Scan dirigido a XML/logs: `PASS_COM_OBSERVACOES`. O XML e devolvido ao chamador do endpoint, mas `IntegrationLog` guarda apenas contagens, ficheiro e mensagem curta; os matches de `authorization/cookie/password/secret/token` sao termos proibidos da redacao.
- `real_dev` esta ignorado por Git via `.gitignore:4:real_dev/`; isto e esperado nesta PAP e nao foi tratado como problema.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Worktree ja tinha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` confirmado como root ignorado por Git. |
| `npm --prefix real_dev/api run test:mf7:saft` | `PASS` | 5 testes, 0 falhas. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, modularidade backend e modulos criticos passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes, 1 suite, 0 falhas. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes, 0 falhas. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados explicitamente por falta de DB dedicada nesta auditoria. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Gate browser, modularidade frontend, typecheck e build passaram. |
| `rg` de risco em `real_dev/api` e `real_dev/web` | `PASS_COM_RUIDO_CONTROLADO` | Matches defensivos/contextuais; sem finding para `BK-MF7-07`. |
| `rg` de drift de dominio em `real_dev/api` e `real_dev/web` | `PASS` | Sem matches. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por qualidade historica/preexistente de guias, incluindo avisos no guia alvo que esta auditoria nao pode corrigir por `PERMITIR_ALTERAR_DOCS=nao`. |
| `rg -n "[[:blank:]]$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md` | `PASS` | Sem trailing whitespace no relatorio tecnico atualizado. |
| `git diff --check` | `PASS` | Sem erros de whitespace nas alteracoes tracked existentes. |

### Validacoes nao executadas

- Smoke HTTP live de `GET /api/compliance/saft` com sessao real, permissao real e base PostgreSQL persistente: nao executado neste ambiente; a cobertura atual vem de testes contratuais, service/checklist direto e build frontend.
- `test:integration` sem skip: nao executado por falta de `TEST_DATABASE_URL` efemera configurada.
- Validacao oficial externa do ficheiro SAF-T PT gerado: nao executada; o guia alvo coloca certificacao/validacao legal oficial fora do scope tecnico deste BK.
- Aplicacao real de migrations numa BD PostgreSQL persistente: nao executada; foi validado o schema Prisma.

### Ficheiros auditados principais

- `real_dev/api/src/modules/compliance/saftComplianceChecklist.js`
- `real_dev/api/src/modules/compliance/saftService.js`
- `real_dev/api/src/modules/compliance/saftRoutes.js`
- `real_dev/api/src/modules/compliance/saftValidators.js`
- `real_dev/api/src/modules/integrations/integrationLogService.js`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/tests/contracts/mf7-saft-contracts.test.js`
- `real_dev/api/evidence/mf7-saft-readiness.md`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/mf3Pages.tsx`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- Nenhum blocker de codigo para o fluxo principal de `BK-MF7-07`.
- `TODO_OPERACIONAL`: executar smoke live SAF-T com empresa/perfil fiscal/dados contabilisticos controlados e sessao autenticada.
- `TODO_OPERACIONAL`: correr `test:integration` sem skip quando houver `TEST_DATABASE_URL` efemera.
- `TODO_OPERACIONAL`: validar o XML SAF-T numa ferramenta oficial/externa adequada antes de declarar conformidade fiscal operacional plena.
- `ADVISORY_DOCUMENTAL`: `validate-planificacao.sh` mantem `advisory_pass=false` por qualidade historica/preexistente de guias; esta auditoria nao tem permissao para corrigir documentos canonicos.

### Proxima acao recomendada

Manter `BK-MF7-07` como `AUDITADO_OK_COM_RISCOS_OPERACIONAIS`. A proxima acao tecnica natural e executar smoke HTTP live do endpoint SAF-T numa BD real/controlada, guardar evidence operacional e, se o objetivo for fecho fiscal pleno, submeter o XML gerado a validacao externa adequada.

## Reauditoria atual - BK-MF7-06 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-06`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`, apenas para coerencia MF3/MF7 e consumo existente do endpoint de importacoes.
- Relatorio fonte: `auto`; relatorios MF7 existentes confrontados com o codigo real atual.
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Relatorio de correcao consultado: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Permissao de codigo: auditoria original sem alteracoes; correcao posterior autorizou alteracao pequena em `real_dev/api`.
- Permissao documental: relatorios tecnicos de auditoria/correcao, sem alterar guias canonicos.
- Commits: nao executados.

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-06]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, guia alvo `BK-MF7-06`, guia anterior `BK-MF7-05`, guia seguinte `BK-MF7-07`, guias relevantes `BK-MF3-03`, `BK-MF3-05`, `BK-MF6-10` e relatorios MF7 existentes.
- Codigo real: `real_dev/api/package.json`, `real_dev/api/src/modules/imports/importFileParser.js`, `real_dev/api/src/modules/imports/businessImportValidators.js`, `real_dev/api/src/modules/imports/businessImportService.js`, `real_dev/api/src/modules/imports/businessImportRoutes.js`, `real_dev/api/src/modules/treasury/statementImportValidators.js`, `real_dev/api/src/modules/treasury/statementImportService.js`, `real_dev/api/src/modules/integrations/integrationLogService.js`, `real_dev/api/src/server.js`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/prisma/migrations/20260630120000_mf7_import_xlsx_format/migration.sql`, `real_dev/api/tests/contracts/mf7-import-contracts.test.js`, `real_dev/api/evidence/mf7-imports.md`, `real_dev/web/src/lib/apiClient.ts`, `real_dev/web/src/pages/mf3Pages.tsx`.

### Resultado geral

Estado geral do BK alvo: `PASS`

`BK-MF7-06` esta funcionalmente implementado e auditado no core de `RNF23`: a API aceita CSV e Excel, converte ficheiros para linhas normalizadas, aplica limite operacional de `5000` linhas, reaproveita validators de dominio para clientes/fornecedores/artigos/extratos, preserva empresa ativa no backend, cria `BusinessImportRun`, cria `AuditLog`, cria `IntegrationLog` sanitizado e tem suite contratual dedicada.

O finding `P3-MF7-06-01`, inicialmente aberto por drift de nomenclatura entre `INVALID_IMPORT_FILE_FORMAT` e `INVALID_IMPORT_FILE_TYPE`, foi corrigido numa execucao posterior de correcao. A implementacao e o teste contratual usam agora o codigo canonico documentado `INVALID_IMPORT_FILE_FORMAT`.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-06` | `RNF23` | `OK` / `AUDITADO_OK` | Parser CSV/XLSX, rota protegida, logs persistentes, migration `XLSX`, evidence propria, finding P3 corrigido e `test:mf7:imports` com 6/6 testes passaram. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-06` | `RNF23`; matriz/backlog MF7; guia `BK-MF7-06` | `real_dev/api/src/modules/imports/importFileParser.js`; `real_dev/api/src/modules/imports/businessImportValidators.js`; `real_dev/api/src/modules/imports/businessImportService.js`; `real_dev/api/src/modules/imports/businessImportRoutes.js`; `real_dev/api/src/modules/treasury/statementImportValidators.js`; `real_dev/api/src/modules/treasury/statementImportService.js`; `real_dev/api/src/modules/integrations/integrationLogService.js`; `real_dev/api/prisma/schema.prisma`; `real_dev/api/tests/contracts/mf7-import-contracts.test.js`; `real_dev/api/evidence/mf7-imports.md` | `npm --prefix real_dev/api run test:mf7:imports`; `syntax:check`; `prisma:validate`; prova direta de CSV vazio e conta inexistente; `npm --prefix real_dev/api run test:mf7`; `test:contracts`; `test:unit`; `test:integration` com skip explicito; `npm --prefix real_dev/web run test:mf7`; scans estaticos; `bash scripts/validate-planificacao.sh`. |

### Implementacao encontrada

- `real_dev/api/src/modules/imports/importFileParser.js` define `ImportSourceFormat` com `CSV` e `XLSX`, deteta formato por extensao `.csv`/`.xlsx`, parseia CSV separado por `;`, le Excel real com `exceljs`, preserva `__rowNumber` e aplica `MAX_IMPORT_ROWS = 5000`.
- O parser rejeita ficheiros sem cabecalho/linha util, extensoes invalidas, Excel sem conteudo base64 e importacoes acima do limite antes de gravar dados de negocio.
- `real_dev/api/src/modules/imports/businessImportValidators.js` limita tipos a `CUSTOMERS`, `SUPPLIERS`, `ITEMS` e `STATEMENTS`, normaliza payload, exige `content` para CSV e `contentBase64` para XLSX.
- `real_dev/api/src/modules/imports/businessImportService.js` chama o parser antes da transacao, reutiliza validators de cliente, fornecedor e artigo, encaminha extratos para os validators/servicos de tesouraria e grava o resumo persistente em `BusinessImportRun`.
- Para extratos, `treasuryAccount.findFirst` usa `id`, `companyId` e `isActive: true`, impedindo importacao para conta de outra empresa.
- O service cria `AuditLog` com `BUSINESS_DATA_IMPORTED` e chama `recordIntegrationLog` com `companyId`, `userId`, `operation`, `sourceId`, `fileName`, `totalRows`, `successRows`, `errorRows` e `message`.
- `real_dev/api/src/modules/integrations/integrationLogService.js` sanitiza `fileName`, limita a mensagem operacional e redige termos sensiveis como `authorization`, `cookie`, `password`, `private_key`, `secret` e `token`.
- `real_dev/api/src/modules/imports/businessImportRoutes.js` mantem `POST /api/imports/business-data` protegido por `requireAuth`, `requireCompanyContext`, `requirePermission(Permission.IMPORTS_WRITE)` e `requireRole("ADMIN", "CONTABILISTA")`, passando `req.companyId` e `req.user.id` para o service.
- `real_dev/api/prisma/schema.prisma` inclui `BankStatementFormat.XLSX`, `BusinessImportRun`, `BankStatementImport` e `IntegrationLog`; a migration `20260630120000_mf7_import_xlsx_format` acrescenta `XLSX` ao enum persistido.
- `real_dev/api/tests/contracts/mf7-import-contracts.test.js` cobre payload CSV/XLSX, formato invalido, limite de linhas, parsing Excel real, extratos XLSX parseados, `companyId` forjado ignorado, criacao de run/auditoria/log e migration do enum.
- `real_dev/api/evidence/mf7-imports.md` existe e regista contrato, entrega, seguranca, comandos e resultado observado.
- O frontend MF3 continua a chamar `/imports/business-data` e `/treasury/statements/import` pelo `apiClient` central; nesta auditoria, o frontend foi tratado como consumidor existente, nao como entrega principal do BK.

### Contratos consumidos de MFs anteriores

- `MF0`: sessao autenticada, empresa ativa, roles e permissoes continuam a ser resolvidas no backend.
- `MF3`: `BK-MF3-03` e `BK-MF3-05` entregam importacoes de extratos/dados de negocio; o BK atual reforca o fluxo existente em vez de criar endpoint paralelo.
- `MF4`: `IntegrationLog` e logs operacionais sao reutilizados com assinatura real do modelo, sem campo `details` inexistente.
- `MF6`: auditoria obrigatoria e redacao de dados sensiveis sao preservadas; a empresa ativa nao vem do body/query do browser.
- `BK-MF7-05`: a disciplina de formatos, evidence e testes negativos foi reaproveitada na fronteira inversa de importacao.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF7-07` recebe importacoes com logs de integracao, contagens e ficheiro curto, aproveitaveis para readiness fiscal e rastreabilidade antes de SAF-T.
- `BK-MF7-08` recebe um modulo de importacoes ainda montado por route builder e services separados por dominio.
- `MF8` recebe evidence tecnica e comandos repetiveis para validar interoperabilidade sem depender de promessas manuais.

### Coerencia entre MFs e BKs vizinhos

- `MF6 -> MF7`: `OK`. Guards, permissao, role, contexto multiempresa, auditoria e redacao de logs foram preservados.
- `BK-MF7-05 -> BK-MF7-06`: `OK`. Exportacoes e importacoes partilham disciplina de formatos/evidence sem misturar responsabilidades.
- `BK-MF7-06 -> BK-MF7-07`: `OK`. O handoff para SAF-T esta utilizavel e o erro de formato invalido ficou alinhado ao contrato canonico.
- `MF7 -> MF8`: `OK_COM_RISCOS`. Nao ha blocker funcional novo; permanecem riscos operacionais globais de BD persistente real e smokes live fora desta auditoria.

### Findings atuais

| ID | Severidade | BK/RF/RNF | Estado | Evidencia | Impacto | Correcao recomendada |
| --- | --- | --- | --- | --- | --- | --- |
| `P3-MF7-06-01` | `P3` | `BK-MF7-06` / `RNF23` | `CORRIGIDO` | Guia alvo espera `INVALID_IMPORT_FILE_FORMAT` para `clientes.txt`; `real_dev/api/src/modules/imports/importFileParser.js` e `mf7-import-contracts.test.js` usam agora `INVALID_IMPORT_FILE_FORMAT`. | Drift eliminado; formato invalido continua a falhar com HTTP 400 antes de escritas. | Sem acao adicional para este finding. |

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Finding de nomenclatura corrigido. |

### Pesquisa estatica obrigatoria

- Scan de risco em `real_dev/api/src`, `real_dev/api/tests`, `real_dev/api/scripts`, `real_dev/web/src` e `real_dev/web/scripts`: `PASS_COM_RUIDO_CONTROLADO`. Os matches eram contextuais/defensivos, como regex de detecao de segredos, tokens falsos em testes, comentarios de protecao, services que redigem `secret/token/password` e `OPSA_PRIVATE_STORAGE_ROOT`; nenhum confirmou logs de segredos, `localStorage`/`sessionStorage` para sessao, `as any`, `payload: unknown`, `dangerouslySetInnerHTML`, `eval`, CORS permissivo ou operacoes Prisma globais aplicaveis ao BK alvo.
- Scan de drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo) em `real_dev/api`, `real_dev/web` e evidence: `PASS`, sem matches.
- Scan estrutural de guias MF0-MF7: a primeira tentativa teve quoting incorreto em backticks e foi descartada; a segunda tentativa com quoting correto inventariou headers/contratos relevantes. A leitura decisiva ficou nos guias `BK-MF3-03`, `BK-MF3-05`, `BK-MF6-10`, `BK-MF7-05`, `BK-MF7-06` e `BK-MF7-07`.
- `real_dev` esta ignorado por Git via `.gitignore:4:real_dev/`; isto e esperado nesta PAP e nao foi tratado como problema.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Worktree ja tinha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` confirmado como root ignorado por Git. |
| `npm --prefix real_dev/api run test:mf7:imports` | `PASS` | 6 testes, 0 falhas. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `node --input-type=module -e "<CSV vazio e conta inexistente>"` | `PASS` | Confirmou `INVALID_IMPORT_CSV` e `TREASURY_ACCOUNT_NOT_FOUND`. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, modularidade backend e modulos criticos passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes, 1 suite, 0 falhas. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes, 0 falhas. |
| `rg -n "INVALID_IMPORT_FILE_TYPE" real_dev/api/src real_dev/api/tests real_dev/api/evidence` | `PASS` | Sem ocorrencias do codigo antigo no core auditado apos correcao. |
| `git diff --check` | `PASS` | Sem erros de whitespace. |
| `rg -n "[[:blank:]]$" ...` | `PASS` | Sem trailing whitespace nos ficheiros tocados nesta correcao. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes de persistencia saltados explicitamente por falta de DB dedicada nesta auditoria. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Gate browser, modularidade frontend, typecheck e build passaram. |
| `rg` de risco em `real_dev/api` e `real_dev/web` | `PASS_COM_RUIDO_CONTROLADO` | Matches contextuais/defensivos; sem finding de seguranca para `BK-MF7-06`. |
| `rg` de drift de dominio em `real_dev/api`, `real_dev/web` e evidence | `PASS` | Sem matches. |
| `rg` estrutural de guias MF0-MF7 | `PASS_APOS_REPETICAO` | Primeira tentativa teve quoting incorreto; repetida com quoting correto e usada apenas como inventario auxiliar. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por problemas documentais historicos/preexistentes de qualidade de guias, fora da permissao desta auditoria de implementacao. |

### Validacoes nao executadas

- Smoke HTTP real autenticado de importacao CSV/XLSX contra app viva e base de dados real: nao executado nesta sessao; a cobertura atual vem de testes de contrato, service/parser direto e build frontend.
- Testes de integracao com base de dados real sem skip: nao executados; a suite foi corrida com `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- Aplicacao real da migration numa BD PostgreSQL: nao executada; foi validado o schema e a migration que acrescenta `XLSX` ao enum.
- Smoke HTTP real autenticado apos correcao do `P3-MF7-06-01`: nao executado; a correcao foi validada por teste contratual automatizado e agregador MF7.

### Ficheiros auditados principais

- `real_dev/api/src/modules/imports/importFileParser.js`
- `real_dev/api/src/modules/imports/businessImportValidators.js`
- `real_dev/api/src/modules/imports/businessImportService.js`
- `real_dev/api/src/modules/imports/businessImportRoutes.js`
- `real_dev/api/src/modules/treasury/statementImportValidators.js`
- `real_dev/api/src/modules/treasury/statementImportService.js`
- `real_dev/api/src/modules/integrations/integrationLogService.js`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/prisma/migrations/20260630120000_mf7_import_xlsx_format/migration.sql`
- `real_dev/api/tests/contracts/mf7-import-contracts.test.js`
- `real_dev/api/evidence/mf7-imports.md`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/mf3Pages.tsx`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- `real_dev/api/src/modules/imports/importFileParser.js`
- `real_dev/api/tests/contracts/mf7-import-contracts.test.js`

Nao houve alteracoes em `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- Nenhum blocker de codigo para o fluxo principal de `BK-MF7-06`.
- `TODO_P3`: nenhum ativo; `P3-MF7-06-01` foi corrigido.
- `TODO_OPERACIONAL`: executar smoke live de importacao CSV/XLSX com sessao autenticada, empresa real e BD real antes do fecho global.
- `ADVISORY_DOCUMENTAL`: `validate-planificacao.sh` mantem `advisory_pass=false` por qualidade historica/preexistente de guias; esta auditoria nao tem permissao para corrigir documentos canonicos.

### Proxima acao recomendada

Manter `BK-MF7-06` como `AUDITADO_OK`. A proxima acao tecnica natural e executar smoke live quando houver ambiente com BD real.

## Reauditoria atual - BK-MF7-05 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-05`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`, apenas para validacao do consumo dos URLs de download e coerencia MF7.
- Relatorio fonte: `auto`; relatorios MF7 existentes confrontados com o codigo real atual.
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Relatorio de correcao consultado: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Permissao de codigo: sem alteracoes de codigo.
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.
- Commits: nao executados.

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-05]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, guia alvo `BK-MF7-05`, guia anterior `BK-MF7-04`, guia seguinte `BK-MF7-06`, guia base `BK-MF2-07` e relatorios MF7 existentes.
- Codigo real: `real_dev/api/package.json`, `real_dev/api/src/modules/exports/exportFormatService.js`, `real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js`, `real_dev/api/src/modules/accounting-reports/accountingReportExporters.js`, `real_dev/api/src/modules/accounting-reports/accountingReportService.js`, `real_dev/api/src/modules/accounting-reports/accountingReportFilters.js`, `real_dev/api/src/server.js`, `real_dev/api/tests/contracts/mf7-export-contracts.test.js`, `real_dev/api/evidence/mf7-export-formats.md`, `real_dev/web/package.json`, `real_dev/web/src/lib/apiClient.ts`, `real_dev/web/src/pages/mf2Pages.tsx`.

### Resultado geral

Estado geral do BK alvo: `PASS`

`BK-MF7-05` esta `AUDITADO_OK`. A implementacao real atual cumpre o contrato essencial de `RNF22` e o apoio funcional de `RF29`: os relatorios de balancete e razao podem ser descarregados em `csv`, `xlsx` e `pdf`, os novos endpoints usam os builders contabilisticos existentes, a empresa vem do contexto autenticado do backend, formatos invalidos sao rejeitados, valores perigosos para folhas de calculo sao neutralizados antes da exportacao tabular e o frontend constroi URLs de download sem aceitar `companyId` vindo do browser.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` para o BK alvo. As ressalvas desta ronda sao operacionais: nao foi feito smoke HTTP/browser contra aplicacao viva e base de dados real, e a suite de integracao foi corrida com skip explicito dos testes de persistencia.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-05` | `RNF22`; apoio funcional em `RF29` | `OK` / `AUDITADO_OK` | Endpoints `/trial-balance/export` e `/ledger/export`; formatos `csv`, `xlsx`, `pdf`; testes de contrato de exportacao passaram; evidence propria existe. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-05` | `RNF22`; `RF29`; matriz/backlog MF7; guia `BK-MF7-05` | `real_dev/api/src/modules/exports/exportFormatService.js`; `real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js`; `real_dev/api/src/modules/accounting-reports/accountingReportExporters.js`; `real_dev/api/src/modules/accounting-reports/accountingReportService.js`; `real_dev/api/src/modules/accounting-reports/accountingReportFilters.js`; `real_dev/api/tests/contracts/mf7-export-contracts.test.js`; `real_dev/api/evidence/mf7-export-formats.md`; `real_dev/web/src/lib/apiClient.ts`; `real_dev/web/src/pages/mf2Pages.tsx` | `npm --prefix real_dev/api run test:mf7:exports`; `syntax:check`; `prisma:validate`; teste direto dos 3 formatos via `buildTabularExport`; `npm --prefix real_dev/api run test:mf7`; `test:contracts`; `test:unit`; `test:integration` com skip explicito; `npm --prefix real_dev/web run test:mf7`; scans estaticos; `bash scripts/validate-planificacao.sh`. |

### Implementacao encontrada

- `real_dev/api/src/modules/exports/exportFormatService.js` define `ExportFormat` com `csv`, `xlsx` e `pdf`, normaliza formatos, rejeita formatos invalidos com `INVALID_EXPORT_FORMAT`, normaliza nomes de ficheiro e centraliza a geracao tabular em buffer.
- O mesmo service neutraliza celulas iniciadas por `=`, `+`, `-` ou `@`, reduzindo risco de formula injection em CSV/XLSX sem alterar os calculos de origem.
- `real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js` expoe `GET /trial-balance/export` e `GET /ledger/export` com `requireAuth`, `requireCompanyContext` e `requirePermission(Permission.ACCOUNTING_READ)`.
- Os endpoints de exportacao usam `req.companyId`, preservam filtros de periodo/conta pelos parsers existentes e nao aceitam empresa ativa a partir de query/body do browser.
- A geracao de dados reutiliza `buildTrialBalance` e `buildLedger`, mantendo a regra de dominio de `BK-MF2-07` e evitando recalculo paralelo para exportacao.
- Os endpoints legacy `/trial-balance.xlsx` e `/ledger.pdf` continuam expostos e preservados, reduzindo risco de regressao para consumidores existentes.
- `real_dev/api/src/modules/accounting-reports/accountingReportService.js` filtra dados por `companyId`; em `buildLedger`, a conta e as linhas contabilisticas tambem ficam restritas a empresa ativa.
- `real_dev/api/tests/contracts/mf7-export-contracts.test.js` cobre exposicao dos endpoints novos/legacy, rejeicao de formato invalido, CSV com neutralizacao de formula e filename seguro, alem de headers e uso da empresa da sessao no balancete CSV.
- `real_dev/api/evidence/mf7-export-formats.md` documenta contrato, seguranca, comandos e resultados da implementacao de exportacoes.
- `real_dev/web/src/lib/apiClient.ts` declara `AccountingExportFormat = "csv" | "xlsx" | "pdf"` e constroi URLs de exportacao com o cliente central e `credentials: "include"`.
- `real_dev/web/src/pages/mf2Pages.tsx` disponibiliza links de download para os formatos suportados; no relatorio de razao, os links so sao disponibilizados quando existe `accountId`.

### Contratos consumidos de MFs anteriores

- `MF2`: `RF29` e os builders `buildTrialBalance`/`buildLedger` continuam a ser a fonte canonica dos dados de balancete e razao; a exportacao nao cria calculos paralelos.
- `MF6`: autenticacao, contexto de empresa, permissao contabilistica e disciplina de nao confiar em `companyId` vindo do browser foram preservados.
- `BK-MF7-04`: a fronteira de email/adapter transaccional nao interfere com exportacoes e nao introduz dependencia operacional nos downloads.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF7-06` recebe um padrao de formats/headers/evidence/testes negativos que pode ser reutilizado sem alterar o contrato de importacao.
- `BK-MF7-07` e `MF8` recebem exportacoes essenciais auditadas, com nomes de ficheiro previsiveis, content types explicitos e logs/operacao sem exposicao de dados sensiveis pelo proprio mecanismo de download.

### Coerencia entre MFs e BKs vizinhos

- `MF6 -> MF7`: `OK`. Os endpoints continuam protegidos por auth, contexto de empresa e permissao contabilistica; nao ha armazenamento local de sessao ou credenciais no frontend auditado.
- `BK-MF7-04 -> BK-MF7-05`: `OK`. Exportacoes e email transaccional sao fronteiras independentes; nao foram encontrados acoplamentos indevidos.
- `BK-MF7-05 -> BK-MF7-06`: `OK`. O contrato de exportacao nao altera Prisma nem o pipeline de importacao XLSX; a migration existente pertence ao BK seguinte.
- `MF7 -> MF8`: `OK`. As exportacoes estao cobertas por testes e evidence tecnica suficientes para alimentar a fase final de readiness, mantendo como risco apenas o smoke live de downloads.

### Findings atuais

Nao foram encontrados findings ativos para `BK-MF7-05` nesta ronda.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Pesquisa estatica obrigatoria

- Scan de risco em `real_dev/api/src`, `real_dev/api/tests`, `real_dev/api/scripts`, `real_dev/web/src` e `real_dev/web/scripts`: `PASS_COM_RUIDO_CONTROLADO`. Os matches eram contextuais/defensivos, como tokens falsos em testes, listas de redaccao, comentarios de seguranca e `OPSA_PRIVATE_STORAGE_ROOT`; nenhum confirmou logs de segredos, `localStorage`/`sessionStorage` para sessao, `as any`, `payload: unknown`, `dangerouslySetInnerHTML`, `eval`, CORS permissivo ou operacoes Prisma globais aplicaveis ao BK alvo.
- Scan de drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo) em `real_dev/api`, `real_dev/web` e evidence: `PASS`, sem matches.
- `real_dev` esta ignorado por Git via `.gitignore:4:real_dev/`; isto e esperado nesta PAP e nao foi tratado como problema.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Worktree ja tinha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` confirmado como root ignorado por Git. |
| `npm --prefix real_dev/api run test:mf7:exports` | `PASS` | 4 testes, 1 suite, 0 falhas. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://user:password@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `node --input-type=module -e "<buildTabularExport csv/xlsx/pdf>"` | `PASS` | Geracao direta de buffers `csv`, `xlsx` e `pdf` com filename seguro e conteudo nao vazio. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, modularidade backend e modulos criticos passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes, 1 suite, 0 falhas. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes, 0 falhas. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes de persistencia saltados explicitamente por falta de DB dedicada nesta auditoria. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Gate browser, modularidade frontend, typecheck e build passaram. |
| `rg` de risco em `real_dev/api` e `real_dev/web` | `PASS_COM_RUIDO_CONTROLADO` | Matches contextuais/defensivos; sem finding para `BK-MF7-05`. |
| `rg` de drift de dominio em `real_dev/api`, `real_dev/web` e evidence | `PASS` | Sem matches. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por problemas documentais historicos/preexistentes de qualidade de guias, fora da permissao desta auditoria de implementacao. |

### Validacoes nao executadas

- Smoke HTTP/browser real de downloads contra app viva e base de dados real: nao executado nesta sessao; a cobertura atual e por testes de contrato, build frontend e geracao direta de buffers.
- Testes de integracao com base de dados real sem skip: nao executados; a suite foi corrida com `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- Aplicacao de migrations: nao aplicavel ao `BK-MF7-05`, porque este BK nao altera Prisma; a migration encontrada em MF7 pertence ao trabalho de importacao XLSX do `BK-MF7-06`.

### Ficheiros auditados principais

- `real_dev/api/src/modules/exports/exportFormatService.js`
- `real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js`
- `real_dev/api/src/modules/accounting-reports/accountingReportExporters.js`
- `real_dev/api/src/modules/accounting-reports/accountingReportService.js`
- `real_dev/api/src/modules/accounting-reports/accountingReportFilters.js`
- `real_dev/api/tests/contracts/mf7-export-contracts.test.js`
- `real_dev/api/evidence/mf7-export-formats.md`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/mf2Pages.tsx`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- Nenhum blocker ativo de codigo para `BK-MF7-05`.
- `TODO_OPERACIONAL`: executar smoke live de downloads `csv`, `xlsx` e `pdf` em balancete e razao com sessao autenticada, empresa real e dados contabilisticos reais antes do fecho global.
- `ADVISORY_DOCUMENTAL`: `validate-planificacao.sh` mantem `advisory_pass=false` por qualidade historica/preexistente de guias, incluindo entradas MF7; esta auditoria nao tem permissao para corrigir documentos canonicos.

### Proxima acao recomendada

Manter `BK-MF7-05` como `AUDITADO_OK`. A proxima acao tecnica natural e executar o smoke live quando houver ambiente com dados reais, ou seguir para a auditoria do `BK-MF7-06` mantendo a separacao entre exportacoes e importacoes.

## Reauditoria atual - BK-MF7-04 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-04`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`, apenas para coerencia vizinha com `BK-MF7-03`.
- Relatorio fonte: `auto`; relatorios MF7 existentes confrontados com o codigo real atual.
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Relatorio de correcao consultado: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Permissao de codigo: sem alteracoes de codigo.
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.
- Commits: nao executados.

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-04]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, guias MF7, guia alvo `BK-MF7-04`, guia anterior `BK-MF7-03`, guia seguinte `BK-MF7-05` e relatorios MF7 existentes.
- Codigo real: `real_dev/api/package.json`, `real_dev/api/src/modules/notifications/transactionalEmailAdapter.js`, `real_dev/api/src/modules/auth/passwordResetEmailAdapter.js`, `real_dev/api/src/modules/auth/passwordResetService.js`, `real_dev/api/src/modules/notifications/notificationService.js`, `real_dev/api/tests/contracts/mf7-email-contracts.test.js`, `real_dev/api/evidence/mf7-email-integration.md`, `real_dev/api/prisma/schema.prisma`, `real_dev/web/package.json`.

### Resultado geral

Estado geral do BK alvo: `PASS`

`BK-MF7-04` esta `AUDITADO_OK`. A implementacao real atual cumpre o contrato essencial de `RNF21`: existe adapter transaccional comum para email, motivos permitidos fechados (`PASSWORD_RESET`, `SMART_ALERT`, `PAYMENT_REMINDER`), validacao de destinatario/motivo/assunto/texto antes de qualquer provider, fallback seguro quando nao ha provider comercial configurado, logs tecnicos com apenas evento/motivo/dominio do destinatario, recuperacao de password preservada via `sendPasswordReset`, suporte a alertas/lembretes por `sendNotificationEmails` e testes de contrato dedicados.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` para o BK alvo. A ausencia de provider comercial real nao e finding porque o guia `BK-MF7-04` coloca a escolha/configuracao de fornecedor em `Scope-out` e pede uma fronteira tecnica pequena, testavel e nao acoplada a SMTP/API externa.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-04` | `RNF21`; apoio funcional em `RF05` e `RF46` | `OK` / `AUDITADO_OK` | Adapter transaccional, adapter de password reset, envio de notificacoes por email, evidence propria e 5 testes de contrato passaram. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-04` | `RNF21`; `RF05`; `RF46`; matriz/backlog MF7; guia `BK-MF7-04` | `real_dev/api/src/modules/notifications/transactionalEmailAdapter.js`; `real_dev/api/src/modules/auth/passwordResetEmailAdapter.js`; `real_dev/api/src/modules/auth/passwordResetService.js`; `real_dev/api/src/modules/notifications/notificationService.js`; `real_dev/api/tests/contracts/mf7-email-contracts.test.js`; `real_dev/api/evidence/mf7-email-integration.md`; `real_dev/api/package.json`; `real_dev/api/prisma/schema.prisma` | `npm --prefix real_dev/api run test:mf7:email`; `npm --prefix real_dev/api run test:mf7`; `npm --prefix real_dev/api run test:contracts`; `npm --prefix real_dev/api run test:unit`; `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration`; `syntax:check`; `prisma:validate`; scans estaticos; `npm --prefix real_dev/web run test:mf7` para coerencia vizinha. |

### Implementacao encontrada

- `real_dev/api/src/modules/notifications/transactionalEmailAdapter.js` define `TransactionalEmailReason`, `getEmailDomain`, `validateTransactionalEmailMessage` e `buildTransactionalEmailAdapter`.
- O adapter rejeita mensagem invalida, destinatario sem dominio, motivo fora do contrato, assunto curto e texto curto antes de chamar provider externo.
- Quando existe provider, o provider recebe a mensagem validada e o log interno guarda apenas `event`, `reason` e `emailDomain`.
- Quando nao existe provider, o adapter devolve `QUEUED_FOR_PROVIDER` e mantem logs sem endereco completo, token, link privado ou conteudo financeiro.
- `real_dev/api/src/modules/auth/passwordResetEmailAdapter.js` preserva a assinatura publica `sendPasswordReset({ email, token })`, constroi a URL privada apenas para o corpo da mensagem e passa o envio pelo adapter transaccional comum.
- `real_dev/api/src/modules/auth/passwordResetService.js` continua a gerar token bruto, persistir apenas hash SHA-256 com validade curta, responder de forma generica contra enumeracao e chamar `emailAdapter.sendPasswordReset({ email: user.email, token })`.
- `real_dev/api/src/modules/notifications/notificationService.js` preserva notificacoes in-app e acrescenta `sendNotificationEmails(emailAdapter, notifications)` para mensagens ja autorizadas pelo backend, mapeando `SMART_ALERT` para `SMART_ALERT` e restantes lembretes para `PAYMENT_REMINDER`.
- `real_dev/api/tests/contracts/mf7-email-contracts.test.js` cobre provider ausente, motivo invalido, destinatario invalido antes de provider, segredo/link de recuperacao fora de logs e envio de alertas/lembretes pelo adapter comum.
- `real_dev/api/evidence/mf7-email-integration.md` regista contrato, comandos, fluxo principal, negativos e output resumido da suite especifica.

### Contratos consumidos de MFs anteriores

- `MF0`: recuperacao de password por email (`RF05`) continua a usar token bruto apenas para envio ao destinatario, hash persistido no backend e resposta generica contra enumeracao.
- `MF4`: alertas inteligentes, lembretes e notificacoes in-app (`RF46`) continuam a nascer no backend; o envio por email recebe notificacoes ja selecionadas/autorizadas.
- `MF6`: hardening, redacao de segredos e disciplina de logs sensiveis sao preservados; os scans nao encontraram token/password/email completo em logs de runtime do BK.
- `BK-MF7-03`: o frontend continua a compilar e o gate MF7 web passa, mas a evidence de smoke manual em Chrome/Edge/Firefox permanece um risco operacional do BK anterior, nao um finding de email.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF7-05` recebe um padrao MF7 de scripts, evidence, negativos reproduziveis e contrato de adapter sem depender de provider externo.
- `BK-MF7-06` e `BK-MF7-07` podem seguir a disciplina de logs/evidence sem expor payloads sensiveis.
- `MF8` recebe um contrato claro para logs estruturados de eventos transaccionais sem segredos, util para auditoria final e readiness.

### Coerencia entre MFs e BKs vizinhos

- `MF6 -> MF7`: `OK`. A disciplina de bcrypt/cookies/env/auditoria/redacao de dados sensiveis nao foi enfraquecida.
- `BK-MF7-03 -> BK-MF7-04`: `OK_COM_RISCOS`. O BK de email esta testado; a unica ressalva vem de `BK-MF7-03`, onde falta smoke manual real em Chrome, Edge e Firefox.
- `BK-MF7-04 -> BK-MF7-05`: `OK`. O contrato de email nao interfere com exportacoes e nao introduz provider externo nem dependencia operacional nova.
- `MF7 -> MF8`: `OK`. Os eventos de email ficam prontos para serem considerados na normalizacao de logs/operacao final, sem prometer integracao comercial real.

### Findings atuais

Nao foram encontrados findings ativos para `BK-MF7-04` nesta ronda.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Pesquisa estatica obrigatoria

- Scan de risco em `real_dev/api/src`, `real_dev/api/tests`, `real_dev/api/scripts`, `real_dev/web/src` e `real_dev/web/scripts`: `PASS_COM_RUIDO_CONTROLADO`. Os matches de `password`, `token`, `secret` e `OPSA_PRIVATE_STORAGE_ROOT` eram testes negativos, comentarios de protecao, listas defensivas de redacao ou adapters que evitam expor segredos; nenhum confirmou logs sensiveis, storage local de sessao, `as any`, `payload: unknown`, `dangerouslySetInnerHTML`, `eval`, raw query insegura, CORS permissivo ou operacoes Prisma globais aplicaveis ao BK alvo.
- Scan de drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo) em `real_dev/api`, `real_dev/web` e evidence: `PASS`, sem matches.
- `real_dev` esta ignorado por Git via `.gitignore:4:real_dev/`; isto e esperado nesta PAP e nao foi tratado como problema.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Worktree ja tinha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` confirmado como root ignorado por Git. |
| `npm --prefix real_dev/api run test:mf7:email` | `PASS` | 5 testes, 1 suite, 0 falhas. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://user:password@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, modularidade backend e modulos criticos passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes, 1 suite, 0 falhas. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes, 0 falhas. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes de persistencia saltados explicitamente por falta de DB dedicada nesta auditoria. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Gate browser, modularidade frontend, typecheck e build passaram para coerencia vizinha. |
| `rg` de risco em `real_dev/api` e `real_dev/web` | `PASS_COM_RUIDO_CONTROLADO` | Matches contextuais/defensivos; sem finding para `BK-MF7-04`. |
| `rg` de drift de dominio em `real_dev/api`, `real_dev/web` e evidence | `PASS` | Sem matches. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por problemas documentais historicos/preexistentes de qualidade de guias, fora da permissao desta auditoria de implementacao. |

### Validacoes nao executadas

- Envio real por provider comercial de email: nao executado porque `RNF21` nao canoniza fornecedor e o guia coloca configuracao/compra de provider em `Scope-out`.
- Testes de integracao com base de dados real sem skip: nao executados; `BK-MF7-04` nao altera Prisma nem persistencia e a suite de persistencia foi executada com `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- Smoke manual em Chrome/Edge/Firefox: nao executado nesta reauditoria por pertencer ao `BK-MF7-03`; o agregador web MF7 passou como coerencia automatica.

### Ficheiros auditados principais

- `real_dev/api/src/modules/notifications/transactionalEmailAdapter.js`
- `real_dev/api/src/modules/auth/passwordResetEmailAdapter.js`
- `real_dev/api/src/modules/auth/passwordResetService.js`
- `real_dev/api/src/modules/notifications/notificationService.js`
- `real_dev/api/tests/contracts/mf7-email-contracts.test.js`
- `real_dev/api/evidence/mf7-email-integration.md`
- `real_dev/api/package.json`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/web/package.json`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- Nenhum blocker ativo para `BK-MF7-04`.
- `TODO_OPERACIONAL`: quando houver decisao real de fornecedor de email, ligar o provider atras de `buildTransactionalEmailAdapter` sem alterar os services de dominio.
- `RISCO_VIZINHO`: `BK-MF7-03` continua a precisar de smoke manual em Chrome, Edge e Firefox para fechar `RNF20` sem ressalvas.
- `ADVISORY_DOCUMENTAL`: `validate-planificacao.sh` mantem `advisory_pass=false` por qualidade historica de guias, incluindo entradas MF7; esta auditoria nao tem permissao para corrigir documentos canonicos.

### Proxima acao recomendada

Manter `BK-MF7-04` como `AUDITADO_OK` e avancar para o fecho operacional do risco vizinho de `BK-MF7-03` ou para a auditoria/correcao do proximo BK alvo. So ligar provider real de email quando houver decisao canonica ou operacional sobre fornecedor, credenciais e ambiente.

## Reauditoria atual - BK-MF7-03 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-03`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`, apenas para coerencia MF7 e contratos vizinhos.
- Frontend auditado: `real_dev/web`, foco principal deste BK.
- Relatorio fonte: `auto`; relatorios anteriores de implementacao, auditoria e correcao MF7 confrontados com o codigo real atual.
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Relatorio de correcao consultado: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Permissao de codigo: sem alteracoes de codigo
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Commits: nao executados

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-03]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, todos os guias `docs/planificacao/guias-bk/MF7/`, leitura dirigida de `BK-MF6-10`, `BK-MF7-02`, `BK-MF7-03`, `BK-MF7-04` e guias iniciais de MF8 para coerencia vizinha.
- Relatorios MF7 existentes: `IMPLEMENTACAO-REAL_DEV-MF7.md`, `AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md` e `CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`.
- Codigo real: `real_dev/web/package.json`, `real_dev/web/scripts/check-mf7-browser-compatibility.mjs`, `real_dev/web/evidence/mf7-browser-compatibility.md`, `real_dev/web/src/App.tsx`, `real_dev/web/src/styles.css`, `real_dev/web/src/ui/opsaUi.tsx`, `real_dev/web/src/ui/ResponsiveDataTable.tsx`, `real_dev/web/src/lib/apiClient.ts`, `real_dev/api/package.json` e agregador MF7 da API para coerencia.

### Resultado geral

Estado geral: `PASS_COM_RISCOS`

`BK-MF7-03` esta tecnicamente implementado e auditado com sucesso na camada automatizavel: o frontend real tem script `test:mf7:browser-compatibility`, agregador `test:mf7`, gate contra ramos especificos por browser, evidence propria, cliente HTTP com `credentials: "include"`, foco visivel por teclado, media query responsiva e tabela `ResponsiveDataTable` herdada de MF5. As validacoes automaticas relevantes passaram: gate de compatibilidade, modularidade frontend, typecheck, build, syntax/prisma/API MF7 de coerencia e scans estaticos.

O BK nao pode ser marcado como `PASS` absoluto nem `OK` fechado porque o proprio requisito `RNF20` e o guia `BK-MF7-03` pedem smoke manual em Chrome, Edge e Firefox com versoes e resultado observado. A evidence atual ainda regista esses tres browsers como `BLOQUEADO_AMBIENTE`, e esta sessao nao encontrou executaveis `google-chrome`, `chromium`, `firefox` ou `microsoft-edge` no `PATH`, nem apps Chrome/Edge/Firefox em `/Applications`. A pasta `~/Applications/Chromium Apps.localized` existe, mas contem apenas metadados/localizacao e nao um browser executavel para smoke.

Nao ha findings `P0`. O unico finding ativo e operacional/ambiental e bloqueia apenas o fecho total de `BK-MF7-03`, nao os gates de codigo.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-03` | `RNF20` | `PARCIAL` / `AUDITADO_COM_FINDINGS` | `test:mf7:browser-compatibility`, `test:mf7`, `typecheck` e `build` passaram; falta smoke manual em Chrome, Edge e Firefox com versoes e resultados observados. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-03` | `RNF20`; matriz/backlog MF7; guia `BK-MF7-03` | `real_dev/web/package.json`; `real_dev/web/scripts/check-mf7-browser-compatibility.mjs`; `real_dev/web/evidence/mf7-browser-compatibility.md`; `real_dev/web/src/App.tsx`; `real_dev/web/src/styles.css`; `real_dev/web/src/ui/opsaUi.tsx`; `real_dev/web/src/ui/ResponsiveDataTable.tsx`; `real_dev/web/src/lib/apiClient.ts` | `npm --prefix real_dev/web run test:mf7:browser-compatibility`; `npm --prefix real_dev/web run test:mf7`; `npm --prefix real_dev/web run typecheck`; `npm --prefix real_dev/web run build`; scans estaticos; verificacao de disponibilidade local de browsers alvo. |

### Implementacao encontrada

- `real_dev/web/package.json` expoe `test:mf7:browser-compatibility` e `test:mf7`; o agregador executa compatibilidade browser, modularidade frontend, `tsc --noEmit` e `vite build`.
- `real_dev/web/scripts/check-mf7-browser-compatibility.mjs` le as superficies criticas do frontend e bloqueia `navigator.userAgent`, `window.chrome`, `InstallTrigger`, `@-moz-document`, `::-webkit-` e `@supports` usado como atalho WebKit.
- O mesmo gate confirma contratos herdados: `credentials: "include"` em `apiClient.ts`, `:focus-visible` e `@media (max-width: 640px)` em `styles.css`, e export de `ResponsiveDataTable`.
- `real_dev/web/evidence/mf7-browser-compatibility.md` existe, declara Chrome, Edge e Firefox como browsers alvo e documenta os comandos automatizados ja executados; os tres smokes manuais continuam marcados como `BLOQUEADO_AMBIENTE`.
- `real_dev/web/src/lib/apiClient.ts` usa `credentials: "include"` no cliente central, preservando sessao por cookie HttpOnly sem `localStorage`/`sessionStorage`.
- `real_dev/web/src/styles.css` tem foco visivel por teclado e breakpoint responsivo comum, sem regra especifica por browser.
- `real_dev/web/src/ui/ResponsiveDataTable.tsx` exporta a tabela responsiva e mantem uma fonte de dados comum para tabela desktop e cartoes mobile.
- `real_dev/web/src/App.tsx` reutiliza `ResponsiveDataTable`, `StatusMessage`, `PageFrame` e cliente API central; nao foram encontrados ramos por browser nas superficies auditadas.

### Contratos consumidos de MFs anteriores

- `MF0`: sessao autenticada por cookie HttpOnly continua a depender do browser enviar cookies via `credentials: "include"`.
- `MF5`: contratos de UI, responsividade, feedback visual, foco por teclado e tabela responsiva sao preservados.
- `MF6`: disciplina de seguranca e nao armazenamento de sessao/token/role em storage local continua preservada na pesquisa estatica.
- `BK-MF7-02`: retencao legal backend nao foi alterada e continua validada pelo agregador API MF7.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF7-04` recebe uma baseline frontend que compila e evita divergencia por browser antes dos fluxos de recuperacao de password, alertas e email.
- `BK-MF7-09` e `BK-MF7-10` continuam a consumir o agregador web/API MF7 sem regressao nos gates de modularidade e modulos criticos.
- `MF8` pode usar `test:mf7` web e API como baseline tecnica, mas o fecho final deve manter a pre-condicao de smoke manual real em Chrome, Edge e Firefox.

### Coerencia entre MFs e BKs vizinhos

- `MF6 -> MF7`: `OK_COM_RISCOS`. Os contratos de sessao segura, hardening e nao exposicao de segredos foram preservados; o risco fica limitado a prova manual de browser.
- `BK-MF7-02 -> BK-MF7-03`: `OK_COM_RISCOS`. A retencao backend nao foi tocada; o frontend passa nos gates, mas ainda falta evidence manual cross-browser.
- `BK-MF7-03 -> BK-MF7-04`: `OK_COM_RISCOS`. O frontend compila e evita browser detection; o fluxo seguinte de email pode usar esta base, mas a compatibilidade real precisa de prova manual nos browsers alvo.
- `MF7 -> MF8`: `OK_COM_RISCOS`. Os gates MF7 passam; MF8 deve manter o smoke browser real como criterio operacional de fecho.

### Findings atuais

| Finding | Severidade | BK/RNF | Estado | Bloqueia MF? |
| --- | --- | --- | --- | --- |
| `MF7-IMP-AUD-20260630-BK03-R01` | `P1` | `BK-MF7-03` / `RNF20` | `BLOQUEADO_AMBIENTE` | Nao bloqueia codigo/gates; bloqueia `PASS` absoluto do BK. |

#### MF7-IMP-AUD-20260630-BK03-R01 - Smoke real Chrome/Edge/Firefox ainda nao executado

- Severidade: `P1`
- BK/RNF: `BK-MF7-03` / `RNF20`
- Estado: `BLOQUEADO_AMBIENTE`
- Evidencia:
  - O guia `BK-MF7-03` exige smoke manual nos browsers Chrome, Edge e Firefox, com versao, paginas/fluxos revistos e resultado observado.
  - `real_dev/web/evidence/mf7-browser-compatibility.md` ainda marca Chrome, Edge e Firefox como `BLOQUEADO_AMBIENTE`.
  - `npm --prefix real_dev/web run test:mf7:browser-compatibility`, `npm --prefix real_dev/web run test:mf7`, `npm --prefix real_dev/web run typecheck` e `npm --prefix real_dev/web run build` passaram.
  - `find /Applications ...` nao encontrou Chrome, Edge, Firefox ou Chromium instalados como apps alvo.
  - `command -v google-chrome`, `chromium`, `firefox` e `microsoft-edge` terminaram com exit code `1`.
  - `~/Applications/Chromium Apps.localized` existe, mas contem apenas `Icon` e `.localized/en_US.strings`, sem app executavel de browser.
- Expected:
  - Abrir a app em Chrome, Edge e Firefox.
  - Confirmar entrada da app, navegacao, tabela responsiva, formulario com erro e feedback visual.
  - Registar versao, resultado esperado e resultado observado em cada browser.
- Observed:
  - Gates automaticos passam.
  - Prova manual real em browsers alvo nao existe neste ambiente.
- Impacto:
  - O codigo atual parece alinhado com `RNF20`, mas a compatibilidade runtime nos tres browsers ainda nao esta demonstrada.
- Correcao recomendada:
  - Executar o smoke num ambiente com Chrome, Edge e Firefox instalados, atualizar `real_dev/web/evidence/mf7-browser-compatibility.md` com versoes/resultados e repetir `npm --prefix real_dev/web run test:mf7`.
  - Opcionalmente, acrescentar prova negativa isolada para o gate de compatibilidade sem mutar ficheiros reais da app.

### Findings por severidade

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 1 | `BLOQUEADO_AMBIENTE`: falta smoke real em Chrome, Edge e Firefox. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Pesquisa estatica obrigatoria

- Scan especifico de compatibilidade em `real_dev/web/src` e `real_dev/web/scripts`: `PASS_COM_RUIDO_CONTROLADO`. Os matches de `InstallTrigger`, `@-moz-document` e `::-webkit-` aparecem apenas na lista defensiva de padroes proibidos do proprio gate; `:focus-visible` e `@media (max-width: 640px)` aparecem como contratos exigidos.
- Scan de risco em `real_dev/api/src`, `real_dev/api/tests`, `real_dev/api/scripts`, `real_dev/web/src` e `real_dev/web/scripts`: `PASS_COM_RUIDO_CONTROLADO`. Os matches encontrados eram testes/adapters defensivos contra exposicao de tokens/segredos, listas de chaves sensiveis ou comentarios de protecao; nenhum confirmou sessao em storage local, `as any`, `payload: unknown`, `dangerouslySetInnerHTML`, `eval`, raw query insegura, CORS permissivo ou operacao destrutiva larga aplicavel ao BK alvo.
- Drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo) em `real_dev/api` e `real_dev/web`: `PASS`, sem matches.
- `real_dev` esta ignorado por git via `.gitignore:4:real_dev/`; isto e esperado nesta PAP e nao foi tratado como problema.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Worktree ja tinha alteracoes documentais/MF8 e relatorios MF7 nao rastreados fora do escopo; preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` confirmado como root ignorado por Git. |
| `npm --prefix real_dev/web run test:mf7:browser-compatibility` | `PASS` | Output `MF7 browser compatibility gate OK`. |
| `npm --prefix real_dev/web run typecheck` | `PASS` | `tsc --noEmit` sem erros. |
| `npm --prefix real_dev/web run build` | `PASS` | Vite build passou e gerou `dist/index.html`, CSS e JS. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility, frontend modules, typecheck e build passaram. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS em `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, modularidade backend e modulos criticos passaram. |
| `rg` de risco em `real_dev/api` e `real_dev/web` | `PASS_COM_RUIDO_CONTROLADO` | Matches contextuais/defensivos; sem finding para `BK-MF7-03`. |
| `rg` de drift de dominio em `real_dev/api` e `real_dev/web` | `PASS` | Sem matches. |
| `find /Applications ...` para Chrome/Edge/Firefox/Chromium | `BLOQUEADO_AMBIENTE` | Sem apps alvo encontradas em `/Applications`. |
| `find /Users/nuno/Applications ...` | `BLOQUEADO_AMBIENTE` | Apenas `Chromium Apps.localized`, sem browser executavel. |
| `command -v google-chrome`, `chromium`, `firefox`, `microsoft-edge` | `BLOQUEADO_AMBIENTE` | Todos terminaram com exit code `1`. |
| `git diff --check` | `PASS` | Sem whitespace errors antes desta atualizacao de relatorio. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por checks documentais historicos/preexistentes em guias, incluindo aviso global sobre `BK-MF7-03`. |

### Validacoes nao executadas

- Smoke manual em Chrome, Edge e Firefox: nao executado porque os browsers alvo nao estao disponiveis como apps/executaveis neste ambiente.
- Prova com browser autenticado vivo: nao executada; a cobertura desta auditoria foi estatica, build/typecheck e gates automatizados.
- Testes negativos mutacionais do gate de browser: nao executados como mutacao real; a cobertura atual e feita por padroes proibidos no gate sem alterar ficheiros funcionais.
- `test:integration` sem skip: nao executado nesta reauditoria por nao ser prova principal de `BK-MF7-03`; o BK alvo e frontend/compatibilidade e nao altera persistencia.

### Ficheiros auditados principais

- `real_dev/web/package.json`
- `real_dev/web/scripts/check-mf7-browser-compatibility.mjs`
- `real_dev/web/evidence/mf7-browser-compatibility.md`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/styles.css`
- `real_dev/web/src/ui/opsaUi.tsx`
- `real_dev/web/src/ui/ResponsiveDataTable.tsx`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/api/package.json`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- `BLOCKER_AMBIENTE`: disponibilizar Chrome, Edge e Firefox para smoke manual ou executar a validacao num ambiente onde os tres browsers estejam instalados.
- `TODO_OPERACIONAL`: abrir a app nos tres browsers alvo, validar entrada, navegacao, tabela responsiva, formulario com erro e feedback visual, e preencher `real_dev/web/evidence/mf7-browser-compatibility.md` com versoes/resultados observados.
- `TODO_OPCIONAL`: acrescentar negativos isolados para o gate de compatibilidade sem mutar ficheiros reais da app.
- `RISCO_VIZINHO`: `BK-MF7-01` continua dependente de evidence operacional com `pg_dump`/`pg_restore`, registada fora deste BK.

### Proxima acao recomendada

Manter `BK-MF7-03` como `PARCIAL`/`AUDITADO_COM_FINDINGS` ate haver smoke real em Chrome, Edge e Firefox. A proxima acao concreta e executar esse smoke num ambiente com os browsers alvo, atualizar a evidence `real_dev/web/evidence/mf7-browser-compatibility.md` e repetir `npm --prefix real_dev/web run test:mf7`.

## Reauditoria atual - BK-MF7-02 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-02`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`, apenas para coerencia geral; o BK alvo e interno ao backend.
- Relatorio fonte: `auto`; relatorios anteriores de implementacao, auditoria e correcao MF7 confrontados com o codigo real atual.
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Relatorio de correcao consultado: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Permissao de codigo: sem alteracoes de codigo
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Commits: nao executados

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-02]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, guia `BK-MF7-02`, guia anterior `BK-MF7-01`, guia seguinte `BK-MF7-03`, guia de coerencia `BK-MF6-10` e handoff macro atual `BK-MF8-01`.
- Relatorios existentes: `AUDITORIA-HIDRATACAO-MF7.md`, `IMPLEMENTACAO-REAL_DEV-MF7.md`, `AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md` e `CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`.
- Codigo real: `real_dev/api/package.json`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/src/modules/audit/auditLogService.js`, `real_dev/api/src/modules/compliance/retentionPolicy.js`, `real_dev/api/src/modules/compliance/retentionDeletionGate.js`, `real_dev/api/tests/unit/retentionPolicy.test.js`, `real_dev/web/package.json`.

### Resultado geral

Estado do BK alvo: `PASS`

`BK-MF7-02` esta `AUDITADO_OK`. A implementacao real atual cumpre o contrato essencial de `RNF19`: existe modelo persistente `RetentionHold` por empresa, entidade e identificador; a relacao inversa em `Company` existe; a politica calcula 10 anos a partir da data contabilistica de referencia; o gate bloqueia remocao com erro HTTP `409` quando a retencao esta ativa; a remocao autorizada regista auditoria sensivel com a acao declarada `retention.delete.allowed`; e a suite especifica cobre negativos e positivos.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` no BK alvo. A coerencia vizinha fica `OK_COM_RISCOS` apenas porque `BK-MF7-01` continua com um blocker operacional externo ja registado noutros relatórios: falta evidence positiva de backup/restauro com `pg_dump`/`pg_restore`. Esse risco nao invalida o contrato de retencao legal auditado aqui.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-02` | `RNF19` | `OK` / `AUDITADO_OK` | `RetentionHold`, `Company.retentionHolds`, `retentionPolicy.js`, `retentionDeletionGate.js`, `retention.delete.allowed` e `test:mf7:retention` existem e passaram. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-02` | `RNF19`; matriz/backlog MF7; guia `BK-MF7-02` | `real_dev/api/prisma/schema.prisma`; `real_dev/api/src/modules/audit/auditLogService.js`; `real_dev/api/src/modules/compliance/retentionPolicy.js`; `real_dev/api/src/modules/compliance/retentionDeletionGate.js`; `real_dev/api/tests/unit/retentionPolicy.test.js`; `real_dev/api/package.json` | `syntax:check`; `prisma:validate`; `test:mf7:retention`; `test:mf7`; `test:unit`; `test:contracts`; `test:integration` com skip explicito; `typecheck`/`build` web; scans estaticos; `validate-planificacao.sh`; `git diff --check`. |

### Implementacao encontrada

- `RetentionHold` existe em `real_dev/api/prisma/schema.prisma` com `companyId`, `entity`, `entityId`, `periodEndAt`, `retainUntil`, `reason`, timestamps, relacao `Company` com `onDelete: Restrict`, unicidade composta por `companyId/entity/entityId` e indices por entidade e data de retencao.
- `Company` tem a relacao inversa `retentionHolds RetentionHold[]`.
- `auditLogService.js` declara `"retention.delete.allowed"` em `SENSITIVE_ACTIONS` e `recordSensitiveAudit` continua a exigir acao sensivel declarada e detalhes minimos, sem aceitar campos proibidos como `token`, `secret`, `cookie` ou `rawpayload`.
- `retentionPolicy.js` protege apenas as entidades contabilisticas do guia: `SaleDocument`, `PurchaseDocument`, `JournalEntry`, `VatMapRun`, `SaftExportRun` e `AuditLog`.
- `calculateRetainUntil(periodEndAt)` adiciona 10 anos em UTC, evitando drift de fuso horario no dia final de retencao.
- `assertRetainedRecordDeletionAllowed` consulta `prisma.retentionHold.findFirst` filtrando por `companyId`, `entity` e `entityId`; se a retencao estiver ativa, lanca `RetentionHoldActiveError` com `code/status/statusCode = RETENTION_HOLD_ACTIVE/409`.
- `retentionDeletionGate.js` expõe o gate comum `assertAccountingDeletionGate` e funcoes de dominio para as entidades protegidas. O gate so regista auditoria sensivel quando a remocao e autorizada.
- A pesquisa de endpoints e operacoes destrutivas nao encontrou `DELETE` publico para `SaleDocument`, `PurchaseDocument`, `JournalEntry`, `VatMapRun`, `SaftExportRun` ou `AuditLog`. Assim, a ausencia de chamadas runtime ao gate em services destrutivos reais nao foi classificada como finding: o contrato esta pronto para ser consumido quando essas remocoes existirem.

### Contratos consumidos de MFs anteriores

- `MF0`: estrutura Node/Express/Prisma e contexto multiempresa continuam a ser usados. O `companyId` do gate e argumento backend obrigatorio, nao ownership decidido pelo frontend.
- `MF4`: `AuditLog` e listagem de auditoria continuam a existir como trilho operacional.
- `MF6`: o contrato `recordSensitiveAudit(prisma, input)` e reutilizado sem alterar o modelo de auditoria; detalhes sensiveis continuam bloqueados.
- `BK-MF7-01`: entrega contexto operacional de backup/restauro para a macrofase, mas o blocker ambiental de `pg_dump`/`pg_restore` nao impede a validacao do gate de retencao.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF7-03` recebe a retencao legal como contrato backend estavel antes da validacao transversal de browsers.
- `BK-MF7-04` e seguintes mantem a disciplina de auditoria sensivel e de nao expor segredos/logs sensiveis.
- `BK-MF8-01` recebe uma fonte concreta de eventos `audit` a normalizar em logs estruturados: a acao `retention.delete.allowed` e os detalhes `retainUntil`/`retentionStatus`.
- Qualquer futuro endpoint destrutivo sobre entidades contabilisticas deve chamar o gate especifico correspondente antes de executar a remocao.

### Coerencia entre MFs e BKs vizinhos

- `MF6 -> MF7`: `OK`. A auditoria sensivel de MF6 e consumida diretamente por `retentionDeletionGate.js`.
- `BK-MF7-01 -> BK-MF7-02`: `OK_COM_RISCOS`. O BK alvo esta funcional; o risco fica limitado a `BK-MF7-01`, que ainda precisa de evidence operacional com ferramentas PostgreSQL externas.
- `BK-MF7-02 -> BK-MF7-03`: `OK`. O BK seguinte valida compatibilidade browser e nao exige alterar o contrato backend de retencao.
- `MF7 -> MF8`: `OK`. O handoff atual e `BK-MF8-01 - Logs estruturados (info, warn, error, audit)`, que pode reutilizar a auditoria sensivel produzida pelo gate.

### Findings atuais

Sem findings confirmados para `BK-MF7-02`.

### Findings por severidade

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado no BK alvo. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Pesquisa estatica obrigatoria

- Scan de risco em `real_dev/api/src`, `real_dev/api/tests`, `real_dev/api/scripts`, `real_dev/web/src` e `real_dev/web/scripts`: `PASS_COM_RUIDO_CONTROLADO`. Os matches encontrados eram segredos falsos em testes, listas defensivas de chaves sensiveis, comentarios de redacao de tokens, validacao de storage privado e chaves de detalhe proibidas; nenhum match confirmou exposicao de segredo, sessao em storage local, `as any`, `payload: unknown`, `dangerouslySetInnerHTML`, `eval`, raw query insegura ou operacao destrutiva larga aplicavel ao BK alvo.
- Drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo) em `real_dev/api` e `real_dev/web`: `PASS`, sem matches.
- Pesquisa de uso do gate confirmou que, no estado atual, as funcoes de retencao sao consumidas pelos testes e estao disponiveis para services futuros; nao ha endpoint destrutivo publico das entidades contabilisticas protegidas a auditar.
- `real_dev` esta ignorado por git via `.gitignore:4:real_dev/`; isto e esperado nesta PAP e nao foi tratado como problema.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Worktree ja tinha alteracoes documentais/MF8 e relatorios MF7 nao rastreados fora do escopo; preservadas. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` confirmado como root ignorado por Git. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `npm --prefix real_dev/api run test:mf7:retention` | `PASS` | 9 testes passaram para `BK-MF7-02`. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, modularidade backend e modulos criticos passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run typecheck` | `PASS` | TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS` | Vite build passou. |
| `rg` de risco em `real_dev/api` e `real_dev/web` | `PASS_COM_RUIDO_CONTROLADO` | Matches contextuais/defensivos; sem finding para `BK-MF7-02`. |
| `rg` de drift de dominio em `real_dev/api` e `real_dev/web` | `PASS` | Sem matches. |
| `git diff --check` | `PASS` | Sem whitespace errors antes da atualizacao deste relatorio. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por checks documentais historicos/preexistentes em varios guias, incluindo avisos globais ja conhecidos. |

### Validacoes nao executadas

- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado porque nao existe `TEST_DATABASE_URL` efemera configurada.
- Smoke HTTP/browser autenticado especifico de `BK-MF7-02`: nao aplicavel como prova principal, porque o BK alvo e um gate interno backend e nao entrega endpoint ou pagina frontend.
- Prova runtime de um `DELETE` real sobre entidade contabilistica protegida: nao executada porque nao existe endpoint destrutivo publico atual para `SaleDocument`, `PurchaseDocument`, `JournalEntry`, `VatMapRun`, `SaftExportRun` ou `AuditLog`.

### Ficheiros auditados principais

- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/src/modules/audit/auditLogService.js`
- `real_dev/api/src/modules/compliance/retentionPolicy.js`
- `real_dev/api/src/modules/compliance/retentionDeletionGate.js`
- `real_dev/api/tests/unit/retentionPolicy.test.js`
- `real_dev/api/package.json`
- `real_dev/web/package.json`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- Sem blockers de codigo para `BK-MF7-02`.
- `TODO_OPERACIONAL`: configurar `TEST_DATABASE_URL` efemera/persistente e correr `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- `TODO_FUTURO`: quando forem criados endpoints destrutivos para entidades contabilisticas protegidas, chamar obrigatoriamente o gate especifico antes da remocao e acrescentar teste de contrato/HTTP para o bloqueio `409`.
- `RISCO_VIZINHO`: `BK-MF7-01` continua dependente de evidence operacional com `pg_dump`/`pg_restore`, registada fora deste BK.

### Proxima acao recomendada

Manter `BK-MF7-02` como `AUDITADO_OK` e avancar para a validacao operacional pendente de `BK-MF7-01` quando houver ferramentas PostgreSQL no ambiente. Para evolucao funcional futura, o proximo cuidado e garantir que qualquer endpoint `DELETE` contabilistico consome `retentionDeletionGate.js` antes de apagar dados.

## Reauditoria atual - BK-MF7-01 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-01`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`, apenas para coerencia geral; o BK alvo nao tem superficie frontend propria.
- Relatorio fonte: `auto`; relatorios anteriores de implementacao, auditoria e correcao MF7 confrontados com o codigo real atual.
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Relatorio de correcao consultado: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Permissao de codigo: sem alteracoes de codigo
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Commits: nao executados

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-01]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, guia `BK-MF7-01`, guia seguinte `BK-MF7-02`, guia anterior de coerencia `BK-MF6-10` e guia de handoff macro `BK-MF8-01`.
- Relatorios MF7 existentes: `IMPLEMENTACAO-REAL_DEV-MF7.md`, `AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md` e `CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`.
- Codigo real: `real_dev/api/package.json`, `real_dev/api/scripts/run-daily-backup.mjs`, `real_dev/api/scripts/verify-backup-restore.mjs`, `real_dev/api/prisma/schema.prisma`, suites MF6/MF7, `real_dev/web/package.json` e build/typecheck web para coerencia geral.

### Resultado geral

Estado geral: `PASS_COM_RISCOS`

O codigo real atual satisfaz o contrato estrutural de `BK-MF7-01`: existem os scripts `mf7:backup` e `mf7:backup:verify`, ambos com JSDoc, execucao sem shell, manifesto sem `DATABASE_URL`, validacao de ficheiro vazio/inexistente e verificacao por `pg_restore --list` quando a ferramenta esta disponivel.

O BK nao pode ser marcado como `OK`/`PASS` absoluto porque continua a faltar a prova positiva operacional exigida por `RNF18`: este ambiente nao tem `pg_dump` nem `pg_restore` no `PATH`. A tentativa de criar backup real falhou com mensagem controlada de ferramenta ausente, e a verificacao de ficheiro nao falso tambem fica bloqueada sem `pg_restore`. Este e um bloqueio de ambiente, nao uma lacuna nova de codigo.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-01` | `RNF18` | `PARCIAL` | `run-daily-backup.mjs`, `verify-backup-restore.mjs`, `mf7:backup` e `mf7:backup:verify` existem; `syntax:check`, `prisma:validate`, negativos controlados e suites MF6/MF7 passaram; falta evidence positiva com `pg_dump`/`pg_restore`. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-01` | `RNF18`; matriz/backlog MF7; guia `BK-MF7-01` | `real_dev/api/scripts/run-daily-backup.mjs`; `real_dev/api/scripts/verify-backup-restore.mjs`; `real_dev/api/package.json`; `real_dev/api/prisma/schema.prisma` | `syntax:check`; `prisma:validate`; negativos `mf7:backup`; negativos `mf7:backup:verify`; `test:mf6`; `test:mf7`; `test:unit`; `test:contracts`; `test:integration` com skip explicito; `typecheck`/`build` web; scan estatico; `git diff --check`. |

### Contratos consumidos de MFs anteriores

- `MF0`: estrutura Node/Express/Prisma e configuracao local por ambiente continuam a ser usadas pelo backend real.
- `MF4`: auditoria e logs de integracao continuam separados; este BK nao inventa logs de backup com credenciais ou payloads financeiros.
- `MF6`: hardening, gestao de segredos por variaveis de ambiente, cookies de sessao, bcrypt e auditoria sensivel continuam verdes em `test:mf6`.
- `BK-MF6-10`: o contrato de auditoria obrigatoria fica preservado; o backup usa scripts operacionais e nao substitui auditoria funcional.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF7-01` entrega comandos estaveis `mf7:backup` e `mf7:backup:verify`.
- O manifesto gerado pelo contrato inclui `file`, `sizeBytes`, `createdAt`, `engine` e `sha256`, sem publicar `DATABASE_URL`, caminhos absolutos ou conteudo financeiro.
- `BK-MF7-02` pode coexistir com este contrato: a retencao legal foi validada com 9 testes e nao depende de frontend nem de `companyId` vindo do pedido.
- `MF8` pode usar estes comandos como pre-condicao operacional, mas o fecho final deve continuar a exigir evidence real `restorable: true`.

### Coerencia entre MFs e BKs vizinhos

- `MF6 -> MF7`: `OK_COM_RISCOS`. Os gates MF6 passaram, incluindo ambiente, HTTPS, cookie de sessao, hardening e auditoria; o risco remanescente fica restrito a ferramentas PostgreSQL externas.
- `BK-MF7-01 -> BK-MF7-02`: `OK_COM_RISCOS`. `BK-MF7-02` passa `test:mf7:retention` e o agregador `test:mf7`; o contrato de backup existe, mas ainda nao tem fluxo feliz operacional provado.
- `MF7 -> MF8`: `OK_COM_RISCOS`. A MF8 pode consumir a baseline MF7, mas a validacao final deve manter como blocker operacional a falta de evidence real de backup/restauro.

### Findings atuais

| Finding | Severidade | BK/RNF | Estado | Bloqueia PASS absoluto? |
| --- | --- | --- | --- | --- |
| `MF7-IMP-AUD-20260630-BK01-F01` | `P1` | `BK-MF7-01` / `RNF18` | `BLOQUEADO` | Sim, ate existir evidence positiva `restorable: true`. |

#### MF7-IMP-AUD-20260630-BK01-F01 - Backup/restauro continua sem prova positiva local

- Severidade: `P1`
- BK/RNF: `BK-MF7-01` / `RNF18`
- Estado: `BLOQUEADO`
- Evidencia:
  - `real_dev/api/scripts/run-daily-backup.mjs` usa `spawnSync("pg_dump", ["--format=custom", "--no-owner", "--file", backupPath, databaseUrl])`.
  - `real_dev/api/scripts/verify-backup-restore.mjs` usa `spawnSync("pg_restore", ["--list", backupPath])`.
  - `real_dev/api/package.json` expoe `mf7:backup` e `mf7:backup:verify`.
  - `command -v pg_dump` e `command -v pg_restore` terminaram com exit code `1`.
  - A tentativa positiva `DATABASE_URL=postgresql://user:password@localhost:5432/opsa_test OPSA_BACKUP_DIR=/private/tmp/opsa-mf7-backup-validation npm run mf7:backup` falhou com `pg_dump nao arrancou. Confirma se a ferramenta PostgreSQL esta instalada.`
  - A verificacao sobre ficheiro nao vazio falso falhou com `pg_restore nao arrancou. Confirma se a ferramenta PostgreSQL esta instalada.`
- Expected:
  - Gerar um dump real PostgreSQL em formato custom.
  - Criar manifesto sem credenciais.
  - Verificar o dump com `pg_restore --list`.
  - Obter output seguro com `restorable: true` e `catalogEntries > 0`.
- Observed:
  - O codigo e os negativos existem e passam.
  - A prova positiva continua bloqueada por falta de `pg_dump`/`pg_restore` no ambiente.
- Impacto:
  - Nao ha evidencia suficiente para afirmar que a restauracao e possivel neste ambiente.
  - Nao foi encontrada regressao de codigo nem exposicao de credenciais.
- Correcao recomendada:
  - Disponibilizar ferramentas PostgreSQL no ambiente de validacao ou executar a prova num ambiente que ja tenha `pg_dump` e `pg_restore`.
  - Reexecutar apenas o fluxo positivo `mf7:backup` + `mf7:backup:verify` contra uma base PostgreSQL efemera segura.
  - Guardar evidence segura com manifesto `.dump.json`, `restorable: true`, `catalogEntries > 0` e negativos principais.

### Findings por severidade

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 1 | `MF7-IMP-AUD-20260630-BK01-F01` bloqueado por ambiente externo. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Pesquisa estatica obrigatoria

- Scan dirigido a `real_dev/api` e `real_dev/web` para placeholders, codigo temporario, `payload: unknown`, `as any`, storage local, `dangerouslySetInnerHTML`, `eval`, `new Function`, logs de passwords/tokens, CORS permissivo, operacoes Prisma globais e claims de IA fora de escopo: `PASS_COM_RUIDO_CONTROLADO`. Os matches encontrados eram listas defensivas de chaves sensiveis, tokens falsos em testes, comentarios/JSDoc ou configuracao de storage privado; nenhum finding aplicavel a `BK-MF7-01`.
- Drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo) em `real_dev/api` e `real_dev/web`: `PASS`, sem matches.
- `real_dev` esta ignorado por git via `.gitignore:4:real_dev/`; isto e comportamento esperado nesta PAP e nao foi tratado como problema.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Worktree ja tinha alteracoes documentais/MF8 e relatorios MF7 nao rastreados fora do escopo; preservadas. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` confirmado como root ignorado por Git. |
| `command -v pg_dump` | `BLOQUEADO_AMBIENTE` | Exit code `1`; ferramenta ausente no `PATH`. |
| `command -v pg_restore` | `BLOQUEADO_AMBIENTE` | Exit code `1`; ferramenta ausente no `PATH`. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `npm --prefix real_dev/api run test:mf7:retention` | `PASS` | 9 testes passaram para `BK-MF7-02`. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados explicitamente por falta de `TEST_DATABASE_URL`. |
| `DATABASE_URL= npm run mf7:backup` em `real_dev/api` | `NEGATIVO_PASS` | Falhou com `DATABASE_URL em falta para executar backup`. |
| `DATABASE_URL=postgresql://user:password@localhost:5432/opsa_test OPSA_BACKUP_DIR=/private/tmp/opsa-mf7-backup-validation npm run mf7:backup` em `real_dev/api` | `BLOQUEADO_AMBIENTE` | Falhou com `pg_dump nao arrancou`. |
| `npm run mf7:backup:verify` em `real_dev/api` | `NEGATIVO_PASS` | Falhou com falta de `--file`/`OPSA_BACKUP_FILE`. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/inexistente.dump npm run mf7:backup:verify` em `real_dev/api` | `NEGATIVO_PASS` | Falhou com backup inexistente. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/vazio.dump npm run mf7:backup:verify` em `real_dev/api` | `NEGATIVO_PASS` | Falhou com ficheiro vazio. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/fake.dump npm run mf7:backup:verify` em `real_dev/api` | `BLOQUEADO_AMBIENTE` | Falhou com `pg_restore nao arrancou`. |
| `npm --prefix real_dev/api run test:mf6` | `PASS` | Gates MF6 passaram; concorrencia em `mode: local-contract`. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exports, imports, SAF-T, backend modules e critical modules passaram. |
| `npm --prefix real_dev/web run typecheck` | `PASS` | TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS` | Vite build passou. |
| `rg` de risco em `real_dev/api real_dev/web` | `PASS_COM_RUIDO_CONTROLADO` | Matches defensivos/contextuais; sem finding de BK-MF7-01. |
| `rg` de drift de dominio em `real_dev/api real_dev/web` | `PASS` | Sem matches. |
| `git diff --check` | `PASS` | Sem whitespace errors antes da atualizacao deste relatorio. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por checks documentais historicos/preexistentes, incluindo guias fora deste scope. |

### Validacoes nao executadas

- Fluxo feliz real `mf7:backup` + `mf7:backup:verify`: nao executado com sucesso porque `pg_dump` e `pg_restore` nao existem no ambiente.
- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado porque nao existe `TEST_DATABASE_URL` efemera configurada.
- Instalacao de ferramentas PostgreSQL: nao executada por falta de autorizacao explicita e por ser alteracao de ambiente fora do repositorio.
- Smoke HTTP/browser especifico de `BK-MF7-01`: nao aplicavel como prova principal, porque o BK alvo entrega scripts operacionais backend e nao endpoint ou pagina frontend.

### Ficheiros auditados principais

- `real_dev/api/scripts/run-daily-backup.mjs`
- `real_dev/api/scripts/verify-backup-restore.mjs`
- `real_dev/api/package.json`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/tests/unit/retentionPolicy.test.js`
- `real_dev/api/src/modules/compliance/retentionPolicy.js`
- `real_dev/api/src/modules/compliance/retentionDeletionGate.js`
- `real_dev/api/src/modules/audit/auditLogService.js`
- `real_dev/web/package.json`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- `BLOCKER_AMBIENTE`: disponibilizar `pg_dump` e `pg_restore` no `PATH`, ou indicar caminhos operacionais equivalentes.
- `TODO_OPERACIONAL`: correr `npm run mf7:backup` contra uma base PostgreSQL efemera segura e depois `npm run mf7:backup:verify` sobre o dump gerado.
- `TODO_OPERACIONAL`: guardar evidence segura com manifesto `.dump.json`, `restorable: true`, `catalogEntries > 0` e negativos principais.
- `TODO_OPERACIONAL`: configurar `TEST_DATABASE_URL` efemera/persistente e correr `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`.

### Proxima acao recomendada

Executar a validacao operacional de `BK-MF7-01` num ambiente com ferramentas PostgreSQL instaladas. Se o dump real for criado e `pg_restore --list` devolver `restorable: true`, o finding `MF7-IMP-AUD-20260630-BK01-F01` pode ser reclassificado de `BLOQUEADO` para fechado; sem essa evidence, o estado honesto continua `PARCIAL`/`PASS_COM_RISCOS`.

## Reauditoria atual - BK-MF7-09 e BK-MF7-10 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-09`, `BK-MF7-10`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`
- Relatorio fonte: `auto`; relatorio de implementacao confrontado com a implementacao real atual
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Permissao de codigo: sem alteracoes de codigo
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Commits: nao executados

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-09, BK-MF7-10]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, guias `BK-MF7-08`, `BK-MF7-09`, `BK-MF7-10` e guias vizinhos de MF6/MF8 para coerencia.
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`, relatorios anteriores de auditoria/correcao MF7 e evidencias em `real_dev/api/evidence` e `real_dev/web/evidence`.
- `real_dev/web/scripts/check-mf7-frontend-modules.mjs`, `real_dev/web/package.json`, `real_dev/web/src/App.tsx`, `real_dev/web/src/lib/apiClient.ts`, `real_dev/web/src/ui/opsaUi.tsx`, `real_dev/web/src/ui/ResponsiveDataTable.tsx`, `real_dev/web/src/ui/useActionFeedback.ts`, `real_dev/web/evidence/mf7-frontend-modules.md`.
- `real_dev/api/tests/contracts/mf7-critical-modules.test.js`, `real_dev/api/package.json`, `real_dev/api/src/modules/sales/saleDocumentService.js`, `real_dev/api/src/modules/tax/vatMapService.js`, `real_dev/api/src/modules/accounting-reports/accountingReportService.js`, `real_dev/api/src/modules/treasury/statementImportService.js`, `real_dev/api/evidence/mf7-critical-modules.md`.

### Resultado geral

Estado geral: `PASS_COM_RISCOS`

A implementacao real atual contem os artefactos essenciais de `BK-MF7-09` e `BK-MF7-10`: gate automatizado de modularidade frontend, componentes UI partilhados, cliente API centralizado com `credentials: "include"`, validacao de paginas/rotas por dominio, contrato de regressao para modulos criticos de faturacao, IVA, balancetes e reconciliacao, validacao de contexto multiempresa e simulacoes negativas que provam que os gates falham quando os contratos sao removidos.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` nesta ronda para os dois BKs auditados. O estado nao e `PASS` absoluto apenas porque a auditoria validou gates estaticos, contratos, typecheck e build, mas nao executou um fluxo browser autenticado vivo nem testes de persistencia sem skip explicito.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-09` | `RNF26` | `OK` | `check-mf7-frontend-modules.mjs` valida componentes UI partilhados, cliente API centralizado com `credentials: "include"`, dominios `sales`, `purchases`, `inventory`, `treasury` e `accounting`, e falha nos cenarios negativos simulados. |
| `BK-MF7-10` | `RNF27` | `OK` | `mf7-critical-modules.test.js` valida marcadores criticos de faturacao, IVA, balancetes e reconciliacao, preserva `companyId` server-side e rejeita marcadores obsoletos; os negativos simulados falham nos marcadores esperados. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-09` | `RNF26`; matriz/backlog MF7; guia `BK-MF7-09` | `check-mf7-frontend-modules.mjs`; `App.tsx`; `apiClient.ts`; `opsaUi.tsx`; `ResponsiveDataTable.tsx`; `useActionFeedback.ts`; `mf7-frontend-modules.md`; `web/package.json` | `node --check`; `check:mf7:frontend-modules`; tres simulacoes negativas; `npm --prefix real_dev/web run test:mf7`; scan estatico; `git diff --check`. |
| `BK-MF7-10` | `RNF27`; matriz/backlog MF7; guia `BK-MF7-10` | `mf7-critical-modules.test.js`; `saleDocumentService.js`; `vatMapService.js`; `accountingReportService.js`; `statementImportService.js`; `mf7-critical-modules.md`; `api/package.json` | `node --check`; `test:mf7:critical-modules`; tres simulacoes negativas; `test:mf7`; `test:contracts`; `test:unit`; `prisma:validate`; `test:integration` com skip explicito; scan estatico; `git diff --check`. |

### Contratos consumidos de MFs anteriores

- `MF0`: sessao autenticada e cookie `sid` continuam protegidos pelo uso obrigatorio de `credentials: "include"` no cliente API.
- `MF1`: os fluxos de faturacao auditados em `BK-MF7-10` mantem numeracao, periodo fiscal aberto, totais backend e contexto de empresa nos services reais.
- `MF2`: inventario, compras, balancetes e anexos continuam expostos por dominios separados e consumidos pelo frontend sem criar clientes paralelos.
- `MF3`: IVA, tesouraria, reconciliacao e extratos continuam a usar services canonicos com `companyId` do contexto servidor.
- `MF6`: hardening multiempresa, cookies seguros, origem confiavel e disciplina de nao confiar no `companyId` do browser sao preservados nos gates e contratos.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF7-09` entrega um gate frontend para impedir regressao de modularidade, duplicacao de cliente API ou perda de cookies de sessao.
- `BK-MF7-10` entrega um contrato de regressao dos modulos criticos, com cobertura minima para faturacao, IVA, balancetes e reconciliacao.
- `MF8` pode consumir estes gates como parte do fecho tecnico, mantendo como pre-condicoes smoke live, browser real e integracao persistente quando aplicavel.

### Coerencia entre MFs e BKs vizinhos

- `MF6 -> MF7`: `OK`. A implementacao auditada preserva sessao, cookies, contexto de empresa e separacao multiempresa.
- `BK-MF7-08 -> BK-MF7-09`: `OK`. O gate backend anterior fica complementado por um gate frontend equivalente, sem misturar responsabilidades.
- `BK-MF7-09 -> BK-MF7-10`: `OK`. A modularidade frontend fica fechada antes do contrato de regressao dos modulos criticos backend.
- `MF7 -> MF8`: `OK_COM_RISCOS`. Os gates tecnicos estao presentes e passam, mas o fecho macro deve considerar browser real autenticado, smoke live e persistencia sem skip.

### Findings atuais

Nao foram encontrados findings ativos para `BK-MF7-09` ou `BK-MF7-10` nesta ronda.

Os riscos residuais sao operacionais e nao apontam para defeito confirmado no codigo auditado:

- O gate de `BK-MF7-09` valida modularidade frontend de forma estatica e por build/typecheck; nao substitui um percurso manual ou automatizado em browser autenticado vivo.
- O contrato de `BK-MF7-10` protege marcadores criticos dos services reais, mas nao substitui um teste end-to-end com base de dados persistente e dados contabilisticos reais/controlados.
- `test:integration` foi executado com `OPSA_SKIP_PERSISTENCE_TESTS=true`; os testes de persistencia ficaram explicitamente ignorados.
- `bash scripts/validate-planificacao.sh` continua a devolver `advisory_pass=false` por checks documentais historicos de planeamento, sem evidenciar defeito novo na implementacao real destes dois BKs.

### Pesquisa estatica

- Scan dirigido a `real_dev/api/src`, `real_dev/api/tests`, `real_dev/api/scripts`, `real_dev/web/src`, `real_dev/web/scripts` e evidencias MF7 para placeholders, codigo temporario, `as any`, storage local, `dangerouslySetInnerHTML`, `eval`, `new Function`, logs de passwords/tokens, CORS permissivo, operacoes globais Prisma e termos de IA fora de escopo: `PASS_COM_RUIDO_CONTROLADO`. Os matches encontrados eram tokens falsos em testes, listas de palavras sensiveis para sanitizacao, comentarios/JSDoc ou configuracao privada existente; nenhum finding aplicavel a `BK-MF7-09`/`BK-MF7-10`.
- Drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo) em `real_dev` auditado: `PASS`, sem matches.
- `real_dev` esta ignorado por git via `.gitignore:4:real_dev/`; a auditoria usou leitura direta dos ficheiros e comandos dentro desse root.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` confirmado como root ignorado por Git. |
| `node --check real_dev/web/scripts/check-mf7-frontend-modules.mjs` | `PASS` | Sintaxe valida. |
| `node --check real_dev/api/tests/contracts/mf7-critical-modules.test.js` | `PASS` | Sintaxe valida. |
| `npm --prefix real_dev/web run check:mf7:frontend-modules` | `PASS` | Gate devolveu `MF7 frontend modular: OK`. |
| `OPSA_MF7_FRONTEND_SIMULATE_NO_CREDENTIALS=true npm --prefix real_dev/web run check:mf7:frontend-modules` | `PASS_NEGATIVO` | Falhou como esperado por ausencia de `credentials: "include"`. |
| `OPSA_MF7_FRONTEND_SIMULATE_MISSING_APP_DOMAIN=purchases npm --prefix real_dev/web run check:mf7:frontend-modules` | `PASS_NEGATIVO` | Falhou como esperado por pagina/rota frontend em falta. |
| `OPSA_MF7_FRONTEND_SIMULATE_MISSING_API_DOMAIN=purchases npm --prefix real_dev/web run check:mf7:frontend-modules` | `PASS_NEGATIVO` | Falhou como esperado por cliente API em falta. |
| `npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS` | 3 testes passaram. |
| `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=faturacao:assertOpenFiscalPeriod npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS_NEGATIVO` | Falhou como esperado no marcador de faturacao. |
| `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=balancetes:buildTrialBalance npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS_NEGATIVO` | Falhou como esperado no marcador de balancetes. |
| `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=reconciliacao:recordIntegrationLog npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS_NEGATIVO` | Falhou como esperado no marcador de reconciliacao. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exports, imports, SAF-T, backend modules e critical modules passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes de persistencia ignorados explicitamente. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility gate, frontend modules, `tsc --noEmit` e Vite build passaram. |
| `rg` de risco dirigido aos ficheiros auditados | `PASS_COM_RUIDO_CONTROLADO` | Matches apenas contextuais/seguros; sem finding. |
| `rg` de drift de dominio dirigido aos ficheiros auditados | `PASS` | Sem matches. |
| `rg -n '[ \t]+$' ...` | `PASS` | Sem trailing whitespace no relatorio e artefactos auditados. |
| `git diff --check` | `PASS` | Sem whitespace errors. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por checks documentais historicos fora do escopo de codigo desta auditoria. |

### Validacoes nao executadas

- Percurso browser autenticado vivo para confirmar todos os dominios frontend com dados reais/controlados.
- Testes de persistencia sem `OPSA_SKIP_PERSISTENCE_TESTS=true` e com `TEST_DATABASE_URL` configurada.
- Smoke HTTP end-to-end dos modulos criticos de faturacao, IVA, balancetes e reconciliacao contra PostgreSQL real.
- Aplicacao/verificacao de migrations numa base PostgreSQL real; esta ronda validou schema Prisma e contratos, nao uma BD operacional.

### Ficheiros auditados principais

- `real_dev/web/scripts/check-mf7-frontend-modules.mjs`
- `real_dev/web/package.json`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/ui/opsaUi.tsx`
- `real_dev/web/src/ui/ResponsiveDataTable.tsx`
- `real_dev/web/src/ui/useActionFeedback.ts`
- `real_dev/web/evidence/mf7-frontend-modules.md`
- `real_dev/api/tests/contracts/mf7-critical-modules.test.js`
- `real_dev/api/package.json`
- `real_dev/api/src/modules/sales/saleDocumentService.js`
- `real_dev/api/src/modules/tax/vatMapService.js`
- `real_dev/api/src/modules/accounting-reports/accountingReportService.js`
- `real_dev/api/src/modules/treasury/statementImportService.js`
- `real_dev/api/evidence/mf7-critical-modules.md`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- Nao ha blockers de codigo para `BK-MF7-09` ou `BK-MF7-10`.
- `TODO_OPERACIONAL`: executar percurso browser autenticado vivo dos dominios frontend com dados reais/controlados.
- `TODO_OPERACIONAL`: configurar `TEST_DATABASE_URL` efemera/persistente e correr `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- `TODO_OPERACIONAL`: executar smoke HTTP end-to-end dos modulos criticos contra PostgreSQL real.

### Proxima acao recomendada

Fechar a MF7 tecnicamente apenas depois de executar os TODOs operacionais que exigem browser real, base persistente e dados controlados; do ponto de vista dos gates e contratos auditados nesta ronda, `BK-MF7-09` e `BK-MF7-10` estao `OK`.

## Reauditoria atual - BK-MF7-07 e BK-MF7-08 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-07`, `BK-MF7-08`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`
- Relatorio fonte: `auto`; relatorio de implementacao confrontado com a implementacao real atual
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Permissao de codigo: sem alteracoes de codigo
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Commits: nao executados

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-07, BK-MF7-08]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, guias `BK-MF7-06`, `BK-MF7-07`, `BK-MF7-08`, `BK-MF7-09` e guias vizinhos de MF6/MF8 para coerencia.
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`, relatorios anteriores de auditoria/correcao MF7 e evidencias em `real_dev/api/evidence`.
- `real_dev/api/src/modules/compliance/saftComplianceChecklist.js`, `real_dev/api/src/modules/compliance/saftService.js`, `real_dev/api/src/modules/compliance/saftRoutes.js`, `real_dev/api/src/modules/compliance/saftValidators.js`.
- `real_dev/api/src/modules/integrations/integrationLogService.js`, `real_dev/api/src/server.js`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/package.json`.
- `real_dev/api/scripts/check-mf7-backend-modules.mjs`, `real_dev/api/tests/contracts/mf7-saft-contracts.test.js`, `real_dev/api/evidence/mf7-saft-readiness.md`, `real_dev/api/evidence/mf7-backend-modules.md`.
- `real_dev/web/package.json`, `real_dev/web/scripts/check-mf7-browser-compatibility.mjs`, `real_dev/web/src`, `real_dev/web/evidence`.

### Resultado geral

Estado geral: `PASS_COM_RISCOS`

A implementacao real atual contem os artefactos essenciais de `BK-MF7-07` e `BK-MF7-08`: readiness check SAF-T antes da geracao de XML, validacao de periodo, validacao minima de perfil fiscal da empresa, rejeicao de periodos sem dados, registo de `SaftExportRun`, `IntegrationLog` sanitizado, endpoint protegido por autenticacao/empresa/permissao/role, gate de modularidade backend por dominio, verificacao de rotas por builder e simulacoes negativas do gate modular.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` nesta ronda para os dois BKs auditados. O estado nao e `PASS` absoluto apenas porque nao foi executado smoke HTTP contra uma app viva com base de dados persistente, nao houve validacao oficial externa do XML SAF-T e `test:integration` foi corrido com skip explicito de persistencia por falta de `TEST_DATABASE_URL`.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-07` | `RNF24`, `RF36`, `RF48` | `OK` | `GET /api/compliance/saft` existe e preserva autenticacao, contexto de empresa, permissao e roles; `assertSaftReadiness` valida periodo, perfil fiscal e existencia de linhas antes da geracao; `test:mf7:saft` passou com cenarios positivos e negativos. |
| `BK-MF7-08` | `RNF25` | `OK` | `check-mf7-backend-modules.mjs` valida ficheiros obrigatorios por dominio, uso de route builders, ausencia de imports internos em `server.js` e falha nos cenarios negativos simulados. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-07` | `RNF24`; `RF36`; `RF48`; matriz/backlog MF7; guia `BK-MF7-07` | `saftComplianceChecklist.js`; `saftService.js`; `saftRoutes.js`; `saftValidators.js`; `integrationLogService.js`; `schema.prisma`; `mf7-saft-contracts.test.js`; `mf7-saft-readiness.md` | `syntax:check`; `test:mf7:saft`; `test:mf7`; `test:contracts`; `test:unit`; `prisma:validate`; `test:integration` com skip explicito; `git diff --check`. |
| `BK-MF7-08` | `RNF25`; matriz/backlog MF7; guia `BK-MF7-08` | `check-mf7-backend-modules.mjs`; `server.js`; modulos `sales`, `purchases`, `inventory`, `treasury`, `accounting`, `accounting-reports`, `tax`, `financial-statements`, `compliance`, `ai`; `mf7-backend-modules.md` | `check:mf7:backend-modules`; tres simulacoes negativas; `test:mf7`; `test:contracts`; `test:unit`; `git diff --check`. |

### Contratos consumidos de MFs anteriores

- `MF0`: sessao autenticada, cookie `sid`, contexto de empresa, permissao `COMPLIANCE_READ` e roles `ADMIN`, `CONTABILISTA`, `AUDITOR` sao preservados na rota SAF-T.
- `MF2`: documentos de venda, compras e lancamentos contabilisticos existentes sao usados como fonte fiscal; nao foram criados modelos paralelos para SAF-T.
- `MF3`: importacoes e extratos anteriores alimentam a disponibilidade de dados contabilisticos/fiscais que o readiness check exige.
- `MF4`: logs de auditoria/integracao continuam a guardar metadados operacionais e contagens, nao XML completo nem dados sensiveis em bruto.
- `MF6`: hardening multiempresa e disciplina de `companyId` server-side sao preservados no endpoint e no service SAF-T.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF7-07` entrega um contrato SAF-T MVP rastreavel: valida pre-condicoes antes de exportar, regista execucao e integra logs sem substituir validacao legal oficial.
- `BK-MF7-08` entrega um gate automatizado para impedir regressao de modularidade backend, incluindo deteccao de ficheiros obrigatorios em falta, rotas sem builder e imports internos indevidos no `server.js`.
- `BK-MF7-09` pode partir de modulos backend com responsabilidades separadas; a modularidade frontend continua no BK seguinte.
- `MF8` pode consumir SAF-T e modularidade backend como contratos de fecho, mantendo como pre-condicoes smoke live, DB persistente e validacao fiscal externa quando aplicavel.

### Coerencia entre MFs e BKs vizinhos

- `MF6 -> MF7`: `OK_COM_RISCOS`. A implementacao auditada preserva sessao, permissao, contexto de empresa e separacao multiempresa.
- `BK-MF7-06 -> BK-MF7-07`: `OK`. As importacoes/linhas contabilisticas anteriores alimentam o readiness check SAF-T sem acoplamento indevido ao endpoint de exportacao.
- `BK-MF7-07 -> BK-MF7-08`: `OK`. SAF-T fica dentro do dominio `compliance`, enquanto o gate modular valida a separacao dos dominios backend.
- `BK-MF7-08 -> BK-MF7-09`: `OK_COM_RISCOS`. O backend fica protegido por gate modular; a modularidade frontend permanece no BK seguinte e nao foi auditada como entrega principal desta ronda.
- `MF7 -> MF8`: `OK_COM_RISCOS`. Os dois BKs auditados estao fechados tecnicamente, mas o fecho macro deve considerar smoke live, base persistente e validacao oficial externa de SAF-T.

### Findings atuais

Nao foram encontrados findings ativos para `BK-MF7-07` ou `BK-MF7-08` nesta ronda.

Os riscos residuais sao operacionais e nao apontam para defeito confirmado no codigo auditado:

- O XML SAF-T foi validado por testes de contrato internos e readiness check, mas nao por uma ferramenta oficial externa de validacao SAF-T PT.
- O endpoint `GET /api/compliance/saft` nao foi exercitado por smoke HTTP contra uma app viva com base PostgreSQL persistente.
- `test:integration` foi executado com `OPSA_SKIP_PERSISTENCE_TESTS=true` por falta de `TEST_DATABASE_URL`; os testes de persistencia ficaram explicitamente ignorados.
- `prisma:validate` sem `DATABASE_URL` falha por configuracao de ambiente; com `DATABASE_URL` dummy, o schema valida com sucesso.

### Pesquisa estatica

- Scan dirigido aos artefactos auditados para placeholders, codigo temporario, `as any`, storage local, `dangerouslySetInnerHTML`, `eval`, `new Function`, logs de passwords/tokens, CORS permissivo, operacoes globais Prisma e termos de IA fora de escopo: `PASS_COM_RUIDO_CONTROLADO`. Os matches encontrados eram testes com tokens falsos, listas de palavras sensiveis usadas para sanitizacao, comentarios/JSDoc ou configuracao privada existente; nenhum finding aplicavel a `BK-MF7-07`/`BK-MF7-08`.
- Drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo) em `real_dev` auditado: `PASS`, sem matches.
- `real_dev` esta ignorado por git via `.gitignore:4:real_dev/`; a auditoria usou leitura direta dos ficheiros e comandos dentro desse root.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `npm --prefix real_dev/api run test:mf7:saft` | `PASS` | 5 testes passaram. |
| `npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS` | Gate modular devolveu `MF7 backend modular: OK`. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exports, imports, SAF-T e backend modular passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 50 testes passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `npm --prefix real_dev/api run prisma:validate` | `FAIL_AMBIENTE` | Falhou apenas por falta de `DATABASE_URL`. |
| `DATABASE_URL='postgresql://opsa:opsa@localhost:5432/opsa' npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido sem tocar numa BD real. |
| `OPSA_MF7_SIMULATE_MISSING=src/modules/ai/aiRoutes.js npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS_NEGATIVO` | Falhou como esperado com ficheiro obrigatorio em falta. |
| `OPSA_MF7_SIMULATE_FORBIDDEN_SERVER_IMPORT=sales/saleDocumentService.js npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS_NEGATIVO` | Falhou como esperado ao simular import interno indevido em `server.js`. |
| `OPSA_MF7_SIMULATE_MISSING=src/modules/inventory/stockMovementService.js npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS_NEGATIVO` | Falhou como esperado com service obrigatorio em falta. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | Suite executou com 2 testes de persistencia ignorados explicitamente. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility gate, `tsc --noEmit` e Vite build passaram. |
| `rg` de risco dirigido aos ficheiros auditados | `PASS_COM_RUIDO_CONTROLADO` | Matches apenas contextuais/seguros; sem finding. |
| `rg` de drift de dominio dirigido aos ficheiros auditados | `PASS` | Sem matches. |
| `git diff --check` | `PASS` | Sem whitespace errors. |

### Validacoes nao executadas

- Smoke HTTP com app viva para `GET /api/compliance/saft` usando sessao real, permissao real e base PostgreSQL persistente.
- Validacao oficial externa do ficheiro SAF-T PT gerado.
- `test:integration` sem skip e com `TEST_DATABASE_URL` efemera/persistente configurada.
- Aplicacao de migrations numa base PostgreSQL real; esta ronda validou schema Prisma e contratos, nao uma BD operacional.

### Ficheiros auditados principais

- `real_dev/api/src/modules/compliance/saftComplianceChecklist.js`
- `real_dev/api/src/modules/compliance/saftService.js`
- `real_dev/api/src/modules/compliance/saftRoutes.js`
- `real_dev/api/src/modules/compliance/saftValidators.js`
- `real_dev/api/src/modules/integrations/integrationLogService.js`
- `real_dev/api/src/server.js`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/scripts/check-mf7-backend-modules.mjs`
- `real_dev/api/tests/contracts/mf7-saft-contracts.test.js`
- `real_dev/api/evidence/mf7-saft-readiness.md`
- `real_dev/api/evidence/mf7-backend-modules.md`
- `real_dev/api/package.json`
- `real_dev/web/package.json`
- `real_dev/web/src`
- `real_dev/web/scripts/check-mf7-browser-compatibility.mjs`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- Nao ha blockers de codigo para `BK-MF7-07` ou `BK-MF7-08`.
- `TODO_OPERACIONAL`: executar smoke HTTP live do endpoint SAF-T com dados reais/controlados e permissao `COMPLIANCE_READ`.
- `TODO_OPERACIONAL`: validar o XML SAF-T gerado numa ferramenta oficial/externa adequada antes de assumir conformidade fiscal plena.
- `TODO_OPERACIONAL`: configurar `TEST_DATABASE_URL` efemera/persistente e correr `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- `TODO_OPERACIONAL`: aplicar/verificar migrations numa base PostgreSQL real antes do fecho operacional da MF7.

### Proxima acao recomendada

Avancar para `BK-MF7-09` ou para o fecho operacional da MF7, mantendo como pre-condicoes smoke live SAF-T, validacao externa do XML quando aplicavel, integracao persistente sem skip e as ressalvas historicas ja registadas para browser real e backup/restauro.

## Reauditoria atual - BK-MF7-05 e BK-MF7-06 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-05`, `BK-MF7-06`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`
- Relatorio fonte: `auto`; relatorio de implementacao confrontado com a implementacao real atual
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Permissao de codigo: sem alteracoes de codigo
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Commits: nao executados

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-05, BK-MF7-06]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, guias `BK-MF7-04`, `BK-MF7-05`, `BK-MF7-06`, `BK-MF7-07` e guias vizinhos de MF6/MF8 para coerencia.
- `real_dev/api/src/modules/exports/exportFormatService.js`, `real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js`, `real_dev/api/src/modules/accounting-reports/accountingReportExporters.js`.
- `real_dev/api/src/modules/imports/importFileParser.js`, `real_dev/api/src/modules/imports/businessImportService.js`, `real_dev/api/src/modules/imports/businessImportValidators.js`, `real_dev/api/src/modules/imports/businessImportRoutes.js`.
- `real_dev/api/src/modules/treasury/statementImportValidators.js`, `real_dev/api/src/modules/integrations/integrationLogService.js`, `real_dev/api/prisma/schema.prisma`, migration `20260630120000_mf7_import_xlsx_format`.
- `real_dev/api/tests/contracts/mf7-export-contracts.test.js`, `real_dev/api/tests/contracts/mf7-import-contracts.test.js`, `real_dev/api/evidence/mf7-export-formats.md`, `real_dev/api/evidence/mf7-imports.md`.
- `real_dev/web/src/lib/apiClient.ts`, `real_dev/web/src/pages/mf2Pages.tsx`, `real_dev/api/package.json`, `real_dev/web/package.json`.

### Resultado geral

Estado geral: `PASS_COM_RISCOS`

A implementacao real atual contem os artefactos essenciais de `BK-MF7-05` e `BK-MF7-06`: exportacoes de balancete e razao nos formatos `csv`, `xlsx` e `pdf`; reutilizacao dos builders contabilisticos existentes; neutralizacao de formulas em CSV/XLSX; parser comum para CSV/XLSX; importacoes de dados mestre e extratos com validacao; logs de importacao/auditoria/integracao sem conteudo bruto do ficheiro; e testes de contrato dedicados.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` nesta ronda para os dois BKs auditados. O estado nao e `PASS` absoluto apenas porque a auditoria nao aplicou a migration numa base de dados real, nao executou smoke HTTP/browser contra uma app viva e manteve as limitacoes operacionais historicas de MF7 ja registadas nas rondas anteriores.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-05` | `RNF22`, `RF29` | `OK` | Endpoints `/trial-balance/export` e `/ledger/export` existem, aceitam `csv/xlsx/pdf`, usam `buildTrialBalance`/`buildLedger`, mantem `companyId` da sessao e passaram `test:mf7:exports`. |
| `BK-MF7-06` | `RNF23`, `RF33`, `RF35` | `OK` | `POST /api/imports/business-data` aceita CSV/XLSX, valida tipo/ficheiro/linhas, cria `BusinessImportRun`, `AuditLog` e `IntegrationLog`, ignora `companyId` forjado no body e passou `test:mf7:imports`. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-05` | `RNF22`; `RF29`; matriz/backlog MF7; guia `BK-MF7-05` | `exportFormatService.js`; `accountingReportRoutes.js`; `accountingReportExporters.js`; `apiClient.ts`; `mf2Pages.tsx`; `mf7-export-contracts.test.js`; `mf7-export-formats.md` | `syntax:check`; `test:mf7:exports`; `test:mf7`; `test:contracts`; `test:unit`; `npm --prefix real_dev/web run test:mf7`; `git diff --check`. |
| `BK-MF7-06` | `RNF23`; `RF33`; `RF35`; matriz/backlog MF7; guia `BK-MF7-06` | `importFileParser.js`; `businessImportService.js`; `businessImportValidators.js`; `businessImportRoutes.js`; `statementImportValidators.js`; `integrationLogService.js`; `schema.prisma`; migration `20260630120000_mf7_import_xlsx_format`; `mf7-import-contracts.test.js`; `mf7-imports.md` | `syntax:check`; `test:mf7:imports`; `test:mf7`; `test:contracts`; `test:unit`; `prisma:validate`; `git diff --check`. |

### Contratos consumidos de MFs anteriores

- `MF0`: sessao autenticada, cookie `sid`, contexto de empresa e RBAC usados pelas rotas protegidas.
- `MF2`: `buildTrialBalance`, `buildLedger`, contas, linhas contabilisticas e UI da pagina de balancete/razao foram reutilizados sem criar calculos paralelos.
- `MF3`: importacao de extratos, tipos de dados mestre e validadores de clientes/fornecedores/artigos foram reaproveitados para CSV/XLSX.
- `MF4`: `AuditLog` e `IntegrationLog` continuam a guardar metadados operacionais, nao ficheiros completos nem credenciais.
- `MF6`: hardening multiempresa e disciplina de nao confiar em dados de ownership vindos do browser foram preservados.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF7-05` entrega URLs canonicos de exportacao para balancete e razao, com formatos `csv`, `xlsx` e `pdf`, headers de download e neutralizacao contra spreadsheet formula injection.
- `BK-MF7-06` entrega contrato comum de importacao CSV/XLSX para dados mestre e extratos, com limite de linhas, validacao por dominio, contagens persistidas e logs sanitizados.
- `BK-MF7-07` pode partir de extratos importados em `CSV`, `OFX` e `XLSX`, mas SAF-T continua fora do escopo destes dois BKs.
- `MF8` pode consumir estes contratos como parte do fecho final, mantendo como pre-condicao a aplicacao de migrations e smoke operacional em ambiente real.

### Coerencia entre MFs e BKs vizinhos

- `MF6 -> MF7`: `OK_COM_RISCOS`. A implementacao auditada preserva sessao, permissao, contexto de empresa e validacao server-side.
- `BK-MF7-04 -> BK-MF7-05`: `OK`. Exportacoes nao dependem de provider externo de email e nao quebram o adapter transacional anterior.
- `BK-MF7-05 -> BK-MF7-06`: `OK`. Ambos operam sobre contratos contabilisticos e de ficheiros, mas sem acoplar exportacao a importacao.
- `BK-MF7-06 -> BK-MF7-07`: `OK_COM_RISCOS`. A base de importacao de extratos fica preparada para formatos tabulares; SAF-T e validacoes fiscais permanecem no BK seguinte.
- `MF7 -> MF8`: `OK_COM_RISCOS`. Os dois BKs auditados estao fechados tecnicamente, mas o fecho macro deve considerar as ressalvas historicas de backup/restauro, browser real e DB persistente ja registadas neste relatorio.

### Findings atuais

Nao foram encontrados findings ativos para `BK-MF7-05` ou `BK-MF7-06` nesta ronda.

Os riscos residuais sao operacionais e nao apontam para defeito confirmado no codigo auditado:

- Migration `20260630120000_mf7_import_xlsx_format` validada estaticamente e por teste, mas nao aplicada numa base de dados real nesta auditoria.
- Smoke HTTP/browser contra aplicacao viva nao executado; a cobertura obtida foi por testes de contrato de router/service, typecheck e build.
- `prisma:validate` sem `DATABASE_URL` falha por configuracao de ambiente; com `DATABASE_URL` dummy, o schema valida com sucesso.

### Pesquisa estatica

- Scan dirigido aos artefactos destes BKs para placeholders, codigo temporario, `as any`, storage local, `dangerouslySetInnerHTML`, `eval`, `new Function`, logs de passwords/tokens, CORS permissivo, operacoes globais Prisma e termos de IA fora de escopo: `PASS`, sem matches.
- Drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo): `PASS`, sem matches.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `npm --prefix real_dev/api run test:mf7:exports` | `PASS` | 4 testes passaram. |
| `npm --prefix real_dev/api run test:mf7:imports` | `PASS` | 6 testes passaram. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exports e imports MF7 passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 45 testes passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `npm --prefix real_dev/api run prisma:validate` | `FAIL_AMBIENTE` | Falhou apenas por falta de `DATABASE_URL`. |
| `DATABASE_URL='postgresql://opsa:opsa@localhost:5432/opsa' npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido sem tocar numa BD real. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility gate, `tsc --noEmit` e Vite build passaram. |
| `rg` de risco dirigido aos ficheiros auditados | `PASS` | Sem matches. |
| `rg` de drift de dominio dirigido aos ficheiros auditados | `PASS` | Sem matches. |
| `git diff --check` | `PASS` | Sem whitespace errors. |

### Validacoes nao executadas

- Smoke HTTP/browser com app viva para descarregar ficheiros reais e importar ficheiro real via UI: nao executado neste ambiente.
- Aplicacao da migration numa base PostgreSQL real: nao executada; apenas schema/migration/testes foram validados.
- `test:integration` sem skip e com base persistente dedicada: nao executado nesta ronda porque o escopo dos BKs 05/06 ficou coberto por contratos isolados e nao havia `TEST_DATABASE_URL` configurada para DB efemera.

### Ficheiros auditados principais

- `real_dev/api/src/modules/exports/exportFormatService.js`
- `real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js`
- `real_dev/api/src/modules/accounting-reports/accountingReportExporters.js`
- `real_dev/api/src/modules/imports/importFileParser.js`
- `real_dev/api/src/modules/imports/businessImportService.js`
- `real_dev/api/src/modules/imports/businessImportValidators.js`
- `real_dev/api/src/modules/imports/businessImportRoutes.js`
- `real_dev/api/src/modules/treasury/statementImportValidators.js`
- `real_dev/api/src/modules/integrations/integrationLogService.js`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/prisma/migrations/20260630120000_mf7_import_xlsx_format/migration.sql`
- `real_dev/api/tests/contracts/mf7-export-contracts.test.js`
- `real_dev/api/tests/contracts/mf7-import-contracts.test.js`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/mf2Pages.tsx`
- `real_dev/api/evidence/mf7-export-formats.md`
- `real_dev/api/evidence/mf7-imports.md`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- Nao ha blockers de codigo para `BK-MF7-05` ou `BK-MF7-06`.
- `TODO_OPERACIONAL`: aplicar a migration MF7 numa base PostgreSQL real antes do fecho operacional.
- `TODO_OPERACIONAL`: executar smoke HTTP/browser com downloads `csv/xlsx/pdf` e importacao CSV/XLSX numa app viva.
- `TODO_OPERACIONAL`: configurar `TEST_DATABASE_URL` efemera e correr integracao persistente sem skips antes do fecho global da macrofase.

### Proxima acao recomendada

Avancar para `BK-MF7-07` ou para o fecho operacional da MF7, mantendo como pre-condicoes a aplicacao da migration, o smoke live de exportacao/importacao e as ressalvas historicas ja registadas para backup/restauro e browsers reais.

## Reauditoria atual - BK-MF7-03 e BK-MF7-04 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-03`, `BK-MF7-04`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`
- Relatorio fonte: `auto`; relatorio de implementacao consultado contra a implementacao atual
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Permissao de codigo: sem alteracoes de codigo
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Commits: nao executados

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-03, BK-MF7-04]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, todos os guias `docs/planificacao/guias-bk/MF7/`, leitura dirigida de `BK-MF6-10`, `BK-MF7-02`, `BK-MF7-03`, `BK-MF7-04`, `BK-MF7-05` e guias iniciais de MF8 para coerencia vizinha.
- Relatorios existentes de implementacao/auditoria/correcao em `docs/planificacao/guias-bk/`, incluindo MF6 e MF7.
- `real_dev/web/package.json`, `real_dev/web/scripts/check-mf7-browser-compatibility.mjs`, `real_dev/web/evidence/mf7-browser-compatibility.md`, `real_dev/web/src/lib/apiClient.ts`, `real_dev/web/src/styles.css`, `real_dev/web/src/components/ResponsiveDataTable.tsx`, `real_dev/web/src`.
- `real_dev/api/package.json`, `real_dev/api/src/modules/notifications/transactionalEmailAdapter.js`, `real_dev/api/src/modules/auth/passwordResetEmailAdapter.js`, `real_dev/api/src/modules/notifications/notificationService.js`, `real_dev/api/tests/contracts/mf7-email-contracts.test.js`, `real_dev/api/evidence/mf7-email-integration.md`.

### Resultado geral

Estado geral: `PASS_COM_RISCOS`

A implementacao real atual contem os artefactos essenciais de `BK-MF7-03` e `BK-MF7-04`: gate automatico de compatibilidade cross-browser, build/typecheck frontend, evidencia operacional parcial, adapter transacional unico para emails, integracao com recuperacao de password, integracao com notificacoes e testes de contrato dedicados.

O estado nao e `PASS` absoluto porque `BK-MF7-03` ainda nao tem smoke manual real nos browsers exigidos pelo guia. A evidencia atual regista `BLOQUEADO_AMBIENTE` para Chrome, Edge e Firefox, e este ambiente nao expoe executaveis/aplicacoes desses browsers em `/Applications`, `~/Applications` ou no `PATH`. Assim, os gates automaticos provam a ausencia de padroes de risco conhecidos e a compilacao, mas nao substituem a prova manual de abertura e uso nos tres browsers.

Nao ha findings `P0` abertos nesta ronda. `BK-MF7-04` esta implementado e validado no escopo exigido; `BK-MF7-03` fica `PARCIAL` por falta de evidencia manual de runtime em browsers reais.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-03` | `RNF20` | `PARCIAL` | `check-mf7-browser-compatibility.mjs`, `test:mf7:browser-compatibility`, `typecheck` e `build` existem e passaram; falta smoke manual em Chrome, Edge e Firefox com versoes/resultados observados. |
| `BK-MF7-04` | `RNF21`, `RF05`, `RF46` | `OK` | `transactionalEmailAdapter.js`, integracao de password reset/notificacoes, evidencia MF7 email e 5 testes de contrato passaram. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-03` | `RNF20`; matriz/backlog MF7; guia `BK-MF7-03` | `real_dev/web/scripts/check-mf7-browser-compatibility.mjs`; `real_dev/web/evidence/mf7-browser-compatibility.md`; `real_dev/web/src/lib/apiClient.ts`; `real_dev/web/src/styles.css`; `real_dev/web/src/components/ResponsiveDataTable.tsx`; `real_dev/web/package.json` | `npm --prefix real_dev/web run test:mf7`; verificacao local de browsers disponiveis bloqueada por ambiente. |
| `BK-MF7-04` | `RNF21`; `RF05`; `RF46`; matriz/backlog MF7; guia `BK-MF7-04` | `real_dev/api/src/modules/notifications/transactionalEmailAdapter.js`; `real_dev/api/src/modules/auth/passwordResetEmailAdapter.js`; `real_dev/api/src/modules/notifications/notificationService.js`; `real_dev/api/tests/contracts/mf7-email-contracts.test.js`; `real_dev/api/evidence/mf7-email-integration.md`; `real_dev/api/package.json` | `npm --prefix real_dev/api run test:mf7`; `syntax:check`; `test:contracts`; `test:unit`; `test:integration` com skip explicito de persistencia. |

### Contratos consumidos de MFs anteriores

- `MF0`: sessao/cookie, `credentials: "include"`, utilizador autenticado e fluxo seguro de password reset.
- `MF4`: logs/auditoria e disciplina de nao expor tokens ou dados sensiveis em output operacional.
- `MF6`: hardening, cookies seguros, validacao de ambiente, gates `test:mf6:*` e protecao contra regressao de seguranca.
- `BK-MF7-01` e `BK-MF7-02`: cadeia operacional/legal preservada; a ressalva de backup/restauro positivo continua historica e fora do escopo corretivo desta ronda.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF7-03` entrega gate estavel `test:mf7:browser-compatibility`, evidencia parcial `mf7-browser-compatibility.md`, protecao contra padroes especificos de browser e confirmacao de `typecheck`/`build`.
- `BK-MF7-04` entrega adapter transacional unico com razoes permitidas, validacao minima de destinatario/conteudo, redacao de logs, compatibilidade com password reset e envio de alertas/lembretes por email.
- `BK-MF7-05` pode reutilizar o contrato de email transacional sem escolher provider externo nesta fase.
- `MF8` pode consumir estes gates como parte do fecho final, mantendo como pre-condicao a execucao real de smoke cross-browser e a ressalva historica de backup/restauro.

### Coerencia entre MFs e BKs vizinhos

- `MF6 -> MF7`: `OK_COM_RISCOS`. Os gates MF6 passaram e nao foram encontrados sinais de regressao em cookies, hardening ou redacao de dados sensiveis.
- `BK-MF7-02 -> BK-MF7-03`: `OK_COM_RISCOS`. A retencao nao foi alterada; o risco fica limitado a prova manual de browser ainda ausente.
- `BK-MF7-03 -> BK-MF7-04`: `OK_COM_RISCOS`. O fluxo frontend compila e o adapter de email esta testado, mas o smoke real em browsers continua necessario para fechar compatibilidade de UI.
- `BK-MF7-04 -> BK-MF7-05`: `OK`. O contrato de email transacional fica preparado sem decisao prematura de provider real.
- `MF7 -> MF8`: `OK_COM_RISCOS`. MF8 pode consumir os contratos, mas o fecho final deve exigir prova manual cross-browser e prova operacional historica de backup/restauro.

### Findings atuais

| Finding | Severidade | BK/RNF | Estado | Bloqueia MF? |
| --- | --- | --- | --- | --- |
| `MF7-IMP-AUD-20260630-BK03-F01` | `P1` | `BK-MF7-03` / `RNF20` | `BLOQUEADO_AMBIENTE` | Nao bloqueia o codigo atual, mas bloqueia o fecho `PASS` absoluto de `BK-MF7-03`. |

#### MF7-IMP-AUD-20260630-BK03-F01 - Smoke real Chrome/Edge/Firefox ainda nao executado

- Severidade: `P1`
- BK/RNF: `BK-MF7-03` / `RNF20`
- Estado: `BLOQUEADO_AMBIENTE`
- Evidencia objetiva:
  - O guia `BK-MF7-03` exige validacao manual em Chrome, Edge e Firefox, com versao testada, fluxo observado e resultado por browser.
  - `real_dev/web/evidence/mf7-browser-compatibility.md` regista Chrome, Edge e Firefox como `BLOQUEADO_AMBIENTE` e indica que o smoke manual nao foi executado nesta ronda automatizada.
  - `npm --prefix real_dev/web run test:mf7` passou, incluindo gate de compatibilidade, `typecheck` e `build`.
  - A pesquisa local por apps em `/Applications` e `~/Applications` nao encontrou Chrome, Edge ou Firefox.
  - `command -v google-chrome`, `command -v chromium`, `command -v firefox` e `command -v microsoft-edge` falharam neste ambiente.
  - Os negativos da evidencia de browser estao documentados como cobertura por padroes proibidos no gate, mas nao como mutacoes negativas executadas em ficheiros isolados.
- Expected:
  - Abrir a aplicacao em Chrome, Edge e Firefox.
  - Registar versao de cada browser, fluxo observado, resultado e screenshots/logs se aplicavel.
  - Executar ou simular de forma isolada os negativos do gate para provar que o script falha quando encontra padroes proibidos.
- Observed:
  - A prova automatica existe e passou.
  - A prova manual real em browsers nao existe neste ambiente.
- Impacto:
  - `RNF20` fica parcialmente provado, mas nao demonstrado em runtime real nos tres browsers exigidos.
- Correcao recomendada:
  - Executar o smoke num ambiente com Chrome, Edge e Firefox instalados, atualizar `real_dev/web/evidence/mf7-browser-compatibility.md` com versoes/resultados observados e repetir `npm --prefix real_dev/web run test:mf7`.
  - Se o projeto quiser endurecer o gate, acrescentar testes negativos isolados para o script de compatibilidade sem alterar os ficheiros reais da app.

### Findings por BK-MF7-04

Nao foram encontrados findings ativos para `BK-MF7-04` nesta ronda.

O adapter transacional valida razoes permitidas, rejeita destinatario invalido antes de chamar provider, evita logar email/token/link completo, mantem a interface de password reset e suporta notificacoes de alerta/lembrete atraves do mesmo contrato. A ausencia de provider real fica alinhada com o guia, que pede apenas arquitetura preparada e nao decisao operacional de fornecedor.

### Pesquisa estatica

- Scan obrigatorio em `real_dev/api` e `real_dev/web`: `PASS_COM_OBSERVACOES`.
- Matches de `secret`, `token`, `password` e storage foram contextuais/defensivos: filtros de redacao, testes negativos, adapters que evitam expor tokens e storage privado.
- Scan direcionado aos artefactos MF7 novos: sem `localStorage`, `sessionStorage`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `as any`, `payload: unknown`, `deleteMany({})`, `delete({})`, `updateMany({})` ou CORS permissivo novo.
- Drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, turma, professor, sala, material de estudo): `PASS`, sem matches.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja continha alteracoes documentais fora deste escopo; preservadas. |
| `git check-ignore -v real_dev real_dev/api/package.json real_dev/web/package.json real_dev/api/src/modules/notifications/transactionalEmailAdapter.js real_dev/web/scripts/check-mf7-browser-compatibility.mjs` | `PASS` | `real_dev/` esta ignorado por `.gitignore:4`, comportamento esperado nesta PAP. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Gate MF7 browser compatibility, `tsc --noEmit` e Vite build passaram. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao MF7 e 5 contratos de email passaram. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 35 testes passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `DATABASE_URL='postgresql://user:password@localhost:5432/opsa' npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS` | 2 testes saltados explicitamente por falta de base persistente configurada. |
| `npm --prefix real_dev/api run test:mf6` | `PASS_COM_RESSALVAS` | Gates MF6 passaram; concorrencia em `mode: local-contract`. |
| Pesquisa por Chrome/Edge/Firefox em `/Applications` e `~/Applications` | `BLOQUEADO_AMBIENTE` | Nenhuma app dos browsers alvo encontrada. |
| `command -v google-chrome`, `chromium`, `firefox`, `microsoft-edge` | `BLOQUEADO_AMBIENTE` | Nenhum executavel de browser alvo encontrado no `PATH`. |
| `rg` de risco em `real_dev/api real_dev/web` | `PASS_COM_OBSERVACOES` | Apenas matches contextuais/defensivos. |
| `rg` de drift de dominio em `real_dev/api real_dev/web` | `PASS` | Sem matches. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental ampla fora deste alvo. |

### Validacoes nao executadas

- Smoke manual em Chrome, Edge e Firefox: nao executado porque este ambiente nao expoe browsers alvo instalados ou invocaveis.
- Testes negativos mutacionais do gate de browser: nao executados como mutacao real; a evidencia atual demonstra cobertura por pesquisa de padroes proibidos.
- `test:integration` com base real persistente e sem skip: nao executado porque nao existe `TEST_DATABASE_URL` configurada para base efemera de teste.

### Ficheiros auditados principais

- `real_dev/web/package.json`
- `real_dev/web/scripts/check-mf7-browser-compatibility.mjs`
- `real_dev/web/evidence/mf7-browser-compatibility.md`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/styles.css`
- `real_dev/web/src/components/ResponsiveDataTable.tsx`
- `real_dev/api/package.json`
- `real_dev/api/src/modules/notifications/transactionalEmailAdapter.js`
- `real_dev/api/src/modules/auth/passwordResetEmailAdapter.js`
- `real_dev/api/src/modules/notifications/notificationService.js`
- `real_dev/api/tests/contracts/mf7-email-contracts.test.js`
- `real_dev/api/evidence/mf7-email-integration.md`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- `TODO_OPERACIONAL`: executar smoke real de `BK-MF7-03` em Chrome, Edge e Firefox, registando versoes, fluxos e resultados observados.
- `TODO_OPERACIONAL`: configurar `TEST_DATABASE_URL` efemera e correr `npm run test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- `TODO_OPCIONAL`: acrescentar prova negativa isolada para o gate de compatibilidade de browser, sem mutar ficheiros reais da app.

### Proxima acao recomendada

Fechar `BK-MF7-03` em ambiente com Chrome, Edge e Firefox disponiveis: abrir a app, executar os fluxos principais definidos no guia, registar versoes/resultados em `real_dev/web/evidence/mf7-browser-compatibility.md` e repetir `npm --prefix real_dev/web run test:mf7`. `BK-MF7-04` nao requer correcao adicional no escopo auditado.

## Reauditoria atual - BK-MF7-01 e BK-MF7-02 - 2026-06-29

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BKs auditados: `BK-MF7-01`, `BK-MF7-02`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`, apenas para validacoes gerais de stack
- Relatorio fonte: `auto`; relatorio anterior reavaliado contra a implementacao atual
- Relatorio de implementacao consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- Permissao de codigo: sem alteracoes de codigo
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Commits: nao executados

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-01, BK-MF7-02]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, todos os guias `docs/planificacao/guias-bk/MF7/`, leitura dirigida de `BK-MF6-10`, `BK-MF7-03`, `BK-MF7-10` e MF8 para coerencia vizinha.
- Relatorios existentes de hidratacao/implementacao/auditoria em `docs/planificacao/guias-bk/`, incluindo MF6 e MF7.
- `real_dev/api/package.json`, `real_dev/web/package.json`, `real_dev/api/prisma/schema.prisma`, migration MF7, scripts MF7, modulos de compliance/auditoria, testes unitarios, routes/services relevantes e `real_dev/web/src`.

### Resultado geral

Estado geral: `PASS_COM_RISCOS`

A implementacao real atual ja contem os artefactos essenciais dos dois BKs auditados: scripts de backup/verificacao, comandos npm MF7, modelo `RetentionHold`, migration, politica de retencao, gate de remocao, acao sensivel de auditoria e testes unitarios dedicados.

O estado nao e `PASS` absoluto porque `BK-MF7-01` ainda nao tem prova positiva completa neste ambiente: `pg_dump` e `pg_restore` nao estao disponiveis no PATH nem nos caminhos comuns verificados, por isso nao foi possivel gerar um dump real nem obter `restorable: true` via `pg_restore --list`. Tambem nao houve teste de integracao com base real sem skip, nem prova HTTP/manual de DELETE com retencao ativa porque o codigo atual nao expoe endpoints destrutivos para as entidades protegidas por este BK.

Nao ha findings `P0` abertos. A auditoria anterior que marcava ausencia total de scripts e retencao ficou desatualizada face ao estado atual do `real_dev`.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-01` | `RNF18` | `PARCIAL` | `run-daily-backup.mjs`, `verify-backup-restore.mjs`, `mf7:backup` e `mf7:backup:verify` existem; sintaxe e negativos passaram; falta prova positiva com `pg_dump`/`pg_restore`. |
| `BK-MF7-02` | `RNF19` | `OK` | `RetentionHold`, `Company.retentionHolds`, migration, `retentionPolicy.js`, `retentionDeletionGate.js`, `RETENTION_HOLD_ACTIVE`, `"retention.delete.allowed"` e `test:mf7:retention` existem e validaram. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-01` | `RNF18`; matriz/backlog MF7; guia `BK-MF7-01` | `real_dev/api/scripts/run-daily-backup.mjs`; `real_dev/api/scripts/verify-backup-restore.mjs`; `real_dev/api/package.json` | `syntax:check`; negativos `mf7:backup`; negativos `mf7:backup:verify`; prova positiva bloqueada por ferramentas ausentes. |
| `BK-MF7-02` | `RNF19`; `RNF17`; contrato MF6 `recordSensitiveAudit`; guia `BK-MF7-02` | `real_dev/api/prisma/schema.prisma`; `real_dev/api/prisma/migrations/20260629120000_mf7_retention_holds/migration.sql`; `auditLogService.js`; `httpErrors.js`; `retentionPolicy.js`; `retentionDeletionGate.js`; `retentionPolicy.test.js`; `package.json` | `prisma:validate`; `test:mf7:retention`; `test:unit`; `test:contracts`; `test:mf6`. |

### Contratos consumidos de MFs anteriores

- `MF0`: sessao/cookie, utilizador autenticado, roles/permissoes e empresa ativa resolvida no backend.
- `MF1..MF3`: entidades contabilisticas e fiscais usadas como alvo de retencao (`SaleDocument`, `PurchaseDocument`, `JournalEntry`, `VatMapRun`, `SaftExportRun`).
- `MF4`: `AuditLog` como entidade de rastreabilidade.
- `MF6`: `recordSensitiveAudit`, hardening, ambiente validado, cookies seguros e gates `test:mf6:*`.

### Contratos entregues para BKs/MFs seguintes

- `BK-MF7-01` entrega comandos estaveis `mf7:backup` e `mf7:backup:verify`, manifesto com `sha256`, `engine`, `sizeBytes` e verificacao por `pg_restore --list`.
- `BK-MF7-02` entrega `RetentionHold` multiempresa, erro `409 RETENTION_HOLD_ACTIVE`, acao sensivel `"retention.delete.allowed"` e funcoes de dominio para documentos, lancamentos, mapas de IVA, SAF-T e logs de auditoria.
- `BK-MF7-03` recebe a cadeia operacional/legal preparada, mas deve manter a ressalva de que o fluxo positivo de backup/restauro ainda precisa de ambiente com PostgreSQL tools.
- `MF8` pode consumir estes contratos para logs estruturados, health-check e fecho final, mantendo como pre-condicao operacional a validacao real de backup/restauro.

### Coerencia entre MFs

- `MF6 -> MF7`: `OK_COM_RISCOS`. `recordSensitiveAudit` foi preservado e estendido com `"retention.delete.allowed"` sem remover acoes MF6. Os gates MF6 passaram.
- `BK-MF7-01 -> BK-MF7-02`: `OK_COM_RISCOS`. O contrato de backup existe, mas o fluxo feliz ainda nao foi provado neste ambiente.
- `MF7 -> MF8`: `OK_COM_RISCOS`. A MF8 recebe contratos tecnicos reutilizaveis, mas o fecho final deve exigir prova `restorable: true` e integracao persistente sem skip.

### Findings atuais

| Finding | Severidade | BK/RNF | Estado | Bloqueia MF? |
| --- | --- | --- | --- | --- |
| `MF7-IMP-AUD-20260629-BK01-F01` | `P1` | `BK-MF7-01` / `RNF18` | `BLOQUEADO` | Nao bloqueia o codigo atual, mas bloqueia o fecho `PASS` absoluto ate existir evidence `restorable: true`. |

#### MF7-IMP-AUD-20260629-BK01-F01 - Backup/restauro implementado sem prova positiva local

- Severidade: `P1`
- BK/RNF: `BK-MF7-01` / `RNF18`
- Estado: `BLOQUEADO`
- Evidencia objetiva:
  - `real_dev/api/scripts/run-daily-backup.mjs` existe e usa `spawnSync("pg_dump", ["--format=custom", "--no-owner", "--file", backupPath, databaseUrl])`.
  - `real_dev/api/scripts/verify-backup-restore.mjs` existe e usa `spawnSync("pg_restore", ["--list", backupPath])`.
  - `real_dev/api/package.json` expoe `mf7:backup` e `mf7:backup:verify`.
  - `command -v pg_dump` e `command -v pg_restore` sairam com exit code `1` neste ambiente.
  - Os caminhos `/opt/homebrew/bin`, `/opt/homebrew/opt/libpq/bin`, `/usr/local/bin` e `/Applications/Postgres.app/Contents/Versions/latest/bin` tambem nao contem `pg_dump`/`pg_restore`.
  - Os negativos executados falharam com mensagens controladas: `DATABASE_URL` ausente, ficheiro inexistente, ficheiro vazio e ferramenta PostgreSQL ausente.
- Expected:
  - Gerar dump PostgreSQL real com manifesto sem credenciais.
  - Verificar o dump com `pg_restore --list`.
  - Obter evidence com `restorable: true` e `catalogEntries > 0`.
- Observed:
  - O codigo e os negativos existem, mas a prova positiva continua bloqueada por falta de `pg_dump`/`pg_restore`.
- Impacto:
  - `RNF18` fica tecnicamente preparado, mas ainda sem evidence operacional completa.
- Correcao recomendada:
  - Instalar ferramentas PostgreSQL no ambiente de validacao, criar base efemera segura, executar `mf7:backup` e depois `mf7:backup:verify` sobre o dump gerado.

### Findings historicos reavaliados

| Finding historico | Estado atual | Evidencia atual |
| --- | --- | --- |
| Ausencia de scripts de backup/restauro | `BLOQUEADO` | Scripts e comandos existem; negativos passam; falta fluxo feliz com ferramentas externas. |
| Ausencia de retencao legal contabilistica | `JA_CORRIGIDO` | `RetentionHold`, migration, politica, gate, auditoria, HTTP error mapping e 9 testes MF7 existem e passaram. |

### Observacoes sobre integracao de retencao

- A pesquisa por chamadas a `assertSaleDocumentDeletionAllowed`, `assertPurchaseDocumentDeletionAllowed`, `assertJournalEntryDeletionAllowed`, `assertVatMapRunDeletionAllowed`, `assertSaftExportRunDeletionAllowed` e `assertAuditLogDeletionAllowed` encontrou uso apenas no gate e nos testes.
- A pesquisa por endpoints destrutivos nas entidades protegidas nao encontrou `DELETE` real para `SaleDocument`, `PurchaseDocument`, `JournalEntry`, `VatMapRun`, `SaftExportRun` ou `AuditLog`.
- Como o guia tambem define que este BK nao deve criar endpoints novos, isto fica como limitacao de prova runtime/manual e nao como `P0` ativo: quando um service destrutivo dessas entidades existir, deve chamar a funcao de dominio correspondente antes da remocao.

### Pesquisa estatica

- Scan obrigatorio em `real_dev/api` e `real_dev/web`: `PASS_COM_OBSERVACOES`.
- Matches de `secret`, `token`, `password` e storage foram contextuais/defensivos: filtros de auditoria, testes negativos, adapters que evitam expor tokens e storage privado.
- Scan direcionado aos ficheiros MF7 novos: apenas matches defensivos em `auditLogService.js` e comentario de `httpErrors.js`; sem `localStorage`, `sessionStorage`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `as any`, `payload: unknown`, `deleteMany({})`, `delete({})` ou `updateMany({})`.
- Drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, turma, professor, sala, material de estudo): `PASS`, sem matches.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja continha alteracoes documentais/MF8 fora deste escopo; preservadas. |
| `git check-ignore -v real_dev real_dev/api/package.json` | `PASS` | `real_dev/` esta ignorado por `.gitignore:4`, comportamento esperado nesta PAP. |
| `npm run syntax:check` em `real_dev/api` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL='postgresql://user:password@localhost:5432/opsa' npm run prisma:validate` em `real_dev/api` | `PASS` | Schema Prisma valido com `RetentionHold`. |
| `npm run test:mf7:retention` em `real_dev/api` | `PASS` | 9 testes passaram. |
| `npm run test:unit` em `real_dev/api` | `PASS` | 74 testes passaram. |
| `npm run test:contracts` em `real_dev/api` | `PASS` | 30 testes passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm run test:integration` em `real_dev/api` | `PASS_COM_RESSALVAS` | 2 testes saltados explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm run test:mf6` em `real_dev/api` | `PASS_COM_RESSALVAS` | Gates MF6 passaram; concorrencia em `mode: local-contract`. |
| `npm run typecheck` em `real_dev/web` | `PASS` | TypeScript sem erros. |
| `npm run build` em `real_dev/web` | `PASS` | Vite build passou. |
| `command -v pg_dump` | `FAIL_ESPERADO` | Ferramenta ausente no ambiente. |
| `command -v pg_restore` | `FAIL_ESPERADO` | Ferramenta ausente no ambiente. |
| `DATABASE_URL= npm run mf7:backup` em `real_dev/api` | `NEGATIVO_PASS` | Falhou com `DATABASE_URL em falta para executar backup`. |
| `DATABASE_URL='postgresql://user:password@localhost:5432/opsa_test' OPSA_BACKUP_DIR=/private/tmp/opsa-mf7-backup-validation npm run mf7:backup` | `BLOQUEADO_AMBIENTE` | Falhou com `pg_dump nao arrancou`. |
| `npm run mf7:backup:verify` em `real_dev/api` | `NEGATIVO_PASS` | Falhou com falta de `--file`/`OPSA_BACKUP_FILE`. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/inexistente.dump npm run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou com backup nao encontrado. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/vazio.dump npm run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou com ficheiro vazio. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/fake.dump npm run mf7:backup:verify` | `BLOQUEADO_AMBIENTE` | Falhou com `pg_restore nao arrancou`. |
| `rg` de risco em `real_dev/api real_dev/web` | `PASS_COM_OBSERVACOES` | Apenas matches contextuais/defensivos. |
| `rg` de drift de dominio em `real_dev/api real_dev/web` | `PASS` | Sem matches. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental ampla fora deste alvo. |
| `git diff --check` | `PASS` | Sem erros de whitespace nas alteracoes tracked existentes. |

### Validacoes nao executadas

- Fluxo feliz real de `mf7:backup` e `mf7:backup:verify`: nao executado porque `pg_dump` e `pg_restore` nao estao instalados neste ambiente.
- `test:integration` com base real persistente e sem skip: nao executado porque nao existe `TEST_DATABASE_URL` configurada para base efemera de teste.
- Prova manual HTTP de `DELETE` com `RetentionHold.retainUntil` no futuro: nao executada porque nao existem endpoints destrutivos reais para as entidades protegidas neste escopo.

### Ficheiros auditados principais

- `real_dev/api/package.json`
- `real_dev/api/scripts/run-daily-backup.mjs`
- `real_dev/api/scripts/verify-backup-restore.mjs`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/prisma/migrations/20260629120000_mf7_retention_holds/migration.sql`
- `real_dev/api/src/modules/audit/auditLogService.js`
- `real_dev/api/src/lib/httpErrors.js`
- `real_dev/api/src/modules/compliance/retentionPolicy.js`
- `real_dev/api/src/modules/compliance/retentionDeletionGate.js`
- `real_dev/api/tests/unit/retentionPolicy.test.js`
- Services/routes destrutivos relevantes em `real_dev/api/src/modules`

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- `TODO_OPERACIONAL`: instalar `pg_dump` e `pg_restore`, executar backup real contra base efemera segura e guardar evidence com manifesto e `restorable: true`.
- `TODO_OPERACIONAL`: configurar `TEST_DATABASE_URL` efemera e correr `npm run test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- `TODO_RUNTIME`: quando existirem endpoints/services destrutivos para entidades contabilisticas protegidas, integrar a funcao de dominio correspondente antes da remocao efetiva e acrescentar teste de contrato/integacao.

### Proxima acao recomendada

Fechar `BK-MF7-01` com uma validacao operacional em ambiente que tenha ferramentas PostgreSQL instaladas: gerar dump real, verificar com `pg_restore --list`, guardar manifesto seguro e repetir os negativos. Depois avancar para `BK-MF7-03` mantendo esta ressalva explicita ate haver evidence `restorable: true`.

## Reauditoria atual - BK-MF7-01 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BK auditado: `BK-MF7-01`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`, apenas para coerencia MF7.
- Permissao de codigo: sem alteracoes de codigo.
- Permissao documental: apenas este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.
- Commits: nao executados.

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-01]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.
- Documentos canonicos: `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `CONTRATO-STACK-IMPLEMENTACAO.md`, `DISTRIBUICAO-RESPONSABILIDADES.md`, `PLANO-IMPLEMENTACAO-TOTAL.md`, `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`, `guias-bk/README.md` e `_TEMPLATE-BK.md`.
- Guias relevantes: todos os guias `MF7`, com foco em `BK-MF7-01`; coerencia com `BK-MF6-10`, `BK-MF7-02` e `BK-MF8-01`.
- Codigo real: `real_dev/api/package.json`, `real_dev/web/package.json`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/scripts/run-daily-backup.mjs`, `real_dev/api/scripts/verify-backup-restore.mjs` e gates/testes MF6/MF7.

### Resultado geral

Estado geral do BK alvo: `PASS_COM_RISCOS`.

`BK-MF7-01` esta implementado estruturalmente no backend real: existem os scripts `mf7:backup` e `mf7:backup:verify`, o backup usa `pg_dump` em formato custom, o manifesto guarda `file`, `sizeBytes`, `createdAt`, `engine` e `sha256`, e a verificacao usa `pg_restore --list` sem restaurar dados numa base real. Os scripts nao publicam `DATABASE_URL`, caminhos absolutos completos nem conteudo financeiro no manifesto/evidence.

O estado nao e `PASS` absoluto porque a prova positiva do fluxo feliz continua bloqueada pelo ambiente: `pg_dump` e `pg_restore` nao existem no `PATH`, logo nao foi possivel gerar um dump real nem obter evidence `restorable: true`.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF7-01` | `RNF18` | `PARCIAL` / `AUDITADO_COM_FINDINGS` | Scripts e comandos existem; `syntax:check`, Prisma, MF6, MF7 API/web, unit e contracts passaram; negativos de backup/verificacao passaram; fluxo feliz bloqueado por falta de `pg_dump`/`pg_restore`. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF7-01` | `RNF18`; matriz/backlog MF7; guia `BK-MF7-01` | `real_dev/api/scripts/run-daily-backup.mjs`; `real_dev/api/scripts/verify-backup-restore.mjs`; `real_dev/api/package.json`; `real_dev/api/prisma/schema.prisma` | `syntax:check`; `prisma:validate`; `mf7:backup`; `mf7:backup:verify`; `test:mf7`; `test:unit`; `test:contracts`; `test:mf6`; web `test:mf7`; scans estaticos; `validate-planificacao.sh`; `git diff --check`. |

### Implementacao encontrada

- `run-daily-backup.mjs` carrega `.env` local quando executado como CLI, exige `DATABASE_URL`, cria a pasta de backup, executa `spawnSync("pg_dump", ["--format=custom", "--no-owner", "--file", backupPath, databaseUrl])`, rejeita ficheiro vazio, calcula SHA-256 por stream e grava manifesto seguro.
- `verify-backup-restore.mjs` aceita `--file` ou `OPSA_BACKUP_FILE`, rejeita ausencia de ficheiro, ficheiro inexistente e ficheiro vazio, executa `spawnSync("pg_restore", ["--list", backupPath])` e devolve evidence com `restorable: true` apenas quando existem entradas restauraveis.
- `real_dev/api/package.json` expoe `mf7:backup` e `mf7:backup:verify`.
- Nao ha alteracoes Prisma exigidas por este BK; `schema.prisma` validou com URL dummy.

### Contratos consumidos

- `MF6 -> MF7`: `BK-MF6-10` entrega disciplina de auditoria sensivel e evidence operacional para temas de seguranca; os gates MF6 passaram.
- `BK-MF7-01` consome a stack backend real em `real_dev/api`, Node.js ESM, Prisma/PostgreSQL e scripts npm existentes.
- A regra multiempresa continua preservada por nao aceitar `companyId` arbitrario para decidir ownership neste BK; os scripts sao operacionais e nao expõem endpoint publico.

### Contratos entregues

- Comando operacional `npm --prefix real_dev/api run mf7:backup`.
- Comando operacional `npm --prefix real_dev/api run mf7:backup:verify`.
- Manifesto de backup sem credenciais e com hash SHA-256.
- Contrato de verificacao segura por `pg_restore --list`, ainda pendente de prova positiva em ambiente com ferramentas PostgreSQL.
- Handoff para `BK-MF7-02`: contexto operacional/legal existe, mas a evidence positiva de restauro deve continuar marcada como pre-condicao operacional.

### Coerencia entre MFs

- `MF6 -> MF7`: `OK_COM_RISCOS`. Os gates MF6 passaram e o BK nao enfraquece autenticacao, autorizacao, hardening, auditoria ou contexto multiempresa.
- `BK-MF7-01 -> BK-MF7-02`: `OK_COM_RISCOS`. O contrato operacional de backup existe, mas o fluxo feliz real ainda nao foi provado por falta de ferramentas externas.
- `MF7 -> MF8`: `OK_COM_RISCOS`. MF8 pode consumir os contratos/gates MF7, mas o fecho final deve exigir evidence real de backup/restauro com `restorable: true`.

### Findings atuais

| Finding | Severidade | BK/RNF | Estado | Impacto |
| --- | --- | --- | --- | --- |
| `MF7-IMP-AUD-20260630-BK01-F01` | `P1` | `BK-MF7-01` / `RNF18` | `BLOQUEADO_AMBIENTE` | Bloqueia o `PASS` absoluto ate existir dump real e verificacao `pg_restore --list` com `restorable: true`. |

#### MF7-IMP-AUD-20260630-BK01-F01 - Backup/restauro sem prova positiva por falta de ferramentas PostgreSQL

- Severidade: `P1`
- Estado: `BLOQUEADO_AMBIENTE`
- Expected: executar `mf7:backup`, gerar `.dump` e manifesto, depois executar `mf7:backup:verify` sobre o dump e obter `restorable: true`.
- Observed: `command -v pg_dump` e `command -v pg_restore` sairam com exit code `1`; a tentativa de backup com `DATABASE_URL` dummy falhou com `pg_dump nao arrancou`; a verificacao de ficheiro nao vazio falhou com `pg_restore nao arrancou`.
- Impacto: o codigo esta preparado e os negativos passam, mas `RNF18` ainda nao tem evidence operacional completa neste ambiente.
- Correcao recomendada: validar num ambiente com PostgreSQL client tools instaladas, base efemera segura e dados controlados; guardar manifesto e output `restorable: true`.
- Bloqueia MF: nao bloqueia a existencia do codigo atual, mas bloqueia o fecho `PASS` absoluto de `BK-MF7-01`.

### Findings por severidade

| Severidade | Quantidade ativa | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 1 | `BLOQUEADO_AMBIENTE` por falta de `pg_dump`/`pg_restore`. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado nesta ronda. |

### Pesquisa estatica

- Scan obrigatorio em `real_dev/api` e `real_dev/web`: `PASS_COM_OBSERVACOES`. Os matches encontrados foram defensivos/contextuais: testes com tokens falsos, filtros de redacao de `secret`/`token`/`password`, comentarios de protecao e storage privado.
- Drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo): `PASS`, sem matches.
- Scan dirigido a `companyId`: `PASS_COM_OBSERVACAO`. A ocorrencia `body.companyId` pertence ao endpoint autenticado `/api/session/company` para troca de empresa ativa; nos services auditados, `companyId` continua a entrar como contexto backend.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Worktree ja continha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web real_dev/api/scripts/run-daily-backup.mjs real_dev/api/scripts/verify-backup-restore.mjs` | `PASS` | `real_dev/` esta ignorado por `.gitignore:4`, esperado nesta PAP. |
| `command -v pg_dump` | `BLOQUEADO_AMBIENTE` | Exit code `1`; ferramenta ausente. |
| `command -v pg_restore` | `BLOQUEADO_AMBIENTE` | Exit code `1`; ferramenta ausente. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `npm --prefix real_dev/api run test:mf7:retention` | `PASS` | 9 testes passaram; coerencia com `BK-MF7-02`. |
| `npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS` | 3 testes passaram; handoff MF7 final preservado. |
| `DATABASE_URL= npm --prefix real_dev/api run mf7:backup` | `NEGATIVO_PASS` | Falhou com `DATABASE_URL em falta para executar backup`. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa_test OPSA_BACKUP_DIR=/private/tmp/opsa-mf7-backup-validation npm --prefix real_dev/api run mf7:backup` | `BLOQUEADO_AMBIENTE` | Falhou com `pg_dump nao arrancou. Confirma se a ferramenta PostgreSQL esta instalada.` |
| `npm --prefix real_dev/api run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou com falta de `--file`/`OPSA_BACKUP_FILE`. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/missing.dump npm --prefix real_dev/api run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou com `Backup nao encontrado`. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/empty.dump npm --prefix real_dev/api run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou com `Backup invalido: ficheiro vazio`. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/fake.dump npm --prefix real_dev/api run mf7:backup:verify` | `BLOQUEADO_AMBIENTE` | Falhou com `pg_restore nao arrancou`. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exports, imports, SAF-T, backend modules e critical modules passaram. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility gate, frontend modules, typecheck e build passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/api run test:mf6` | `PASS` | Gates MF6 passaram; concorrencia em `mode: local-contract`. |
| `rg` de risco em `real_dev/api real_dev/web` | `PASS_COM_OBSERVACOES` | Matches contextuais/defensivos; sem finding novo. |
| `rg` de drift de dominio em `real_dev/api real_dev/web` | `PASS` | Sem matches. |
| `rg` dirigido a `body.companyId`/`query.companyId` | `PASS_COM_OBSERVACAO` | Fluxo legitimo de troca de empresa ativa; sem ownership arbitrario nos services auditados. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental historica/preexistente. |

### Validacoes nao executadas

- Fluxo feliz real `mf7:backup` + `mf7:backup:verify`: nao executado porque `pg_dump` e `pg_restore` nao estao instalados neste ambiente.
- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado por falta de `TEST_DATABASE_URL` efemera/persistente configurada.
- Instalacao de PostgreSQL client tools: nao executada por ser alteracao de ambiente fora do repositorio e sem autorizacao explicita nesta prompt.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- `BLOCKER_AMBIENTE`: instalar/disponibilizar `pg_dump` e `pg_restore` no ambiente de validacao.
- `TODO_OPERACIONAL`: executar backup real contra base efemera segura, verificar com `pg_restore --list` e guardar evidence com manifesto e `restorable: true`.
- `TODO_OPERACIONAL`: configurar `TEST_DATABASE_URL` efemera e correr `test:integration` sem skip quando for necessario fechar prova persistente completa.

### Proxima acao recomendada

Executar a prova operacional de `BK-MF7-01` num ambiente com PostgreSQL client tools: gerar o dump, verificar com `pg_restore --list`, guardar o manifesto sem credenciais e repetir os negativos. Com essa evidence positiva, o BK pode sair de `PASS_COM_RISCOS` para `PASS`.

## Reauditoria atual - BK-MF7-02 - 2026-06-30 - validacao de mutacoes destrutivas

### Escopo desta passagem

- Prompt executada: `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-02]`, `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`.
- Restricoes respeitadas: sem commits, sem alteracoes em codigo, sem alteracoes em guias BK canonicos, RF/RNF, backlog, matriz, sprints, `apps/`, `mockup/` ou `real_dev`.
- Artefacto permitido e atualizado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`.

### Resultado geral

Estado desta passagem para `BK-MF7-02`: `PASS_COM_RISCOS`.

Motivo: a base de retencao legal existe e esta coberta por testes especificos, mas foi encontrado um caminho de mutacao destrutiva em lancamentos manuais que substitui linhas contabilisticas sem consultar o gate de retencao. Nao foi encontrado `P0`, mas existe um `P1` ativo que impede classificar o BK como `PASS` absoluto.

### Evidencia positiva confirmada

- `real_dev/api/prisma/schema.prisma`: contem `RetentionHold`, relacao `Company.retentionHolds`, `onDelete: Restrict`, unique composto `[companyId, entity, entityId]` e indices por entidade/data de retencao.
- `real_dev/api/prisma/migrations/20260629120000_mf7_retention_holds/migration.sql`: cria a tabela `retention_holds` com constraints e indices equivalentes ao schema.
- `real_dev/api/src/modules/compliance/retentionPolicy.js`: define entidades protegidas, calculo de retencao de 10 anos, `RetentionHoldActiveError`, estado HTTP `409` e bloqueio quando a retencao esta ativa.
- `real_dev/api/src/modules/compliance/retentionDeletionGate.js`: centraliza o gate e expoe helpers de dominio para `SaleDocument`, `PurchaseDocument`, `JournalEntry`, `VatMapRun`, `SaftExportRun` e `AuditLog`.
- `real_dev/api/src/modules/audit/auditLogService.js`: inclui `retention.delete.allowed` em `SENSITIVE_ACTIONS` e mantem filtros contra dados sensiveis nos detalhes do audit log.
- `real_dev/api/src/lib/httpErrors.js`: preserva o mapeamento de `RETENTION_HOLD_ACTIVE` para resposta HTTP `409` com `entity`, `entityId` e `retainUntil`.
- `real_dev/api/tests/unit/retentionPolicy.test.js`: cobre calculo de 10 anos, entidades protegidas, bloqueio ativo, remocao permitida apos retencao, auditoria quando permitido e ausencia de auditoria quando bloqueado.

### Findings ativos

| Finding | Severidade | BK/RNF | Estado | Impacto |
| --- | --- | --- | --- | --- |
| `MF7-IMP-AUD-20260630-BK02-F01` | `P1` | `BK-MF7-02` / `RNF19` | `PARCIAL` | Permite alterar linhas de um lancamento manual retido sem passar pelo gate de retencao legal. |

#### MF7-IMP-AUD-20260630-BK02-F01 - Atualizacao de lancamento manual substitui linhas sem gate de retencao

- Severidade: `P1`
- Estado: `PARCIAL`
- Expected: qualquer operacao destrutiva sobre entidades contabilisticas protegidas, incluindo `JournalEntry`, deve consultar o gate de retencao antes de apagar/remover/substituir dados protegidos.
- Observed: `real_dev/api/src/modules/accounting/manualJournalRoutes.js:85` expoe `PATCH /manual-journals/:id`; `real_dev/api/src/modules/accounting/manualJournalService.js:146` implementa `updateManualJournal`; dentro da transacao, `real_dev/api/src/modules/accounting/manualJournalService.js:154` executa `tx.journalEntryLine.deleteMany({ where: { journalEntryId: id } })` e recria as linhas sem chamar `assertJournalEntryDeletionAllowed` nem `assertAccountingDeletionGate`.
- Evidencia complementar: `real_dev/api/src/modules/compliance/retentionDeletionGate.js:101` ja disponibiliza `assertJournalEntryDeletionAllowed`, mas a pesquisa dirigida nao encontrou uso desse helper no fluxo de atualizacao de lancamentos manuais.
- Impacto: um `JournalEntry` com `RetentionHold` ativo pode continuar protegido contra deletes diretos futuros, mas as respetivas linhas contabilisticas podem ser substituidas por uma atualizacao existente, enfraquecendo a garantia de retencao legal de `RNF19`.
- Correcao recomendada: antes de substituir linhas em `updateManualJournal`, consultar o gate de retencao para o `JournalEntry` alvo usando o contexto backend de `companyId`/`userId`; adicionar teste de regressao em que um `RetentionHold` ativo bloqueia o `PATCH /manual-journals/:id` com `RETENTION_HOLD_ACTIVE`/`409` e nao regista auditoria de autorizacao.
- Bloqueia MF: nao invalida a existencia do modelo, policy, gate e testes unitarios de retencao, mas bloqueia `PASS` absoluto de `BK-MF7-02`.

### Findings por severidade

| Severidade | Quantidade ativa | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 1 | `MF7-IMP-AUD-20260630-BK02-F01`. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado nesta passagem. |

### Coerencia MF/BK vizinhas

- `MF6 -> MF7`: `OK_COM_RISCOS`. O contrato de auditoria sensivel usado por MF6 continua preservado, mas o novo finding mostra que nem todas as mutacoes destrutivas MF7 passam pelo gate de retencao.
- `BK-MF7-01 -> BK-MF7-02`: `OK_COM_RISCOS`. A retencao BK-MF7-02 esta independente do blocker operacional de backup/restauro BK-MF7-01, mas ambos continuam a impedir um `PASS` absoluto da cadeia MF7.
- `BK-MF7-02 -> BK-MF7-03`: `OK_COM_RISCOS`. A coerencia com exports/imports e SAF-T permanece, mas a integridade dos dados retidos deve ser fechada antes de usar `BK-MF7-02` como garantia plena para evidencias posteriores.
- `MF7 -> MF8`: `OK_COM_RISCOS`. A base de audit logs e telemetria continua compativel com MF8, mas a lacuna de gate deve ser corrigida antes de declarar a camada de compliance como completa.

### Pesquisa estatica especifica

- Scan de risco em `real_dev/api` e `real_dev/web`: `PASS_COM_OBSERVACOES`. Os matches relevantes foram filtros defensivos, testes ou configuracoes sem novo finding.
- Drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo): `PASS`, sem matches.
- Scan dirigido a `companyId` em body/query: `PASS_COM_OBSERVACAO`. A ocorrencia funcional encontrada pertence ao fluxo autenticado de troca de empresa ativa; nao foi confirmado ownership arbitrario no escopo de `BK-MF7-02`.
- Scan dirigido a mutacoes destrutivas de lancamentos manuais: `FAIL_COM_FINDING`. Confirmou `journalEntryLine.deleteMany` no fluxo de `updateManualJournal` sem gate de retencao.

### Comandos executados nesta passagem

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja continha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web real_dev/api/src/modules/compliance/retentionPolicy.js real_dev/api/src/modules/compliance/retentionDeletionGate.js real_dev/api/tests/unit/retentionPolicy.test.js` | `PASS` | `real_dev/` esta ignorado por `.gitignore:4`, esperado nesta PAP. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Verificacao sintatica concluida sem erro. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:mf7:retention` | `PASS` | 9 testes passaram. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exports, imports, SAF-T, backend modules e critical modules passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/api run test:mf6` | `PASS` | Gates MF6 passaram; concorrencia em `mode: local-contract`. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility gate, frontend modules, typecheck e build passaram. |
| `rg` de risco em `real_dev/api real_dev/web` | `PASS_COM_OBSERVACOES` | Matches contextuais/defensivos; sem novo finding alem do fluxo destrutivo confirmado. |
| `rg` de drift de dominio em `real_dev/api real_dev/web` | `PASS` | Sem matches. |
| `rg` dirigido a `body.companyId`/`query.companyId` | `PASS_COM_OBSERVACAO` | Sem ownership arbitrario confirmado no escopo auditado. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental historica/preexistente, incluindo avisos de qualidade nos guias. |
| `git diff --check` | `PASS` | Sem whitespace errors no diff existente antes desta atualizacao. |

### Validacoes nao executadas

- Correcao do finding `MF7-IMP-AUD-20260630-BK02-F01`: nao executada porque a prompt atual e `MODO=auditar_implementacao` e `PERMITIR_ALTERAR_DOCS=nao`, permitindo apenas atualizar este relatorio de auditoria.
- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado por falta de `TEST_DATABASE_URL` efemera/persistente configurada.
- Fluxo HTTP real de `PATCH /manual-journals/:id` com `RetentionHold` ativo: nao executado por falta de base persistente semeada; a evidencia atual e estatica/codigo-path e suficiente para abrir o finding.

### Ficheiros alterados nesta passagem

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Proxima acao recomendada

Executar uma prompt de correcao estritamente focada em `MF7-IMP-AUD-20260630-BK02-F01`: aplicar o gate de retencao no fluxo `updateManualJournal` antes da substituicao de linhas, adicionar teste de regressao para `RetentionHold` ativo e reexecutar `test:mf7:retention`, `test:mf7`, `test:unit`, `test:contracts` e a validacao dirigida do fluxo corrigido.

## Reauditoria atual - BK-MF7-03 - 2026-06-30 - execucao isolada

### Escopo desta passagem

- Prompt executada: `MODO=auditar_implementacao`, `MF_ALVO=MF7`, `BK_IDS=[BK-MF7-03]`, `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PROFUNDIDADE_COERENCIA=vizinhas`.
- Restricoes respeitadas: sem commits, sem alteracoes em codigo, sem alteracoes em guias BK canonicos, RF/RNF, backlog, matriz, sprints, `apps/`, `mockup/` ou `real_dev`.
- Artefacto permitido e atualizado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`.
- Pasta real auditada: `real_dev/web`, com coerencia tecnica em `real_dev/api` para a MF7 agregada.

### Resultado geral

Estado desta passagem para `BK-MF7-03`: `PASS_COM_RISCOS`.

O codigo automatizavel de compatibilidade esta implementado e validado: existe gate `test:mf7:browser-compatibility`, o agregador `test:mf7` executa gate, modularidade frontend, typecheck e build, e as superficies criticas nao contem browser detection fora das strings esperadas de evidence/gate. O BK nao pode ser fechado como `PASS` absoluto porque a evidence real continua a marcar Chrome, Edge e Firefox como `BLOQUEADO_AMBIENTE`, e os negativos mutaveis do guia nao estao registados como executados.

### Inventario documental

- `RNF20`: compatibilidade com Chrome, Edge e Firefox.
- `BK-MF7-03`: P0, owner `Pedro`, apoio `Andre`, reforco, sprint `S11-S12`, proximo BK `BK-MF7-04`.
- Guia alvo: exige gate estatico contra ramos por browser, comandos npm, evidence cross-browser, `typecheck`, `build`, smoke manual em Chrome/Edge/Firefox e tres negativos obrigatorios.
- BK anterior: `BK-MF7-02`, retencao legal. Nao e alterado por este BK, mas continua a fornecer parte da cadeia MF7.
- BK seguinte: `BK-MF7-04`, email transacional. Beneficia de UI estavel e feedback frontend compilavel.

### Evidencia positiva confirmada

- `real_dev/web/package.json` expoe `test:mf7:browser-compatibility` e `test:mf7`.
- `real_dev/web/scripts/check-mf7-browser-compatibility.mjs` valida `App.tsx`, `apiClient.ts`, `styles.css`, `ResponsiveDataTable.tsx` e `opsaUi.tsx`.
- O gate bloqueia `navigator.userAgent`, `window.chrome`, `InstallTrigger`, `@-moz-document`, seletores `::-webkit-*` e `@supports` usado como atalho de browser.
- `real_dev/web/src/lib/apiClient.ts` mantem `credentials: "include"`, preservando o contrato de cookies HttpOnly.
- `real_dev/web/src/styles.css` contem `:focus-visible` e breakpoint responsivo `@media (max-width: 640px)`.
- `real_dev/web/src/ui/ResponsiveDataTable.tsx` exporta `ResponsiveDataTable` e mantem a mesma fonte de dados para tabela desktop e cartoes mobile.
- `real_dev/web/evidence/mf7-browser-compatibility.md` existe e documenta comandos automatizados com resultado `PASS`.
- `npm --prefix real_dev/web run test:mf7` passou com gate browser, gate de modularidade frontend, TypeScript e Vite build.

### Findings ativos

| Finding | Severidade | BK/RNF | Estado | Impacto |
| --- | --- | --- | --- | --- |
| `MF7-IMP-AUD-20260630-BK03-F01` | `P1` | `BK-MF7-03` / `RNF20` | `BLOQUEADO` | Falta smoke manual real em Chrome, Edge e Firefox com versoes/resultados observados. |
| `MF7-IMP-AUD-20260630-BK03-F02` | `P2` | `BK-MF7-03` / `RNF20` | `PARCIAL` | Os negativos obrigatorios do guia estao descritos, mas nao registados como executados. |

#### MF7-IMP-AUD-20260630-BK03-F01 - Smoke manual cross-browser ainda bloqueado por ambiente

- Severidade: `P1`
- Estado: `BLOQUEADO`
- Expected: abrir a aplicacao em Chrome, Edge e Firefox, testar entrada da app, navegacao lateral, tabela responsiva, formulario com erro, feedback visual, foco por teclado e layout sem sobreposicao; registar versao e resultado observado por browser.
- Observed: `real_dev/web/evidence/mf7-browser-compatibility.md` marca Chrome, Edge e Firefox como `BLOQUEADO_AMBIENTE` e indica que o smoke manual nao foi executado nesta ronda automatizada.
- Evidencia de ambiente atual: `command -v google-chrome`, `command -v chromium`, `command -v firefox` e `command -v microsoft-edge` sairam com exit code `1`; `find /Applications -maxdepth 1 -name 'Google Chrome.app'`, `Microsoft Edge.app` e `Firefox.app` nao devolveram apps; `find '/Users/nuno/Applications/Chromium Apps.localized' -maxdepth 2 -name '*.app'` nao encontrou browser executavel.
- Impacto: o codigo parece alinhado com `RNF20`, mas a compatibilidade runtime nos tres browsers exigidos ainda nao esta demonstrada.
- Correcao recomendada: executar o smoke num ambiente com Chrome, Edge e Firefox instalados, atualizar `real_dev/web/evidence/mf7-browser-compatibility.md` com versoes/resultados observados e repetir `npm --prefix real_dev/web run test:mf7`.
- Bloqueia MF: nao bloqueia os gates de codigo; bloqueia o `PASS` absoluto de `BK-MF7-03`.

#### MF7-IMP-AUD-20260630-BK03-F02 - Negativos obrigatorios descritos mas nao executados

- Severidade: `P2`
- Estado: `PARCIAL`
- Expected: evidence deve mostrar que os tres negativos do guia falham de forma controlada: ramo React com `navigator.userAgent`, ramo CSS com `@-moz-document` e script npm ausente.
- Observed: `real_dev/web/evidence/mf7-browser-compatibility.md` diz que os dois primeiros negativos estao "cobertos por padrao proibido no gate" e que o terceiro nao foi executado por exigir remocao temporaria do script. Nao ha output real dos negativos.
- Impacto: o gate positivo passa, mas a evidence nao prova que os negativos foram reproduzidos durante a entrega.
- Correcao recomendada: executar os negativos num ambiente controlado e repor cada alteracao temporaria antes do passo seguinte; se a politica de auditoria impedir edicoes temporarias no workspace, criar prova tecnica equivalente fora da arvore real sem alterar `real_dev`.
- Bloqueia MF: nao bloqueia a compilacao nem o gate positivo; mantem o BK em `PARCIAL` ate a evidence ficar completa.

### Findings por severidade

| Severidade | Quantidade ativa | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 1 | `BLOQUEADO`: smoke manual Chrome/Edge/Firefox ausente por ambiente. |
| `P2` | 1 | `PARCIAL`: negativos obrigatorios sem output real registado. |
| `P3` | 0 | Nenhum finding P3 confirmado nesta passagem. |

### Coerencia MF/BK vizinhas

- `MF6 -> MF7`: `OK_COM_RISCOS`. Os gates de seguranca MF6 passaram e `apiClient.ts` preserva `credentials: "include"`, mas `RNF20` ainda precisa de prova manual real.
- `BK-MF7-02 -> BK-MF7-03`: `OK_COM_RISCOS`. A retencao backend nao foi alterada; a cadeia fica condicionada pela evidence cross-browser incompleta.
- `BK-MF7-03 -> BK-MF7-04`: `OK_COM_RISCOS`. `BK-MF7-04` pode reutilizar a base frontend compilavel, mas o fecho total da compatibilidade deve aguardar smoke real.
- `MF7 -> MF8`: `OK_COM_RISCOS`. MF8 pode usar `test:mf7` como baseline automatica, sem tratar isso como substituto de prova manual nos browsers.

### Pesquisa estatica especifica

- Browser detection em `real_dev/web/src`, `real_dev/web/scripts` e `real_dev/web/evidence`: `PASS_COM_OBSERVACOES`. As ocorrencias de `Chrome`, `Firefox`, `Edge`, `navigator.userAgent` e `@-moz-document` aparecem no gate/evidence como contrato ou negativos esperados; nao aparecem como ramos ativos nas superficies de UI.
- Scan de risco em `real_dev/api` e `real_dev/web`: `PASS_COM_OBSERVACOES`. Os matches relevantes foram filtros defensivos, testes ou comentarios de protecao.
- Drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo): `PASS`, sem matches.
- Scan dirigido a `companyId` em body/query: `PASS_COM_OBSERVACAO`. A ocorrencia funcional pertence ao fluxo autenticado de troca de empresa ativa; sem ownership arbitrario no escopo de `BK-MF7-03`.

### Comandos executados nesta passagem

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja continha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev real_dev/web real_dev/web/scripts/check-mf7-browser-compatibility.mjs real_dev/web/evidence/mf7-browser-compatibility.md real_dev/web/src/App.tsx real_dev/web/src/styles.css real_dev/web/src/lib/apiClient.ts` | `PASS` | `real_dev/` esta ignorado por `.gitignore:4`, esperado nesta PAP. |
| `npm --prefix real_dev/web run test:mf7:browser-compatibility` | `PASS` | `MF7 browser compatibility gate OK`. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Gate browser, frontend modules, typecheck e Vite build passaram. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Verificacao sintatica concluida sem erro. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exports, imports, SAF-T, backend modules e critical modules passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/api run test:mf6` | `PASS` | Gates MF6 passaram; concorrencia em `mode: local-contract`. |
| `rg` de browser detection em `real_dev/web` | `PASS_COM_OBSERVACOES` | Ocorrencias apenas em gate/evidence, nao como logica ativa de UI. |
| `rg` de risco em `real_dev/api real_dev/web` | `PASS_COM_OBSERVACOES` | Matches contextuais/defensivos; sem finding para `BK-MF7-03`. |
| `rg` de drift de dominio em `real_dev/api real_dev/web` | `PASS` | Sem matches. |
| `rg` dirigido a `body.companyId`/`query.companyId` | `PASS_COM_OBSERVACAO` | Sem ownership arbitrario no escopo auditado. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental historica/preexistente, incluindo avisos globais nos guias. |
| `git diff --check` | `PASS` | Sem whitespace errors antes desta atualizacao de relatorio. |
| `command -v google-chrome`, `chromium`, `firefox`, `microsoft-edge` | `BLOQUEADO_AMBIENTE` | Todos sairam com exit code `1`. |
| `find /Applications -maxdepth 1 -name 'Google Chrome.app'/'Microsoft Edge.app'/'Firefox.app'` | `BLOQUEADO_AMBIENTE` | Nenhuma app encontrada. |
| `find '/Users/nuno/Applications/Chromium Apps.localized' -maxdepth 2 -name '*.app'` | `BLOQUEADO_AMBIENTE` | Pasta existe, mas sem browser `.app`. |

### Validacoes nao executadas

- Smoke manual em Chrome, Edge e Firefox: nao executado porque os browsers alvo nao estao disponiveis como apps/executaveis neste ambiente.
- Negativos mutaveis sobre `App.tsx`, `styles.css` e `package.json`: nao executados nesta auditoria porque exigiriam alterar temporariamente ficheiros de `real_dev`; a prompt atual e auditoria sem edicao de codigo.
- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado por falta de `TEST_DATABASE_URL` efemera/persistente configurada.

### Ficheiros alterados nesta passagem

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- `BLOCKER_AMBIENTE`: disponibilizar Chrome, Edge e Firefox para smoke manual ou executar a validacao num ambiente onde os tres browsers estejam instalados.
- `TODO_EVIDENCE`: atualizar `real_dev/web/evidence/mf7-browser-compatibility.md` com versoes, fluxos e resultados observados por browser.
- `TODO_EVIDENCE`: registar output real dos tres negativos obrigatorios ou uma prova tecnica equivalente que nao deixe alteracoes temporarias no workspace.

### Proxima acao recomendada

Fechar `BK-MF7-03` em ambiente com Chrome, Edge e Firefox disponiveis: abrir a app, executar os fluxos principais definidos no guia, registar versoes/resultados em `real_dev/web/evidence/mf7-browser-compatibility.md`, executar/registar os negativos e repetir `npm --prefix real_dev/web run test:mf7`.

## Reauditoria atual - BK-MF7-04 - 2026-06-30 - execucao isolada

### Metadados da execucao

- Projeto: `OPSA`
- MF alvo: `MF7`
- BK alvo: `BK-MF7-04`
- Modo: `auditar_implementacao`
- Implementation root: `real_dev`
- Escopo estrito: `true`
- Coerencia MF/BK: `CHECK_MF_COHERENCE=true`, profundidade `vizinhas`
- Permissao para alterar docs canonicos: `nao`
- Permissao para commits: `nao`
- Output: `relatorio_e_resumo`

### Resultado executivo

Estado desta passagem para `BK-MF7-04`: `PASS` / `AUDITADO_OK`.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` no BK alvo. A implementacao real cumpre o contrato essencial de `RNF21`: adapter transacional comum, razoes de envio fechadas, validacao de destinatario/motivo/assunto/texto antes de qualquer provider, logs tecnicos sem email completo/token/password, fallback seguro sem provider comercial, password reset preservado e integracao com alertas/lembretes por email.

A ausencia de provider comercial real nao e finding nesta ronda. O guia `BK-MF7-04` coloca selecao/configuracao/compra de fornecedor em `Scope-out`; o contrato auditado e a fronteira tecnica pequena, testavel e desacoplada de SMTP/API externa.

### Inventario documental e tecnico

- `RNF21`: integracao com servicos de email.
- `RF05`: recuperacao de password por email.
- `RF46`: notificacoes in-app/email para lembretes e alertas inteligentes.
- `BK-MF7-04`: adapter transacional, recuperacao de password, alertas/lembretes, testes de contrato e evidence propria.
- Guia anterior: `BK-MF7-03`, compatibilidade cross-browser.
- Guia seguinte: `BK-MF7-05`, exportacao PDF/Excel.

| Area | Evidencia real auditada |
| --- | --- |
| Adapter comum | `real_dev/api/src/modules/notifications/transactionalEmailAdapter.js` |
| Recuperacao de password | `real_dev/api/src/modules/auth/passwordResetEmailAdapter.js`; `real_dev/api/src/modules/auth/passwordResetService.js`; `real_dev/api/src/modules/auth/authRoutes.js` |
| Alertas/lembretes | `real_dev/api/src/modules/notifications/notificationService.js` |
| Contratos | `real_dev/api/tests/contracts/mf7-email-contracts.test.js` |
| Evidence | `real_dev/api/evidence/mf7-email-integration.md` |
| Scripts | `real_dev/api/package.json` |

### Evidencia positiva confirmada

- `TransactionalEmailReason` limita envios a `PASSWORD_RESET`, `SMART_ALERT` e `PAYMENT_REMINDER`.
- `validateTransactionalEmailMessage` rejeita payload nao objeto, destinatario invalido, motivo nao permitido, assunto curto e texto insuficiente antes de chamar qualquer provider.
- O adapter transacional calcula apenas o dominio do destinatario para logs e nao regista email completo.
- Sem provider configurado, `sendTransactionalEmail` devolve `QUEUED_FOR_PROVIDER` sem quebrar o fluxo aplicacional.
- `provider.send(...)` so e chamado depois de validacao e recebe a mensagem sanitizada pelo contrato do adapter.
- `buildPasswordResetEmailAdapter` constroi o URL de recuperacao e envia-o apenas no corpo da mensagem transacional, nao nos logs.
- `passwordResetService` gera token bruto, persiste apenas hash SHA-256, devolve resposta generica para evitar user enumeration e revoga sessoes no reset.
- `sendNotificationEmails` mapeia alertas inteligentes para `SMART_ALERT` e restantes notificacoes elegiveis para `PAYMENT_REMINDER`, mantendo o adapter comum.
- `mf7-email-contracts.test.js` cobre logs sem email completo, rejeicao de `MARKETING`, rejeicao de destinatario invalido antes do provider, protecao de token/reset URL nos logs e reutilizacao do adapter por alertas/lembretes.
- `real_dev/api/evidence/mf7-email-integration.md` documenta `BK-MF7-04`, `RNF21`, comandos, fluxo principal e negativos.

### Findings ativos

Nao existem findings ativos para `BK-MF7-04` nesta passagem.

| Severidade | Quantidade ativa | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Coerencia MF/BK vizinhas

- `MF6 -> MF7`: `OK`. As validacoes MF6 passaram e o BK de email preserva a disciplina de nao expor segredos/tokens/passwords em logs.
- `BK-MF7-03 -> BK-MF7-04`: `OK_COM_RISCOS`. O BK alvo esta validado; a ressalva vem do risco herdado de `BK-MF7-03`, onde continua a faltar smoke manual real em Chrome, Edge e Firefox.
- `BK-MF7-04 -> BK-MF7-05`: `OK`. Email transacional e exportacoes PDF/Excel sao fronteiras independentes; nao foi encontrado acoplamento indevido.
- `MF7 -> MF8`: `OK`. O adapter de email fornece camada tecnica reutilizavel para eventos transacionais futuros sem prometer provider real.

### Pesquisa estatica especifica

- Scan de risco em `real_dev/api` e `real_dev/web`: `PASS_COM_OBSERVACOES`. Os matches foram listas de redacao, testes com segredos falsos, comentarios defensivos, configuracao de storage root ou protecoes esperadas; sem finding para `BK-MF7-04`.
- Drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo): `PASS`, sem matches.
- Scan dirigido a `body.companyId`/`query.companyId`: `PASS_COM_OBSERVACAO`. A ocorrencia funcional pertence ao fluxo autenticado de troca de empresa ativa; sem ownership arbitrario no escopo auditado.
- Scan dirigido a provider/logs/reset URL: `PASS_COM_OBSERVACOES`. `provider.send` aparece apenas no adapter esperado e `recuperar-password` aparece no corpo da mensagem/testes de protecao; sem log de token/password/reset URL.

### Comandos executados nesta passagem

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja continha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/api/src/modules/notifications/transactionalEmailAdapter.js real_dev/api/src/modules/auth/passwordResetEmailAdapter.js real_dev/api/src/modules/auth/passwordResetService.js real_dev/api/src/modules/notifications/notificationService.js real_dev/api/tests/contracts/mf7-email-contracts.test.js real_dev/api/evidence/mf7-email-integration.md` | `PASS` | `real_dev/` esta ignorado por `.gitignore:4`, esperado nesta PAP. |
| `npm --prefix real_dev/api run test:mf7:email` | `PASS` | 5 testes passaram; 1 suite passou; 0 falhas. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Verificacao sintatica concluida sem erro. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exports, imports, SAF-T, backend modules e critical modules passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility, frontend modules, typecheck e Vite build passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados por falta de `TEST_DATABASE_URL`; skip explicito e esperado neste ambiente. |
| `npm --prefix real_dev/api run test:mf6` | `PASS` | Gates MF6 passaram; concorrencia em `mode: local-contract`. |
| `rg` de risco em `real_dev/api real_dev/web` | `PASS_COM_OBSERVACOES` | Matches contextuais/defensivos; sem finding para `BK-MF7-04`. |
| `rg` de drift de dominio em `real_dev/api real_dev/web` | `PASS` | Sem matches. |
| `rg` dirigido a `body.companyId`/`query.companyId` | `PASS_COM_OBSERVACAO` | Sem ownership arbitrario no escopo auditado. |
| `rg` dirigido a provider/logs/reset URL | `PASS_COM_OBSERVACOES` | Ocorrencias esperadas no adapter/evidence/testes; sem exposicao de token/password/reset URL em logs. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental historica/preexistente, incluindo avisos globais nos guias. |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md` | `PASS` | Sem trailing whitespace no relatorio apos a atualizacao. |
| `git diff --check` | `PASS` | Sem whitespace errors antes e depois desta atualizacao de relatorio. |

### Validacoes nao executadas

- Envio real por provider comercial: nao executado porque a decisao/configuracao/compra de fornecedor esta fora do escopo do guia `BK-MF7-04`.
- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado por falta de `TEST_DATABASE_URL`; nao e central para este BK, que nao altera Prisma nem contratos de persistencia.
- Smoke manual UI adicional: nao executado porque pertence ao risco operacional de `BK-MF7-03`, nao ao contrato de email transacional deste BK.

### Ficheiros alterados nesta passagem

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- Nenhum blocker ativo para `BK-MF7-04`.
- `TODO_OPERACIONAL`: quando existir decisao canonica/operacional sobre provider, ligar o fornecedor atras de `buildTransactionalEmailAdapter` sem alterar os servicos de dominio nem expor segredos em logs.
- `RISCO_HERDADO`: o fecho absoluto de `BK-MF7-03` continua dependente de smoke manual real em Chrome, Edge e Firefox; nao bloqueia o estado `AUDITADO_OK` de `BK-MF7-04`.

### Proxima acao recomendada

Manter `BK-MF7-04` como `AUDITADO_OK`. A proxima acao de maior valor e fechar a evidence operacional de `BK-MF7-03` em ambiente com Chrome, Edge e Firefox ou continuar a auditoria isolada do proximo BK alvo.

## Reauditoria atual - BK-MF7-05 - 2026-06-30 - execucao isolada

### Metadados da execucao

- Projeto: `OPSA`
- MF alvo: `MF7`
- BK alvo: `BK-MF7-05`
- Modo: `auditar_implementacao`
- Implementation root: `real_dev`
- Escopo estrito: `true`
- Coerencia MF/BK: `CHECK_MF_COHERENCE=true`, profundidade `vizinhas`
- Permissao para alterar docs canonicos: `nao`
- Permissao para commits: `nao`
- Output: `relatorio_e_resumo`

### Resultado executivo

Estado desta passagem para `BK-MF7-05`: `PASS` / `AUDITADO_OK`.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` no BK alvo. A implementacao real cumpre o contrato essencial de `RNF22` e o apoio funcional de `RF29`: balancete e razao continuam a vir dos services contabilisticos existentes, os endpoints de exportacao suportam `csv`, `xlsx` e `pdf`, os formatos invalidos sao rejeitados, os ficheiros devolvem `Content-Type` e `Content-Disposition`, as celulas perigosas de folhas de calculo sao neutralizadas e a empresa ativa continua a ser resolvida no backend por `req.companyId`.

O smoke HTTP live autenticado com BD real nao foi executado nesta ronda. A cobertura efetiva desta passagem e por leitura de codigo, testes de contrato, router Express isolado, geracao direta dos tres formatos, suites agregadas e build/typecheck web.

### Inventario documental e tecnico

- `RNF22`: exportacoes essenciais disponiveis em CSV, Excel e PDF.
- `RF29`: balancete e razao exportaveis, herdado de `BK-MF2-07`.
- `BK-MF7-05`: exportacoes `csv`, `xlsx` e `pdf` para balancete e razao.
- Guia anterior: `BK-MF7-04`, integracao com email transacional.
- Guia seguinte: `BK-MF7-06`, importacoes CSV/Excel com validacao e logs de erro.

| Area | Evidencia real auditada |
| --- | --- |
| Service comum de formatos | `real_dev/api/src/modules/exports/exportFormatService.js` |
| Rotas contabilisticas | `real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js` |
| Builders contabilisticos | `real_dev/api/src/modules/accounting-reports/accountingReportService.js` |
| Exporters legados preservados | `real_dev/api/src/modules/accounting-reports/accountingReportExporters.js` |
| Cliente frontend | `real_dev/web/src/lib/apiClient.ts`; `real_dev/web/src/pages/mf2Pages.tsx` |
| Contratos | `real_dev/api/tests/contracts/mf7-export-contracts.test.js` |
| Evidence | `real_dev/api/evidence/mf7-export-formats.md` |
| Scripts | `real_dev/api/package.json`; `real_dev/web/package.json` |

### Evidencia positiva confirmada

- `ExportFormat` limita formatos a `csv`, `xlsx` e `pdf`.
- `normalizeExportFormat` aceita variacao de caixa e rejeita formatos fora de `RNF22` com `INVALID_EXPORT_FORMAT`.
- `safeExportBaseName` normaliza nomes de ficheiro antes de formar o download.
- `neutralizeSpreadsheetCell` prefixa valores iniciados por `=`, `+`, `-` ou `@`, protegendo CSV/XLSX contra formula injection.
- `buildTabularExport` gera buffers validos para `csv`, `xlsx` e `pdf` com content types explicitos.
- `accountingReportRoutes.js` expoe `GET /trial-balance/export` e `GET /ledger/export`.
- As rotas usam `requireAuth`, `requireCompanyContext` e `requirePermission(Permission.ACCOUNTING_READ)`.
- As rotas usam `req.companyId` e nao aceitam `companyId` em body/query para decidir empresa ativa.
- Os dados de balancete e razao continuam a vir de `buildTrialBalance` e `buildLedger`, sem calculo contabilistico paralelo.
- Os endpoints legados `trial-balance.xlsx` e `ledger.pdf` foram preservados.
- O frontend usa `credentials: "include"` no cliente central e constroi URLs de download apenas com `from`, `to`, `format` e, no caso da razao, `accountId`.
- `mf7-export-contracts.test.js` cobre exposicao das rotas, rejeicao de formato invalido, neutralizacao CSV e HTTP CSV com empresa da sessao.
- A validacao direta de `buildTabularExport` confirmou buffers nao vazios para `csv`, `xlsx` e `pdf`.

### Findings ativos

Nao existem findings ativos para `BK-MF7-05` nesta passagem.

| Severidade | Quantidade ativa | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Coerencia MF/BK vizinhas

- `MF6 -> MF7`: `OK`. Os gates MF6 passaram e as exportacoes preservam sessao, permissao, empresa ativa e ausencia de dados sensiveis em logs.
- `BK-MF7-04 -> BK-MF7-05`: `OK`. Email transacional e exportacoes sao fronteiras independentes; nao foi encontrado acoplamento indevido.
- `BK-MF7-05 -> BK-MF7-06`: `OK`. A disciplina de formatos explicitos, evidence e negativos e reutilizavel no BK de importacoes sem misturar responsabilidades.
- `MF7 -> MF8`: `OK`. As exportacoes essenciais ficam testadas como camada operacional para readiness final; o unico passo operacional pendente e smoke live com BD/dados reais.

### Pesquisa estatica especifica

- Scan de risco em `real_dev/api` e `real_dev/web`: `PASS_COM_OBSERVACOES`. Os matches foram listas de redacao, testes com segredos falsos, comentarios defensivos ou configuracao de storage; sem finding para `BK-MF7-05`.
- Drift de dominio (`FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo): `PASS`, sem matches.
- Scan dirigido a `body.companyId`/`query.companyId`: `PASS_COM_OBSERVACAO`. As ocorrencias pertencem ao fluxo autenticado de troca de empresa ativa, comentarios/JSDoc ou teste de protecao; sem ownership arbitrario no escopo de exportacoes.
- Scan dirigido a endpoints de exportacao: `PASS`. `trial-balance/export` e `ledger/export` estao montados em `real_dev/api/src/server.js` por `buildAccountingReportRoutes`.

### Comandos executados nesta passagem

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja continha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web real_dev/api/src/modules/exports/exportFormatService.js real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js real_dev/api/tests/contracts/mf7-export-contracts.test.js real_dev/api/evidence/mf7-export-formats.md` | `PASS` | `real_dev/` esta ignorado por `.gitignore:4`, esperado nesta PAP. |
| `npm --prefix real_dev/api run test:mf7:exports` | `PASS` | 4 testes passaram; 0 falhas. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Verificacao sintatica concluida sem erro. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility, frontend modules, typecheck e Vite build passaram. |
| `node --input-type=module -e ... buildTabularExport(csv/xlsx/pdf)` | `PASS` | Gerou buffers nao vazios para `csv`, `xlsx` e `pdf` com content types corretos. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, backend modules e critical modules passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados por falta de `TEST_DATABASE_URL`; skip explicito e esperado neste ambiente. |
| `npm --prefix real_dev/api run test:mf6` | `PASS` | Gates MF6 passaram; concorrencia em `mode: local-contract`. |
| `rg` de risco em `real_dev/api real_dev/web` | `PASS_COM_OBSERVACOES` | Matches contextuais/defensivos; sem finding para `BK-MF7-05`. |
| `rg` de drift de dominio em `real_dev/api real_dev/web` | `PASS` | Sem matches. |
| `rg` dirigido a `body.companyId`/`query.companyId` | `PASS_COM_OBSERVACAO` | Sem ownership arbitrario nas exportacoes. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental historica/preexistente, incluindo avisos globais nos guias. |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md` | `PASS` | Sem trailing whitespace no relatorio apos a atualizacao. |
| `git diff --check` | `PASS` | Sem whitespace errors antes e depois desta atualizacao de relatorio. |

### Validacoes nao executadas

- Smoke HTTP live autenticado com BD real para downloads: nao executado por falta de ambiente/dados de teste autenticados (`TEST_DATABASE_URL`/sessao real). Cobertura alternativa executada por router isolado, contratos e geracao direta dos tres formatos.
- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado por falta de `TEST_DATABASE_URL` configurado.
- Abertura manual dos ficheiros exportados em Excel/PDF viewer: nao executada; a validacao confirmou buffers, content types, headers e build web.

### Ficheiros alterados nesta passagem

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em codigo, `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- Nenhum blocker ativo para `BK-MF7-05`.
- `TODO_OPERACIONAL`: executar smoke live autenticado com BD/dados reais para `trial-balance/export` e `ledger/export` em `csv`, `xlsx` e `pdf`, incluindo o negativo `format=html`.
- `TODO_EVIDENCE`: se o smoke live for executado mais tarde, atualizar apenas a evidence operacional correspondente, sem alterar o contrato de codigo ja auditado.

### Proxima acao recomendada

Manter `BK-MF7-05` como `AUDITADO_OK`. A proxima acao natural e auditar/fechar `BK-MF7-06` ou executar o smoke live de exportacoes quando houver ambiente com BD, sessao autenticada e dados contabilisticos reais.

## Reauditoria atual - BK-MF7-06 - 2026-06-30 - execucao isolada

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BK auditado: `BK-MF7-06`
- Implementation root auditado: `real_dev`
- Escopo: importacoes CSV/Excel com validacao e logs de erro (`RNF23`)
- Permissao de codigo: nao foram feitas alteracoes em codigo.
- Permissao documental: apenas este relatorio tecnico foi atualizado.
- Commits: nao executados.

### Resultado geral

Estado atual: `PASS`

`BK-MF7-06` esta implementado no root real. A API `POST /api/imports/business-data` aceita CSV e XLSX, valida tipo/formato/conteudo, aplica limite de `5000` linhas, reaproveita validadores de dominio, rejeita contas de tesouraria inexistentes ou fora da empresa ativa, ignora `companyId` forjado no payload, cria `BusinessImportRun`, cria `AuditLog` e regista `IntegrationLog` sanitizado.

Nao foram encontrados findings ativos nesta execucao. O drift historico `INVALID_IMPORT_FILE_TYPE` permanece apenas como texto de relatorio/correcao antiga; nao existe no core auditado (`real_dev/api/src`, `real_dev/api/tests`, `real_dev/api/evidence/mf7-imports.md`).

### Evidencia objetiva

- `real_dev/api/src/modules/imports/importFileParser.js` define `ImportSourceFormat.CSV`, `ImportSourceFormat.XLSX` e `MAX_IMPORT_ROWS = 5000`, detecta `.csv`/`.xlsx`, normaliza linhas com `__rowNumber` e rejeita formato invalido com `INVALID_IMPORT_FILE_FORMAT`.
- `real_dev/api/src/modules/imports/businessImportValidators.js` limita os tipos a `CUSTOMERS`, `SUPPLIERS`, `ITEMS` e `STATEMENTS`, exige `content` para CSV e `contentBase64` para XLSX.
- `real_dev/api/src/modules/imports/businessImportService.js` parseia o ficheiro antes da transacao, usa `context.companyId` e `context.userId`, grava `BusinessImportRun`, `AuditLog` e `IntegrationLog`, e verifica extratos contra `treasuryAccount.findFirst({ id, companyId, isActive: true })`.
- `real_dev/api/src/modules/imports/businessImportRoutes.js` monta `POST /business-data` com `requireAuth`, `requireCompanyContext`, `requirePermission(Permission.IMPORTS_WRITE)` e `requireRole("ADMIN", "CONTABILISTA")`.
- `real_dev/api/src/modules/treasury/statementImportValidators.js` aceita `CSV`, `OFX` e `XLSX` e exige `treasuryAccountId` para extratos.
- `real_dev/api/src/modules/integrations/integrationLogService.js` guarda apenas metadados operacionais e redige mensagens com termos sensiveis.
- `real_dev/api/prisma/schema.prisma` inclui `BankStatementFormat.XLSX`; a migration `20260630120000_mf7_import_xlsx_format` adiciona `XLSX` ao enum persistido.
- `real_dev/api/tests/contracts/mf7-import-contracts.test.js` cobre payload CSV/XLSX, formato invalido, limite de linhas, parsing Excel real, extratos XLSX parseados, `companyId` forjado ignorado, logs/run/auditoria e migration do enum.
- Negativos confirmados nesta execucao: tipo invalido, formato invalido, CSV vazio, excesso de linhas, conta de tesouraria em falta e conta de tesouraria inexistente.

### Rastreabilidade

| BK | Fonte canonica | Implementacao real | Estado |
| --- | --- | --- | --- |
| `BK-MF7-06` | `RNF23`, `RF33`, `RF35`, backlog/matriz MF7 e guia alvo | `real_dev/api/src/modules/imports/*`, `real_dev/api/src/modules/treasury/statementImportValidators.js`, `real_dev/api/src/modules/integrations/integrationLogService.js`, Prisma schema/migration, testes de contrato e evidence MF7 | `AUDITADO_OK` |

### Coerencia MF/BK vizinhas

- `MF6 -> MF7`: `OK`. Autenticacao, empresa ativa, permissao, role, auditoria e redacao de dados sensiveis foram preservadas.
- `BK-MF7-05 -> BK-MF7-06`: `OK`. A disciplina de formatos e evidence das exportacoes e reutilizada no sentido inverso de importacao sem misturar responsabilidades.
- `BK-MF7-06 -> BK-MF7-07`: `OK`. Logs, contagens, ficheiro curto e runs persistidos dao base operacional para readiness SAF-T.
- `MF7 -> MF8`: `OK_COM_RISCOS_OPERACIONAIS`. O core esta validado; continuam pendentes apenas smokes live com BD/sessao reais e aplicacao efetiva da migration num ambiente PostgreSQL.

### Findings atuais

Nao existem findings ativos para `BK-MF7-06` nesta passagem.

| Severidade | Quantidade ativa | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Comandos executados nesta passagem

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git check-ignore -v real_dev ...` | `PASS` | `real_dev/` confirmado como ignorado via `.gitignore:4`, esperado nesta PAP. |
| `npm --prefix real_dev/api run test:mf7:imports` | `PASS` | 6 testes passaram; 0 falhas. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `node --input-type=module -e '<negativos diretos>'` | `PASS` | Confirmou `INVALID_IMPORT_TYPE`, `INVALID_IMPORT_CSV`, `TREASURY_ACCOUNT_REQUIRED` e `TREASURY_ACCOUNT_NOT_FOUND`. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, modulos backend e modulos criticos passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram; 0 falhas. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram; 0 falhas. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes de persistencia saltados explicitamente por falta de BD dedicada. |
| `npm --prefix real_dev/api run test:mf6` | `PASS` | Gates MF6 passaram; concorrencia em modo `local-contract`. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility, frontend modules, typecheck e build Vite passaram. |
| `rg` de risco em `real_dev/api real_dev/web` | `PASS_COM_OBSERVACAO` | Matches contextuais/defensivos: redacao de segredos, testes com tokens falsos e storage privado; sem finding para importacoes. |
| `rg` de drift de dominio em `real_dev/api real_dev/web real_dev/api/evidence/mf7-imports.md` | `PASS` | Sem matches. |
| `rg` dirigido a `body.companyId`/`query.companyId` | `PASS_COM_OBSERVACAO` | Matches fora do fluxo de importacoes ou testes defensivos; importacoes usam `req.companyId`/`context.companyId`. |
| `rg -n 'INVALID_IMPORT_FILE_TYPE' real_dev/api/src real_dev/api/tests real_dev/api/evidence/mf7-imports.md` | `PASS` | Sem ocorrencias no core auditado. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por divida documental global/preexistente nos guias. |
| `git diff --check` | `PASS` | Sem erros de whitespace antes da atualizacao deste relatorio. |

### Validacoes nao executadas

- Smoke HTTP live autenticado de importacao CSV/XLSX contra app viva e base de dados real: nao executado por falta de ambiente autenticado/dados reais nesta sessao.
- Testes de integracao persistentes sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executados por falta de `TEST_DATABASE_URL`.
- Aplicacao real da migration em PostgreSQL: nao executada; foram validados schema Prisma e migration SQL.

### Ficheiros alterados nesta passagem

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Proxima acao recomendada

Manter `BK-MF7-06` como `AUDITADO_OK`. Quando houver ambiente com BD PostgreSQL, sessao autenticada e dados reais, executar apenas o smoke live de importacao CSV/XLSX e aplicar/verificar a migration em ambiente de teste.

## Reauditoria atual - BK-MF7-07 - 2026-06-30 - execucao isolada posterior

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BK auditado: `BK-MF7-07`
- Implementation root auditado: `real_dev`
- Escopo: readiness SAF-T MVP, rastreabilidade e logs de integracao (`RNF24`, com base em `RF36` e `RF48`)
- Permissao de codigo: nao foram feitas alteracoes em codigo.
- Permissao documental: apenas este relatorio tecnico foi atualizado.
- Commits: nao executados.

### Resultado geral

Estado atual: `PASS_COM_RISCOS`

`BK-MF7-07` esta implementado no root real. O endpoint `GET /api/compliance/saft` esta montado em `/api/compliance`, preserva autenticacao, contexto de empresa, permissao `COMPLIANCE_READ` e roles `ADMIN`, `CONTABILISTA` e `AUDITOR`. A empresa ativa vem de `req.companyId` e o utilizador vem de `req.user.id`; o cliente envia apenas o intervalo `from`/`to`.

Nao encontrei findings ativos `P0`, `P1`, `P2` ou `P3`. O estado fica `PASS_COM_RISCOS` porque a prova desta execucao continua a ser contratual/static/service-level: nao houve smoke HTTP live autenticado contra app viva com base PostgreSQL persistente, nem validacao oficial externa do XML SAF-T PT. Esta segunda ressalva nao contradiz o guia, porque o proprio BK declara que a entrega e um MVP rastreavel e nao substitui certificacao fiscal externa.

### Evidencia objetiva

- `real_dev/api/src/modules/compliance/saftComplianceChecklist.js` valida periodo, perfil fiscal minimo (`legalName`, `nif`, `addressLine1`, `postalCode`, `city`, `currency`), contagens nao negativas e existencia de pelo menos uma linha fiscal.
- `assertSaftReadiness` devolve `ready`, `checkedAt`, `totalRows` e periodo validado; rejeita `INVALID_SAFT_RANGE`, `COMPANY_PROFILE_INCOMPLETE`, `EMPTY_SAFT_PERIOD` e `INVALID_SAFT_COUNTER`.
- `real_dev/api/src/modules/compliance/saftService.js` carrega `CompanyProfile`, documentos de venda, documentos de compra e lancamentos por `input.companyId`; chama `assertSaftReadiness` antes de criar nome de ficheiro, XML, `SaftExportRun` e `IntegrationLog`.
- `real_dev/api/src/modules/compliance/saftRoutes.js` expõe `GET /saft` com `requireAuth`, `requireCompanyContext`, `requirePermission(Permission.COMPLIANCE_READ)` e `requireRole("ADMIN", "CONTABILISTA", "AUDITOR")`.
- `real_dev/api/src/modules/integrations/integrationLogService.js` sanitiza o nome do ficheiro, limita a mensagem e redige termos sensiveis; o XML completo nao e guardado no log de integracao.
- `real_dev/api/prisma/schema.prisma` contem `CompanyProfile`, `SaftExportRun` e `IntegrationLog`, com relacoes por empresa e indices coerentes com rastreabilidade.
- `real_dev/api/tests/contracts/mf7-saft-contracts.test.js` cobre caso positivo, periodo invertido, perfil sem NIF, periodo sem linhas e ligacao estatica do service a readiness, `saftExportRun.create` e `recordIntegrationLog`.
- `real_dev/api/evidence/mf7-saft-readiness.md` documenta contrato, seguranca, comandos, resultado observado e limitacoes conhecidas.
- O frontend MF3 continua a consumir `/compliance/saft` via `apiClient.compliance.saft(from, to)`, sem enviar `companyId` para escolher ownership.

### Rastreabilidade

| BK | Fonte canonica | Implementacao real | Estado |
| --- | --- | --- | --- |
| `BK-MF7-07` | `RNF24`, `RF36`, `RF48`, matriz/backlog MF7 e guia alvo | `real_dev/api/src/modules/compliance/saftComplianceChecklist.js`, `saftService.js`, `saftRoutes.js`, `saftValidators.js`, `integrationLogService.js`, `schema.prisma`, `mf7-saft-contracts.test.js`, `mf7-saft-readiness.md`, cliente/pagina MF3 | `AUDITADO_OK_COM_RISCOS_OPERACIONAIS` |

### Coerencia MF/BK vizinhas

- `MF6 -> MF7`: `OK`. Os gates MF6 passaram; a rota SAF-T preserva sessao, contexto multiempresa, permissao, role e disciplina de logs sanitizados.
- `BK-MF7-06 -> BK-MF7-07`: `OK`. Importacoes e SAF-T continuam separados por responsabilidade; o handoff e de dados/evidence operacional, nao de acoplamento entre endpoints.
- `BK-MF7-07 -> BK-MF7-08`: `OK`. SAF-T esta encapsulado no dominio `compliance`, com route/service separados, compativel com o gate de modularidade backend.
- `MF7 -> MF8`: `OK_COM_RISCOS_OPERACIONAIS`. O contrato tecnico esta validado; ficam pendentes smoke live, BD persistente e validacao externa do XML quando o objetivo for conformidade fiscal operacional plena.

### Findings atuais

Nao existem findings ativos para `BK-MF7-07` nesta passagem.

| Severidade | Quantidade ativa | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Comandos executados nesta passagem

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja continha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev ...` | `PASS` | `real_dev/` confirmado como ignorado via `.gitignore:4`, esperado nesta PAP. |
| `npm --prefix real_dev/api run test:mf7:saft` | `PASS` | 5 testes passaram; 0 falhas. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `node --input-type=module -e '<readiness direta>'` | `PASS` | Confirmou caso positivo e negativos `INVALID_SAFT_RANGE`, `COMPANY_PROFILE_INCOMPLETE` e `EMPTY_SAFT_PERIOD`. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, backend modules e critical modules passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram; 0 falhas. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram; 0 falhas. |
| `npm --prefix real_dev/api run test:mf6` | `PASS` | Gates MF6 passaram; concorrencia em modo `local-contract`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes de persistencia saltados explicitamente por falta de BD dedicada. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility, frontend modules, typecheck e build Vite passaram. |
| `rg` de risco em `real_dev/api real_dev/web` | `PASS_COM_OBSERVACAO` | Matches contextuais/defensivos: redacao de segredos, testes com tokens falsos e storage privado; sem finding para SAF-T. |
| `rg` de drift de dominio em `real_dev/api real_dev/web real_dev/api/evidence/mf7-saft-readiness.md` | `PASS` | Sem matches. |
| `rg` dirigido a `body.companyId`/`query.companyId` no escopo SAF-T | `PASS` | Sem matches no escopo SAF-T auditado; o endpoint usa `req.companyId`. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por divida documental global/preexistente nos guias, incluindo avisos no guia alvo que esta prompt nao permite corrigir. |

### Validacoes nao executadas

- Smoke HTTP live autenticado de `GET /api/compliance/saft` contra app viva e base PostgreSQL persistente.
- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`, por falta de `TEST_DATABASE_URL`.
- Aplicacao real de migrations numa BD PostgreSQL operacional.
- Validacao oficial externa do XML SAF-T PT gerado.

### Ficheiros alterados nesta passagem

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Proxima acao recomendada

Manter `BK-MF7-07` como `AUDITADO_OK_COM_RISCOS_OPERACIONAIS`. Para fecho operacional pleno, executar smoke HTTP SAF-T com sessao/permissao reais e BD persistente, correr integracao sem skip e validar o XML numa ferramenta externa adequada ao objetivo fiscal.

## Reauditoria atual - BK-MF7-08 - 2026-06-30 - execucao isolada posterior

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BK auditado: `BK-MF7-08`
- Implementation root auditado: `real_dev`
- Escopo: backend modular por dominio (`RNF25`) em `real_dev/api`
- Permissao de codigo: nao foram feitas alteracoes em codigo.
- Permissao documental: apenas este relatorio tecnico foi atualizado.
- Commits: nao executados.

### Resultado geral

Estado atual: `PASS` / `AUDITADO_OK`

`BK-MF7-08` esta implementado no root real. O backend expoe um gate repetivel em `real_dev/api/scripts/check-mf7-backend-modules.mjs`, ligado ao script npm `check:mf7:backend-modules`, que valida os dominios reais da API, os pares route/service, exports de service e a fronteira de `real_dev/api/src/server.js`.

Nao foram encontrados findings ativos `P0`, `P1`, `P2` ou `P3`. As ressalvas observadas sao externas ao core deste BK: `test:integration` foi executado com skip explicito por falta de BD dedicada, e `validate-planificacao.sh` manteve `overall_pass=true` com `advisory_pass=false` por divida documental global/preexistente nos guias. Nenhuma dessas ressalvas bloqueia a conclusao de modularidade backend.

### Evidencia objetiva

- `real_dev/api/scripts/check-mf7-backend-modules.mjs` existe e executa em ES Modules.
- O gate valida dominios reais: `sales`, `purchases`, `inventory`, `treasury`, `accounting`, `accounting-reports`, `tax`, `financial-statements`, `compliance` e `ai`.
- O gate exige pares route/service reais, incluindo inventario dividido em `stockMovement`, `fifoCost`, `inventoryCount` e `stockAlert`.
- O gate inclui o dominio `compliance` atraves de `saftRoutes.js` e `saftService.js`, mantendo coerencia com `BK-MF7-07`.
- `real_dev/api/src/server.js` importa e monta route builders, sem imports diretos de services/controllers/validators/middlewares/contextos internos de dominio.
- `real_dev/api/package.json` expoe `check:mf7:backend-modules` e inclui o gate no agregador `test:mf7`.
- `real_dev/api/evidence/mf7-backend-modules.md` documenta prova positiva, tres negativos e conclusao do BK.

### Rastreabilidade

| BK | Fonte canonica | Implementacao real | Estado |
| --- | --- | --- | --- |
| `BK-MF7-08` | `RNF25`, matriz/backlog MF7 e guia alvo | `real_dev/api/scripts/check-mf7-backend-modules.mjs`, `real_dev/api/package.json`, `real_dev/api/src/server.js`, `real_dev/api/evidence/mf7-backend-modules.md`, routes/services dos dominios principais | `AUDITADO_OK` |

### Coerencia MF/BK vizinhas

- `MF6 -> MF7`: `OK`. Os gates MF6 passaram, sustentando sessao, hardening, ambiente, cookies e auditoria sensivel que os modulos backend continuam a consumir.
- `BK-MF7-07 -> BK-MF7-08`: `OK`. SAF-T esta encapsulado em `compliance` e o gate modular valida route/service e builder desse dominio.
- `BK-MF7-08 -> BK-MF7-09`: `OK`. O backend modular passou e o gate web MF7 tambem passou nesta ronda.
- `BK-MF7-08 -> BK-MF7-10`: `OK`. O agregador `test:mf7` inclui o gate backend e a suite `test:mf7:critical-modules` passou.
- `MF7 -> MF8`: `OK_COM_ADVISORY`. Nao ha blocker novo criado por `BK-MF7-08`; permanecem apenas advisories documentais globais e a ausencia de BD persistente para integracao sem skip.

### Findings atuais

Nao existem findings ativos para `BK-MF7-08` nesta passagem.

| Severidade | Quantidade ativa | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Comandos executados nesta passagem

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja continha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web real_dev/api/scripts/check-mf7-backend-modules.mjs real_dev/api/evidence/mf7-backend-modules.md` | `PASS` | `real_dev/` confirmado como ignorado via `.gitignore:4`. |
| `node --check scripts/check-mf7-backend-modules.mjs` em `real_dev/api` | `PASS` | Sem output, sintaxe valida. |
| `npm run check:mf7:backend-modules` em `real_dev/api` | `PASS` | Output `MF7 backend modular: OK`. |
| `OPSA_MF7_SIMULATE_MISSING=src/modules/ai/aiRoutes.js npm run check:mf7:backend-modules` em `real_dev/api` | `PASS_NEGATIVO` | Falhou como esperado com `Ficheiro obrigatorio em falta: src/modules/ai/aiRoutes.js`. |
| `OPSA_MF7_SIMULATE_FORBIDDEN_SERVER_IMPORT=sales/saleDocumentService.js npm run check:mf7:backend-modules` em `real_dev/api` | `PASS_NEGATIVO` | Falhou como esperado com `server.js importa ficheiros internos de dominio: from "./modules/sales/saleDocumentService.js"`. |
| `OPSA_MF7_SIMULATE_MISSING=src/modules/inventory/stockMovementService.js npm run check:mf7:backend-modules` em `real_dev/api` | `PASS_NEGATIVO` | Falhou como esperado com `Ficheiro obrigatorio em falta: src/modules/inventory/stockMovementService.js`. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, backend modules e critical modules passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram; 0 falhas. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram; 0 falhas. |
| `npm --prefix real_dev/api run test:mf6` | `PASS` | Gates MF6 passaram; concorrencia em modo `local-contract`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados explicitamente por falta de BD dedicada. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility, frontend modules, typecheck e build Vite passaram. |
| `rg` de risco em `real_dev/api real_dev/web` | `PASS_COM_RUIDO_CONTROLADO` | Matches contextuais/defensivos: redacao de segredos, testes com tokens falsos, storage privado e filtros de seguranca; sem finding para `BK-MF7-08`. |
| `rg` de drift de dominio em `real_dev/api real_dev/web real_dev/api/evidence/mf7-backend-modules.md` | `PASS` | Sem matches. |
| `rg` dirigido a `body.companyId`/`query.companyId` | `PASS_COM_RUIDO_CONTROLADO` | Matches fora do core do BK ou testes defensivos; nada indica ownership decidido pelo browser no gate de modularidade. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por divida documental global/preexistente nos guias. |
| `git diff --check` antes desta atualizacao | `PASS` | Sem erros de whitespace antes de atualizar este relatorio. |

### Validacoes nao executadas

- Smoke HTTP live especifico para `BK-MF7-08`: nao aplicavel nesta ronda, porque o BK entrega um gate estatico de manutencao e nao endpoints funcionais novos.
- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado por falta de `TEST_DATABASE_URL`/BD dedicada.
- Alteracoes em codigo para forcar cenarios negativos: nao executadas por design; os negativos foram simulados por variaveis de ambiente e preservaram a app intacta.

### Ficheiros alterados nesta passagem

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Proxima acao recomendada

Manter `BK-MF7-08` como `AUDITADO_OK`. Antes de trabalho MF8 que dependa dos modulos backend, usar `npm --prefix real_dev/api run test:mf7` como gate de regressao e executar integracao sem skip quando existir BD dedicada.

## Reauditoria atual - BK-MF7-09 - 2026-06-30 - execucao isolada posterior

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BK auditado: `BK-MF7-09`
- Implementation root auditado: `real_dev`
- Escopo: frontend modular com componentes reutilizaveis (`RNF26`) em `real_dev/web`
- Permissao de codigo: nao foram feitas alteracoes em codigo.
- Permissao documental: apenas este relatorio tecnico foi atualizado.
- Commits: nao executados.

### Resultado geral

Estado atual: `PASS` / `AUDITADO_OK`

`BK-MF7-09` esta implementado no root real. O frontend expoe um gate repetivel em `real_dev/web/scripts/check-mf7-frontend-modules.mjs`, ligado ao script npm `check:mf7:frontend-modules`, que valida UI partilhada, cliente API central, `credentials: "include"` em codigo executavel, paginas/rotas por dominio em `App.tsx` e marcadores de API por dominio em `apiClient.ts`.

Nao foram encontrados findings ativos `P0`, `P1`, `P2` ou `P3`. As ressalvas observadas sao externas ao core deste BK: `test:integration` foi executado com skip explicito por falta de BD dedicada, nao houve percurso live autenticado em browser real, e `validate-planificacao.sh` manteve `overall_pass=true` com `advisory_pass=false` por divida documental global/preexistente nos guias. Nenhuma dessas ressalvas bloqueia a conclusao de modularidade frontend.

### Evidencia objetiva

- `real_dev/web/scripts/check-mf7-frontend-modules.mjs` existe, valida sintaxe com `node --check` e executa em ES Modules.
- O gate valida a existencia de `src/ui/opsaUi.tsx`, `src/ui/ResponsiveDataTable.tsx`, `src/ui/useActionFeedback.ts` e `src/lib/apiClient.ts`.
- O gate valida que `App.tsx` reutiliza `PageFrame` e `StatusMessage`.
- O gate remove comentarios antes de procurar `credentials: "include"` em `apiClient.ts`, evitando passar por texto morto.
- O gate valida dominios reais: `sales`, `purchases`, `inventory`, `treasury` e `accounting`, separando marcadores de UI dos marcadores do cliente API.
- O gate inclui simulacoes negativas por variaveis de ambiente, sem alterar ficheiros reais.
- `real_dev/web/package.json` expoe `check:mf7:frontend-modules` e inclui esse gate no agregador `test:mf7`, antes de `typecheck` e `build`.
- `real_dev/web/evidence/mf7-frontend-modules.md` documenta fonte, proof, tres negativos, multiempresa e handoff.
- A pesquisa por `fetch(` em `real_dev/web/src` encontrou apenas o `fetch` central em `real_dev/web/src/lib/apiClient.ts`; as paginas consomem clientes/modulos em vez de duplicar chamadas HTTP soltas.

### Rastreabilidade

| BK | Fonte canonica | Implementacao real | Estado |
| --- | --- | --- | --- |
| `BK-MF7-09` | `RNF26`, matriz/backlog MF7 e guia alvo | `real_dev/web/scripts/check-mf7-frontend-modules.mjs`, `real_dev/web/package.json`, `real_dev/web/evidence/mf7-frontend-modules.md`, `real_dev/web/src/App.tsx`, `real_dev/web/src/lib/apiClient.ts`, `real_dev/web/src/ui/opsaUi.tsx`, `real_dev/web/src/ui/ResponsiveDataTable.tsx`, `real_dev/web/src/ui/useActionFeedback.ts`, paginas por dominio | `AUDITADO_OK` |

### Coerencia MF/BK vizinhas

- `MF6 -> MF7`: `OK`. Os gates MF6 passaram, sustentando sessao, cookies, hardening, ambiente e auditoria sensivel que o frontend continua a consumir sem decidir ownership, role, permissao final ou empresa ativa.
- `BK-MF7-08 -> BK-MF7-09`: `OK`. O gate backend `check:mf7:backend-modules` passou; o frontend consome dominios coerentes com a API modular.
- `BK-MF7-09 -> BK-MF7-10`: `OK`. O gate frontend passou e a suite `test:mf7:critical-modules` passou, mantendo o handoff para testes automatizados de modulos criticos.
- `MF7 -> MF8`: `OK_COM_ADVISORY`. Nao ha blocker novo criado por `BK-MF7-09`; permanecem apenas advisories documentais globais, ausencia de BD persistente para integracao sem skip e ausencia de percurso live autenticado em browser real nesta ronda.

### Findings atuais

Nao existem findings ativos para `BK-MF7-09` nesta passagem.

| Severidade | Quantidade ativa | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Comandos executados nesta passagem

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja continha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web real_dev/web/scripts/check-mf7-frontend-modules.mjs real_dev/web/evidence/mf7-frontend-modules.md` | `PASS` | `real_dev/` confirmado como ignorado via `.gitignore:4`. |
| `node --check scripts/check-mf7-frontend-modules.mjs` em `real_dev/web` | `PASS` | Sem output, sintaxe valida. |
| `npm run check:mf7:frontend-modules` em `real_dev/web` | `PASS` | Output `MF7 frontend modular: OK`. |
| `OPSA_MF7_FRONTEND_SIMULATE_NO_CREDENTIALS=true npm run check:mf7:frontend-modules` em `real_dev/web` | `PASS_NEGATIVO` | Falhou como esperado com `Cliente API deve manter credentials: "include" para enviar o cookie de sessao`. |
| `OPSA_MF7_FRONTEND_SIMULATE_MISSING_APP_DOMAIN=purchases npm run check:mf7:frontend-modules` em `real_dev/web` | `PASS_NEGATIVO` | Falhou como esperado com `Pagina ou rota frontend em falta para dominio: purchases`. |
| `OPSA_MF7_FRONTEND_SIMULATE_MISSING_API_DOMAIN=purchases npm run check:mf7:frontend-modules` em `real_dev/web` | `PASS_NEGATIVO` | Falhou como esperado com `Cliente API em falta para dominio: purchases`. |
| `npm run test:mf7` em `real_dev/web` | `PASS` | Browser compatibility gate, frontend modules, `tsc --noEmit` e `vite build` passaram. |
| `npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS` | Output `MF7 backend modular: OK`. |
| `npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS` | 3 testes passaram; 0 falhas. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, backend modules e critical modules passaram. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram; 0 falhas. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram; 0 falhas. |
| `npm --prefix real_dev/api run test:mf6` | `PASS` | Gates MF6 passaram; concorrencia em modo `local-contract`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados explicitamente por falta de BD dedicada. |
| `rg` de risco em `real_dev/api real_dev/web` | `PASS_COM_RUIDO_CONTROLADO` | Matches contextuais/defensivos: redacao de segredos, testes com tokens falsos, storage privado e filtros de seguranca; sem finding para `BK-MF7-09`. |
| `rg` de drift de dominio em `real_dev/api real_dev/web real_dev/web/evidence/mf7-frontend-modules.md` | `PASS` | Sem matches. |
| `rg` dirigido a `body.companyId`/`query.companyId`, storage e `fetch(` | `PASS_COM_RUIDO_CONTROLADO` | `fetch(` aparece apenas no cliente API central; matches de `companyId` sao contexto/backend/testes defensivos, sem ownership decidido pelo browser. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por divida documental global/preexistente nos guias. |
| `git diff --check` antes desta atualizacao | `PASS` | Sem erros de whitespace antes de atualizar este relatorio. |

### Validacoes nao executadas

- Percurso live autenticado em browser real para `BK-MF7-09`: nao executado nesta ronda; o BK ficou provado por gate estatico, typecheck e build.
- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado por falta de `TEST_DATABASE_URL`/BD dedicada.
- Alteracoes manuais em ficheiros reais para negativos: nao executadas por design; os negativos foram simulados por variaveis de ambiente e preservaram a app intacta.

### Ficheiros alterados nesta passagem

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Proxima acao recomendada

Manter `BK-MF7-09` como `AUDITADO_OK`. Antes de trabalho MF8 que dependa da interface, usar `npm --prefix real_dev/web run test:mf7` como gate de regressao e executar um percurso autenticado em browser real quando existir ambiente com sessao/dados dedicados.

## Reauditoria atual - BK-MF7-10 - 2026-06-30 - execucao isolada posterior

### Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF7`
- BK auditado: `BK-MF7-10`
- Implementation root auditado: `real_dev`
- Escopo: testes automatizados para modulos criticos de faturacao, IVA, balancetes e reconciliacao (`RNF27`) em `real_dev/api`
- Permissao de codigo: nao foram feitas alteracoes em codigo.
- Permissao documental: apenas este relatorio tecnico foi atualizado.
- Commits: nao executados.

### Resultado geral

Estado atual: `PASS` / `AUDITADO_OK`

`BK-MF7-10` esta implementado no root real. A API expoe a suite `real_dev/api/tests/contracts/mf7-critical-modules.test.js`, ligada ao script npm `test:mf7:critical-modules` e ao agregador `test:mf7`, validando contratos minimos de faturacao, IVA, balancetes e reconciliacao bancaria. A suite confirma marcadores reais dos services, preserva contexto multiempresa no backend e rejeita fonte de empresa ativa via `req.body.companyId` ou `req.query.companyId`.

Nao foram encontrados findings ativos `P0`, `P1`, `P2` ou `P3`. As ressalvas observadas sao externas ao core deste BK: `test:integration` foi executado com skip explicito por falta de BD dedicada, e `validate-planificacao.sh` manteve `overall_pass=true` com `advisory_pass=false` por divida documental global/preexistente nos guias. Nenhuma dessas ressalvas bloqueia a conclusao do contrato automatizado `RNF27`.

### Evidencia objetiva

- `real_dev/api/tests/contracts/mf7-critical-modules.test.js` existe, valida sintaxe com `node --check` e usa `node:test`.
- A suite declara `criticalContracts` para `faturacao`, `iva`, `balancetes` e `reconciliacao`.
- Faturacao valida `createSaleDocument`, `issueSaleDocument`, `assertOpenFiscalPeriod`, `totalCents`, `vatCents`, `auditLog.create` e `companyId` em `real_dev/api/src/modules/sales/saleDocumentService.js`.
- IVA valida `buildVatMap`, `fromDate`, `toDate`, `liquidatedVatCents`, `deductibleVatCents`, `vatBalanceCents` e `companyId` em `real_dev/api/src/modules/tax/vatMapService.js`.
- Balancetes validam `buildTrialBalance`, `buildLedger`, `journalEntry`, `debitCents`, `creditCents`, `balanceCents` e `companyId` em `real_dev/api/src/modules/accounting-reports/accountingReportService.js`.
- Reconciliacao valida `importBankStatement`, `deduplicateStatementRows`, `buildSuggestions`, `bankReconciliationSuggestion`, `recordIntegrationLog` e `companyId` em `real_dev/api/src/modules/treasury/statementImportService.js`.
- A suite rejeita marcadores obsoletos como `totalGrossCents` e `trialBalance`.
- A suite rejeita `req.body.companyId` e `req.query.companyId` nos services criticos.
- A suite inclui simulacao negativa por `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER`, permitindo negativos reproduziveis sem alterar services reais.
- `real_dev/api/package.json` expoe `test:mf7:critical-modules` e inclui esse comando em `test:mf7`.
- `real_dev/api/evidence/mf7-critical-modules.md` documenta proof, tres negativos, multiempresa e handoff para `BK-MF8-01`.

### Rastreabilidade

| BK | Fonte canonica | Implementacao real | Estado |
| --- | --- | --- | --- |
| `BK-MF7-10` | `RNF27`, matriz/backlog MF7 e guia alvo | `real_dev/api/tests/contracts/mf7-critical-modules.test.js`, `real_dev/api/package.json`, `real_dev/api/evidence/mf7-critical-modules.md`, services criticos de `sales`, `tax`, `accounting-reports` e `treasury` | `AUDITADO_OK` |

### Coerencia MF/BK vizinhas

- `MF6 -> MF7`: `OK`. Os gates MF6 passaram, incluindo hardening, sessao, ambiente, concorrencia local-contract e auditoria sensivel; isto sustenta os modulos criticos que `BK-MF7-10` protege.
- `BK-MF7-08 -> BK-MF7-10`: `OK`. O backend modular passou dentro de `npm --prefix real_dev/api run test:mf7`, incluindo `check:mf7:backend-modules`.
- `BK-MF7-09 -> BK-MF7-10`: `OK`. O gate frontend MF7 tambem passou; nao ha sinal de frontend a decidir ownership, role, permissao final ou empresa ativa.
- `BK-MF7-10 -> BK-MF8-01`: `OK_COM_ADVISORY`. `BK-MF8-01` recebe uma baseline automatizada para acrescentar logs estruturados sobre services criticos testaveis; permanece apenas o risco operacional de nao haver BD dedicada para integracao sem skip.

### Findings atuais

Nao existem findings ativos para `BK-MF7-10` nesta passagem.

| Severidade | Quantidade ativa | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nenhum finding P0 confirmado. |
| `P1` | 0 | Nenhum finding P1 confirmado. |
| `P2` | 0 | Nenhum finding P2 confirmado. |
| `P3` | 0 | Nenhum finding P3 confirmado. |

### Comandos executados nesta passagem

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja continha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservados. |
| `git check-ignore -v real_dev/api/tests/contracts/mf7-critical-modules.test.js real_dev/api/evidence/mf7-critical-modules.md` | `PASS` | Ambos os artefactos reais do BK ficam sob `real_dev/`, confirmado como ignorado via `.gitignore:4`. |
| `node --check real_dev/api/tests/contracts/mf7-critical-modules.test.js` | `PASS` | Sem output, sintaxe valida. |
| `npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS` | 3 testes passaram; 0 falhas. |
| `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=faturacao:assertOpenFiscalPeriod npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS_NEGATIVO` | Falhou como esperado com mensagem de falta do marcador critico `assertOpenFiscalPeriod` em `faturacao`. |
| `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=balancetes:buildTrialBalance npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS_NEGATIVO` | Falhou como esperado com mensagem de falta do marcador critico `buildTrialBalance` em `balancetes`. |
| `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=reconciliacao:recordIntegrationLog npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS_NEGATIVO` | Falhou como esperado com mensagem de falta do marcador critico `recordIntegrationLog` em `reconciliacao`. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram; 0 falhas. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exportacoes, importacoes, SAF-T, backend modules e critical modules passaram. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram; 0 falhas. |
| `npm --prefix real_dev/api run test:mf6` | `PASS` | Gates MF6 passaram; concorrencia em modo `local-contract`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados explicitamente por falta de BD dedicada. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility gate, frontend modules, `tsc --noEmit` e `vite build` passaram. |
| `rg` de risco em `real_dev/api real_dev/web` | `PASS_COM_RUIDO_CONTROLADO` | Matches contextuais/defensivos: redacao de segredos, testes com tokens falsos, storage privado e filtros de seguranca; sem finding para `BK-MF7-10`. |
| `rg` de drift de dominio em `real_dev/api real_dev/web real_dev/api/evidence/mf7-critical-modules.md` | `PASS` | Sem matches. |
| `rg` dirigido a marcadores dos quatro services criticos | `PASS` | Marcadores esperados encontrados nos services reais; sem `req.body.companyId`/`req.query.companyId` nos services criticos. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por divida documental global/preexistente nos guias. |
| `git diff --check` antes desta atualizacao | `PASS` | Sem erros de whitespace antes de atualizar este relatorio. |

### Validacoes nao executadas

- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado por falta de `TEST_DATABASE_URL`/BD dedicada.
- Testes funcionais completos com PostgreSQL real para calculos contabilisticos/fiscais detalhados: fora do objetivo minimo deste BK, que entrega um gate de contrato `RNF27`.
- Alteracoes manuais temporarias em services reais para negativos: nao executadas por design; os negativos foram simulados por variavel de ambiente e preservaram a app intacta.

### Ficheiros alterados nesta passagem

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Proxima acao recomendada

Manter `BK-MF7-10` como `AUDITADO_OK`. Antes de trabalho MF8 em observabilidade/logs, usar `npm --prefix real_dev/api run test:mf7:critical-modules` e `npm --prefix real_dev/api run test:mf7` como gates de regressao, e executar integracao sem skip quando existir BD dedicada.
