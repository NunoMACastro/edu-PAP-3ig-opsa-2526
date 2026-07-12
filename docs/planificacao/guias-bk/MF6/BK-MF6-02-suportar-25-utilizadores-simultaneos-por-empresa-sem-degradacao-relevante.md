# BK-MF6-02 - Suportar ≥ 25 utilizadores simultâneos por empresa sem degradação relevante.

## Header

- `doc_id`: `GUIA-BK-MF6-02`
- `bk_id`: `BK-MF6-02`
- `macro`: `MF6`
- `owner`: `Sofia`
- `apoio`: `Pedro`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF09`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-03`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-02-suportar-25-utilizadores-simultaneos-por-empresa-sem-degradacao-relevante.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais criar uma validação controlada para o `RNF09`: a API deve suportar pelo menos 25 utilizadores simultâneos por empresa sem degradação relevante nos fluxos principais.

Como é um BK de escalabilidade, o resultado esperado é um teste de carga educativo e repetível, não uma promessa de infraestrutura de produção. O aluno vai medir respostas autenticadas, evitar dados entre empresas e documentar limites do ambiente local.

#### Importância

Um ERP é usado por várias pessoas da mesma empresa. Se 25 utilizadores abrirem listagens ou criarem documentos e a aplicação falhar, o produto deixa de ser confiável.

Este BK ensina a validar concorrência com cuidado: a carga deve respeitar sessão, permissões e empresa ativa. Não é aceitável fazer um teste público sem autenticação e chamar isso de escalabilidade.

#### Scope-in

- Criar script Node para carga leve com 25 sessões de teste da mesma empresa.
- Medir baseline, percentil 95 concorrente, taxa de erro e limite de degradação.
- Testar endpoints de leitura seguros e um fluxo de criação controlado quando houver dados de teste.
- Documentar limite de ambiente local.
- Preservar multiempresa e cookies HttpOnly.

#### Scope-out

- Criar cluster, balanceador, filas externas ou Redis obrigatório.
- Garantir capacidade de produção real.
- Ignorar autenticação para facilitar carga.
- Usar dados de outra empresa.
- Alterar regras de negócio para reduzir tempo.

#### Estado antes e depois

- Antes: MF6-01 mede inserção individual; não há carga simultânea documentada.
- Depois: existe um script de carga local que prova comportamento mínimo para 25 sessões simuladas e prepara o BK de reconciliação.

#### Pre-requisitos

- Ler `RNF09` em `docs/RNF.md`.
- Rever `BK-MF6-01`.
- Confirmar endpoints autenticados estáveis: `/api/customers`, `/api/suppliers`, `/api/items` ou equivalentes.
- Ter 25 cookies de sessão válidos para utilizadores de teste da mesma empresa.
- Confirmar que o backend resolve empresa ativa sem aceitar identificador arbitrário do frontend.

#### Glossário

- Concorrência: várias operações a decorrer no mesmo intervalo.
- Utilizador simultâneo: sessão distinta que faz pedidos enquanto outras sessões também fazem.
- Taxa de erro: percentagem de pedidos que falham.
- Percentil 95: valor abaixo do qual ficam 95% das medições.
- Degradação relevante: aumento de latência ou erro que impede uso normal.
- Sessão válida: autenticação guardada em cookie HttpOnly.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF09` define pelo menos 25 utilizadores simultâneos por empresa.
- `DERIVADO`: num ambiente PAP, o teste é uma aproximação local e deve declarar limitações.
- `DERIVADO`: endpoints de leitura são mais seguros para carga inicial, porque reduzem risco de criar dados duplicados.
- `DERIVADO`: neste BK, degradação relevante significa `0` falhas e percentil 95 concorrente até ao maior valor entre 2000 ms e duas vezes o baseline local.

Concorrência não é só velocidade. Se a API ficar rápida por remover autorização, o resultado é inseguro. O teste precisa de provar que os pedidos continuam autenticados, filtrados por empresa e com erros controlados.

#### Arquitetura do BK

- Endpoint(s): endpoints autenticados existentes de leitura e criação controlada quando houver dados de teste.
- Modelo/schema Prisma: sem alteração.
- Service(s): sem alteração obrigatória.
- Controller/route: sem alteração obrigatória.
- Guard/middleware: autenticação e empresa ativa já existentes.
- Cliente API: não usado diretamente; o script faz pedidos HTTP.
- Testes: script `check-mf6-concurrency.mjs`.
- Handoff para o próximo BK: base de medição para reconciliação em 3 segundos.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/scripts/check-mf6-concurrency.mjs`
- EDITAR: `apps/api/package.json`
- REVER: `apps/api/src/server.js`
- REVER: `apps/api/src/modules/auth/sessionCookie.js`
- REVER: `apps/api/src/modules/companies/companyContext.js`

