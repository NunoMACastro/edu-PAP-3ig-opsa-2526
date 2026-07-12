# BK-MF6-05 - Toda a comunicação deve usar HTTPS (TLS 1.2+).

## Header

- `doc_id`: `GUIA-BK-MF6-05`
- `bk_id`: `BK-MF6-05`
- `macro`: `MF6`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF12`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-06`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais garantir que a aplicação está preparada para exigir comunicação segura em produção. O `RNF12` define HTTPS com TLS 1.2 ou superior.

O guia cria uma verificação backend para pedidos inseguros atrás de proxy, configura cabeçalhos básicos de transporte e ensina o aluno a validar sem fingir que o ambiente local tem certificado de produção.

#### Importância

OPSA transporta dados financeiros, fiscais e pessoais. Enviar estes dados sem HTTPS permite leitura ou alteração por terceiros na rede.

HTTPS não é decoração de deploy. É parte da segurança da aplicação e prepara os BKs seguintes sobre palavras-passe, cookies e ataques web.

#### Scope-in

- Criar middleware que exige HTTPS em produção.
- Respeitar proxy através de `x-forwarded-proto`.
- Adicionar cabeçalho HSTS apenas em produção.
- Documentar validação local e validação de deploy.
- Preservar funcionamento local em `http://localhost`.
- Criar smoke textual.

#### Scope-out

- Emitir certificados reais.
- Configurar Nginx, Traefik, Cloudflare ou infraestrutura externa.
- Trocar Express.
- Desativar cookies seguros em produção.
- Guardar credenciais no código.

#### Estado antes e depois

- Antes: a stack documenta cookies seguros em produção, mas a API não tem guia MF6 para transporte HTTPS.
- Depois: o aluno sabe onde aplicar a regra, como validar proxy e como recolher evidence.

#### Pre-requisitos

- Ler `RNF12`.
- Rever `BK-MF0-01` e `BK-MF6-07`.
- Confirmar `apps/api/src/server.js`.
- Confirmar que o deploy final termina TLS antes de chegar ao Express ou no próprio servidor.
- Confirmar que o frontend usa URL HTTPS em produção.

#### Glossário

- HTTPS: HTTP protegido por TLS.
- TLS: protocolo que cifra comunicação.
- HSTS: cabeçalho que pede ao browser para preferir HTTPS.
- Proxy: componente que recebe tráfego público e encaminha para a API.
- Produção: ambiente público ou partilhado com dados reais.
- Desenvolvimento local: ambiente do aluno, normalmente sem certificado público.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF12` exige HTTPS com TLS 1.2 ou superior.
- `DERIVADO`: Express pode validar `x-forwarded-proto` quando está atrás de proxy.
- `DERIVADO`: ambiente local pode continuar em HTTP, desde que produção bloqueie pedidos inseguros.

TLS protege transporte, não substitui autenticação, autorização ou validação. Mesmo com HTTPS, a API deve continuar a verificar sessão, empresa ativa e permissões no backend.

#### Contrato de paridade obrigatório (2026-07-10)

`TRUST_PROXY_HOPS` é um inteiro não negativo com default `0`. Com `0`, Express não confia em nenhum header forwarded; com valor positivo, confia apenas no número explicitamente configurado de proxies controlados. Nunca existe confiança global/implícita e a aplicação falha no arranque perante valor inválido. Os testes provam que um cliente direto não consegue forjar `X-Forwarded-Proto` ou IP.

#### Arquitetura do BK

- Endpoint(s): todos os endpoints passam pelo middleware global.
- Modelo/schema Prisma: não aplicável.
- Service(s): não aplicável.
- Controller/route: não aplicável.
- Guard/middleware: `enforceHttps`.
- Cliente API: URL de produção deve ser HTTPS.
- Testes: smoke textual e requests com cabeçalho de proxy.
- Handoff para o próximo BK: palavras-passe bcrypt.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/security/transportSecurity.js`
- EDITAR: `apps/api/src/server.js`
- CRIAR: `apps/api/scripts/check-mf6-https.mjs`
- EDITAR: `apps/api/package.json`
- REVER: `apps/web/src/lib/apiClient.ts`

