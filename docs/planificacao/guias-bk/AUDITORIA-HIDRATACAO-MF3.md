# AUDITORIA-HIDRATACAO-MF3

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF3`
- `macro`: `MF3`
- `modo`: `corrigir_apenas`
- `data`: `2026-06-13`
- `scope`: `docs/planificacao/guias-bk/MF3/*.md`
- `bk_analisados`: `8`
- `bk_editados_nesta_execucao`: `8`

## Fontes consultadas

- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- BKs MF0, MF1, MF2 e MF3 relevantes para modelos, endpoints, `apiClient`, multiempresa, roles, documentos, recebimentos, pagamentos, contabilidade, stock e tesouraria.

## Resultado executivo

O relatorio anterior desta MF marcava os oito BKs como `PARCIAL`, principalmente por falta de JSDoc, comentarios didaticos, marcas `CANONICO`/`DERIVADO`, drift de fonte contabilistica no mapa de IVA e duplicacao de clientes HTTP no frontend.

Nesta execucao foram corrigidos os oito BKs da MF3. Resultado depois da correcao manual: `8 OK`, `0 PARCIAL`, `0 CRITICO`.

## Contagem antes/depois

| Momento | OK | PARCIAL | CRITICO | Observacao |
| --- | ---: | ---: | ---: | --- |
| Relatorio existente antes da correcao | 0 | 8 | 0 | Reauditoria em `auditar_apenas`. |
| Depois desta execucao | 8 | 0 | 0 | BKs corrigidos em `corrigir_apenas`. |

## BKs editados

| BK | Estado depois | Principais lacunas corrigidas |
| --- | --- | --- |
| `BK-MF3-01` | OK | Fonte canonica do IVA alinhada com `JournalEntry`; linhas documentais usadas apenas para taxa/codigo; JSDoc em validator, service, route, tipos e pagina; frontend usa `apiClient`. |
| `BK-MF3-02` | OK | JSDoc e comentarios em validators/services/routes/frontend; `GET` passa a ter erro controlado; cliente frontend reutiliza `apiClient`; saldo inicial marcado como decisao derivada. |
| `BK-MF3-03` | OK | Parser CSV/OFX simplificado documentado; sugestao de reconciliacao separada de confirmacao; pagina carrega contas reais; cliente usa `apiClient`. |
| `BK-MF3-04` | OK | Dependencias MF1-03/MF1-08 declaradas para `amountPaidCents`; formulas e horizonte marcados como derivados; JSDoc e `apiClient`. |
| `BK-MF3-05` | OK | Limite Excel nativo clarificado como Excel exportado para CSV; importacoes reais por tipo; logs de erro por linha; JSDoc e `apiClient`. |
| `BK-MF3-06` | OK | SAF-T delimitado como XML MVP rastreavel; perfil fiscal bloqueia exportacao incompleta; download local; JSDoc, comentarios e `apiClient`. |
| `BK-MF3-07` | OK | Margem operacional MVP diferenciada de margem contabilistica/FIFO; JSDoc em filtros, service, route, cliente e pagina; `apiClient`. |
| `BK-MF3-08` | OK | EBITDA, PMR e PMP marcados como formulas MVP; `null` para falta de dados; JSDoc e `apiClient`; fontes preparadas para MF4 sem acao automatica. |

## Decisoes tecnicas confirmadas

- Frontend MF3 deve reutilizar `apps/web/src/lib/apiClient.ts`, criado em `BK-MF1-01`, para manter `credentials: "include"` e evitar clientes HTTP paralelos.
- Dados por empresa continuam filtrados no backend via `req.companyId`; nenhum BK corrigido pede `companyId` ao frontend.
- Roles continuam aplicadas no backend: `CONTABILISTA`, `AUDITOR`, `OPERACIONAL`, `GESTOR` e `ADMIN`, conforme o dominio de cada BK.
- Escritas sensiveis usam services backend e transacoes quando criam registos relacionados, como conta + snapshot ou importacao + linhas.
- SAF-T e Excel nativo ficam limitados ao escopo documentado; nao foram adicionadas dependencias novas sem contrato.

## Decisoes de dominio OPSA confirmadas

- `BK-MF3-01`: o mapa de IVA inclui apenas documentos contabilizados; `JournalEntry` e a fonte canonica de inclusao.
- `BK-MF3-03`: reconciliacao automatica significa sugestao auditavel, nao confirmacao automatica.
- `BK-MF3-04`: previsao de tesouraria e analitica; nao altera recebimentos, pagamentos ou datas.
- `BK-MF3-05`: importacao altera dados mestre e extratos, por isso exige role e valida linha a linha.
- `BK-MF3-06`: SAF-T e artefacto legal sensivel; o BK entrega XML MVP e bloqueia perfil fiscal incompleto.
- `BK-MF3-07`: margem operacional MVP nao substitui margem contabilistica baseada em custo de stock.
- `BK-MF3-08`: IA futura consome KPIs e fontes, mas nao executa acoes automaticamente.

## Drift documental encontrado

| Area | Estado |
| --- | --- |
| Dependencias MF3 vs matriz/backlog | Alguns BKs MF3 passaram a declarar dependencias tecnicas mais completas do que a matriz/backlog, por exemplo `BK-MF3-04` com `BK-MF1-03` e `BK-MF1-08`. |
| RF35 CSV/Excel | O BK corrige o guia para Excel exportado para CSV; leitura nativa `.xlsx` continua fora do contrato tecnico atual. |
| RF36 SAF-T | O BK reforca XML MVP e remete conformidade legal completa para aprofundamento posterior documentado, sem inventar especificacao oficial completa. |
| Validador documental | `scripts/validate-planificacao.sh` ainda reporta avisos advisory globais/heuristicos em MF0-MF3, embora `overall_pass` seja `true`. |

## Mapa de integracao da MF

| BK | Ficheiros criados/editados no guia | Exports produzidos | Imports consumidos | Endpoints | Schemas/models | Regras aplicadas | BKs seguintes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF3-01` | `tax/vatMapFilters.js`, `tax/vatMapService.js`, `tax/vatMapRoutes.js`, `taxApi.ts`, `VatMapPage.tsx`, `schema.prisma`, `server.js`, `App.tsx` | `validateVatMapQuery`, `buildVatMap`, `buildVatMapRoutes`, `fetchVatMap`, `VatMapPage` | `JournalEntry`, `SaleDocumentLine`, `PurchaseDocumentLine`, `VatRate`, `apiClient`, guards MF0 | `GET /api/tax/vat-maps` | `VatMapRun` | multiempresa, roles `CONTABILISTA`/`AUDITOR`, fonte fiscal canonica por `JournalEntry` | `BK-MF3-06`, reporting fiscal |
| `BK-MF3-02` | `bankAccountValidators.js`, `bankAccountService.js`, `bankAccountRoutes.js`, `treasuryApi.ts`, `TreasuryAccountsPage.tsx`, `schema.prisma`, `server.js`, `App.tsx` | `validateTreasuryAccountPayload`, `listTreasuryAccounts`, `createTreasuryAccount`, `buildTreasuryAccountRoutes` | guards MF0, `httpError`, `toHttpError`, `apiClient` | `GET/POST /api/treasury/accounts` | `TreasuryAccount`, `TreasuryBalanceSnapshot` | multiempresa, roles de tesouraria, IBAN backend, saldo em centimos | `BK-MF3-03`, `BK-MF3-04`, `BK-MF3-05` |
| `BK-MF3-03` | `statementImportValidators.js`, `statementImportService.js`, `statementRoutes.js`, `statementApi.ts`, `StatementImportPage.tsx`, `schema.prisma`, `server.js`, `App.tsx` | `validateStatementImportPayload`, `importBankStatement`, `buildStatementRoutes`, `importStatement` | `TreasuryAccount`, `Receipt`, `Payment`, `listTreasuryAccounts`, `apiClient`, guards MF0 | `POST /api/treasury/statements/import` | `BankStatementImport`, `BankStatementLine`, `BankReconciliationSuggestion` | multiempresa, roles `OPERACIONAL`/`CONTABILISTA`, sugestao sem confirmacao | `BK-MF3-04`, `BK-MF3-05`, `BK-MF4-10` |
| `BK-MF3-04` | `cashflowForecastFilters.js`, `cashflowForecastService.js`, `cashflowForecastRoutes.js`, `forecastApi.ts`, `CashflowForecastPage.tsx`, `schema.prisma`, `server.js`, `App.tsx` | `validateForecastQuery`, `buildCashflowForecast`, `buildCashflowForecastRoutes`, `fetchCashflowForecast` | `TreasuryBalanceSnapshot`, `SaleDocument`, `PurchaseDocument`, `apiClient`, guards MF0 | `GET /api/treasury/forecast` | `CashflowForecastRun` | multiempresa, role `GESTOR`, fontes explicaveis, sem escrita operacional | `BK-MF4-04` |
| `BK-MF3-05` | `businessImportValidators.js`, `businessImportService.js`, `businessImportRoutes.js`, `importApi.ts`, `BusinessImportPage.tsx`, `schema.prisma`, `server.js`, `App.tsx` | `validateBusinessImportPayload`, `importBusinessData`, `buildBusinessImportRoutes` | `Customer`, `Supplier`, `Item`, `TreasuryAccount`, `BankStatementImport`, `BankStatementLine`, `apiClient` | `POST /api/imports/business-data` | `BusinessImportRun` | multiempresa, roles `ADMIN`/`CONTABILISTA`, upsert por identificador natural, erros por linha | `BK-MF3-06`, `BK-MF7-06` |
| `BK-MF3-06` | `saftValidators.js`, `saftService.js`, `saftRoutes.js`, `complianceApi.ts`, `SaftExportPage.tsx`, `schema.prisma`, `server.js`, `App.tsx` | `validateSaftExportQuery`, `buildSaftXml`, `buildSaftRoutes`, `fetchSaftExport` | `CompanyProfile`, `Customer`, `Supplier`, `SaleDocument`, `PurchaseDocument`, `JournalEntry`, `apiClient` | `GET /api/compliance/saft` | `SaftExportRun` | multiempresa, roles `CONTABILISTA`/`AUDITOR`, XML escaped, perfil fiscal obrigatorio | `BK-MF3-07`, `BK-MF7-07` |
| `BK-MF3-07` | `operationalReportFilters.js`, `operationalReportService.js`, `operationalReportRoutes.js`, `reportApi.ts`, `OperationalReportsPage.tsx`, `schema.prisma`, `server.js`, `App.tsx` | `validateOperationalReportQuery`, `buildOperationalReport`, `buildOperationalReportRoutes`, `fetchOperationalReport` | `SaleDocument`, `PurchaseDocument`, `StockBalance`, `Item`, `apiClient` | `GET /api/reports/operational` | `OperationalReportRun` | multiempresa, roles `GESTOR`/`OPERACIONAL`, margem MVP explicita | `BK-MF3-08`, `BK-MF4-01`, `BK-MF4-03` |
| `BK-MF3-08` | `executiveKpiFilters.js`, `executiveKpiService.js`, `executiveKpiRoutes.js`, `kpiApi.ts`, `ExecutiveKpisPage.tsx`, `schema.prisma`, `server.js`, `App.tsx` | `validateExecutiveKpiQuery`, `buildExecutiveKpis`, `buildExecutiveKpiRoutes`, `fetchExecutiveKpis` | `SaleDocument`, `PurchaseDocument`, `Receipt`, `Payment`, `apiClient` | `GET /api/reports/executive-kpis` | `ExecutiveKpiRun` | multiempresa, role `GESTOR`, PMR/PMP nulos sem dados, sem IA automatica | `BK-MF4-01` |

## Verificacoes executadas

- Pesquisa de termos internos proibidos nos BKs MF3: exit code `1`, sem ocorrencias; este exit code e esperado quando `rg` nao encontra matches.
- Pesquisa de `fetch(` nos BKs MF3: sem clientes HTTP duplicados em blocos de codigo; as ocorrencias restantes sao explicacoes sobre `apiClient`.
- Pesquisa de JSDoc e marcas `CANONICO`/`DERIVADO`: todos os BKs MF3 corrigidos contem JSDoc e marcacoes de decisao.
- `git diff --check`: exit code `0`, sem erros de whitespace.
- `bash scripts/validate-planificacao.sh`: exit code `0`; `overall_pass: true`; `advisory_pass: false` por avisos globais/heuristicos ja existentes em documentos e guias.

## Bloqueios ou TODOs restantes

- Sem bloqueios nos BKs MF3 corrigidos dentro do modo `corrigir_apenas`.
- Drift residual em documentos superiores deve ser tratado noutra execucao se o objetivo for sincronizar matriz/backlog/plano.
- Leitura nativa de Excel `.xlsx` e conformidade legal SAF-T completa nao foram inventadas; ficaram explicitamente fora do escopo MVP dos respetivos BKs.

## Ordem recomendada de correcao futura

1. Sincronizar matriz/backlog com dependencias tecnicas MF3 que ficaram mais explicitas nos guias.
2. Decidir, em documento superior, se RF35 exige `.xlsx` nativo ou se Excel exportado para CSV e suficiente no MVP.
3. Aprofundar SAF-T legal em `BK-MF7-07` sem alterar a fronteira honesta do MVP.
4. Rever heuristicas do validador documental para distinguir guias ja hidratados de avisos legacy.

## Resumo final

- MF processada: `MF3`.
- Numero de BKs analisados: `8`.
- Contagem OK/PARCIAL/CRITICO antes: `0/8/0`.
- Contagem OK/PARCIAL/CRITICO depois: `8/0/0`.
- BKs editados: `BK-MF3-01` a `BK-MF3-08`.
- Principais lacunas corrigidas: JSDoc, comentarios didaticos, `CANONICO`/`DERIVADO`, fonte contabilistica do IVA, cliente frontend comum, formulas MVP e limites legais/tecnicos.
- Verificacoes textuais executadas: termos proibidos, `fetch`, JSDoc/marcacoes.
- Resultado de `git diff --check`: `0`.
- Resultado de `bash scripts/validate-planificacao.sh`: `0`, `overall_pass: true`, `advisory_pass: false`.

## Changelog

- `2026-06-13`: correcao em `corrigir_apenas`; oito BKs MF3 editados; relatorio atualizado com contagem antes/depois, mapa de integracao e validacoes.
