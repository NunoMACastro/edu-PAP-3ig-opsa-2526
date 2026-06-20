# CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF4

## Header

- `doc_id`: `CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF4`
- `path`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF4.md`
- `modo`: `corrigir_auditoria`
- `project`: `OPSA`
- `mf_alvo`: `MF4`
- `bk_ids`: `BK-MF4-01`, `BK-MF4-04`, `BK-MF4-06`, `BK-MF4-07`
- `implementation_root`: `real_dev`
- `audit_report_source`: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF4.md`
- `data`: `2026-06-18`
- `resultado_geral`: `CORRIGIDO_COM_RISCO_OPERACIONAL`

## Resumo

Foram corrigidos os tres findings abertos na auditoria MF4. A IA e os smart alerts passaram a reutilizar os alertas calculados da MF2 (`listStockAlerts`) em vez de gerar sinais de stock a partir de saldo positivo ou de regras configuradas sem desvio real. Os validadores de lembretes e tarefas passaram a exigir `YYYY-MM-DD` com roundtrip ISO, rejeitando datas impossiveis como `2026-02-31`.

Nao foram alterados documentos canonicos de RF/RNF/BK, schema Prisma, migrations, contratos HTTP ou frontend. A unica alteracao fora de `real_dev` foi este relatorio de correcao.

## Findings corrigidos

| Finding | Severidade | BK/RF | Estado | Correcao |
| --- | --- | --- | --- | --- |
| `P1-MF4-01-STOCK-INSIGHT-NOT-STOPPED` | `P1` | `BK-MF4-01`, `RF39` | `CORRIGIDO` | `generateAiInsights` deixou de usar `stockBalance.findMany` e deixou de gerar `STOCK_VALUE_LOCKED` a partir de qualquer saldo positivo. Os insights de stock nascem de `LOW_STOCK`, `STOPPED_ITEM` e `HIGH_STOCK` calculados pela MF2, com fonte `StockAlertSetting`. |
| `P1-MF4-04-STOCK-RUPTURE-NOT-CALCULATED` | `P1` | `BK-MF4-04`, `RF42` | `CORRIGIDO` | `generateSmartAlerts` deixou de materializar `STOCK_RULE_ACTIVE` e passou a criar `STOCK_RUPTURE_RISK` apenas quando `StockBalance.quantity < StockAlertSetting.minQuantity`, via `listStockAlerts`. |
| `P2-MF4-DATE-NORMALIZATION` | `P2` | `BK-MF4-06`, `BK-MF4-07` | `CORRIGIDO` | `reminderValidators.js` e `taskValidators.js` passaram a validar formato `YYYY-MM-DD` e a rejeitar datas que o JavaScript normalizaria silenciosamente. |

## Ficheiros alterados

- `real_dev/api/src/modules/ai/aiService.js`
- `real_dev/api/src/modules/reminders/reminderValidators.js`
- `real_dev/api/src/modules/tasks/taskValidators.js`
- `real_dev/api/tests/unit/mf4-services.test.js`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF4.md`

Nota Git: `real_dev/` esta ignorado por `.gitignore`, por isso as alteracoes de implementacao nao aparecem em `git status` do repositorio de topo. Os ficheiros foram alterados diretamente no workspace.

## Validações executadas

| Comando | Resultado |
| --- | --- |
| `env DATABASE_URL='postgresql://opsa:opsa@localhost:5432/opsa_dev?schema=public' npm --prefix real_dev/api run prisma:validate` | `PASS` |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `npm --prefix real_dev/api run test:unit` | `PASS`, 59/59 |
| `npm --prefix real_dev/api run test:contracts` | `PASS`, 26/26 |
| `npm --prefix real_dev/api run test:integration` | `FAIL_CONTROLADO`: falta `TEST_DATABASE_URL`; a suite exige PostgreSQL efemero seguro. |
| `env OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS`, 2 testes skipped explicitamente. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS` |
| `rg -n "STOCK_RULE_ACTIVE\|stockBalance\\.findMany" real_dev/api/src/modules/ai real_dev/api/tests/unit/mf4-services.test.js` | `PASS`, sem ocorrencias. |
| `rg -n "new Date\\(value\\)" real_dev/api/src/modules/reminders/reminderValidators.js real_dev/api/src/modules/tasks/taskValidators.js` | `PASS`, sem ocorrencias. |
| `git diff --check -- docs/planificacao/guias-bk ...` | `PASS` para ficheiros rastreaveis pelo Git de topo; `real_dev/` esta ignorado. |

## Testes adicionados

- `BK-MF4-06/BK-MF4-07: datas inexistentes são rejeitadas sem normalização`
- `BK-MF4-01: insights de stock usam alertas MF2 calculados`
- `BK-MF4-04: alertas inteligentes materializam risco de rutura calculado`

## Coerência MF

- `MF2 -> MF4`: reforcada. A MF4 passa a consumir o contrato real de alertas de stock da MF2, incluindo `StockAlertSetting`, `StockBalance` e `StockMovement`.
- `MF3 -> MF4`: preservada. Insights financeiros e alertas de tesouraria continuam a usar `OperationalReportRun`, `ExecutiveKpiRun` e `CashflowForecastRun`.
- `MF4 -> MF5`: preservada. Nao houve alteracao de DTO/frontend que altere o contrato de consumo da MF5.

## Risco residual

- A integracao persistida real nao foi executada porque `TEST_DATABASE_URL` nao esta definido no ambiente. A suite falhou de forma esperada e segura; a variante com skip explicito passou.
- Existem dados historicos possiveis com o tipo antigo `STOCK_VALUE_LOCKED`; a geracao nova ja nao cria esse tipo, mas o mapeamento de sugestoes manteve compatibilidade para insights antigos.

## Estado final

- `P0`: 0 abertos
- `P1`: 0 abertos
- `P2`: 0 abertos
- `P3`: 0 abertos
- Commits/push: nao executados, conforme `PERMITIR_COMMITS=nao`.
