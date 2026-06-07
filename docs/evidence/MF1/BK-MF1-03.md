### Passo 1

* BK: BK-MF1-03
* Macrofase: MF1
* Requisito funcional: RF15
* Dependencia: BK-MF0-03, BK-MF0-08, BK-MF1-02
* Sprint: S03-S04
* Proximo BK: BK-MF1-04
* Endpoint previsto: /api/sales/documents/:id/receipts

### Passo 2

Objetivo
Fechar o registo de recebimentos parciais e totais de clientes, mantendo o saldo do documento de venda coerente e auditavel.

Decisoes registadas
- O recebimento pertence sempre a empresa ativa pelo contexto autenticado.
- O `companyId` nunca e recebido pelo body.
- O documento de venda deve existir na empresa ativa.
- Notas de credito de venda nao recebem recebimentos neste fluxo.
- So documentos emitidos ou ja parcialmente liquidados podem receber valores.
- O valor recebido nao pode exceder o montante em aberto.
- A criacao do recebimento e a atualizacao do saldo do documento acontecem na mesma transacao.
- O pagamento total altera o documento para `SETTLED`.
- A data do recebimento deve pertencer a periodo fiscal aberto.
- O registo e auditado em `AuditLog`.

### Passo 3

Implementacao realizada
- Modelo de recebimentos associado a documento de venda.
- Service de recebimentos com validacao de payload, estado, saldo e periodo fiscal.
- Route protegida por autenticacao, contexto multiempresa e permissao de escrita de vendas.
- Integracao no servidor Express.
- Testes unitarios para excesso de recebimento e saldo alterado em concorrencia.

### Passo 4

Validacao Final BK-MF1-03

Smoke
- Endpoint `POST /api/sales/documents/:id/receipts` implementado.
- Registo de recebimento parcial suportado.
- Registo de recebimento total suportado.
- Atualizacao de `amountPaidCents` feita pelo backend.
- Documento passa a `SETTLED` quando o valor recebido completa o total.
- Auditoria criada com documento, valor e saldo resultante.

Negativos
- Pedido sem sessao devolve `401`.
- Pedido sem empresa ativa devolve erro definido pela MF0.
- Body invalido devolve `400`.
- Valor invalido ou menor/igual a zero devolve `400`.
- Metodo invalido devolve `400`.
- Data invalida devolve `400`.
- Documento inexistente ou de outra empresa devolve `404`.
- Nota de credito devolve `CREDIT_NOTE_NOT_RECEIVABLE`.
- Documento fora de estado emitido devolve `INVALID_STATUS`.
- Valor acima do saldo em aberto devolve `AMOUNT_EXCEEDS_OPEN`.
- Saldo alterado em concorrencia devolve `STALE_BALANCE`.
- Periodo fiscal fechado bloqueia a operacao.

Bloqueios e limites do BK
- Reconciliacao bancaria fica fora do scope.
- Previsao de tesouraria fica para BK-MF3-04.
- O frontend nao calcula nem decide saldos.

### Evidencia obrigatoria - BK-MF1-03

#### pr
PR: ainda nao criado.

#### proof
Foi implementado o dominio de recebimentos para documentos de venda, com atualizacao transacional do saldo e auditoria.
O fluxo suporta recebimentos parciais e totais e impede recebimentos acima do valor em aberto.

#### neg
Cenarios negativos previstos/validados:
- `INVALID_BODY`
- `INVALID_AMOUNT`
- `INVALID_DATE`
- `INVALID_METHOD`
- `SALE_DOCUMENT_NOT_FOUND`
- `CREDIT_NOTE_NOT_RECEIVABLE`
- `INVALID_STATUS`
- `AMOUNT_EXCEEDS_OPEN`
- `STALE_BALANCE`
- `FISCAL_PERIOD_CLOSED`

#### files
- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/receipts/receiptService.js`
- `apps/api/src/modules/receipts/receiptRoutes.js`
- `apps/api/src/server.js`
- `apps/api/tests/unit/mf1-services.test.js`
- `apps/web/src/lib/receiptApi.ts`
- `apps/web/src/pages/ReceiptsPage.tsx`
- `docs/evidence/MF1/BK-MF1-03.md`

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
- O recebimento e uma operacao de tesouraria de vendas, nao uma reconciliacao bancaria.
- O `companyId` vem exclusivamente do contexto autenticado.
- O dinheiro e guardado em centimos.
- Os caminhos de ficheiros usam `apps/`, a arvore canonica para entrega aos alunos.
