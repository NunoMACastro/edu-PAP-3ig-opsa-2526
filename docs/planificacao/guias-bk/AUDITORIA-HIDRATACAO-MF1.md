# Relatorio de Correcao dos Guias BK - MF1

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF1`
- `macro`: `MF1`
- `data`: `2026-05-31`
- `modo`: `corrigir_apenas`
- `estado`: `correcao_tecnica_concluida_com_pendencias_pedagogicas`
- `escopo`: `docs/planificacao/guias-bk/MF1/`

## Objetivo

Usar a auditoria existente da `MF1` como ponto de partida, corrigir apenas os BKs ja classificados como `PARCIAL` ou `CRITICO`, e atualizar este relatorio com a contagem antes/depois, BKs editados, decisoes tomadas, drift documental e validacoes executadas.

Esta execucao focou os bloqueios tecnicos que impediam a sequencia da MF1 de ser executavel: endpoints de emissao, estados de venda/compra, modelo de auditoria, cliente HTTP frontend, contabilizacao de notas de credito e caminho unico para marcar compras como lancadas.

## Limites desta execucao

- `MF_ALVO`: `MF1`
- `MODO`: `corrigir_apenas`
- BKs analisados: 10
- BKs editados: 10
- Codigo real da aplicacao editado: 0
- Documentos fora de `docs/planificacao/guias-bk/` editados: 0
- `mockup/` nao foi usado como contrato tecnico final.
- `apps/` nao foi usado como contrato tecnico final.

## Fontes consideradas

Foram mantidas como fontes de verdade a matriz canonica, backlog MVP, contrato de campos, contrato de stack, plano de sprints, MF views, BKs MF0 e BKs MF1. A auditoria anterior desta MF foi usada como lista de correcao.

## Resultado

| Momento | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Auditoria anterior, antes desta correcao | 0 | 1 | 9 |
| Depois desta correcao | 0 | 10 | 0 |

Interpretação: os bloqueios `CRITICO` identificados na auditoria anterior foram removidos, mas os BKs ainda nao devem ser marcados como `OK` porque a qualidade frontend/pedagogica continua parcial: os guias ainda trazem paginas/componentes declarados de forma insuficiente e as seccoes teoricas continuam demasiado genericas para o criterio estrito da prompt.

## BKs editados

| BK | Antes | Depois | Correcao principal aplicada | Pendencia que impede `OK` |
| --- | --- | --- | --- | --- |
| `BK-MF1-01` | PARCIAL | PARCIAL | Criado contrato de `apps/web/src/lib/apiClient.ts` com `credentials: "include"` e cliente `vatRateApi.ts` alinhado. | Falta pagina/componente frontend completo e teoria mais especifica de IVA, backend e frontend. |
| `BK-MF1-02` | CRITICO | PARCIAL | `issueSaleDocument` passou a ter route propria neste BK; emissao parte de `DRAFT` nesta fase e gera numeracao transacional. | Falta UI completa de documentos de venda e explicacao pedagogica mais densa. |
| `BK-MF1-03` | CRITICO | PARCIAL | Dependencia tecnica em documentos emitidos pelo `BK-MF1-02` ficou explicita. | Falta UI completa de recebimentos e teoria especifica de tesouraria. |
| `BK-MF1-04` | CRITICO | PARCIAL | Lancamento de notas de credito de venda passou a inverter cliente, proveito e IVA liquidado. | Falta UI completa para lancamento e explicacao contabilistica mais didatica. |
| `BK-MF1-05` | CRITICO | PARCIAL | Origem dos dados de titulos em aberto foi ligada a documentos emitidos e recebimentos registados. | Falta componente de listagem com estados `loading`, `error`, `empty` e explicacao de antiguidade. |
| `BK-MF1-06` | CRITICO | PARCIAL | Criado `model AuditLog`; emissao definitiva passa a exigir `APPROVED` a partir deste BK; removido segundo endpoint de emissao. | Falta UI completa de workflow e teoria sobre segregacao de funcoes. |
| `BK-MF1-07` | CRITICO | PARCIAL | Compras passam a nascer em `APPROVED` ate ao workflow formal do `BK-MF1-10`; notas de credito usam valores positivos e tipo documental para inverter efeito. | Ha drift controlado de estado ate ao `BK-MF1-10`; falta UI completa. |
| `BK-MF1-08` | CRITICO | PARCIAL | Pagamentos aceitam compras `APPROVED`, `POSTED` ou `PAID` e rejeitam `SUPPLIER_CREDIT_NOTE`. | Falta UI completa de pagamento e explicacao de contas a pagar. |
| `BK-MF1-09` | CRITICO | PARCIAL | Contabilizacao de compras aceita `APPROVED` ou `PAID`; notas de credito revertem fornecedor, gasto e IVA dedutivel. | Sem pagina frontend completa; sem explicacao contabilistica suficiente para alunos. |
| `BK-MF1-10` | CRITICO | PARCIAL | A partir deste BK, compras voltam a nascer em `DRAFT`; `post-state` chama `postPurchaseDocument` antes de registar estado de lancado. | Mantem drift de transicao historica BK7 -> BK10 e falta UI completa de aprovacao. |

## Principais lacunas corrigidas

- `apiClient` deixa de estar apenas implícito: `BK-MF1-01` passa a criar o cliente HTTP base com envio de cookies HttpOnly.
- `BK-MF1-02` passa a entregar endpoint de emissao definitiva em `/api/sales/documents/:id/issue`.
- `BK-MF1-06` deixa de duplicar a route de emissao e passa a apertar a regra de emissao para documentos `APPROVED`.
- `AuditLog` deixa de ser chamada sem modelo: `BK-MF1-06` passa a introduzir `model AuditLog`.
- Recebimentos, open items e lancamentos de venda ficam ligados a documentos emitidos no fluxo anterior.
- Notas de credito de venda passam a inverter o efeito contabilistico de cliente, proveito e IVA liquidado.
- Notas de credito de fornecedor passam a ter contrato de sinal: valores positivos no documento, inversao pelo `kind` no service contabilistico.
- Pagamentos a fornecedor deixam de depender exclusivamente de `POSTED`, permitindo o fluxo sequencial `BK-MF1-07 -> BK-MF1-08`.
- Contabilizacao de compras deixa de exigir um estado impossivel naquele ponto da sequencia.
- `BK-MF1-10` deixa de marcar compras como lancadas sem criar `JournalEntry`.

## Mapa de integracao da MF

| BK | Ficheiros/artefactos tratados no guia | Exports produzidos | Imports ou contratos consumidos | Endpoints tratados | Regras aplicadas | BKs seguintes afetados |
| --- | --- | --- | --- | --- | --- | --- |
| `BK-MF1-01` | `apiClient.ts`, `vatRateApi.ts`, `VatRate` | `apiClient`, `fetchVatRates`, `createVatRate` | cookies HttpOnly da MF0, `requireAuth`, `requireCompanyContext` | `GET/POST/PATCH /api/vat-rates` | multiempresa, roles, validacao de IVA | `BK-MF1-02`, `BK-MF1-07`, MF3 fiscal |
| `BK-MF1-02` | `SaleDocument`, `NumberSequence`, `saleDocumentService`, `saleDocumentRoutes`, `salesApi` | `createSaleDocument`, `issueSaleDocument` | `Customer`, `Item`, `VatRate`, periodo fiscal aberto | `GET/POST /api/sales/documents`, `POST /api/sales/documents/:id/issue` | numeracao sequencial transacional, multiempresa, roles | `BK-MF1-03`, `BK-MF1-04`, `BK-MF1-05`, `BK-MF1-06` |
| `BK-MF1-03` | `Receipt`, `receiptService`, `receiptApi` | `registerReceipt` | `SaleDocument` emitido pelo `BK-MF1-02` | `POST /api/sales/documents/:id/receipts` | saldo em aberto, estados validos, multiempresa | `BK-MF1-05`, MF3 tesouraria |
| `BK-MF1-04` | `JournalEntry`, `JournalEntryLine`, `salePostingService`, `accountingApi` | `postSaleDocument` | `SaleDocument`, `Account`, periodo fiscal aberto | `POST /api/accounting/sale-postings/:saleDocumentId` | lancamento equilibrado, tratamento de nota de credito, multiempresa | MF3 contabilidade e reporting |
| `BK-MF1-05` | `salesOpenItemsService`, `salesOpenItemsApi` | `listSalesOpenItems` | documentos emitidos e recebimentos anteriores | `GET /api/sales/open-items` | antiguidade, saldo aberto, filtro por empresa | MF3 tesouraria e previsao |
| `BK-MF1-06` | `SaleDocumentStatus`, `AuditLog`, `saleApprovalService`, `saleApprovalRoutes` | `submitSaleDocument`, `approveSaleDocument`, `rejectSaleDocument`; substitui regra de `issueSaleDocument` | `issueSaleDocument` criado no `BK-MF1-02`, contexto de utilizador | `POST /submit`, `/approve`, `/reject`; emissao continua em `/issue` | auditoria, segregacao de funcoes, estados controlados | `BK-MF2-01`, auditoria/notificacoes |
| `BK-MF1-07` | `PurchaseDocument`, `PurchaseDocumentLine`, `purchasesApi` | `createPurchaseDocument` | `Supplier`, `Item`, `VatRate`, periodo fiscal aberto | `GET/POST /api/purchases/documents` | multiempresa, compras em `APPROVED` ate ao workflow formal, contrato de nota de credito | `BK-MF1-08`, `BK-MF1-09`, `BK-MF1-10` |
| `BK-MF1-08` | `Payment`, `paymentService`, `paymentApi` | `registerPayment` | `PurchaseDocument` de `BK-MF1-07` | `POST /api/purchases/documents/:id/payments` | rejeicao de nota de credito, saldo a pagar, estados validos | MF3 tesouraria |
| `BK-MF1-09` | `JournalSource.PURCHASE`, `purchasePostingService`, `accountingApi` | `postPurchaseDocument` | `PurchaseDocument`, `Account`, periodo fiscal aberto | `POST /api/accounting/purchase-postings/:purchaseDocumentId` | diario equilibrado, nota de credito de fornecedor, estado contabilistico | MF3 contabilidade e reporting |
| `BK-MF1-10` | `purchaseApprovalService`, `purchaseApprovalRoutes`, ajuste de `purchaseDocumentService` | `approvePurchaseDocument`, `markPurchaseDocumentPosted` | `AuditLog` do `BK-MF1-06`, `postPurchaseDocument` do `BK-MF1-09` | `POST /api/purchases/documents/:id/approve`, `/post-state` | auditoria, aprovacao formal, lancado apenas com diario contabilistico | `BK-MF2-01`, auditoria/notificacoes |

## Decisoes tecnicas confirmadas

- `CANONICO`: a stack assumida para os guias continua React + Vite + TypeScript no frontend e Node.js + Express em ES Modules no backend.
- `DERIVADO`: `apps/web/src/lib/apiClient.ts` nasce no `BK-MF1-01`, porque e o primeiro BK MF1 a criar clientes frontend e todos os seguintes dependem dele.
- `DERIVADO`: em `BK-MF1-02`, a emissao parte de `DRAFT` para manter a sequencia executavel antes da aprovacao formal de vendas.
- `DERIVADO`: em `BK-MF1-06`, a mesma funcao `issueSaleDocument` passa a exigir `APPROVED`, porque RF18 introduz o gate formal de aprovacao.
- `DERIVADO`: `AuditLog` nasce no `BK-MF1-06`, primeiro ponto da MF1 onde uma operacao sensivel precisa de auditoria.
- `DERIVADO`: notas de credito sao guardadas com valores positivos e o service contabilistico inverte o efeito conforme `kind`.
- `DERIVADO`: `BK-MF1-10` nao cria um segundo caminho contabilistico; reutiliza `postPurchaseDocument` para garantir `POSTED` com `JournalEntry`.

## Decisoes de dominio OPSA confirmadas

- `CANONICO`: RF14 cobre fatura, fatura-recibo e nota de credito com numeracao sequencial.
- `CANONICO`: RF15 exige recebimentos parciais e totais ligados a documentos de venda emitidos.
- `CANONICO`: RF16 e RF21 ligam documentos operacionais a lancamentos contabilisticos.
- `CANONICO`: RF18 exige submissao, aprovacao e rejeicao de documentos de venda.
- `CANONICO`: RF19-RF22 cobrem compras, pagamentos, lancamentos e estados de compras.
- `CANONICO`: RNF17 exige auditoria em operacoes sensiveis.
- `DERIVADO`: "lancado" em compras deve significar lancado contabilisticamente, nao apenas uma etiqueta operacional.

## Drift documental encontrado

- A auditoria anterior ja contrariava a fotografia historica que tinha `10 OK`; esta execucao preserva a avaliacao estrita e passa os antigos `CRITICO` para `PARCIAL`.
- `BK-MF1-07` usa `APPROVED` como estado inicial temporario para manter `BK-MF1-08` e `BK-MF1-09` executaveis antes do workflow formal do `BK-MF1-10`.
- `BK-MF1-10` altera a regra anterior de compras para que, a partir desse ponto, novas compras nascam em `DRAFT` e passem por aprovacao formal.
- O contrato de stack declara caminhos indicativos em `apps/`; os BKs continuam a tratar esses caminhos como estrutura prevista, nao como codigo validado existente.
- BKs posteriores ainda podem precisar de releitura para consumir as novas garantias da MF1, sobretudo MF2 e MF3.

## Verificacoes executadas

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n "hidrata\|pos-auditoria\|scaffold\|roteiro generico\|conversa interna\|este guia deixa de ser\|codigo ainda nao corrigido\|snippet\|exemplo simplificado\|implementar depois\|quando aplicavel\|helpers chamados\|substitu(ir\|i)r? mocks\|pseudo-codigo\|solucao parcial\|payload: unknown\|as any" docs/planificacao/guias-bk/MF1/*.md` | exit `1`, sem output | OK: sem termos internos proibidos nos BKs dos alunos. |
| `git diff --check` | exit `0`, sem output | OK: sem whitespace problematico no diff. |
| `bash scripts/validate-planificacao.sh` | exit `2` | Bloqueado por infraestrutura local: o script chama `../scripts/validate_planificacao_canonica.py`, que nao existe neste checkout. |

