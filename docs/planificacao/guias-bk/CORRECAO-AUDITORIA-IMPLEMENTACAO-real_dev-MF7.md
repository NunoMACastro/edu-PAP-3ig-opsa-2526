> [!WARNING]
> `SNAPSHOT_HISTORICO_SUPERSEDED` — estado `SUPERSEDED` em 2026-07-10.
>
> Este relatório preserva um snapshot histórico e não representa o estado corrente.
> Fonte atual: [relatório canónico](../auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md).
> Não reutilizar contagens, comandos, paths ou decisões deste corpo como evidence atual.

# Correcao da auditoria de implementacao real_dev - MF7

## Execucao atual - BK-MF7-03 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria`
- MF alvo: `MF7`
- BKs abrangidos: `BK-MF7-03`
- Implementation root: `real_dev`
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Finding alvo: `MF7-IMP-AUD-20260630-BK03-F01`
- Severidades permitidas: `P0,P1,P2,P3`
- Permissao de codigo: apenas `real_dev`
- Alteracoes de codigo realizadas: nenhuma
- Alteracoes documentais realizadas: apenas este relatorio tecnico de correcao, por `OUTPUT_MODE=relatorio_e_resumo`
- Commits: nao executados

### Resultado geral

Resultado geral: `BLOQUEADO_AMBIENTE`

O finding `MF7-IMP-AUD-20260630-BK03-F01` foi reconfirmado contra o relatorio de auditoria, o guia `BK-MF7-03`, a evidence atual e a implementacao real em `real_dev/web`. A causa raiz que falta fechar nao e uma falha de codigo detetada nesta execucao: e a ausencia de smoke manual real em Chrome, Edge e Firefox, com versoes e resultados observados.

O codigo atual ja entrega a parte automatizavel de `RNF20`: `test:mf7:browser-compatibility`, agregador `test:mf7`, gate contra ramos por browser, cliente HTTP com `credentials: "include"`, foco visivel, breakpoint responsivo, `ResponsiveDataTable`, typecheck e build. Esses gates passaram novamente nesta execucao.

Nao foram feitas alteracoes em `real_dev`, porque preencher `real_dev/web/evidence/mf7-browser-compatibility.md` sem abrir Chrome, Edge e Firefox reais mascararia a falta de evidence operacional pedida pelo guia e pelo `RNF20`.

### Estado final por BK

| BK | RNF | Estado final | Bloqueia PASS absoluto? | Justificacao |
| --- | --- | --- | --- | --- |
| `BK-MF7-03` | `RNF20` | `PARCIAL` / `AUDITADO_COM_FINDINGS` | Sim | Gates automaticos, typecheck e build passam; o smoke manual real nos tres browsers alvo continua bloqueado pela ausencia de Chrome, Edge e Firefox neste ambiente. |

### Estado final por finding

| Finding | Severidade | BK/RNF | Estado final | Justificacao |
| --- | --- | --- | --- | --- |
| `MF7-IMP-AUD-20260630-BK03-F01` | `P1` | `BK-MF7-03` / `RNF20` | `BLOQUEADO_AMBIENTE` | Nao ha browser alvo instalado ou invocavel para executar o smoke manual exigido; corrigir por simulacao ou preencher evidence sem execucao real seria incorreto. |

### Evidencia objetiva

- `docs/RNF.md` associa `RNF20` a compatibilidade com Chrome, Edge e Firefox.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md` associam `BK-MF7-03` a `RNF20` e ao handoff para `BK-MF7-04`.
- `docs/planificacao/guias-bk/MF7/BK-MF7-03-compativel-com-chrome-edge-e-firefox.md` exige gate automatico, typecheck/build e smoke manual nos tres browsers alvo com versoes/resultados observados.
- `real_dev/web/package.json` expoe `test:mf7:browser-compatibility` e `test:mf7`.
- `real_dev/web/scripts/check-mf7-browser-compatibility.mjs` valida ausencia de ramos por browser e confirma contratos minimos de sessao, foco, responsividade e tabela responsiva.
- `real_dev/web/evidence/mf7-browser-compatibility.md` existe, mas mantem Chrome, Edge e Firefox como `BLOQUEADO_AMBIENTE`.
- `command -v google-chrome`, `chromium`, `firefox` e `microsoft-edge` terminaram sem executavel encontrado.
- `find /Applications` e `find /Users/nuno/Applications` nao encontraram apps Chrome, Chromium, Firefox ou Edge.

### Rastreabilidade

| BK | RNF | Ficheiros confirmados | Validacoes |
| --- | --- | --- | --- |
| `BK-MF7-03` | `RNF20` | `real_dev/web/package.json`; `real_dev/web/scripts/check-mf7-browser-compatibility.mjs`; `real_dev/web/evidence/mf7-browser-compatibility.md`; `real_dev/web/src/App.tsx`; `real_dev/web/src/styles.css`; `real_dev/web/src/ui/opsaUi.tsx`; `real_dev/web/src/ui/ResponsiveDataTable.tsx`; `real_dev/web/src/lib/apiClient.ts` | `test:mf7:browser-compatibility`; `test:mf7` web; verificacao de browsers no `PATH`; pesquisa de apps em `/Applications` e `~/Applications`; coerencia API MF7/MF6; scans dirigidos de risco e drift. |

### Coerencia entre MFs

- `MF6 -> MF7`: `OK`. Os gates MF6 passaram e os contratos de sessao/cookie/hardening nao foram enfraquecidos.
- `BK-MF7-02 -> BK-MF7-03`: `OK_COM_RISCOS`. A retencao legal backend continua validada; o risco de `BK-MF7-03` fica isolado na prova manual de browser.
- `BK-MF7-03 -> BK-MF7-04`: `OK_COM_RISCOS`. O frontend compila e evita browser detection; o fluxo seguinte de email esta testado, mas a compatibilidade runtime real ainda precisa de evidence manual.
- `MF7 -> MF8`: `OK_COM_RISCOS`. MF8 pode consumir os gates automaticos MF7, mantendo como pre-condicao operacional o smoke manual de Chrome, Edge e Firefox.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja tinha alteracoes preexistentes em docs/MF8 e relatorios MF7; preservadas. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` confirmado como root ignorado por Git. |
| `npm run test:mf7:browser-compatibility` em `real_dev/web` | `PASS` | Output `MF7 browser compatibility gate OK`. |
| `npm run test:mf7` em `real_dev/web` | `PASS` | Browser compatibility gate, frontend modules, typecheck e Vite build passaram. |
| `command -v google-chrome` | `BLOQUEADO_AMBIENTE` | Exit code `1`; executavel ausente no `PATH`. |
| `command -v chromium` | `BLOQUEADO_AMBIENTE` | Exit code `1`; executavel ausente no `PATH`. |
| `command -v firefox` | `BLOQUEADO_AMBIENTE` | Exit code `1`; executavel ausente no `PATH`. |
| `command -v microsoft-edge` | `BLOQUEADO_AMBIENTE` | Exit code `1`; executavel ausente no `PATH`. |
| `find /Applications ... Chrome/Chromium/Firefox/Edge` | `BLOQUEADO_AMBIENTE` | Sem apps alvo encontradas. |
| `find /Users/nuno/Applications ... Chrome/Chromium/Firefox/Edge` | `BLOQUEADO_AMBIENTE` | Sem apps alvo encontradas. |
| `npm run test:mf7` em `real_dev/api` | `PASS` | Retencao, email, exports, imports, SAF-T, modulos backend e modulos criticos passaram. |
| `npm run test:mf6` em `real_dev/api` | `PASS` | Gates MF6 passaram; concorrencia em `mode: local-contract`. |
| `npm run syntax:check` em `real_dev/api` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm run prisma:validate` em `real_dev/api` | `PASS` | Schema Prisma valido. |
| `npm run test:unit` em `real_dev/api` | `PASS` | 74 testes passaram. |
| `npm run test:contracts` em `real_dev/api` | `PASS` | 53 testes passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm run test:integration` em `real_dev/api` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados por falta de `TEST_DATABASE_URL` persistente. |
| `rg` documental por `RNF20`/`BK-MF7-03` | `PASS` | Contrato encontrado em RNF, matriz, backlog, MF-VIEWS, guia alvo e guias vizinhos. |
| `rg` de risco dirigido a `real_dev/web` e `real_dev/api` | `PASS_COM_RUIDO_CONTROLADO` | Matches esperados em padroes proibidos do proprio gate/evidence, testes de redacao de segredos e listas defensivas; sem finding novo para `BK-MF7-03`. |
| `rg` de drift de dominio dirigido a `real_dev/web` e `real_dev/api` | `PASS` | Sem referencias a outros produtos/dominios no alvo. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por divida documental historica fora deste scope, incluindo avisos de qualidade em guias. |
| `git diff --check` | `PASS` | Sem erros de whitespace no diff atual. |
| `rg -n "[[:blank:]]$" docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md` | `PASS` | Sem trailing whitespace neste relatorio tecnico. |

