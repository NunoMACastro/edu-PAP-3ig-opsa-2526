# BK-MF7-08 - Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA).

## Header

- `doc_id`: `GUIA-BK-MF7-08`
- `bk_id`: `BK-MF7-08`
- `macro`: `MF7`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF25`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-09`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-08-backend-modular-por-dominio-vendas-compras-inventario-bancos-contabilidade-ia.md`
- `last_updated`: `2026-06-27`

#### Objetivo

Neste BK vais transformar o requisito `RNF25` num gate técnico verificável para o backend do OPSA. O objetivo é confirmar que vendas, compras, inventário, bancos/tesouraria, contabilidade/reporting e IA continuam separados por módulos, com routes próprias, services próprios e montagem controlada em `apps/api/src/server.js`.

O resultado deste BK não é criar endpoints novos. O resultado é uma prova repetível de manutenção: qualquer alteração futura ao backend deve continuar a respeitar a separação por domínio, sem empurrar regra de negócio para o servidor Express.

#### Importância

Um ERP financeiro cresce depressa. Vendas, compras, inventário, tesouraria, contabilidade, compliance, auditoria e IA têm regras diferentes, riscos diferentes e equipas diferentes a tocar no código. Se tudo ficar misturado em `server.js`, a app torna-se difícil de testar e aumenta o risco de uma alteração em compras partir vendas ou de uma regra contabilística ser executada sem validação.

Este BK protege a evolução da PAP. `BK-MF7-09` vai validar modularidade no frontend e `BK-MF7-10` vai focar testes automatizados de módulos críticos. Antes disso, o backend precisa de uma prova simples: os domínios principais existem, as routes delegam em services e o servidor só monta routers.

#### Scope-in

- Criar um script de validação em `apps/api/scripts/check-mf7-backend-modules.mjs`.
- Validar os módulos backend já usados pela app: vendas, compras, inventário, tesouraria, contabilidade/reporting e IA.
- Confirmar que cada route principal importa o service do mesmo domínio.
- Confirmar que `apps/api/src/server.js` monta route builders e não importa services, validators, controllers ou regra de domínio.
- Acrescentar o script `check:mf7:backend-modules` em `apps/api/package.json`.
- Executar prova positiva e três negativos sem alterar código funcional.
- Criar evidence técnica para defesa ou PR.

#### Scope-out

- Reorganizar todos os módulos existentes.
- Criar framework nova, monorepo novo ou camada de dependency injection.
- Alterar endpoints funcionais.
- Mudar modelos Prisma.
- Criar frontend.
- Aceitar a empresa ativa, role ou permissão final a partir do browser.
- Declarar que a arquitetura está perfeita para produção enterprise; este BK cria um gate pedagógico e verificável para a PAP.

#### Estado antes e depois

- Antes: MF0..MF6 já entregaram autenticação, permissões, empresa ativa, dados mestre, documentos de venda e compra, inventário, contabilidade, tesouraria, IA, auditoria, logs de integração e hardening básico.
- Depois: o backend fica acompanhado por um gate que valida os módulos críticos sem exigir ficheiros inventados. O script conhece os nomes reais da API e falha quando falta uma route, falta um service, a route deixa de delegar no service ou `server.js` importa ficheiros internos de domínio.

#### Pre-requisitos

- Ler `RNF25` em `docs/RNF.md`.
- Rever a linha de `BK-MF7-08` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Confirmar que `BK-MF7-08` é P0 e, por isso, precisa de pelo menos 8 passos e 3 cenários negativos.
- Rever `BK-MF6-10`, porque auditoria obrigatória em operações sensíveis depende de boundaries backend consistentes.
- Rever `BK-MF7-07`, porque o módulo de compliance/SAF-T deve continuar montado sem duplicar responsabilidades.
- Rever `BK-MF7-09` e `BK-MF7-10` para perceber o handoff: frontend modular e testes automatizados dependem de contratos backend estáveis.
- Confirmar que `apps/api/package.json` usa ES Modules e que scripts Node podem ser executados com `npm run`.

#### Glossário

- Módulo de domínio: pasta em `apps/api/src/modules` que concentra routes, services, validators e código de uma área funcional.
- Route: fronteira HTTP. Recebe a request, aplica middleware e chama services.
- Service: camada onde vivem regras de negócio, queries e orquestração do domínio.
- Boundary: fronteira entre responsabilidades. Neste BK, boundary significa não misturar regra de negócio no servidor Express.
- Route builder: função como `buildSaleDocumentRoutes`, usada por `server.js` para montar uma área da API.
- Gate de modularidade: script que falha quando a estrutura mínima deixa de cumprir o contrato.
- Evidence: prova técnica guardada para PR ou defesa, com comandos, outputs positivos e negativos.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF25` exige backend modular por domínio: vendas, compras, inventário, bancos, contabilidade e IA.
- `CANONICO`: `BK-MF7-08` é P0, pertence à MF7, tem owner `Oleksii`, apoio `Pedro` e prepara `BK-MF7-09`.
- `CANONICO`: o backend do OPSA usa Node.js, Express, ES Modules e organização modular em `apps/api/src/modules`.
- `DERIVADO`: a forma mais pequena e segura de provar `RNF25` nesta PAP é criar um gate estático, porque o requisito é de manutenção e arquitetura, não de novo fluxo funcional.

