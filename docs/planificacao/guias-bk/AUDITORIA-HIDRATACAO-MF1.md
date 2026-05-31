# Relatorio de Auditoria e Correcao dos Guias BK - MF1

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF1`
- `macro`: `MF1`
- `data`: `2026-05-31`
- `modo`: `corrigir_apenas`
- `estado`: `correcao_concluida_validacao_com_bloqueio_infra`
- `escopo`: `docs/planificacao/guias-bk/MF1/`

## Objetivo

Usar o relatorio existente da MF1 como ponto de partida e corrigir os 10 guias BK que tinham sido classificados como `PARCIAL` ou `CRITICO`, sem alterar IDs, RF/RNF, owners, prioridades, sprints ou dependencias canonicas.

O foco desta execucao foi fechar os pontos que estavam a gerar iteracoes sucessivas: schema Prisma acumulado, validacao multiempresa em linhas, auditoria de operacoes financeiras/contabilisticas, segregacao de aprovacao, atomicidade de workflow e testes autocontidos.

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
- BKs posteriores com dependencias diretas da MF1: `BK-MF2-01`, `BK-MF3-01`, `BK-MF3-03`, `BK-MF3-04` e `BK-MF3-07`

## Resultado executivo

| Momento | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes desta correcao, segundo a reauditoria estrita | 0 | 2 | 8 |
| Depois desta correcao | 10 | 0 | 0 |

BKs analisados: 10.

BKs editados: 10.

Codigo real da aplicacao editado: 0. As alteracoes foram feitas apenas nos guias de planificacao e neste relatorio.

## Classificacao depois da correcao

| BK | Estado final | Motivo |
| --- | --- | --- |
| `BK-MF1-01` | OK | Acrescentada fundamentacao documental, relacao inversa `Company.vatRates`, validacao booleana estrita em `setVatRateActive` e teste autocontido. |
| `BK-MF1-02` | OK | Acrescentada validacao multiempresa de `itemId`, `AuditLog`, auditoria de criacao/emissao, relacoes inversas e teste autocontido. |
| `BK-MF1-03` | OK | Recebimentos passam a criar auditoria transacional e reutilizam `AuditLog` criado antes; teste deixa de depender de variaveis soltas. |
| `BK-MF1-04` | OK | Lancamento de venda passa a auditar a criacao do diario e inclui relacoes inversas de `Company` e `Account`. |
| `BK-MF1-05` | OK | Buckets de antiguidade ficam marcados como decisao derivada e o teste de bucket e autocontido. |
| `BK-MF1-06` | OK | Workflow de venda passa a guardar `submittedById` e impede que o mesmo utilizador submeta e aprove/rejeite. |
| `BK-MF1-07` | OK | Compras passam a validar artigos por empresa, auditar a criacao do documento e tratar duplicacao de numero de fornecedor com `409`. |
| `BK-MF1-08` | OK | Pagamentos passam a criar auditoria transacional e o schema acumulado inclui `Company.payments` e `PurchaseDocument.payments`. |
| `BK-MF1-09` | OK | Contabilizacao de compras passa a expor `postPurchaseDocumentInTransaction`, auditar o diario e manter idempotencia. |
| `BK-MF1-10` | OK | Workflow de compras usa endpoints reais, reutiliza contabilizacao dentro da mesma transacao e elimina o drift de atomicidade. |

## Lacunas corrigidas

1. **Schema Prisma acumulado**
   Os BKs passaram a mostrar relacoes inversas para `Company`, `Customer`, `Supplier`, `Item`, `VatRate`, `Account`, `SaleDocument`, `PurchaseDocument` e `User` onde a MF1 cria ou reutiliza relacoes Prisma.

2. **Testes autocontidos**
   Os blocos antigos com `it(...)`, `expect(...)`, `prisma`, `companyId`, `saleDocumentId`, `purchaseDocumentId`, `validInvoiceInput` ou `validPurchaseInput` sem setup foram substituidos por ficheiros de teste com imports, `node:test`, `node:assert/strict` e stubs locais.

3. **Marcacao documental**
   Todos os BKs da MF1 receberam a secao `Fundamentacao documental`, com decisoes marcadas como `CANONICO` ou `DERIVADO`.

4. **Auditoria**
   `AuditLog` foi introduzido em `BK-MF1-02` e reutilizado nos BKs seguintes. Foram acrescentados registos para criacao/emissao de documentos de venda, recebimentos, lancamentos de venda, criacao de compras, pagamentos, lancamentos de compras e workflows de aprovacao.

5. **Validacao multiempresa**
   `BK-MF1-02` e `BK-MF1-07` passaram a validar todos os `itemId` por `companyId` e `isActive`, impedindo linhas com artigos de outra empresa.

6. **Segregacao de funcoes**
   `BK-MF1-06` passou a guardar `submittedById` e a devolver `403 SEGREGATION_REQUIRED` quando o mesmo utilizador tenta aprovar ou rejeitar o documento que submeteu.

7. **Atomicidade de compras**
   `BK-MF1-09` passou a disponibilizar `postPurchaseDocumentInTransaction`; `BK-MF1-10` usa esse helper dentro da mesma transacao que grava `postedAt`, `postedById` e auditoria de workflow.

## Mapa de integracao da MF

| BK | Ficheiros criados/editados previstos | Exports produzidos | Imports consumidos | Endpoints | DTOs/validators | Schemas/models | Services/componentes | Regras aplicadas | BKs seguintes dependentes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF1-01` | `schema.prisma`, `modules/vat-rates`, `server.js`, `vatRateApi.ts`, `VatRatesPage.tsx` | `validateVatRateInput`, `listVatRates`, `createVatRate`, `setVatRateActive`, `buildVatRateRoutes` | auth, company context, roles, `httpErrors` | `/api/vat-rates`, `/api/vat-rates/:id/active` | IVA input e boolean estrito | `VatRate`, `Company.vatRates` | service, route, API client, pagina | multiempresa, roles, validacao fiscal | `BK-MF1-02`, `BK-MF1-07`, `BK-MF3-01` |
| `BK-MF1-02` | `schema.prisma`, `modules/sales`, `server.js`, `salesApi.ts`, `SaleDocumentsPage.tsx` | `createSaleDocument`, `issueSaleDocument`, `buildSaleDocumentRoutes` | clientes MF0, artigos MF0, IVA MF1-01, periodo fiscal MF0-08 | `/api/sales/documents`, `/api/sales/documents/:id/issue` | linhas de venda, datas, tipo de documento | `NumberSequence`, `SaleDocument`, `SaleDocumentLine`, `AuditLog` | service, route, API client, pagina | multiempresa, numeracao, auditoria, transacao | `BK-MF1-03`, `BK-MF1-04`, `BK-MF1-05`, `BK-MF1-06`, `BK-MF3-03`, `BK-MF3-07` |
| `BK-MF1-03` | `schema.prisma`, `modules/receipts`, `server.js`, `receiptApi.ts`, `ReceiptsPage.tsx` | `registerReceipt`, `buildReceiptRoutes` | `SaleDocument`, `AuditLog`, periodo fiscal | `/api/sales/documents/:id/receipts` | valor, data, metodo | `Receipt`, inversas em `Company` e `SaleDocument` | service, route, API client, pagina | saldo em aberto, multiempresa, auditoria | `BK-MF1-05`, `BK-MF3-04` |
| `BK-MF1-04` | `schema.prisma`, `modules/accounting`, `server.js`, `accountingApi.ts`, `SalePostingsPage.tsx` | `postSaleDocument`, `buildSalePostingRoutes` | `SaleDocument`, `Account`, `AuditLog`, periodo fiscal | `/api/accounting/sale-postings/:saleDocumentId` | id de documento | `JournalEntry`, `JournalEntryLine`, inversas `Company`/`Account` | service, route, pagina | diario equilibrado, periodo aberto, auditoria | `BK-MF3-01`, `BK-MF3-07` |
| `BK-MF1-05` | `modules/open-items`, `server.js`, `salesOpenItemsApi.ts`, `SalesOpenItemsPage.tsx` | `listSalesOpenItems`, `buildSalesOpenItemsRoutes` | vendas, clientes, recebimentos | `/api/sales/open-items` | `asOfDate` | reutiliza `SaleDocument` e `Customer` | service, route, pagina | leitura filtrada por empresa, buckets | `BK-MF3-04`, `BK-MF3-07` |
| `BK-MF1-06` | `schema.prisma`, `modules/sales-approval`, `saleDocumentService.js`, `server.js`, `saleApprovalApi.ts`, `SaleApprovalPage.tsx` | `submitSaleDocument`, `approveSaleDocument`, `rejectSaleDocument`, `buildSaleApprovalRoutes` | `SaleDocument`, `AuditLog`, emissao do BK-MF1-02 | `/submit`, `/approve`, `/reject` em `/api/sales/documents/:id` | motivo de rejeicao | campos `submittedById`, `approvedById`, `rejectedById` | service, route, pagina | workflow, segregacao, auditoria | `BK-MF2-01`, `BK-MF1-07` |
| `BK-MF1-07` | `schema.prisma`, `modules/purchases`, `server.js`, `purchaseApi.ts`, `PurchaseDocumentsPage.tsx` | `createPurchaseDocument`, `buildPurchaseDocumentRoutes` | fornecedores MF0, artigos MF0, IVA MF1-01, `AuditLog` | `/api/purchases/documents` | linhas de compra, data, tipo, numero fornecedor | `PurchaseDocument`, `PurchaseDocumentLine` | service, route, pagina | multiempresa, auditoria, transacao | `BK-MF1-08`, `BK-MF1-09`, `BK-MF1-10`, `BK-MF3-03`, `BK-MF3-07` |
| `BK-MF1-08` | `schema.prisma`, `modules/payments`, `server.js`, `paymentApi.ts`, `PaymentsPage.tsx` | `registerPayment`, `buildPaymentRoutes` | `PurchaseDocument`, `AuditLog`, periodo fiscal | `/api/purchases/documents/:id/payments` | valor, data, metodo | `Payment`, inversas `Company`/`PurchaseDocument` | service, route, pagina | saldo a pagar, auditoria, multiempresa | `BK-MF3-04` |
| `BK-MF1-09` | `modules/accounting`, `server.js`, `accountingApi.ts`, `PurchasePostingsPage.tsx` | `postPurchaseDocumentInTransaction`, `postPurchaseDocument`, `buildPurchasePostingRoutes` | `PurchaseDocument`, `JournalEntry`, `AuditLog`, periodo fiscal | `/api/accounting/purchase-postings/:purchaseDocumentId` | id de compra | reutiliza `JournalEntry` e `JournalEntryLine` | service, route, pagina | diario equilibrado, idempotencia, auditoria | `BK-MF1-10`, `BK-MF3-01` |
| `BK-MF1-10` | `schema.prisma`, `modules/purchase-approval`, `purchaseDocumentService.js`, `server.js`, `purchaseApprovalApi.ts`, `PurchaseApprovalPage.tsx` | `approvePurchaseDocument`, `markPurchaseDocumentPosted`, `buildPurchaseApprovalRoutes` | `AuditLog`, `postPurchaseDocumentInTransaction` | `/api/purchases/documents/:id/approve`, `/api/purchases/documents/:id/post-state` | estados de compra | campos `approvedAt`, `postedAt`, `postedById`, `payments` preservado | service, route, pagina | workflow, roles, transacao atomica | `BK-MF2-01` |

