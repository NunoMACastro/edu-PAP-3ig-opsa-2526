# BK-MF8-04 - Subscrição por empresa ativa

## Header

- `doc_id`: `GUIA-BK-MF8-04`
- `bk_id`: `BK-MF8-04`
- `macro`: `MF8`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-03`
- `rf_rnf`: `RF50`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-05`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-04-subscricao-por-empresa-ativa.md`
- `last_updated`: `2026-07-01`

#### Objetivo

Neste BK vais implementar a consulta backend da subscrição simulada da empresa ativa.

O resultado final é o endpoint `GET /api/subscriptions/current`, que devolve o estado atual da subscrição da empresa resolvida pelo backend em `req.companyId`. A resposta também inclui os dados públicos do plano simulado criado no `BK-MF8-03`.

Este BK não ativa, renova, cancela nem reativa subscrições. Essas ações pertencem aos BKs seguintes. Aqui vais criar a base segura e persistente que esses BKs vão reutilizar.

#### Importância

O OPSA é uma aplicação multiempresa. Isto significa que o mesmo utilizador pode trabalhar em empresas diferentes, mas cada pedido backend deve ficar preso à empresa ativa calculada pela sessão e pelas permissões.

Sem este BK, os próximos fluxos de subscrição teriam de escolher entre guardar dados sem modelo próprio, aceitar identificadores vindos do browser ou repetir lógica em vários ficheiros. Qualquer uma dessas opções aumentaria o risco de misturar dados entre empresas.

Pedagogicamente, este BK ensina três ideias importantes:

- persistência com Prisma para uma regra de negócio simples;
- separação entre catálogo de planos e subscrição de uma empresa;
- autorização backend baseada em sessão, empresa ativa e papel funcional.

#### Scope-in

- Criar o modelo Prisma `CompanySubscription`.
- Relacionar `CompanySubscription` com `Company` através de `companyId`.
- Criar o service `getCurrentSubscription`.
- Enriquecer a resposta com `getSimulatedSubscriptionPlan(code)` vindo do `BK-MF8-03`.
- Criar a rota `GET /api/subscriptions/current`.
- Proteger a rota com `requireAuth(prisma)`, `requireCompanyContext(prisma)` e `requireRole("ADMIN", "GESTOR")`.
- Criar testes de contrato HTTP para sucesso, ausência de subscrição e bloqueios de segurança.
- Registar evidence de validação do BK.

#### Scope-out

- Ativar subscrição.
- Renovar, cancelar ou reativar subscrição.
- Criar checkout, gateway de pagamento ou cobrança real.
- Emitir faturas, recibos ou documentos fiscais.
- Criar UI no frontend.
- Alterar o catálogo de planos do `BK-MF8-03`.
- Criar múltiplas subscrições atuais para a mesma empresa.

#### Estado antes e depois

Antes deste BK:

- o `BK-MF8-03` já define os planos simulados `monthly`, `quarterly` e `yearly`;
- o backend já tem padrões de autenticação, empresa ativa e roles;
- ainda não existe uma entidade persistente para a subscrição simulada da empresa;
- o frontend ainda não tem endpoint para consultar a subscrição atual.

Depois deste BK:

- cada empresa pode ter uma única subscrição simulada atual;
- a subscrição guarda `companyId`, `planCode`, `status`, `startsAt`, `endsAt` e `simulated`;
- `GET /api/subscriptions/current` devolve `state: "none"` quando não existe subscrição;
- `GET /api/subscriptions/current` devolve dados da subscrição e do plano quando existe subscrição;
- os testes provam que a rota usa a empresa ativa do backend e bloqueia pedidos sem contexto autorizado.

#### Pre-requisitos

- Ler `RF50` em `docs/RF.md`.
- Rever a linha `BK-MF8-04` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha `BK-MF8-04` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Concluir o `BK-MF8-03`.
- Confirmar que `apps/api/src/modules/subscriptions/subscriptionPlans.js` exporta:
  - `listSimulatedSubscriptionPlans`
  - `getSimulatedSubscriptionPlan`
  - `SimulatedSubscriptionPlanError`
- Confirmar que os códigos oficiais dos planos são `monthly`, `quarterly` e `yearly`.
- Confirmar que existem os middlewares:
  - `apps/api/src/modules/auth/authMiddleware.js`
  - `apps/api/src/modules/companies/companyContext.js`
  - `apps/api/src/modules/permissions/permissionMiddleware.js`
- Negativos: mínimo `3`.

#### Glossário

- **Empresa ativa:** empresa selecionada na sessão autenticada e resolvida no backend.
- **`req.companyId`:** identificador da empresa ativa já validada pelo middleware multiempresa.
- **Subscrição simulada:** estado interno que representa uma subscrição académica sem pagamento real.
- **Plano simulado:** plano público do catálogo criado no `BK-MF8-03`.
- **`planCode`:** código técnico do plano, por exemplo `monthly`.
- **`state`:** estado simplificado devolvido pela API ao frontend.
- **Teste de contrato HTTP:** teste que chama a rota pública e confirma status, payload e erros esperados.
- **Guard:** middleware que bloqueia pedidos sem autenticação, sem empresa ativa ou sem papel autorizado.

#### Conceitos teóricos essenciais

**Empresa ativa no backend.** A empresa ativa vem da sessão e das memberships do utilizador. O frontend não escolhe a empresa enviando um identificador no body ou na query string desta rota. Isto evita que um utilizador consulte dados de outra empresa por manipulação do pedido.

**Persistência por `companyId`.** O modelo de subscrição guarda `companyId`, porque a subscrição pertence a uma empresa. A sessão pode mudar de empresa ativa, mas os dados persistentes continuam ligados à empresa dona do registo.

**Uma subscrição atual por empresa.** Este BK usa `companyId @unique` para garantir uma única linha atual por empresa. Os BKs seguintes podem atualizar essa linha ao ativar, renovar, cancelar ou reativar a subscrição.

**Catálogo e subscrição são conceitos diferentes.** O catálogo do `BK-MF8-03` define o que existe para venda simulada: `monthly`, `quarterly` e `yearly`. A subscrição deste BK define o que uma empresa tem neste momento.

**Estado sem subscrição.** Uma empresa pode ainda não ter subscrição. Isso não é erro técnico. A API deve devolver `200 OK` com `state: "none"` e `subscription: null`.

**Autenticação, autorização e contexto.** A rota precisa de três camadas: sessão válida, empresa ativa e role `ADMIN` ou `GESTOR`. Esconder botões no frontend não chega, porque a API continua acessível por pedidos diretos.

**Erro de drift de plano.** Se a base de dados tiver uma subscrição com `planCode` que já não existe no catálogo, o backend deve devolver erro controlado. Isso protege a equipa contra alterações futuras ao catálogo sem migração de dados.

**Teste de contrato HTTP.** Um teste de service prova a regra interna. Um teste de contrato HTTP prova que a rota pública, o status e o JSON estão alinhados com o que o frontend vai consumir.

#### Arquitetura do BK

Fluxo principal:

1. O frontend chama `GET /api/subscriptions/current`.
2. `requireAuth(prisma)` valida a sessão e injeta `req.user`.
3. `requireCompanyContext(prisma)` resolve a empresa ativa e injeta `req.companyId`.
4. `requireRole("ADMIN", "GESTOR")` bloqueia roles sem acesso.
5. A rota chama `getCurrentSubscription(prisma, { companyId: req.companyId })`.
6. O service procura `CompanySubscription` por `companyId`.
7. Se existir subscrição, o service valida `planCode` contra o catálogo do `BK-MF8-03`.
8. A API devolve um JSON estável para o frontend.

Decisões:

- CANÓNICO: `BK-MF8-04` pertence a `RF50`.
- CANÓNICO: `BK-MF8-04` depende de `BK-MF8-03`.
- CANÓNICO: `BK-MF8-05` é o próximo BK.
- DERIVADO: o modelo chama-se `CompanySubscription` para representar uma subscrição por empresa.
- DERIVADO: a rota fica em `/api/subscriptions/current`, dentro do módulo criado no `BK-MF8-03`.
- DERIVADO: `status` usa valores `ACTIVE`, `CANCELLED` e `EXPIRED` no Prisma, e a API devolve `state` em minúsculas para leitura simples no frontend.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/prisma/schema.prisma`
- CRIAR: `apps/api/src/modules/subscriptions/subscriptionService.js`
- EDITAR: `apps/api/src/modules/subscriptions/subscriptionRoutes.js`
- REVER: `apps/api/src/server.js`
- CRIAR: `apps/api/tests/contracts/mf8-current-subscription.contract.test.js`
- CRIAR: `docs/evidence/MF8/BK-MF8-04.md`
- REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`
- REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-05-ativacao-simulada-de-subscricao.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar o contrato canónico

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK implementa apenas a leitura da subscrição simulada da empresa ativa.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`
    - LOCALIZAÇÃO: linhas de `RF50`, `BK-MF8-04` e contrato de planos do `BK-MF8-03`.