### Validacoes nao executadas

- Smoke manual real em Chrome, Edge e Firefox: nao executado porque os browsers alvo nao existem como executaveis no `PATH` nem como apps em `/Applications` ou `~/Applications`.
- Atualizacao de `real_dev/web/evidence/mf7-browser-compatibility.md` com versoes/resultados: nao executada porque nao houve smoke real.
- `npm run dev` com abertura manual em browsers: nao executado porque faltam os browsers alvo.
- Negativos mutaveis do gate: nao executados nesta correcao para nao introduzir alteracoes temporarias em ficheiros de codigo; os padroes proibidos estao cobertos pelo gate e pela evidence existente.
- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado porque nao existe `TEST_DATABASE_URL` efemera configurada.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- `BLOCKER_AMBIENTE`: disponibilizar Chrome, Edge e Firefox instalados/invocaveis para executar o smoke manual de `BK-MF7-03`.
- `TODO_OPERACIONAL`: abrir a app nos tres browsers, registar versoes, fluxos revistos e resultados observados em `real_dev/web/evidence/mf7-browser-compatibility.md`.
- `TODO_OPERACIONAL`: repetir `npm run test:mf7` em `real_dev/web` depois da evidence manual.
- `TODO_OPERACIONAL`: configurar `TEST_DATABASE_URL` efemera para correr `test:integration` sem skip.

### Proxima acao recomendada

Executar esta correcao operacional num ambiente com Chrome, Edge e Firefox disponiveis. Se os tres smokes forem positivos e a evidence for preenchida com versoes/resultados reais, o finding `MF7-IMP-AUD-20260630-BK03-F01` pode ser fechado sem nova alteracao de codigo.

## Execucao atual - BK-MF7-02 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria`
- MF alvo: `MF7`
- BKs abrangidos: `BK-MF7-02`
- Implementation root: `real_dev`
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Finding IDs selecionados: todos os findings ativos do BK alvo (`FINDING_IDS=[]`)
- Severidades permitidas: `P0,P1,P2,P3`
- Permissao de codigo: apenas `real_dev`
- Alteracoes de codigo realizadas: nenhuma
- Alteracoes documentais realizadas: apenas este relatorio tecnico de correcao, por `OUTPUT_MODE=relatorio_e_resumo`
- Commits: nao executados

### Resultado geral

Resultado geral: `JA_CORRIGIDO`

A auditoria MF7 atual nao contem findings ativos para `BK-MF7-02`. A seccao de reauditoria do BK marca o estado como `PASS` / `AUDITADO_OK` e nao lista findings `P0`, `P1`, `P2` ou `P3` por corrigir.

Foi reconfirmado que o contrato `RNF19` de retencao legal contabilistica ja esta implementado em `real_dev`: existe o modelo `RetentionHold`, a relacao `Company.retentionHolds`, a politica de retencao de 10 anos para entidades contabilisticas, o gate de remocao com bloqueio `409 RETENTION_HOLD_ACTIVE`, a acao sensivel `retention.delete.allowed` e a cobertura automatica focada. Por isso, a correcao apropriada nesta execucao foi registar o estado como sem findings confirmados, sem alterar codigo.

### Estado final por BK

| BK | RNF | Estado final | Bloqueia PASS absoluto? | Justificacao |
| --- | --- | --- | --- | --- |
| `BK-MF7-02` | `RNF19` | `AUDITADO_OK` / `JA_CORRIGIDO` | Nao | A auditoria atual nao contem findings ativos para este BK e os contratos de retencao passam nos testes focados, MF7, unitarios, contratuais e integracao com skip explicito. |

