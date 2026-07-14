# Simplificação do arranque local e configuração da OPSA

**Data:** 2026-07-12

**Sistema:** `arranque-local-configuracao`

**Implementação:** `real_dev/api` e `real_dev/web`

**Modo:** `implementar_simplificacao`

**Decisão:** `SIMPLIFICADO_COM_RISCOS`

## Resumo executivo

O percurso de demonstração local foi reduzido a dois serviços de infraestrutura
obrigatórios: PostgreSQL, como sistema de registo, e Redis, necessário para rate
limiting e quotas do chat de IA. O chat permanece ativo e funcional em modo
determinístico (`AI_CHAT_ENABLED=true`, `AI_PROVIDER_MODE=disabled`), sem chamar
OpenAI. Storage usa o adapter privado local já existente; S3, SMTP, backups e
workers não são contactados pelo arranque normal.

O exemplo de ambiente deixou de ativar S3 fictício, bases remotas de teste e
configuração OpenAI. O arranque passou a verificar PostgreSQL antes de abrir o
listener e classifica falhas de configuração, PostgreSQL, Redis, storage e porta
com mensagens acionáveis que nunca copiam valores do erro original.

O caminho production-like mantém-se fail-closed. Não foram alterados endpoints,
payloads, domínio, autenticação, autorização, multiempresa, schema/migrations,
ordem de middleware, frontend ou proxy Vite. Não foram adicionadas dependências
nem realizados commits.

A decisão não é `SIMPLIFICADO_OK` apenas porque este checkout não contém
`real_dev/api/.env` nem disponibilizou credenciais/serviços locais para executar
migrations, seed e um arranque HTTP completo contra PostgreSQL e Redis reais.
Esses passos foram cobertos por configuração, doubles e regressão, mas a prova
operacional real permanece pendente.

## Estado antes e depois

| Área | Antes | Depois |
| --- | --- | --- |
| Exemplo local | Misturava demo, bases remotas `.invalid`, IA, SMTP, S3 e backup; S3 fictício estava ativo | `.env.example` é development-only, mantém chat determinístico, não seleciona OpenAI/S3 e remete testes para `.env.test.example` |
| Dependências antes do listener | Redis e health de storage; PostgreSQL não era ligado explicitamente | PostgreSQL, Redis e storage são verificados por fases antes do listener |
| Chat de IA | Ativo no exemplo, provider externo desligado, mas misturado com muita configuração adicional | Continua ativo e funcional em modo determinístico; Redis e chave AES-256 continuam obrigatórios |
| Storage | As variáveis S3 ativas impediam o fallback local e tentavam um endpoint fictício | Ausência total de `S3_*` seleciona `LocalObjectStorage` em development |
| Erro de arranque | Apenas `START_FAILED`/código do provider, sem causa operacional útil | Evento seguro com `CONFIGURATION_INVALID`, `POSTGRESQL_UNAVAILABLE`, `REDIS_UNAVAILABLE`, `STORAGE_UNAVAILABLE` ou `LISTENER_UNAVAILABLE` |
| Preparação | Não existia guia curto próprio de `real_dev` nem preflight dedicado | `real_dev/README.md`, `config:check`, `db:migrate:deploy` e comandos separados para API/web |
| Production-like | Fail-closed para parte das variáveis, mas aceitava chaves demonstrativas copiadas | Mantém requisitos anteriores e rejeita marcadores/chaves demonstrativas de baixa entropia |

## Desenho adotado

Não foi criado `OPSA_RUNTIME_PROFILE`. O mecanismo existente é suficiente:

- `NODE_ENV=development`: demonstração académica local;
- `NODE_ENV=test`: testes com dependências explícitas/doubles;
- `NODE_ENV=production`: percurso production-like fail-closed.

Isto evita uma segunda fonte de verdade e preserva imports e consumidores atuais.
`loadApiEnv(...)` continua reutilizável por workers e testes; a nova
`assertApiStartupEnv(...)` contém apenas os requisitos necessários para abrir a
API, nomeadamente PostgreSQL e chave da outbox.

## Mapa de variáveis por perfil

### Obrigatórias para a demonstração

| Variável | Papel | Estado/default |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL da aplicação | obrigatória para abrir a API; protocolo e host/base validados |
| `REDIS_URL` | auth rate limit e quotas/chat | default local `redis://127.0.0.1:6379`; serviço tem de responder |
| `EMAIL_OUTBOX_ENCRYPTION_KEY` | cifragem da outbox | obrigatória no arranque; exemplo contém chave apenas de demo |
| `AI_CHAT_ENABLED` | ativa o chat nuclear | `true` no exemplo de demo |
| `AI_CHAT_ENCRYPTION_KEY` | cifra sessões/histórico | obrigatória quando o chat está ativo e distinta da outbox |

### Defaults locais seguros