3. Instruções do que fazer.

Confirma que `BK-MF8-04` continua associado a `RF50`, owner `Oleksii`, apoio `Andre`, prioridade `P0`, dependência `BK-MF8-03` e próximo BK `BK-MF8-05`.

Confirma também que o catálogo anterior define apenas `monthly`, `quarterly` e `yearly`. Não cries outros códigos neste BK.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental porque fixa o escopo antes da persistência.

5. Explicação do código.

Não há código porque a decisão principal é de contrato. Este BK consome o catálogo do `BK-MF8-03` e prepara o fluxo de ativação do `BK-MF8-05`. Se o aluno inventar outro plano, a subscrição deixa de encaixar com os testes e com a UI dos BKs seguintes.

6. Validação do passo.

Consegues apontar:

- a linha de `RF50`;
- a linha de `BK-MF8-04` na matriz;
- os três códigos oficiais do `BK-MF8-03`.

7. Cenário negativo/erro esperado.

Erro esperado: tentar usar `enterprise` ou outro código fora de `monthly`, `quarterly` e `yearly`. O BK deve rejeitar essa decisão porque contradiz o catálogo anterior.

### Passo 2 - Criar o modelo Prisma da subscrição

1. Objetivo funcional do passo no contexto da app.

Guardar a subscrição simulada de cada empresa com uma fronteira multiempresa clara.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/prisma/schema.prisma`
    - LOCALIZAÇÃO: modelo `Company` existente e zona de modelos de domínio.

3. Instruções do que fazer.

Dentro do modelo `Company`, adiciona a relação seguinte junto das outras relações:

```prisma
subscriptions CompanySubscription[]
```

Depois adiciona o enum e o modelo `CompanySubscription`. Mantém `companyId` como chave única para impedir duas subscrições atuais para a mesma empresa.

4. Código completo, correto e integrado com a app final.

```prisma
// apps/api/prisma/schema.prisma

