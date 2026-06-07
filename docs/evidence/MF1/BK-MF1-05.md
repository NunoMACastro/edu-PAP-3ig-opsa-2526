### Passo 1

* BK: BK-MF1-05
* Macrofase: MF1
* Requisito funcional: RF17
* Dependencia: BK-MF0-03, BK-MF1-02, BK-MF1-03
* Sprint: S03-S04
* Proximo BK: BK-MF1-06
* Endpoint previsto: /api/sales/open-items

### Passo 2

Objetivo
Fechar a consulta de titulos em aberto e antiguidade de saldos de clientes.

Decisoes registadas
- A consulta e de leitura pura.
- A API usa documentos de venda emitidos e ainda nao liquidados.
- Notas de credito ficam fora da listagem de saldos a receber.
- O saldo em aberto e calculado como `totalCents - amountPaidCents`.
- A data de referencia pode ser enviada por query string.
- Os buckets usados sao `NOT_DUE`, `DAYS_1_30`, `DAYS_31_60`, `DAYS_61_90` e `DAYS_90_PLUS`.
- O `companyId` vem sempre do contexto autenticado.
- A listagem prepara o handoff para previsao de tesouraria, sem implementar a MF3.

### Passo 3

Implementacao realizada
- Service de titulos em aberto com calculo de saldo, dias em atraso e bucket.
- Route protegida por autenticacao, contexto multiempresa e permissao de leitura de vendas.
- Integracao no servidor Express.
- Teste unitario para antiguidade de saldos e exclusao de documentos liquidados.

### Passo 4

Validacao Final BK-MF1-05

Smoke
- Endpoint `GET /api/sales/open-items` implementado.
- Documentos emitidos com saldo em aberto sao listados.
- Documentos liquidados sao ignorados.
- Data de referencia permite calcular buckets de antiguidade.
- Nome do cliente e valores em centimos sao devolvidos pela API.

Negativos
- Pedido sem sessao devolve `401`.
- Pedido sem empresa ativa devolve erro definido pela MF0.
- Utilizador sem permissao de leitura de vendas e bloqueado.
- Data de referencia invalida devolve `INVALID_DATE`.
- Dados de outra empresa nao aparecem na listagem.

Bloqueios e limites do BK
- Nao cria nem altera documentos.
- Nao executa cobrancas automaticas.
- Nao implementa previsao de tesouraria detalhada.

### Evidencia obrigatoria - BK-MF1-05

#### pr
PR: ainda nao criado.

#### proof
Foi implementada uma consulta de saldos em aberto por empresa, baseada em documentos de venda emitidos e montante ja recebido.
A API devolve saldo, dias em atraso e bucket de antiguidade.

#### neg
Cenarios negativos previstos/validados:
- `SESSION_REQUIRED`
- `COMPANY_CONTEXT_REQUIRED`
- `PERMISSION_FORBIDDEN`
- `INVALID_DATE`
- Exclusao de documentos liquidados
- Exclusao de documentos de outra empresa por filtro de `companyId`

#### files
- `apps/api/src/modules/open-items/salesOpenItemsService.js`
- `apps/api/src/modules/open-items/salesOpenItemsRoutes.js`
- `apps/api/src/server.js`
- `apps/api/tests/unit/mf1-services.test.js`
- `apps/web/src/lib/salesOpenItemsApi.ts`
- `apps/web/src/pages/SalesOpenItemsPage.tsx`
- `docs/evidence/MF1/BK-MF1-05.md`

#### commands
```bash
npm --prefix apps/api run syntax:check
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
npm --prefix apps/api test
git diff --check
```

#### screenshots
Sem screenshots incluidos nesta revisao.

#### notes
- A consulta nao escreve em base de dados.
- O frontend nao recalcula buckets; apenas apresenta a resposta do backend.
- Os caminhos de ficheiros usam `apps/`, a arvore canonica para entrega aos alunos.
