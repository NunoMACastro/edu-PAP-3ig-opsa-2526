# BK-MF8-03 - Catálogo de planos de subscrição simulados

---

## Header

- `doc_id`: `GUIA-BK-MF8-03`
- `bk_id`: `BK-MF8-03`
- `macro`: `MF8`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF49`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-04`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`
- `last_updated`: `2026-07-01`

#### Objetivo

Neste BK vais criar o catálogo backend que expõe os três planos de subscrição simulados da OPSA: mensal, trimestral e anual.

O resultado final é uma pequena área de backend com dados estáveis, rotas HTTP protegidas e testes de contrato. Este BK não inicia pagamentos reais, não cria checkout e não emite documentos financeiros.

#### Importância

O RF49 pede que administradores e gestores consigam consultar os planos simulados antes de escolherem uma subscrição para a empresa ativa.

Funcionalmente, este BK prepara a base dos BKs seguintes de subscrição. Pedagogicamente, ensina a separar uma fonte canónica de dados, uma rota Express, regras de autorização e testes de contrato sem misturar a simulação com pagamentos reais.

#### Scope-in

- Criar `apps/api/src/modules/subscriptions/subscriptionPlans.js`.
- Criar `apps/api/src/modules/subscriptions/subscriptionRoutes.js`.
- Editar `apps/api/src/server.js` para montar o router de subscrições.
- Criar `apps/api/tests/contracts/mf8-subscription-plans.contract.test.js`.
- Expor `GET /api/subscriptions/plans`.
- Expor `GET /api/subscriptions/plans/:code`.
- Devolver exactamente três planos simulados: mensal, trimestral e anual.
- Proteger as rotas com sessão autenticada, empresa ativa e papel `ADMIN` ou `GESTOR`.
- Criar cenários negativos para acesso bloqueado, papel bloqueado, plano inexistente e ausência de campos de pagamento real.

#### Scope-out

- Pagamentos reais.
- Gateway externo de pagamento.
- Checkout.
- Faturas ou recibos.
- Persistência da subscrição ativa.
- Alterações no frontend.
- Seeds de base de dados.
- Regras de renovação, cancelamento ou reativação.

#### Estado antes e depois

Antes deste BK, a MF8 ainda não tem uma fonte única para os planos simulados de subscrição.

Depois deste BK, o backend passa a ter um contrato reutilizável:

- uma lista canónica de planos simulados;
- uma função para obter um plano por código;
- rotas HTTP para listar e consultar detalhe;
- guards de autenticação, empresa ativa e papel;
- testes que protegem o contrato para os BKs seguintes.

#### Pre-requisitos

Antes de começares, confirma:

- o backend em `apps/api` usa Node.js, Express e ES Modules;
- o servidor principal está em `apps/api/src/server.js`;
- os middlewares `requireAuth`, `requireCompanyContext` e `requireRole` já existem em BKs anteriores;
- o script `npm run test:contracts` executa testes em `apps/api/tests/contracts`;
- o RF49 está limitado à consulta dos planos mensal, trimestral e anual;
- o MF8 continua a trabalhar com subscrições simuladas nesta fase;
- os negativos mínimos deste BK são três.

#### Glossário

- Plano de subscrição: opção que define preço, ciclo e nome comercial de uma subscrição.
- Plano simulado: plano realista para a aplicação, mas sem pagamento externo.
- Catálogo: lista organizada e estável de opções disponíveis.
- Fonte canónica: ficheiro ou módulo que guarda a versão oficial de uma regra ou lista.
- Código do plano: identificador técnico usado pela API, como `monthly`.
- Empresa ativa: empresa escolhida na sessão autenticada do utilizador.
- Papel: nível funcional do utilizador dentro da empresa, como `ADMIN` ou `GESTOR`.
- Teste de contrato: teste que garante que uma API mantém rotas, campos e erros esperados.

#### Conceitos teóricos essenciais

Um catálogo canónico evita duplicação. Se os planos fossem copiados em vários ficheiros, bastava uma equipa alterar um preço ou código num sítio e esquecer outro para criar inconsistência. Neste BK, a lista vive num módulo próprio e as rotas apenas a expõem.

Um plano simulado não é um pagamento. Ele tem preço, moeda e ciclo porque a interface precisa de mostrar informação realista, mas não tem ligação a gateways, referências de cobrança ou documentos fiscais.

Um contrato de API é a promessa pública da rota. Para este BK, a API promete devolver planos com `code`, `name`, `description`, `priceCents`, `currency`, `billingCycle`, `intervalCount` e `simulated`.

Autenticação responde à pergunta "quem está a fazer o pedido?". Autorização responde à pergunta "esta pessoa pode fazer isto?". O catálogo é administrativo, por isso a rota exige sessão, empresa ativa e papel `ADMIN` ou `GESTOR`.

Contexto multiempresa impede que um utilizador consulte ou altere dados no contexto errado. Neste BK não há dados persistidos por empresa, mas a rota já deve usar a empresa ativa para manter o mesmo padrão de segurança dos BKs seguintes.

Preço em cêntimos evita erros de arredondamento com números decimais. Por isso `990` significa 9,90 EUR e não 990 EUR.

Objetos imutáveis reduzem efeitos laterais. Se uma função devolvesse a lista interna diretamente, outro ficheiro poderia alterar o preço em memória sem passar por validação.

Erros HTTP estáveis ajudam o frontend e os testes. Um plano inexistente deve devolver sempre `404` com `SUBSCRIPTION_PLAN_NOT_FOUND`, em vez de uma mensagem imprevisível.

#### Arquitetura do BK

O fluxo deste BK fica assim:

1. `subscriptionPlans.js` guarda a lista oficial dos planos simulados.
2. `subscriptionRoutes.js` importa o catálogo e cria rotas Express.
3. `server.js` monta as rotas em `/api/subscriptions`.
4. O teste de contrato confirma rotas, dados, erros e ausência de campos de pagamento real.

Decisões de contrato:

- CANÓNICO: RF49 pede os três planos mensal, trimestral e anual.
- CANÓNICO: os atores funcionais são `Admin` e `Gestor`.
- DERIVADO: os códigos técnicos dos planos são `monthly`, `quarterly` e `yearly`, para serem estáveis e fáceis de usar nos BKs seguintes.
- DERIVADO: a rota fica em `/api/subscriptions/plans`, porque os BKs seguintes também trabalham dentro do domínio de subscrições.

Handoff técnico:

- `BK-MF8-04` usa `getSimulatedSubscriptionPlan(code)` para validar o plano escolhido pela empresa.
- `BK-MF8-07` usa `GET /api/subscriptions/plans` para mostrar opções na interface.
- `BK-MF8-08` usa estas rotas e funções como base dos testes finais de subscrições simuladas.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/subscriptions/subscriptionPlans.js`
- CRIAR: `apps/api/src/modules/subscriptions/subscriptionRoutes.js`
- CRIAR: `apps/api/tests/contracts/mf8-subscription-plans.contract.test.js`
- EDITAR: `apps/api/src/server.js`
- REVER: `apps/api/package.json`
- REVER: `docs/RF.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar o contrato canónico do RF49

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK implementa apenas consulta de planos simulados, sem alargar o escopo para pagamentos reais.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - LOCALIZAÇÃO: linhas ou tabelas que referem `RF49` e `BK-MF8-03`.

3. Instruções do que fazer.

Lê o RF49 e confirma que o requisito pede consultar três planos de subscrição simulados. Depois confirma na matriz que `BK-MF8-03` está ligado a `RF49`, tem prioridade `P0`, owner `Pedro` e próximo BK `BK-MF8-04`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental porque fixa o escopo antes de criares ficheiros.

5. Explicação do código.

Como não há código, o ponto importante é a decisão de escopo. Este BK existe para criar um contrato de leitura, não um fluxo de compra. Essa separação evita que o aluno invente gateways externos, faturas ou estados de pagamento que ainda não pertencem ao RF49. A validação documental também prepara os BKs seguintes, porque `BK-MF8-04` vai precisar de confiar nos códigos dos planos definidos aqui.

6. Validação do passo.

Consegues escrever, por palavras tuas, que este BK entrega apenas catálogo simulado e que pagamentos reais ficam fora do escopo.

7. Cenário negativo/erro esperado.

Erro esperado: tentar adicionar checkout, emissão de fatura ou integração externa neste BK. Isso deve ser rejeitado porque pertence a escopo fora do RF49.

### Passo 2 - Definir o contrato público dos planos

1. Objetivo funcional do passo no contexto da app.

Definir os campos que a API vai devolver antes de escrever a implementação.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/subscriptions/subscriptionPlans.js`
    - CRIAR: `apps/api/src/modules/subscriptions/subscriptionRoutes.js`
    - CRIAR: `apps/api/tests/contracts/mf8-subscription-plans.contract.test.js`
    - LOCALIZAÇÃO: contrato usado pelo service, pela rota e pelos testes.

