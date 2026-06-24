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