# BK-MF0-01 - Registo, login e logout com cookies HttpOnly.

## Header

- `doc_id`: `GUIA-BK-MF0-01`
- `bk_id`: `BK-MF0-01`
- `macro`: `MF0`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF01`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-02`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-01-registo-login-e-logout-com-cookies-httponly.md`
- `last_updated`: `2026-07-10`

#### BK-MF0-01 - Registo, login e logout com cookies HttpOnly.

##### O que vamos fazer neste BK

Neste BK vamos transformar o requisito RF01 num guia de execução para construir a parte da app relacionada com identidade. O foco não é produzir documentação genérica: é deixar claro que modelos, endpoints, validações, UI e evidência devem existir quando a equipa implementar o BK.

A implementação pedagógica usa os caminhos públicos `apps/api` e `apps/web` e segue os contratos atuais de `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` e `docs/planificacao/CONTRATO-INTERFACES-IMPLEMENTACAO.md`. O estado `TODO` descreve apenas o progresso dos alunos; não significa ausência de uma implementação privada de referência.

Como a fase alvo é MF0, não existem BKs de fases anteriores a reutilizar. A continuidade nasce aqui: os outputs deste BK devem ser contratos estáveis para BK-MF0-02 e para os BKs de vendas, compras, inventário, contabilidade e segurança das fases seguintes.

##### Porque é que isto é importante

- Funcionalmente, cobre RF01 e desbloqueia o fluxo seguinte da MF0.
- Tecnicamente, cria contratos de User, Session e API que outros BKs podem reutilizar.
- Pedagogicamente, mostra aos alunos a ligação entre requisito, modelo, endpoint, UI, teste e evidence.
- Em segurança/robustez, obriga a validar dados no backend e a tratar erros previsíveis.
- Para continuidade, prepara explicitamente o handoff para BK-MF0-02.

##### O que entra (scope)

- Criar modelo de utilizador com email único e password protegida por hash.
- Criar modelo de sessão server-side com expiração e revogação.
- Expor endpoints de registo, login, logout e utilizador autenticado.
- Ligar a página de login do frontend a um cliente API real, sem guardar sessão em localStorage.
- Validar credenciais, duplicados e falta de cookie com respostas controladas.
- Aplicar rate limiting partilhado em Redis, com chaves HMAC que não guardam IP ou email em claro.
- Persistir eventos de segurança de login, logout, falha e criação/revogação de sessão em `SecurityAuditEvent`.

##### O que não entra (scope-out)

- Recuperação de password, porque pertence ao BK-MF0-05.
- Papéis e permissões finas, porque pertencem ao BK-MF0-02.
- 2FA ou OAuth externo, porque não estão nos RF/RNF do MVP.
- Gestão multiempresa, porque entra no BK-MF0-03.

##### Como saber que isto ficou bem

- O caso principal de Registo, login e logout com cookies HttpOnly funciona através da UI ou de chamadas API documentadas.
- Os endpoints definidos respondem com códigos HTTP previsíveis e sem expor dados sensíveis.
- Os validadores rejeitam entradas inválidas antes de chegar a persistência.
- A evidence inclui smoke, negativos, ficheiros alterados e comandos executados.
- Não existe ALTERAÇÃO DE CONTRATO face aos documentos canónicos; se surgir, deve ser marcada e justificada.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `TODO` (CANONICO; não marcar DONE apenas por o guia estar detalhado)
- Esforço: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Oleksii` (CANONICO)
- Apoio: `Andre` (CANONICO)
- Dependências (BK IDs): `-` (CANONICO)
- Pré-condições: Sem dependências anteriores declaradas. O scaffold pedagógico pode ainda estar incompleto; usar `apps/api` e `apps/web` e respeitar os contratos centrais atuais. (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL.md` MF0; `PLANO-SPRINTS.md` S01-S02. (CANONICO)
- Flow ID: `FLOW-AUTH-SESSION` (DERIVADO)
- Fonte de verdade: `docs/RF.md` -> `RF01` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descrição: Registo, login e logout com cookies HttpOnly. (CANONICO)
- Stack decidida: `DERIVADO` e centralizada em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; este BK ensina o mesmo contrato seguro nos caminhos públicos dos alunos.
- Mockup usado: `mockup/` existe e foi usado como referência de fluxo, hierarquia e nomes visíveis; não é contrato pixel-perfect.

#### O que vamos fazer neste BK (DERIVADO):

- Estado esperado antes do BK: Não existe app real fora do mockup; não há contrato de sessão implementado.
- Estado esperado depois do BK: A app tem base de autenticação com registo, login, logout, sessão server-side e cookie HttpOnly preparado para proteger os BKs seguintes.
- Ficheiros a criar/editar/rever: schema Prisma, módulo backend `identidade`, cliente API frontend e componentes/páginas referenciados em `mockup/src/app/components/Login.tsx e mockup/src/app/context/AuthContext.tsx`.
- Dependências de BK anteriores e uso: Sem dependências anteriores declaradas.
- Impacto na arquitetura: reforça separação entre routes, controllers, services, validators e UI.
- Impacto frontend: liga o fluxo visual do mockup a API real com estados loading/error/empty/success quando aplicável.
- Impacto backend/dados: cria ou prepara `User, Session` e endpoints `POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me`.
- Impacto segurança: valida inputs no backend, aplica sessão/permissão quando aplicável e evita exposição de dados sensíveis.
- Impacto testes: exige smoke e 3 negativos concretos.
- Handoff: BK-MF0-02 deve reutilizar os contratos aqui criados.

#### Pré-leitura mínima (10-15 min) (DERIVADO):

- `README.md` secções 1, 4, 5 e 7.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` para stack assumida e regras de adaptação de caminhos.
- `docs/RF.md` linha do requisito `RF01`.
- `docs/RNF.md` secções RNF05, RNF06, RNF12-RNF17, RNF25-RNF30 quando aplicável.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` linha deste BK.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` linha deste BK.
- `docs/planificacao/backlogs/MF-VIEWS.md` -> MF0.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` -> S01-S02.
- Mockup: `mockup/src/app/components/Login.tsx e mockup/src/app/context/AuthContext.tsx`.
- BKs anteriores: não existem dependências formais anteriores para este BK.

#### Glossário (rápido) (DERIVADO):

- **Cookie HttpOnly:** Cookie que o JavaScript do browser não consegue ler; reduz impacto de XSS sobre a sessão.
- **Sessão server-side:** Registo no servidor que associa um identificador de cookie a um utilizador autenticado.
- **Hash de password:** Transformação irreversível da password antes de a guardar na base de dados.
- **Middleware:** Função Express que corre entre request e controller para validar sessão ou tratar erros.
- **CSRF:** Ataque em que outro site tenta usar o cookie do utilizador; SameSite ajuda a reduzir o risco.

#### Conceitos teóricos essenciais (DERIVADO):

- Express organiza os endpoints HTTP. Neste BK, as rotas /api/auth/\* recebem pedidos do frontend e encaminham para controllers pequenos.
- O controller deve validar a request e chamar o service. A regra de autenticar, criar sessão e invalidar sessão deve ficar no service para poder ser testada sem HTTP.
- Cookies HttpOnly são mais seguros do que localStorage para sessão porque não ficam acessíveis por scripts do browser. Mesmo assim, validação backend e proteção CSRF continuam importantes.
- Passwords nunca devem ser guardadas em texto puro. O RNF13 pede bcrypt com salt seguro; se a equipa ainda não adicionou dependências, a escolha deve ser justificada no PR.
- **Erros comuns a evitar:** implementar só no frontend, confiar em dados enviados pelo browser, esquecer `companyId` nos dados por empresa, devolver mensagens técnicas cruas ao utilizador ou criar campos que não aparecem nos RF/RNF.
- **Negativos de segurança/robustez:** todos os casos inválidos devem falhar de forma controlada, sem stack traces, sem dados sensíveis e sem escrita parcial na base de dados.

##### Contrato de paridade obrigatório (2026-07-10)

- O rate limiter de autenticação usa Redis com TTL e operações atómicas. `REDIS_URL`, `REDIS_KEY_PREFIX` e uma `RATE_LIMIT_HMAC_KEY` com pelo menos 32 bytes são obrigatórios em produção; se faltarem, o arranque falha. Um store local só é permitido em desenvolvimento ou num teste unitário que o escolha explicitamente.
- A chave Redis deriva de `HMAC-SHA-256(RATE_LIMIT_HMAC_KEY, identificador normalizado)`. Nunca guardar IP, email, cookie, token ou password em claro na chave, valor ou log.
- Login, logout, falhas e password reset criam `SecurityAuditEvent` persistente. A escrita guarda identificadores pseudonimizados/HMAC e metadados redigidos; não guarda email ou IP em claro.
- A API devolve `429 RATE_LIMITED` quando a quota é excedida e nunca fica silenciosamente sem proteção numa configuração equivalente a produção.
- Os testes de integração devem provar que duas instâncias da API partilham o mesmo contador Redis e TTL; um scanner textual ou um store em memória não fecha este contrato.

#### Tutorial técnico linear (DERIVADO):

Este tutorial organiza o BK em passos lineares. O aluno deve seguir de cima para baixo: confirmar contratos, modelar dados, validar entradas, implementar regras de negócio, expor HTTP, testar e deixar handoff. Se o scaffold pedagógico ainda estiver incompleto, usar `apps/api` e `apps/web`, seguir os contratos centrais atuais e registar a adaptação na evidence.

### Passo 1 - Confirmar contrato, scope e ligação aos BKs vizinhos

1. Objetivo funcional do passo no ERP.

Confirmar a regra de negócio do BK, o RF/RNF associado e o impacto nos BKs seguintes antes de escrever código.

2. Ficheiros envolvidos:
    - CRIAR:
    - Nenhum ficheiro novo neste passo.
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Topo deste guia e documentos canónicos de planeamento.
    - REVER:
    - README.md
    - docs/RF.md
    - docs/RNF.md
    - docs/planificacao/backlogs/BACKLOG-MVP.md
    - docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md
    - docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md
    - docs/planificacao/backlogs/MF-VIEWS.md
    - docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md

3. Instruções do que fazer.

Confirma que não vais alterar RF, RNF, ID do BK, owner, prioridade ou dependências. Se o scaffold real divergir de `apps/api` e `apps/web`, adapta caminhos sem alterar contratos de negócio e regista essa decisão na evidence.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O objetivo é impedir drift antes da implementação.

5. Explicação do código.

Este passo existe para evitar que o aluno comece por copiar código sem perceber o contrato. Num ERP, uma decisão errada no inicio, por exemplo tratar role como global ou ignorar companyId, propaga erros para faturação, compras, stock e contabilidade.

6. Validação do passo.

Antes de avançar, escreve na evidence qual RF/RNF cobre este BK e que BK seguinte depende dele.

7. Cenário negativo/erro esperado.

Se encontrares uma regra que não aparece em RF/RNF/backlog, não a implementes: marca como decisão em falta no Passo 7.

### Passo 2 - Modelar dados e constraints na base de dados

1. Objetivo funcional do passo no ERP.

Criar a estrutura persistente que suporta a regra do BK sem duplicados, estados impossíveis ou fuga entre empresas.

2. Ficheiros envolvidos:
    - CRIAR:
    - Nenhum ficheiro novo neste passo.
    - EDITAR:
    - apps/api/prisma/schema.prisma
    - LOCALIZACAO:
    - Inserir os modelos junto dos modelos do mesmo domínio; quando o BK disser para atualizar um modelo existente, substituir o bloco antigo por uma versão coerente.
    - REVER:
    - docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md
    - BKs anteriores da MF0 que criam modelos reutilizados.

3. Instruções do que fazer.

Aplica primeiro o schema. Se o modelo pertencer a uma empresa, usa `companyId` e indices/constraints por empresa. Se o modelo atualizar `User`, `Company` ou `Session`, faz a substituição completa indicada para evitar campos duplicados ou relações partidas.

4. Código completo, correto e integrado com a app final.

Localização: acrescentar estes blocos a `apps/api/prisma/schema.prisma`. Se o ficheiro já existir, inserir junto dos restantes modelos de identidade, sem duplicar modelos.

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  name         String?
  passwordHash String
  isActive     Boolean   @default(true)
  sessions     Session[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Session {
  id        String    @id
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  @@index([userId])
  @@index([expiresAt])
}
```

5. Explicação do código.

O schema é a camada mais baixa de integridade. Mesmo que o frontend tenha boas validações, a base de dados deve impedir duplicados e relações impossíveis. Em OPSA isto é crítico porque clientes, fornecedores, artigos, contas SNC, períodos fiscais e armazéns alimentam documentos fiscais e contabilísticos futuros.

6. Validação do passo.

Executa a geração/migração Prisma quando o scaffold existir e confirma que não há nomes de modelos ou relações duplicados.

7. Cenário negativo/erro esperado.

Tentar criar dois registos que violam uma constraint única deve falhar com conflito controlado, normalmente `409` no service/controller.

### Passo 3 - Criar validadores, helpers e adaptadores de infraestrutura

1. Objetivo funcional do passo no ERP.

Validar entradas antes da regra de negócio e isolar detalhes técnicos como cookies, hash, email ou permissão.

2. Ficheiros envolvidos:
    - CRIAR:
    - apps/api/src/lib/httpErrors.js
    - apps/api/src/modules/auth/password.js
    - apps/api/src/modules/auth/sessionCookie.js
    - apps/api/src/modules/auth/authValidators.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar dentro do módulo do domínio em `apps/api/src/modules/...`; helpers partilhados ficam em `apps/api/src/lib` quando usados por vários BKs.
    - REVER:
    - docs/RNF.md: RNF05, RNF06, RNF12-RNF17, RNF21 quando existir email.

3. Instruções do que fazer.

Cria estes ficheiros antes dos services. Os services devem receber dados já normalizados e não devem repetir regex ou parse manual espalhado pelo código.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/lib/httpErrors.js`.

```js
export class HttpError extends Error {
    constructor(status, code, message, details = undefined) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

export function httpError(status, code, message, details = undefined) {
    return new HttpError(status, code, message, details);
}

export function toHttpError(error) {
    if (error instanceof HttpError) return error;

    // Evita expor stack traces ou detalhes internos ao aluno/utilizador final.
    return new HttpError(500, "INTERNAL_ERROR", "Erro interno inesperado");
}
```

Localização: criar `apps/api/src/modules/auth/password.js`.

```js
import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}
```

Localização: criar `apps/api/src/modules/auth/sessionCookie.js`.

```js
const COOKIE_NAME = "sid";
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

export function setSessionCookie(res, sessionId, isProduction) {
    res.cookie(COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_MS,
    });
}

