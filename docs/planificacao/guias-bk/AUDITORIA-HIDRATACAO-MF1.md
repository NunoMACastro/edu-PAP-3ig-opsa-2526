# Relatorio de Auditoria e Correcao dos Guias BK - MF1

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF1`
- `macro`: `MF1`
- `data`: `2026-05-31`
- `modo`: `corrigir_apenas`
- `estado`: `correcao_concluida_com_bloqueio_de_validador`
- `escopo`: `docs/planificacao/guias-bk/MF1/`

## Objetivo

Usar a auditoria existente da `MF1` como ponto de partida e corrigir os 10 guias BK que estavam classificados como `PARCIAL`, para os aproximar do padrao exigido: tutoriais guiados, autocontidos, pedagogicos e tecnicamente coerentes com a aplicacao OPSA.

Esta execucao editou apenas documentacao dos BKs da MF1 e este relatorio. Nao foi editado codigo real da aplicacao.

## Limites desta execucao

- BKs analisados: 10
- BKs editados: 10
- Codigo real da aplicacao editado: 0
- Documentos editados: 11
- `mockup/`: nao usado como contrato tecnico final.
- `apps/`: tratado apenas como estrutura prevista pelos documentos, nao como fonte de verdade tecnica.
- O ficheiro `PROMPT-AUDITAR-HIDRATAR-CORRIGIR-BKS-MF.md` ja estava modificado antes desta execucao e nao foi alterado.

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
- todos os BKs de `docs/planificacao/guias-bk/MF0/`
- todos os BKs de `docs/planificacao/guias-bk/MF1/`
- BKs posteriores com dependencias diretas da MF1: `BK-MF2-01`, `BK-MF3-01`, `BK-MF3-03`, `BK-MF3-04` e `BK-MF3-07`

## Resultado executivo

| Momento | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correcao | 0 | 10 | 0 |
| Depois da correcao documental | 10 | 0 | 0 |

Interpretacao: os BKs da MF1 passaram a ter teoria mais especifica, paginas frontend completas no proprio guia, explicacao do fluxo frontend-backend, validacoes por passo e codigo mais legivel. A classificacao `OK` e documental: o validador automatico da planificacao nao conseguiu correr por falta de um script externo ao checkout atual, registado em `Verificacoes executadas`.

## Principais lacunas corrigidas

- A seccao `Conceitos teoricos essenciais` deixou de ser generica e passou a cobrir dominio OPSA, backend, frontend, seguranca, multiempresa, fiscalidade, contabilidade ou governanca conforme o BK.
- Foram adicionadas paginas React completas para os 10 fluxos da MF1, com estado local, formularios ou acoes, `loading`, `error`, `success` ou `empty`, validacao minima e chamadas a endpoints reais atraves dos clientes API.
- A ligacao entre frontend e backend ficou explicada depois dos blocos de codigo, incluindo a razao de manter validacao, permissoes e contexto multiempresa no backend.
- Routes compactas foram reformatadas para facilitar leitura, copia e explicacao em contexto de 12.o ano.
- O relatorio foi atualizado para refletir `corrigir_apenas`, com contagem antes/depois, BKs editados, mapa de integracao e validacoes finais.

## BKs editados

| BK | Antes | Depois | Correcao principal |
| --- | --- | --- | --- |
| `BK-MF1-01` | PARCIAL | OK | Teoria de IVA, basis points, isencoes e pagina `VatRatesPage.tsx`. |
| `BK-MF1-02` | PARCIAL | OK | Teoria de documentos fiscais, numeracao e pagina `SaleDocumentsPage.tsx`. |
| `BK-MF1-03` | PARCIAL | OK | Teoria de recebimentos, saldos em aberto e pagina `ReceiptsPage.tsx`. |
| `BK-MF1-04` | PARCIAL | OK | Teoria de lancamentos SNC de vendas e pagina `SalePostingsPage.tsx`. |
| `BK-MF1-05` | PARCIAL | OK | Teoria de titulos em aberto, ageing e pagina `SalesOpenItemsPage.tsx`. |
| `BK-MF1-06` | PARCIAL | OK | Teoria de aprovacao, segregacao de funcoes, auditoria e pagina `SaleApprovalPage.tsx`. |
| `BK-MF1-07` | PARCIAL | OK | Teoria de compras, notas de credito de fornecedor e pagina `PurchaseDocumentsPage.tsx`. |
| `BK-MF1-08` | PARCIAL | OK | Teoria de pagamentos, contas a pagar e pagina `PaymentsPage.tsx`. |
| `BK-MF1-09` | PARCIAL | OK | Teoria de lancamentos SNC de compras e pagina `PurchasePostingsPage.tsx`. |
| `BK-MF1-10` | PARCIAL | OK | Teoria de workflow de compras e pagina `PurchaseApprovalPage.tsx`. |

## Mapa de integracao da MF

| BK | Ficheiros criados/editados no guia | Exports produzidos | Imports/contratos consumidos | Endpoints | DTOs/validators e schemas | Services | Frontend | Regras aplicadas | Dependentes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF1-01` | `VatRate`, `vatRateService`, `vatRateRoutes`, `apiClient`, `vatRateApi`, `VatRatesPage` | `apiClient`, `fetchVatRates`, `createVatRate` | sessao MF0, `requireAuth`, `requireCompanyContext`, roles | `GET/POST/PATCH /api/vat-rates` | `VatRate`, validacao de taxa/codigo/isencao | `listVatRates`, `createVatRate`, `setVatRateActive` | `VatRatesPage.tsx` | multiempresa, roles, validacao fiscal | `BK-MF1-02`, `BK-MF1-07`, `BK-MF3-01` |
| `BK-MF1-02` | `SaleDocument`, `SaleDocumentLine`, `NumberSequence`, sales service/routes/API/page | `createSaleDocument`, `issueSaleDocument`, `listSaleDocuments` | `Customer`, `Item`, `VatRate`, periodo fiscal | `GET/POST /api/sales/documents`, `POST /api/sales/documents/:id/issue` | documentos e linhas de venda, sequencia | `createSaleDocument`, `issueSaleDocument` | `SaleDocumentsPage.tsx` | numeracao sequencial, transacao, multiempresa | `BK-MF1-03`, `BK-MF1-04`, `BK-MF1-05`, `BK-MF1-06`, `BK-MF3-03`, `BK-MF3-07` |
| `BK-MF1-03` | `Receipt`, receipt service/routes/API/page | `registerReceipt` | documento de venda emitido | `POST /api/sales/documents/:id/receipts` | `Receipt`, validacao de montante/data/metodo | `registerReceipt` | `ReceiptsPage.tsx` | saldo em aberto, periodo fiscal, multiempresa | `BK-MF1-05`, `BK-MF3-04` |
| `BK-MF1-04` | `JournalEntry`, `JournalEntryLine`, sale posting service/routes/API/page | `postSaleDocument` | `SaleDocument`, `Account`, periodo fiscal | `POST /api/accounting/sale-postings/:saleDocumentId` | lancamento contabilistico de venda | `postSaleDocument` | `SalePostingsPage.tsx` | diario equilibrado, idempotencia, SNC | `BK-MF3-01`, `BK-MF3-07` |
| `BK-MF1-05` | open items service/routes/API/page | `listSalesOpenItems` | `SaleDocument`, `Customer`, `Receipt` | `GET /api/sales/open-items` | filtros de data e saldo | `listSalesOpenItems` | `SalesOpenItemsPage.tsx` | ageing, saldo aberto, filtro por empresa | `BK-MF3-04`, reporting |
| `BK-MF1-06` | `AuditLog`, sale approval service/routes/API/page | `submitSaleDocument`, `approveSaleDocument`, `rejectSaleDocument` | `issueSaleDocument`, user/session | `/submit`, `/approve`, `/reject`, `/issue` existente | estados de venda e registo de auditoria | approval service de vendas | `SaleApprovalPage.tsx` | auditoria, segregacao de funcoes, roles | `BK-MF2-01`, MF4/MF6 |
| `BK-MF1-07` | `PurchaseDocument`, `PurchaseDocumentLine`, purchase service/routes/API/page | `createPurchaseDocument`, `listPurchaseDocuments` | `Supplier`, `Item`, `VatRate`, periodo fiscal | `GET/POST /api/purchases/documents` | compras, linhas, notas de credito | `createPurchaseDocument` | `PurchaseDocumentsPage.tsx` | multiempresa, notas de credito, estado transitorio `APPROVED` | `BK-MF1-08`, `BK-MF1-09`, `BK-MF1-10`, `BK-MF3-03`, `BK-MF3-07` |
| `BK-MF1-08` | `Payment`, payment service/routes/API/page | `registerPayment` | `PurchaseDocument` | `POST /api/purchases/documents/:id/payments` | pagamento, data, metodo, montante | `registerPayment` | `PaymentsPage.tsx` | saldo a pagar, periodo fiscal, rejeicao de nota de credito | `BK-MF3-04` |
| `BK-MF1-09` | purchase posting service/routes/API/page, `JournalSource.PURCHASE` | `postPurchaseDocument` | `PurchaseDocument`, `Account`, periodo fiscal | `POST /api/accounting/purchase-postings/:purchaseDocumentId` | lancamento contabilistico de compra | `postPurchaseDocument` | `PurchasePostingsPage.tsx` | diario equilibrado, IVA dedutivel, idempotencia | `BK-MF1-10`, `BK-MF3-01` |
| `BK-MF1-10` | purchase approval service/routes/API/page, ajuste de estado inicial | `approvePurchaseDocument`, `markPurchaseDocumentPosted` | `AuditLog`, `postPurchaseDocument` | `POST /api/purchases/documents/:id/approve`, `/post-state` | workflow de compra e auditoria | approval service de compras | `PurchaseApprovalPage.tsx` | aprovacao, lancamento com diario, auditoria | `BK-MF2-01` |

