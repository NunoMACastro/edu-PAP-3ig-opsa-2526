# BK-MF8-05 - Ativação simulada de subscrição.

## Header

- `doc_id`: `GUIA-BK-MF8-05`
- `bk_id`: `BK-MF8-05`
- `macro`: `MF8`
- `owner`: `Andre`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-04`
- `rf_rnf`: `RF50`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-06`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-05-ativacao-simulada-de-subscricao.md`
- `last_updated`: `2026-07-02`

#### Objetivo

Neste BK vais ativar uma subscrição simulada para a empresa ativa, reutilizando o catálogo do `BK-MF8-03` e a subscrição por empresa criada no `BK-MF8-04`.

#### Importância

A ativação é o momento em que uma escolha do utilizador passa a estado persistido da empresa. Por isso, a operação tem de ser validada no backend, autorizada por role, registada em auditoria e claramente separada de qualquer pagamento real.

#### Scope-in

- Criar a função `activateSimulatedSubscription`.
- Calcular `startsAt` e `endsAt` a partir de `billingCycle` e `intervalCount`.
- Atualizar a linha única de `CompanySubscription` associada à empresa ativa.
- Expor `POST /api/subscriptions/current/activate` no módulo de subscrições.
- Validar `planCode` contra o catálogo canónico.
- Bloquear ativação sem autenticação, sem empresa ativa ou sem role autorizada.
- Registar auditoria funcional sem dados sensíveis.
- Acrescentar testes contratuais positivos e negativos.

#### Scope-out

- Cobrança real, checkout, cartões, recibos ou faturas.
- Gestão do cancelamento, expiração ou renovação automática.
- Criação de mais do que uma subscrição atual por empresa.
- Alterações de frontend que pertencem ao `BK-MF8-07`.
- Alterações contabilísticas ou documentos financeiros.

#### Estado antes e depois

- Antes: `BK-MF8-03` entrega o catálogo de planos simulados e `BK-MF8-04` entrega `CompanySubscription`, `getCurrentSubscription`, ownership por empresa ativa e a rota de consulta atual.
- Depois: `BK-MF8-05` passa a ativar ou substituir a subscrição atual da empresa, com datas calculadas, autorização, resposta pública estável, auditoria e testes de contrato.

#### Pre-requisitos

- Ler `RF50` em `docs/RF.md`.
- Rever a linha de `BK-MF8-05` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF8-05` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`.
- Rever `docs/planificacao/guias-bk/MF8/BK-MF8-04-subscricao-por-empresa-ativa.md`.
- Confirmar que todos os caminhos do aluno usam `apps/api` ou `apps/web`.
- Negativos obrigatórios: pelo menos `3`.

#### Glossário

- Ativação: operação backend que grava uma subscrição simulada ativa para a empresa atual.
- Ciclo: período coberto pelo plano, calculado a partir de `billingCycle` e `intervalCount`.
- Subscrição atual: linha única de `CompanySubscription` associada à empresa em contexto.
- Auditoria funcional: registo mínimo de quem fez a operação, em que empresa e para que entidade.
- Idempotência prática: repetir a ativação para a mesma empresa substitui o plano atual em vez de criar duplicados.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF50` é o requisito associado a `BK-MF8-05`.
- `CANONICO`: `BK-MF8-05` pertence à MF8, sprint `S12`, owner `Andre`, apoio `Pedro`, prioridade `P0` e próximo BK `BK-MF8-06`.
- `CANONICO`: o catálogo do `BK-MF8-03` entrega planos com `code`, `billingCycle` e `intervalCount`.
- `CANONICO`: o `BK-MF8-04` entrega `CompanySubscription` com ownership por `companyId`, mais `planCode`, `status`, `startsAt`, `endsAt` e `simulated`.
- `DERIVADO`: `POST /api/subscriptions/current/activate` é a fronteira HTTP mínima para transformar a escolha de plano em subscrição simulada persistida.

A empresa ativa é resolvida pelo backend a partir da sessão autenticada e do contexto multiempresa. O body do pedido só pode transportar a intenção funcional, neste caso `planCode`; nunca deve decidir ownership, role ou permissões.

O estado guardado no Prisma usa o enum canónico `ACTIVE`. A resposta pública pode devolver `state: "active"` porque esse formato é estável para a API e mais simples para a UI.

#### Arquitetura do BK

- Requisito: `RF50`.
- Domínio principal: subscrições simuladas.
- Backend público dos alunos: `apps/api`.
- Frontend público dos alunos: `apps/web`.
- Prisma público dos alunos: `apps/api/prisma/schema.prisma`.
- Entrada HTTP nova: `POST /api/subscriptions/current/activate`.
- Service principal: `activateSimulatedSubscription`.
- Modelo persistido reutilizado: `CompanySubscription`.
- Catálogo reutilizado: `monthly`, `quarterly`, `yearly`, `billingCycle`, `intervalCount`.
- Evidence: `docs/evidence/MF8/BK-MF8-05.md`.
- Handoff: `BK-MF8-06`.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/src/modules/subscriptions/subscriptionService.js`
- EDITAR: `apps/api/src/modules/subscriptions/subscriptionRoutes.js`
- CRIAR: `apps/api/tests/contracts/mf8-subscription-activation.contract.test.js`
- REVER: `apps/api/src/modules/audit/auditLogService.js`
- REVER: `apps/api/src/modules/auth/authMiddleware.js`
- REVER: `apps/api/src/modules/companies/companyContext.js`
- REVER: `apps/api/src/modules/permissions/permissionMiddleware.js`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico

1. Objetivo funcional do passo no contexto da app.

Confirmar que a ativação simulada continua alinhada com `RF50`, com a matriz da MF8 e com os BKs vizinhos.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-04-subscricao-por-empresa-ativa.md`

