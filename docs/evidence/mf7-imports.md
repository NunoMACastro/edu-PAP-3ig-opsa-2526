# Evidence MF7 - importações CSV e Excel

- BK: BK-MF7-06
- RNF: RNF23
- Responsável: Oleksii
- Apoio: Pedro
- Data: 28.06.2026

## Comandos executados

```bash
cd apps/api
npx prisma validate
node --check src/modules/imports/importFileParser.js
node --check src/modules/imports/businessImportValidators.js
node --check src/modules/imports/businessImportService.js
node --check tests/contracts/mf7-import-contracts.test.js
npm run test:mf7:imports
```

## Resultados esperados

- CSV válido: HTTP 201, `acceptedRows > 0`, `rejectedRows = 0`.
- Excel válido: HTTP 201, `sourceFormat = XLSX` no percurso interno e linhas aceites.
- Formato inválido: HTTP 400, `INVALID_IMPORT_FILE_FORMAT`.
- CSV vazio: HTTP 400, `INVALID_IMPORT_CSV`.
- Excesso de linhas: HTTP 413, `IMPORT_TOO_LARGE`.
- Extrato com conta inexistente: HTTP 404, `TREASURY_ACCOUNT_NOT_FOUND`.

## Evidência de log

Registar o id de `BusinessImportRun` e confirmar que existe `IntegrationLog` com:

- `operation = IMPORT`
- `sourceId` igual ao id da importação
- `fileName` com nome curto do ficheiro
- `totalRows`, `successRows` e `errorRows`
- sem conteúdo completo do ficheiro

## Handoff para BK-MF7-07

O próximo BK pode consultar os logs de integração para confirmar que importações críticas deixam rasto operacional antes de avançar para readiness fiscal.

## Outputs reais
- PS D:\PAP\edu-PAP-3ig-opsa-2526> cd apps/api

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npx prisma validate
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/imports/importFileParser.js

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/imports/businessImportValidators.js

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/treasury/statementImportValidators.js

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/imports/businessImportService.js

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/imports/businessImportRoutes.js

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check tests/contracts/mf7-import-contracts.test.js

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:mf7:imports

> @opsa/api@1.0.0 test:mf7:imports
> node --test tests/contracts/mf7-import-contracts.test.js

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
✖ tests\contracts\mf7-import-contracts.test.js (366.5132ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 405.4479

✖ failing tests:

test at tests\contracts\mf7-import-contracts.test.js:1:1
✖ tests\contracts\mf7-import-contracts.test.js (366.5132ms)

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (5.4456ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (1.8476ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (4.1479ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (1.3531ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (3.8597ms)
✔ BK12: nome de armazém duplicado é rejeitado (1.0072ms)
file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/src/modules/audit/auditLogService.js:140
const SENSITIVE_ACTIONS = new Set([
      ^

SyntaxError: Identifier 'SENSITIVE_ACTIONS' has already been declared
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
✖ tests\contracts\mf1-contracts.test.js (635.2733ms)
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
✖ tests\contracts\mf2-contracts.test.js (663.8851ms)
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
✖ tests\contracts\mf3-contracts.test.js (647.5066ms)
file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/src/modules/audit/auditLogService.js:140
const SENSITIVE_ACTIONS = new Set([
      ^

SyntaxError: Identifier 'SENSITIVE_ACTIONS' has already been declared
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
✖ tests\contracts\mf4-contracts.test.js (687.6776ms)
✔ MF6: router de tesouraria expõe sugestão de reconciliação medida (6.3045ms)
✔ MF6: package expõe todos os gates test:mf6 (2.724ms)
✔ MF6: servidor monta hardening antes dos routers de domínio (13.5943ms)
✔ MF6: smoke de concorrência suporta modo HTTP autenticado (13.752ms)
▶ MF7 email transaccional
  ✔ coloca email em fila técnica sem expor endereço completo (2.8436ms)
  ✔ rejeita motivo fora do contrato (1.6043ms)
  ✔ rejeita destinatário inválido antes de chamar provider (0.7512ms)
  ✔ mantém sendPasswordReset e não escreve segredo nos logs (1.0519ms)
  ✔ envia alertas e lembretes usando o adapter comum (2.6371ms)
✔ MF7 email transaccional (12.3431ms)
node:internal/modules/package_json_reader:301
  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
        ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'exceljs' imported from D:\PAP\edu-PAP-3ig-opsa-2526\apps\api\src\modules\exports\exportFormatService.js
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
✖ tests\contracts\mf7-export-contracts.test.js (320.8175ms)
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
✖ tests\contracts\mf7-import-contracts.test.js (392.0586ms)
ℹ tests 21
ℹ suites 1
ℹ pass 15
ℹ fail 6
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7765.1336

✖ failing tests:

test at tests\contracts\mf1-contracts.test.js:1:1
✖ tests\contracts\mf1-contracts.test.js (635.2733ms)
  'test failed'

test at tests\contracts\mf2-contracts.test.js:1:1
✖ tests\contracts\mf2-contracts.test.js (663.8851ms)
  'test failed'

test at tests\contracts\mf3-contracts.test.js:1:1
✖ tests\contracts\mf3-contracts.test.js (647.5066ms)
  'test failed'

test at tests\contracts\mf4-contracts.test.js:1:1
✖ tests\contracts\mf4-contracts.test.js (687.6776ms)
  'test failed'

test at tests\contracts\mf7-export-contracts.test.js:1:1
✖ tests\contracts\mf7-export-contracts.test.js (320.8175ms)
  'test failed'

test at tests\contracts\mf7-import-contracts.test.js:1:1
✖ tests\contracts\mf7-import-contracts.test.js (392.0586ms)
  'test failed'