Backend modular não significa ter muitas pastas. Uma pasta só prova organização visual. O que interessa é a responsabilidade: routes tratam HTTP, services tratam regra de negócio, validators tratam validação de input e `server.js` monta routers sem conhecer detalhes de cada operação.

O domínio de inventário no OPSA já está dividido em subcontratos reais: movimentos de stock, FIFO, contagens e alertas. Por isso este BK não inventa `inventoryRoutes.js` nem `inventoryService.js`. Ele valida os ficheiros que a app usa de facto: `stockMovementRoutes.js`, `fifoCostRoutes.js`, `inventoryCountRoutes.js`, `stockAlertRoutes.js` e os services correspondentes.

O domínio de IA também deve ser realista. A API atual expõe `aiRoutes.js` e `aiService.js`. A modularidade valida que a route chama o service e que a IA continua separada do resto do backend. A IA recomenda e explica; não altera dados contabilísticos automaticamente.

`server.js` é o ponto de montagem. Ele pode importar route builders, porque precisa de ligar `/api/...` aos routers. O que não deve fazer é importar services, validators, controllers ou lógica interna de domínio. Se isso acontecer, a app fica mais difícil de testar e a segurança fica mais frágil.

Erros comuns a evitar neste BK: inventar ficheiros agregadores como `inventoryRoutes.js`, validar apenas se a pasta existe, bloquear todo e qualquer import de `./modules/...` em `server.js`, editar `apps/web/package.json` num BK de backend ou escrever negativos que não são executáveis.

#### Arquitetura do BK

