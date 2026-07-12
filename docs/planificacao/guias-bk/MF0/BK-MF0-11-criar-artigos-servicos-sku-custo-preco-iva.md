# BK-MF0-11 - Criar artigos/serviços (SKU, custo, preço, IVA).

## Header

- `doc_id`: `GUIA-BK-MF0-11`
- `bk_id`: `BK-MF0-11`
- `macro`: `MF0`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF11`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-12`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-11-criar-artigos-servicos-sku-custo-preco-iva.md`
- `last_updated`: `2026-07-10`

#### BK-MF0-11 - Criar artigos/serviços (SKU, custo, preço, IVA).

##### O que vamos fazer neste BK

Neste BK vamos transformar o requisito RF11 num guia de execução para construir a parte da app relacionada com inventário. O foco não é produzir documentação genérica: é deixar claro que modelos, endpoints, validações, UI e evidência devem existir quando a equipa implementar o BK.

A implementação pedagógica usa os caminhos públicos `apps/api` e `apps/web` e segue os contratos atuais de `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` e `docs/planificacao/CONTRATO-INTERFACES-IMPLEMENTACAO.md`. O estado `TODO` descreve apenas o progresso dos alunos; não significa ausência de uma implementação privada de referência.

Como a fase alvo é MF0, não existem BKs de fases anteriores a reutilizar. A continuidade nasce aqui: os outputs deste BK devem ser contratos estáveis para BK-MF0-12 e para os BKs de vendas, compras, inventário, contabilidade e segurança das fases seguintes.

##### Porque é que isto é importante

- Funcionalmente, cobre RF11 e desbloqueia o fluxo seguinte da MF0.
- Tecnicamente, cria contratos de Item e API que outros BKs podem reutilizar.
- Pedagogicamente, mostra aos alunos a ligação entre requisito, modelo, endpoint, UI, teste e evidence.
- Em segurança/robustez, obriga a validar dados no backend e a tratar erros previsíveis.
- Para continuidade, prepara explicitamente o handoff para BK-MF0-12.

##### O que entra (scope)

- Criar modelo Item por empresa.
- Suportar tipo PRODUCT/SERVICE se necessário para distinguir stock.
- Validar SKU único por empresa.
- Guardar custo, preço e IVA percentual ou referência preparada para tabela IVA futura.
- Ligar listagem de inventário ao backend.

##### O que não entra (scope-out)

- Movimentos de stock, porque pertencem ao BK-MF2-02.
- Configuração canónica de tabelas IVA, porque pertence ao BK-MF1-01.
- Cálculo FIFO, porque pertence ao BK-MF2-03.
- Catálogo com variantes complexas ou códigos de barras, não documentado.

##### Como saber que isto ficou bem

- O caso principal de Criar artigos/serviços (SKU, custo, preço, IVA) funciona através da UI ou de chamadas API documentadas.
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
- Flow ID: `FLOW-ITEMS` (DERIVADO)
- Fonte de verdade: `docs/RF.md` -> `RF11` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descrição: Criar artigos/serviços (SKU, custo, preço, IVA). (CANONICO)
- Stack decidida: `DERIVADO` e centralizada em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; este BK ensina o mesmo contrato seguro nos caminhos públicos dos alunos.
- Mockup usado: `mockup/` existe e foi usado como referência de fluxo, hierarquia e nomes visíveis; não é contrato pixel-perfect.

#### O que vamos fazer neste BK (DERIVADO):

- Estado esperado antes do BK: Não há catálogo persistente de artigos/serviços para vendas, compras e stock.
- Estado esperado depois do BK: A app tem artigos/serviços com SKU, custo, preço e IVA, prontos para faturação e movimentos de stock.
- Ficheiros a criar/editar/rever: schema Prisma, módulo backend `inventario`, cliente API frontend e componentes/páginas referenciados em `mockup/src/app/components/modules/Inventario.tsx, tabela Gestão de Inventário e botão Novo Artigo`.
- Dependências de BK anteriores e uso: Sem dependências anteriores declaradas.
- Reutilização técnica opcional (sem alterar dependências canónicas): se BK-MF0-02/BK-MF0-03 estiverem implementados, reutilizar `requireRole` e `companyId` ativo para o catálogo de artigos/serviços.
- Impacto na arquitetura: reforça separação entre routes, controllers, services, validators e UI.
- Impacto frontend: liga o fluxo visual do mockup a API real com estados loading/error/empty/success quando aplicável.
- Impacto backend/dados: cria ou prepara `Item` e endpoints `GET /api/items, POST /api/items, PATCH /api/items/:id, DELETE /api/items/:id`.
- Impacto segurança: valida inputs no backend, aplica sessão/permissão quando aplicável e evita exposição de dados sensíveis.
- Impacto testes: exige smoke e 3 negativos concretos.
- Handoff: BK-MF0-12 deve reutilizar os contratos aqui criados.

#### Pré-leitura mínima (10-15 min) (DERIVADO):

- `README.md` secções 1, 4, 5 e 7.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` para stack assumida e regras de adaptação de caminhos.
- `docs/RF.md` linha do requisito `RF11`.
- `docs/RNF.md` secções RNF05, RNF06, RNF12-RNF17, RNF25-RNF30 quando aplicável.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` linha deste BK.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` linha deste BK.
- `docs/planificacao/backlogs/MF-VIEWS.md` -> MF0.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` -> S01-S02.
- Mockup: `mockup/src/app/components/modules/Inventario.tsx, tabela Gestão de Inventário e botão Novo Artigo`.
- BKs anteriores: não existem dependências formais anteriores para este BK.

#### Glossário (rápido) (DERIVADO):

- **SKU:** Código único interno para identificar artigo ou serviço.
- **Custo:** Valor de aquisição/base para margem e FIFO futuro.
- **Preço:** Valor de venda antes/depois de IVA conforme contrato do formulário.
- **IVA:** Taxa fiscal associada ao artigo; tabela canónica vem no BK-MF1-01.
- **Serviço:** Item vendável que não movimenta stock físico.

#### Conceitos teóricos essenciais (DERIVADO):

- Artigos e serviços são o catálogo base. Vendas e compras futuras devem referenciar itemId para manter consistência.
- SKU deve ser único por empresa para evitar escolher o artigo errado.
- Custo e preço devem ser números positivos. Guardar moeda em centimos pode evitar erros de arredondamento.
- Como a tabela IVA canónica só chega no BK-MF1-01, este BK deve preparar o campo sem inventar códigos fiscais finais.
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
enum ItemType {
  PRODUCT
  SERVICE
}

model Item {
  id          String   @id @default(uuid())
  companyId   String
  sku         String
  name        String
  type        ItemType
  costCents   Int
  priceCents  Int
  vatRateBps  Int
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, sku])
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
  suppliers Supplier[]
  items Item[]
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
    - apps/api/src/modules/items/itemValidators.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar dentro do módulo do domínio em `apps/api/src/modules/...`; helpers partilhados ficam em `apps/api/src/lib` quando usados por vários BKs.
    - REVER:
    - docs/RNF.md: RNF05, RNF06, RNF12-RNF17, RNF21 quando existir email.

3. Instruções do que fazer.

Cria estes ficheiros antes dos services. Os services devem receber dados já normalizados e não devem repetir regex ou parse manual espalhado pelo código.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/items/itemValidators.js`.

