## Resultado Geral

- Projeto: OPSA
- Alvo auditado: MF2
- Implementacao auditada: `real_dev/`
- Estado: PASS COM RISCOS
- Resumo: A implementacao real da MF2 existe em `real_dev/api` e `real_dev/web`, cobre os 8 BKs alvo, reutiliza contratos MF0/MF1 e monta endpoints, modelos, services, UI e testes para inventario, FIFO, contagens, alertas, lancamentos manuais, balancete/razao e demonstracoes financeiras. Nao foram encontrados findings P0/P1. Os riscos principais sao de validacao: a integracao persistida real nao correu por falta de `TEST_DATABASE_URL`, o script frontend MF2 cobre apenas parte dos ecras, e a evidence MF2 tem contagens de testes desatualizadas face ao resultado atual.
- Coerencia entre MFs: COM RISCOS
- Pode avancar para a proxima macrofase?: Sim, com riscos

## Escopo Auditado

- BKs alvo: `BK-MF2-01`, `BK-MF2-02`, `BK-MF2-03`, `BK-MF2-04`, `BK-MF2-05`, `BK-MF2-06`, `BK-MF2-07`, `BK-MF2-08`.
- MFs implementadas consideradas: MF0, MF1 e MF2. Nao foi encontrada MF3 implementada em `real_dev/`.
- Profundidade de coerencia: `vizinhas`, com foco MF1 -> MF2 e verificacao MF2 -> MF3 como nao aplicavel por ausencia de implementacao MF3.
- Documentos consultados: `README.md`; `docs/RF.md`; `docs/RNF.md`; `docs/planificacao/README.md`; `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`; `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`; `docs/planificacao/backlogs/BACKLOG-MVP.md`; `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`; `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`; `docs/planificacao/backlogs/MF-VIEWS.md`; `docs/planificacao/sprints/PLANO-SPRINTS.md`; `docs/planificacao/guias-bk/README.md`; todos os guias em `docs/planificacao/guias-bk/MF2/`; evidence MF2; relatorio anterior de auditoria MF1; relatorios MF2 existentes.
- Pastas de codigo analisadas: `real_dev/api`, `real_dev/web`.
- Pastas ignoradas: `mockup/`, por ser prototipo; `apps/`, por pertencer ao trabalho dos alunos e nao ser destino de implementacao nesta auditoria; `node_modules/`, por ser dependencia instalada; `real_dev/web/dist`, excepto como artefacto de build.
- Worktree: modificada antes da auditoria. `git status --short` indicava `M docs/planificacao/scripts/auditar_planificacao.py`, `?? docs/evidence/MF2/`, `?? docs/planificacao/auditorias/AUDITORIA-IMPLEMENTACAO-MF2-2026-06-11.md` e `?? docs/planificacao/auditorias/AUDITORIA-IMPLEMENTACAO-OPSA-MF2-2026-06-12.md`.
- Limitacoes da auditoria: nao foi executado teste de integracao persistida contra PostgreSQL real por falta de `TEST_DATABASE_URL`; nao foi feito smoke manual em browser; a validacao UI ficou limitada a `typecheck`, `build` e script estatico `test:mf2`.

## Validacao por BK

### BK-MF2-01

- Estado: OK
- Objetivo/scope: historico e justificacoes para aprovacoes/reprovacoes de compras, mantendo `/approve`, criando `/reject` e `/approval-history`, com auditoria.
- Implementacao encontrada: `PurchaseApprovalHistory` em Prisma; `approvePurchaseDocument` e `rejectPurchaseDocument` criam historico e `AuditLog`; `GET /:id/approval-history` usa guard proprio para `ADMIN`, `GESTOR` e `AUDITOR`.
- Cumpre: historico persistente, justificacao obrigatoria na reprovacao, transacao estado+historico, preservacao de `/post-state`, contexto multiempresa e leitura por auditor.
- Falhas: nenhuma encontrada.
- Negativos/testes: reprovar sem justificacao e rejeitado; router expoe reprovar/historico; teste HTTP confirma que `AUDITOR` consulta historico e nao aprova.
- Evidencia: `real_dev/api/prisma/schema.prisma:607`; `real_dev/api/src/modules/purchase-approval/purchaseApprovalRoutes.js:40`; `real_dev/api/src/modules/purchase-approval/purchaseApprovalRoutes.js:81`; `real_dev/api/src/modules/purchase-approval/purchaseApprovalService.js:77`; `real_dev/api/tests/contracts/mf2-contracts.test.js:142`.
- Riscos: integracao persistida real nao executada neste ambiente.
- Fora de scope detetado: nenhum.
- Recomendacao: executar a suite persistida com PostgreSQL efemero antes do fecho formal.

