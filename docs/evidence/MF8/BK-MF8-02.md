- PS D:\PAP\edu-PAP-3ig-opsa-2526> cd apps/api
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/ops/healthRoutes.js
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/server.js
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check tests/contracts/mf8-health.contract.test.js

## npm run test:contracts
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (6.0032ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (2.351ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (5.866ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (1.1764ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (3.9618ms)
✔ BK12: nome de armazém duplicado é rejeitado (1.0648ms)
✔ MF1: permissões backend separam escrita operacional, aprovação e contabilidade (2.725ms)
✔ MF1: routers principais montam sem dependências inexistentes (14.2947ms)
✔ MF1 HTTP: criar venda sem sessão devolve erro de autenticação (9.2026ms)
✔ MF1 HTTP: operacional não pode aprovar venda (3.8316ms)
✔ MF1 HTTP: pagamento em compra rascunho devolve regra de estado (2.9298ms)
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
✖ tests\contracts\mf2-contracts.test.js (462.4354ms)
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
✖ tests\contracts\mf3-contracts.test.js (659.3691ms)
✔ MF4: permissões backend cobrem IA, tarefas, notificações, auditoria e integrações (3.1677ms)
✔ MF4: routers principais expõem endpoints canónicos (29.7017ms)
✔ P0-MF4-MIG-01: migration MF4 cria tabelas persistentes da macrofase (57.966ms)
✔ MF6: router de tesouraria expõe sugestão de reconciliação medida (6.2646ms)
✔ MF6: package expõe todos os gates test:mf6 (1.6431ms)
✔ MF6: servidor monta hardening antes dos routers de domínio (1.1961ms)
✔ MF6: smoke de concorrência suporta modo HTTP autenticado (49.8723ms)
✔ RNF27 mantém contratos críticos de faturação, IVA, balancetes e reconciliação (16.5952ms)
✔ RNF27 mantém contexto multiempresa nos módulos críticos (5.1839ms)
✔ RNF27 rejeita marcadores obsoletos que não existem nos services reais (2.8219ms)
▶ MF7 email transaccional
  ✔ coloca email em fila técnica sem expor endereço completo (3.4669ms)
  ✔ rejeita motivo fora do contrato (1.6141ms)
  ✔ rejeita destinatário inválido antes de chamar provider (0.7535ms)
  ✔ mantém sendPasswordReset e não escreve segredo nos logs (1.0638ms)
  ✔ envia alertas e lembretes usando o adapter comum (2.6479ms)
✔ MF7 email transaccional (13.1898ms)
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
✖ tests\contracts\mf7-export-contracts.test.js (441.0114ms)
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
✖ tests\contracts\mf7-import-contracts.test.js (432.6994ms)
✔ aceita readiness SAF-T com perfil, periodo e movimentos (6.8745ms)
✔ rejeita periodo SAF-T invertido (2.0361ms)
✔ rejeita perfil fiscal sem NIF (0.7245ms)
✔ rejeita periodo sem documentos nem lancamentos (0.7422ms)
✔ service SAF-T chama readiness, cria run e regista log de integracao (1.0836ms)
✔ MF8 health: router expõe GET / (6.5795ms)
✖ MF8 health: servidor monta GET /api/health antes dos routers autenticados (4.1516ms)
✔ MF8 health: GET / devolve payload público seguro (4.6572ms)
✔ MF8 health: payload usa relógio controlado nos testes (0.5772ms)
✔ MF8 health: falha sem versão configurada (1.5934ms)
✔ MF8 health: falha com ambiente desconhecido (1.6154ms)
ℹ tests 41
ℹ suites 1
ℹ pass 36
ℹ fail 5
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 11587.3376

✖ failing tests:

test at tests\contracts\mf2-contracts.test.js:1:1
✖ tests\contracts\mf2-contracts.test.js (462.4354ms)
  'test failed'

test at tests\contracts\mf3-contracts.test.js:1:1
✖ tests\contracts\mf3-contracts.test.js (659.3691ms)
  'test failed'

test at tests\contracts\mf7-export-contracts.test.js:1:1
✖ tests\contracts\mf7-export-contracts.test.js (441.0114ms)
  'test failed'

test at tests\contracts\mf7-import-contracts.test.js:1:1
✖ tests\contracts\mf7-import-contracts.test.js (432.6994ms)
  'test failed'

test at tests\contracts\mf8-health.contract.test.js:64:1
✖ MF8 health: servidor monta GET /api/health antes dos routers autenticados (4.1516ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  
  false !== true
  
      at TestContext.<anonymous> (file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/tests/contracts/mf8-health.contract.test.js:82:12)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1306:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:897:18)
      at Test.run (node:internal/test_runner/test:1372:12)
      at async startSubtestAfterBootstrap (node:internal/test_runner/harness:385:3) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual',
    diff: 'simple'
  }