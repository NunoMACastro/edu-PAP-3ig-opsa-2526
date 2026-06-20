# AUDITORIA-IMPLEMENTACAO-real_dev-MF4

## Header

- `doc_id`: `AUDITORIA-IMPLEMENTACAO-real_dev-MF4`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF4.md`
- `modo`: `auditar_implementacao`
- `project`: `OPSA`
- `mf_alvo`: `MF4`
- `bk_ids`: `BK-MF4-01` a `BK-MF4-10`
- `implementation_root`: `real_dev`
- `data`: `2026-06-18`
- `resultado_geral`: `PASS_COM_RISCOS`

## Resultado geral

A implementacao real da MF4 foi auditada em `real_dev/api` e `real_dev/web`. O codigo atual cobre os 10 BKs da MF4 com modelos Prisma, migration, services, routers protegidos, permissoes backend, cliente frontend, paginas React e testes unitarios/contratuais.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` abertos nesta auditoria. Os tres findings que constavam na auditoria anterior foram revalidados no codigo atual e estao `JA_CORRIGIDO`: a IA de stock consome alertas calculados da MF2, os smart alerts materializam rutura real de stock e os validadores de lembretes/tarefas rejeitam datas impossiveis sem normalizacao silenciosa.

O estado global fica `PASS_COM_RISCOS` por dois motivos objetivos: a integracao persistida real nao correu sem `TEST_DATABASE_URL`, e matriz/backlog continuam a marcar BKs MF4 como `TODO`, apesar de haver implementacao e validacoes locais em `real_dev`.

## Escopo auditado

| Area | Escopo |
| --- | --- |
| Documentos canonicos | `README.md`, `docs/RF.md`, `docs/RNF.md`, planificacao, matriz, backlog, contrato de campos, MF views, sprints e guias MF4 |
| Raiz real | `real_dev/api`, `real_dev/web`, `real_dev/api/prisma/schema.prisma` |
| Backend/API | `ai`, `reminders`, `tasks`, `notifications`, `audit`, `integrations`, `server.js`, permissoes e schema Prisma |
| Frontend | `real_dev/web/src/lib/apiClient.ts`, `real_dev/web/src/lib/mf4Api.ts`, `real_dev/web/src/pages/mf4Pages.tsx`, `real_dev/web/src/App.tsx` |
| Testes | `real_dev/api/tests/unit/mf4-services.test.js`, `real_dev/api/tests/contracts/mf4-contracts.test.js`, suites globais aplicaveis |
| Coerencia vizinha | `MF3 -> MF4 -> MF5`, com profundidade `vizinhas` |

## Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF4-01` | `RF39` | `OK` | `generateAiInsights` usa relatorios/KPIs/MF1 e `listStockAlerts` da MF2; stock nasce de `LOW_STOCK`, `STOPPED_ITEM` e `HIGH_STOCK` calculados. |
| `BK-MF4-02` | `RF40`, `RNF32` | `OK` | Sugestoes sao materializadas em `AiActionSuggestion` a partir de insights abertos; nao existe execucao automatica de preco, compra, stock ou contabilidade. |
| `BK-MF4-03` | `RF41` | `OK` | Perguntas passam por intencoes read-only e bloqueiam verbos mutaveis antes de persistir resposta com fontes. |
| `BK-MF4-04` | `RF42`, `RNF34` | `OK` | Alertas usam `CashflowForecastRun` e alertas reais de stock MF2; rutura e calculada por `StockBalance.quantity < StockAlertSetting.minQuantity`. |
| `BK-MF4-05` | `RF43`, `RNF31` | `OK` | Explicacao/fonte por insight e endpoint `/api/ai/insights/:id/explanation`, filtrado por empresa ativa. |
| `BK-MF4-06` | `RF44` | `OK` | Lembretes CRUD essencial, validacao backend de tipo/data e auditoria em criacao/alteracao de estado. |
| `BK-MF4-07` | `RF45` | `OK` | Tarefas com estado/prazo e validacao de responsavel por membership ativa da empresa. |
| `BK-MF4-08` | `RF46` | `OK` | Notificacoes in-app sincronizadas a partir de lembretes e alertas, com ownership por empresa/utilizador. |
| `BK-MF4-09` | `RF47`, `RNF17` | `OK` | Consulta de auditoria restringida a `ADMIN`/`AUDITOR`; detalhes sensiveis sao redigidos. |
| `BK-MF4-10` | `RF48`, `RNF23` | `OK` | `IntegrationLog` sanitizado e integrado em importacoes, extratos bancarios e SAF-T MVP. |

## Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF4-01` | `RF39` | `real_dev/api/src/modules/ai/aiService.js`, `stockAlertService.js`, `mf4Api.ts`, `mf4Pages.tsx` | `mf4-services.test.js`, `test:unit`, `test:contracts` |
| `BK-MF4-02` | `RF40`, `RNF32` | `aiService.js`, `aiRoutes.js`, `mf4Api.ts`, `mf4Pages.tsx` | `mf4-services.test.js`, `mf4-contracts.test.js` |
| `BK-MF4-03` | `RF41` | `aiValidators.js`, `aiService.js`, `aiRoutes.js`, `mf4Pages.tsx` | `mf4-services.test.js` |
| `BK-MF4-04` | `RF42`, `RNF34` | `aiService.js`, `cashflowForecastService.js`, `stockAlertService.js`, `mf4Pages.tsx` | `mf4-services.test.js` |
| `BK-MF4-05` | `RF43`, `RNF31` | `aiService.js`, `aiRoutes.js`, `schema.prisma` | `mf4-contracts.test.js`, `test:unit` |
| `BK-MF4-06` | `RF44` | `reminderValidators.js`, `reminderService.js`, `reminderRoutes.js`, `mf4Pages.tsx` | `mf4-services.test.js` |
| `BK-MF4-07` | `RF45` | `taskValidators.js`, `taskService.js`, `taskRoutes.js`, `mf4Pages.tsx` | `mf4-services.test.js` |
| `BK-MF4-08` | `RF46` | `notificationService.js`, `notificationRoutes.js`, `mf4Pages.tsx` | `mf4-contracts.test.js` |
| `BK-MF4-09` | `RF47`, `RNF17` | `auditLogService.js`, `auditLogRoutes.js`, `schema.prisma` | `mf4-contracts.test.js`, pesquisa estatica |
| `BK-MF4-10` | `RF48`, `RNF23` | `integrationLogService.js`, `integrationLogRoutes.js`, `businessImportService.js`, `statementImportService.js`, `saftService.js` | `mf4-services.test.js`, `mf3-services.test.js`, pesquisa estatica |

## Mapa de integracao da MF

- Prisma inclui `AiInsight`, `AiActionSuggestion`, `AiQuestionRun`, `SmartAlert`, `Reminder`, `OperationalTask`, `InAppNotification` e `IntegrationLog`, todos ligados a `companyId` e com indices/unique constraints relevantes.
- Backend monta `/api/ai`, `/api/reminders`, `/api/tasks`, `/api/notifications`, `/api/audit` e `/api/integrations` em `real_dev/api/src/server.js`.
- Endpoints MF4 usam `requireAuth`, `requireCompanyContext`, `requirePermission` e, quando aplicavel, `requireRole`.
- Frontend usa `createApiClient()` com `credentials: "include"` e cliente MF4 tipado em `real_dev/web/src/lib/mf4Api.ts`.
- Paginas MF4 estao registadas na navegacao principal em `real_dev/web/src/App.tsx` e incluem estados de erro/vazio/carregamento proporcionais ao scaffold atual.

## Contratos consumidos

- MF0: sessao por cookie HttpOnly, empresa ativa por contexto, roles/permissoes, `CompanyMembership` e `AuditLog`.
- MF2: `StockAlertSetting`, `StockBalance`, `StockMovement` e `listStockAlerts` para riscos de stock, rutura e artigos parados.
- MF3: `OperationalReportRun`, `ExecutiveKpiRun`, `CashflowForecastRun`, `BusinessImportRun`, `SaftExportRun`, `BankStatementImport` e fontes explicaveis para IA.

