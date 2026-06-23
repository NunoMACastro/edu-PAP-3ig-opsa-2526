Passo 1
BK:
- BK-MF6-01

RNF:
- RNF08

Operações críticas identificadas:
1. Fatura de venda
   - módulo: sales
   - route: apps/api/src/modules/sales/saleDocumentRoutes.js
   - service: apps/api/src/modules/sales/saleDocumentService.js
   - operação: criação de documento de venda

2. Fatura de compra
   - módulo: purchases
   - route: apps/api/src/modules/purchases/purchaseDocumentRoutes.js
   - service: apps/api/src/modules/purchases/purchaseDocumentService.js
   - operação: criação de documento de compra

3. Lançamento manual
   - módulo: accounting
   - route: apps/api/src/modules/accounting/manualJournalRoutes.js
   - service: apps/api/src/modules/accounting/manualJournalService.js
   - operação: criação de lançamento manual

Critério confirmado:
- a medição deve acontecer no backend;
- a medição deve envolver o service real;
- a medição deve considerar apenas pedidos válidos como sucesso de performance;
- empresa ativa continua a vir do contexto autenticado;
- validação backend, período fiscal, regras de domínio e auditoria não podem ser removidos para melhorar tempo.

Scope-out confirmado:
- não medir apenas clique no frontend;
- não criar documentos fictícios hardcoded;
- não remover validações;
- não alterar regras fiscais, IVA, SNC, numeração ou período fiscal.

Passo 2
Ficheiros criados:
- apps/api/src/modules/performance/documentPerformance.js

Exports criados:
- DOCUMENT_INSERT_BUDGET_MS
- measureDocumentInsert
- toDocumentInsertLog

Regras implementadas:
- orçamento centralizado de 1000 ms;
- medição usa performance.now();
- operação real é executada dentro do helper;
- resultado original é preservado;
- métrica devolve operationName, durationMs e withinBudget;
- log sanitizado não inclui valores financeiros, NIF, IBAN, linhas, payloads ou dados pessoais;
- erros lançados pela operação continuam a subir para o controller.

Validação executada:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> cd apps/api
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/performance/documentPerformance.js

Passo 3
Ficheiros editados:
- apps/api/src/modules/sales/saleDocumentRoutes.js

Regras implementadas:
- importado measureDocumentInsert;
- importado toDocumentInsertLog;
- POST /api/sales/documents mede createSaleDocument;
- medição envolve o service real;
- resposta mantém contrato JSON { saleDocument };
- adicionados headers X-OPSA-Duration-Ms e X-OPSA-Within-Budget;
- log sanitizado não expõe NIF, valores, linhas, cliente ou payload;
- empresa ativa continua a vir de req.companyId;
- frontend não escolhe ownership;
- validações do service não foram alteradas.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/sales/saleDocumentRoutes.js

Passo 4
Ficheiros editados:
- apps/api/src/modules/purchases/purchaseDocumentRoutes.js
- apps/api/src/modules/accounting/manualJournalRoutes.js

Regras implementadas:
- purchaseDocumentRoutes mede createPurchaseDocument;
- manualJournalRoutes mede createManualJournal;
- ambas as routes usam measureDocumentInsert;
- ambas as routes usam toDocumentInsertLog;
- respostas mantêm contratos JSON existentes;
- compras continuam a devolver { purchaseDocument };
- lançamentos manuais continuam a devolver { journalEntry };
- headers X-OPSA-Duration-Ms e X-OPSA-Within-Budget adicionados;
- logs não expõem linhas, valores, fornecedores, contas SNC, NIF, IBAN ou payloads;
- validações dos services não foram alteradas;
- empresa ativa continua a vir de req.companyId.

Smoke validado:
- compra válida devolveu 201 com X-OPSA-Duration-Ms;
- compra válida devolveu X-OPSA-Within-Budget;
- lançamento manual válido devolveu 201 com X-OPSA-Duration-Ms;
- lançamento manual válido devolveu X-OPSA-Within-Budget.

Negativo validado:
- lançamento em período fiscal fechado devolveu erro de domínio;
- erro de domínio não foi transformado em sucesso rápido;
- documento inválido não foi persistido.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/purchases/purchaseDocumentRoutes.js src/modules/accounting/manualJournalRoutes.js

Passo 5
Routes revistas:
- apps/api/src/modules/sales/saleDocumentRoutes.js
- apps/api/src/modules/purchases/purchaseDocumentRoutes.js
- apps/api/src/modules/accounting/manualJournalRoutes.js

Contratos confirmados:
- venda válida devolve 201 com { saleDocument };
- compra válida devolve 201 com { purchaseDocument };
- lançamento manual válido devolve 201 com { journalEntry };
- as três respostas incluem X-OPSA-Duration-Ms;
- as três respostas incluem X-OPSA-Within-Budget;
- o corpo JSON original foi preservado;
- frontend não precisa de alteração para continuar a consumir a resposta.

