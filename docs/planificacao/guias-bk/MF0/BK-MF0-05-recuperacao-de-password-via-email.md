# BK-MF0-05 - Recuperação de password via email.

## Header

- `doc_id`: `GUIA-BK-MF0-05`
- `bk_id`: `BK-MF0-05`
- `macro`: `MF0`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF05`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-06`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-05-recuperacao-de-password-via-email.md`
- `last_updated`: `2026-07-10`

#### BK-MF0-05 - Recuperação de password via email.

##### O que vamos fazer neste BK

Neste BK vamos transformar o requisito RF05 num guia de execução para construir a parte da app relacionada com identidade. O foco não é produzir documentação genérica: é deixar claro que modelos, endpoints, validações, UI e evidência devem existir quando a equipa implementar o BK.

A implementação pedagógica usa os caminhos públicos `apps/api` e `apps/web` e segue os contratos atuais de `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` e `docs/planificacao/CONTRATO-INTERFACES-IMPLEMENTACAO.md`. O estado `TODO` descreve apenas o progresso dos alunos; não significa ausência de uma implementação privada de referência.

Como a fase alvo é MF0, não existem BKs de fases anteriores a reutilizar. A continuidade nasce aqui: os outputs deste BK devem ser contratos estáveis para BK-MF0-06 e para os BKs de vendas, compras, inventário, contabilidade e segurança das fases seguintes.

##### Porque é que isto é importante

- Funcionalmente, cobre RF05 e desbloqueia o fluxo seguinte da MF0.
- Tecnicamente, cria contratos de PasswordResetToken e API que outros BKs podem reutilizar.
- Pedagogicamente, mostra aos alunos a ligação entre requisito, modelo, endpoint, UI, teste e evidence.
- Em segurança/robustez, obriga a validar dados no backend e a tratar erros previsíveis.
- Para continuidade, prepara explicitamente o handoff para BK-MF0-06.

##### O que entra (scope)

- Criar pedido de recuperação por email sem revelar se a conta existe.
- Gerar token aleatório com expiração e guardar apenas hash.
- Criar endpoint para definir nova password validando token.
- Invalidar tokens usados/expirados.
- Preparar UI mínima para pedido e redefinição.

##### O que não entra (scope-out)

- Gestão de convites, porque pertence ao BK-MF0-04.
- 2FA e políticas avançadas de password, não descritas nos RF/RNF.
- Personalização avançada do template SMTP; o envio real através de outbox continua obrigatório.
- Alteração de email da conta.

##### Como saber que isto ficou bem

- O caso principal de Recuperação de password via email funciona através da UI ou de chamadas API documentadas.
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
- Apoio: `Pedro` (CANONICO)
- Dependências (BK IDs): `-` (CANONICO)
- Pré-condições: Sem dependências anteriores declaradas. O scaffold pedagógico pode ainda estar incompleto; usar `apps/api` e `apps/web` e respeitar os contratos centrais atuais. (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL.md` MF0; `PLANO-SPRINTS.md` S01-S02. (CANONICO)
- Flow ID: `FLOW-PASSWORD-RESET` (DERIVADO)
- Fonte de verdade: `docs/RF.md` -> `RF05` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descrição: Recuperação de password via email. (CANONICO)
- Stack decidida: `DERIVADO` e centralizada em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; este BK ensina o mesmo contrato seguro nos caminhos públicos dos alunos.
- Mockup usado: `mockup/` existe e foi usado como referência de fluxo, hierarquia e nomes visíveis; não é contrato pixel-perfect.

#### O que vamos fazer neste BK (DERIVADO):

- Estado esperado antes do BK: A autenticação de BK-MF0-01 deve existir ou ser criada em paralelo se ainda não estiver pronta.
- Estado esperado depois do BK: Utilizadores conseguem pedir recuperação e definir nova password através de token temporário enviado por email.
- Ficheiros a criar/editar/rever: schema Prisma, módulo backend `identidade`, cliente API frontend e componentes/páginas referenciados em `mockup/src/app/components/Login.tsx, link Esqueceu a password?`.
- Dependências de BK anteriores e uso: Sem dependências anteriores declaradas.
- Reutilização técnica opcional (sem alterar dependências canónicas): se BK-MF0-01 estiver implementado, reutilizar o modelo `User`, a estratégia de hash de password e o adaptador de sessão.
- Impacto na arquitetura: reforça separação entre routes, controllers, services, validators e UI.
- Impacto frontend: liga o fluxo visual do mockup a API real com estados loading/error/empty/success quando aplicável.
- Impacto backend/dados: cria ou prepara `PasswordResetToken` e endpoints `POST /api/auth/password/forgot, POST /api/auth/password/reset`.
- Impacto segurança: valida inputs no backend, aplica sessão/permissão quando aplicável e evita exposição de dados sensíveis.
- Impacto testes: exige smoke e 3 negativos concretos.
- Handoff: BK-MF0-06 deve reutilizar os contratos aqui criados.