## Contratos entregues

- Endpoints e modelos para IA assistiva explicavel, sugestoes, perguntas read-only e alertas.
- Lembretes, tarefas e notificacoes in-app por empresa/utilizador.
- Consulta protegida de auditoria e logs de integracao.
- Cliente frontend tipado e paginas MF4 navegaveis para MF5 poder evoluir UX, acessibilidade, mensagens e performance.

## Coerencia entre MFs

- `MF3 -> MF4`: coerente. A MF4 consome relatorios, KPIs, forecasts, importacoes, SAF-T e extratos da MF3 sem duplicar reporting nem prometer integracoes externas.
- `MF2 -> MF4`: coerente no ponto critico de stock. A MF4 reutiliza `listStockAlerts`, que materializa `LOW_STOCK`, `HIGH_STOCK` e `STOPPED_ITEM` a partir de `StockAlertSetting`, `StockBalance` e `StockMovement`.
- `MF4 -> MF5`: coerente como handoff. A MF4 entrega paginas e DTOs observaveis; a MF5 pode auditar/melhorar UX, responsividade, acessibilidade, mensagens e tempos de carregamento sem reescrever contratos funcionais.
- `DRIFT documental`: `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md` continuam com estado `TODO` para BKs MF4, apesar de haver implementacao real e validacoes locais. Nao e finding de codigo neste modo; deve ser tratado como drift documental quando a prompt permitir alterar docs canonicos.

## Findings por severidade

| Severidade | Abertos | Observacao |
| --- | ---: | --- |
| `P0` | 0 | Nenhuma falha critica de funcionamento, seguranca ou exposicao de dados confirmada. |
| `P1` | 0 | Findings anteriores de stock foram revalidados como `JA_CORRIGIDO`. |
| `P2` | 0 | Finding anterior de normalizacao de datas foi revalidado como `JA_CORRIGIDO`. |
| `P3` | 0 | Sem melhoria pequena acionavel dentro do scope da auditoria atual. |

### FINDING-ANTERIOR-P1-MF4-01-STOCK-INSIGHT-NOT-STOPPED

- Severidade anterior: `P1`
- BK/RF/RNF: `BK-MF4-01`, `RF39`
- Estado atual: `JA_CORRIGIDO`
- Evidencia atual: `real_dev/api/src/modules/ai/aiService.js` importa `listStockAlerts`, gera candidatos de stock em `stockAlertToInsight` e usa `sourceType: "StockAlertSetting"` para `LOW_STOCK_RISK`, `STOPPED_ITEM` e `STOCK_EXCESS_RISK`.
- Validacao: `npm --prefix real_dev/api run test:unit` inclui `BK-MF4-01: insights de stock usam alertas MF2 calculados`.

### FINDING-ANTERIOR-P1-MF4-04-STOCK-RUPTURE-NOT-CALCULATED

- Severidade anterior: `P1`
- BK/RF/RNF: `BK-MF4-04`, `RF42`, dependencia `BK-MF2-05`
- Estado atual: `JA_CORRIGIDO`
- Evidencia atual: `generateSmartAlerts` usa `listStockAlerts`; `stockAlertToSmartAlert` so cria `STOCK_RUPTURE_RISK` para `LOW_STOCK`.
- Validacao: `npm --prefix real_dev/api run test:unit` inclui `BK-MF4-04: alertas inteligentes materializam risco de rutura calculado`.

### FINDING-ANTERIOR-P2-MF4-DATE-NORMALIZATION

- Severidade anterior: `P2`
- BK/RF/RNF: `BK-MF4-06`, `BK-MF4-07`
- Estado atual: `JA_CORRIGIDO`
- Evidencia atual: `reminderValidators.js` e `taskValidators.js` exigem `YYYY-MM-DD` e confirmam `date.toISOString().slice(0, 10) === value`.
- Validacao: `npm --prefix real_dev/api run test:unit` inclui `BK-MF4-06/BK-MF4-07: datas inexistentes sao rejeitadas sem normalizacao`.

