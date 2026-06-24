Passo 1
Ficheiros revistos:
* apps/api/src/server.js
* módulos de autenticação
* módulos de domínio financeiro

Superfícies identificadas:
* rotas POST;
* rotas PUT;
* rotas PATCH;
* rotas DELETE;
* endpoints de autenticação;
* endpoints financeiros;
* endpoints com alteração de dados.

Critério confirmado:
* rotas mutáveis identificadas;
* validação backend existente localizada;
* autenticação revista nos endpoints sensíveis;
* pontos de aplicação de hardening identificados.

Risco confirmado:
* rota mutável sem autenticação;
* rota mutável sem validação;
* rota mutável sem controlo de origem.

Cenário negativo:
* endpoint mutável sem validação backend.


Passo 2
Ficheiros criados:
* apps/api/src/modules/security/requestHardening.js

Exports criados:
* requireTrustedOrigin
* escapeHtml

Proteções implementadas:
* controlo de origem para métodos POST;
* controlo de origem para métodos PUT;
* controlo de origem para métodos PATCH;
* controlo de origem para métodos DELETE;
* rejeição de origens não autorizadas em produção;
* resposta HTTP 403 para origem não confiável;
* escape de caracteres perigosos para HTML.

Métodos protegidos:
* POST
* PUT
* PATCH
* DELETE

Critério confirmado:
* pedidos mutáveis exigem origem confiável;
* pedidos de leitura não são bloqueados pelo middleware;
* escapeHtml neutraliza caracteres HTML perigosos;
* proteção alinhada com prevenção de CSRF e XSS.

Validação executada:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/security/requestHardening.js

Cenário negativo:
* pedido POST proveniente de origem externa em produção.

Resultado esperado:
* HTTP 403;
* code: UNTRUSTED_ORIGIN.

Resultado obtido:
* pedido bloqueado pelo middleware de hardening.