```js
import { httpError } from "../../lib/httpErrors.js";

const VALID_TYPES = new Set(["PRODUCT", "SERVICE"]);

function requiredString(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw httpError(400, "INVALID_FIELD", `${field} é obrigatório`);
    }
    return value.trim();
}

function moneyCents(value, field, { allowZero }) {
    if (!Number.isInteger(value)) {
        throw httpError(
            400,
            "INVALID_MONEY",
            `${field} deve ser inteiro em centimos`,
        );
    }
    if (value < 0 || (!allowZero && value === 0)) {
        throw httpError(400, "INVALID_MONEY", `${field} tem valor inválido`);
    }
    return value;
}

function vatRateBps(value) {
    if (!Number.isInteger(value) || value < 0 || value > 10000) {
        throw httpError(
            400,
            "INVALID_VAT_RATE",
            "IVA deve estar entre 0 e 10000 basis points",
        );
    }
    return value;
}

export function validateItemPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const type = requiredString(body.type, "type").toUpperCase();
    if (!VALID_TYPES.has(type))
        throw httpError(
            400,
            "INVALID_ITEM_TYPE",
            "Tipo de artigo/serviço inválido",
        );

    return {
        sku: requiredString(body.sku, "sku").toUpperCase(),
        name: requiredString(body.name, "name"),
        type,
        costCents: moneyCents(body.costCents, "costCents", { allowZero: true }),
        priceCents: moneyCents(body.priceCents, "priceCents", {
            allowZero: false,
        }),
        vatRateBps: vatRateBps(body.vatRateBps),
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
    - apps/api/src/modules/items/itemService.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar no módulo backend do domínio; middlewares reutilizáveis ficam junto do domínio que fornece o contexto.
    - REVER:
    - BKs anteriores que fornecem `requireAuth`, `requireCompanyContext`, permissões, User, Company ou dados mestre.

3. Instruções do que fazer.

Implementa services depois dos validadores. Quando houver dados empresariais, recebe sempre `companyId` vindo da sessão/contexto, nunca do body. Quando houver role/permissão, garante que a rota chama o guard antes do service.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/items/itemService.js`.

