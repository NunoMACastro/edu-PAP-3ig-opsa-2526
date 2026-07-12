# ARRANQUE-LOCAL - Arrancar a OPSA em ambiente local

## Header

- `doc_id`: `GUIA-MF8-ARRANQUE-LOCAL`
- `path`: `docs/planificacao/guias-bk/MF8/ARRANQUE-LOCAL.md`
- `macro`: `MF8`
- `area`: `operacao-local`
- `publico`: `alunos`
- `status`: `ativo`
- `last_updated`: `2026-07-11`

## Objetivo

Este guia explica como arrancar a OPSA localmente na maquina dos alunos antes de trabalhar nos BKs da MF8.

A OPSA tem dois processos principais em desenvolvimento:

- API/backend em `apps/api`, com Node.js, Express e Prisma.
- Frontend em `apps/web`, com React, Vite e TypeScript.

Os dois processos devem ficar abertos em terminais separados. Se um deles for fechado, essa parte da aplicacao deixa de responder.

Existem ainda workers opcionais separados para email e análise de IA. A API e o frontend arrancam com a OpenAI desativada; o worker de IA é necessário para atualização automática horária, não para consultar resultados já persistidos.

## Pre-requisitos

Antes de comecar, confirma que tens:

- Node.js `>=24.17 <25` e npm 11 instalados.
- PostgreSQL instalado ou uma base PostgreSQL fornecida pela equipa/docente.
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
REDIS_URL=<fornecida-por-canal-seguro>
RATE_LIMIT_HMAC_KEY=<fornecida-por-canal-seguro>
OPSA_PRIVATE_STORAGE_ROOT=<diretorio-local-privado>
AI_PROVIDER_MODE=disabled
AI_CHAT_ENABLED=true
AI_CHAT_ENCRYPTION_KEY=<32-bytes-fornecidos-por-canal-seguro>
AI_SAFETY_HMAC_KEY=<fornecida-por-canal-seguro>
```

SMTP, S3 e SAF-T têm variáveis adicionais no `.env.example` e no contrato central. Mantém Redis/local storage apenas no modo de desenvolvimento permitido; os gates de integração usam serviços remotos dedicados de teste.

Com `AI_PROVIDER_MODE=disabled`, `OPENAI_API_KEY` e `OPENAI_MODEL` não são necessários e a IA determinística continua disponível. Para uma ativação controlada numa empresa demo são ainda necessários `AI_PROVIDER_MODE=openai`, `OPENAI_API_KEY`, `OPENAI_MODEL` explícito, opt-in de `ADMIN` e consentimento do utilizador. `AI_CHAT_ENABLED` é obrigatório em produção; quando vale `true`, a chave de cifra é validada no arranque. A chave OpenAI fica apenas no backend. `AI_CHAT_ENCRYPTION_KEY` não pode ser igual a `EMAIL_OUTBOX_ENCRYPTION_KEY`.

Regra de seguranca: nunca coloques passwords reais em `.env.example`, nos guias, no README ou em commits. Credenciais locais ficam apenas no teu `.env`.

## Passo 3 - Validar Prisma e aplicar migrations

Ainda dentro de `apps/api`, confirma que o schema Prisma esta valido:

```bash
npm run prisma:validate
```

Depois gera o cliente Prisma:

```bash
npm run prisma:generate
```

Se a base de dados local estiver vazia, aplica as migrations existentes:

```bash
npx prisma migrate deploy
```

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

## Passo 7 - Confirmar que a app responde

Com os dois terminais abertos:

1. API: `apps/api` com `npm run dev`.
2. Frontend: `apps/web` com `npm run dev`.
3. Browser aberto no URL do Vite.

Depois de implementado o `BK-MF8-02`, testa liveness e readiness:

```bash
curl -i http://localhost:3000/api/health/live
curl -i http://localhost:3000/api/health/ready
```

Resultado esperado depois desse BK:

- Liveness devolve HTTP `200` quando o processo responde.
- Readiness devolve HTTP `200` apenas quando PostgreSQL, Redis e storage crítico estão disponíveis; caso contrário devolve `503`.
- Resposta JSON sem credenciais, sem `DATABASE_URL` e sem dados financeiros.

## Passo 8 - Arrancar workers opcionais

Para atualizar insights e alertas automaticamente, abre outro terminal:

```bash
cd apps/api
npm run worker:ai
```

Para processar a outbox SMTP, usa um terminal separado:

```bash
cd apps/api
npm run worker:email
```

Os workers usam a mesma configuração segura da API. Não coloques chaves no frontend nem executes um smoke OpenAI live com dados reais.

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

Cria primeiro a base local no PostgreSQL ou pede ao docente os dados de ligacao corretos.

Nao uses uma base de producao para testes locais.

## Checklist antes de fechar o arranque local

- `apps/api/.env` existe e nao foi commitado.
- `DATABASE_URL` aponta para uma base local ou de desenvolvimento.
- `npm run prisma:validate` passa em `apps/api`.
- `npm run dev` da API fica ativo.
- `npm run dev` do frontend fica ativo.
- O browser abre o frontend.
- Depois do `BK-MF8-02`, liveness e readiness têm os estados corretos sem expor dados sensíveis.
- Testes browser sem browsers instalados ou sem execução iniciada ficam bloqueados; nunca são registados como PASS.

## Nota final para os alunos

Quando encontrares um erro no arranque, nao avances para alterar codigo de negocio de imediato. Primeiro identifica em que camada esta o problema:

- dependencia em falta;
- `.env` incorreto;
- base de dados desligada;
- migration nao aplicada;
- API desligada;
- frontend desligado;
- porta errada.

Corrigir a causa certa poupa tempo e evita mudanças desnecessarias no codigo.
