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
