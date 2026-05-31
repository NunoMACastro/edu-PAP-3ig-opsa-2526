# Relatorio de Auditoria e Correcao dos Guias BK - MF1

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF1`
- `macro`: `MF1`
- `data`: `2026-05-31`
- `modo`: `corrigir_apenas`
- `estado`: `correcao_concluida_validacao_com_bloqueio_infra`
- `escopo`: `docs/planificacao/guias-bk/MF1/`

## Objetivo

Usar a auditoria anterior da `MF1` como ponto de partida e corrigir apenas os BKs classificados como `PARCIAL` ou `CRITICO`, sem alterar IDs, RF/RNF, owners, prioridades, sprints, dependencias canonicas ou codigo real da aplicacao.

A intervencao fechou lacunas de executabilidade e coerencia entre MF0 e MF1: assinatura de `assertOpenFiscalPeriod`, revalidacao de periodo fiscal em emissoes definitivas, auditoria de emissoes, tratamento de notas de credito, UI/API de ativacao de IVA e codigo completo para a alteracao de compras em `BK-MF1-10`.

## Fontes consultadas

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF1.md`
- Todos os BKs de `docs/planificacao/guias-bk/MF1/`
- BKs MF0 relevantes por contrato de helper e seguranca: `BK-MF0-08`, `BK-MF0-09`, `BK-MF0-10` e `BK-MF0-11`
- Documentos canonicos ja usados na auditoria anterior: `docs/RF.md`, `docs/RNF.md`, `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md` e `CONTRATO-STACK-IMPLEMENTACAO.md`

## Resultado executivo

| Momento | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes desta correcao, segundo a auditoria estrita anterior | 0 | 2 | 8 |
| Depois desta correcao | 10 | 0 | 0 |

BKs analisados: 10.

BKs editados: 10.

Codigo real da aplicacao editado: 0. As alteracoes foram feitas apenas nos guias de planificacao da MF1 e neste relatorio.

## Classificacao depois da correcao

| BK | Estado final | Motivo |
| --- | --- | --- |
| `BK-MF1-01` | `OK` | `vatRateApi.ts` passou a expor `setVatRateActive` e `VatRatesPage.tsx` passou a permitir ativar/desativar taxas. |
| `BK-MF1-02` | `OK` | `createSaleDocument` usa a assinatura correta de periodo fiscal e `issueSaleDocument` revalida periodo aberto antes da numeracao definitiva. |
| `BK-MF1-03` | `OK` | Recebimentos usam a assinatura correta de periodo fiscal e bloqueiam `CREDIT_NOTE` com `CREDIT_NOTE_NOT_RECEIVABLE`. |
| `BK-MF1-04` | `OK` | Lancamento contabilistico de venda usa `assertOpenFiscalPeriod(tx, { companyId, documentDate })`. |
| `BK-MF1-05` | `OK` | Titulos em aberto excluem `CREDIT_NOTE` e o teste valida esse filtro. |
| `BK-MF1-06` | `OK` | Emissao aprovada revalida periodo aberto e preserva `AuditLog` `SALE_DOCUMENT_ISSUED`. |
| `BK-MF1-07` | `OK` | Compras usam a assinatura correta de periodo fiscal e validam `dueDate` antes de persistir. |
| `BK-MF1-08` | `OK` | Pagamentos usam a assinatura correta de periodo fiscal. |
| `BK-MF1-09` | `OK` | Lancamento contabilistico de compras usa `assertOpenFiscalPeriod(tx, { companyId, documentDate })`. |
| `BK-MF1-10` | `OK` | O bloco solto foi substituido pela funcao completa `createPurchaseDocument`, com imports, validacoes, auditoria, conflito `P2002` e estado inicial `DRAFT`. |

## BKs editados

