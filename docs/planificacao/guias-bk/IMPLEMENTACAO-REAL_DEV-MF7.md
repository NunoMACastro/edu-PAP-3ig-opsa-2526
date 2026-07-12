> [!WARNING]
> `SNAPSHOT_HISTORICO_SUPERSEDED` — estado `SUPERSEDED` em 2026-07-10.
>
> Este relatório preserva um snapshot histórico e não representa o estado corrente.
> Fonte atual: [relatório canónico](../auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md).
> Não reutilizar contagens, comandos, paths ou decisões deste corpo como evidence atual.

# IMPLEMENTACAO-REAL_DEV-MF7

## Execucao atual - BK-MF7-09 e BK-MF7-10 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `implementar`
- Implementation root: `real_dev`
- Backend/API: `real_dev/api`
- Frontend/web: `real_dev/web`
- MF alvo: `MF7`
- BKs alvo: `BK-MF7-09`, `BK-MF7-10`
- Output mode: `relatorio_e_resumo`
- Strict scope: `true`
- Commit: nao executado

### Resultado geral

Resultado geral desta execucao: `IMPLEMENTADO`.

`BK-MF7-09` ficou implementado com um gate frontend que valida componentes partilhados, cliente API central, paginas por dominio e sessao por cookie com `credentials: "include"`. O agregador web `test:mf7` passou a correr compatibilidade browser, modularidade frontend, typecheck e build.

`BK-MF7-10` ficou implementado com uma suite `node:test` para modulos criticos de faturacao, IVA, balancetes e reconciliacao. A suite confirma marcadores reais nos services, contexto multiempresa no backend e negativos contra nomes obsoletos ou empresa ativa vinda do pedido HTTP.

### Estado por BK

| BK | RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF7-09` | `RNF26` | `IMPLEMENTADO` | `check:mf7:frontend-modules` passou; tres negativos controlados falharam com mensagens esperadas; `test:mf7` web passou com typecheck/build. |
| `BK-MF7-10` | `RNF27` | `IMPLEMENTADO` | `test:mf7:critical-modules` passou com 3 testes; `test:contracts` passou com 53 testes; tres negativos controlados falharam nos marcadores criticos esperados. |

### Findings por severidade

| Severidade | Findings desta execucao | Estado |
| --- | --- | --- |
| `P0` | 0 | Nenhum finding P0 novo nos BKs alvo. |
| `P1` | 0 | Nenhum finding P1 novo nos BKs alvo. |
| `P2` | 0 | Nenhum finding P2 novo nos BKs alvo. |
| `P3` | 0 | Nenhum finding P3 novo nos BKs alvo. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros principais | Validacoes |
| --- | --- | --- | --- |
| `BK-MF7-09` | `RNF26` | `real_dev/web/scripts/check-mf7-frontend-modules.mjs`; `real_dev/web/package.json`; `real_dev/web/evidence/mf7-frontend-modules.md`; `real_dev/web/src/App.tsx`; `real_dev/web/src/lib/apiClient.ts`; `real_dev/web/src/ui/opsaUi.tsx`; `real_dev/web/src/ui/ResponsiveDataTable.tsx`; `real_dev/web/src/ui/useActionFeedback.ts` | `node --check`; `check:mf7:frontend-modules`; negativos frontend; `test:mf7` web; scans de risco/drift. |
| `BK-MF7-10` | `RNF27` | `real_dev/api/tests/contracts/mf7-critical-modules.test.js`; `real_dev/api/package.json`; `real_dev/api/evidence/mf7-critical-modules.md`; services de vendas, IVA, reporting contabilistico e tesouraria | `node --check`; `test:mf7:critical-modules`; negativos API; `test:mf7`; `test:contracts`; `test:unit`; `prisma:validate`; `test:integration` com skip explicito. |

### Ficheiros alterados

Dentro de `real_dev/web`:

- `package.json`
- `scripts/check-mf7-frontend-modules.mjs`
- `evidence/mf7-frontend-modules.md`

Dentro de `real_dev/api`:

- `package.json`
- `tests/contracts/mf7-critical-modules.test.js`
- `evidence/mf7-critical-modules.md`

Fora de `real_dev`:

- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`

Nao foram alterados BKs, RF/RNF, matriz, backlog, sprints, prompts, `apps/` ou `mockup/`.

### Decisoes tecnicas

- Os guias continuam a mencionar `apps/api` e `apps/web`; nesta execucao foram mapeados para `real_dev/api` e `real_dev/web`, conforme `IMPLEMENTATION_ROOT=real_dev`.
- `BK-MF7-09` nao redesenha a UI nem introduz biblioteca nova. O gate mede contratos existentes: `PageFrame`, `StatusMessage`, `ResponsiveDataTable`, `useActionFeedback`, `apiClient`, dominios principais e `credentials: "include"`.
- `BK-MF7-10` nao cria endpoints novos nem reescreve services. A suite protege contratos minimos dos services reais que alimentam faturacao, IVA, balancetes e reconciliacao.
- Os negativos usam variaveis de ambiente de simulacao para nao editar temporariamente ficheiros funcionais nem deixar residuos no worktree.
- A empresa ativa continua resolvida no backend; o frontend nao decide ownership, role, permissao final ou empresa por parametro livre.

### Contratos consumidos

- `MF0`: sessao autenticada, cookie HttpOnly, empresa ativa, roles e permissoes resolvidas no backend.
- `MF1`: documentos de venda/compra, totais, IVA e periodo fiscal aberto nos services de faturacao.
- `MF2`: balancete, razao, tabelas reutilizaveis e UI operacional.
- `MF3`: mapa de IVA, tesouraria, importacao de extratos e reconciliacao.
- `MF4`: auditoria e logs de integracao para operacoes sensiveis.
- `MF5`: `PageFrame`, `StatusMessage`, `ResponsiveDataTable`, `useActionFeedback`, validacao e feedback UI.
- `MF6`: hardening, sessao por cookie, auditoria obrigatoria e disciplina de nao aceitar ownership vindo do frontend.
- `BK-MF7-08`: modularidade backend validada antes da modularidade frontend.

### Contratos entregues

- Script `check:mf7:frontend-modules`.
- Agregador web `test:mf7` com browser compatibility, frontend modules, typecheck e build.
- Evidence `real_dev/web/evidence/mf7-frontend-modules.md`.
- Teste `test:mf7:critical-modules`.
- Agregador API `test:mf7` atualizado para incluir modulos criticos.
- Evidence `real_dev/api/evidence/mf7-critical-modules.md`.
- Baseline automatizada para `BK-MF8-01` iniciar logs estruturados sobre services criticos testaveis.

### Coerencia entre MFs

