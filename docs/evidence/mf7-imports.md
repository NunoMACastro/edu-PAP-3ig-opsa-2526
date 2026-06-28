PS D:\PAP\edu-PAP-3ig-opsa-2526> cd apps/api

PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npx prisma validate
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/imports/importFileParser.js


PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/imports/businessImportValidators.js

PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/treasury/statementImportValidators.js

PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/imports/businessImportService.js

PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/imports/businessImportRoutes.js

PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check tests/contracts/mf7-import-contracts.test.js

PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:mf7:imports

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

