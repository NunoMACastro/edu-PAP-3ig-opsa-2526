# BK-MF0-08 - Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho.

## Header

- `doc_id`: `GUIA-BK-MF0-08`
- `bk_id`: `BK-MF0-08`
- `macro`: `MF0`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-07`
- `rf_rnf`: `RF08`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-09`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-08-abrir-e-fechar-periodos-fiscais-bloqueando-lancamentos-apos-fecho.md`
- `last_updated`: `2026-07-10`

#### BK-MF0-08 - Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho.

##### O que vamos fazer neste BK

Neste BK vamos transformar o requisito RF08 num guia de execução para construir a parte da app relacionada com contabilidade. O foco não é produzir documentação genérica: é deixar claro que modelos, endpoints, validações, UI e evidência devem existir quando a equipa implementar o BK.

A implementação pedagógica usa os caminhos públicos `apps/api` e `apps/web` e segue os contratos atuais de `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` e `docs/planificacao/CONTRATO-INTERFACES-IMPLEMENTACAO.md`. O estado `TODO` descreve apenas o progresso dos alunos; não significa ausência de uma implementação privada de referência.

Como a fase alvo é MF0, não existem BKs de fases anteriores a reutilizar. A continuidade nasce aqui: os outputs deste BK devem ser contratos estáveis para BK-MF0-09 e para os BKs de vendas, compras, inventário, contabilidade e segurança das fases seguintes.

##### Porque é que isto é importante

- Funcionalmente, cobre RF08 e desbloqueia o fluxo seguinte da MF0.
- Tecnicamente, cria contratos de FiscalPeriod e API que outros BKs podem reutilizar.
- Pedagogicamente, mostra aos alunos a ligação entre requisito, modelo, endpoint, UI, teste e evidence.
- Em segurança/robustez, obriga a validar dados no backend e a tratar erros previsíveis.
- Para continuidade, prepara explicitamente o handoff para BK-MF0-09.

##### O que entra (scope)

- Criar modelo de período fiscal com datas e estado.
- Permitir abrir período sem sobreposições.
- Permitir fechar período com registo de quem fechou e quando.
- Criar helper assertOpenFiscalPeriod(date, companyId) para BKs futuros.
- Coordenar fecho e lançamento com lock transacional e materializar `RetentionHold`.
- Ligar UI de configurações a estados Aberto/Fechado.

##### O que não entra (scope-out)

- Lançamentos contabilísticos manuais, porque pertencem ao BK-MF2-06.
- Regras legais completas de reabertura, se não estiverem documentadas.
- Fechos anuais avançados ou apuramento automático.
- Reabertura destrutiva: correções históricas exigem reversão auditada.

##### Como saber que isto ficou bem

- O caso principal de Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho funciona através da UI ou de chamadas API documentadas.
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
- Dependências (BK IDs): `BK-MF0-07` (CANONICO)
- Pré-condições: Depende de BK-MF0-07. O scaffold pedagógico pode ainda estar incompleto; usar `apps/api` e `apps/web` e respeitar os contratos centrais atuais. (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL.md` MF0; `PLANO-SPRINTS.md` S01-S02. (CANONICO)
- Flow ID: `FLOW-FISCAL-PERIODS` (DERIVADO)
- Fonte de verdade: `docs/RF.md` -> `RF08` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descrição: Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho. (CANONICO)
- Stack decidida: `DERIVADO` e centralizada em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; este BK ensina o mesmo contrato seguro nos caminhos públicos dos alunos.
- Mockup usado: `mockup/` existe e foi usado como referência de fluxo, hierarquia e nomes visíveis; não é contrato pixel-perfect.

#### O que vamos fazer neste BK (DERIVADO):

