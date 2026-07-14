# BK-MF8-02 - Endpoints de liveness e readiness

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
- `last_updated`: `2026-07-13`

## Objetivo

Separar “o processo está vivo” de “a instância está pronta para receber tráfego”. Readiness deve falhar com HTTP `503` quando PostgreSQL, Redis ou storage crítico não estão disponíveis.

## Contrato público

| Endpoint | Finalidade | Dependências | Estado positivo |
|---|---|---|---|
| `GET /api/health/live` | processo/event loop responde | nenhuma externa | `200` |
| `GET /api/health/ready` | instância aceita tráfego | PostgreSQL, Redis e storage crítico | `200` ou `503` |
| `GET /api/health` | alias compatível de readiness | igual a readiness | `200` ou `503` |

As rotas são públicas, mas devolvem apenas estado agregado, versão segura e request ID. Não expõem hosts, buckets, nomes de bases, stack traces, credenciais nem latências internas detalhadas.

## Ficheiros públicos do aluno

- `apps/api/src/modules/ops/healthRoutes.js`
- `apps/api/src/modules/ops/readinessService.js`
- `apps/api/src/app.js`
- `apps/api/src/server.js`
- `apps/api/tests/contracts/mf8-health.contract.test.js`
- `apps/api/tests/integration/health-readiness.integration.test.js`

## Conceitos essenciais

- **Liveness** não consulta serviços externos; caso contrário uma falha remota força reinícios inúteis.
- **Readiness** consulta dependências críticas com timeout curto e execução concorrente controlada.
- Readiness normal usa apenas `SELECT 1`, `PING` e um probe read-only do storage; não escreve em tabelas, chaves Redis ou objetos.
- Provas CRUD e respetivo cleanup pertencem ao comando explícito `npm run health:deep-check`, não ao endpoint monitorizado.
- O alias `/api/health` tem exatamente a semântica de readiness, não um payload estático.
- `createApp(...)` monta rotas sem abrir portas. `startServer()` é o único responsável pelo listener e shutdown.
- Um timeout/falha é estado `not_ready`, não exceção com detalhes enviada ao cliente.

## Tutorial técnico linear

### Passo 1 - Separar app e listener

`apps/api/src/app.js` exporta `createApp(dependencies)`. Os testes importam esta função e injetam probes controlados. `apps/api/src/server.js` cria dependências reais, chama `startServer()` e instala sinais de shutdown.

Não executes `listen()` durante o import do módulo.

### Passo 2 - Implementar probes

```js
export async function checkReadiness({ prisma, redis, storage, timeoutMs = 1_500 }) {
  const checks = await Promise.allSettled([
    withTimeout(prisma.$queryRaw`SELECT 1`, timeoutMs),
    withTimeout(redis.ping(), timeoutMs),
    withTimeout(storage.checkReady(), timeoutMs),
  ]);

  return {
    ready: checks.every((check) => check.status === "fulfilled"),
  };
}
```

O payload externo pode indicar `status: "ready"` ou `status: "not_ready"`; os detalhes técnicos completos ficam apenas no log redigido. Não registes respostas que possam conter secrets.

### Passo 3 - Montar as três rotas

```js
router.get("/live", (_req, res) => {
  res.status(200).json({ status: "alive" });
});

async function readinessHandler(req, res) {
  const result = await checkReadiness(req.app.locals.dependencies);
  res.status(result.ready ? 200 : 503).json({
    status: result.ready ? "ready" : "not_ready",
    requestId: req.id,
  });
}

router.get("/ready", readinessHandler);
router.get("/", readinessHandler);
```

Monta o router em `/api/health` antes de routers autenticados, mas depois do middleware de request ID e logging.

### Passo 4 - Integrar observabilidade

Cada pedido recebe/gera um request ID válido. O middleware comum emite um único evento terminal por pedido, com duração, método, status, outcome e route template. Não é necessário um evento de início sem consumidor operacional demonstrado.

Nunca confies em IDs ou IP forwarded sem a configuração explícita `TRUST_PROXY_HOPS`.

### Passo 5 - Testar comportamento

