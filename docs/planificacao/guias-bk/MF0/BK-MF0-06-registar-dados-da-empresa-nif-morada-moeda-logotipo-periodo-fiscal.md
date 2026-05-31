# BK-MF0-06 - Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal).

## Header

- `doc_id`: `GUIA-BK-MF0-06`
- `bk_id`: `BK-MF0-06`
- `macro`: `MF0`
- `owner`: `Oleksii`
- `apoio`: `Sofia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF06`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-07`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-06-registar-dados-da-empresa-nif-morada-moeda-logotipo-periodo-fiscal.md`
- `last_updated`: `2026-05-24`

#### BK-MF0-06 - Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal).

##### O que vamos fazer neste BK

Neste BK vamos transformar o requisito RF06 num guia de execução para construir a parte da app relacionada com configurações. O foco não é produzir documentação genérica: é deixar claro que modelos, endpoints, validações, UI e evidência devem existir quando a equipa implementar o BK.

A app real ainda está marcada como `sem_codigo`; por isso, os caminhos técnicos propostos seguem o contrato central `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`. Esse contrato define a stack assumida, a estrutura indicativa e a regra de adaptação quando existir scaffold real, sem alterar RF, BK, owners, dependências ou critérios de aceite.

Como a fase alvo é MF0, não existem BKs de fases anteriores a reutilizar. A continuidade nasce aqui: os outputs deste BK devem ser contratos estáveis para BK-MF0-07 e para os BKs de vendas, compras, inventário, contabilidade e segurança das fases seguintes.

##### Porque é que isto é importante

- Funcionalmente, cobre RF06 e desbloqueia o fluxo seguinte da MF0.
- Tecnicamente, cria contratos de CompanyProfile e API que outros BKs podem reutilizar.
- Pedagogicamente, mostra aos alunos a ligação entre requisito, modelo, endpoint, UI, teste e evidence.
- Em segurança/robustez, obriga a validar dados no backend e a tratar erros previsíveis.
- Para continuidade, prepara explicitamente o handoff para BK-MF0-07.

##### O que entra (scope)

- Criar/editar nome, NIF, morada, código postal, cidade e moeda.
- Preparar campo de logotipo sem obrigar upload definitivo se a storage não estiver decidida.
- Guardar limites do período fiscal base.
- Validar formato mínimo de NIF e moeda.
- Ligar formulário de configurações ao backend.

##### O que não entra (scope-out)

- Fecho/abertura de períodos, porque pertence ao BK-MF0-08.
- SAF-T real, porque pertence a fases posteriores.
- Validação legal exaustiva de NIF por fonte externa, se não documentada.
- Gestão avançada de moradas/estabelecimentos.

##### Como saber que isto ficou bem

