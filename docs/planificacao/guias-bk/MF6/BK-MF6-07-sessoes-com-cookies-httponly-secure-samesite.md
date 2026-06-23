# BK-MF6-07 - Sessões com cookies HttpOnly + Secure + SameSite.

## Header

- `doc_id`: `GUIA-BK-MF6-07`
- `bk_id`: `BK-MF6-07`
- `macro`: `MF6`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF14`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-08`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-07-sessoes-com-cookies-httponly-secure-samesite.md`
- `last_updated`: `2026-06-22`

#### Objetivo

Neste BK vais reforçar a sessão web da OPSA com cookies `HttpOnly`, `Secure` em produção e `SameSite` configurado. O `RNF14` garante que a autenticação não depende de armazenamento inseguro no browser.

O aluno vai rever o helper de cookie, confirmar atributos, testar login/logout e preparar evidence para sessão ausente, sessão válida e produção.

#### Importância

Cookies HttpOnly reduzem o impacto de XSS porque JavaScript do browser não consegue ler a sessão. `Secure` evita envio fora de HTTPS em produção. `SameSite` reduz risco de envio automático em contextos indevidos.

Este BK liga diretamente segurança de transporte, autenticação e prevenção de ataques do próximo guia.

#### Scope-in

- Reforçar helper de sessão.
- Configurar `httpOnly`, `secure`, `sameSite`, `path` e `maxAge`.
- Confirmar logout limpa cookie com os mesmos atributos.
- Criar smoke textual.
- Testar sessão ausente, sessão válida e produção.

#### Scope-out

- Criar autenticação nova.
- Guardar sessão em armazenamento JavaScript do browser.
- Implementar MFA.
- Trocar cookies por credenciais bearer.
- Criar infraestrutura de TLS.

#### Estado antes e depois

- Antes: MF0 cria sessão; MF6 ainda não explicita hardening e evidence de cookies.
- Depois: a sessão tem contrato de atributos e validações claras.

#### Pre-requisitos

- Ler `RNF14`.
- Rever `BK-MF0-01`, `BK-MF6-05` e `BK-MF6-06`.
- Confirmar `apps/api/src/modules/auth/sessionCookie.js`.
- Confirmar que o cliente API usa `credentials: "include"`.

#### Glossário

- Cookie de sessão: identificador opaco enviado pelo browser.
- HttpOnly: atributo que impede leitura via JavaScript.
- Secure: atributo que exige HTTPS.
- SameSite: atributo que controla envio em navegação externa.
- Sessão server-side: estado guardado no backend.
- Logout: remoção da sessão e do cookie.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF14` exige cookies HttpOnly, Secure e SameSite.
- `DERIVADO`: `Secure` pode depender de `NODE_ENV=production`.
- `DERIVADO`: `SameSite=Lax` é opção segura e simples para app web tradicional.

Cookie seguro transporta um identificador, não dados financeiros. A empresa ativa, roles e permissões continuam resolvidas no backend a cada pedido sensível.

#### Arquitetura do BK

- Endpoint(s): login, logout e `/api/auth/me`.
- Modelo/schema Prisma: sessão ou utilizador existentes.
- Service(s): auth service existente.
- Controller/route: escreve e limpa cookie.
- Guard/middleware: lê sessão a partir do cookie.
- Cliente API: `credentials: "include"`.
- Testes: smoke textual e contratos.
- Handoff para o próximo BK: CSRF, XSS, brute force e injeção.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/src/modules/auth/sessionCookie.js`
- REVER: `apps/api/src/modules/auth/authController.js`
- REVER: `apps/api/src/modules/auth/authMiddleware.js`
- REVER: `apps/web/src/lib/apiClient.ts`
- CRIAR: `apps/api/scripts/check-mf6-session-cookie.mjs`
- EDITAR: `apps/api/package.json`

#### Tutorial técnico linear

### Passo 1 - Rever escrita e limpeza de cookie

1. Objetivo funcional do passo no contexto da app.

Confirmar que login e logout usam o mesmo contrato.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/auth/sessionCookie.js`
    - REVER: `apps/api/src/modules/auth/authController.js`
    - LOCALIZAÇÃO: `setSessionCookie` e `clearSessionCookie`.

3. Instruções do que fazer.

Localiza os pontos onde o cookie é escrito e limpo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É revisão de fluxo.

5. Explicação do código.

Logout precisa dos mesmos atributos base para o browser apagar o cookie correto.

6. Validação do passo.

Login chama `setSessionCookie`; logout chama `clearSessionCookie`.

7. Cenário negativo/erro esperado.

Se logout limpar com path diferente, a sessão pode ficar no browser.

### Passo 2 - Endurecer helper de cookie