### Estado final por finding

| Finding | Severidade | Estado final | Justificacao |
| --- | --- | --- | --- |
| N/A | N/A | `SEM_FINDINGS_ATIVOS` | O relatorio de auditoria atual nao apresenta findings ativos associados a `BK-MF7-02`. |

### Evidencia objetiva

- `real_dev/api/prisma/schema.prisma` define `RetentionHold`, `Company.retentionHolds`, unicidade por `companyId/entity/entityId` e indices por empresa/entidade e empresa/data de retencao.
- `real_dev/api/src/modules/compliance/retentionPolicy.js` limita a politica a entidades contabilisticas protegidas, calcula retencao a 10 anos e bloqueia remocao com `RetentionHoldActiveError`.
- `real_dev/api/src/modules/compliance/retentionDeletionGate.js` centraliza o gate de remocao e regista `retention.delete.allowed` apenas quando a remocao fica autorizada.
- `real_dev/api/src/modules/audit/auditLogService.js` trata `retention.delete.allowed` como acao sensivel e filtra chaves sensiveis antes de persistir detalhes.
- `real_dev/api/tests/unit/retentionPolicy.test.js` cobre calculo de 10 anos, datas invalidas, entidades protegidas, retencao ativa, ausencia/expiracao de retencao, mapeamento `409`, auditoria quando autorizado e ausencia de auditoria quando bloqueado.
- A pesquisa dirigida por remocoes confirmou que nao existem endpoints publicos `DELETE` para `SaleDocument`, `PurchaseDocument`, `JournalEntry`, `VatMapRun`, `SaftExportRun` ou `AuditLog`; os matches encontrados sao remocoes de linhas/entidades fora deste contrato ou limpezas internas.

### Rastreabilidade

| BK | RNF | Ficheiros confirmados | Validacoes |
| --- | --- | --- | --- |
| `BK-MF7-02` | `RNF19` | `real_dev/api/prisma/schema.prisma`; `real_dev/api/src/modules/compliance/retentionPolicy.js`; `real_dev/api/src/modules/compliance/retentionDeletionGate.js`; `real_dev/api/src/modules/audit/auditLogService.js`; `real_dev/api/tests/unit/retentionPolicy.test.js`; `real_dev/api/package.json` | `test:mf7:retention`; `syntax:check`; `prisma:validate`; `test:mf7`; `test:mf6`; `test:unit`; `test:contracts`; `test:integration` com skip explicito; `npm run test:mf7` em `real_dev/web`; scans dirigidos de risco e drift. |

### Coerencia entre MFs

- `MF6 -> MF7`: `OK`. O gate de retencao reutiliza auditoria sensivel sem quebrar os contratos MF6; `npm run test:mf6` passou.
- `BK-MF7-01 -> BK-MF7-02`: `OK_COM_RISCOS`. `BK-MF7-01` continua dependente de prova operacional com `pg_dump`/`pg_restore`, mas esse blocker nao invalida a implementacao e os testes de retencao de `BK-MF7-02`.
- `BK-MF7-02 -> BK-MF7-03`: `OK`. A compatibilidade frontend/browser nao altera o contrato backend de retencao legal.
- `MF7 -> MF8`: `OK`. A acao sensivel `retention.delete.allowed` e a auditabilidade estruturada ficam disponiveis para consumo por MF8.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja tinha alteracoes preexistentes em docs/MF8 e relatorios MF7; preservadas. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` confirmado como root ignorado por Git. |
| `npm run test:mf7:retention` em `real_dev/api` | `PASS` | 9 testes de retencao passaram. |
| `npm run syntax:check` em `real_dev/api` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm run prisma:validate` em `real_dev/api` | `PASS` | Schema Prisma valido. |
| `npm run test:mf7` em `real_dev/api` | `PASS` | Retencao, email, exports, imports, SAF-T, modulos backend e modulos criticos passaram. |
| `npm run test:mf6` em `real_dev/api` | `PASS` | Gates MF6 passaram; concorrencia em `mode: local-contract`. |
| `npm run test:unit` em `real_dev/api` | `PASS` | 74 testes passaram. |
| `npm run test:contracts` em `real_dev/api` | `PASS` | 53 testes passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm run test:integration` em `real_dev/api` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados por falta de `TEST_DATABASE_URL` persistente. |
| `npm run test:mf7` em `real_dev/web` | `PASS` | Browser compatibility gate, frontend modules, typecheck e build passaram. |
| `rg` de risco dirigido a compliance/audit/retention/schema/package | `PASS_COM_OBSERVACOES` | Apenas matches defensivos para a palavra `secret` nas listas de filtragem de `auditLogService.js`. |
| `rg` de drift de dominio dirigido ao alvo | `PASS` | Sem referencias a outros produtos/dominios no alvo. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por divida documental historica fora deste scope. |
| `git diff --check` | `PASS` | Sem erros de whitespace no diff tracked atual. |
| `rg -n "[[:blank:]]$" docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md` | `PASS` | Sem trailing whitespace neste relatorio tecnico. |

### Validacoes nao executadas

- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado porque nao existe `TEST_DATABASE_URL` efemera configurada.
- Prova runtime de endpoint destrutivo protegido: nao aplicavel nesta execucao, porque nao foram encontrados endpoints publicos `DELETE` para as entidades contabilisticas protegidas por `BK-MF7-02`.
- Instalacao de dependencias, PostgreSQL tools ou browsers: nao executada por falta de necessidade para este BK e por estar fora do scope.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- Sem blocker de codigo para `BK-MF7-02`.
- `TODO_OPERACIONAL`: configurar `TEST_DATABASE_URL` efemera para correr `test:integration` sem skip.
- `TODO_IMPLEMENTACAO_FUTURA`: se forem criados endpoints destrutivos para documentos/vat/SAF-T/audit log, devem consumir o gate de retencao antes de qualquer remocao.
- `RISCO_VIZINHO`: `BK-MF7-01` continua dependente de prova operacional com `pg_dump`/`pg_restore`, fora deste BK alvo.

### Proxima acao recomendada

Manter `BK-MF7-02` como `AUDITADO_OK` / `JA_CORRIGIDO`. A proxima acao de MF7 deve focar os blockers ambientais de `BK-MF7-01` e `BK-MF7-03`, nao a retencao legal contabilistica.

## Execucao atual - BK-MF7-01 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria`
- MF alvo: `MF7`
- BKs abrangidos: `BK-MF7-01`
- Implementation root: `real_dev`
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Finding alvo: `MF7-IMP-AUD-20260630-BK01-F01`
- Severidades permitidas: `P0,P1,P2,P3`
- Permissao de codigo: apenas `real_dev`
- Alteracoes de codigo realizadas: nenhuma
- Alteracoes documentais realizadas: apenas este relatorio tecnico de correcao
- Commits: nao executados

