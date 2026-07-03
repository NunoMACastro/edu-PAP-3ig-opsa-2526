# BK-MF8-02 - Endpoint de health-check.

## Header

- `doc_id`: `GUIA-BK-MF8-02`
- `bk_id`: `BK-MF8-02`
- `macro`: `MF8`
- `owner`: `Sofia`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF29`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-03`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-02-endpoint-de-health-check.md`
- `last_updated`: `2026-07-01`

#### Objetivo

Neste BK vais criar um endpoint público e seguro de health-check para confirmar que a API responde, que a configuração mínima está carregada e que a equipa tem uma prova simples de readiness antes de avançar para os módulos finais da MF8.

#### Importância

Um health-check é uma fronteira pequena, mas muito útil: antes de testar subscrições simuladas, IA, relatórios ou execução final de testes, a equipa precisa de saber se o processo HTTP está vivo e se a API consegue devolver uma resposta controlada sem expor dados internos.

Este BK também ensina uma regra operacional importante: um endpoint público pode existir sem autenticação, mas isso não significa que possa revelar configuração privada, detalhes da base de dados ou informação financeira.

#### Scope-in

- Criar `apps/api/src/modules/ops/healthRoutes.js`.
- Responder a `GET /api/health` com estado, serviço, versão, ambiente e timestamp.
- Validar a configuração mínima antes de montar a resposta.
- Montar a rota em `apps/api/src/server.js`.
- Criar teste de contrato para rota, payload seguro e cenários negativos.
- Registar evidence objetiva para PR ou defesa.

#### Scope-out

- Criar painel de monitorização.
- Fazer ping à base de dados.
- Expor URLs internas, credenciais ou configuração completa.
- Transformar health-check em autenticação.
- Criar fornecedor externo de observabilidade.
- Criar UI frontend para o health-check.

#### Estado antes e depois

- Antes: MF0..MF7 já entregaram autenticação com cookies HttpOnly, empresa ativa no backend, permissões, dados mestre, vendas, compras, inventário, tesouraria, contabilidade, IA explicável, auditoria, hardening e gates de qualidade. `BK-MF8-01` preparou logs estruturados para eventos operacionais.
- Depois: `BK-MF8-02` deixa `GET /api/health` montado em `apps/api/src/server.js`, com payload seguro, validação mínima, teste de contrato e evidence para confirmar readiness.

#### Pre-requisitos

- Ler `RNF29` em `docs/RNF.md`.
- Rever a linha de `BK-MF8-02` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF8-02` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever `BK-MF8-01`, porque esse BK criou a base de observabilidade operacional.
- Confirmar que todos os caminhos do aluno usam `apps/api` ou `apps/web`.
- Negativos: mínimo `2`.

#### Glossário

