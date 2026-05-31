# BK-MF0-03 - Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas).

## Header

- `doc_id`: `GUIA-BK-MF0-03`
- `bk_id`: `BK-MF0-03`
- `macro`: `MF0`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-02`
- `rf_rnf`: `RF03`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-04`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-03-multi-empresa-um-utilizador-pode-ter-papeis-diferentes-em-varias-empresas.md`
- `last_updated`: `2026-05-24`

#### BK-MF0-03 - Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas).

##### O que vamos fazer neste BK

Neste BK vamos transformar o requisito RF03 num guia de execução para construir a parte da app relacionada com identidade. O foco não é produzir documentação genérica: é deixar claro que modelos, endpoints, validações, UI e evidência devem existir quando a equipa implementar o BK.

A app real ainda está marcada como `sem_codigo`; por isso, os caminhos técnicos propostos seguem o contrato central `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`. Esse contrato define a stack assumida, a estrutura indicativa e a regra de adaptação quando existir scaffold real, sem alterar RF, BK, owners, dependências ou critérios de aceite.

Como a fase alvo é MF0, não existem BKs de fases anteriores a reutilizar. A continuidade nasce aqui: os outputs deste BK devem ser contratos estáveis para BK-MF0-04 e para os BKs de vendas, compras, inventário, contabilidade e segurança das fases seguintes.

##### Porque é que isto é importante

- Funcionalmente, cobre RF03 e desbloqueia o fluxo seguinte da MF0.
- Tecnicamente, cria contratos de Company, CompanyMembership e API que outros BKs podem reutilizar.
- Pedagogicamente, mostra aos alunos a ligação entre requisito, modelo, endpoint, UI, teste e evidence.
- Em segurança/robustez, obriga a validar dados no backend e a tratar erros previsíveis.
- Para continuidade, prepara explicitamente o handoff para BK-MF0-04.

##### O que entra (scope)

- Criar modelo de empresa mínimo para associar utilizadores.
- Criar membership com userId, companyId e role.
- Adicionar contexto de empresa ativo na sessão.
- Garantir que queries futuras filtram por companyId.
- Preparar seletor simples de empresa no frontend quando houver mais de uma empresa.

##### O que não entra (scope-out)

- Dados completos da empresa, porque pertencem ao BK-MF0-06.
- Convites e administração de utilizadores, porque pertencem ao BK-MF0-04.
- Consolidação multiempresa ou reporting agregado, que não está no RF03.
- Regras legais entre empresas diferentes não documentadas.

##### Como saber que isto ficou bem

- O caso principal de Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas) funciona através da UI ou de chamadas API documentadas.
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
- Dependências (BK IDs): `BK-MF0-02` (CANONICO)
- Pré-condições: Depende de BK-MF0-02. App real pode ainda não existir; nesse caso criar a estrutura técnica assumida antes dos ficheiros alvo. (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL.md` MF0; `PLANO-SPRINTS.md` S01-S02. (CANONICO)
- Flow ID: `FLOW-MULTI-COMPANY` (DERIVADO)
- Fonte de verdade: `docs/RF.md` -> `RF03` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descrição: Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas). (CANONICO)
- Stack decidida: `DERIVADO` e centralizada em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; este BK usa essa stack apenas como assunção técnica até existir scaffold real.
- Mockup usado: `mockup/` existe e foi usado como referência de fluxo, hierarquia e nomes visíveis; não é contrato pixel-perfect.

#### O que vamos fazer neste BK (DERIVADO):

- Estado esperado antes do BK: BK-MF0-02 já deve ter roles canónicas e middleware de autorização.
- Estado esperado depois do BK: A app passa a separar dados por empresa e cada utilizador tem uma role associada ao par utilizador-empresa.
- Ficheiros a criar/editar/rever: schema Prisma, módulo backend `identidade`, cliente API frontend e componentes/páginas referenciados em `mockup/src/app/components/Layout.tsx, onde aparece Empresa Demo S.A. no header`.
- Dependências de BK anteriores e uso: Depende de BK-MF0-02.
- Impacto na arquitetura: reforça separação entre routes, controllers, services, validators e UI.
- Impacto frontend: liga o fluxo visual do mockup a API real com estados loading/error/empty/success quando aplicável.
- Impacto backend/dados: cria ou prepara `Company, CompanyMembership` e endpoints `GET /api/companies, POST /api/session/company, GET /api/session/context`.
- Impacto segurança: valida inputs no backend, aplica sessão/permissão quando aplicável e evita exposição de dados sensíveis.
- Impacto testes: exige smoke e 3 negativos concretos.
- Handoff: BK-MF0-04 deve reutilizar os contratos aqui criados.