| Variável | Default/valor de demo | Observação |
| --- | --- | --- |
| `NODE_ENV` | `development` | valor fora de `development/test/production` é rejeitado |
| `PORT` | `3000` | inteiro estrito entre 1 e 65535 |
| `APP_BASE_URL` | `http://localhost:5173` | sem credenciais no URL |
| `REDIS_KEY_PREFIX` | `opsa:development` | produção exige valor explícito |
| `RATE_LIMIT_HMAC_KEY` | chave marcada development-only | bloqueada em produção |
| `OPSA_PRIVATE_STORAGE_ROOT` | `./private-storage` no exemplo | privado, sem `express.static` |
| `AI_PROVIDER_MODE` | `disabled` | mantém resposta determinística funcional |
| `AI_SAFETY_HMAC_KEY` | chave development-only | produção deve usar segredo próprio |
| `SMTP_HOST`/`SMTP_PORT` | `127.0.0.1:1025` | não há ligação no arranque da API |

### Opcionais por funcionalidade

- OpenAI: `AI_PROVIDER_MODE=openai`, `OPENAI_API_KEY`, `OPENAI_MODEL` e tuning
  `OPENAI_*`; só é chamada após opt-in/consentimento já existentes.
- S3: conjunto completo `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, credenciais,
  `S3_FORCE_PATH_STYLE` e `S3_SSE`; qualquer configuração parcial falha.
- SMTP autenticado: `SMTP_USER` e `SMTP_PASSWORD` sempre em conjunto; o worker
  separado continua responsável pela ligação.
- Workers: intervalos `NOTIFICATION_WORKER_*` e `AI_WORKER_*` continuam com os
  defaults e gates existentes.
- SAF-T, backup e restore: permanecem nos comandos próprios, fora do bootstrap
  normal e sem alteração de contratos.

### Obrigatórias apenas em production-like

- `APP_BASE_URL` HTTPS;
- `DATABASE_URL` e `REDIS_URL` explícitas;
- `REDIS_KEY_PREFIX` e `RATE_LIMIT_HMAC_KEY` próprios;
- `EMAIL_OUTBOX_ENCRYPTION_KEY` própria;
- `AI_CHAT_ENABLED` explicitamente declarado e chave própria quando ativo;
- `SMTP_HOST`, `EMAIL_FROM` e TLS (`SMTP_SECURE` ou `SMTP_REQUIRE_TLS`);
- configuração S3 completa com SSE, validada pelo adapter existente.

### Testes, gates e operação separada

`TEST_DATABASE_URL`, `RESTORE_DATABASE_URL`, `OPSA_SKIP_PERSISTENCE_TESTS`,
cookies de smoke, buckets de backup e credenciais de sandbox permanecem em
`.env.test.example` ou nos comandos operacionais. Foram removidos do exemplo de
demo para não sugerirem endpoints remotos ativos.

### Duplicação/obsolescência removida

- bloco `SAFT_EXPORT_ENABLED` duplicado;
- URLs `.invalid` de teste no exemplo local;
- S3/backup fictício ativo;
- placeholders OpenAI com aparência de configuração ativa;
- tuning de IA que já possui defaults e não é necessário para arrancar a demo.

## Ordem real do arranque

### Antes

1. carregar `.env`;
2. validar configuração;
3. exigir chave da outbox em `server.js`;
4. criar Prisma, Redis e storage;
5. ligar Redis;
6. verificar storage;
7. compor Express;
8. abrir listener.

### Depois

1. carregar `.env` apenas no processo real, não quando `env` é injetado;
2. validar tipos/URLs e requisitos do arranque;
3. criar recursos sem abrir sockets no import;
4. ligar explicitamente PostgreSQL;
5. ligar Redis;
6. verificar storage local/S3;
7. construir rate limiter, outbox e Express na ordem existente;
8. abrir listener;
9. em falha, fechar apenas os recursos abertos e devolver evento seguro por fase.

## Pontos de falha removidos ou preservados

### Removidos

- tentativa inevitável de contactar `https://s3.example.invalid` ao copiar o
  exemplo;
- bases de teste remotas aparentando fazer parte da demo;
- erro final genérico sem indicar PostgreSQL, Redis, storage, configuração ou
  porta;
- possibilidade de abrir o listener sem provar a ligação PostgreSQL;
- aceitação production-like de chaves demonstrativas óbvias.

### Preservados intencionalmente

- PostgreSQL e Redis continuam a falhar o arranque quando indisponíveis;
- configuração S3 parcial continua rejeitada, sem fallback silencioso;
- chat ativo continua a exigir cifra e Redis operacional;
- OpenAI continua a exigir chave/modelo e não é ativada por omissão;
- SMTP production-like continua a exigir TLS;
- storage local continua proibido fora de development.

## Contratos mantidos