- Health-check: endpoint leve que confirma se a API responde.
- Liveness: prova de que o processo HTTP está vivo.
- Readiness: prova mínima de que a API está pronta para receber validações.
- Payload seguro: resposta com campos controlados, sem dados internos.
- Contrato público: formato de resposta estável que pode ser usado por testes, CI ou defesa.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF29` é o requisito associado a `BK-MF8-02`.
- `CANONICO`: `BK-MF8-02` pertence à MF8, sprint `S12`, owner `Sofia`, apoio `Oleksii`, prioridade `P1`, dependências formais `-` e próximo BK `BK-MF8-03`.
- `CANONICO`: a app dos alunos usa Node.js, Express, ES Modules, Prisma, React, Vite e TypeScript nos caminhos públicos `apps/api` e `apps/web`.
- `DERIVADO`: `GET /api/health` é o endpoint mínimo coerente para materializar `RNF29`, porque é simples de testar e não mistura operação com domínio financeiro.
- `DERIVADO`: a rota fica em `apps/api/src/modules/ops/healthRoutes.js`, porque `ops` agrupa contratos operacionais da MF8.

Um health-check deve ser rápido, previsível e seguro. Ele não substitui testes unitários, contratos, integração ou E2E; apenas responde à pergunta "a API está viva e pronta para começar a validação?".

A resposta deve ser pública, mas limitada. `status`, `service`, `version`, `environment` e `checkedAt` são suficientes para defesa e CI. A rota não devolve URL de base de dados, variáveis de ambiente completas, lista de permissões, dados de empresas, documentos financeiros ou detalhes de infraestrutura.

`BK-MF8-01` criou logs estruturados. Neste BK, não vais registar cada pedido de `GET /api/health`, porque health-checks podem ser chamados muitas vezes por ferramentas automáticas. Essa decisão evita ruído operacional. Se, mais tarde, a equipa quiser registar falhas de readiness, deve usar o `writeStructuredLog` criado no BK anterior, sem inventar outro formato de log.

#### Arquitetura do BK

- Requisito: `RNF29`.
- Domínio principal: operação e readiness.
- Endpoint: `GET /api/health`.
- Backend público dos alunos: `apps/api`.
- Router: `apps/api/src/modules/ops/healthRoutes.js`.
- Montagem: `apps/api/src/server.js`.
- Teste de contrato: `apps/api/tests/contracts/mf8-health.contract.test.js`.
- Evidence: `docs/evidence/MF8/BK-MF8-02.md`.
- Handoff: `BK-MF8-03`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ops/healthRoutes.js`
- CRIAR: `apps/api/tests/contracts/mf8-health.contract.test.js`
- EDITAR: `apps/api/src/server.js`
- REVER: `apps/api/package.json`
- REVER: `apps/api/src/config/env.js`
- REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md`
- REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico

1. Objetivo funcional do passo no contexto da app.

Confirmar que vais implementar o requisito certo antes de escrever código.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - LOCALIZAÇÃO: linhas de `RNF29` e `BK-MF8-02`.

3. Instruções do que fazer.

Confirma que `BK-MF8-02` continua associado a `RNF29`, prioridade `P1`, owner `Sofia`, apoio `Oleksii`, dependências formais `-`, sprint `S12`, tipo `Core` e próximo BK `BK-MF8-03`. Não alteres o header se a matriz e o backlog não mudaram.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e impede que a implementação avance com requisito, owner ou dependência trocados.

5. Explicação do código.

Não há código porque a decisão principal é confirmar a fonte de verdade. O contrato canónico vem de `RNF29`, matriz, backlog e contrato de campos. Esta leitura protege o aluno de criar uma rota operacional com nome certo, mas comportamento errado.

6. Validação do passo.

O aluno consegue indicar:

- `RNF29` como requisito.
- `BK-MF8-02` como BK alvo.
- `BK-MF8-03` como próximo BK.
- `apps/api` como raiz pública do backend.

7. Cenário negativo/erro esperado.

Se o header do guia divergir da matriz ou do backlog, a implementação deve parar até o drift ser resolvido em documentação canónica.

### Passo 2 - Mapear integração com a app existente

1. Objetivo funcional do passo no contexto da app.

Perceber onde a rota operacional encaixa na API sem duplicar módulos nem quebrar a sequência da MF8.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/server.js`
    - REVER: `apps/api/src/config/env.js`
    - REVER: `apps/api/package.json`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md`
    - LOCALIZAÇÃO: imports de routers, montagem `app.use(...)`, scripts `syntax:check` e `test:contracts`.

3. Instruções do que fazer.

Confirma que `apps/api/src/server.js` monta routers Express por domínio e que `apps/api/package.json` já tem `syntax:check` e `test:contracts`. Revê o handoff de `BK-MF8-01`: o logger estruturado existe para eventos operacionais relevantes, mas o health-check não deve gerar um log por pedido.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de inventário técnico e evita criar endpoints duplicados ou scripts desnecessários.

5. Explicação do código.

Não há código porque a tarefa é observar a arquitetura. O endpoint de health-check pertence ao módulo `ops`, mas precisa de ser montado em `server.js` para existir como `GET /api/health`. O teste deve correr dentro de `npm run test:contracts`, porque esse script já apanha ficheiros em `apps/api/tests/contracts/*.test.js`.

6. Validação do passo.

Antes de avançar, confirma:

- `apps/api/src/server.js` usa Express.
- `apps/api/package.json` tem `test:contracts`.
- `BK-MF8-01` criou o contrato de logs estruturados.
- O health-check não precisa de autenticação nem de empresa ativa, porque não lê dados de negócio.

7. Cenário negativo/erro esperado.

Se tentares criar outra raiz de API, outro framework ou outro script obrigatório sem necessidade, estás a aumentar o scope. Mantém a solução dentro de Express e dos scripts já existentes.

### Passo 3 - Criar o router de health-check

1. Objetivo funcional do passo no contexto da app.

Criar o ficheiro que devolve o payload seguro de readiness.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ops/healthRoutes.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria a pasta `apps/api/src/modules/ops`, se ainda não existir, e adiciona o ficheiro `healthRoutes.js`. Este ficheiro deve validar a configuração recebida, construir o payload seguro e expor um router Express com `GET /`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/ops/healthRoutes.js

import { Router } from "express";

const VALID_ENVIRONMENTS = new Set(["development", "test", "production"]);

/**
 * @typedef {{ version: string, environment: string }} HealthOptions
 */

