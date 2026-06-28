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

PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:mf7:imports

> @opsa/api@1.0.0 test:mf7:imports
> node --test tests/contracts/mf7-import-contracts.test.js

Could not find 'tests/contracts/mf7-import-contracts.test.js'