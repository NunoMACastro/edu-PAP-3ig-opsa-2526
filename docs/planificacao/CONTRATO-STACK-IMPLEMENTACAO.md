# CONTRATO-STACK-IMPLEMENTACAO

## Header

- `doc_id`: `CONTRATO-STACK-IMPLEMENTACAO`
- `path`: `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-07-13`

## Objetivo e âmbito

Fixar a stack ensinada pelos guias e impedir drift com a implementação privada de referência. Existe scaffold funcional em `real_dev`; os alunos continuam, contudo, a implementar exclusivamente em `apps/api` e `apps/web`.

Este documento não altera RF/RNF nem demonstra readiness. O estado de `real_dev` pertence ao [relatório canónico](auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md), e as interfaces concretas pertencem ao [`CONTRATO-INTERFACES-IMPLEMENTACAO.md`](CONTRATO-INTERFACES-IMPLEMENTACAO.md).

## Toolchain obrigatório

- Node.js `>=24.17 <25`.
- npm `>=11 <12`.
- JavaScript moderno com ES Modules na API.
- TypeScript no frontend.
- Lockfiles instalados por `npm ci`; qualquer alteração de dependências exige justificação e regeneração controlada do respetivo lockfile.

Uma máquina fora deste intervalo não pode produzir evidence de release final. O gate deve falhar explicitamente; não se altera o contrato para coincidir com uma instalação local mais antiga.

## Backend e persistência

- Node.js + Express 5, com `createApp(...)` separado de `startServer()` para testes HTTP sem listener externo.
- PostgreSQL como sistema de registo e Prisma 6 para schema, migrations e transações.
- Validação de configuração no arranque, isolamento por empresa e autorização deny-by-default.
- Datas de calendário validadas estritamente como `YYYY-MM-DD`, sem normalização silenciosa de dias impossíveis.
- Claims atómicos com estado esperado e `409 STALE_STATE`; locks transacionais para período fiscal, stock/FIFO e proteção do último `ADMIN`.
- Auditoria e mutação sensível na mesma transação; retenção e revisões contabilísticas persistentes.

### Serviços externos

- Redis através do cliente `redis`: rate limiting distribuído, operações atómicas e chaves derivadas por HMAC, sem email ou IP em claro.
- SMTP através de `nodemailer`: a API grava na `EmailOutbox` cifrada e um worker separado executa lease, retry exponencial e entrega.
- S3 compatível através de `@aws-sdk/client-s3`: anexos, exportações SAF-T e bundles de backup fora da base de dados.
- Multipart streaming através de `busboy`: limite por rota, quarentena, validação de assinatura/MIME/extensão, SHA-256, promoção e cleanup compensatório.
- XML SAF-T com `xmlbuilder2` e conversão Windows-1252 com `iconv-lite`.
- XLSX com `exceljs`, sujeito a limites de ficheiro, workbook, linhas, colunas, células e tempo.
- OpenAI através do SDK oficial `openai`, usado apenas no backend para Responses API, streaming, function calling e Structured Outputs. `AI_PROVIDER_MODE=disabled` mantém o provider opcional e a aplicação determinística funcional.

Os adapters locais/simulados são permitidos apenas em development/test. O
provider de email simulado regista `SIMULATED`, nunca `SENT`, e não conserva o
payload depois do processamento. Em production-like não existe fallback
silencioso quando Redis, SMTP ou S3 estão ausentes.

### Perfis de arranque

- A demonstração académica local reutiliza `NODE_ENV=development`; não existe
  uma segunda framework de perfis. PostgreSQL é obrigatório; Redis, S3 e SMTP
  não são necessários com `REDIS_PROVIDER=local`, `STORAGE_PROVIDER=local` e
  `EMAIL_PROVIDER=simulated`.
- Docker Compose v2 fornece apenas a infraestrutura PostgreSQL local. O projeto
  `opsa-real-dev` separa desenvolvimento (`5433`), integração (`5434`) e restore
  descartável (`5435`), além de um serviço sem porta para as ferramentas
  `pg_dump`, `pg_restore` e `psql`. API, workers e frontend continuam processos
  Node.js separados no host.
- Os alunos controlam este ciclo através dos scripts públicos
  `db:local:check`, `start`, `status`, `logs`, `setup` e `stop`, executados com
  `npm --prefix apps/api run <script>`. `db:local:stop` preserva dados;
  `db:local:reset -- --confirm=opsa_dev` é a operação destrutiva e exige
  confirmação explícita.
- As bases de integração e restore têm comandos `db:test:*` e `db:restore:*`
  próprios. Não partilham o volume da demo e nunca justificam usar produção.
- Na demo, `AI_CHAT_ENABLED=true` e `AI_PROVIDER_MODE=disabled` mantêm o chat
  funcional através das tools read-only internas, sem chamada à OpenAI.
- O rate limiter local mantém HMAC, limites, janelas e reset num único processo;
  quotas/locks distribuídos não são prometidos na demo. Storage local permanece
  privado e o worker da outbox simula email sem rede.
- `NODE_ENV=production` permanece fail-closed: HTTPS, PostgreSQL, Redis, chaves
  não demonstrativas, `REDIS_PROVIDER=redis`, `EMAIL_PROVIDER=smtp` com TLS e
  `STORAGE_PROVIDER=s3` completo com SSE são obrigatórios.
- O percurso operacional e os comandos de migrations, seed, API, web e smoke
  estão em `real_dev/README.md`; os caminhos públicos ensinados continuam os da
  secção **Estrutura pública ensinada**.

