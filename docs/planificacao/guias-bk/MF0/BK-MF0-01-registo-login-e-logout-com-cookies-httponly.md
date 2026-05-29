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
- `last_updated`: `2026-05-24`

#### BK-MF0-01 - Registo, login e logout com cookies HttpOnly.

##### O que vamos fazer neste BK

Neste BK vamos transformar o requisito RF01 num guia de execucao para construir a parte da app relacionada com identidade. O foco nao e produzir documentacao generica: e deixar claro que modelos, endpoints, validacoes, UI e evidencia devem existir quando a equipa implementar o BK.

A app real ainda esta marcada como `sem_codigo`; por isso, os caminhos tecnicos propostos seguem o contrato central `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`. Esse contrato define a stack assumida, a estrutura indicativa e a regra de adaptacao quando existir scaffold real, sem alterar RF, BK, owners, dependencias ou criterios de aceite.

Como a fase alvo e MF0, nao existem BKs de fases anteriores a reutilizar. A continuidade nasce aqui: os outputs deste BK devem ser contratos estaveis para BK-MF0-02 e para os BKs de vendas, compras, inventario, contabilidade e seguranca das fases seguintes.

##### Porque e que isto e importante

- Funcionalmente, cobre RF01 e desbloqueia o fluxo seguinte da MF0.
- Tecnicamente, cria contratos de User, Session e API que outros BKs podem reutilizar.
- Pedagogicamente, mostra aos alunos a ligacao entre requisito, modelo, endpoint, UI, teste e evidence.
- Em seguranca/robustez, obriga a validar dados no backend e a tratar erros previsiveis.
- Para continuidade, prepara explicitamente o handoff para BK-MF0-02.

##### O que entra (scope)

- Criar modelo de utilizador com email unico e password protegida por hash.
- Criar modelo de sessao server-side com expiracao e revogacao.
- Expor endpoints de registo, login, logout e utilizador autenticado.
- Ligar a pagina de login do frontend a um cliente API real, sem guardar sessao em localStorage.
- Validar credenciais, duplicados e falta de cookie com respostas controladas.

##### O que nao entra (scope-out)

- Recuperacao de password, porque pertence ao BK-MF0-05.
- Papeis e permissoes finas, porque pertencem ao BK-MF0-02.
- 2FA ou OAuth externo, porque nao estao nos RF/RNF do MVP.
- Gestao multiempresa, porque entra no BK-MF0-03.

##### Como saber que isto ficou bem

- O caso principal de Registo, login e logout com cookies HttpOnly funciona atraves da UI ou de chamadas API documentadas.
- Os endpoints definidos respondem com codigos HTTP previsiveis e sem expor dados sensiveis.
- Os validadores rejeitam entradas invalidas antes de chegar a persistencia.
- A evidence inclui smoke, negativos, ficheiros alterados e comandos executados.
- Nao existe ALTERACAO DE CONTRATO face aos documentos canonicos; se surgir, deve ser marcada e justificada.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `TODO` (CANONICO; nao marcar DONE apenas por o guia estar detalhado)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Oleksii` (CANONICO)
- Apoio: `Andre` (CANONICO)
- Dependencias (BK IDs): `-` (CANONICO)
- Pre-condicoes: Sem dependencias anteriores declaradas. App real pode ainda nao existir; nesse caso criar a estrutura tecnica assumida antes dos ficheiros alvo. (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL.md` MF0; `PLANO-SPRINTS.md` S01-S02. (CANONICO)
- Flow ID: `FLOW-AUTH-SESSION` (DERIVADO)
- Fonte de verdade: `docs/RF.md` -> `RF01` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Registo, login e logout com cookies HttpOnly. (CANONICO)
- Stack decidida: `DERIVADO` e centralizada em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; este BK usa essa stack apenas como assuncao tecnica ate existir scaffold real.
- Mockup usado: `mockup/` existe e foi usado como referencia de fluxo, hierarquia e nomes visiveis; nao e contrato pixel-perfect.

#### O que vamos fazer neste BK (DERIVADO):