Erro exato do validador:

```text
/opt/homebrew/Cellar/python@3.14/3.14.5/Frameworks/Python.framework/Versions/3.14/Resources/Python.app/Contents/MacOS/Python: can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

## Bloqueios e TODOs restantes

- `TODO`: completar paginas/componentes frontend nos BKs MF1 com formulario, listagem, loading, error, empty/success e validacao minima.
- `TODO`: densificar `Conceitos teoricos essenciais` por BK, com dominio, backend, frontend, seguranca e contabilidade/fiscalidade quando aplicavel.
- `TODO`: adicionar mais comentarios didaticos aos blocos de codigo que ainda so explicam a regra fora do codigo.
- `TODO`: reler BKs posteriores dependentes para confirmar que consomem os novos contratos de MF1.
- `BLOCKER`: `bash scripts/validate-planificacao.sh` depende de `../scripts/validate_planificacao_canonica.py`; se esse ficheiro continuar ausente, a validacao canonica nao fecha neste checkout.

## Resultado final desta execucao

A MF1 ficou sem bloqueios criticos conhecidos na sequencia tecnica principal: documentos de venda podem ser emitidos, aprovacoes auditadas ja tem schema, notas de credito tem tratamento contabilistico diferenciado, compras e pagamentos deixam de depender de estados impossiveis, e compras lancadas passam a exigir diario contabilistico.

Mesmo assim, a macrofase continua `PARCIAL` no criterio estrito da prompt. O proximo trabalho deve fechar a camada frontend e a explicacao pedagogica antes de promover qualquer BK para `OK`.