- `MF6 -> MF7`: `OK`. A implementacao preserva sessao por cookie, hardening, auditoria, logs de integracao, permissoes e contexto multiempresa no backend.
- `BK-MF7-08 -> BK-MF7-09`: `OK`. O gate backend continua a passar e o frontend passa a ter gate equivalente de modularidade.
- `BK-MF7-09 -> BK-MF7-10`: `OK`. A modularidade frontend entra no agregador web e a suite critica backend fecha a macrofase com contrato automatizado.
- `MF7 -> MF8`: `OK_COM_RISCOS`. `BK-MF8-01` recebe baseline de services criticos testaveis, mas a implementacao de logs estruturados da MF8 fica fora deste scope.

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES`; worktree ja tinha alteracoes documentais/MF8 e relatorios nao versionados fora do escopo, preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS`; `real_dev/` esta ignorado por `.gitignore:4`, comportamento esperado nesta PAP. |
| `node --check real_dev/web/scripts/check-mf7-frontend-modules.mjs` | `PASS`. |
| `npm --prefix real_dev/web run check:mf7:frontend-modules` | `PASS`; output `MF7 frontend modular: OK`. |
| `OPSA_MF7_FRONTEND_SIMULATE_NO_CREDENTIALS=true npm --prefix real_dev/web run check:mf7:frontend-modules` | `PASS_NEGATIVO`; falhou com `Cliente API deve manter credentials: "include" para enviar o cookie de sessao`. |
| `OPSA_MF7_FRONTEND_SIMULATE_MISSING_APP_DOMAIN=purchases npm --prefix real_dev/web run check:mf7:frontend-modules` | `PASS_NEGATIVO`; falhou com `Pagina ou rota frontend em falta para dominio: purchases`. |
| `OPSA_MF7_FRONTEND_SIMULATE_MISSING_API_DOMAIN=purchases npm --prefix real_dev/web run check:mf7:frontend-modules` | `PASS_NEGATIVO`; falhou com `Cliente API em falta para dominio: purchases`. |
| `npm --prefix real_dev/web run test:mf7` | `PASS`; browser compatibility, frontend modules, `tsc --noEmit` e `vite build` passaram. |
| `node --check real_dev/api/tests/contracts/mf7-critical-modules.test.js` | `PASS`. |
| `npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS`; 3 testes passaram. |
| `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=faturacao:assertOpenFiscalPeriod npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS_NEGATIVO`; falhou no marcador critico de faturacao. |
| `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=balancetes:buildTrialBalance npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS_NEGATIVO`; falhou no marcador critico de balancetes. |
| `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=reconciliacao:recordIntegrationLog npm --prefix real_dev/api run test:mf7:critical-modules` | `PASS_NEGATIVO`; falhou no marcador critico de reconciliacao. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`. |
| `npm --prefix real_dev/api run test:mf7` | `PASS`; retencao, email, exportacoes, importacoes, SAF-T, modularidade backend e modulos criticos passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 53 testes passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 74 testes passaram. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema valido com URL dummy. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO`; 2 testes saltados por falta de `TEST_DATABASE_URL` efemera. |
| `rg` de risco nos ficheiros tocados de source/test/script/package | `PASS`; sem matches. |
| `rg` de drift de dominio nos ficheiros tocados de source/test/script/package | `PASS`; sem matches. |
| `git diff --check` | `PASS`. |
| `rg -n "[ \t]+$" ...` nos ficheiros tocados, incluindo ficheiros ignorados em `real_dev` | `PASS`; sem whitespace final. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES`; `overall_pass=true`, `advisory_pass=false` por checks documentais legados/preexistentes em varios BKs fora do escopo e tambem nos guias MF7. |

### Validacoes nao executadas

- Smoke HTTP real autenticado: nao executado porque os BKs alvo criam gates estaticos/contratuais e nao novos endpoints runtime.
- Testes de integracao com BD persistente real: nao executados sem `TEST_DATABASE_URL` efemera; foi usado skip explicito.
- Certificacao fiscal, SAF-T oficial externo, integracoes bancarias reais ou observabilidade MF8: fora do scope dos BKs 09/10.

### Blockers e TODOs

- Sem blockers de codigo para `BK-MF7-09` ou `BK-MF7-10`.
- `TODO_OPERACIONAL`: quando existir BD efemera de CI para OPSA, correr `npm --prefix real_dev/api run test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- `TODO_OPERACIONAL`: quando a MF8 for implementada, ligar logs estruturados sobre a baseline de services criticos validada por `test:mf7:critical-modules`.

### Proxima acao recomendada

Avancar para `BK-MF8-01`, usando `test:mf7` da API e da web como baseline antes de introduzir logs estruturados.

## Execucao atual - BK-MF7-07 e BK-MF7-08 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `implementar`
- Implementation root: `real_dev`
- Backend/API: `real_dev/api`
- Frontend/web: `real_dev/web`
- MF alvo: `MF7`
- BKs alvo: `BK-MF7-07`, `BK-MF7-08`
- Output mode: `relatorio_e_resumo`
- Strict scope: `true`
- Commit: nao executado

### Resultado geral

Resultado geral desta execucao: `IMPLEMENTADO`.

`BK-MF7-07` ficou implementado com uma checklist de readiness SAF-T antes da geracao do XML, antes da criacao de `SaftExportRun` e antes do `IntegrationLog` de sucesso. O backend bloqueia periodo invertido, perfil fiscal incompleto e periodo sem documentos ou lancamentos, mantendo o SAF-T como MVP rastreavel e sem prometer validacao legal oficial externa.

`BK-MF7-08` ficou implementado com gate estatico de modularidade backend. O script valida routes e services por dominio, confirma que `server.js` monta route builders e prova tres negativos controlados sem alterar ficheiros funcionais.

### Estado por BK

