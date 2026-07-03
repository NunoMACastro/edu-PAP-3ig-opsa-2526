# BK-MF8-06 - Renovação, cancelamento e reativação simuladas.

## Header

- `doc_id`: `GUIA-BK-MF8-06`
- `bk_id`: `BK-MF8-06`
- `macro`: `MF8`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-05`
- `rf_rnf`: `RF51`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-07`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-06-renovacao-cancelamento-e-reativacao-simuladas.md`
- `last_updated`: `2026-07-02`

#### Objetivo

Neste BK vais implementar o ciclo de vida da subscrição simulada da empresa ativa: renovar uma subscrição ativa, cancelar uma subscrição ativa e reativar uma subscrição cancelada ou expirada.

O resultado observável é um endpoint protegido que recebe uma ação de ciclo de vida, altera a linha única de `CompanySubscription` da empresa ativa, devolve o estado atualizado e regista auditoria funcional mínima.

#### Importância

O `BK-MF8-05` deixou a empresa com uma subscrição simulada ativa. Uma aplicação real também precisa de regras para manter esse estado consistente ao longo do tempo. Sem este BK, a UI do `BK-MF8-07` teria de inventar como renovar, cancelar ou reativar, o que quebraria a sequência da MF8.

Este BK cumpre `RF51` sem criar pagamentos reais, recibos, faturas, checkout ou cobranças automáticas. A subscrição continua a ser uma simulação pedagógica para fechar a PAP com um fluxo coerente, auditável e seguro.

#### Scope-in

- Reutilizar o modelo `CompanySubscription` criado no `BK-MF8-04`.
- Reutilizar o contrato de ativação criado no `BK-MF8-05`.
- Criar a função `runSimulatedSubscriptionAction`.
- Aceitar as ações `renew`, `cancel` e `reactivate`.
- Calcular novas datas com `billingCycle` e `intervalCount` do catálogo do `BK-MF8-03`.
- Expor `POST /api/subscriptions/current/actions`.
- Validar ação, plano, empresa ativa, utilizador autenticado e transição permitida.
- Registar auditoria `subscription.renew`, `subscription.cancel` e `subscription.reactivate`.
- Criar testes contratuais com cenário feliz e negativos principais.
- Documentar evidence para PR ou defesa.

#### Scope-out

- Criar cobrança real, checkout, cartão, recibo ou fatura.
- Criar outro modelo de subscrição.
- Criar histórico completo de versões de subscrição.
- Alterar roles, permissões ou utilizadores.
- Alterar `BK-MF8-07`; este BK apenas deixa o contrato backend que o próximo guia deve consumir.
- Criar regras legais, fiscais ou contabilísticas que não estejam documentadas.

#### Estado antes e depois

- Antes: `BK-MF8-03` entrega o catálogo com `billingCycle` e `intervalCount`; `BK-MF8-04` entrega `CompanySubscription` por `companyId`; `BK-MF8-05` entrega `activateSimulatedSubscription`, `POST /api/subscriptions/current/activate`, estado `ACTIVE` e auditoria `subscription.activate`.
- Depois: `BK-MF8-06` entrega ações de ciclo de vida para a mesma subscrição, com transições controladas, datas calculadas a partir do plano canónico, endpoint protegido, auditoria e testes contratuais.

#### Pre-requisitos

- Ler `RF51` em `docs/RF.md`.
- Rever `BK-MF8-03` para confirmar `monthly`, `quarterly`, `yearly`, `billingCycle` e `intervalCount`.
- Rever `BK-MF8-04` para confirmar `CompanySubscription`, `companyId`, `planCode`, `status`, `startsAt`, `endsAt` e `simulated`.
- Rever `BK-MF8-05` para confirmar `activateSimulatedSubscription`, `calculateSubscriptionCycleEnd`, `formatCurrentSubscription`, `recordAuditLog` e `assertSubscriptionBelongsToActiveCompany`.
- Rever a linha de `BK-MF8-06` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF8-06` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Confirmar que os caminhos do aluno usam `apps/api` e `apps/web`.

#### Glossário

