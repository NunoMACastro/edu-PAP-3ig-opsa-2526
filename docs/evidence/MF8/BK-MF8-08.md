# Evidence MF8 / BK-MF8-08

- Projeto: OPSA
- BK: BK-MF8-08
- Tema: testes e evidência de subscrições simuladas
- RF/RNF: RF49, RF50, RF51
- Data: 2026-07-05
- Responsável: Oleksii
- Apoio: Andre

## Ficheiros alterados

- apps/api/tests/contracts/mf8-subscriptions.contract.test.js
- apps/api/package.json
- docs/evidence/MF8/BK-MF8-08.md

## Matriz de prova

| RF | Prova automática | Critério de sucesso | Evidência a anexar |
| --- | --- | --- | --- |
| RF49 | catálogo `monthly`, `quarterly`, `yearly`, `EUR`, `simulated: true` e sem campos de pagamento real | O teste confirma os três planos simulados e não encontra `paymentProvider`, `checkoutUrl` ou `paymentIntentId`. | Anexar output real do teste de contrato e manter o BK aberto se faltar algum plano ou aparecer promessa de pagamento real. |
| RF50 | ativação com `companyId` resolvido no backend e auditoria `subscription.activate` | O teste confirma que a empresa ativa vem do contexto backend e que a ativação gera auditoria. | Anexar output real do teste de contrato e registar a correção se a API aceitar empresa vinda do body/query. |
| RF51 | renovar, cancelar e reativar com auditoria e transições válidas | O teste confirma transições válidas, negativos de transição inválida e auditoria por ação sensível. | Anexar output real do teste de contrato e manter o BK aberto se alguma transição indevida passar. |

## Comandos executados

| Comando | Critério de sucesso | Evidência a anexar |
| --- | --- | --- |
| `cd apps/api && npm run test:mf8:subscriptions` | Exit code `0`; RF49, RF50 e RF51 cobertos por positivos e negativos. | Anexar output real do terminal e não fechar o BK se algum caso falhar. |
| `cd apps/api && npm run test:contracts` | Exit code `0`; contratos existentes continuam compatíveis com os BKs anteriores. | Anexar output real do terminal e registar regressão se um contrato anterior quebrar. |
| `cd apps/web && npm run typecheck` | Exit code `0`; sem erros de TypeScript no cliente e na página de subscrições. | Anexar output real do terminal e corrigir tipos antes de avançar. |
| `cd apps/web && npm run test:mf8:subscriptions-ui` | Exit code `0`; o gate frontend confirma UI simulada e sem decisão de empresa no browser. | Anexar output real do terminal e corrigir o gate se a UI prometer pagamento real. |

## Negativos validados

- [ ] Cancelar uma subscrição já cancelada devolve `INVALID_SUBSCRIPTION_TRANSITION`.
- [ ] Reativar sem plano devolve `SUBSCRIPTION_PLAN_REQUIRED`.
- [ ] Ativar sem empresa ativa devolve `ACTIVE_COMPANY_REQUIRED`.
- [ ] A evidence confirma ausência de `paymentProvider`, `checkoutUrl` e `paymentIntentId`.

## Verificação manual

- [ ] A página `Subscrições` mostra aviso de ações simuladas.
- [ ] A UI não pede identificador de empresa ao utilizador.
- [ ] A UI não promete cobrança real, checkout, recibo automático ou gateway externo.
- [ ] O PR inclui output real dos comandos acima.

## Handoff para BK-MF8-09

- Contrato backend validado quando `test:mf8:subscriptions` e `test:contracts` terminam com exit code `0` e a evidence inclui output real.
- Gate frontend validado quando `typecheck` e `test:mf8:subscriptions-ui` terminam com exit code `0` e a UI continua a avisar que as ações são simuladas.
- Riscos residuais: manter o BK aberto se faltar output real, se algum comando falhar, se a UI sugerir pagamento real ou se a API aceitar empresa ativa vinda do frontend.