| BK | RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF7-07` | `RNF24`; base funcional `RF36` e `RF48` | `IMPLEMENTADO` | `assertSaftReadiness`, teste contratual `test:mf7:saft` com 5 testes, `SaftExportRun` e `IntegrationLog` preservados. |
| `BK-MF7-08` | `RNF25` | `IMPLEMENTADO` | `check:mf7:backend-modules` passou; tres negativos simulados falharam com mensagens esperadas. |

### Findings por severidade

| Severidade | Findings desta execucao | Estado |
| --- | --- | --- |
| `P0` | 0 | Nenhum finding P0 novo nos BKs alvo. |
| `P1` | 0 | Nenhum finding P1 novo nos BKs alvo. |
| `P2` | 0 | Nenhum finding P2 novo nos BKs alvo. |
| `P3` | 0 | Nenhum finding P3 novo nos BKs alvo. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros principais | Validacoes |
| --- | --- | --- | --- |
| `BK-MF7-07` | `RNF24`; `RF36`; `RF48` | `real_dev/api/src/modules/compliance/saftComplianceChecklist.js`; `real_dev/api/src/modules/compliance/saftService.js`; `real_dev/api/tests/contracts/mf7-saft-contracts.test.js`; `real_dev/api/evidence/mf7-saft-readiness.md`; `real_dev/api/package.json` | `syntax:check`; `test:mf7:saft`; `test:mf7`; `test:contracts`; `test:unit`; `prisma:validate` com URL dummy. |
| `BK-MF7-08` | `RNF25` | `real_dev/api/scripts/check-mf7-backend-modules.mjs`; `real_dev/api/package.json`; `real_dev/api/evidence/mf7-backend-modules.md`; `real_dev/api/src/server.js`; routes/services dos dominios principais | `check:mf7:backend-modules`; tres negativos simulados; `test:mf7`; scans estaticos; `git diff --check`. |

### Ficheiros alterados

Dentro de `real_dev/api`:

- `package.json`
- `src/modules/compliance/saftComplianceChecklist.js`
- `src/modules/compliance/saftService.js`
- `tests/contracts/mf7-saft-contracts.test.js`
- `scripts/check-mf7-backend-modules.mjs`
- `evidence/mf7-saft-readiness.md`
- `evidence/mf7-backend-modules.md`

Fora de `real_dev`:

- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`

Nao foram alterados BKs, RF/RNF, matriz, backlog, sprints, prompts, `apps/` ou `mockup/`.

### Decisoes tecnicas

- Os guias continuam a mencionar `apps/api`; nesta execucao foram mapeados para `real_dev/api`, conforme `IMPLEMENTATION_ROOT=real_dev`.
- `BK-MF7-07` nao cria novos modelos Prisma nem altera XML para cobrir toda a especificacao oficial. A entrega e uma barreira minima de readiness e rastreabilidade para o MVP PAP.
- A readiness fica no service layer porque precisa de dados ja carregados: perfil fiscal, documentos de venda, documentos de compra e lancamentos contabilisticos.
- O endpoint `GET /api/compliance/saft` continua protegido por sessao, empresa ativa, permissao `COMPLIANCE_READ` e roles `ADMIN`/`CONTABILISTA`/`AUDITOR`.
- `BK-MF7-08` nao reorganiza modulos nem altera endpoints. O gate mede a estrutura real existente: vendas, compras, inventario, tesouraria, contabilidade, reporting, mapas fiscais, demonstracoes financeiras, compliance SAF-T e IA.
- O agregador `test:mf7` passou a incluir `test:mf7:saft` e `check:mf7:backend-modules`.

### Contratos consumidos

- `MF0`: sessao autenticada, empresa ativa e roles/permissoes resolvidas no backend.
- `MF3`: exportador SAF-T MVP, `SaftExportRun`, documentos e lancamentos contabilisticos reais.
- `MF4`: `IntegrationLog` para rastreabilidade operacional de exportacoes SAF-T.
- `MF6`: hardening, auditoria e disciplina de nao expor dados sensiveis em logs.
- `BK-MF7-06`: importacoes e logs operacionais preservados como base de interoperabilidade para a readiness fiscal.

### Contratos entregues

- `assertSaftReadiness`, `assertSaftPeriod`, `assertSaftProfile`, `assertSaftHasRows` e `countSaftRows`.
- Erros funcionais `INVALID_SAFT_RANGE`, `COMPANY_PROFILE_INCOMPLETE`, `EMPTY_SAFT_PERIOD` e `INVALID_SAFT_COUNTER`.
- Resposta SAF-T com bloco `readiness.checkedAt` e `readiness.totalRows`.
- Script `test:mf7:saft`.
- Script `check:mf7:backend-modules`.
- Evidence `real_dev/api/evidence/mf7-saft-readiness.md` e `real_dev/api/evidence/mf7-backend-modules.md`.

### Coerencia entre MFs

- `MF6 -> MF7`: `OK`. A implementacao preserva guards, permissoes, contexto multiempresa, logs de integracao e nao move decisoes de ownership para o frontend.
- `BK-MF7-06 -> BK-MF7-07`: `OK`. A readiness SAF-T consome dados/logs existentes e acrescenta barreira fiscal minima sem duplicar o fluxo de importacoes.
- `BK-MF7-07 -> BK-MF7-08`: `OK`. O modulo de compliance continua montado por route builder e validado pelo gate de modularidade.
- `BK-MF7-08 -> BK-MF7-09`: `OK`. O backend fica com gate repetivel de dominios antes da modularidade frontend.
- `MF7 -> MF8`: `OK_COM_RISCOS`. Os BKs alvo nao criam blocker novo; continuam ressalvas operacionais herdadas para backup/restauro positivo, browsers reais, DB persistente e validacao fiscal externa.

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES`; worktree ja tinha alteracoes documentais/MF8 e relatorios nao versionados fora do escopo, preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS`; `real_dev/` esta ignorado por `.gitignore:4`, comportamento esperado nesta PAP. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`. |
| `npm --prefix real_dev/api run test:mf7:saft` | `PASS`; 5 testes passaram. |
| `npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS`; output `MF7 backend modular: OK`. |
| `OPSA_MF7_SIMULATE_MISSING=src/modules/ai/aiRoutes.js npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS_NEGATIVO`; falhou com `Ficheiro obrigatorio em falta: src/modules/ai/aiRoutes.js`. |
| `OPSA_MF7_SIMULATE_FORBIDDEN_SERVER_IMPORT=sales/saleDocumentService.js npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS_NEGATIVO`; falhou com `server.js importa ficheiros internos de dominio: from "./modules/sales/saleDocumentService.js"`. |
| `OPSA_MF7_SIMULATE_MISSING=src/modules/inventory/stockMovementService.js npm --prefix real_dev/api run check:mf7:backend-modules` | `PASS_NEGATIVO`; falhou com `Ficheiro obrigatorio em falta: src/modules/inventory/stockMovementService.js`. |
| `npm --prefix real_dev/api run test:mf7` | `PASS`; retencao, email, exportacoes, importacoes, SAF-T e modularidade passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 50 testes passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 74 testes passaram. |
| `npm --prefix real_dev/api run prisma:validate` | `FALHA_AMBIENTE`; `DATABASE_URL` ausente. |
| `DATABASE_URL='<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema valido sem tocar em BD real. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_SKIP_EXPLICITO`; 2 testes saltados por falta de `TEST_DATABASE_URL` efemera. |
| `rg` de risco nos ficheiros tocados de source/test/script | `PASS`; sem matches. |
| `rg` de drift de dominio nos ficheiros tocados/evidence | `PASS`; sem matches. |
| `git diff --check` | `PASS`. |