#### Tutorial técnico linear

### Passo 1 - Escolher superfícies seguras de carga

1. Objetivo funcional do passo no contexto da app.

Definir que endpoints representam uso real sem provocar dados incoerentes.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/server.js`
    - REVER: módulos de clientes, fornecedores e artigos.
    - LOCALIZAÇÃO: rotas autenticadas.

3. Instruções do que fazer.

Escolhe duas leituras e uma criação controlada apenas se houver base de teste preparada.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É uma decisão de escopo para evitar carga destrutiva.

5. Explicação do código.

O teste de carga não deve criar faturas reais em massa sem cleanup. Para alunos, leituras autenticadas já ensinam concorrência sem poluir contabilidade.

6. Validação do passo.

Lista final de endpoints com método HTTP e objetivo.

7. Cenário negativo/erro esperado.

Se o endpoint escolhido não exigir sessão, ele não prova o `RNF09` da aplicação real.

### Passo 2 - Criar executor de carga local

1. Objetivo funcional do passo no contexto da app.

Simular 25 sessões de utilizadores com pedidos concorrentes.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/check-mf6-concurrency.mjs`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria um script parametrizado por URL base e lista JSON de cookies de sessão.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Smoke de concorrência local para o BK-MF6-02.
 */

const BASE_URL = process.env.OPSA_API_BASE_URL ?? "http://127.0.0.1:3000";
const REQUIRED_USERS = 25;
const MAX_LOCAL_P95_MS = 2000;
const MAX_DEGRADATION_RATIO = 2;
const TARGET_PATHS = (process.env.OPSA_CONCURRENCY_PATHS ?? "/api/customers,/api/items")
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean);

/**
 * Lê uma lista JSON de cookies de sessão.
 *
 * @returns {string[]} Cookies de sessão prontos a enviar no cabeçalho HTTP.
 */
function readSessionCookies() {
    const raw = process.env.OPSA_SESSION_COOKIES_JSON ?? "[]";
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
        throw new Error("OPSA_SESSION_COOKIES_JSON deve ser um array JSON.");
    }

    const cookies = parsed.map((cookie) => String(cookie).trim()).filter(Boolean);
    if (cookies.length < REQUIRED_USERS) {
        throw new Error(`São necessárias ${REQUIRED_USERS} sessões de teste válidas.`);
    }

    return cookies.slice(0, REQUIRED_USERS);
}

/**
 * Calcula percentil 95 de uma lista de durações.
 *
 * @param {number[]} durations - Durações em milissegundos.
 * @returns {number} Percentil 95.
 */
function percentile95(durations) {
    const sorted = [...durations].sort((a, b) => a - b);
    return sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)] ?? 0;
}

/**
 * Executa um pedido autenticado e devolve a duração observada.
 *
 * @param {{ cookie: string, index: number, path: string }} input - Pedido de carga.
 * @returns {Promise<{ index: number, ok: boolean, status: number, durationMs: number }>}
 */
async function runRequest({ cookie, index, path }) {
    const startedAt = performance.now();
    const response = await fetch(`${BASE_URL}${path}`, {
        headers: {
            cookie,
            "x-opsa-load-user": String(index),
        },
    });

    // Cada cookie representa uma sessão real; a empresa ativa continua resolvida no backend.
    return {
        index,
        ok: response.ok,
        status: response.status,
        durationMs: Math.round(performance.now() - startedAt),
    };
}

