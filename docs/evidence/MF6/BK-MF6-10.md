Passo 1
Ficheiros revistos:
* docs/RNF.md
* docs/RF.md
* services de domínio

Operações sensíveis identificadas:
1. Alteração de permissões
   * ação: permissions.update
   * risco: alteração indevida de acessos e roles

2. Fecho de período fiscal
   * ação: fiscalPeriod.close
   * risco: impacto contabilístico e fiscal

3. Emissão de documento
   * ação: document.issue
   * risco: criação de documento financeiro relevante

4. Alteração de configuração de segurança
   * ação: security.setting.update
   * risco: alteração de parâmetros críticos da aplicação

Critério confirmado:
* lista fechada de ações sensíveis definida;
* operações com impacto em permissões, contabilidade, documentos e segurança incluídas;
* auditoria fica limitada a ações relevantes;
* empresa, utilizador, ação, entidade e alvo devem ficar rastreáveis;
* dados financeiros completos não devem ser guardados no log.

Fonte confirmada:
* RNF17;
* RF47;
* BK-MF4-09;
* BK-MF4-10.

Cenário negativo:
* operação de permissões fora da lista sensível.

Resultado esperado:
* operação deve ser adicionada à lista antes de fechar o BK.

Resultado obtido:
* operações sensíveis principais identificadas e declaradas.


Passo 2
Ficheiros editados:
* apps/api/src/modules/audit/auditLogService.js

Helpers/funções adicionadas:
* assertSensitiveAction
* assertSafeDetails
* recordSensitiveAudit

Constantes adicionadas:
* SENSITIVE_ACTIONS
* FORBIDDEN_DETAIL_KEYS

Ações sensíveis declaradas:
* permissions.update
* fiscalPeriod.close
* document.issue
* security.setting.update

Chaves proibidas em details:
* password
* token
* secret
* authorization
* cookie
* rawpayload
* documentlines

Critério confirmado:
* recordAuditLog continua a ser a função base;
* recordSensitiveAudit reutiliza o contrato de auditoria existente;
* não foram criados campos novos no modelo Prisma;
* details guarda apenas metadados mínimos;
* ação sensível não declarada lança erro;
* detalhes com credenciais, tokens, cookies ou payloads completos são recusados;
* companyId e userId continuam a vir do backend autenticado.

Validação executada:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/audit/auditLogService.js

Cenário negativo:
* chamada a recordSensitiveAudit com ação não declarada.

Resultado esperado:
* erro: Ação sensível não declarada.

Resultado obtido:
* helper força decisão explícita antes de registar auditoria sensível.

Cenário negativo adicional:
* details com chave proibida, como password, token ou cookie.

Resultado esperado:
* erro: Detalhe sensível proibido no audit log.

Resultado obtido:
* helper impede registo de dados sensíveis em auditoria.


Passo 3
Ficheiros editados:
* apps/api/src/modules/company-users/companyUserService.js
* apps/api/src/modules/company-users/companyUserController.js

Import adicionado:
* recordSensitiveAudit

Fluxo integrado:
* controller recebe o pedido de alteração de role;
* actorUserId é obtido a partir de req.user.id;
* companyId é obtido a partir de req.companyId;
* targetUserId é obtido a partir de req.params.id;
* service executa a alteração dentro de uma transação;
* audit log é criado dentro da mesma transação da alteração de role.

Ação auditada:
* permissions.update

Entidade auditada:
* CompanyMembership

Detalhes registados:
* result: "success"
* newRole

Critério confirmado:
* alteração de permissões fica auditada;
* auditoria usa utilizador autenticado como ator;
* frontend não decide actorUserId;
* frontend não decide companyId;
* alteração e auditoria pertencem à mesma transação;
* não é guardado payload completo no audit log;
* validações existentes continuam ativas.


Passo 4
Ficheiros editados:
* apps/api/src/modules/fiscal-periods/fiscalPeriodService.js

Import adicionado:
* recordSensitiveAudit

Fluxo integrado:
* service procura o período fiscal pelo id e companyId;
* valida se o período existe;
* valida se o período ainda não está fechado;
* fecha o período fiscal dentro de uma transação;
* regista audit log dentro da mesma transação;
* devolve o período fechado serializado.

Ação auditada:
* fiscalPeriod.close

Entidade auditada:
* FiscalPeriod

Detalhes registados:
* result: "success"
* status
* closedAt

Critério confirmado:
* fecho de período fiscal fica auditado;
* auditoria usa actorUserId vindo do backend autenticado;
* alteração e audit log pertencem à mesma transação;
* não são guardados documentos financeiros completos no audit log;
* regras de período fiscal continuam preservadas;
* empresa ativa continua validada por companyId no backend.