1. Objetivo funcional do passo no contexto da app.

Configurar atributos obrigatórios do `RNF14`.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/auth/sessionCookie.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Mantém o helper central e aplica o código abaixo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Helper do cookie HttpOnly da sessão OPSA.
 */

const COOKIE_NAME = "sid";
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

/**
 * Cria opções consistentes para escrever ou limpar a sessão.
 *
 * @param {boolean} isProduction - Indica se o cookie deve exigir HTTPS.
 * @returns {import("express").CookieOptions} Opções do cookie de sessão.
 */
function buildSessionCookieOptions(isProduction) {
    return {
        httpOnly: true,
        // Em desenvolvimento local podes não ter HTTPS; em produção o cookie exige canal seguro.
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_MS,
    };
}

/**
 * Escreve o cookie de sessão com atributos seguros.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {string} sessionId - Identificador opaco da sessão server-side.
 * @param {boolean} isProduction - Ambiente de produção exige `Secure`.
 * @returns {void}
 */
export function setSessionCookie(res, sessionId, isProduction) {
    // O browser guarda apenas o identificador; dados de empresa e permissões ficam no backend.
    res.cookie(COOKIE_NAME, sessionId, buildSessionCookieOptions(isProduction));
}

/**
 * Remove o cookie de sessão do browser.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {boolean} isProduction - Ambiente de produção exige `Secure`.
 * @returns {void}
 */
export function clearSessionCookie(res, isProduction) {
    const { maxAge: _maxAge, ...options } = buildSessionCookieOptions(isProduction);
    res.clearCookie(COOKIE_NAME, options);
}

/**
 * Lê manualmente o cookie `sid` do header HTTP.
 *
 * @param {import("express").Request} req - Pedido Express.
 * @returns {string | null} Valor do cookie quando existe; caso contrário `null`.
 */
export function readSessionCookie(req) {
    const rawCookie = req.headers.cookie ?? "";
    // A leitura mantém o contrato criado no BK-MF0-01 para controllers e middlewares de auth.
    const cookies = rawCookie.split(";").map((part) => part.trim());
    const sessionCookie = cookies.find((part) =>
        part.startsWith(`${COOKIE_NAME}=`),
    );

    if (!sessionCookie) return null;
    return decodeURIComponent(sessionCookie.slice(COOKIE_NAME.length + 1));
}
```

5. Explicação do código.

O helper centraliza atributos para login e logout. `httpOnly` protege contra leitura por JavaScript, `secure` fica ativo em produção e `sameSite` reduz envio em contexto externo.

O export `readSessionCookie` continua no ficheiro porque foi criado no `BK-MF0-01` e é usado pelos controllers e middlewares de autenticação. Assim, este BK reforça o cookie sem quebrar o contrato anterior da sessão.

6. Validação do passo.

Executa `cd apps/api && node --check src/modules/auth/sessionCookie.js`.

7. Cenário negativo/erro esperado.

Se `httpOnly` estiver ausente, o BK não cumpre o `RNF14`.

### Passo 3 - Confirmar leitura de sessão

1. Objetivo funcional do passo no contexto da app.

Garantir que o backend usa o cookie para autenticar.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/auth/authMiddleware.js`
    - LOCALIZAÇÃO: middleware de autenticação.

3. Instruções do que fazer.

Confirma que o middleware lê `sid`, carrega sessão server-side e injeta utilizador no request.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Usa o middleware existente.

5. Explicação do código.

O cookie por si só não é autorização. O backend deve procurar a sessão e aplicar roles/permissões nos módulos.

6. Validação do passo.

`/api/auth/me` devolve utilizador com sessão válida.

7. Cenário negativo/erro esperado.

Sem cookie, devolve `401`.

### Passo 4 - Confirmar cliente API

1. Objetivo funcional do passo no contexto da app.

Garantir que o browser envia cookies.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: função `request` do cliente API.

3. Instruções do que fazer.

Confirma que a função `request` mantém `credentials: "include"` em todas as chamadas HTTP. Não substituas a função inteira se ela já trata headers, body, respostas `204`, JSON e erros da API.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É uma revisão de uma função já criada em BKs anteriores; o objetivo é confirmar que o cookie HttpOnly continua a viajar automaticamente sem ser lido por JavaScript.

5. Explicação do código.

O frontend não lê a sessão. Apenas pede ao browser para incluir cookies no pedido. A função `request` deve preservar o resto do cliente API: serialização de JSON, tratamento de `204`, leitura de erros e lançamento de `ApiError`.

6. Validação do passo.

Login seguido de `/api/auth/me` funciona.

7. Cenário negativo/erro esperado.