### Validacoes nao executadas

- Smoke HTTP real de `GET /api/compliance/saft`: nao executado por falta de servidor/BD real com dados fiscais semeados nesta ronda.
- Validacao legal oficial externa SAF-T: fora de scope do BK e explicitamente nao prometida.
- `test:integration` com persistencia real: nao executado sem `TEST_DATABASE_URL` efemera; foi usado skip explicito.
- Web `typecheck`/`build`: nao executado nesta ronda porque nao houve alteracoes em `real_dev/web` nem frontend no scope dos BKs 07/08.

### Blockers e TODOs

- Sem blockers de codigo para `BK-MF7-07` ou `BK-MF7-08`.
- `TODO_OPERACIONAL`: correr smoke HTTP SAF-T numa BD real com empresa, perfil fiscal e documentos/lancamentos de teste.
- `TODO_OPERACIONAL`: quando existir validador externo ou especificacao fiscal completa decidida pela equipa, tratar isso fora deste BK; a entrega atual e MVP rastreavel.
- `TODO_OPERACIONAL_HERDADO`: continuam fora deste escopo as provas operacionais pendentes de backup/restauro positivo, browsers reais e DB persistente ja registadas nas secoes anteriores.

### Proxima acao recomendada

Avancar para `BK-MF7-09`, usando `check:mf7:backend-modules` como gate de estabilidade backend antes da modularidade frontend.

## Execucao atual - BK-MF7-05 e BK-MF7-06 - 2026-06-30

### Metadados

- Projeto: `OPSA`
- Modo executado: `implementar`
- Implementation root: `real_dev`
- Backend/API: `real_dev/api`
- Frontend/web: `real_dev/web`
- MF alvo: `MF7`
- BKs alvo: `BK-MF7-05`, `BK-MF7-06`
- Output mode: `relatorio_e_resumo`
- Strict scope: `true`
- Commit: nao executado

### Resultado geral

Resultado geral desta execucao: `IMPLEMENTADO`.

`BK-MF7-05` ficou implementado com endpoints de exportacao por formato para balancete e razao, mantendo os endpoints legados de `BK-MF2-07`. Os ficheiros `csv`, `xlsx` e `pdf` sao gerados a partir dos services contabilisticos existentes, com headers HTTP de download, validacao de formato e neutralizacao de celulas perigosas em CSV/XLSX.

`BK-MF7-06` ficou implementado com parser comum CSV/XLSX, limite operacional de `5000` linhas, suporte persistente a `BankStatementFormat.XLSX`, validacao por linha, `BusinessImportRun`, `AuditLog` e `IntegrationLog` com contagens. O backend continua a ignorar `companyId` enviado no payload para ownership; a empresa vem de `context.companyId`, derivado da sessao autenticada.

### Estado por BK

| BK | RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF7-05` | `RNF22` | `IMPLEMENTADO` | Endpoints `/trial-balance/export` e `/ledger/export`; service comum de exportacao; frontend gera URLs por `csv`/`xlsx`/`pdf`; `test:mf7:exports` passou com 4 testes. |
| `BK-MF7-06` | `RNF23` | `IMPLEMENTADO` | Parser CSV/XLSX, enum/migration `XLSX`, validacao e logs; `test:mf7:imports` passou com 6 testes. |

### Findings por severidade

| Severidade | Findings desta execucao | Estado |
| --- | --- | --- |
| `P0` | 0 | Nenhum finding P0 novo nos BKs alvo. |
| `P1` | 0 | Nenhum finding P1 novo nos BKs alvo. |
| `P2` | 0 | Nenhum finding P2 novo nos BKs alvo. |
| `P3` | 0 | Nenhum finding P3 novo nos BKs alvo. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros principais | Validacoes |
| --- | --- | --- | --- |
| `BK-MF7-05` | `RNF22`; base funcional `RF29` / `BK-MF2-07` | `real_dev/api/src/modules/exports/exportFormatService.js`; `real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js`; `real_dev/api/src/modules/accounting-reports/accountingReportExporters.js`; `real_dev/web/src/lib/apiClient.ts`; `real_dev/web/src/pages/mf2Pages.tsx`; `real_dev/api/tests/contracts/mf7-export-contracts.test.js`; `real_dev/api/evidence/mf7-export-formats.md` | `syntax:check`; `test:mf7:exports`; `test:contracts`; `test:unit`; `test:mf7` web. |
| `BK-MF7-06` | `RNF23`; base funcional `RF33`/`RF35`; auditoria `RNF17` | `real_dev/api/src/modules/imports/importFileParser.js`; `businessImportValidators.js`; `businessImportService.js`; `statementImportValidators.js`; `real_dev/api/prisma/schema.prisma`; `real_dev/api/prisma/migrations/20260630120000_mf7_import_xlsx_format/migration.sql`; `real_dev/api/tests/contracts/mf7-import-contracts.test.js`; `real_dev/api/evidence/mf7-imports.md` | `syntax:check`; `test:mf7:imports`; `test:contracts`; `test:unit`; `prisma:validate`. |

### Ficheiros alterados

Dentro de `real_dev/api`:

- `package.json`
- `prisma/schema.prisma`
- `prisma/migrations/20260630120000_mf7_import_xlsx_format/migration.sql`
- `src/modules/accounting-reports/accountingReportExporters.js`
- `src/modules/accounting-reports/accountingReportRoutes.js`
- `src/modules/exports/exportFormatService.js`
- `src/modules/imports/businessImportService.js`
- `src/modules/imports/businessImportValidators.js`
- `src/modules/imports/importFileParser.js`
- `src/modules/treasury/statementImportValidators.js`
- `tests/contracts/mf7-export-contracts.test.js`
- `tests/contracts/mf7-import-contracts.test.js`
- `evidence/mf7-export-formats.md`
- `evidence/mf7-imports.md`

Dentro de `real_dev/web`:

- `src/lib/apiClient.ts`
- `src/pages/mf2Pages.tsx`

Fora de `real_dev`:

- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`

Nao foram alterados BKs, RF/RNF, matriz, backlog, sprints, prompts, `apps/` ou `mockup/`.

### Decisoes tecnicas