- Script principal: `apps/api/scripts/check-mf7-backend-modules.mjs`.
- Raiz backend: `apps/api`.
- Módulos analisados: `apps/api/src/modules`.
- Servidor analisado: `apps/api/src/server.js`.
- Package a editar: `apps/api/package.json`.
- Evidence a criar: `docs/evidence/MF7/BK-MF7-08.md`.
- Handoff: `BK-MF7-09` recebe um backend com boundaries validados; `BK-MF7-10` recebe um script que pode ser chamado em testes de manutenção.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/scripts/check-mf7-backend-modules.mjs`
- EDITAR: `apps/api/package.json`
- CRIAR: `docs/evidence/MF7/BK-MF7-08.md`
- REVER: `apps/api/src/server.js`
- REVER: `apps/api/src/modules/sales/saleDocumentRoutes.js`
- REVER: `apps/api/src/modules/sales/saleDocumentService.js`
- REVER: `apps/api/src/modules/purchases/purchaseDocumentRoutes.js`
- REVER: `apps/api/src/modules/purchases/purchaseDocumentService.js`
- REVER: `apps/api/src/modules/inventory/*Routes.js`
- REVER: `apps/api/src/modules/inventory/*Service.js`
- REVER: `apps/api/src/modules/treasury/*Routes.js`
- REVER: `apps/api/src/modules/treasury/*Service.js`
- REVER: `apps/api/src/modules/accounting/*Routes.js`
- REVER: `apps/api/src/modules/accounting/*Service.js`
- REVER: `apps/api/src/modules/accounting-reports/*`
- REVER: `apps/api/src/modules/tax/*`
- REVER: `apps/api/src/modules/financial-statements/*`
- REVER: `apps/api/src/modules/ai/aiRoutes.js`
- REVER: `apps/api/src/modules/ai/aiService.js`

#### Tutorial técnico linear

### Passo 1 - Confirmar o contrato RNF25

1. Objetivo funcional do passo no contexto da app.

Confirmar o que `RNF25` pede antes de escrever código: backend modular por domínio, sem alteração funcional de endpoints.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - LOCALIZAÇÃO: linha de `RNF25` e linha canónica de `BK-MF7-08`.

3. Instruções do que fazer.

Confirma que `RNF25` fala de backend modular por domínio e que `BK-MF7-08` continua com:

- owner `Oleksii`;
- apoio `Pedro`;
- prioridade `P0`;
- sprint `S11-S12`;
- próximo BK `BK-MF7-09`;
- `dependencias: -`, porque esse é o valor canónico atual.

Não alteres estes metadados no header do BK sem uma decisão documental fora deste guia.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e evita que o gate técnico mude o contrato oficial do BK.

5. Explicação do código.

Não há código porque a primeira decisão é de produto e planificação. O aluno deve perceber que um requisito de manutenção não autoriza reorganizar a app inteira. O BK deve provar modularidade com a estrutura real existente.

6. Validação do passo.

Resultado esperado:

- `RNF25` está associado a manutenção e modularidade backend.
- `BK-MF7-08` continua P0.
- O contrato P0 exige pelo menos 8 passos e 3 negativos.
- O guia não cria novo requisito funcional.

7. Cenário negativo/erro esperado.

Se alguém tentar mudar o header para adicionar dependências formais ou alterar owner/sprint sem atualizar a matriz e o backlog, a alteração deve ser recusada nesta execução. O erro esperado é documental: o guia deixaria de bater certo com a fonte canónica.

### Passo 2 - Levantar os módulos reais do backend

1. Objetivo funcional do passo no contexto da app.

Mapear os ficheiros reais que representam cada domínio, para o script não exigir nomes inventados.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules`
    - REVER: `apps/api/src/server.js`
    - LOCALIZAÇÃO: pastas de domínio e imports de route builders.

3. Instruções do que fazer.

Antes de criares o script, confirma estes contratos mínimos:

- vendas: `sales/saleDocumentRoutes.js` e `sales/saleDocumentService.js`;
- compras: `purchases/purchaseDocumentRoutes.js` e `purchases/purchaseDocumentService.js`;
- inventário: `stockMovement`, `fifoCost`, `inventoryCount` e `stockAlert`;
- bancos/tesouraria: `bankAccount`, `statement` e `cashflowForecast`;
- contabilidade/reporting: postings, lançamentos manuais, relatórios contabilísticos, mapas de IVA e demonstrações financeiras;
- IA: `ai/aiRoutes.js` e `ai/aiService.js`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de inventário técnico e prepara o ficheiro do passo seguinte.

5. Explicação do código.

Não há código porque o objetivo é evitar a causa do erro anterior: medir modularidade com nomes que não pertencem à app. O inventário também ensina que um domínio pode ter vários submódulos, como acontece em inventário.

6. Validação do passo.

Executa:

```bash
cd apps/api
find src/modules -maxdepth 2 -type f | sort
```

Confirma visualmente que os ficheiros listados no passo existem.

7. Cenário negativo/erro esperado.

Se encontrares no guia um contrato como `inventoryRoutes.js` ou `aiInsightService.js` sem ficheiro correspondente, não uses esse nome no gate. O erro esperado seria um falso negativo: o script falharia por nomenclatura errada, não por falta real de modularidade.

### Passo 3 - Criar o gate de modularidade backend

1. Objetivo funcional do passo no contexto da app.

Criar o script que valida os domínios reais, a ligação route-service e a fronteira de `server.js`.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/check-mf7-backend-modules.mjs`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro `apps/api/scripts/check-mf7-backend-modules.mjs` com o conteúdo completo abaixo. Mantém o ficheiro em ES Modules e não alteres código funcional da API.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/scripts/check-mf7-backend-modules.mjs
/**
 * @file Gate de modularidade backend para o BK-MF7-08.
 *
 * Este script valida se os domínios principais do OPSA continuam separados por
 * routes, services e montagem controlada no servidor Express.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const apiRoot = fileURLToPath(new URL("..", import.meta.url));
const simulatedMissingFiles = new Set(
    (process.env.OPSA_MF7_SIMULATE_MISSING ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
);

const domainContracts = [
    {
        label: "vendas",
        moduleRoot: "sales",
        pairs: [{ route: "saleDocumentRoutes.js", service: "saleDocumentService.js" }],
        serverBuilders: ["buildSaleDocumentRoutes"],
    },
    {
        label: "compras",
        moduleRoot: "purchases",
        pairs: [{ route: "purchaseDocumentRoutes.js", service: "purchaseDocumentService.js" }],
        serverBuilders: ["buildPurchaseDocumentRoutes"],
    },
    {
        label: "inventário",
        moduleRoot: "inventory",
        pairs: [
            { route: "stockMovementRoutes.js", service: "stockMovementService.js" },
            { route: "fifoCostRoutes.js", service: "fifoCostService.js" },
            { route: "inventoryCountRoutes.js", service: "inventoryCountService.js" },
            { route: "stockAlertRoutes.js", service: "stockAlertService.js" },
        ],
        serverBuilders: [
            "buildStockMovementRoutes",
            "buildFifoCostRoutes",
            "buildInventoryCountRoutes",
            "buildStockAlertRoutes",
        ],
    },
    {
        label: "bancos e tesouraria",
        moduleRoot: "treasury",
        pairs: [
            { route: "bankAccountRoutes.js", service: "bankAccountService.js" },
            { route: "statementRoutes.js", service: "statementImportService.js" },
            { route: "cashflowForecastRoutes.js", service: "cashflowForecastService.js" },
        ],
        serverBuilders: [
            "buildTreasuryAccountRoutes",
            "buildStatementRoutes",
            "buildCashflowForecastRoutes",
        ],
    },
    {
        label: "contabilidade",
        moduleRoot: "accounting",
        pairs: [
            { route: "salePostingRoutes.js", service: "salePostingService.js" },
            { route: "purchasePostingRoutes.js", service: "purchasePostingService.js" },
            { route: "manualJournalRoutes.js", service: "manualJournalService.js" },
        ],
        serverBuilders: [
            "buildSalePostingRoutes",
            "buildPurchasePostingRoutes",
            "buildManualJournalRoutes",
        ],
    },
    {
        label: "reporting contabilístico",
        moduleRoot: "accounting-reports",
        pairs: [{ route: "accountingReportRoutes.js", service: "accountingReportService.js" }],
        serverBuilders: ["buildAccountingReportRoutes"],
    },
    {
        label: "mapas fiscais",
        moduleRoot: "tax",
        pairs: [{ route: "vatMapRoutes.js", service: "vatMapService.js" }],
        serverBuilders: ["buildVatMapRoutes"],
    },
    {
        label: "demonstrações financeiras",
        moduleRoot: "financial-statements",
        pairs: [
            { route: "financialStatementRoutes.js", service: "financialStatementService.js" },
        ],
        serverBuilders: ["buildFinancialStatementRoutes"],
    },
    {
        label: "IA",
        moduleRoot: "ai",
        pairs: [{ route: "aiRoutes.js", service: "aiService.js" }],
        serverBuilders: ["buildAiRoutes"],
    },
];

/**
 * Constrói um caminho relativo ao projeto API.
 *
 * @param {string} relativePath - Caminho dentro de `apps/api`.
 * @returns {string} Caminho absoluto.
 */