### Resultado geral

Resultado geral: `BLOQUEADO`

O finding `MF7-IMP-AUD-20260630-BK01-F01` foi reconfirmado, mas nao ha uma correcao segura a aplicar no repositorio. O codigo de `BK-MF7-01` ja entrega os scripts `mf7:backup` e `mf7:backup:verify`, usa `pg_dump`/`pg_restore` sem shell, valida negativos principais e nao escreve `DATABASE_URL` no manifesto. A lacuna restante e operacional: este ambiente nao tem `pg_dump` nem `pg_restore`, por isso nao e possivel gerar um dump real nem provar `restorable: true`.

Nao foram feitas alteracoes em `real_dev`, porque substituir a prova real por simulacao ou alterar os scripts para contornar a ausencia das ferramentas mascararia o requisito `RNF18`.

### Estado final por finding

| Finding | Severidade | BK/RNF | Estado final | Bloqueia PASS absoluto? | Justificacao |
| --- | --- | --- | --- | --- | --- |
| `MF7-IMP-AUD-20260630-BK01-F01` | `P1` | `BK-MF7-01` / `RNF18` | `BLOQUEADO_AMBIENTE` | Sim | `pg_dump` e `pg_restore` continuam ausentes; a prova positiva de backup/restauro nao pode ser executada neste ambiente. |

### Evidencia objetiva

- `real_dev/api/package.json` expoe `mf7:backup` e `mf7:backup:verify`.
- `real_dev/api/scripts/run-daily-backup.mjs` chama `spawnSync("pg_dump", ["--format=custom", "--no-owner", "--file", backupPath, databaseUrl])`.
- `real_dev/api/scripts/verify-backup-restore.mjs` chama `spawnSync("pg_restore", ["--list", backupPath])`.
- `command -v pg_dump` e `command -v pg_restore` terminaram com exit code `1`.
- Caminhos comuns verificados sem ferramenta encontrada: `/opt/homebrew/bin`, `/opt/homebrew/opt/libpq/bin`, `/usr/local/bin` e `/Applications/Postgres.app/Contents/Versions/latest/bin`.
- `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> OPSA_BACKUP_DIR=/private/tmp/opsa-mf7-backup-validation npm --prefix real_dev/api run mf7:backup` falhou com `pg_dump nao arrancou`.
- `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/fake.dump npm --prefix real_dev/api run mf7:backup:verify` falhou com `pg_restore nao arrancou`.

### Decisoes de correcao

- Nao foi alterado `run-daily-backup.mjs`, porque ja falha de forma controlada quando `DATABASE_URL` falta ou quando `pg_dump` nao existe.
- Nao foi alterado `verify-backup-restore.mjs`, porque ja valida ficheiro ausente, ficheiro vazio e tenta listar o catalogo com `pg_restore --list`.
- Nao foi criada simulacao de `pg_dump`/`pg_restore`, porque isso nao provaria restauracao possivel.
- Nao foram instaladas ferramentas PostgreSQL, porque isso exige autorizacao explicita e altera o ambiente fora do repositorio.

### Rastreabilidade

| BK | RNF | Ficheiros confirmados | Validacoes |
| --- | --- | --- | --- |
| `BK-MF7-01` | `RNF18` | `real_dev/api/scripts/run-daily-backup.mjs`; `real_dev/api/scripts/verify-backup-restore.mjs`; `real_dev/api/package.json` | negativos `mf7:backup`; negativos `mf7:backup:verify`; `syntax:check`; `prisma:validate`; `test:mf6`; `test:mf7`; `test:unit`; `test:contracts`; `test:integration` com skip explicito; `npm --prefix real_dev/web run test:mf7`. |

### Coerencia entre MFs