- `BK-MF1-01-configurar-tabelas-de-iva-taxas-isencoes-codigos.md`
- `BK-MF1-02-emitir-fatura-fatura-recibo-nota-de-credito-com-numeracao-sequencial.md`
- `BK-MF1-03-registar-recebimentos-parciais-totais.md`
- `BK-MF1-04-gerar-lancamentos-contabilisticos-automaticos-por-venda.md`
- `BK-MF1-05-consultar-titulos-em-aberto-e-antiguidade-de-saldos.md`
- `BK-MF1-06-submeter-documentos-de-venda-para-aprovacao-antes-de-emissao-definitiva.md`
- `BK-MF1-07-registar-fatura-de-fornecedor-e-nota-de-credito.md`
- `BK-MF1-08-registar-pagamentos-parciais-totais.md`
- `BK-MF1-09-gerar-lancamentos-contabilisticos-automaticos-de-compras.md`
- `BK-MF1-10-aprovacao-de-compras-com-estados-rascunho-aprovado-lancado.md`

## Lacunas corrigidas

1. **Contrato MF0/MF1 de periodos fiscais**
   Todas as chamadas MF1 a `assertOpenFiscalPeriod` passam a usar a assinatura definida no BK-MF0-08:

   ```js
   assertOpenFiscalPeriod(prisma, { companyId, documentDate })
   ```

   Isto corrige vendas, compras, recebimentos, pagamentos e lancamentos contabilisticos automaticos.

2. **Emissao definitiva de vendas**
   `BK-MF1-02` e `BK-MF1-06` revalidam periodo aberto dentro da transacao de emissao, antes de atribuir numero definitivo. `BK-MF1-06` tambem preserva a auditoria `SALE_DOCUMENT_ISSUED`.

3. **Notas de credito de venda**
   `BK-MF1-03` bloqueia recebimentos sobre `CREDIT_NOTE`. `BK-MF1-05` exclui `CREDIT_NOTE` da consulta de titulos em aberto, alinhando vendas com a regra ja existente em pagamentos de compras.

4. **Gestao visual de IVA**
   `BK-MF1-01` passou a fechar o fluxo prometido no scope: criar, listar, ativar e desativar taxas de IVA atraves de API client e pagina React.

5. **Compras em rascunho no workflow de aprovacao**
   `BK-MF1-10` deixou de apresentar uma alteracao parcial a `createPurchaseDocument` e passou a mostrar a funcao completa adaptada para `DRAFT`, mantendo as garantias do BK-MF1-07.

## Mapa de integracao da MF

| BK | Exports/endpoints relevantes | Regras criticas depois da correcao | Estado |
| --- | --- | --- | --- |
| `BK-MF1-01` | `/api/vat-rates`, `/api/vat-rates/:id/active`, `setVatRateActive` | IVA por empresa, validacao de taxa/isencao, ativacao booleana | `OK` |
| `BK-MF1-02` | `/api/sales/documents`, `/issue`, `createSaleDocument`, `issueSaleDocument` | numeracao transacional, auditoria, periodo aberto na criacao e emissao | `OK` |
| `BK-MF1-03` | `/api/sales/documents/:id/receipts`, `registerReceipt` | saldo em aberto, periodo aberto, bloqueio de nota de credito | `OK` |
| `BK-MF1-04` | `/api/accounting/sale-postings/:saleDocumentId`, `postSaleDocument` | diario equilibrado, periodo aberto, idempotencia | `OK` |
| `BK-MF1-05` | `/api/sales/open-items`, `listSalesOpenItems` | antiguidade por empresa, apenas faturas emitidas com saldo, exclusao de notas de credito | `OK` |
| `BK-MF1-06` | `/submit`, `/approve`, `/reject`, `issueSaleDocument` | segregacao, aprovacao antes de emissao, periodo aberto, auditoria | `OK` |
| `BK-MF1-07` | `/api/purchases/documents`, `createPurchaseDocument` | compras por empresa, periodo aberto, `dueDate` valida, auditoria | `OK` |
| `BK-MF1-08` | `/api/purchases/documents/:id/payments`, `registerPayment` | saldo a pagar, periodo aberto, bloqueio de nota de credito | `OK` |
| `BK-MF1-09` | `/api/accounting/purchase-postings/:purchaseDocumentId`, `postPurchaseDocumentInTransaction` | diario equilibrado, periodo aberto, inversao para notas de credito | `OK` |
| `BK-MF1-10` | `/approve`, `/post-state`, `createPurchaseDocument` adaptado | `DRAFT -> APPROVED -> POSTED`, auditoria, contabilizacao atomica | `OK` |