export function clearSessionCookie(res, isProduction) {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
    });
}

export function readSessionCookie(req) {
    const rawCookie = req.headers.cookie ?? "";
    const cookies = rawCookie.split(";").map((part) => part.trim());
    const sessionCookie = cookies.find((part) =>
        part.startsWith(`${COOKIE_NAME}=`),
    );

    if (!sessionCookie) return null;
    return decodeURIComponent(sessionCookie.slice(COOKIE_NAME.length + 1));
}
```

Localização: criar `apps/api/src/modules/auth/authValidators.js`.

```js
import { httpError } from "../../lib/httpErrors.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asObject(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(
            400,
            "INVALID_BODY",
            "O corpo do pedido deve ser um objeto JSON",
        );
    }
    return body;
}

function normalizeEmail(email) {
    if (typeof email !== "string") {
        throw httpError(400, "INVALID_EMAIL", "O email é obrigatório");
    }

    const normalized = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
        throw httpError(
            400,
            "INVALID_EMAIL",
            "O email deve ter formato valido",
        );
    }

    return normalized;
}

function validatePassword(password) {
    if (typeof password !== "string" || password.length < 10) {
        throw httpError(
            400,
            "WEAK_PASSWORD",
            "A password deve ter pelo menos 10 caracteres",
        );
    }

    return password;
}

