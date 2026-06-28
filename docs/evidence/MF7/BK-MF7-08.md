- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check scripts/check-mf7-backend-modules.mjs

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run check:mf7:backend-modules

> @opsa/api@1.0.0 check:mf7:backend-modules
> node scripts/check-mf7-backend-modules.mjs

MF7 backend modular: OK

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> $env:OPSA_MF7_SIMULATE_MISSING="src/modules/ai/aiRoutes.js"
>> npm run check:mf7:backend-modules

> @opsa/api@1.0.0 check:mf7:backend-modules
> node scripts/check-mf7-backend-modules.mjs

node:internal/modules/run_main:107
    triggerUncaughtException
    ^

AssertionError [ERR_ASSERTION]: Ficheiro obrigatório em falta: src/modules/ai/aiRoutes.js