Confirmacao global: nao ficam dois endpoints para a mesma acao, nao ficam dois schemas para a mesma entidade, o frontend chama endpoints definidos no backend e os BKs seguintes continuam a receber os contratos de que dependem.

## Decisoes tecnicas confirmadas

- `CANONICO`: stack continua React + Vite + TypeScript no frontend e Node.js + Express com ES Modules no backend.
- `CANONICO`: MF1 decorre em `S03-S04`, com 10 BKs, 7 P0 e 3 P1.
- `CANONICO`: dados por empresa sao sempre filtrados por contexto multiempresa no backend.
- `CANONICO`: `RF13` a `RF22` cobrem IVA, vendas, recebimentos, lancamentos automaticos, titulos em aberto, aprovacao de vendas, compras, pagamentos, lancamentos de compras e aprovacao de compras.
- `CANONICO`: `RF47` e `RNF17` justificam auditoria em documentos fiscais, recebimentos, pagamentos, lancamentos contabilisticos e workflows.
- `DERIVADO`: `AuditLog` passa a ser introduzido em `BK-MF1-02`, porque a emissao de documentos de venda ja e uma operacao sensivel antes dos recebimentos.
- `DERIVADO`: `postPurchaseDocumentInTransaction` e necessario para eliminar duas transacoes independentes no fluxo de lancamento de compras.
- `DERIVADO`: endpoints especificos `/approve` e `/post-state` sao mantidos em vez de um endpoint generico `/state`, por serem mais claros para alunos e para contrato frontend/backend.

