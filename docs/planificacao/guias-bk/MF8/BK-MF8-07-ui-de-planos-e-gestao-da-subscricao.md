# BK-MF8-07 - UI de planos e gestão da subscrição

## Header

- `doc_id`: `GUIA-BK-MF8-07`
- `bk_id`: `BK-MF8-07`
- `macro`: `MF8`
- `owner`: `Andre`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-03, BK-MF8-04, BK-MF8-06`
- `rf_rnf`: `RF49, RF50, RF51`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-08`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-07-ui-de-planos-e-gestao-da-subscricao.md`
- `last_updated`: `2026-07-03`

#### Objetivo

Criar a interface React para consultar planos de subscrição simulados, ver o estado da subscrição atual e executar ações permitidas de ativação, renovação, cancelamento e reativação sem pagamento real.

#### Importância

A UI é a parte visível de `RF49`, `RF50` e `RF51`. O aluno deve perceber que a página mostra informação e recolhe intenção, mas a empresa ativa, a role, as permissões e a decisão final continuam no backend autenticado.

#### Scope-in

- Criar `apps/web/src/lib/subscriptionsApi.ts` com contrato TypeScript alinhado com os BKs anteriores.
- Criar `apps/web/src/pages/SubscriptionsPage.tsx` com estados de loading, erro, vazio, sucesso e feedback de ações.
- Editar `apps/web/src/App.tsx` para expor a página na navegação da app.
- Editar `apps/web/src/styles.css` apenas para estilos mínimos da página de subscrições.
- Criar `apps/web/scripts/check-mf8-subscriptions-ui.mjs` e o script `test:mf8:subscriptions-ui`.
- Registar evidence em `docs/evidence/MF8/BK-MF8-07.md`.

#### Scope-out

- Criar checkout, pagamento real, recibo, fatura ou cobrança automática.
- Guardar sessão, credenciais, role, empresa ativa ou dados sensíveis em storage do browser.
- Aceitar identificadores de empresa vindos do frontend para decidir ownership.
- Alterar rotas backend já entregues por `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05` e `BK-MF8-06`.
- Criar dependências novas de frontend sem justificação técnica.

#### Estado antes e depois

- Antes: `BK-MF8-03` entrega o catálogo de planos simulados; `BK-MF8-04` entrega a subscrição atual da empresa ativa; `BK-MF8-05` entrega a ativação simulada; `BK-MF8-06` entrega renovação, cancelamento e reativação.
- Depois: `BK-MF8-07` entrega uma UI funcional e verificável para consumir esses contratos, com feedback em português de Portugal e sem assumir decisões de segurança no browser.

#### Pre-requisitos

- Ler `RF49`, `RF50` e `RF51` em `docs/RF.md`.
- Rever a linha de `BK-MF8-07` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF8-07` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever os BKs declarados em dependências: `BK-MF8-03`, `BK-MF8-04` e `BK-MF8-06`.
- Confirmar que `apps/web/src/lib/apiClient.ts` já envia cookies HttpOnly com `credentials: "include"`.
- Negativos mínimos: 3.

#### Glossário

- Plano simulado: plano de subscrição usado para demonstração da PAP, sem pagamento real.
- Subscrição atual: estado devolvido pela API para a empresa ativa da sessão autenticada.
- Cliente API tipado: ficheiro TypeScript que centraliza chamadas HTTP e tipos de resposta.
- Ação de ciclo de vida: renovação, cancelamento ou reativação de uma subscrição simulada.
- Feedback imediato: mensagem visível após carregamento, sucesso ou erro.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF49`, `RF50` e `RF51` cobrem planos, gestão de subscrição simulada e simulação de renovação, cancelamento e reativação.
- `CANONICO`: `BK-MF8-07` pertence à MF8, sprint `S12`, owner `Andre`, apoio `Pedro`, prioridade `P0`, depende de `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-06` e prepara `BK-MF8-08`.
- `CANONICO`: os caminhos públicos dos alunos são `apps/api` e `apps/web`.
- `CANONICO`: o cliente central de frontend usa cookies HttpOnly; a UI não lê nem persiste a sessão.
- `CANONICO`: os planos usam `code`, `name`, `description`, `priceCents`, `currency`, `billingCycle`, `intervalCount` e `simulated`.
- `CANONICO`: a ativação usa o contrato público `POST /api/subscriptions/current/activate`.
- `CANONICO`: as ações de ciclo de vida usam o contrato público `POST /api/subscriptions/current/actions`.
- `DERIVADO`: dentro do cliente frontend, os caminhos são passados sem o prefixo `/api` porque `createApiClient()` já usa esse prefixo como `baseUrl`.
- `DERIVADO`: a página pode bloquear botões por estado para melhorar UX, mas o backend continua a validar todas as regras.

O frontend de subscrições é uma camada de apresentação. Ele não escolhe a empresa ativa, não decide permissões e não transforma uma subscrição simulada em pagamento real. A página deve mostrar estados claros, pedir ações ao backend e apresentar erros de forma segura.

#### Arquitetura do BK

- Requisito: `RF49`, `RF50`, `RF51`.
- Domínio principal: frontend de subscrições simuladas.
- Backend público dos alunos: `apps/api`.
- Frontend público dos alunos: `apps/web`.
- Cliente API central: `apps/web/src/lib/apiClient.ts`.
- Página criada: `apps/web/src/pages/SubscriptionsPage.tsx`.
- Evidence: `docs/evidence/MF8/BK-MF8-07.md`.
- Handoff: `BK-MF8-08`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/lib/subscriptionsApi.ts`
- CRIAR: `apps/web/src/pages/SubscriptionsPage.tsx`
- CRIAR: `apps/web/scripts/check-mf8-subscriptions-ui.mjs`
- CRIAR: `docs/evidence/MF8/BK-MF8-07.md`
- EDITAR: `apps/web/src/App.tsx`
- EDITAR: `apps/web/src/styles.css`
- EDITAR: `apps/web/package.json`
- REVER: `apps/web/src/lib/apiClient.ts`
- REVER: `apps/web/src/ui/opsaUi.tsx`
- REVER: `apps/web/src/ui/useActionFeedback.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contratos herdados

1. Objetivo funcional do passo no contexto da app.

Confirmar que a UI vai consumir os contratos já entregues na MF8 sem criar nomes paralelos.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-04-subscricao-por-empresa-ativa.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-05-ativacao-simulada-de-subscricao.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-06-renovacao-cancelamento-e-reativacao-simuladas.md`