- Estado esperado antes do BK: BK-MF0-07 deve garantir base contabilística mínima; ainda não há bloqueio por período.
- Estado esperado depois do BK: A app consegue marcar períodos como abertos/fechados e expor um guard para impedir lançamentos em período fechado.
- Ficheiros a criar/editar/rever: schema Prisma, módulo backend `contabilidade`, cliente API frontend e componentes/páginas referenciados em `mockup/src/app/components/modules/Configuracoes.tsx, card Períodos Fiscais`.
- Dependências de BK anteriores e uso: Depende de BK-MF0-07.
- Impacto na arquitetura: reforça separação entre routes, controllers, services, validators e UI.
- Impacto frontend: liga o fluxo visual do mockup a API real com estados loading/error/empty/success quando aplicável.
- Impacto backend/dados: cria ou prepara `FiscalPeriod`, `RetentionHold` e endpoints `GET /api/fiscal-periods`, `POST /api/fiscal-periods` e `POST /api/fiscal-periods/:id/close`.
- Impacto segurança: valida inputs no backend, aplica sessão/permissão quando aplicável e evita exposição de dados sensíveis.
- Impacto testes: exige smoke e 3 negativos concretos.
- Handoff: BK-MF0-09 deve reutilizar os contratos aqui criados.

#### Pré-leitura mínima (10-15 min) (DERIVADO):

- `README.md` secções 1, 4, 5 e 7.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` para stack assumida e regras de adaptação de caminhos.
- `docs/RF.md` linha do requisito `RF08`.
- `docs/RNF.md` secções RNF05, RNF06, RNF12-RNF17, RNF25-RNF30 quando aplicável.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` linha deste BK.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` linha deste BK.
- `docs/planificacao/backlogs/MF-VIEWS.md` -> MF0.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` -> S01-S02.
- Mockup: `mockup/src/app/components/modules/Configuracoes.tsx, card Períodos Fiscais`.
- BK anterior obrigatório: `BK-MF0-07`, sobretudo os contratos de sessão/role/empresa.

#### Glossário (rápido) (DERIVADO):

- **Período fiscal:** Intervalo em que documentos/lançamentos podem ser registados.
- **Fecho:** Estado que impede novas alterações contabilísticas nesse intervalo.
- **Reabertura:** Ação controlada para voltar a permitir alterações.
- **Sobreposição:** Erro em que dois períodos cobrem a mesma data.
- **Guard contabilístico:** Função reutilizável que bloqueia escrita quando a data está fechada.

#### Conceitos teóricos essenciais (DERIVADO):

- Bloquear períodos fechados protege a integridade contabilística. Sem isto, um utilizador podia alterar meses já fechados e invalidar relatórios.
- O guard deve ser chamado por services de documentos e lançamentos, não apenas pela UI.
- Estados devem ser simples no MVP: OPEN e CLOSED. Estados mais complexos exigiriam requisitos novos.
- Fechar período e operação sensível: mesmo antes da auditoria completa, deve guardar closedBy e closedAt.
- **Erros comuns a evitar:** implementar só no frontend, confiar em dados enviados pelo browser, esquecer `companyId` nos dados por empresa, devolver mensagens técnicas cruas ao utilizador ou criar campos que não aparecem nos RF/RNF.
- **Negativos de segurança/robustez:** todos os casos inválidos devem falhar de forma controlada, sem stack traces, sem dados sensíveis e sem escrita parcial na base de dados.

##### Contrato de paridade obrigatório (2026-07-10)

- Datas civis passam pelo parser estrito partilhado `parseStrictDateOnly`: aceitam apenas `YYYY-MM-DD` existente no calendário. `2026-02-30` e `2026-04-31` devolvem `400 INVALID_DATE`; `new Date(string)` não é validação.
- Criar/fechar período e criar lançamentos adquirem o mesmo lock transacional por empresa/período, em ordem estável. O fecho usa claim `updateMany` com estado esperado `OPEN`; quem perde recebe `409 STALE_STATE`.
- Fecho, `AuditLog` e materialização idempotente de `RetentionHold` para entidades contabilísticas do período acontecem na mesma transação.
- Depois do fecho/hold, mutações destrutivas são recusadas. Correções históricas fazem reversão auditada; não reabrem nem apagam linhas silenciosamente.
- O teste concorrente inicia fecho e lançamento em paralelo e prova que nunca existe lançamento posterior ao fecho.

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
enum FiscalPeriodStatus {
  OPEN
  CLOSED
}

