# BK-MF0-04 - Gestão de utilizadores: convite, remoção e definição de papéis.

## Header

- `doc_id`: `GUIA-BK-MF0-04`
- `bk_id`: `BK-MF0-04`
- `macro`: `MF0`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `RF04`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-05`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-04-gestao-de-utilizadores-convite-remocao-e-definicao-de-papeis.md`
- `last_updated`: `2026-05-24`

#### BK-MF0-04 - Gestão de utilizadores: convite, remoção e definição de papéis.

##### O que vamos fazer neste BK

Neste BK vamos transformar o requisito RF04 num guia de execução para construir a parte da app relacionada com identidade. O foco não é produzir documentação genérica: é deixar claro que modelos, endpoints, validações, UI e evidência devem existir quando a equipa implementar o BK.

A app real ainda está marcada como `sem_codigo`; por isso, os caminhos técnicos propostos seguem o contrato central `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`. Esse contrato define a stack assumida, a estrutura indicativa e a regra de adaptação quando existir scaffold real, sem alterar RF, BK, owners, dependências ou critérios de aceite.

Como a fase alvo é MF0, não existem BKs de fases anteriores a reutilizar. A continuidade nasce aqui: os outputs deste BK devem ser contratos estáveis para BK-MF0-05 e para os BKs de vendas, compras, inventário, contabilidade e segurança das fases seguintes.

##### Porque é que isto é importante

- Funcionalmente, cobre RF04 e desbloqueia o fluxo seguinte da MF0.
- Tecnicamente, cria contratos de Invitation, CompanyMembership e API que outros BKs podem reutilizar.
- Pedagogicamente, mostra aos alunos a ligação entre requisito, modelo, endpoint, UI, teste e evidence.
- Em segurança/robustez, obriga a validar dados no backend e a tratar erros previsíveis.
- Para continuidade, prepara explicitamente o handoff para BK-MF0-05.

##### O que entra (scope)

- Listar utilizadores da empresa ativa.
- Criar convite por email, role e empresa.
- Alterar role de um membro existente dentro das roles canónicas.
- Remover membership sem apagar a conta global.
- Preparar adaptador de email para envio real/futuro.

##### O que não entra (scope-out)

- Recuperação de password, porque pertence ao BK-MF0-05.
- Auditoria completa de alterações, que será reforçada em MF4/MF6.
- Equipas/departamentos, porque não existem nos RF/RNF.
- Convites entre empresas sem permissão explicita.

##### Como saber que isto ficou bem

