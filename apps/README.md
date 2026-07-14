# OPSA `real_dev` — arranque local

Este é o percurso curto para a demonstração académica local. Mantém o chat de
IA ativo em modo determinístico, sem contactar OpenAI, Redis, S3 ou SMTP.
PostgreSQL guarda os dados da aplicação num volume Docker Compose; autenticação
usa rate limiting local num único processo, storage privado local e email
simulado através da outbox. A API, os workers e o frontend continuam a correr
como processos Node.js no host.

## Pré-requisitos

- Node.js e npm nas versões indicadas nos `package.json`;
- Docker Desktop, ou Docker Engine, com Docker Compose v2;
- portas `5433`, `5434` e `5435` livres para as bases de desenvolvimento,
  teste e restore.

## Preparar uma vez

A partir da raiz do repositório:

```bash
npm --prefix real_dev/api ci
npm --prefix real_dev/web ci
npm --prefix real_dev/api run db:local:setup
```

`db:local:setup` cria o `.env` a partir do exemplo apenas quando ainda não
existe, arranca PostgreSQL, gera o cliente Prisma, aplica migrations e executa
e verifica a seed. Se o `.env` já existir, as URLs e o modo Compose têm de
coincidir exatamente com as instâncias locais. As chaves incluídas são
exclusivamente de demo e o backend bloqueia chaves demonstrativas quando
`NODE_ENV=production`.

Valida a configuração sem abrir ligações externas:

```bash
npm --prefix real_dev/api run config:check
```

Depois, o mesmo comando pode ser repetido de forma idempotente:

```bash
npm --prefix real_dev/api run db:local:setup
npm --prefix real_dev/web exec playwright install chromium
```

Não cria Redis, SMTP, S3 nem um segundo stack de aplicação.

O Compose usa o projeto fixo `opsa-real-dev` e quatro serviços isolados:

| Serviço | Porta no host | Finalidade |
|---|---:|---|
| `postgres` | `5433` | desenvolvimento e demo |
| `postgres-test` | `5434` | integração persistida descartável |
| `postgres-restore` | `5435` | restore inequivocamente descartável |
| `postgres-tools` | não exposta | `pg_dump`, `pg_restore` e `psql` sem instalação no host |

## Arrancar a demonstração

Terminal 1 — API:

```bash
npm --prefix real_dev/api run dev
```

Terminal 2 — worker de IA:

```bash
npm --prefix real_dev/api run worker:ai
```

Terminal 3 — worker de email simulado:

```bash
npm --prefix real_dev/api run worker:email
```

Terminal 4 — frontend:

```bash
npm --prefix real_dev/web run dev
```

Abrir `http://127.0.0.1:5173`. O frontend continua a usar `/api`, encaminhado
pelo proxy Vite para `http://127.0.0.1:3000`.

O worker de IA faz as execuções avançarem de `QUEUED`/`RUNNING`; a própria
interface mostra esta dependência enquanto aguarda. O worker de email transforma
as mensagens pendentes em `SIMULATED` para ficarem disponíveis na inbox local.

## Smoke curto

```bash
npm --prefix real_dev/api run db:local:status
curl -fsS http://127.0.0.1:3000/api/health/live
curl -fsS http://127.0.0.1:3000/api/health/ready
```

`live` prova que o processo responde. `ready` valida PostgreSQL e storage local,
e identifica Redis como adapter `local` não distribuído. Para um smoke funcional,
inicia sessão no frontend e abre **IA e trabalho
→ Assistente OPSA**; o modo apresentado deve ser `deterministic` enquanto
`AI_PROVIDER_MODE=disabled`.

Para demonstrar convites e recuperação de password sem SMTP, abre
`http://127.0.0.1:5173/demo/email-inbox` e usa o valor local de
`DEMO_EMAIL_INBOX_ACCESS_KEY`. O código fica apenas em memória no browser. A
inbox mostra somente destinatário, assunto, tipo e ligação de ação; o payload
permanece cifrado e é removido automaticamente após 24 horas.

Em **SAF-T 1.04_01**, a configuração local gera um XML marcado como
`DEMONSTRAÇÃO ACADÉMICA — NÃO CERTIFICADO`. Este modo reutiliza o gerador e a
reconciliação internos, mas não declara validação XSD nem revisão externa. Para
um pipeline real, usa `SAFT_VALIDATION_MODE=external`, configura o XSD oficial
e injeta o validador externo no arranque.

