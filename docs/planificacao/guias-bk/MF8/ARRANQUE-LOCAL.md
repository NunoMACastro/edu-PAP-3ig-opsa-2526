# ARRANQUE-LOCAL - Arrancar a OPSA em ambiente local

## Header

- `doc_id`: `GUIA-MF8-ARRANQUE-LOCAL`
- `path`: `docs/planificacao/guias-bk/MF8/ARRANQUE-LOCAL.md`
- `macro`: `MF8`
- `area`: `operacao-local`
- `publico`: `alunos`
- `status`: `ativo`
- `last_updated`: `2026-07-03`

## Objetivo

Este guia explica como arrancar a OPSA localmente na maquina dos alunos antes de trabalhar nos BKs da MF8.

A OPSA tem dois processos em desenvolvimento:

- API/backend em `apps/api`, com Node.js, Express e Prisma.
- Frontend em `apps/web`, com React, Vite e TypeScript.

Os dois processos devem ficar abertos em terminais separados. Se um deles for fechado, essa parte da aplicacao deixa de responder.

## Pre-requisitos

Antes de comecar, confirma que tens:

- Node.js e npm instalados.
- PostgreSQL instalado ou uma base PostgreSQL fornecida pela equipa/docente.
- O codigo do projeto aberto na raiz do repositorio OPSA.
- A pasta `apps/api` presente.
- A pasta `apps/web` presente.

Neste guia, os caminhos publicos sao sempre `apps/api` e `apps/web`.

## Passo 1 - Instalar dependencias da API

Abre um terminal na raiz do projeto e executa:

```bash
cd apps/api
npm install
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

Abre `apps/api/.env` e confirma os valores principais:

```env
NODE_ENV=development
PORT=3000
APP_BASE_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/opsa_dev
OPSA_PRIVATE_STORAGE_ROOT=./private-storage
```

Troca `user`, `password`, `localhost`, `5432` e `opsa_dev` pelos dados reais da tua base local.

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
npm install
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

Depois de implementado o `BK-MF8-02`, tambem podes testar o health-check:

```bash
curl -i http://localhost:3000/api/health
```

Resultado esperado depois desse BK:

- HTTP `200`.
- Resposta JSON sem credenciais, sem `DATABASE_URL` e sem dados financeiros.

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
npm run build
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

Atualiza o Node.js para uma versao recente aprovada pela equipa/docente ou exporta as variaveis manualmente antes de arrancar a API.

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
- Depois do `BK-MF8-02`, `GET /api/health` responde sem expor dados sensiveis.

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
