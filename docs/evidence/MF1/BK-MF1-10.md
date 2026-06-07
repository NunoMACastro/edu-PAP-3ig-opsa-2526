### Passo 1

* BK: BK-MF1-10
* Macrofase: MF1
* Requisito funcional: RF22
* Dependencia: BK-MF0-03, BK-MF0-08, BK-MF1-07, BK-MF1-09
* Sprint: S03-S04
* Proximo BK: BK-MF2-01
* Endpoint previsto: /api/purchases/documents/:id/approve e /api/purchases/documents/:id/post-state

### Passo 2

Objetivo
Fechar o workflow de compras com estados controlados: `DRAFT -> APPROVED -> POSTED`.

Decisoes registadas
- A compra nasce em `DRAFT` no BK-MF1-07.
- A aprovacao so aceita compras em `DRAFT`.
- O lancamento so aceita compras aprovadas ou historicamente pagas.
- O resultado formal do lancamento e sempre `POSTED`.
- O diario contabilistico e criado no mesmo fluxo transacional do lancamento.
- O `companyId` vem sempre do contexto autenticado.
- Aprovacao e lancamento ficam auditados.
- Historico detalhado de justificacoes fica para BK-MF2-01.

### Passo 3

Implementacao realizada
- Service de aprovacao de compras.
- Endpoint de aprovacao por gestor/administrador.
- Endpoint de lancamento por contabilista/administrador.
- Reutilizacao de `postPurchaseDocumentInTransaction` para garantir diario, estado e auditoria no mesmo fluxo.
- Testes unitarios para compra paga antes do lancamento terminar em `POSTED`.

### Passo 4

Validacao Final BK-MF1-10

Smoke
- Endpoint `POST /api/purchases/documents/:id/approve` implementado.
- Endpoint `POST /api/purchases/documents/:id/post-state` implementado.
- Compra `DRAFT` passa para `APPROVED`.
- Compra aprovada pode ser lancada.
- Compra historicamente `PAID` pode ser lancada e termina em `POSTED`.
- Lancamento cria diario contabilistico e auditoria.

Negativos
- Pedido sem sessao devolve `401`.
- Pedido sem empresa ativa devolve erro definido pela MF0.
- Utilizador sem permissao de aprovacao de compras e bloqueado.
- Utilizador sem permissao contabilistica e bloqueado no lancamento.
- Compra inexistente ou de outra empresa devolve `404`.
- Aprovar compra que nao esta em `DRAFT` devolve `INVALID_STATUS`.
- Lancar compra em estado invalido devolve `INVALID_STATUS`.
- Periodo fiscal fechado bloqueia o lancamento.
- Segunda contabilizacao e bloqueada por idempotencia.

Bloqueios e limites do BK
- Historico detalhado de aprovacoes fica para BK-MF2-01.
- Notificacoes ficam fora do scope.
- O frontend nao decide transicoes de estado.

### Evidencia obrigatoria - BK-MF1-10

#### pr
PR: ainda nao criado.

#### proof
Foi implementado o workflow de compras com estados `DRAFT -> APPROVED -> POSTED`.
A correcao de 2026-06-07 alinha BK-MF1-08, BK-MF1-09 e BK-MF1-10: pagamento total nao muda estado contabilistico e lancamento termina em `POSTED`.

#### neg
Cenarios negativos previstos/validados:
- `SESSION_REQUIRED`
- `COMPANY_CONTEXT_REQUIRED`
- `PERMISSION_FORBIDDEN`
- `PURCHASE_DOCUMENT_NOT_FOUND`
- `INVALID_STATUS`
- `FISCAL_PERIOD_CLOSED`
- `PURCHASE_ALREADY_POSTED`

#### files
- `apps/api/src/modules/purchase-approval/purchaseApprovalService.js`
- `apps/api/src/modules/purchase-approval/purchaseApprovalRoutes.js`
- `apps/api/src/modules/accounting/purchasePostingService.js`
- `apps/api/src/server.js`
- `apps/api/tests/unit/mf1-services.test.js`
- `apps/web/src/lib/purchaseApprovalApi.ts`
- `apps/web/src/pages/PurchaseApprovalPage.tsx`
- `docs/evidence/MF1/BK-MF1-10.md`

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
- `POSTED` significa que existe diario contabilistico.
- `PAID` nao deve ser usado como estado formal de lancamento.
- Os caminhos de ficheiros usam `apps/`, a arvore canonica para entrega aos alunos.
