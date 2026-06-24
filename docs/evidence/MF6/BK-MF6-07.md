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


Passo 3
Ficheiros revistos:
* apps/api/src/modules/auth/authMiddleware.js

Fluxo confirmado:
* middleware lê o cookie sid;
* middleware procura a sessão server-side;
* middleware associa o utilizador autenticado ao request;
* autenticação continua dependente da sessão existente no backend;
* roles e permissões continuam aplicadas após validação da sessão.

Critério confirmado:
* o cookie é utilizado apenas como identificador da sessão;
* autorização continua a ser validada no backend;
* empresa ativa continua dependente do contexto autenticado.

Passo 4
Ficheiros revistos:
* apps/web/src/lib/apiClient.ts

Função confirmada:
* request

Critério confirmado:
* credentials: "include" presente nas chamadas HTTP;
* cookies continuam enviados automaticamente pelo browser;
* frontend não lê o cookie HttpOnly;
* cliente API mantém serialização JSON;
* cliente API mantém tratamento de respostas 204;
* cliente API mantém tratamento de erros da API.

Passo 5
Ficheiros criados:
* apps/api/scripts/check-mf6-session-cookie.mjs

Ficheiros editados:
* apps/api/package.json

Validações implementadas:
* confirmação de httpOnly: true;
* confirmação de secure: isProduction;
* confirmação de sameSite: "lax";
* confirmação de path: "/";
* confirmação da utilização de buildSessionCookieOptions;
* validação da centralização do contrato do cookie.

Objetivo do smoke:
* garantir os atributos mínimos exigidos pelo RNF14;
* evitar divergência entre login e logout;
* validar a existência do helper central de opções.

Passo 6
Endpoints validados:
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout

Fluxo validado:
login cria sessão válida;
/api/auth/me devolve utilizador autenticado;
logout remove a sessão;
pedido posterior para /api/auth/me deixa de estar autenticado.

Critério confirmado:
escrita do cookie funciona;
leitura da sessão funciona;
limpeza do cookie funciona;
ciclo completo de autenticação cumpre o contrato da sessão.

Passo 7
Validação realizada:
login executado com NODE_ENV=production;
análise do cabeçalho Set-Cookie.

Atributos confirmados:
HttpOnly;
Secure;
SameSite=Lax;
Path=/.

Critério confirmado:
atributo Secure é ativado em ambiente de produção;
contrato do RNF14 é respeitado;
cookie continua a transportar apenas o identificador da sessão.

Passo 8 - Recolher evidence

Evidence recolhida:
output do smoke test;
validação de login;
validação de logout;
validação de produção simulada;
cabeçalho Set-Cookie mascarado.

Critério confirmado:
valor real da sessão não é divulgado;
evidence contém apenas atributos do cookie;
documentação demonstra sessão válida e sessão removida;
documentação demonstra comportamento em produção.

Dados protegidos:
identificador real da sessão;
cookies reais;
tokens;
credenciais;
dados pessoais.

Validação executada:
revisão da evidence recolhida;
confirmação de sanitização dos dados.

Cenário negativo:
publicação do valor real da sessão.

Resultado esperado:
evidence inválida por exposição de informação sensível.

Resultado obtido:
evidence mantida sem exposição de dados confidenciais.

- PS D:\PAP\edu-PAP-3ig-opsa-2526> cd apps/api                         
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/auth/sessionCookie.js
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node scripts/check-mf6-session-cookie.mjs
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/src/modules/auth/authService.js:203
export async function loginUser(prisma, input, now = new Date()) {
       ^

SyntaxError: Identifier 'loginUser' has already been declared
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:90:18)
    at #translate (node:internal/modules/esm/loader:435:20)
    at afterLoad (node:internal/modules/esm/loader:491:29)
    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:496:12)
    at #getOrCreateModuleJobAfterResolve (node:internal/modules/esm/loader:549:36)
    at afterResolve (node:internal/modules/esm/loader:597:52)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:603:12)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33)
    at ModuleJob.link (node:internal/modules/esm/module_job:253:17)