Testes mínimos:

- live devolve `200` mesmo com todas as dependências em falha;
- ready e alias devolvem `200` quando todos os probes passam;
- falha isolada de PostgreSQL, Redis e storage devolve `503`;
- timeout de cada probe devolve `503` dentro do budget;
- readiness normal não chama transações de permissões, `SET/GET/DEL` nem `PUT/GET/DELETE`;
- `npm run health:deep-check` mantém as provas mutáveis e confirma cleanup;
- payload não contém URL, host, bucket, stack ou erro bruto;
- request ID está presente e é redigido/validado;
- importar `createApp` não abre listener;
- erro inesperado não transforma readiness em falso positivo.

Na demonstração local, prepara primeiro PostgreSQL sem instalar o servidor no
host:

```bash
npm --prefix apps/api run db:local:check
npm --prefix apps/api run db:local:start
npm --prefix apps/api run db:local:status
```

O serviço `postgres` é exposto apenas em `127.0.0.1:5433`. Uma falha do
container deve tornar readiness `not_ready`; não alteres liveness nem escondas
a falha com um fallback de base de dados.

### Passo 6 - Testar shutdown

Durante shutdown, readiness passa a `503` antes de parar de aceitar ligações. O servidor drena pedidos ativos dentro do prazo, fecha workers, termina Redis/SMTP quando aplicável e chama `prisma.$disconnect()`.

## Validação final

```bash
cd apps/api
node --test tests/contracts/mf8-health.contract.test.js
npm run health:deep-check
npm run test:contracts
npm run test:integration
npm run test:integration:postgres-local
```

Os resultados esperados são contagens observadas no momento da execução; não copies contagens históricas. Falhas por ausência de serviços são blockers ambientais, não PASS.

## Critérios de aceite

- Liveness e readiness têm semânticas distintas.
- Readiness e o alias devolvem `503` perante cada dependência crítica indisponível.
- App e listener estão separados.
- Payload e logs não expõem configuração sensível.
- Request ID e exatamente um log terminal por pedido estão integrados.
- Shutdown retira readiness e drena recursos.

## Evidence para PR/defesa

- tabela endpoint/dependência/status observado;
- negativos de PostgreSQL, Redis, storage e timeout;
- prova de import sem listener;
- prova de shutdown;
- comando, diretório, exit code e contagem fresca dos testes focados.

## Importância

Um payload estático pode ficar verde enquanto as dependências estão indisponíveis. Readiness protege tráfego; liveness protege o processo de reinícios indevidos.

## Scope-in

- Live, ready, alias, probes, request ID e comportamento durante shutdown.

## Scope-out

- Exposição de detalhes internos ou uso de liveness para testar serviços remotos.

## Estado antes e depois

- Antes: um único check sem distinção operacional suficiente.
- Depois: três contratos com `503` fail-closed e testes de dependência.

## Pre-requisitos

- `BK-MF8-01`, `createApp/startServer` e adapters de Redis/storage testáveis.

## Glossário

- **Liveness:** capacidade do processo responder.
- **Readiness:** capacidade da instância servir tráfego útil.
- **Probe:** verificação pequena com timeout.

## Conceitos teóricos essenciais

Readiness agrega dependências críticas; liveness evita dependências externas; timeout impede o próprio health de bloquear.

## Arquitetura do BK

Request ID/log middleware → health router → readiness service → probes injetados → resposta agregada.

## Ficheiros a criar/editar/rever

Revê `apps/api/src/app.js`, `server.js`, módulo ops e testes contratuais/integrados.

## Cenários negativos mínimos

Executa pelo menos 2 cenários negativos: Redis indisponível e probe em timeout; cobre também PostgreSQL/storage e payload redigido.

## Handoff

Entrega a `BK-MF8-03` uma API cuja prontidão é verificável antes de testar subscrições simuladas.

## Changelog

- `2026-07-13`: acrescentado o percurso PostgreSQL Docker Compose local e o
  teste de integração persistida, mantendo readiness read-only.
- `2026-07-10`: health dividido em live/ready, alias de readiness, dependências reais e shutdown.