## Frontend

- React 19 + Vite 8 + TypeScript.
- React Router como registry único de rotas públicas/protegidas, com deep links, 404, Back/Forward, componentes lazy e requisitos de permissão.
- `AuthProvider` com estados `bootstrapping`, `anonymous`, `authenticated` e `error`, usando `/api/auth/me` e `/api/permissions/me` como fontes de verdade.
- Cliente HTTP central com timeout e `AbortController`; uma mutação nunca é repetida automaticamente.
- Formulários sem UUID/JSON manual quando existe domínio selecionável; dados preservados em `400`, `409` e `500`.
- Acessibilidade AA: skip link, labels, ARIA de erro, foco controlado e diálogos acessíveis.
- Chat de IA em página e drawer partilhados, com parser SSE central, `aria-live`, focus trap, fecho por `Escape` e contexto de página mínimo revalidado no backend.

## Testes e gates

### API

- `node:test` para unitários, contratos e integração persistida.
- Supertest para o contrato HTTP criado por `createApp(...)`.
- PostgreSQL e Redis remotos de teste para persistência e concorrência reais.
- SMTP sandbox e bucket/prefixo S3 exclusivos de teste.

### Web e browser

- Vitest, Testing Library, `jest-dom`, `user-event` e MSW para testes unitários e de integração do frontend.
- Playwright com Chromium incluído para o gate E2E normal e três viewports.
- Chrome, Edge e Firefox instalados no sistema pertencem a
  `test:e2e:compat`, matriz opcional de compatibilidade.
- `@axe-core/playwright` para a11y nas páginas críticas.
- Provider OpenAI fake para testes do schema qualitativo, timeout, cancelamento, quotas, fallback e captura do payload canónico sem pergunta/valores; smoke live é sempre manual e sem dados reais.

Um scanner, typecheck ou build isolado não substitui teste funcional. Um skip ou teste que não chegou a iniciar permanece blocker e nunca equivale a PASS.

## Estrutura pública ensinada

- `apps/api` — API, Prisma, migrations, workers, scripts e testes.
- `apps/web` — frontend, Router, providers, cliente HTTP e testes.
- `apps/api/prisma/schema.prisma` — schema canónico do trabalho dos alunos.
- `apps/web/src/lib/apiClient.ts` — cliente HTTP central sugerido.

Os snippets dos guias não devem mencionar `real_dev`. Durante uma revisão de paridade, o orientador compara o contrato com a referência privada e traduz qualquer correção para os caminhos públicos acima.

## Regras para dependências

Adicionar uma dependência só é aceitável quando a plataforma não cobre o protocolo ou a função de forma segura e sustentável. Redis, SMTP, S3, multipart streaming, XML/encoding, browser automation e o SDK oficial OpenAI justificam as bibliotecas listadas; helpers pequenos, validação de formulários e abstrações sem valor funcional devem permanecer código local.

O SDK OpenAI é a única dependência nova da IA v2. Evita manter manualmente contratos de streaming e tool calling da Responses API; não substitui a chave de API, que continua server-side, nem adiciona autonomia ao provider. JSON Schema e validação de domínio permanecem código local.

Não se adiciona uma biblioteca de formulários: componentes simples, tipados e coerentes com o design existente são suficientes.

## Dependências técnicas bloqueantes entre BK

As dependências canónicas dos BK representam contratos funcionais, não apenas reutilização estrutural. Quando um BK usa diretamente modelo, helper, service, middleware ou endpoint criado por outro BK, essa relação deve constar em `dependencias` na matriz, no backlog, no contrato de campos e no header do guia.

- `BK-MF0-03` fornece autenticação aplicada ao contexto multiempresa e roles de forma transitiva.
- `BK-MF0-08` é dependência dos fluxos que criam, alteram ou contabilizam documentos sujeitos a `assertOpenFiscalPeriod`.
- Reutilizar Express, Prisma, Router, o cliente HTTP ou convenções de testes não cria por si só uma dependência entre BK.

## Limites de adaptação

Uma adaptação de pastas ou nomes não pode alterar RF/RNF, `bk_id`, owner, prioridade, dependências, critérios de aceite, evidence, autorização, endpoints ou modelos do contrato central. Qualquer divergência funcional é drift e deve ser corrigida ou decidida explicitamente pelo orientador.

## Changelog

- `2026-07-13`: PostgreSQL local passou a ter um percurso Docker Compose
  isolado para demo, integração, restore e client tools, controlado pelos
  scripts públicos de `apps/api` sem containerizar a aplicação.
- `2026-07-13`: Redis, S3 e SMTP passaram a adapters selecionados centralmente;
  a demo usa rate limiting local, storage privado local e email `SIMULATED`,
  preservando providers externos fail-closed em production-like.
- `2026-07-12`: separado o arranque da demo local do percurso production-like,
  mantendo chat determinístico ativo, PostgreSQL/Redis obrigatórios e providers
  externos fora do bootstrap normal.
- `2026-07-11`: acrescentados SDK oficial OpenAI opcional, contrato SSE/UI e provider fake da IA v2.
- `2026-07-10`: substituída a assunção de scaffold futuro pelo contrato da referência atual; fixados toolchain, serviços externos, Router/AuthProvider, multipart e toolchain de testes.
- `2026-06-01`: dependências técnicas diretas passam a ser bloqueantes e devem constar em `dependencias`.
- `2026-05-25`: contrato criado para centralizar a stack assumida dos guias MF0 e reduzir drift com a implementação futura.