model FiscalPeriod {
  id          String             @id @default(uuid())
  companyId   String
  name        String
  startDate   DateTime
  endDate     DateTime
  status      FiscalPeriodStatus @default(OPEN)
  closedAt    DateTime?
  closedById  String?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, name])
  @@index([companyId, startDate, endDate])
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
    - apps/api/src/lib/strictDate.js (se ainda não existir; depois é partilhado por vendas, compras, tesouraria e contabilidade)
    - apps/api/src/modules/fiscal-periods/fiscalPeriodValidators.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar dentro do módulo do domínio em `apps/api/src/modules/...`; helpers partilhados ficam em `apps/api/src/lib` quando usados por vários BKs.
    - REVER:
    - docs/RNF.md: RNF05, RNF06, RNF12-RNF17, RNF21 quando existir email.

3. Instruções do que fazer.

Cria estes ficheiros antes dos services. Os services devem receber dados já normalizados e não devem repetir regex ou parse manual espalhado pelo código.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/fiscal-periods/fiscalPeriodValidators.js`.

```js
import { httpError } from "../../lib/httpErrors.js";
import { parseStrictDateOnly } from "../../lib/strictDate.js";

export function validateFiscalPeriodPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    if (typeof body.name !== "string" || body.name.trim().length < 4) {
        throw httpError(400, "INVALID_PERIOD_NAME", "Nome do período inválido");
    }

    const startDate = parseStrictDateOnly(body.startDate, { code: "INVALID_DATE", field: "startDate" });
    const endDate = parseStrictDateOnly(body.endDate, { code: "INVALID_DATE", field: "endDate" });

    if (endDate <= startDate) {
        throw httpError(
            400,
            "INVALID_PERIOD_RANGE",
            "Data final deve ser posterior a data inicial",
        );
    }

    return {
        name: body.name.trim(),
        startDate,
        endDate,
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
    - apps/api/src/modules/fiscal-periods/fiscalPeriodService.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar no módulo backend do domínio; middlewares reutilizáveis ficam junto do domínio que fornece o contexto.
    - REVER:
    - BKs anteriores que fornecem `requireAuth`, `requireCompanyContext`, permissões, User, Company ou dados mestre.

3. Instruções do que fazer.

Implementa services depois dos validadores. Quando houver dados empresariais, recebe sempre `companyId` vindo da sessão/contexto, nunca do body. Quando houver role/permissão, garante que a rota chama o guard antes do service.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/fiscal-periods/fiscalPeriodService.js`.

```js
import { httpError } from "../../lib/httpErrors.js";
import { parseStrictDateOnly } from "../../lib/strictDate.js";
import { materializeRetentionHoldsForPeriod } from "../compliance/retentionPolicy.js";

function serialize(period) {
    return {
        id: period.id,
        name: period.name,
        startDate: period.startDate.toISOString().slice(0, 10),
        endDate: period.endDate.toISOString().slice(0, 10),
        status: period.status,
        closedAt: period.closedAt,
        closedById: period.closedById,
    };
}

async function assertNoOverlap(prisma, companyId, startDate, endDate) {
    const overlapping = await prisma.fiscalPeriod.findFirst({
        where: {
            companyId,
            startDate: { lte: endDate },
            endDate: { gte: startDate },
        },
    });

    if (overlapping) {
        throw httpError(
            409,
            "FISCAL_PERIOD_OVERLAP",
            "Já existe período fiscal sobreposto",
        );
    }
}

export async function listFiscalPeriods(prisma, companyId) {
    const periods = await prisma.fiscalPeriod.findMany({
        where: { companyId },
        orderBy: { startDate: "asc" },
    });

    return periods.map(serialize);
}

export async function createFiscalPeriod(prisma, companyId, input) {
    await assertNoOverlap(prisma, companyId, input.startDate, input.endDate);

    const period = await prisma.fiscalPeriod.create({
        data: { companyId, ...input },
    });

    return serialize(period);
}

export async function closeFiscalPeriod(
    prisma,
    { companyId, periodId, actorUserId, now = new Date() },
) {
    return prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "Company" WHERE id = ${companyId} FOR UPDATE`;
        const period = await tx.fiscalPeriod.findFirst({
            where: { id: periodId, companyId },
        });
        if (!period) {
            throw httpError(404, "FISCAL_PERIOD_NOT_FOUND", "Período fiscal não encontrado");
        }

        const claim = await tx.fiscalPeriod.updateMany({
            where: { id: period.id, companyId, status: "OPEN" },
            data: { status: "CLOSED", closedAt: now, closedById: actorUserId },
        });
        if (claim.count !== 1) {
            throw httpError(409, "STALE_STATE", "O período foi alterado por outra operação");
        }

        await materializeRetentionHoldsForPeriod(tx, {
            companyId,
            fiscalPeriodId: period.id,
            actorUserId,
        });
        await tx.auditLog.create({
            data: { companyId, userId: actorUserId, action: "FISCAL_PERIOD_CLOSED", entity: "FiscalPeriod", entityId: period.id },
        });
        return serialize(await tx.fiscalPeriod.findUnique({ where: { id: period.id } }));
    });
}

export async function assertOpenFiscalPeriod(
    prisma,
    { companyId, documentDate },
) {
    const date = documentDate instanceof Date
        ? documentDate
        : parseStrictDateOnly(documentDate, { code: "INVALID_DATE", field: "documentDate" });

    const period = await prisma.fiscalPeriod.findFirst({
        where: {
            companyId,
            startDate: { lte: date },
            endDate: { gte: date },
        },
    });

    if (!period)
        throw httpError(
            400,
            "FISCAL_PERIOD_MISSING",
            "Não existe período fiscal para a data",
        );
    if (period.status === "CLOSED") {
        throw httpError(
            409,
            "FISCAL_PERIOD_CLOSED",
            "Período fiscal fechado para esta data",
        );
    }

    return period;
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
    - apps/api/src/modules/fiscal-periods/fiscalPeriodController.js
    - apps/api/src/modules/fiscal-periods/fiscalPeriodRoutes.js
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

Localização: criar `apps/api/src/modules/fiscal-periods/fiscalPeriodController.js`.

```js
import { toHttpError } from "../../lib/httpErrors.js";
import { validateFiscalPeriodPayload } from "./fiscalPeriodValidators.js";
import {
    closeFiscalPeriod,
    createFiscalPeriod,
    listFiscalPeriods,
} from "./fiscalPeriodService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildFiscalPeriodController({ prisma }) {
    return {
        async list(req, res) {
            try {
                const periods = await listFiscalPeriods(prisma, req.companyId);
                return res.status(200).json({ periods });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async create(req, res) {
            try {
                const input = validateFiscalPeriodPayload(req.body);
                const period = await createFiscalPeriod(
                    prisma,
                    req.companyId,
                    input,
                );
                return res.status(201).json({ period });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async close(req, res) {
            try {
                const period = await closeFiscalPeriod(prisma, {
                    companyId: req.companyId,
                    periodId: req.params.id,
                    actorUserId: req.user.id,
                });
                return res.status(200).json({ period });
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
```

Localização: criar `apps/api/src/modules/fiscal-periods/fiscalPeriodRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { buildFiscalPeriodController } from "./fiscalPeriodController.js";

export function buildFiscalPeriodRoutes({ prisma }) {
    const router = Router();
    const controller = buildFiscalPeriodController({ prisma });

    router.get(
        "/",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.FISCAL_PERIODS_READ),
        controller.list,
    );

    router.post(
        "/",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.FISCAL_PERIODS_MANAGE),
        controller.create,
    );

    router.post(
        "/:id/close",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.FISCAL_PERIODS_MANAGE),
        controller.close,
    );

    return router;
}
```

Localização: editar `apps/api/src/server.js`, junto das restantes rotas.

```js
import { buildFiscalPeriodRoutes } from "./modules/fiscal-periods/fiscalPeriodRoutes.js";

app.use("/api/fiscal-periods", buildFiscalPeriodRoutes({ prisma }));
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

Pedido `POST /api/fiscal-periods`:

```json
{
    "name": "2026",
    "startDate": "2026-01-01",
    "endDate": "2026-12-31"
}
```

Resposta `201`:

```json
{
    "period": {
        "id": "uuid-periodo",
        "name": "2026",
        "startDate": "2026-01-01",
        "endDate": "2026-12-31",
        "status": "OPEN",
        "closedAt": null,
        "closedById": null
    }
}
```

Erros esperados:

- `400 INVALID_DATE` ou `400 INVALID_PERIOD_RANGE`.
- `401 SESSION_REQUIRED`.
- `403 PERMISSION_FORBIDDEN`.
- `404 FISCAL_PERIOD_NOT_FOUND`.
- `409 FISCAL_PERIOD_OVERLAP`.
- `409 FISCAL_PERIOD_ALREADY_CLOSED`.
- `409 FISCAL_PERIOD_CLOSED` quando BKs futuros tentam registar documento em período fechado.

- Criar período sobreposto devolve `409`.
- Fechar período já fechado devolve `409`.
- Tentar criar documento futuro com data em período fechado deve falhar via `assertOpenFiscalPeriod`.

- Criar período fiscal aberto, listar e fechar.
- Tentar fechar novamente e confirmar `409`.
- Chamar `assertOpenFiscalPeriod` num teste unitário com período fechado e confirmar `409 FISCAL_PERIOD_CLOSED`.

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

- Não existe endpoint de reabertura neste contrato. Uma correção posterior ao fecho/hold é feita por reversão auditada, nunca por reabertura silenciosa.
- Falta BK de auditoria operacional. Enquanto não existir, o fecho deve registar `closedById` e `closedAt`; quando auditoria estiver disponível, adicionar evento de auditoria sem mudar a regra principal.

5. Explicação do código.

O handoff protege continuidade. Num projeto PAP com vários alunos, a qualidade não está só no código: está também em deixar claro o que ficou decidido, o que ainda falta decidir e que contratos o próximo BK pode reutilizar.

6. Validação do passo.

Confirma que o final do BK contém apenas critérios de aceite, validação final, evidence, handoff e changelog.

7. Cenário negativo/erro esperado.

Se o handoff diz para usar algo que não foi criado neste BK ou num BK anterior, há contrato partido e deve ser corrigido antes de avançar.

## Critérios de aceite

- O BK-MF0-08 cumpre os critérios mensuráveis definidos acima.
- O contrato canónico do RF08 continua alinhado com backlog, matriz e MF-VIEWS.

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

Clientes não dependem diretamente de período fiscal, mas faturação futura depende. A partir deste BK, qualquer documento fiscal/contabilístico deve chamar `assertOpenFiscalPeriod` antes de persistir alterações com data fiscal.

- Próximo BK recomendado: `BK-MF0-09`.

## Changelog

- `2026-07-10`: handoff sincronizado explicitamente com o próximo BK canónico do header.
- `2026-05-24`: guia refinado para estrutura step-by-step executável, com continuidade MF0, mockup, negativos, critérios e evidence.
- `2026-04-19`: metadados canónicos preservados da vaga de normalização.
