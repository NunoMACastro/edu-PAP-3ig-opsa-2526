Passo 2
Ficheiro criado
* apps/api/src/modules/auth/sessionCookie.js

Fluxos confirmados:
1. Login

   * helper: setSessionCookie
   * responsabilidade: criação do cookie de sessão

2. Logout

   * helper: clearSessionCookie
   * responsabilidade: remoção do cookie de sessão

Critério confirmado:
* login utiliza o helper central de sessão;
* logout utiliza o helper central de sessão;
* criação e remoção do cookie seguem o mesmo contrato;
* o cookie continua a representar apenas o identificador opaco da sessão;
* empresa ativa, permissões e roles continuam a ser resolvidas no backend.

Scope-out confirmado:
* não criar novo mecanismo de autenticação;
* não substituir sessão por bearer token;
* não guardar sessão em localStorage;
* não guardar sessão em sessionStorage;
* não alterar regras de autorização existentes.

Constantes e helpers confirmados:

* COOKIE_NAME
* SESSION_MAX_AGE_MS
* buildSessionCookieOptions
* setSessionCookie
* clearSessionCookie
* readSessionCookie

Regras implementadas:

* atributo HttpOnly ativo;
* atributo Secure dependente do ambiente de produção;
* atributo SameSite configurado como "lax";
* path configurado como "/";
* duração da sessão controlada por maxAge;
* login e logout utilizam o mesmo contrato de atributos;
* leitura do cookie mantém compatibilidade com o contrato criado na MF0.

Validação executada:
* cd apps/api
* node --check src/modules/auth/sessionCookie.js