#### Pré-leitura mínima (10-15 min) (DERIVADO):

- `README.md` secções 1, 4, 5 e 7.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` para stack assumida e regras de adaptação de caminhos.
- `docs/RF.md` linha do requisito `RF03`.
- `docs/RNF.md` secções RNF05, RNF06, RNF12-RNF17, RNF25-RNF30 quando aplicável.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` linha deste BK.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` linha deste BK.
- `docs/planificacao/backlogs/MF-VIEWS.md` -> MF0.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` -> S01-S02.
- Mockup: `mockup/src/app/components/Layout.tsx, onde aparece Empresa Demo S.A. no header`.
- BK anterior obrigatório: `BK-MF0-02`, sobretudo os contratos de sessão/role/empresa.

#### Glossário (rápido) (DERIVADO):

- **Multiempresa:** Capacidade de gerir dados de varias empresas sem os misturar.
- **Membership:** Ligação entre utilizador e empresa, incluindo o papel nessa empresa.
- **Tenant:** Empresa/contexto isolado dentro da mesma aplicação.
- **Contexto ativo:** Empresa selecionada na sessão atual.
- **Isolamento de dados:** Garantia de que uma empresa não consulta dados de outra.

#### Conceitos teóricos essenciais (DERIVADO):

- Multiempresa não é apenas um campo no frontend. O backend deve filtrar dados por companyId em todos os domínios futuros.
- A role deixa de ser uma propriedade global do utilizador e passa a fazer sentido dentro da empresa ativa.
- O middleware de contexto deve correr depois da sessão e antes dos controllers de negócio.
- Falhas de isolamento multiempresa são bugs graves de privacidade e segurança.
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

Localização: editar `apps/api/prisma/schema.prisma`. Inserir estes modelos junto dos modelos de identidade e adicionar `activeCompanyId String?` ao modelo `Session`.

```prisma
model Company {
  id          String              @id @default(uuid())
  name        String
  nif         String?             @unique
  memberships CompanyMembership[]
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
}

model CompanyMembership {
  id        String   @id @default(uuid())
  userId    String
  companyId String
  role      Role
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user    User    @relation(fields: [userId], references: [id])
  company Company @relation(fields: [companyId], references: [id])

  @@unique([userId, companyId])
  @@index([companyId])
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
    - apps/api/src/modules/companies/companyValidators.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar dentro do módulo do domínio em `apps/api/src/modules/...`; helpers partilhados ficam em `apps/api/src/lib` quando usados por vários BKs.
    - REVER:
    - docs/RNF.md: RNF05, RNF06, RNF12-RNF17, RNF21 quando existir email.

3. Instruções do que fazer.

Cria estes ficheiros antes dos services. Os services devem receber dados já normalizados e não devem repetir regex ou parse manual espalhado pelo código.

4. Código completo, correto e integrado com a app final.

Localização: atualizar o modelo `User` criado no BK-MF0-01.

```prisma
model User {
  id           String              @id @default(uuid())
  email        String              @unique
  name         String?
  passwordHash String
  isActive     Boolean             @default(true)
  sessions     Session[]
  memberships  CompanyMembership[]
  createdAt    DateTime            @default(now())
  updatedAt    DateTime            @updatedAt
}
```

Localização: atualizar o modelo `Session` criado no BK-MF0-01.

```prisma
model Session {
  id              String    @id
  userId          String
  activeCompanyId String?
  user            User      @relation(fields: [userId], references: [id])
  expiresAt       DateTime
  revokedAt       DateTime?
  createdAt       DateTime  @default(now())

  @@index([userId])
  @@index([activeCompanyId])
  @@index([expiresAt])
}
```

Localização: criar `apps/api/src/modules/companies/companyValidators.js`.

```js
import { httpError } from "../../lib/httpErrors.js";