- Os guias usam `apps/api` e `apps/web`; nesta execucao foram mapeados para `real_dev/api` e `real_dev/web`, conforme `IMPLEMENTATION_ROOT=real_dev`.
- `BK-MF7-05` nao recalcula relatórios: consome `buildTrialBalance` e `buildLedger` e apenas transforma linhas ja autorizadas em ficheiros.
- Os endpoints antigos `/trial-balance.xlsx` e `/ledger.pdf` foram preservados para compatibilidade com `BK-MF2-07`.
- A neutralizacao de formulas foi aplicada ao service novo e tambem ao XLSX legado de balancete.
- `BK-MF7-06` recebe `.xlsx` como `contentBase64` em JSON para evitar nova dependencia/middleware de upload nesta macrofase.
- `BankStatementFormat.XLSX` foi persistido com migration propria para nao gravar importacoes Excel como `CSV`.
- Logs de integracao guardam nome curto, estado e contagens; nao guardam conteudo completo do ficheiro.

### Contratos consumidos

- `MF0`: sessao autenticada, empresa ativa e roles/permissoes resolvidas no backend.
- `MF2`: `buildTrialBalance`, `buildLedger`, balancete/razao e permissao `ACCOUNTING_READ`.
- `MF3`: importacoes de negocio, importacao de extratos, `BusinessImportRun`, `BankStatementImport`, validators de clientes/fornecedores/artigos/extratos.
- `MF4`: `IntegrationLog` como evidencia operacional.
- `MF6`: auditoria obrigatoria em operacoes sensiveis, hardening e disciplina de nao expor dados sensiveis em logs.
- `BK-MF7-04`: cadeia MF7 anterior preservada, incluindo agregador `test:mf7`.

### Contratos entregues

- `ExportFormat`, `normalizeExportFormat`, `neutralizeSpreadsheetCell` e `buildTabularExport`.
- `GET /api/accounting/reports/trial-balance/export?from&to&format=csv|xlsx|pdf`.
- `GET /api/accounting/reports/ledger/export?accountId&from&to&format=csv|xlsx|pdf`.
- Cliente frontend tipado com `AccountingExportFormat`.
- Parser `parseImportFileRows` para `.csv` e `.xlsx`.
- Limite `MAX_IMPORT_ROWS = 5000`.
- `BankStatementFormat.XLSX` em schema e migration.
- Scripts `test:mf7:exports`, `test:mf7:imports` e agregador `test:mf7` atualizado.
- Evidence `real_dev/api/evidence/mf7-export-formats.md` e `real_dev/api/evidence/mf7-imports.md`.

### Coerencia entre MFs

- `MF6 -> MF7`: `OK`. A implementacao preserva auditoria, logs de integracao, permissoes e contexto multiempresa no backend.
- `BK-MF7-04 -> BK-MF7-05`: `OK`. O agregador MF7 continua a passar e os novos endpoints nao dependem de provider externo de email.
- `BK-MF7-05 -> BK-MF7-06`: `OK`. A disciplina de formatos e evidence foi reutilizada no parser/importacoes.
- `BK-MF7-06 -> BK-MF7-07`: `OK_COM_RISCOS`. `BK-MF7-07` pode consumir logs e historico de importacoes; SAF-T completo continua fora do escopo desta execucao.
- `MF7 -> MF8`: `OK_COM_RISCOS`. Os BKs alvo nao criam blocker novo; continuam apenas ressalvas herdadas ja documentadas para backup/restauro positivo e smoke manual cross-browser.

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES`; worktree ja tinha alteracoes documentais/MF8 fora do escopo, preservadas. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS`; `real_dev/` esta ignorado por `.gitignore:4`, comportamento esperado nesta PAP. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`. |
| `npm --prefix real_dev/api run test:mf7:exports` | `PASS`; 4 testes passaram. |
| `npm --prefix real_dev/api run test:mf7:imports` | `PASS`; 6 testes passaram. |
| `npm --prefix real_dev/api run test:mf7` | `PASS`; retencao, email, exportacoes e importacoes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 45 testes passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 74 testes passaram. |
| `npm --prefix real_dev/api run prisma:validate` | `FALHA_AMBIENTE`; `DATABASE_URL` ausente. |
| `DATABASE_URL='<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema valido sem tocar em BD real. |
| `npm --prefix real_dev/web run typecheck` | `PASS`. |
| `npm --prefix real_dev/web run build` | `PASS`. |
| `npm --prefix real_dev/web run test:mf7` | `PASS`; browser compatibility gate, typecheck e build passaram. |
| `rg` de risco nos ficheiros tocados | `PASS`; sem matches. |
| `rg` de drift de dominio nos ficheiros tocados | `PASS`; sem matches. |
| `git diff --check` | `PASS`. |

### Validacoes nao executadas

- `test:integration` sem skip: nao executado nesta ronda porque nao existe `TEST_DATABASE_URL` efemera configurada e os BKs alvo foram cobertos por contratos/unitarios sem abrir servidor persistente.
- Smoke HTTP real de download/upload com browser: nao executado; os testes usaram routers/services isolados e o `test:mf7` web validou typecheck/build.
- Migration aplicada numa BD real: nao executada; foi criada migration SQL e validado o schema Prisma com `DATABASE_URL` dummy.

### Blockers e TODOs

- Sem blockers novos para `BK-MF7-05` ou `BK-MF7-06`.
- `TODO_OPERACIONAL`: aplicar a migration `20260630120000_mf7_import_xlsx_format` no ambiente de BD real quando a equipa correr migrations.
- `TODO_OPERACIONAL_HERDADO`: continuam fora deste escopo as provas operacionais pendentes de `BK-MF7-01` e `BK-MF7-03` registadas nas secoes anteriores.

### Proxima acao recomendada

Avancar para `BK-MF7-07` mantendo explicito que SAF-T completo nao foi implementado por estes BKs. Antes de fecho global de MF7, aplicar a migration numa BD real e repetir uma validacao HTTP/manual de exportacao e importacao com dados reais de teste.

## Execucao complementar - BK-MF7-03 e BK-MF7-04 - 2026-06-29

### Metadados

- Projeto: `OPSA`
- Modo executado: `implementar`
- Implementation root: `real_dev`
- Backend/API: `real_dev/api`
- Frontend/web: `real_dev/web`
- MF alvo: `MF7`
- BKs alvo: `BK-MF7-03`, `BK-MF7-04`
- Output mode: `relatorio_e_resumo`
- Commit: nao executado

### Resultado geral

Resultado geral desta execucao: `PARCIAL`.

`BK-MF7-04` ficou `IMPLEMENTADO`: existe adapter transaccional comum, a recuperacao de password preserva `sendPasswordReset`, alertas/lembretes podem usar o mesmo adapter, os logs guardam apenas metadados seguros e os testes de contrato passaram com 5/5 testes.

