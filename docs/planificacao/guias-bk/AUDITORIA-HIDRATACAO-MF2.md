# Relatorio de Auditoria dos Guias BK - MF2

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF2`
- `macro`: `MF2`
- `data`: `2026-06-08`
- `modo`: `auditar_apenas`
- `estado`: `auditoria_mf2_concluida`
- `escopo`: `docs/planificacao/guias-bk/MF2/`
- `BKs analisados`: `8`
- `BKs editados nesta execucao`: `0`

## Objetivo

Auditar os guias BK da MF2 no estado atual do repositório, sem editar os BKs dos alunos, para confirmar se estão pedagógicos, autocontidos, tecnicamente executáveis e coerentes com a aplicação final OPSA.

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
- Todos os BKs de `docs/planificacao/guias-bk/MF0/`
- Todos os BKs de `docs/planificacao/guias-bk/MF1/`
- Todos os BKs de `docs/planificacao/guias-bk/MF2/`
- BKs posteriores com dependencia direta ou tecnica relevante sobre MF2: `BK-MF3-07`, `BK-MF4-04` e `BK-MF6-04`.
- `mockup/` apenas como referencia visual/fluxo para Compras, Inventario e Contabilidade, sem uso como contrato tecnico final.

## Resultado executivo

| Metrica | Antes desta execucao | Depois da auditoria |
| --- | ---: | ---: |
| BKs analisados | 8 | 8 |
| BKs editados nesta execucao | 0 | 0 |
| OK | 8 | 8 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 0 |

Conclusao: no estado atual, os 8 BKs da MF2 ficam classificados como `OK`. A auditoria nao alterou guias; apenas revalidou a classificacao e atualizou este relatorio para refletir o modo `auditar_apenas`.

## Criterios aplicados

- Header, RF/RNF, dependencias, owner, prioridade, sprint, esforco e `proximo_bk` alinhados com matriz, backlog e contrato de campos.
- Minimo pedagogico cumprido: todos os BKs da MF2 têm 8 passos; cada passo inclui os pontos 1 a 7 exigidos pela prompt.
- Codigo apresentado com ficheiros, localizacao, validacao, explicacao e cenarios negativos.
- Backend com validacao, service, router/controller, HTTP status, roles, contexto multiempresa e erros controlados.
- Frontend com cliente API tipado, `credentials: "include"`, estados de loading/error/success/empty e sem `payload: unknown`.
- Fluxos contabilisticos com periodo fiscal, plano SNC, dupla entrada, origem dos saldos e bloqueios quando aplicavel.
- Ausencia de linguagem interna proibida nos BKs da MF2.

## Classificacao por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF2-01` | `OK` | Cobre RF23, reutiliza o router de compras de `BK-MF1-10`, preserva `/approve` e `/post-state`, acrescenta `/reject` e `/approval-history`, aplica multiempresa, roles, transacao e auditoria. |
| `BK-MF2-02` | `OK` | Cobre RF24 com `StockMovement`, `StockBalance`, validadores, service transacional, bloqueio de saldo negativo, auditoria e preparacao para FIFO, contagens, alertas e relatorios. |
| `BK-MF2-03` | `OK` | Cobre RF25 com camadas FIFO, consumos explicaveis, preview sem escrita, integracao com movimentos de stock e regras de custo no backend. |
| `BK-MF2-04` | `OK` | Cobre RF26 com contagens em rascunho, linhas de contagem, publicacao unica, ajustes via movimento de stock, FIFO e auditoria. |
| `BK-MF2-05` | `OK` | Cobre RF27 com configuracao de minimo/maximo, listagem de alertas, endpoint `PUT /api/inventory/stock-alerts/settings`, roles e multiempresa; nao cria movimentos automaticos. |
| `BK-MF2-06` | `OK` | Cobre RF28 com lancamentos manuais equilibrados, anexos privados, `source=MANUAL`, bloqueio de periodo fiscal fechado, contas SNC da empresa e auditoria. |
| `BK-MF2-07` | `OK` | Cobre RF29 com balancete, razao, exports XLSX/PDF, filtros por data/empresa, roles de leitura e fonte unica para UI/export. |
| `BK-MF2-08` | `OK` | Cobre RF30 com DR e Balanco derivados do balancete, endpoints `GET /api/accounting/statements/*`, roles de leitura e limites claros de mapa interno explicavel. |