3. Instruções do que fazer.

Usa estes três códigos técnicos:

| Código | Nome | Ciclo | Intervalo |
| --- | --- | --- | --- |
| `monthly` | Plano Mensal | `month` | `1` |
| `quarterly` | Plano Trimestral | `month` | `3` |
| `yearly` | Plano Anual | `year` | `1` |

Cada plano deve devolver:

| Campo | Tipo | Regra |
| --- | --- | --- |
| `code` | string | código técnico estável |
| `name` | string | nome visível para o utilizador |
| `description` | string | frase curta sobre o plano |
| `priceCents` | number | preço em cêntimos |
| `currency` | string | sempre `EUR` |
| `billingCycle` | string | `month` ou `year` |
| `intervalCount` | number | número de ciclos |
| `simulated` | boolean | sempre `true` |

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é preparatório porque transforma o RF49 num contrato técnico antes de criares ficheiros.

5. Explicação do código.

Como ainda não há código, a explicação é sobre o contrato. O campo `code` é a entrada que os BKs seguintes vão usar. Os campos `priceCents`, `currency`, `billingCycle` e `intervalCount` são a saída que o frontend vai mostrar. O campo `simulated` protege o domínio, porque lembra todos os consumidores da API que estes planos não acionam pagamento real. Este contrato evita duplicações, campos soltos e decisões diferentes entre backend, frontend e testes.