### BK-MF2-02

- Estado: OK
- Objetivo/scope: movimentos de stock com entradas, saidas, transferencias, devolucoes, saldos por artigo/armazem, bloqueio de saldo negativo e auditoria.
- Implementacao encontrada: `StockBalance`, `StockMovement`, validators, service transacional e rotas `GET/POST /api/inventory/stock-movements`.
- Cumpre: validacao de tipo, quantidade, motivo, artigo, armazem origem/destino, saldo negativo, `companyId` e `AuditLog`.
- Falhas: nenhuma encontrada.
- Negativos/testes: transferencia para o mesmo armazem devolve erro; permissoes de inventario separadas por role; fluxo persistido existe mas nao correu sem DB.
- Evidencia: `real_dev/api/prisma/schema.prisma:623`; `real_dev/api/prisma/schema.prisma:639`; `real_dev/api/src/modules/inventory/stockMovementValidators.js:37`; `real_dev/api/src/modules/inventory/stockMovementService.js:84`; `real_dev/api/src/modules/inventory/stockMovementRoutes.js:42`.
- Riscos: integracao persistida real nao executada neste ambiente.
- Fora de scope detetado: nenhum.
- Recomendacao: correr `test:integration` com `TEST_DATABASE_URL`.

### BK-MF2-03

- Estado: OK
- Objetivo/scope: calculo FIFO por camadas, preview sem escrita e bloqueio de camadas insuficientes.
- Implementacao encontrada: `StockCostLayer`, `StockCostConsumption`, `consumeFifoLayers`, `createCostLayer`, `previewFifoCost` e rota `GET /api/inventory/fifo-cost/preview`.
- Cumpre: FIFO por `createdAt`, consumo multi-camada, preview com `write:false`, valorizacao de entradas/ajustes positivos e transferencia de custo.
- Falhas: nenhuma encontrada.
- Negativos/testes: entrada valorizada sem custo e rejeitada; consumo FIFO multi-camada validado.
- Evidencia: `real_dev/api/prisma/schema.prisma:668`; `real_dev/api/prisma/schema.prisma:688`; `real_dev/api/src/modules/inventory/fifoCostService.js:14`; `real_dev/api/src/modules/inventory/stockMovementService.js:105`; `real_dev/api/tests/unit/mf2-services.test.js:64`.
- Riscos: integracao persistida real nao executada neste ambiente.
- Fora de scope detetado: nenhum.
- Recomendacao: manter teste persistido ativo em CI com PostgreSQL efemero.

### BK-MF2-04

- Estado: OK
- Objetivo/scope: contagens fisicas por armazem, edicao em rascunho, publicacao de ajustes auditados e reutilizacao de movimentos/FIFO.
- Implementacao encontrada: `InventoryCount`, `InventoryCountLine`, rotas `GET/POST /counts`, `PATCH /counts/:id/lines`, `POST /counts/:id/post`, e publicacao transacional via `createStockMovementWithCostInTransaction`.
- Cumpre: contagem `DRAFT`, linhas com quantidade esperada/contada, bloqueio de duplicados, bloqueio de publicacao duplicada, ajustes transacionais e `AuditLog` com detalhes.
- Falhas: nenhuma encontrada.
- Negativos/testes: linhas duplicadas rejeitadas; router expoe edicao de linhas; publicacao regista audit log com detalhes.
- Evidencia: `real_dev/api/prisma/schema.prisma:705`; `real_dev/api/prisma/schema.prisma:724`; `real_dev/api/src/modules/inventory/inventoryCountService.js:28`; `real_dev/api/src/modules/inventory/inventoryCountService.js:219`; `real_dev/api/src/modules/inventory/inventoryCountService.js:266`; `real_dev/api/tests/unit/mf2-services.test.js:311`.
- Riscos: integracao persistida real nao executada neste ambiente.
- Fora de scope detetado: nenhum.
- Recomendacao: validar em PostgreSQL efemero o fluxo criar contagem -> publicar -> ajustar saldos/camadas.