#### Tutorial técnico linear

### Passo 1 - Identificar ponto global da API

1. Objetivo funcional do passo no contexto da app.

Encontrar o local certo para aplicar segurança de transporte.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/server.js`
    - LOCALIZAÇÃO: configuração inicial do Express.

3. Instruções do que fazer.

Confirma que todos os routers são montados depois de `app.use(express.json())`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A leitura evita aplicar a regra só numa rota.

5. Explicação do código.

O middleware deve ser global para proteger todos os módulos.

6. Validação do passo.

O ponto de montagem fica antes das rotas.

7. Cenário negativo/erro esperado.

Se a regra for aplicada só a `/api/auth`, outros módulos ficam expostos.

### Passo 2 - Criar middleware HTTPS

1. Objetivo funcional do passo no contexto da app.

Bloquear pedidos HTTP em produção.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/security/transportSecurity.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o middleware abaixo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Segurança de transporte HTTPS para a API OPSA.
 */

/**
 * Cria middleware que exige HTTPS em produção.
 *
 * @param {{ isProduction: boolean }} options - Opções do ambiente atual.
 * @returns {import("express").RequestHandler} Middleware Express.
 */
export function enforceHttps({ isProduction }) {
    return (req, res, next) => {
        const forwardedProto = req.headers["x-forwarded-proto"];
        const requestIsHttps = req.secure || forwardedProto === "https";

        if (isProduction && !requestIsHttps) {
            // Em produção, dados financeiros e de sessão nunca devem circular por HTTP.
            res.status(403).json({
                code: "HTTPS_REQUIRED",
                message: "A comunicação com a OPSA deve usar HTTPS.",
            });
            return;
        }

        next();
    };
}

/**
 * Aplica HSTS apenas quando a resposta já está em canal seguro.
 *
 * @param {{ isProduction: boolean }} options - Opções do ambiente atual.
 * @returns {import("express").RequestHandler} Middleware Express.
 */
export function applyStrictTransportSecurity({ isProduction }) {
    return (_req, res, next) => {
        if (isProduction) {
            res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        }

        next();
    };
}
```

5. Explicação do código.

O middleware aceita desenvolvimento local, mas em produção exige HTTPS direto ou via proxy. O HSTS ajuda o browser a preferir canal seguro depois da primeira resposta segura.

6. Validação do passo.

Executa `cd apps/api && node --check src/modules/security/transportSecurity.js`.

7. Cenário negativo/erro esperado.

Em produção, pedido com `x-forwarded-proto: http` devolve `403`.

### Passo 3 - Montar middleware no servidor

1. Objetivo funcional do passo no contexto da app.

Aplicar a regra antes das rotas.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/server.js`
    - LOCALIZAÇÃO: depois de criar `app`.

3. Instruções do que fazer.

Importa os middlewares e monta antes dos routers.

4. Código completo, correto e integrado com a app final.

```js
import {
    applyStrictTransportSecurity,
    enforceHttps,
} from "./modules/security/transportSecurity.js";

const trustProxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS ?? "0", 10);
if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
    throw new Error("TRUST_PROXY_HOPS deve ser um inteiro não negativo");
}
app.set("trust proxy", trustProxyHops === 0 ? false : trustProxyHops);
app.use(enforceHttps({ isProduction }));
app.use(applyStrictTransportSecurity({ isProduction }));
```

5. Explicação do código.

O default `0` ignora headers forwarded. Apenas uma configuração explícita permite interpretar o número conhecido de proxies. A regra fica antes dos routers para proteger toda a API.

6. Validação do passo.

`node --check src/server.js` deve passar.

7. Cenário negativo/erro esperado.

Sem `TRUST_PROXY_HOPS` correto, a API deve permanecer fail-closed e não confiar em headers fornecidos pelo cliente.

### Passo 4 - Verificar frontend em produção

1. Objetivo funcional do passo no contexto da app.

Evitar que o frontend chame API insegura em produção.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: base URL do cliente API.

3. Instruções do que fazer.

Confirma que a variável de URL de produção pode apontar para `https://...`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O objetivo é verificar configuração e não fixar URL real no guia.

