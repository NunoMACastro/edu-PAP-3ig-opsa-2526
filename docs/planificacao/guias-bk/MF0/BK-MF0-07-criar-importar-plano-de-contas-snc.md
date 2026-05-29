# BK-MF0-07 - Criar/importar plano de contas (SNC).

## Header

- `doc_id`: `GUIA-BK-MF0-07`
- `bk_id`: `BK-MF0-07`
- `macro`: `MF0`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF07`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-08`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-07-criar-importar-plano-de-contas-snc.md`
- `last_updated`: `2026-05-24`

#### BK-MF0-07 - Criar/importar plano de contas (SNC).

##### O que vamos fazer neste BK

Neste BK vamos transformar o requisito RF07 num guia de execucao para construir a parte da app relacionada com contabilidade. O foco nao e produzir documentacao generica: e deixar claro que modelos, endpoints, validacoes, UI e evidencia devem existir quando a equipa implementar o BK.

A app real ainda esta marcada como `sem_codigo`; por isso, os caminhos tecnicos propostos seguem o contrato central `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`. Esse contrato define a stack assumida, a estrutura indicativa e a regra de adaptacao quando existir scaffold real, sem alterar RF, BK, owners, dependencias ou criterios de aceite.

Como a fase alvo e MF0, nao existem BKs de fases anteriores a reutilizar. A continuidade nasce aqui: os outputs deste BK devem ser contratos estaveis para BK-MF0-08 e para os BKs de vendas, compras, inventario, contabilidade e seguranca das fases seguintes.

##### Porque e que isto e importante

- Funcionalmente, cobre RF07 e desbloqueia o fluxo seguinte da MF0.
- Tecnicamente, cria contratos de Account e API que outros BKs podem reutilizar.
- Pedagogicamente, mostra aos alunos a ligacao entre requisito, modelo, endpoint, UI, teste e evidence.
- Em seguranca/robustez, obriga a validar dados no backend e a tratar erros previsiveis.
- Para continuidade, prepara explicitamente o handoff para BK-MF0-08.

##### O que entra (scope)

- Criar modelo de conta com codigo, nome, tipo, nivel e estado ativo.
- Permitir criacao manual de conta.
- Preparar importacao CSV simples com validacao linha a linha.
- Impedir codigos duplicados por empresa.
- Deixar contrato para MF2/MF3 consultar contas.

##### O que nao entra (scope-out)

- Geracao de lancamentos manuais, porque pertence ao BK-MF2-06.
- Mapas oficiais completos sem fonte externa validada.
- SAF-T final, porque pertence a MF3/MF7.
- Plano SNC completo inventado manualmente no guia.

##### Como saber que isto ficou bem

- O caso principal de Criar/importar plano de contas (SNC) funciona atraves da UI ou de chamadas API documentadas.
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
- Flow ID: `FLOW-CHART-OF-ACCOUNTS` (DERIVADO)
- Fonte de verdade: `docs/RF.md` -> `RF07` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Criar/importar plano de contas (SNC). (CANONICO)
- Stack decidida: `DERIVADO` e centralizada em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; este BK usa essa stack apenas como assuncao tecnica ate existir scaffold real.
- Mockup usado: `mockup/` existe e foi usado como referencia de fluxo, hierarquia e nomes visiveis; nao e contrato pixel-perfect.

#### O que vamos fazer neste BK (DERIVADO):

- Estado esperado antes do BK: A empresa pode ainda nao ter plano de contas; nao ha lancamentos contabilisticos validos sem contas.
- Estado esperado depois do BK: A empresa tem um plano de contas editavel/importavel e preparado para lancamentos manuais e automaticos.
- Ficheiros a criar/editar/rever: schema Prisma, modulo backend `contabilidade`, cliente API frontend e componentes/paginas referenciados em `mockup/src/app/components/modules/Contabilidade.tsx, filtros por Conta e tabelas contabilisticas`.
- Dependencias de BK anteriores e uso: Sem dependencias anteriores declaradas.
- Reutilizacao tecnica opcional (sem alterar dependencias canonicas): se BK-MF0-02/BK-MF0-03 estiverem implementados, reutilizar roles autorizadas e `companyId` ativo para isolar o plano de contas por empresa.
- Impacto na arquitetura: reforca separacao entre routes, controllers, services, validators e UI.
- Impacto frontend: liga o fluxo visual do mockup a API real com estados loading/error/empty/success quando aplicavel.
- Impacto backend/dados: cria ou prepara `Account` e endpoints `GET /api/accounting/accounts, POST /api/accounting/accounts, POST /api/accounting/accounts/import`.
- Impacto seguranca: valida inputs no backend, aplica sessao/permissao quando aplicavel e evita exposicao de dados sensiveis.
- Impacto testes: exige smoke e 3 negativos concretos.
- Handoff: BK-MF0-08 deve reutilizar os contratos aqui criados.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- `README.md` seccoes 1, 4, 5 e 7.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` para stack assumida e regras de adaptacao de caminhos.
- `docs/RF.md` linha do requisito `RF07`.
- `docs/RNF.md` seccoes RNF05, RNF06, RNF12-RNF17, RNF25-RNF30 quando aplicavel.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` linha deste BK.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` linha deste BK.
- `docs/planificacao/backlogs/MF-VIEWS.md` -> MF0.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` -> S01-S02.
- Mockup: `mockup/src/app/components/modules/Contabilidade.tsx, filtros por Conta e tabelas contabilisticas`.
- BKs anteriores: nao existem dependencias formais anteriores para este BK.

#### Glossario (rapido) (DERIVADO):

- **Plano de contas:** Lista organizada das contas contabilisticas usadas pela empresa.
- **SNC:** Sistema de Normalizacao Contabilistica portugues.
- **Conta ativa:** Conta disponivel para ser usada em lancamentos.
- **Importacao CSV:** Carregamento de varias contas a partir de ficheiro tabular.
- **Constraint unica:** Regra da base de dados que impede codigos repetidos por empresa.

#### Conceitos teoricos essenciais (DERIVADO):

- O plano de contas e uma base de integridade contabilistica. Sem contas validas, os lancamentos futuros ficariam soltos e pouco auditaveis.
- Nao se deve inventar o SNC completo. O BK cria a estrutura tecnica e permite importar uma fonte confirmada pelo orientador.
- A validacao deve acontecer antes de gravar cada linha importada. Erros de uma linha devem ser reportados claramente.
- A constraint companyId + code evita duas contas com o mesmo codigo na mesma empresa.
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

5. Explicacao do codigo.

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

Localizacao: acrescentar a `apps/api/prisma/schema.prisma`.

```prisma
model Account {
  id          String   @id @default(uuid())
  companyId   String
  code        String
  name        String
  parentCode  String?
  level       Int
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, code])
  @@index([companyId])
}
```

Localizacao: no mesmo ficheiro, substituir o modelo `Company` existente pela versao acumulada ate este BK.

```prisma
model Company {
  id          String              @id @default(uuid())
  name        String
  nif         String?             @unique
  memberships CompanyMembership[]
  invitations CompanyInvitation[]
  profile CompanyProfile?
  accounts Account[]
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
}
```

5. Explicacao do codigo.

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
    - apps/api/src/modules/accounting/accounts/accountValidators.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar dentro do modulo do dominio em `apps/api/src/modules/...`; helpers partilhados ficam em `apps/api/src/lib` quando usados por varios BKs.
    - REVER:
    - docs/RNF.md: RNF05, RNF06, RNF12-RNF17, RNF21 quando existir email.

3. Instrucoes do que fazer.

Cria estes ficheiros antes dos services. Os services devem receber dados ja normalizados e nao devem repetir regex ou parse manual espalhado pelo codigo.

4. Codigo completo, correto e integrado com a app final.

Localizacao: criar `apps/api/src/modules/accounting/accounts/accountValidators.js`.

```js
import { httpError } from "../../../lib/httpErrors.js";