### BK-MF2-05

- Estado: OK
- Objetivo/scope: alertas de stock minimo, maximo e artigos parados, com origem explicavel dos dados.
- Implementacao encontrada: `StockAlertSetting`, `saveStockAlertSetting`, `listStockAlerts` e rotas `GET /stock-alerts`, `PUT /stock-alerts/settings`.
- Cumpre: configuracao por empresa/artigo/armazem, validacao minimo/maximo, artigo parado por ultimo movimento, `source` explicativo e ausencia de alteracao automatica de stock.
- Falhas: nenhuma funcional encontrada.
- Negativos/testes: minimo maior que maximo rejeitado.
- Evidencia: `real_dev/api/prisma/schema.prisma:739`; `real_dev/api/src/modules/inventory/stockAlertService.js:13`; `real_dev/api/src/modules/inventory/stockAlertService.js:97`; `real_dev/api/src/modules/inventory/stockAlertRoutes.js:33`; `real_dev/api/tests/unit/mf2-services.test.js:118`.
- Riscos: cobertura automatizada direta para `STOPPED_ITEM` nao existe, apesar da regra estar implementada.
- Fora de scope detetado: nenhum.
- Recomendacao: acrescentar teste unitario para artigo parado.

### BK-MF2-06

- Estado: OK
- Objetivo/scope: criar, consultar e editar lancamentos manuais equilibrados, com anexos privados e bloqueio de periodo fechado.
- Implementacao encontrada: `manualJournalService`, `manualJournalRoutes`, `journalAttachmentStorage` e modelo `JournalAttachment`.
- Cumpre: dupla entrada, contas da empresa ativa, `source=MANUAL`, validacao de periodo aberto, anexos PDF/PNG/JPEG com tamanho e assinatura, storage privado e auditoria.
- Falhas: nenhuma encontrada.
- Negativos/testes: lancamento desequilibrado, MIME invalido, conteudo vazio, assinatura divergente, storage privado e PNG valido.
- Evidencia: `real_dev/api/prisma/schema.prisma:453`; `real_dev/api/prisma/schema.prisma:758`; `real_dev/api/src/modules/accounting/manualJournalService.js`; `real_dev/api/src/modules/accounting/journalAttachmentStorage.js`; `real_dev/api/tests/unit/mf2-services.test.js:183`.
- Riscos: limite HTTP de `express.json()` para anexos base64 nao foi validado em runtime; nao e falha do BK porque o service valida tamanho e assinatura.
- Fora de scope detetado: nenhum.
- Recomendacao: documentar/alinhar limite HTTP se forem exigidos anexos maiores em ambiente real.

### BK-MF2-07

- Estado: OK
- Objetivo/scope: balancete e razao por empresa/periodo, exportaveis a partir dos mesmos dados.
- Implementacao encontrada: `accountingReportFilters`, `accountingReportService`, `accountingReportExporters`, `accountingReportRoutes` e UI/API client.
- Cumpre: filtros por `companyId`, intervalo validado, razao por conta, balancete por conta, exportacao XLSX/PDF e permissao `ACCOUNTING_READ`.
- Falhas: nenhuma encontrada.
- Negativos/testes: periodo invertido rejeitado; gestor consegue leitura contabilistica sem ganhar escrita.
- Evidencia: `real_dev/api/src/modules/accounting-reports/accountingReportFilters.js:10`; `real_dev/api/src/modules/accounting-reports/accountingReportService.js:14`; `real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js:36`; `real_dev/api/src/modules/accounting-reports/accountingReportExporters.js`; `real_dev/web/src/pages/mf2Pages.tsx:489`.
- Riscos: exportacao binaria nao foi exercitada em teste persistido real neste ambiente.
- Fora de scope detetado: nenhum.
- Recomendacao: acrescentar teste de exportacao binaria se for criterio de defesa.