Confirmacao global: nao foram detetados endpoints duplicados para a mesma acao na MF1. O frontend documentado chama endpoints definidos no backend do proprio BK ou de BKs anteriores. Os dados por empresa continuam a ser filtrados no backend por `companyId`.

## Decisoes tecnicas confirmadas

- `CANONICO`: stack documental assumida continua React + Vite + TypeScript no frontend e Node.js + Express com ES Modules no backend.
- `CANONICO`: MF1 decorre em `S03-S04`, com 10 BKs.
- `CANONICO`: dados por empresa devem ser filtrados por contexto multiempresa no backend.
- `DERIVADO`: `apps/web/src/lib/apiClient.ts` nasce no `BK-MF1-01` por ser o primeiro cliente API reutilizavel da MF1.
- `DERIVADO`: emissao de venda pode partir de `DRAFT` no `BK-MF1-02`, mas a partir do `BK-MF1-06` deve exigir `APPROVED`.
- `DERIVADO`: `AuditLog` nasce no `BK-MF1-06` como primeira necessidade concreta de auditoria sensivel dentro da MF1.
- `DERIVADO`: compras nascem `APPROVED` no `BK-MF1-07` para permitir pagamentos/contabilizacao antes do workflow formal, e novas compras passam a nascer `DRAFT` no `BK-MF1-10`.
- `DERIVADO`: notas de credito sao guardadas com valores positivos e o efeito contabilistico e invertido pelo tipo documental.