enum CompanySubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
}

model CompanySubscription {
  id String @id @default(uuid())

  // A subscrição pertence à empresa persistida, não a um valor enviado pelo browser.
  companyId String @unique

  // O código do plano vem do catálogo canónico criado no BK-MF8-03.
  planCode String

  status CompanySubscriptionStatus @default(ACTIVE)
  startsAt DateTime?
  endsAt DateTime?
  simulated Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  @@index([status])
  @@index([planCode])
}
```

5. Explicação do código.

O enum limita os estados permitidos. Isto evita valores soltos como `"ok"` ou `"paid"` que não pertencem ao domínio desta simulação.

O campo `companyId` usa `@unique` porque este BK consulta sempre a subscrição atual da empresa ativa. Se existissem duas linhas atuais para a mesma empresa, o backend teria de adivinhar qual devolver.

O campo `planCode` guarda a ligação ao catálogo do `BK-MF8-03`. O modelo não copia preço, nome ou ciclo do plano, porque esses dados continuam a pertencer ao catálogo.

O campo `simulated` deixa explícito que esta subscrição não representa pagamento real. Isso protege o domínio OPSA contra confusão com cobrança, faturação ou documentos fiscais.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run prisma:validate
```

Resultado esperado:

- o schema Prisma é válido;
- o Prisma Client vai expor `prisma.companySubscription`;
- não existe erro de relação entre `Company` e `CompanySubscription`.

7. Cenário negativo/erro esperado.

Erro esperado: criar o modelo sem `companyId @unique`. Nesse caso, a mesma empresa poderia ficar com várias subscrições atuais e o endpoint `GET /api/subscriptions/current` deixaria de ter resposta determinística.

### Passo 3 - Criar o service da subscrição atual

1. Objetivo funcional do passo no contexto da app.

Criar a regra de leitura da subscrição atual sem misturar HTTP, Prisma e catálogo dentro da rota.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/subscriptions/subscriptionService.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o service com funções pequenas e exportadas. O service deve:

- exigir `companyId` vindo do contexto backend;
- consultar `prisma.companySubscription.findUnique`;
- devolver `state: "none"` quando não existe subscrição;
- validar `planCode` contra `getSimulatedSubscriptionPlan`;
- converter datas para ISO string;
- devolver erro controlado se a subscrição guardar um plano que já não existe.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/subscriptions/subscriptionService.js

import { httpError } from "../../lib/httpErrors.js";
import {
  getSimulatedSubscriptionPlan,
  SimulatedSubscriptionPlanError,
} from "./subscriptionPlans.js";

export const SUBSCRIPTION_STATE = Object.freeze({
  NONE: "none",
  ACTIVE: "active",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
});

