Evidência BK-MF8-03:
- Criado catálogo canónico em apps/api/src/modules/subscriptions/subscriptionPlans.js.
- Criadas rotas em apps/api/src/modules/subscriptions/subscriptionRoutes.js.
- Montado router em /api/subscriptions.
- Validado GET /api/subscriptions/plans.
- Validado GET /api/subscriptions/plans/:code.
- npm run syntax:check: PASS.
- npm run test:contracts: PASS.
- Catálogo confirmado como simulado e sem campos de pagamento real.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> cd apps/api

## npm run syntax:check
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run syntax:check

> @opsa/api@1.0.0 syntax:check
> find src tests scripts -name '*.js' -print0 | xargs -0 -n 1 node --check

'xargs' is not recognized as an internal or external command,
operable program or batch file.

## npm run test:contracts
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (22.7531ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (5.8831ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (16.6056ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (6.355ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (7.9847ms)
✔ BK12: nome de armazém duplicado é rejeitado (1.8729ms)
✔ MF1: permissões backend separam escrita operacional, aprovação e contabilidade (3.1529ms)
✔ MF1: routers principais montam sem dependências inexistentes (77.9041ms)
✔ MF1 HTTP: criar venda sem sessão devolve erro de autenticação (13.9864ms)
✔ MF1 HTTP: operacional não pode aprovar venda (5.582ms)
✔ MF1 HTTP: pagamento em compra rascunho devolve regra de estado (25.5233ms)
node:internal/modules/package_json_reader:301
  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
        ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'exceljs' imported from D:\PAP\edu-PAP-3ig-opsa-2526\apps\api\src\modules\accounting-reports\accountingReportExporters.js
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:859:18)
    at defaultResolve (node:internal/modules/esm/resolve:992:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:691:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:708:38)
    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:740:52)
    at #resolve (node:internal/modules/esm/loader:673:17)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:593:35)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33) {
  code: 'ERR_MODULE_NOT_FOUND'
}

Node.js v24.16.0
✖ tests\contracts\mf2-contracts.test.js (565.971ms)
node:internal/modules/package_json_reader:301
  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
        ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'exceljs' imported from D:\PAP\edu-PAP-3ig-opsa-2526\apps\api\src\modules\imports\importFileParser.js
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:859:18)
    at defaultResolve (node:internal/modules/esm/resolve:992:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:691:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:708:38)
    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:740:52)
    at #resolve (node:internal/modules/esm/loader:673:17)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:593:35)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33) {
  code: 'ERR_MODULE_NOT_FOUND'
}

Node.js v24.16.0
✖ tests\contracts\mf3-contracts.test.js (680.513ms)
✔ MF4: permissões backend cobrem IA, tarefas, notificações, auditoria e integrações (4.4013ms)
✔ MF4: routers principais expõem endpoints canónicos (20.801ms)
✔ P0-MF4-MIG-01: migration MF4 cria tabelas persistentes da macrofase (19.83ms)
✔ MF6: router de tesouraria expõe sugestão de reconciliação medida (7.6371ms)
✔ MF6: package expõe todos os gates test:mf6 (1.6888ms)
✔ MF6: servidor monta hardening antes dos routers de domínio (1.2035ms)
✔ MF6: smoke de concorrência suporta modo HTTP autenticado (53.7439ms)
✔ RNF27 mantém contratos críticos de faturação, IVA, balancetes e reconciliação (17.2311ms)
✔ RNF27 mantém contexto multiempresa nos módulos críticos (4.3278ms)
✔ RNF27 rejeita marcadores obsoletos que não existem nos services reais (6.006ms)
▶ MF7 email transaccional
  ✔ coloca email em fila técnica sem expor endereço completo (2.8009ms)
  ✔ rejeita motivo fora do contrato (2.2758ms)
  ✔ rejeita destinatário inválido antes de chamar provider (1.0273ms)
  ✔ mantém sendPasswordReset e não escreve segredo nos logs (1.1319ms)
  ✔ envia alertas e lembretes usando o adapter comum (2.6818ms)