export function validateRegisterPayload(body) {
    const payload = asObject(body);

    return {
        email: normalizeEmail(payload.email),
        password: validatePassword(payload.password),
        name:
            typeof payload.name === "string"
                ? payload.name.trim() || null
                : null,
    };
}

export function validateLoginPayload(body) {
    const payload = asObject(body);

    return {
        email: normalizeEmail(payload.email),
        password: validatePassword(payload.password),
    };
}
```

5. Explicação do código.

Validadores e helpers tornam o código mais fácil de testar e explicar. Um aluno consegue perceber que validar NIF, email, datas ou dinheiro não é detalhe visual: é defesa da integridade da empresa e da contabilidade.

6. Validação do passo.

Testa payloads inválidos diretamente contra as funções ou endpoint e confirma resposta `400` com mensagem clara.

7. Cenário negativo/erro esperado.

Um payload mal formado não pode chegar ao Prisma; deve parar no validator com `400`.

### Passo 4 - Implementar services e middleware de regra de negócio

1. Objetivo funcional do passo no ERP.

Concentrar a regra do ERP em funções testáveis, separadas de HTTP e frontend.

2. Ficheiros envolvidos:
    - CRIAR:
    - apps/api/src/modules/auth/authService.js
    - apps/api/src/modules/auth/authMiddleware.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar no módulo backend do domínio; middlewares reutilizáveis ficam junto do domínio que fornece o contexto.
    - REVER:
    - BKs anteriores que fornecem `requireAuth`, `requireCompanyContext`, permissões, User, Company ou dados mestre.

3. Instruções do que fazer.

Implementa services depois dos validadores. Quando houver dados empresariais, recebe sempre `companyId` vindo da sessão/contexto, nunca do body. Quando houver role/permissão, garante que a rota chama o guard antes do service.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/auth/authService.js`.