/**
 * Garante que existe empresa ativa antes de consultar dados persistentes.
 *
 * @param {string | null | undefined} companyId - Empresa ativa resolvida pela API.
 * @returns {string} Empresa ativa validada.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando não existe empresa ativa.
 */
export function requireActiveCompanyId(companyId) {
  if (typeof companyId !== "string" || companyId.trim().length === 0) {
    throw httpError(
      403,
      "COMPANY_CONTEXT_REQUIRED",
      "É necessário selecionar uma empresa ativa para consultar a subscrição.",
    );
  }

  return companyId;
}

/**
 * Converte datas opcionais para o formato JSON estável da API.
 *
 * @param {Date | string | null | undefined} value - Data vinda do Prisma.
 * @returns {string | null} Data em ISO string ou null.
 */
function toOptionalIsoString(value) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/**
 * Resolve o plano guardado numa subscrição.
 *
 * @param {string} planCode - Código do plano guardado na subscrição.
 * @returns {object} Plano simulado público.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o plano guardado já não existe.
 */
function getPlanForStoredSubscription(planCode) {
  try {
    return getSimulatedSubscriptionPlan(planCode);
  } catch (error) {
    if (error instanceof SimulatedSubscriptionPlanError) {
      throw httpError(
        409,
        "SUBSCRIPTION_PLAN_DRIFT",
        "A subscrição guardada referencia um plano que já não existe no catálogo simulado.",
      );
    }

    throw error;
  }
}

/**
 * Normaliza o registo Prisma para o payload público da rota.
 *
 * @param {object | null} subscription - Registo `CompanySubscription` devolvido pelo Prisma.
 * @returns {object} Payload público de `GET /api/subscriptions/current`.
 */
export function formatCurrentSubscription(subscription) {
  if (!subscription) {
    return {
      state: SUBSCRIPTION_STATE.NONE,
      subscription: null,
    };
  }

  const plan = getPlanForStoredSubscription(subscription.planCode);

  return {
    state: String(subscription.status).toLowerCase(),
    subscription: {
      id: subscription.id,
      companyId: subscription.companyId,
      planCode: subscription.planCode,
      plan,
      status: subscription.status,
      startsAt: toOptionalIsoString(subscription.startsAt),
      endsAt: toOptionalIsoString(subscription.endsAt),
      simulated: subscription.simulated === true,
      createdAt: toOptionalIsoString(subscription.createdAt),
      updatedAt: toOptionalIsoString(subscription.updatedAt),
    },
  };
}

/**
 * Consulta a subscrição atual da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string }} context - Contexto multiempresa calculado pela API.
 * @returns {Promise<object>} Payload público da subscrição atual.
 */
export async function getCurrentSubscription(prisma, context) {
  const companyId = requireActiveCompanyId(context.companyId);

  // A query usa a empresa resolvida pelo backend para evitar leitura cruzada entre empresas.
  const subscription = await prisma.companySubscription.findUnique({
    where: { companyId },
  });

  return formatCurrentSubscription(subscription);
}

/**
 * Confirma que um registo reutilizado pertence à empresa ativa.
 *
 * @param {object | null} subscription - Subscrição persistida.
 * @param {string} companyId - Empresa ativa resolvida pela API.
 * @returns {object | null} A subscrição original quando pertence à empresa ativa.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando existe tentativa de cruzar empresas.
 */
export function assertSubscriptionBelongsToActiveCompany(subscription, companyId) {
  const expectedCompanyId = requireActiveCompanyId(companyId);

  if (subscription && subscription.companyId !== expectedCompanyId) {
    throw httpError(
      403,
      "SUBSCRIPTION_COMPANY_FORBIDDEN",
      "A subscrição consultada não pertence à empresa ativa.",
    );
  }

  return subscription;
}
```

5. Explicação do código.

`requireActiveCompanyId` cria a barreira de segurança principal do service. Sem empresa ativa, o service não consulta a base de dados.

`getCurrentSubscription` consulta por `companyId`, que é o campo persistente correto. A rota não passa valores vindos do body ou da query string.

`formatCurrentSubscription` separa dois casos: empresa sem subscrição e empresa com subscrição. Isto evita que o frontend trate a ausência de subscrição como erro.

`getPlanForStoredSubscription` protege contra drift entre base de dados e catálogo. Se alguém remover `monthly`, `quarterly` ou `yearly` no futuro, a API devolve erro controlado em vez de resposta incoerente.

`assertSubscriptionBelongsToActiveCompany` prepara os BKs seguintes. Ativação, renovação e cancelamento vão reutilizar este padrão antes de alterar uma subscrição.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run syntax:check
```