/**
 * Resume um conjunto de respostas de carga.
 *
 * @param {Array<{ ok: boolean, durationMs: number }>} results - Resultados medidos.
 * @returns {{ failures: number, p95: number }}
 */
function summarize(results) {
    return {
        failures: results.filter((result) => !result.ok).length,
        p95: percentile95(results.map((result) => result.durationMs)),
    };
}

/**
 * Mede uma superfície com baseline sequencial e carga concorrente.
 *
 * @param {string} path - Endpoint autenticado a medir.
 * @param {string[]} cookies - Sessões de teste.
 * @returns {Promise<void>}
 */
async function measurePath(path, cookies) {
    const baselineResults = [];
    for (const [index, cookie] of cookies.slice(0, 5).entries()) {
        // O baseline pequeno ajuda a separar lentidão normal de degradação sob concorrência.
        baselineResults.push(await runRequest({ cookie, index: index + 1, path }));
    }

    const concurrentResults = await Promise.all(
        cookies.map((cookie, index) => runRequest({ cookie, index: index + 1, path })),
    );

    const baseline = summarize(baselineResults);
    const concurrent = summarize(concurrentResults);
    const allowedP95 = Math.max(
        MAX_LOCAL_P95_MS,
        baseline.p95 * MAX_DEGRADATION_RATIO,
    );

    console.info({
        event: "mf6_concurrency_smoke",
        path,
        users: cookies.length,
        baselineP95: baseline.p95,
        concurrentP95: concurrent.p95,
        allowedP95,
        failures: concurrent.failures,
    });

    if (baseline.failures > 0 || concurrent.failures > 0) {
        throw new Error(`Falhas HTTP detetadas em ${path}.`);
    }
    if (concurrent.p95 > allowedP95) {
        throw new Error(`Degradação relevante em ${path}: p95=${concurrent.p95}ms.`);
    }
}