## BKs PARCIAL ou CRITICO

Nenhum BK da MF2 ficou classificado como `PARCIAL` ou `CRITICO` nesta auditoria.

## Decisoes tecnicas confirmadas

- `BK-MF2-01` nao cria endpoint paralelo de aprovacao; estende o fluxo existente de compras.
- `BK-MF2-02` cria a base operacional de stock com saldos por empresa, artigo e armazem.
- `BK-MF2-03` implementa FIFO no backend, sem media ponderada e sem calculo de custo no browser.
- `BK-MF2-04` transforma diferencas de contagem em movimentos de ajuste, evitando edicao direta de saldo.
- `BK-MF2-05` trata alertas como consulta/configuracao; alertas nao alteram stock automaticamente.
- `BK-MF2-06` limita edicao a lancamentos manuais e reutiliza contratos contabilisticos anteriores.
- `BK-MF2-07` reutiliza services de reporting tanto para UI como para exportacoes.
- `BK-MF2-08` reutiliza `buildTrialBalance` e nao promete demonstracoes legais completas fora do escopo documentado.

## Decisoes de dominio OPSA confirmadas

- Dados por empresa sao filtrados por `companyId` vindo da sessao.
- Roles sao aplicadas no backend, nao apenas escondidas na UI.
- Operacoes sensiveis geram `AuditLog` quando alteram estado, stock ou contabilidade.
- Inventario nao permite saldo negativo sem erro controlado.
- FIFO e regra de custo por camadas, com origem e consumos explicaveis.
- Lancamentos contabilisticos respeitam plano SNC e periodo fiscal aberto.
- Relatorios financeiros derivam de `JournalEntryLine`, nao de totais manuais inseridos na UI.
- IA nao aparece na MF2 como executor de alteracoes contabilisticas.

## Drift documental encontrado

- `docs/planificacao/guias-bk/_TEMPLATE-BK.md` e `docs/planificacao/guias-bk/README.md` ainda descrevem o formato antigo com `Bloco pedagogico`, `Bloco operacional` e trecho tecnico unico. Os BKs da MF2 seguem o formato linear 1..7 exigido pela prompt.
- `docs/planificacao/README.md` apresenta uma hierarquia resumida que nao inclui `CONTRATO-CAMPOS-BK.md` nem `CONTRATO-STACK-IMPLEMENTACAO.md` na mesma ordem da prompt. Nesta auditoria foi seguida a hierarquia da prompt.
- O worktree ja continha alteracoes em documentos canonicos e nos BKs da MF2 antes desta execucao; a auditoria trabalhou sobre esse estado atual e nao reverteu alteracoes pre-existentes.
- Os BKs posteriores diretamente dependentes consultados (`BK-MF3-07`, `BK-MF4-04`) ainda estao em formato mais generico do que a MF2, mas isso fica fora do escopo de edicao desta execucao.

## Mapa de integracao da MF

### `BK-MF2-01`

- Ficheiros criados/editados no plano do BK: `purchaseApprovalHistoryValidators.js`, `purchaseApprovalService.js`, `purchaseApprovalRoutes.js`, `purchaseApprovalApi.ts`, `PurchaseApprovalPage.tsx`, `schema.prisma`.
- Exports produzidos: `parseApprovalReason`, `parseRejectionReason`, `approvePurchaseDocument`, `rejectPurchaseDocument`, `markPurchaseDocumentPosted`, `listPurchaseApprovalHistory`.
- Imports consumidos de BKs anteriores: `postPurchaseDocumentInTransaction`, `requireAuth`, `requireCompanyContext`, `requireRole`, `toHttpError`.
- Endpoints criados/preservados: `POST /api/purchases/documents/:id/approve`, `POST /api/purchases/documents/:id/reject`, `POST /api/purchases/documents/:id/post-state`, `GET /api/purchases/documents/:id/approval-history`.
- Regras aplicadas: multiempresa, roles de decisao/contabilidade/leitura, transacao e auditoria.
- BKs seguintes dependentes: `BK-MF2-02`.

### `BK-MF2-02`