const ACCOUNT_CODE_PATTERN = /^\d{1,8}$/;

function validateCode(code) {
    if (typeof code !== "string" || !ACCOUNT_CODE_PATTERN.test(code.trim())) {
        throw httpError(
            400,
            "INVALID_ACCOUNT_CODE",
            "Codigo SNC deve ser numerico e ter entre 1 e 8 digitos",
        );
    }
    return code.trim();
}

function validateName(name) {
    if (typeof name !== "string" || name.trim().length < 3) {
        throw httpError(
            400,
            "INVALID_ACCOUNT_NAME",
            "Nome da conta deve ter pelo menos 3 caracteres",
        );
    }
    return name.trim();
}

function accountLevelFromCode(code) {
    return code.length;
}

export function validateAccountPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const code = validateCode(body.code);
    const parentCode = body.parentCode ? validateCode(body.parentCode) : null;

    return {
        code,
        name: validateName(body.name),
        parentCode,
        level: accountLevelFromCode(code),
        isActive: body.isActive !== false,
    };
}

export function validateImportPayload(body) {
    if (!body || typeof body !== "object" || !Array.isArray(body.rows)) {
        throw httpError(
            400,
            "INVALID_IMPORT",
            "Importacao deve receber rows normalizadas",
        );
    }

    return body.rows.map(validateAccountPayload);
}
```

5. Explicacao do codigo.

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
    - apps/api/src/modules/accounting/accounts/accountService.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar no modulo backend do dominio; middlewares reutilizaveis ficam junto do dominio que fornece o contexto.
    - REVER:
    - BKs anteriores que fornecem `requireAuth`, `requireCompanyContext`, permissoes, User, Company ou dados mestre.

3. Instrucoes do que fazer.

Implementa services depois dos validadores. Quando houver dados empresariais, recebe sempre `companyId` vindo da sessao/contexto, nunca do body. Quando houver role/permissao, garante que a rota chama o guard antes do service.

4. Codigo completo, correto e integrado com a app final.

Localizacao: criar `apps/api/src/modules/accounting/accounts/accountService.js`.

```js
import { httpError } from "../../../lib/httpErrors.js";