6. Validação do passo.

Antes de avançares, confirma que os três códigos são únicos e que todos os campos têm uma regra clara.

7. Cenário negativo/erro esperado.

Erro esperado: criar um quarto plano, como `enterprise`, sem decisão canónica. O BK deve rejeitar essa decisão porque o RF49 só fala em mensal, trimestral e anual.

### Passo 3 - Criar o módulo canónico dos planos simulados

1. Objetivo funcional do passo no contexto da app.

Criar o ficheiro que guarda os planos e fornece funções reutilizáveis ao backend.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/subscriptions/subscriptionPlans.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria a pasta `apps/api/src/modules/subscriptions` se ainda não existir. Depois cria o ficheiro `subscriptionPlans.js` com o código completo abaixo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Catálogo canónico dos planos de subscrição simulados da OPSA.
 *
 * Este módulo não conhece Express nem base de dados. A sua responsabilidade é
 * devolver planos estáveis para a API e para os BKs seguintes de subscrição.
 */

export const SIMULATED_PLAN_CODES = Object.freeze(["monthly", "quarterly", "yearly"]);

export const PLAN_NOT_FOUND_CODE = "SUBSCRIPTION_PLAN_NOT_FOUND";

const RAW_PLANS = Object.freeze([
  Object.freeze({
    code: "monthly",
    name: "Plano Mensal",
    description: "Acesso mensal à gestão operacional da empresa.",
    priceCents: 990,
    billingCycle: "month",
    intervalCount: 1,
  }),
  Object.freeze({
    code: "quarterly",
    name: "Plano Trimestral",
    description: "Acesso trimestral com valor reduzido face ao plano mensal.",
    priceCents: 2490,
    billingCycle: "month",
    intervalCount: 3,
  }),
  Object.freeze({
    code: "yearly",
    name: "Plano Anual",
    description: "Acesso anual com o melhor valor para equipas estáveis.",
    priceCents: 8990,
    billingCycle: "year",
    intervalCount: 1,
  }),
]);

/**
 * @typedef {object} SimulatedSubscriptionPlan
 * @property {string} code Identificador técnico do plano.
 * @property {string} name Nome apresentado ao utilizador.
 * @property {string} description Texto curto sobre o plano.
 * @property {number} priceCents Preço em cêntimos.
 * @property {"EUR"} currency Moeda usada pelo catálogo.
 * @property {"month" | "year"} billingCycle Ciclo de faturação.
 * @property {number} intervalCount Quantidade de ciclos por cobrança simulada.
 * @property {true} simulated Indica que o plano não aciona pagamento real.
 */

export class SimulatedSubscriptionPlanError extends Error {
  /**
   * Cria um erro de domínio para plano inexistente.
   *
   * @param {string} code Código de plano recebido pela API.
   */
  constructor(code) {
    super("Plano de subscrição simulado inválido.");
    this.name = "SimulatedSubscriptionPlanError";
    this.code = PLAN_NOT_FOUND_CODE;
    this.status = 404;
    this.planCode = code;
  }
}