- `MF6 -> MF7`: `OK_COM_RISCOS`. Os gates MF6 passaram e o contrato de segredos/ambiente continua preservado; o risco fica limitado a ferramentas PostgreSQL externas.
- `BK-MF7-01 -> BK-MF7-02`: `OK_COM_RISCOS`. `BK-MF7-02` continua validado dentro de `test:mf7`; falta apenas evidence positiva de backup/restauro.
- `MF7 -> MF8`: `OK_COM_RISCOS`. MF8 pode consumir os comandos e a baseline MF7, mantendo como pre-condicao operacional a prova `restorable: true`.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Worktree ja tinha alteracoes documentais/MF8 e relatorios MF7 nao rastreados; preservadas. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` confirmado como root ignorado por Git. |
| `command -v pg_dump` | `BLOQUEADO_AMBIENTE` | Exit code `1`; ferramenta ausente. |
| `command -v pg_restore` | `BLOQUEADO_AMBIENTE` | Exit code `1`; ferramenta ausente. |
| `ls -l` em caminhos comuns de PostgreSQL tools | `BLOQUEADO_AMBIENTE` | Sem `pg_dump`/`pg_restore`. |
| `npm --prefix real_dev/api run mf7:backup` | `NEGATIVO_PASS` | Falhou com `DATABASE_URL em falta para executar backup`. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> OPSA_BACKUP_DIR=/private/tmp/opsa-mf7-backup-validation npm --prefix real_dev/api run mf7:backup` | `BLOQUEADO_AMBIENTE` | Falhou com `pg_dump nao arrancou`. |
| `npm --prefix real_dev/api run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou com falta de `--file`/`OPSA_BACKUP_FILE`. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/inexistente.dump npm --prefix real_dev/api run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou com backup inexistente. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/empty.dump npm --prefix real_dev/api run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou com ficheiro vazio. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/fake.dump npm --prefix real_dev/api run mf7:backup:verify` | `BLOQUEADO_AMBIENTE` | Falhou com `pg_restore nao arrancou`. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:mf6` | `PASS` | Gates MF6 passaram; concorrencia em `mode: local-contract`. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Retencao, email, exports, imports, SAF-T, backend modules e critical modules passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO` | 2 testes saltados por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility gate, frontend modules, typecheck e build passaram. |
| `rg` de risco dirigido ao alvo | `PASS` | Sem matches aplicaveis em scripts/package do BK. |
| `rg` de drift de dominio dirigido ao alvo | `PASS` | Sem referencias a outros produtos/dominios no alvo. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORY` | `overall_pass=true`; `advisory_pass=false` por divida documental historica fora deste scope. |
| `git diff --check` | `PASS` | Sem erros de whitespace no diff tracked atual. |
| `rg -n "[[:blank:]]$" docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md` | `PASS` | Sem trailing whitespace no relatorio tecnico nao rastreado. |

### Validacoes nao executadas

- Fluxo feliz real `mf7:backup` + `mf7:backup:verify`: bloqueado por falta de `pg_dump` e `pg_restore`.
- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`: nao executado porque nao existe `TEST_DATABASE_URL` efemera configurada.
- Instalacao de PostgreSQL tools: nao executada por falta de autorizacao explicita e por ser alteracao de ambiente fora do repositorio.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- `BLOCKER_AMBIENTE`: disponibilizar `pg_dump` e `pg_restore` no `PATH`, ou indicar caminhos operacionais equivalentes.
- `TODO_OPERACIONAL`: executar `npm --prefix real_dev/api run mf7:backup` contra base PostgreSQL efemera segura e depois `npm --prefix real_dev/api run mf7:backup:verify` sobre o dump gerado.
- `TODO_OPERACIONAL`: guardar evidence segura com manifesto `.dump.json`, `restorable: true`, `catalogEntries > 0` e negativos principais.
- `TODO_OPERACIONAL`: configurar `TEST_DATABASE_URL` efemera e correr `test:integration` sem skip.

### Proxima acao recomendada

Executar a validacao operacional de `BK-MF7-01` num ambiente com ferramentas PostgreSQL instaladas. Se `pg_dump` criar o dump real e `pg_restore --list` devolver `restorable: true`, o finding pode ser fechado sem nova alteracao de codigo.

## Execucao consolidada - MF7 completa - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria`
- MF alvo: `MF7`
- BKs abrangidos: todos os BKs de MF7 (`BK_IDS=[]`)
- Implementation root: `real_dev`
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Finding IDs selecionados: todos os findings ativos da auditoria (`FINDING_IDS=[]`)
- Severidades permitidas: `P0,P1,P2,P3`
- Alteracoes de codigo realizadas: nenhuma
- Alteracoes documentais realizadas: apenas este relatorio tecnico de correcao
- Commits: nao executados

### Resultado geral

Resultado geral: `BLOQUEADO`

A auditoria consolidada de MF7 tem dois findings `P1` ativos. Ambos foram reconfirmados nesta execucao e nenhum tem uma correcao segura dentro de `real_dev`: `BK-MF7-01` depende de ferramentas externas PostgreSQL (`pg_dump` e `pg_restore`) ausentes neste ambiente, e `BK-MF7-03` depende de smoke manual real em Chrome, Edge e Firefox, mas esses browsers nao estao disponiveis no `PATH` nem como aplicacoes alvo em `/Applications` ou `~/Applications`.

Nao foram feitas alteracoes de codigo, porque os gates automaticos MF7, MF6, unitarios e contratuais passam, os negativos dos scripts de backup/restauro falham de forma controlada, e uma alteracao local sem as ferramentas externas apenas mascararia a falta de evidence operacional exigida pelos BKs.

### Estado final por finding ativo

| Finding | Severidade | BK / RNF | Estado final | Bloqueia PASS absoluto? | Justificacao |
| --- | --- | --- | --- | --- | --- |
| `MF7-IMP-AUD-20260630-BK01-F01` | `P1` | `BK-MF7-01` / `RNF18` | `BLOQUEADO_AMBIENTE` | Sim | `pg_dump` e `pg_restore` continuam ausentes; nao e possivel gerar dump real nem provar `restorable: true`. |
| `MF7-IMP-AUD-20260630-BK03-F01` | `P1` | `BK-MF7-03` / `RNF20` | `BLOQUEADO_AMBIENTE` | Sim | Chrome, Chromium, Firefox e Edge nao estao disponiveis para executar o smoke manual exigido pelo guia. |

### Findings sem acao adicional

| Finding | Severidade | Estado | Justificacao |
| --- | --- | --- | --- |
| `P3-MF7-06-01` | `P3` | `JA_CORRIGIDO` | A auditoria consolidada ja o marca como corrigido; `test:mf7:imports` e `test:mf7` continuam a passar. |

### Evidencia de blockers