const sessionCookies = readSessionCookies();
for (const path of TARGET_PATHS) {
    await measurePath(path, sessionCookies);
}
```

5. Explicação do código.

O script usa `fetch` nativo e não adiciona dependências. A variável `OPSA_SESSION_COOKIES_JSON` obriga a fornecer 25 cookies de sessão, em vez de repetir a mesma sessão 25 vezes. O baseline sequencial cria uma referência local e a vaga concorrente mede se o percentil 95 degrada de forma relevante. O backend continua responsável por autenticação, permissões e empresa ativa.

6. Validação do passo.

Injeta `OPSA_SESSION_COOKIES_JSON` por um canal seguro no processo (sem escrever o valor no comando, evidence ou shell history) e executa `cd apps/api && node scripts/check-mf6-concurrency.mjs`. A variável deve conter 25 cookies reais exclusivamente do ambiente remoto de teste.

7. Cenário negativo/erro esperado.

Com menos de 25 cookies válidos, o script deve falhar antes de correr carga.

### Passo 3 - Expor script no package

1. Objetivo funcional do passo no contexto da app.

Dar um comando claro ao aluno.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: objeto `scripts`.

3. Instruções do que fazer.

Adiciona `"test:mf6:concurrency": "node scripts/check-mf6-concurrency.mjs"`.

4. Código completo, correto e integrado com a app final.

```json
{
  "scripts": {
    "test:mf6:concurrency": "node scripts/check-mf6-concurrency.mjs"
  }
}
```

5. Explicação do código.

O excerto mostra a entrada a acrescentar, preservando scripts existentes. O comando é explícito e fica fácil de citar em evidence.

6. Validação do passo.

Executa `cd apps/api && npm run test:mf6:concurrency`.

7. Cenário negativo/erro esperado.

Se o aluno substituir o objeto `scripts` inteiro, pode apagar testes anteriores.

### Passo 4 - Definir limite de degradação

1. Objetivo funcional do passo no contexto da app.

Transformar "sem degradação relevante" em critério mensurável.

2. Ficheiros envolvidos:
    - REVER: output do script.
    - LOCALIZAÇÃO: relatório/evidence.

3. Instruções do que fazer.

Usa `0` falhas como obrigatório. O `concurrentP95` deve ficar abaixo ou igual a `allowedP95`, que é o maior valor entre 2000 ms e duas vezes o baseline local.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A medição já está no script.

5. Explicação do código.

Percentil 95 é mais útil do que média porque mostra a experiência dos pedidos mais lentos sem depender de um caso isolado.

6. Validação do passo.

O output deve mostrar `users: 25`, `failures: 0`, `baselineP95`, `concurrentP95` e `allowedP95`.

7. Cenário negativo/erro esperado.

Se houver falhas, o BK fica parcial até identificar se a causa é sessão, servidor, dados ou ambiente.

### Passo 5 - Repetir com outra superfície

1. Objetivo funcional do passo no contexto da app.

Evitar validar só um endpoint simples.

2. Ficheiros envolvidos:
    - REVER: endpoints escolhidos.
    - LOCALIZAÇÃO: variável `OPSA_CONCURRENCY_PATH`.

3. Instruções do que fazer.

Executa o mesmo script para outro caminho autenticado.

4. Código completo, correto e integrado com a app final.

```bash
OPSA_CONCURRENCY_PATHS="/api/items,/api/suppliers" npm run test:mf6:concurrency
```

5. Explicação do código.

O mesmo executor passa a medir outras superfícies sem duplicar lógica. Isto ajuda a perceber se o problema é global ou localizado.

6. Validação do passo.

Cada endpoint deve devolver `failures: 0` e `concurrentP95 <= allowedP95`.

7. Cenário negativo/erro esperado.

Se um endpoint devolver `403`, a sessão não tem permissões para essa superfície.

### Passo 6 - Documentar riscos e handoff

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com evidence honesta.

2. Ficheiros envolvidos:
    - REVER: output dos comandos.
    - LOCALIZAÇÃO: PR ou relatório.

3. Instruções do que fazer.

Regista URLs, número de sessões, falhas, baseline, percentil 95 concorrente, limite aceite e limites do ambiente.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É validação e comunicação.

5. Explicação do código.

O aluno deve distinguir "passou no meu ambiente local" de "está dimensionado para produção". A PAP precisa da primeira prova, não de promessas de infraestrutura.

6. Validação do passo.

Evidence inclui pelo menos dois endpoints autenticados e 25 sessões de teste.

7. Cenário negativo/erro esperado.

Se houver menos de 25 sessões, o BK não cumpre o requisito; fica apenas como smoke parcial.

#### Critérios de aceite

- O script executa 25 pedidos concorrentes com 25 cookies de sessão.
- A taxa de erro é `0`.
- O output regista `baselineP95`, `concurrentP95` e `allowedP95`.
- O `concurrentP95` fica abaixo ou igual a `allowedP95`.
- A empresa ativa continua resolvida no backend.
- Negativos: mínimo `2`: menos de 25 cookies e endpoint sem permissão.

#### Validação final

- `cd apps/api && node --check scripts/check-mf6-concurrency.mjs`
- `cd apps/api && npm run test:mf6:concurrency`
- Repetir com `OPSA_CONCURRENCY_PATHS` diferente.
- Registar limitações do ambiente local.

#### Evidence para PR/defesa

- `pr`: link ou identificador do PR.
- `proof`: output com 25 sessões, `failures: 0`, `baselineP95`, `concurrentP95` e `allowedP95`.
- `neg`: menos de 25 cookies e rota sem permissão.
- `fonte`: `RNF09`.
- `multiempresa`: todas as sessões usadas pertencem à mesma empresa de teste.

#### Handoff

- Entrega um executor de carga local parametrizável para 25 sessões distintas.
- O próximo BK usa a mesma disciplina para medir reconciliação em até 3 segundos.
- Proximo BK recomendado: `BK-MF6-03`

#### Changelog

- `2026-06-22`: guia revisto com carga local, critérios mensuráveis, negativos e evidence para escalabilidade educativa.