### BK-MF2-08

- Estado: OK
- Objetivo/scope: Demonstração de Resultados por periodo e Balanco interno, com origem dos saldos e sem promessa de submissao legal oficial.
- Implementacao encontrada: `financialStatementService`, `financialStatementRoutes` e UI/API client.
- Cumpre: reutiliza balancete, separa contas 6/7 para DR, organiza Balanco interno, devolve `checkCents`, inclui fonte e nota de limite legal.
- Falhas: nenhuma encontrada.
- Negativos/testes: balanco separa contas por natureza/sinal e devolve `checkCents`.
- Evidencia: `real_dev/api/src/modules/financial-statements/financialStatementService.js:18`; `real_dev/api/src/modules/financial-statements/financialStatementService.js:45`; `real_dev/api/src/modules/financial-statements/financialStatementRoutes.js:32`; `real_dev/web/src/pages/mf2Pages.tsx:551`; `real_dev/api/tests/unit/mf2-services.test.js:324`.
- Riscos: classificacao contabilistica e simplificada, mas o BK define o mapa como interno e explicavel.
- Fora de scope detetado: nenhum.
- Recomendacao: manter a nota de limite legal visivel na UI/resposta.

## Coerencia Entre MFs

### MF anterior -> MF alvo

- MFs comparadas: MF1 -> MF2, com dependencias MF0 relevantes.
- Contratos esperados: autenticacao por cookie, `companyId`, roles/permissoes, artigos, armazens, plano SNC, periodos fiscais, `JournalEntry`, `JournalEntryLine`, compras aprovadas/lancadas e `AuditLog`.
- Contratos encontrados: MF2 reutiliza `requireAuth`, `requireCompanyContext`, `Permission`, `Item`, `Warehouse`, `Account`, `FiscalPeriod`, `JournalEntry`, `PurchaseDocument` e `AuditLog`.
- Quebras/regressoes: sem quebra encontrada em leitura estatica/testes unitarios/contratos.
- Riscos: falta de teste persistido real impede confirmar ponta-a-ponta com PostgreSQL neste ambiente.
- Estado: COM RISCOS

### MF alvo -> MF seguinte

- MFs comparadas: MF2 -> MF3.
- Contratos esperados: MF3 documentada consome dados de inventario, IVA, bancos/imports e relatorios; `BK-MF3-07` depende de `BK-MF2-02`.
- Contratos encontrados: nao ha MF3 implementada em `real_dev/`; apenas documentacao MF3 existe.
- Quebras/regressoes: nao aplicavel.
- Riscos: nao aplicavel enquanto MF3 nao existir no codigo real.
- Estado: NAO APLICAVEL

### Cadeia implementada

- Cadeia auditada: MF0 -> MF1 -> MF2.
- Fluxos cumulativos verificados: autenticacao/contexto, compras/aprovacao/historico, inventario/FIFO/contagens/alertas, contabilidade manual/reporting/demonstracoes.
- Pontos de desconexao: integracao persistida pendente por ambiente; cobertura frontend MF2 estatica incompleta.
- Estado: COM RISCOS

## Findings

### P0 - Bloqueante

Sem findings.

### P1 - Alto

Sem findings.

### P2 - Medio

- P2-MF2-INTEGRATION-NOT-RUN: Integracao persistida da MF2 nao foi executada contra PostgreSQL real.
  - Evidencia: `npm --prefix real_dev/api run test:integration` falhou com erro controlado: `Definir TEST_DATABASE_URL para correr integração persistida da MF2`; `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` passou com 1 teste skipped.
  - Documento/BK violado: validacao/evidence final dos BKs MF2 dependentes de persistencia real.
  - Impacto: unit/contract/static dao boa confianca, mas a auditoria nao confirma neste ambiente o fluxo completo com migrations, constraints PostgreSQL, persistencia e rollback real.
  - Correcao recomendada: correr `npm --prefix real_dev/api run test:integration` com `TEST_DATABASE_URL` a apontar para uma base PostgreSQL efemera cujo nome contenha `test`, `audit` ou `ci`.

