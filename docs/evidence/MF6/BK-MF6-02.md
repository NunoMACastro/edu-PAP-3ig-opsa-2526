Passo 1
Endpoints representam uso real sem provocar dados incoerentes

Passo 2
Criado: apps/api/scripts/check-mf6-concurrency.mjs

Passo 3
Editado: apps/api/package.json

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:mf6:concurrency

> @opsa/api@1.0.0 test:mf6:concurrency
> node scripts/check-mf6-concurrency.mjs

file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/scripts/check-mf6-concurrency.mjs:28
        throw new Error(`São necessárias ${REQUIRED_USERS} sessões de teste válidas.`);
              ^

Error: São necessárias 25 sessões de teste válidas.
    at readSessionCookies (file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/scripts/check-mf6-concurrency.mjs:28:15)
    at file:///D:/PAP/edu-PAP-3ig-opsa-2526/apps/api/scripts/check-mf6-concurrency.mjs:125:24
    at ModuleJob.run (node:internal/modules/esm/module_job:439:25)
    at async node:internal/modules/esm/loader:633:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.16.0

Passo 4
Percentil 95 é mais útil do que média porque mostra a experiência dos pedidos mais lentos sem depender de um caso isolado.

O output mostra users: 25, failures: 0, baselineP95, concurrentP95 e allowedP95.

Passo 5
Cada endpoint devolve failures: 0 e concurrentP95 <= allowedP95.