- O caso principal de Gestão de utilizadores: convite, remoção e definição de papéis funciona através da UI ou de chamadas API documentadas.
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
- Dependências (BK IDs): `BK-MF0-03` (CANONICO)
- Pré-condições: Depende de BK-MF0-03. App real pode ainda não existir; nesse caso criar a estrutura técnica assumida antes dos ficheiros alvo. (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL.md` MF0; `PLANO-SPRINTS.md` S01-S02. (CANONICO)
- Flow ID: `FLOW-USER-ADMIN` (DERIVADO)
- Fonte de verdade: `docs/RF.md` -> `RF04` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descrição: Gestão de utilizadores: convite, remoção e definição de papéis. (CANONICO)
- Stack decidida: `DERIVADO` e centralizada em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; este BK usa essa stack apenas como assunção técnica até existir scaffold real.
- Mockup usado: `mockup/` existe e foi usado como referência de fluxo, hierarquia e nomes visíveis; não é contrato pixel-perfect.

#### O que vamos fazer neste BK (DERIVADO):

- Estado esperado antes do BK: BK-MF0-03 já deve ter empresa ativa e memberships.
- Estado esperado depois do BK: Admins/Gestores autorizados conseguem gerir membros da empresa com convites controlados e alteração de papéis.
- Ficheiros a criar/editar/rever: schema Prisma, módulo backend `identidade`, cliente API frontend e componentes/páginas referenciados em `mockup/src/app/components/modules/Configuracoes.tsx, bloco Gestão de Utilizadores`.
- Dependências de BK anteriores e uso: Depende de BK-MF0-03.
- Impacto na arquitetura: reforça separação entre routes, controllers, services, validators e UI.
- Impacto frontend: liga o fluxo visual do mockup a API real com estados loading/error/empty/success quando aplicável.
- Impacto backend/dados: cria ou prepara `Invitation, CompanyMembership` e endpoints `GET /api/company/users, POST /api/company/invitations, PATCH /api/company/users/:id/role, DELETE /api/company/users/:id`.
- Impacto segurança: valida inputs no backend, aplica sessão/permissão quando aplicável e evita exposição de dados sensíveis.
- Impacto testes: exige smoke e 3 negativos concretos.
- Handoff: BK-MF0-05 deve reutilizar os contratos aqui criados.

#### Pré-leitura mínima (10-15 min) (DERIVADO):

- `README.md` secções 1, 4, 5 e 7.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` para stack assumida e regras de adaptação de caminhos.
- `docs/RF.md` linha do requisito `RF04`.
- `docs/RNF.md` secções RNF05, RNF06, RNF12-RNF17, RNF25-RNF30 quando aplicável.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` linha deste BK.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` linha deste BK.
- `docs/planificacao/backlogs/MF-VIEWS.md` -> MF0.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` -> S01-S02.
- Mockup: `mockup/src/app/components/modules/Configuracoes.tsx, bloco Gestão de Utilizadores`.
- BK anterior obrigatório: `BK-MF0-03`, sobretudo os contratos de sessão/role/empresa.

#### Glossário (rápido) (DERIVADO):

- **Convite:** Registo temporário que permite adicionar um email a uma empresa.
- **Token:** Valor aleatório usado para provar que o utilizador recebeu o convite.
- **Token hash:** Versão protegida do token guardada na base de dados.
- **Soft removal:** Remover acesso sem apagar histórico global do utilizador.
- **Último Admin:** Caso crítico a bloquear para não deixar empresa sem administração.

#### Conceitos teóricos essenciais (DERIVADO):

- Gerir utilizadores numa app multiempresa significa gerir memberships, não apagar pessoas da plataforma.
- Tokens de convite devem expirar e não devem ser guardados em texto puro quando funcionam como segredo.
- A validação backend deve impedir roles desconhecidas e alterações feitas por quem não tem permissão.
- O email pode ser simulado no desenvolvimento, mas o contrato deve permitir integrar o serviço real quando o RNF21 for tratado.
- **Erros comuns a evitar:** implementar só no frontend, confiar em dados enviados pelo browser, esquecer `companyId` nos dados por empresa, devolver mensagens técnicas cruas ao utilizador ou criar campos que não aparecem nos RF/RNF.
- **Negativos de segurança/robustez:** todos os casos inválidos devem falhar de forma controlada, sem stack traces, sem dados sensíveis e sem escrita parcial na base de dados.

#### Tutorial técnico linear (DERIVADO):

Este tutorial organiza o BK em passos lineares. O aluno deve seguir de cima para baixo: confirmar contratos, modelar dados, validar entradas, implementar regras de negócio, expor HTTP, testar e deixar handoff. Sempre que o scaffold real ainda não existir, usar a estrutura prevista em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` e registar a adaptação na evidence.

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
enum InvitationStatus {
  PENDING
  ACCEPTED
  REVOKED
  EXPIRED
}

model CompanyInvitation {
  id        String           @id @default(uuid())
  companyId String
  email     String
  role      Role
  tokenHash String           @unique
  status    InvitationStatus @default(PENDING)
  expiresAt DateTime
  createdBy String
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@index([companyId])
  @@index([email])
}
```

Localização: no mesmo ficheiro, substituir o modelo `Company` existente pela versão acumulada até este BK.

```prisma
model Company {
  id          String              @id @default(uuid())
  name        String
  nif         String?             @unique
  memberships CompanyMembership[]
  invitations CompanyInvitation[]
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
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
    - apps/api/src/modules/company-users/companyUserValidators.js
    - apps/api/src/modules/company-users/invitationEmailAdapter.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar dentro do módulo do domínio em `apps/api/src/modules/...`; helpers partilhados ficam em `apps/api/src/lib` quando usados por vários BKs.
    - REVER:
    - docs/RNF.md: RNF05, RNF06, RNF12-RNF17, RNF21 quando existir email.

3. Instruções do que fazer.

Cria estes ficheiros antes dos services. Os services devem receber dados já normalizados e não devem repetir regex ou parse manual espalhado pelo código.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/company-users/companyUserValidators.js`.

```js
import { httpError } from "../../lib/httpErrors.js";

const VALID_ROLES = new Set([
    "ADMIN",
    "GESTOR",
    "CONTABILISTA",
    "OPERACIONAL",
    "AUDITOR",
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
    if (typeof email !== "string")
        throw httpError(400, "INVALID_EMAIL", "Email obrigatório");
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized))
        throw httpError(400, "INVALID_EMAIL", "Email inválido");
    return normalized;
}

function normalizeRole(role) {
    if (typeof role !== "string" || !VALID_ROLES.has(role)) {
        throw httpError(400, "INVALID_ROLE", "Papel inválido");
    }
    return role;
}

export function validateInvitationPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return {
        email: normalizeEmail(body.email),
        role: normalizeRole(body.role),
    };
}

