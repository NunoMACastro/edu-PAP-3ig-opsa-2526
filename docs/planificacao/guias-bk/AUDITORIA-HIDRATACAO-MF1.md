# Auditoria e correcao dos Guias BK - MF1

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF1`
- `macro`: `MF1`
- `data`: `2026-05-31`
- `modo`: `corrigir_apenas`
- `estado`: `correcao_concluida_com_bloqueio_no_validador_canonico`
- `escopo`: `docs/planificacao/guias-bk/MF1/`

## Objetivo

Corrigir apenas os guias BK da `MF1` que a auditoria anterior classificou como `PARCIAL` ou `CRITICO`, sem alterar documentos canonicos, codigo da aplicacao ou ficheiros fora do escopo da MF1.

O foco desta execucao foi transformar os guias em material executavel e pedagogico para alunos do 12.o ano, mantendo rigor tecnico: passos suficientes por prioridade, estados coerentes entre vendas/compras/aprovacoes, remocao de linguagem interna, validacoes explicitas, multiempresa, roles, transacoes e handoff para MF2/MF3.

## Limites desta execucao

- `MF_ALVO`: `MF1`
- `MODO`: `corrigir_apenas`
- BKs editados: 10 de 10 guias MF1.
- Documentos canonicos editados: nenhum.
- Codigo da aplicacao editado: nenhum.
- `mockup/` nao foi usado como contrato tecnico; apenas serviu como referencia visual/fluxo.
- A correcao manteve os paths finais declarados nos BKs (`apps/api`, `apps/web`) conforme `CONTRATO-STACK-IMPLEMENTACAO.md`.

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
- BKs posteriores dependentes: `BK-MF2-01`, `BK-MF3-01`, `BK-MF3-03`, `BK-MF3-04`, `BK-MF3-07`

## Resultado

| Momento | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correcao MF1 | 0 | 7 | 3 |
| Depois da correcao MF1 | 10 | 0 | 0 |

## BKs editados

| BK | Estado antes | Estado depois | Correcao principal |
| --- | --- | --- | --- |
| `BK-MF1-01` | PARCIAL | OK | Mantido contrato de IVA e acrescentados passos finais de testes, contratos, integracao, diff e evidencia. |
| `BK-MF1-02` | CRITICO | OK | Corrigida numeracao sequencial; documento nasce em `DRAFT`; emissao definitiva passa a exigir `APPROVED`. |
| `BK-MF1-03` | PARCIAL | OK | Recebimentos passam a exigir documento `ISSUED` ou `SETTLED`; adicionados passos de validacao e evidencia. |
| `BK-MF1-04` | PARCIAL | OK | Contabilizacao de venda passa a rejeitar qualquer estado nao emitido; adicionados gates contabilisticos. |
| `BK-MF1-05` | PARCIAL | OK | Removido bloco de schema com texto; consulta passa a focar documentos `ISSUED` com saldo em aberto. |
| `BK-MF1-06` | CRITICO | OK | Schema de aprovacao deixou de ser comentario; fluxo `DRAFT -> SUBMITTED -> APPROVED/REJECTED -> ISSUE` fica coerente. |
| `BK-MF1-07` | PARCIAL | OK | Compra passa a nascer em `DRAFT`, alinhada com RF22 e com o BK de aprovacao. |
| `BK-MF1-08` | PARCIAL | OK | Pagamentos passam a exigir compra `POSTED` ou `PAID`; adicionados passos finais de validacao. |
| `BK-MF1-09` | PARCIAL | OK | Bloco de schema passou a declarar `JournalSource.PURCHASE`; contabilizacao exige compra `APPROVED`. |
| `BK-MF1-10` | CRITICO | OK | Schema completo de estados de compra; aprovacao aceita apenas `DRAFT`; lancamento aceita apenas `APPROVED`; auditoria adicionada. |

## Gaps principais corrigidos

1. **Numero minimo de passos.**
   - P0 (`BK-MF1-01`, `02`, `03`, `04`, `07`, `08`, `09`): 8 passos cada.
   - P1 (`BK-MF1-05`, `06`, `10`): 6 passos cada.

2. **Linguagem interna removida dos BKs.**
   - Removidas referencias ao modo de execucao em changelogs.
   - Removida a frase que dizia que o bloco do Passo 1 nao era executado pela app.
   - Removidos blocos `prisma` que continham texto em vez de contrato tecnico.

3. **Vendas e aprovacao alinhadas.**
   - `BK-MF1-02` cria documento em `DRAFT`.
   - `BK-MF1-06` submete, aprova/rejeita e expõe emissao definitiva apenas para documento aprovado.
   - A numeracao definitiva avanca apenas dentro da transacao de emissao.

4. **Compras e aprovacao alinhadas.**
   - `BK-MF1-07` cria compra em `DRAFT`.
   - `BK-MF1-10` aplica RF22: `DRAFT -> APPROVED -> POSTED`.
   - `BK-MF1-08` paga apenas compra lancada.
   - `BK-MF1-09` contabiliza apenas compra aprovada.

5. **Operacoes sensiveis com auditoria.**
   - `BK-MF1-06` regista auditoria para submissao, aprovacao e rejeicao de venda.
   - `BK-MF1-10` regista auditoria para aprovacao e lancamento de compra.

## Decisoes tecnicas e de dominio confirmadas

- `CANONICO`: RF14 exige documentos de venda com numeracao sequencial.
- `CANONICO`: RF18 exige fluxo de aprovacao de vendas antes da emissao definitiva quando o processo de aprovacao e usado.
- `CANONICO`: RF22 define compras com estados `Rascunho -> Aprovado -> Lancado`.
- `DERIVADO`: documentos de venda e compra nascem em `DRAFT` para permitir aprovacao antes do estado definitivo.
- `DERIVADO`: `INVOICE_RECEIPT` so muda para `SETTLED` no momento da emissao definitiva, porque antes disso ainda e rascunho/aprovacao.
- `DERIVADO`: pagamentos a fornecedores exigem compra `POSTED`, evitando saidas de tesouraria sobre documento ainda nao lancado.
- `DERIVADO`: recebimentos de clientes exigem venda `ISSUED` ou `SETTLED`, evitando movimentos financeiros sobre rascunhos.
- `TODO (BLOCKER)`: o validador canonico nao corre neste checkout porque falta `../scripts/validate_planificacao_canonica.py`.

## Mapa de integracao atualizado

| BK | Elementos declarados | Endpoints declarados | BKs seguintes afetados | Estado de integracao |
| --- | --- | --- | --- | --- |
| `BK-MF1-01` | `VatRate`, `VatRateType`, service, routes, cliente API | `GET/POST/PATCH /api/vat-rates` | `BK-MF1-02`, `BK-MF1-07`, `BK-MF3-01` | OK |
| `BK-MF1-02` | `NumberSequence`, `SaleDocument`, `SaleDocumentLine`, `issueSaleDocument` | `GET/POST /api/sales/documents` | `BK-MF1-03`, `BK-MF1-04`, `BK-MF1-06`, `BK-MF3-03`, `BK-MF3-07` | OK |
| `BK-MF1-03` | `Receipt`, `ReceiptMethod`, `receiptService` | `POST /api/sales/documents/:id/receipts` | `BK-MF1-05`, `BK-MF3-04` | OK |
| `BK-MF1-04` | `JournalEntry`, `JournalEntryLine`, `salePostingService` | `POST /api/accounting/sale-postings/:saleDocumentId` | `BK-MF3-01`, `BK-MF2-07`, `BK-MF2-08` | OK |
| `BK-MF1-05` | `salesOpenItemsService`, `salesOpenItemsApi` | `GET /api/sales/open-items` | `BK-MF3-04`, `BK-MF3-07` | OK |
| `BK-MF1-06` | `SaleDocumentStatus`, `saleApprovalService`, `saleApprovalRoutes`, audit log | `POST /api/sales/documents/:id/submit`, `/approve`, `/reject`, `/issue` | MF2 historico/auditoria, MF4 notificacoes | OK |
| `BK-MF1-07` | `PurchaseDocument`, `PurchaseDocumentLine`, `purchaseDocumentService` | `GET/POST /api/purchases/documents` | `BK-MF1-08`, `BK-MF1-09`, `BK-MF1-10`, `BK-MF3-03`, `BK-MF3-07` | OK |
| `BK-MF1-08` | `Payment`, `PaymentMethod`, `paymentService` | `POST /api/purchases/documents/:id/payments` | `BK-MF3-04` | OK |
| `BK-MF1-09` | `JournalSource.PURCHASE`, `purchasePostingService` | `POST /api/accounting/purchase-postings/:purchaseDocumentId` | `BK-MF3-01`, `BK-MF2-07`, `BK-MF2-08` | OK |
| `BK-MF1-10` | `PurchaseDocumentStatus`, `purchaseApprovalService`, audit log | `POST /api/purchases/documents/:id/approve`, `/post-state` | `BK-MF2-01` | OK |

## Drift resolvido

- A classificacao anterior `10 OK` foi substituida por uma avaliacao antes/depois: antes `0 OK / 7 PARCIAL / 3 CRITICO`, depois `10 OK / 0 PARCIAL / 0 CRITICO`.
- O drift `REGISTERED` no fluxo de compras foi removido dos BKs corrigidos.
- Os passos por prioridade foram alinhados com `docs/planificacao/README.md` e `BACKLOG-MVP.md`.
- O uso de `mockup/` ficou explicitamente fora do contrato tecnico final.
- Os handoffs para MF2/MF3 foram mantidos e clarificados nos BKs afetados.

## Verificacoes executadas

| Comando | Resultado | Interpretacao |
| --- | --- | --- |
| `rg -n 'hidratacao\|pos-auditoria\|scaffold\|roteiro generico\|conversa interna\|este guia deixa de ser\|codigo ainda nao corrigido\|snippet\|exemplo simplificado\|implementar depois\|quando aplicavel\|helpers chamados\|substituir mocks\|pseudo-codigo\|solucao parcial\|corrigir_apenas' docs/planificacao/guias-bk/MF1/*.md` | exit `1`, sem output | OK: nenhuma ocorrencia nos BKs MF1. |
| `git diff --check` | exit `0`, sem output | OK: sem whitespace problematico no diff. |
| `bash scripts/validate-planificacao.sh` | exit `2` | Bloqueado por infraestrutura local: o script chama um ficheiro inexistente fora do checkout. |

Erro exato do validador:

```text
/opt/homebrew/Cellar/python@3.14/3.14.5/Frameworks/Python.framework/Versions/3.14/Resources/Python.app/Contents/MacOS/Python: can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

## Resultado final

A MF1 fica corrigida no escopo documental pedido. Os BKs agora apresentam a granularidade minima por prioridade, removem linguagem interna, fecham os conflitos de estado/numeracao entre vendas e compras, e registam os gates de validacao necessarios para revisao tecnica e uso pedagogico.

O unico bloqueio remanescente nao esta nos BKs: o validador canonico depende de `../scripts/validate_planificacao_canonica.py`, que nao existe neste checkout.