`BK-MF7-03` ficou implementado no codigo com gate automatico, scripts npm e evidence, mas mantem estado `PARCIAL` porque o smoke manual em Chrome, Edge e Firefox nao foi executado nesta ronda. A validacao automatica (`test:mf7`, typecheck e build) passou.

### Estado por BK

| BK | RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF7-03` | `RNF20` | `PARCIAL` | Gate `test:mf7:browser-compatibility`, `test:mf7`, typecheck e build passaram; smoke manual nos tres browsers alvo ficou pendente. |
| `BK-MF7-04` | `RNF21` | `IMPLEMENTADO` | Adapter transaccional, adapter de recuperacao, helper de email para notificacoes, testes de contrato e evidence implementados e validados. |

### Findings por severidade

| Severidade | Findings desta execucao | Estado |
| --- | --- | --- |
| `P0` | 0 | Nao foram encontrados findings P0 novos nos BKs alvo. |
| `P1` | 0 | Nao foram encontrados findings P1 novos nos BKs alvo. |
| `P2` | 0 | Nao foram encontrados findings P2 novos nos BKs alvo. |
| `P3` | 0 | Nao foram encontrados findings P3 novos nos BKs alvo. |

Limitacao de validacao: o smoke manual cross-browser de `BK-MF7-03` ficou por executar e deve ser tratado como `TODO_OPERACIONAL`, nao como falha de codigo confirmada.

### Rastreabilidade

| BK | RF/RNF | Ficheiros principais | Validacoes |
| --- | --- | --- | --- |
| `BK-MF7-03` | `RNF20` | `real_dev/web/scripts/check-mf7-browser-compatibility.mjs`; `real_dev/web/package.json`; `real_dev/web/evidence/mf7-browser-compatibility.md`; superficies revistas em `real_dev/web/src/App.tsx`, `styles.css`, `opsaUi.tsx`, `ResponsiveDataTable.tsx`, `apiClient.ts` | `npm --prefix real_dev/web run test:mf7:browser-compatibility`; `npm --prefix real_dev/web run test:mf7`. |
| `BK-MF7-04` | `RNF21`; `RF05`; `RF46` | `real_dev/api/src/modules/notifications/transactionalEmailAdapter.js`; `real_dev/api/src/modules/auth/passwordResetEmailAdapter.js`; `real_dev/api/src/modules/notifications/notificationService.js`; `real_dev/api/tests/contracts/mf7-email-contracts.test.js`; `real_dev/api/package.json`; `real_dev/api/evidence/mf7-email-integration.md` | `npm --prefix real_dev/api run test:mf7:email`; `npm --prefix real_dev/api run test:mf7`; `syntax:check`; `test:contracts`; `test:unit`. |

### Ficheiros alterados

Dentro de `real_dev/web`:

- `package.json`
- `scripts/check-mf7-browser-compatibility.mjs`
- `evidence/mf7-browser-compatibility.md`

Dentro de `real_dev/api`:

- `package.json`
- `src/modules/notifications/transactionalEmailAdapter.js`
- `src/modules/auth/passwordResetEmailAdapter.js`
- `src/modules/notifications/notificationService.js`
- `tests/contracts/mf7-email-contracts.test.js`
- `evidence/mf7-email-integration.md`

Fora de `real_dev`:

- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`

Nao foram alterados BKs, RF/RNF, matriz, backlog, sprints, prompts, `apps/` ou `mockup/`.

### Decisoes tecnicas

- Os guias indicam `apps/api` e `apps/web`, mas a prompt desta execucao fixa `IMPLEMENTATION_ROOT=real_dev`; os caminhos foram mapeados para `real_dev/api` e `real_dev/web`.
- `BK-MF7-03` ficou como gate estatico sem dependencias E2E novas, coerente com o guia: bloqueia ramos por browser e preserva contratos de sessao, foco e responsividade herdados de MF5/MF6.
- `BK-MF7-04` nao escolhe provider comercial de email. O provider fica atras de `buildTransactionalEmailAdapter`, com fallback `QUEUED_FOR_PROVIDER`.
- `sendPasswordReset` foi preservado como contrato publico do fluxo MF0; a URL privada de recuperacao entra apenas no corpo enviado ao destinatario e nao nos logs.
- `sendNotificationEmails` recebe notificacoes ja autorizadas pelo backend e devolve apenas estado/motivo, sem devolver conteudo sensivel.

### Contratos consumidos

- `MF0`: autenticacao, recuperacao de password e cookie de sessao enviado por `credentials: "include"`.
- `MF4`: notificacoes, lembretes e alertas inteligentes como origem dos envios transaccionais.
- `MF5`: componentes comuns, foco visivel, tabela responsiva, feedback visual e typecheck/build do frontend.
- `MF6`: hardening, cookies seguros, environment gate e auditoria sensivel preservados.
- `BK-MF7-01`/`BK-MF7-02`: mantidos sem alteracoes; continua a ressalva operacional de backup/restauro por falta de `pg_dump`/`pg_restore`.

### Contratos entregues

- `test:mf7:browser-compatibility` e `test:mf7` no frontend.
- Evidence `real_dev/web/evidence/mf7-browser-compatibility.md`.
- `TransactionalEmailReason`, `validateTransactionalEmailMessage`, `getEmailDomain` e `buildTransactionalEmailAdapter`.
- Adapter de recuperacao baseado no contrato transaccional comum, mantendo `sendPasswordReset`.
- `sendNotificationEmails` para alertas/lembretes ja autorizados pelo backend.
- `test:mf7:email` e agregador `test:mf7` no backend.
- Evidence `real_dev/api/evidence/mf7-email-integration.md`.

### Coerencia entre MFs