Passo 5
Ficheiros editados:
* apps/api/src/modules/sales/saleDocumentService.js

Ficheiros revistos:
* apps/api/src/modules/treasury/statementImportService.js

Import adicionado:
* recordSensitiveAudit

Fluxo integrado:
* service procura o documento de venda pelo id e companyId;
* valida se o documento existe;
* valida se o documento está aprovado;
* valida se o documento ainda não foi emitido;
* confirma período fiscal aberto;
* protege contra emissão concorrente;
* emite o documento dentro de uma transação;
* regista audit log dentro da mesma transação.

Ação auditada:
* document.issue

Entidade auditada:
* SaleDocument

Detalhes registados:
* result: "success"
* number
* status
* totalCents

Critério confirmado:
* emissão de documento financeiro fica auditada;
* escrita direta em tx.auditLog.create foi substituída por recordSensitiveAudit;
* auditoria mantém o contrato AuditLog existente;
* audit log guarda identificadores e resumo mínimo;
* linhas completas do documento não são guardadas em details;
* payload completo não é guardado;
* empresa ativa continua validada por companyId no backend;
* emissão continua dependente de validações de domínio e período fiscal.

Reconciliação revista:
* apps/api/src/modules/treasury/statementImportService.js foi revisto;
* fluxo continua limitado a sugestões de reconciliação;
* sugestões não confirmam movimentos automaticamente;
* sugestões não alteram saldos automaticamente;
* nenhuma ação de confirmação foi inventada fora do contrato atual da MF6.


Passo 6
Ficheiros criados:
* apps/api/scripts/check-mf6-audit-gate.mjs

Ficheiros editados:
* apps/api/package.json

Validações implementadas:
* confirmação das ações sensíveis permissions.update;
* confirmação das ações sensíveis fiscalPeriod.close;
* confirmação das ações sensíveis document.issue;
* confirmação da existência de recordSensitiveAudit;
* confirmação da normalização das chaves proibidas rawpayload e documentlines;
* confirmação da ausência de campos incompatíveis com AuditLog;
* confirmação da integração de auditoria em companyUserService;
* confirmação da integração de auditoria em fiscalPeriodService;
* confirmação da integração de auditoria em saleDocumentService.

Cobertura validada:
* permissões;
* períodos fiscais;
* emissão de documentos.

Critério confirmado:
* operações sensíveis estão declaradas no helper central;
* helper continua compatível com o modelo AuditLog existente;
* services críticos utilizam recordSensitiveAudit;
* payloads completos continuam proibidos;
* auditoria sensível não fica apenas definida, fica efetivamente utilizada.

Validação executada:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node scripts/check-mf6-audit-gate.mjs

Resultado esperado:
* script termina sem erros;
* ações sensíveis declaradas;
* cobertura mínima dos três fluxos críticos confirmada.

Resultado obtido:
* smoke confirma a integração da auditoria obrigatória.

Cenário negativo:
* remoção de recordSensitiveAudit de um dos services auditados.

Resultado esperado:
* erro durante a execução do smoke;
* evidence não pode ser fechada.

Resultado obtido:
* script deteta ausência de auditoria no fluxo afetado.

Cenário negativo adicional:
* introdução de campos incompatíveis com AuditLog ou remoção das chaves proibidas.

Resultado esperado:
* falha do smoke.

Resultado obtido:
* validação protege o contrato de auditoria definido na MF4 e reforçado na MF6.


Passo 7
Ficheiros revistos:
* testes de services
* audit log

Negativos executados:
1. Ação não declarada
   * chamada a recordSensitiveAudit com action fora de SENSITIVE_ACTIONS;
   * resultado esperado: erro de ação sensível não declarada;
   * resultado obtido: operação rejeitada antes de criar audit log.

2. Detalhes excessivos
   * chamada com details: { rawPayload: {}, documentLines: [] };
   * resultado esperado: erro de detalhe sensível proibido;
   * resultado obtido: rawPayload e documentLines rejeitados antes de persistir.

3. Operação sem sessão
   * tentativa de operação sensível sem utilizador autenticado;
   * resultado esperado: HTTP 401;
   * resultado obtido: operação bloqueada antes do service.

Critério confirmado:
* audit log só aceita ações sensíveis declaradas;
* details não aceita payload completo;
* rawPayload é bloqueado mesmo em camelCase;
* documentLines é bloqueado mesmo em camelCase;
* operação sensível sem sessão não chega à auditoria de sucesso;
* logs continuam úteis sem expor dados excessivos.

Cenário negativo:
* audit log com documento completo em rawPayload ou documentLines.

Resultado esperado:
* erro antes de persistir.

Resultado obtido:
* detalhe sensível rejeitado pelo helper.