## Pesquisa estatica obrigatoria

- Segredos/chaves/logs sensiveis: sem ocorrencias criticas em codigo produtivo MF4; ocorrencias de `token`/`secret` estao em testes negativos, adapters de seguranca, redacao ou comentarios de protecao.
- `companyId` no body/query da MF4: nao encontrado como input de ownership; MF4 usa `req.companyId` e contexto interno.
- `localStorage`/`sessionStorage`: sem ocorrencias em `real_dev/web/src`.
- `dangerouslySetInnerHTML`, `eval`, `new Function`: sem ocorrencias.
- `deleteMany({})`, `delete({})`, `updateMany({})`: sem ocorrencias nos alvos auditados.
- Drift de dominio (`FaithFlix`, `StudyFlow`, cosmetica, biometria, streaming, pool solidaria, turma, professor, sala, material de estudo): sem ocorrencias em `real_dev/api/src`, `real_dev/api/tests` e `real_dev/web/src`.
- Vestigio tecnico analisado: `STOCK_VALUE_LOCKED` persiste apenas em `suggestionActionType` para compatibilidade com dados historicos; a geracao nova ja nao cria esse tipo.

## Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `git status --short` | Antes da auditoria: relatorios MF4 untracked; `real_dev/` e area local conforme prompt. |
| `env DATABASE_URL='postgresql://opsa:opsa@localhost:5432/opsa_dev?schema=public' npm --prefix real_dev/api run prisma:validate` | `PASS` |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `npm --prefix real_dev/api run test:unit` | `PASS`, 59/59 |
| `npm --prefix real_dev/api run test:contracts` | `PASS`, 26/26 |
| `npm --prefix real_dev/api run test:integration` | `FAIL_CONTROLADO`: falta `TEST_DATABASE_URL`; a suite exige PostgreSQL efemero seguro. |
| `env OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS`, 2 testes skipped explicitamente. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS` |
| Pesquisa estatica de riscos em `real_dev/api/src`, `real_dev/api/tests`, `real_dev/web/src` | Sem findings abertos. |
| Pesquisa de drift de dominio | Sem ocorrencias. |
| `rg -n "STOCK_RULE_ACTIVE\|STOCK_VALUE_LOCKED\|stockBalance\\.findMany\|new Date\\(value\\)" ...` | Sem ocorrencias regressivas; `STOCK_VALUE_LOCKED` apenas compatibilidade historica. |
| `git diff --check` | `PASS` |

## Validacoes nao executadas

- Integracao persistida real contra PostgreSQL: nao executada por falta de `TEST_DATABASE_URL`. A falha e explicita e segura; a suite pede base efemera cujo nome contenha `test`, `audit` ou `ci`.
- Smoke HTTP autenticado com sessao/dados reais: nao executado por falta de servidor/sessao/dados seedados neste modo de auditoria local.

## Ficheiros alterados

- Atualizado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF4.md`

Nao foram alterados ficheiros de codigo em `real_dev`. Nao foram alterados RF/RNF, BKs, matriz, backlog ou outros documentos canonicos. Nao foram feitos commits nem push.

## Blockers e TODOs

- `TODO operacional`: definir `TEST_DATABASE_URL` para PostgreSQL efemero seguro e correr `npm --prefix real_dev/api run test:integration` sem skip.
- `TODO documental`: quando `PERMITIR_ALTERAR_DOCS=sim`, alinhar matriz/backlog para refletir que MF4 tem implementacao real auditada em `real_dev`.
- `TODO futuro`: executar auditoria MF5 sobre UX/responsividade/acessibilidade/performance das paginas MF4.

## Proxima acao recomendada

Executar validacao persistida com `TEST_DATABASE_URL` e, se passar, avancar para MF5 ou para uma correcao documental controlada da matriz/backlog quando houver permissao explicita para alterar docs canonicos.
