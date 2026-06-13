# AUDITORIA-HIDRATACAO-MF3

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF3`
- `macro`: `MF3`
- `modo`: `auditar_apenas`
- `data`: `2026-06-13`
- `scope`: `docs/planificacao/guias-bk/MF3/*.md`
- `bk_analisados`: `8`
- `bk_editados_nesta_execucao`: `0`
- `nota_worktree`: `os BKs da MF3 ja estavam modificados no worktree antes desta execucao; esta auditoria nao alterou BKs`

## Fontes consultadas

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/README.md`
- Todos os BKs de `MF0`, `MF1`, `MF2` e `MF3`, com leitura focada em contratos consumidos pela MF3.
- BKs posteriores relacionados com MF3: `BK-MF4-01`, `BK-MF4-03`, `BK-MF4-04`, `BK-MF4-10`, `BK-MF6-03`, `BK-MF7-06`, `BK-MF7-07` e `BK-MF8-04`.
- `mockup/` apenas como referencia visual e de fluxo para UI de Bancos, Contabilidade, Dashboard e navegacao; nao foi usado como contrato tecnico final.

## Resultado executivo

Esta execucao reaudita a MF3 em `auditar_apenas`.

O relatorio existente antes desta passagem estava escrito como execucao de `corrigir_apenas` e dizia que os oito BKs tinham sido editados. A prompt atual, porem, define `MODO: auditar_apenas`; por isso, nesta execucao foram auditados os guias atuais e atualizado apenas este relatorio.

Resultado da auditoria: os oito BKs da `MF3` estao `OK` no estado atual do worktree. Todos seguem o formato linear exigido, apresentam oito passos com os pontos 1 a 7, incluem codigo integrado, JSDoc, comentarios didaticos, validacao por passo, cenarios negativos, expected results, evidence, handoff e changelog.

Nao foram editados BKs nesta execucao.

## Contagem antes/depois

| Momento | OK | PARCIAL | CRITICO | Observacao |
| --- | ---: | ---: | ---: | --- |
| Relatorio existente antes desta auditoria | 8 | 0 | 0 | O conteudo existente ja classificava os BKs como OK, mas estava marcado como `corrigir_apenas`. |
| Depois desta reauditoria `auditar_apenas` | 8 | 0 | 0 | Classificacao confirmada sem editar BKs. |

## Classificacao por BK

| BK | Estado | Problema principal | Evidencia auditada | Prioridade de correcao |
| --- | --- | --- | --- | --- |
| `BK-MF3-01` | `OK` | Nenhum bloqueio encontrado. | Mapa de IVA baseado em `JournalEntry`, decomposicao por linhas de venda/compra, `companyId` no backend, roles `CONTABILISTA`/`AUDITOR`, `apiClient`, JSDoc e negativos. | N/A |
| `BK-MF3-02` | `OK` | Nenhum bloqueio encontrado. | Contas banco/caixa com saldo inicial, snapshot transacional, IBAN validado, roles backend, multiempresa, pagina React e handoff para extratos. | N/A |
| `BK-MF3-03` | `OK` | Nenhum bloqueio encontrado. | Importacao CSV/OFX simplificada, sugestoes de reconciliacao sem confirmacao automatica, transacao, logs por importacao, roles e `apiClient`. | N/A |
| `BK-MF3-04` | `OK` | Nenhum bloqueio encontrado. | Previsao de tesouraria analitica, fontes de recebimentos/pagamentos, formulas `DERIVADO`, role `GESTOR`, sem escrita operacional. | N/A |
| `BK-MF3-05` | `OK` | Nenhum bloqueio encontrado. | Importacoes por tipo, upsert por empresa, erros por linha, decisao `DERIVADO` para Excel exportado para CSV, logs e pagina UI. | N/A |
| `BK-MF3-06` | `OK` | Nenhum bloqueio encontrado. | SAF-T MVP em XML, perfil fiscal obrigatorio, `SaftExportRun`, roles `CONTABILISTA`/`AUDITOR`, limite legal explicitado sem inventar certificacao completa. | N/A |
| `BK-MF3-07` | `OK` | Nenhum bloqueio encontrado. | Relatorio operacional de vendas, compras, margem MVP e stock, fontes reais, roles `GESTOR`/`OPERACIONAL`, handoff para IA. | N/A |
| `BK-MF3-08` | `OK` | Nenhum bloqueio encontrado. | KPIs receita/custos/EBITDA/PMR/PMP, formulas MVP marcadas como `DERIVADO`, `null` sem dados suficientes, fontes para MF4/MF8. | N/A |

## Decisoes tecnicas confirmadas

- `apiClient` continua a ser o cliente HTTP comum do frontend e preserva `credentials: "include"`.
- `companyId` e resolvido no backend por sessao/contexto de empresa; nenhum BK da MF3 pede `companyId` ao browser.
- Roles e permissoes sao aplicadas nas routes backend com `requireRole`.
- Os endpoints da MF3 sao unicos e consistentes: `/api/tax/vat-maps`, `/api/treasury/accounts`, `/api/treasury/statements/import`, `/api/treasury/forecast`, `/api/imports/business-data`, `/api/compliance/saft`, `/api/reports/operational` e `/api/reports/executive-kpis`.
- Os BKs reutilizam contratos anteriores de MF0/MF1/MF2: autenticacao, multiempresa, roles, `VatRate`, documentos, recebimentos, pagamentos, `JournalEntry`, `StockBalance` e `apiClient`.
- As operacoes sensiveis ou financeiras usam services backend, validadores, transacoes quando ha escrita relacionada e registos de execucao/importacao/exportacao quando aplicavel.
- O codigo dos BKs esta escrito como solucao final prevista para o guia, com JSDoc e comentarios didaticos; nao foram encontrados `fetch(` direto, `payload: unknown`, `as any`, pseudo-codigo ou helpers por criar.

## Decisoes de dominio OPSA confirmadas

- IVA e calculado a partir de documentos contabilizados; linhas documentais servem para decompor taxa/codigo de IVA.
- Contas bancarias e caixa pertencem sempre a empresa ativa e nao aceitam ownership vindo do frontend.
- Reconciliacao bancaria cria sugestoes auditaveis; nao confirma nem altera recebimentos/pagamentos automaticamente.
- Previsao de tesouraria e analitica; nao altera documentos, datas, recebimentos, pagamentos ou contabilidade.
- Importacoes gravam apenas linhas validas, registam erros por linha e usam identificadores naturais dentro da empresa.
- SAF-T na MF3 e artefacto XML MVP rastreavel; conformidade legal completa fica para aprofundamento em `BK-MF7-07`.
- Relatorios e KPIs usam dados reais e deixam fontes para insights e explicabilidade posteriores.
- IA futura consome fontes e recomenda; nao altera dados contabilisticos automaticamente.

## Mapa de integracao da MF

Este mapa descreve os artefactos previstos nos BKs auditados. Como o modo foi `auditar_apenas`, nenhum destes ficheiros foi editado nesta execucao.

| BK | Ficheiros criados/editados no guia | Exports produzidos | Imports consumidos | Endpoints | DTOs/validators | Schemas/models | Services | Frontend | Regras multiempresa/roles/permissoes | Logs/auditoria | BKs seguintes dependentes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF3-01` | `schema.prisma`, `server.js`, `tax/vatMapFilters.js`, `tax/vatMapService.js`, `tax/vatMapRoutes.js`, `taxApi.ts`, `VatMapPage.tsx`, `App.tsx` | `validateVatMapQuery`, `buildVatMap`, `buildVatMapRoutes`, `fetchVatMap`, `VatMapPage` | `JournalEntry`, `SaleDocumentLine`, `PurchaseDocumentLine`, `VatRate`, `apiClient`, guards MF0 | `GET /api/tax/vat-maps` | query de datas `from/to` | `VatMapRun` | `vatMapService` | pagina de mapa de IVA | `companyId`, `CONTABILISTA`, `AUDITOR` | execucao `VatMapRun` | `BK-MF3-06`, reporting fiscal |
| `BK-MF3-02` | `schema.prisma`, `server.js`, `bankAccountValidators.js`, `bankAccountService.js`, `bankAccountRoutes.js`, `treasuryApi.ts`, `TreasuryAccountsPage.tsx`, `App.tsx` | `validateTreasuryAccountPayload`, `listTreasuryAccounts`, `createTreasuryAccount`, `buildTreasuryAccountRoutes`, `fetchTreasuryAccounts`, `createTreasuryAccount` | guards MF0, `httpError`, `apiClient` | `GET /api/treasury/accounts`, `POST /api/treasury/accounts` | payload de conta banco/caixa | `TreasuryAccount`, `TreasuryBalanceSnapshot` | `bankAccountService` | pagina de contas | `companyId`, leitura por `CONTABILISTA`/`OPERACIONAL`/`GESTOR`, escrita por `CONTABILISTA`/`OPERACIONAL` | snapshot inicial | `BK-MF3-03`, `BK-MF3-04`, `BK-MF3-05` |
| `BK-MF3-03` | `schema.prisma`, `server.js`, `statementImportValidators.js`, `statementImportService.js`, `statementRoutes.js`, `statementApi.ts`, `StatementImportPage.tsx`, `App.tsx` | `validateStatementImportPayload`, `importBankStatement`, `buildStatementRoutes`, `importStatement` | `TreasuryAccount`, `Receipt`, `Payment`, `listTreasuryAccounts`, `apiClient` | `POST /api/treasury/statements/import` | payload de importacao CSV/OFX | `BankStatementImport`, `BankStatementLine`, `BankReconciliationSuggestion` | `statementImportService` | pagina de importacao de extratos | `companyId`, `OPERACIONAL`, `CONTABILISTA` | importacao e sugestoes auditaveis | `BK-MF3-04`, `BK-MF3-05`, `BK-MF4-10`, `BK-MF6-03` |
| `BK-MF3-04` | `schema.prisma`, `server.js`, `cashflowForecastFilters.js`, `cashflowForecastService.js`, `cashflowForecastRoutes.js`, `forecastApi.ts`, `CashflowForecastPage.tsx`, `App.tsx` | `validateForecastQuery`, `buildCashflowForecast`, `buildCashflowForecastRoutes`, `fetchCashflowForecast` | `TreasuryBalanceSnapshot`, `SaleDocument`, `PurchaseDocument`, `apiClient` | `GET /api/treasury/forecast` | query de horizonte/datas | `CashflowForecastRun` | `cashflowForecastService` | pagina de previsao | `companyId`, `GESTOR` | execucao de previsao | `BK-MF4-04` |
| `BK-MF3-05` | `schema.prisma`, `server.js`, `businessImportValidators.js`, `businessImportService.js`, `businessImportRoutes.js`, `importApi.ts`, `BusinessImportPage.tsx`, `App.tsx` | `validateBusinessImportPayload`, `importBusinessData`, `buildBusinessImportRoutes`, `importBusinessData` | `Customer`, `Supplier`, `Item`, `TreasuryAccount`, `BankStatementImport`, `BankStatementLine`, `apiClient` | `POST /api/imports/business-data` | payload de tipo, ficheiro e conteudo CSV | `BusinessImportRun` | `businessImportService` | pagina de importacoes | `companyId`, `ADMIN`, `CONTABILISTA` | `BusinessImportRun` com erros por linha | `BK-MF3-06`, `BK-MF7-06` |
| `BK-MF3-06` | `schema.prisma`, `server.js`, `saftValidators.js`, `saftService.js`, `saftRoutes.js`, `complianceApi.ts`, `SaftExportPage.tsx`, `App.tsx` | `validateSaftExportQuery`, `buildSaftXml`, `buildSaftRoutes`, `fetchSaftExport` | `CompanyProfile`, `Customer`, `Supplier`, `SaleDocument`, `PurchaseDocument`, `JournalEntry`, `apiClient` | `GET /api/compliance/saft` | query de periodo SAF-T | `SaftExportRun` | `saftService` | pagina de exportacao SAF-T | `companyId`, `CONTABILISTA`, `AUDITOR` | `SaftExportRun` | `BK-MF3-07`, `BK-MF7-07` |
| `BK-MF3-07` | `schema.prisma`, `server.js`, `operationalReportFilters.js`, `operationalReportService.js`, `operationalReportRoutes.js`, `reportApi.ts`, `OperationalReportsPage.tsx`, `App.tsx` | `validateOperationalReportQuery`, `buildOperationalReport`, `buildOperationalReportRoutes`, `fetchOperationalReport` | `SaleDocument`, `PurchaseDocument`, `StockBalance`, `Item`, `apiClient` | `GET /api/reports/operational` | query de periodo de relatorio | `OperationalReportRun` | `operationalReportService` | pagina de relatorios operacionais | `companyId`, `GESTOR`, `OPERACIONAL` | execucao de relatorio | `BK-MF3-08`, `BK-MF4-01`, `BK-MF4-03` |
| `BK-MF3-08` | `schema.prisma`, `server.js`, `executiveKpiFilters.js`, `executiveKpiService.js`, `executiveKpiRoutes.js`, `kpiApi.ts`, `ExecutiveKpisPage.tsx`, `App.tsx` | `validateExecutiveKpiQuery`, `buildExecutiveKpis`, `buildExecutiveKpiRoutes`, `fetchExecutiveKpis` | `SaleDocument`, `PurchaseDocument`, `Receipt`, `Payment`, `apiClient` | `GET /api/reports/executive-kpis` | query de periodo de KPI | `ExecutiveKpiRun` | `executiveKpiService` | pagina de KPIs executivos | `companyId`, `GESTOR` | execucao KPI | `BK-MF4-01`, `BK-MF8-04` |

## Coerencia global da MF

- Nao foram encontrados endpoints duplicados para a mesma acao.
- Nao foram encontrados dois schemas para a mesma entidade dentro da MF3.
- Os nomes dos conceitos mantem fronteiras claras: recebimento nao e pagamento, documento operacional nao e lancamento contabilistico, SAF-T nao e CSV generico, previsao nao e acao automatica.
- O frontend chama endpoints reais definidos nos proprios BKs e usa `apiClient`.
- Os services usam modelos existentes ou criados nos BKs anteriores/atuais.
- Dados por empresa passam sempre por `companyId` no backend.
- Roles aparecem no backend, nao apenas na UI.
- Os BKs seguintes conseguem consumir os artefactos principais da MF3 sem reescrever a macrofase.

## Drift documental encontrado

| Area | Estado | Acao recomendada |
| --- | --- | --- |
| Modo do relatorio anterior | O relatorio estava marcado como `corrigir_apenas`, mas a prompt desta execucao pede `auditar_apenas`. | Corrigido neste relatorio; BKs nao foram editados. |
| Dependencias futuras provaveis | `BK-MF4-10`, `BK-MF6-03`, `BK-MF7-06`, `BK-MF7-07` e `BK-MF8-04` podem consumir artefactos da MF3, mas os headers/canonica atuais nao declaram essas dependencias. | Rever numa execucao propria de sincronizacao documental; nao alterar matriz/backlog nesta auditoria. |
| RF35/RNF23 Excel | `BK-MF3-05` limita Excel a ficheiro exportado para CSV, porque leitura nativa `.xlsx` exigiria dependencia nao contratada no stack atual. | Se Excel nativo for obrigatorio, atualizar primeiro o contrato de stack e depois expandir MF3/MF7. |
| RF36/RNF24 SAF-T | `BK-MF3-06` entrega XML MVP rastreavel e nao promete conformidade legal completa. | Aprofundar conformidade em `BK-MF7-07` com especificacao legal/documental propria. |

## Verificacoes executadas

- Pesquisa de termos internos proibidos nos BKs MF3: exit code `1`, sem ocorrencias; este exit code e esperado quando `rg` nao encontra matches.
- Pesquisa estrutural dos passos: todos os 8 BKs tem 8 passos e cada passo contem os pontos 1 a 7.
- Pesquisa de `fetch(`, `payload: unknown` e `as any`: sem ocorrencias proibidas nos BKs MF3.
- Pesquisa de JSDoc/comentarios: todos os BKs MF3 tem JSDoc e comentarios didaticos em blocos de codigo relevantes.
- Consulta de `mockup/`: feita apenas para fluxo visual de Bancos, Contabilidade, Dashboard e navegacao; nao usada como contrato tecnico.
- `git diff --check`: exit code `0`, sem erros de whitespace.
- `bash scripts/validate-planificacao.sh`: exit code `0`, com `overall_pass: true`, `coverage_pass: true`, `consistency_pass: true`, `guides_pass: true`, `naming_pass: true` e `advisory_pass: false`.
- Avisos consultivos do validador: `outdated_docs` em documentos globais de planificacao e heuristicas `guides_quality` em MF0-MF3; nao bloqueiam `overall_pass`.

## Bloqueios ou TODOs restantes

- `TODO (BLOCKER)`: nenhum encontrado nos BKs MF3.
- Nao ha BK `PARCIAL` ou `CRITICO` na MF3 apos a reauditoria.
- Risco residual: sincronizacao futura de dependencias posteriores e clarificacao superior sobre Excel nativo/SAF-T completo.

## Ordem recomendada de correcao futura

1. Rever dependencias de BKs posteriores que provavelmente consomem MF3, sobretudo logs de integracao, reconciliacao, importacoes, SAF-T e explicabilidade de insights.
2. Se o projeto exigir leitura nativa `.xlsx`, atualizar `CONTRATO-STACK-IMPLEMENTACAO.md`, matriz/backlog e depois `BK-MF3-05` ou `BK-MF7-06`.
3. Aprofundar SAF-T legal em `BK-MF7-07` sem alterar retroativamente a fronteira MVP honesta de `BK-MF3-06`.
4. Reexecutar `bash scripts/validate-planificacao.sh` depois de qualquer sincronizacao documental.

## Resumo final

- MF processada: `MF3`.
- Numero de BKs analisados: `8`.
- Contagem OK/PARCIAL/CRITICO antes: `8/0/0`.
- Contagem OK/PARCIAL/CRITICO depois: `8/0/0`.
- BKs editados: `0`.
- Principais lacunas corrigidas: nenhuma nos BKs, porque o modo foi `auditar_apenas`; apenas este relatorio foi atualizado para refletir a auditoria correta.
- Decisoes tecnicas confirmadas: `apiClient`, `companyId` backend, roles backend, endpoints unicos, DTOs/validators, JSDoc, comentarios didaticos e separacao de responsabilidades.
- Decisoes de dominio OPSA confirmadas: IVA por documentos contabilizados, contas por empresa, reconciliacao como sugestao, previsao sem escrita operacional, importacoes com erros por linha, SAF-T MVP, reporting/KPIs com fontes.
- Drift documental encontrado: modo anterior do relatorio, dependencias futuras provaveis nao declaradas, limite Excel nativo e SAF-T completo.
- Verificacoes textuais executadas: estrutura dos passos, termos proibidos, pesquisa de `fetch(`, `payload: unknown`, `as any`, JSDoc/comentarios e consulta visual de `mockup/`.
- Resultado de `git diff --check`: exit code `0`, sem erros.
- Resultado de `bash scripts/validate-planificacao.sh`: exit code `0`, `overall_pass: true`, `advisory_pass: false`.
- Bloqueios ou TODOs restantes: nenhum blocker nos BKs MF3.

## Changelog

- `2026-06-13`: reauditoria em `auditar_apenas`; nenhum BK editado; relatorio alinhado com a prompt atual e com o estado auditado da MF3.