function projectPath(relativePath) {
    return join(apiRoot, relativePath);
}

/**
 * Confirma se um ficheiro existe, respeitando simulações de erro usadas nos negativos.
 *
 * @param {string} relativePath - Caminho dentro de `apps/api`.
 * @returns {boolean} Verdadeiro quando o ficheiro existe para esta validação.
 */
function existsInProject(relativePath) {
    return !simulatedMissingFiles.has(relativePath) && existsSync(projectPath(relativePath));
}

/**
 * Lê um ficheiro validado pelo gate.
 *
 * @param {string} relativePath - Caminho dentro de `apps/api`.
 * @returns {string} Conteúdo do ficheiro.
 */
function readProjectFile(relativePath) {
    assert.equal(
        existsInProject(relativePath),
        true,
        `Ficheiro obrigatório em falta: ${relativePath}`,
    );

    return readFileSync(projectPath(relativePath), "utf8");
}

/**
 * Conta quantas vezes um texto aparece numa origem.
 *
 * @param {string} source - Texto onde procurar.
 * @param {string} value - Texto a contar.
 * @returns {number} Número de ocorrências.
 */
function countOccurrences(source, value) {
    return source.split(value).length - 1;
}

/**
 * Valida se uma route importa o service do mesmo domínio.
 *
 * @param {{ label: string, moduleRoot: string }} contract - Contrato do domínio.
 * @param {{ route: string, service: string }} pair - Par route-service esperado.
 * @returns {void}
 */