| Verificacao | Resultado | Nota |
| --- | --- | --- |
| `command -v pg_dump` | `BLOQUEADO_AMBIENTE` | Exit code `1`; ferramenta ausente no `PATH`. |
| `command -v pg_restore` | `BLOQUEADO_AMBIENTE` | Exit code `1`; ferramenta ausente no `PATH`. |
| `ls -l` em caminhos comuns de PostgreSQL tools | `BLOQUEADO_AMBIENTE` | Sem `pg_dump`/`pg_restore` em Homebrew, libpq, `/usr/local/bin` ou Postgres.app. |
| `DATABASE_URL= npm --prefix real_dev/api run mf7:backup` | `NEGATIVO_PASS` | Falhou com `DATABASE_URL em falta para executar backup`. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> OPSA_BACKUP_DIR=/private/tmp/opsa-mf7-backup-validation npm --prefix real_dev/api run mf7:backup` | `BLOQUEADO_AMBIENTE` | Falhou com `pg_dump nao arrancou`. |
| `npm --prefix real_dev/api run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou com falta de `--file`/`OPSA_BACKUP_FILE`. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/inexistente.dump npm --prefix real_dev/api run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou com backup inexistente. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/vazio.dump npm --prefix real_dev/api run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou com ficheiro vazio. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/fake.dump npm --prefix real_dev/api run mf7:backup:verify` | `BLOQUEADO_AMBIENTE` | Falhou com `pg_restore nao arrancou`. |
| `command -v google-chrome`, `chromium`, `firefox`, `microsoft-edge` | `BLOQUEADO_AMBIENTE` | Todos terminaram com exit code `1`. |
| `find /Applications /Users/nuno/Applications ...` | `BLOQUEADO_AMBIENTE` | Apenas `Chromium Apps.localized`; sem app executavel alvo. |

### Validacoes executadas

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Existem alteracoes preexistentes fora do escopo; preservadas. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` esta ignorado por `.gitignore`, por isso foi validado por leitura direta e comandos. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Agregador MF7 backend passou: retencao, email, exports, imports, SAF-T e modulos criticos. |
| `npm --prefix real_dev/web run test:mf7` | `PASS` | Browser compatibility gate, frontend modules, typecheck e build passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 74 testes, 0 falhas. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes, 0 falhas. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS` | 2 testes saltados explicitamente por falta de BD persistente configurada. |
| `npm --prefix real_dev/api run test:mf6` | `PASS_COM_RESSALVAS` | Gates MF6 passaram; concorrencia em `mode: local-contract`. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_ADVISORIES` | `overall_pass=true`; `advisory_pass=false` por qualidade historica de guias fora desta correcao. |
| `git diff --check` | `PASS` | Sem erros de whitespace no diff atual. |

### Validacoes nao executadas

- Fluxo feliz real `mf7:backup` + `mf7:backup:verify`: nao executado porque `pg_dump` e `pg_restore` nao existem no ambiente.
- Smoke manual real Chrome/Edge/Firefox de `BK-MF7-03`: nao executado porque os browsers alvo nao estao disponiveis neste ambiente.
- `test:integration` sem skip: nao executado porque nao existe `TEST_DATABASE_URL` efemera configurada.
- Instalacao de PostgreSQL tools ou browsers: nao executada por falta de autorizacao explicita e por ser alteracao de ambiente fora do repositorio.

### Coerencia entre MFs

- `MF6 -> MF7`: `OK_COM_RISCOS`. Os gates MF6 passam; o risco restante e operacional e nao altera contratos de seguranca, auditoria ou performance ja validados.
- `BK-MF7-01 -> BK-MF7-02`: `OK_COM_RISCOS`. A retencao legal continua implementada e testada; o backup/restauro ainda precisa de evidence positiva com ferramentas PostgreSQL reais.
- `BK-MF7-03 -> MF7 restante`: `OK_COM_RISCOS`. Os gates automaticos de compatibilidade passam, mas nao substituem o smoke manual nos tres browsers alvo.
- `MF7 -> MF8`: `OK_COM_RISCOS`. A MF8 pode continuar a consumir contratos de MF7, mantendo como pre-condicao operacional o fecho dos dois blockers externos.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- `BLOCKER_AMBIENTE`: disponibilizar `pg_dump` e `pg_restore` no `PATH`, ou fornecer caminhos equivalentes operacionais, para validar `BK-MF7-01`.
- `BLOCKER_AMBIENTE`: disponibilizar Chrome, Edge e Firefox executaveis para executar o smoke manual exigido por `BK-MF7-03`.
- `TODO_OPERACIONAL`: reexecutar `npm --prefix real_dev/api run mf7:backup` contra uma base PostgreSQL efemera segura e depois `npm --prefix real_dev/api run mf7:backup:verify` sobre o dump gerado.
- `TODO_OPERACIONAL`: registar evidence com manifesto `.dump.json`, `restorable: true`, `catalogEntries > 0` e negativos principais.
- `TODO_OPERACIONAL`: reexecutar o smoke manual em Chrome, Edge e Firefox e atualizar `real_dev/web/evidence/mf7-browser-compatibility.md` quando houver ambiente adequado.

### Proxima acao recomendada

Manter `MF7` em `PASS_COM_RISCOS`/`BLOQUEADO` para fecho absoluto ate existir evidence operacional externa. A proxima execucao deve ser num ambiente com PostgreSQL client tools e browsers alvo instalados; se a evidence positiva passar, os findings `MF7-IMP-AUD-20260630-BK01-F01` e `MF7-IMP-AUD-20260630-BK03-F01` podem ser fechados sem nova alteracao de codigo.

## Execucao atual - BK-MF7-06 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria`
- MF alvo: `MF7`
- BKs abrangidos: `BK-MF7-06`
- Implementation root: `real_dev`
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Finding alvo: `P3-MF7-06-01`
- Severidade: `P3`
- Permissao de codigo: alteracoes pequenas em `real_dev/api`
- Alteracoes documentais: relatorios tecnicos de auditoria/correcao
- Commits: nao executados

### Resultado geral

Resultado geral: `CORRIGIDO`

O finding `P3-MF7-06-01` foi corrigido. O erro devolvido para extensoes de importacao invalidas passou a usar o codigo canonico documentado `INVALID_IMPORT_FILE_FORMAT`, e o teste contratual de `BK-MF7-06` foi alinhado ao mesmo contrato.

A correcao nao altera a validacao funcional de CSV/XLSX, nao muda o endpoint, nao muda Prisma, nao muda permissoes e nao mexe em guias canonicos. O fluxo invalido continua a falhar com HTTP 400 antes de qualquer escrita.

### Estado final por finding

| Finding | Severidade | Estado final | Bloqueia PASS absoluto? | Justificacao |
| --- | --- | --- | --- | --- |
| `P3-MF7-06-01` | `P3` | `CORRIGIDO` | Nao | `importFileParser.js` e `mf7-import-contracts.test.js` agora usam `INVALID_IMPORT_FILE_FORMAT`, alinhado com o guia `BK-MF7-06`. |

### Alteracoes realizadas

- `real_dev/api/src/modules/imports/importFileParser.js`: substituido `INVALID_IMPORT_FILE_TYPE` por `INVALID_IMPORT_FILE_FORMAT` em formato de ficheiro invalido.
- `real_dev/api/tests/contracts/mf7-import-contracts.test.js`: teste contratual atualizado para esperar `INVALID_IMPORT_FILE_FORMAT`.
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`: estado do finding atualizado para corrigido.
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`: esta secao de correcao foi acrescentada.

