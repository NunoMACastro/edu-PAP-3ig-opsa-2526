# BK-MF6-09 - Chaves de API e credenciais apenas em variáveis de ambiente.

## Header

- `doc_id`: `GUIA-BK-MF6-09`
- `bk_id`: `BK-MF6-09`
- `macro`: `MF6`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF16`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-10`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais impedir que chaves de API e credenciais fiquem escritas no código. O `RNF16` exige variáveis de ambiente para valores sensíveis.

O aluno vai criar um módulo de configuração, exemplos sem valores reais e um scanner simples que falha se encontrar padrões perigosos.

#### Importância

Credenciais no repositório podem ser copiadas, expostas em prints ou enviadas para a defesa por acidente. Mesmo numa PAP, é importante aprender a separar código e configuração.

Este BK prepara auditoria e operação segura: a aplicação pode mudar ambiente sem alterar ficheiros de código.

#### Scope-in

- Criar módulo `env.js` para ler configuração.
- Criar `.env.example` sem valores reais.
- Validar variáveis obrigatórias.
- Criar scanner textual contra padrões perigosos.
- Definir negativos para ausência de variável e valor escrito no código.

#### Scope-out

- Criar gestor externo de cofres.
- Guardar credenciais reais em documentos.
- Inventar fornecedor externo obrigatório.
- Fazer deploy.
- Alterar regras de autenticação.

#### Estado antes e depois

- Antes: a app pode ler configuração, mas MF6 ainda não tem guia de credenciais.
- Depois: valores sensíveis ficam fora do código e a validação falha cedo quando faltam.

#### Pre-requisitos

- Ler `RNF16`.
- Rever `BK-MF0-05` para email de recuperação.
- Rever `BK-MF4` se houver providers de IA.
- Confirmar scripts e `.env.example` em `apps/api`.

#### Glossário

- Variável de ambiente: valor fornecido fora do código.
- Credencial: dado que permite acesso a serviço ou recurso.
- `.env.example`: ficheiro com nomes esperados, sem valores reais.
- Configuração obrigatória: valor sem o qual a app não deve arrancar.
- Scanner: script que procura padrões inseguros.
- Rotação: troca de credencial sem alterar código.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF16` exige credenciais em variáveis de ambiente.
- `DERIVADO`: `.env.example` pode listar nomes e valores fictícios seguros.
- `DERIVADO`: a API deve falhar cedo quando configuração obrigatória falta.
- `DERIVADO`: neste BK, só devem ficar obrigatórias variáveis já consumidas pelo fluxo apresentado; novas chaves de API entram quando existir o adapter que as usa.

Variável de ambiente não é mágica: se o aluno escrever o valor real no `.env.example`, continua exposto. O exemplo deve ensinar o nome da variável, não revelar o valor.

#### Arquitetura do BK

- Endpoint(s): não aplicável diretamente.
- Modelo/schema Prisma: não aplicável.
- Service(s): serviços que precisam de configuração importam `env`.
- Controller/route: sem alteração obrigatória.
- Guard/middleware: sem alteração obrigatória.
- Cliente API: usa variável pública apenas para URL da API.
- Testes: scanner textual.
- Handoff para o próximo BK: auditoria de operações sensíveis.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/config/env.js`
- CRIAR: `apps/api/.env.example`
- REVER: serviços de email, IA ou integrações.
- CRIAR: `apps/api/scripts/check-mf6-env-safety.mjs`
- EDITAR: `apps/api/package.json`
- REVER: `apps/web/.env.example`

#### Tutorial técnico linear

### Passo 1 - Inventariar configuração sensível

1. Objetivo funcional do passo no contexto da app.

Saber que valores não podem estar no código.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src`
    - REVER: `apps/api/scripts`
    - LOCALIZAÇÃO: serviços que chamam email, IA ou integrações.

3. Instruções do que fazer.

Lista nomes de variáveis necessárias sem escrever valores reais. Neste BK, começa por `DATABASE_URL` como credencial obrigatória da API e mantém `APP_BASE_URL` como configuração operacional com valor local seguro. Não cries segredos obrigatórios para sessão ou providers que este BK não consome.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É inventário de configuração.

5. Explicação do código.

Sem inventário, a equipa tende a espalhar valores por services.

6. Validação do passo.

Lista contém nome, uso e se é obrigatória.

7. Cenário negativo/erro esperado.

Encontrar valor real num ficheiro de código exige remoção imediata.

### Passo 2 - Criar módulo de ambiente

1. Objetivo funcional do passo no contexto da app.

Centralizar leitura e validação.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/config/env.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o módulo abaixo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Configuração da API OPSA lida a partir do ambiente.
 */

const requiredVariables = ["DATABASE_URL"];

/**
 * Lê uma variável obrigatória e falha cedo quando está ausente.
 *
 * @param {string} name - Nome da variável.
 * @returns {string} Valor configurado no ambiente.
 */
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Variável obrigatória em falta: ${name}`);
    }

    return value;
}