function assertRouteUsesService(contract, pair) {
    const routePath = `src/modules/${contract.moduleRoot}/${pair.route}`;
    const servicePath = `src/modules/${contract.moduleRoot}/${pair.service}`;
    const routeSource = readProjectFile(routePath);
    const serviceSource = readProjectFile(servicePath);

    // A route só deve coordenar HTTP; a regra de negócio fica no service do mesmo domínio.
    assert.equal(
        routeSource.includes(`./${pair.service}`),
        true,
        `${contract.label}: ${pair.route} deve importar ./${pair.service}`,
    );

    assert.match(
        serviceSource,
        /export\s+(async\s+)?function\s+/,
        `${contract.label}: ${pair.service} deve exportar funções de service`,
    );
}

/**
 * Valida se o servidor importa e monta apenas route builders.
 *
 * @param {string} serverSource - Conteúdo de `src/server.js`.
 * @returns {void}
 */
function assertServerBoundaries(serverSource) {
    const simulatedForbiddenImport = process.env.OPSA_MF7_SIMULATE_FORBIDDEN_SERVER_IMPORT;
    const source =
        simulatedForbiddenImport === undefined
            ? serverSource
            : `${serverSource}\nimport { simulated } from "./modules/${simulatedForbiddenImport}";\n`;
    const forbiddenImports = [
        ...source.matchAll(
            /from\s+"\.\/modules\/[^"]*(Service|Controller|Validators?|Middleware|Context)\.js"/g,
        ),
    ].map((match) => match[0]);

    // `server.js` pode montar routers, mas não deve conhecer services nem validações internas.
    assert.deepEqual(
        forbiddenImports,
        [],
        `server.js importa ficheiros internos de domínio: ${forbiddenImports.join(", ")}`,
    );

    for (const contract of domainContracts) {
        for (const builder of contract.serverBuilders) {
            assert.ok(
                countOccurrences(source, builder) >= 2,
                `${contract.label}: ${builder} deve ser importado e usado em app.use`,
            );
        }
    }
}

/**
 * Executa o gate completo de modularidade backend.
 *
 * @returns {void}
 */
export function checkBackendModules() {
    for (const contract of domainContracts) {
        for (const pair of contract.pairs) {
            assertRouteUsesService(contract, pair);
        }
    }

    assertServerBoundaries(readProjectFile("src/server.js"));
}

checkBackendModules();
console.log("MF7 backend modular: OK");
```

5. Explicação do código.

Este script transforma `RNF25` numa verificação concreta. A lista `domainContracts` contém os nomes reais usados na app, incluindo inventário dividido em movimentos, FIFO, contagens e alertas. Isto evita o erro de pedir `inventoryRoutes.js` ou `inventoryService.js`, que não pertencem ao backend atual.

A função `assertRouteUsesService` valida duas coisas: a route existe e importa o service do mesmo domínio. Assim, a route continua a ser a fronteira HTTP e o service continua a concentrar regra de negócio. O aluno aprende que modularidade não é só ter ficheiros; é manter responsabilidades.

A função `assertServerBoundaries` confirma que `server.js` não importa services, controllers, validators, middlewares ou contextos internos de domínio. O servidor pode usar route builders como `buildSaleDocumentRoutes`, porque a sua função é montar URLs. O que ele não deve fazer é consultar dados, validar input ou executar regras financeiras.

As variáveis `OPSA_MF7_SIMULATE_MISSING` e `OPSA_MF7_SIMULATE_FORBIDDEN_SERVER_IMPORT` existem apenas para os negativos do BK. Elas simulam falhas sem apagar ficheiros reais. Isso permite provar que o gate falha de forma controlada, mantendo a app intacta.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check scripts/check-mf7-backend-modules.mjs
```

Resultado esperado:

```txt
```

O comando `node --check` não imprime nada quando a sintaxe está válida.

7. Cenário negativo/erro esperado.

