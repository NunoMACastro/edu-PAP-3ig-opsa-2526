# ARRANQUE-LOCAL - Arrancar a OPSA em ambiente local

## Header

- `doc_id`: `GUIA-MF8-ARRANQUE-LOCAL`
- `path`: `docs/planificacao/guias-bk/MF8/ARRANQUE-LOCAL.md`
- `macro`: `MF8`
- `area`: `operacao-local`
- `publico`: `alunos`
- `status`: `ativo`
- `last_updated`: `2026-07-13`

## Objetivo

Este guia explica como arrancar a OPSA localmente na maquina dos alunos antes de trabalhar nos BKs da MF8.

A demonstração completa da OPSA tem quatro processos Node.js em
desenvolvimento:

- API/backend em `apps/api`, com Node.js, Express e Prisma.
- Worker de IA em `apps/api`.
- Worker de email simulado em `apps/api`.
- Frontend em `apps/web`, com React, Vite e TypeScript.

Os quatro processos ficam em terminais separados. A API e o frontend arrancam
com a OpenAI desativada, mas os pedidos de IA em `QUEUED`/`RUNNING` só avançam
quando o worker de IA está ativo. O worker de email transforma convites e
resets pendentes em mensagens `SIMULATED` visíveis na inbox local.

PostgreSQL corre em Docker Compose. Redis, SMTP e S3 não são containers
necessários neste perfil: a demo usa adapters locais explícitos.

## Pre-requisitos

Antes de comecar, confirma que tens:

- Node.js `>=24.17 <25` e npm 11 instalados.
- Docker Desktop, ou Docker Engine, com Docker Compose v2.
- Portas `5433`, `5434` e `5435` livres.
- O codigo do projeto aberto na raiz do repositorio OPSA.
- A pasta `apps/api` presente.
- A pasta `apps/web` presente.

Neste guia, os caminhos publicos sao sempre `apps/api` e `apps/web`.

## Passo 1 - Instalar dependencias da API

Abre um terminal na raiz do projeto e executa:

```bash
cd apps/api
npm ci
```

Quando terminar, deixa este terminal na pasta `apps/api` para os passos seguintes.

## Passo 2 - Criar o ficheiro `.env` da API

Ainda dentro de `apps/api`, cria o ficheiro local de ambiente a partir do exemplo:

```bash
cp .env.example .env
```

Em Windows PowerShell, se `cp` nao funcionar, usa:

```powershell
Copy-Item .env.example .env
```

Abre `apps/api/.env` e confirma os nomes das variáveis principais, preenchendo os valores apenas no ficheiro local:

```env
NODE_ENV=development
PORT=3000
APP_BASE_URL=http://localhost:5173
DATABASE_URL=<fornecida-por-canal-seguro>
OPSA_POSTGRES_CLI_MODE=compose
REDIS_PROVIDER=local
STORAGE_PROVIDER=local
EMAIL_PROVIDER=simulated
RATE_LIMIT_HMAC_KEY=<fornecida-por-canal-seguro>
OPSA_PRIVATE_STORAGE_ROOT=<diretorio-local-privado>
AI_PROVIDER_MODE=disabled
AI_CHAT_ENABLED=true
AI_CHAT_ENCRYPTION_KEY=<32-bytes-fornecidos-por-canal-seguro>
AI_SAFETY_HMAC_KEY=<fornecida-por-canal-seguro>
```

Na demo Compose, `DATABASE_URL` aponta para PostgreSQL em
`127.0.0.1:5433`. SMTP, S3 e SAF-T têm variáveis adicionais no `.env.example`
e no contrato central. Os adapters `local`/`simulated` são exclusivos de
development/test; produção continua fail-closed.

Com `AI_PROVIDER_MODE=disabled`, `OPENAI_API_KEY` e `OPENAI_MODEL` não são necessários e a IA determinística continua disponível. Para uma ativação controlada numa empresa demo são ainda necessários `AI_PROVIDER_MODE=openai`, `OPENAI_API_KEY`, `OPENAI_MODEL` explícito, opt-in de `ADMIN` e consentimento do utilizador. `AI_CHAT_ENABLED` é obrigatório em produção; quando vale `true`, a chave de cifra é validada no arranque. A chave OpenAI fica apenas no backend. `AI_CHAT_ENCRYPTION_KEY` não pode ser igual a `EMAIL_OUTBOX_ENCRYPTION_KEY`.