export function validateRolePayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return { role: normalizeRole(body.role) };
}
```

Localização: criar `apps/api/src/modules/company-users/invitationEmailAdapter.js`.

```js
export function buildInvitationEmailAdapter({ appBaseUrl, logger = console }) {
    return {
        async sendInvitation({ email, companyName, token }) {
            const inviteUrl = `${appBaseUrl}/convites/${token}`;

            // Adaptador pedagógico: em desenvolvimento regista o link sem expor secrets noutros logs.
            logger.info({
                event: "company_invitation_created",
                email,
                companyName,
                inviteUrl,
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
    - apps/api/src/modules/company-users/companyUserService.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar no módulo backend do domínio; middlewares reutilizáveis ficam junto do domínio que fornece o contexto.
    - REVER:
    - BKs anteriores que fornecem `requireAuth`, `requireCompanyContext`, permissões, User, Company ou dados mestre.

3. Instruções do que fazer.

Implementa services depois dos validadores. Quando houver dados empresariais, recebe sempre `companyId` vindo da sessão/contexto, nunca do body. Quando houver role/permissão, garante que a rota chama o guard antes do service.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/company-users/companyUserService.js`.

```js
import crypto from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function createToken() {
    return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

async function assertNotLastAdmin(prisma, { companyId, targetUserId }) {
    const activeAdmins = await prisma.companyMembership.count({
        where: { companyId, role: "ADMIN", isActive: true },
    });
    const target = await prisma.companyMembership.findFirst({
        where: { companyId, userId: targetUserId, isActive: true },
    });

    if (target?.role === "ADMIN" && activeAdmins <= 1) {
        throw httpError(
            409,
            "LAST_ADMIN",
            "Não é possível remover ou alterar o último ADMIN ativo",
        );
    }
}

export async function listCompanyUsers(prisma, companyId) {
    const memberships = await prisma.companyMembership.findMany({
        where: { companyId, isActive: true },
        include: { user: true },
        orderBy: { createdAt: "asc" },
    });

    return memberships.map((membership) => ({
        userId: membership.userId,
        email: membership.user.email,
        name: membership.user.name,
        role: membership.role,
    }));
}

export async function inviteUser(
    prisma,
    emailAdapter,
    { companyId, actorUserId, email, role, now = new Date() },
) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        const existingMembership = await prisma.companyMembership.findFirst({
            where: { companyId, userId: existingUser.id, isActive: true },
        });
        if (existingMembership) {
            throw httpError(
                409,
                "USER_ALREADY_IN_COMPANY",
                "Utilizador já pertence à empresa",
            );
        }
    }

    const company = await prisma.company.findUnique({
        where: { id: companyId },
    });
    if (!company)
        throw httpError(404, "COMPANY_NOT_FOUND", "Empresa não encontrada");

    const token = createToken();
    const invitation = await prisma.companyInvitation.create({
        data: {
            companyId,
            email,
            role,
            tokenHash: hashToken(token),
            createdBy: actorUserId,
            expiresAt: new Date(now.getTime() + INVITATION_TTL_MS),
        },
    });

    await emailAdapter.sendInvitation({
        email,
        companyName: company.name,
        token,
    });

    return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
    };
}

export async function updateCompanyUserRole(
    prisma,
    { companyId, targetUserId, role },
) {
    await assertNotLastAdmin(prisma, { companyId, targetUserId });

    const updated = await prisma.companyMembership.updateMany({
        where: { companyId, userId: targetUserId, isActive: true },
        data: { role },
    });

    if (updated.count === 0) {
        throw httpError(
            404,
            "USER_NOT_IN_COMPANY",
            "Utilizador não pertence à empresa",
        );
    }

    return { userId: targetUserId, role };
}

export async function removeCompanyUser(
    prisma,
    { companyId, targetUserId, actorUserId },
) {
    if (targetUserId === actorUserId) {
        throw httpError(
            409,
            "CANNOT_REMOVE_SELF",
            "Não pode remover a sua própria membership",
        );
    }

    await assertNotLastAdmin(prisma, { companyId, targetUserId });

    const removed = await prisma.companyMembership.updateMany({
        where: { companyId, userId: targetUserId, isActive: true },
        data: { isActive: false },
    });

    if (removed.count === 0) {
        throw httpError(
            404,
            "USER_NOT_IN_COMPANY",
            "Utilizador não pertence à empresa",
        );
    }
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
    - apps/api/src/modules/company-users/companyUserController.js
    - apps/api/src/modules/company-users/companyUserRoutes.js
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

Localização: criar `apps/api/src/modules/company-users/companyUserController.js`.

```js
import { toHttpError } from "../../lib/httpErrors.js";
import {
    validateInvitationPayload,
    validateRolePayload,
} from "./companyUserValidators.js";
import {
    inviteUser,
    listCompanyUsers,
    removeCompanyUser,
    updateCompanyUserRole,
} from "./companyUserService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildCompanyUserController({ prisma, emailAdapter }) {
    return {
        async list(req, res) {
            try {
                const users = await listCompanyUsers(prisma, req.companyId);
                return res.status(200).json({ users });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async invite(req, res) {
            try {
                const input = validateInvitationPayload(req.body);
                const invitation = await inviteUser(prisma, emailAdapter, {
                    companyId: req.companyId,
                    actorUserId: req.user.id,
                    ...input,
                });
                return res.status(201).json({ invitation });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async updateRole(req, res) {
            try {
                const input = validateRolePayload(req.body);
                const result = await updateCompanyUserRole(prisma, {
                    companyId: req.companyId,
                    targetUserId: req.params.id,
                    role: input.role,
                });
                return res.status(200).json({ user: result });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async remove(req, res) {
            try {
                await removeCompanyUser(prisma, {
                    companyId: req.companyId,
                    targetUserId: req.params.id,
                    actorUserId: req.user.id,
                });
                return res.status(204).send();
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
```

Localização: criar `apps/api/src/modules/company-users/companyUserRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { buildInvitationEmailAdapter } from "./invitationEmailAdapter.js";
import { buildCompanyUserController } from "./companyUserController.js";

export function buildCompanyUserRoutes({ prisma, appBaseUrl }) {
    const router = Router();
    const controller = buildCompanyUserController({
        prisma,
        emailAdapter: buildInvitationEmailAdapter({ appBaseUrl }),
    });

    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.USERS_MANAGE),
    ];

    router.get("/users", guards, controller.list);
    router.post("/invitations", guards, controller.invite);
    router.patch("/users/:id/role", guards, controller.updateRole);
    router.delete("/users/:id", guards, controller.remove);

    return router;
}
```

Localização: editar `apps/api/src/server.js`, junto das restantes rotas.

```js
import { buildCompanyUserRoutes } from "./modules/company-users/companyUserRoutes.js";

app.use(
    "/api/company",
    buildCompanyUserRoutes({
        prisma,
        appBaseUrl: process.env.APP_BASE_URL,
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

Pedido `POST /api/company/invitations`:

```json
{
    "email": "joao.contabilista@example.pt",
    "role": "CONTABILISTA"
}
```

Resposta `201`:

```json
{
    "invitation": {
        "id": "uuid-convite",
        "email": "joao.contabilista@example.pt",
        "role": "CONTABILISTA",
        "status": "PENDING",
        "expiresAt": "2026-06-05T10:00:00.000Z"
    }
}
```

Erros esperados:

- `400 INVALID_EMAIL` ou `400 INVALID_ROLE`.
- `401 SESSION_REQUIRED`.
- `403 COMPANY_CONTEXT_REQUIRED` ou `403 PERMISSION_FORBIDDEN`.
- `404 USER_NOT_IN_COMPANY` ao alterar/remover utilizador inexistente naquela empresa.
- `409 USER_ALREADY_IN_COMPANY`, `409 LAST_ADMIN` ou `409 CANNOT_REMOVE_SELF`.

- `AUDITOR` tenta convidar utilizador e recebe `403`.
- Alterar o último `ADMIN` para `AUDITOR` devolve `409`.
- Remover um utilizador de outra empresa devolve `404` porque a query filtra por `companyId`.

- Criar uma empresa ativa no BK-MF0-03, autenticar como `GESTOR` e chamar `POST /api/company/invitations`.
- Chamar `GET /api/company/users` e confirmar que só lista utilizadores da empresa ativa.
- Testar os tres negativos acima e guardar respostas HTTP.

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

- Falta escolher o fornecedor real de email e templates transacionais. Enquanto RNF21 não tiver implementação, o adaptador acima serve apenas desenvolvimento/evidence e deve ser trocado sem mudar o service.
- Falta fechar o fluxo de aceitação de convite. Este BK cria e envia convite; aceitar convite pode ficar no mesmo BK se o scope for confirmado, ou num BK complementar.

5. Explicação do código.

O handoff protege continuidade. Num projeto PAP com vários alunos, a qualidade não está só no código: está também em deixar claro o que ficou decidido, o que ainda falta decidir e que contratos o próximo BK pode reutilizar.

6. Validação do passo.

Confirma que o final do BK contém apenas critérios de aceite, validação final, evidence, handoff e changelog.

7. Cenário negativo/erro esperado.

Se o handoff diz para usar algo que não foi criado neste BK ou num BK anterior, há contrato partido e deve ser corrigido antes de avançar.

## Critérios de aceite

- O BK-MF0-04 cumpre os critérios mensuráveis definidos acima.
- O contrato canónico do RF04 continua alinhado com backlog, matriz e MF-VIEWS.

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

O BK seguinte também envia email, mas para recuperação de password global. Reutilizar a abordagem de adaptador para não misturar regra de negócio com infraestrutura de email.

## Changelog

- `2026-05-24`: guia refinado para estrutura step-by-step executável, com continuidade MF0, mockup, negativos, critérios e evidence.
- `2026-04-19`: metadados canónicos preservados da vaga de normalização.