## Decisoes tecnicas e de dominio confirmadas

- `companyId` continua a vir sempre do contexto autenticado, nunca do corpo do pedido.
- Periodos fiscais sao validados no backend com o helper do BK-MF0-08.
- Notas de credito de venda nao sao tratadas como titulos a receber nem aceitam recebimentos.
- A emissao definitiva continua a ser operacao auditada.
- Compras passam a nascer como `DRAFT` no fluxo de aprovacao do BK-MF1-10, preservando validacoes e auditoria da criacao.
- Valores monetarios continuam em centimos e taxas de IVA em basis points.

## Drift documental

- A auditoria anterior contradizia um estado documental antigo que dava a MF1 como totalmente corrigida. Esta execucao resolveu os pontos concretos que ainda estavam presentes nos BKs.
- O validador de planificacao existe em `scripts/validate-planificacao.sh`, mas referencia um ficheiro Python fora deste checkout: `../scripts/validate_planificacao_canonica.py`.
- A normalizacao transversal dos scripts `npm run test:unit`, `npm run test:contracts` e `npm run test:integration` continua a depender do contrato global de stack; nao foi alterada aqui porque o modo era `corrigir_apenas` para BKs MF1 classificados como `PARCIAL` ou `CRITICO`.

## Verificacoes executadas

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n "assertOpenFiscalPeriod\\([^,]+,\\s*(companyId\|req\\.companyId)\|assertOpenFiscalPeriod\\([^,]+,\\s*companyId" docs/planificacao/guias-bk/MF1` | exit `1`, sem output | OK: nao restam chamadas MF1 com a assinatura antiga. |
| `rg -n "hidrata\|pos-auditoria\|scaffold\|roteiro generico\|conversa interna\|este guia deixa de ser\|codigo ainda nao corrigido\|snippet\|exemplo simplificado\|implementar depois\|quando aplicavel\|helpers chamados\|substitu(ir\|i)r? mocks\|pseudo-codigo\|solucao parcial\|payload: unknown\|as any" docs/planificacao/guias-bk/MF1/*.md` | exit `1`, sem output | OK: nao ha termos internos proibidos nos BKs dos alunos. |
| Verificacao sintatica dos blocos `js` dos BKs MF1 com `node --check` | 42 blocos analisados; 0 falhas | OK: o bloco solto de `BK-MF1-10` foi corrigido e todos os blocos JS passam sintaxe. |
| `git diff --check` | exit `0`, sem output | OK: sem whitespace problematico no diff. |
| `bash scripts/validate-planificacao.sh` | exit `2` | Bloqueio de infraestrutura local: ficheiro Python referenciado pelo script nao existe neste checkout. |

Erro exato do validador:

```text
/opt/homebrew/Cellar/python@3.14/3.14.5/Frameworks/Python.framework/Versions/3.14/Resources/Python.app/Contents/MacOS/Python: can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

## Bloqueios e TODOs restantes

- `TODO (INFRA)`: repor ou corrigir o caminho de `../scripts/validate_planificacao_canonica.py` para permitir correr o validador canonico.
- `TODO (TRANSVERSAL)`: se o contrato global de stack ainda nao o fizer, documentar onde vivem os scripts `npm run test:unit`, `npm run test:contracts` e `npm run test:integration`.

## Resultado final

A MF1 foi processada em modo `corrigir_apenas`. Foram analisados 10 BKs e editados os 10 que a auditoria anterior marcava como `PARCIAL` ou `CRITICO`. Depois da correcao, a classificacao documental da MF1 fica em `10 OK`, `0 PARCIAL` e `0 CRITICO`, com validacao local positiva nos BKs e bloqueio apenas no validador externo ausente neste checkout.