Resultado esperado:

- o ficheiro não tem erro de sintaxe;
- os imports apontam para módulos existentes;
- `getCurrentSubscription` fica disponível para a rota.

7. Cenário negativo/erro esperado.

Erro esperado: chamar `getCurrentSubscription(prisma, { companyId: "" })`. A função deve lançar erro `403` com código `COMPANY_CONTEXT_REQUIRED`.

### Passo 4 - Expor GET /api/subscriptions/current

1. Objetivo funcional do passo no contexto da app.

Criar a rota HTTP que o frontend pode usar para saber a subscrição atual da empresa ativa.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/subscriptions/subscriptionRoutes.js`
    - LOCALIZAÇÃO: ficheiro completo criado no `BK-MF8-03`.

3. Instruções do que fazer.

Mantém as rotas de planos criadas no `BK-MF8-03` e acrescenta `GET /current`.

O router deve usar guards reais por defeito. O parâmetro `guards` existe apenas para permitir testes HTTP focados sem preparar uma base de dados completa de sessões e memberships.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/subscriptions/subscriptionRoutes.js

import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import {
  getSimulatedSubscriptionPlan,
  listSimulatedSubscriptionPlans,
  SimulatedSubscriptionPlanError,
} from "./subscriptionPlans.js";
import { getCurrentSubscription } from "./subscriptionService.js";

function sendError(res, error) {
  const normalized = toHttpError(error);

  return res.status(normalized.status).json({
    error: normalized.code,
    message: normalized.message,
  });
}

function sendPlanError(res, error) {
  if (error instanceof SimulatedSubscriptionPlanError) {
    return res.status(404).json({
      error: "SUBSCRIPTION_PLAN_NOT_FOUND",
      message: "O plano de subscrição simulado não existe.",
    });
  }

  return sendError(res, error);
}

/**
 * Cria os guards reais usados em produção para subscrições simuladas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @returns {import("express").RequestHandler[]} Lista de middlewares de segurança.
 */
export function buildSubscriptionGuards(prisma) {
  return [
    requireAuth(prisma),
    requireCompanyContext(prisma),
    requireRole("ADMIN", "GESTOR"),
  ];
}

/**
 * Cria o router HTTP das subscrições simuladas.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, guards?: import("express").RequestHandler[] }} dependencies - Dependências da rota.
 * @returns {Router} Router Express pronto a montar em `/api/subscriptions`.
 */
export function buildSubscriptionRoutes({
  prisma,
  guards = buildSubscriptionGuards(prisma),
}) {
  const router = Router();

  router.get("/plans", guards, (req, res) => {
    return res.status(200).json({
      plans: listSimulatedSubscriptionPlans(),
    });
  });

  router.get("/plans/:code", guards, (req, res) => {
    try {
      return res.status(200).json({
        plan: getSimulatedSubscriptionPlan(req.params.code),
      });
    } catch (error) {
      return sendPlanError(res, error);
    }
  });

  router.get("/current", guards, async (req, res) => {
    try {
      // req.companyId vem do middleware multiempresa e não de input do browser.
      const currentSubscription = await getCurrentSubscription(prisma, {
        companyId: req.companyId,
      });

      return res.status(200).json(currentSubscription);
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}
```

5. Explicação do código.

`buildSubscriptionGuards` centraliza a lista de middlewares de segurança. A rota exige sessão, empresa ativa e role interna autorizada.

`buildSubscriptionRoutes` recebe `guards` de forma opcional para os testes de contrato. Em produção, o router usa sempre `requireAuth`, `requireCompanyContext` e `requireRole`.

`GET /current` chama `getCurrentSubscription` com `req.companyId`. Isto cumpre a regra multiempresa: o browser não decide que empresa consultar.

`sendError` normaliza erros para JSON estável. Isso ajuda o frontend e os testes a distinguir falta de contexto, role bloqueada, drift de plano e falhas internas.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run syntax:check
```

Resultado esperado:

- o router compila;
- `buildSubscriptionRoutes` continua a expor as rotas do `BK-MF8-03`;
- a rota nova responde no caminho `/api/subscriptions/current`.

7. Cenário negativo/erro esperado.

Erro esperado: pedido sem empresa ativa. A rota deve devolver `403` com `COMPANY_CONTEXT_REQUIRED` e não deve executar query sem `companyId`.

### Passo 5 - Confirmar montagem no servidor

1. Objetivo funcional do passo no contexto da app.

Garantir que o router de subscrições está montado uma única vez no servidor.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/server.js`
    - LOCALIZAÇÃO: zona de imports e zona de `app.use`.