## Resultados obtidos
- PS D:\PAP\edu-PAP-3ig-opsa-2526> cd apps/api

## npm run test:mf8:subscriptions
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:mf8:subscriptions

> @opsa/api@1.0.0 test:mf8:subscriptions
> node --test tests/contracts/mf8-subscriptions.contract.test.js

file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/tests/contracts/mf8-subscriptions.contract.test.js:8
  assertSubscriptionLifecycleTransition,
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
SyntaxError: The requested module '../../src/modules/subscriptions/subscriptionService.js' does not provide an export named 'assertSubscriptionLifecycleTransition'
    at #asyncInstantiate (node:internal/modules/esm/module_job:327:21)
    at async ModuleJob.run (node:internal/modules/esm/module_job:431:5)
    at async node:internal/modules/esm/loader:633:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.16.0
✖ tests\contracts\mf8-subscriptions.contract.test.js (369.662ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 403.8444

✖ failing tests:

test at tests\contracts\mf8-subscriptions.contract.test.js:1:1
✖ tests\contracts\mf8-subscriptions.contract.test.js (369.662ms)
  'test failed'

## npm run test:contracts
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (3.3524ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (1.6788ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (4.1912ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (1.3338ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (3.0718ms)
✔ BK12: nome de armazém duplicado é rejeitado (0.9663ms)
✔ MF1: permissões backend separam escrita operacional, aprovação e contabilidade (3.0283ms)
✔ MF1: routers principais montam sem dependências inexistentes (9.14ms)
✔ MF1 HTTP: criar venda sem sessão devolve erro de autenticação (4.3121ms)
✔ MF1 HTTP: operacional não pode aprovar venda (2.6567ms)
✔ MF1 HTTP: pagamento em compra rascunho devolve regra de estado (3.0208ms)
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
✖ tests\contracts\mf2-contracts.test.js (469.2406ms)
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
✖ tests\contracts\mf3-contracts.test.js (768.8889ms)
✔ MF4: permissões backend cobrem IA, tarefas, notificações, auditoria e integrações (3.6636ms)
✔ MF4: routers principais expõem endpoints canónicos (1054.9742ms)
✔ P0-MF4-MIG-01: migration MF4 cria tabelas persistentes da macrofase (37.4742ms)
✔ MF6: router de tesouraria expõe sugestão de reconciliação medida (16.5346ms)
✔ MF6: package expõe todos os gates test:mf6 (2.4935ms)
✔ MF6: servidor monta hardening antes dos routers de domínio (1.6013ms)
✔ MF6: smoke de concorrência suporta modo HTTP autenticado (84.6277ms)
✔ RNF27 mantém contratos críticos de faturação, IVA, balancetes e reconciliação (83.9121ms)
✔ RNF27 mantém contexto multiempresa nos módulos críticos (17.7559ms)
✔ RNF27 rejeita marcadores obsoletos que não existem nos services reais (3.4441ms)
▶ MF7 email transaccional
  ✔ coloca email em fila técnica sem expor endereço completo (4.4912ms)
  ✔ rejeita motivo fora do contrato (2.4374ms)
  ✔ rejeita destinatário inválido antes de chamar provider (1.1966ms)
  ✔ mantém sendPasswordReset e não escreve segredo nos logs (2.2995ms)
  ✔ envia alertas e lembretes usando o adapter comum (7.3946ms)
✔ MF7 email transaccional (25.572ms)
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
✖ tests\contracts\mf7-export-contracts.test.js (423.0293ms)
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
✖ tests\contracts\mf7-import-contracts.test.js (345.2687ms)
✔ aceita readiness SAF-T com perfil, periodo e movimentos (9.0098ms)
✔ rejeita periodo SAF-T invertido (1.6025ms)
✔ rejeita perfil fiscal sem NIF (0.7487ms)
✔ rejeita periodo sem documentos nem lancamentos (3.5123ms)
✔ service SAF-T chama readiness, cria run e regista log de integracao (3.6787ms)
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
✖ tests\contracts\mf8-current-subscription.contract.test.js (261.5ms)
✔ MF8 health: router expõe GET / (10.926ms)
✖ MF8 health: servidor monta GET /api/health antes dos routers autenticados (7.6533ms)
✔ MF8 health: GET / devolve payload público seguro (5.7777ms)
✔ MF8 health: payload usa relógio controlado nos testes (0.5847ms)
✔ MF8 health: falha sem versão configurada (1.6722ms)
✔ MF8 health: falha com ambiente desconhecido (0.5933ms)
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
✖ tests\contracts\mf8-subscription-activation.contract.test.js (3462.5931ms)
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
✖ tests\contracts\mf8-subscription-lifecycle.contract.test.js (3281.8045ms)
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
✖ tests\contracts\mf8-subscription-plans.contract.test.js (2135.3642ms)
file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/tests/contracts/mf8-subscriptions.contract.test.js:8
  assertSubscriptionLifecycleTransition,
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
SyntaxError: The requested module '../../src/modules/subscriptions/subscriptionService.js' does not provide an export named 'assertSubscriptionLifecycleTransition'
    at #asyncInstantiate (node:internal/modules/esm/module_job:327:21)
    at async ModuleJob.run (node:internal/modules/esm/module_job:431:5)
    at async node:internal/modules/esm/loader:633:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.16.0
✖ tests\contracts\mf8-subscriptions.contract.test.js (832.5189ms)
ℹ tests 46
ℹ suites 1
ℹ pass 36
ℹ fail 10
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 28309.3101

✖ failing tests:

test at tests\contracts\mf2-contracts.test.js:1:1
✖ tests\contracts\mf2-contracts.test.js (469.2406ms)
  'test failed'

test at tests\contracts\mf3-contracts.test.js:1:1
✖ tests\contracts\mf3-contracts.test.js (768.8889ms)
  'test failed'

test at tests\contracts\mf7-export-contracts.test.js:1:1
✖ tests\contracts\mf7-export-contracts.test.js (423.0293ms)
  'test failed'

test at tests\contracts\mf7-import-contracts.test.js:1:1
✖ tests\contracts\mf7-import-contracts.test.js (345.2687ms)
  'test failed'

test at tests\contracts\mf8-current-subscription.contract.test.js:1:1
✖ tests\contracts\mf8-current-subscription.contract.test.js (261.5ms)
  'test failed'

test at tests\contracts\mf8-health.contract.test.js:64:1
✖ MF8 health: servidor monta GET /api/health antes dos routers autenticados (7.6533ms)
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
✖ tests\contracts\mf8-subscription-activation.contract.test.js (3462.5931ms)
  'test failed'

test at tests\contracts\mf8-subscription-lifecycle.contract.test.js:1:1
  'test failed'

test at tests\contracts\mf8-subscription-plans.contract.test.js:1:1
✖ tests\contracts\mf8-subscription-plans.contract.test.js (2135.3642ms)
  'test failed'
test at tests\contracts\mf8-subscriptions.contract.test.js:1:1
✖ tests\contracts\mf8-subscriptions.contract.test.js (832.5189ms)
  'test failed'

## npm run typecheck
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run typecheck
npm error Missing script: "typecheck"
npm error
npm error To see a list of scripts, run:
npm error   npm run
npm error A complete log of this run can be found in: C:\Users\User\AppData\Local\npm-cache\_logs\2026-07-05T09_52_56_768Z-debug-0.log

## npm run test:mf8:subscriptions-ui
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:mf8:subscriptions-ui
npm error Missing script: "test:mf8:subscriptions-ui"
npm error
npm error Did you mean this?
npm error   npm run test:mf8:subscriptions # run the "test:mf8:subscriptions" package script
npm error
npm error To see a list of scripts, run:
npm error   npm run
npm error A complete log of this run can be found in: C:\Users\User\AppData\Local\npm-cache\_logs\2026-07-05T09_53_05_242Z-debug-0.log