/**
 * Devolve uma cópia imutável de todos os planos simulados.
 *
 * @returns {SimulatedSubscriptionPlan[]} Lista ordenada de planos.
 */
export function listSimulatedSubscriptionPlans() {
  return RAW_PLANS.map((plan) =>
    Object.freeze({
      // A cópia impede que outro módulo altere a lista interna por acidente.
      ...plan,
      currency: "EUR",
      simulated: true,
    }),
  );
}

/**
 * Procura um plano pelo código público usado pela API.
 *
 * @param {string} code Código do plano.
 * @returns {SimulatedSubscriptionPlan} Plano encontrado.
 * @throws {SimulatedSubscriptionPlanError} Quando o código não existe.
 */
export function getSimulatedSubscriptionPlan(code) {
  const plan = listSimulatedSubscriptionPlans().find((candidate) => candidate.code === code);

  if (!plan) {
    // O erro próprio deixa a rota devolver sempre o mesmo contrato HTTP.
    throw new SimulatedSubscriptionPlanError(code);
  }

  return plan;
}

/**
 * Converte erros do catálogo para uma resposta HTTP estável.
 *
 * @param {unknown} error Erro capturado pela rota.
 * @returns {{status: number, body: {error: string, message: string}}} Resposta para Express.
 */
export function toSubscriptionPlanErrorResponse(error) {
  if (error instanceof SimulatedSubscriptionPlanError) {
    return {
      status: error.status,
      body: {
        error: error.code,
        message: "O plano de subscrição pedido não existe.",
      },
    };
  }

  return {
    status: 500,
    body: {
      error: "SUBSCRIPTION_PLAN_UNEXPECTED_ERROR",
      message: "Não foi possível obter o plano de subscrição.",
    },
  };
}
```

5. Explicação do código.

O módulo começa por declarar os códigos oficiais dos planos. Isto cumpre o RF49, porque só existem mensal, trimestral e anual. A lista `RAW_PLANS` guarda os valores base e fica congelada para impedir alterações acidentais durante a execução.

`listSimulatedSubscriptionPlans()` devolve cópias imutáveis, não os objetos internos. Entram zero argumentos e sai uma lista ordenada com moeda `EUR` e `simulated: true`. Esta decisão evita que outro ficheiro altere o catálogo em memória e prepara `BK-MF8-07`, que vai precisar de mostrar os planos na interface.

`getSimulatedSubscriptionPlan(code)` recebe o código pedido pela rota, procura na lista canónica e devolve um único plano. Se o código não existir, lança `SimulatedSubscriptionPlanError`. Este erro evita respostas genéricas e prepara `BK-MF8-04`, porque a subscrição por empresa ativa só deve aceitar planos existentes.

`toSubscriptionPlanErrorResponse(error)` transforma erros internos em respostas HTTP. O aluno pode adaptar nomes, descrições e preços se o docente decidir novos valores, mas não deve mudar os códigos técnicos, a moeda, o campo `simulated` nem o erro `SUBSCRIPTION_PLAN_NOT_FOUND` sem rever os BKs seguintes.

6. Validação do passo.

Confirma que o ficheiro exporta `listSimulatedSubscriptionPlans`, `getSimulatedSubscriptionPlan`, `PLAN_NOT_FOUND_CODE` e `SimulatedSubscriptionPlanError`.

7. Cenário negativo/erro esperado.

Chamar `getSimulatedSubscriptionPlan("enterprise")` deve lançar `SimulatedSubscriptionPlanError` com código `SUBSCRIPTION_PLAN_NOT_FOUND`.

### Passo 4 - Criar a rota HTTP protegida

1. Objetivo funcional do passo no contexto da app.

Expor o catálogo por HTTP com autenticação, empresa ativa e papel autorizado.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/subscriptions/subscriptionRoutes.js`
    - REVER: `apps/api/src/modules/auth/authMiddleware.js`
    - REVER: `apps/api/src/modules/companies/companyContext.js`
    - REVER: `apps/api/src/modules/permissions/permissionMiddleware.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria `subscriptionRoutes.js` na mesma pasta do módulo anterior. Este router deve ter duas rotas: uma para listar planos e outra para consultar um plano por código.

4. Código completo, correto e integrado com a app final.

```js
import { Router } from "express";

import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import {
  getSimulatedSubscriptionPlan,
  listSimulatedSubscriptionPlans,
  toSubscriptionPlanErrorResponse,
} from "./subscriptionPlans.js";