/**
 * Valida a configuração obrigatória da API.
 *
 * @returns {{ databaseUrl: string, appBaseUrl: string }}
 */
export function loadEnv() {
    for (const name of requiredVariables) {
        requireEnv(name);
    }

    // O ficheiro central evita credenciais espalhadas por services e scripts.
    return {
        databaseUrl: requireEnv("DATABASE_URL"),
        appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:5173",
    };
}
```

5. Explicação do código.

O módulo valida valores obrigatórios e dá nomes claros para o resto da app. Falhar cedo evita arrancar com configuração incompleta.

6. Validação do passo.

Executa `cd apps/api && node --check src/config/env.js`.

7. Cenário negativo/erro esperado.

Sem `DATABASE_URL`, a app deve falhar no arranque controlado.

### Passo 3 - Criar exemplo seguro

1. Objetivo funcional do passo no contexto da app.

Ensinar configuração sem divulgar valores reais.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/.env.example`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Escreve nomes e valores fictícios.

4. Código completo, correto e integrado com a app final.

```dotenv
# Preencher por canal seguro no ambiente de execução; nunca documentar utilizador/password.
DATABASE_URL=
APP_BASE_URL=http://localhost:5173
```

5. Explicação do código.

O exemplo mostra formato, não segredo real. Em produção, estes valores são definidos no ambiente do servidor. Se uma integração futura precisar de uma chave de API, essa variável só deve entrar aqui quando o respetivo BK ou adapter também mostrar onde ela é consumida.

6. Validação do passo.

O ficheiro não contém credenciais reais.

7. Cenário negativo/erro esperado.

Valor real copiado para `.env.example` deve ser removido.

### Passo 4 - Usar o módulo no servidor

1. Objetivo funcional do passo no contexto da app.

Evitar leituras dispersas de configuração.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/server.js`
    - LOCALIZAÇÃO: arranque da API.

3. Instruções do que fazer.

Adiciona o import de `loadEnv` no topo de `apps/api/src/server.js`, imediatamente depois dos imports de bibliotecas externas, e substitui a leitura direta de `APP_BASE_URL` pelo valor centralizado. Não removas os restantes imports nem a montagem dos routers.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/server.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { loadEnv } from "./config/env.js";
import { buildAuthRoutes } from "./modules/auth/authRoutes.js";

// Mantém neste ponto os imports de routers e módulos já criados nos BKs anteriores.
const env = loadEnv();
const prisma = new PrismaClient();
const app = express();
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const isProduction = process.env.NODE_ENV === "production";
const appBaseUrl = env.appBaseUrl;

// A validação acontece antes dos routers para a API falhar cedo se faltar configuração obrigatória.
app.use(express.json());

app.use("/api/auth", buildAuthRoutes({ prisma, isProduction, appBaseUrl }));
```

5. Explicação do código.

O servidor passa a ler a configuração obrigatória através de `loadEnv`, mas continua a preservar `port`, `isProduction`, `appBaseUrl`, `PrismaClient`, `express.json()` e a montagem de autenticação criada em BKs anteriores. Assim, o hardening de `APP_BASE_URL` usado em autenticação e CSRF fica ligado ao mesmo contrato de configuração, sem espalhar nomes de variáveis pelo arranque da API.

6. Validação do passo.

`node --check src/server.js` deve passar.

7. Cenário negativo/erro esperado.

Se o servidor arrancar sem variável obrigatória, a validação não foi aplicada.

### Passo 5 - Rever frontend

1. Objetivo funcional do passo no contexto da app.

Separar variáveis públicas de valores sensíveis.

2. Ficheiros envolvidos:
    - REVER: `apps/web/.env.example`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: URL da API.

3. Instruções do que fazer.

No frontend, usa apenas variáveis públicas de URL, nunca credenciais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É revisão de configuração.

5. Explicação do código.

Tudo o que vai para o frontend pode ser visto pelo utilizador. Não coloques credenciais aí.