Se não estiveres a executar o worker contínuo, podes processar a fila uma vez:

```bash
npm --prefix real_dev/api run worker:email:drain
```

A linha final indica quantas mensagens foram processadas. Notificações de email
que não sejam convites ou recuperações continuam a eliminar o payload logo após
a simulação.

O E2E normal usa o Chromium incluído no Playwright:

```bash
npm --prefix real_dev/web run test:e2e
```

A matriz com Chrome, Edge e Firefox instalados no sistema é opcional:

```bash
npm --prefix real_dev/web run test:e2e:compat
```

Para inspecionar PostgreSQL sem expor credenciais:

```bash
npm --prefix real_dev/api run db:local:status
npm --prefix real_dev/api run db:local:logs
```

No final, `db:local:stop` para os containers e preserva o volume. O reset é
deliberadamente destrutivo e exige confirmação explícita:

```bash
npm --prefix real_dev/api run db:local:stop
npm --prefix real_dev/api run db:local:reset -- --confirm=opsa_dev
```

## Falhas frequentes

- `DATABASE_URL`: confirma que aponta para `127.0.0.1:5433` e que
  `db:local:status` apresenta `postgres` saudável;
- Docker indisponível: executa `db:local:check` e confirma Docker Compose v2;
- `RATE_LIMIT_UNAVAILABLE`: em production-like, confirma Redis e `REDIS_URL`;
- `STORAGE_UNAVAILABLE`: remove variáveis `S3_*` da demo e confirma permissões
  de escrita em `OPSA_PRIVATE_STORAGE_ROOT`;
- `LISTENER_UNAVAILABLE`: confirma `PORT` e se a porta já está ocupada;
- `AI_CHAT_ENCRYPTION_KEY`: mantém uma chave AES-256 própria e diferente da
  chave da outbox.

## Backup e restore da demonstração

Este percurso é manual: não existe scheduler 24/7 instalado. No modo Compose,
`pg_dump`, `pg_restore` e `psql` são executados pelo serviço `postgres-tools`;
não precisam de estar instalados no host. O modo nativo mantém-se para bases
externas autorizadas. O restore usa sempre a base isolada do serviço
`postgres-restore`, nunca a origem.

```bash
npm --prefix real_dev/api run db:restore:start
npm --prefix real_dev/api run mf7:backup
npm --prefix real_dev/api run mf7:backup:verify -- \
  --manifest ./private-storage/backups/opsa-<timestamp>.dump.json
npm --prefix real_dev/api run mf7:backup:roundtrip
npm --prefix real_dev/api run db:restore:stop
```

O backup fica em `OPSA_BACKUP_DIR` com manifesto e SHA-256. O restore recusa a
base de origem e nomes sem um token descartável delimitado (`restore`, `test`,
`audit`, `ci` ou `demo`). Os artefactos locais não têm cifra aplicacional:
mantém-nos no diretório privado e elimina-os depois da evidence.

O bundle S3/objetos e a retenção são production-like e opt-in através dos
aliases `mf7:backup:remote`, `mf7:backup:verify:remote` e
`mf7:backup:roundtrip:remote`. Configuração remota incompleta falha sem fallback
local silencioso.

Para testes de integração persistida existe uma base independente. O wrapper
arranca-a, aplica o ambiente de teste e termina-a sem tocar no volume da demo:

```bash
npm --prefix real_dev/api run test:integration:postgres-local
```

## Production-like

`NODE_ENV=production` não ativa fallbacks locais nem simulados. Exige
`REDIS_PROVIDER=redis`, `STORAGE_PROVIDER=s3`, `EMAIL_PROVIDER=smtp`, HTTPS,
PostgreSQL, Redis, chaves não demonstrativas, SMTP com TLS e S3 completo com SSE. OpenAI
continua opt-in: só é usada quando o backend, a empresa e o utilizador a
autorizam. Os workers de email, notificações, IA e backups continuam a ter
comandos separados no `package.json`.
`SAFT_VALIDATION_MODE=academic` e `DEMO_EMAIL_INBOX_ACCESS_KEY` são recusados
durante a validação de configuração de produção.
