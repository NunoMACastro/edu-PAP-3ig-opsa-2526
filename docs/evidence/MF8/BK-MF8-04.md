# Evidence - BK-MF8-04

Data: 2026-07-04

<<<<<<< HEAD
## Alterações verificadas

- Modelo `CompanySubscription` ligado a `Company`.
- Service `getCurrentSubscription`.
- Rota `GET /api/subscriptions/current`.
- Testes HTTP para sucesso, ausência de subscrição e bloqueios de segurança.
=======
## Contexto

- Projeto: `OPSA`
- BK: `BK-MF8-04 - Subscricao por empresa ativa`
- RF/RNF: `RF50`
- Implementation root validado: `real_dev`
- Tipo de correcao: criacao de evidence documental em falta apos auditoria.

## Ficheiros verificados

- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/prisma/migrations/20260704120000_mf8_company_subscriptions/migration.sql`
- `real_dev/api/src/modules/subscriptions/subscriptionService.js`
- `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- `real_dev/api/src/server.js`
- `real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

## Alteracoes verificadas

- Modelo `CompanySubscription` ligado a `Company`, com `companyId` unico.
- Campo `planCode` usado como ligacao ao catalogo simulado do `BK-MF8-03`.
- Service `getCurrentSubscription` a consultar `prisma.companySubscription.findUnique({ where: { companyId } })`.
- Resposta enriquecida com `getSimulatedSubscriptionPlan(code)`.
- Rota `GET /api/subscriptions/current` montada em `/api/subscriptions`.
- Guards de autenticacao, empresa ativa e role `ADMIN` ou `GESTOR`.
- Testes de contrato para sucesso, ausencia de subscricao, role bloqueada, empresa ativa em falta e drift de plano.
>>>>>>> 81619f4 (Update: Mid)

## Comandos executados

```bash
<<<<<<< HEAD
cd apps/api
npm run prisma:validate
npm run syntax:check
node --test tests/contracts/mf8-current-subscription.contract.test.js
npm run test:contracts
=======
node --test real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js
npm --prefix real_dev/api run syntax:check
DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate
npm --prefix real_dev/api run test:contracts
bash scripts/validate-planificacao.sh
>>>>>>> 81619f4 (Update: Mid)
```

## Resultado observado

<<<<<<< HEAD
- `npm run prisma:validate`: registar PASS ou erro completo.
- `npm run syntax:check`: registar PASS ou erro completo.
- `node --test tests/contracts/mf8-current-subscription.contract.test.js`: registar PASS ou erro completo.
- `npm run test:contracts`: registar PASS ou erro completo.

## Limites confirmados

- Não houve pagamento real.
- Não houve checkout.
- Não houve faturação.
- Ativação, renovação, cancelamento e reativação ficam para os BKs seguintes.

## Resultados obtidos
- PS D:\PAP\edu-PAP-3ig-opsa-2526> cd apps/api

## npm run prisma:validate
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run prisma:validate

> @opsa/api@1.0.0 prisma:validate
> prisma validate

Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

## npm run syntax:check
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run syntax:check

> @opsa/api@1.0.0 syntax:check
> find src tests scripts -name '*.js' -print0 | xargs -0 -n 1 node --check
'xargs' is not recognized as an internal or external command,
operable program or batch file.

## node --test tests/contracts/mf8-current-subscription.contract.test.js
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --test tests/contracts/mf8-current-subscription.contract.test.js
✔ GET /api/subscriptions/current devolve a subscrição ativa da empresa (429.769ms)
✔ GET /api/subscriptions/current devolve state none sem subscrição (102.137ms)
✔ GET /api/subscriptions/current bloqueia pedido sem empresa ativa (112.0897ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4405.9507

## npm run test:contracts
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (8.5585ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (3.2162ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (4.3087ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (2.9867ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (3.6834ms)
✔ BK12: nome de armazém duplicado é rejeitado (1.6345ms)
✔ MF1: permissões backend separam escrita operacional, aprovação e contabilidade (5.83ms)
✔ MF1: routers principais montam sem dependências inexistentes (17.5862ms)
✔ MF1 HTTP: criar venda sem sessão devolve erro de autenticação (7.8639ms)
✔ MF1 HTTP: operacional não pode aprovar venda (4.1862ms)
✔ MF1 HTTP: pagamento em compra rascunho devolve regra de estado (4.5997ms)
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
✖ tests\contracts\mf2-contracts.test.js (529.6387ms)
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
✖ tests\contracts\mf3-contracts.test.js (550.2611ms)
✔ MF4: permissões backend cobrem IA, tarefas, notificações, auditoria e integrações (4.2482ms)
✔ MF4: routers principais expõem endpoints canónicos (26.3106ms)
✔ P0-MF4-MIG-01: migration MF4 cria tabelas persistentes da macrofase (45.3944ms)
✔ MF6: router de tesouraria expõe sugestão de reconciliação medida (12.5085ms)
✔ MF6: package expõe todos os gates test:mf6 (2.2209ms)
✔ MF6: servidor monta hardening antes dos routers de domínio (1.556ms)
✔ MF6: smoke de concorrência suporta modo HTTP autenticado (26.4572ms)
✔ RNF27 mantém contratos críticos de faturação, IVA, balancetes e reconciliação (20.8222ms)
✔ RNF27 mantém contexto multiempresa nos módulos críticos (6.3921ms)
✔ RNF27 rejeita marcadores obsoletos que não existem nos services reais (4.0479ms)
▶ MF7 email transaccional
  ✔ coloca email em fila técnica sem expor endereço completo (4.9207ms)
  ✔ rejeita motivo fora do contrato (2.6267ms)
  ✔ rejeita destinatário inválido antes de chamar provider (1.2373ms)
  ✔ mantém sendPasswordReset e não escreve segredo nos logs (1.5624ms)
  ✔ envia alertas e lembretes usando o adapter comum (4.2464ms)
✔ MF7 email transaccional (20.2453ms)
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
✖ tests\contracts\mf7-export-contracts.test.js (339.1426ms)
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
✖ tests\contracts\mf7-import-contracts.test.js (301.6574ms)
✔ aceita readiness SAF-T com perfil, periodo e movimentos (17.64ms)
✔ rejeita periodo SAF-T invertido (6.1118ms)
✔ rejeita perfil fiscal sem NIF (0.9575ms)
✔ rejeita periodo sem documentos nem lancamentos (1.5834ms)
✔ service SAF-T chama readiness, cria run e regista log de integracao (1.6671ms)
✔ GET /api/subscriptions/current devolve a subscrição ativa da empresa (258.2478ms)
✔ GET /api/subscriptions/current devolve state none sem subscrição (58.1869ms)
✔ GET /api/subscriptions/current bloqueia role sem acesso (59.8755ms)
✔ GET /api/subscriptions/current bloqueia pedido sem empresa ativa (70.5431ms)
✔ MF8 health: router expõe GET / (7.2191ms)
✖ MF8 health: servidor monta GET /api/health antes dos routers autenticados (6.997ms)
✔ MF8 health: GET / devolve payload público seguro (5.4868ms)
✔ MF8 health: payload usa relógio controlado nos testes (0.7206ms)
✔ MF8 health: falha sem versão configurada (1.8343ms)
✔ MF8 health: falha com ambiente desconhecido (0.7534ms)
✔ BK-MF8-03 expõe as rotas de catálogo de subscrições (11.7176ms)
✔ BK-MF8-03 está montado no servidor principal (1.1155ms)
✔ GET /plans devolve três planos simulados em EUR (9.3008ms)
✔ GET /plans/:code devolve um plano existente (3.4086ms)
✔ GET /plans/:code rejeita códigos desconhecidos (2.9537ms)
✔ a rota bloqueia pedidos sem sessão (2.9056ms)
✔ a rota bloqueia papel sem acesso (2.6087ms)
✔ o serviço rejeita códigos desconhecidos com erro próprio (4.1897ms)
✔ os planos devolvidos não podem ser alterados pelo chamador (1.9875ms)
✔ o catálogo simulado não expõe campos de pagamento real (1.2119ms)
ℹ tests 55
ℹ suites 1
ℹ pass 50
ℹ fail 5
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 11327.6999

✖ failing tests:

test at tests\contracts\mf2-contracts.test.js:1:1
✖ tests\contracts\mf2-contracts.test.js (529.6387ms)
  'test failed'

test at tests\contracts\mf3-contracts.test.js:1:1
✖ tests\contracts\mf3-contracts.test.js (550.2611ms)
  'test failed'

test at tests\contracts\mf7-export-contracts.test.js:1:1
✖ tests\contracts\mf7-export-contracts.test.js (339.1426ms)
  'test failed'

test at tests\contracts\mf7-import-contracts.test.js:1:1
✖ tests\contracts\mf7-import-contracts.test.js (301.6574ms)
  'test failed'

test at tests\contracts\mf8-health.contract.test.js:64:1
✖ MF8 health: servidor monta GET /api/health antes dos routers autenticados (6.997ms)
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
    diff: 'simple'
  }

## Select-String -Path "src/server.js" -Pattern "buildSubscriptionRoutes","/api/subscriptions"
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> Select-String -Path "src/server.js" -Pattern "buildSubscriptionRoutes","/api/subscriptions"

src\server.js:65:import { buildSubscriptionRoutes } from "./modules/subscriptions/subscriptionRoutes.js";
src\server.js:66:import { buildSubscriptionRoutes } from "./modules/subscriptions/subscriptionRoutes.js";
src\server.js:149:app.use("/api/subscriptions", buildSubscriptionRoutes({ prisma }));

## Test-Path "docs/evidence/MF8/BK-MF8-04.md"
- PS D:\PAP\edu-PAP-3ig-opsa-2526> Test-Path "docs/evidence/MF8/BK-MF8-04.md"
True

## Select-String -Path "docs/planificacao/guias-bk/MF8/BK-MF8-04-subscricao-por-empresa-ativa.md" -Pattern "CompanySubscription","companyId","planCode","billingCycle","intervalCount"
- PS D:\PAP\edu-PAP-3ig-opsa-2526> Select-String -Path "docs/planificacao/guias-bk/MF8/BK-MF8-04-subscricao-por-empresa-ativa.md" -Pattern "CompanySubscription","companyId","planCode","billingCycle","intervalCount"

docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:26:O resultado final é o endpoint `GET /api/subscriptions/current`, que devolve o estado atual da subscrição da empresa resolvid
a pelo backend em `req.companyId`. A resposta também inclui os dados públicos do plano simulado criado no `BK-MF8-03`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:44:- Criar o modelo Prisma `CompanySubscription`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:45:- Relacionar `CompanySubscription` com `Company` através de `companyId`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:75:- a subscrição guarda `companyId`, `planCode`, `status`, `startsAt`, `endsAt` e `simulated`;
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:101:- **`req.companyId`:** identificador da empresa ativa já validada pelo middleware multiempresa.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:104:- **`planCode`:** código técnico do plano, por exemplo `monthly`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:113:**Persistência por `companyId`.** O modelo de subscrição guarda `companyId`, porque a subscrição pertence a uma empresa. A s
essão pode mudar de empresa ativa, mas os dados persistentes continuam ligados à empresa dona do registo.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:115:**Uma subscrição atual por empresa.** Este BK usa `companyId @unique` para garantir uma única linha atual por empresa. Os BK
s seguintes podem atualizar essa linha ao ativar, renovar, cancelar ou reativar a subscrição.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:123:**Erro de drift de plano.** Se a base de dados tiver uma subscrição com `planCode` que já não existe no catálogo, o backend 
deve devolver erro controlado. Isso protege a equipa contra alterações futuras ao catálogo sem migração de dados.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:133:3. `requireCompanyContext(prisma)` resolve a empresa ativa e injeta `req.companyId`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:135:5. A rota chama `getCurrentSubscription(prisma, { companyId: req.companyId })`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:136:6. O service procura `CompanySubscription` por `companyId`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:137:7. Se existir subscrição, o service valida `planCode` contra o catálogo do `BK-MF8-03`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:145:- DERIVADO: o modelo chama-se `CompanySubscription` para representar uma subscrição por empresa.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:217:subscriptions CompanySubscription[]
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:220:Depois adiciona o enum e o modelo `CompanySubscription`. Mantém `companyId` como chave única para impedir duas subscrições a
tuais para a mesma empresa.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:227:enum CompanySubscriptionStatus {
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:233:model CompanySubscription {
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:237:  companyId String @unique
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:240:  planCode String
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:242:  status CompanySubscriptionStatus @default(ACTIVE)
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:249:  company Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:252:  @@index([planCode])
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:260:O campo `companyId` usa `@unique` porque este BK consulta sempre a subscrição atual da empresa ativa. Se existissem duas lin
has atuais para a mesma empresa, o backend teria de adivinhar qual devolver.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:262:O campo `planCode` guarda a ligação ao catálogo do `BK-MF8-03`. O modelo não copia preço, nome ou ciclo do plano, porque ess
es dados continuam a pertencer ao catálogo.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:278:- o Prisma Client vai expor `prisma.companySubscription`;
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:279:- não existe erro de relação entre `Company` e `CompanySubscription`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:283:Erro esperado: criar o modelo sem `companyId @unique`. Nesse caso, a mesma empresa poderia ficar com várias subscrições atua
is e o endpoint `GET /api/subscriptions/current` deixaria de ter resposta determinística.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:299:- exigir `companyId` vindo do contexto backend;
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:300:- consultar `prisma.companySubscription.findUnique`;
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:302:- validar `planCode` contra `getSimulatedSubscriptionPlan`;
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:327: * @param {string | null | undefined} companyId - Empresa ativa resolvida pela API.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:331:export function requireActiveCompanyId(companyId) {
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:332:  if (typeof companyId !== "string" || companyId.trim().length === 0) {
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:340:  return companyId;
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:360: * @param {string} planCode - Código do plano guardado na subscrição.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:364:function getPlanForStoredSubscription(planCode) {
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:366:    return getSimulatedSubscriptionPlan(planCode);
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:383: * @param {object | null} subscription - Registo `CompanySubscription` devolvido pelo Prisma.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:394:  const plan = getPlanForStoredSubscription(subscription.planCode);
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:400:      companyId: subscription.companyId,
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:401:      planCode: subscription.planCode,
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:417: * @param {{ companyId: string }} context - Contexto multiempresa calculado pela API.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:421:  const companyId = requireActiveCompanyId(context.companyId);
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:424:  const subscription = await prisma.companySubscription.findUnique({
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:425:    where: { companyId },
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:435: * @param {string} companyId - Empresa ativa resolvida pela API.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:439:export function assertSubscriptionBelongsToActiveCompany(subscription, companyId) {
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:440:  const expectedCompanyId = requireActiveCompanyId(companyId);
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:442:  if (subscription && subscription.companyId !== expectedCompanyId) {
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:456:`requireActiveCompanyId` cria a barreira de segurança principal do service. Sem empresa ativa, o service não consulta a base
 de dados.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:458:`getCurrentSubscription` consulta por `companyId`, que é o campo persistente correto. A rota não passa valores vindos do bod
y ou da query string.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:483:Erro esperado: chamar `getCurrentSubscription(prisma, { companyId: "" })`. A função deve lançar erro `403` com código `COMPA
NY_CONTEXT_REQUIRED`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:582:      // req.companyId vem do middleware multiempresa e não de input do browser.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:584:        companyId: req.companyId,
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:603:`GET /current` chama `getCurrentSubscription` com `req.companyId`. Isto cumpre a regra multiempresa: o browser não decide qu
e empresa consultar.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:624:Erro esperado: pedido sem empresa ativa. A rota deve devolver `403` com `COMPANY_CONTEXT_REQUIRED` e não deve executar query
 sem `companyId`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:712:    companySubscription: {
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:716:          where: { companyId: "company-active-1" },
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:725:function createAllowedCompanyGuard(companyId = "company-active-1") {
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:730:    req.companyId = companyId;
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:794:    companyId: "company-active-1",
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:795:    planCode: "monthly",
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:813:    assert.equal(response.body.subscription.planCode, "monthly");
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:876:`createPrismaWithSubscription` cria uma dependência controlada para testar a query esperada. O assert dentro de `findUnique`
 prova que o service consulta por `companyId`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:904:Erro esperado: trocar `planCode: "monthly"` por um código inexistente. O teste deve falhar com erro `409` ou erro lançado po
r `getSimulatedSubscriptionPlan`, porque o catálogo não reconhece esse plano.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:919:Regista a evidence com comandos reais executados e resultado observado. Depois confirma que o handoff para `BK-MF8-05` fala 
de `CompanySubscription`, `companyId`, `planCode`, `billingCycle` e `intervalCount`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:932:- Modelo `CompanySubscription` ligado a `Company`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:976:rg "CompanySubscription|companyId|planCode|billingCycle|intervalCount" docs/planificacao/guias-bk/MF8/BK-MF8-04-subscricao-p
or-empresa-ativa.md
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:994:- `CompanySubscription` existe no schema Prisma.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:995:- `CompanySubscription.companyId` é único.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:996:- O modelo persistente usa `companyId`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:998:- O service consulta `prisma.companySubscription.findUnique({ where: { companyId } })`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:999:- O service valida `planCode` contra o catálogo do `BK-MF8-03`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:1007:- O handoff prepara `BK-MF8-05` para reutilizar `CompanySubscription`, `companyId`, `planCode`, `billingCycle` e `intervalC
ount`.
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:1058:- `CompanySubscription`;
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:1059:- `companyId`;
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:1060:- `planCode`;
docs\planificacao\guias-bk\MF8\BK-MF8-04-subscricao-por-empresa-ativa.md:1067:- os campos `billingCycle` e `intervalCount` vindos do catálogo.
=======
| Comando | Resultado |
| --- | --- |
| `node --test real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js` | `PASS`; 6 testes, 6 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; `node --check` executado sobre `src`, `tests` e `scripts`. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 76 testes, 76 pass. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `advisory_pass=false` por divida documental antiga fora deste BK. |

## Limites confirmados

- Nao houve pagamento real.
- Nao houve checkout.
- Nao houve faturacao.
- Nao houve gateway, provider externo ou webhook.
- Nao houve ativacao, renovacao, cancelamento ou reativacao neste BK.
- O `companyId` e resolvido pelo backend a partir da empresa ativa; nao vem de `body` nem de `query`.
- A UI de planos e gestao da subscricao fica para `BK-MF8-07`.

## Notas de risco

- O validador de planificacao continua com `advisory_pass=false` por divida documental antiga e transversal, mas `overall_pass=true`.
- `real_dev/` esta ignorado por `.gitignore`; a validacao foi feita por leitura direta dos ficheiros e execucao local dos comandos.

## Conclusao

`BK-MF8-04` fica com evidence documental criada. A implementacao auditada cumpre o contrato funcional de `RF50` e deixa o handoff preparado para `BK-MF8-05`, reutilizando `CompanySubscription`, `companyId`, `planCode`, `billingCycle` e `intervalCount`.
>>>>>>> 81619f4 (Update: Mid)