```js
import crypto from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";
import { hashPassword, verifyPassword } from "./password.js";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function createSessionId() {
    return crypto.randomBytes(32).toString("hex");
}

function publicUser(user) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
    };
}

async function createSession(prisma, userId, now) {
    return prisma.session.create({
        data: {
            id: createSessionId(),
            userId,
            expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
        },
    });
}

export async function registerUser(prisma, input, now = new Date()) {
    const existing = await prisma.user.findUnique({
        where: { email: input.email },
    });
    if (existing) {
        throw httpError(
            409,
            "EMAIL_ALREADY_EXISTS",
            "Já existe um utilizador com este email",
        );
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
        data: {
            email: input.email,
            name: input.name,
            passwordHash,
        },
    });

    const session = await createSession(prisma, user.id, now);
    return {
        user: publicUser(user),
        sessionId: session.id,
        expiresAt: session.expiresAt,
    };
}

export async function loginUser(prisma, input, now = new Date()) {
    const user = await prisma.user.findUnique({
        where: { email: input.email },
    });

    if (!user || !user.isActive) {
        throw httpError(401, "INVALID_CREDENTIALS", "Credenciais inválidas");
    }

    const passwordMatches = await verifyPassword(
        input.password,
        user.passwordHash,
    );
    if (!passwordMatches) {
        throw httpError(401, "INVALID_CREDENTIALS", "Credenciais inválidas");
    }

    const session = await createSession(prisma, user.id, now);
    return {
        user: publicUser(user),
        sessionId: session.id,
        expiresAt: session.expiresAt,
    };
}

export async function resolveSession(prisma, sessionId, now = new Date()) {
    if (!sessionId) {
        throw httpError(401, "SESSION_REQUIRED", "Sessão obrigatória");
    }

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
    });

    if (
        !session ||
        session.revokedAt ||
        session.expiresAt <= now ||
        !session.user.isActive
    ) {
        throw httpError(401, "INVALID_SESSION", "Sessão inválida ou expirada");
    }

    return { session, user: publicUser(session.user) };
}

export async function logoutUser(prisma, sessionId, now = new Date()) {
    if (!sessionId) return;

    await prisma.session.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { revokedAt: now },
    });
}
```