3. Instruções do que fazer.

Confirma que:

- `BK-MF8-05` está associado a `RF50`;
- a prioridade é `P0`;
- o owner é `Andre` e o apoio é `Pedro`;
- a dependência imediata é `BK-MF8-04`;
- o próximo BK é `BK-MF8-06`;
- o catálogo anterior usa `billingCycle` e `intervalCount`;
- a subscrição anterior usa `CompanySubscription` com ownership por `companyId`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e impede que a ativação seja implementada com campos que não existem no contrato anterior.

5. Explicação do código.

Não existe código porque a primeira decisão técnica é de integração: o BK atual não cria outro catálogo, outro modelo ou outro conceito de empresa ativa. Ele reutiliza a base entregue nos BKs anteriores.

6. Validação do passo.

- Confirma manualmente que `BK-MF8-03` documenta `billingCycle` e `intervalCount`.
- Confirma manualmente que `BK-MF8-04` documenta `CompanySubscription.companyId`.
- Confirma manualmente que `RF50` não exige pagamento real.
- Podes avançar quando a ativação estiver limitada a plano simulado, empresa ativa resolvida pelo backend, role autorizada e persistência na subscrição atual.

7. Cenário negativo/erro esperado.

- Criar um segundo modelo de subscrição em vez de usar `CompanySubscription`.
- Aceitar a empresa ativa a partir do body do pedido.
- Calcular datas com campos que o catálogo não devolve.
- Guardar estados em texto livre em vez de usar o enum Prisma.

### Passo 2 - Definir o contrato HTTP da ativação

1. Objetivo funcional do passo no contexto da app.

Definir uma fronteira HTTP pequena e segura para a ativação simulada.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/subscriptions/subscriptionRoutes.js`
    - REVER: `apps/api/src/modules/auth/authMiddleware.js`
    - REVER: `apps/api/src/modules/companies/companyContext.js`
    - REVER: `apps/api/src/modules/permissions/permissionMiddleware.js`

3. Instruções do que fazer.

A rota nova deve seguir este contrato:

| Campo | Valor |
| --- | --- |
| Método | `POST` |
| Caminho | `/api/subscriptions/current/activate` |
| Body aceite | `{ "planCode": "monthly" }` |
| Body proibido para ownership | qualquer campo que tente escolher empresa ativa |
| Roles autorizadas | `ADMIN`, `GESTOR` |
| Sucesso | `200` com subscrição atualizada |
| Plano inexistente | `404` com `SUBSCRIPTION_PLAN_NOT_FOUND` |
| Payload inválido | `400` com `INVALID_SUBSCRIPTION_ACTIVATION` |
| Sem sessão | `401` |
| Sem role autorizada | `403` |

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O código completo da rota fica no Passo 4 para manter validação, guards e controller no mesmo local.

5. Explicação do código.

O body só transporta `planCode` porque o utilizador escolhe o plano. A empresa, o utilizador e a role vêm dos middlewares da API. Esta separação impede que o browser escolha a empresa sobre a qual a operação vai atuar.

6. Validação do passo.

- O teste positivo deve enviar apenas `planCode`.
- Pelo menos um teste negativo deve enviar plano inexistente.
- Pelo menos um teste negativo deve bloquear role sem permissão.
- Pelo menos um teste negativo deve bloquear falta de empresa ativa.
- O contrato está aceite quando a rota nova tem método, path, payload, respostas de erro e roles definidos antes de escrever o controller.

7. Cenário negativo/erro esperado.

- Ler a empresa a partir do body ou da query string deve ser rejeitado como erro de segurança multiempresa.
- Permitir a rota apenas porque o utilizador está autenticado, sem confirmar a role, deve devolver `403`.
- Devolver objetos Prisma completos ao frontend deve ser evitado; a API deve devolver apenas payload público.
- Aceitar `planCode` vazio ou com tipo incorreto deve devolver `400`.

### Passo 3 - Implementar service de ativação

1. Objetivo funcional do passo no contexto da app.

Criar a regra de domínio que valida o plano, calcula o ciclo, grava a subscrição atual e regista auditoria.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/subscriptions/subscriptionService.js`
    - REVER: `apps/api/src/modules/audit/auditLogService.js`

3. Instruções do que fazer.

Atualiza `subscriptionService.js` para conter o código completo abaixo. Se o ficheiro já tiver funções criadas no `BK-MF8-04`, mantém os nomes públicos e substitui apenas a implementação pelo contrato completo deste passo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Regras de domínio para consulta e ativação de subscrições simuladas.
 *
 * Este módulo não conhece Express. Recebe o contexto já validado pela rota,
 * consulta o catálogo canónico e grava a subscrição atual da empresa.
 */