Sem `credentials: "include"`, chamadas autenticadas falham com `401`.

### Passo 5 - Criar smoke textual

1. Objetivo funcional do passo no contexto da app.

Proteger atributos obrigatórios.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/check-mf6-session-cookie.mjs`
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: script e entrada `test:mf6:cookies`.

3. Instruções do que fazer.

Cria o script abaixo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Smoke textual do BK-MF6-07.
 */

import { readFileSync } from "node:fs";

const cookieHelper = readFileSync("src/modules/auth/sessionCookie.js", "utf8");

for (const required of ["httpOnly: true", "secure: isProduction", "sameSite: \"lax\"", "path: \"/\""]) {
    if (!cookieHelper.includes(required)) {
        throw new Error(`Falta atributo de cookie: ${required}`);
    }
}

// Login e logout devem usar a mesma base de opções para evitar cookies presos.
if (!cookieHelper.includes("buildSessionCookieOptions")) {
    throw new Error("Falta helper central de opções do cookie.");
}
```

5. Explicação do código.

O smoke verifica os atributos mínimos e a centralização.

6. Validação do passo.

Executa `cd apps/api && node scripts/check-mf6-session-cookie.mjs`.

7. Cenário negativo/erro esperado.

Se `secure` ficar sempre falso, o script falha.

### Passo 6 - Testar login e logout

1. Objetivo funcional do passo no contexto da app.

Validar ciclo completo de sessão.

2. Ficheiros envolvidos:
    - REVER: endpoints de autenticação.
    - LOCALIZAÇÃO: requests manuais ou testes contract.

3. Instruções do que fazer.

Faz login, chama `/api/auth/me`, faz logout e repete `/api/auth/me`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Usa requests HTTP ou tests existentes.

5. Explicação do código.

O ciclo prova escrita, leitura e limpeza do cookie.

6. Validação do passo.

Depois do logout, `/api/auth/me` devolve `401`.

7. Cenário negativo/erro esperado.

Cookie apagado incorretamente mantém sessão ativa.

### Passo 7 - Validar produção simulada

1. Objetivo funcional do passo no contexto da app.

Confirmar `Secure` em produção.

2. Ficheiros envolvidos:
    - REVER: resposta de login em ambiente de produção simulado.
    - LOCALIZAÇÃO: cabeçalho `Set-Cookie`.

3. Instruções do que fazer.

Executa login com `NODE_ENV=production` e confirma atributo `Secure`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É validação HTTP.

5. Explicação do código.

`Secure` depende do ambiente. Em local pode estar ausente; em produção é obrigatório.

6. Validação do passo.

`Set-Cookie` contém `HttpOnly`, `Secure`, `SameSite=Lax` e `Path=/`.

7. Cenário negativo/erro esperado.

Produção sem `Secure` falha o `RNF14`.

### Passo 8 - Recolher evidence

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com prova.

2. Ficheiros envolvidos:
    - REVER: outputs de smoke, login e logout.
    - LOCALIZAÇÃO: PR ou relatório.

3. Instruções do que fazer.

Guarda `Set-Cookie` mascarado e outputs sem divulgar sessão real.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É evidence.

5. Explicação do código.

Evidence deve mostrar atributos, não o valor real da sessão.

6. Validação do passo.

Sessão válida, logout e produção simulada ficam documentados.

7. Cenário negativo/erro esperado.

Se a evidence publicar o valor da sessão, invalida a sessão e substitui a prova.

#### Critérios de aceite

- Cookie tem `HttpOnly`, `SameSite` e `Path`.
- `Secure` fica ativo em produção.
- Logout limpa o cookie correto.
- Frontend usa `credentials: "include"`.
- Negativos: mínimo `3`: sessão ausente, falta de credentials e produção sem Secure.

#### Validação final

- `cd apps/api && node --check src/modules/auth/sessionCookie.js`
- `cd apps/api && node scripts/check-mf6-session-cookie.mjs`
- `cd apps/api && npm run test:contracts`
- Teste manual de login/logout.

#### Evidence para PR/defesa

- `pr`: link ou identificador do PR.
- `proof`: `Set-Cookie` mascarado com atributos.
- `neg`: sessão ausente, logout e produção simulada.
- `fonte`: `RNF14`, `BK-MF0-01`, `BK-MF6-05`.
- `multiempresa`: sessão não decide empresa sem validação backend.

#### Handoff

- Entrega sessão com atributos seguros.
- O próximo BK usa essa base para CSRF, XSS, injeção e brute force.
- Próximo BK recomendado: `BK-MF6-08`

#### Changelog

- `2026-06-22`: guia revisto com helper de cookie, validações, smoke, produção simulada e evidence sem expor sessão.