- importar `server.js` não abre listener nem liga recursos;
- `createApp(...)` mantém assinatura, rotas, middleware e injeção de doubles;
- `startServer(...)` continua a devolver `app`, servidor e recursos;
- `stop()` foi exercitado duas vezes e fechou HTTP, Redis e Prisma uma única vez;
- `SIGINT` e `SIGTERM` continuam a usar o mesmo `stop()`;
- auth, cookies, permissões e `companyId` não foram alterados;
- Prisma schema, migrations e seed não foram alterados;
- frontend continua a usar `/api` e o proxy `127.0.0.1:3000`;
- scripts `dev` e `db:seed:demo` mantêm os comandos anteriores;
- production-like continua sem fallback local silencioso.

## Ficheiros alterados

- `real_dev/api/src/config/env.js`;
- `real_dev/api/src/server.js`;
- `real_dev/api/.env.example`;
- `real_dev/api/package.json`;
- `real_dev/api/scripts/check-local-config.mjs`;
- `real_dev/api/tests/unit/local-startup-config.test.js`;
- `real_dev/README.md`;
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`;
- este relatório.

Não foram alterados `envFile.js`, `runtimeDependencies.js`, Vite, web package,
schema Prisma, migrations, endpoints, UI, `apps/`, `mockup/` ou guias BK.

## Testes e comandos

| Comando | Exit | Resultado |
| --- | ---: | --- |
| `node --test tests/unit/local-startup-config.test.js` em `real_dev/api` | 0 | 9/9; demo, production-like, valores inválidos, provider local, import, erro seguro, stop idempotente e scripts/proxy |
| `node --env-file=.env.example scripts/check-local-config.mjs` | 0 | perfil `demo_academica_local`, PostgreSQL/Redis configurados, storage `LOCAL`, chat `enabled`, provider `disabled` |
| `npm run test:mf6:env` em `real_dev/api` | 0 | `MF6 environment contract OK` |
| `npm run syntax:check` em `real_dev/api` | 0 | sintaxe de `src`, `tests` e `scripts` válida |
| `npm run test:unit` em `real_dev/api`, fora do sandbox | 0 | 341/341, zero falhas/skips |
| `npm run test:contracts` em `real_dev/api` | 0 | 173/173, zero falhas/skips |
| `DATABASE_URL=<URL_LOCAL_SINTÁTICA> npm run prisma:validate` | 0 | schema Prisma válido; sem ligação à base |
| `npm run typecheck` em `real_dev/web` | 0 | TypeScript sem erros |
| `npm run build` em `real_dev/web` | 0 | Vite build; 75 módulos transformados |
| arranque com `DATABASE_URL` local controladamente indisponível | 1 esperado | evento `POSTGRESQL_UNAVAILABLE`; mensagem acionável; nenhum valor sensível impresso |
| `git diff --check` | 0 | sem whitespace errors nos ficheiros versionados |

A primeira execução unitária dentro do sandbox falhou apenas nos testes
Supertest multipart com `listen EPERM`. A repetição autorizada fora do sandbox
passou 341/341; não foi feita uma alteração de produto para mascarar a limitação.

## Validações bloqueadas/não executadas

- Não existe `real_dev/api/.env` neste checkout.
- Não foram fornecidas credenciais PostgreSQL/Redis locais de demonstração.
- Por isso, não foram executados `db:migrate:deploy`, `db:seed:demo`, arranque
  HTTP real, `GET /api/health/ready` real, login e pergunta real no chat.
- O smoke positivo de bootstrap foi executado com doubles e provou ordem,
  listener injetável e shutdown; não substitui a prova operacional acima.
- Nenhuma chamada live à OpenAI, S3 ou SMTP foi feita, por desenho.

## Riscos residuais

1. **Prova operacional pendente:** migrations, seed, readiness e chat contra
   PostgreSQL/Redis reais devem ser executados na máquina de demonstração.
2. **Chaves de demo:** estão explicitamente marcadas e tecnicamente bloqueadas
   em produção, mas devem continuar fora de qualquer deployment real.
3. **Redis continua obrigatório:** é uma decisão funcional e de segurança porque
   o chat está ativo; a simplificação não tenta substituí-lo por quotas in-memory.
4. **Node toolchain:** a máquina final deve cumprir `>=24.17 <25`, conforme o
   contrato existente.

## Follow-ups fora de scope

- preparar PostgreSQL e Redis locais na máquina de apresentação e guardar o
  `.env` apenas localmente;
- executar migrations, seed, API/web, readiness, login e uma pergunta suportada
  pelo chat determinístico;
- se a equipa quiser OpenAI na apresentação, configurar segredo/modelo e validar
  separadamente opt-in da empresa, consentimento e política, sem alterar o
  percurso determinístico base;
- não é necessária sincronização dos 93 guias BK nem dos relatórios históricos.

## Decisão

`SIMPLIFICADO_COM_RISCOS`

A simplificação de código, configuração e documentação está implementada e com
regressão limpa. O único risco que impede `SIMPLIFICADO_OK` é operacional: falta
provar a sequência completa numa instalação com PostgreSQL e Redis reais.