#### Pré-leitura mínima (10-15 min) (DERIVADO):

- `README.md` secções 1, 4, 5 e 7.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` para stack assumida e regras de adaptação de caminhos.
- `docs/RF.md` linha do requisito `RF05`.
- `docs/RNF.md` secções RNF05, RNF06, RNF12-RNF17, RNF25-RNF30 quando aplicável.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` linha deste BK.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` linha deste BK.
- `docs/planificacao/backlogs/MF-VIEWS.md` -> MF0.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` -> S01-S02.
- Mockup: `mockup/src/app/components/Login.tsx, link Esqueceu a password?`.
- BKs anteriores: não existem dependências formais anteriores para este BK.

#### Glossário (rápido) (DERIVADO):

- **User enumeration:** Falha em que a API revela se um email está registado.
- **Token de reset:** Segredo temporário enviado ao email para autorizar nova password.
- **Expiração:** Momento em que o token deixa de ser aceite.
- **Adapter de email:** Camada que permite trocar simulação por serviço real sem mudar a regra de negócio.
- **Password policy:** Regras mínimas de comprimento e complexidade.

#### Conceitos teóricos essenciais (DERIVADO):

- A resposta ao pedido de recuperação deve ser igual para email existente e inexistente. Isto evita revelar contas válidas.
- O token funciona como segredo. Por isso, guarda-se tokenHash na base de dados e mostra-se o token bruto apenas no link enviado.
- A nova password deve passar pela mesma estratégia de hash do BK-MF0-01.
- Um adapter de email reduz acoplamento, mas a entrega segue sempre `EmailOutbox` + worker SMTP; logs nunca substituem a entrega nem contêm email/token/link.
- **Erros comuns a evitar:** implementar só no frontend, confiar em dados enviados pelo browser, esquecer `companyId` nos dados por empresa, devolver mensagens técnicas cruas ao utilizador ou criar campos que não aparecem nos RF/RNF.
- **Negativos de segurança/robustez:** todos os casos inválidos devem falhar de forma controlada, sem stack traces, sem dados sensíveis e sem escrita parcial na base de dados.

##### Contrato de paridade obrigatório (2026-07-10)

- `POST /api/auth/password/forgot` usa o rate limiter Redis/HMAC comum e responde sempre de forma indistinguível, exista ou não conta.
- Quando a conta existe, `PasswordResetToken`, item cifrado em `EmailOutbox` e `SecurityAuditEvent` são criados na mesma transação. O worker SMTP usa lease, retry exponencial, tentativas e deduplicação; modo log/mock é proibido em produção.
- O link usa fragmento (`/recuperar-password#token=...`). O browser lê o segredo, remove-o da URL e envia-o apenas no body de `POST /api/auth/password/reset`. Tokens, email, IP, cookie e URL nunca entram em logs.
- Reset bem-sucedido altera o hash, marca o token como usado, revoga todas as sessões anteriores e grava o evento de segurança atomicamente.
- Os testes obrigatórios validam entrega na sandbox SMTP, resposta anti-enumeração, token expirado/usado e revogação efetiva das sessões.

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

Localização: acrescentar a `apps/api/prisma/schema.prisma`.

```prisma
model PasswordResetToken {
  id        String    @id @default(uuid())
  userId    String
  tokenHash String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([expiresAt])
}
```

Localização: atualizar `User` em `apps/api/prisma/schema.prisma`.

```prisma
model User {
  id                  String               @id @default(uuid())
  email               String               @unique
  name                String?
  passwordHash        String
  isActive            Boolean              @default(true)
  sessions            Session[]
  memberships         CompanyMembership[]
  passwordResetTokens PasswordResetToken[]
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
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
    - apps/api/src/modules/auth/passwordResetValidators.js
    - apps/api/src/modules/auth/passwordResetRateLimit.js
    - apps/api/src/modules/auth/passwordResetEmailAdapter.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar dentro do módulo do domínio em `apps/api/src/modules/...`; helpers partilhados ficam em `apps/api/src/lib` quando usados por vários BKs.
    - REVER:
    - docs/RNF.md: RNF05, RNF06, RNF12-RNF17, RNF21 quando existir email.

3. Instruções do que fazer.

Cria estes ficheiros antes dos services. Os services devem receber dados já normalizados e não devem repetir regex ou parse manual espalhado pelo código.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/auth/passwordResetValidators.js`.