- `MF6 -> MF7`: `OK`. Os gates MF6 continuam a passar; `credentials: "include"`, cookies e hardening nao foram enfraquecidos.
- `BK-MF7-02 -> BK-MF7-03`: `OK_COM_RISCOS`. O contrato anterior de retencao nao foi tocado; permanece o blocker operacional ja registado para prova positiva de backup/restauro.
- `BK-MF7-03 -> BK-MF7-04`: `OK_COM_RISCOS`. O frontend tem gate automatico e build valido para suportar os fluxos de recuperacao; falta apenas smoke manual real nos browsers alvo.
- `BK-MF7-04 -> BK-MF7-05`: `OK`. O padrao de scripts, evidence e negativos reproduziveis fica disponivel para exportacoes.
- `MF7 -> MF8`: `OK_COM_RISCOS`. MF8 pode consumir gates/evidence/logs, mantendo pendentes o smoke browser manual e a prova operacional de backup/restauro.

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES`; worktree ja tinha alteracoes documentais/MF8 fora do escopo, preservadas. |
| `git check-ignore -v real_dev ...` | `PASS`; `real_dev/` esta ignorado por `.gitignore:4`, comportamento esperado nesta PAP. |
| `npm --prefix real_dev/web run test:mf7:browser-compatibility` | `PASS`; `MF7 browser compatibility gate OK`. |
| `npm --prefix real_dev/web run test:mf7` | `PASS`; gate, `tsc --noEmit` e Vite build passaram. |
| `npm --prefix real_dev/api run test:mf7:email` | `PASS`; 5 testes passaram. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`. |
| `npm --prefix real_dev/api run test:mf7` | `PASS`; 9 testes de retencao + 5 testes de email passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 35 testes passaram. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 74 testes passaram. |
| `DATABASE_URL='<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes saltados explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/api run test:mf6` | `PASS`; todos os gates MF6 passaram. |
| `rg` de risco nos sources/scripts/evidence `real_dev` | `PASS_COM_OBSERVACOES`; matches apenas defensivos/contextuais em testes, filtros de segredo e storage privado. |
| `rg` de drift de dominio nos sources/scripts/evidence `real_dev` | `PASS`; sem matches. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES`; `overall_pass=true`, `advisory_pass=false` por divida documental ampla preexistente. |
| `git diff --check` | `PASS`. |

### Validacoes nao executadas

- Smoke manual em Chrome, Edge e Firefox: nao executado porque esta sessao automatizada nao abriu browsers reais nem registou versoes/observacoes por browser.
- `test:integration` sem skip: nao executado porque nao existe `TEST_DATABASE_URL` efemera configurada.
- Provider comercial de email real: nao executado porque `RNF21` nao canoniza provider e a prompt proibe criar dependencias/configuracoes externas sem necessidade documental.
- Fluxo feliz real de `mf7:backup` e `mf7:backup:verify`: permanece nao executado por falta de `pg_dump`/`pg_restore`, conforme secao anterior deste relatorio.

### Blockers e TODOs

- `TODO_OPERACIONAL`: executar smoke manual em Chrome, Edge e Firefox, preencher versoes e resultado observado em `real_dev/web/evidence/mf7-browser-compatibility.md`.
- `TODO_OPERACIONAL`: configurar `TEST_DATABASE_URL` efemera e correr `npm --prefix real_dev/api run test:integration` sem skip.
- `TODO_OPERACIONAL`: quando houver provider de email decidido, liga-lo ao adapter transaccional sem alterar services de dominio.
- `BLOCKER_AMBIENTE_HERDADO`: `BK-MF7-01` continua a precisar de `pg_dump`/`pg_restore` para prova positiva de backup/restauro.

### Proxima acao recomendada

Executar o smoke manual de `BK-MF7-03` nos tres browsers alvo e preencher a evidence. Depois, se o ambiente ja tiver PostgreSQL tools, fechar a prova operacional pendente de `BK-MF7-01`; caso contrario, avancar para `BK-MF7-05` com a ressalva operacional explicita.

## Metadados

- Projeto: `OPSA`
- Modo executado: `implementar`
- Data: `2026-06-29`
- Implementation root: `real_dev`
- Backend/API: `real_dev/api`
- Frontend/web: `real_dev/web`
- MF alvo: `MF7`
- BKs alvo: `BK-MF7-01`, `BK-MF7-02`
- Output mode: `relatorio_e_resumo`
- Commit: nao executado

## Resultado geral

Resultado geral: `PARCIAL`.

O codigo dos dois BKs alvo foi implementado em `real_dev/api`, mas `BK-MF7-01` ainda nao pode ser marcado como totalmente provado porque este ambiente nao tem `pg_dump` nem `pg_restore`. Os scripts, comandos e negativos ficaram funcionais; falta executar o fluxo feliz contra uma base PostgreSQL local/efemera com as ferramentas PostgreSQL instaladas.

`BK-MF7-02` ficou implementado com schema Prisma, migration, politica de retencao, gate de remocao, auditoria sensivel e suite unitaria dedicada. A integracao em services destrutivos ficou preparada por funcoes de dominio; nao foram criados endpoints novos porque o codigo real atual nao expoe `DELETE` para `SaleDocument`, `PurchaseDocument`, `JournalEntry`, `VatMapRun`, `SaftExportRun` ou `AuditLog`.

## Estado por BK

| BK | RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF7-01` | `RNF18` | `PARCIAL` | Scripts `mf7:backup` e `mf7:backup:verify` criados; negativos passaram; fluxo feliz bloqueado por ausencia de `pg_dump`/`pg_restore`. |
| `BK-MF7-02` | `RNF19` | `IMPLEMENTADO` | `RetentionHold`, gate, auditoria `retention.delete.allowed` e `test:mf7:retention` passaram. |

## Findings por severidade

| Finding | Severidade | Estado final | Nota |
| --- | --- | --- | --- |
| Ausencia de scripts de backup/restauro para `RNF18` | `P1` | `CORRIGIDO_SEM_VALIDACAO_TOTAL` | Artefactos e negativos implementados; falta prova real com PostgreSQL tools. |
| Ausencia de retencao legal contabilistica para `RNF19` | `P0` | `CORRIGIDO` | Politica, schema, migration, gate e testes unitarios implementados. |

Nao foram encontrados findings novos `P2` ou `P3` dentro do escopo desta execucao.

## Rastreabilidade

| BK | RF/RNF | Ficheiros principais | Validacoes |
| --- | --- | --- | --- |
| `BK-MF7-01` | `RNF18` | `real_dev/api/scripts/run-daily-backup.mjs`; `real_dev/api/scripts/verify-backup-restore.mjs`; `real_dev/api/package.json` | `syntax:check`; negativos de `mf7:backup`; negativos de `mf7:backup:verify`. |
| `BK-MF7-02` | `RNF19`; `RF47`; `RNF17` | `real_dev/api/prisma/schema.prisma`; `real_dev/api/prisma/migrations/20260629120000_mf7_retention_holds/migration.sql`; `retentionPolicy.js`; `retentionDeletionGate.js`; `auditLogService.js`; `httpErrors.js`; `retentionPolicy.test.js`; `package.json` | `prisma:validate`; `test:mf7:retention`; `test:unit`; `test:contracts`; `test:mf6`. |

## Ficheiros alterados

Dentro de `real_dev/api`:

- `package.json`
- `prisma/schema.prisma`
- `prisma/migrations/20260629120000_mf7_retention_holds/migration.sql`
- `scripts/run-daily-backup.mjs`
- `scripts/verify-backup-restore.mjs`
- `src/lib/httpErrors.js`
- `src/modules/audit/auditLogService.js`
- `src/modules/compliance/retentionPolicy.js`
- `src/modules/compliance/retentionDeletionGate.js`
- `tests/unit/retentionPolicy.test.js`

