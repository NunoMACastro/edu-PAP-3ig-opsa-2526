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