6. Validação do passo.

`apps/web/.env.example` contém apenas URL pública da API.

7. Cenário negativo/erro esperado.

Credencial no frontend deve ser removida.

### Passo 6 - Criar scanner textual

1. Objetivo funcional do passo no contexto da app.

Detetar padrões inseguros antes do PR.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/check-mf6-env-safety.mjs`
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: script e entrada `test:mf6:env`.

3. Instruções do que fazer.

Cria o script abaixo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Scanner textual do BK-MF6-09.
 */

import { readFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const checkedFiles = [
    "src/config/env.js",
    "src/server.js",
    ".env.example",
];

for (const file of checkedFiles) {
    const content = readFileSync(file, "utf8");
    if (content.includes("LIVE_VALUE_DO_NOT_COMMIT")) {
        throw new Error(`Valor real detetado em ${file}`);
    }
}

function listJavaScriptFiles(directory) {
    return readdirSync(directory)
        .flatMap((entry) => {
            const fullPath = join(directory, entry);
            if (statSync(fullPath).isDirectory()) {
                // A recursão percorre módulos novos sem obrigar a manter a lista manualmente.
                return listJavaScriptFiles(fullPath);
            }

            return fullPath.endsWith(".js") ? [fullPath] : [];
        });
}

const sourceFiles = listJavaScriptFiles("src");
for (const file of sourceFiles) {
    const content = readFileSync(file, "utf8");
    if (content.includes("sk_live_") || content.includes("pk_live_")) {
        // O scanner não substitui revisão humana, mas bloqueia padrões óbvios antes do PR.
        throw new Error(`Credencial provável no código: ${file}`);
    }
}
```

5. Explicação do código.

O scanner é simples e educativo. Procura padrões comuns e força revisão manual quando encontra algo suspeito.

6. Validação do passo.

Executa `cd apps/api && node scripts/check-mf6-env-safety.mjs`.

7. Cenário negativo/erro esperado.

Se houver valor real no código, o script falha.

### Passo 7 - Testar variável ausente

1. Objetivo funcional do passo no contexto da app.

Provar que a app falha cedo.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/config/env.js`
    - LOCALIZAÇÃO: arranque sem variável.

3. Instruções do que fazer.

Executa o módulo sem `DATABASE_URL` num ambiente controlado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É teste manual de ambiente.

5. Explicação do código.

Falhar cedo evita erros mais perigosos durante um pedido real.

6. Validação do passo.

Erro esperado: `Variável obrigatória em falta`.

7. Cenário negativo/erro esperado.

Se a app arrancar sem valor obrigatório, o contrato não está ativo.

### Passo 8 - Recolher evidence

1. Objetivo funcional do passo no contexto da app.

Fechar o BK sem divulgar credenciais.

2. Ficheiros envolvidos:
    - REVER: outputs de smoke e scanner.
    - LOCALIZAÇÃO: PR ou relatório.

3. Instruções do que fazer.

Guarda outputs e máscara qualquer valor sensível.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É evidence.

5. Explicação do código.

Evidence deve provar nomes de variáveis e validação, não valores reais.

6. Validação do passo.

Outputs anexados ao PR.

7. Cenário negativo/erro esperado.

Se o PR mostrar valor sensível, revoga esse valor e substitui evidence.

#### Critérios de aceite

- Configuração sensível é lida por `env.js`.
- `.env.example` não contém valores reais.
- App falha cedo sem variáveis obrigatórias realmente consumidas pela API.
- Scanner deteta padrões perigosos.
- Negativos: mínimo `3`: variável ausente, valor real no exemplo e credencial no código.

#### Validação final

- `cd apps/api && node --check src/config/env.js`
- `cd apps/api && node scripts/check-mf6-env-safety.mjs`
- `cd apps/api && npm run test:contracts`
- Revisão manual de `.env.example`.

#### Evidence para PR/defesa

- `pr`: link ou identificador do PR.
- `proof`: output do scanner.
- `neg`: variável ausente e padrão perigoso.
- `fonte`: `RNF16`.
- `multiempresa`: configuração não substitui isolamento por empresa.

#### Handoff

- Entrega configuração segura para auditoria e operação.
- O próximo BK regista operações sensíveis sem expor credenciais.
- Próximo BK recomendado: `BK-MF6-10`

#### Changelog

- `2026-06-22`: guia revisto com módulo de ambiente, exemplo seguro, scanner, negativos e evidence.