## Decisoes de dominio OPSA confirmadas

- `CANONICO`: recebimentos de clientes e pagamentos a fornecedores continuam separados.
- `CANONICO`: lancamento contabilistico nao e o mesmo que documento operacional; os BKs ligam os dois por `source`/`sourceId`.
- `CANONICO`: aprovacao de compras segue `Rascunho -> Aprovado -> Lancado`.
- `DERIVADO`: compras criadas em `BK-MF1-07` continuam `APPROVED` apenas ate `BK-MF1-10`; depois passam a nascer `DRAFT`.
- `DERIVADO`: nota de credito de fornecedor nao recebe pagamentos neste fluxo, porque reduz divida em vez de gerar saida de caixa.

## Drift documental encontrado

- O relatorio anterior desta linha de trabalho estava em `auditar_apenas`; a prompt atual pede `corrigir_apenas`.
- `BK-MF1-10` anunciava `/api/purchases/documents/:id/state`, mas implementava `/approve` e `/post-state`. O guia foi alinhado para documentar os endpoints reais.
- A hierarquia documental nao define matriz fina de permissoes por acao MF1; os guias mantiveram roles coerentes com RF/RNF e marcaram as escolhas tecnicas como `DERIVADO`.

## Verificacoes executadas

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n "hidrata\|pos-auditoria\|scaffold\|roteiro generico\|conversa interna\|este guia deixa de ser\|codigo ainda nao corrigido\|snippet\|exemplo simplificado\|implementar depois\|quando aplicavel\|helpers chamados\|substitu(ir\|i)r? mocks\|pseudo-codigo\|solucao parcial\|payload: unknown\|as any" docs/planificacao/guias-bk/MF1/*.md` | exit `1`, sem output | OK: sem termos internos proibidos nos BKs dos alunos. |
| `git diff --check` | exit `0`, sem output | OK: sem whitespace problematico no diff. |
| `bash scripts/validate-planificacao.sh` | exit `2` | Bloqueio de infraestrutura local: o script chama `../scripts/validate_planificacao_canonica.py`, ausente neste checkout. |

Erro exato do validador:

```text
/opt/homebrew/Cellar/python@3.14/3.14.5/Frameworks/Python.framework/Versions/3.14/Resources/Python.app/Contents/MacOS/Python: can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

## Bloqueios e TODOs restantes

- Conteudo dos BKs MF1: sem `TODO (BLOCKER)` restante identificado nesta correcao.
- Infraestrutura de validacao: `bash scripts/validate-planificacao.sh` continua bloqueado por ficheiro externo ausente neste checkout.

## Resultado final desta correcao

A MF1 foi corrigida em modo `corrigir_apenas`. Os 10 guias foram editados e reclassificados como `OK` apos fechar as lacunas tecnicas e pedagogicas identificadas na reauditoria estrita.