✔ MF7 email transaccional (13.6024ms)
node:internal/modules/package_json_reader:301
  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
        ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'exceljs' imported from D:\PAP\edu-PAP-3ig-opsa-2526\apps\api\src\modules\accounting-reports\accountingReportExporters.js
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:859:18)
    at defaultResolve (node:internal/modules/esm/resolve:992:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:691:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:708:38)
    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:740:52)
    at #resolve (node:internal/modules/esm/loader:673:17)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:593:35)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33) {
  code: 'ERR_MODULE_NOT_FOUND'
}

Node.js v24.16.0
✖ tests\contracts\mf7-export-contracts.test.js (454.0065ms)
node:internal/modules/package_json_reader:301
  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
        ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'exceljs' imported from D:\PAP\edu-PAP-3ig-opsa-2526\apps\api\tests\contracts\mf7-import-contracts.test.js
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:859:18)
    at defaultResolve (node:internal/modules/esm/resolve:992:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:691:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:708:38)
    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:740:52)
    at #resolve (node:internal/modules/esm/loader:673:17)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:593:35)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33) {
  code: 'ERR_MODULE_NOT_FOUND'
}

Node.js v24.16.0
✖ tests\contracts\mf7-import-contracts.test.js (519.1061ms)
✔ aceita readiness SAF-T com perfil, periodo e movimentos (9.2678ms)
✔ rejeita periodo SAF-T invertido (1.9136ms)
✔ rejeita perfil fiscal sem NIF (0.8081ms)
✔ rejeita periodo sem documentos nem lancamentos (1.2572ms)
✔ service SAF-T chama readiness, cria run e regista log de integracao (1.2813ms)
✔ MF8 health: router expõe GET / (5.6948ms)
✖ MF8 health: servidor monta GET /api/health antes dos routers autenticados (5.0532ms)
✔ MF8 health: GET / devolve payload público seguro (6.3443ms)
✔ MF8 health: payload usa relógio controlado nos testes (0.5571ms)
✔ MF8 health: falha sem versão configurada (1.6278ms)
✔ MF8 health: falha com ambiente desconhecido (0.602ms)
✔ BK-MF8-03 expõe as rotas de catálogo de subscrições (7.3652ms)
✔ BK-MF8-03 está montado no servidor principal (1.0551ms)
✔ GET /plans devolve três planos simulados em EUR (4.3708ms)
✔ GET /plans/:code devolve um plano existente (1.5723ms)
✔ GET /plans/:code rejeita códigos desconhecidos (1.1476ms)
✔ a rota bloqueia pedidos sem sessão (1.1816ms)
✔ a rota bloqueia papel sem acesso (1.0965ms)
✔ o serviço rejeita códigos desconhecidos com erro próprio (1.4688ms)
✔ os planos devolvidos não podem ser alterados pelo chamador (1.2751ms)
✔ o catálogo simulado não expõe campos de pagamento real (1.0603ms)
ℹ tests 51
ℹ suites 1
ℹ pass 46
ℹ fail 5
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 15502.8504

✖ failing tests:

test at tests\contracts\mf2-contracts.test.js:1:1
✖ tests\contracts\mf2-contracts.test.js (565.971ms)
  'test failed'

test at tests\contracts\mf3-contracts.test.js:1:1
✖ tests\contracts\mf3-contracts.test.js (680.513ms)
  'test failed'

test at tests\contracts\mf7-export-contracts.test.js:1:1
✖ tests\contracts\mf7-export-contracts.test.js (454.0065ms)
  'test failed'

test at tests\contracts\mf7-import-contracts.test.js:1:1
✖ tests\contracts\mf7-import-contracts.test.js (519.1061ms)
  'test failed'

test at tests\contracts\mf8-health.contract.test.js:64:1
✖ MF8 health: servidor monta GET /api/health antes dos routers autenticados (5.0532ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  
  false !== true
  
      at TestContext.<anonymous> (file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/tests/contracts/mf8-health.contract.test.js:82:12)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1306:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:897:18)
      at Test.postRun (node:internal/test_runner/test:1447:19)
      at Test.run (node:internal/test_runner/test:1372:12)
      at async startSubtestAfterBootstrap (node:internal/test_runner/harness:385:3) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual',
    diff: 'simple'
  }