- Subscrição simulada: contrato pedagógico que representa acesso a um plano sem cobrança real.
- Ciclo de vida: conjunto de estados e transições permitidas de uma subscrição.
- Renovação: prolongamento do fim do ciclo de uma subscrição ativa.
- Cancelamento: passagem de uma subscrição ativa para `CANCELLED`, mantendo histórico e datas.
- Reativação: passagem de uma subscrição `CANCELLED` ou `EXPIRED` para `ACTIVE` com novo plano canónico.
- Estado persistido: valor guardado no Prisma, como `ACTIVE`, `CANCELLED` ou `EXPIRED`.
- Estado público: valor devolvido à UI, como `active`, `cancelled` ou `expired`.
- Auditoria funcional: registo seguro da ação executada, sem guardar body completo nem dados de pagamento.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF51` define que a app deve simular renovação, cancelamento e reativação da subscrição.
- `CANONICO`: o `BK-MF8-06` pertence à MF8, sprint `S12`, prioridade `P0`, owner `Pedro`, apoio `Andre`, dependência `BK-MF8-05` e próximo BK `BK-MF8-07`.
- `CANONICO`: o catálogo de planos usa `billingCycle` e `intervalCount`; este BK não usa `intervalMonths`.
- `CANONICO`: a subscrição pertence à empresa persistida por `CompanySubscription.companyId`.
- `DERIVADO`: o endpoint `POST /api/subscriptions/current/actions` concentra as ações de ciclo de vida porque todas alteram a subscrição atual da empresa ativa.

Uma máquina de estados define que ações são válidas a partir de cada estado. Uma subscrição `ACTIVE` pode ser renovada ou cancelada. Uma subscrição `CANCELLED` ou `EXPIRED` pode ser reativada. Repetir cancelamento sobre uma subscrição já cancelada é erro de domínio, não sucesso silencioso.

O backend decide a empresa ativa através da sessão e do middleware multiempresa. O body do pedido indica apenas a intenção funcional: a ação e, quando necessário, o plano para reativação. O frontend nunca escolhe `companyId`, role ou autorização final.

A auditoria existe porque renovar, cancelar e reativar alteram um estado operacional sensível. O registo deve indicar quem fez a ação, em que empresa, sobre que entidade e com que ação, sem guardar payloads completos, cookies, dados pessoais desnecessários ou informação financeira inexistente.

#### Arquitetura do BK

- Requisito: `RF51`.
- Domínio principal: ciclo de vida da subscrição simulada.
- Modelo reutilizado: `CompanySubscription`.
- Catálogo reutilizado: `getSimulatedSubscriptionPlan`.
- Service novo: `runSimulatedSubscriptionAction`.
- Endpoint novo: `POST /api/subscriptions/current/actions`.
- Body para renovação: `{ "action": "renew" }`.
- Body para cancelamento: `{ "action": "cancel" }`.
- Body para reativação: `{ "action": "reactivate", "planCode": "monthly" }`.
- Auditoria: `subscription.renew`, `subscription.cancel`, `subscription.reactivate`.
- Testes: `apps/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js`.
- Evidence: `docs/evidence/MF8/BK-MF8-06.md`.
- Handoff: `BK-MF8-07` deve consumir o endpoint e os estados públicos entregues aqui.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/src/modules/subscriptions/subscriptionService.js`
- EDITAR: `apps/api/src/modules/subscriptions/subscriptionRoutes.js`
- REVER: `apps/api/src/server.js`
- CRIAR: `apps/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js`
- CRIAR/EDITAR: `docs/evidence/MF8/BK-MF8-06.md`
- REVER: `apps/api/src/modules/audit/auditLogService.js`
- REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-07-ui-de-planos-e-gestao-da-subscricao.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico

1. Objetivo funcional do passo no contexto da app.

Confirmar que vais corrigir o BK certo, com o requisito certo e com a sequência certa da MF8.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - LOCALIZAÇÃO: linhas de `RF51` e de `BK-MF8-06`.

3. Instruções do que fazer.

Confirma que:

- `RF51` fala de renovação, cancelamento e reativação simuladas;
- `BK-MF8-06` depende de `BK-MF8-05`;
- `BK-MF8-06` prepara `BK-MF8-07`;
- o fluxo continua a ser simulado e não financeiro;
- a prioridade é `P0`, por isso exige cenário feliz e negativos fortes.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e evita que o aluno implemente uma regra fora do contrato canónico.

5. Explicação do código.

Não existe código porque o objetivo é travar deriva antes da implementação. Se o aluno alterar owner, requisito, dependência ou próximo BK sem fonte documental, quebra a matriz e torna a planificação incoerente.

6. Validação do passo.

O passo fica validado quando consegues apontar:

- `RF51` em `docs/RF.md`;
- `BK-MF8-06` na matriz;
- `BK-MF8-06` no backlog;
- `BK-MF8-07` como próximo BK.

7. Cenário negativo/erro esperado.

Erro esperado: tentar implementar pagamento, fatura, recibo ou cobrança automática neste BK. Isso deve ser rejeitado porque `RF51` só pede simulação de ciclo de vida.

### Passo 2 - Mapear contratos herdados

1. Objetivo funcional do passo no contexto da app.