## Decisoes de dominio OPSA confirmadas

- `CANONICO`: RF13 cobre tabelas de IVA com taxas, isencoes e codigos.
- `CANONICO`: RF14 cobre fatura, fatura-recibo e nota de credito com numeracao sequencial.
- `CANONICO`: RF15 e RF20 distinguem recebimentos de clientes e pagamentos a fornecedores.
- `CANONICO`: RF16 e RF21 ligam documentos operacionais a lancamentos contabilisticos automaticos.
- `CANONICO`: RF18 exige fluxo simples de venda submetido/aprovado/rejeitado.
- `CANONICO`: RF22 exige compras com estados base `Rascunho -> Aprovado -> Lancado`.
- `CANONICO`: RNF17 exige auditoria em operacoes sensiveis.
- `DERIVADO`: "lancado" em compras significa que existe lancamento contabilistico associado.

## Drift documental encontrado

- O relatorio anterior estava em `auditar_apenas`; esta execucao corrige o artefacto para `corrigir_apenas`.
- O contrato de stack usa caminhos em `apps/`, mas a execucao nao tratou codigo real existente como contrato tecnico final.
- A sequencia `BK-MF1-02 -> BK-MF1-06` altera a regra de emissao de vendas; a decisao foi mantida e explicada como evolucao do workflow.
- A sequencia `BK-MF1-07 -> BK-MF1-10` altera o estado inicial das compras; a decisao foi mantida e explicada como transicao pedagogica.
- O header dos BKs mantem `estado: TODO` porque esse campo pertence ao estado de implementacao/backlog; a classificacao de qualidade documental fica registada neste relatorio.
- O validador automatico da planificacao aponta para `../scripts/validate_planificacao_canonica.py`, ausente neste checkout.

## Verificacoes executadas

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n "hidrata\|pos-auditoria\|scaffold\|roteiro generico\|conversa interna\|este guia deixa de ser\|codigo ainda nao corrigido\|snippet\|exemplo simplificado\|implementar depois\|quando aplicavel\|helpers chamados\|substitu(ir\|i)r? mocks\|pseudo-codigo\|solucao parcial\|payload: unknown\|as any" docs/planificacao/guias-bk/MF1/*.md` | exit `1`, sem output | OK: sem termos internos proibidos nos BKs dos alunos. |
| `git diff --check` | exit `0`, sem output | OK: sem whitespace problematico no diff. |
| `bash scripts/validate-planificacao.sh` | exit `2` | Bloqueio de infraestrutura local: o script chama `../scripts/validate_planificacao_canonica.py`, que nao existe neste checkout. |

Erro exato do validador:

```text
/opt/homebrew/Cellar/python@3.14/3.14.5/Frameworks/Python.framework/Versions/3.14/Resources/Python.app/Contents/MacOS/Python: can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

## Bloqueios e TODOs restantes

- `BLOCKER`: `bash scripts/validate-planificacao.sh` depende de `../scripts/validate_planificacao_canonica.py`, ausente neste checkout.
- `TODO`: voltar a correr o validador automatico quando o script canonico estiver disponivel.
- `TODO`: quando os alunos aplicarem os BKs no codigo real, executar `npm run test:unit`, `npm run test:contracts` e `npm run test:integration` com a implementacao resultante.

## Resultado final desta execucao

A MF1 ficou corrigida a nivel documental: os 10 BKs passaram de `PARCIAL` para `OK`, com teoria mais completa, frontend documentado, explicacoes reforcadas, validacoes por passo e mapa de integracao atualizado. A unica validacao nao concluida e o validador automatico da planificacao, bloqueado por ficheiro ausente fora dos BKs editados.