O Compose académico tem credenciais demonstrativas fixas, diferentes para o
bootstrap e para a aplicação, e publica PostgreSQL apenas em loopback. Não são
credenciais secretas nem podem ser reutilizadas fora desta demo. O
`db:local:setup` alinha automaticamente o `.env` local com esta base.

Regra de seguranca: nunca coloques passwords reais em `.env.example`, nos guias, no README ou em commits. Credenciais locais ficam apenas no teu `.env`.

## Passo 3 - Preparar PostgreSQL, migrations e seed

Volta à raiz do projeto e valida primeiro os pré-requisitos Docker:

```bash
npm --prefix apps/api run db:local:check
```

Depois executa o setup completo:

```bash
npm --prefix apps/api run db:local:setup
```

Este comando arranca o serviço `postgres`, cria/verifica um `.env` local seguro,
gera o cliente Prisma, aplica `prisma migrate deploy`, cria a seed demo e
verifica-a. O volume é persistente: repetir o setup não elimina a base.

Se estiveres num BK que altera `apps/api/prisma/schema.prisma`, segue o nome de migration indicado nesse BK. O comando local costuma ter esta forma:

```bash
npx prisma migrate dev --name bk-mf8-xx-descricao-curta
```

Nao uses `migrate dev` apenas para arrancar a aplicacao; usa-o quando existe uma alteracao real de schema que precisa de gerar uma nova migration.

Se este comando falhar por erro de ligacao, o problema mais comum e um destes:

- PostgreSQL nao esta ligado.
- `DATABASE_URL` esta errada.
- A base de dados indicada em `DATABASE_URL` ainda nao existe.
- O utilizador da base de dados nao tem permissoes suficientes.

Inspeciona o estado e os logs sem copiar credenciais:

```bash
npm --prefix apps/api run db:local:status
npm --prefix apps/api run db:local:logs
```

## Passo 4 - Arrancar a API

No terminal que esta em `apps/api`, executa:

```bash
npm run dev
```

Resultado esperado:

- A API arranca na porta `3000`.
- O terminal mostra um evento semelhante a `api_started`.
- O processo fica aberto e nao volta imediatamente ao prompt.

Se aparecer erro de `PORT`, confirma que a porta `3000` nao esta ocupada por outro processo.

Se aparecer erro de `DATABASE_URL`, volta ao passo 2.

## Passo 5 - Instalar dependencias do frontend

Abre um segundo terminal na raiz do projeto e executa:

```bash
cd apps/web
npm ci
```

## Passo 6 - Arrancar o frontend

No terminal que esta em `apps/web`, executa:

```bash
npm run dev
```

Resultado esperado:

- O Vite arranca em `http://127.0.0.1:5173` ou `http://localhost:5173`.
- O terminal do frontend fica aberto.
- O frontend consegue chamar a API atraves do proxy `/api`.

Abre no browser o URL indicado pelo Vite. Se usares `http://localhost:5173`, mantem `APP_BASE_URL=http://localhost:5173` no `.env`. Se a equipa decidir usar sempre `http://127.0.0.1:5173`, mantem tambem o `.env` alinhado com esse host.

## Passo 7 - Arrancar os workers da demonstração

Abre um terceiro terminal:

```bash
cd apps/api
npm run worker:ai
```

Abre um quarto terminal:

```bash
cd apps/api
npm run worker:email
```

Não coloques chaves no frontend nem executes um smoke OpenAI live com dados
reais. A demo determinística não precisa de `OPENAI_API_KEY`.

## Passo 8 - Confirmar que a app responde

Com os quatro terminais abertos:

1. PostgreSQL: `db:local:status` com `postgres` saudável.
2. API: `apps/api` com `npm run dev`.
3. Worker de IA: `apps/api` com `npm run worker:ai`.
4. Worker de email: `apps/api` com `npm run worker:email`.
5. Frontend: `apps/web` com `npm run dev`.
6. Browser aberto no URL do Vite.

