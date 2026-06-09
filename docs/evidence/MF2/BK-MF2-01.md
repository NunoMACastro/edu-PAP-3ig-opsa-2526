Passo 1
bk=BK-MF2-01
macro=MF2
rf=RF23
dependencias=BK-MF1-10
proximo=BK-MF2-02

Passo 2
ficeiro editado: apps/api/prisma/schema.prisma

Passo 3
Ficeiros criados
apps/api/src/modules/purchase-approval/purchaseApprovalHistoryValidators.js
apps/api/src/modules/purchase-approval/purchaseApprovalService.js

Passo 4
Ficheiro editado - apps/api/src/modules/purchase-approval/purchaseApprovalRoutes.js

Passo 5
Ficheiro criado - apps/web/src/lib/purchaseApprovalApi.ts

Passo 6
Ficheiro editado - apps/web/src/pages/PurchaseApprovalPage.tsx

# BK-MF2-01

- Requisito validado: RF23
- Endpoints: POST /api/purchases/documents/:id/approve, POST /api/purchases/documents/:id/reject, GET /api/purchases/documents/:id/approval-history
- Endpoint preservado de BK-MF1-10: POST /api/purchases/documents/:id/post-state
- Negativos: sem sessão, role sem permissão, documento inexistente, reprovação sem motivo, decisão em estado inválido
- Resultado: preencher com os comandos executados e prints da UI

[23:24, 08/06/2026] SR💞: @sofialramos ➜ /workspaces/edu-PAP-3ig-opsa-2526 (feat/bk-mf2-01-historico-aprovacoes-sofia) $ npm --prefix apps/api run test:unit

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js

✔️ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (1.436411ms)
✔️ BK01: registo mantém política de password forte (0.552509ms)
✔️ BK06: perfil da empresa assume EUR quando currency é omitida (0.408554ms)
✔️ BK06: perfil da empresa rejeita dia fiscal impossível (0.250901ms)
✔️ BK07: importação vazia é rejeitada (0.170627ms)
✔️ BK10: fornecedor aceita NIF vazio e valida quando preenchido (0.244414ms)
✔️ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (0.33876ms)
✔️ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (0.286669ms)
✔️ BK02: permissões de escrita seguem os atores documentados na MF0 (0.254872ms)
✔️ BK-MF1-01: IVA isento exige motivo de isenção (1.520312ms)
✔️ BK-MF1-02: venda calcula totais no backend e usa companyId do contexto (0.85157ms)
✔️ BK-MF1-06: emissão definitiva exige venda aprovada (1.33726ms)
✔️ BK-MF1-02: emissão definitiva reserva número por upsert atómico (0.814737ms)
✔️ BK-MF1-02: emissão concorrente não reserva número sem claim do documento (0.370415ms)
✔️ BK-MF1-03: recebimento não pode exceder montante em aberto (0.437141ms)
✔️ BK-MF1-03: recebimento rejeita saldo alterado em concorrência (0.428095ms)
✔️ BK-MF1-04: lançamento de venda fica balanceado (0.849711ms)
✔️ BK-MF1-05: títulos em aberto calculam antiguidade e ignoram liquidados (0.537729ms)
✔️ BK-MF1-07/BK-MF1-10: compra nasce em rascunho com totais backend (1.196309ms)
✔️ BK-MF1-08: pagamento rejeita compra ainda em rascunho (0.50049ms)
✔️ BK-MF1-08: pagamento rejeita saldo alterado em concorrência (0.396172ms)
✔️ BK-MF1-08: pagamento total não altera estado contabilístico da compra (0.367314ms)
✔️ BK-MF1-09: lançamento de compra fica balanceado (0.587256ms)
✖️ BK-MF1-10: compra paga pode ser lançada e termina em POSTED (0.375096ms)
✖️ BK-MF1-10: aprovação de compra só aceita rascunho (1.157939ms)
ℹ️ tests 25
ℹ️ suites 0
ℹ️ pass 23
ℹ️ fail 2
ℹ️ cancelled 0
ℹ️ skipped 0
ℹ️ todo 0
ℹ️ duration_ms 218.525252

✖️ failing tests:

test at tests/unit/mf1-services.test.js:595:1
✖️ BK-MF1-10: compra paga pode ser lançada e termina em POSTED (0.375096ms)
  Error [HttpError]: Apenas compras aprovadas podem ser lançadas.
      at httpError (file:///workspaces/edu-PAP-3ig-opsa-2526/apps/api/src/lib/httpErrors.js:40:12)
      at file:///workspaces/edu-PAP-3ig-opsa-2526/apps/api/src/modules/purchase-approval/purchaseApprovalService.js:134:13
      at async TestContext.<anonymous> (file:///workspaces/edu-PAP-3ig-opsa-2526/apps/api/tests/unit/mf1-services.test.js:635:5)
      at async Test.run (node:internal/test_runner/test:1125:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:787:7) {
    status: 409,
    code: 'INVALID_STATUS',
    details: undefined
  }

test at tests/unit/mf1-services.test.js:645:1
✖️ BK-MF1-10: aprovação de compra só aceita rascunho (1.157939ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  
  + Comparison {}
  - Comparison {
  -   code: 'INVALID_STATUS'
  - }
  
      at async TestContext.<anonymous> (file:///workspaces/edu-PAP-3ig-opsa-2526/apps/api/tests/unit/mf1-services.test.js:655:5)
      at async Test.run (node:internal/test_runner/test:1125:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:787:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: TypeError: prisma.$transaction is not a function
        at approvePurchaseDocument (file:///workspaces/edu-PAP-3ig-opsa-2526/apps/api/src/modules/purchase-approval/purchaseApprovalService.js:44:17)
        at assert.rejects.code (file:///workspaces/edu-PAP-3ig-opsa-2526/apps/api/tests/unit/mf1-services.test.js:656:15)
        at waitForActual (node:assert:632:21)
        at strict.rejects (node:assert:769:31)
        at TestContext.<anonymous> (file:///workspaces/edu-PAP-3ig-opsa-2526/apps/api/tests/unit/mf1-services.test.js:655:18)
        at Test.runInAsyncScope (node:async_hooks:228:14)
        at Test.run (node:internal/test_runner/test:1118:25)
        at Test.processPendingSubtests (node:internal/test_runner/test:787:18)
        at Test.postRun (node:internal/test_runner/test:1247:19)
        at Test.run (node:internal/test_runner/test:1175:12),
    expected: { code: 'INVALID_STATUS' },
    operator: 'rejects',
    diff: 'simple'
  }