- Ficheiros criados/editados no plano do BK: `stockMovementValidators.js`, `stockMovementService.js`, `stockMovementRoutes.js`, `stockMovementsApi.ts`, `StockMovementsPage.tsx`, `schema.prisma`.
- Exports produzidos: `parseStockMovement`, `createStockMovementInTransaction`, `createStockMovement`.
- Endpoints criados: `POST /api/inventory/stock-movements`, `GET /api/inventory/stock-movements`.
- Regras aplicadas: multiempresa, roles de inventario, transacao, auditoria e bloqueio de saldo negativo.
- BKs seguintes dependentes: `BK-MF2-03`, `BK-MF2-04`, `BK-MF2-05`, `BK-MF3-07`.

### `BK-MF2-03`

- Ficheiros criados/editados no plano do BK: `fifoCostService.js`, `fifoCostRoutes.js`, `stockMovementService.js`, `stockMovementsApi.ts`, `FifoCostPage.tsx`, `schema.prisma`.
- Exports produzidos: `createFifoLayer`, `consumeFifoLayers`, `previewFifoCost`, `applyFifoToMovementInTransaction`, `createStockMovementWithCostInTransaction`.
- Endpoint criado: `GET /api/inventory/fifo-cost/preview`.
- Regras aplicadas: camadas FIFO por empresa/artigo/armazem, custo unitario obrigatorio para entradas, consumo FIFO em saidas/devolucoes e preview sem escrita.
- BKs seguintes dependentes: `BK-MF2-04`, `BK-MF6-04`.

### `BK-MF2-04`

- Ficheiros criados/editados no plano do BK: `inventoryCountService.js`, `inventoryCountRoutes.js`, `inventoryCountsApi.ts`, `InventoryCountPage.tsx`, `schema.prisma`.
- Exports produzidos: `createInventoryCount`, `saveInventoryCountLines`, `postInventoryCount`.
- Endpoints criados: `POST /api/inventory/counts`, `PATCH /api/inventory/counts/:id/lines`, `POST /api/inventory/counts/:id/post`.
- Regras aplicadas: contagem em rascunho, publicacao unica, ajustes via movimentos, FIFO, multiempresa e auditoria.
- BKs seguintes dependentes: `BK-MF2-05`.

### `BK-MF2-05`

- Ficheiros criados/editados no plano do BK: `stockAlertService.js`, `stockAlertRoutes.js`, `stockAlertsApi.ts`, `StockAlertsPage.tsx`, `schema.prisma`, `server.js`.
- Exports produzidos: `parseStockAlertSetting`, `saveStockAlertSetting`, `listStockAlerts`.
- Endpoints criados: `GET /api/inventory/stock-alerts`, `PUT /api/inventory/stock-alerts/settings`.
- Regras aplicadas: configuracao por empresa/artigo/armazem, leitura por role, escrita por role, ausencia de movimentos automaticos.
- BKs seguintes dependentes: `BK-MF4-04`.

### `BK-MF2-06`

- Ficheiros criados/editados no plano do BK: `manualJournalService.js`, `journalAttachmentStorage.js`, `manualJournalRoutes.js`, `manualJournalsApi.ts`, `ManualJournalPage.tsx`, `schema.prisma`.
- Exports produzidos: `parseManualJournal`, `getManualJournal`, `createManualJournal`, `updateManualJournal`, `writePrivateJournalAttachment`.
- Endpoints criados: `POST /api/accounting/manual-journals`, `GET /api/accounting/manual-journals/:id`, `PATCH /api/accounting/manual-journals/:id`, `POST /api/accounting/manual-journals/:id/attachments`.
- Regras aplicadas: dupla entrada, contas SNC da empresa, periodo fiscal aberto, `source=MANUAL`, anexos privados e auditoria.
- BKs seguintes dependentes: `BK-MF2-07`.

### `BK-MF2-07`

