## node --test tests/contracts/mf8-ai-governance.contract.test.js
- PS D:\PAP\edu-PAP-3ig-opsa-2526> cd apps/api
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --test tests/contracts/mf8-ai-governance.contract.test.js
✔ RNF32 permite recomendações que não executam operações financeiras (4.735ms)
✔ RNF32 rejeita sugestão sem tipo de ação explícito (0.6139ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 548.2494

## npm run test:contracts
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (4.1851ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (2.1952ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (3.456ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (1.1708ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (3.1089ms)
✔ BK12: nome de armazém duplicado é rejeitado (0.9491ms)
✔ MF1: permissões backend separam escrita operacional, aprovação e contabilidade (2.7828ms)
✔ MF1: routers principais montam sem dependências inexistentes (11.547ms)
✔ MF1 HTTP: criar venda sem sessão devolve erro de autenticação (5.1008ms)
✔ MF1 HTTP: operacional não pode aprovar venda (2.591ms)
✔ MF1 HTTP: pagamento em compra rascunho devolve regra de estado (2.9673ms)
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
✖ tests\contracts\mf2-contracts.test.js (512.1686ms)
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
✖ tests\contracts\mf3-contracts.test.js (586.2947ms)
✔ MF4: permissões backend cobrem IA, tarefas, notificações, auditoria e integrações (5.1259ms)
✔ MF4: routers principais expõem endpoints canónicos (17.6328ms)
✔ P0-MF4-MIG-01: migration MF4 cria tabelas persistentes da macrofase (19.0824ms)
✔ MF6: router de tesouraria expõe sugestão de reconciliação medida (8.2757ms)
✔ MF6: package expõe todos os gates test:mf6 (1.9438ms)
✔ MF6: servidor monta hardening antes dos routers de domínio (49.9124ms)
✔ MF6: smoke de concorrência suporta modo HTTP autenticado (16.2982ms)
✔ RNF27 mantém contratos críticos de faturação, IVA, balancetes e reconciliação (21.7022ms)
✔ RNF27 mantém contexto multiempresa nos módulos críticos (6.9655ms)
✔ RNF27 rejeita marcadores obsoletos que não existem nos services reais (4.0176ms)
▶ MF7 email transaccional
  ✔ coloca email em fila técnica sem expor endereço completo (2.7497ms)
  ✔ rejeita motivo fora do contrato (1.6004ms)
  ✔ rejeita destinatário inválido antes de chamar provider (0.8379ms)
  ✔ mantém sendPasswordReset e não escreve segredo nos logs (1.1463ms)
  ✔ envia alertas e lembretes usando o adapter comum (2.5852ms)
✔ MF7 email transaccional (12.5019ms)
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
✖ tests\contracts\mf7-export-contracts.test.js (457.8692ms)
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
✖ tests\contracts\mf7-import-contracts.test.js (368.3521ms)
✔ aceita readiness SAF-T com perfil, periodo e movimentos (9.8014ms)
✔ rejeita periodo SAF-T invertido (1.9698ms)
✔ rejeita perfil fiscal sem NIF (0.7877ms)
✔ rejeita periodo sem documentos nem lancamentos (1.2731ms)
✔ service SAF-T chama readiness, cria run e regista log de integracao (1.25ms)
✔ RNF31 aceita insight com explicação e origem rastreável (28.6532ms)
✔ RNF31 bloqueia explicabilidade incompleta (27.7253ms)
✔ RNF31 expõe a rota canónica de explicação de insight (44.0567ms)
✔ RNF32 permite recomendações que não executam operações financeiras (6.4686ms)
✔ RNF32 bloqueia ações automáticas da IA (1.6316ms)
✔ RNF32 rejeita sugestão sem tipo de ação explícito (0.6464ms)
file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/src/modules/subscriptions/subscriptionRoutes.js:167
  activateSimulatedSubscription,
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

SyntaxError: Identifier 'activateSimulatedSubscription' has already been declared
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
✖ tests\contracts\mf8-current-subscription.contract.test.js (544.2403ms)
✔ MF8 health: router expõe GET / (9.276ms)
✖ MF8 health: servidor monta GET /api/health antes dos routers autenticados (4.6199ms)
✔ MF8 health: GET / devolve payload público seguro (7.6662ms)
✔ MF8 health: payload usa relógio controlado nos testes (0.5294ms)
✔ MF8 health: falha sem versão configurada (1.4238ms)
✔ MF8 health: falha com ambiente desconhecido (0.5656ms)
file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/src/modules/subscriptions/subscriptionRoutes.js:167
  activateSimulatedSubscription,
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

SyntaxError: Identifier 'activateSimulatedSubscription' has already been declared
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
✖ tests\contracts\mf8-subscription-activation.contract.test.js (453.5451ms)
file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/src/modules/subscriptions/subscriptionRoutes.js:167
  activateSimulatedSubscription,
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

SyntaxError: Identifier 'activateSimulatedSubscription' has already been declared
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
✖ tests\contracts\mf8-subscription-lifecycle.contract.test.js (445.4714ms)
file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/src/modules/subscriptions/subscriptionRoutes.js:167
  activateSimulatedSubscription,
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

SyntaxError: Identifier 'activateSimulatedSubscription' has already been declared
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
✖ tests\contracts\mf8-subscription-plans.contract.test.js (335.836ms)
file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/tests/contracts/mf8-subscriptions.contract.test.js:8
  assertSubscriptionLifecycleTransition,
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
SyntaxError: The requested module '../../src/modules/subscriptions/subscriptionService.js' does not provide an export named 'assertSubscriptionLifecycleTransition'
    at #asyncInstantiate (node:internal/modules/esm/module_job:327:21)
    at async ModuleJob.run (node:internal/modules/esm/module_job:431:5)
    at async node:internal/modules/esm/loader:633:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.16.0
✖ tests\contracts\mf8-subscriptions.contract.test.js (431.6006ms)
ℹ tests 52
ℹ suites 1
ℹ pass 42
ℹ fail 10
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 16258.5926

✖ failing tests:

test at tests\contracts\mf2-contracts.test.js:1:1
✖ tests\contracts\mf2-contracts.test.js (512.1686ms)
  'test failed'

test at tests\contracts\mf3-contracts.test.js:1:1
✖ tests\contracts\mf3-contracts.test.js (586.2947ms)
  'test failed'

test at tests\contracts\mf7-export-contracts.test.js:1:1
✖ tests\contracts\mf7-export-contracts.test.js (457.8692ms)
  'test failed'

test at tests\contracts\mf7-import-contracts.test.js:1:1
✖ tests\contracts\mf7-import-contracts.test.js (368.3521ms)
  'test failed'

test at tests\contracts\mf8-current-subscription.contract.test.js:1:1
✖ tests\contracts\mf8-current-subscription.contract.test.js (544.2403ms)
  'test failed'

test at tests\contracts\mf8-health.contract.test.js:64:1
✖ MF8 health: servidor monta GET /api/health antes dos routers autenticados (4.6199ms)
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

test at tests\contracts\mf8-subscription-activation.contract.test.js:1:1
✖ tests\contracts\mf8-subscription-activation.contract.test.js (453.5451ms)
  'test failed'

test at tests\contracts\mf8-subscription-lifecycle.contract.test.js:1:1
✖ tests\contracts\mf8-subscription-lifecycle.contract.test.js (445.4714ms)
  'test failed'

test at tests\contracts\mf8-subscription-plans.contract.test.js:1:1
✖ tests\contracts\mf8-subscription-plans.contract.test.js (335.836ms)
  'test failed'

test at tests\contracts\mf8-subscriptions.contract.test.js:1:1
✖ tests\contracts\mf8-subscriptions.contract.test.js (431.6006ms)
  'test failed'

## npm run typecheck
- PS D:\PAP\edu-PAP-3ig-opsa-2526> cd apps/web
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\web> npm run typecheck

> @opsa/web@1.0.0 typecheck
> tsc --noEmit