Node.js v24.16.0
✖ tests\contracts\mf0-contracts.test.js (496.6185ms)
file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/src/modules/auth/authService.js:203
export async function loginUser(prisma, input, now = new Date()) {
       ^

SyntaxError: Identifier 'loginUser' has already been declared
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:90:18)
    at #translate (node:internal/modules/esm/loader:435:20)
    at afterLoad (node:internal/modules/esm/loader:491:29)
    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:496:12)
    at #getOrCreateModuleJobAfterResolve (node:internal/modules/esm/loader:549:36)
    at afterResolve (node:internal/modules/esm/loader:597:52)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:603:12)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33)
    at ModuleJob.link (node:internal/modules/esm/module_job:253:17)

Node.js v24.16.0
✖ tests\contracts\mf1-contracts.test.js (580.9652ms)
file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/src/modules/auth/authService.js:203
export async function loginUser(prisma, input, now = new Date()) {
       ^

SyntaxError: Identifier 'loginUser' has already been declared
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:90:18)
    at #translate (node:internal/modules/esm/loader:435:20)
    at afterLoad (node:internal/modules/esm/loader:491:29)
    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:496:12)
    at #getOrCreateModuleJobAfterResolve (node:internal/modules/esm/loader:549:36)
    at afterResolve (node:internal/modules/esm/loader:597:52)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:603:12)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33)
    at ModuleJob.link (node:internal/modules/esm/module_job:253:17)

Node.js v24.16.0
✖ tests\contracts\mf2-contracts.test.js (456.477ms)
file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/src/modules/auth/authService.js:203
export async function loginUser(prisma, input, now = new Date()) {
       ^

SyntaxError: Identifier 'loginUser' has already been declared
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:90:18)
    at #translate (node:internal/modules/esm/loader:435:20)
    at afterLoad (node:internal/modules/esm/loader:491:29)
    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:496:12)
    at #getOrCreateModuleJobAfterResolve (node:internal/modules/esm/loader:549:36)
    at afterResolve (node:internal/modules/esm/loader:597:52)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:603:12)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33)
    at ModuleJob.link (node:internal/modules/esm/module_job:253:17)

Node.js v24.16.0
✖ tests\contracts\mf3-contracts.test.js (484.5825ms)
file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/src/modules/auth/authService.js:203
export async function loginUser(prisma, input, now = new Date()) {
       ^

SyntaxError: Identifier 'loginUser' has already been declared
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:90:18)
    at #translate (node:internal/modules/esm/loader:435:20)
    at afterLoad (node:internal/modules/esm/loader:491:29)
    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:496:12)
    at #getOrCreateModuleJobAfterResolve (node:internal/modules/esm/loader:549:36)
    at afterResolve (node:internal/modules/esm/loader:597:52)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:603:12)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33)
    at ModuleJob.link (node:internal/modules/esm/module_job:253:17)

Node.js v24.16.0
✖ tests\contracts\mf4-contracts.test.js (460.73ms)
ℹ tests 5
ℹ suites 0
ℹ pass 0
ℹ fail 5
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2517.9139

✖ failing tests:

test at tests\contracts\mf0-contracts.test.js:1:1
✖ tests\contracts\mf0-contracts.test.js (496.6185ms)
  'test failed'

test at tests\contracts\mf1-contracts.test.js:1:1
✖ tests\contracts\mf1-contracts.test.js (580.9652ms)
  'test failed'

test at tests\contracts\mf2-contracts.test.js:1:1
✖ tests\contracts\mf2-contracts.test.js (456.477ms)
  'test failed'

test at tests\contracts\mf3-contracts.test.js:1:1
✖ tests\contracts\mf3-contracts.test.js (484.5825ms)
  'test failed'

test at tests\contracts\mf4-contracts.test.js:1:1
✖ tests\contracts\mf4-contracts.test.js (460.73ms)
  'test failed'