- Ficheiros criados/editados no plano do BK: `accountingReportFilters.js`, `accountingReportService.js`, `accountingReportExporters.js`, `accountingReportRoutes.js`, `accountingReportsApi.ts`, `AccountingReportsPage.tsx`, `apps/api/package.json`.
- Exports produzidos: `parseDateRange`, `buildTrialBalance`, `buildLedger`, `trialBalanceToXlsx`, `ledgerToPdf`.
- Endpoints criados: `GET /api/accounting/reports/trial-balance`, `GET /api/accounting/reports/ledger`, `GET /api/accounting/reports/trial-balance.xlsx`, `GET /api/accounting/reports/ledger.pdf`.
- Regras aplicadas: roles de leitura, filtros por empresa, datas obrigatorias e fonte unica para UI/export.
- BKs seguintes dependentes: `BK-MF2-08`.

### `BK-MF2-08`

- Ficheiros criados/editados no plano do BK: `financialStatementService.js`, `financialStatementRoutes.js`, `financialStatementsApi.ts`, `FinancialStatementsPage.tsx`, `server.js`, `App.tsx`.
- Exports produzidos: `buildIncomeStatement`, `buildBalanceSheet`, `createFinancialStatementRouter`.
- Endpoints criados: `GET /api/accounting/statements/income-statement`, `GET /api/accounting/statements/balance-sheet`.
- Imports consumidos: `parseDateRange`, `buildTrialBalance`, `requireAuth`, `requireCompanyContext`, `requireRole`, `toHttpError`.
- Regras aplicadas: multiempresa, roles de leitura, mapas internos explicaveis e calculo derivado do balancete.
- BK seguinte dependente: `BK-MF3-01`.

## Coerencia global da MF

- Nao foram detetados dois endpoints concorrentes para a mesma acao dentro da MF2.
- Nao foram detetados dois schemas para a mesma entidade dentro da MF2.
- Nomes de modulos e endpoints estao consistentes entre arquitetura, router, frontend e expected results.
- Frontend chama endpoints definidos nos blocos backend.
- Services importam contratos criados por BKs anteriores ou declarados no proprio BK.
- Dados por empresa sao tratados no backend nos fluxos auditados.
- Roles/permissoes sao aplicadas no backend nos fluxos auditados.
- O proximo BK de cada guia consegue reutilizar os exports/endpoints entregues pelo BK anterior.

## Ordem recomendada de correcao

1. Nenhuma correcao obrigatoria nos BKs da MF2 nesta execucao.
2. Fora do escopo da MF2, alinhar `_TEMPLATE-BK.md`, `guias-bk/README.md` e o validador com o formato linear 1..7 atualmente usado nos guias corrigidos.
3. Fora do escopo desta execucao, rever BKs posteriores diretamente dependentes de MF2 para elevar a mesma densidade pedagogica e tecnica.

## Verificacoes finais

| Comando | Resultado |
| --- | --- |
| `rg -n "hidrata|pos-auditoria|scaffold|roteiro generico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|solucao parcial|payload: unknown|as any" docs/planificacao/guias-bk/MF2/*.md` | Sem ocorrencias. Exit code `1`, esperado quando `rg` nao encontra matches. |
| `git diff --check` | OK. Exit code `0`. |
| `bash scripts/validate-planificacao.sh` | Executou com exit code `0`, mas o JSON indica `overall_pass=false`, `consistency_pass=false` e `guides_pass=false`. |

### Resultado do validador global

- `coverage_pass`: `true`
- `naming_pass`: `true`
- `consistency_pass`: `false`
- `guides_pass`: `false`
- `overall_pass`: `false`

Motivos principais reportados:

- `outdated_docs`: `PLANO-IMPLEMENTACAO-TOTAL.md`, `DISTRIBUICAO-RESPONSABILIDADES.md`, `PLANO-SPRINTS.md`, `SCORECARD-SPRINTS.md`, `GUIAO-DOCENTE-SEMANAL.md`, `OPERACAO-DEPLOY-ROLLBACK.md` e `MF-VIEWS.md`.
- `guide_content_issues`: o validador ainda procura o contrato antigo (`Bloco pedagogico`, `Bloco operacional`, trecho tecnico unico e linha especifica de handoff), afetando MF0, MF1 e MF2.

## Bloqueios e TODOs restantes

- Nenhum `TODO (BLOCKER)` identificado nos BKs da MF2.
- O alinhamento do template/README/validador global com o formato linear 1..7 permanece fora do escopo desta execucao.
- As alteracoes pre-existentes no worktree devem ser revistas pelo responsavel antes de commit/PR.