Identificar exatamente que contratos dos BKs anteriores o service novo deve reutilizar.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-04-subscricao-por-empresa-ativa.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-05-ativacao-simulada-de-subscricao.md`
    - LOCALIZAÇÃO: contratos de catálogo, modelo, service, rota e auditoria.

3. Instruções do que fazer.

Antes de editar código, confirma estes contratos:

| Origem | Contrato a reutilizar |
| --- | --- |
| `BK-MF8-03` | `getSimulatedSubscriptionPlan`, `billingCycle`, `intervalCount`, planos `monthly`, `quarterly`, `yearly` |
| `BK-MF8-04` | `CompanySubscription`, `companyId`, `status`, `startsAt`, `endsAt`, `simulated` |
| `BK-MF8-05` | `activateSimulatedSubscription`, `calculateSubscriptionCycleEnd`, `formatCurrentSubscription`, `recordAuditLog`, `assertSubscriptionBelongsToActiveCompany` |

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O passo é uma ponte de integração para impedir contratos duplicados.

5. Explicação do código.

O `BK-MF8-06` não cria outro catálogo, outro modelo ou outro conceito de empresa ativa. Ele acrescenta ações sobre a subscrição atual já criada. Isto mantém a app incremental: cada BK consome a peça anterior e entrega a próxima.

6. Validação do passo.

Procura no `BK-MF8-06` final por:

```bash
rg "billingCycle|intervalCount|CompanySubscription|runSimulatedSubscriptionAction|subscription\\.renew|subscription\\.cancel|subscription\\.reactivate" docs/planificacao/guias-bk/MF8/BK-MF8-06-renovacao-cancelamento-e-reativacao-simuladas.md
```

Resultado esperado: todos estes contratos aparecem no guia.

7. Cenário negativo/erro esperado.

Erro esperado: usar `intervalMonths`. Esse campo não vem do catálogo canónico e deve ser substituído por `billingCycle` e `intervalCount`.

### Passo 3 - Implementar service de ciclo de vida

1. Objetivo funcional do passo no contexto da app.

Criar a regra backend que executa renovação, cancelamento e reativação com transições válidas, persistência e auditoria.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/subscriptions/subscriptionService.js`
    - LOCALIZAÇÃO: fim do ficheiro, abaixo das funções criadas no `BK-MF8-05`.

3. Instruções do que fazer.

No ficheiro `subscriptionService.js`, mantém as funções criadas pelos BKs anteriores. Depois adiciona as exportações completas abaixo. Este bloco reutiliza, no mesmo ficheiro, `SUBSCRIPTION_STATUS`, `requireActiveCompany`, `requireText`, `calculateSubscriptionCycleEnd`, `formatCurrentSubscription`, `getSimulatedSubscriptionPlan`, `recordAuditLog`, `assertSubscriptionBelongsToActiveCompany` e `httpError`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/subscriptions/subscriptionService.js

export const SUBSCRIPTION_LIFECYCLE_ACTION = Object.freeze({
  RENEW: "renew",
  CANCEL: "cancel",
  REACTIVATE: "reactivate",
});

const ALLOWED_LIFECYCLE_TRANSITIONS = Object.freeze({
  [SUBSCRIPTION_STATUS.ACTIVE]: new Set([
    SUBSCRIPTION_LIFECYCLE_ACTION.RENEW,
    SUBSCRIPTION_LIFECYCLE_ACTION.CANCEL,
  ]),
  [SUBSCRIPTION_STATUS.CANCELLED]: new Set([
    SUBSCRIPTION_LIFECYCLE_ACTION.REACTIVATE,
  ]),
  [SUBSCRIPTION_STATUS.EXPIRED]: new Set([
    SUBSCRIPTION_LIFECYCLE_ACTION.REACTIVATE,
  ]),
});

/**
 * Normaliza a ação pedida antes de tocar na base de dados.
 *
 * @param {string} action - Ação recebida no pedido HTTP.
 * @returns {"renew" | "cancel" | "reactivate"} Ação validada.
 * @throws {HttpError} Quando a ação não pertence ao contrato de RF51.
 */
function readSubscriptionLifecycleAction(action) {
  const normalizedAction = requireText(
    action,
    "SUBSCRIPTION_ACTION_REQUIRED",
    "É obrigatório indicar a ação da subscrição.",
  );

  if (!Object.values(SUBSCRIPTION_LIFECYCLE_ACTION).includes(normalizedAction)) {
    throw httpError(
      400,
      "INVALID_SUBSCRIPTION_ACTION",
      "A ação da subscrição deve ser renew, cancel ou reactivate.",
    );
  }

  return normalizedAction;
}

/**
 * Valida os dados de entrada do service de ciclo de vida.
 *
 * @param {{ companyId: string, userId: string, action: string, planCode?: string }} input - Dados vindos da rota protegida.
 * @returns {{ companyId: string, userId: string, action: "renew" | "cancel" | "reactivate", planCode: string | null }} Dados normalizados.
 */
function readSubscriptionLifecycleInput(input) {
  const action = readSubscriptionLifecycleAction(input.action);
  const planCode = input.planCode === undefined || input.planCode === null
    ? null
    : requireText(
      input.planCode,
      "SUBSCRIPTION_PLAN_REQUIRED",
      "É obrigatório indicar um plano válido para reativar a subscrição.",
    );

  if (action === SUBSCRIPTION_LIFECYCLE_ACTION.REACTIVATE && !planCode) {
    throw httpError(
      400,
      "SUBSCRIPTION_PLAN_REQUIRED",
      "A reativação precisa de um plano de subscrição.",
    );
  }

  return {
    companyId: requireActiveCompany(input.companyId),
    userId: requireText(
      input.userId,
      "SUBSCRIPTION_USER_REQUIRED",
      "É obrigatório identificar o utilizador autenticado.",
    ),
    action,
    planCode,
  };
}

/**
 * Confirma que a transição pedida é permitida para o estado atual.
 *
 * @param {{ status: string } | null} subscription - Subscrição atual da empresa.
 * @param {"renew" | "cancel" | "reactivate"} action - Ação validada.
 * @returns {void}
 * @throws {HttpError} Quando não existe subscrição ou a transição é inválida.
 */