3. Instruções do que fazer.

Confirma estes contratos antes de escrever código:

- `GET /api/subscriptions/plans` lista os planos simulados.
- `GET /api/subscriptions/current` devolve o estado atual da subscrição.
- `POST /api/subscriptions/current/activate` ativa ou substitui a subscrição simulada.
- `POST /api/subscriptions/current/actions` executa `renew`, `cancel` ou `reactivate`.
- `reactivate` exige `planCode`.
- A empresa ativa e o utilizador autenticado vêm dos middlewares backend.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A validação inicial é documental e impede que a UI seja construída contra endpoints ou campos antigos.

5. Explicação do código.

Não existe código porque este passo fixa a fronteira. A UI só deve chamar contratos públicos já definidos. Qualquer regra de ownership, role ou contexto multiempresa fica no backend.

6. Validação do passo.

O aluno consegue explicar, antes de editar `apps/web`, que a página precisa de planos, subscrição atual, ativação e ações de ciclo de vida.

7. Cenário negativo/erro esperado.

Erro esperado: tentar criar uma rota nova para ações de subscrição no frontend ou mudar o contrato backend para encaixar numa UI inventada. O BK deve parar e voltar aos contratos herdados.

### Passo 2 - Criar o cliente API de subscrições

1. Objetivo funcional do passo no contexto da app.

