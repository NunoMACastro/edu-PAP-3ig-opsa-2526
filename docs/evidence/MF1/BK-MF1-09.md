### Passo 1

* BK: BK-MF1-09
* Macrofase: MF1
* Requisito funcional: RF21
* Dependencia: BK-MF0-03, BK-MF0-08, BK-MF1-04, BK-MF1-07
* Sprint: S03-S04
* Proximo BK: BK-MF1-10
* Endpoint previsto: /api/accounting/purchase-postings/:purchaseDocumentId

### Passo 2

Objetivo
Fechar o lancamento contabilistico automatico de compras, garantindo diario balanceado, idempotencia e auditoria.

Decisoes registadas
- A compra deve pertencer a empresa ativa.
- O `companyId` nunca e recebido pelo body.
- O lancamento usa contas SNC pedagogicas minimas: `62`, `2432` e `221`.
- Fatura de fornecedor debita gasto e IVA dedutivel e credita fornecedor.
- Nota de credito de fornecedor inverte os movimentos para reduzir a divida.
- O diario deve ficar balanceado antes de ser persistido.
- A origem contabilistica e `PURCHASE`.
- A unicidade por `source/sourceId` impede contabilizacao duplicada.
- Depois do lancamento, a compra termina em `POSTED`.
- A funcao transacional pode ser reutilizada pelo BK-MF1-10.

### Passo 3

Implementacao realizada
- Service de contabilizacao automatica de compras.
- Criacao de `JournalEntry` e linhas contabilisticas por documento de compra.
- Atualizacao do estado da compra para `POSTED`.
- Auditoria do diario e do documento de compra.
- Route protegida por autenticacao, contexto multiempresa e permissao contabilistica.
- Testes unitarios para lancamento balanceado e normalizacao de compra historicamente `PAID` para `POSTED`.

### Passo 4

Validacao Final BK-MF1-09

Smoke
- Endpoint `POST /api/accounting/purchase-postings/:purchaseDocumentId` implementado.
- Compra aprovada gera diario contabilistico.
- Lancamento fica balanceado.
- Compra contabilizada termina em `POSTED`.
- Auditoria criada para `JournalEntry` e `PurchaseDocument`.
- Segunda tentativa e bloqueada por idempotencia.

Negativos
- Pedido sem sessao devolve `401`.
- Pedido sem empresa ativa devolve erro definido pela MF0.
- Utilizador sem permissao contabilistica e bloqueado.
- Compra inexistente ou de outra empresa devolve `404`.
- Compra em estado invalido devolve `INVALID_STATUS`.
- Periodo fiscal fechado bloqueia a contabilizacao.
- Conta SNC obrigatoria em falta devolve `ACCOUNT_NOT_FOUND`.
- Lancamento desequilibrado devolve `UNBALANCED_ENTRY`.
- Duplicacao devolve `PURCHASE_ALREADY_POSTED`.

Bloqueios e limites do BK
- Lancamentos manuais pertencem ao BK-MF2-06.
- Mapas de IVA pertencem ao BK-MF3-01.
- O frontend nao calcula debitos nem creditos.

### Evidencia obrigatoria - BK-MF1-09

#### pr
PR: ainda nao criado.

#### proof
Foi implementada contabilizacao automatica de compras com diario balanceado, origem `PURCHASE`, idempotencia e auditoria.
A correcao de 2026-06-07 garante que qualquer compra contabilizada termina formalmente em `POSTED`.

#### neg
Cenarios negativos previstos/validados:
- `SESSION_REQUIRED`
- `COMPANY_CONTEXT_REQUIRED`
- `PERMISSION_FORBIDDEN`
- `PURCHASE_DOCUMENT_NOT_FOUND`
- `INVALID_STATUS`
- `FISCAL_PERIOD_CLOSED`
- `ACCOUNT_NOT_FOUND`
- `UNBALANCED_ENTRY`
- `PURCHASE_ALREADY_POSTED`

#### files
- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/accounting/purchasePostingService.js`
- `apps/api/src/modules/accounting/purchasePostingRoutes.js`
- `apps/api/src/server.js`
- `apps/api/tests/unit/mf1-services.test.js`
- `apps/web/src/lib/accountingApi.ts`
- `apps/web/src/pages/PurchasePostingsPage.tsx`
- `docs/evidence/MF1/BK-MF1-09.md`

#### commands
```bash
npm --prefix apps/api run prisma:validate
npm --prefix apps/api run syntax:check
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
npm --prefix apps/api test
git diff --check
```

#### screenshots
Sem screenshots incluidos nesta revisao.

#### notes
- O lancamento contabilistico e sempre calculado no backend.
- O estado `PAID` pode existir como historico, mas o lancamento formal termina em `POSTED`.
- Os caminhos de ficheiros usam `apps/`, a arvore canonica para entrega aos alunos.