export function assertSubscriptionLifecycleTransition(subscription, action) {
  if (!subscription) {
    throw httpError(
      404,
      "SUBSCRIPTION_NOT_FOUND",
      "A empresa ativa ainda não tem uma subscrição para alterar.",
    );
  }

  const allowedActions = ALLOWED_LIFECYCLE_TRANSITIONS[subscription.status];

  // A decisão fica no backend para impedir que a UI force estados impossíveis.
  if (!allowedActions?.has(action)) {
    throw httpError(
      409,
      "INVALID_SUBSCRIPTION_TRANSITION",
      `A subscrição não pode executar ${action} a partir do estado ${subscription.status}.`,
    );
  }
}

/**
 * Calcula os campos Prisma a alterar para a ação pedida.
 *
 * @param {{ subscription: object, action: "renew" | "cancel" | "reactivate", planCode: string | null, now: Date }} input - Contexto da transição.
 * @returns {{ data: object, planCode: string | null, nextStatus: string }} Dados para `update`.
 */
function buildSubscriptionLifecycleUpdate(input) {
  if (input.action === SUBSCRIPTION_LIFECYCLE_ACTION.CANCEL) {
    return {
      data: {
        status: SUBSCRIPTION_STATUS.CANCELLED,
      },
      planCode: input.subscription.planCode,
      nextStatus: SUBSCRIPTION_STATUS.CANCELLED,
    };
  }

  const planCode = input.action === SUBSCRIPTION_LIFECYCLE_ACTION.REACTIVATE
    ? input.planCode
    : input.subscription.planCode;
  const plan = getSimulatedSubscriptionPlan(planCode);
  const currentEndsAt = input.subscription.endsAt
    ? new Date(input.subscription.endsAt)
    : input.now;
  const baseDate = currentEndsAt > input.now ? currentEndsAt : input.now;
  const startsAt = input.action === SUBSCRIPTION_LIFECYCLE_ACTION.REACTIVATE
    ? input.now
    : input.subscription.startsAt;
  const endsAt = calculateSubscriptionCycleEnd(baseDate, plan);

  return {
    data: {
      planCode: plan.code,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      startsAt,
      endsAt,
      simulated: true,
    },
    planCode: plan.code,
    nextStatus: SUBSCRIPTION_STATUS.ACTIVE,
  };
}

/**
 * Executa renovação, cancelamento ou reativação da subscrição atual.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, action: string, planCode?: string, now?: Date }} input - Pedido validado pela rota.
 * @returns {Promise<object>} Payload público da subscrição atualizada.
 */
export async function runSimulatedSubscriptionAction(prisma, input) {
  const lifecycleInput = readSubscriptionLifecycleInput(input);
  const now = input.now instanceof Date ? input.now : new Date();

  const subscription = await prisma.$transaction(async (tx) => {
    const currentSubscription = await tx.companySubscription.findUnique({
      // A pesquisa usa a empresa ativa do backend, nunca um valor escolhido no body.
      where: { companyId: lifecycleInput.companyId },
    });

    assertSubscriptionBelongsToActiveCompany(
      currentSubscription,
      lifecycleInput.companyId,
    );
    assertSubscriptionLifecycleTransition(currentSubscription, lifecycleInput.action);

    const previousStatus = currentSubscription.status;
    const update = buildSubscriptionLifecycleUpdate({
      subscription: currentSubscription,
      action: lifecycleInput.action,
      planCode: lifecycleInput.planCode,
      now,
    });

    const savedSubscription = await tx.companySubscription.update({
      where: { companyId: lifecycleInput.companyId },
      data: update.data,
    });

    // A auditoria guarda a intenção e a transição, sem payload completo nem dados financeiros.
    await recordAuditLog(tx, {
      companyId: lifecycleInput.companyId,
      userId: lifecycleInput.userId,
      action: `subscription.${lifecycleInput.action}`,
      entity: "CompanySubscription",
      entityId: savedSubscription.id,
      details: {
        previousStatus,
        nextStatus: update.nextStatus,
        planCode: update.planCode,
        simulated: true,
      },
    });

    return savedSubscription;
  });

  return formatCurrentSubscription(subscription);
}
```

5. Explicação do código.

Este código acrescenta ao service a parte que faltava para `RF51`. A entrada vem da rota protegida: `companyId` e `userId` são contexto autenticado; `action` e `planCode` são intenção do utilizador.

`readSubscriptionLifecycleInput` valida a forma dos dados antes de qualquer query. A reativação exige `planCode` porque uma subscrição cancelada ou expirada precisa de um plano canónico para voltar a `ACTIVE`.

`assertSubscriptionLifecycleTransition` aplica a máquina de estados no backend. Isto evita que o frontend cancele uma subscrição já cancelada ou renove uma subscrição expirada sem reativação explícita.

`buildSubscriptionLifecycleUpdate` usa `billingCycle` e `intervalCount` através de `calculateSubscriptionCycleEnd`. A renovação prolonga a data final a partir do fim atual quando esse fim ainda está no futuro. A reativação começa novo ciclo em `now`.

`runSimulatedSubscriptionAction` executa query, validação, update e auditoria dentro da mesma transação. A auditoria guarda `previousStatus`, `nextStatus`, `planCode` e `simulated`, o suficiente para defender a operação sem expor dados desnecessários.

6. Validação do passo.

Confirma que:

- `renew` sobre `ACTIVE` devolve `state: "active"` e aumenta `endsAt`;
- `cancel` sobre `ACTIVE` devolve `state: "cancelled"`;
- `reactivate` sobre `CANCELLED` ou `EXPIRED` devolve `state: "active"`;
- `reactivate` sem `planCode` devolve `400`;
- `renew` sobre `CANCELLED` devolve `409`;
- a auditoria usa `subscription.renew`, `subscription.cancel` ou `subscription.reactivate`.

7. Cenário negativo/erro esperado.

Erro esperado: chamar `runSimulatedSubscriptionAction(prisma, { action: "renew" })` sem `companyId` deve lançar `ACTIVE_COMPANY_REQUIRED`. O service não pode alterar subscrições sem empresa ativa resolvida pelo backend.

### Passo 4 - Expor endpoint protegido

1. Objetivo funcional do passo no contexto da app.

Ligar o service de ciclo de vida a uma rota Express protegida, com validação de body e respostas HTTP estáveis.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/subscriptions/subscriptionRoutes.js`
    - REVER: `apps/api/src/modules/auth/authMiddleware.js`
    - REVER: `apps/api/src/modules/companies/companyContext.js`
    - REVER: `apps/api/src/modules/permissions/permissionMiddleware.js`
    - LOCALIZAÇÃO: dentro de `buildSubscriptionRoutes`, depois de `POST /current/activate`.