/**
 * @typedef {{ status: "ok", service: "opsa-api", version: string, environment: string, checkedAt: string }} HealthPayload
 */

/**
 * Normaliza um campo textual obrigatório do health-check.
 *
 * @param {unknown} value - Valor recebido da configuração da API.
 * @param {string} fieldName - Nome usado na mensagem de erro.
 * @returns {string} Texto validado e sem espaços exteriores.
 * @throws {Error} Quando o campo não é uma string preenchida.
 */
function readRequiredText(value, fieldName) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`${fieldName} é obrigatório para o health-check.`);
    }

    return value.trim();
}

/**
 * Cria o payload público e seguro do endpoint de health-check.
 *
 * @param {HealthOptions} options - Configuração mínima que pode ser exposta.
 * @param {Date} [now] - Relógio usado para tornar o teste determinístico.
 * @returns {HealthPayload} Payload público do endpoint.
 * @throws {Error} Quando a versão ou o ambiente não são seguros para expor.
 */
export function buildHealthPayload(options, now = new Date()) {
    if (!options || typeof options !== "object") {
        throw new Error("Configuração de health-check inválida.");
    }

    const version = readRequiredText(options.version, "version");
    const environment = readRequiredText(options.environment, "environment");

    if (!VALID_ENVIRONMENTS.has(environment)) {
        throw new Error("Ambiente de health-check inválido.");
    }
    if (Number.isNaN(now.getTime())) {
        throw new Error("Data de health-check inválida.");
    }

    // O payload público usa uma lista fechada para não deixar escapar configuração interna.
    return {
        status: "ok",
        service: "opsa-api",
        version,
        environment,
        checkedAt: now.toISOString(),
    };
}

/**
 * Monta o router público de health-check da API OPSA.
 *
 * @param {HealthOptions} options - Configuração segura a expor na resposta.
 * @returns {Router} Router Express com `GET /`.
 */
export function buildHealthRoutes(options) {
    const router = Router();

    router.get("/", (_req, res) => {
        // A resposta é construída no momento do pedido para devolver um timestamp atual.
        const payload = buildHealthPayload(options);

        // O status 200 só é devolvido depois de a configuração mínima passar na validação.
        return res.status(200).json(payload);
    });

    return router;
}
```

5. Explicação do código.

Este ficheiro transforma `RNF29` num contrato executável. `buildHealthPayload` valida a configuração mínima antes de responder. Isto evita uma situação perigosa: a API dizer que está pronta (`status: "ok"`) mesmo quando falta versão, falta ambiente ou o ambiente tem um valor inesperado.

`readRequiredText` é interna ao ficheiro e existe para evitar repetição. Ela só aceita strings preenchidas. O conjunto `VALID_ENVIRONMENTS` limita a resposta a `development`, `test` e `production`, que são ambientes previsíveis para a PAP.

`buildHealthRoutes` monta o endpoint Express. A rota não recebe input do utilizador, não lê base de dados, não mexe em empresas, não altera documentos e não chama IA. Por isso é pública e pequena, mas continua segura: o payload tem uma lista fechada de campos.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/modules/ops/healthRoutes.js
```