Depois de implementado o `BK-MF8-02`, testa liveness e readiness:

```bash
curl -i http://localhost:3000/api/health/live
curl -i http://localhost:3000/api/health/ready
```

Resultado esperado depois desse BK:

- Liveness devolve HTTP `200` quando o processo responde.
- Readiness devolve HTTP `200` apenas quando PostgreSQL e os adapters críticos
  selecionados estão disponíveis; caso contrário devolve `503`.
- Resposta JSON sem credenciais, sem `DATABASE_URL` e sem dados financeiros.

Abre **IA e trabalho → Assistente OPSA** para confirmar o modo determinístico.
Para demonstrar convites e recuperação de password, abre
`/demo/email-inbox`; o código de acesso fica apenas em memória no browser.

## Comandos de validacao uteis

API:

```bash
cd apps/api
npm run syntax:check
npm run test:unit
npm run test:contracts
```

Frontend:

```bash
cd apps/web
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Estes comandos nao substituem os testes especificos de cada BK. Servem para confirmar que a base local nao ficou partida antes de continuares.

## Erros comuns e solucao rapida

### `Environment variable not found: DATABASE_URL`

O ficheiro `apps/api/.env` esta em falta ou nao tem `DATABASE_URL`.

Confirma:

```bash
cd apps/api
ls -la .env
```

Depois revê o valor de `DATABASE_URL`.

### `Ficheiro .env encontrado, mas esta versao do Node.js nao suporta process.loadEnvFile()`

A versao de Node.js e demasiado antiga para o carregamento nativo do `.env` usado pela API.

Atualiza o Node.js para a linha `>=24.17 <25` aprovada no contrato de stack ou exporta as variáveis manualmente antes de arrancar a API.

### `EADDRINUSE` ou porta ocupada

A porta `3000` ou `5173` ja esta a ser usada.

Fecha o processo antigo ou altera a porta de forma consciente. Se mudares a porta do frontend, alinha tambem `APP_BASE_URL`.

### O frontend abre, mas as chamadas `/api` falham

Confirma que:

- A API esta mesmo ligada.
- A API esta na porta `3000`.
- O terminal da API nao terminou com erro.
- `apps/web/vite.config.ts` continua a apontar `/api` para `http://127.0.0.1:3000`.

### `prisma migrate deploy` falha por base inexistente

Executa `npm --prefix apps/api run db:local:status`. Se o serviço não estiver
saudável, consulta `db:local:logs` e repete `db:local:start` antes do setup.

Nao uses uma base de producao para testes locais.

### Parar ou repor a base local

O comando normal preserva o volume:

```bash
npm --prefix apps/api run db:local:stop
```

O reset apaga apenas a base local da demo e exige confirmação explícita:

```bash
npm --prefix apps/api run db:local:reset -- --confirm=opsa_dev
```

Não uses reset como tentativa genérica de corrigir uma migration. Lê primeiro o
erro e preserva os dados quando o objetivo é testar upgrade.

## Checklist antes de fechar o arranque local

- `apps/api/.env` existe e nao foi commitado.
- `DATABASE_URL` aponta para uma base local ou de desenvolvimento.
- `npm --prefix apps/api run db:local:status` confirma PostgreSQL saudável.
- `npm run prisma:validate` passa em `apps/api`.
- `npm run dev` da API fica ativo.
- Workers de IA e email ficam ativos durante os respetivos fluxos.
- `npm run dev` do frontend fica ativo.
- O browser abre o frontend.
- Depois do `BK-MF8-02`, liveness e readiness têm os estados corretos sem expor dados sensíveis.
- Testes browser sem browsers instalados ou sem execução iniciada ficam bloqueados; nunca são registados como PASS.

## Nota final para os alunos

Quando encontrares um erro no arranque, nao avances para alterar codigo de negocio de imediato. Primeiro identifica em que camada esta o problema:

- dependencia em falta;
- `.env` incorreto;
- base de dados desligada;
- Docker Compose indisponível ou porta PostgreSQL ocupada;
- migration nao aplicada;
- API desligada;
- frontend desligado;
- porta errada.

Corrigir a causa certa poupa tempo e evita mudanças desnecessarias no codigo.