/**
 * Constrói os middlewares de segurança usados pelas rotas de subscrição.
 *
 * @param {object} options Opções de configuração.
 * @param {import("@prisma/client").PrismaClient} options.prisma Cliente Prisma da aplicação.
 * @param {Function[] | null} [options.guards] Guards alternativos usados em testes.
 * @returns {Function[]} Middlewares de Express.
 */
export function buildSubscriptionGuards({ prisma, guards = null }) {
  if (Array.isArray(guards)) {
    return guards;
  }

  return [
    requireAuth(prisma),
    requireCompanyContext(prisma),
    requireRole("ADMIN", "GESTOR"),
  ];
}

/**
 * Cria as rotas HTTP do catálogo de subscrições simuladas.
 *
 * @param {object} options Opções da rota.
 * @param {import("@prisma/client").PrismaClient} options.prisma Cliente Prisma da aplicação.
 * @param {Function[] | null} [options.guards] Guards alternativos usados em testes.
 * @returns {Router} Router configurado.
 */
export function buildSubscriptionRoutes({ prisma, guards = null } = {}) {
  const router = Router();
  const subscriptionGuards = buildSubscriptionGuards({ prisma, guards });

  router.get("/plans", subscriptionGuards, (_req, res) => {
    // A API devolve apenas catálogo simulado; nenhum pagamento externo é iniciado aqui.
    return res.status(200).json({
      plans: listSimulatedSubscriptionPlans(),
    });
  });

  router.get("/plans/:code", subscriptionGuards, (req, res) => {
    try {
      return res.status(200).json({
        plan: getSimulatedSubscriptionPlan(req.params.code),
      });
    } catch (error) {
      // A conversão centralizada mantém o mesmo erro para o frontend e para os testes.
      const response = toSubscriptionPlanErrorResponse(error);

      return res.status(response.status).json(response.body);
    }
  });

  return router;
}
```

5. Explicação do código.

`buildSubscriptionGuards()` junta os três controlos que protegem a rota. Primeiro vem a sessão, depois o contexto da empresa ativa, e só depois o papel `ADMIN` ou `GESTOR`. A ordem interessa: não faz sentido avaliar papel sem saber quem é o utilizador e em que empresa está.

`buildSubscriptionRoutes()` cria um router Express separado para manter a responsabilidade do domínio de subscrições dentro da sua pasta. A rota `GET /plans` não recebe dados de entrada e devolve todos os planos. A rota `GET /plans/:code` recebe o código na URL e devolve o detalhe de um plano.

O parâmetro `guards` existe para testes de contrato. Em produção, o router usa os middlewares reais. Nos testes, conseguimos simular acesso autorizado ou bloqueado sem abrir servidor HTTP. Esta decisão evita testes frágeis e mantém a autorização real no backend.

O código não aceita identificador de empresa vindo do browser. A empresa ativa é resolvida pelos middlewares existentes. O aluno pode adaptar mensagens de erro visíveis se o produto pedir outro texto, mas não deve remover autenticação, empresa ativa ou papéis autorizados.

6. Validação do passo.

Confirma que o ficheiro exporta `buildSubscriptionRoutes` e que existem as rotas `GET /plans` e `GET /plans/:code`.

7. Cenário negativo/erro esperado.

Um utilizador sem sessão deve receber `401`. Um utilizador com papel fora de `ADMIN` e `GESTOR` deve receber `403`. Um código de plano inexistente deve receber `404`.

### Passo 5 - Montar o router no servidor principal

1. Objetivo funcional do passo no contexto da app.

Ligar o router de subscrições ao servidor Express para que a API pública exista.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/server.js`
    - LOCALIZAÇÃO: imports dos routers e zona de montagem das rotas principais.

3. Instruções do que fazer.

Abre `apps/api/src/server.js`. Adiciona o import junto dos restantes routers e monta o router junto das restantes chamadas `app.use(...)`.

4. Código completo, correto e integrado com a app final.

```js
import { buildSubscriptionRoutes } from "./modules/subscriptions/subscriptionRoutes.js";
```

```js
app.use("/api/subscriptions", buildSubscriptionRoutes({ prisma }));
```

5. Explicação do código.

O import traz para o servidor a função que constrói as rotas do domínio de subscrições. A chamada `app.use("/api/subscriptions", ...)` define o prefixo público. Por isso, a rota interna `/plans` passa a responder em `GET /api/subscriptions/plans`.

Este passo cumpre o contrato HTTP do RF49. Sem a montagem no servidor, o service existiria mas nenhum cliente conseguiria chamar a API. O próximo BK também ficaria bloqueado, porque precisaria de validar o plano escolhido pela empresa.