export function validateSwitchCompanyPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(
            400,
            "INVALID_BODY",
            "O corpo do pedido deve ser um objeto JSON",
        );
    }

    if (
        typeof body.companyId !== "string" ||
        body.companyId.trim().length === 0
    ) {
        throw httpError(400, "INVALID_COMPANY_ID", "companyId é obrigatório");
    }

    return { companyId: body.companyId.trim() };
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
    - apps/api/src/modules/companies/companyService.js
    - apps/api/src/modules/companies/companyContext.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar no módulo backend do domínio; middlewares reutilizáveis ficam junto do domínio que fornece o contexto.
    - REVER:
    - BKs anteriores que fornecem `requireAuth`, `requireCompanyContext`, permissões, User, Company ou dados mestre.

3. Instruções do que fazer.

Implementa services depois dos validadores. Quando houver dados empresariais, recebe sempre `companyId` vindo da sessão/contexto, nunca do body. Quando houver role/permissão, garante que a rota chama o guard antes do service.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/companies/companyService.js`.

```js
import { httpError } from "../../lib/httpErrors.js";

function publicCompanyMembership(membership) {
    return {
        companyId: membership.company.id,
        companyName: membership.company.name,
        nif: membership.company.nif,
        role: membership.role,
    };
}

export async function listUserCompanies(prisma, userId) {
    const memberships = await prisma.companyMembership.findMany({
        where: { userId, isActive: true },
        include: { company: true },
        orderBy: { createdAt: "asc" },
    });

    return memberships.map(publicCompanyMembership);
}

export async function switchActiveCompany(
    prisma,
    { sessionId, userId, companyId },
) {
    const membership = await prisma.companyMembership.findFirst({
        where: { userId, companyId, isActive: true },
        include: { company: true },
    });

    if (!membership) {
        throw httpError(
            403,
            "COMPANY_FORBIDDEN",
            "Utilizador sem acesso a esta empresa",
        );
    }

    await prisma.session.update({
        where: { id: sessionId },
        data: { activeCompanyId: companyId },
    });

    return publicCompanyMembership(membership);
}

export async function getCompanyContext(prisma, { userId, companyId }) {
    if (!companyId) {
        throw httpError(
            403,
            "COMPANY_CONTEXT_REQUIRED",
            "Empresa ativa obrigatória",
        );
    }

    const membership = await prisma.companyMembership.findFirst({
        where: { userId, companyId, isActive: true },
        include: { company: true },
    });

    if (!membership) {
        throw httpError(
            403,
            "COMPANY_FORBIDDEN",
            "Utilizador sem acesso a esta empresa",
        );
    }

    return publicCompanyMembership(membership);
}
```

Localização: criar `apps/api/src/modules/companies/companyContext.js`.

```js
import { toHttpError } from "../../lib/httpErrors.js";
import { getCompanyContext } from "./companyService.js";