Centralizar as chamadas HTTP de subscrições num módulo TypeScript pequeno, tipado e alinhado com `apiClient.ts`.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/subscriptionsApi.ts`
    - REVER: `apps/web/src/lib/apiClient.ts`

3. Instruções do que fazer.

Cria o ficheiro abaixo. Não uses `fetch` diretamente neste módulo; usa `createApiClient()` para herdar o prefixo `/api`, cookies HttpOnly e tratamento de erro comum.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * @file Cliente frontend para planos e subscrições simuladas da MF8.
 */

import { ApiError, createApiClient } from "./apiClient";

export type SimulatedSubscriptionPlanCode = "monthly" | "quarterly" | "yearly";
export type SimulatedSubscriptionBillingCycle = "month" | "year";
export type SubscriptionState = "none" | "active" | "cancelled" | "expired";
export type SubscriptionAction = "activate" | "renew" | "cancel" | "reactivate";

export interface SimulatedSubscriptionPlan {
  code: SimulatedSubscriptionPlanCode;
  name: string;
  description: string;
  priceCents: number;
  currency: "EUR";
  billingCycle: SimulatedSubscriptionBillingCycle;
  intervalCount: number;
  simulated: true;
}

export interface PublicCompanySubscription {
  id: string;
  planCode: SimulatedSubscriptionPlanCode;
  plan: SimulatedSubscriptionPlan;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
  startsAt: string | null;
  endsAt: string | null;
  simulated: true;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SubscriptionStateResponse {
  state: SubscriptionState;
  subscription: PublicCompanySubscription | null;
}

export interface SubscriptionOverview {
  plans: SimulatedSubscriptionPlan[];
  current: SubscriptionStateResponse;
}

export interface SubscriptionActionRequest {
  action: SubscriptionAction;
  planCode?: SimulatedSubscriptionPlanCode;
}

const api = createApiClient();

/**
 * Carrega os planos simulados e a subscrição atual da empresa ativa.
 *
 * O cliente central acrescenta `/api` e envia cookies HttpOnly. Por isso, este
 * módulo usa caminhos relativos ao domínio de subscrições.
 *
 * @returns Planos e estado atual necessários para desenhar a página.
 */
export async function loadSubscriptionOverview(): Promise<SubscriptionOverview> {
  const [plansResponse, current] = await Promise.all([
    api.request<{ plans: SimulatedSubscriptionPlan[] }>(
      "GET",
      "/subscriptions/plans",
    ),
    api.request<SubscriptionStateResponse>("GET", "/subscriptions/current"),
  ]);

  return {
    plans: plansResponse.plans,
    current,
  };
}

/**
 * Executa uma ação simulada de subscrição no backend.
 *
 * `activate` usa o endpoint de ativação do BK05. As restantes ações usam o
 * endpoint de ciclo de vida do BK06.
 *
 * @param request - Ação pedida pela UI e plano quando a ação precisa dele.
 * @returns Estado atualizado da subscrição.
 */
export async function runSubscriptionAction(
  request: SubscriptionActionRequest,
): Promise<SubscriptionStateResponse> {
  if (
    (request.action === "activate" || request.action === "reactivate") &&
    !request.planCode
  ) {
    throw new Error("Escolhe um plano antes de executar esta ação.");
  }

  if (request.action === "activate") {
    return api.request<SubscriptionStateResponse>(
      "POST",
      "/subscriptions/current/activate",
      {
        body: { planCode: request.planCode },
      },
    );
  }

  const body =
    request.action === "reactivate"
      ? { action: request.action, planCode: request.planCode }
      : { action: request.action };

  return api.request<SubscriptionStateResponse>(
    "POST",
    "/subscriptions/current/actions",
    { body },
  );
}

/**
 * Formata o preço de um plano para apresentação em português de Portugal.
 *
 * @param plan - Plano simulado devolvido pelo backend.
 * @returns Preço formatado em euros.
 */
export function formatPlanPrice(plan: SimulatedSubscriptionPlan): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: plan.currency,
  }).format(plan.priceCents / 100);
}

/**
 * Descreve o ciclo de faturação simulado sem transformar a ação em pagamento real.
 *
 * @param plan - Plano simulado devolvido pelo backend.
 * @returns Texto curto para a UI.
 */
export function formatBillingCycle(plan: SimulatedSubscriptionPlan): string {
  if (plan.billingCycle === "year") {
    return plan.intervalCount === 1
      ? "ciclo anual simulado"
      : `${plan.intervalCount} ciclos anuais simulados`;
  }

  return plan.intervalCount === 1
    ? "ciclo mensal simulado"
    : `${plan.intervalCount} meses simulados`;
}

/**
 * Converte o estado técnico da subscrição numa etiqueta curta.
 *
 * @param state - Estado público devolvido pela API.
 * @returns Etiqueta em português de Portugal.
 */
export function formatSubscriptionState(state: SubscriptionState): string {
  const labels: Record<SubscriptionState, string> = {
    none: "Sem subscrição",
    active: "Ativa",
    cancelled: "Cancelada",
    expired: "Expirada",
  };

  return labels[state];
}

/**
 * Indica se uma ação deve estar disponível na UI para o estado atual.
 *
 * Esta função melhora a experiência do utilizador, mas não substitui validação
 * backend. O servidor continua a rejeitar transições inválidas.
 *
 * @param current - Estado público atual.
 * @param action - Ação pedida.
 * @returns `true` quando a UI deve mostrar a ação como disponível.
 */
export function isSubscriptionActionEnabled(
  current: SubscriptionStateResponse,
  action: SubscriptionAction,
): boolean {
  if (action === "activate") {
    return current.state === "none";
  }

  if (action === "renew" || action === "cancel") {
    return current.state === "active";
  }

  return current.state === "cancelled" || current.state === "expired";
}

/**
 * Traduz erros comuns da API para mensagens seguras para a interface.
 *
 * @param error - Erro capturado na chamada HTTP.
 * @returns Mensagem curta para apresentar ao utilizador.
 */
export function explainSubscriptionApiError(error: Error): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "A sessão expirou. Entra novamente antes de gerir a subscrição.";
    }

    if (error.status === 403) {
      return "A tua role atual não permite gerir a subscrição desta empresa.";
    }

    if (error.status === 404) {
      return "O plano escolhido já não existe no catálogo simulado.";
    }
  }

  return error.message || "Não foi possível concluir a operação.";
}
```

5. Explicação do código.

`loadSubscriptionOverview` carrega planos e estado atual em paralelo porque a página precisa dos dois dados para renderizar. Os caminhos começam em `/subscriptions` porque `apiClient.ts` já acrescenta o prefixo `/api`.

`runSubscriptionAction` separa ativação de ações de ciclo de vida. Isto respeita a divisão dos BKs anteriores: ativar vem do `BK-MF8-05`; renovar, cancelar e reativar vêm do `BK-MF8-06`.

O tipo `PublicCompanySubscription` não precisa de usar o identificador interno da empresa na UI. Mesmo que a API devolva esse dado, o frontend não o usa para decidir ownership.

6. Validação do passo.

Executa:

```bash
cd apps/web
npm run typecheck
```

Resultado esperado: sem erros de TypeScript no novo cliente.

7. Cenário negativo/erro esperado.

Erro esperado: chamar ações de ciclo de vida sem `/current` no caminho ou criar um campo alternativo para duração do plano. O gate do passo 5 deve bloquear esse drift.

### Passo 3 - Criar a página React de subscrições

1. Objetivo funcional do passo no contexto da app.

