> [!WARNING]
> `SNAPSHOT_HISTORICO_SUPERSEDED` — estado `SUPERSEDED` em 2026-07-10.
>
> Este relatório preserva um snapshot histórico e não representa o estado corrente.
> Fonte atual: [relatório canónico](../auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md).
> Não reutilizar contagens, comandos, paths ou decisões deste corpo como evidence atual.

# Auditoria de implementacao real_dev - MF6

## Execucao atual - auditoria consolidada de toda a MF6 - 2026-06-25

### Metadados desta execucao

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF6`
- BKs abrangidos: `BK-MF6-01` a `BK-MF6-10`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`
- Pastas de referencia nao editadas: `apps/`, `mockup/`
- Alteracoes de codigo: nenhuma
- Alteracoes fora de `IMPLEMENTATION_ROOT`: sim, apenas este relatorio tecnico permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Permissao de commits: `nao`; commits realizados: nenhum

### Fontes consultadas

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF6`, `BK_IDS=[]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, todos os guias `docs/planificacao/guias-bk/MF6/`, leitura dirigida de guias MF0-MF5 e MF7 para coerencia vizinha.
- Relatorios existentes `IMPLEMENTACAO-REAL_DEV-MF6.md`, `CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`, `AUDITORIA-HIDRATACAO-MF6.md` e historico deste relatorio.
- `real_dev/api/package.json`, `real_dev/web/package.json`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/src`, `real_dev/api/scripts`, `real_dev/api/tests`, `real_dev/web/src`, `real_dev/web/scripts`.

### Resultado geral

Estado geral: `PASS_COM_RISCOS`

A implementacao real de `MF6` esta alinhada com `RNF08` a `RNF17` nos contratos essenciais de performance, seguranca, configuracao e auditoria sensivel. Nao foram encontrados findings ativos `P0`, `P1`, `P2` ou `P3` nesta auditoria consolidada.

O estado nao e `PASS` absoluto porque as provas executadas continuam maioritariamente locais/estruturais: o gate de concorrencia correu em `mode: local-contract` por falta de 25 cookies/sessoes reais, e os testes persistentes de integracao foram saltados explicitamente por ausencia de `TEST_DATABASE_URL`. Isto e uma limitacao de evidence operacional, nao uma falha de codigo confirmada nesta execucao.

### Estado por BK

| BK | Requisito | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF6-01` | `RNF08` | `OK` | `measureDocumentInsertion()` fixa budget de 1000 ms e as rotas de venda, compra e lancamento manual escrevem headers `X-OPSA-Document-*` sem remover guards, contexto multiempresa ou validacao. |
| `BK-MF6-02` | `RNF09` | `OK` com risco operacional | `check-mf6-concurrency.mjs` suporta modo HTTP autenticado com `OPSA_SESSION_COOKIES_JSON` e 25 utilizadores; nesta execucao correu fallback local deterministico com 25 operacoes (`mode: local-contract`). |
| `BK-MF6-03` | `RNF10` | `OK` | `suggestReconciliations()` filtra `BankStatementLine` por `companyId`, limita candidatos a 250, mede budget de 3000 ms, devolve sugestoes e nao confirma movimentos automaticamente. |
| `BK-MF6-04` | `RNF11` | `OK` | `consumeFifoLayers()` ordena camadas FIFO, falha cedo com `INSUFFICIENT_FIFO_LAYERS`, mede budget de 1000 ms e suporta preview com `write: false`. |
| `BK-MF6-05` | `RNF12` | `OK` | `server.js` monta `trust proxy`, `enforceHttps()` e HSTS antes dos routers de dominio; producao HTTP devolve `HTTPS_REQUIRED`. |
| `BK-MF6-06` | `RNF13` | `OK` | `password.js` centraliza bcrypt com `BCRYPT_ROUNDS=12`; testes confirmam hash bcrypt, ausencia de texto claro e verificacao positiva/negativa. |
| `BK-MF6-07` | `RNF14` | `OK` | `sessionCookie.js` usa cookie `sid` server-side, `httpOnly: true`, `secure` em producao, `sameSite: "lax"`, `path: "/"`, limpeza coerente e frontend com `credentials: "include"`. |
| `BK-MF6-08` | `RNF15` | `OK` | `requireTrustedOrigin()` bloqueia origens nao confiaveis em metodos mutaveis de producao; `escapeHtml()` existe para HTML gerado pela API; scans nao encontraram `eval`, `new Function` ou `dangerouslySetInnerHTML`. |
| `BK-MF6-09` | `RNF16` | `OK` | `loadApiEnv()` centraliza ambiente, exige `APP_BASE_URL` HTTPS e `DATABASE_URL` em producao, devolve apenas `databaseUrlConfigured`; `check-mf6-env.mjs` faz scanner source-wide contra padroes de segredo provavel. |
| `BK-MF6-10` | `RNF17` / `RF47` | `OK` | `recordSensitiveAudit()` aplica allowlist de acoes e bloqueia detalhes sensiveis; integrado em `permissions.update`, `fiscalPeriod.close` e `document.issue`, com `companyId` e `userId` vindos do backend autenticado. |

### Findings ativos

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Sem findings ativos. |
| `P1` | 0 | Sem findings ativos. |
| `P2` | 0 | Sem findings ativos. |
| `P3` | 0 | Findings P3 historicos de evidence em `BK-MF6-08`, `BK-MF6-09` e `BK-MF6-10` ja constam como corrigidos no historico abaixo. |

### Rastreabilidade BK -> RNF/RF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF6-01` | `RNF08`; handoff de `BK-MF5-07` | `documentPerformance.js`, `saleDocumentRoutes.js`, `purchaseDocumentRoutes.js`, `manualJournalRoutes.js` | `test:mf6:documents`, `test:unit` |
| `BK-MF6-02` | `RNF09` | `check-mf6-concurrency.mjs`, `mf6-contracts.test.js` | `test:mf6:concurrency`, `test:contracts` |
| `BK-MF6-03` | `RNF10`; MF3 tesouraria | `reconciliationPerformance.js`, `statementImportService.js`, `statementRoutes.js` | `test:mf6:reconciliation`, `test:unit`, `test:contracts` |
| `BK-MF6-04` | `RNF11`; `BK-MF2-03` | `fifoPerformance.js`, `fifoCostService.js`, Prisma `StockCostLayer`/`StockCostConsumption` | `test:mf6:fifo`, `test:unit` |
| `BK-MF6-05` | `RNF12` | `transportSecurity.js`, `server.js` | `test:mf6:https`, `test:unit`, `test:contracts` |
| `BK-MF6-06` | `RNF13`; `BK-MF0-01`, `BK-MF0-05` | `password.js`, auth/reset services por contrato | `test:mf6:bcrypt`, `test:unit` |
| `BK-MF6-07` | `RNF14`; `BK-MF0-01` | `sessionCookie.js`, `authController.js`, `authMiddleware.js`, `apiClient.ts` | `test:mf6:session-cookie`, `typecheck`, `build` |
| `BK-MF6-08` | `RNF15`; `BK-MF6-05`, `BK-MF6-07` | `requestHardening.js`, `server.js`, scans estaticos | `test:mf6:hardening`, `test:unit`, scans `rg` |
| `BK-MF6-09` | `RNF16` | `config/env.js`, `.env.example`, `server.js`, `check-mf6-env.mjs` | `test:mf6:env`, `prisma:validate`, scans `rg` |
| `BK-MF6-10` | `RNF17`, `RF47`, `BK-MF4-09` | `auditLogService.js`, `companyUserService.js`, `fiscalPeriodService.js`, `saleDocumentService.js`, Prisma `AuditLog` | `test:mf6:audit`, `test:unit`, `test:contracts` |

### Contratos consumidos de MFs anteriores

- `MF0`: sessao server-side via cookie `sid`, bcrypt, recuperacao de password, roles/permissoes e empresa ativa.
- `MF1`: criacao/emissao de documentos de venda, documentos de compra, recebimentos/pagamentos e lancamentos contabilisticos.
- `MF2`: FIFO, camadas de custo, lancamentos manuais, anexos privados e bloqueio por periodo fiscal.
- `MF3`: importacao de extratos, linhas bancarias, recebimentos/pagamentos candidatos e sugestoes de reconciliacao.
- `MF4`: `AuditLog`, `IntegrationLog`, auditoria operacional e fontes explicaveis.
- `MF5`: budget visual/performance frontend, `credentials: "include"`, feedback/erro e build/typecheck preservados.

### Contratos entregues para MF7

- Gates agregados `test:mf6:*` em `npm --prefix real_dev/api run test:mf6`.
- Middleware global de HTTPS/HSTS e origem confiavel antes dos routers.
- Configuracao centralizada de ambiente com validacao de producao.
- Helpers de budget para documentos, reconciliacao e FIFO.
- Auditoria sensivel reutilizavel por backups, exportacoes, SAF-T, email, retencao e operacoes futuras, sem implementar scope substantivo de MF7.

### Coerencia entre MFs

- `MF5 -> MF6`: `OK`. `real_dev/web/src/lib/apiClient.ts` continua a usar `credentials: "include"`; `typecheck` e `build` passaram; nao houve alteracao de UI nem quebra dos contratos MF5.
- Cadeia interna `BK-MF6-01 -> BK-MF6-10`: `OK_COM_RISCOS`. Os contratos encaixam em sequencia: budgets, concorrencia, reconciliacao, FIFO, transporte seguro, bcrypt, cookies, hardening, ambiente e auditoria. O risco e apenas a ausencia de prova HTTP/DB real nesta execucao.
- `MF6 -> MF7`: `OK_COM_RISCOS`. MF7 pode consumir config/env, middleware de seguranca, gates e `recordSensitiveAudit`; nao foi implementada funcionalidade MF7.

### Pesquisa estatica

- Segredos/chaves: `PASS_COM_OBSERVACOES`. Os matches de `secret`, `token`, `password` e `DATABASE_URL` sao codigo defensivo, testes negativos, adapters que evitam logs sensiveis, `.env.example` ficticio ou scanner MF6. Nao foi encontrado segredo hardcoded acionavel.
- Storage/browser: `PASS`. Sem uso acionavel de `localStorage`/`sessionStorage` para sessao, token, role ou empresa ativa.
- XSS/eval/tipos inseguros/destrutivos: `PASS`. Sem `dangerouslySetInnerHTML`, `eval`, `new Function`, `payload: unknown`, `as any`, `deleteMany({})`, `delete({})` ou `updateMany({})` acionaveis.
- Drift de dominio: `PASS`. Sem referencias acionaveis a `FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala ou material de estudo.
- `companyId`: `PASS_COM_OBSERVACOES`. O `companyId` aparece como contexto backend, filtros Prisma e relacoes; os fluxos MF6 auditados usam `req.companyId`/sessao/membership, nao `companyId` arbitrario do body para ownership.

### Comandos executados

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Os tres relatorios MF6 ja estavam untracked antes desta execucao. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` esta ignorado por `.gitignore:4`, comportamento esperado nesta PAP. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:mf6` | `PASS_COM_RESSALVAS` | 10 smokes MF6 passaram; concorrencia correu em `mode: local-contract`. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 65 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 30 testes passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS` | 2 testes saltados explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run typecheck` | `PASS` | TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS` | Vite build passou. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental ampla, fora deste modo. |
| Scans estaticos com `rg` | `PASS_COM_OBSERVACOES` | Sem finding acionavel; matches defensivos/contextuais registados acima. |
| `git diff --check` | `PASS` | Sem whitespace errors; complementado por checagem direta deste relatorio untracked sem trailing whitespace/placeholders. |

### Validacoes nao executadas

- Carga HTTP autenticada com 25 sessoes/cookies por empresa: nao executada por falta de `OPSA_SESSION_COOKIES_JSON`, servidor/seeds autenticados e base de teste ativa; o script ja suporta esse modo.
- `test:integration` com persistencia real: nao executado sem skip porque nao existe `TEST_DATABASE_URL`; os testes declaram que a variavel deve apontar para uma base efemera cujo nome contenha `test`, `audit` ou `ci`.
- Prova browser autenticada: nao executada; a MF6 auditada e sobretudo backend/configuracao/seguranca e os gates web `typecheck`/`build` passaram.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados codigo em `real_dev`, BKs, RF/RNF, backlog, matriz, sprints, `apps/` ou `mockup/`.

### Blockers e proximos passos

- Sem blockers `P0`, `P1` ou `P2`.
- `TODO_OPERACIONAL`: executar `test:mf6:concurrency` em modo HTTP real com 25 cookies de sessao validos e endpoints autenticados.
- `TODO_OPERACIONAL`: executar `npm --prefix real_dev/api run test:integration` com `TEST_DATABASE_URL` efemero, sem `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- Proxima acao recomendada: preparar DB efemera e credenciais/sessoes de smoke para fechar a ressalva operacional de carga e persistencia.

## Execucao atual - confirmacao de correcao BK-MF6-09 e BK-MF6-10 - 2026-06-25

### Resultado geral desta confirmacao

Estado geral: `CORRIGIDO`

Os findings `MF6-AUD-20260625-BK09-F01` e `MF6-AUD-20260625-BK10-F01` foram corrigidos numa passagem dirigida de `corrigir_auditoria`. A correcao reforcou apenas os smokes/evidence de `BK-MF6-09` e `BK-MF6-10`; nao alterou runtime funcional, endpoints, permissao, contexto multiempresa, Prisma, modelos, controllers, services de dominio, frontend ou contratos HTTP.

`real_dev/api/scripts/check-mf6-env.mjs` passa agora a testar `DATABASE_URL` ausente em producao e a percorrer `real_dev/api/src`, `real_dev/api/scripts`, `.env.example`, `real_dev/web/src` e `real_dev/web/scripts` em busca de padroes de segredo provavel, ignorando apenas o proprio scanner. `real_dev/api/scripts/check-mf6-audit-gate.mjs` passa agora a provar as tres integracoes criticas: `permissions.update` em `companyUserService`, `fiscalPeriod.close` em `fiscalPeriodService` e `document.issue` em `saleDocumentService`, alem dos negativos de acao nao declarada e detalhes sensiveis.

### Estado final por finding

| Finding | Severidade | BK/RF/RNF | Estado atual | Evidencia |
| --- | --- | --- | --- | --- |
| `MF6-AUD-20260625-BK09-F01` | `P3` | `BK-MF6-09` / `RNF16` | `CORRIGIDO` | `test:mf6:env`, `test:mf6`, `syntax:check`, `test:unit`, `test:contracts`, `prisma:validate`, `typecheck` e `build` passaram; o smoke inclui scanner source-wide e negativo de `DATABASE_URL` ausente em producao. |
| `MF6-AUD-20260625-BK10-F01` | `P3` | `BK-MF6-10` / `RNF17` / `RF47` | `CORRIGIDO` | `test:mf6:audit`, `test:mf6`, `syntax:check`, `test:unit`, `test:contracts`, `prisma:validate`, `typecheck` e `build` passaram; o smoke prova `permissions.update`, `fiscalPeriod.close` e `document.issue` nos tres services criticos. |

### Ficheiros alterados nesta correcao

- `real_dev/api/scripts/check-mf6-env.mjs`
- `real_dev/api/scripts/check-mf6-audit-gate.mjs`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados BKs, RF/RNF, matriz, backlog, sprints, `apps/`, `mockup/`, Prisma, services de dominio, controllers, rotas, frontend ou testes de produto.

## Execucao atual - reauditoria independente BK-MF6-09 e BK-MF6-10 - 2026-06-25

### Metadados desta execucao

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF6`
- BKs abrangidos: `BK-MF6-09`, `BK-MF6-10`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado para coerencia de configuracao e sessao: `real_dev/web`
- Pastas de referencia nao editadas: `apps/`, `mockup/`
- Relatorio fonte auto consultado: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF6.md` e historico deste relatorio
- Alteracoes de codigo: nenhuma
- Alteracoes fora de `IMPLEMENTATION_ROOT`: sim, apenas este relatorio tecnico permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Permissao de commits: `nao`; commits realizados: nenhum

### Fontes consultadas nesta execucao

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF6`, `BK_IDS=[BK-MF6-09, BK-MF6-10]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, todos os guias `docs/planificacao/guias-bk/MF6/`, leitura dirigida de `BK-MF6-09` e `BK-MF6-10`, levantamento de headers/contratos das MFs anteriores e leitura dirigida de `BK-MF7-01` como consumidor seguinte.
- Relatorios MF6 existentes: `IMPLEMENTACAO-REAL_DEV-MF6.md`, `CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md` e historico deste relatorio.
- `real_dev/api/package.json`, `real_dev/web/package.json`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/src/config/env.js`, `real_dev/api/.env.example`, `real_dev/api/src/server.js`, `real_dev/api/src/modules/audit/auditLogService.js`, `real_dev/api/src/modules/company-users/companyUserService.js`, `real_dev/api/src/modules/company-users/companyUserController.js`, `real_dev/api/src/modules/fiscal-periods/fiscalPeriodService.js`, `real_dev/api/src/modules/fiscal-periods/fiscalPeriodController.js`, `real_dev/api/src/modules/sales/saleDocumentService.js`, `real_dev/api/src/modules/sales/saleDocumentRoutes.js`, scripts e testes MF6.