Localização: criar `apps/api/src/modules/auth/authMiddleware.js`.

```js
import { toHttpError } from "../../lib/httpErrors.js";
import { readSessionCookie } from "./sessionCookie.js";
import { resolveSession } from "./authService.js";

export function requireAuth(prisma) {
    return async function authMiddleware(req, res, next) {
        try {
            const sessionId = readSessionCookie(req);
            const context = await resolveSession(prisma, sessionId);

            // Estes campos são reutilizados pelos BKs de permissões e multiempresa.
            req.session = context.session;
            req.user = context.user;
            return next();
        } catch (error) {
            const httpError = toHttpError(error);
            return res
                .status(httpError.status)
                .json({ error: httpError.code, message: httpError.message });
        }
    };
}
```

5. Explicação do código.

O service é onde vive a regra de negócio. Isto evita controllers gigantes e impede que a UI seja a única barreira de segurança. Em OPSA, esta separação ajuda a garantir que IA, frontend ou scripts futuros não alteram dados contabilísticos sem passar pelas mesmas regras.

6. Validação do passo.

Testa o service com dados válidos e inválidos. Confirma que queries usam `companyId` quando aplicável e que estados sensíveis devolvem `409` ou `403` conforme o caso.

7. Cenário negativo/erro esperado.

Tentar aceder a dados de outra empresa, ou executar uma ação sem permissão, deve falhar sem expor dados existentes.

