# Implementacao real_dev - MF4

## Header
- `doc_id`: `IMPLEMENTACAO-REAL_DEV-MF4`
- `path`: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF4.md`
- `modo`: `implementar`
- `project`: `OPSA`
- `mf_alvo`: `MF4`
- `bk_ids`: `BK-MF4-01` a `BK-MF4-10`
- `implementation_root`: `real_dev`
- `data`: `2026-06-18`

## Resultado geral

`IMPLEMENTADO_COM_RISCOS_CONTROLADOS`.

A MF4 foi implementada em `real_dev/api` e `real_dev/web`, com modelos Prisma, migration, services, routers protegidos, permissões backend, cliente frontend, páginas React e testes unitários/contratuais. A validação persistida real continua bloqueada pela ausência de `TEST_DATABASE_URL`, tal como nas validações MF2/MF3 anteriores.

## Estado por BK

| BK | RF/RNF | Estado | Entrega |
| --- | --- | --- | --- |
| `BK-MF4-01` | `RF39` | `IMPLEMENTADO` | `AiInsight`, geração determinística de insights, `/api/ai/insights`, página frontend. |
| `BK-MF4-02` | `RF40` | `IMPLEMENTADO` | `AiActionSuggestion`, sugestões sem execução automática, `/api/ai/suggestions`. |
| `BK-MF4-03` | `RF41` | `IMPLEMENTADO` | `AiQuestionRun`, perguntas read-only com fontes, `/api/ai/questions`. |
| `BK-MF4-04` | `RF42` | `IMPLEMENTADO` | `SmartAlert`, alertas sobre forecast/stock, `/api/ai/alerts`. |
| `BK-MF4-05` | `RF43`, `RNF31` | `IMPLEMENTADO` | Explicação/fonte por insight em `/api/ai/insights/:id/explanation`. |
| `BK-MF4-06` | `RF44` | `IMPLEMENTADO` | `Reminder`, criar/listar/atualizar lembretes, `/api/reminders`. |
| `BK-MF4-07` | `RF45` | `IMPLEMENTADO` | `OperationalTask`, atribuição validada por membership ativa, `/api/tasks`. |
| `BK-MF4-08` | `RF46` | `IMPLEMENTADO` | `InAppNotification`, sync e marcar como lida, `/api/notifications`. |
| `BK-MF4-09` | `RF47`, `RNF17` | `IMPLEMENTADO` | Consulta restrita de `AuditLog`, helper `recordAuditLog`, `/api/audit/logs`. |
| `BK-MF4-10` | `RF48` | `IMPLEMENTADO` | `IntegrationLog`, logs sanitizados para extratos/imports/SAF-T, `/api/integrations/logs`. |

## Rastreabilidade BK -> ficheiros -> testes

| BK | Ficheiros principais | Testes |
| --- | --- | --- |
| `BK-MF4-01` a `BK-MF4-05` | `real_dev/api/src/modules/ai/*`, `real_dev/web/src/lib/mf4Api.ts`, `real_dev/web/src/pages/mf4Pages.tsx` | `mf4-services.test.js`, `mf4-contracts.test.js` |
| `BK-MF4-06` | `real_dev/api/src/modules/reminders/*`, `mf4Api.ts`, `mf4Pages.tsx` | `mf4-services.test.js`, `mf4-contracts.test.js` |
| `BK-MF4-07` | `real_dev/api/src/modules/tasks/*`, `mf4Api.ts`, `mf4Pages.tsx` | `mf4-services.test.js`, `mf4-contracts.test.js` |
| `BK-MF4-08` | `real_dev/api/src/modules/notifications/*`, `mf4Api.ts`, `mf4Pages.tsx` | `mf4-contracts.test.js` |
| `BK-MF4-09` | `real_dev/api/src/modules/audit/*` | `mf4-contracts.test.js` |
| `BK-MF4-10` | `real_dev/api/src/modules/integrations/*`, `statementImportService.js`, `businessImportService.js`, `saftService.js` | `mf4-services.test.js`, `mf4-contracts.test.js` |

## Mapa de integracao da MF

- Prisma: `AiInsight`, `AiActionSuggestion`, `AiQuestionRun`, `SmartAlert`, `Reminder`, `OperationalTask`, `InAppNotification`, `IntegrationLog`.
- Backend: routers montados em `/api/ai`, `/api/reminders`, `/api/tasks`, `/api/notifications`, `/api/audit`, `/api/integrations`.
- Frontend: navegação MF4 adicionada em `App.tsx`, cliente tipado `mf4Api.ts` e páginas em `mf4Pages.tsx`.
- Segurança: todos os endpoints usam `requireAuth`, `requireCompanyContext`, permissões backend e roles quando aplicável.
- Multiempresa: nenhum endpoint MF4 aceita `companyId` para decidir ownership; usa `req.companyId`.

## Contratos consumidos

- MF0: sessão por cookie HttpOnly, contexto multiempresa, roles/permissões e `AuditLog`.
- MF1/MF2: documentos de venda/compra, recebimentos/pagamentos, stock, regras de alertas de stock.
- MF3: `OperationalReportRun`, `ExecutiveKpiRun`, `CashflowForecastRun`, `BusinessImportRun`, `SaftExportRun`, `BankStatementImport` e fontes explicáveis.

## Contratos entregues

- IA assistiva com explicação e fonte, sem execução automática.
- Sugestões e alertas materializados sem alterar contabilidade, stock, pagamentos ou preços.
- Lembretes, tarefas e notificações in-app com ownership por empresa/utilizador.
- Auditoria consultável por `ADMIN`/`AUDITOR`.
- Logs de integração consultáveis por `ADMIN`, com mensagens sanitizadas.

## Coerencia entre MFs

- `MF3 -> MF4`: coerente. A MF4 consome dados e fontes da MF3 sem duplicar reporting nem prometer integrações externas.
- `MF4 -> MF5`: coerente no handoff funcional. A MF4 entrega páginas/estados/DTOs observáveis que a MF5 pode melhorar em UX, acessibilidade e performance.
- Limitação: MF5 continua documentalmente em formato antigo; validação detalhada MF4 -> MF5 fica parcial por scope.

## Findings

Nenhum finding P0/P1 confirmado após implementação e validações locais. Risco operacional residual: integração persistida real não executada sem `TEST_DATABASE_URL`.

## Ficheiros alterados/criados

- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/prisma/migrations/20260618120000_mf4_schema/migration.sql`
- `real_dev/api/src/server.js`
- `real_dev/api/src/modules/permissions/permissions.js`
- `real_dev/api/src/modules/ai/*`
- `real_dev/api/src/modules/reminders/*`
- `real_dev/api/src/modules/tasks/*`
- `real_dev/api/src/modules/notifications/*`
- `real_dev/api/src/modules/audit/*`
- `real_dev/api/src/modules/integrations/*`
- `real_dev/api/src/modules/treasury/statementImportService.js`
- `real_dev/api/src/modules/imports/businessImportService.js`
- `real_dev/api/src/modules/compliance/saftService.js`
- `real_dev/api/tests/unit/mf3-services.test.js`
- `real_dev/api/tests/unit/mf4-services.test.js`
- `real_dev/api/tests/contracts/mf4-contracts.test.js`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/lib/mf4Api.ts`
- `real_dev/web/src/pages/mf4Pages.tsx`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF4.md`

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | limpo no início; `real_dev/` é área ignorada/local |
| `DATABASE_URL=... npm --prefix real_dev/api run prisma:validate` | PASS |
| `DATABASE_URL=... npm --prefix real_dev/api run prisma:generate` | PASS |
| `npm --prefix real_dev/api run syntax:check` | PASS |
| `npm --prefix real_dev/api run test:unit` | PASS, 56/56 |
| `npm --prefix real_dev/api run test:contracts` | PASS, 26/26 |
| `npm --prefix real_dev/api run test:integration` | FAIL controlado: falta `TEST_DATABASE_URL` |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | PASS com 2 skipped explícitos |
| `npm --prefix real_dev/web run typecheck` | PASS |
| `npm --prefix real_dev/web run build` | PASS |
| Pesquisa estática de riscos em `real_dev/api/src`, `real_dev/api/tests`, `real_dev/web/src` | Sem findings MF4; ocorrências são testes negativos/comentários/adapters de segurança |
| Pesquisa de drift de domínio | Sem ocorrências |
| `git diff --check` | PASS |

## Blockers/TODOs

- `TODO operacional`: configurar `TEST_DATABASE_URL` para PostgreSQL efémero cujo nome contenha `test`, `audit` ou `ci` e executar `npm --prefix real_dev/api run test:integration`.
- `TODO futuro`: MF5 deve auditar/hidratar UX e performance sobre as páginas MF4 agora existentes.

## Proxima acao recomendada

Executar auditoria formal `MODO=auditar_implementacao` para `MF4`, já com `TEST_DATABASE_URL` se possível, e só depois avançar para MF5.