import { httpError } from "../../lib/httpErrors.js";
import {
  SimulatedSubscriptionPlanError,
  getSimulatedSubscriptionPlan,
} from "./subscriptionPlans.js";
import { recordAuditLog } from "../audit/auditLogService.js";

const SUBSCRIPTION_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
});

const PUBLIC_STATE_BY_STATUS = Object.freeze({
  [SUBSCRIPTION_STATUS.ACTIVE]: "active",
  [SUBSCRIPTION_STATUS.CANCELLED]: "cancelled",
  [SUBSCRIPTION_STATUS.EXPIRED]: "expired",
});

/**
 * Valida o identificador da empresa ativa resolvida pelo backend.
 *
 * @param {string} companyId - Empresa ativa calculada pelo middleware multiempresa.
 * @returns {string} Empresa validada.
 */
function requireActiveCompany(companyId) {
  if (typeof companyId !== "string" || companyId.trim().length === 0) {
    throw httpError(
      403,
      "ACTIVE_COMPANY_REQUIRED",
      "É obrigatória uma empresa ativa para gerir subscrições.",
    );
  }

  return companyId.trim();
}

/**
 * Valida uma string obrigatória de domínio.
 *
 * @param {unknown} value - Valor recebido do caller.
 * @param {string} code - Código funcional da falha.
 * @param {string} message - Mensagem segura para a API.
 * @returns {string} Valor normalizado.
 */
function requireText(value, code, message) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw httpError(400, code, message);
  }

  return value.trim();
}

/**
 * Converte um estado persistido para o contrato público da API.
 *
 * @param {string} status - Estado guardado no Prisma.
 * @returns {string} Estado público.
 */
function toPublicSubscriptionState(status) {
  return PUBLIC_STATE_BY_STATUS[status] ?? "unknown";
}

/**
 * Converte uma data opcional para ISO sem expor objetos Date crus.
 *
 * @param {Date | string | null | undefined} value - Valor persistido.
 * @returns {string | null} Data ISO ou null.
 */