### Validacoes executadas

| Comando | Resultado | Nota |
| --- | --- | --- |
| `npm --prefix real_dev/api run test:mf7:imports` | `PASS` | 6 testes, 0 falhas; inclui formato invalido alinhado ao novo codigo canonico. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | Sintaxe JS de `src`, `tests` e `scripts` valida. |
| `rg -n "INVALID_IMPORT_FILE_TYPE|INVALID_IMPORT_FILE_FORMAT" ...` | `PASS` | Apenas `INVALID_IMPORT_FILE_FORMAT` ficou em parser/teste do BK; sem ocorrencias restantes do codigo antigo no core auditado. |
| `npm --prefix real_dev/api run test:mf7` | `PASS` | Agregador MF7 passou, incluindo importacoes, exportacoes, SAF-T, email e modulos criticos. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 53 testes, 1 suite, 0 falhas. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido com URL dummy. |
| `rg -n "INVALID_IMPORT_FILE_TYPE" real_dev/api/src real_dev/api/tests real_dev/api/evidence` | `PASS` | Sem ocorrencias do codigo antigo no core auditado apos correcao. |
| `git diff --check` | `PASS` | Sem erros de whitespace. |
| `rg -n "[[:blank:]]$" ...` | `PASS` | Sem trailing whitespace nos ficheiros tocados nesta correcao. |

### Validacoes nao executadas

- Smoke HTTP real autenticado de importacao contra app viva e BD real: nao executado porque a correcao e de nomenclatura de erro e foi validada no contrato automatizado.
- `test:integration` sem skip: nao executado nesta correcao curta; o finding nao toca persistencia/schema.

### Coerencia entre MFs

- `MF6 -> MF7`: `OK`. A correcao nao altera guards, permissao, role, empresa ativa, auditoria ou redacao de logs.
- `BK-MF7-05 -> BK-MF7-06`: `OK`. A disciplina de formatos permanece alinhada.
- `BK-MF7-06 -> BK-MF7-07`: `OK`. O handoff para SAF-T deixa de ter drift de nomenclatura no erro de formato invalido.
- `MF7 -> MF8`: `OK_COM_RISCOS_OPERACIONAIS`. Permanecem apenas smokes live/BD real fora desta correcao.

### Proxima acao recomendada

Manter `P3-MF7-06-01` como `CORRIGIDO`. Quando houver ambiente com BD real, executar smoke HTTP autenticado de importacao CSV/XLSX para evidence operacional, sem necessidade de nova alteracao de codigo para este finding.

## Execucao atual - BK-MF7-01 e BK-MF7-02 - 2026-06-29

### Metadados

- Projeto: `OPSA`
- Modo executado: `corrigir_auditoria`
- MF alvo: `MF7`
- BKs abrangidos: `BK-MF7-01`, `BK-MF7-02`
- Implementation root: `real_dev`
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- Finding alvo: `MF7-IMP-AUD-20260629-BK01-F01`
- Severidades permitidas: `P0,P1,P2,P3`
- Permissao de codigo: apenas `real_dev`
- Alteracoes de codigo realizadas: nenhuma
- Alteracoes documentais: apenas este relatorio tecnico de correcao
- Commits: nao executados

### Resultado geral

Resultado geral: `BLOQUEADO`

O finding ativo da auditoria foi confirmado, mas a causa raiz restante nao e corrigivel com uma alteracao segura em `real_dev`: os scripts de `BK-MF7-01` ja existem, os negativos passam e as suites locais passam, mas este ambiente nao tem `pg_dump` nem `pg_restore`. Sem essas ferramentas PostgreSQL nao e possivel gerar um dump real nem obter evidence `restorable: true` por `pg_restore --list`.

Nao foram feitas alteracoes de codigo porque isso mascararia um requisito operacional externo. Instalar dependencias/ferramentas PostgreSQL tambem nao foi feito porque a prompt proibe instalar dependencias sem autorizacao explicita e porque a correcao pedida deve preservar o escopo do repositorio.

### Estado por BK

| BK | Estado nesta correcao | Evidencia |
| --- | --- | --- |
| `BK-MF7-01` | `BLOQUEADO` para fecho total; codigo `JA_CORRIGIDO` | Scripts e comandos existem; negativos passam; `pg_dump`/`pg_restore` ausentes impedem prova positiva. |
| `BK-MF7-02` | `JA_CORRIGIDO` | Retencao legal, gate, auditoria sensivel e testes MF7 continuam a passar. |

### Estado final por finding

| Finding | Severidade | Estado final | Bloqueia PASS absoluto? | Justificacao |
| --- | --- | --- | --- | --- |
| `MF7-IMP-AUD-20260629-BK01-F01` | `P1` | `BLOQUEADO` | Sim | O codigo esta presente, mas a validacao positiva depende de ferramentas externas ausentes: `pg_dump` e `pg_restore`. |

### Confirmacao do finding

- Evidencia documental: a auditoria MF7 marca `BK-MF7-01` como `PARCIAL` porque falta prova positiva com `pg_dump`/`pg_restore`.
- Evidencia de codigo: `real_dev/api/scripts/run-daily-backup.mjs` chama `pg_dump`; `real_dev/api/scripts/verify-backup-restore.mjs` chama `pg_restore --list`; `real_dev/api/package.json` expoe `mf7:backup` e `mf7:backup:verify`.
- Evidencia de ambiente: `command -v pg_dump` e `command -v pg_restore` terminaram com exit code `1`.
- Caminhos comuns verificados sem ferramenta encontrada: `/opt/homebrew/bin`, `/opt/homebrew/opt/libpq/bin`, `/usr/local/bin` e `/Applications/Postgres.app/Contents/Versions/latest/bin`.

### Decisoes de correcao

- Nao foi alterado `run-daily-backup.mjs`, porque o script ja usa `spawnSync` sem shell, cria manifesto sem credenciais e falha com mensagem controlada quando `pg_dump` nao arranca.
- Nao foi alterado `verify-backup-restore.mjs`, porque o script ja valida caminho ausente, ficheiro inexistente, ficheiro vazio e chama `pg_restore --list` sem restaurar dados.
- Nao foi criada simulacao falsa de `pg_dump`/`pg_restore`, porque isso nao provaria o requisito `RNF18` de restauracao possivel.
- Nao foram instaladas ferramentas PostgreSQL, porque isso exige autorizacao explicita e altera o ambiente fora do repositorio.