- Estado esperado antes do BK: Nao existe app real fora do mockup; nao ha contrato de sessao implementado.
- Estado esperado depois do BK: A app tem base de autenticacao com registo, login, logout, sessao server-side e cookie HttpOnly preparado para proteger os BKs seguintes.
- Ficheiros a criar/editar/rever: schema Prisma, modulo backend `identidade`, cliente API frontend e componentes/paginas referenciados em `mockup/src/app/components/Login.tsx e mockup/src/app/context/AuthContext.tsx`.
- Dependencias de BK anteriores e uso: Sem dependencias anteriores declaradas.
- Impacto na arquitetura: reforca separacao entre routes, controllers, services, validators e UI.
- Impacto frontend: liga o fluxo visual do mockup a API real com estados loading/error/empty/success quando aplicavel.
- Impacto backend/dados: cria ou prepara `User, Session` e endpoints `POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me`.
- Impacto seguranca: valida inputs no backend, aplica sessao/permissao quando aplicavel e evita exposicao de dados sensiveis.
- Impacto testes: exige smoke e 3 negativos concretos.
- Handoff: BK-MF0-02 deve reutilizar os contratos aqui criados.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- `README.md` seccoes 1, 4, 5 e 7.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` para stack assumida e regras de adaptacao de caminhos.
- `docs/RF.md` linha do requisito `RF01`.
- `docs/RNF.md` seccoes RNF05, RNF06, RNF12-RNF17, RNF25-RNF30 quando aplicavel.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` linha deste BK.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` linha deste BK.
- `docs/planificacao/backlogs/MF-VIEWS.md` -> MF0.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` -> S01-S02.
- Mockup: `mockup/src/app/components/Login.tsx e mockup/src/app/context/AuthContext.tsx`.
- BKs anteriores: nao existem dependencias formais anteriores para este BK.

#### Glossario (rapido) (DERIVADO):

- **Cookie HttpOnly:** Cookie que o JavaScript do browser nao consegue ler; reduz impacto de XSS sobre a sessao.
- **Sessao server-side:** Registo no servidor que associa um identificador de cookie a um utilizador autenticado.
- **Hash de password:** Transformacao irreversivel da password antes de a guardar na base de dados.
- **Middleware:** Funcao Express que corre entre request e controller para validar sessao ou tratar erros.
- **CSRF:** Ataque em que outro site tenta usar o cookie do utilizador; SameSite ajuda a reduzir o risco.

#### Conceitos teoricos essenciais (DERIVADO):