Se o ficheiro tiver uma vírgula em falta, import mal escrito ou string sem fechar, `node --check` deve falhar antes de o aluno avançar para a prova funcional.

### Passo 4 - Ligar o gate ao `package.json`

1. Objetivo funcional do passo no contexto da app.

Tornar o gate fácil de executar por qualquer elemento da equipa.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: objeto `"scripts"`.

3. Instruções do que fazer.

Abre `apps/api/package.json` e acrescenta a chave `"check:mf7:backend-modules"` dentro de `"scripts"`. Preserva os scripts existentes.

4. Código completo, correto e integrado com a app final.

```json
{
  "name": "@opsa/api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "API OPSA para os BKs MF0, seguindo o contrato apps/api definido na planificação.",
  "main": "src/server.js",
  "scripts": {
    "dev": "node src/server.js",
    "prisma:generate": "prisma generate",
    "prisma:validate": "prisma validate",
    "migration:precheck-mf0": "node scripts/precheck-mf0-migration.js",
    "syntax:check": "find src tests scripts -name '*.js' -print0 | xargs -0 -n 1 node --check",
    "test": "npm run test:unit && npm run test:contracts",
    "test:unit": "node --test tests/unit/*.test.js",
    "test:contracts": "node --test tests/contracts/*.test.js",
    "test:integration": "node --test tests/integration/*.test.js",
    "check:mf7:backend-modules": "node scripts/check-mf7-backend-modules.mjs"
  },
  "dependencies": {
    "@prisma/client": "^6.19.3",
    "bcrypt": "^5.1.1",
    "exceljs": "^4.4.0",
    "express": "^5.2.1",
    "pdfkit": "^0.15.2"
  },
  "devDependencies": {
    "prisma": "^6.19.3"
  }
}
```

5. Explicação do código.

O `package.json` passa a expor uma validação com nome claro. O script fica em `apps/api`, porque este BK é sobre backend. Não há motivo para editar `apps/web/package.json`: isso misturaria responsabilidades e confundiria o aluno.