- P2-MF2-WEB-CONTRACT-COVERAGE: O teste estatico frontend MF2 cobre apenas BK-MF2-01 e BK-MF2-06.
  - Evidencia: `real_dev/web/scripts/check-mf2-pages.mjs:10` verifica strings de reprovar/historico; `real_dev/web/scripts/check-mf2-pages.mjs:21` verifica anexos; nao ha asserts para movimentos de stock, FIFO, contagens, alertas, balancete/razao ou demonstracoes financeiras.
  - Documento/BK violado: cobertura funcional esperada para os 8 BKs alvo.
  - Impacto: `typecheck` e `build` confirmam compilacao, mas regressao de UI nos BKs MF2-02/03/04/05/07/08 pode passar despercebida.
  - Correcao recomendada: expandir `check-mf2-pages.mjs` para validar chamadas e textos/fluxos principais dos 8 BKs MF2, ou criar smoke tests de UI.

### P3 - Baixo

- P3-MF2-EVIDENCE-COUNTS-STALE: Evidence MF2 tem contagens de testes desatualizadas.
  - Evidencia: `docs/evidence/MF2/README.md` regista `test:unit` como 40/40 e `test:contracts` como 18/18; nesta auditoria `test:unit` passou 41/41 e `test:contracts` passou 19/19.
  - Documento/BK violado: evidence de fecho da macrofase.
  - Impacto: baixo; a evidence continua qualitativamente correta, mas os numeros deixam de bater com o estado atual.
  - Correcao recomendada: atualizar evidence MF2 numa tarefa separada, sem misturar com correcao de codigo.

## Scope Creep

- Funcionalidades fora de scope encontradas: nenhuma funcionalidade que altere produto/contrato fora da MF2. `ADJUSTMENT` em movimentos e FIFO e derivado explicitamente nos guias MF2.
- BK/MF a que parecem pertencer: nao aplicavel.
- Risco: baixo.
- Recomendacao: manter fronteiras: alertas nao devem criar compras automaticas; demonstracoes financeiras internas nao devem ser apresentadas como submissao legal oficial; IA continua fora da MF2.

## Seguranca e Privacidade

- Resultado: OK COM RISCOS RESIDUAIS
- Problemas encontrados: nenhum problema P0/P1 em autenticacao, autorizacao, segredos, storage ou exposicao multiempresa nos ficheiros MF2 analisados.
- Riscos residuais: integracao persistida nao executada; limite HTTP de anexos nao validado em runtime; pesquisa estatica encontrou referencias a password/token/mock em modulos MF0 e testes, mas contextualizadas e sem evidencia de segredo exposto; nao foram encontrados `localStorage`, `sessionStorage`, `eval`, `new Function`, `dangerouslySetInnerHTML` ou raw queries nos modulos MF2 analisados.

## Testes e Comandos

- Comandos executados:
  - `git status --short`: worktree modificada antes da auditoria.
  - `git branch --show-current`: `codex/MF2`.
  - `git diff --check`: passou sem output.
  - `bash scripts/validate-planificacao.sh`: passou com `overall_pass: true`; `advisory_pass: false` por avisos consultivos/outdated docs.
  - `npm --prefix real_dev/api run syntax:check`: passou.
  - `npm --prefix real_dev/api run prisma:validate`: falhou sem `DATABASE_URL`.
  - `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa_audit npm --prefix real_dev/api run prisma:validate`: passou.
  - `npm --prefix real_dev/api run test:unit`: passou, 41/41.
  - `npm --prefix real_dev/api run test:contracts`: passou, 19/19.
  - `npm --prefix real_dev/api run test:integration`: falhou por falta de `TEST_DATABASE_URL`.
  - `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration`: passou com 1 teste skipped.
  - `npm --prefix real_dev/web run test:mf2`: passou.
  - `npm --prefix real_dev/web run typecheck`: passou.
  - `npm --prefix real_dev/web run build`: passou; gerou/atualizou artefactos em `real_dev/web/dist`.
