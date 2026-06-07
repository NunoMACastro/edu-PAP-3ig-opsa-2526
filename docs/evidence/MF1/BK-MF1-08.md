### Passo 1

* BK: BK-MF1-08
* Macrofase: MF1
* Requisito funcional: RF20
* Dependencia: BK-MF0-03, BK-MF0-08, BK-MF1-07
* Sprint: S03-S04
* Proximo BK: BK-MF1-09
* Endpoint previsto: /api/purchases/documents/:id/payments

### Passo 2

Objetivo
Fechar o registo de pagamentos parciais e totais a fornecedores, mantendo saldo, auditoria e separacao entre tesouraria e contabilizacao.

Decisoes registadas
- O pagamento pertence sempre a empresa ativa.
- O `companyId` nunca e recebido pelo body.
- O documento de compra deve existir na empresa ativa.
- Notas de credito de fornecedor nao recebem pagamentos neste fluxo.
- So compras aprovadas, lancadas ou historicamente pagas podem receber pagamentos.
- O valor pago nao pode exceder o saldo em aberto.
- O pagamento e a atualizacao de `amountPaidCents` acontecem na mesma transacao.
- Pagamento total nao muda o estado contabilistico da compra.
- A contabilizacao permanece responsabilidade do BK-MF1-09/BK-MF1-10.
- O registo e auditado em `AuditLog`.

### Passo 3

Implementacao realizada
- Modelo de pagamentos associado a documento de compra.
- Service de pagamentos com validacao de payload, estado, saldo e periodo fiscal.
- Route protegida por autenticacao, contexto multiempresa e permissao de escrita de compras.
- Testes unitarios para compra em rascunho, concorrencia de saldo e pagamento total sem mudar estado contabilistico.
- Teste de contrato com router real para pagamento em compra `DRAFT`.

### Passo 4

Validacao Final BK-MF1-08

Smoke
- Endpoint `POST /api/purchases/documents/:id/payments` implementado.
- Pagamento parcial suportado.
- Pagamento total suportado.
- Atualizacao de `amountPaidCents` feita pelo backend.
- Auditoria criada com documento, valor e saldo resultante.
- Estado contabilistico da compra preservado no pagamento.

Negativos
- Pedido sem sessao devolve `401`.
- Pedido sem empresa ativa devolve erro definido pela MF0.
- Body invalido devolve `400`.
- Valor invalido ou menor/igual a zero devolve `400`.
- Metodo invalido devolve `400`.
- Data invalida devolve `400`.
- Compra inexistente ou de outra empresa devolve `404`.
- Compra em `DRAFT` devolve `INVALID_STATUS`.
- Nota de credito devolve `CREDIT_NOTE_NOT_PAYABLE`.
- Valor acima do saldo em aberto devolve `AMOUNT_EXCEEDS_OPEN`.
- Saldo alterado em concorrencia devolve `STALE_BALANCE`.
- Periodo fiscal fechado bloqueia a operacao.

Bloqueios e limites do BK
- Reconciliacao bancaria fica fora do scope.
- Bancos e caixa avancados ficam fora do scope.
- Pagamento nao cria diario contabilistico automatico.

### Evidencia obrigatoria - BK-MF1-08

#### pr
PR: ainda nao criado.

#### proof
Foi implementado o dominio de pagamentos a fornecedores, com atualizacao transacional de saldo e auditoria.
A correcao de 2026-06-07 garante que pagamento total nao altera o estado contabilistico do documento de compra.

#### neg
Cenarios negativos previstos/validados:
- `INVALID_BODY`
- `INVALID_AMOUNT`
- `INVALID_DATE`
- `INVALID_METHOD`
- `PURCHASE_DOCUMENT_NOT_FOUND`
- `CREDIT_NOTE_NOT_PAYABLE`
- `INVALID_STATUS`
- `AMOUNT_EXCEEDS_OPEN`
- `STALE_BALANCE`
- `FISCAL_PERIOD_CLOSED`

#### files
- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/payments/paymentService.js`
- `apps/api/src/modules/payments/paymentRoutes.js`
- `apps/api/src/server.js`
- `apps/api/tests/unit/mf1-services.test.js`
- `apps/api/tests/contracts/mf1-contracts.test.js`
- `apps/web/src/lib/paymentApi.ts`
- `apps/web/src/pages/PaymentsPage.tsx`
- `docs/evidence/MF1/BK-MF1-08.md`

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
- O pagamento e tesouraria; o lancamento contabilistico e responsabilidade dos BKs seguintes.
- O dinheiro e guardado em centimos.
- Os caminhos de ficheiros usam `apps/`, a arvore canonica para entrega aos alunos.