- O caso principal de Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal) funciona através da UI ou de chamadas API documentadas.
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
- Apoio: `Sofia` (CANONICO)
- Dependências (BK IDs): `-` (CANONICO)
- Pré-condições: Sem dependências anteriores declaradas. App real pode ainda não existir; nesse caso criar a estrutura técnica assumida antes dos ficheiros alvo. (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL.md` MF0; `PLANO-SPRINTS.md` S01-S02. (CANONICO)
- Flow ID: `FLOW-COMPANY-PROFILE` (DERIVADO)
- Fonte de verdade: `docs/RF.md` -> `RF06` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descrição: Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal). (CANONICO)
- Stack decidida: `DERIVADO` e centralizada em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; este BK usa essa stack apenas como assunção técnica até existir scaffold real.
- Mockup usado: `mockup/` existe e foi usado como referência de fluxo, hierarquia e nomes visíveis; não é contrato pixel-perfect.

#### O que vamos fazer neste BK (DERIVADO):

- Estado esperado antes do BK: Pode existir ou não multiempresa; se BK-MF0-03 já existir, usar companyId ativo.
- Estado esperado depois do BK: Cada empresa tem dados base guardados e validados, prontos para faturas, SAF-T, reporting e períodos fiscais.
- Ficheiros a criar/editar/rever: schema Prisma, módulo backend `configuracoes`, cliente API frontend e componentes/páginas referenciados em `mockup/src/app/components/modules/Configuracoes.tsx, card Dados da Empresa`.
- Dependências de BK anteriores e uso: Sem dependências anteriores declaradas.
- Reutilização técnica opcional (sem alterar dependências canónicas): se BK-MF0-03 estiver implementado, usar `companyId` ativo em vez de criar um contexto paralelo de empresa.
- Impacto na arquitetura: reforça separação entre routes, controllers, services, validators e UI.
- Impacto frontend: liga o fluxo visual do mockup a API real com estados loading/error/empty/success quando aplicável.
- Impacto backend/dados: cria ou prepara `CompanyProfile` e endpoints `GET /api/company/profile, PUT /api/company/profile`.
- Impacto segurança: valida inputs no backend, aplica sessão/permissão quando aplicável e evita exposição de dados sensíveis.
- Impacto testes: exige smoke e 3 negativos concretos.
- Handoff: BK-MF0-07 deve reutilizar os contratos aqui criados.

#### Pré-leitura mínima (10-15 min) (DERIVADO):

- `README.md` secções 1, 4, 5 e 7.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` para stack assumida e regras de adaptação de caminhos.
- `docs/RF.md` linha do requisito `RF06`.
- `docs/RNF.md` secções RNF05, RNF06, RNF12-RNF17, RNF25-RNF30 quando aplicável.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` linha deste BK.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` linha deste BK.
- `docs/planificacao/backlogs/MF-VIEWS.md` -> MF0.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` -> S01-S02.
- Mockup: `mockup/src/app/components/modules/Configuracoes.tsx, card Dados da Empresa`.
- BKs anteriores: não existem dependências formais anteriores para este BK.

#### Glossário (rápido) (DERIVADO):

- **NIF:** Número de Identificação Fiscal usado em documentos e entidades portuguesas.
- **Moeda base:** Moeda principal usada nos registos financeiros da empresa.
- **Período fiscal:** Intervalo contabilístico em que documentos e lançamentos são aceites.
- **Upload:** Envio de ficheiro do browser para o servidor.
- **Dados mestre:** Dados de base reutilizados por vários módulos.

#### Conceitos teóricos essenciais (DERIVADO):

- Dados da empresa são dados mestre: muitos módulos futuros dependem deles, especialmente faturação, contabilidade e SAF-T.
- Mesmo que o frontend valide NIF, o backend deve validar outra vez porque pedidos podem ser feitos diretamente por API.
- Upload de logotipo deve limitar tipo e tamanho de ficheiro. Enquanto storage não estiver decidida, pode ficar como URL/campo preparado.
- A moeda deve ter contrato simples no MVP. O domínio português sugere EUR, mas qualquer regra multi-moeda avançada fica fora de escopo.
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
model CompanyProfile {
  id                   String   @id @default(uuid())
  companyId            String   @unique
  legalName            String
  nif                  String   @unique
  addressLine1         String
  addressLine2         String?
  postalCode           String
  city                 String
  country              String   @default("PT")
  currency             String   @default("EUR")
  logoUrl              String?
  fiscalYearStartMonth Int
  fiscalYearStartDay   Int
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])
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
    - apps/api/src/modules/company-profile/nifValidator.js
    - apps/api/src/modules/company-profile/companyProfileValidators.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar dentro do módulo do domínio em `apps/api/src/modules/...`; helpers partilhados ficam em `apps/api/src/lib` quando usados por vários BKs.
    - REVER:
    - docs/RNF.md: RNF05, RNF06, RNF12-RNF17, RNF21 quando existir email.

3. Instruções do que fazer.

Cria estes ficheiros antes dos services. Os services devem receber dados já normalizados e não devem repetir regex ou parse manual espalhado pelo código.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/company-profile/nifValidator.js`.

```js
export function isValidPortugueseNif(value) {
    if (typeof value !== "string" || !/^\d{9}$/.test(value)) return false;

    const digits = value.split("").map(Number);
    const checkDigit = digits[8];
    const sum = digits
        .slice(0, 8)
        .reduce((total, digit, index) => total + digit * (9 - index), 0);

    const remainder = sum % 11;
    const expected = remainder < 2 ? 0 : 11 - remainder;

    return checkDigit === expected;
}
```

Localização: criar `apps/api/src/modules/company-profile/companyProfileValidators.js`.

```js
import { httpError } from "../../lib/httpErrors.js";
import { isValidPortugueseNif } from "./nifValidator.js";

function requiredString(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw httpError(400, "INVALID_FIELD", `${field} é obrigatório`);
    }
    return value.trim();
}

function optionalString(value) {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value !== "string")
        throw httpError(400, "INVALID_FIELD", "Campo inválido");
    return value.trim();
}

function validateFiscalDate(month, day) {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
        throw httpError(400, "INVALID_FISCAL_PERIOD", "Mês fiscal inválido");
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
        throw httpError(400, "INVALID_FISCAL_PERIOD", "Dia fiscal inválido");
    }
    return { month, day };
}

export function validateCompanyProfilePayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const nif = requiredString(body.nif, "nif");
    if (!isValidPortugueseNif(nif)) {
        throw httpError(400, "INVALID_NIF", "NIF português inválido");
    }

    if (body.currency !== "EUR") {
        throw httpError(
            400,
            "INVALID_CURRENCY",
            "A moeda base documentada para o MVP e EUR",
        );
    }

    const fiscalDate = validateFiscalDate(
        body.fiscalYearStartMonth,
        body.fiscalYearStartDay,
    );

    return {
        legalName: requiredString(body.legalName, "legalName"),
        nif,
        addressLine1: requiredString(body.addressLine1, "addressLine1"),
        addressLine2: optionalString(body.addressLine2),
        postalCode: requiredString(body.postalCode, "postalCode"),
        city: requiredString(body.city, "city"),
        country: body.country ? requiredString(body.country, "country") : "PT",
        currency: "EUR",
        logoUrl: optionalString(body.logoUrl),
        fiscalYearStartMonth: fiscalDate.month,
        fiscalYearStartDay: fiscalDate.day,
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
    - apps/api/src/modules/company-profile/companyProfileService.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar no módulo backend do domínio; middlewares reutilizáveis ficam junto do domínio que fornece o contexto.
    - REVER:
    - BKs anteriores que fornecem `requireAuth`, `requireCompanyContext`, permissões, User, Company ou dados mestre.

3. Instruções do que fazer.

Implementa services depois dos validadores. Quando houver dados empresariais, recebe sempre `companyId` vindo da sessão/contexto, nunca do body. Quando houver role/permissão, garante que a rota chama o guard antes do service.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/company-profile/companyProfileService.js`.

```js
import { httpError } from "../../lib/httpErrors.js";

export async function getCompanyProfile(prisma, companyId) {
    const profile = await prisma.companyProfile.findUnique({
        where: { companyId },
    });
    if (!profile)
        throw httpError(
            404,
            "COMPANY_PROFILE_NOT_FOUND",
            "Perfil da empresa não encontrado",
        );
    return profile;
}

export async function upsertCompanyProfile(prisma, companyId, input) {
    return prisma.companyProfile.upsert({
        where: { companyId },
        create: { companyId, ...input },
        update: input,
    });
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
    - apps/api/src/modules/company-profile/companyProfileController.js
    - apps/api/src/modules/company-profile/companyProfileRoutes.js
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

Localização: criar `apps/api/src/modules/company-profile/companyProfileController.js`.

```js
import { toHttpError } from "../../lib/httpErrors.js";
import { validateCompanyProfilePayload } from "./companyProfileValidators.js";
import {
    getCompanyProfile,
    upsertCompanyProfile,
} from "./companyProfileService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

function serialize(profile) {
    return {
        legalName: profile.legalName,
        nif: profile.nif,
        addressLine1: profile.addressLine1,
        addressLine2: profile.addressLine2,
        postalCode: profile.postalCode,
        city: profile.city,
        country: profile.country,
        currency: profile.currency,
        logoUrl: profile.logoUrl,
        fiscalYearStartMonth: profile.fiscalYearStartMonth,
        fiscalYearStartDay: profile.fiscalYearStartDay,
    };
}

export function buildCompanyProfileController({ prisma }) {
    return {
        async get(req, res) {
            try {
                const profile = await getCompanyProfile(prisma, req.companyId);
                return res.status(200).json({ profile: serialize(profile) });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async update(req, res) {
            try {
                const input = validateCompanyProfilePayload(req.body);
                const profile = await upsertCompanyProfile(
                    prisma,
                    req.companyId,
                    input,
                );
                return res.status(200).json({ profile: serialize(profile) });
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
```

Localização: criar `apps/api/src/modules/company-profile/companyProfileRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { Permission } from "../permissions/permissions.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { buildCompanyProfileController } from "./companyProfileController.js";

export function buildCompanyProfileRoutes({ prisma }) {
    const router = Router();
    const controller = buildCompanyProfileController({ prisma });

    router.get(
        "/",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.COMPANY_READ),
        controller.get,
    );

    router.put(
        "/",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.COMPANY_WRITE),
        controller.update,
    );

    return router;
}
```

Localização: editar `apps/api/src/server.js`, junto das restantes rotas.

```js
import { buildCompanyProfileRoutes } from "./modules/company-profile/companyProfileRoutes.js";

app.use("/api/company/profile", buildCompanyProfileRoutes({ prisma }));
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

Pedido `PUT /api/company/profile`:

```json
{
    "legalName": "OPSA Demo, Lda",
    "nif": "509442013",
    "addressLine1": "Rua da Contabilidade, 10",
    "addressLine2": "2.º Esq.",
    "postalCode": "1000-001",
    "city": "Lisboa",
    "country": "PT",
    "currency": "EUR",
    "logoUrl": "https://cdn.example.pt/opsa-demo/logo.png",
    "fiscalYearStartMonth": 1,
    "fiscalYearStartDay": 1
}
```

Resposta `200` devolve o mesmo objeto dentro de `{ "profile": ... }`.

Erros esperados:

- `400 INVALID_NIF`.
- `400 INVALID_CURRENCY`.
- `400 INVALID_FISCAL_PERIOD`.
- `401 SESSION_REQUIRED`.
- `403 COMPANY_CONTEXT_REQUIRED` ou `403 PERMISSION_FORBIDDEN`.
- `404 COMPANY_PROFILE_NOT_FOUND` em `GET` antes de existir perfil.
- `409` pode surgir por unicidade de `nif`; mapear erro Prisma para `409 NIF_ALREADY_EXISTS` no handler global.

- NIF com 9 dígitos mas checksum inválido devolve `400`.
- Utilizador `AUDITOR` tenta `PUT` e recebe `403`.
- Atualizar perfil de outra empresa não é possível porque a API usa `req.companyId`, não recebe `companyId` no body.

- Selecionar empresa no BK-MF0-03 e executar `PUT /api/company/profile`.
- Fazer `GET /api/company/profile` e confirmar persistência.
- Trocar para outra empresa e confirmar que o perfil devolvido e diferente ou `404`.

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

- Confirmar storage final de logotipo. Até la, `logoUrl` e apenas uma referência externa validada como string, não upload.
- Confirmar se OPSA vai suportar multi-moeda. O guia fixa `EUR` por ser o mínimo seguro para o MVP português, mas isto deve ser revisto se RF/RNF futuros documentarem multi-moeda.

5. Explicação do código.

O handoff protege continuidade. Num projeto PAP com vários alunos, a qualidade não está só no código: está também em deixar claro o que ficou decidido, o que ainda falta decidir e que contratos o próximo BK pode reutilizar.

6. Validação do passo.

Confirma que o final do BK contém apenas critérios de aceite, validação final, evidence, handoff e changelog.

7. Cenário negativo/erro esperado.

Se o handoff diz para usar algo que não foi criado neste BK ou num BK anterior, há contrato partido e deve ser corrigido antes de avançar.

## Critérios de aceite

- O BK-MF0-06 cumpre os critérios mensuráveis definidos acima.
- O contrato canónico do RF06 continua alinhado com backlog, matriz e MF-VIEWS.

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

O plano de contas SNC deve usar o mesmo `companyId` ativo e deve poder consultar NIF/moeda/período fiscal da empresa quando precisar de contexto contabilístico.

## Changelog

- `2026-05-24`: guia refinado para estrutura step-by-step executável, com continuidade MF0, mockup, negativos, critérios e evidence.
- `2026-04-19`: metadados canónicos preservados da vaga de normalização.