- Resultado observado: validacoes estaticas, unitarias, contratos, typecheck e build passaram; integracao real ficou pendente por ambiente.
- Comandos nao executados: arranque de servidor e smoke manual em browser; `npm test` agregado, porque unit/contracts/integration foram corridos separadamente.
- Motivo: auditoria focada em codigo/testes locais; integracao real exige base PostgreSQL efemera.
- Impacto: confianca alta nos contratos e services; confianca moderada nos fluxos persistidos fim-a-fim.

## Matriz de Rastreabilidade

| BK | RF/RNF | Entrega esperada | Implementado | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- |
| BK-MF2-01 | RF23 | Historico e justificacoes de aprovacoes/reprovacoes | Sim | OK | `purchaseApprovalService.js`, `purchaseApprovalRoutes.js`, `PurchaseApprovalHistory` |
| BK-MF2-02 | RF24 | Movimentos de stock e saldos | Sim | OK | `stockMovementService.js`, `stockMovementRoutes.js`, `StockBalance`, `StockMovement` |
| BK-MF2-03 | RF25, RNF11 relacionado | FIFO por camadas e preview | Sim | OK | `fifoCostService.js`, `StockCostLayer`, `StockCostConsumption` |
| BK-MF2-04 | RF26 | Contagens fisicas e ajustes | Sim | OK | `inventoryCountService.js`, `InventoryCount`, `InventoryCountLine` |
| BK-MF2-05 | RF27 | Alertas minimo/maximo/parado | Sim | OK | `stockAlertService.js`, `StockAlertSetting` |
| BK-MF2-06 | RF28 | Lancamentos manuais com anexos | Sim | OK | `manualJournalService.js`, `journalAttachmentStorage.js`, `JournalAttachment` |
| BK-MF2-07 | RF29, RNF22 | Balancete/razao exportavel | Sim | OK | `accountingReportService.js`, `accountingReportRoutes.js`, exporters |
| BK-MF2-08 | RF30 | DR e Balanco interno | Sim | OK | `financialStatementService.js`, `financialStatementRoutes.js` |

## Matriz de Coerencia Entre MFs

| Origem | Contrato entregue | Consumidor | Uso esperado | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- |
| MF0 | Auth cookie, company context, roles | MF2 routers | Proteger endpoints por sessao/empresa/permissao | OK | `server.js`, `permissionMiddleware.js`, routers MF2 |
| MF0 | `Item`, `Warehouse` | BK-MF2-02/03/04/05 | Inventario por artigo/armazem | OK | Prisma schema, services inventory |
| MF0 | `Account`, `FiscalPeriod` | BK-MF2-06/07/08 | Lancamentos e reporting | OK | `manualJournalService.js`, `accountingReportService.js` |
| MF1 | `PurchaseDocument` e workflow de compras | BK-MF2-01 | Historico de decisoes | OK | `purchaseApprovalService.js`, `purchaseApprovalRoutes.js` |
| MF1 | `JournalEntry`/`JournalEntryLine` | BK-MF2-06/07/08 | Reutilizacao contabilistica | OK | `manualJournalService.js`, `financialStatementService.js` |
| MF2 | Inventario e alertas | MF3/MF4 futuras | Relatorios/alertas posteriores | NAO APLICAVEL | Sem MF3 implementada em `real_dev/` |

## Conclusao

- Decisao: PASS COM RISCOS.
- O que bloqueia o fecho: nao ha bloqueador P0/P1 encontrado nesta auditoria.
- O que deve ser corrigido antes de avancar: correr integracao persistida real com `TEST_DATABASE_URL`; alargar cobertura frontend MF2 para todos os BKs; atualizar contagens da evidence MF2.
- O que pode ficar como follow-up: teste unitario para `STOPPED_ITEM`, teste de exportacoes binarias e alinhamento/documentacao do limite HTTP para anexos.
- Impacto na cadeia de MFs: MF2 encaixa tecnicamente com MF0/MF1 e entrega contratos utilizaveis por MFs seguintes; o risco principal e de confianca de validacao persistida/UI, nao de ausencia de fluxo central.
- Proximo passo recomendado: preparar uma base PostgreSQL efemera para executar `npm --prefix real_dev/api run test:integration`, depois reauditar apenas findings P2/P3.