```js
import { httpError } from "../../lib/httpErrors.js";
import {
    buildCursorPage,
    buildKeysetCondition,
    decodePageCursor,
    parsePageLimit,
} from "../../lib/cursorPagination.js";

function serialize(item) {
    return {
        id: item.id,
        sku: item.sku,
        name: item.name,
        type: item.type,
        costCents: item.costCents,
        priceCents: item.priceCents,
        vatRateBps: item.vatRateBps,
        isActive: item.isActive,
    };
}

async function assertUniqueSku(prisma, companyId, sku, ignoreId = undefined) {
    const existing = await prisma.item.findFirst({
        where: { companyId, sku, id: ignoreId ? { not: ignoreId } : undefined },
    });
    if (existing)
        throw httpError(
            409,
            "ITEM_SKU_EXISTS",
            "Já existe artigo/serviço com este SKU nesta empresa",
        );
}

export async function listItems(prisma, companyId, page = {}) {
    const limit = parsePageLimit(page.limit);
    const cursor = decodePageCursor(page.cursor, "string");
    const keyset = buildKeysetCondition(cursor, {
        sortField: "sku",
        direction: "asc",
    });
    const baseWhere = { companyId, isActive: true };
    const items = await prisma.item.findMany({
        where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
        orderBy: [{ sku: "asc" }, { id: "asc" }],
        take: limit + 1,
    });
    return buildCursorPage(items, {
        limit,
        sortField: "sku",
        sortType: "string",
        serialize,
    });
}

export async function createItem(prisma, companyId, input) {
    await assertUniqueSku(prisma, companyId, input.sku);
    const item = await prisma.item.create({ data: { companyId, ...input } });
    return serialize(item);
}

export async function updateItem(prisma, companyId, itemId, input) {
    await assertUniqueSku(prisma, companyId, input.sku, itemId);
    const updated = await prisma.item.updateMany({
        where: { id: itemId, companyId },
        data: input,
    });
    if (updated.count === 0)
        throw httpError(404, "ITEM_NOT_FOUND", "Artigo/serviço não encontrado");

    const item = await prisma.item.findFirst({
        where: { id: itemId, companyId },
    });
    return serialize(item);
}

export async function deactivateItem(prisma, companyId, itemId) {
    const updated = await prisma.item.updateMany({
        where: { id: itemId, companyId },
        data: { isActive: false },
    });
    if (updated.count === 0)
        throw httpError(404, "ITEM_NOT_FOUND", "Artigo/serviço não encontrado");
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
    - apps/api/src/modules/items/itemController.js
    - apps/api/src/modules/items/itemRoutes.js
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

Localização: criar `apps/api/src/modules/items/itemController.js`.

```js
import { toHttpError } from "../../lib/httpErrors.js";
import { validateItemPayload } from "./itemValidators.js";
import {
    createItem,
    deactivateItem,
    listItems,
    updateItem,
} from "./itemService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildItemController({ prisma }) {
    return {
        async list(req, res) {
            try {
                const page = await listItems(prisma, req.companyId, req.query);
                return res.status(200).json(page);
            } catch (error) {
                return sendError(res, error);
            }
        },

        async create(req, res) {
            try {
                const input = validateItemPayload(req.body);
                const item = await createItem(prisma, req.companyId, input);
                return res.status(201).json({ item });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async update(req, res) {
            try {
                const input = validateItemPayload(req.body);
                const item = await updateItem(
                    prisma,
                    req.companyId,
                    req.params.id,
                    input,
                );
                return res.status(200).json({ item });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async remove(req, res) {
            try {
                await deactivateItem(prisma, req.companyId, req.params.id);
                return res.status(204).send();
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
```

Localização: criar `apps/api/src/modules/items/itemRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { buildItemController } from "./itemController.js";

export function buildItemRoutes({ prisma }) {
    const router = Router();
    const controller = buildItemController({ prisma });
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ITEMS_WRITE),
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
import { buildItemRoutes } from "./modules/items/itemRoutes.js";

app.use("/api/items", buildItemRoutes({ prisma }));
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

Pedido `POST /api/items`:

```json
{
    "sku": "CONS-001",
    "name": "Consultoria contabilística",
    "type": "SERVICE",
    "costCents": 0,
    "priceCents": 7500,
    "vatRateBps": 2300
}
```

Resposta `201` devolve `{ "item": ... }` com `id`, `sku`, `priceCents` e `vatRateBps`.

Erros esperados:

- `400 INVALID_ITEM_TYPE`.
- `400 INVALID_MONEY`.
- `400 INVALID_VAT_RATE`.
- `401 SESSION_REQUIRED`.
- `403 PERMISSION_FORBIDDEN`.
- `404 ITEM_NOT_FOUND`.
- `409 ITEM_SKU_EXISTS`.

- SKU duplicado na mesma empresa devolve `409`.
- `priceCents` igual a `0` devolve `400`.
- Tentativa de criar item noutra empresa por body deve ser ignorada, porque `companyId` vem da sessão.

- Criar serviço com IVA 23% (`vatRateBps=2300`) e listar.
- Criar produto com custo maior que zero.
- Validar negativos: SKU duplicado, preço zero e role sem permissão.

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

- RF13 define tabelas de IVA só em MF1. Até la, `vatRateBps` e valor manual validado por intervalo, não uma tabela legal oficial. Quando `BK-MF1-01` existir, migrar para referência a tabela de IVA.
- Confirmar política de arredondamentos e casas decimais para documentos fiscais antes de faturação.

5. Explicação do código.

O handoff protege continuidade. Num projeto PAP com vários alunos, a qualidade não está só no código: está também em deixar claro o que ficou decidido, o que ainda falta decidir e que contratos o próximo BK pode reutilizar.

6. Validação do passo.

Confirma que o final do BK contém apenas critérios de aceite, validação final, evidence, handoff e changelog.

7. Cenário negativo/erro esperado.

Se o handoff diz para usar algo que não foi criado neste BK ou num BK anterior, há contrato partido e deve ser corrigido antes de avançar.

## Critérios de aceite

- O BK-MF0-11 cumpre os critérios mensuráveis definidos acima.
- O contrato canónico do RF11 continua alinhado com backlog, matriz e MF-VIEWS.

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

Produtos podem vir a movimentar stock; serviços não. O BK-MF0-12 deve criar armazéns/localizações sem ainda movimentar quantidades.

## Changelog

- `2026-05-24`: guia refinado para estrutura step-by-step executável, com continuidade MF0, mockup, negativos, critérios e evidence.
- `2026-04-19`: metadados canónicos preservados da vaga de normalização.
