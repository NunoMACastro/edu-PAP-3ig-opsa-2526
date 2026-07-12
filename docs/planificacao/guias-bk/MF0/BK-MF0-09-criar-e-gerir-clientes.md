# BK-MF0-09 - Criar e gerir clientes.

## Header

- `doc_id`: `GUIA-BK-MF0-09`
- `bk_id`: `BK-MF0-09`
- `macro`: `MF0`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF09`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-10`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-09-criar-e-gerir-clientes.md`
- `last_updated`: `2026-07-10`

#### BK-MF0-09 - Criar e gerir clientes.

##### O que vamos fazer neste BK

Neste BK vamos transformar o requisito RF09 num guia de execução para construir a parte da app relacionada com vendas. O foco não é produzir documentação genérica: é deixar claro que modelos, endpoints, validações, UI e evidência devem existir quando a equipa implementar o BK.

A implementação pedagógica usa os caminhos públicos `apps/api` e `apps/web` e segue os contratos atuais de `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` e `docs/planificacao/CONTRATO-INTERFACES-IMPLEMENTACAO.md`. O estado `TODO` descreve apenas o progresso dos alunos; não significa ausência de uma implementação privada de referência.

Como a fase alvo é MF0, não existem BKs de fases anteriores a reutilizar. A continuidade nasce aqui: os outputs deste BK devem ser contratos estáveis para BK-MF0-10 e para os BKs de vendas, compras, inventário, contabilidade e segurança das fases seguintes.

##### Porque é que isto é importante

- Funcionalmente, cobre RF09 e desbloqueia o fluxo seguinte da MF0.
- Tecnicamente, cria contratos de Customer e API que outros BKs podem reutilizar.
- Pedagogicamente, mostra aos alunos a ligação entre requisito, modelo, endpoint, UI, teste e evidence.
- Em segurança/robustez, obriga a validar dados no backend e a tratar erros previsíveis.
- Para continuidade, prepara explicitamente o handoff para BK-MF0-10.

##### O que entra (scope)

- Criar modelo Customer por empresa.
- Criar endpoints CRUD essenciais.
- Validar NIF, email e campos obrigatórios.
- Criar UI/listagem ou modal simples para novo cliente.
- Preparar pesquisa por nome/NIF.

##### O que não entra (scope-out)

- Emissão de faturas, porque pertence ao BK-MF1-02.
- Saldos e antiguidade de dívida, porque pertence ao BK-MF1-05.
- Importação CSV de clientes, porque pertence ao BK-MF3-05.
- Regras CRM avançadas não descritas.

##### Como saber que isto ficou bem

- O caso principal de Criar e gerir clientes funciona através da UI ou de chamadas API documentadas.
- Os endpoints definidos respondem com códigos HTTP previsíveis e sem expor dados sensíveis.
- Os validadores rejeitam entradas inválidas antes de chegar a persistência.
- A evidence inclui smoke, negativos, ficheiros alterados e comandos executados.
- Não existe ALTERAÇÃO DE CONTRATO face aos documentos canónicos; se surgir, deve ser marcada e justificada.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `TODO` (CANONICO; não marcar DONE apenas por o guia estar detalhado)
- Esforço: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Andre` (CANONICO)
- Apoio: `Oleksii` (CANONICO)
- Dependências (BK IDs): `-` (CANONICO)
- Pré-condições: Sem dependências anteriores declaradas. O scaffold pedagógico pode ainda estar incompleto; usar `apps/api` e `apps/web` e respeitar os contratos centrais atuais. (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL.md` MF0; `PLANO-SPRINTS.md` S01-S02. (CANONICO)
- Flow ID: `FLOW-CUSTOMERS` (DERIVADO)
- Fonte de verdade: `docs/RF.md` -> `RF09` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descrição: Criar e gerir clientes. (CANONICO)
- Stack decidida: `DERIVADO` e centralizada em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; este BK ensina o mesmo contrato seguro nos caminhos públicos dos alunos.
- Mockup usado: `mockup/` existe e foi usado como referência de fluxo, hierarquia e nomes visíveis; não é contrato pixel-perfect.

#### O que vamos fazer neste BK (DERIVADO):

- Estado esperado antes do BK: Não há entidade cliente persistente para alimentar vendas.
- Estado esperado depois do BK: A app tem clientes por empresa com pesquisa/listagem e contrato pronto para faturas em BK-MF1-02.
- Ficheiros a criar/editar/rever: schema Prisma, módulo backend `vendas`, cliente API frontend e componentes/páginas referenciados em `mockup/src/app/components/modules/Vendas.tsx, campo Cliente na criação de fatura`.
- Dependências de BK anteriores e uso: Sem dependências anteriores declaradas.
- Reutilização técnica opcional (sem alterar dependências canónicas): se BK-MF0-02/BK-MF0-03 estiverem implementados, reutilizar `requireRole` e `companyId` ativo para clientes por empresa.
- Impacto na arquitetura: reforça separação entre routes, controllers, services, validators e UI.
- Impacto frontend: liga o fluxo visual do mockup a API real com estados loading/error/empty/success quando aplicável.
- Impacto backend/dados: cria ou prepara `Customer` e endpoints `GET /api/customers, POST /api/customers, PATCH /api/customers/:id, DELETE /api/customers/:id`.
- Impacto segurança: valida inputs no backend, aplica sessão/permissão quando aplicável e evita exposição de dados sensíveis.
- Impacto testes: exige smoke e 3 negativos concretos.
- Handoff: BK-MF0-10 deve reutilizar os contratos aqui criados.

#### Pré-leitura mínima (10-15 min) (DERIVADO):

- `README.md` secções 1, 4, 5 e 7.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` para stack assumida e regras de adaptação de caminhos.
- `docs/RF.md` linha do requisito `RF09`.
- `docs/RNF.md` secções RNF05, RNF06, RNF12-RNF17, RNF25-RNF30 quando aplicável.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` linha deste BK.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` linha deste BK.
- `docs/planificacao/backlogs/MF-VIEWS.md` -> MF0.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` -> S01-S02.
- Mockup: `mockup/src/app/components/modules/Vendas.tsx, campo Cliente na criação de fatura`.
- BKs anteriores: não existem dependências formais anteriores para este BK.

#### Glossário (rápido) (DERIVADO):

- **Cliente:** Entidade a quem a empresa vende produtos ou serviços.
- **CRUD:** Criar, ler, atualizar e remover/desativar registos.
- **NIF duplicado:** Mesmo número fiscal repetido na mesma empresa.
- **Soft delete:** Desativar cliente sem apagar histórico.
- **Select de cliente:** Campo de formulário que escolhe cliente existente para fatura.

#### Conceitos teóricos essenciais (DERIVADO):

- Clientes são dados mestre de vendas. Uma fatura deve apontar para customerId, não repetir todos os dados manualmente.
- NIF e email devem ser validados no frontend para UX, mas também no backend para segurança e consistência.
- Em ERP, apagar fisicamente clientes pode quebrar histórico. O MVP deve preferir desativar quando já houver documentos associados.
- A listagem deve ser filtrada por companyId para respeitar multiempresa.
- **Erros comuns a evitar:** implementar só no frontend, confiar em dados enviados pelo browser, esquecer `companyId` nos dados por empresa, devolver mensagens técnicas cruas ao utilizador ou criar campos que não aparecem nos RF/RNF.
- **Negativos de segurança/robustez:** todos os casos inválidos devem falhar de forma controlada, sem stack traces, sem dados sensíveis e sem escrita parcial na base de dados.

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
model Customer {
  id          String   @id @default(uuid())
  companyId   String
  name        String
  nif         String?
  email       String?
  phone       String?
  addressLine String?
  postalCode  String?
  city        String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, nif])
  @@index([companyId])
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
  profile CompanyProfile?
  accounts Account[]
  fiscalPeriods FiscalPeriod[]
  customers Customer[]
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
    - apps/api/src/modules/customers/customerValidators.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar dentro do módulo do domínio em `apps/api/src/modules/...`; helpers partilhados ficam em `apps/api/src/lib` quando usados por vários BKs.
    - REVER:
    - docs/RNF.md: RNF05, RNF06, RNF12-RNF17, RNF21 quando existir email.

3. Instruções do que fazer.

Cria estes ficheiros antes dos services. Os services devem receber dados já normalizados e não devem repetir regex ou parse manual espalhado pelo código.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/customers/customerValidators.js`.

```js
import { httpError } from "../../lib/httpErrors.js";
import { isValidPortugueseNif } from "../company-profile/nifValidator.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requiredName(value) {
    if (typeof value !== "string" || value.trim().length < 2) {
        throw httpError(
            400,
            "INVALID_CUSTOMER_NAME",
            "Nome do cliente é obrigatório",
        );
    }
    return value.trim();
}

function optionalString(value) {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value !== "string")
        throw httpError(400, "INVALID_FIELD", "Campo inválido");
    return value.trim();
}

function optionalNif(value) {
    const nif = optionalString(value);
    if (!nif) return null;
    if (!isValidPortugueseNif(nif))
        throw httpError(400, "INVALID_NIF", "NIF português inválido");
    return nif;
}

function optionalEmail(value) {
    const email = optionalString(value);
    if (!email) return null;
    if (!EMAIL_PATTERN.test(email))
        throw httpError(400, "INVALID_EMAIL", "Email inválido");
    return email.toLowerCase();
}

export function validateCustomerPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    return {
        name: requiredName(body.name),
        nif: optionalNif(body.nif),
        email: optionalEmail(body.email),
        phone: optionalString(body.phone),
        addressLine: optionalString(body.addressLine),
        postalCode: optionalString(body.postalCode),
        city: optionalString(body.city),
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
    - apps/api/src/modules/customers/customerService.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar no módulo backend do domínio; middlewares reutilizáveis ficam junto do domínio que fornece o contexto.
    - REVER:
    - BKs anteriores que fornecem `requireAuth`, `requireCompanyContext`, permissões, User, Company ou dados mestre.

3. Instruções do que fazer.

Implementa services depois dos validadores. Quando houver dados empresariais, recebe sempre `companyId` vindo da sessão/contexto, nunca do body. Quando houver role/permissão, garante que a rota chama o guard antes do service.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/customers/customerService.js`.

```js
import { httpError } from "../../lib/httpErrors.js";
import {
    buildCursorPage,
    buildKeysetCondition,
    decodePageCursor,
    parsePageLimit,
} from "../../lib/cursorPagination.js";

function serialize(customer) {
    return {
        id: customer.id,
        name: customer.name,
        nif: customer.nif,
        email: customer.email,
        phone: customer.phone,
        addressLine: customer.addressLine,
        postalCode: customer.postalCode,
        city: customer.city,
        isActive: customer.isActive,
    };
}

async function assertUniqueNif(prisma, companyId, nif, ignoreId = undefined) {
    if (!nif) return;

    const existing = await prisma.customer.findFirst({
        where: { companyId, nif, id: ignoreId ? { not: ignoreId } : undefined },
    });

    if (existing) {
        throw httpError(
            409,
            "CUSTOMER_NIF_EXISTS",
            "Já existe cliente com este NIF nesta empresa",
        );
    }
}

export async function listCustomers(prisma, companyId, page = {}) {
    const limit = parsePageLimit(page.limit);
    const cursor = decodePageCursor(page.cursor, "string");
    const keyset = buildKeysetCondition(cursor, {
        sortField: "name",
        direction: "asc",
    });
    const baseWhere = { companyId, isActive: true };
    const customers = await prisma.customer.findMany({
        where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
        orderBy: [{ name: "asc" }, { id: "asc" }],
        take: limit + 1,
    });
    return buildCursorPage(customers, {
        limit,
        sortField: "name",
        sortType: "string",
        serialize,
    });
}

export async function createCustomer(prisma, companyId, input) {
    await assertUniqueNif(prisma, companyId, input.nif);
    const customer = await prisma.customer.create({
        data: { companyId, ...input },
    });
    return serialize(customer);
}

export async function updateCustomer(prisma, companyId, customerId, input) {
    await assertUniqueNif(prisma, companyId, input.nif, customerId);

    const updated = await prisma.customer.updateMany({
        where: { id: customerId, companyId },
        data: input,
    });
    if (updated.count === 0)
        throw httpError(404, "CUSTOMER_NOT_FOUND", "Cliente não encontrado");

    const customer = await prisma.customer.findFirst({
        where: { id: customerId, companyId },
    });
    return serialize(customer);
}

export async function deactivateCustomer(prisma, companyId, customerId) {
    const updated = await prisma.customer.updateMany({
        where: { id: customerId, companyId },
        data: { isActive: false },
    });
    if (updated.count === 0)
        throw httpError(404, "CUSTOMER_NOT_FOUND", "Cliente não encontrado");
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
    - apps/api/src/modules/customers/customerController.js
    - apps/api/src/modules/customers/customerRoutes.js
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

Localização: criar `apps/api/src/modules/customers/customerController.js`.

```js
import { toHttpError } from "../../lib/httpErrors.js";
import { validateCustomerPayload } from "./customerValidators.js";
import {
    createCustomer,
    deactivateCustomer,
    listCustomers,
    updateCustomer,
} from "./customerService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildCustomerController({ prisma }) {
    return {
        async list(req, res) {
            try {
                const page = await listCustomers(prisma, req.companyId, req.query);
                return res.status(200).json(page);
            } catch (error) {
                return sendError(res, error);
            }
        },

        async create(req, res) {
            try {
                const input = validateCustomerPayload(req.body);
                const customer = await createCustomer(
                    prisma,
                    req.companyId,
                    input,
                );
                return res.status(201).json({ customer });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async update(req, res) {
            try {
                const input = validateCustomerPayload(req.body);
                const customer = await updateCustomer(
                    prisma,
                    req.companyId,
                    req.params.id,
                    input,
                );
                return res.status(200).json({ customer });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async remove(req, res) {
            try {
                await deactivateCustomer(prisma, req.companyId, req.params.id);
                return res.status(204).send();
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
```

Localização: criar `apps/api/src/modules/customers/customerRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { buildCustomerController } from "./customerController.js";

export function buildCustomerRoutes({ prisma }) {
    const router = Router();
    const controller = buildCustomerController({ prisma });
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.CUSTOMERS_WRITE),
    ];

    router.get("/", guards, controller.list);
    router.post("/", guards, controller.create);
    router.patch("/:id", guards, controller.update);
    router.delete("/:id", guards, controller.remove);

    return router;
}
```

Localização: editar `apps/api/src/server.js`, junto das restantes rotas.

```js
import { buildCustomerRoutes } from "./modules/customers/customerRoutes.js";

app.use("/api/customers", buildCustomerRoutes({ prisma }));
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

Pedido `POST /api/customers`:

```json
{
    "name": "Cliente Exemplo, Lda",
    "nif": "509442013",
    "email": "financeiro@cliente.pt",
    "phone": "+351210000000",
    "addressLine": "Rua do Cliente, 20",
    "postalCode": "1000-100",
    "city": "Lisboa"
}
```

Resposta `201` devolve `{ "customer": ... }` com os mesmos campos e `id`.

Erros esperados:

- `400 INVALID_CUSTOMER_NAME`, `400 INVALID_NIF`, `400 INVALID_EMAIL`.
- `401 SESSION_REQUIRED`.
- `403 PERMISSION_FORBIDDEN`.
- `404 CUSTOMER_NOT_FOUND`.
- `409 CUSTOMER_NIF_EXISTS`.

- Criar cliente com NIF inválido devolve `400`.
- Criar cliente com NIF duplicado na mesma empresa devolve `409`.
- Atualizar cliente de outra empresa devolve `404` porque a query filtra por `companyId`.

- Criar cliente, listar clientes e atualizar email.
- Trocar para outra empresa e confirmar que o cliente não aparece.
- Fazer `DELETE` e confirmar que desaparece da listagem sem apagar histórico.

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

- Confirmar se o MVP deve aceitar clientes sem NIF. O código permite `nif` nulo para clientes estrangeiros/particulares até haver regra fiscal mais restritiva documentada.

5. Explicação do código.

O handoff protege continuidade. Num projeto PAP com vários alunos, a qualidade não está só no código: está também em deixar claro o que ficou decidido, o que ainda falta decidir e que contratos o próximo BK pode reutilizar.

6. Validação do passo.

Confirma que o final do BK contém apenas critérios de aceite, validação final, evidence, handoff e changelog.

7. Cenário negativo/erro esperado.

Se o handoff diz para usar algo que não foi criado neste BK ou num BK anterior, há contrato partido e deve ser corrigido antes de avançar.

## Critérios de aceite

- O BK-MF0-09 cumpre os critérios mensuráveis definidos acima.
- O contrato canónico do RF09 continua alinhado com backlog, matriz e MF-VIEWS.

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

Fornecedores usam o mesmo padrão de dados mestre, mas com permissões e impacto em compras. Reutilizar validação de NIF e isolamento por `companyId`.

- Próximo BK recomendado: `BK-MF0-10`.

## Changelog

- `2026-07-10`: handoff sincronizado explicitamente com o próximo BK canónico do header.
- `2026-05-24`: guia refinado para estrutura step-by-step executável, com continuidade MF0, mockup, negativos, critérios e evidence.
- `2026-04-19`: metadados canónicos preservados da vaga de normalização.