A entrada deste passo é o router criado no passo anterior. A saída é uma API montada. A regra de segurança continua dentro do router, porque é lá que estão os guards. O aluno não deve montar estas rotas noutro prefixo sem actualizar BKs seguintes, testes e handoff.

6. Validação do passo.

Procura no ficheiro `server.js` por `buildSubscriptionRoutes` e por `/api/subscriptions`.

7. Cenário negativo/erro esperado.

Erro esperado: criar `subscriptionRoutes.js` mas esquecer a montagem no servidor. Nesse caso, os testes de contrato devem falhar na verificação de `server.js`.

### Passo 6 - Criar os testes de contrato

1. Objetivo funcional do passo no contexto da app.

Provar que o contrato de catálogo existe, está montado e protege os casos negativos principais.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/contracts/mf8-subscription-plans.contract.test.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o teste abaixo. Ele valida a lista, o detalhe por código, a montagem no servidor, a imutabilidade dos planos, a ausência de campos de pagamento real e os bloqueios de segurança simulados.

4. Código completo, correto e integrado com a app final.

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildSubscriptionRoutes } from "../../src/modules/subscriptions/subscriptionRoutes.js";
import {
  getSimulatedSubscriptionPlan,
  listSimulatedSubscriptionPlans,
  PLAN_NOT_FOUND_CODE,
  SimulatedSubscriptionPlanError,
} from "../../src/modules/subscriptions/subscriptionPlans.js";

const SERVER_SOURCE = readFileSync(new URL("../../src/server.js", import.meta.url), "utf8");

function findRoute(router, method, path) {
  return router.stack.find((layer) => {
    return layer.route?.path === path && layer.route.methods[method] === true;
  });
}

function createResponseRecorder() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function executeRoute(router, method, path, request = {}) {
  const layer = findRoute(router, method, path);
  const response = createResponseRecorder();
  const handlers = layer.route.stack.map((entry) => entry.handle);
  let index = 0;

  function next() {
    const handler = handlers[index];
    index += 1;

    if (handler) {
      // A execução em cadeia permite testar guards e handler sem abrir porta HTTP.
      handler(request, response, next);
    }
  }

  next();
  return response;
}

function deny(status, error) {
  return (_req, res) => {
    return res.status(status).json({ error });
  };
}

test("BK-MF8-03 expõe as rotas de catálogo de subscrições", () => {
  const router = buildSubscriptionRoutes({ guards: [] });

  assert.ok(findRoute(router, "get", "/plans"));
  assert.ok(findRoute(router, "get", "/plans/:code"));
});

test("BK-MF8-03 está montado no servidor principal", () => {
  assert.match(SERVER_SOURCE, /buildSubscriptionRoutes/);
  assert.match(SERVER_SOURCE, /app\.use\("\/api\/subscriptions", buildSubscriptionRoutes\(\{ prisma \}\)\)/);
});

test("GET /plans devolve três planos simulados em EUR", () => {
  const router = buildSubscriptionRoutes({ guards: [] });
  const response = executeRoute(router, "get", "/plans");

  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    response.body.plans.map((plan) => plan.code),
    ["monthly", "quarterly", "yearly"],
  );
  assert.ok(response.body.plans.every((plan) => plan.currency === "EUR"));
  assert.ok(response.body.plans.every((plan) => plan.simulated === true));
});

test("GET /plans/:code devolve um plano existente", () => {
  const router = buildSubscriptionRoutes({ guards: [] });
  const response = executeRoute(router, "get", "/plans/:code", {
    params: { code: "monthly" },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.plan.code, "monthly");
  assert.equal(response.body.plan.billingCycle, "month");
});

test("GET /plans/:code rejeita códigos desconhecidos", () => {
  const router = buildSubscriptionRoutes({ guards: [] });
  const response = executeRoute(router, "get", "/plans/:code", {
    params: { code: "enterprise" },
  });

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, PLAN_NOT_FOUND_CODE);
});

test("a rota bloqueia pedidos sem sessão", () => {
  const router = buildSubscriptionRoutes({
    guards: [deny(401, "SESSION_REQUIRED")],
  });
  const response = executeRoute(router, "get", "/plans");

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, "SESSION_REQUIRED");
});

test("a rota bloqueia papel sem acesso", () => {
  const router = buildSubscriptionRoutes({
    guards: [(_req, _res, next) => next(), deny(403, "ROLE_FORBIDDEN")],
  });
  const response = executeRoute(router, "get", "/plans");

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "ROLE_FORBIDDEN");
});