### Resultado geral desta execucao

Estado geral: `PASS_COM_RISCOS`

`BK-MF6-09` cumpre o contrato runtime essencial de `RNF16`: `real_dev/api/src/config/env.js` centraliza a configuracao operacional, valida `APP_BASE_URL`, exige HTTPS em producao, exige `DATABASE_URL` em producao e devolve apenas `databaseUrlConfigured`, sem expor o valor. `real_dev/api/.env.example` contem apenas valores ficticios de desenvolvimento e `real_dev/api/src/server.js` consome `loadApiEnv()` antes dos middlewares e routers.

`BK-MF6-10` cumpre o contrato runtime essencial de `RNF17`: `real_dev/api/src/modules/audit/auditLogService.js` define allowlist de acoes sensiveis, bloqueia detalhes como `password`, `token`, `secret`, `authorization`, `cookie`, `rawPayload` e `documentLines`, reutiliza o modelo `AuditLog` da MF4 e inclui `companyId`, `userId`, `action`, `entity`, `entityId`, `details` e `createdAt`. A auditoria sensivel esta integrada em alteracao de role, fecho de periodo fiscal e emissao definitiva de venda, sempre com `companyId` e `userId` vindos do backend autenticado e nao do body.

Nao foram encontrados findings `P0`, `P1` ou `P2`. O estado nao e `PASS` absoluto porque os smokes dedicados dos dois BKs sao mais estreitos do que os guias prometem: o smoke de ambiente nao faz scanner source-wide de credenciais/padroes perigosos, e o smoke de auditoria nao prova textualmente as tres integracoes criticas apesar de elas existirem no codigo real. Estes gaps sao `P3` de cobertura/evidence, nao falhas funcionais confirmadas.

### Estado por BK

| BK | RNF | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF6-09` | `RNF16` | `OK` com finding `P3` de cobertura | `loadApiEnv()` valida `APP_BASE_URL`, HTTPS em producao e `DATABASE_URL` em producao; `server.js` usa `loadApiEnv()`; `.env.example` nao contem segredo real; `test:mf6:env`, `test:mf6`, `test:unit`, `test:contracts`, `prisma:validate`, `typecheck` e `build` passaram; scan estatico nao encontrou credenciais hardcoded acionaveis. |
| `BK-MF6-10` | `RNF17` / `RF47` | `OK` com finding `P3` de cobertura | `recordSensitiveAudit()` valida action allowlist e detalhes minimos; `AuditLog` persiste empresa, utilizador, acao, entidade, alvo e detalhes; `companyUserService`, `fiscalPeriodService` e `saleDocumentService` chamam o helper em operacoes sensiveis; controllers/routers passam `req.companyId` e `req.user.id`; `test:mf6:audit`, `test:mf6`, `test:unit` e `test:contracts` passaram. |

### Findings desta execucao

| Finding | Severidade | BK/RF/RNF | Estado | Bloqueia MF? |
| --- | --- | --- | --- | --- |
| `MF6-AUD-20260625-BK09-F01` | `P3` | `BK-MF6-09` / `RNF16` | `AUDITADO_COM_FINDINGS` | Nao |
| `MF6-AUD-20260625-BK10-F01` | `P3` | `BK-MF6-10` / `RNF17` / `RF47` | `AUDITADO_COM_FINDINGS` | Nao |

#### MF6-AUD-20260625-BK09-F01 - Smoke de ambiente nao faz scanner source-wide de credenciais

- Severidade: `P3`
- BK/RNF: `BK-MF6-09` / `RNF16`
- Evidencia objetiva: `real_dev/api/scripts/check-mf6-env.mjs` valida HTTPS em producao e le `.env.example`, mas nao percorre `real_dev/api/src`, `real_dev/api/scripts` ou `real_dev/web` a procurar padroes como `sk_live_`, `pk_live_`, `LIVE_VALUE_DO_NOT_COMMIT` ou chaves API hardcoded; tambem nao inclui negativo explicito de `DATABASE_URL` ausente em producao, embora `loadApiEnv()` implemente essa regra.
- Expected: o gate dedicado do BK deve provar scanner textual contra padroes perigosos e negativos principais de variavel ausente/credencial no codigo, conforme o guia `BK-MF6-09`.
- Observed: o contrato runtime esta implementado, e a auditoria manual com `rg` nao encontrou segredo hardcoded acionavel, mas o smoke dedicado nao automatiza a pesquisa source-wide.
- Impacto: lacuna de evidence/coverage; baixo risco imediato porque o scan manual desta execucao passou e a configuracao runtime esta centralizada.
- Correcao recomendada: expandir `check-mf6-env.mjs` para percorrer `src`, `scripts`, `.env.example` e, se aplicavel, `real_dev/web`, bloquear padroes de segredo provaveis e testar `NODE_ENV=production` sem `DATABASE_URL`.
- Estado: `AUDITADO_COM_FINDINGS`.

#### MF6-AUD-20260625-BK10-F01 - Smoke de auditoria nao prova textualmente as tres integracoes criticas

- Severidade: `P3`
- BK/RF/RNF: `BK-MF6-10` / `RNF17` / `RF47`
- Evidencia objetiva: `real_dev/api/scripts/check-mf6-audit-gate.mjs` testa `recordSensitiveAudit()`, acao nao declarada, detalhe proibido `token` e chamada em `saleDocumentService.js`; contudo, nao le `companyUserService.js` nem `fiscalPeriodService.js`, apesar de o guia exigir smoke textual com chamadas reais em tres services criticos.
- Expected: o smoke dedicado deve confirmar `permissions.update`, `fiscalPeriod.close` e `document.issue` nos respetivos services criticos.
- Observed: as tres integracoes existem no codigo real (`companyUserService`, `fiscalPeriodService`, `saleDocumentService`), mas o gate automatizado so valida textualmente a integracao de venda.
- Impacto: lacuna de evidence/coverage; nao quebra auditoria runtime nem multiempresa porque os services e controllers auditados usam `req.companyId`, `req.user.id`, transacoes e `recordSensitiveAudit()`.
- Correcao recomendada: expandir `check-mf6-audit-gate.mjs` para ler os tres services, confirmar cada action e manter negativos para acao nao declarada, detalhe proibido e payload excessivo.
- Estado: `AUDITADO_COM_FINDINGS`.

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF6-09` | `RNF16`; `BK-MF0-05`; `BK-MF4`; `BK-MF6-08`; handoff para `BK-MF6-10` | `real_dev/api/src/config/env.js`, `real_dev/api/.env.example`, `real_dev/api/src/server.js`, `real_dev/api/scripts/check-mf6-env.mjs`, `real_dev/web/src/lib/apiClient.ts`, `real_dev/api/package.json`, `real_dev/web/package.json` | `syntax:check`, `prisma:validate`, `test:mf6:env`, `test:mf6`, `test:unit`, `test:contracts`, scans estaticos, `typecheck`, `build` |
| `BK-MF6-10` | `RNF17`; `RF47`; `BK-MF4-09`; `BK-MF4-10`; handoff para `BK-MF7-01` | `real_dev/api/src/modules/audit/auditLogService.js`, `companyUserService.js`, `companyUserController.js`, `fiscalPeriodService.js`, `fiscalPeriodController.js`, `saleDocumentService.js`, `saleDocumentRoutes.js`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/scripts/check-mf6-audit-gate.mjs`, `real_dev/api/tests/unit/mf6-services.test.js` | `syntax:check`, `prisma:validate`, `test:mf6:audit`, `test:mf6`, `test:unit`, `test:contracts`, scans estaticos |

### Contratos consumidos e entregues

- `BK-MF6-09` consome `BK-MF6-05`/`BK-MF6-08`: a configuracao de producao precisa de `APP_BASE_URL` HTTPS para cookies/hardening de origem fazerem sentido. Entrega a `BK-MF6-10` e MF7 uma fonte centralizada de ambiente, sem segredos hardcoded e sem expor `DATABASE_URL`.
- `BK-MF6-10` consome `BK-MF4-09` e `AuditLog` existente, sem criar colunas Prisma novas. Entrega a MF7 um helper transversal `recordSensitiveAudit()` reutilizavel por backups, retencao, exportacoes, SAF-T, email e operacoes futuras.
- Os fluxos auditados preservam multiempresa: `companyId` vem de `req.companyId`/contexto autenticado ou filtros Prisma por empresa; `actorUserId`/`userId` vem de `req.user.id`, nao do corpo do pedido.
- `BK-MF6-10` nao substitui logs de integracao de MF4 e nao inventa dashboard/SIEM externo.

### Coerencia entre MFs

- `MF5 -> MF6`: `OK`. `real_dev/web/src/lib/apiClient.ts` continua a usar `credentials: "include"`; `typecheck` e `build` passaram; nao foram encontradas ocorrencias de `localStorage`/`sessionStorage` para sessao, token, role ou empresa ativa.
- `BK-MF6-08 -> BK-MF6-09 -> BK-MF6-10`: `OK_COM_RISCOS`. Hardening de origem, configuracao de ambiente e auditoria sensivel encaixam; a ressalva e a cobertura incompleta dos smokes dedicados, nao o comportamento real.
- `MF6 -> MF7`: `OK_COM_RISCOS`. `BK-MF7-01` pode reutilizar configuracao centralizada e auditoria sensivel para backups/restauro, mas esta auditoria nao implementou scope de MF7. Mantem-se a necessidade de reforcar gates antes de usar os helpers em operacoes futuras.

### Pesquisa estatica desta execucao

- Scan de segredos/configuracao em `real_dev/api` e `real_dev/web`: `PASS_COM_OBSERVACOES`; matches de `PASSWORD`, `TOKEN`, `DATABASE_URL`, `APP_BASE_URL` e `process.env` sao validators, testes negativos, configuracao esperada, scripts ou flags defensivas. Nao foi encontrado segredo real hardcoded acionavel.
- Scan de storage perigoso, XSS/eval, tipos inseguros, CORS permissivo e operacoes destrutivas largas: `PASS`; sem ocorrencias acionaveis para `localStorage`, `sessionStorage`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `payload: unknown`, `as any`, `deleteMany({})`, `delete({})`, `updateMany({})` ou logs de password/token/cookie.
- Scan de drift de dominio: `PASS_COM_OBSERVACOES`; sem referencias acionaveis a `FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala ou material de estudo. Matches residuais em texto de armazenamento privado nao indicam drift de produto.
- Scan de `companyId` em body/query: `PASS_COM_OBSERVACOES`; o fluxo de selecao explicita da empresa ativa continua validado no backend e nao foi usado pelos BKs alvo para decidir ownership arbitrario.

### Comandos executados nesta execucao

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Tres relatorios MF6 ja estavam untracked antes desta execucao. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` esta gitignored por `.gitignore:4`, comportamento esperado nesta PAP. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:mf6:env` | `PASS_COM_RISCO_P3` | Passou, mas nao faz scanner source-wide nem negativo de `DATABASE_URL` ausente em producao. |
| `npm --prefix real_dev/api run test:mf6:audit` | `PASS_COM_RISCO_P3` | Passou, mas so valida textualmente a integracao em `saleDocumentService.js`. |
| `npm --prefix real_dev/api run test:mf6` | `PASS_COM_RESSALVAS` | 10 smokes MF6 passaram; concorrencia continua em `mode: local-contract`; BK9/BK10 mantem gaps P3 de cobertura. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 65 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 30 testes passaram. |
| `npm --prefix real_dev/web run typecheck` | `PASS` | TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS` | Vite build passou. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental ampla, incluindo avisos de qualidade de guias fora deste modo de implementacao. |
| Scans estaticos com `rg` | `PASS_COM_OBSERVACOES` | Sem segredo hardcoded, storage de sessao, APIs perigosas ou drift acionavel; matches contextuais registados acima. |
| `git diff --check` | `PASS` | Sem whitespace errors em ficheiros tracked antes da escrita deste bloco. |

### Validacoes nao executadas

- Prova HTTP live com alteracao real de role, fecho fiscal e emissao definitiva criando `AuditLog` persistido: nao executada por ausencia de `TEST_DATABASE_URL`/base efemera e seeds autenticadas; parcialmente coberta por services auditados, testes unitarios e contratos.
- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS`: nao executado porque nao existe `TEST_DATABASE_URL` configurado.
- Smoke browser autenticado: nao executado; os BKs alvo sao backend/configuracao/auditoria e os gates web `typecheck`/`build` passaram.
- Correcao dos dois findings P3: nao executada porque o modo atual e auditoria sem edicao de codigo.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados codigo em `real_dev`, BKs, RF/RNF, backlog, matriz, sprints, `apps/` ou `mockup/`.

### Blockers e proximos passos

- Sem blockers `P0`, `P1` ou `P2` para `BK-MF6-09` e `BK-MF6-10`.
- `P3`: expandir `check-mf6-env.mjs` para scanner source-wide e negativo de `DATABASE_URL` ausente em producao.
- `P3`: expandir `check-mf6-audit-gate.mjs` para provar textualmente `permissions.update`, `fiscalPeriod.close` e `document.issue` nos tres services criticos.
- `TODO_OPERACIONAL`: repetir prova HTTP/DB real com base efemera e sessao autenticada para confirmar `AuditLog` persistido nos fluxos sensiveis.

## Execucao atual - confirmacao de correcao BK-MF6-08 - 2026-06-25

### Resultado geral desta confirmacao

Estado geral: `CORRIGIDO`

O finding `MF6-AUD-20260625-BK08-F01` da reauditoria `BK-MF6-07`/`BK-MF6-08` foi corrigido numa passagem dirigida de `corrigir_auditoria`. A correcao removeu o JSDoc backend indevido `@param props - Propriedades recebidas pelo componente React.` dos ficheiros `real_dev/api/src` e `real_dev/api/tests`, preservando as ocorrencias legitimas em componentes frontend.

Nao houve alteracao de runtime, cookies, hardening de origem, validators, rate limit, permissoes, contexto multiempresa, Prisma, endpoints, payloads, respostas HTTP ou frontend.

### Estado final por finding

| Finding | Severidade | BK/RNF | Estado atual | Evidencia |
| --- | --- | --- | --- | --- |
| `MF6-AUD-20260625-BK08-F01` | `P3` | `BK-MF6-08` / `RNF15` | `CORRIGIDO` | `rg -n "@param props|componente React|Propriedades React" real_dev/api/src real_dev/api/tests` sem ocorrencias; `syntax:check`, `test:mf6:hardening` e `test:contracts` passaram. |

### Ficheiros alterados nesta correcao

- `real_dev/api/src` e `real_dev/api/tests`: remocao da linha JSDoc `@param props` indevida nos ficheiros backend/API listados no relatorio de correcao.
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados BKs, RF/RNF, matriz, backlog, sprints, `apps/`, `mockup/` ou frontend.

## Execucao atual - reauditoria independente BK-MF6-07 e BK-MF6-08 - 2026-06-25

### Metadados desta execucao

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF6`
- BKs abrangidos: `BK-MF6-07`, `BK-MF6-08`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado para coerencia de sessao: `real_dev/web`
- Pastas de referencia nao editadas: `apps/`, `mockup/`
- Relatorios consultados: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF6.md`, `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md` e historico deste relatorio.
- Alteracoes de codigo: nenhuma
- Alteracoes fora de `IMPLEMENTATION_ROOT`: sim, apenas este relatorio tecnico permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Permissao de commits: `nao`; commits realizados: nenhum

### Fontes consultadas nesta execucao

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF6`, `BK_IDS=[BK-MF6-07, BK-MF6-08]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `docs/planificacao/guias-bk/README.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, todos os guias `docs/planificacao/guias-bk/MF6/`, leitura dirigida de `BK-MF6-07` e `BK-MF6-08`, guias MF5/MF7 para coerencia vizinha e relatorios MF6 existentes.
- `real_dev/api/package.json`, `real_dev/web/package.json`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/src`, `real_dev/api/scripts`, `real_dev/api/tests`, `real_dev/web/src`.

### Resultado geral desta execucao

Estado geral: `PASS_COM_RISCOS`

`BK-MF6-07` fica auditado como `OK`. A implementacao materializa `RNF14` em `real_dev/api/src/modules/auth/sessionCookie.js`: cookie `sid`, `httpOnly: true`, `secure: isProduction`, `sameSite: "lax"`, `path: "/"`, `maxAge` centralizado, escrita por `setSessionCookie`, limpeza por `clearSessionCookie` com a mesma base de opcoes e leitura server-side por `readSessionCookie`. O controller de autenticação usa esse helper em registo, login, logout e `/api/auth/me`; o middleware `requireAuth` resolve a sessao no backend antes de injetar `req.session` e `req.user`; o frontend preserva `credentials: "include"` no cliente API.