A alteração preserva `syntax:check`, `test:unit`, `test:contracts` e `test:integration`. Isto é importante porque o BK adiciona uma verificação de arquitetura, não substitui testes existentes.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run check:mf7:backend-modules
```

Resultado esperado:

```txt
MF7 backend modular: OK
```

7. Cenário negativo/erro esperado.

Se o script for acrescentado fora de `"scripts"` ou se a vírgula anterior ficar mal colocada, `npm run check:mf7:backend-modules` deve falhar com erro de JSON ou script em falta.

### Passo 5 - Validar a prova positiva

1. Objetivo funcional do passo no contexto da app.

Confirmar que a app atual passa no gate quando os módulos estão presentes e montados.

2. Ficheiros envolvidos:
    - REVER: `apps/api/scripts/check-mf7-backend-modules.mjs`
    - REVER: `apps/api/src/server.js`
    - REVER: `apps/api/src/modules/*`
    - LOCALIZAÇÃO: output do terminal.

3. Instruções do que fazer.

Corre o script a partir de `apps/api`. Não alteres ficheiros de domínio para forçar a passagem. Se falhar, lê a mensagem: ela indica o domínio, a route, o service ou o builder em falta.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A implementação já ficou nos passos 3 e 4; este passo executa a prova positiva.

5. Explicação do código.

Não há código novo porque a validação já está centralizada no script. Este passo ensina a diferença entre escrever uma ferramenta e usá-la como gate: o output positivo só vale se o comando for executado sem simulações de erro.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run check:mf7:backend-modules
```

Resultado esperado:

```txt
MF7 backend modular: OK
```

7. Cenário negativo/erro esperado.

Se `server.js` não montar, por exemplo, `buildAiRoutes`, o erro esperado deve indicar que `IA: buildAiRoutes deve ser importado e usado em app.use`.

### Passo 6 - Executar negativo de route em falta

1. Objetivo funcional do passo no contexto da app.

Provar que o gate falha quando uma route obrigatória de domínio desaparece.

2. Ficheiros envolvidos:
    - REVER: `apps/api/scripts/check-mf7-backend-modules.mjs`
    - LOCALIZAÇÃO: variável de ambiente de simulação e output do terminal.

3. Instruções do que fazer.

Usa a simulação incorporada no script para fingir que uma route não existe. Não apagues nem movas ficheiros reais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A simulação já está implementada no script através de `OPSA_MF7_SIMULATE_MISSING`.

5. Explicação do código.

Não há código novo porque o objetivo é testar o comportamento de erro. A variável de ambiente só afeta esta execução do comando. Ela permite demonstrar o negativo sem tocar na app.

6. Validação do passo.

Executa:

```bash
cd apps/api
OPSA_MF7_SIMULATE_MISSING=src/modules/ai/aiRoutes.js npm run check:mf7:backend-modules
```

Resultado esperado:

```txt
Ficheiro obrigatório em falta: src/modules/ai/aiRoutes.js
```

7. Cenário negativo/erro esperado.

Este é o negativo. Se o comando passar mesmo com `OPSA_MF7_SIMULATE_MISSING=src/modules/ai/aiRoutes.js`, o gate está errado e o BK não pode ser fechado.

### Passo 7 - Executar negativo de boundary no `server.js`

1. Objetivo funcional do passo no contexto da app.

Provar que o gate falha quando `server.js` tenta importar ficheiros internos de domínio.

2. Ficheiros envolvidos:
    - REVER: `apps/api/scripts/check-mf7-backend-modules.mjs`
    - REVER: `apps/api/src/server.js`
    - LOCALIZAÇÃO: variável de ambiente de simulação e output do terminal.

3. Instruções do que fazer.

Usa a simulação de import proibido. Não edites `apps/api/src/server.js` para provocar o erro.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A simulação já está implementada no script através de `OPSA_MF7_SIMULATE_FORBIDDEN_SERVER_IMPORT`.

5. Explicação do código.

Não há código novo porque o script já sabe acrescentar temporariamente uma linha de import só em memória. O objetivo é provar que a regra de boundary bloqueia services, controllers, validators, middlewares e contextos internos fora das routes.

6. Validação do passo.

Executa:

```bash
cd apps/api
OPSA_MF7_SIMULATE_FORBIDDEN_SERVER_IMPORT=sales/saleDocumentService.js npm run check:mf7:backend-modules
```

Resultado esperado:

```txt
server.js importa ficheiros internos de domínio
```

7. Cenário negativo/erro esperado.

Este é o negativo. Se o comando passar mesmo simulando import de `saleDocumentService.js`, o gate não está a proteger a fronteira certa.

### Passo 8 - Criar evidence e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Guardar prova objetiva do BK e entregar a próxima fase com o contrato de modularidade claro.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF7/BK-MF7-08.md`
    - REVER: `apps/api/scripts/check-mf7-backend-modules.mjs`
    - REVER: `apps/api/package.json`
    - LOCALIZAÇÃO: ficheiro completo de evidence.

3. Instruções do que fazer.

Cria a evidence abaixo e substitui os outputs pelos resultados reais obtidos no teu terminal. Mantém os três comandos: prova positiva, negativo de route em falta e negativo de import proibido no servidor.

4. Código completo, correto e integrado com a app final.

````md
# Evidence BK-MF7-08 - Backend modular por domínio

## Contexto

- BK: BK-MF7-08
- RNF: RNF25
- Data:
- Responsável:

## Prova positiva

Comando:

```bash
cd apps/api
npm run check:mf7:backend-modules
```

Resultado observado:

```txt
MF7 backend modular: OK
```

## Negativo 1 - route obrigatória em falta

Comando:

```bash
cd apps/api
OPSA_MF7_SIMULATE_MISSING=src/modules/ai/aiRoutes.js npm run check:mf7:backend-modules
```

Resultado observado:

```txt
Ficheiro obrigatório em falta: src/modules/ai/aiRoutes.js
```

## Negativo 2 - service importado diretamente no servidor

Comando:

```bash
cd apps/api
OPSA_MF7_SIMULATE_FORBIDDEN_SERVER_IMPORT=sales/saleDocumentService.js npm run check:mf7:backend-modules
```

Resultado observado:

```txt
server.js importa ficheiros internos de domínio
```

## Negativo 3 - service obrigatório em falta

Comando:

```bash
cd apps/api
OPSA_MF7_SIMULATE_MISSING=src/modules/inventory/stockMovementService.js npm run check:mf7:backend-modules
```

Resultado observado:

```txt
Ficheiro obrigatório em falta: src/modules/inventory/stockMovementService.js
```

## Conclusão

O backend mantém domínios separados, routes delegam em services e `server.js` continua limitado à montagem de routers.
````

5. Explicação do código.

O ficheiro de evidence não altera a app. Ele prova o comportamento do gate. A prova positiva mostra que a estrutura atual passa. Os negativos mostram que o script apanha três problemas reais de manutenção: route em falta, service em falta e quebra de boundary no servidor.

Esta evidence prepara `BK-MF7-09`, porque o frontend modular pode confiar numa API organizada por domínios, e prepara `BK-MF7-10`, porque o script pode entrar na lista de comandos de qualidade.

6. Validação do passo.

Confirma que o ficheiro `docs/evidence/MF7/BK-MF7-08.md` inclui:

- comando positivo;
- output positivo;
- três negativos;
- outputs dos negativos;
- conclusão explícita.

7. Cenário negativo/erro esperado.

Se a evidence só disser "passou" sem comando e output, não serve para defesa. O resultado esperado é refazer a evidence com comandos executados e mensagens observadas.

#### Critérios de aceite

- `apps/api/scripts/check-mf7-backend-modules.mjs` existe.
- `apps/api/package.json` inclui `check:mf7:backend-modules`.
- `npm run check:mf7:backend-modules` imprime `MF7 backend modular: OK`.
- O negativo de route em falta falha com o caminho simulado.
- O negativo de service em falta falha com o caminho simulado.
- O negativo de import proibido no servidor falha com mensagem sobre ficheiros internos de domínio.
- O script valida os nomes reais de inventário e IA, sem exigir `inventoryRoutes.js`, `inventoryService.js` ou `aiInsightService.js`.
- `server.js` continua a montar routers e não passa a conter regra de negócio.
- O BK não altera endpoints funcionais, modelos Prisma nem frontend.

#### Validação final

Este BK tem oito passos técnicos e três cenários negativos executáveis.

Executa:

```bash
cd apps/api
node --check scripts/check-mf7-backend-modules.mjs
npm run check:mf7:backend-modules
OPSA_MF7_SIMULATE_MISSING=src/modules/ai/aiRoutes.js npm run check:mf7:backend-modules
OPSA_MF7_SIMULATE_FORBIDDEN_SERVER_IMPORT=sales/saleDocumentService.js npm run check:mf7:backend-modules
OPSA_MF7_SIMULATE_MISSING=src/modules/inventory/stockMovementService.js npm run check:mf7:backend-modules
cd ../..
git diff --check
bash scripts/validate-planificacao.sh
```

Expected results:

- `node --check` não imprime erros.
- A prova positiva imprime `MF7 backend modular: OK`.
- Os três negativos falham com mensagens específicas.
- `git diff --check` sai limpo.
- `validate-planificacao.sh` mantém `overall_pass=true`; avisos editoriais antigos devem ser registados se aparecerem.

#### Evidence para PR/defesa

- `pr`: referência do PR ou pacote de entrega.
- `proof`: output de `npm run check:mf7:backend-modules`.
- `neg`: outputs dos três negativos.
- `fonte`: `docs/RNF.md`, matriz, backlog, `apps/api/src/server.js` e este guia.
- `segurança`: confirmação de que autorização, permissões e empresa ativa continuam no backend; este BK só valida modularidade e não desloca decisões para o frontend.
- `handoff`: confirmação de que `BK-MF7-09` e `BK-MF7-10` podem reutilizar o contrato validado.

#### Handoff

- Próximo BK recomendado: `BK-MF7-09`
- Este BK entrega a `BK-MF7-09` uma API organizada por domínios, com route builders montados no servidor e regra de negócio isolada nos services.
- Este BK entrega a `BK-MF7-10` um comando de qualidade reutilizável: `npm run check:mf7:backend-modules`.
- Risco restante: a matriz e o backlog continuam a declarar `dependencias: -` para `BK-MF7-08`, embora o guia consuma tecnicamente contratos anteriores. Não alteres esse campo neste BK sem decisão documental superior.

#### Changelog

- `2026-06-25`: guia reescrito para tutorial técnico linear, autocontido e alinhado com a MF7 completa.
- `2026-06-27`: corrigido o gate de modularidade para usar nomes reais da API, acrescentados 8 passos P0, três negativos executáveis, script backend correto, evidence e handoff para `BK-MF7-09` e `BK-MF7-10`.