```js
import { httpError } from "../../lib/httpErrors.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
    if (typeof email !== "string")
        throw httpError(400, "INVALID_EMAIL", "Email obrigatório");
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized))
        throw httpError(400, "INVALID_EMAIL", "Email inválido");
    return normalized;
}

function normalizeToken(token) {
    if (typeof token !== "string" || token.trim().length < 32) {
        throw httpError(400, "INVALID_TOKEN", "Token inválido");
    }
    return token.trim();
}

function validateNewPassword(password) {
    if (typeof password !== "string" || password.length < 10) {
        throw httpError(
            400,
            "WEAK_PASSWORD",
            "A password deve ter pelo menos 10 caracteres",
        );
    }
    return password;
}

export function validateForgotPasswordPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return { email: normalizeEmail(body.email) };
}

export function validateResetPasswordPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return {
        token: normalizeToken(body.token),
        password: validateNewPassword(body.password),
    };
}
```

Localização: criar `apps/api/src/modules/auth/passwordResetRateLimit.js`.

```js
import { httpError } from "../../lib/httpErrors.js";

export function buildPasswordResetRateLimit({ redisRateLimiter }) {
    return async function assertPasswordResetRateLimit({ ip, email }) {
        // O limiter comum cria a chave com HMAC; os identificadores não são persistidos em claro.
        const result = await redisRateLimiter.consume({
            scope: "password-reset",
            identifiers: [ip, email],
            limit: 5,
            windowSeconds: 15 * 60,
        });
        if (result.allowed) return;
        throw httpError(
            429,
            "RATE_LIMITED",
            "Demasiados pedidos de recuperação",
        );
    };
}
```

Localização: criar `apps/api/src/modules/auth/passwordResetEmailAdapter.js`.

```js
export function buildPasswordResetEmailAdapter({
    appBaseUrl,
    emailOutbox,
}) {
    return {
        async enqueuePasswordReset(tx, { resetTokenId, email, token }) {
            const resetUrl = `${appBaseUrl}/recuperar-password#token=${encodeURIComponent(token)}`;
            return emailOutbox.enqueue(tx, {
                kind: "PASSWORD_RESET",
                dedupeKey: `password-reset:${resetTokenId}`,
                payload: { to: email, resetUrl },
            });
        },
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
    - apps/api/src/modules/auth/passwordResetService.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar no módulo backend do domínio; middlewares reutilizáveis ficam junto do domínio que fornece o contexto.
    - REVER:
    - BKs anteriores que fornecem `requireAuth`, `requireCompanyContext`, permissões, User, Company ou dados mestre.

3. Instruções do que fazer.

Implementa services depois dos validadores. Quando houver dados empresariais, recebe sempre `companyId` vindo da sessão/contexto, nunca do body. Quando houver role/permissão, garante que a rota chama o guard antes do service.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/auth/passwordResetService.js`.

```js
import crypto from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";
import { hashPassword } from "./password.js";

const RESET_TTL_MS = 30 * 60 * 1000;
const GENERIC_RESPONSE = { ok: true };

function createToken() {
    return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(
    prisma,
    emailAdapter,
    { email, now = new Date() },
) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Resposta genérica: não revelar se o email existe.
    if (!user || !user.isActive) return GENERIC_RESPONSE;

    const token = createToken();
    await prisma.$transaction(async (tx) => {
        const resetToken = await tx.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash: hashToken(token),
                expiresAt: new Date(now.getTime() + RESET_TTL_MS),
            },
        });
        await emailAdapter.enqueuePasswordReset(tx, {
            resetTokenId: resetToken.id,
            email: user.email,
            token,
        });
        await tx.securityAuditEvent.create({
            data: { actorUserId: user.id, action: "PASSWORD_RESET_REQUESTED" },
        });
    });
    return GENERIC_RESPONSE;
}

export async function resetPassword(
    prisma,
    { token, password, now = new Date() },
) {
    const tokenHash = hashToken(token);
    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
        throw httpError(
            400,
            "INVALID_RESET_TOKEN",
            "Token inválido ou expirado",
        );
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: resetToken.userId },
            data: { passwordHash },
        });
        await tx.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { usedAt: now },
        });
        await tx.session.updateMany({
            where: { userId: resetToken.userId, revokedAt: null },
            data: { revokedAt: now },
        });
        await tx.securityAuditEvent.create({
            data: { actorUserId: resetToken.userId, action: "PASSWORD_RESET_COMPLETED" },
        });
    });

    return GENERIC_RESPONSE;
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
    - apps/api/src/modules/auth/passwordResetController.js
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