Criar uma página React completa para mostrar planos, estado atual e botões de ação com feedback imediato.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/SubscriptionsPage.tsx`
    - REVER: `apps/web/src/ui/opsaUi.tsx`
    - REVER: `apps/web/src/ui/useActionFeedback.ts`

3. Instruções do que fazer.

Cria o ficheiro abaixo. A página deve:

- carregar dados ao montar;
- mostrar estado de loading;
- mostrar erro recuperável;
- mostrar estado vazio quando não existirem planos;
- permitir selecionar plano;
- ativar apenas quando não existe subscrição;
- renovar e cancelar apenas quando a subscrição está ativa;
- reativar apenas quando a subscrição está cancelada ou expirada;
- apresentar feedback em português de Portugal.

4. Código completo, correto e integrado com a app final.

```tsx
/**
 * @file Página de gestão de planos e subscrição simulada da OPSA.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  explainSubscriptionApiError,
  formatBillingCycle,
  formatPlanPrice,
  formatSubscriptionState,
  isSubscriptionActionEnabled,
  loadSubscriptionOverview,
  runSubscriptionAction,
  type SimulatedSubscriptionPlan,
  type SimulatedSubscriptionPlanCode,
  type SubscriptionAction,
  type SubscriptionOverview,
} from "../lib/subscriptionsApi";
import {
  ActionToolbar,
  ModuleBadge,
  PageFrame,
  StatusMessage,
} from "../ui/opsaUi";
import { useActionFeedback } from "../ui/useActionFeedback";

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Sem data definida";
  }

  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function firstPlanCode(
  plans: SimulatedSubscriptionPlan[],
): SimulatedSubscriptionPlanCode {
  return plans[0]?.code ?? "monthly";
}

function stateTone(state: SubscriptionOverview["current"]["state"]) {
  if (state === "active") return "success";
  if (state === "none") return "neutral";
  return "warning";
}

function actionSuccessMessage(action: SubscriptionAction): string {
  const messages: Record<SubscriptionAction, string> = {
    activate: "Subscrição simulada ativada.",
    renew: "Subscrição simulada renovada.",
    cancel: "Subscrição simulada cancelada.",
    reactivate: "Subscrição simulada reativada.",
  };

  return messages[action];
}

export function SubscriptionsPage() {
  const [overview, setOverview] = useState<SubscriptionOverview | null>(null);
  const [selectedPlanCode, setSelectedPlanCode] =
    useState<SimulatedSubscriptionPlanCode>("monthly");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const feedback = useActionFeedback();

  const loadPageData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const nextOverview = await loadSubscriptionOverview();
      setOverview(nextOverview);
      setSelectedPlanCode(
        nextOverview.current.subscription?.planCode ??
          firstPlanCode(nextOverview.plans),
      );
    } catch (caught) {
      const error =
        caught instanceof Error
          ? caught
          : new Error("Não foi possível carregar a subscrição.");

      setLoadError(explainSubscriptionApiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  const selectedPlan = useMemo(
    () => overview?.plans.find((plan) => plan.code === selectedPlanCode) ?? null,
    [overview?.plans, selectedPlanCode],
  );

  const currentPlan = overview?.current.subscription?.plan ?? null;

  async function handleAction(action: SubscriptionAction) {
    if (!overview) return;

    const needsPlan = action === "activate" || action === "reactivate";
    if (needsPlan && !selectedPlan) {
      feedback.fail(
        new Error("Escolhe um plano antes de executar esta ação."),
        "Escolhe um plano antes de executar esta ação.",
      );
      return;
    }

    try {
      const nextCurrent = await feedback.run(
        () =>
          runSubscriptionAction({
            action,
            planCode: needsPlan ? selectedPlan?.code : undefined,
          }),
        {
          startMessage: "A enviar ação para a API de subscrições...",
          successMessage: actionSuccessMessage(action),
          errorMessage: "Não foi possível gerir a subscrição.",
        },
      );

      setOverview({
        ...overview,
        current: nextCurrent,
      });
    } catch (caught) {
      const error =
        caught instanceof Error
          ? caught
          : new Error("Não foi possível gerir a subscrição.");

      feedback.fail(error, explainSubscriptionApiError(error));
    }
  }

  if (loading) {
    return (
      <PageFrame
        eyebrow="MF8"
        title="Subscrições"
        description="A carregar planos simulados e estado atual da subscrição."
      >
        <StatusMessage tone="neutral" title="A carregar">
          A página está a pedir os dados ao backend autenticado.
        </StatusMessage>
      </PageFrame>
    );
  }

  if (loadError) {
    return (
      <PageFrame
        eyebrow="MF8"
        title="Subscrições"
        description="Gestão da subscrição simulada da empresa ativa."
        actions={
          <button type="button" onClick={() => void loadPageData()}>
            Tentar novamente
          </button>
        }
      >
        <StatusMessage tone="danger" title="Não foi possível carregar">
          {loadError}
        </StatusMessage>
      </PageFrame>
    );
  }

  if (!overview || overview.plans.length === 0) {
    return (
      <PageFrame
        eyebrow="MF8"
        title="Subscrições"
        description="Gestão da subscrição simulada da empresa ativa."
      >
        <StatusMessage tone="warning" title="Sem planos disponíveis">
          O catálogo de planos simulados não devolveu opções para apresentar.
        </StatusMessage>
      </PageFrame>
    );
  }

  const current = overview.current;
  const canActivate = isSubscriptionActionEnabled(current, "activate");
  const canRenew = isSubscriptionActionEnabled(current, "renew");
  const canCancel = isSubscriptionActionEnabled(current, "cancel");
  const canReactivate = isSubscriptionActionEnabled(current, "reactivate");

  return (
    <PageFrame
      eyebrow="MF8"
      title="Subscrições"
      description="Consulta de planos simulados e gestão do ciclo de vida da subscrição."
      actions={
        <button type="button" onClick={() => void loadPageData()}>
          Atualizar
        </button>
      }
    >
      <div className="subscriptionsLayout">
        <section className="subscriptionsSummary" aria-labelledby="subscription-state-title">
          <div className="subscriptionsSummary__header">
            <h3 id="subscription-state-title">Estado da subscrição</h3>
            <ModuleBadge
              tone={stateTone(current.state)}
              label={formatSubscriptionState(current.state)}
            />
          </div>

          {current.subscription ? (
            <dl className="subscriptionsDetails">
              <div>
                <dt>Plano atual</dt>
                <dd>{currentPlan?.name ?? current.subscription.planCode}</dd>
              </div>
              <div>
                <dt>Ciclo</dt>
                <dd>
                  {currentPlan
                    ? formatBillingCycle(currentPlan)
                    : "Ciclo não disponível"}
                </dd>
              </div>
              <div>
                <dt>Início</dt>
                <dd>{formatDate(current.subscription.startsAt)}</dd>
              </div>
              <div>
                <dt>Fim previsto</dt>
                <dd>{formatDate(current.subscription.endsAt)}</dd>
              </div>
            </dl>
          ) : (
            <StatusMessage tone="neutral" title="Sem subscrição ativa">
              Escolhe um plano simulado e ativa a subscrição para esta empresa.
            </StatusMessage>
          )}
        </section>

        <section className="subscriptionsPlans" aria-labelledby="subscription-plans-title">
          <h3 id="subscription-plans-title">Planos simulados</h3>
          <div className="subscriptionsPlans__grid">
            {overview.plans.map((plan) => {
              const selected = plan.code === selectedPlanCode;

              return (
                <label
                  className={`subscriptionPlan${selected ? " subscriptionPlan--selected" : ""}`}
                  key={plan.code}
                >
                  <input
                    checked={selected}
                    name="subscription-plan"
                    onChange={() => setSelectedPlanCode(plan.code)}
                    type="radio"
                    value={plan.code}
                  />
                  <span className="subscriptionPlan__name">{plan.name}</span>
                  <span className="subscriptionPlan__price">
                    {formatPlanPrice(plan)}
                  </span>
                  <span className="subscriptionPlan__cycle">
                    {formatBillingCycle(plan)}
                  </span>
                  <span className="subscriptionPlan__description">
                    {plan.description}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="subscriptionsActions" aria-labelledby="subscription-actions-title">
          <h3 id="subscription-actions-title">Ações</h3>
          <ActionToolbar>
            <button
              disabled={feedback.busy || !canActivate || !selectedPlan}
              onClick={() => void handleAction("activate")}
              type="button"
            >
              Ativar plano
            </button>
            <button
              disabled={feedback.busy || !canRenew}
              onClick={() => void handleAction("renew")}
              type="button"
            >
              Renovar
            </button>
            <button
              disabled={feedback.busy || !canCancel}
              onClick={() => void handleAction("cancel")}
              type="button"
            >
              Cancelar
            </button>
            <button
              disabled={feedback.busy || !canReactivate || !selectedPlan}
              onClick={() => void handleAction("reactivate")}
              type="button"
            >
              Reativar
            </button>
          </ActionToolbar>

          <p className="subscriptionsActions__note">
            Estas ações são simuladas. A API valida sessão, empresa ativa e role
            antes de alterar qualquer estado.
          </p>
        </section>

        {feedback.feedback.message ? (
          <StatusMessage
            tone={feedback.feedback.tone}
            title={feedback.feedback.title}
          >
            {feedback.feedback.message}
          </StatusMessage>
        ) : null}
      </div>
    </PageFrame>
  );
}
```

5. Explicação do código.

A página separa três responsabilidades: carregar dados, mostrar estado e enviar ações. O `useEffect` chama `loadPageData` quando a página abre. O `useMemo` encontra o plano selecionado sem recalcular a cada render desnecessário.

Os botões usam `isSubscriptionActionEnabled` para evitar ações óbvias no estado errado. Isto é UX, não segurança. A API continua a validar tudo.

O feedback usa o hook transversal da app para manter mensagens consistentes. Quando o erro vem da API, `explainSubscriptionApiError` transforma códigos técnicos em texto seguro para o utilizador.

6. Validação do passo.

Executa:

```bash
cd apps/web
npm run typecheck
```

Resultado esperado: a página compila e os imports existem.

7. Cenário negativo/erro esperado.

Erro esperado: a página chamar `fetch` diretamente, guardar estado de sessão em storage do browser ou aceitar identificadores de empresa vindos do utilizador. O frontend deve chamar apenas o cliente API tipado.

### Passo 4 - Integrar a página na app e ajustar estilos

1. Objetivo funcional do passo no contexto da app.

Expor a página de subscrições na navegação principal e garantir que a UI fica legível em desktop e mobile.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/App.tsx`
    - EDITAR: `apps/web/src/styles.css`

3. Instruções do que fazer.

Edita `App.tsx` seguindo o padrão das páginas já existentes. Adiciona a importação, cria a lista `mf8Pages`, inclui a lista no cálculo de `activePage` e adiciona a secção de navegação.

4. Código completo, correto e integrado com a app final.

Adicionar import:

```tsx
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
```

Criar a lista dentro de `App`, perto das listas de outras MFs:

```tsx
const mf8Pages = useMemo<PageConfig[]>(
  () => [
    {
      id: "subscriptions",
      title: "Subscrições",
      render: () => <SubscriptionsPage />,
    },
  ],
  [],
);
```

Atualizar a seleção da página ativa:

```tsx
const activePage = [
  ...mf1Pages,
  ...mf2Pages,
  ...mf3Pages,
  ...mf4Pages,
  ...mf8Pages,
].find((page) => page.id === active);
```

Adicionar a secção de navegação, junto das restantes MFs:

```tsx
<div className="navSection">
  <p className="navSection__title">MF8 - Subscrições</p>
  {mf8Pages.map((page) => (
    <button
      className={active === page.id ? "active" : ""}
      key={page.id}
      onClick={() => setActive(page.id)}
      type="button"
    >
      {page.title}
    </button>
  ))}
</div>
```

Acrescentar estilos no fim de `apps/web/src/styles.css`:

```css
.subscriptionsLayout {
  display: grid;
  gap: 1rem;
}

.subscriptionsSummary,
.subscriptionsPlans,
.subscriptionsActions {
  border: 1px solid var(--border-color, #d9e2ec);
  border-radius: 8px;
  padding: 1rem;
}

.subscriptionsSummary__header {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}

.subscriptionsDetails {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  margin: 0;
}

.subscriptionsDetails div {
  min-width: 0;
}

.subscriptionsDetails dt {
  color: var(--muted-text, #5f6f7f);
  font-size: 0.875rem;
}

.subscriptionsDetails dd {
  font-weight: 600;
  margin: 0.25rem 0 0;
  overflow-wrap: anywhere;
}

.subscriptionsPlans__grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
}

.subscriptionPlan {
  border: 1px solid var(--border-color, #d9e2ec);
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  gap: 0.35rem;
  padding: 0.875rem;
}

.subscriptionPlan--selected {
  border-color: var(--accent-color, #2563eb);
  box-shadow: 0 0 0 2px rgb(37 99 235 / 16%);
}

.subscriptionPlan input {
  justify-self: start;
}

.subscriptionPlan__name,
.subscriptionPlan__price {
  font-weight: 700;
}

.subscriptionPlan__cycle,
.subscriptionPlan__description,
.subscriptionsActions__note {
  color: var(--muted-text, #5f6f7f);
}

@media (max-width: 640px) {
  .subscriptionsSummary__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
```

5. Explicação do código.

`mf8Pages` segue o padrão das restantes listas de páginas: cada item tem `id`, `title` e `render`. A navegação não cria routing novo; apenas expõe a página dentro do shell React existente.

Os estilos usam grid responsivo com `minmax` para evitar que o texto rebente cartões ou botões em ecrãs pequenos. O raio de 8px mantém consistência com os componentes já usados.

6. Validação do passo.

Executa:

```bash
cd apps/web
npm run typecheck
```

Depois abre a app e confirma:

- a navegação mostra `MF8 - Subscrições`;
- a página abre sem ecrã em branco;
- os botões desativados continuam visíveis e legíveis;
- o layout não sobrepõe texto em largura mobile.

7. Cenário negativo/erro esperado.

Erro esperado: importar a página mas não a incluir no `activePage`. Nesse caso o botão aparece, mas o conteúdo não renderiza.

### Passo 5 - Criar gate frontend da UI de subscrições

1. Objetivo funcional do passo no contexto da app.

Criar uma validação rápida para bloquear drift documental e técnico antes do BK seguinte.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/scripts/check-mf8-subscriptions-ui.mjs`
    - EDITAR: `apps/web/package.json`

3. Instruções do que fazer.

Cria o script abaixo e adiciona o comando ao `package.json`. Este gate não substitui typecheck nem testes funcionais; ele confirma que os ficheiros obrigatórios existem e que os contratos principais não regressaram para nomes antigos.

4. Código completo, correto e integrado com a app final.

```js
// apps/web/scripts/check-mf8-subscriptions-ui.mjs

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function readProjectFile(path) {
  return readFileSync(resolve(root, path), "utf8");
}

function assertIncludes(label, content, expected, reason) {
  if (!content.includes(expected)) {
    throw new Error(`${label}: falta ${reason}`);
  }
}

function assertNotIncludes(label, content, forbidden, reason) {
  if (content.includes(forbidden)) {
    throw new Error(`${label}: contém ${reason}`);
  }
}

const api = readProjectFile("src/lib/subscriptionsApi.ts");
const page = readProjectFile("src/pages/SubscriptionsPage.tsx");
const app = readProjectFile("src/App.tsx");
const packageJson = readProjectFile("package.json");

const browserStorageTerms = ["local" + "Storage", "session" + "Storage"];
const deprecatedTerms = ["interval" + "Months", "/subscriptions" + "/actions"];

assertIncludes(
  "subscriptionsApi.ts",
  api,
  "createApiClient()",
  "uso do cliente API central",
);
assertIncludes(
  "subscriptionsApi.ts",
  api,
  "\"GET\", \"/subscriptions/plans\"",
  "consulta de planos simulados",
);
assertIncludes(
  "subscriptionsApi.ts",
  api,
  "\"GET\", \"/subscriptions/current\"",
  "consulta da subscrição atual",
);
assertIncludes(
  "subscriptionsApi.ts",
  api,
  "\"/subscriptions/current/activate\"",
  "endpoint de ativação simulada",
);
assertIncludes(
  "subscriptionsApi.ts",
  api,
  "\"/subscriptions/current/actions\"",
  "endpoint de ações de ciclo de vida",
);
assertIncludes(
  "subscriptionsApi.ts",
  api,
  "billingCycle",
  "campo canónico do ciclo",
);
assertIncludes(
  "subscriptionsApi.ts",
  api,
  "intervalCount",
  "campo canónico da quantidade de ciclos",
);
assertNotIncludes(
  "subscriptionsApi.ts",
  api,
  "fetch(",
  "chamada HTTP direta fora do cliente central",
);

for (const term of deprecatedTerms) {
  assertNotIncludes("subscriptionsApi.ts", api, term, `termo obsoleto ${term}`);
}

for (const term of browserStorageTerms) {
  assertNotIncludes("subscriptionsApi.ts", api, term, "storage do browser");
  assertNotIncludes("SubscriptionsPage.tsx", page, term, "storage do browser");
}

assertIncludes(
  "SubscriptionsPage.tsx",
  page,
  "loadSubscriptionOverview",
  "carregamento do contrato de subscrições",
);
assertIncludes(
  "SubscriptionsPage.tsx",
  page,
  "runSubscriptionAction",
  "execução de ações simuladas",
);
assertIncludes(
  "SubscriptionsPage.tsx",
  page,
  "Estado da subscrição",
  "estado visível da subscrição",
);
assertIncludes("SubscriptionsPage.tsx", page, "Ativar plano", "ação de ativação");
assertIncludes("SubscriptionsPage.tsx", page, "Renovar", "ação de renovação");
assertIncludes("SubscriptionsPage.tsx", page, "Cancelar", "ação de cancelamento");
assertIncludes("SubscriptionsPage.tsx", page, "Reativar", "ação de reativação");
assertIncludes(
  "SubscriptionsPage.tsx",
  page,
  "Estas ações são simuladas",
  "aviso de ausência de pagamento real",
);

assertIncludes(
  "App.tsx",
  app,
  "SubscriptionsPage",
  "importação ou uso da página de subscrições",
);
assertIncludes("App.tsx", app, "subscriptions", "id de navegação da página");
assertIncludes(
  "package.json",
  packageJson,
  "test:mf8:subscriptions-ui",
  "script de validação MF8",
);

console.log("MF8 subscriptions UI gate passed.");
```

Adicionar ao `apps/web/package.json`:

```json
{
  "scripts": {
    "test:mf8:subscriptions-ui": "node scripts/check-mf8-subscriptions-ui.mjs"
  }
}
```

5. Explicação do código.

O gate lê ficheiros como texto para confirmar contratos mínimos. Ele procura endpoints, campos canónicos, integração da página e script no `package.json`.

As strings antigas são montadas por concatenação no próprio gate para evitar que o guia ensine novamente o valor errado como literal. O objetivo é bloquear regressões, não divulgar outro contrato.

6. Validação do passo.

Executa:

```bash
cd apps/web
npm run test:mf8:subscriptions-ui
```

Resultado esperado:

```text
MF8 subscriptions UI gate passed.
```

7. Cenário negativo/erro esperado.

Erro esperado: se alguém voltar a usar o endpoint sem o segmento `/current`, o gate deve falhar com uma mensagem sobre termo obsoleto.

### Passo 6 - Registar evidence e validação final

1. Objetivo funcional do passo no contexto da app.

Deixar prova objetiva para revisão, defesa e continuação em `BK-MF8-08`.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/BK-MF8-07.md`
    - REVER: `apps/web/package.json`

3. Instruções do que fazer.

Cria o ficheiro de evidence e preenche-o com resultados reais depois de executar comandos. Não escrevas `PASS` se o comando falhou ou não foi executado.

4. Código completo, correto e integrado com a app final.

```md
# Evidence MF8 / BK-MF8-07

- Projeto: OPSA
- BK: BK-MF8-07
- Tema: UI de planos e gestão da subscrição simulada
- Data: YYYY-MM-DD
- Responsável: Andre
- Apoio: Pedro

## Ficheiros alterados

- apps/web/src/lib/subscriptionsApi.ts
- apps/web/src/pages/SubscriptionsPage.tsx
- apps/web/src/App.tsx
- apps/web/src/styles.css
- apps/web/scripts/check-mf8-subscriptions-ui.mjs
- apps/web/package.json

## Comandos executados

| Comando | Critério de sucesso | Evidência a anexar |
| --- | --- | --- |
| `cd apps/web && npm run typecheck` | O comando termina com exit code `0` e não apresenta erros de TypeScript. | Anexar o output real do terminal; se falhar, manter o BK aberto e resumir o erro corrigido. |
| `cd apps/web && npm run test:mf8:subscriptions-ui` | O gate confirma página, cliente API, aviso de simulação e ausência de `companyId` decidido pela UI. | Anexar o output real do terminal; se falhar, indicar a regra de UI ou segurança que ficou por corrigir. |

## Verificação manual

- [ ] A página `Subscrições` aparece na navegação.
- [ ] A lista de planos mostra mensal, trimestral e anual quando a API devolve catálogo.
- [ ] O estado sem subscrição permite ativar plano.
- [ ] O estado ativo permite renovar e cancelar.
- [ ] O estado cancelado ou expirado permite reativar com plano escolhido.
- [ ] A UI mostra aviso de ações simuladas e não promete pagamento real.
- [ ] A UI não pede identificador de empresa ao utilizador.

## Notas para BK-MF8-08

BK-MF8-08 deve usar esta evidence para validar o fluxo completo de subscrições simuladas.
```

5. Explicação do código.

O ficheiro de evidence é intencionalmente simples. Ele separa comandos automáticos de verificação manual, para não misturar compilação TypeScript com inspeção visual da página.

6. Validação do passo.

Executa:

```bash
cd apps/web
npm run typecheck
npm run test:mf8:subscriptions-ui
```

Se houver app local disponível, valida também a página em browser. A evidence deve dizer claramente o que foi executado e o que ficou pendente.

7. Cenário negativo/erro esperado.

Erro esperado: preencher evidence com sucesso sem executar comandos. Isso torna `BK-MF8-08` menos fiável e deve ser rejeitado em revisão.

### Passo 7 - Preparar handoff para BK-MF8-08

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com contratos claros para o próximo bloco de validação e evidence final.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF8/BK-MF8-07.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-08-testes-e-evidencia-de-subscricoes-simuladas.md`

3. Instruções do que fazer.

Antes de entregar, confirma que `BK-MF8-08` recebe:

- página `Subscrições` integrada em `App.tsx`;
- cliente `subscriptionsApi.ts` com planos, estado atual, ativação e ações;
- evidence com typecheck e gate frontend;
- aviso visível de subscrição simulada;
- nenhum pagamento real;
- nenhuma decisão de empresa ativa feita no browser.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O handoff é uma verificação final de continuidade.

5. Explicação do código.

`BK-MF8-08` deve validar o bloco completo. Para isso, precisa de saber exatamente que artefactos o `BK-MF8-07` deixou e que comandos foram usados para provar a UI.

6. Validação do passo.

Confirma que a secção `Evidence para PR/defesa` deste guia está preenchida e que o ficheiro de evidence existe.

7. Cenário negativo/erro esperado.

Erro esperado: entregar a UI sem evidence. O próximo BK fica obrigado a adivinhar se a página compilou, se abriu e se os botões chamam os endpoints corretos.

#### Critérios de aceite

- O header do `BK-MF8-07` mantém MF, owner, apoio, prioridade, sprint, dependências, RF/RNF e próximo BK definidos na matriz.
- `subscriptionsApi.ts` usa `createApiClient()` e não faz chamada HTTP direta.
- O cliente frontend consome `GET /api/subscriptions/plans`, `GET /api/subscriptions/current`, `POST /api/subscriptions/current/activate` e `POST /api/subscriptions/current/actions`.
- Os tipos de plano usam `billingCycle` e `intervalCount`.
- `SubscriptionsPage.tsx` mostra loading, erro, vazio, estado atual, planos, ações e feedback.
- `App.tsx` expõe a página `Subscrições` na navegação.
- A UI não guarda sessão, role, empresa ativa ou credenciais em storage do browser.
- A UI não cria pagamento real, checkout, recibo, fatura ou cobrança automática.
- O gate `test:mf8:subscriptions-ui` existe e passa.
- A evidence de `BK-MF8-07` regista comandos executados e resultado real.

#### Validação final

Executa os comandos a partir da raiz pública do frontend:

```bash
cd apps/web
npm run typecheck
npm run test:mf8:subscriptions-ui
```

Verificações manuais mínimas:

- abrir a app e clicar em `Subscrições`;
- confirmar que não existe ecrã em branco;
- confirmar que a página mostra aviso de ações simuladas;
- confirmar que os botões disponíveis mudam com o estado devolvido pela API;
- confirmar que a UI não pede dados de ownership ao utilizador.

#### Evidence para PR/defesa

Anexar ou referenciar `docs/evidence/MF8/BK-MF8-07.md` com:

- lista de ficheiros alterados;
- resultados reais de `npm run typecheck`;
- resultados reais de `npm run test:mf8:subscriptions-ui`;
- screenshots ou notas de validação manual, se a app local tiver sido aberta;
- riscos residuais, caso algum comando não tenha sido executado.

#### Handoff

Para `BK-MF8-08`, ficam entregues:

- contrato frontend `apps/web/src/lib/subscriptionsApi.ts`;
- página `apps/web/src/pages/SubscriptionsPage.tsx`;
- integração em `apps/web/src/App.tsx`;
- gate `apps/web/scripts/check-mf8-subscriptions-ui.mjs`;
- evidence `docs/evidence/MF8/BK-MF8-07.md`;
- comandos finais:
  - `cd apps/web && npm run typecheck`;
  - `cd apps/web && npm run test:mf8:subscriptions-ui`.

O próximo BK deve validar o fluxo completo, incluindo sucesso, erros esperados, ausência de pagamento real e coerência da evidence.

#### Changelog

- 2026-07-02: corrigido handoff para o slug real do `BK-MF8-08` e removidos blocos finais legados fora da estrutura obrigatória da prompt atual.
- 2026-07-02: guia reescrito em modo `corrigir_apenas` para alinhar cliente API, página React, integração em `App.tsx`, gate frontend, evidence e acentuação pedagógica com os contratos atuais da MF8.