Resultado esperado: o ficheiro passa no parser de Node.js e exporta `buildHealthPayload` e `buildHealthRoutes`.

7. Cenário negativo/erro esperado.

Chama `buildHealthPayload({ version: "", environment: "test" })`. O resultado esperado é erro `version é obrigatório para o health-check.`.

### Passo 4 - Montar `GET /api/health` no servidor

1. Objetivo funcional do passo no contexto da app.

Ligar o router ao ponto de entrada da API para o endpoint existir como `GET /api/health`.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/server.js`
    - LOCALIZAÇÃO: imports do topo, constantes de configuração e zona de `app.use(...)` antes dos routers de domínio autenticados.

3. Instruções do que fazer.

Adiciona o import de `buildHealthRoutes`, define a versão operacional da API e monta o router depois dos middlewares transversais e antes dos routers de domínio. Não coloques autenticação neste endpoint, porque `RNF29` serve precisamente para readiness pública e segura.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/server.js

import { buildHealthRoutes } from "./modules/ops/healthRoutes.js";

const API_VERSION = "1.0.0";

app.set("trust proxy", 1);
app.use(enforceHttps({ isProduction }));
app.use(applyStrictTransportSecurity({ isProduction }));
app.use(express.json());
app.use(requireTrustedOrigin({ appBaseUrl, isProduction }));

// O health-check é público, mas só expõe metadados operacionais controlados.
app.use(
    "/api/health",
    buildHealthRoutes({
        version: API_VERSION,
        environment: apiEnv.nodeEnv,
    }),
);

app.use("/api/auth", buildAuthRoutes({ prisma, isProduction, appBaseUrl }));
```

5. Explicação do código.

O import liga `server.js` ao ficheiro criado no passo anterior. `API_VERSION` deve acompanhar a versão declarada em `apps/api/package.json`; numa PAP, esta constante torna explícita a versão usada na defesa e nos testes.

A montagem em `/api/health` resolve o principal contrato de `RNF29`: seguindo o guia, o aluno consegue chamar `GET /api/health`. A rota fica depois de `enforceHttps`, `applyStrictTransportSecurity`, `express.json` e `requireTrustedOrigin`, por isso mantém os middlewares transversais de segurança já usados pela API. Fica antes de `/api/auth` porque não depende de sessão.

Este passo também justifica o handoff do BK anterior: não chamamos `writeStructuredLog` em cada pedido de health-check para evitar ruído. Se a equipa quiser registar falhas operacionais raras, deve reutilizar o logger de `BK-MF8-01`.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/server.js
```

Resultado esperado: `server.js` continua válido e importa `./modules/ops/healthRoutes.js` sem erro de caminho.

7. Cenário negativo/erro esperado.

Se esqueceres o `app.use("/api/health", ...)`, o teste de contrato do próximo passo deve falhar porque a API não expõe o endpoint prometido.

### Passo 5 - Criar teste de contrato comportamental

1. Objetivo funcional do passo no contexto da app.

Provar que a rota existe no router, que `server.js` monta o endpoint público, que o payload tem apenas os campos seguros e que os negativos falham de forma controlada.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/contracts/mf8-health.contract.test.js`
    - REVER: `apps/api/package.json`
    - REVER: `apps/api/src/server.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o teste de contrato abaixo. Não edites `apps/api/package.json`, porque o script `test:contracts` já executa `tests/contracts/*.test.js`. O teste deve provar o router isolado e também a montagem em `apps/api/src/server.js`; caso contrário, a suite poderia passar mesmo sem `GET /api/health` existir publicamente.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/tests/contracts/mf8-health.contract.test.js

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
    buildHealthPayload,
    buildHealthRoutes,
} from "../../src/modules/ops/healthRoutes.js";

/**
 * Confirma se o router expõe a rota esperada.
 *
 * @param router - Router Express a inspecionar.
 * @param {string} method - Método HTTP esperado.
 * @param {string} path - Caminho esperado dentro do router.
 * @returns {boolean} Verdadeiro quando a rota existe.
 */