### Passo 5 - Expor controllers, rotas e registo no servidor

1. Objetivo funcional do passo no ERP.

Transformar a regra de negócio em API HTTP previsível para o frontend e para testes.

2. Ficheiros envolvidos:
    - CRIAR:
    - apps/api/src/modules/auth/authController.js
    - apps/api/src/modules/auth/authRoutes.js
    - EDITAR:
    - apps/api/src/server.js
    - LOCALIZACAO:
    - Controllers e routes ficam no módulo do domínio; o `server.js` apenas monta o router no prefixo `/api/...`.
    - REVER:
    - docs/RNF.md: RNF25 e RNF28
    - Contratos de endpoints indicados no header do BK.

3. Instruções do que fazer.

Cria controllers finos: ler request, chamar validator/service e traduzir erros para HTTP. Regista o router no servidor sem misturar regra de negócio no `server.js`.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/auth/authController.js`.

```js
import { toHttpError } from "../../lib/httpErrors.js";
import {
    validateLoginPayload,
    validateRegisterPayload,
} from "./authValidators.js";
import {
    loginUser,
    logoutUser,
    registerUser,
    resolveSession,
} from "./authService.js";
import {
    clearSessionCookie,
    readSessionCookie,
    setSessionCookie,
} from "./sessionCookie.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildAuthController({ prisma, isProduction }) {
    return {
        async register(req, res) {
            try {
                const input = validateRegisterPayload(req.body);
                const result = await registerUser(prisma, input);
                setSessionCookie(res, result.sessionId, isProduction);
                return res
                    .status(201)
                    .json({ user: result.user, expiresAt: result.expiresAt });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async login(req, res) {
            try {
                const input = validateLoginPayload(req.body);
                const result = await loginUser(prisma, input);
                setSessionCookie(res, result.sessionId, isProduction);
                return res
                    .status(200)
                    .json({ user: result.user, expiresAt: result.expiresAt });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async me(req, res) {
            try {
                const sessionId = readSessionCookie(req);
                const result = await resolveSession(prisma, sessionId);
                return res.status(200).json({ user: result.user });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async logout(req, res) {
            try {
                const sessionId = readSessionCookie(req);
                await logoutUser(prisma, sessionId);
                clearSessionCookie(res, isProduction);
                return res.status(204).send();
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
```

Localização: criar `apps/api/src/modules/auth/authRoutes.js`.

```js
import { Router } from "express";
import { buildAuthController } from "./authController.js";

export function buildAuthRoutes({ prisma, isProduction }) {
    const router = Router();
    const controller = buildAuthController({ prisma, isProduction });

    router.post("/register", controller.register);
    router.post("/login", controller.login);
    router.get("/me", controller.me);
    router.post("/logout", controller.logout);

    return router;
}
```

Localização: editar `apps/api/src/server.js`, junto das restantes rotas.

```js
import { buildAuthRoutes } from "./modules/auth/authRoutes.js";

app.use(
    "/api/auth",
    buildAuthRoutes({
        prisma,
        isProduction: process.env.NODE_ENV === "production",
    }),
);
```

5. Explicação do código.

A API é o contrato entre backend e frontend. Ao manter controller pequeno, o aluno percebe onde colocar cada responsabilidade: validação no validator, regra no service, transporte HTTP no controller/route.

6. Validação do passo.

Chama o endpoint principal com payload válido e confirma status `200` ou `201` conforme a operação.

7. Cenário negativo/erro esperado.

Sem sessão, sem empresa ativa ou sem permissão, o endpoint deve devolver `401` ou `403` antes de chamar o service.

### Passo 6 - Validar payloads, respostas e cenários negativos

1. Objetivo funcional do passo no ERP.

Demonstrar que o BK funciona para o caso principal e falha bem nos casos perigosos.

2. Ficheiros envolvidos:
    - CRIAR:
    - docs/evidence/<BK_ID>.md quando a equipa fechar o BK.
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Evidence do PR/defesa e testes automatizados quando existirem.
    - REVER:
    - Payloads e negativos abaixo.
    - docs/planificacao/sprints/PLANO-SPRINTS.md quando existir planeamento de sprint.

3. Instruções do que fazer.

Executa primeiro o smoke principal e depois os negativos. Guarda status HTTP, payload enviado e resposta recebida. Não marques DONE sem evidence.

4. Código completo, correto e integrado com a app final.

Pedido `POST /api/auth/register`:

```json
{
    "email": "ana.silva@example.pt",
    "password": "UmaPasswordForte2026",
    "name": "Ana Silva"
}
```

Resposta `201`:

```json
{
    "user": {
        "id": "uuid",
        "email": "ana.silva@example.pt",
        "name": "Ana Silva",
        "isActive": true
    },
    "expiresAt": "2026-05-29T18:30:00.000Z"
}
```

Erros esperados:

- `400 INVALID_EMAIL`: email ausente ou inválido.
- `400 WEAK_PASSWORD`: password com menos de 10 caracteres.
- `401 INVALID_CREDENTIALS`: login com email/password errados.
- `401 INVALID_SESSION`: cookie inexistente, expirado ou revogado.
- `429 RATE_LIMITED`: demasiadas tentativas de registo ou login na janela configurada.
- `409 EMAIL_ALREADY_EXISTS`: tentativa de registo com email já existente.
- `503 RATE_LIMIT_STORE_REQUIRED`: em produção, rate limit de autenticação sem armazenamento partilhado configurado.

- Registo com email repetido deve devolver `409`.
- Login com password errada deve devolver `401` e não indicar se o email existe.
- Excesso de tentativas de login/registo deve devolver `429`.
- `GET /api/auth/me` sem cookie deve devolver `401`.

- Smoke manual: registar utilizador, confirmar `Set-Cookie` HttpOnly, chamar `GET /api/auth/me`, fazer logout e confirmar que `GET /api/auth/me` passa a `401`.
- Teste técnico: validar que `passwordHash` existe na base de dados mas nunca aparece na resposta JSON.
- Regressão para BK seguinte: guardar o cookie real para usar em `BK-MF0-02`.

#

5. Explicação do código.

Testar negativos ensina que segurança não é só o caminho feliz. Um ERP deve recusar dados fiscais inválidos, acessos sem role, conflitos de unicidade e alterações em períodos fechados de forma previsível.

6. Validação do passo.

A evidence deve mostrar pelo menos o smoke principal, os negativos exigidos pela prioridade e qualquer comando executado.

7. Cenário negativo/erro esperado.

Se um erro devolve stack trace, segredo, dados de outra empresa ou status genérico errado, o BK ainda não está pronto.

### Passo 7 - Registar decisões em falta, evidence e handoff

1. Objetivo funcional do passo no ERP.

Fechar o BK como tutorial técnico que o próximo aluno consegue continuar sem adivinhar contratos.

2. Ficheiros envolvidos:
    - CRIAR:
    - docs/evidence/<BK_ID>.md ou descrição equivalente no PR.
    - EDITAR:
    - Secção Evidence deste guia apenas quando houver PR/defesa real.
    - LOCALIZACAO:
    - Fim do guia: critérios, validação final, evidence, handoff e changelog.
    - REVER:
    - BK seguinte indicado em `proximo_bk` e BKs dependentes futuros.

3. Instruções do que fazer.

Se falta fonte documental ou decisão de arquitetura, não inventes. Regista exatamente o que falta confirmar e qual o impacto. Depois escreve o handoff para o BK seguinte.

4. Código completo, correto e integrado com a app final.

Decisões em falta a manter visíveis durante a implementação:

- Confirmar no setup real se `bcrypt` já existe em `package.json`. A dependência é exigida por RNF13; se não existir, adicionar explicitamente no BK com justificação.

5. Explicação do código.

O handoff protege continuidade. Num projeto PAP com vários alunos, a qualidade não está só no código: está também em deixar claro o que ficou decidido, o que ainda falta decidir e que contratos o próximo BK pode reutilizar.

6. Validação do passo.

Confirma que o final do BK contém apenas critérios de aceite, validação final, evidence, handoff e changelog.

7. Cenário negativo/erro esperado.

Se o handoff diz para usar algo que não foi criado neste BK ou num BK anterior, há contrato partido e deve ser corrigido antes de avançar.

## Critérios de aceite

- O BK-MF0-01 cumpre os critérios mensuráveis definidos acima.
- O contrato canónico do RF01 continua alinhado com backlog, matriz e MF-VIEWS.

## Validação final

- Executar o smoke principal descrito no Passo 6.
- Executar todos os cenários negativos do Passo 6.
- Confirmar que os ficheiros do Passo 2 ao Passo 5 existem nos caminhos reais da app ou que a adaptação ficou documentada na evidence.
- Confirmar que não houve drift em RF/RNF, owner, prioridade, dependências ou escopo.
- Confirmar que o handoff abaixo está compreensível para o próximo BK.

## Evidence para PR/defesa

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher após validação`
- `neg`: `A preencher após testes negativos`

## Handoff

O próximo BK deve reutilizar `requireAuth`, `req.user` e a resposta segura de `GET /api/auth/me`. Ainda não deve assumir empresa ativa; isso só fica fechado no `BK-MF0-03`.

- Próximo BK recomendado: `BK-MF0-02`.

## Changelog

- `2026-07-10`: handoff sincronizado explicitamente com o próximo BK canónico do header.
- `2026-05-24`: guia refinado para estrutura step-by-step executável, com continuidade MF0, mockup, negativos, critérios e evidence.
- `2026-04-19`: metadados canónicos preservados da vaga de normalização.