test("o serviço rejeita códigos desconhecidos com erro próprio", () => {
  assert.throws(
    () => getSimulatedSubscriptionPlan("enterprise"),
    SimulatedSubscriptionPlanError,
  );
});

test("os planos devolvidos não podem ser alterados pelo chamador", () => {
  const plans = listSimulatedSubscriptionPlans();

  assert.equal(Object.isFrozen(plans[0]), true);
  assert.throws(() => {
    // Se este teste deixasse alterar o preço, outro módulo poderia corromper o catálogo.
    plans[0].priceCents = 1;
  }, TypeError);
});

test("o catálogo simulado não expõe campos de pagamento real", () => {
  const forbiddenFields = ["gateway", "checkoutUrl", "paymentProvider", "invoiceId"];
  const plans = listSimulatedSubscriptionPlans();

  for (const plan of plans) {
    for (const field of forbiddenFields) {
      assert.equal(Object.hasOwn(plan, field), false);
    }
  }
});
```

5. Explicação do código.

O teste importa o router e o catálogo real do BK. Isso garante que não está a testar uma cópia artificial do contrato. Também lê `server.js` para confirmar que a rota ficou montada no servidor principal.

`findRoute()` procura a rota dentro do router Express. `executeRoute()` executa os handlers em cadeia, incluindo guards de teste. Assim consegues validar respostas positivas e bloqueios sem abrir uma porta HTTP.

Os testes positivos confirmam as duas rotas, a montagem em `/api/subscriptions`, a ordem dos três planos, a moeda `EUR`, o detalhe por código e o campo `simulated`. Os testes negativos confirmam plano inexistente, pedido sem sessão, papel bloqueado, imutabilidade dos objetos devolvidos e ausência de campos de pagamento real.

Este teste cumpre o RF49 e prepara `BK-MF8-08`, que vai reunir evidence das subscrições simuladas. O aluno pode acrescentar novos asserts se o docente decidir mais campos, mas não deve remover os negativos de autorização nem a verificação de pagamento real ausente.

6. Validação do passo.

Confirma que o ficheiro fica em `apps/api/tests/contracts` e que o nome termina em `.contract.test.js`.

7. Cenário negativo/erro esperado.

Se removeres a montagem no servidor, o teste `BK-MF8-03 está montado no servidor principal` deve falhar.

### Passo 7 - Validar segurança e limites do domínio

1. Objetivo funcional do passo no contexto da app.

Garantir que o BK continua limitado a consulta simulada e que a proteção fica no backend.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/subscriptions/subscriptionRoutes.js`
    - REVER: `apps/api/src/modules/subscriptions/subscriptionPlans.js`
    - REVER: `apps/api/tests/contracts/mf8-subscription-plans.contract.test.js`
    - LOCALIZAÇÃO: guards, campos devolvidos e testes negativos.

3. Instruções do que fazer.

Revê o código e confirma:

- a rota usa sessão autenticada;
- a rota exige empresa ativa;
- a rota aceita apenas `ADMIN` e `GESTOR`;
- o browser não escolhe a empresa ativa;
- o catálogo não devolve `gateway`, `checkoutUrl`, `paymentProvider` ou `invoiceId`;
- o erro de plano inexistente não expõe detalhes internos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é uma revisão de segurança e domínio sobre o código criado nos passos anteriores.

5. Explicação do código.

A segurança principal deste BK está na fronteira HTTP. Mesmo sendo apenas consulta, a funcionalidade é administrativa e deve seguir o padrão dos dados empresariais da OPSA. A empresa ativa vem do contexto autenticado; o frontend não decide ownership, papel ou permissão final.

O catálogo também evita campos de pagamento real. Isso reduz risco de o frontend começar a tratar a simulação como cobrança efetiva. A validação deste passo liga segurança, domínio e testes: se alguém remover guards ou adicionar campos de pagamento, o teste deve denunciar.

6. Validação do passo.

Confirma que os testes incluem pelo menos estes negativos: código inexistente, pedido sem sessão, papel bloqueado e ausência de campos de pagamento real.

7. Cenário negativo/erro esperado.

Erro esperado: tentar aceitar a empresa ativa enviada pelo browser. Esse padrão deve ser recusado porque a empresa ativa vem da sessão e dos middlewares do backend.

### Passo 8 - Executar validações e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Executar os comandos finais e deixar evidence suficiente para o próximo BK.

