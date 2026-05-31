# Auditoria e Correção dos Guias BK - MF1

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF1`
- `macro`: `MF1`
- `data`: `2026-05-31`
- `modo`: `corrigir_apenas`
- `estado`: `correcao_concluida_com_validacao_parcial`
- `escopo`: `docs/planificacao/guias-bk/MF1/`

## Objetivo

Executar a correção dos guias BK da `MF1` já classificados como `CRITICO` no relatório anterior, sem alterar documentos canónicos, requisitos, owners, dependências ou código da aplicação.

O objetivo desta execução foi transformar os 10 guias MF1 em documentação operacional suficiente para orientar implementação real: schema, services, rotas, cliente frontend, validações, cenários negativos, expected results, evidence e handoff para BKs seguintes.

## Limites desta execução

- `MF_ALVO`: `MF1`
- `MODO`: `corrigir_apenas`
- BKs editados: todos os BKs MF1 classificados como `CRITICO` na auditoria inicial.
- Documentos canónicos editados: nenhum.
- Código da aplicação editado: nenhum.
- Os caminhos técnicos seguem `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`: `apps/api`, `apps/web`, Express, React + Vite + TypeScript, PostgreSQL e Prisma/equivalente.
- Referências visuais existentes foram tratadas apenas como apoio de fluxo e nomes visíveis; o contrato técnico usado foi documental.

## Fontes de verdade usadas

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
- Guias corrigidos da `MF0`, usados como padrão de detalhe e integração.

## Resultado antes/depois

| Momento | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção MF1 | 0 | 0 | 10 |
| Depois da correção MF1 | 10 | 0 | 0 |

Interpretação: `OK` significa guia documental pronto para orientar a implementação. Não significa que o código descrito tenha sido criado ou executado na app, porque esta execução alterou apenas documentação de planeamento.

## BKs corrigidos

| BK | Estado antes | Estado depois | Alteração principal |
| --- | --- | --- | --- |
| `BK-MF1-01` | CRITICO | OK | Adicionado contrato completo para tabela de IVA por empresa, validação de códigos/taxas/isencões, API e cliente frontend. |
| `BK-MF1-02` | CRITICO | OK | Adicionado fluxo de documentos de venda, linhas, numeração sequencial, totais backend, estados e endpoint. |
| `BK-MF1-03` | CRITICO | OK | Adicionado modelo de recebimentos, regra parcial/total, bloqueio de excesso e atualização transacional do saldo. |
| `BK-MF1-04` | CRITICO | OK | Adicionado lançamento contabilístico de venda com débito/crédito, contas SNC mínimas, período fiscal e idempotência. |
| `BK-MF1-05` | CRITICO | OK | Adicionada consulta de títulos em aberto, saldo, dias de atraso e buckets de antiguidade. |
| `BK-MF1-06` | CRITICO | OK | Adicionadas transições de aprovação de venda, roles, rejeição com motivo e bloqueio de estados inválidos. |
| `BK-MF1-07` | CRITICO | OK | Adicionado documento de compra, linhas, fornecedor, IVA, número de fornecedor e totais backend. |
| `BK-MF1-08` | CRITICO | OK | Adicionado pagamento a fornecedor, regra parcial/total e atualização transacional da compra. |
| `BK-MF1-09` | CRITICO | OK | Adicionado lançamento contabilístico de compra com gastos, IVA dedutível, fornecedor e idempotência. |
| `BK-MF1-10` | CRITICO | OK | Adicionado estado de compras `DRAFT -> APPROVED -> POSTED`, roles e handoff para histórico em `BK-MF2-01`. |

## Mapa de integração da MF

| BK | Modelos/serviços definidos | Endpoint principal | Reutiliza | Desbloqueia |
| --- | --- | --- | --- | --- |
| `BK-MF1-01` | `VatRate`, `VatRateType`, `vatRateService`, `vatRateRoutes` | `GET/POST/PATCH /api/vat-rates` | MF0 auth, empresa e roles | `BK-MF1-02`, `BK-MF1-07`, `BK-MF3-01` |
| `BK-MF1-02` | `NumberSequence`, `SaleDocument`, `SaleDocumentLine`, `saleDocumentService` | `GET/POST /api/sales/documents` | `Customer`, `Item`, `VatRate`, período fiscal | `BK-MF1-03`, `BK-MF1-04`, `BK-MF1-06`, `BK-MF3-03`, `BK-MF3-07` |
| `BK-MF1-03` | `Receipt`, `ReceiptMethod`, `receiptService` | `POST /api/sales/documents/:id/receipts` | `SaleDocument`, período fiscal | `BK-MF1-05`, `BK-MF3-04` |
| `BK-MF1-04` | `JournalEntry`, `JournalEntryLine`, `salePostingService` | `POST /api/accounting/sale-postings/:saleDocumentId` | `SaleDocument`, `Account`, período fiscal | `BK-MF3-01`, `BK-MF2-07`, `BK-MF2-08` |
| `BK-MF1-05` | `salesOpenItemsService` | `GET /api/sales/open-items` | `SaleDocument`, `Customer`, recebimentos | `BK-MF3-04`, `BK-MF3-07` |
| `BK-MF1-06` | `saleApprovalService` | `POST /api/sales/documents/:id/submit`, `/approve`, `/reject` | `SaleDocument`, roles MF0 | `BK-MF2-01`, MF4 auditoria/notificações |
| `BK-MF1-07` | `PurchaseDocument`, `PurchaseDocumentLine`, `purchaseDocumentService` | `GET/POST /api/purchases/documents` | `Supplier`, `Item`, `VatRate`, período fiscal | `BK-MF1-08`, `BK-MF1-09`, `BK-MF3-03`, `BK-MF3-07` |
| `BK-MF1-08` | `Payment`, `PaymentMethod`, `paymentService` | `POST /api/purchases/documents/:id/payments` | `PurchaseDocument`, período fiscal | `BK-MF3-04` |
| `BK-MF1-09` | `purchasePostingService` sobre `JournalEntry` | `POST /api/accounting/purchase-postings/:purchaseDocumentId` | `PurchaseDocument`, `Account`, período fiscal | `BK-MF3-01`, `BK-MF2-07`, `BK-MF2-08` |
| `BK-MF1-10` | `purchaseApprovalService` | `POST /api/purchases/documents/:id/approve`, `/post-state` | `PurchaseDocument`, roles MF0 | `BK-MF2-01` |

## Padrões aplicados nos BKs corrigidos

- Header canónico preservado: `bk_id`, `owner`, `apoio`, `prioridade`, `esforco`, `dependencias`, `rf_rnf`, `sprint`, `core_or_reforco`, `proximo_bk`.
- Estrutura comum: objetivo, importância funcional/pedagógica, scope-in, scope-out, estado antes/depois, pré-requisitos, glossário, teoria, arquitetura, ficheiros, erros comuns, negativos, passos lineares, expected results, critérios, validação, evidence, handoff e changelog.
- Cada passo técnico contém os sete pontos exigidos: objetivo funcional, ficheiros, instruções, código, explicação, validação e cenário negativo.
- Todos os serviços recebem `companyId` do contexto autenticado.
- Escritas com múltiplas alterações usam transação.
- Valores monetários são tratados em cêntimos.
- Operações contabilísticas chamam ou declaram dependência de `assertOpenFiscalPeriod`.
- Rotas usam `requireAuth(prisma)`, `requireCompanyContext(prisma)` e roles da MF0.
- Erros HTTP passam por `httpError`/`toHttpError`.

## Validações executadas

| Comando | Resultado | Interpretação |
| --- | --- | --- |
| `rg -n <regex-da-prompt> docs/planificacao/guias-bk/MF1/*.md` | exit `1`, sem output | OK: o `rg` devolve `1` quando não encontra ocorrências. |
| `git diff --check` | exit `0`, sem output | OK: sem whitespace problemático no diff. |
| `bash scripts/validate-planificacao.sh` | exit `2` | Bloqueado: o script tenta abrir `../scripts/validate_planificacao_canonica.py`, mas esse ficheiro não existe neste checkout. |

Erro exato do validador:

```text
/opt/homebrew/Cellar/python@3.14/3.14.5/Frameworks/Python.framework/Versions/3.14/Resources/Python.app/Contents/MacOS/Python: can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

## Riscos residuais

- Os guias estão prontos como documentação operacional, mas o código descrito ainda terá de ser implementado e testado na app real.
- Contas SNC e regras fiscais foram mantidas no nível mínimo documentado. Durante implementação real, qualquer exigência legal adicional deve ser confirmada em fonte normativa antes de ser codificada.
- O validador canónico não pôde confirmar a matriz por ausência do ficheiro externo indicado acima.

## Conclusão

A MF1 deixou de estar bloqueada documentalmente. Os 10 BKs agora têm contratos técnicos e pedagógicos suficientes para implementação faseada, mantendo coerência com MF0 e preparando dependências diretas de MF2 e MF3.