5. Explicação do código.

Ambientes variam. O guia não deve inventar domínio de produção; deve exigir que o valor final use HTTPS.

6. Validação do passo.

Evidence mostra a variável de URL com prefixo seguro no deploy.

7. Cenário negativo/erro esperado.

URL de produção com `http://` deve ser bloqueada pela checklist.

### Passo 5 - Criar smoke textual

1. Objetivo funcional do passo no contexto da app.

Confirmar que a regra existe no código.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/check-mf6-https.mjs`
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: script e entrada `test:mf6:https`.

3. Instruções do que fazer.

Cria o script abaixo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Smoke textual do BK-MF6-05.
 */

import { readFileSync } from "node:fs";

/**
 * Procura um contrato textual obrigatório e devolve a sua posição no ficheiro.
 *
 * @param {string} content - Conteúdo lido do ficheiro.
 * @param {string} marker - Texto exato que deve existir.
 * @param {string} errorMessage - Erro claro para orientar a correção.
 * @returns {number} Índice onde o contrato foi encontrado.
 */
function requireMarker(content, marker, errorMessage) {
    const index = content.indexOf(marker);
    if (index === -1) {
        throw new Error(errorMessage);
    }

    return index;
}

const security = readFileSync("src/modules/security/transportSecurity.js", "utf8");
const server = readFileSync("src/server.js", "utf8");

// Primeiro validamos o middleware isolado, porque sem ele o servidor não tem regra para montar.
requireMarker(security, "HTTPS_REQUIRED", "Falta erro HTTPS_REQUIRED.");
requireMarker(security, "Strict-Transport-Security", "Falta cabeçalho HSTS.");

const trustProxyIndex = requireMarker(
    server,
    "TRUST_PROXY_HOPS",
    "Falta configuração deny-by-default de TRUST_PROXY_HOPS antes dos routers.",
);
const enforceHttpsIndex = requireMarker(
    server,
    "app.use(enforceHttps({ isProduction }))",
    "Middleware HTTPS não está montado no servidor.",
);
const hstsIndex = requireMarker(
    server,
    "app.use(applyStrictTransportSecurity({ isProduction }))",
    "Middleware HSTS não está montado no servidor.",
);
const firstAuthRouteIndex = requireMarker(
    server,
    'app.use("/api/auth"',
    "Não foi possível encontrar a primeira rota de autenticação.",
);

// A ordem é parte do contrato: proxy primeiro, depois bloqueio HTTPS e HSTS antes das rotas.
if (
    !(
        trustProxyIndex < enforceHttpsIndex &&
        enforceHttpsIndex < hstsIndex &&
        hstsIndex < firstAuthRouteIndex
    )
) {
    throw new Error("A segurança de transporte tem de ser montada antes das rotas.");
}
```

5. Explicação do código.

O smoke confirma os contratos textuais essenciais: erro de HTTPS inseguro, cabeçalho HSTS, `trust proxy`, montagem de `enforceHttps` e montagem de `applyStrictTransportSecurity` antes das rotas. Não substitui teste de infraestrutura com certificado real, mas impede que o guia seja fechado se o servidor esquecer a peça que aplica a regra globalmente.

6. Validação do passo.

Executa `cd apps/api && node scripts/check-mf6-https.mjs`.

7. Cenário negativo/erro esperado.

Se o middleware for removido, o script falha.

### Passo 6 - Testar pedido inseguro em produção simulada