Fora de `real_dev`:

- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`

Nao foram alterados BKs, RF/RNF, matriz, backlog, sprints, prompts, `apps/` ou `mockup/`.

## Decisoes tecnicas

- Os guias indicam caminhos `apps/api`, mas a prompt desta execucao fixa `IMPLEMENTATION_ROOT=real_dev`; todos os caminhos foram mapeados para `real_dev/api`.
- `RetentionHold.id` usa `uuid()` para manter coerencia com os modelos Prisma existentes da OPSA. O guia sugeria `cuid()`, mas a adaptacao nao muda o contrato funcional.
- `BK-MF7-02` nao criou endpoints novos, porque o guia tambem define que a arquitetura e interna e que endpoints destrutivos existentes devem chamar o gate.
- `toHttpError` passou a reconhecer especificamente `RETENTION_HOLD_ACTIVE`, para que uma integracao futura devolva `409` em vez de cair em erro generico.

## Contratos consumidos

- `MF0`: autenticacao, sessao e empresa ativa resolvidas no backend.
- `MF1..MF3`: entidades contabilisticas reais (`SaleDocument`, `PurchaseDocument`, `JournalEntry`, `VatMapRun`, `SaftExportRun`).
- `MF4`: `AuditLog` como trilho auditavel.
- `MF6`: `recordSensitiveAudit`, hardening de ambiente, cookies, HTTPS, bcrypt e gates de seguranca.

## Contratos entregues

- `mf7:backup`: cria dump PostgreSQL em formato custom e manifesto sem credenciais.
- `mf7:backup:verify`: valida dump com `pg_restore --list` sem restaurar dados.
- `RetentionHold`: modelo multiempresa com unicidade por `companyId`, `entity`, `entityId`.
- `retention.delete.allowed`: acao sensivel declarada para auditoria.
- `assertRetainedRecordDeletionAllowed`: politica de bloqueio `409 RETENTION_HOLD_ACTIVE`.
- `assertSaleDocumentDeletionAllowed`, `assertPurchaseDocumentDeletionAllowed`, `assertJournalEntryDeletionAllowed`, `assertVatMapRunDeletionAllowed`, `assertSaftExportRunDeletionAllowed`, `assertAuditLogDeletionAllowed`: funcoes de dominio para integracao em services destrutivos.

## Coerencia entre MFs

- `MF6 -> MF7`: preservada. `recordSensitiveAudit` continua a passar nos gates MF6 e foi estendido com a acao de retencao sem remover acoes existentes.
- `BK-MF7-01 -> BK-MF7-02`: parcialmente preservada. A infraestrutura de backup existe, mas o fluxo feliz ainda depende de ferramentas PostgreSQL ausentes neste ambiente.
- `MF7 -> MF8`: `OK_COM_RISCOS`. Logs estruturados, health-check e fecho final podem consumir os novos contratos, mas a prova operacional real de backup/restauro ainda deve ser executada antes de fecho final.

## Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `git status --short` | Worktree ja tinha alteracoes documentais fora do escopo; preservadas. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`. |
| `DATABASE_URL='<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`. |
| `npm --prefix real_dev/api run test:mf7:retention` | `PASS`, 9 testes. |
| `npm --prefix real_dev/api run test:unit` | `PASS`, 74 testes. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`, 30 testes. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS` com 2 testes explicitamente saltados por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/api run test:mf6` | `PASS`. |
| `DATABASE_URL= npm --prefix real_dev/api run mf7:backup` | Falhou como negativo esperado: `DATABASE_URL em falta para executar backup`. |
| `DATABASE_URL='<URL_AUTHENTICATED_REDACTED> OPSA_BACKUP_DIR=/private/tmp/opsa-mf7-backup-validation npm --prefix real_dev/api run mf7:backup` | Bloqueio operacional esperado: `pg_dump nao arrancou`. |
| `npm --prefix real_dev/api run mf7:backup:verify` | Falhou como negativo esperado: falta `--file`/`OPSA_BACKUP_FILE`. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/inexistente.dump npm --prefix real_dev/api run mf7:backup:verify` | Falhou como negativo esperado: backup nao encontrado. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/vazio.dump npm --prefix real_dev/api run mf7:backup:verify` | Falhou como negativo esperado: ficheiro vazio. |
| `OPSA_BACKUP_FILE=/private/tmp/opsa-mf7-backup-validation/fake.dump npm --prefix real_dev/api run mf7:backup:verify` | Bloqueio operacional esperado: `pg_restore nao arrancou`. |
| `bash scripts/validate-planificacao.sh` | `overall_pass=true`; `advisory_pass=false` com advisories documentais preexistentes. |
| `git diff --check` | `PASS`. |

Pesquisa estatica nos ficheiros alterados:

- Sem `localStorage`, `sessionStorage`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `as any` ou `payload: unknown`.
- Ocorrencias de `DATABASE_URL` existem apenas nos scripts de backup e no datasource Prisma.
- Ocorrencias de `secret` pertencem aos filtros ja existentes de auditoria.
- Nao foram encontradas referencias de drift a outros dominios PAP nos ficheiros novos.

## Validacoes nao executadas

- Fluxo feliz real de `mf7:backup` e `mf7:backup:verify`: nao executado porque `pg_dump` e `pg_restore` nao estao instalados neste ambiente.
- Testes persistidos reais de integracao: nao executados porque nao existe `TEST_DATABASE_URL` configurada; foi usado skip explicito.
- `real_dev/web` `typecheck`/`build`: nao executados porque `BK-MF7-01` e `BK-MF7-02` nao alteram frontend nem cliente HTTP.
- Prova manual HTTP de `DELETE` com retencao ativa: nao executada porque nao existem endpoints destrutivos reais para as entidades protegidas neste escopo.

## Blockers e TODOs

- `TODO`: instalar ferramentas PostgreSQL (`pg_dump` e `pg_restore`) no ambiente de validacao e executar o fluxo feliz de backup/restauro.
- `TODO`: quando existir `TEST_DATABASE_URL` efemera, correr `npm --prefix real_dev/api run test:integration` sem skip.
- `TODO`: quando forem criados endpoints destrutivos para documentos/lancamentos/mapas/exportacoes/logs, chamar a funcao de dominio correspondente antes da remocao efetiva.

## Proxima acao recomendada

Executar `BK-MF7-01` num ambiente com PostgreSQL tools instaladas e uma base efemera segura, recolhendo manifesto `.dump.json` e output `restorable: true` de `pg_restore --list`. Depois, iniciar `BK-MF7-03` mantendo o gate de compatibilidade limitado ao frontend.