export function requireCompanyContext(prisma) {
    return async function companyContextMiddleware(req, res, next) {
        try {
            const context = await getCompanyContext(prisma, {
                userId: req.user.id,
                companyId: req.session.activeCompanyId,
            });

            // Todos os BKs de dados empresariais devem usar estes valores.
            req.companyId = context.companyId;
            req.role = context.role;
            req.company = {
                id: context.companyId,
                name: context.companyName,
                nif: context.nif,
            };

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
    - apps/api/src/modules/companies/companyController.js
    - apps/api/src/modules/companies/companyRoutes.js
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

Localização: criar `apps/api/src/modules/companies/companyController.js`.

```js
import { toHttpError } from "../../lib/httpErrors.js";
import { validateSwitchCompanyPayload } from "./companyValidators.js";
import {
    getCompanyContext,
    listUserCompanies,
    switchActiveCompany,
} from "./companyService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildCompanyController({ prisma }) {
    return {
        async list(req, res) {
            try {
                const companies = await listUserCompanies(prisma, req.user.id);
                return res.status(200).json({ companies });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async switchCompany(req, res) {
            try {
                const input = validateSwitchCompanyPayload(req.body);
                const context = await switchActiveCompany(prisma, {
                    sessionId: req.session.id,
                    userId: req.user.id,
                    companyId: input.companyId,
                });
                return res.status(200).json({ context });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async context(req, res) {
            try {
                const context = await getCompanyContext(prisma, {
                    userId: req.user.id,
                    companyId: req.session.activeCompanyId,
                });
                return res.status(200).json({ context });
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
```

Localização: criar `apps/api/src/modules/companies/companyRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { buildCompanyController } from "./companyController.js";

export function buildCompanyRoutes({ prisma }) {
    const router = Router();
    const controller = buildCompanyController({ prisma });
    const auth = requireAuth(prisma);

    router.get("/companies", auth, controller.list);
    router.post("/session/company", auth, controller.switchCompany);
    router.get("/session/context", auth, controller.context);

    return router;
}
```

Localização: editar `apps/api/src/server.js`, junto das restantes rotas.

```js
import { buildCompanyRoutes } from "./modules/companies/companyRoutes.js";

app.use("/api", buildCompanyRoutes({ prisma }));
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

Pedido `POST /api/session/company`:

```json
{
    "companyId": "uuid-empresa"
}
```

Resposta `200`:

```json
{
    "context": {
        "companyId": "uuid-empresa",
        "companyName": "OPSA Demo, Lda",
        "nif": "509442013",
        "role": "GESTOR"
    }
}
```

Erros esperados:

- `400 INVALID_COMPANY_ID`: `companyId` ausente.
- `401 SESSION_REQUIRED`: sem sessão.
- `403 COMPANY_CONTEXT_REQUIRED`: operação empresarial sem empresa ativa.
- `403 COMPANY_FORBIDDEN`: empresa não pertence ao utilizador.
- `404` não deve ser usado para esconder falhas de membership neste BK; usar `403` evita confirmar indevidamente a existência de empresas.

- Selecionar `companyId` onde o utilizador não tem membership deve devolver `403`.
- Chamar rota empresarial sem empresa ativa deve devolver `403`.
- Utilizador inativo ou sessão expirada deve continuar a devolver `401`, herdado do BK-MF0-01.

- Criar duas empresas e duas memberships para o mesmo utilizador com roles diferentes.
- Fazer `POST /api/session/company` para cada empresa e confirmar que `GET /api/session/context` muda `role`.
- Confirmar que uma rota protegida por `requireCompanyContext` recebe `req.companyId` e filtra por esse valor.

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

- Confirmar se a primeira empresa e membership inicial são criadas por seed, onboarding ou convite. Este BK apenas define o contrato técnico para usar empresas existentes.

5. Explicação do código.

O handoff protege continuidade. Num projeto PAP com vários alunos, a qualidade não está só no código: está também em deixar claro o que ficou decidido, o que ainda falta decidir e que contratos o próximo BK pode reutilizar.

6. Validação do passo.

Confirma que o final do BK contém apenas critérios de aceite, validação final, evidence, handoff e changelog.

7. Cenário negativo/erro esperado.

Se o handoff diz para usar algo que não foi criado neste BK ou num BK anterior, há contrato partido e deve ser corrigido antes de avançar.

## Critérios de aceite

- O BK-MF0-03 cumpre os critérios mensuráveis definidos acima.
- O contrato canónico do RF03 continua alinhado com backlog, matriz e MF-VIEWS.

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

O BK seguinte deve criar convites e gerir memberships dentro de uma empresa ativa. Todas as queries de utilizadores da empresa devem usar `companyId` vindo de `requireCompanyContext`.

## Changelog

- `2026-05-24`: guia refinado para estrutura step-by-step executável, com continuidade MF0, mockup, negativos, critérios e evidence.
- `2026-04-19`: metadados canónicos preservados da vaga de normalização.