1. Objetivo funcional do passo no contexto da app.

Provar que HTTP é recusado quando o ambiente pede produção.

2. Ficheiros envolvidos:
    - REVER: API em execução local.
    - LOCALIZAÇÃO: request com `NODE_ENV=production`.

3. Instruções do que fazer.

Arranca a API em modo produção local controlado e faz pedido com `x-forwarded-proto: http`.

4. Código completo, correto e integrado com a app final.

```bash
curl -i -H "x-forwarded-proto: http" http://127.0.0.1:3000/api/auth/me
```

5. Explicação do código.

O request simula proxy inseguro. A API deve recusar antes de entrar no domínio.

6. Validação do passo.

Resposta esperada: `403` com `HTTPS_REQUIRED`.

7. Cenário negativo/erro esperado.

Se devolver `200` ou `401` sem passar pelo bloqueio HTTPS, o middleware não está antes das rotas.

### Passo 7 - Confirmar caminho seguro via proxy

1. Objetivo funcional do passo no contexto da app.

Provar que a API aceita tráfego marcado como HTTPS pelo proxy.

2. Ficheiros envolvidos:
    - REVER: API em execução local.
    - LOCALIZAÇÃO: request com `x-forwarded-proto: https`.

3. Instruções do que fazer.

Repete o pedido com protocolo seguro.

4. Código completo, correto e integrado com a app final.

```bash
curl -i -H "x-forwarded-proto: https" http://127.0.0.1:3000/api/auth/me
```

5. Explicação do código.

Este cenário confirma que o middleware não bloqueia tráfego seguro encaminhado por proxy.

6. Validação do passo.

Resposta esperada: segue para autenticação e devolve `401` se não houver sessão.

7. Cenário negativo/erro esperado.

Se também devolver `403`, o proxy não está a ser reconhecido.

### Passo 8 - Registar evidence de transporte

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com prova útil para defesa.

2. Ficheiros envolvidos:
    - REVER: outputs de `curl` e smoke.
    - LOCALIZAÇÃO: PR ou relatório.

3. Instruções do que fazer.

Guarda saída de smoke, resposta `403` e resposta encaminhada.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É recolha de evidence.

5. Explicação do código.

A evidence deve separar regra da aplicação e certificado real. Certificado pertence ao deploy, mas a API já está pronta para exigir canal seguro.

6. Validação do passo.

Os três outputs ficam anexados ao PR.

7. Cenário negativo/erro esperado.

Se não houver ambiente para simular produção, regista a limitação e mantém smoke textual.

#### Critérios de aceite

- Middleware HTTPS está montado globalmente.
- HSTS é aplicado em produção.
- Desenvolvimento local não fica bloqueado.
- Pedido inseguro em produção devolve `403`.
- Negativos: mínimo `3`: proxy HTTP, URL de produção HTTP e middleware fora de ordem.

#### Validação final

- `cd apps/api && node --check src/modules/security/transportSecurity.js`
- `cd apps/api && node scripts/check-mf6-https.mjs`
- `cd apps/api && npm run test:contracts`
- Teste manual com `x-forwarded-proto`.

#### Evidence para PR/defesa

- `pr`: link ou identificador do PR.
- `proof`: resposta `403` para HTTP em produção simulada.
- `neg`: proxy HTTP, URL de produção HTTP e ausência de sessão.
- `fonte`: `RNF12`.
- `multiempresa`: transporte seguro não substitui filtro por empresa ativa.

#### Handoff

- Entrega segurança de transporte para os cookies e autenticação dos próximos BKs.
- Próximo BK recomendado: `BK-MF6-06`

#### Changelog

- `2026-06-23`: smoke textual reforçado para validar `trust proxy`, `enforceHttps`, HSTS montado e ordem antes das rotas.
- `2026-06-22`: guia revisto com middleware HTTPS, HSTS, validação por proxy, smoke e evidence.
