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