Localização: criar `apps/api/src/modules/auth/passwordResetController.js`.

```js
import { toHttpError } from "../../lib/httpErrors.js";
import { buildPasswordResetRateLimit } from "./passwordResetRateLimit.js";
import {
    validateForgotPasswordPayload,
    validateResetPasswordPayload,
} from "./passwordResetValidators.js";
import { requestPasswordReset, resetPassword } from "./passwordResetService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildPasswordResetController({ prisma, emailAdapter, redisRateLimiter }) {
    const assertPasswordResetRateLimit = buildPasswordResetRateLimit({ redisRateLimiter });
    return {
        async forgot(req, res) {
            try {
                const input = validateForgotPasswordPayload(req.body);
                await assertPasswordResetRateLimit({ ip: req.ip, email: input.email });
                const result = await requestPasswordReset(
                    prisma,
                    emailAdapter,
                    input,
                );
                return res.status(200).json(result);
            } catch (error) {
                return sendError(res, error);
            }
        },

        async reset(req, res) {
            try {
                const input = validateResetPasswordPayload(req.body);
                const result = await resetPassword(prisma, input);
                return res.status(200).json(result);
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
```

Localização: editar `apps/api/src/modules/auth/authRoutes.js`, dentro de `buildAuthRoutes`.

```js
import { buildPasswordResetEmailAdapter } from "./passwordResetEmailAdapter.js";
import { buildPasswordResetController } from "./passwordResetController.js";

const passwordResetController = buildPasswordResetController({
    prisma,
    redisRateLimiter,
    emailAdapter: buildPasswordResetEmailAdapter({
        appBaseUrl: process.env.APP_BASE_URL,
        emailOutbox,
    }),
});

router.post("/password/forgot", passwordResetController.forgot);
router.post("/password/reset", passwordResetController.reset);
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

Pedido `POST /api/auth/password/forgot`:

```json
{
    "email": "ana.silva@example.pt"
}
```

Resposta `200`, existindo ou não utilizador:

```json
{
    "ok": true
}
```

Pedido `POST /api/auth/password/reset`:

```json
{
    "token": "token-recebido-por-email",
    "password": "NovaPasswordForte2026"
}
```

Erros esperados:

- `400 INVALID_EMAIL`.
- `400 WEAK_PASSWORD`.
- `400 INVALID_RESET_TOKEN`.
- `429 RATE_LIMITED`.

- Pedir reset para email inexistente devolve `200` genérico.
- Usar token expirado devolve `400`.
- Reutilizar token usado devolve `400`.

- Criar utilizador no BK-MF0-01.
- Pedir reset, recolher token no adaptador de desenvolvimento e repor password.
- Confirmar que a password antiga deixa de funcionar e que sessões antigas foram revogadas.

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

- O provider real é SMTP através de `EmailOutbox`; a sandbox SMTP é aceitável para teste, logs não são entrega.
- O rate limit partilhado é Redis/HMAC. O store local existe apenas em desenvolvimento e em testes unitários explícitos; produção sem Redis/HMAC falha no arranque.

5. Explicação do código.

O handoff protege continuidade. Num projeto PAP com vários alunos, a qualidade não está só no código: está também em deixar claro o que ficou decidido, o que ainda falta decidir e que contratos o próximo BK pode reutilizar.

6. Validação do passo.

Confirma que o final do BK contém apenas critérios de aceite, validação final, evidence, handoff e changelog.

7. Cenário negativo/erro esperado.

Se o handoff diz para usar algo que não foi criado neste BK ou num BK anterior, há contrato partido e deve ser corrigido antes de avançar.

## Critérios de aceite

- O BK-MF0-05 cumpre os critérios mensuráveis definidos acima.
- O contrato canónico do RF05 continua alinhado com backlog, matriz e MF-VIEWS.

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

Depois de recuperação de password, o utilizador autenticado pode gerir dados da empresa ativa. O BK-MF0-06 deve exigir `requireCompanyContext` e permissões no backend.

## Changelog

- `2026-05-24`: guia refinado para estrutura step-by-step executável, com continuidade MF0, mockup, negativos, critérios e evidence.
- `2026-04-19`: metadados canónicos preservados da vaga de normalização.
