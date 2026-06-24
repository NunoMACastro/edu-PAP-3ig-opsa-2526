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