function hasRoute(router, method, path) {
    return router.stack.some(
        (layer) => layer.route?.path === path && layer.route.methods[method],
    );
}

/**
 * Executa diretamente o handler de uma rota Express simples.
 *
 * @param router - Router Express a testar.
 * @param {string} method - Método HTTP a procurar.
 * @param {string} path - Caminho dentro do router.
 * @returns {Promise<{ statusCode: number, body: Record<string, string> | undefined }>} Resposta observada.
 */
async function requestRouter(router, method, path) {
    const layer = router.stack.find(
        (item) => item.route?.path === path && item.route.methods[method],
    );
    assert.ok(layer, `Rota ${method.toUpperCase()} ${path} em falta`);

    const response = {
        statusCode: 0,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };

    // O teste chama o handler sem abrir porta HTTP, mantendo a suite rápida e determinística.
    await layer.route.stack[0].handle({}, response);

    return response;
}

test("MF8 health: router expõe GET /", () => {
    const router = buildHealthRoutes({ version: "1.0.0", environment: "test" });

    assert.equal(hasRoute(router, "get", "/"), true);
});

test("MF8 health: servidor monta GET /api/health antes dos routers autenticados", () => {
    const serverSource = readFileSync(
        new URL("../../src/server.js", import.meta.url),
        "utf8",
    );

    const healthImportIndex = serverSource.search(
        /import\s+\{\s*buildHealthRoutes\s*\}\s+from\s+"\.\/modules\/ops\/healthRoutes\.js";/,
    );
    const healthMountIndex = serverSource.search(
        /app\.use\(\s*"\/api\/health",\s*buildHealthRoutes\(\{/s,
    );
    const authMountIndex = serverSource.indexOf('app.use("/api/auth"');

    // Esta prova textual evita abrir portas locais e falha se a montagem pública for esquecida.
    assert.notEqual(healthImportIndex, -1, "server.js deve importar buildHealthRoutes");
    assert.notEqual(healthMountIndex, -1, "server.js deve montar /api/health");
    assert.notEqual(authMountIndex, -1, "server.js deve manter /api/auth");
    assert.equal(healthMountIndex < authMountIndex, true);
    assert.match(
        serverSource,
        /buildHealthRoutes\(\{\s*version: API_VERSION,\s*environment: apiEnv\.nodeEnv,\s*\}\)/s,
    );
});

test("MF8 health: GET / devolve payload público seguro", async () => {
    const router = buildHealthRoutes({ version: "1.0.0", environment: "test" });
    const response = await requestRouter(router, "get", "/");

    assert.equal(response.statusCode, 200);
    assert.ok(response.body);
    assert.equal(response.body.status, "ok");
    assert.equal(response.body.service, "opsa-api");
    assert.equal(response.body.version, "1.0.0");
    assert.equal(response.body.environment, "test");
    assert.match(response.body.checkedAt, /^\d{4}-\d{2}-\d{2}T/);

    // A lista fechada impede que detalhes internos entrem por engano na resposta pública.
    assert.deepEqual(Object.keys(response.body).sort(), [
        "checkedAt",
        "environment",
        "service",
        "status",
        "version",
    ]);
});

test("MF8 health: payload usa relógio controlado nos testes", () => {
    const payload = buildHealthPayload(
        { version: "1.0.0", environment: "test" },
        new Date("2026-07-01T10:00:00.000Z"),
    );

    assert.equal(payload.checkedAt, "2026-07-01T10:00:00.000Z");
});

test("MF8 health: falha sem versão configurada", () => {
    assert.throws(
        () => buildHealthPayload({ version: "", environment: "test" }),
        /version é obrigatório/,
    );
});

test("MF8 health: falha com ambiente desconhecido", () => {
    assert.throws(
        () => buildHealthPayload({ version: "1.0.0", environment: "staging" }),
        /Ambiente de health-check inválido/,
    );
});
```

5. Explicação do código.

Este teste corrige a diferença entre "a função existe" e "o contrato funciona". `hasRoute` confirma a presença de `GET /` dentro do router. A leitura de `src/server.js` confirma que o router é montado como `GET /api/health`, antes dos routers autenticados. Isto é importante porque `RNF29` pede um endpoint público real, não apenas um router que compila isoladamente.

`requestRouter` executa o handler sem arrancar servidor HTTP, o que torna a suite rápida e evita depender de portas locais. O teste positivo verifica status HTTP, campos públicos e formato do timestamp. Os dois negativos validam a configuração mínima: sem versão ou com ambiente desconhecido, o payload não pode ser construído. Isto prova que a API não responde "ok" com configuração ambígua.

A lista de chaves esperadas é deliberada. Se alguém acrescentar um campo interno ao payload público, o teste falha e obriga a equipa a discutir se esse campo deve mesmo sair para fora da API. Se alguém remover `app.use("/api/health", ...)` de `server.js`, o teste também falha antes de a equipa aceitar evidence incompleta.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check tests/contracts/mf8-health.contract.test.js
npm run test:contracts
```

Resultados esperados:

- `node --check` termina sem output.
- `npm run test:contracts` executa `mf8-health.contract.test.js`.
- Os testes positivos passam.
- O teste de montagem falha se `server.js` não importar ou não montar `buildHealthRoutes`.
- Os negativos falham de forma controlada quando a configuração é inválida.

7. Cenário negativo/erro esperado.

Remove temporariamente `app.use("/api/health", ...)` de `server.js`. O teste `servidor monta GET /api/health antes dos routers autenticados` deve falhar. Depois, remove temporariamente `version` da chamada a `buildHealthRoutes`; o teste `falha sem versão configurada` deve continuar a provar que a ausência de versão é erro, não readiness válida.

### Passo 6 - Validar segurança e evidence

1. Objetivo funcional do passo no contexto da app.

Confirmar que o endpoint é seguro para ser público e registar evidence objetiva.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/ops/healthRoutes.js`
    - REVER: `apps/api/src/server.js`
    - REVER: `apps/api/tests/contracts/mf8-health.contract.test.js`
    - CRIAR/EDITAR: `docs/evidence/MF8/BK-MF8-02.md`
    - LOCALIZAÇÃO: resultados dos comandos executados.

3. Instruções do que fazer.

Revê o payload final. Ele deve conter apenas `status`, `service`, `version`, `environment` e `checkedAt`. Regista a evidence com comando, resultado esperado, resultado observado e negativos executados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A evidence é documental e deve conter apenas resultados reais da execução.

5. Explicação do código.

Não há código porque a alteração técnica já ficou nos passos 3, 4 e 5. Esta revisão existe para garantir que a rota pública não expõe dados internos. Como o endpoint não lê base de dados e não recebe input de negócio, não há empresa ativa, role, permissão, documento financeiro, lançamento contabilístico ou IA para validar neste BK.

6. Validação do passo.

Regista estes comandos na evidence:

```bash
cd apps/api
node --check src/modules/ops/healthRoutes.js
node --check src/server.js
node --check tests/contracts/mf8-health.contract.test.js
npm run test:contracts
```

Resultado esperado: todos os comandos terminam com sucesso e a evidence inclui pelo menos dois negativos: versão em falta e ambiente desconhecido.

7. Cenário negativo/erro esperado.

Se o payload incluir configuração interna, URLs privadas, dados financeiros ou informação de empresas, remove esse campo e volta a executar os testes.

### Passo 7 - Preparar handoff para o próximo BK

1. Objetivo funcional do passo no contexto da app.

Entregar a `BK-MF8-03` uma API com readiness verificável.

2. Ficheiros envolvidos:
    - REVER: secção `Handoff` deste guia
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`
    - LOCALIZAÇÃO: contratos exportados e evidence.

3. Instruções do que fazer.

Resume o que ficou entregue, que ficheiros o próximo BK deve consumir e que riscos não ficaram abertos. O próximo BK declarado é `BK-MF8-03`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O handoff é a ponte entre entregas incrementais da app.

5. Explicação do código.

Não há código porque este passo fecha a rastreabilidade. `BK-MF8-03` pode avançar para subscrições simuladas sabendo que a API já tem um endpoint simples para readiness e uma suite de contrato que prova o formato público da resposta.

6. Validação do passo.

A secção final confirma:

- endpoint entregue: `GET /api/health`;
- ficheiro principal: `apps/api/src/modules/ops/healthRoutes.js`;
- montagem: `apps/api/src/server.js`;
- teste: `apps/api/tests/contracts/mf8-health.contract.test.js`;
- próximo BK: `BK-MF8-03`.

7. Cenário negativo/erro esperado.

Se o próximo BK depender de uma API pronta, mas `GET /api/health` não estiver montado, volta ao passo 4 antes de fechar o BK.

#### Critérios de aceite

- O guia preserva header, owner, prioridade, dependências, requisito e próximo BK definidos pela matriz e pelo backlog.
- Os caminhos publicados para alunos usam apenas `apps/api`, `apps/web`, `apps/api/prisma/schema.prisma` ou `docs/evidence`.
- `apps/api/src/modules/ops/healthRoutes.js` exporta `buildHealthPayload` e `buildHealthRoutes`.
- `apps/api/src/server.js` monta `GET /api/health`.
- O payload público contém apenas `status`, `service`, `version`, `environment` e `checkedAt`.
- O teste de contrato valida router, montagem em `server.js`, status HTTP, payload seguro e pelo menos dois negativos.
- Não há pagamentos reais, fornecedores externos, ações automáticas da IA, dados de empresas ou dados financeiros no endpoint.

#### Validação final

Executa os comandos relevantes para este BK:

```bash
cd apps/api
node --check src/modules/ops/healthRoutes.js
node --check src/server.js
node --check tests/contracts/mf8-health.contract.test.js
npm run test:contracts
```

Se a equipa quiser confirmar a rota com a API a correr, pode testar:

```bash
curl -i http://localhost:3000/api/health
```

Expected results:

- `healthRoutes.js`, `server.js` e o teste passam no parser de Node.js.
- `npm run test:contracts` passa.
- A suite falha se `server.js` não montar `/api/health`.
- `GET /api/health` devolve HTTP `200`.
- O corpo JSON inclui `status: "ok"` e não expõe dados internos.
- Os negativos de versão em falta e ambiente desconhecido falham de forma controlada.

#### Evidence para PR/defesa

- Comando positivo: `node --check src/modules/ops/healthRoutes.js`.
- Comando positivo: `node --check src/server.js`.
- Comando positivo: `node --check tests/contracts/mf8-health.contract.test.js`.
- Comando positivo: `npm run test:contracts`.
- Prova de contrato: `mf8-health.contract.test.js` valida a montagem de `/api/health` em `server.js`.
- Payload observado de `GET /api/health`, se a API tiver sido executada localmente.
- Negativo 1: versão em falta.
- Negativo 2: ambiente desconhecido.
- Decisão `DERIVADO`: `GET /api/health` é o endpoint mínimo para `RNF29`.

#### Handoff

- Próximo BK recomendado: `BK-MF8-03`
- Contrato entregue: operação e readiness ligado a `RNF29`.
- Endpoint entregue: `GET /api/health`.
- Ficheiro principal: `apps/api/src/modules/ops/healthRoutes.js`.
- Montagem: `apps/api/src/server.js`.
- Teste/evidence principal: `apps/api/tests/contracts/mf8-health.contract.test.js`.
- Risco a vigiar: não transformar o health-check em fonte de dados internos nem misturar este BK com subscrições simuladas, pagamentos, IA ou contabilidade.

#### Changelog

- `2026-07-01`: teste de contrato reforçado para provar a montagem de `/api/health` em `server.js`, fechando a lacuna `OPSA-MF8-BK02-REAUD-001`.
- `2026-07-01`: guia corrigido após auditoria para incluir montagem real em `server.js`, payload validado, teste de contrato comportamental, negativos e handoff explícito.
- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com caminhos públicos, passos técnicos lineares, código completo, validação e evidence.