Privacidade confirmada:
- headers mostram apenas duração e estado do orçamento;
- headers não expõem valores financeiros;
- headers não expõem NIF;
- headers não expõem IBAN;
- headers não expõem linhas de documento;
- headers não expõem dados pessoais;
- console.info usa toDocumentInsertLog(metric), sem payload completo.

Negativos confirmados:
- payload inválido devolve erro controlado;
- documento inválido não é persistido;
- pedido inválido não devolve 201;
- erro de domínio não é contado como sucesso de performance;
- período fiscal fechado não é transformado em sucesso rápido.

Passo 6
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node scripts/check-mf6-document-performance.mjs

Passo 7 

Passo 8
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (50.7906ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (2.3412ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (9.5239ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (5.9348ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (29.9221ms)
✔ BK12: nome de armazém duplicado é rejeitado (21.5479ms)
✔ MF1: permissões backend separam escrita operacional, aprovação e contabilidade (8.3942ms)
✔ MF1: routers principais montam sem dependências inexistentes (39.001ms)
✔ MF1 HTTP: criar venda sem sessão devolve erro de autenticação (13.8458ms)
✔ MF1 HTTP: operacional não pode aprovar venda (6.0066ms)
✔ MF1 HTTP: pagamento em compra rascunho devolve regra de estado (4.1668ms)
node:internal/modules/package_json_reader:301
  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
        ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'exceljs' imported from D:\PAP\edu-PAP-3ig-opsa-2526\apps\api\src\modules\accounting-reports\accountingReportExporters.js
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:859:18)
    at defaultResolve (node:internal/modules/esm/resolve:992:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:691:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:708:38)
    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:740:52)
    at #resolve (node:internal/modules/esm/loader:673:17)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:593:35)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33) {
  code: 'ERR_MODULE_NOT_FOUND'
}

Node.js v24.16.0
✖ tests\contracts\mf2-contracts.test.js (1097.881ms)
✔ MF3: permissões backend cobrem fiscalidade, tesouraria, imports, compliance e reports (14.8394ms)
✔ MF3: routers principais expõem endpoints canónicos (16.1424ms)
✔ P0-MF3-MIG-01: migration MF3 cria tabelas persistentes da macrofase (29.8744ms)
✔ P2-MF3-STATEMENT-INTEGRITY: migrations persistem estados e unicidade de extratos (50.6242ms)
✔ MF4: permissões backend cobrem IA, tarefas, notificações, auditoria e integrações (21.3771ms)
✔ MF4: routers principais expõem endpoints canónicos (46.0345ms)
✔ P0-MF4-MIG-01: migration MF4 cria tabelas persistentes da macrofase (29.0537ms)
ℹ tests 19
ℹ suites 0
ℹ pass 18
ℹ fail 1
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 19881.5246

✖ failing tests:

test at tests\contracts\mf2-contracts.test.js:1:1
✖ tests\contracts\mf2-contracts.test.js (1097.881ms)
  'test failed'

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:integration

> @opsa/api@1.0.0 test:integration
> node --test tests/integration/*.test.js

✖ MF2: fluxos críticos persistem dados reais e preservam companyId (9.8284ms)
✖ MF3: runs persistem dados reais e preservam integridade de extratos (11.4451ms)
ℹ tests 2
ℹ suites 0
ℹ pass 0
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2036.5716

✖ failing tests:

test at tests\integration\mf2-persistence.test.js:249:1
✖ MF2: fluxos críticos persistem dados reais e preservam companyId (9.8284ms)
  Error: Definir TEST_DATABASE_URL para correr integração persistida da MF2. Usa apenas uma base PostgreSQL efémera cujo nome contenha test, audit ou ci. Para saltar deliberadamente em desenvolvimento local, define OPSA_SKIP_PERSISTENCE_TESTS=true.
      at requireTestDatabaseUrl (file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/tests/integration/mf2-persistence.test.js:61:15)
      at TestContext.<anonymous> (file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/tests/integration/mf2-persistence.test.js:257:29)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1306:25)
      at Test.start (node:internal/test_runner/test:1177:17)
      at startSubtestAfterBootstrap (node:internal/test_runner/harness:385:17)

test at tests\integration\mf3-persistence.test.js:296:1
✖ MF3: runs persistem dados reais e preservam integridade de extratos (11.4451ms)
  Error: Definir TEST_DATABASE_URL para correr integração persistida da MF3. Usa apenas uma base PostgreSQL efémera cujo nome contenha test, audit ou ci. Para saltar deliberadamente em desenvolvimento local, define OPSA_SKIP_PERSISTENCE_TESTS=true.
      at requireTestDatabaseUrl (file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/tests/integration/mf3-persistence.test.js:36:15)
      at TestContext.<anonymous> (file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/tests/integration/mf3-persistence.test.js:304:29)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1306:25)
      at Test.start (node:internal/test_runner/test:1177:17)
      at startSubtestAfterBootstrap (node:internal/test_runner/harness:385:17)