`BK-MF6-08` fica auditado como `OK` com um finding `P3` documental/transversal. A implementacao materializa `RNF15` com `requireTrustedOrigin` em `real_dev/api/src/modules/security/requestHardening.js`, montado globalmente em `real_dev/api/src/server.js` antes do primeiro router de dominio. Em producao simulada, o middleware bloqueia metodos mutaveis com origem nao confiavel; `escapeHtml` cobre texto gerado em HTML; os validators backend continuam a normalizar/validar payloads antes dos services; o rate limit de auth devolve `429` em excesso e falha explicitamente em producao sem store partilhado.

Nao foram confirmados findings `P0`, `P1` ou `P2` nos BKs alvo. O estado nao e `PASS` absoluto porque nao foi possivel executar prova HTTP autenticada de login/logout, `Set-Cookie` real mascarado ou negativos `403/429` contra servidor persistente: a API em producao simulada imprimiu `api_started` e terminou com exit code 0, sem ficar disponivel para `curl`. Os gates unitarios/contratuais relevantes passaram.

### Estado por BK

| BK | RNF | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF6-07` | `RNF14` | `OK` | `sessionCookie.js` define `COOKIE_NAME = "sid"`, `SESSION_MAX_AGE_MS`, `buildSessionCookieOptions`, `setSessionCookie`, `clearSessionCookie` e `readSessionCookie`; `authController.js` usa `setSessionCookie` no registo/login e `clearSessionCookie` no logout; `authMiddleware.js` resolve a sessao pelo cookie; `apiClient.ts` usa `credentials: "include"`; `test:mf6:session-cookie`, `test:unit`, `test:contracts` e `test:mf6` passaram. |
| `BK-MF6-08` | `RNF15` | `OK` | `requestHardening.js` define `requireTrustedOrigin` e `escapeHtml`; `server.js` monta `requireTrustedOrigin` antes de `/api/auth` e restantes routers; `authRateLimit.js` e `passwordResetRateLimit.js` limitam tentativas e devolvem `429`; validators backend existem nos fluxos de auth e dominios financeiros; `test:mf6:hardening`, `test:unit`, `test:contracts` e `test:mf6` passaram. |

### Findings desta execucao

| Finding | Severidade | BK/RNF | Estado | Bloqueia MF? |
| --- | --- | --- | --- | --- |
| `MF6-AUD-20260625-BK08-F01` | `P3` | `BK-MF6-08` / `RNF15` | `AUDITADO_COM_FINDINGS` | Nao |

#### MF6-AUD-20260625-BK08-F01 - JSDoc backend ainda contem `@param props` copiado de componentes React

- Severidade: `P3`
- BK/RNF: `BK-MF6-08` / `RNF15`, como qualidade de evidence tecnica em superficies backend de seguranca, multiempresa, validacao e rotas mutaveis.
- Evidencia objetiva: `rg -n "@param props|componente React" real_dev/api/src real_dev/web/src real_dev/api/scripts real_dev/api/tests` encontrou ocorrencias em varios ficheiros backend, incluindo `real_dev/api/src/modules/companies/companyService.js`, `companyController.js`, `companyRoutes.js`, `company-users/*`, `accounting/*Routes.js`, `payments/paymentRoutes.js`, `vat-rates/vatRateRoutes.js`, `treasury/*Routes.js` e testes contractuais antigos. Em frontend, `@param props` e esperado em componentes React e nao e finding.
- Expected: JSDoc backend deve descrever dependencias Express/Prisma/adapters/contexto reais, sem referencias a propriedades de componentes React.
- Observed: comentarios backend residuais mencionam `props` de React em services, controllers, routes e validators.
- Impacto: ruido pedagogico e de manutencao; nao altera cookies, origem confiavel, validators, rate limit, permissoes, empresa ativa ou resposta HTTP.
- Correcao recomendada: executar uma correcao P3 separada de higiene JSDoc nos ficheiros backend, substituindo `@param props` por parametros reais ou removendo entradas inexistentes.
- Estado: `AUDITADO_COM_FINDINGS`.

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF6-07` | `RNF14`; `RF01`; `BK-MF0-01`; `BK-MF6-05`; `BK-MF6-06` | `real_dev/api/src/modules/auth/sessionCookie.js`, `authController.js`, `authMiddleware.js`, `authRoutes.js`, `real_dev/web/src/lib/apiClient.ts`, `real_dev/api/scripts/check-mf6-session-cookie.mjs`, `real_dev/api/tests/unit/mf6-services.test.js` | `syntax:check`, `prisma:validate`, `test:mf6:session-cookie`, `test:unit`, `test:contracts`, `test:mf6`, `typecheck`, `build` |
| `BK-MF6-08` | `RNF15`; `BK-MF6-05`; `BK-MF6-07`; validacao backend e multiempresa | `real_dev/api/src/modules/security/requestHardening.js`, `server.js`, `authRateLimit.js`, `passwordResetRateLimit.js`, `authValidators.js`, `passwordResetController.js`, `companyValidators.js`, `companyService.js`, `companyContext.js`, `real_dev/api/scripts/check-mf6-hardening.mjs`, `real_dev/api/tests/unit/mf6-services.test.js`, `real_dev/api/tests/contracts/mf6-contracts.test.js` | `syntax:check`, `prisma:validate`, `test:mf6:hardening`, `test:unit`, `test:contracts`, `test:mf6`, scans estaticos, `typecheck`, `build` |

### Contratos consumidos e entregues

- `BK-MF6-07` consome `BK-MF0-01`, `BK-MF0-03`, `BK-MF6-05` e `BK-MF6-06`: sessao server-side, contexto multiempresa, transporte seguro e bcrypt. Entrega para `BK-MF6-08` um cookie opaco com atributos verificaveis e sem armazenamento de sessao/token/role/empresa ativa no frontend.
- `BK-MF6-08` consome cookies HttpOnly/SameSite e HTTPS/HSTS. Entrega para `BK-MF6-09`, `BK-MF6-10` e MF7 uma camada transversal de origem confiavel, escape HTML, rate limit de autenticacao e validacao backend antes dos services/Prisma.
- O fluxo `companyId` recebido no body existe apenas para selecao explicita de empresa ativa (`/api/session/company`) e e validado por membership no backend antes de gravar `activeCompanyId` na sessao; nao foi encontrado uso para decidir ownership de operacoes de dominio.

### Coerencia entre MFs

- `MF5 -> MF6`: `OK`. O frontend continua a usar o cliente API centralizado com `credentials: "include"`; `typecheck` e `build` passaram; nao foram encontradas ocorrencias de `localStorage`/`sessionStorage`.
- `BK-MF6-06 -> BK-MF6-07`: `OK`. Bcrypt e sessao server-side continuam separados: password fica em hash, browser recebe apenas cookie `sid` opaco.
- `BK-MF6-07 -> BK-MF6-08 -> BK-MF6-09`: `OK_COM_RISCOS`. Cookies seguros, hardening de origem e configuracao por ambiente passam nos gates MF6; falta apenas evidence HTTP autenticada com servidor persistente, DB e cookies reais.
- `MF6 -> MF7`: `OK_COM_RISCOS`. MF7 pode consumir contratos de cookies, origem confiavel, validacao e hardening sem que esta auditoria implemente scope futuro. Mantem-se a ressalva operacional de validacao live.

### Pesquisa estatica desta execucao

- Scan largo da prompt em `real_dev/api` e `real_dev/web`: `PASS_COM_OBSERVACOES`; matches de `secret`/`token` pertencem a redacao defensiva, testes negativos, adapters que evitam tokens brutos ou nomes de storage privado; sem segredo hardcoded acionavel.
- Scan dirigido de padroes perigosos em `src`, `scripts` e `tests`: `PASS`; sem `localStorage`, `sessionStorage`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `payload: unknown`, `as any`, raw SQL, CORS permissivo ou operacoes destrutivas largas acionaveis.
- Scan de drift de dominio em `real_dev/api`, `real_dev/web` e guias MF6: `PASS`; sem referencias a `FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala ou material de estudo.
- Scan dirigido de `companyId` em body/query: `PASS_COM_OBSERVACOES`; a ocorrencia relevante e o fluxo canonico de escolha da empresa ativa, validado por membership no backend.
- Scan JSDoc `@param props|componente React`: `P3` nos ficheiros backend listados no finding `MF6-AUD-20260625-BK08-F01`; aceitavel em componentes frontend.

### Comandos executados nesta execucao

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Relatorios MF6 ja estavam untracked antes desta execucao. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` esta gitignored por `.gitignore:4`, comportamento esperado nesta PAP. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:mf6:session-cookie` | `PASS` | Smoke dedicado de `BK-MF6-07` passou. |
| `npm --prefix real_dev/api run test:mf6:hardening` | `PASS` | Smoke dedicado de `BK-MF6-08` passou. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 65 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 30 testes passaram. |
| `npm --prefix real_dev/api run test:mf6` | `PASS_COM_RESSALVAS` | 10 smokes MF6 passaram; concorrencia continua em `mode: local-contract`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS` | 2 testes saltados explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run typecheck` | `PASS` | TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS` | Vite build passou. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental/global fora deste modo. |
| Scan largo da prompt com `rg` | `PASS_COM_OBSERVACOES` | Apenas matches contextuais/defensivos de `secret`/`token`; sem finding funcional. |
| Scan de drift de dominio com `rg` | `PASS` | Sem referencias a outros produtos/domínios. |
| `git diff --check` | `PASS` | Sem whitespace errors antes da escrita deste bloco. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> NODE_ENV=production APP_BASE_URL=https://opsa.example.test PORT=4188 npm --prefix real_dev/api run dev` | `INCONCLUSIVO` | Imprimiu `api_started`, mas terminou com exit code 0; nao ficou disponivel para `curl`. |

### Validacoes nao executadas

- Login/logout HTTP real com captura mascarada de `Set-Cookie`: nao executado porque nao ha `TEST_DATABASE_URL`, utilizador/sessao real preparados e a API local nao ficou persistente para `curl`.
- Negativos HTTP live de `403 UNTRUSTED_ORIGIN`, `429 RATE_LIMITED` e input malicioso: nao executados contra servidor persistente pelo mesmo bloqueio operacional; cobertos parcialmente por unitarios, contratos e smokes.
- `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS`: nao executado porque nao existe `TEST_DATABASE_URL`.
- Smoke browser autenticado: nao executado; os BKs alvo sao de backend/seguranca e os gates web `typecheck`/`build` passaram.
- Correcao de JSDoc P3: nao executada porque o modo atual e auditoria sem edicao de codigo.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados codigo em `real_dev`, BKs, RF/RNF, backlog, matriz, sprints, `apps/` ou `mockup/`.

### Blockers e proximos passos

- Sem blockers `P0`, `P1` ou `P2` para `BK-MF6-07` e `BK-MF6-08`.
- `P3`: corrigir JSDoc backend residual com `@param props` numa passagem dirigida de higiene tecnica, se for desejado.
- `TODO_OPERACIONAL`: repetir a prova HTTP real com DB de teste, utilizador/sessao preparada e servidor persistente para capturar `Set-Cookie` mascarado e negativos `403/429`.
- `TODO_OPERACIONAL`: repetir `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS` quando existir `TEST_DATABASE_URL`.

## Execucao atual - reauditoria independente BK-MF6-05 e BK-MF6-06 - 2026-06-25

### Metadados desta execucao

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF6`
- BKs abrangidos: `BK-MF6-05`, `BK-MF6-06`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado para coerencia de sessao/transporte: `real_dev/web`
- Pastas de referencia nao editadas: `apps/`, `mockup/`
- Alteracoes de codigo: nenhuma
- Alteracoes fora de `IMPLEMENTATION_ROOT`: sim, apenas este relatorio tecnico permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Permissao de commits: `nao`; commits realizados: nenhum

### Resultado geral

Estado geral: `PASS_COM_RISCOS`

`BK-MF6-05` e `BK-MF6-06` foram revalidados contra `RNF12`, `RNF13`, guias MF6, stack real `real_dev/api`/`real_dev/web`, scripts MF6 e testes existentes. Nao foram confirmados findings `P0`, `P1`, `P2` ou `P3` ativos nos dois BKs alvo.

O estado nao e `PASS` absoluto porque a prova HTTP manual de `BK-MF6-05` ficou bloqueada: `npm --prefix real_dev/api run dev` e `node src/server.js` imprimiram `api_started` em producao simulada, mas terminaram imediatamente com exit code 0; o `curl` seguinte falhou com `curl: (7) Failed to connect`. O gate unitario/contratual de HTTPS passou e cobre a regra de middleware, proxy e HSTS sem depender de servidor persistente.

### Estado por BK

| BK | RNF | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF6-05` | `RNF12` | `OK` | `real_dev/api/src/modules/security/transportSecurity.js` define `isSecureRequest`, `enforceHttps` com `HTTPS_REQUIRED` e `applyStrictTransportSecurity`; `real_dev/api/src/server.js` monta `app.set("trust proxy", 1)`, HTTPS e HSTS antes de `/api/auth`; `test:mf6:https`, `test:unit`, `test:contracts` e `test:mf6` passaram. |
| `BK-MF6-06` | `RNF13` | `OK` | `real_dev/api/src/modules/auth/password.js` centraliza `bcrypt`, exporta `BCRYPT_ROUNDS = 12`, gera hash com `bcrypt.hash` e valida com `bcrypt.compare`; `authService.js` usa `hashPassword` no registo e `verifyPassword` no login; `passwordResetService.js` usa `hashPassword` no reset; validators backend rejeitam passwords curtas em registo/reset; `test:mf6:bcrypt`, `test:unit`, `test:contracts` e `test:mf6` passaram. |

### Findings desta execucao

| Severidade | Findings ativos | Estado |
| --- | --- | --- |
| `P0` | nenhum | `NAO_APLICAVEL` |
| `P1` | nenhum | `NAO_APLICAVEL` |
| `P2` | nenhum | `NAO_APLICAVEL` |
| `P3` | nenhum | `NAO_APLICAVEL` |

O finding historico `MF6-AUD-20260625-BK06-F01` continua `CORRIGIDO`: `rg -n "@param props|componente React" real_dev/api/src/modules/auth real_dev/api/src/modules/security real_dev/api/src/server.js real_dev/api/scripts/check-mf6-https.mjs real_dev/api/scripts/check-mf6-bcrypt.mjs real_dev/api/tests/unit/mf6-services.test.js real_dev/api/tests/contracts/mf6-contracts.test.js` nao devolveu ocorrencias.

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF6-05` | `RNF12`; `BK-MF6-07` como consumidor direto de transporte seguro | `real_dev/api/src/modules/security/transportSecurity.js`, `real_dev/api/src/server.js`, `real_dev/api/scripts/check-mf6-https.mjs`, `real_dev/api/tests/unit/mf6-services.test.js`, `real_dev/api/tests/contracts/mf6-contracts.test.js`, `real_dev/web/src/lib/apiClient.ts` | `syntax:check`, `prisma:validate`, `test:mf6:https`, `test:unit`, `test:contracts`, `test:mf6`, `typecheck`, `build` |
| `BK-MF6-06` | `RNF13`; `BK-MF0-01`; `BK-MF0-05`; `BK-MF6-07` | `real_dev/api/src/modules/auth/password.js`, `authService.js`, `authValidators.js`, `passwordResetService.js`, `passwordResetValidators.js`, `passwordResetController.js`, `real_dev/api/scripts/check-mf6-bcrypt.mjs`, `real_dev/api/tests/unit/mf6-services.test.js`, `real_dev/api/tests/unit/mf0-validators.test.js`, `real_dev/web/src/lib/apiClient.ts` | `syntax:check`, `prisma:validate`, `test:mf6:bcrypt`, `test:unit`, `test:contracts`, `test:mf6`, `typecheck`, `build` |

### Contratos consumidos e entregues

- `BK-MF6-05` consome a stack Express, `loadApiEnv` e o contrato de sessao/cookies existente. Entrega para `BK-MF6-06`, `BK-MF6-07` e MF7 uma barreira global de transporte seguro em producao simulada, com suporte de proxy e HSTS, sem inventar certificados nem infraestrutura externa.
- `BK-MF6-06` consome `BK-MF0-01` e `BK-MF0-05`: registo, login, reset, validators, sessao server-side e cookie HttpOnly. Entrega para `BK-MF6-07` uma politica de hashing bcrypt centralizada, validada e sem persistencia de texto claro.
- O frontend continua a usar `credentials: "include"` no cliente API e nao foram encontradas ocorrencias de `localStorage`/`sessionStorage` para sessao, token, role, empresa ativa ou password.

### Coerencia entre MFs

- `MF5 -> MF6`: `OK`. `npm --prefix real_dev/web run typecheck` e `npm --prefix real_dev/web run build` passaram; a camada web continua alinhada com o cliente API centralizado e cookies HttpOnly.
- `BK-MF6-04 -> BK-MF6-05`: `OK`. A seguranca de transporte nao altera FIFO, reconciliacao, performance backend nem contratos multiempresa anteriores.
- `BK-MF6-05 -> BK-MF6-06 -> BK-MF6-07`: `OK_COM_RISCOS`. HTTPS/HSTS, bcrypt e cookies passam nos gates MF6; a ressalva e apenas a prova HTTP manual bloqueada por servidor local nao persistente.
- `MF6 -> MF7`: `OK_COM_RISCOS`. Os contratos de transporte seguro e hashing ficam disponiveis para MF7, sem implementacao de scope futuro. Mantem-se a ressalva operacional de evidence HTTP/DB real.

### Pesquisa estatica desta execucao

- Scan largo de risco em `real_dev/api` e `real_dev/web`: `PASS_COM_OBSERVACOES`; ocorrencias de `secret`/`token` pertencem a testes negativos, allowlists defensivas, adapters que evitam tokens brutos ou comentarios de sanitizacao, sem segredo hardcoded acionavel.
- Scan de drift de dominio em codigo real e BKs MF6: `PASS`; sem referencias a `FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala ou material de estudo.
- Scan dirigido de `companyId` em body/query: `PASS_COM_OBSERVACOES`; a unica ocorrencia em `companyValidators.js` pertence ao fluxo explicito de selecao de empresa ativa da sessao, nao a ownership arbitrario de operacoes de dominio.
- Scan dirigido de storage no frontend: `PASS`; sem `localStorage`/`sessionStorage`; passwords/tokens existem apenas em campos de formulario e chamadas de auth/reset.

### Comandos executados nesta execucao

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Tres relatorios MF6 ja estavam untracked antes desta execucao. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` esta gitignored por `.gitignore:4`, comportamento esperado nesta PAP. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:mf6:https` | `PASS` | Smoke dedicado de `BK-MF6-05` passou. |
| `npm --prefix real_dev/api run test:mf6:bcrypt` | `PASS` | Smoke dedicado de `BK-MF6-06` passou. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 65 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 30 testes passaram. |
| `npm --prefix real_dev/api run test:mf6` | `PASS_COM_RESSALVAS` | 10 smokes MF6 passaram; concorrencia continua em `mode: local-contract`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS` | 2 testes saltados explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run typecheck` | `PASS` | TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS` | Vite build passou. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental/global fora deste modo. |
| `git diff --check` | `PASS` | Sem whitespace errors em ficheiros tracked. |
| `PORT=4176 NODE_ENV=production APP_BASE_URL=https://opsa.example.test DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run dev` | `INCONCLUSIVO` | Imprimiu `api_started`, mas terminou de imediato com exit code 0. |
| `PORT=4176 NODE_ENV=production APP_BASE_URL=https://opsa.example.test DATABASE_URL=<URL_AUTHENTICATED_REDACTED> node src/server.js` | `INCONCLUSIVO` | Mesmo comportamento: `api_started` e termino imediato. |
| `curl -i -H 'x-forwarded-proto: http' http://127.0.0.1:4176/api/auth/me` | `BLOQUEADO` | `curl: (7) Failed to connect`, sem servidor persistente. |

### Validacoes nao executadas

- Prova HTTP manual persistente com `x-forwarded-proto: https`: nao executada depois de confirmar que o servidor local nao ficava disponivel para `curl`.
- `test:integration` sem skip: nao executado porque nao existe `TEST_DATABASE_URL`.
- Smoke browser autenticado: nao executado; os BKs alvo sao backend/seguranca de transporte/password e os gates web de coerencia passaram.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados codigo em `real_dev`, BKs, RF/RNF, backlog, matriz, sprints, `apps/` ou `mockup/`.

### Blockers e proximos passos

- Sem blockers `P0`/`P1`/`P2`/`P3` para `BK-MF6-05` ou `BK-MF6-06`.
- `TODO_OPERACIONAL`: repetir a prova HTTP manual de `BK-MF6-05` num ambiente em que a API fique persistente para `curl`.
- `TODO_OPERACIONAL`: repetir `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS` quando existir `TEST_DATABASE_URL`.

## Execucao atual - reauditoria apos correcao BK-MF6-06 - 2026-06-25

### Resultado geral desta reauditoria

Estado geral: `PASS_COM_RISCOS`

O finding `MF6-AUD-20260625-BK06-F01` foi reavaliado apos correcao dirigida e fica `CORRIGIDO`. O modulo backend de autenticacao ja nao contem JSDoc com `@param props` nem mencao a componentes React.

A correcao foi exclusivamente documental em JSDoc e nao alterou comportamento runtime de registo, login, reset, bcrypt, cookies, rate-limit ou adapters de email.

### Estado final por finding

| Finding | Severidade | BK | Estado atual | Evidencia |
| --- | --- | --- | --- | --- |
| `MF6-AUD-20260625-BK06-F01` | `P3` | `BK-MF6-06` | `CORRIGIDO` | `rg -n "@param props|componente React" real_dev/api/src/modules/auth` sem ocorrencias; `syntax:check`, `test:mf6:bcrypt`, `test:unit`, `test:contracts` e `test:mf6` passaram. |

### Ficheiros alterados nesta correcao

- `real_dev/api/src/modules/auth/authController.js`
- `real_dev/api/src/modules/auth/authRoutes.js`
- `real_dev/api/src/modules/auth/passwordResetController.js`
- `real_dev/api/src/modules/auth/passwordResetEmailAdapter.js`
- `real_dev/api/src/modules/auth/authRateLimit.js`
- `real_dev/api/src/modules/auth/passwordResetRateLimit.js`
- `real_dev/api/src/modules/auth/passwordResetService.js`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados BKs, RF/RNF, matriz, backlog, sprints, `apps/` ou `mockup/`.

## Execucao atual - auditoria confirmada BK-MF6-05 e BK-MF6-06 - 2026-06-25

### Metadados desta execucao

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF6`
- BKs abrangidos nesta execucao: `BK-MF6-05`, `BK-MF6-06`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado para coerencia de transporte/sessao: `real_dev/web`
- Pastas de referencia nao editadas: `apps/`, `mockup/`
- Relatorios consultados: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF6.md`, `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- Alteracoes de codigo: nenhuma
- Alteracoes fora de `IMPLEMENTATION_ROOT`: sim, apenas este relatorio tecnico permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Permissao de commits: `nao`; commits realizados: nenhum

### Fontes consultadas nesta execucao

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF6`, `BK_IDS=[BK-MF6-05, BK-MF6-06]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao`, `PERMITIR_COMMITS=nao`.
- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- Todos os guias `docs/planificacao/guias-bk/MF6/`, com leitura dirigida de `BK-MF6-05` e `BK-MF6-06`.
- Guias MF5/MF7 e relatorios MF6 existentes para coerencia entre macrofases e historico de implementacao/correcao.
- `real_dev/api/package.json`, `real_dev/web/package.json`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/src`, `real_dev/api/scripts`, `real_dev/api/tests`, `real_dev/web/src`.

### Resultado geral desta execucao

Estado geral: `PASS_COM_RISCOS`

`BK-MF6-05` fica auditado como `OK`. A implementacao materializa `RNF12` com middleware global `enforceHttps`, reconhecimento de `x-forwarded-proto`, `Strict-Transport-Security` em producao, `app.set("trust proxy", 1)` e montagem antes do primeiro router de dominio. O smoke dedicado `test:mf6:https`, os contratos MF6 e o gate agregado `test:mf6` passaram. A prova `curl` manual contra servidor local em producao simulada nao ficou concluida porque o processo `npm run dev` terminou apos imprimir `api_started` e os pedidos `curl` subsequentes falharam com `curl: (7) Failed to connect`.

`BK-MF6-06` fica auditado como `OK` com um finding `P3` de qualidade documental no codigo. O contrato funcional e de seguranca de `RNF13` esta materializado por `bcrypt` centralizado em `password.js`, `BCRYPT_ROUNDS = 12`, uso de `hashPassword` no registo e reset, uso de `verifyPassword` no login, validacao backend de password curta nos fluxos de criacao/reset e ausencia de persistencia de credenciais no frontend. O finding `P3` nao altera runtime: alguns JSDoc do modulo de auth ainda mencionam `props` de componente React em ficheiros backend.

Nao ha findings `P0`, `P1` ou `P2` ativos para estes dois BKs.

### Estado por BK

| BK | RNF | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF6-05` | `RNF12` | `OK` | `real_dev/api/src/modules/security/transportSecurity.js` define `isSecureRequest`, `enforceHttps` com `HTTPS_REQUIRED` e `applyStrictTransportSecurity`; `real_dev/api/src/server.js` monta `trust proxy`, HTTPS e HSTS nas linhas anteriores a `/api/auth`; `test:mf6:https`, `test:contracts`, `test:unit` e `test:mf6` passaram. |
| `BK-MF6-06` | `RNF13` | `OK` | `real_dev/api/src/modules/auth/password.js` importa `bcrypt`, exporta `BCRYPT_ROUNDS = 12`, gera hash com `bcrypt.hash` e valida com `bcrypt.compare`; `authService.js` usa `hashPassword` no registo e `verifyPassword` no login; `passwordResetService.js` usa `hashPassword` no reset; validators backend rejeitam password curta em registo/reset; `test:mf6:bcrypt`, `test:unit`, `test:contracts` e `test:mf6` passaram. |

### Findings desta execucao

| Finding | Severidade | BK | Estado | Bloqueia MF? |
| --- | --- | --- | --- | --- |
| `MF6-AUD-20260625-BK06-F01` | `P3` | `BK-MF6-06` | `AUDITADO_COM_FINDINGS` | Nao |

#### MF6-AUD-20260625-BK06-F01 - JSDoc backend de auth ainda menciona props React

- Severidade: `P3`
- BK/RNF: `BK-MF6-06` / qualidade tecnica do fluxo de autenticacao relacionado com `RNF13`
- Evidencia objetiva: `rg -n "@param props|componente React" real_dev/api/src/modules/auth real_dev/api/src/modules/security real_dev/api/src/server.js real_dev/api/scripts/check-mf6-https.mjs real_dev/api/scripts/check-mf6-bcrypt.mjs real_dev/api/tests/unit/mf6-services.test.js` encontrou ocorrencias em `authController.js`, `authRoutes.js`, `passwordResetController.js`, `passwordResetService.js`, `passwordResetEmailAdapter.js`, `authRateLimit.js` e `passwordResetRateLimit.js`.
- Expected: JSDoc backend deve descrever dependencias Express/Prisma/adapters reais, sem copiar terminologia de componentes React.
- Observed: comentarios incorretos em ficheiros backend do modulo de autenticacao/password reset.
- Impacto: ruido pedagogico e tecnico; nao altera hashing bcrypt, reset, login, cookies, rate-limit ou resposta HTTP.
- Correcao recomendada: substituir os `@param props` por descricoes reais das dependencias ou remover os parametros inexistentes numa correcao dirigida `P3`.
- Estado: `AUDITADO_COM_FINDINGS`.

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF6-05` | `RNF12`; `BK-MF6-07` como consumidor direto de transporte seguro | `real_dev/api/src/modules/security/transportSecurity.js`, `real_dev/api/src/server.js`, `real_dev/api/scripts/check-mf6-https.mjs`, `real_dev/api/tests/unit/mf6-services.test.js`, `real_dev/api/tests/contracts/mf6-contracts.test.js`, `real_dev/web/src/lib/apiClient.ts` | `syntax:check`, `prisma:validate`, `test:mf6:https`, `test:unit`, `test:contracts`, `test:mf6`, `typecheck`, `build` |
| `BK-MF6-06` | `RNF13`; `BK-MF0-01`; `BK-MF0-05`; `BK-MF6-07` | `real_dev/api/src/modules/auth/password.js`, `authService.js`, `authController.js`, `authValidators.js`, `passwordResetService.js`, `passwordResetController.js`, `passwordResetValidators.js`, `real_dev/api/scripts/check-mf6-bcrypt.mjs`, `real_dev/api/tests/unit/mf6-services.test.js`, `real_dev/api/tests/unit/mf0-validators.test.js`, `real_dev/web/src/lib/apiClient.ts` | `syntax:check`, `prisma:validate`, `test:mf6:bcrypt`, `test:unit`, `test:contracts`, `test:mf6`, `typecheck`, `build` |

### Contratos consumidos e entregues

- `BK-MF6-05` consome a stack Express existente e a configuracao de ambiente de MF6. Entrega para `BK-MF6-06`, `BK-MF6-07` e MF7 uma barreira global de transporte seguro, sem emitir certificados reais nem inventar infraestrutura externa.
- `BK-MF6-06` consome `BK-MF0-01` e `BK-MF0-05`: registo, login, reset, validators, sessao server-side e cookie HttpOnly. Entrega para `BK-MF6-07` uma politica de hashing bcrypt centralizada e validada, mantendo a separacao entre hash de password e cookie de sessao.
- O frontend continua a usar `credentials: "include"` no cliente API e nao foram encontradas ocorrencias de `localStorage`/`sessionStorage` para sessao, token, role, empresa ativa ou password.

### Coerencia entre MFs

- `MF5 -> MF6`: `OK`. `npm --prefix real_dev/web run typecheck` e `npm --prefix real_dev/web run build` passaram; a camada web continua a usar o cliente API centralizado com cookies HttpOnly.
- `BK-MF6-04 -> BK-MF6-05`: `OK`. O hardening de transporte nao altera FIFO, reconciliacao nem performance backend dos BKs anteriores.
- `BK-MF6-05 -> BK-MF6-06 -> BK-MF6-07`: `OK_COM_RISCOS`. HTTPS/HSTS, bcrypt e cookie de sessao passam nos gates MF6; o unico desvio encontrado e documental em JSDoc backend de auth.
- `MF6 -> MF7`: `OK_COM_RISCOS`. Os contratos de transporte, bcrypt, cookies, hardening, ambiente e auditoria continuam disponiveis para MF7; nao foi implementado scope de MF7. A ressalva e a falta de prova HTTP manual persistente no ambiente atual para o cenario `curl` de `BK-MF6-05`.

### Pesquisa estatica desta execucao

- Scan largo de risco em `real_dev/api` e `real_dev/web`: `PASS_COM_OBSERVACOES`; matches de `secret`/`token` pertencem a allowlists defensivas, testes negativos, mensagens de sanitizacao ou comentarios que proíbem exposicao, sem segredo hardcoded acionavel.
- Scan de drift de dominio em `real_dev/api`, `real_dev/web` e BKs MF6: `PASS`; sem referencias a `FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala ou material de estudo.
- Scan dirigido de `companyId` recebido por body/query: `PASS_COM_OBSERVACOES`; a ocorrencia em `companyValidators.js` pertence ao fluxo de selecao de empresa ativa da sessao, nao a decisao arbitraria de ownership em operacoes de dominio.
- Scan dirigido de JSDoc antigo em auth/security: `AUDITADO_COM_FINDINGS`; originou `MF6-AUD-20260625-BK06-F01`.
- Verificacao direta de hash invalido: `node --input-type=module -e 'import { verifyPassword } from "./real_dev/api/src/modules/auth/password.js"; console.log(await verifyPassword("Password-Forte-123!", "texto-claro"));'` devolveu `false`.

### Comandos executados nesta execucao

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Tres relatorios MF6 estavam untracked antes desta execucao. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` esta gitignored por `.gitignore:4`, comportamento esperado. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:mf6:https` | `PASS` | Smoke dedicado de `BK-MF6-05` passou. |
| `npm --prefix real_dev/api run test:mf6:bcrypt` | `PASS` | Smoke dedicado de `BK-MF6-06` passou. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 65 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 30 testes passaram. |
| `npm --prefix real_dev/api run test:mf6` | `PASS_COM_RESSALVAS` | 10 smokes MF6 passaram; concorrencia continua em `mode: local-contract`, ressalva ja registada em BK-MF6-02. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS` | 2 testes saltados explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run typecheck` | `PASS` | TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS` | Vite build passou. |
| `PORT=4176 NODE_ENV=production APP_BASE_URL=https://opsa.example.test DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run dev` | `INCONCLUSIVO` | Imprimiu `api_started`, mas o processo terminou antes de permitir `curl` persistente. |
| `curl -i -H 'x-forwarded-proto: http' http://127.0.0.1:4176/api/auth/me` | `BLOQUEADO` | `curl: (7) Failed to connect`; sem servidor persistente. |
| `curl -i -H 'x-forwarded-proto: https' http://127.0.0.1:4176/api/auth/me` | `BLOQUEADO` | `curl: (7) Failed to connect`; sem servidor persistente. |
| Scans estaticos com `rg` | `PASS_COM_OBSERVACOES` | Sem P0/P1/P2 acionavel; um P3 de JSDoc em auth. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental/global, incluindo avisos nos guias MF6 fora deste modo. |
| `git diff --check` | `PASS` | Sem whitespace errors em ficheiros tracked. |

### Validacoes nao executadas

- Prova HTTP manual persistente de `BK-MF6-05` com `x-forwarded-proto: http` esperado `403 HTTPS_REQUIRED` e `x-forwarded-proto: https` esperado passagem para auth: tentativa feita, mas bloqueada porque o servidor local nao ficou disponivel para `curl` neste ambiente.
- `test:integration` sem skip: nao executado porque nao existe `TEST_DATABASE_URL`.
- Smoke browser autenticado: nao executado; os BKs alvo sao backend/seguranca de transporte/password e os gates web de coerencia passaram.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados codigo em `real_dev`, BKs, RF/RNF, backlog, matriz, sprints, `apps/` ou `mockup/`.

### Blockers e proximos passos

- Sem blockers `P0`/`P1`/`P2` para `BK-MF6-05` ou `BK-MF6-06`.
- `TODO_P3`: corrigir JSDoc copiado de React nos ficheiros backend de auth listados em `MF6-AUD-20260625-BK06-F01`.
- `TODO_OPERACIONAL`: repetir prova HTTP manual de `BK-MF6-05` num ambiente em que a API fique persistente para `curl`.
- `TODO_OPERACIONAL`: repetir `test:integration` sem `OPSA_SKIP_PERSISTENCE_TESTS` quando existir `TEST_DATABASE_URL`.

## Execucao atual - auditoria independente BK-MF6-03 e BK-MF6-04 - 2026-06-25

### Metadados desta execucao

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF6`
- BKs abrangidos nesta execucao: `BK-MF6-03`, `BK-MF6-04`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado para coerencia MF5 -> MF6: `real_dev/web`
- Relatorios consultados: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF6.md`, `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- Alteracoes de codigo: nenhuma
- Alteracoes fora de `IMPLEMENTATION_ROOT`: sim, apenas este relatorio tecnico permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Permissao de commits: `nao`; commits realizados: nenhum

### Resultado geral desta execucao

Estado geral: `PASS_COM_RISCOS`

`BK-MF6-03` fica auditado como `OK`. A implementacao materializa `RNF10` com `RECONCILIATION_BUDGET_MS = 3000`, limite de candidatos, endpoint `POST /api/treasury/reconciliations/suggestions`, guards de sessao/empresa/permissao/role, empresa ativa resolvida por `req.companyId`, sugestoes separadas de confirmacao e resposta com `status`, `durationMs`, `withinBudget` e `budgetMs`.

`BK-MF6-04` fica auditado como `OK`. A implementacao materializa `RNF11` com `FIFO_COST_BUDGET_MS = 1000`, validacao antecipada `INSUFFICIENT_FIFO_LAYERS`, FIFO por `createdAt: "asc"`, medicao de duracao, preview consultivo com `write: false`, rota protegida por sessao, empresa ativa e permissao de inventario.

Nao ha findings `P0`, `P1`, `P2` ou `P3` ativos para estes dois BKs. O estado geral nao e `PASS` absoluto porque ficaram ressalvas operacionais: nao houve smoke HTTP autenticado manual com DB/sessoes reais e os testes de integracao DB-backed foram executados com `OPSA_SKIP_PERSISTENCE_TESTS=true`.

### Estado por BK

| BK | RNF | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF6-03` | `RNF10` | `OK` | `real_dev/api/src/modules/treasury/reconciliationPerformance.js` define budget `3000` e max `250`; `statementImportService.js` filtra `BankStatementLine`, `Receipt` e `Payment` por `companyId`; `statementRoutes.js` monta `/reconciliations/suggestions` com `requireAuth`, `requireCompanyContext`, `requirePermission(Permission.TREASURY_WRITE)` e `requireRole`; `test:mf6:reconciliation`, `test:unit`, `test:contracts` e `test:mf6` passaram. |
| `BK-MF6-04` | `RNF11` | `OK` | `real_dev/api/src/modules/inventory/fifoPerformance.js` define budget `1000` e erro `INSUFFICIENT_FIFO_LAYERS`; `fifoCostService.js` ordena camadas por `createdAt: "asc"`, falha cedo em stock insuficiente, mede duracao e usa `write: false` para preview; `fifoCostRoutes.js` monta `/fifo-cost/preview` com `requireAuth`, `requireCompanyContext` e `Permission.INVENTORY_READ`; `test:mf6:fifo`, `test:unit` e `test:mf6` passaram. |

### Findings desta execucao

| Severidade | Findings ativos | Estado |
| --- | --- | --- |
| `P0` | nenhum | `NAO_APLICAVEL` |
| `P1` | nenhum | `NAO_APLICAVEL` |
| `P2` | nenhum | `NAO_APLICAVEL` |
| `P3` | nenhum | `NAO_APLICAVEL` |

Os findings anteriores `MF6-AUD-20260625-BK03-F01` e `MF6-AUD-20260625-BK04-F01` continuam `CORRIGIDO`: o scan `rg -n "@param props|componente React" real_dev/api/src/modules/treasury/statementRoutes.js real_dev/api/src/modules/inventory/fifoCostRoutes.js` nao devolveu ocorrencias.

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF6-03` | `RNF10`; `RF33`; `BK-MF3-03`; `BK-MF4-10` | `real_dev/api/src/modules/treasury/reconciliationPerformance.js`, `statementImportService.js`, `statementRoutes.js`, `real_dev/api/scripts/check-mf6-reconciliation-performance.mjs`, `real_dev/api/tests/unit/mf6-services.test.js`, `real_dev/api/tests/contracts/mf6-contracts.test.js` | `syntax:check`, `prisma:validate`, `test:mf6:reconciliation`, `test:unit`, `test:contracts`, `test:mf6` |
| `BK-MF6-04` | `RNF11`; `RF25`; `BK-MF2-03`; `BK-MF2-02` | `real_dev/api/src/modules/inventory/fifoPerformance.js`, `fifoCostService.js`, `fifoCostRoutes.js`, `stockMovementService.js`, `real_dev/api/scripts/check-mf6-fifo-performance.mjs`, `real_dev/api/tests/unit/mf6-services.test.js` | `syntax:check`, `prisma:validate`, `test:mf6:fifo`, `test:unit`, `test:contracts`, `test:mf6`, `test:integration` com skip explicito |

### Contratos consumidos e entregues

- `BK-MF6-03` consome `MF3` para importacao de extratos, linhas bancarias, recebimentos e pagamentos; consome `MF4` para a separacao entre logs/auditoria e sugestao operacional. Entrega para `BK-MF6-04` e MF7 um padrao de budget medido, lote limitado e resposta parcial honesta.
- `BK-MF6-04` consome `MF2` para FIFO, movimentos de stock, camadas de custo e saldos por empresa. Entrega para `BK-MF6-05` e MF7 um calculo FIFO medido e consultivo sem alterar o metodo canonico nem bloquear operacoes criticas.
- Ambos preservam a regra de multiempresa no backend: `companyId` vem de `req.companyId`/contexto autenticado e nao do body/query para decidir ownership.

### Coerencia entre MFs

- `MF3 -> MF6`: `OK`. A reconciliacao continua a separar linhas bancarias, recebimentos e pagamentos, filtra por empresa ativa e nao confirma matches automaticamente.
- `MF2 -> MF6`: `OK_COM_RESSALVAS`. FIFO preserva ordem temporal e preview consultivo; a ressalva vem da ausencia de prova DB-backed sem skip para demonstrar nao-mutacao do preview em base real nesta execucao.
- `MF5 -> MF6`: `OK`. `typecheck`, `build`, `test:mf5:performance` e `test:mf5:feedback` passaram.
- `MF6 -> MF7`: `OK_COM_RISCOS`. Os contratos de performance, seguranca e modularidade continuam disponiveis para MF7; nao foi implementado scope de MF7. A ressalva e operacional, por falta de smoke HTTP autenticado real.

### Pesquisa estatica desta execucao

- Scan dirigido de `companyId` em body/query, storage sensivel, `eval`, `new Function`, `dangerouslySetInnerHTML`, casts inseguros e operacoes destrutivas nos ficheiros alvo: `PASS`; sem ocorrencias acionaveis nos modulos de tesouraria/inventario auditados.
- Scan largo em `real_dev/api/src`, `real_dev/api/tests`, `real_dev/api/scripts`, `real_dev/web/src` e `real_dev/web/scripts`: `PASS_COM_OBSERVACOES`; matches de `password`, `token`, `secret`, `mock` e `.env` pertencem a auth, testes negativos, adapters pedagogicos que nao registam tokens ou configuracao de teste.
- Scan de drift de dominio em codigo real e BKs MF6: `PASS`; sem referencias a `FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala ou material de estudo.
- `bash scripts/validate-planificacao.sh`: `PASS_COM_OBSERVACOES`; `overall_pass=true`, `advisory_pass=false` por divida documental/global, incluindo avisos nos guias MF6. Esta execucao nao corrigiu BKs por `PERMITIR_ALTERAR_DOCS=nao`.

### Comandos executados nesta execucao

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Tres relatorios MF6 estavam untracked antes desta execucao. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` esta gitignored por `.gitignore:4`, comportamento esperado nesta PAP. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:mf6:reconciliation` | `PASS` | Smoke dedicado de `BK-MF6-03` passou. |
| `npm --prefix real_dev/api run test:mf6:fifo` | `PASS` | Smoke dedicado de `BK-MF6-04` passou. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 65 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 30 testes passaram. |
| `npm --prefix real_dev/api run test:mf6` | `PASS_COM_RESSALVAS` | 10 smokes MF6 passaram; concorrencia continua em `mode: local-contract`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS` | 2 testes saltados por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run typecheck` | `PASS` | TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS` | Vite build passou. |
| `npm --prefix real_dev/web run test:mf5:performance` | `PASS` | Coerencia de performance MF5 preservada. |
| `npm --prefix real_dev/web run test:mf5:feedback` | `PASS` | Coerencia de feedback MF5 preservada. |
| Scans estaticos com `rg` | `PASS_COM_OBSERVACOES` | Sem finding acionavel nos BKs alvo. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental/global fora deste modo. |
| `git diff --check` | `PASS` | Sem whitespace errors em ficheiros tracked. |

### Validacoes nao executadas

- Teste manual HTTP do endpoint `POST /api/treasury/reconciliations/suggestions` com resposta `complete`, resposta `partial` e sessao ausente: nao executado porque nao foi arrancado servidor local autenticado nem preparada DB de teste com sessoes/dados reais.
- Prova DB-backed de que `GET /api/inventory/fifo-cost/preview` nao altera saldo/camadas: nao executada sem `TEST_DATABASE_URL`; `test:integration` correu com skip explicito.
- `test:integration` sem skip: nao executado por falta de `TEST_DATABASE_URL`.
- Smoke browser autenticado: nao executado; os BKs alvo sao backend/performance e os gates web de coerencia passaram.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados codigo em `real_dev`, BKs, RF/RNF, backlog, matriz, sprints, `apps/` ou `mockup/`.

### Blockers e proximos passos

- Sem blockers `P0`/`P1`/`P2` para `BK-MF6-03` ou `BK-MF6-04`.
- `TODO_OPERACIONAL`: executar prova HTTP autenticada de reconciliacao (`complete`, `partial`, sem sessao) contra servidor local e DB preparada.
- `TODO_OPERACIONAL`: executar testes de integracao sem `OPSA_SKIP_PERSISTENCE_TESTS` quando existir `TEST_DATABASE_URL`, para comprovar persistencia/nao-mutacao do preview FIFO.
- `TODO_DOCS_FORA_SCOPE`: se o objetivo seguinte for limpar o `advisory_pass=false`, executar uma prompt propria de hidratacao/correcao documental, porque esta execucao tinha `PERMITIR_ALTERAR_DOCS=nao`.

## Execucao atual - reauditoria apos correcao BK-MF6-03 e BK-MF6-04 - 2026-06-25

### Resultado geral desta reauditoria

Estado geral: `PASS`

Os findings `MF6-AUD-20260625-BK03-F01` e `MF6-AUD-20260625-BK04-F01` foram reavaliados apos correcao dirigida e ficam `CORRIGIDO`. Os dois route builders backend ja nao documentam `props` React inexistentes.

### Estado final por finding

| Finding | Severidade | BK | Estado atual | Evidencia |
| --- | --- | --- | --- | --- |
| `MF6-AUD-20260625-BK03-F01` | `P3` | `BK-MF6-03` | `CORRIGIDO` | `rg -n "@param props|componente React" real_dev/api/src/modules/treasury/statementRoutes.js` sem ocorrencias; `syntax:check`, `test:mf6:reconciliation`, `test:unit`, `test:contracts` e `test:mf6` passaram. |
| `MF6-AUD-20260625-BK04-F01` | `P3` | `BK-MF6-04` | `CORRIGIDO` | `rg -n "@param props|componente React" real_dev/api/src/modules/inventory/fifoCostRoutes.js` sem ocorrencias; `syntax:check`, `test:mf6:fifo`, `test:unit`, `test:contracts` e `test:mf6` passaram. |

### Ficheiros alterados na correcao

- `real_dev/api/src/modules/treasury/statementRoutes.js`
- `real_dev/api/src/modules/inventory/fifoCostRoutes.js`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados BKs, RF/RNF, matriz, backlog, sprints, `apps/` ou `mockup/`.

## Execucao atual - auditoria confirmada BK-MF6-03 e BK-MF6-04 - 2026-06-25

### Metadados desta execucao

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF6`
- BKs abrangidos nesta execucao: `BK-MF6-03`, `BK-MF6-04`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado para coerencia MF5 -> MF6: `real_dev/web`
- Pastas de referencia consultadas sem edicao: `apps/`, `mockup/`
- Relatorios consultados: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF6.md`, `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- Alteracoes de codigo: nenhuma
- Alteracoes fora de `IMPLEMENTATION_ROOT`: sim, apenas este relatorio tecnico permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Permissao de commits: `nao`; commits realizados: nenhum

### Resultado geral desta execucao

Estado geral: `PASS_COM_RISCOS`

`BK-MF6-03` fica auditado como `OK`: o contrato `RNF10` esta materializado por `RECONCILIATION_BUDGET_MS = 3000`, limite de candidatos, endpoint autenticado `POST /api/treasury/reconciliations/suggestions`, empresa ativa resolvida por `req.companyId`, permissao/role backend e resposta medida com `durationMs`, `withinBudget`, `budgetMs` e estado `complete`/`partial`.

`BK-MF6-04` fica auditado como `OK`: o contrato `RNF11` esta materializado por `FIFO_COST_BUDGET_MS = 1000`, validacao `INSUFFICIENT_FIFO_LAYERS` antes do calculo pesado, ordem FIFO por `createdAt: "asc"`, medicao de duracao, preview consultivo com `write: false` e rota protegida por sessao, empresa ativa e permissao de inventario.

Nao ha findings `P0`, `P1` ou `P2` ativos nos dois BKs. Existem dois findings `P3` de qualidade de JSDoc em rotas backend e ressalvas de validacao por ausencia de smoke HTTP manual autenticado e teste DB-backed sem skip.

### Estado por BK

| BK | RNF | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF6-03` | `RNF10` | `OK` | `real_dev/api/src/modules/treasury/reconciliationPerformance.js` define budget `3000` e max `250`; `statementImportService.js` filtra `bankStatementLine`, `receipt` e `payment` por `companyId`; `statementRoutes.js` usa `requireAuth`, `requireCompanyContext`, `requirePermission(Permission.TREASURY_WRITE)` e `requireRole` importado de `../permissions/permissionMiddleware.js`; `test:mf6:reconciliation`, `test:unit`, `test:contracts` e `test:mf6` passaram. |
| `BK-MF6-04` | `RNF11` | `OK` | `real_dev/api/src/modules/inventory/fifoPerformance.js` define budget `1000` e erro `INSUFFICIENT_FIFO_LAYERS`; `fifoCostService.js` ordena camadas por `createdAt: "asc"`, falha cedo em stock insuficiente, mede duracao e usa `write: false` para preview; `fifoCostRoutes.js` usa `requireAuth`, `requireCompanyContext` e `Permission.INVENTORY_READ`; `test:mf6:fifo`, `test:unit` e `test:mf6` passaram. |

### Findings desta execucao

| Finding | Severidade | BK | Estado | Bloqueia MF? |
| --- | --- | --- | --- | --- |
| `MF6-AUD-20260625-BK03-F01` | `P3` | `BK-MF6-03` | `AUDITADO_COM_FINDING` | Nao |
| `MF6-AUD-20260625-BK04-F01` | `P3` | `BK-MF6-04` | `AUDITADO_COM_FINDING` | Nao |

#### MF6-AUD-20260625-BK03-F01 - JSDoc backend ainda menciona props React

- Severidade: `P3`
- Evidencia objetiva: `real_dev/api/src/modules/treasury/statementRoutes.js:34` contem `@param props - Propriedades recebidas pelo componente React` dentro do JSDoc de um router Express.
- Expected: JSDoc deve descrever apenas dependencias reais do router backend, por exemplo `{ prisma }`, sem copiar terminologia de componentes React.
- Observed: comentario incorreto, sem impacto runtime.
- Impacto: ruído pedagogico e tecnico numa rota diretamente ligada ao BK; pode confundir alunos sobre fronteira frontend/backend.
- Correcao recomendada: substituir a linha por descricao das dependencias Express/Prisma ou remover o parametro inexistente.

#### MF6-AUD-20260625-BK04-F01 - JSDoc backend ainda menciona props React

- Severidade: `P3`
- Evidencia objetiva: `real_dev/api/src/modules/inventory/fifoCostRoutes.js:31` contem `@param props - Propriedades recebidas pelo componente React` dentro do JSDoc de um router Express.
- Expected: JSDoc deve descrever apenas dependencias reais do router backend, por exemplo `{ prisma }`, sem copiar terminologia de componentes React.
- Observed: comentario incorreto, sem impacto runtime.
- Impacto: ruído pedagogico e tecnico numa rota diretamente ligada ao BK; nao altera guard, permissao, preview nem calculo FIFO.
- Correcao recomendada: substituir a linha por descricao das dependencias Express/Prisma ou remover o parametro inexistente.

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Fonte canonica | Ficheiros auditados | Testes/gates |
| --- | --- | --- | --- |
| `BK-MF6-03` | `RNF10`; `BK-MF3-03`; `BK-MF4-10` | `reconciliationPerformance.js`, `statementImportService.js`, `statementRoutes.js`, `check-mf6-reconciliation-performance.mjs`, `mf6-services.test.js`, `mf6-contracts.test.js` | `syntax:check`, `test:mf6:reconciliation`, `test:unit`, `test:contracts`, `test:mf6` |
| `BK-MF6-04` | `RNF11`; `RF25`; `BK-MF2-03` | `fifoPerformance.js`, `fifoCostService.js`, `fifoCostRoutes.js`, `stockMovementService.js`, `check-mf6-fifo-performance.mjs`, `mf6-services.test.js` | `syntax:check`, `test:mf6:fifo`, `test:unit`, `test:contracts`, `test:mf6` |

### Mapa de integracao da MF

- `BK-MF6-02 -> BK-MF6-03`: `OK_COM_RISCOS`. O agregado `test:mf6` continua a executar concorrencia em `mode: local-contract`; isso nao invalida `BK-MF6-03`, mas mantem a ressalva operacional ja registada para `RNF09`.
- `BK-MF6-03 -> BK-MF6-04`: `OK`. A reconciliacao entrega medicao e limites sem confirmar movimentos; FIFO reutiliza o mesmo principio de budget sem alterar regras de stock.
- `BK-MF6-04 -> BK-MF6-05`: `OK`. FIFO nao altera a camada de transporte; `test:mf6:https` passou no agregado.

### Coerencia entre MFs

- `MF3 -> MF6`: `OK`. `BK-MF6-03` preserva a origem de extratos de `MF3`, filtra por empresa ativa e separa recebimentos de pagamentos conforme o sinal da linha bancaria.
- `MF2 -> MF6`: `OK_COM_RESSALVAS`. `BK-MF6-04` preserva FIFO de `MF2` por ordem temporal e com preview consultivo; a prova DB-backed de que preview nao altera saldo ficou limitada porque `test:integration` correu com `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- `MF5 -> MF6`: `OK`. `npm run typecheck`, `npm run build`, `test:mf5:performance` e `test:mf5:feedback` passaram.
- `MF6 -> MF7`: `OK_COM_RISCOS`. Os contratos de performance e seguranca ficam disponiveis para MF7; nao foi implementado scope de MF7. A ressalva vem apenas de validacoes operacionais nao executadas com servidor/cookies/DB reais.

### Pesquisa estatica desta execucao

- `git check-ignore -v real_dev real_dev/api real_dev/web`: `PASS`; `.gitignore:4` ignora `real_dev/`, comportamento esperado nesta PAP.
- Scan dirigido de risco nos ficheiros `BK-MF6-03`/`BK-MF6-04`: `PASS_COM_OBSERVACOES`; matches de `companyId` usam contexto autenticado ou escopo interno, nao body/query para decidir ownership; matches de `token/password` aparecem em teste MF6 de auditoria sensivel fora destes BKs.
- Scan de drift de dominio em `real_dev` e BKs `MF6`: `PASS`; sem referencias a `FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala ou material de estudo.
- Scan dirigido de import: `PASS`; nao ha `../users/roleMiddleware.js`; `requireRole` vem de `../permissions/permissionMiddleware.js`.
- `bash scripts/validate-planificacao.sh`: `PASS_COM_OBSERVACOES`; `overall_pass=true`, `advisory_pass=false`. O advisory inclui problemas documentais legados e tambem avisos nos guias `BK-MF6-03`/`BK-MF6-04`, mas esta execucao nao alterou BKs por `PERMITIR_ALTERAR_DOCS=nao`.

### Comandos executados nesta execucao

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Tres relatorios MF6 estavam untracked antes desta execucao. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` esta gitignored por `.gitignore:4`. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:mf6:reconciliation` | `PASS` | Smoke dedicado de `BK-MF6-03` passou. |
| `npm --prefix real_dev/api run test:mf6:fifo` | `PASS` | Smoke dedicado de `BK-MF6-04` passou. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 65 testes passaram, incluindo negativos de reconciliacao parcial e stock FIFO insuficiente. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 30 testes passaram, incluindo rota de reconciliacao e scripts MF6. |
| `npm --prefix real_dev/api run test:mf6` | `PASS_COM_RESSALVAS` | 10 smokes MF6 passaram; concorrencia continua em `mode: local-contract`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS` | 2 testes saltados por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run typecheck` | `PASS` | TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS` | Vite build passou. |
| `npm --prefix real_dev/web run test:mf5:performance` | `PASS` | Coerencia de performance MF5 preservada. |
| `npm --prefix real_dev/web run test:mf5:feedback` | `PASS` | Coerencia de feedback MF5 preservada. |
| Scans estaticos com `rg` | `PASS_COM_OBSERVACOES` | Sem P0/P1/P2 novo; apenas P3 de JSDoc em rotas alvo. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental/global e avisos nos guias alvo. |
| `git diff --check` | `PASS` | Sem whitespace errors em ficheiros tracked. |

### Validacoes nao executadas

- Teste manual HTTP do endpoint `POST /api/treasury/reconciliations/suggestions` com resposta `complete`, resposta `partial` e sessao ausente: nao executado porque nao foi arrancado servidor local autenticado nem preparada DB de teste com sessoes/dados reais.
- Prova DB-backed de que `GET /api/inventory/fifo-cost/preview` nao altera saldo/camadas: nao executada porque `test:integration` correu com `OPSA_SKIP_PERSISTENCE_TESTS=true` por falta de `TEST_DATABASE_URL`.
- `test:integration` sem skip: nao executado porque nao existe `TEST_DATABASE_URL`.
- Smoke browser autenticado: nao executado; estes BKs sao backend/performance e os gates web de coerencia passaram.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados codigo em `real_dev`, BKs, RF/RNF, backlog, matriz, sprints, `apps/` ou `mockup/`.

### Blockers e proximos passos

- Sem blockers `P0`/`P1`/`P2` para `BK-MF6-03` ou `BK-MF6-04`.
- `TODO_P3`: corrigir JSDoc copiado de React em `statementRoutes.js` e `fifoCostRoutes.js`.
- `TODO_OPERACIONAL`: executar prova HTTP autenticada de reconciliacao (`complete`, `partial`, sem sessao) contra servidor local e DB preparada.
- `TODO_OPERACIONAL`: executar testes de integracao sem `OPSA_SKIP_PERSISTENCE_TESTS` quando existir `TEST_DATABASE_URL`, para comprovar persistencia/nao-mutacao do preview FIFO.

## Execucao atual - auditoria confirmada BK-MF6-01 e BK-MF6-02 - 2026-06-25

### Metadados desta execucao

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF6`
- BKs abrangidos nesta execucao: `BK-MF6-01`, `BK-MF6-02`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado para coerencia MF5 -> MF6: `real_dev/web`
- Pastas de referencia nao editadas: `apps/`, `mockup/`
- Alteracoes de codigo: nenhuma
- Alteracoes fora de `IMPLEMENTATION_ROOT`: sim, apenas este relatorio tecnico permitido por `OUTPUT_MODE=relatorio_e_resumo`
- Permissao de commits: `nao`; commits realizados: nenhum

### Resultado geral desta execucao

Estado geral: `PASS_COM_RISCOS`

Decisao de avanco: `BK-MF6-02` fica marcado como `CONCLUIDO_COM_NOTA_DE_TESTE_POSTERIOR` para permitir avancar a macrofase. Esta decisao nao equivale a prova HTTP autenticada executada; a validacao real com 25 sessoes/cookies da mesma empresa continua registada como teste posterior obrigatorio.

`BK-MF6-01` fica auditado como `OK`: o contrato `RNF08` esta materializado por budget de `1000 ms`, medicao backend nas tres insercoes criticas e headers tecnicos de performance sem expor payloads financeiros.

`BK-MF6-02` fica `CONCLUIDO_COM_NOTA_DE_TESTE_POSTERIOR`: o script de concorrencia exige 25 utilizadores e suporta modo HTTP autenticado com `OPSA_SESSION_COOKIES_JSON`, mas nesta execucao voltou a correr em `mode: local-contract`. Por decisao de avanco, o P1 fica aceite como concluido no planeamento desta passagem, mantendo a prova operacional com 25 sessoes/cookies reais da mesma empresa como teste posterior obrigatorio.

### Estado por BK

| BK | RNF | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF6-01` | `RNF08` | `OK` | `real_dev/api/src/modules/performance/documentPerformance.js` define `DOCUMENT_INSERTION_BUDGET_MS = 1000`; `saleDocumentRoutes.js`, `purchaseDocumentRoutes.js` e `manualJournalRoutes.js` usam `measureDocumentInsertion` nos `POST` criticos e mantem guards de autenticacao, empresa ativa e permissoes. |
| `BK-MF6-02` | `RNF09` | `CONCLUIDO_COM_NOTA_DE_TESTE_POSTERIOR` | `real_dev/api/scripts/check-mf6-concurrency.mjs` define `REQUIRED_USERS = 25`, suporta `OPSA_SESSION_COOKIES_JSON` e mede HTTP autenticado quando existem cookies; `npm run test:mf6:concurrency` executou apenas `{ event: 'mf6_concurrency_local_smoke', users: 25, mode: 'local-contract' }`. |

### Findings desta execucao

| Finding | Severidade | BK | Estado | Bloqueia MF? |
| --- | --- | --- | --- | --- |
| `MF6-AUD-20260625-BK01-F02` | `P3` | `BK-MF6-01` | `JA_CORRIGIDO` | Nao |
| `MF6-AUD-20260625-BK02-F01` | `P1` | `BK-MF6-02` | `ACEITE_PARA_AVANCO_COM_TESTE_POSTERIOR` | Nao bloqueia avanco; bloqueia apenas prova operacional completa ate executar carga HTTP real |

### Rastreabilidade e coerencia

- `BK-MF6-01` consome contratos de `MF1/MF2` para criacao de venda, compra e lancamento manual, sem alterar regras de IVA, SNC, periodo fiscal, empresa ativa ou auditoria.
- `BK-MF6-02` consome o helper de performance de `BK-MF6-01` no fallback local e entrega um gate capaz de medir endpoints autenticados quando forem fornecidas 25 sessoes reais.
- `MF5 -> MF6`: `OK`. `typecheck`, `build`, `test:mf5:performance` e `test:mf5:feedback` passaram.
- `MF6 -> MF7`: `OK_COM_NOTA_DE_TESTE_POSTERIOR`. Os contratos de performance/seguranca continuam disponiveis; a prova de carga HTTP real de `RNF09` fica como teste posterior obrigatorio.

### Pesquisa estatica desta execucao

- `git check-ignore -v real_dev real_dev/api real_dev/web`: `PASS`; `.gitignore:4` ignora `real_dev/`, comportamento esperado nesta PAP.
- Scan de risco em `real_dev/api/src`, `real_dev/api/tests`, `real_dev/api/scripts`, `real_dev/web/src` e `real_dev/web/scripts`: `PASS_COM_OBSERVACOES`; matches de `secret`/`token` aparecem em testes negativos, sanitizacao, geracao de tokens ou comentarios defensivos, sem segredo hardcoded acionavel.
- Scan de drift de dominio em codigo real e BKs MF6: `PASS`; sem referencias a `FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala ou material de estudo.
- Scan dirigido de JSDoc antigo nos tres route builders de `BK-MF6-01`: `PASS`; sem `@param props` nem mencao a componente React.

### Comandos executados nesta execucao

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Tres relatorios MF6 estavam untracked antes desta execucao. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` esta gitignored por `.gitignore:4`. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:mf6:documents` | `PASS` | Contrato de performance de documentos OK. |
| `npm --prefix real_dev/api run test:mf6:concurrency` | `PASS_COM_RESSALVAS` | Passou em `mode: local-contract`, sem HTTP autenticado real. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 65 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 30 testes passaram. |
| `npm --prefix real_dev/api run test:mf6` | `PASS_COM_RESSALVAS` | 10 smokes MF6 passaram; concorrencia continua local. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS` | 2 testes saltados por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run typecheck` | `PASS` | TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS` | Vite build passou. |
| `npm --prefix real_dev/web run test:mf5:performance` | `PASS` | Coerencia de budget MF5 preservada. |
| `npm --prefix real_dev/web run test:mf5:feedback` | `PASS` | Coerencia de feedback MF5 preservada. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental global/legada fora do escopo. |
| `git diff --check` | `PASS` | Sem whitespace errors em ficheiros tracked. |

### Validacoes nao executadas

- Modo HTTP real de `check-mf6-concurrency.mjs`: nao executado porque faltam `OPSA_SESSION_COOKIES_JSON` com 25 cookies reais, servidor local autenticado e DB de teste preparada.
- `test:integration` sem skip: nao executado porque nao existe `TEST_DATABASE_URL`.
- Smoke browser autenticado: nao executado; o escopo desta auditoria e backend/transversal e os gates web aplicaveis passaram.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados codigo em `real_dev`, BKs, RF/RNF, backlog, matriz, sprints, `apps/` ou `mockup/`.

### Nota para teste posterior

Executar `OPSA_SESSION_COOKIES_JSON=<SECRET_REDACTED> OPSA_API_BASE_URL='http://127.0.0.1:3000' npm --prefix real_dev/api run test:mf6:concurrency` com 25 cookies validos da mesma empresa e uma DB de teste preparada. Se passar, reauditar `BK-MF6-02` e substituir a nota de teste posterior por evidencia operacional completa.

## Execucao atual - reauditoria BK-MF6-01 e BK-MF6-02 - 2026-06-25

### Metadados desta execucao

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- Tipo de execucao: reauditoria apos correcao dirigida
- MF alvo: `MF6`
- BKs abrangidos nesta execucao: `BK-MF6-01`, `BK-MF6-02`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`
- Relatorio atualizado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- Relatorio de correcao consultado: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- Permissao de commits: `nao`
- Alteracoes de codigo nesta reauditoria: nenhuma
- Alteracoes fora de `IMPLEMENTATION_ROOT`: sim, apenas este relatorio tecnico permitido por `OUTPUT_MODE=relatorio_e_resumo`

### Resultado geral desta reauditoria

Estado geral: `PASS_COM_RISCOS`

`BK-MF6-01` fica auditado como `OK`. O finding `MF6-AUD-20260625-BK01-F02` foi reavaliado e esta `JA_CORRIGIDO`: os tres route builders backend ja descrevem dependencias `{ prisma }` e routers Express, sem `@param props` nem mencao a componentes React.

`BK-MF6-02` continua `PARCIAL`. A implementacao suporta modo HTTP autenticado com `OPSA_SESSION_COOKIES_JSON`, mas a execucao atual voltou a terminar em `mode: local-contract`; por isso o finding `MF6-AUD-20260625-BK02-F01` permanece `BLOQUEADO` por falta de evidence runtime com 25 sessoes/cookies reais da mesma empresa.

### Estado por BK

| BK | RNF | Estado reauditorado | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF6-01` | `RNF08` | `OK` | `documentPerformance.js` mantem budget de `1000 ms`; `saleDocumentRoutes.js`, `purchaseDocumentRoutes.js` e `manualJournalRoutes.js` continuam a usar `measureDocumentInsertion` e `setDocumentPerformanceHeaders`; JSDoc corrigido confirmado por leitura direta e scan sem ocorrencias de `@param props`/`componente React`. |
| `BK-MF6-02` | `RNF09` | `PARCIAL` | `check-mf6-concurrency.mjs` aceita `OPSA_SESSION_COOKIES_JSON` e mede HTTP autenticado quando ha 25 cookies, mas `npm run test:mf6:concurrency` executou apenas `{ event: 'mf6_concurrency_local_smoke', users: 25, mode: 'local-contract' }`. |

### Estado final por finding

| Finding | Severidade | BK | Estado atual | Bloqueia MF? |
| --- | --- | --- | --- | --- |
| `MF6-AUD-20260625-BK01-F02` | `P3` | `BK-MF6-01` | `JA_CORRIGIDO` | Nao |
| `MF6-AUD-20260625-BK02-F01` | `P1` | `BK-MF6-02` | `BLOQUEADO` por falta de ambiente/evidence HTTP real | Nao bloqueia uso local; bloqueia `PASS` absoluto |

#### Reavaliacao de MF6-AUD-20260625-BK01-F02

- Severidade original: `P3`
- Resultado desta reauditoria: `JA_CORRIGIDO`
- Evidencia objetiva:
  - `real_dev/api/src/modules/sales/saleDocumentRoutes.js:35` a `:40` documenta router `/api/sales/documents`, dependencias `{ prisma }` e retorno `Express.Router`.
  - `real_dev/api/src/modules/purchases/purchaseDocumentRoutes.js:34` a `:39` documenta router `/api/purchases/documents`, dependencias `{ prisma }` e retorno `Express.Router`.
  - `real_dev/api/src/modules/accounting/manualJournalRoutes.js:36` a `:41` documenta rotas Express de lancamentos manuais, dependencias `{ prisma }` e retorno `Express.Router`.
  - `rg -n "@param props|componente React" ...` nao encontrou ocorrencias nos tres ficheiros corrigidos.
- Impacto residual: nenhum finding ativo. A correcao e documental e nao alterou comportamento runtime.

#### Reavaliacao de MF6-AUD-20260625-BK02-F01

- Severidade: `P1`
- Resultado desta reauditoria: `BLOQUEADO`
- Evidencia objetiva:
  - `real_dev/api/scripts/check-mf6-concurrency.mjs` define `REQUIRED_USERS = 25`.
  - O script le `OPSA_SESSION_COOKIES_JSON`, valida pelo menos 25 cookies e executa pedidos HTTP autenticados quando esse input existe.
  - `real_dev/api/tests/contracts/mf6-contracts.test.js` confirma que o smoke de concorrencia suporta `OPSA_SESSION_COOKIES_JSON`, `fetch`, `baselineP95` e `concurrentP95`.
  - A validacao executada `npm run test:mf6:concurrency` passou apenas em modo local: `{ event: 'mf6_concurrency_local_smoke', users: 25, mode: 'local-contract' }`.
- Expected: evidence de pelo menos 25 utilizadores/sessoes autenticadas por empresa, com `0` falhas e sem degradacao relevante em endpoints autenticados.
- Observed: existe suporte tecnico para essa prova, mas nao houve servidor local autenticado, DB de teste e 25 cookies reais nesta execucao.
- Impacto: requisito estrutural coberto; requisito operacional continua sem prova runtime completa.
- Proxima acao: executar o modo HTTP com `OPSA_API_BASE_URL` e `OPSA_SESSION_COOKIES_JSON` contendo 25 cookies validos da mesma empresa; se passar, reabrir este relatorio e marcar `BK-MF6-02` como `OK`.

### Coerencia MF anterior -> MF alvo -> MF seguinte

- `MF5 -> MF6`: `OK`. `npm run test:mf5:performance`, `npm run test:mf5:feedback`, `npm run typecheck` e `npm run build` passaram; a reauditoria nao alterou frontend.
- `BK-MF6-01 -> BK-MF6-02`: `OK_COM_RISCOS`. O contrato de budget e medicao individual continua disponivel para o smoke de concorrencia; a ressalva e apenas a falta de evidence HTTP autenticada real.
- `MF6 -> MF7`: `OK_COM_RISCOS`. Os contratos de performance, seguranca, ambiente e auditoria continuam verdes em `test:mf6`; nao foi auditada implementacao substantiva de MF7 nesta execucao.

### Pesquisa estatica desta reauditoria

- Scan dirigido de JSDoc antigo: sem ocorrencias de `@param props` ou `componente React` nos ficheiros corrigidos.
- Drift de produto/dominio nos BKs alvo e ficheiros alvo: sem ocorrencias de `FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala ou material de estudo.
- Scan de risco em ficheiros alvo: matches remanescentes sao contextuais e esperados (`companyId` em escopo multiempresa, env vars do smoke, password/token no cliente API de autenticacao); sem `localStorage`, `sessionStorage`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `payload: unknown`, `as any`, CORS permissivo ou operacoes destrutivas largas.
- `git check-ignore -v real_dev real_dev/api real_dev/web` confirmou que `real_dev/` continua ignorado por `.gitignore:4`, comportamento esperado para esta PAP.

### Comandos executados nesta reauditoria

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Tres relatorios MF6 ja estavam untracked antes desta reauditoria. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `real_dev/` esta gitignored por `.gitignore:4`, esperado. |
| `npm run syntax:check` em `real_dev/api` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm run prisma:validate` em `real_dev/api` | `PASS` | Schema Prisma valido. |
| `npm run test:mf6:documents` em `real_dev/api` | `PASS` | Contrato de performance de documentos OK. |
| `npm run test:mf6:concurrency` em `real_dev/api` | `PASS_COM_RESSALVAS` | Passou em `mode: local-contract`, sem HTTP autenticado real. |
| `npm run test:unit` em `real_dev/api` | `PASS` | 65 testes passaram. |
| `npm run test:contracts` em `real_dev/api` | `PASS` | 30 testes passaram, incluindo suporte ao modo HTTP autenticado do smoke de concorrencia. |
| `npm run test:mf6` em `real_dev/api` | `PASS_COM_RESSALVAS` | 10 smokes MF6 passaram; concorrencia continua local. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm run test:integration` em `real_dev/api` | `PASS_COM_RESSALVAS` | 2 testes saltados explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm run typecheck` em `real_dev/web` | `PASS` | TypeScript sem erros. |
| `npm run build` em `real_dev/web` | `PASS` | Vite build passou. |
| `npm run test:mf5:performance` em `real_dev/web` | `PASS` | Coerencia MF5 de performance preservada. |
| `npm run test:mf5:feedback` em `real_dev/web` | `PASS` | Coerencia MF5 de feedback preservada. |
| Scans estaticos com `rg` | `PASS_COM_OBSERVACOES` | Sem finding novo; matches contextuais descritos acima. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental global/legada fora do escopo. |

### Validacoes nao executadas

- Modo HTTP real do `check-mf6-concurrency.mjs`: nao executado porque faltam `OPSA_SESSION_COOKIES_JSON` com 25 cookies reais, servidor local autenticado e DB de teste preparada.
- `test:integration` sem skip: nao executado porque nao existe `TEST_DATABASE_URL`.
- Smoke browser autenticado: nao executado; a reauditoria foi backend/transversal e os gates web passaram.

### Ficheiros alterados nesta reauditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados codigo em `real_dev`, BKs, RF/RNF, backlog, matriz, sprints, `apps/` ou `mockup/`.

### Decisao de fecho

- `BK-MF6-01`: `OK`, sem findings ativos.
- `BK-MF6-02`: `PARCIAL`, com `P1` operacional ainda bloqueado por falta de prova HTTP real.
- Resultado MF6 desta reauditoria dirigida: `PASS_COM_RISCOS`.
- Commits: nao realizados.

## Execucao atual - auditoria dirigida BK-MF6-01 e BK-MF6-02 - 2026-06-25

### Metadados desta execucao

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- MF alvo: `MF6`
- BKs abrangidos nesta execucao: `BK-MF6-01`, `BK-MF6-02`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`
- Pastas de referencia nao editadas: `apps/`, `mockup/`
- Relatorio atualizado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- Permissao de commits: `nao`
- Alteracoes de codigo: nenhuma
- Alteracoes fora de `IMPLEMENTATION_ROOT`: sim, apenas este relatorio tecnico permitido por `OUTPUT_MODE=relatorio_e_resumo`

### Resultado geral desta execucao

Estado geral: `PASS_COM_RISCOS`

`BK-MF6-01` esta funcionalmente auditado como `OK`: a implementacao real mede a insercao de venda, compra e lancamento manual no backend, mantem guards de autenticacao, contexto multiempresa e permissoes, preserva os services de dominio e expõe headers tecnicos de duracao sem incluir payloads financeiros.

`BK-MF6-02` fica `PARCIAL`: existe script de concorrencia com suporte para modo HTTP autenticado quando `OPSA_SESSION_COOKIES_JSON` e fornecido, mas a validacao executada nesta auditoria ficou no fallback local `local-contract`. Assim, ainda nao ha evidence de 25 sessoes/cookies reais da mesma empresa contra servidor HTTP e base de dados de teste.

### Fontes consultadas nesta execucao

- Prompt anexada com `MODO=auditar_implementacao`, `MF_ALVO=MF6`, `BK_IDS=[BK-MF6-01, BK-MF6-02]`, `IMPLEMENTATION_ROOT=real_dev`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`.
- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-02-suportar-25-utilizadores-simultaneos-por-empresa-sem-degradacao-relevante.md`
- Leitura de `docs/planificacao/guias-bk/MF6/` para dependencia imediata e sequencia da MF.
- Leitura dirigida de `MF5` e `MF7` para coerencia vizinha.
- Relatorios existentes `IMPLEMENTACAO-REAL_DEV-MF6.md`, `AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md` e `CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`.
- `real_dev/api/package.json`, `real_dev/web/package.json`, `real_dev/api/prisma/schema.prisma` e ficheiros de implementacao listados abaixo.

### Inventario e estado por BK

| BK | RNF | Prioridade | Estado auditado | Evidencia objetiva |
| --- | --- | --- | --- | --- |
| `BK-MF6-01` | `RNF08` | `P0` | `OK` | `real_dev/api/src/modules/performance/documentPerformance.js:9` define budget de `1000 ms`; `saleDocumentRoutes.js:65`, `purchaseDocumentRoutes.js:67` e `manualJournalRoutes.js:55` medem as tres insercoes criticas com `measureDocumentInsertion`; `test:mf6:documents`, `test:unit` e `test:mf6` passaram. |
| `BK-MF6-02` | `RNF09` | `P1` | `PARCIAL` | `real_dev/api/scripts/check-mf6-concurrency.mjs:12` exige 25 utilizadores e `:181` a `:185` escolhe HTTP autenticado quando ha cookies; a execucao atual devolveu `mode: local-contract`, sem prova HTTP real com 25 sessoes. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> validacoes

| BK | Fonte canonica | Ficheiros auditados | Validacoes executadas |
| --- | --- | --- | --- |
| `BK-MF6-01` | `RNF08`; matriz/backlog apontam para performance de insercao <= 1 segundo | `documentPerformance.js`, `saleDocumentRoutes.js`, `purchaseDocumentRoutes.js`, `manualJournalRoutes.js`, `saleDocumentService.js`, `purchaseDocumentService.js`, `manualJournalService.js`, `companyContext.js` | `syntax:check`, `prisma:validate`, `test:mf6:documents`, `test:unit`, `test:contracts`, `test:mf6` |
| `BK-MF6-02` | `RNF09`; matriz/backlog apontam para >= 25 utilizadores simultaneos por empresa | `check-mf6-concurrency.mjs`, `server.js`, `sessionCookie.js`, `companyContext.js`, endpoints autenticados de leitura | `syntax:check`, `test:mf6:concurrency`, `test:contracts`, `test:mf6`, scan estatico de risco |

### Contratos consumidos e entregues

- Contratos consumidos de `MF0`: autenticacao por sessao, cookie `sid`, roles/permissoes e contexto de empresa ativa resolvido no backend.
- Contratos consumidos de `MF1`: criacao de documentos de venda e compra, guards de escrita, auditoria e regras de periodo fiscal.
- Contratos consumidos de `MF2`: lancamentos manuais e validacao de periodo fiscal aberto.
- Contratos consumidos de `MF5`: disciplina de feedback/performance e smokes frontend; `test:mf5:performance` e `test:mf5:feedback` passaram.
- Contratos entregues por `BK-MF6-01`: `DOCUMENT_INSERTION_BUDGET_MS`, `measureDocumentInsertion`, `setDocumentPerformanceHeaders` e headers `X-OPSA-Document-*`.
- Contratos entregues por `BK-MF6-02`: smoke de concorrencia com 25 operacoes locais e modo HTTP autenticado parametrizado por `OPSA_SESSION_COOKIES_JSON`, `OPSA_API_BASE_URL` e `OPSA_CONCURRENCY_PATHS`.

### Coerencia MF anterior -> MF alvo -> MF seguinte

- `MF5 -> MF6`: `OK`. O budget e feedback da MF5 continuam verdes (`test:mf5:performance`, `test:mf5:feedback`, `typecheck`, `build`) e a MF6 acrescenta orcamento backend sem quebrar frontend.
- `BK-MF6-01 -> BK-MF6-02`: `OK_COM_RISCOS`. O helper de performance e usado pela carga local do BK-MF6-02; falta apenas evidence HTTP autenticada real.
- `MF6 -> MF7`: `OK_COM_RISCOS`. Os contratos de performance/seguranca continuam disponiveis para MF7, mas a auditoria atual nao validou implementacao substantiva de MF7.

### Findings desta execucao

| Finding | Severidade | BK | Estado | Bloqueia MF? |
| --- | --- | --- | --- | --- |
| `MF6-AUD-20260625-BK02-F01` | `P1` | `BK-MF6-02` | `BLOQUEADO` por falta de ambiente/evidence HTTP real | Nao bloqueia uso local; bloqueia promocao para `PASS` absoluto |
| `MF6-AUD-20260625-BK01-F02` | `P3` | `BK-MF6-01` | `AUDITADO_COM_FINDING_NAO_BLOQUEANTE` | Nao |

#### MF6-AUD-20260625-BK02-F01

- Severidade: `P1`
- BK/RNF: `BK-MF6-02` / `RNF09`
- Evidencia objetiva:
  - `real_dev/api/scripts/check-mf6-concurrency.mjs:21` a `:40` le cookies reais quando `OPSA_SESSION_COOKIES_JSON` existe.
  - `real_dev/api/scripts/check-mf6-concurrency.mjs:102` a `:149` mede endpoints HTTP autenticados.
  - A validacao executada `npm run test:mf6:concurrency` terminou com `{ event: 'mf6_concurrency_local_smoke', users: 25, mode: 'local-contract' }`.
- Expected: evidence de pelo menos 25 utilizadores/sessoes autenticadas por empresa, sem degradacao relevante.
- Observed: apenas fallback local deterministico com 25 operacoes, sem servidor HTTP real nem 25 cookies de sessao.
- Impacto: a implementacao estrutural existe, mas o requisito operacional de carga autenticada continua sem prova runtime completa.
- Correcao recomendada: executar o modo HTTP do script com `OPSA_API_BASE_URL` e `OPSA_SESSION_COOKIES_JSON` contendo 25 cookies validos da mesma empresa; se falhar, corrigir a causa no backend sem remover autenticacao, permissoes ou contexto multiempresa.

#### MF6-AUD-20260625-BK01-F02

- Severidade: `P3`
- BK/RNF: `BK-MF6-01` / qualidade de documentacao tecnica da implementacao
- Evidencia objetiva:
  - `real_dev/api/src/modules/sales/saleDocumentRoutes.js:39` documenta `@param props` e menciona componente React, mas `buildSaleDocumentRoutes` recebe `{ prisma }`.
  - `real_dev/api/src/modules/purchases/purchaseDocumentRoutes.js:38` repete `@param props` e mencao a componente React no backend.
  - `real_dev/api/src/modules/accounting/manualJournalRoutes.js:39` repete o mesmo padrao.
- Expected: JSDoc de rotas backend deve descrever parametros reais e contexto Express/Prisma, especialmente em ficheiros tocados por BK de performance.
- Observed: os comentarios nao afetam runtime, mas estao desalinhados com a assinatura real.
- Impacto: baixo; pode confundir alunos durante manutencao e auditorias futuras.
- Correcao recomendada: em modo `corrigir_auditoria`, substituir esses `@param props` por JSDoc correto sobre dependencias `{ prisma }` e router Express, sem alterar comportamento.

### Pesquisa estatica obrigatoria

- Scan global em `real_dev/api`, `real_dev/web` e scripts: sem finding novo. Matches de `companyId`, `password`, `token`, `secret`, `.env`, `mock` e `deleteMany` foram contextuais em testes, validadores, sanitizacao, placeholders locais ou filtros por empresa.
- Scan dirigido aos ficheiros de `BK-MF6-01/02`: sem `localStorage`, `sessionStorage`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `payload: unknown`, `as any`, CORS permissivo ou operacoes destrutivas largas acionaveis.
- Drift de dominio: sem ocorrencias de `FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala ou material de estudo nos ficheiros alvo e BKs alvo.

### Comandos executados nesta execucao

| Comando | Resultado | Nota |
| --- | --- | --- |
| `git status --short` | `PASS_COM_OBSERVACOES` | Ja existiam tres relatorios MF6 untracked antes desta auditoria. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `.gitignore:4` ignora `real_dev/`, esperado. |
| `npm run syntax:check` em `real_dev/api` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm run prisma:validate` em `real_dev/api` | `PASS` | Schema Prisma valido. |
| `npm run test:mf6:documents` em `real_dev/api` | `PASS` | Contrato de performance de documentos OK. |
| `npm run test:mf6:concurrency` em `real_dev/api` | `PASS_COM_RESSALVAS` | Passou em `mode: local-contract`, sem HTTP autenticado. |
| `npm run test:unit` em `real_dev/api` | `PASS` | 65 testes passaram. |
| `npm run test:contracts` em `real_dev/api` | `PASS` | 30 testes passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm run test:integration` em `real_dev/api` | `PASS_COM_RESSALVAS` | 2 testes saltados explicitamente por ausencia de `TEST_DATABASE_URL`. |
| `npm run test:mf6` em `real_dev/api` | `PASS` | 10 smokes MF6 passaram; concorrencia continua local. |
| `npm run typecheck` em `real_dev/web` | `PASS` | TypeScript sem erros. |
| `npm run build` em `real_dev/web` | `PASS` | Vite build passou. |
| `npm run test:mf5:performance` em `real_dev/web` | `PASS` | Coerencia MF5 de budget preservada. |
| `npm run test:mf5:feedback` em `real_dev/web` | `PASS` | Coerencia de feedback preservada. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental global/legada fora do escopo. |
| `git diff --check` | `PASS` | Sem whitespace errors em ficheiros tracked. |

### Validacoes nao executadas

- Carga HTTP real com 25 sessoes autenticadas por empresa: nao executada por falta de servidor local autenticado, cookies de 25 sessoes e base de teste preparada.
- Testes de integracao com PostgreSQL efemero: nao executados por falta de `TEST_DATABASE_URL`; foi usado skip explicito.
- Smoke browser autenticado: nao executado; a alteracao auditada e backend/transversal e os gates web `typecheck`, `build`, `test:mf5:performance` e `test:mf5:feedback` passaram.

### Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados codigo em `real_dev`, BKs, RF/RNF, backlog, matriz, sprints, `apps/` ou `mockup/`.

### Proxima acao recomendada

Executar uma correcao pequena para o finding `P3` de JSDoc se for desejado, e repetir `auditar_implementacao` de `BK-MF6-02` com `OPSA_SESSION_COOKIES_JSON` contendo 25 cookies reais da mesma empresa e `TEST_DATABASE_URL` configurado. Se essa prova passar, `BK-MF6-02` pode passar de `PARCIAL` para `OK` e a MF6 pode aproximar-se de `PASS` sem ressalva operacional.

## Metadados

- Projeto: `OPSA`
- Modo executado: `auditar_implementacao`
- Data da auditoria: `2026-06-25`
- MF alvo: `MF6`
- BKs abrangidos: `BK-MF6-01` a `BK-MF6-10`
- Implementation root auditado: `real_dev`
- Backend auditado: `real_dev/api`
- Frontend auditado: `real_dev/web`
- Relatorio atualizado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- Permissao de commits: `nao`
- Alteracoes de codigo: nenhuma

## Resultado geral

Estado geral: `PASS_COM_RISCOS`

A implementacao da MF6 esta presente em `real_dev/api` e os gates locais passaram: performance de documentos, concorrencia local, reconciliacao, FIFO, HTTPS/HSTS, bcrypt, cookies, hardening de origem, ambiente e auditoria sensivel.

O risco remanescente e operacional, nao estrutural: a auditoria validou smokes, unidades, contratos e build local, mas nao executou carga HTTP real com 25 sessoes autenticadas nem integracao persistente com PostgreSQL efemera. Por isso a MF6 fica auditada como implementada com riscos controlados, nao como `PASS` absoluto.

## Escopo auditado

- Guias alvo: todos os 10 ficheiros em `docs/planificacao/guias-bk/MF6/`.
- Contratos canonicos: `RNF08` a `RNF17` em `docs/RNF.md`, matriz/backlog em `docs/planificacao/backlogs/`.
- MF anterior: `MF5`, especialmente budget visual e smokes frontend.
- MF seguinte: `MF7`, apenas como consumidor futuro de seguranca, ambiente e auditoria.
- Implementacao real: `real_dev/api`, `real_dev/web`, `real_dev/api/prisma/schema.prisma`, scripts e testes.
- Pastas tratadas como referencia, nao destino: `apps/` e `mockup/`.

## Mapa BK -> estado

| BK | RNF | Estado | Evidencia principal |
| --- | --- | --- | --- |
| `BK-MF6-01` | `RNF08` | `OK` | `documentPerformance.js` mede <= `1000 ms`; rotas de venda, compra e lancamento manual aplicam `measureDocumentInsertion` e headers `X-OPSA-Document-*`; `test:mf6:documents` passou. |
| `BK-MF6-02` | `RNF09` | `PARCIAL` | `check-mf6-concurrency.mjs` executa 25 operacoes concorrentes locais dentro do budget, mas nao substitui prova HTTP com 25 sessoes/cookies reais por empresa. |
| `BK-MF6-03` | `RNF10` | `OK` | `reconciliationPerformance.js`, `suggestReconciliations`, rota `POST /api/treasury/reconciliations/suggestions`, limite de 250 candidatos, resposta parcial e header `X-OPSA-Reconciliation-Duration-Ms`; smoke passou. |
| `BK-MF6-04` | `RNF11` | `OK` | `fifoPerformance.js` mede budget FIFO, `consumeFifoLayers` falha cedo sem stock suficiente e preserva preview sem escrita; smoke passou. |
| `BK-MF6-05` | `RNF12` | `OK` | `transportSecurity.js`, `trust proxy`, bloqueio HTTP em producao e HSTS; `test:mf6:https` passou. A versao TLS continua responsabilidade do terminador HTTPS/deploy. |
| `BK-MF6-06` | `RNF13` | `OK` | `password.js` usa bcrypt com `BCRYPT_ROUNDS = 12`; smoke valida hash bcrypt, nao exposicao da password e verificacao negativa. |
| `BK-MF6-07` | `RNF14` | `OK` | `sessionCookie.js` produz cookie `sid` com `HttpOnly`, `Secure` em producao, `SameSite=Lax`, `path=/` e TTL; smoke passou. |
| `BK-MF6-08` | `RNF15` | `OK` | `requestHardening.js` bloqueia origem nao confiavel em metodos mutaveis em producao e fornece escape HTML; Prisma/validators/rate limit existentes continuam a cobrir injection/brute force; smoke passou. |
| `BK-MF6-09` | `RNF16` | `OK` | `config/env.js` centraliza ambiente, exige `APP_BASE_URL` HTTPS e `DATABASE_URL` em producao; `.env.example` nao contem segredo real; scanner passou com matches contextualizados. |
| `BK-MF6-10` | `RNF17` | `OK` | `recordSensitiveAudit` tem allowlist de acoes, bloqueia detalhes sensiveis e e usado em atualizacao de permissoes, fecho fiscal e emissao definitiva de venda; smoke passou. |

## Rastreabilidade BK -> ficheiros -> testes

| BK | Ficheiros auditados | Gates executados |
| --- | --- | --- |
| `BK-MF6-01` | `src/modules/performance/documentPerformance.js`, `saleDocumentRoutes.js`, `purchaseDocumentRoutes.js`, `manualJournalRoutes.js` | `test:mf6:documents`, `test:unit` |
| `BK-MF6-02` | `scripts/check-mf6-concurrency.mjs` | `test:mf6:concurrency` |
| `BK-MF6-03` | `src/modules/treasury/reconciliationPerformance.js`, `statementImportService.js`, `statementRoutes.js` | `test:mf6:reconciliation`, `test:unit`, `test:contracts` |
| `BK-MF6-04` | `src/modules/inventory/fifoPerformance.js`, `fifoCostService.js` | `test:mf6:fifo`, `test:unit` |
| `BK-MF6-05` | `src/modules/security/transportSecurity.js`, `server.js` | `test:mf6:https`, `test:unit`, `test:contracts` |
| `BK-MF6-06` | `src/modules/auth/password.js` | `test:mf6:bcrypt`, `test:unit` |
| `BK-MF6-07` | `src/modules/auth/sessionCookie.js` | `test:mf6:session-cookie`, `test:unit` |
| `BK-MF6-08` | `src/modules/security/requestHardening.js`, `server.js` | `test:mf6:hardening`, `test:unit`, `test:contracts` |
| `BK-MF6-09` | `src/config/env.js`, `.env.example`, `server.js` | `test:mf6:env`, scan de risco |
| `BK-MF6-10` | `src/modules/audit/auditLogService.js`, `companyUserService.js`, `fiscalPeriodService.js`, `saleDocumentService.js` | `test:mf6:audit`, `test:unit` |

## Findings por severidade

| Severidade | Total original | Estado atual |
| --- | ---: | --- |
| `P0` | 3 | Corrigidos em gates locais |
| `P1` | 4 | 3 corrigidos; 1 parcial por falta de carga HTTP real |
| `P2` | 3 | Corrigidos em gates locais |
| `P3` | 0 | Sem findings acionaveis |

| Finding | Severidade | BK | Estado auditado |
| --- | --- | --- | --- |
| `MF6-IMP-AUD-F01` | `P0` | `BK-MF6-01` | `CORRIGIDO` |
| `MF6-IMP-AUD-F02` | `P1` | `BK-MF6-02` | `CORRIGIDO_COM_RISCO_OPERACIONAL` |
| `MF6-IMP-AUD-F03` | `P1` | `BK-MF6-03` | `CORRIGIDO` |
| `MF6-IMP-AUD-F04` | `P1` | `BK-MF6-04` | `CORRIGIDO` |
| `MF6-IMP-AUD-F05` | `P0` | `BK-MF6-05` | `CORRIGIDO` |
| `MF6-IMP-AUD-F06` | `P2` | `BK-MF6-06` | `CORRIGIDO` |
| `MF6-IMP-AUD-F07` | `P2` | `BK-MF6-07` | `CORRIGIDO` |
| `MF6-IMP-AUD-F08` | `P0` | `BK-MF6-08` | `CORRIGIDO` |
| `MF6-IMP-AUD-F09` | `P2` | `BK-MF6-09` | `CORRIGIDO` |
| `MF6-IMP-AUD-F10` | `P1` | `BK-MF6-10` | `CORRIGIDO` |

## Coerencia entre MFs

### MF5 -> MF6

`MF5` entrega disciplina de UI, feedback e budget frontend. A MF6 aplica a mesma logica ao backend: budgets de documentos, reconciliacao e FIFO, alem de seguranca transversal. `typecheck`, `build` e smokes MF1/MF2/MF3/MF5 passaram, sem sinal de regressao visual.

Classificacao: `OK`.

### Dentro da MF6

A sequencia ficou coerente: performance individual -> concorrencia local -> reconciliacao -> FIFO -> transporte seguro -> bcrypt -> cookies -> hardening -> ambiente -> auditoria sensivel.

Classificacao: `OK_COM_RISCOS`, porque a cadeia esta implementada e testada localmente, mas ainda sem prova HTTP/DB real.

### MF6 -> MF7

MF7 pode consumir os contratos de configuracao, transporte seguro, cookies, hardening e auditoria sensivel. A auditoria nao encontrou implementacao substantiva de MF7 dentro deste escopo.

Classificacao: `OK_COM_RISCOS`.

## Pesquisa estatica obrigatoria

- Segredos/logs sensiveis: sem exposicao acionavel encontrada. Os matches de `secret`/`token` surgem em sanitizacao, testes negativos, helpers de geracao de tokens ou comentarios defensivos.
- `localStorage`/`sessionStorage`: sem ocorrencias acionaveis em `real_dev/web`.
- `dangerouslySetInnerHTML`, `eval`, `new Function`: sem ocorrencias acionaveis.
- Drift de outros produtos: pesquisa por `FaithFlix`, `StudyFlow`, `Orelle`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala e material de estudo nao encontrou ocorrencias.
- `.env.example`: contem placeholders locais, incluindo `DATABASE_URL=<URL_AUTHENTICATED_REDACTED>`; nao contem segredo real.

## Comandos executados

| Comando | Resultado | Notas |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_OBSERVACOES` | Apenas relatórios MF6 untracked; `real_dev/` esta gitignored. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `.gitignore:4` ignora `real_dev/`, esperado neste projeto. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` | `node --check` em `src`, `tests` e `scripts`. |
| `DATABASE_URL=... npm --prefix real_dev/api run prisma:validate` | `PASS` | Schema Prisma valido. |
| `npm --prefix real_dev/api run test:unit` | `PASS` | 65 testes passaram. |
| `npm --prefix real_dev/api run test:contracts` | `PASS` | 29 testes passaram. |
| `npm --prefix real_dev/api run test:mf6` | `PASS` | 10 smokes MF6 passaram. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS` | 2 testes saltados explicitamente por ausencia de DB efemera. |
| `npm --prefix real_dev/web run typecheck` | `PASS` | TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS` | Vite build passou. |
| `npm --prefix real_dev/web run test:mf1` | `PASS` | Smoke MF1 passou. |
| `npm --prefix real_dev/web run test:mf2` | `PASS` | Smoke MF2 passou. |
| `npm --prefix real_dev/web run test:mf3` | `PASS` | Smoke MF3 passou. |
| `npm --prefix real_dev/web run test:mf5:feedback` | `PASS` | Smoke feedback passou. |
| `npm --prefix real_dev/web run test:mf5:responsive` | `PASS` | Smoke responsive passou. |
| `npm --prefix real_dev/web run test:mf5:a11y` | `PASS` | Smoke acessibilidade passou. |
| `npm --prefix real_dev/web run test:mf5:forms` | `PASS` | Smoke formularios passou. |
| `npm --prefix real_dev/web run test:mf5:errors` | `PASS` | Smoke mensagens passou. |
| `npm --prefix real_dev/web run test:mf5:performance` | `PASS` | Budget frontend MF5 passou. |
| Pesquisas estaticas de risco/drift com `rg` | `PASS_COM_OBSERVACOES` | Matches contextualizados; sem finding acionavel novo. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_OBSERVACOES` | `overall_pass=true`; `advisory_pass=false` por divida documental legada em guias/planificacao. |
| `git diff --check` | `PASS` | Sem whitespace errors em ficheiros tracked. |

## Validacoes nao executadas

- Carga HTTP real com 25 sessoes autenticadas por empresa: nao executada. O smoke `test:mf6:concurrency` valida 25 operacoes concorrentes locais, mas nao prova cookies/sessoes reais.
- Testes de integracao com PostgreSQL efemero: nao executados por ausencia de `TEST_DATABASE_URL`; foi usado `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- Smoke browser autenticado: nao executado. A MF6 e maioritariamente backend/transversal; frontend foi validado por `typecheck`, `build` e smokes existentes.
- Verificacao TLS 1.2+ em terminador real: nao executada; o codigo valida canal HTTPS observado e HSTS, mas a versao TLS depende do deploy/proxy.

## Ficheiros auditados principais

- `real_dev/api/package.json`
- `real_dev/api/.env.example`
- `real_dev/api/src/server.js`
- `real_dev/api/src/config/env.js`
- `real_dev/api/src/modules/performance/documentPerformance.js`
- `real_dev/api/src/modules/treasury/reconciliationPerformance.js`
- `real_dev/api/src/modules/treasury/statementImportService.js`
- `real_dev/api/src/modules/treasury/statementRoutes.js`
- `real_dev/api/src/modules/inventory/fifoPerformance.js`
- `real_dev/api/src/modules/inventory/fifoCostService.js`
- `real_dev/api/src/modules/security/transportSecurity.js`
- `real_dev/api/src/modules/security/requestHardening.js`
- `real_dev/api/src/modules/auth/password.js`
- `real_dev/api/src/modules/auth/sessionCookie.js`
- `real_dev/api/src/modules/audit/auditLogService.js`
- `real_dev/api/tests/unit/mf6-services.test.js`
- `real_dev/api/tests/contracts/mf6-contracts.test.js`
- `real_dev/api/scripts/check-mf6-*.mjs`
- `real_dev/web/package.json`

## Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Nao foram alterados BKs, RF/RNF, backlog, matriz, codigo em `real_dev`, `apps/` ou `mockup/`.

## Riscos e proxima acao

- `RISCO_OPERACIONAL`: `BK-MF6-02` ainda precisa de evidence com servidor real, 25 sessoes autenticadas e cookies por empresa.
- `RISCO_OPERACIONAL`: integracao persistente continua dependente de `TEST_DATABASE_URL`.
- `RISCO_DEPLOY`: RNF12 so fica totalmente provado num ambiente com terminador HTTPS/TLS real.
- `FORA_DE_SCOPE`: corrigir `advisory_pass=false` de planificacao/qualidade documental, porque `PERMITIR_ALTERAR_DOCS=nao` permite apenas este relatorio.

Recomendacao: repetir `auditar_implementacao` quando houver DB efemera e servidor HTTP local autenticado. Se esses dois pontos passarem, a MF6 pode ser promovida de `PASS_COM_RISCOS` para `PASS`.