- Express organiza os endpoints HTTP. Neste BK, as rotas /api/auth/* recebem pedidos do frontend e encaminham para controllers pequenos.
- O controller deve validar a request e chamar o service. A regra de autenticar, criar sessao e invalidar sessao deve ficar no service para poder ser testada sem HTTP.
- Cookies HttpOnly sao mais seguros do que localStorage para sessao porque nao ficam acessiveis por scripts do browser. Mesmo assim, validacao backend e protecao CSRF continuam importantes.
- Passwords nunca devem ser guardadas em texto puro. O RNF13 pede bcrypt com salt seguro; se a equipa ainda nao adicionou dependencias, a escolha deve ser justificada no PR.
- **Erros comuns a evitar:** implementar so no frontend, confiar em dados enviados pelo browser, esquecer `companyId` nos dados por empresa, devolver mensagens tecnicas cruas ao utilizador ou criar campos que nao aparecem nos RF/RNF.
- **Negativos de seguranca/robustez:** todos os casos invalidos devem falhar de forma controlada, sem stack traces, sem dados sensiveis e sem escrita parcial na base de dados.

#### Tutorial tecnico linear (DERIVADO):

Este tutorial organiza o BK em passos lineares. O aluno deve seguir de cima para baixo: confirmar contratos, modelar dados, validar entradas, implementar regras de negocio, expor HTTP, testar e deixar handoff. Sempre que o scaffold real ainda nao existir, usar a estrutura prevista em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` e registar a adaptacao na evidence.

### Passo 1 - Confirmar contrato, scope e ligacao aos BKs vizinhos

1. Objetivo funcional do passo no ERP.

Confirmar a regra de negocio do BK, o RF/RNF associado e o impacto nos BKs seguintes antes de escrever codigo.

2. Ficheiros envolvidos:
   - CRIAR:
   - Nenhum ficheiro novo neste passo.
   - EDITAR:
   - Nenhum ficheiro existente neste passo.
   - LOCALIZACAO:
   - Topo deste guia e documentos canonicos de planeamento.
   - REVER:
   - README.md
   - docs/RF.md
   - docs/RNF.md
   - docs/planificacao/backlogs/BACKLOG-MVP.md
   - docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md
   - docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md
   - docs/planificacao/backlogs/MF-VIEWS.md
   - docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md

3. Instrucoes do que fazer.

Confirma que nao vais alterar RF, RNF, ID do BK, owner, prioridade ou dependencias. Se o scaffold real divergir de `apps/api` e `apps/web`, adapta caminhos sem alterar contratos de negocio e regista essa decisao na evidence.

4. Codigo completo, correto e integrado com a app final.

Sem codigo neste passo. O objetivo e impedir drift antes da implementacao.

5. Explicacao didatica e detalhada do codigo.

Este passo existe para evitar que o aluno comece por copiar codigo sem perceber o contrato. Num ERP, uma decisao errada no inicio, por exemplo tratar role como global ou ignorar companyId, propaga erros para faturacao, compras, stock e contabilidade.

6. Validacao do passo.

Antes de avancar, escreve na evidence qual RF/RNF cobre este BK e que BK seguinte depende dele.

7. Cenario negativo/erro esperado.

Se encontrares uma regra que nao aparece em RF/RNF/backlog, nao a implementes: marca como decisao em falta no Passo 7.

### Passo 2 - Modelar dados e constraints na base de dados

1. Objetivo funcional do passo no ERP.

Criar a estrutura persistente que suporta a regra do BK sem duplicados, estados impossiveis ou fuga entre empresas.

2. Ficheiros envolvidos:
   - CRIAR:
   - Nenhum ficheiro novo neste passo.
   - EDITAR:
   - apps/api/prisma/schema.prisma
   - LOCALIZACAO:
   - Inserir os modelos junto dos modelos do mesmo dominio; quando o BK disser para atualizar um modelo existente, substituir o bloco antigo por uma versao coerente.
   - REVER:
   - docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md
   - BKs anteriores da MF0 que criam modelos reutilizados.

3. Instrucoes do que fazer.

Aplica primeiro o schema. Se o modelo pertencer a uma empresa, usa `companyId` e indices/constraints por empresa. Se o modelo atualizar `User`, `Company` ou `Session`, faz a substituicao completa indicada para evitar campos duplicados ou relacoes partidas.

4. Codigo completo, correto e integrado com a app final.

Localizacao: acrescentar estes blocos a `apps/api/prisma/schema.prisma`. Se o ficheiro ja existir, inserir junto dos restantes modelos de identidade, sem duplicar modelos.

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

5. Explicacao didatica e detalhada do codigo.

O schema e a camada mais baixa de integridade. Mesmo que o frontend tenha boas validacoes, a base de dados deve impedir duplicados e relacoes impossiveis. Em OPSA isto e critico porque clientes, fornecedores, artigos, contas SNC, periodos fiscais e armazens alimentam documentos fiscais e contabilisticos futuros.

6. Validacao do passo.

Executa a geracao/migracao Prisma quando o scaffold existir e confirma que nao ha nomes de modelos ou relacoes duplicados.

7. Cenario negativo/erro esperado.

Tentar criar dois registos que violam uma constraint unica deve falhar com conflito controlado, normalmente `409` no service/controller.

### Passo 3 - Criar validadores, helpers e adaptadores de infraestrutura

1. Objetivo funcional do passo no ERP.

Validar entradas antes da regra de negocio e isolar detalhes tecnicos como cookies, hash, email ou permissao.

2. Ficheiros envolvidos:
   - CRIAR:
   - apps/api/src/lib/httpErrors.js
   - apps/api/src/modules/auth/password.js
   - apps/api/src/modules/auth/sessionCookie.js
   - apps/api/src/modules/auth/authValidators.js
   - EDITAR:
   - Nenhum ficheiro existente neste passo.
   - LOCALIZACAO:
   - Criar dentro do modulo do dominio em `apps/api/src/modules/...`; helpers partilhados ficam em `apps/api/src/lib` quando usados por varios BKs.
   - REVER:
   - docs/RNF.md: RNF05, RNF06, RNF12-RNF17, RNF21 quando existir email.

3. Instrucoes do que fazer.

Cria estes ficheiros antes dos services. Os services devem receber dados ja normalizados e nao devem repetir regex ou parse manual espalhado pelo codigo.

4. Codigo completo, correto e integrado com a app final.

Localizacao: criar `apps/api/src/lib/httpErrors.js`.

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

Localizacao: criar `apps/api/src/modules/auth/password.js`.

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

Localizacao: criar `apps/api/src/modules/auth/sessionCookie.js`.

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
  const sessionCookie = cookies.find((part) => part.startsWith(`${COOKIE_NAME}=`));

  if (!sessionCookie) return null;
  return decodeURIComponent(sessionCookie.slice(COOKIE_NAME.length + 1));
}
```

Localizacao: criar `apps/api/src/modules/auth/authValidators.js`.

```js
import { httpError } from "../../lib/httpErrors.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asObject(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser um objeto JSON");
  }
  return body;
}

function normalizeEmail(email) {
  if (typeof email !== "string") {
    throw httpError(400, "INVALID_EMAIL", "O email e obrigatorio");
  }

  const normalized = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) {
    throw httpError(400, "INVALID_EMAIL", "O email deve ter formato valido");
  }

  return normalized;
}

function validatePassword(password) {
  if (typeof password !== "string" || password.length < 10) {
    throw httpError(400, "WEAK_PASSWORD", "A password deve ter pelo menos 10 caracteres");
  }

  return password;
}

export function validateRegisterPayload(body) {
  const payload = asObject(body);

  return {
    email: normalizeEmail(payload.email),
    password: validatePassword(payload.password),
    name: typeof payload.name === "string" ? payload.name.trim() || null : null,
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

5. Explicacao didatica e detalhada do codigo.

Validadores e helpers tornam o codigo mais facil de testar e explicar. Um aluno consegue perceber que validar NIF, email, datas ou dinheiro nao e detalhe visual: e defesa da integridade da empresa e da contabilidade.

6. Validacao do passo.

Testa payloads invalidos diretamente contra as funcoes ou endpoint e confirma resposta `400` com mensagem clara.

7. Cenario negativo/erro esperado.

Um payload mal formado nao pode chegar ao Prisma; deve parar no validator com `400`.

### Passo 4 - Implementar services e middleware de regra de negocio

1. Objetivo funcional do passo no ERP.

Concentrar a regra do ERP em funcoes testaveis, separadas de HTTP e frontend.

2. Ficheiros envolvidos:
   - CRIAR:
   - apps/api/src/modules/auth/authService.js
   - apps/api/src/modules/auth/authMiddleware.js
   - EDITAR:
   - Nenhum ficheiro existente neste passo.
   - LOCALIZACAO:
   - Criar no modulo backend do dominio; middlewares reutilizaveis ficam junto do dominio que fornece o contexto.
   - REVER:
   - BKs anteriores que fornecem `requireAuth`, `requireCompanyContext`, permissoes, User, Company ou dados mestre.

3. Instrucoes do que fazer.

Implementa services depois dos validadores. Quando houver dados empresariais, recebe sempre `companyId` vindo da sessao/contexto, nunca do body. Quando houver role/permissao, garante que a rota chama o guard antes do service.

4. Codigo completo, correto e integrado com a app final.

Localizacao: criar `apps/api/src/modules/auth/authService.js`.

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
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw httpError(409, "EMAIL_ALREADY_EXISTS", "Ja existe um utilizador com este email");
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
  return { user: publicUser(user), sessionId: session.id, expiresAt: session.expiresAt };
}

export async function loginUser(prisma, input, now = new Date()) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !user.isActive) {
    throw httpError(401, "INVALID_CREDENTIALS", "Credenciais invalidas");
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw httpError(401, "INVALID_CREDENTIALS", "Credenciais invalidas");
  }

  const session = await createSession(prisma, user.id, now);
  return { user: publicUser(user), sessionId: session.id, expiresAt: session.expiresAt };
}

export async function resolveSession(prisma, sessionId, now = new Date()) {
  if (!sessionId) {
    throw httpError(401, "SESSION_REQUIRED", "Sessao obrigatoria");
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= now || !session.user.isActive) {
    throw httpError(401, "INVALID_SESSION", "Sessao invalida ou expirada");
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

Localizacao: criar `apps/api/src/modules/auth/authMiddleware.js`.

```js
import { toHttpError } from "../../lib/httpErrors.js";
import { readSessionCookie } from "./sessionCookie.js";
import { resolveSession } from "./authService.js";

export function requireAuth(prisma) {
  return async function authMiddleware(req, res, next) {
    try {
      const sessionId = readSessionCookie(req);
      const context = await resolveSession(prisma, sessionId);

      // Estes campos sao reutilizados pelos BKs de permissoes e multiempresa.
      req.session = context.session;
      req.user = context.user;
      return next();
    } catch (error) {
      const httpError = toHttpError(error);
      return res.status(httpError.status).json({ error: httpError.code, message: httpError.message });
    }
  };
}
```

5. Explicacao didatica e detalhada do codigo.

O service e onde vive a regra de negocio. Isto evita controllers gigantes e impede que a UI seja a unica barreira de seguranca. Em OPSA, esta separacao ajuda a garantir que IA, frontend ou scripts futuros nao alteram dados contabilisticos sem passar pelas mesmas regras.

6. Validacao do passo.

Testa o service com dados validos e invalidos. Confirma que queries usam `companyId` quando aplicavel e que estados sensiveis devolvem `409` ou `403` conforme o caso.

7. Cenario negativo/erro esperado.

Tentar aceder a dados de outra empresa, ou executar uma acao sem permissao, deve falhar sem expor dados existentes.

### Passo 5 - Expor controllers, rotas e registo no servidor

1. Objetivo funcional do passo no ERP.

Transformar a regra de negocio em API HTTP previsivel para o frontend e para testes.

2. Ficheiros envolvidos:
   - CRIAR:
   - apps/api/src/modules/auth/authController.js
   - apps/api/src/modules/auth/authRoutes.js
   - EDITAR:
   - apps/api/src/server.js
   - LOCALIZACAO:
   - Controllers e routes ficam no modulo do dominio; o `server.js` apenas monta o router no prefixo `/api/...`.
   - REVER:
   - docs/RNF.md: RNF25 e RNF28
   - Contratos de endpoints indicados no header do BK.

3. Instrucoes do que fazer.

Cria controllers finos: ler request, chamar validator/service e traduzir erros para HTTP. Regista o router no servidor sem misturar regra de negocio no `server.js`.

4. Codigo completo, correto e integrado com a app final.

Localizacao: criar `apps/api/src/modules/auth/authController.js`.

```js
import { toHttpError } from "../../lib/httpErrors.js";
import { validateLoginPayload, validateRegisterPayload } from "./authValidators.js";
import { loginUser, logoutUser, registerUser, resolveSession } from "./authService.js";
import { clearSessionCookie, readSessionCookie, setSessionCookie } from "./sessionCookie.js";

function sendError(res, error) {
  const httpError = toHttpError(error);
  return res.status(httpError.status).json({ error: httpError.code, message: httpError.message });
}

export function buildAuthController({ prisma, isProduction }) {
  return {
    async register(req, res) {
      try {
        const input = validateRegisterPayload(req.body);
        const result = await registerUser(prisma, input);
        setSessionCookie(res, result.sessionId, isProduction);
        return res.status(201).json({ user: result.user, expiresAt: result.expiresAt });
      } catch (error) {
        return sendError(res, error);
      }
    },

    async login(req, res) {
      try {
        const input = validateLoginPayload(req.body);
        const result = await loginUser(prisma, input);
        setSessionCookie(res, result.sessionId, isProduction);
        return res.status(200).json({ user: result.user, expiresAt: result.expiresAt });
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

Localizacao: criar `apps/api/src/modules/auth/authRoutes.js`.

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

Localizacao: editar `apps/api/src/server.js`, junto das restantes rotas.

```js
import { buildAuthRoutes } from "./modules/auth/authRoutes.js";

app.use("/api/auth", buildAuthRoutes({
  prisma,
  isProduction: process.env.NODE_ENV === "production",
}));
```

5. Explicacao didatica e detalhada do codigo.

A API e o contrato entre backend e frontend. Ao manter controller pequeno, o aluno percebe onde colocar cada responsabilidade: validacao no validator, regra no service, transporte HTTP no controller/route.

6. Validacao do passo.

Chama o endpoint principal com payload valido e confirma status `200` ou `201` conforme a operacao.

7. Cenario negativo/erro esperado.

Sem sessao, sem empresa ativa ou sem permissao, o endpoint deve devolver `401` ou `403` antes de chamar o service.

### Passo 6 - Validar payloads, respostas e cenarios negativos

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

3. Instrucoes do que fazer.

Executa primeiro o smoke principal e depois os negativos. Guarda status HTTP, payload enviado e resposta recebida. Nao marques DONE sem evidence.

4. Codigo completo, correto e integrado com a app final.

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

- `400 INVALID_EMAIL`: email ausente ou invalido.
- `400 WEAK_PASSWORD`: password com menos de 10 caracteres.
- `401 INVALID_CREDENTIALS`: login com email/password errados.
- `401 INVALID_SESSION`: cookie inexistente, expirado ou revogado.
- `409 EMAIL_ALREADY_EXISTS`: tentativa de registo com email ja existente.

- Registo com email repetido deve devolver `409`.
- Login com password errada deve devolver `401` e nao indicar se o email existe.
- `GET /api/auth/me` sem cookie deve devolver `401`.

- Smoke manual: registar utilizador, confirmar `Set-Cookie` HttpOnly, chamar `GET /api/auth/me`, fazer logout e confirmar que `GET /api/auth/me` passa a `401`.
- Teste tecnico: validar que `passwordHash` existe na base de dados mas nunca aparece na resposta JSON.
- Regressao para BK seguinte: guardar o cookie real para usar em `BK-MF0-02`.

#

5. Explicacao didatica e detalhada do codigo.

Testar negativos ensina que seguranca nao e so o caminho feliz. Um ERP deve recusar dados fiscais invalidos, acessos sem role, conflitos de unicidade e alteracoes em periodos fechados de forma previsivel.

6. Validacao do passo.

A evidence deve mostrar pelo menos o smoke principal, os negativos exigidos pela prioridade e qualquer comando executado.

7. Cenario negativo/erro esperado.

Se um erro devolve stack trace, segredo, dados de outra empresa ou status generico errado, o BK ainda nao esta pronto.

### Passo 7 - Registar decisoes em falta, evidence e handoff

1. Objetivo funcional do passo no ERP.

Fechar o BK como tutorial tecnico que o proximo aluno consegue continuar sem adivinhar contratos.

2. Ficheiros envolvidos:
   - CRIAR:
   - docs/evidence/<BK_ID>.md ou descricao equivalente no PR.
   - EDITAR:
   - Secao Evidence deste guia apenas quando houver PR/defesa real.
   - LOCALIZACAO:
   - Fim do guia: criterios, validacao final, evidence, handoff e changelog.
   - REVER:
   - BK seguinte indicado em `proximo_bk` e BKs dependentes futuros.

3. Instrucoes do que fazer.

Se falta fonte documental ou decisao de arquitetura, nao inventes. Regista exatamente o que falta confirmar e qual o impacto. Depois escreve o handoff para o BK seguinte.

4. Codigo completo, correto e integrado com a app final.

Decisoes em falta a manter visiveis durante a implementacao:

- Confirmar no setup real se `bcrypt` ja existe em `package.json`. A dependencia e exigida por RNF13; se nao existir, adicionar explicitamente no BK com justificacao.

5. Explicacao didatica e detalhada do codigo.

O handoff protege continuidade. Num projeto PAP com varios alunos, a qualidade nao esta so no codigo: esta tambem em deixar claro o que ficou decidido, o que ainda falta decidir e que contratos o proximo BK pode reutilizar.

6. Validacao do passo.

Confirma que o final do BK contem apenas criterios de aceite, validacao final, evidence, handoff e changelog.

7. Cenario negativo/erro esperado.

Se o handoff diz para usar algo que nao foi criado neste BK ou num BK anterior, ha contrato partido e deve ser corrigido antes de avancar.


## Criterios de aceite

- O BK-MF0-01 cumpre os criterios mensuraveis definidos acima.
- O contrato canonico do RF01 continua alinhado com backlog, matriz e MF-VIEWS.

## Validacao final

- Executar o smoke principal descrito no Passo 6.
- Executar todos os cenarios negativos do Passo 6.
- Confirmar que os ficheiros do Passo 2 ao Passo 5 existem nos caminhos reais da app ou que a adaptacao ficou documentada na evidence.
- Confirmar que nao houve drift em RF/RNF, owner, prioridade, dependencias ou escopo.
- Confirmar que o handoff abaixo esta compreensivel para o proximo BK.

## Evidence para PR/defesa

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`

## Handoff

O proximo BK deve reutilizar `requireAuth`, `req.user` e a resposta segura de `GET /api/auth/me`. Ainda nao deve assumir empresa ativa; isso so fica fechado no `BK-MF0-03`.

## Changelog

- `2026-05-24`: guia refinado para estrutura step-by-step executavel, com continuidade MF0, mockup, negativos, criterios e evidence.
- `2026-04-19`: metadados canonicos preservados da vaga de normalizacao.