3. Instruções do que fazer.

Confirma que o servidor importa `buildSubscriptionRoutes` e monta o router em `/api/subscriptions`.

Se esta montagem já foi criada no `BK-MF8-03`, não dupliques a linha.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/server.js

import { buildSubscriptionRoutes } from "./modules/subscriptions/subscriptionRoutes.js";

// Todas as rotas internas do domínio de subscrições ficam sob o mesmo prefixo.
app.use("/api/subscriptions", buildSubscriptionRoutes({ prisma }));
```

5. Explicação do código.

O router define `/current`, mas o servidor monta o prefixo `/api/subscriptions`. Por isso, o caminho público final é `GET /api/subscriptions/current`.

A montagem única evita duplicação de handlers e torna os testes mais previsíveis. Se o router fosse montado duas vezes, uma falha poderia ficar mascarada por outra resposta.

6. Validação do passo.

Executa:

```bash
cd apps/api
rg "buildSubscriptionRoutes|/api/subscriptions" src/server.js
```

Resultado esperado:

- existe um import de `buildSubscriptionRoutes`;
- existe uma montagem em `/api/subscriptions`;
- não existem duas montagens iguais.

7. Cenário negativo/erro esperado.

Erro esperado: montar o router em `/api/subscription` no singular. O frontend e os testes iriam chamar `/api/subscriptions/current` e receber `404`.

### Passo 6 - Criar testes de contrato HTTP

1. Objetivo funcional do passo no contexto da app.

Provar que a rota pública `GET /api/subscriptions/current` devolve o contrato esperado e respeita bloqueios de segurança.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/contracts/mf8-current-subscription.contract.test.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria testes com `node:test`, `assert/strict`, `express` e `node:http`.

Os testes devem cobrir:

- empresa com subscrição ativa no plano `monthly`;
- empresa sem subscrição;
- pedido bloqueado por role;
- pedido sem empresa ativa.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/tests/contracts/mf8-current-subscription.contract.test.js

import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";
import { buildSubscriptionRoutes } from "../../src/modules/subscriptions/subscriptionRoutes.js";

function createPrismaWithSubscription(subscription) {
  return {
    companySubscription: {
      async findUnique(query) {
        // O service só pode consultar a empresa ativa injetada pelo backend.
        assert.deepEqual(query, {
          where: { companyId: "company-active-1" },
        });

        return subscription;
      },
    },
  };
}

function createAllowedCompanyGuard(companyId = "company-active-1") {
  return function allowedCompanyGuard(req, res, next) {
    // Estes campos representam o resultado dos guards reais de sessão e empresa.
    req.user = { id: "user-1" };
    req.session = { id: "session-1" };
    req.companyId = companyId;
    req.role = "ADMIN";
    return next();
  };
}

function createBlockedRoleGuard() {
  return function blockedRoleGuard(req, res) {
    return res.status(403).json({
      error: "ROLE_FORBIDDEN",
      message: "Papel sem acesso a esta operação",
    });
  };
}

function createApp(prisma, guards) {
  const app = express();

  app.use(express.json());
  app.use("/api/subscriptions", buildSubscriptionRoutes({ prisma, guards }));

  return app;
}

async function createHttpClient(app) {
  const server = app.listen(0, "127.0.0.1");

  await Promise.race([
    once(server, "listening"),
    once(server, "error").then(([error]) => {
      throw error;
    }),
  ]);

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    async get(path) {
      const response = await fetch(`${baseUrl}${path}`);

      return {
        status: response.status,
        body: await response.json(),
      };
    },
    close() {
      return new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    },
  };
}

test("GET /api/subscriptions/current devolve a subscrição ativa da empresa", async () => {
  const subscription = {
    id: "subscription-1",
    companyId: "company-active-1",
    planCode: "monthly",
    status: "ACTIVE",
    startsAt: new Date("2026-01-01T00:00:00.000Z"),
    endsAt: new Date("2026-02-01T00:00:00.000Z"),
    simulated: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  };
  const app = createApp(createPrismaWithSubscription(subscription), [
    createAllowedCompanyGuard(),
  ]);
  const client = await createHttpClient(app);

  try {
    const response = await client.get("/api/subscriptions/current");

    assert.equal(response.status, 200);
    assert.equal(response.body.state, "active");
    assert.equal(response.body.subscription.planCode, "monthly");
    assert.equal(response.body.subscription.plan.code, "monthly");
    assert.equal(response.body.subscription.simulated, true);
    assert.equal(response.body.subscription.startsAt, "2026-01-01T00:00:00.000Z");
  } finally {
    await client.close();
  }
});

test("GET /api/subscriptions/current devolve state none sem subscrição", async () => {
  const app = createApp(createPrismaWithSubscription(null), [
    createAllowedCompanyGuard(),
  ]);
  const client = await createHttpClient(app);

  try {
    const response = await client.get("/api/subscriptions/current");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      state: "none",
      subscription: null,
    });
  } finally {
    await client.close();
  }
});

test("GET /api/subscriptions/current bloqueia role sem acesso", async () => {
  const app = createApp(createPrismaWithSubscription(null), [
    createBlockedRoleGuard(),
  ]);
  const client = await createHttpClient(app);

  try {
    const response = await client.get("/api/subscriptions/current");

    assert.equal(response.status, 403);
    assert.equal(response.body.error, "ROLE_FORBIDDEN");
  } finally {
    await client.close();
  }
});

test("GET /api/subscriptions/current bloqueia pedido sem empresa ativa", async () => {
  const app = createApp(createPrismaWithSubscription(null), [
    createAllowedCompanyGuard(""),
  ]);
  const client = await createHttpClient(app);

  try {
    const response = await client.get("/api/subscriptions/current");

    assert.equal(response.status, 403);
    assert.equal(response.body.error, "COMPANY_CONTEXT_REQUIRED");
  } finally {
    await client.close();
  }
});
```