3. Instruções do que fazer.

No router de subscrições, importa `runSimulatedSubscriptionAction` a partir do service. Depois adiciona a função de leitura de body e a rota `POST /current/actions`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/subscriptions/subscriptionRoutes.js

import {
  activateSimulatedSubscription,
  getCurrentSubscription,
  rethrowSubscriptionError,
  runSimulatedSubscriptionAction,
} from "./subscriptionService.js";

/**
 * Lê o body das ações de ciclo de vida da subscrição.
 *
 * @param {object} body - Body JSON recebido pela rota.
 * @returns {{ action: string, planCode?: string }} Dados normalizados para o service.
 */
function readLifecycleActionBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError(
      400,
      "INVALID_SUBSCRIPTION_ACTION_BODY",
      "O pedido deve enviar um objeto JSON.",
    );
  }

  if (typeof body.action !== "string" || body.action.trim().length === 0) {
    throw httpError(
      400,
      "SUBSCRIPTION_ACTION_REQUIRED",
      "É obrigatório indicar a ação da subscrição.",
    );
  }

  if (body.planCode !== undefined && typeof body.planCode !== "string") {
    throw httpError(
      400,
      "SUBSCRIPTION_PLAN_INVALID",
      "O plano deve ser identificado por texto.",
    );
  }

  return {
    action: body.action.trim(),
    planCode: body.planCode?.trim(),
  };
}

router.post("/current/actions", protectedGuards, async (req, res) => {
  try {
    const body = readLifecycleActionBody(req.body);
    const result = await runSimulatedSubscriptionAction(prisma, {
      // Empresa e utilizador vêm dos middlewares, não do browser.
      companyId: req.companyId,
      userId: req.user.id,
      action: body.action,
      planCode: body.planCode,
    });

    return res.status(200).json(result);
  } catch (error) {
    // Erros de catálogo e erros HTTP do service são devolvidos de forma controlada.
    return sendError(res, normalizeSubscriptionError(error));
  }
});
```

5. Explicação do código.

`readLifecycleActionBody` aceita apenas um objeto JSON com `action` e `planCode`. Não aceita `companyId`, role ou utilizador porque esses dados vêm dos middlewares.

A rota usa os mesmos `protectedGuards` de `GET /current` e `POST /current/activate`: sessão autenticada, empresa ativa e role autorizada. Assim, o frontend recolhe intenção, mas a autorização final fica no backend.

O endpoint interno é `/current/actions`. Como o router está montado em `/api/subscriptions`, o caminho público fica `POST /api/subscriptions/current/actions`.

6. Validação do passo.

Requests esperados:

```bash
POST /api/subscriptions/current/actions
{ "action": "renew" }

POST /api/subscriptions/current/actions
{ "action": "cancel" }

POST /api/subscriptions/current/actions
{ "action": "reactivate", "planCode": "monthly" }
```

Resultado esperado: `200 OK` com `state` atualizado quando a transição é permitida.

7. Cenário negativo/erro esperado.

Erro esperado: enviar `{ "action": "reactivate" }` sem `planCode` deve devolver `400 SUBSCRIPTION_PLAN_REQUIRED`. A rota e o service não podem adivinhar o plano.

### Passo 5 - Confirmar montagem no servidor

1. Objetivo funcional do passo no contexto da app.

Garantir que o endpoint novo fica disponível sob o prefixo público de subscrições.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/server.js`
    - LOCALIZAÇÃO: zona onde os routers Express são montados.

3. Instruções do que fazer.

