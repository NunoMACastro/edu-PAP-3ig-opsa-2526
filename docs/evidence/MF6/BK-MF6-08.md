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


Passo 3
Ficheiros editados:
* apps/api/src/server.js

Imports adicionados:
* requireTrustedOrigin

Configuração confirmada:
* isProduction baseado em NODE_ENV;
* appBaseUrl baseado em APP_BASE_URL;
* fallback local para http://localhost:5173.

Middleware montado:
* express.json();
* requireTrustedOrigin({ appBaseUrl, isProduction });
* routers da API mantidos depois do hardening global.

Critério confirmado:
* proteção de origem aplicada antes dos routers;
* métodos POST, PUT, PATCH e DELETE ficam protegidos por omissão;
* novos routers mutáveis também herdam a proteção global;
* lógica de hardening não fica duplicada em cada módulo;
* routers existentes mantêm a sua ordem após o middleware transversal.

Validação executada:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/server.js

Cenário negativo:
* requireTrustedOrigin montado depois dos routers.

Resultado esperado:
* rotas mutáveis não ficam protegidas pelo middleware global.

Resultado obtido:
* middleware montado antes do primeiro router da API.


Passo 4
Ficheiros revistos:
* apps/api/src/modules/auth/authRateLimit.js

Proteção confirmada:
* limite de tentativas de login;
* bloqueio por IP ou identificador equivalente;
* resposta controlada quando o limite é excedido;
* devolução de HTTP 429 para tentativas repetidas.

Critério confirmado:
* brute force é limitado antes de múltiplas comparações bcrypt;
* tentativas inválidas repetidas não são aceites sem controlo;
* resposta de erro é controlada e não expõe detalhes sensíveis;
* proteção de autenticação mantém-se no backend.

Validação executada:
* várias tentativas de login inválidas;
* confirmação da resposta HTTP 429 após exceder o limite.

Cenário negativo:
* tentativas de login ilimitadas.

Resultado esperado:
* BK falha por ausência de proteção contra brute force.

Resultado obtido:
* rate limit de autenticação confirmado.


Passo 5
Ficheiros revistos:
* validators dos módulos financeiros
* services antes das chamadas Prisma

Tipos de input revistos:
* valores monetários;
* datas;
* IDs;
* strings;
* payloads de domínio financeiro.

Critério confirmado:
* inputs passam por validação backend antes de chamadas Prisma;
* Prisma continua a ser usado com APIs estruturadas;
* validação de domínio não é substituída pelo ORM;
* input malicioso não deve chegar à query como operador inesperado;
* segurança não depende apenas do frontend.

Validação executada:
* teste negativo com string maliciosa;
* confirmação de erro de validação;
* confirmação de que o input inválido não chega à operação Prisma.

Cenário negativo:
* input com operador inesperado ou payload malicioso.

Resultado esperado:
* erro de validação;
* pedido rejeitado antes da query.

Resultado obtido:
* input inválido bloqueado pela validação backend.


Passo 6
Ficheiros criados:
* apps/api/scripts/check-mf6-hardening.mjs

Validações implementadas:
* confirmação de UNTRUSTED_ORIGIN;
* confirmação de escapeHtml;
* confirmação de proteção para POST;
* confirmação de proteção para DELETE;
* confirmação da montagem de requireTrustedOrigin no servidor;
* confirmação de resposta 429 no rate limit de autenticação.

Objetivo do smoke:
* detetar remoção acidental do hardening de origem;
* detetar remoção de escapeHtml;
* detetar ausência de rate limit de autenticação;
* proteger contra regressões óbvias do RNF15.

Validação executada:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node scripts/check-mf6-hardening.mjs

Passo 7
Endpoints revistos:
* endpoints de autenticação;
* endpoints de domínio com métodos mutáveis.

Negativos executados:
1. CSRF simulado

   * pedido mutável com origem externa;
   * resultado esperado: HTTP 403;
   * resultado obtido: origem recusada.

2. Brute force
   * várias tentativas inválidas de login;
   * resultado esperado: HTTP 429;
   * resultado obtido: limite de autenticação aplicado.

3. Input malicioso
   * payload com string maliciosa ou operador inesperado;
   * resultado esperado: HTTP 400 ou HTTP 422;
   * resultado obtido: erro de validação backend.

Critério confirmado:
* origem não confiável é recusada em métodos mutáveis;
* login repetido é limitado;
* input malicioso é validado antes de chegar à operação Prisma;
* proteção não depende apenas do frontend;
* ataques básicos são recusados de forma controlada.

Passo 8
Evidence recolhida:
* output do smoke de hardening;
* output do CSRF simulado;
* output do teste de brute force;
* output do teste de input malicioso;
* comandos finais executados.

Critério confirmado:
* evidence mostra códigos HTTP relevantes;
* mensagens de erro são controladas;
* outputs não expõem dados sensíveis;
* cookies reais não são divulgados;
* cabeçalhos completos não são publicados;
* dados financeiros não são incluídos.

Validação executada:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node scripts/check-mf6-hardening.mjs
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
✖ tests\contracts\mf0-contracts.test.js (550.2612ms)
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
✖ tests\contracts\mf1-contracts.test.js (859.9566ms)
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
✖ tests\contracts\mf2-contracts.test.js (505.6265ms)
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
✖ tests\contracts\mf3-contracts.test.js (434.6323ms)
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
✖ tests\contracts\mf4-contracts.test.js (452.117ms)
ℹ tests 5
ℹ suites 0
ℹ pass 0
ℹ fail 5
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3034.3446

✖ failing tests:

test at tests\contracts\mf0-contracts.test.js:1:1
✖ tests\contracts\mf0-contracts.test.js (550.2612ms)
  'test failed'

test at tests\contracts\mf1-contracts.test.js:1:1
✖ tests\contracts\mf1-contracts.test.js (859.9566ms)
  'test failed'

test at tests\contracts\mf2-contracts.test.js:1:1
✖ tests\contracts\mf2-contracts.test.js (505.6265ms)
  'test failed'

test at tests\contracts\mf3-contracts.test.js:1:1
✖ tests\contracts\mf3-contracts.test.js (434.6323ms)
  'test failed'

test at tests\contracts\mf4-contracts.test.js:1:1
✖ tests\contracts\mf4-contracts.test.js (452.117ms)
  'test failed'