5. Explicação do código.

`createPrismaWithSubscription` cria uma dependência controlada para testar a query esperada. O assert dentro de `findUnique` prova que o service consulta por `companyId`.

`createAllowedCompanyGuard` representa o resultado dos guards reais quando sessão, empresa ativa e role são válidas. Isto permite testar a rota HTTP sem preparar toda a autenticação.

`createBlockedRoleGuard` prova que a cadeia de guards pode bloquear antes do service. Esse negativo protege a regra de autorização backend.

`createHttpClient` abre uma porta local temporária e usa `fetch` para chamar o endpoint público. Assim o teste valida status HTTP e JSON, não apenas uma função interna.

O primeiro teste usa `monthly`, que é um código canónico do `BK-MF8-03`. Isto corrige o risco de usar um plano que não existe no catálogo.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --test tests/contracts/mf8-current-subscription.contract.test.js
npm run test:contracts
```

Resultado esperado:

- os quatro testes deste BK passam;
- a suite contratual do backend continua verde;
- não existe plano fora de `monthly`, `quarterly` e `yearly`.

7. Cenário negativo/erro esperado.

Erro esperado: trocar `planCode: "monthly"` por um código inexistente. O teste deve falhar com erro `409` ou erro lançado por `getSimulatedSubscriptionPlan`, porque o catálogo não reconhece esse plano.

### Passo 7 - Registar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Deixar prova de validação e preparar o próximo BK sem alargar o escopo deste BK.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/BK-MF8-04.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-05-ativacao-simulada-de-subscricao.md`
    - LOCALIZAÇÃO: ficheiro de evidence completo e secção de handoff deste guia.

3. Instruções do que fazer.

Regista a evidence com comandos reais executados e resultado observado. Depois confirma que o handoff para `BK-MF8-05` fala de `CompanySubscription`, `companyId`, `planCode`, `billingCycle` e `intervalCount`.

Não implementes ativação neste BK.

4. Código completo, correto e integrado com a app final.

````md
# Evidence - BK-MF8-04

Data: 2026-07-01

## Alterações verificadas

- Modelo `CompanySubscription` ligado a `Company`.
- Service `getCurrentSubscription`.
- Rota `GET /api/subscriptions/current`.
- Testes HTTP para sucesso, ausência de subscrição e bloqueios de segurança.

## Comandos executados

```bash
cd apps/api
npm run prisma:validate
npm run syntax:check
node --test tests/contracts/mf8-current-subscription.contract.test.js
npm run test:contracts
```

## Resultado observado

- `npm run prisma:validate`: registar PASS ou erro completo.
- `npm run syntax:check`: registar PASS ou erro completo.
- `node --test tests/contracts/mf8-current-subscription.contract.test.js`: registar PASS ou erro completo.
- `npm run test:contracts`: registar PASS ou erro completo.

## Limites confirmados

- Não houve pagamento real.
- Não houve checkout.
- Não houve faturação.
- Ativação, renovação, cancelamento e reativação ficam para os BKs seguintes.
````

5. Explicação do código.

O ficheiro de evidence não substitui os testes. Ele regista o que foi executado e permite defender a implementação em revisão ou apresentação.