Confirma que o servidor continua a montar o router em `/api/subscriptions`. Não cries outro prefixo para ações de ciclo de vida.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/server.js

import { buildSubscriptionRoutes } from "./modules/subscriptions/subscriptionRoutes.js";

// O prefixo único mantém planos, subscrição atual, ativação e ações no mesmo domínio.
app.use("/api/subscriptions", buildSubscriptionRoutes({ prisma }));
```

5. Explicação do código.

O router define a rota interna `/current/actions`, mas o servidor acrescenta o prefixo `/api/subscriptions`. Por isso, o endpoint completo consumido pelo frontend e pelos testes é `POST /api/subscriptions/current/actions`.

Manter o mesmo prefixo evita endpoints duplicados como `/api/subscription` ou `/api/billing`, que não existem na planificação.

6. Validação do passo.

Executa:

```bash
rg "buildSubscriptionRoutes|/api/subscriptions" apps/api/src/server.js
```

Resultado esperado: existe uma montagem única para `buildSubscriptionRoutes`.

7. Cenário negativo/erro esperado.

Erro esperado: montar o router em `/api/subscription` no singular faz os testes do BK06 falharem com `404`, porque o contrato público usa `/api/subscriptions`.

### Passo 6 - Criar testes contratuais

1. Objetivo funcional do passo no contexto da app.

Provar que o contrato HTTP de `RF51` funciona e falha de forma controlada nos principais negativos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js`
    - LOCALIZAÇÃO: novo ficheiro de testes contratuais da MF8.

3. Instruções do que fazer.

Cria o ficheiro abaixo. Ele testa o endpoint com dependências em memória para confirmar contrato HTTP, empresa ativa, transições, auditoria e erros esperados.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js

import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import express from "express";
import { buildSubscriptionRoutes } from "../../src/modules/subscriptions/subscriptionRoutes.js";

const COMPANY_ID = "company-001";
const USER_ID = "user-001";

/**
 * Cria uma subscrição persistida em memória.
 *
 * @param {object} overrides - Campos a substituir na subscrição base.
 * @returns {object} Subscrição pronta para o teste.
 */
function createSubscription(overrides = {}) {
  return {
    id: "subscription-001",
    companyId: COMPANY_ID,
    planCode: "monthly",
    status: "ACTIVE",
    startsAt: new Date("2026-07-01T00:00:00.000Z"),
    endsAt: new Date("2026-08-01T00:00:00.000Z"),
    simulated: true,
    ...overrides,
  };
}

/**
 * Cria Prisma em memória com as operações usadas pelo service.
 *
 * @param {object | null} initialSubscription - Estado inicial da subscrição.
 * @returns {{ prisma: object, calls: object }} Cliente de teste e chamadas capturadas.
 */
function createPrismaDouble(initialSubscription) {
  const calls = {
    findUnique: [],
    update: [],
    audit: [],
  };
  let subscription = initialSubscription;

  const prisma = {
    companySubscription: {
      async findUnique(args) {
        calls.findUnique.push(args);
        return subscription;
      },
      async update(args) {
        calls.update.push(args);
        // O update em memória imita a linha devolvida pelo Prisma depois da alteração.
        subscription = {
          ...subscription,
          ...args.data,
          companyId: COMPANY_ID,
          id: subscription.id,
        };
        return subscription;
      },
    },
    auditLog: {
      async create(args) {
        calls.audit.push(args);
        return { id: "audit-001", ...args.data };
      },
    },
    async $transaction(work) {
      // O teste usa uma transação síncrona em memória para validar a fronteira do service.
      return work(this);
    },
  };

  return { prisma, calls };
}

/**
 * Cria guard de sucesso com sessão, empresa ativa e role autorizada.
 *
 * @returns {import("express").RequestHandler} Middleware Express.
 */
function allowSubscriptionAction() {
  return function allowedGuard(req, _res, next) {
    req.user = { id: USER_ID };
    req.companyId = COMPANY_ID;
    req.role = "GESTOR";
    return next();
  };
}

/**
 * Cria guard que simula role sem acesso.
 *
 * @returns {import("express").RequestHandler} Middleware Express.
 */
function denyRole() {
  return function deniedGuard(_req, res) {
    return res.status(403).json({
      error: "ROLE_FORBIDDEN",
      message: "Papel sem acesso a esta operação.",
    });
  };
}

/**
 * Cria guard autenticado sem empresa ativa.
 *
 * @returns {import("express").RequestHandler} Middleware Express.
 */
function withoutCompany() {
  return function missingCompanyGuard(req, _res, next) {
    req.user = { id: USER_ID };
    req.role = "GESTOR";
    return next();
  };
}

/**
 * Sobe uma app Express real para testar o contrato HTTP.
 *
 * @param {object} prisma - Cliente Prisma em memória.
 * @param {import("express").RequestHandler[]} guards - Guards injetados no router.
 * @returns {Promise<{ baseUrl: string, close: () => Promise<void> }>} Servidor temporário.
 */
async function createHttpServer(prisma, guards) {
  const app = express();
  app.use(express.json());
  app.use("/api/subscriptions", buildSubscriptionRoutes({ prisma, guards }));

  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  assert.equal(typeof address, "object");

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    }),
  };
}