function serialize(account) {
    return {
        id: account.id,
        code: account.code,
        name: account.name,
        parentCode: account.parentCode,
        level: account.level,
        isActive: account.isActive,
    };
}

export async function listAccounts(prisma, companyId) {
    const accounts = await prisma.account.findMany({
        where: { companyId },
        orderBy: { code: "asc" },
    });

    return accounts.map(serialize);
}

export async function createAccount(prisma, companyId, input) {
    const existing = await prisma.account.findUnique({
        where: { companyId_code: { companyId, code: input.code } },
    });

    if (existing) {
        throw httpError(
            409,
            "ACCOUNT_CODE_EXISTS",
            "Ja existe uma conta com este codigo nesta empresa",
        );
    }

    const account = await prisma.account.create({
        data: { companyId, ...input },
    });

    return serialize(account);
}

export async function importAccountsFromRows(prisma, companyId, rows) {
    const seen = new Set();
    for (const row of rows) {
        if (seen.has(row.code)) {
            throw httpError(
                409,
                "DUPLICATED_IMPORT_CODE",
                `Codigo duplicado no ficheiro: ${row.code}`,
            );
        }
        seen.add(row.code);
    }

    const existing = await prisma.account.findMany({
        where: { companyId, code: { in: rows.map((row) => row.code) } },
        select: { code: true },
    });

    if (existing.length > 0) {
        throw httpError(
            409,
            "ACCOUNT_CODE_EXISTS",
            `Codigo ja existente: ${existing[0].code}`,
        );
    }

    await prisma.account.createMany({
        data: rows.map((row) => ({ companyId, ...row })),
    });

    return { imported: rows.length };
}
```

5. Explicacao do codigo.

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
    - apps/api/src/modules/accounting/accounts/accountController.js
    - apps/api/src/modules/accounting/accounts/accountRoutes.js
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

Localizacao: criar `apps/api/src/modules/accounting/accounts/accountController.js`.

```js
import { toHttpError } from "../../../lib/httpErrors.js";
import {
    validateAccountPayload,
    validateImportPayload,
} from "./accountValidators.js";
import {
    createAccount,
    importAccountsFromRows,
    listAccounts,
} from "./accountService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildAccountController({ prisma }) {
    return {
        async list(req, res) {
            try {
                const accounts = await listAccounts(prisma, req.companyId);
                return res.status(200).json({ accounts });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async create(req, res) {
            try {
                const input = validateAccountPayload(req.body);
                const account = await createAccount(
                    prisma,
                    req.companyId,
                    input,
                );
                return res.status(201).json({ account });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async importRows(req, res) {
            try {
                const rows = validateImportPayload(req.body);
                const result = await importAccountsFromRows(
                    prisma,
                    req.companyId,
                    rows,
                );
                return res.status(201).json(result);
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
```

Localizacao: criar `apps/api/src/modules/accounting/accounts/accountRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../../auth/authMiddleware.js";
import { requireCompanyContext } from "../../companies/companyContext.js";
import { Permission } from "../../permissions/permissions.js";
import { requirePermission } from "../../permissions/permissionMiddleware.js";
import { buildAccountController } from "./accountController.js";

export function buildAccountRoutes({ prisma }) {
    const router = Router();
    const controller = buildAccountController({ prisma });

    router.get(
        "/",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ACCOUNTING_READ),
        controller.list,
    );

    router.post(
        "/",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ACCOUNTING_WRITE),
        controller.create,
    );

    router.post(
        "/import",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ACCOUNTING_WRITE),
        controller.importRows,
    );

    return router;
}
```

Localizacao: editar `apps/api/src/server.js`, junto das restantes rotas.

```js
import { buildAccountRoutes } from "./modules/accounting/accounts/accountRoutes.js";

app.use("/api/accounting/accounts", buildAccountRoutes({ prisma }));
```

5. Explicacao do codigo.

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

Pedido `POST /api/accounting/accounts`:

```json
{
    "code": "12",
    "name": "Depositos a ordem",
    "parentCode": "1",
    "isActive": true
}
```

Resposta `201`:

```json
{
    "account": {
        "id": "uuid-conta",
        "code": "12",
        "name": "Depositos a ordem",
        "parentCode": "1",
        "level": 2,
        "isActive": true
    }
}
```

Pedido `POST /api/accounting/accounts/import`:

```json
{
    "rows": [
        { "code": "11", "name": "Caixa" },
        { "code": "12", "name": "Depositos a ordem", "parentCode": "1" }
    ]
}
```

Erros esperados:

- `400 INVALID_ACCOUNT_CODE`.
- `400 INVALID_ACCOUNT_NAME`.
- `400 INVALID_IMPORT`.
- `401 SESSION_REQUIRED`.
- `403 PERMISSION_FORBIDDEN`.
- `409 ACCOUNT_CODE_EXISTS` ou `409 DUPLICATED_IMPORT_CODE`.

- Importar duas linhas com o mesmo `code` devolve `409`.
- Criar conta ja existente na mesma empresa devolve `409`.
- Criar conta como `OPERACIONAL` ou `AUDITOR` devolve `403`.

- Criar conta manualmente e confirmar que aparece em `GET /api/accounting/accounts`.
- Importar duas linhas normalizadas e confirmar total `imported`.
- Trocar de empresa e confirmar que o plano de contas nao aparece noutra empresa.

#

5. Explicacao do codigo.

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

- Falta fonte documental oficial para o template SNC inicial. Ate existir, este BK nao deve incluir uma lista fixa de contas "oficiais".
- Falta decidir parser de CSV/Excel para RNF23. O codigo acima implementa a importacao de linhas ja normalizadas; a leitura de ficheiro deve parar ate haver parser/contrato de upload aprovado.

5. Explicacao do codigo.

O handoff protege continuidade. Num projeto PAP com varios alunos, a qualidade nao esta so no codigo: esta tambem em deixar claro o que ficou decidido, o que ainda falta decidir e que contratos o proximo BK pode reutilizar.

6. Validacao do passo.

Confirma que o final do BK contem apenas criterios de aceite, validacao final, evidence, handoff e changelog.

7. Cenario negativo/erro esperado.

Se o handoff diz para usar algo que nao foi criado neste BK ou num BK anterior, ha contrato partido e deve ser corrigido antes de avancar.

## Criterios de aceite

- O BK-MF0-07 cumpre os criterios mensuraveis definidos acima.
- O contrato canonico do RF07 continua alinhado com backlog, matriz e MF-VIEWS.

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

Os periodos fiscais devem bloquear criacao de lancamentos contabilisticos futuros. O `Account` criado aqui sera referenciado por lancamentos em MF2, sempre filtrado por `companyId`.

## Changelog

- `2026-05-24`: guia refinado para estrutura step-by-step executavel, com continuidade MF0, mockup, negativos, criterios e evidence.
- `2026-04-19`: metadados canonicos preservados da vaga de normalizacao.