A secção de limites evita uma confusão importante: esta subscrição é simulada. O BK não cria cobrança nem documento fiscal.

O handoff protege o próximo colega. O `BK-MF8-05` deve reutilizar o modelo e o catálogo, não criar outro contrato de subscrição.

6. Validação do passo.

Executa:

```bash
test -f docs/evidence/MF8/BK-MF8-04.md
rg "CompanySubscription|companyId|planCode|billingCycle|intervalCount" docs/planificacao/guias-bk/MF8/BK-MF8-04-subscricao-por-empresa-ativa.md
```

Resultado esperado:

- o ficheiro de evidence existe;
- o handoff contém os nomes que o próximo BK deve reutilizar;
- os comandos na evidence têm resultado real, não inventado.

7. Cenário negativo/erro esperado.

Erro esperado: marcar um comando como `PASS` sem o executar. Isso deve ser rejeitado, porque evidence inventada não prova a qualidade do BK.

#### Critérios de aceite

- O header mantém `BK-MF8-04`, `RF50`, owner `Oleksii`, apoio `Andre`, prioridade `P0`, dependência `BK-MF8-03` e próximo BK `BK-MF8-05`.
- O guia usa a estrutura obrigatória com secções `####`.
- O guia não usa blocos genéricos para substituir a estrutura principal.
- `CompanySubscription` existe no schema Prisma.
- `CompanySubscription.companyId` é único.
- O modelo persistente usa `companyId`.
- O service `getCurrentSubscription` existe.
- O service consulta `prisma.companySubscription.findUnique({ where: { companyId } })`.
- O service valida `planCode` contra o catálogo do `BK-MF8-03`.
- A rota `GET /api/subscriptions/current` existe.
- A rota usa autenticação, empresa ativa e role `ADMIN` ou `GESTOR`.
- A rota devolve `200 OK` com `state: "none"` quando não há subscrição.
- A rota devolve plano `monthly`, `quarterly` ou `yearly` quando há subscrição.
- Os testes chamam a rota HTTP pública.
- Os testes cobrem sucesso, ausência de subscrição, role bloqueada e empresa ativa em falta.
- Não existem códigos de plano fora de `monthly`, `quarterly` e `yearly` nos exemplos.
- O handoff prepara `BK-MF8-05` para reutilizar `CompanySubscription`, `companyId`, `planCode`, `billingCycle` e `intervalCount`.

#### Validação final

Executa a partir da raiz do projeto:

```bash
bash scripts/validate-planificacao.sh
```

Executa a partir da API:

```bash
cd apps/api
npm run prisma:validate
npm run syntax:check
node --test tests/contracts/mf8-current-subscription.contract.test.js
npm run test:contracts
```

Negativos: mínimo `3`.

Resultados esperados:

- planificação sem falhas bloqueantes;
- schema Prisma válido;
- sintaxe JavaScript válida;
- contrato HTTP do BK a passar;
- suite contratual sem regressões;
- ausência de códigos de plano fora de `monthly`, `quarterly` e `yearly`.

#### Evidence para PR/defesa

Inclui em `docs/evidence/MF8/BK-MF8-04.md`:

- data;
- ficheiros alterados;
- resumo das alterações;
- comandos executados;
- resultado observado;
- notas de risco;
- limites confirmados: sem pagamento real, sem checkout, sem faturação.

Não marques validações que não foram executadas. Se um comando falhar por ambiente, regista o erro completo e o impacto.

#### Handoff

- Próximo BK recomendado: `BK-MF8-05`

O próximo BK deve reutilizar:

- `CompanySubscription`;
- `companyId`;
- `planCode`;
- `status`;
- `startsAt`;
- `endsAt`;
- `getCurrentSubscription`;
- `assertSubscriptionBelongsToActiveCompany`;
- o catálogo `monthly`, `quarterly` e `yearly`;
- os campos `billingCycle` e `intervalCount` vindos do catálogo.

O `BK-MF8-05` deve ativar ou atualizar a subscrição da empresa ativa usando o mesmo modelo. Não deve criar outro modelo, outro catálogo nem outra regra de ownership.

#### Changelog

- 2026-07-01 - Corrigido para a estrutura obrigatória `####`, removidos blocos genéricos, corrigido o plano de teste para `monthly`, acrescentado contrato HTTP real e reforçado o handoff para `BK-MF8-05`.
- 2026-07-01 - Corrigido para incluir modelo Prisma, service, rota `GET /api/subscriptions/current`, testes negativos e handoff coerente.
- 2025-12-10 - Versão inicial do BK.
