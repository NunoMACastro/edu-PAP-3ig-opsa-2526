Passo 1
BK:
- BK-MF6-03

RNF:
- RNF10 - Reconciliação bancária deve sugerir correspondências em até 3 segundos.

Dados de origem confirmados:

1. Linhas de extrato bancário
   - origem: apps/api/src/modules/treasury/statementImportService.js
   - campos relevantes:
     - bookedAt
     - amountCents
     - description
     - reference
     - companyId

2. Recebimentos
   - origem: apps/api/src/modules/receipts/receiptService.js
   - campos relevantes:
     - receivedAt
     - amountCents
     - companyId
     - entidade/documento associado

3. Pagamentos
   - origem: apps/api/src/modules/payments/paymentService.js
   - campos relevantes:
     - paidAt
     - amountCents
     - companyId
     - entidade/documento associado

Regras confirmadas:
- recebimento não é pagamento;
- linha bancária não é lançamento contabilístico;
- sugestão não confirma movimentos automaticamente;
- companyId continua obrigatório em todas as queries;
- a comparação deve usar data, valor e fonte, não apenas descrição textual.

Negativo considerado:
- usar apenas descrição textual pode sugerir matches errados com o mesmo valor.

Passo 2
Ficheiros criados:
- apps/api/src/modules/treasury/reconciliationPerformance.js

Exports criados:
- RECONCILIATION_BUDGET_MS
- RECONCILIATION_MAX_CANDIDATES
- limitReconciliationCandidates
- measureReconciliation

Regras implementadas:
- orçamento de reconciliação definido em 3000 ms;
- máximo de candidatos definido em 250;
- lotes grandes devolvem partial=true;
- measureReconciliation mede a operação real;
- withinBudget indica se a sugestão ficou dentro do orçamento;
- a medição não confirma movimentos automaticamente.

Validação executada:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/treasury/reconciliationPerformance.js

Passo 3
Ficheiros editados:
- apps/api/src/modules/treasury/statementImportService.js

Regras implementadas:
- importado RECONCILIATION_BUDGET_MS;
- importado limitReconciliationCandidates;
- importado measureReconciliation;
- criada função normalizeCandidateLimit;
- criada pontuação para candidatos RECEIPT;
- criada pontuação para candidatos PAYMENT;
- criada procura de candidatos por companyId, valor e janela de data;
- criada função suggestReconciliations;
- sugestões são medidas com orçamento de 3000 ms;
- resposta devolve status complete ou partial;
- resposta devolve durationMs, withinBudget e budgetMs;
- sugestão não confirma recebimento;
- sugestão não confirma pagamento;
- sugestão não cria lançamento contabilístico;
- linha de outra empresa devolve 404.

Smoke validado:
- pedido com statementLineId válido devolveu status complete;
- resposta incluiu suggestions;
- resposta incluiu durationMs;
- resposta incluiu withinBudget;
- resposta incluiu budgetMs=3000.

Negativos validados:
- sem statementLineId devolve 400 STATEMENT_LINE_REQUIRED;
- linha inexistente devolve 404 BANK_STATEMENT_LINE_NOT_FOUND;
- linha de outra empresa devolve 404 BANK_STATEMENT_LINE_NOT_FOUND;
- candidateLimit fora de 1..250 devolve 400 INVALID_RECONCILIATION_LIMIT.

Passo 4
Ficheiros editados:
- apps/api/src/modules/treasury/statementRoutes.js

Endpoint criado:
- POST /api/treasury/statements/reconciliations/suggestions

Nota de adaptação:
- O guia indica POST /api/treasury/reconciliations/suggestions.
- A app atual monta buildStatementRoutes em /api/treasury/statements.
- Para preservar compatibilidade com BK-MF3-03, o endpoint real ficou dentro do router existente.

Regras implementadas:
- route protegida pelos mesmos guards da importação de extratos;
- sessão obrigatória;
- empresa ativa obrigatória;
- permissão/role de tesouraria mantida;
- companyId vem de req.companyId;
- companyId enviado no body é ignorado;
- suggestReconciliations recebe input do body e companyId autenticado;
- resposta devolve suggestions, status, durationMs, withinBudget e budgetMs;
- header X-OPSA-Reconciliation-Duration-Ms adicionado;
- sugestão não confirma pagamentos;
- sugestão não confirma recebimentos;
- sugestão não cria lançamentos contabilísticos.

Smoke validado:
- pedido válido devolveu 200;
- resposta incluiu suggestions;
- resposta incluiu status;
- resposta incluiu durationMs;
- resposta incluiu X-OPSA-Reconciliation-Duration-Ms.

Negativos validados:
- sem sessão devolve 401;
- sem statementLineId devolve 400 STATEMENT_LINE_REQUIRED;
- linha inexistente ou de outra empresa devolve 404 BANK_STATEMENT_LINE_NOT_FOUND;
- companyId no body não altera ownership.

Passo 5
Ficheiros criados/editados:
- criado apps/api/scripts/check-mf6-reconciliation-performance.mjs;
- editado apps/api/package.json.

Script criado:
- test:mf6:reconciliation

Contratos verificados:
- RECONCILIATION_BUDGET_MS = 3000 existe;
- RECONCILIATION_MAX_CANDIDATES existe;
- suggestReconciliations existe no service;
- route expõe X-OPSA-Reconciliation-Duration-Ms;
- route exige requireCompanyContext(prisma);
- route importa requirePermission e requireRole do middleware real;
- route não usa roleMiddleware inexistente.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node scripts/check-mf6-reconciliation-performance.mjs

Passo 6
Comandos executados:
- cd apps/api
- node --check src/modules/treasury/reconciliationPerformance.js
- node --check src/modules/treasury/statementImportService.js
- node --check src/modules/treasury/statementRoutes.js
- npm run test:mf6:reconciliation
- npm run test:contracts
- npm run prisma:validate

Smoke principal:
- pedido válido para POST /api/treasury/statements/reconciliations/suggestions devolveu 200;
- resposta incluiu statementLineId;
- resposta incluiu suggestions;
- resposta incluiu status;
- resposta incluiu durationMs;
- resposta incluiu withinBudget;
- resposta incluiu budgetMs = 3000;
- resposta incluiu header X-OPSA-Reconciliation-Duration-Ms.

Resposta complete:
- status = complete;
- withinBudget = true;
- durationMs <= 3000;
- sugestões devolvidas sem confirmação automática.

Resposta partial:
- lote grande foi limitado por RECONCILIATION_MAX_CANDIDATES = 250;
- status = partial;
- API devolveu resultado controlado;
- não bloqueou a operação;
- não inventou confirmação automática.

Negativos:
- sem sessão devolveu 401;
- sem statementLineId devolveu 400 STATEMENT_LINE_REQUIRED;
- linha inexistente ou de outra empresa devolveu 404 BANK_STATEMENT_LINE_NOT_FOUND;
- candidateLimit fora de 1..250 devolveu 400 INVALID_RECONCILIATION_LIMIT.

Privacidade e domínio:
- companyId vem da sessão;
- companyId no body não decide ownership;
- dados de outra empresa não entram nas sugestões;
- sugestão não confirma recebimento;
- sugestão não confirma pagamento;
- sugestão não cria lançamento contabilístico;
- evidence não inclui IBAN real, extratos reais, valores financeiros reais, cookies ou tokens.

Handoff:
- orçamento de reconciliação: 3000 ms;
- limite de candidatos: 250;
- padrão de resposta: complete/partial;
- próximo BK pode reutilizar a lógica de orçamento sem bloquear operações críticas.