### Rastreabilidade

| BK | RNF | Ficheiros confirmados | Validacoes |
| --- | --- | --- | --- |
| `BK-MF7-01` | `RNF18` | `real_dev/api/scripts/run-daily-backup.mjs`; `real_dev/api/scripts/verify-backup-restore.mjs`; `real_dev/api/package.json` | `syntax:check`; negativos `mf7:backup`; negativos `mf7:backup:verify`; comandos de deteccao de `pg_dump`/`pg_restore`. |
| `BK-MF7-02` | `RNF19` | `real_dev/api/prisma/schema.prisma`; `retentionPolicy.js`; `retentionDeletionGate.js`; `auditLogService.js`; `retentionPolicy.test.js` | `prisma:validate`; `test:mf7:retention`; `test:unit`; `test:contracts`. |

### Coerencia entre MFs

- `MF6 -> MF7`: `OK_COM_RISCOS`. Os gates MF6 continuam a passar e o contrato `recordSensitiveAudit` nao foi enfraquecido.
- `BK-MF7-01 -> BK-MF7-02`: `OK_COM_RISCOS`. `BK-MF7-02` esta implementado e validado; `BK-MF7-01` continua sem prova operacional positiva por falta das ferramentas PostgreSQL.
- `MF7 -> MF8`: `OK_COM_RISCOS`. A MF8 pode consumir os contratos, mas o fecho final deve continuar a exigir evidence real de backup/restauro.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Worktree ja tinha alteracoes documentais/MF8 fora do escopo; preservadas. |
| `command -v pg_dump` | `BLOQUEADO_AMBIENTE` | Exit code `1`; ferramenta ausente no PATH. |
| `command -v pg_restore` | `BLOQUEADO_AMBIENTE` | Exit code `1`; ferramenta ausente no PATH. |
| `ls -l` em caminhos comuns de PostgreSQL tools | `BLOQUEADO_AMBIENTE` | Sem `pg_dump`/`pg_restore` em Homebrew, libpq, `/usr/local/bin` ou Postgres.app. |
| `npm run syntax:check` em `real_dev/api` | `PASS` | Sintaxe dos ficheiros `src`, `tests` e `scripts` valida. |
| `DATABASE_URL='<URL_AUTHENTICATED_REDACTED> npm run prisma:validate` em `real_dev/api` | `PASS` | Schema Prisma valido. |
| `npm run test:mf7:retention` em `real_dev/api` | `PASS` | 9 testes passaram. |
| `npm run test:unit` em `real_dev/api` | `PASS` | 74 testes passaram. |
| `npm run test:contracts` em `real_dev/api` | `PASS` | 30 testes passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm run test:integration` em `real_dev/api` | `PASS_COM_RESSALVAS` | 2 testes saltados explicitamente por falta de `TEST_DATABASE_URL`. |
| `DATABASE_URL= npm run mf7:backup` em `real_dev/api` | `NEGATIVO_PASS` | Falhou com `DATABASE_URL em falta para executar backup`. |
| `DATABASE_URL='<URL_AUTHENTICATED_REDACTED> OPSA_BACKUP_DIR=/private/tmp/opsa-mf7-backup-validation npm run mf7:backup` | `BLOQUEADO_AMBIENTE` | Falhou com `pg_dump nao arrancou`. |
| `npm run mf7:backup:verify` em `real_dev/api` | `NEGATIVO_PASS` | Falhou com falta de `--file`/`OPSA_BACKUP_FILE`. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/inexistente.dump npm run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou com backup nao encontrado. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/vazio.dump npm run mf7:backup:verify` | `NEGATIVO_PASS` | Falhou com ficheiro vazio. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/fake.dump npm run mf7:backup:verify` | `BLOQUEADO_AMBIENTE` | Falhou com `pg_restore nao arrancou`. |
| `npm run test:mf6` em `real_dev/api` | `PASS_COM_RESSALVAS` | Gates MF6 passaram; concorrencia em `mode: local-contract`. |
| `npm run typecheck` em `real_dev/web` | `PASS` | TypeScript sem erros. |
| `npm run build` em `real_dev/web` | `PASS` | Vite build passou. |
| `rg` de risco dirigido aos ficheiros MF7 | `PASS_COM_OBSERVACOES` | Matches apenas defensivos/contextuais em auditoria/erros. |
| `rg` de drift de dominio em `real_dev/api real_dev/web` | `PASS` | Sem referencias a outros produtos/dominios. |

### Validacoes nao executadas

- Fluxo feliz real `mf7:backup` + `mf7:backup:verify`: nao executado porque `pg_dump` e `pg_restore` nao existem no ambiente.
- `test:integration` sem skip: nao executado porque nao existe `TEST_DATABASE_URL` efemera configurada.
- Instalar PostgreSQL tools: nao executado por falta de autorizacao explicita e por ser alteracao de ambiente fora do repositorio.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

Nao houve alteracoes em `real_dev`, `apps/`, RF/RNF, backlog, matriz, sprints, guias BK canonicos, `mockup/` ou commits.

### Blockers e TODOs

- `BLOCKER_AMBIENTE`: disponibilizar `pg_dump` e `pg_restore` no PATH ou fornecer caminhos operacionais equivalentes.
- `TODO_OPERACIONAL`: correr `npm run mf7:backup` contra base PostgreSQL efemera segura e depois `npm run mf7:backup:verify` sobre o dump gerado.
- `TODO_OPERACIONAL`: guardar evidence segura com manifesto `.dump.json`, `restorable: true`, `catalogEntries > 0` e negativos principais.
- `TODO_OPERACIONAL`: configurar `TEST_DATABASE_URL` efemera e correr `npm run test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`.

### Proxima acao recomendada

Autorizar/preparar a instalacao das ferramentas PostgreSQL no ambiente de validacao, ou executar a validacao num ambiente onde `pg_dump` e `pg_restore` ja estejam disponiveis. Depois reexecutar apenas a validacao operacional de `BK-MF7-01` e atualizar este relatorio de `BLOQUEADO` para `CORRIGIDO` se a evidence devolver `restorable: true`.
