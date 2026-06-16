# IMPLEMENTACAO-REAL_DEV-MF3

## Resultado geral

- Projeto: OPSA
- Modo executado: `implementar`
- MF alvo: `MF3`
- BKs abrangidos: `BK-MF3-01` a `BK-MF3-08`
- Implementation root: `real_dev`
- Resultado: `IMPLEMENTADO_COM_RISCOS`
- Data: `2026-06-15`

A MF3 foi implementada em `real_dev/api` e `real_dev/web`, com modelos Prisma, migration, services, rotas protegidas, permissões backend, cliente frontend, páginas React e testes unitários/contratuais. O risco residual principal é a ausência de execução persistida contra PostgreSQL real porque `TEST_DATABASE_URL` não está definido neste ambiente.

## Estado por BK

| BK | RF | Estado | Implementação |
| --- | --- | --- | --- |
| `BK-MF3-01` | `RF31` | `IMPLEMENTADO` | `GET /api/tax/vat-maps`, cálculo por `JournalEntry` contabilizado e decomposição por linhas de venda/compra, persistência em `VatMapRun`. |
| `BK-MF3-02` | `RF32` | `IMPLEMENTADO` | `GET/POST /api/treasury/accounts`, validação IBAN, `TreasuryAccount` e snapshot inicial transacional. |
| `BK-MF3-03` | `RF33` | `IMPLEMENTADO` | `POST /api/treasury/statements/import`, CSV/OFX simplificado, `BankStatementImport`, linhas e sugestões sem confirmação automática. |
| `BK-MF3-04` | `RF34` | `IMPLEMENTADO` | `GET /api/treasury/forecast`, previsão por documentos em aberto e saldo de tesouraria, `CashflowForecastRun`. |
| `BK-MF3-05` | `RF35` | `IMPLEMENTADO` | `POST /api/imports/business-data`, importação CSV de clientes, fornecedores, artigos e extratos, `BusinessImportRun` com erros por linha. |
| `BK-MF3-06` | `RF36` | `IMPLEMENTADO` | `GET /api/compliance/saft`, XML SAF-T MVP rastreável, `SaftExportRun`, perfil fiscal obrigatório. |
| `BK-MF3-07` | `RF37` | `IMPLEMENTADO` | `GET /api/reports/operational`, vendas, compras, margem MVP, stock e fontes para MF4. |
| `BK-MF3-08` | `RF38` | `IMPLEMENTADO` | `GET /api/reports/executive-kpis`, receita, custos, EBITDA MVP, PMR/PMP e fontes. |

## Rastreabilidade

| Área | Ficheiros principais |
| --- | --- |
| Prisma | `real_dev/api/prisma/schema.prisma`, `real_dev/api/prisma/migrations/20260615120000_mf3_schema/migration.sql` |
| Fiscalidade | `real_dev/api/src/modules/tax/*` |
| Tesouraria | `real_dev/api/src/modules/treasury/*` |
| Importações | `real_dev/api/src/modules/imports/*` |
| Compliance | `real_dev/api/src/modules/compliance/*` |
| Reports/KPIs | `real_dev/api/src/modules/reports/*` |
| Segurança/rotas | `real_dev/api/src/modules/permissions/permissions.js`, `real_dev/api/src/server.js` |
| Frontend | `real_dev/web/src/lib/apiClient.ts`, `real_dev/web/src/pages/mf3Pages.tsx`, `real_dev/web/src/App.tsx`, `real_dev/web/scripts/check-mf3-pages.mjs` |
| Testes | `real_dev/api/tests/unit/mf3-services.test.js`, `real_dev/api/tests/contracts/mf3-contracts.test.js` |

## Contratos consumidos

- MF0: sessão por cookie HttpOnly, `requireAuth`, contexto multiempresa, roles/permissões, clientes, fornecedores, artigos, perfil fiscal e plano SNC.
- MF1: `VatRate`, documentos de venda/compra, recebimentos, pagamentos, `JournalEntry`, `JournalEntryLine` e `AuditLog`.
- MF2: `StockBalance`, `StockMovement`, reporting contabilístico interno e saldos de inventário para relatórios operacionais.

## Contratos entregues

- MF3 entrega dados explicáveis para MF4: `OperationalReportRun`, `ExecutiveKpiRun`, `CashflowForecastRun`, `sources` em reports/forecast/KPIs e sugestões de reconciliação sem ação automática.
- MF3 entrega base para MF7: importações CSV auditáveis, SAF-T MVP rastreável e estruturas de exportação/importação que podem ser endurecidas em RNF posteriores.
- MF3 mantém separação entre recebimentos e pagamentos, documento operacional e lançamento contabilístico, e recomendação/sugestão vs ação automática.

## Coerência entre MFs

- MF2 -> MF3: coerente. A implementação reutiliza `JournalEntry`, documentos, pagamentos/recebimentos e stock sem alterar contratos anteriores.
- MF3 -> MF4: coerente com riscos baixos. `BK-MF4-01` e `BK-MF4-03` podem consumir `/api/reports/operational`; `BK-MF4-04` pode consumir `/api/treasury/forecast`. Todos devolvem fontes explícitas.
- Regressões encontradas: nenhuma em validação estática/unitária/contratual.

## Findings por severidade

- P0: nenhum.
- P1: nenhum.
- P2: integração persistida real não executada por falta de `TEST_DATABASE_URL`.
- P3: sem findings novos. A implementação limita Excel nativo a CSV exportado e SAF-T completo a MVP, conforme fronteira documental da MF3.

## Validações executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run syntax:check` | PASS |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa_dev npm --prefix real_dev/api run prisma:validate` | PASS |
| `npm --prefix real_dev/api run test:unit` | PASS, 48/48 |
| `npm --prefix real_dev/api run test:contracts` | PASS, 22/22 |
| `npm --prefix real_dev/web run test:mf3` | PASS |
| `npm --prefix real_dev/web run typecheck` | PASS |
| `npm --prefix real_dev/web run build` | PASS |
| `git diff --check` | PASS |
| Pesquisa estática de riscos em `real_dev/api/src`, `real_dev/api/tests`, `real_dev/web/src`, `real_dev/web/scripts` | Sem novo risco MF3; ocorrências restantes são testes/adapters MF0 sobre tokens simulados e comentários de segurança. |
| Pesquisa de drift de domínio | Sem ocorrências. |

## Validações não concluídas

- `npm --prefix real_dev/api run test:integration`: FAIL controlado por falta de `TEST_DATABASE_URL`.
- `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration`: PASS com 1 teste skipped.
- Smoke manual em browser: não executado nesta passagem; `build` e `test:mf3` validaram compilação e presença dos ecrãs/chamadas.

## Alterações fora de `real_dev`

- Criado este relatório: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF3.md`.
- Não foram alterados RF/RNF, backlog, matriz, guias BK canónicos, evidence dos alunos, `apps/` ou `mockup/`.

## Blockers e TODOs

- `TODO (BLOCKER)`: nenhum para implementação estática/contratual da MF3.
- Bloqueio de validação persistida: definir `TEST_DATABASE_URL` para PostgreSQL efémero com nome contendo `test`, `audit` ou `ci` e voltar a correr `npm --prefix real_dev/api run test:integration`.

## Próxima ação recomendada

Executar integração persistida com PostgreSQL efémero e, se passar, avançar para auditoria formal `AUDITORIA-IMPLEMENTACAO-real_dev-MF3` antes de iniciar implementação MF4.