test("POST /api/subscriptions/current/actions renova subscrição ativa", async () => {
  const { prisma, calls } = createPrismaDouble(createSubscription());
  const server = await createHttpServer(prisma, [allowSubscriptionAction()]);

  try {
    // A renovação só envia a intenção; a empresa ativa vem do guard backend.
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "renew" }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.active, true);
    assert.equal(body.state, "active");
    assert.equal(body.subscription.status, "ACTIVE");
    assert.equal(calls.update[0].where.companyId, COMPANY_ID);
    assert.equal(calls.audit[0].data.action, "subscription.renew");
    assert.equal(calls.audit[0].data.details.previousStatus, "ACTIVE");
    assert.equal(calls.audit[0].data.details.nextStatus, "ACTIVE");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/actions cancela subscrição ativa", async () => {
  const { prisma, calls } = createPrismaDouble(createSubscription());
  const server = await createHttpServer(prisma, [allowSubscriptionAction()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.state, "cancelled");
    assert.equal(body.subscription.status, "CANCELLED");
    assert.equal(calls.audit[0].data.action, "subscription.cancel");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/actions reativa subscrição cancelada", async () => {
  const { prisma, calls } = createPrismaDouble(createSubscription({ status: "CANCELLED" }));
  const server = await createHttpServer(prisma, [allowSubscriptionAction()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reactivate", planCode: "yearly" }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.state, "active");
    assert.equal(body.subscription.planCode, "yearly");
    assert.equal(calls.audit[0].data.action, "subscription.reactivate");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/actions bloqueia transição inválida", async () => {
  const { prisma } = createPrismaDouble(createSubscription({ status: "CANCELLED" }));
  const server = await createHttpServer(prisma, [allowSubscriptionAction()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "renew" }),
    });
    const body = await response.json();

    assert.equal(response.status, 409);
    assert.equal(body.error, "INVALID_SUBSCRIPTION_TRANSITION");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/actions exige plano na reativação", async () => {
  const { prisma } = createPrismaDouble(createSubscription({ status: "EXPIRED" }));
  const server = await createHttpServer(prisma, [allowSubscriptionAction()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reactivate" }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, "SUBSCRIPTION_PLAN_REQUIRED");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/actions bloqueia role sem acesso", async () => {
  const { prisma } = createPrismaDouble(createSubscription());
  const server = await createHttpServer(prisma, [denyRole()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(body.error, "ROLE_FORBIDDEN");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/actions exige empresa ativa", async () => {
  const { prisma } = createPrismaDouble(createSubscription());
  const server = await createHttpServer(prisma, [withoutCompany()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "renew" }),
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(body.error, "ACTIVE_COMPANY_REQUIRED");
  } finally {
    await server.close();
  }
});
```

5. Explicação do código.

Os testes criam uma app Express real e injetam um Prisma em memória. Isto permite validar a rota sem depender de uma base de dados externa.

Os três primeiros testes provam os fluxos positivos de `RF51`: renovar, cancelar e reativar. Eles também confirmam que o update usa a empresa ativa e que a auditoria grava a ação certa.

Os negativos cobrem transição inválida, reativação sem plano, role sem acesso e falta de empresa ativa. Estes casos protegem segurança, domínio e pedagogia: o aluno vê exatamente como a API deve falhar.

6. Validação do passo.

Executa no diretório `apps/api`:

```bash
npm run test:contracts
```

Resultado esperado: a suite contratual passa, incluindo o novo ficheiro `mf8-subscription-lifecycle.contract.test.js`.

7. Cenário negativo/erro esperado.

Erro esperado: alterar o teste para enviar `companyId` no body não deve alterar a empresa usada pelo service. O backend deve continuar a usar `req.companyId`.

### Passo 7 - Validar segurança, domínio e evidence

1. Objetivo funcional do passo no contexto da app.

Confirmar que o BK fecha `RF51` sem introduzir risco de segurança, pagamento real ou drift de domínio.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/subscriptions/subscriptionService.js`
    - REVER: `apps/api/src/modules/subscriptions/subscriptionRoutes.js`
    - CRIAR/EDITAR: `docs/evidence/MF8/BK-MF8-06.md`
    - LOCALIZAÇÃO: validação final e evidence.

3. Instruções do que fazer.

Na evidence do PR ou defesa, regista:

- comando executado;
- resultado observado;
- payload positivo para `renew`, `cancel` e `reactivate`;
- pelo menos três negativos;
- confirmação de que não existe pagamento real;
- confirmação de que `companyId` vem do backend;
- confirmação de que a auditoria usa `subscription.renew`, `subscription.cancel` e `subscription.reactivate`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e deve ser preenchido com outputs reais quando a equipa executar o BK.

5. Explicação do código.

A evidence liga código, teste e defesa. Ela impede que o aluno diga apenas "funciona" sem mostrar que o contrato foi validado. Também deixa claro para o `BK-MF8-07` que ações já existem no backend.

6. Validação do passo.

O ficheiro `docs/evidence/MF8/BK-MF8-06.md` deve mencionar:

- `RF51`;
- `POST /api/subscriptions/current/actions`;
- `npm run test:contracts`;
- resultado do cenário feliz;
- resultado de negativos;
- decisão final do BK.

7. Cenário negativo/erro esperado.

Erro esperado: evidence sem outputs reais ou sem negativos. Nesse caso, o BK não deve ser defendido como concluído.

### Passo 8 - Fechar handoff para BK-MF8-07

1. Objetivo funcional do passo no contexto da app.

Entregar ao próximo BK um contrato backend claro para construir a UI de gestão da subscrição.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-07-ui-de-planos-e-gestao-da-subscricao.md`
    - REVER: `apps/web/src/lib/subscriptionsApi.ts`
    - LOCALIZAÇÃO: cliente API do próximo BK.

3. Instruções do que fazer.

O `BK-MF8-07` deve consumir:

- `GET /api/subscriptions/plans`;
- `GET /api/subscriptions/current`;
- `POST /api/subscriptions/current/activate`;
- `POST /api/subscriptions/current/actions`.

O cliente API do próximo BK deve usar `billingCycle` e `intervalCount`, não `intervalMonths`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O handoff descreve contratos que o próximo BK deve usar.

5. Explicação do código.

Este BK não edita o frontend. A responsabilidade aqui é deixar o backend previsível. O próximo aluno deve conseguir criar botões para renovar, cancelar e reativar chamando uma API já definida, sem decidir permissões ou empresa ativa no browser.

6. Validação do passo.

Confirma que a secção `Handoff` deste guia lista os endpoints e campos que o `BK-MF8-07` deve consumir.

7. Cenário negativo/erro esperado.

Erro esperado: o próximo BK chamar `/api/subscriptions/actions` ou usar `intervalMonths`. Isso cria drift e deve ser corrigido quando o `BK-MF8-07` for reaberto.

#### Critérios de aceite

- `BK-MF8-06` mantém header, owner, prioridade, dependência, requisito e próximo BK definidos na matriz.
- `CompanySubscription` continua a ser o modelo único de subscrição por empresa.
- O cálculo de ciclos usa `billingCycle` e `intervalCount`.
- O endpoint público é `POST /api/subscriptions/current/actions`.
- A rota aceita `renew`, `cancel` e `reactivate`.
- A reativação exige `planCode` canónico.
- A empresa ativa vem de `req.companyId`, não do body.
- A role autorizada é aplicada no backend.
- As transições inválidas devolvem erro controlado.
- A auditoria regista `subscription.renew`, `subscription.cancel` e `subscription.reactivate`.
- Existem testes positivos para renovar, cancelar e reativar.
- Existem negativos para transição inválida, plano em falta, role sem acesso e falta de empresa ativa.
- Negativos: mínimo `4` para cobrir transição inválida, plano em falta, role sem acesso e falta de empresa ativa.
- Não existe pagamento real, checkout, recibo, fatura ou cobrança automática.
- Não aparecem caminhos privados de referência em caminhos destinados aos alunos.

#### Validação final

Executa no diretório `apps/api`:

```bash
npm run syntax:check
npm run test:contracts
```

Depois executa na raiz do projeto:

```bash
git diff --check
bash scripts/validate-planificacao.sh
```

Resultado esperado:

- `npm run syntax:check` termina sem erros de sintaxe.
- `npm run test:contracts` valida o contrato de subscrições.
- A auditoria confirma que o BK não expõe caminhos privados de referência.
- `git diff --check` não reporta whitespace errors.
- O validador de planificação passa ou regista apenas avisos herdados fora do BK.

#### Evidence para PR/defesa

No PR ou na defesa, inclui:

- caminho do service alterado;
- caminho da rota alterada;
- caminho do teste criado;
- output real de `npm run syntax:check`;
- output real de `npm run test:contracts`;
- payloads usados para `renew`, `cancel` e `reactivate`;
- negativos executados;
- confirmação de que a empresa ativa vem do backend;
- confirmação de que não há pagamento real;
- confirmação de que o próximo BK é `BK-MF8-07`.

#### Handoff

- Próximo BK recomendado: `BK-MF8-07`.

O próximo BK deve reutilizar:

- `GET /api/subscriptions/plans`;
- `GET /api/subscriptions/current`;
- `POST /api/subscriptions/current/activate`;
- `POST /api/subscriptions/current/actions`;
- estados públicos `active`, `cancelled` e `expired`;
- ações `renew`, `cancel` e `reactivate`;
- campos de plano `billingCycle` e `intervalCount`;
- resposta pública de `formatCurrentSubscription`;
- auditoria funcional já garantida no backend.

O `BK-MF8-07` não deve decidir empresa ativa, role ou permissão no frontend. A UI deve chamar a API com `credentials: "include"` através do cliente central e mostrar feedback claro em português de Portugal.

#### Changelog

- `2026-07-02`: corrigido o guia para fechar os findings `AUD-MF8-BK06-001` a `AUD-MF8-BK06-006`, substituindo a máquina de estados isolada por service integrado, rota protegida, testes contratuais, auditoria e handoff coerente.
- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com caminhos públicos, passos técnicos lineares, código completo, validação e evidence.