function toOptionalIsoString(value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/**
 * Calcula a data final de uma subscrição a partir do contrato do catálogo.
 *
 * @param {Date} startsAt - Data inicial do ciclo.
 * @param {{ billingCycle: "month" | "year", intervalCount: number }} plan - Plano canónico.
 * @returns {Date} Data final calculada.
 */
export function calculateSubscriptionCycleEnd(startsAt, plan) {
  if (!Number.isInteger(plan.intervalCount) || plan.intervalCount <= 0) {
    throw httpError(
      409,
      "INVALID_SUBSCRIPTION_INTERVAL",
      "O plano simulado tem um intervalo inválido.",
    );
  }

  // Trabalhamos numa cópia da data inicial para não alterar o objeto recebido pelo caller.
  const endsAt = new Date(startsAt);

  if (plan.billingCycle === "month") {
    endsAt.setMonth(endsAt.getMonth() + plan.intervalCount);
    return endsAt;
  }

  if (plan.billingCycle === "year") {
    endsAt.setFullYear(endsAt.getFullYear() + plan.intervalCount);
    return endsAt;
  }

  throw httpError(
    409,
    "INVALID_SUBSCRIPTION_CYCLE",
    "O plano simulado tem um ciclo de faturação inválido.",
  );
}

/**
 * Acrescenta dados públicos do plano à subscrição persistida.
 *
 * @param {object | null} subscription - Subscrição persistida.
 * @returns {object} Payload público da subscrição atual.
 */
export function formatCurrentSubscription(subscription) {
  if (!subscription) {
    return {
      active: false,
      state: "none",
      subscription: null,
    };
  }

  const plan = getSimulatedSubscriptionPlan(subscription.planCode);

  return {
    active: subscription.status === SUBSCRIPTION_STATUS.ACTIVE,
    state: toPublicSubscriptionState(subscription.status),
    subscription: {
      id: subscription.id,
      planCode: subscription.planCode,
      planName: plan.name,
      status: subscription.status,
      state: toPublicSubscriptionState(subscription.status),
      startsAt: toOptionalIsoString(subscription.startsAt),
      endsAt: toOptionalIsoString(subscription.endsAt),
      simulated: Boolean(subscription.simulated),
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
  const companyId = requireActiveCompany(context.companyId);

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
 * @returns {object | null} Subscrição original quando pertence à empresa ativa.
 */
export function assertSubscriptionBelongsToActiveCompany(subscription, companyId) {
  const expectedCompany = requireActiveCompany(companyId);

  if (subscription && subscription.companyId !== expectedCompany) {
    throw httpError(
      403,
      "SUBSCRIPTION_COMPANY_FORBIDDEN",
      "A subscrição consultada não pertence à empresa ativa.",
    );
  }

  return subscription;
}

/**
 * Valida o input mínimo da ativação antes de abrir a transação.
 *
 * @param {{ companyId: unknown, userId: unknown, planCode: unknown }} input - Dados de ativação.
 * @returns {{ companyId: string, userId: string, planCode: string }} Dados normalizados.
 */
function readActivationInput(input) {
  return {
    companyId: requireActiveCompany(input.companyId),
    userId: requireText(
      input.userId,
      "SUBSCRIPTION_USER_REQUIRED",
      "É obrigatório identificar o utilizador autenticado.",
    ),
    planCode: requireText(
      input.planCode,
      "SUBSCRIPTION_PLAN_REQUIRED",
      "É obrigatório indicar o plano de subscrição.",
    ),
  };
}

/**
 * Ativa ou substitui a subscrição simulada da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, planCode: string, now?: Date }} input - Dados de ativação vindos da rota.
 * @returns {Promise<object>} Payload público da subscrição ativa.
 */
export async function activateSimulatedSubscription(prisma, input) {
  const activation = readActivationInput(input);
  const plan = getSimulatedSubscriptionPlan(activation.planCode);
  const startsAt = input.now instanceof Date ? input.now : new Date();
  const endsAt = calculateSubscriptionCycleEnd(startsAt, plan);

  // A transação mantém a subscrição e a auditoria alinhadas para a mesma ativação.
  const subscription = await prisma.$transaction(async (tx) => {
    const savedSubscription = await tx.companySubscription.upsert({
      // A empresa vem do contexto backend; isto impede duplicados e ownership vindo do browser.
      where: { companyId: activation.companyId },
      update: {
        planCode: plan.code,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        startsAt,
        endsAt,
        simulated: true,
      },
      create: {
        companyId: activation.companyId,
        planCode: plan.code,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        startsAt,
        endsAt,
        simulated: true,
      },
    });

    // A auditoria guarda só dados mínimos, sem body completo nem informação de pagamento.
    await recordAuditLog(tx, {
      companyId: activation.companyId,
      userId: activation.userId,
      action: "subscription.activate",
      entity: "CompanySubscription",
      entityId: savedSubscription.id,
      details: {
        planCode: plan.code,
        simulated: true,
      },
    });

    return savedSubscription;
  });

  return formatCurrentSubscription(subscription);
}

/**
 * Converte erro de catálogo em erro HTTP já esperado pela API.
 *
 * @param {unknown} error - Erro capturado no controller.
 * @returns {never} Lança sempre o erro normalizado.
 */
export function rethrowSubscriptionError(error) {
  if (error instanceof SimulatedSubscriptionPlanError) {
    throw httpError(error.status, error.code, error.message);
  }

  throw error;
}
```

5. Explicação do código.

O service valida primeiro o contexto obrigatório. A empresa vem do backend, o utilizador vem da sessão e o plano vem do body depois de normalizado pela rota.

A função `calculateSubscriptionCycleEnd` usa apenas `billingCycle` e `intervalCount`, que são os campos entregues pelo catálogo do `BK-MF8-03`. Assim, o BK atual não inventa outro contrato de plano.

O `upsert` usa `where: { companyId }` para respeitar a regra do `BK-MF8-04`: existe uma subscrição atual por empresa. Ao ativar outro plano, a linha existente é substituída em vez de duplicada.

O audit log grava apenas dados mínimos: empresa, utilizador, ação, entidade, id da entidade e o código do plano. Não guarda body completo nem dados de pagamento.

6. Validação do passo.

- Testar `monthly`: `billingCycle: "month"` e `intervalCount: 1`.
- Testar `yearly`: `billingCycle: "year"` e `intervalCount: 1`.
- Testar plano inexistente.
- Testar que a query Prisma usa a empresa ativa persistida.
- Testar que a auditoria recebe `companyId`, `userId`, `action`, `entity`, `entityId` e detalhes mínimos.
- O passo fica aceite quando o service ativa uma subscrição com `CompanySubscription`, calcula datas com o catálogo canónico, persiste `ACTIVE`, devolve `state: "active"` e regista auditoria mínima.

7. Cenário negativo/erro esperado.

- Usar `status: "active"` no Prisma deve falhar face ao enum esperado `ACTIVE`.
- Guardar mais do que uma linha atual para a mesma empresa quebra a regra `companyId @unique`.
- Calcular o fim do ciclo com um campo que o catálogo não possui deve ser tratado como erro de integração.
- Registar detalhes completos do pedido em auditoria deve ser evitado para não expor dados desnecessários.
- Misturar resposta pública da API com enum persistido torna o contrato instável para frontend e testes.

### Passo 4 - Implementar rota protegida

1. Objetivo funcional do passo no contexto da app.

Expor a ativação simulada por HTTP com autenticação, contexto multiempresa, role autorizada e validação de body.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/subscriptions/subscriptionRoutes.js`
    - REVER: `apps/api/src/modules/auth/authMiddleware.js`
    - REVER: `apps/api/src/modules/companies/companyContext.js`
    - REVER: `apps/api/src/modules/permissions/permissionMiddleware.js`

3. Instruções do que fazer.

Atualiza `subscriptionRoutes.js` para conter o código completo abaixo. Se o ficheiro já inclui as rotas do catálogo e da subscrição atual, mantém essas rotas e acrescenta a rota `POST /current/activate`.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Rotas HTTP para planos e subscrições simuladas.
 *
 * A rota de ativação aceita apenas a intenção do utilizador: o código do plano.
 * Autenticação, empresa ativa e role são resolvidas por middlewares do backend.
 */

import { Router } from "express";
import { httpError, toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import {
  SimulatedSubscriptionPlanError,
  getSimulatedSubscriptionPlan,
  listSimulatedSubscriptionPlans,
} from "./subscriptionPlans.js";
import {
  activateSimulatedSubscription,
  getCurrentSubscription,
  rethrowSubscriptionError,
} from "./subscriptionService.js";

const SUBSCRIPTION_ROLES = Object.freeze(["ADMIN", "GESTOR"]);

/**
 * Envia erros HTTP no formato estável da API.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {unknown} error - Erro capturado.
 * @returns {import("express").Response} Resposta JSON.
 */
function sendError(res, error) {
  const httpErrorResponse = toHttpError(error);
  return res.status(httpErrorResponse.status).json({
    error: httpErrorResponse.code,
    message: httpErrorResponse.message,
  });
}

/**
 * Normaliza erros do catálogo para resposta HTTP.
 *
 * @param {unknown} error - Erro capturado.
 * @returns {unknown} Erro normalizado para `sendError`.
 */
function normalizeSubscriptionError(error) {
  if (error instanceof SimulatedSubscriptionPlanError) {
    return httpError(error.status, error.code, error.message);
  }

  try {
    rethrowSubscriptionError(error);
  } catch (normalizedError) {
    return normalizedError;
  }

  return error;
}

/**
 * Lê o body da ativação e valida apenas o campo permitido.
 *
 * @param {unknown} body - Body JSON recebido.
 * @returns {{ planCode: string }} Dados normalizados para o service.
 */
function readActivationBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError(
      400,
      "INVALID_SUBSCRIPTION_ACTIVATION",
      "O pedido de ativação deve enviar um objeto JSON.",
    );
  }

  const { planCode } = body;
  if (typeof planCode !== "string" || planCode.trim().length === 0) {
    throw httpError(
      400,
      "INVALID_SUBSCRIPTION_ACTIVATION",
      "É obrigatório indicar um planCode válido.",
    );
  }

  return { planCode: planCode.trim() };
}

/**
 * Cria a sequência de middlewares usada pelas rotas protegidas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @returns {import("express").RequestHandler[]} Guards Express.
 */
function buildSubscriptionGuards(prisma) {
  return [
    // A ordem importa: primeiro identifica o utilizador, depois a empresa, só depois a role.
    requireAuth(prisma),
    requireCompanyContext(prisma),
    requireRole(...SUBSCRIPTION_ROLES),
  ];
}

/**
 * Constrói o router de subscrições simuladas.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, guards?: import("express").RequestHandler[] }} options - Dependências da rota.
 * @returns {Router} Router Express.
 */
export function buildSubscriptionRoutes(options) {
  const router = Router();
  const prisma = options.prisma;
  const protectedGuards = options.guards ?? buildSubscriptionGuards(prisma);

  router.get("/plans", (_req, res) => {
    return res.status(200).json({
      plans: listSimulatedSubscriptionPlans(),
    });
  });

  router.get("/plans/:code", (req, res) => {
    try {
      return res.status(200).json({
        plan: getSimulatedSubscriptionPlan(req.params.code),
      });
    } catch (error) {
      return sendError(res, normalizeSubscriptionError(error));
    }
  });

  router.get("/current", protectedGuards, async (req, res) => {
    try {
      const result = await getCurrentSubscription(prisma, {
        // req.companyId vem do middleware multiempresa, não de body ou query string.
        companyId: req.companyId,
      });

      return res.status(200).json(result);
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.post("/current/activate", protectedGuards, async (req, res) => {
    try {
      const body = readActivationBody(req.body);
      const result = await activateSimulatedSubscription(prisma, {
        // O cliente escolhe só o plano; empresa e utilizador vêm do contexto autenticado.
        companyId: req.companyId,
        userId: req.user.id,
        planCode: body.planCode,
      });

      return res.status(200).json(result);
    } catch (error) {
      return sendError(res, normalizeSubscriptionError(error));
    }
  });

  return router;
}
```

5. Explicação do código.

`buildSubscriptionGuards` reutiliza os middlewares existentes para sessão, empresa ativa e role. A rota não aceita empresa no body porque `req.companyId` já foi resolvido pelo backend.

`readActivationBody` valida apenas `planCode`. Se o body vier vazio, com array ou com tipo errado, a API responde `400`.

`POST /current/activate` chama o service com `companyId`, `userId` e `planCode`. Só `planCode` vem do cliente; os outros dois valores vêm do contexto autenticado.

6. Validação do passo.

- `GET /api/subscriptions/plans` continua a devolver o catálogo.
- `GET /api/subscriptions/current` continua a devolver a subscrição atual.
- `POST /api/subscriptions/current/activate` devolve `200` para role autorizada.
- `POST /api/subscriptions/current/activate` devolve `404` para plano inexistente.
- `POST /api/subscriptions/current/activate` devolve `403` para role sem acesso.
- O passo fica aceite quando a rota protegida chama o service sem receber ownership do frontend e com respostas estáveis para sucesso, validação, autorização e plano inexistente.

7. Cenário negativo/erro esperado.

- Montar a rota sem `requireCompanyContext` deve ser tratado como falha de segurança.
- Deixar `POST /current/activate` acessível a qualquer role autenticada deve devolver `403` nos testes.
- Ler dados de ownership a partir do body deve ser rejeitado pelo contrato da rota.
- Plano inexistente deve devolver erro funcional, não `500`.
- Criar rota diferente da documentada neste BK quebra frontend, testes e handoff.

### Passo 5 - Garantir montagem no servidor

1. Objetivo funcional do passo no contexto da app.

Confirmar que o router de subscrições continua montado em `/api/subscriptions`.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/server.js`

3. Instruções do que fazer.

Confirma que o servidor já monta as rotas de subscrição. Se essa montagem ainda não existir no teu projeto, acrescenta-a no ponto onde os restantes routers da API são ligados.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/server.js

import express from "express";
import { PrismaClient } from "@prisma/client";
import { buildSubscriptionRoutes } from "./modules/subscriptions/subscriptionRoutes.js";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
// O router fica sob o prefixo canónico para preservar os contratos dos BKs anteriores.
app.use("/api/subscriptions", buildSubscriptionRoutes({ prisma }));

export { app, prisma };
```

5. Explicação do código.

A rota documentada no Passo 4 fica pública como `/api/subscriptions/current/activate` porque o router é montado com o prefixo `/api/subscriptions` e a rota interna é `/current/activate`.

`express.json()` deve existir antes das rotas que leem body JSON. Sem isso, `req.body` não fica disponível para validação.

6. Validação do passo.

- Confirma que `GET /api/subscriptions/plans` continua acessível.
- Confirma que `POST /api/subscriptions/current/activate` chega ao router certo.
- Confirma que a API devolve `400` e não `500` quando o body é inválido.
- O passo fica aceite quando a rota nova responde no prefixo canónico `/api/subscriptions` e partilha o mesmo `PrismaClient` do servidor.

7. Cenário negativo/erro esperado.

- Montar o router duas vezes pode duplicar efeitos e deve ser evitado.
- Montar o router com prefixo diferente do usado pelos testes deve fazer os contratos HTTP falharem.
- Colocar `express.json()` depois das rotas deve deixar `req.body` indisponível.
- Criar outro `PrismaClient` dentro do router dificulta testes e gestão de ligações.

### Passo 6 - Criar testes contratuais da ativação

1. Objetivo funcional do passo no contexto da app.

Validar que a ativação funciona por HTTP e que os principais cenários negativos estão cobertos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/contracts/mf8-subscription-activation.contract.test.js`

3. Instruções do que fazer.

Cria o ficheiro de teste abaixo. Ele exercita a rota HTTP, a validação do plano, a role autorizada, a falta de empresa ativa e a persistência esperada.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Testes contratuais da ativação simulada de subscrição MF8.
 *
 * Estes testes usam dependências em memória para validar o contrato HTTP sem
 * depender de uma base de dados externa durante a verificação rápida.
 */

import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import express from "express";
import { buildSubscriptionRoutes } from "../../src/modules/subscriptions/subscriptionRoutes.js";

const COMPANY_ID = "company-001";
const USER_ID = "user-001";

/**
 * Cria uma implementação mínima do contrato Prisma usado pela rota.
 *
 * @returns {{ prisma: object, calls: object }} Cliente em memória e chamadas capturadas.
 */
function createInMemoryPrisma() {
  const calls = {
    upsert: [],
    audit: [],
  };

  // Guardamos as chamadas para provar que a rota usa a empresa ativa correta.
  const prisma = {
    companySubscription: {
      async findUnique() {
        return null;
      },
      async upsert(args) {
        calls.upsert.push(args);
        // A resposta simula a linha persistida que o service depois formata para a API.
        return {
          id: "subscription-001",
          companyId: args.create.companyId,
          planCode: args.create.planCode,
          status: args.create.status,
          startsAt: args.create.startsAt,
          endsAt: args.create.endsAt,
          simulated: args.create.simulated,
        };
      },
    },
    auditLog: {
      async create(args) {
        calls.audit.push(args);
        return { id: "audit-001", ...args.data };
      },
    },
    async $transaction(work) {
      return work(this);
    },
  };

  return { prisma, calls };
}

/**
 * Cria guard de sucesso com sessão, utilizador, empresa e role.
 *
 * @returns {import("express").RequestHandler} Middleware Express.
 */
function allowAsManager() {
  return function allowedGuard(req, _res, next) {
    // O guard simula o que os middlewares reais já teriam colocado no request.
    req.user = { id: USER_ID };
    req.companyId = COMPANY_ID;
    req.role = "GESTOR";
    return next();
  };
}

/**
 * Cria guard que simula role sem acesso funcional.
 *
 * @returns {import("express").RequestHandler} Middleware Express.
 */
function denyRole() {
  return function deniedGuard(_req, res) {
    return res.status(403).json({
      error: "ROLE_FORBIDDEN",
      message: "Papel sem acesso a esta operação",
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
 * @param {object} prisma - Cliente Prisma ou equivalente de teste.
 * @param {import("express").RequestHandler[]} guards - Guards a usar no router.
 * @returns {Promise<{ baseUrl: string, close: () => Promise<void> }>} Cliente HTTP mínimo.
 */
async function createHttpServer(prisma, guards) {
  const app = express();
  app.use(express.json());
  app.use("/api/subscriptions", buildSubscriptionRoutes({ prisma, guards }));

  // A porta dinâmica evita conflitos locais quando a suite corre em paralelo.
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

test("POST /api/subscriptions/current/activate ativa plano mensal para a empresa ativa", async () => {
  const { prisma, calls } = createInMemoryPrisma();
  const server = await createHttpServer(prisma, [allowAsManager()]);

  try {
    // O pedido envia só o plano; empresa e utilizador são injetados pelo guard.
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/activate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planCode: "monthly" }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.active, true);
    assert.equal(body.state, "active");
    assert.equal(body.subscription.planCode, "monthly");
    assert.equal(body.subscription.status, "ACTIVE");
    assert.equal(body.subscription.simulated, true);

    assert.equal(calls.upsert.length, 1);
    assert.deepEqual(calls.upsert[0].where, { companyId: COMPANY_ID });
    assert.equal(calls.upsert[0].create.companyId, COMPANY_ID);
    assert.equal(calls.upsert[0].create.status, "ACTIVE");

    assert.equal(calls.audit.length, 1);
    assert.equal(calls.audit[0].data.companyId, COMPANY_ID);
    assert.equal(calls.audit[0].data.userId, USER_ID);
    assert.equal(calls.audit[0].data.action, "subscription.activate");
    assert.equal(calls.audit[0].data.details.planCode, "monthly");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/activate rejeita plano inexistente", async () => {
  const { prisma } = createInMemoryPrisma();
  const server = await createHttpServer(prisma, [allowAsManager()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/activate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planCode: "enterprise" }),
    });
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.error, "SUBSCRIPTION_PLAN_NOT_FOUND");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/activate rejeita body sem planCode", async () => {
  const { prisma } = createInMemoryPrisma();
  const server = await createHttpServer(prisma, [allowAsManager()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/activate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, "INVALID_SUBSCRIPTION_ACTIVATION");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/activate bloqueia role sem acesso", async () => {
  const { prisma } = createInMemoryPrisma();
  const server = await createHttpServer(prisma, [denyRole()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/activate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planCode: "monthly" }),
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(body.error, "ROLE_FORBIDDEN");
  } finally {
    await server.close();
  }
});

test("POST /api/subscriptions/current/activate exige empresa ativa", async () => {
  const { prisma } = createInMemoryPrisma();
  const server = await createHttpServer(prisma, [withoutCompany()]);

  try {
    const response = await fetch(`${server.baseUrl}/api/subscriptions/current/activate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planCode: "monthly" }),
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

Os testes sobem uma app Express real em porta dinâmica para validar o contrato HTTP. A dependência de dados em memória implementa só as operações Prisma usadas pelo service, o que torna o teste rápido e focado na fronteira do BK.

O primeiro teste prova o cenário feliz: role autorizada, plano válido, upsert por empresa ativa, estado `ACTIVE`, resposta pública `active` e auditoria mínima.

Os restantes testes cobrem negativos P0: plano inexistente, body inválido, role bloqueada e ausência de empresa ativa.

6. Validação do passo.

Executa no diretório `apps/api`:

```bash
npm run syntax:check
npm run test:contracts
```

Se o ambiente local bloquear portas de teste, regista o erro completo em evidence e confirma pelo menos `npm run syntax:check`.
- O passo fica aceite quando os testes demonstram ativação real pelo endpoint e pelo menos três cenários negativos relevantes para prioridade `P0`.

7. Cenário negativo/erro esperado.

- Testar apenas a função do service não prova o contrato HTTP.
- Validar só o catálogo não prova a ativação.
- Não verificar `upsert.where` deixa o risco multiempresa sem cobertura.
- Não testar autorização deixa a rota sensível sem prova de bloqueio.
- Não testar body inválido deixa a validação backend sem evidência.

### Passo 7 - Registar evidence do BK

1. Objetivo funcional do passo no contexto da app.

Guardar prova objetiva do que foi validado para facilitar revisão final da PAP.

2. Ficheiros envolvidos:
    - CRIAR OU EDITAR: `docs/evidence/MF8/BK-MF8-05.md`

3. Instruções do que fazer.

Cria ou atualiza a evidence com resultados reais. Não marques comandos como aprovados se não foram executados.

4. Código completo, correto e integrado com a app final.

```md
# Evidence - BK-MF8-05

## Escopo validado

- Endpoint: `POST /api/subscriptions/current/activate`
- Requisito: `RF50`
- Sem pagamento real: confirmado
- Roles autorizadas: `ADMIN`, `GESTOR`
- Empresa ativa: resolvida no backend

## Comandos executados

| Comando | Resultado | Observações |
| --- | --- | --- |
| `npm run syntax:check` | PASS/FAIL | Registar output relevante. |
| `npm run test:contracts` | PASS/FAIL | Registar output relevante. |

## Cenários verificados

| Cenário | Resultado |
| --- | --- |
| Plano mensal ativa subscrição simulada | PASS/FAIL |
| Plano inexistente devolve erro funcional | PASS/FAIL |
| Body sem `planCode` devolve erro de validação | PASS/FAIL |
| Role não autorizada devolve `403` | PASS/FAIL |
| Falta de empresa ativa devolve `403` | PASS/FAIL |

## Notas

- Registar qualquer falha ambiental com mensagem completa.
- Separar falha de ambiente de falha funcional da app.
- Não inventar outputs.
```

5. Explicação do código.

A evidence não é decoração: é o registo que permite perceber se a entrega foi validada, parcialmente validada ou bloqueada por ambiente.

6. Validação do passo.

- A evidence referencia `BK-MF8-05`.
- A evidence distingue comandos executados de comandos não executados.
- A evidence inclui negativos de autorização e validação.
- O passo fica aceite quando a evidence permite a outro colega perceber exatamente o que passou, o que falhou e que impacto isso tem.

7. Cenário negativo/erro esperado.

- Escrever `PASS` sem executar o comando torna a evidence falsa.
- Apagar falhas ambientais em vez de as documentar impede a revisão.
- Misturar evidência de outro BK reduz a rastreabilidade.
- Não indicar o endpoint validado torna a prova insuficiente.

### Passo 8 - Fechar handoff para BK-MF8-06

1. Objetivo funcional do passo no contexto da app.

Deixar claro o que o próximo BK pode reutilizar para ciclo de vida da subscrição.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/BK-MF8-05.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-06-renovacao-cancelamento-e-reativacao-simuladas.md`

3. Instruções do que fazer.

No fecho da evidence, regista o contrato final entregue:

- `CompanySubscription` continua a ser o modelo único;
- `companyId` continua a identificar a empresa persistida;
- `planCode` continua a vir do catálogo;
- `status` persistido usa `ACTIVE`, `CANCELLED`, `EXPIRED`;
- resposta pública usa `state`;
- `startsAt` e `endsAt` ficam calculados no backend;
- auditoria usa `subscription.activate`;
- o próximo BK pode trabalhar cancelamento, expiração e transições.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo. O fecho é de integração e documentação da passagem para o próximo BK.

5. Explicação do código.

O `BK-MF8-06` não deve voltar a decidir como se ativa uma subscrição. Ele deve partir do contrato entregue aqui e acrescentar regras de ciclo de vida.

6. Validação do passo.

- Confirma que a rota de ativação existe antes de iniciar o próximo BK.
- Confirma que a subscrição ativa tem `startsAt` e `endsAt`.
- Confirma que a auditoria identifica `subscription.activate`.
- Confirma que nenhum pagamento real foi introduzido.
- O BK fica fechado quando a ativação simulada está implementada, testada, documentada em evidence e pronta para o ciclo de vida do `BK-MF8-06`.

7. Cenário negativo/erro esperado.

- Mudar estados no próximo BK sem respeitar o enum já usado deve ser tratado como drift.
- Recalcular ownership no frontend deve ser rejeitado como erro multiempresa.
- Criar nova rota de ativação quando já existe contrato para isso deve ser evitado.
- Tratar cancelamento como pagamento real está fora do escopo das subscrições simuladas.

#### Critérios de aceite

- `POST /api/subscriptions/current/activate` existe e está protegido.
- O body da ativação aceita apenas `planCode`.
- A empresa ativa vem do backend.
- O plano é validado contra o catálogo de `BK-MF8-03`.
- O ciclo usa `billingCycle` e `intervalCount`.
- A persistência usa `CompanySubscription` e `companyId`.
- O estado persistido usa `ACTIVE`.
- A resposta pública devolve `state: "active"` no cenário feliz.
- A auditoria regista `subscription.activate` com detalhes mínimos.
- Existem testes positivos e negativos.
- Não existe pagamento real, checkout, recibo ou fatura.

#### Validação final

Executa no diretório `apps/api`:

```bash
npm run syntax:check
npm run test:contracts
```

Depois executa na raiz do projeto:

```bash
git diff --check
```

Resultado esperado:

- `npm run syntax:check` termina sem erros de sintaxe.
- `npm run test:contracts` valida o contrato HTTP da ativação e os negativos principais.
- `git diff --check` não reporta whitespace errors.

#### Evidence para PR/defesa

No PR ou na defesa, inclui:

- caminho do service alterado;
- caminho da rota alterada;
- caminho do teste criado;
- output real de `npm run syntax:check`;
- output real de `npm run test:contracts`;
- confirmação de que não existe pagamento real;
- confirmação de que a empresa ativa vem do backend;
- confirmação de que o próximo BK é `BK-MF8-06`.

#### Handoff

- Próximo BK recomendado: `BK-MF8-06`

O próximo BK deve reutilizar:

- `CompanySubscription`;
- `companyId`;
- `planCode`;
- `status`;
- `startsAt`;
- `endsAt`;
- `simulated`;
- `getCurrentSubscription`;
- `assertSubscriptionBelongsToActiveCompany`;
- `activateSimulatedSubscription`;
- `POST /api/subscriptions/current/activate`;
- `subscription.activate` em auditoria;
- o catálogo `monthly`, `quarterly` e `yearly`;
- os campos `billingCycle` e `intervalCount` vindos do catálogo.

O `BK-MF8-06` deve tratar ciclo de vida e transições da subscrição simulada sem criar outro modelo, outro catálogo ou pagamento real.

#### Changelog

- 2026-07-02: Normalizada a estrutura obrigatória do guia, corrigido o path do BK-MF8-06 e acrescentados comentários didáticos internos nos blocos longos.
- 2026-07-01: Corrigido o contrato técnico da ativação simulada para reutilizar `companyId`, `billingCycle`, `intervalCount`, rota protegida, auditoria e testes contratuais completos.
- 2026-06-30: Guia inicial criado para ativação simulada de subscrição.