2. Ficheiros envolvidos:
    - REVER: `apps/api/package.json`
    - REVER: `apps/api/tests/contracts/mf8-subscription-plans.contract.test.js`
    - REVER: secção `Evidence para PR/defesa` deste guia
    - REVER: secção `Handoff` deste guia
    - LOCALIZAÇÃO: comandos de validação e resumo final do BK.

3. Instruções do que fazer.

Na raiz do backend, executa:

```bash
cd apps/api
npm run syntax:check
npm run test:contracts
```

Regista o resultado no teu PR, apresentação ou relatório de defesa.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é operacional: executa comandos e recolhe evidence.

5. Explicação do código.

`npm run syntax:check` confirma que os ficheiros JavaScript têm sintaxe válida. `npm run test:contracts` confirma que o contrato da API não ficou apenas no papel. A evidence deve indicar que o catálogo é simulado, que a rota está montada e que os cenários negativos foram testados.

Este passo prepara `BK-MF8-04`, porque o próximo colega precisa de confiar que `getSimulatedSubscriptionPlan(code)` e `GET /api/subscriptions/plans` já existem. O aluno pode acrescentar screenshots ou logs de CI, mas não deve avançar para a subscrição por empresa ativa com testes de contrato a falhar.

6. Validação do passo.

O passo está concluído quando os dois comandos terminam sem erros e a evidence menciona ficheiros criados, rota montada, testes executados e simulação sem pagamento real.

7. Cenário negativo/erro esperado.

Erro esperado: `npm run test:contracts` falhar porque o ficheiro de teste não foi apanhado pelo padrão `tests/contracts/*.test.js`. Nesse caso, revê `apps/api/package.json` antes de fechares o BK.

#### Critérios de aceite

- `subscriptionPlans.js` existe e exporta o catálogo canónico.
- O catálogo devolve exactamente três planos.
- Todos os planos têm `currency: "EUR"` e `simulated: true`.
- Códigos desconhecidos geram `SUBSCRIPTION_PLAN_NOT_FOUND`.
- `subscriptionRoutes.js` expõe `GET /plans` e `GET /plans/:code`.
- `server.js` monta o router em `/api/subscriptions`.
- A rota exige sessão autenticada, empresa ativa e papel `ADMIN` ou `GESTOR`.
- O teste de contrato cobre lista, detalhe, montagem, bloqueios e ausência de campos de pagamento real.
- `npm run syntax:check` passa.
- `npm run test:contracts` passa.

#### Validação final

Executa:

```bash
cd apps/api
npm run syntax:check
npm run test:contracts
```

Expected results:

- `syntax:check` termina com código `0`;
- `test:contracts` termina com código `0`;
- o teste `mf8-subscription-plans.contract.test.js` é executado;
- existem pelo menos três cenários negativos;
- nenhuma rota precisa de abrir servidor HTTP durante os testes.

#### Evidence para PR/defesa

Regista evidence neste formato:

```md
Evidência BK-MF8-03:
- Criado catálogo canónico em apps/api/src/modules/subscriptions/subscriptionPlans.js.
- Criadas rotas em apps/api/src/modules/subscriptions/subscriptionRoutes.js.
- Montado router em /api/subscriptions.
- Validado GET /api/subscriptions/plans.
- Validado GET /api/subscriptions/plans/:code.
- npm run syntax:check: PASS.
- npm run test:contracts: PASS.
- Catálogo confirmado como simulado e sem campos de pagamento real.
```

#### Handoff

- Próximo BK recomendado: `BK-MF8-04`

O próximo colega pode reutilizar:

- `listSimulatedSubscriptionPlans()` para listar planos;
- `getSimulatedSubscriptionPlan(code)` para validar um plano escolhido;
- `GET /api/subscriptions/plans` para mostrar opções de subscrição;
- `GET /api/subscriptions/plans/:code` para obter detalhe de um plano;
- `PLAN_NOT_FOUND_CODE` para manter erro estável nos testes.

`BK-MF8-04` deve partir desta base para guardar a subscrição simulada escolhida pela empresa ativa.

#### Changelog

- 2026-07-01: Guia reestruturado para o contrato tutorial obrigatório, com explicações pós-código, cenários negativos e texto pedagógico em português com acentuação.
- 2026-07-01: Guia corrigido para incluir módulo, router, montagem no servidor, contrato HTTP completo e negativos exigidos pela auditoria.
- 2026-06-30: Guia inicial criado para o catálogo de planos simulados do MF8.
