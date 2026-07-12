/**
 * @file Páginas React dos fluxos MF4 de IA assistiva, lembretes, tarefas, notificações e auditoria.
 */

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { apiClient, JsonBody } from "../lib/apiClient";
import { useAuth } from "../auth/AuthProvider";
import { Permission } from "../auth/permissions";
import {
  EMPTY_PAGE_INFO,
  type CursorPage,
  type CursorPageInfo,
  type CursorPagination,
} from "../lib/cursorPagination";
import { firstLocalDayOfMonth, toLocalDateInputValue } from "../lib/dateUtils";
import { assertMf5FormData } from "../lib/mf5FormValidators";
import {
  AiActionSuggestion,
  AiInsight,
  AiQuestionAnswer,
  AuditLogItem,
  createReminder,
  createAiAnalysisRun,
  getAiAnalysisRun,
  createTask,
  getAiInsights,
  getAiSuggestions,
  getAuditLogs,
  getInsightExplanation,
  getIntegrationLogs,
  getNotifications,
  getReminders,
  getSmartAlerts,
  getTasks,
  InAppNotificationItem,
  AlertPreferenceItem,
  InsightExplanation,
  IntegrationLogItem,
  markNotificationRead,
  getNotificationPreferences,
  updateNotificationPreference,
  OperationalTaskItem,
  ReminderItem,
  SmartAlert,
  updateReminderStatus,
  updateTaskStatus,
  updateAiInsightStatus,
  updateAiSuggestionStatus,
  updateSmartAlertStatus,
  askAiQuestion,
} from "../lib/mf4Api";
import {
  AiSourceQualityPanel,
  ActionFeedbackMessage,
  PageFrame,
  StatusMessage,
} from "../ui/opsaUi";
import { useActionFeedback } from "../ui/useActionFeedback";
import { CursorPaginationButton } from "../ui/CursorPaginationButton";

/**
 * Data corrente no formato de input date.
 *
 * @returns Data ISO curta.
 */
/**
 * Extrai texto obrigatório de um formulário.
 *
 * @param value - Valor de formulário.
 * @param label - Nome amigável.
 * @returns Texto validado.
 */
function requiredText(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} e obrigatorio`);
  return text;
}

/**
 * Extrai texto opcional de um formulário.
 *
 * @param value - Valor de formulário.
 * @returns Texto ou undefined.
 */
function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || undefined;
}

/**
 * Formulário reutilizável de intervalo de datas.
 *
 * @param props - Propriedades React.
 * @returns Elemento React.
 */
function DateRangeForm({
  label,
  onSubmit,
  startMessage,
  successMessage,
  errorMessage,
}: {
  label: string;
  onSubmit: (from: string, to: string) => Promise<void>;
  startMessage: string;
  successMessage: string;
  errorMessage: string;
}) {
  const action = useActionFeedback();

  /**
   * Valida o intervalo localmente e executa a chamada remota com feedback comum.
   *
   * @param event - Evento do formulario submetido.
   * @returns Promise resolvida depois do ciclo de feedback terminar.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;

    try {
      await action.run(
        async () => {
          const form = new FormData(formElement);
          assertMf5FormData(form, [
            { name: "from", required: true },
            { name: "to", required: true },
          ]);
          await onSubmit(
            requiredText(form.get("from"), "Data inicial"),
            requiredText(form.get("to"), "Data final"),
          );
        },
        {
          startMessage,
          successMessage,
          errorMessage,
        },
      );
    } catch {
      // O hook mantem a mensagem de erro visivel e o formulario preenchido.
    }
  }

  return (
    <form className="operation" onSubmit={submit}>
      <h3>{label}</h3>
      <div className="fields">
        <label>
          <span>Data inicial</span>
          <input name="from" type="date" required defaultValue={firstLocalDayOfMonth()} />
        </label>
        <label>
          <span>Data final</span>
          <input name="to" type="date" required defaultValue={toLocalDateInputValue()} />
        </label>
      </div>
      <ActionFeedbackMessage feedback={action.feedback} />
      <button type="submit" disabled={action.busy}>
        {action.busy ? "A consultar..." : "Consultar"}
      </button>
    </form>
  );
}

/**
 * Lista genérica para cartões de leitura.
 *
 * @param props - Propriedades React.
 * @returns Elemento React.
 */
function SimpleList<TItem>({
  items,
  render,
}: {
  items: TItem[];
  render: (item: TItem) => ReactNode;
}) {
  if (items.length === 0) return <p className="empty">Sem registos para apresentar.</p>;
  return <div className="operationGrid">{items.map(render)}</div>;
}

/**
 * Renderiza a página de insights automáticos da MF4.
 * A página consulta insights por intervalo e permite abrir a explicação auditável de cada resultado.
 *
 * @returns Elemento React da página de insights com lista, feedback e explicação selecionada.
 */
export function AiInsightsPage() {
  const auth = useAuth();
  const canRunAnalysis = auth.hasPermission(Permission.AI_ANALYSIS_RUN);
  const canManage = auth.hasPermission(Permission.AI_INSIGHTS_MANAGE);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [explanation, setExplanation] = useState<InsightExplanation | null>(null);
  const explanationAction = useActionFeedback();
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [runRange, setRunRange] = useState<{ from: string; to: string } | null>(null);
  useEffect(() => {
    if (!runId || !runRange || ["COMPLETED", "FAILED"].includes(runStatus ?? "")) return;
    const timer = window.setInterval(() => {
      void getAiAnalysisRun(runId).then(async ({ run }) => {
        setRunStatus(run.status);
        if (run.status === "COMPLETED") setInsights((await getAiInsights(runRange.from, runRange.to)).insights);
      });
    }, 2_000);
    return () => window.clearInterval(timer);
  }, [runId, runRange, runStatus]);
  return (
    <PageFrame title="Insights automáticos">
      {canRunAnalysis ? <DateRangeForm
        label="Atualizar insights"
        startMessage="A agendar análise..."
        successMessage="Análise agendada para o worker."
        errorMessage="Nao foi possivel agendar a análise."
        onSubmit={async (from, to) => {
          const run = await createAiAnalysisRun(from, to);
          setRunId(run.run.id);
          setRunRange({ from, to });
          setRunStatus(run.run.status);
          const result = await getAiInsights(from, to);
          setInsights(result.insights);
          setExplanation(null);
        }}
      /> : null}
      {runStatus ? <StatusMessage tone="neutral" title="Execução de análise">{runStatus}{runId ? ` · ${runId}` : ""}</StatusMessage> : null}
      <SimpleList
        items={insights}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <p>{item.sourceLabel}</p>
            <p>Score: {item.score ?? 0} · Estado: {item.status} · Período: {item.periodFrom?.slice(0, 10) ?? "legado"} a {item.periodTo?.slice(0, 10) ?? "legado"}</p>
            <button
              type="button"
              disabled={explanationAction.busy}
              onClick={async () => {
                try {
                  await explanationAction.run(
                    async () => {
                      setExplanation((await getInsightExplanation(item.id)).explanation);
                    },
                    {
                      startMessage: "A carregar explicacao...",
                      successMessage: "Explicacao carregada.",
                      errorMessage: "Nao foi possivel carregar a explicacao.",
                    },
                  );
                } catch {
                  // O feedback de erro ja esta visivel.
                }
              }}
            >
              {explanationAction.busy ? "A carregar..." : "Ver explicação"}
            </button>
            {canManage ? <button type="button" onClick={async () => { await updateAiInsightStatus(item.id, "ACKNOWLEDGED"); setInsights((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "ACKNOWLEDGED" } : entry)); }}>Reconhecer</button> : null}
          </article>
        )}
      />
      <ActionFeedbackMessage feedback={explanationAction.feedback} />
      {explanation ? (
        <article className="operation" aria-labelledby="insight-explanation-title">
          <h3 id="insight-explanation-title">{explanation.title}</h3>
          <p>{explanation.explanation}</p>
          <p>Fonte: {explanation.source.label}</p>
          <StatusMessage tone="neutral" title="Limite da recomendação">
            {explanation.guardrail}
          </StatusMessage>
        </article>
      ) : null}
    </PageFrame>
  );
}

/**
 * Renderiza a página de sugestões de ação geradas pela IA.
 * A página mostra recomendações com fonte, limitação e decisão humana obrigatória.
 *
 * @returns Elemento React da página de sugestões com feedback de atualização.
 */
export function AiSuggestionsPage() {
  const auth = useAuth();
  const canManage = auth.hasPermission(Permission.AI_SUGGESTIONS_MANAGE);
  const [suggestions, setSuggestions] = useState<AiActionSuggestion[]>([]);
  const action = useActionFeedback();

  /**
   * Recarrega sugestões usando a sessão atual enviada por cookie HttpOnly.
   *
   * @returns Promise resolvida quando a lista fica atualizada.
   */
  async function load() {
    try {
      await action.run(
        async () => {
          const result = await getAiSuggestions();
          setSuggestions(result.suggestions);
        },
        {
          startMessage: "A atualizar sugestões...",
          successMessage: "Sugestões atualizadas.",
          errorMessage: "Não foi possível carregar as sugestões.",
        },
      );
    } catch {
      // O feedback de erro fica visível e a lista anterior não é apagada sem necessidade.
    }
  }

  return (
    <PageFrame
      title="Sugestões de ação"
      description="Recomendações explicáveis com fonte, limitação e decisão humana."
    >
      <button type="button" onClick={load} disabled={action.busy}>
        {action.busy ? "A carregar..." : "Atualizar"}
      </button>
      <ActionFeedbackMessage feedback={action.feedback} />
      <SimpleList
        items={suggestions}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.rationale}</p>
            <p>{item.actionType} · {item.sourceLabel}</p>
            <AiSourceQualityPanel quality={item.sourceQuality} />
            <StatusMessage tone="neutral" title="Decisão humana">
              {item.guardrail ?? "A IA recomenda com fonte rastreável; a decisão continua humana."}
            </StatusMessage>
            {canManage ? <><button type="button" onClick={async () => { await updateAiSuggestionStatus(item.id, "ACCEPTED", "USEFUL"); setSuggestions((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "ACCEPTED" } : entry)); }}>Aceitar</button>
            <button type="button" onClick={async () => { await updateAiSuggestionStatus(item.id, "DISMISSED", "NOT_USEFUL"); setSuggestions((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "DISMISSED" } : entry)); }}>Dispensar</button></> : null}
          </article>
        )}
      />
    </PageFrame>
  );
}

/**
 * Renderiza a página de perguntas à IA com fontes rastreáveis.
 * A resposta fica visível como conteúdo de domínio com fontes rastreáveis.
 *
 * @returns Elemento React com formulário de pergunta e resultado estruturado.
 */
export function AiQuestionsPage() {
  const [answer, setAnswer] = useState<AiQuestionAnswer | null>(null);
  const action = useActionFeedback();

  /**
   * Submete a pergunta do formulário e guarda a resposta devolvida pela API.
   * O texto é validado localmente antes de ser enviado ao backend.
   *
   * @param event - Evento de submissão do formulário de pergunta.
   * @returns Promise resolvida depois de atualizar o feedback e a resposta.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;

    try {
      await action.run(
        async () => {
          const form = new FormData(formElement);
          setAnswer((await askAiQuestion(requiredText(form.get("question"), "Pergunta"))).answer);
        },
        {
          startMessage: "A enviar pergunta...",
          successMessage: "Resposta gerada com sucesso.",
          errorMessage: "Nao foi possivel responder a pergunta.",
        },
      );
    } catch {
      // O formulario fica preenchido para correcao.
    }
  }

  return (
    <PageFrame title="Perguntas com fonte">
      <form className="operation" onSubmit={submit}>
        <h3>Perguntar</h3>
        <label>
          <span>Pergunta</span>
          <textarea name="question" required rows={4} />
        </label>
        <ActionFeedbackMessage feedback={action.feedback} />
        <button type="submit" disabled={action.busy}>
          {action.busy ? "A perguntar..." : "Perguntar"}
        </button>
      </form>
      {answer ? (
        <article className="operation" aria-labelledby="ai-answer-title">
          <h3 id="ai-answer-title">Resposta</h3>
          <p>{answer.answer}</p>
          <p>Intenção identificada: {answer.intent}</p>
          <h3>Fontes</h3>
          <ul>
            {answer.sources.map((source) => (
              <li key={`${source.type}-${source.id}`}>{source.type}</li>
            ))}
          </ul>
        </article>
      ) : null}
    </PageFrame>
  );
}

/**
 * Renderiza a página de alertas inteligentes da MF4.
 * A página usa o intervalo de datas comum e apresenta alertas calculados pelo backend.
 *
 * @returns Elemento React com formulário de consulta e cartões de alerta.
 */
export function SmartAlertsPage() {
  const auth = useAuth();
  const canRunAnalysis = auth.hasPermission(Permission.AI_ANALYSIS_RUN);
  const canManage = auth.hasPermission(Permission.AI_ALERTS_MANAGE);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [runRange, setRunRange] = useState<{ from: string; to: string } | null>(null);
  useEffect(() => {
    if (!runId || !runRange || ["COMPLETED", "FAILED"].includes(runStatus ?? "")) return;
    const timer = window.setInterval(() => {
      void getAiAnalysisRun(runId).then(async ({ run }) => {
        setRunStatus(run.status);
        if (run.status === "COMPLETED") setAlerts((await getSmartAlerts(runRange.from, runRange.to)).alerts);
      });
    }, 2_000);
    return () => window.clearInterval(timer);
  }, [runId, runRange, runStatus]);
  return (
    <PageFrame title="Alertas inteligentes">
      {canRunAnalysis ? <DateRangeForm
        label="Atualizar alertas"
        startMessage="A agendar análise..."
        successMessage="Análise agendada para o worker."
        errorMessage="Nao foi possivel agendar os alertas."
        onSubmit={async (from, to) => { const run = await createAiAnalysisRun(from, to); setRunId(run.run.id); setRunRange({ from, to }); setRunStatus(run.run.status); setAlerts((await getSmartAlerts(from, to)).alerts); }}
      /> : null}
      {runStatus ? <StatusMessage tone="neutral" title="Execução de análise">{runStatus}{runId ? ` · ${runId}` : ""}</StatusMessage> : null}
      <SimpleList
        items={alerts}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.message}</p>
            <p>{item.severity} · {item.sourceLabel}</p>
            <p>Score: {item.score ?? 0} · Estado: {item.status}</p>
            {canManage ? <><button type="button" onClick={async () => { await updateSmartAlertStatus(item.id, "ACKNOWLEDGED"); setAlerts((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "ACKNOWLEDGED" } : entry)); }}>Reconhecer</button>
            <button type="button" onClick={async () => { await updateSmartAlertStatus(item.id, "RESOLVED"); setAlerts((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "RESOLVED" } : entry)); }}>Resolver</button></> : null}
          </article>
        )}
      />
    </PageFrame>
  );
}

/**
 * Renderiza a página de lembretes operacionais.
 * A página permite listar, criar e concluir lembretes sem duplicar regras de validação do backend.
 *
 * @returns Elemento React com ações de lembrete e lista atualizada.
 */
export function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const action = useActionFeedback();

  /**
   * Recarrega lembretes diretamente da API e substitui o estado local.
   * É usado depois de criar ou concluir lembretes para manter a lista consistente.
   *
   * @returns Promise resolvida quando o estado local contém a lista mais recente.
   */
  async function fetchReminders() {
    setReminders((await getReminders()).reminders);
  }

  /**
   * Executa a atualização manual de lembretes com feedback visual.
   * Erros ficam registados no hook comum sem apagar os dados já apresentados.
   *
   * @returns Promise resolvida depois de tentar atualizar a lista.
   */
  async function load() {
    try {
      await action.run(fetchReminders, {
        startMessage: "A atualizar lembretes...",
        successMessage: "Lembretes atualizados.",
        errorMessage: "Nao foi possivel carregar os lembretes.",
      });
    } catch {
      // O feedback de erro fica visivel no estado partilhado da pagina.
    }
  }

  /**
   * Cria um lembrete a partir do formulário e recarrega a lista.
   * O prazo é validado antes do envio para evitar payloads incompletos.
   *
   * @param event - Evento de submissão do formulário de criação.
   * @returns Promise resolvida depois de criar o lembrete ou mostrar feedback de erro.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;

    try {
      await action.run(
        async () => {
          const form = new FormData(formElement);
          assertMf5FormData(form, [{ name: "dueAt", required: true }]);
          const body: JsonBody = {
            title: requiredText(form.get("title"), "Titulo"),
            description: optionalText(form.get("description")),
            type: requiredText(form.get("type"), "Tipo"),
            dueAt: requiredText(form.get("dueAt"), "Prazo"),
          };
          await createReminder(body);
          await fetchReminders();
          formElement.reset();
        },
        {
          startMessage: "A criar lembrete...",
          successMessage: "Lembrete criado e lista atualizada.",
          errorMessage: "Nao foi possivel criar o lembrete.",
        },
      );
    } catch {
      // O formulario fica preenchido para correcao.
    }
  }

  return (
    <PageFrame title="Lembretes">
      <button type="button" onClick={load} disabled={action.busy}>
        {action.busy ? "A executar..." : "Atualizar"}
      </button>
      {action.feedback.message ? (
        <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
          {action.feedback.message}
        </StatusMessage>
      ) : null}
      <form className="operation" onSubmit={submit}>
        <h3>Criar lembrete</h3>
        <div className="fields">
          <label><span>Título</span><input name="title" required /></label>
          <label>
            <span>Tipo</span>
            <select name="type" required defaultValue="PAYMENT">
              <option value="PAYMENT">Pagamento</option>
              <option value="TAX">Imposto</option>
              <option value="DEADLINE">Prazo</option>
              <option value="OTHER">Outro</option>
            </select>
          </label>
          <label><span>Prazo</span><input name="dueAt" type="date" required /></label>
          <label><span>Descrição</span><textarea name="description" rows={3} /></label>
        </div>
        <button type="submit" disabled={action.busy}>
          {action.busy ? "A criar..." : "Criar"}
        </button>
      </form>
      <SimpleList
        items={reminders}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.type} · {item.status} · {item.dueAt.slice(0, 10)}</p>
            <button
              type="button"
              disabled={action.busy}
              onClick={async () => {
                try {
                  await action.run(
                    async () => {
                      await updateReminderStatus(item.id, "DONE");
                      await fetchReminders();
                    },
                    {
                      startMessage: "A concluir lembrete...",
                      successMessage: "Lembrete concluido.",
                      errorMessage: "Nao foi possivel concluir o lembrete.",
                    },
                  );
                } catch {
                  // O feedback de erro ja esta visivel.
                }
              }}
            >
              Concluir
            </button>
          </article>
        )}
      />
    </PageFrame>
  );
}

/**
 * Renderiza a página de tarefas operacionais.
 * A página permite criar tarefas, associar responsável opcional e concluir trabalho pendente.
 *
 * @returns Elemento React com formulário, feedback e lista de tarefas.
 */
export function TasksPage() {
  const [tasks, setTasks] = useState<OperationalTaskItem[]>([]);
  const [assignees, setAssignees] = useState<Array<{ id: string; label: string }>>([]);
  const [assigneesError, setAssigneesError] = useState<string | null>(null);
  const action = useActionFeedback();

  useEffect(() => {
    let active = true;
    void apiClient.companies
      .users()
      .then((response) => {
        if (!active || !response || typeof response !== "object" || Array.isArray(response)) return;
        const record = response as Record<string, unknown>;
        const users = Array.isArray(record.items)
          ? record.items
          : Array.isArray(record.users)
            ? record.users
            : [];
        setAssignees(
          users.flatMap((value) => {
            if (!value || typeof value !== "object" || Array.isArray(value)) return [];
            const user = value as Record<string, unknown>;
            const id = typeof user.userId === "string" ? user.userId : "";
            if (!id) return [];
            const label =
              typeof user.name === "string" && user.name
                ? user.name
                : typeof user.email === "string"
                  ? user.email
                  : id;
            return [{ id, label }];
          }),
        );
      })
      .catch(() => {
        if (active) setAssigneesError("Não foi possível carregar os responsáveis disponíveis.");
      });
    return () => {
      active = false;
    };
  }, []);

  /**
   * Recarrega tarefas diretamente da API e substitui o estado local.
   * É reutilizado após criação e conclusão para evitar estados desatualizados.
   *
   * @returns Promise resolvida quando a lista local de tarefas fica atualizada.
   */
  async function fetchTasks() {
    setTasks((await getTasks()).tasks);
  }

  /**
   * Executa a atualização manual de tarefas com feedback visual.
   * A função encapsula o ciclo comum de início, sucesso e erro.
   *
   * @returns Promise resolvida depois de tentar carregar tarefas.
   */
  async function load() {
    try {
      await action.run(fetchTasks, {
        startMessage: "A atualizar tarefas...",
        successMessage: "Tarefas atualizadas.",
        errorMessage: "Nao foi possivel carregar as tarefas.",
      });
    } catch {
      // O feedback de erro fica visivel no estado partilhado da pagina.
    }
  }

  /**
   * Cria uma tarefa operacional a partir do formulário da página.
   * O prazo é validado localmente e os campos opcionais são normalizados antes do envio.
   *
   * @param event - Evento de submissão do formulário de tarefa.
   * @returns Promise resolvida depois de criar a tarefa ou manter o formulário com erro.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;

    try {
      await action.run(
        async () => {
          const form = new FormData(formElement);
          assertMf5FormData(form, [{ name: "dueAt", required: true }]);
          const body: JsonBody = {
            title: requiredText(form.get("title"), "Titulo"),
            description: optionalText(form.get("description")),
            dueAt: requiredText(form.get("dueAt"), "Prazo"),
            assignedToId: optionalText(form.get("assignedToId")),
          };
          await createTask(body);
          await fetchTasks();
          formElement.reset();
        },
        {
          startMessage: "A criar tarefa...",
          successMessage: "Tarefa criada e lista atualizada.",
          errorMessage: "Nao foi possivel criar a tarefa.",
        },
      );
    } catch {
      // O formulario fica preenchido para correcao.
    }
  }

  return (
    <PageFrame title="Tarefas">
      <button type="button" onClick={load} disabled={action.busy}>
        {action.busy ? "A executar..." : "Atualizar"}
      </button>
      {action.feedback.message ? (
        <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
          {action.feedback.message}
        </StatusMessage>
      ) : null}
      {assigneesError ? (
        <StatusMessage tone="danger" title="Responsáveis indisponíveis">
          {assigneesError}
        </StatusMessage>
      ) : null}
      <form className="operation" onSubmit={submit}>
        <h3>Criar tarefa</h3>
        <div className="fields">
          <label><span>Título</span><input name="title" required /></label>
          <label><span>Prazo</span><input name="dueAt" type="date" required /></label>
          <label>
            <span>Responsável (opcional)</span>
            <select name="assignedToId" defaultValue="">
              <option value="">Sem responsável</option>
              {assignees.map((assignee) => (
                <option value={assignee.id} key={assignee.id}>{assignee.label}</option>
              ))}
            </select>
          </label>
          <label><span>Descrição</span><textarea name="description" rows={3} /></label>
        </div>
        <button type="submit" disabled={action.busy}>
          {action.busy ? "A criar..." : "Criar"}
        </button>
      </form>
      <SimpleList
        items={tasks}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.status} · {item.dueAt.slice(0, 10)}</p>
            <button
              type="button"
              disabled={action.busy}
              onClick={async () => {
                try {
                  await action.run(
                    async () => {
                      await updateTaskStatus(item.id, "DONE");
                      await fetchTasks();
                    },
                    {
                      startMessage: "A concluir tarefa...",
                      successMessage: "Tarefa concluida.",
                      errorMessage: "Nao foi possivel concluir a tarefa.",
                    },
                  );
                } catch {
                  // O feedback de erro ja esta visivel.
                }
              }}
            >
              Concluir
            </button>
          </article>
        )}
      />
    </PageFrame>
  );
}

/**
 * Renderiza a página de notificações internas.
 * A página lista notificações, sincroniza eventos e permite marcar itens como lidos.
 *
 * @returns Elemento React com ações de sincronização e lista de notificações.
 */
export function NotificationsPage() {
  const [notifications, setNotifications] = useState<InAppNotificationItem[]>([]);
  const [preferences, setPreferences] = useState<AlertPreferenceItem[]>([]);
  const action = useActionFeedback();

  /**
   * Recarrega notificações da API e atualiza o estado local.
   * É usada após sincronizar ou marcar notificações como lidas.
   *
   * @returns Promise resolvida quando a lista de notificações fica atualizada.
   */
  async function fetchNotifications() {
    const [notificationResult, preferenceResult] = await Promise.all([getNotifications(), getNotificationPreferences()]);
    setNotifications(notificationResult.notifications);
    setPreferences(preferenceResult.preferences);
  }

  /**
   * Executa a atualização manual de notificações com feedback visual.
   * A lista anterior permanece visível quando a chamada falha.
   *
   * @returns Promise resolvida depois de tentar recarregar notificações.
   */
  async function load() {
    try {
      await action.run(fetchNotifications, {
        startMessage: "A atualizar notificacoes...",
        successMessage: "Notificacoes atualizadas.",
        errorMessage: "Nao foi possivel carregar as notificacoes.",
      });
    } catch {
      // O feedback de erro ja esta visivel.
    }
  }

  return (
    <PageFrame title="Notificações">
      <button type="button" onClick={load} disabled={action.busy}>
        {action.busy ? "A executar..." : "Atualizar"}
      </button>
      {action.feedback.message ? (
        <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
          {action.feedback.message}
        </StatusMessage>
      ) : null}
      <section className="operation" aria-labelledby="notification-preferences-title">
        <h3 id="notification-preferences-title">Preferências</h3>
        {preferences.map((preference) => (
          <label key={preference.type}>
            <input
              type="checkbox"
              checked={preference.enabled}
              disabled={action.busy || !preference.canDisable}
              onChange={async (event) => {
                const enabled = event.target.checked;
                const result = await updateNotificationPreference(preference.type, enabled);
                setPreferences((current) => current.map((item) => item.type === result.preference.type ? result.preference : item));
              }}
            /> {preference.label}{!preference.canDisable ? " (obrigatória)" : ""}
          </label>
        ))}
      </section>
      <SimpleList
        items={notifications}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.message}</p>
            <p>{item.readAt ? "Lida" : "Por ler"}</p>
            <button
              type="button"
              disabled={action.busy}
              onClick={async () => {
                try {
                  await action.run(
                    async () => {
                      await markNotificationRead(item.id);
                      await fetchNotifications();
                    },
                    {
                      startMessage: "A marcar notificacao...",
                      successMessage: "Notificacao marcada como lida.",
                      errorMessage: "Nao foi possivel atualizar a notificacao.",
                    },
                  );
                } catch {
                  // O feedback de erro ja esta visivel.
                }
              }}
            >
              Marcar lida
            </button>
          </article>
        )}
      />
    </PageFrame>
  );
}

/**
 * Gere uma listagem cursor sem substituir páginas já visíveis quando o
 * utilizador pede mais registos.
 *
 * @param loadPage - Cliente tipado da listagem.
 * @returns Itens, paginação, feedback e ações de refresh/load-more.
 */
function useCursorListing<TItem>(
  loadPage: (pagination?: CursorPagination) => Promise<CursorPage<TItem>>,
) {
  const [items, setItems] = useState<TItem[]>([]);
  const [pageInfo, setPageInfo] = useState<CursorPageInfo>(EMPTY_PAGE_INFO);
  const action = useActionFeedback();
  const runAction = action.run;

  async function load(append = false) {
    const cursor = append ? pageInfo.nextCursor ?? undefined : undefined;
    if (append && !cursor) return;
    try {
      await runAction(
        async () => {
          const page = await loadPage({ cursor, limit: 50 });
          setItems((current) => append ? [...current, ...page.items] : page.items);
          setPageInfo(page.pageInfo);
          return page;
        },
        {
          startMessage: append ? "A carregar mais registos..." : "A atualizar registos...",
          successMessage: append ? "Página seguinte carregada." : "Registos atualizados.",
          errorMessage: "Nao foi possivel carregar os registos.",
        },
      );
    } catch {
      if (!append) {
        setItems([]);
        setPageInfo(EMPTY_PAGE_INFO);
      }
    }
  }

  useEffect(() => {
    void load(false);
  }, [loadPage]);

  return { items, pageInfo, action, load };
}

/**
 * Renderiza a página de auditoria funcional.
 * A página carrega eventos de auditoria e mostra cartões funcionais legíveis.
 *
 * @returns Elemento React com ação de atualização e eventos legíveis.
 */
export function AuditLogsPage() {
  const listing = useCursorListing<AuditLogItem>(getAuditLogs);
  const { action } = listing;
  return (
    <PageFrame title="Auditoria">
      <button
        type="button"
        disabled={action.busy}
        onClick={() => void listing.load(false)}
      >
        {action.busy ? "A executar..." : "Atualizar"}
      </button>
      {action.feedback.message ? (
        <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
          {action.feedback.message}
        </StatusMessage>
      ) : null}
      <SimpleList
        items={listing.items}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.action}</h3>
            <p>{item.entity}</p>
            <p>{new Date(item.createdAt).toLocaleString("pt-PT")}</p>
          </article>
        )}
      />
      <CursorPaginationButton
        hasNextPage={listing.pageInfo.hasNextPage}
        busy={action.busy}
        label="auditoria"
        onLoadMore={() => listing.load(true)}
      />
    </PageFrame>
  );
}

/**
 * Renderiza a página de logs de integração.
 * A página ajuda a validar importações e integrações através de estados operacionais legíveis.
 *
 * @returns Elemento React com ação de atualização e cartões de estado.
 */
export function IntegrationLogsPage() {
  const listing = useCursorListing<IntegrationLogItem>(getIntegrationLogs);
  const { action } = listing;
  return (
    <PageFrame title="Logs de integração">
      <button
        type="button"
        disabled={action.busy}
        onClick={() => void listing.load(false)}
      >
        {action.busy ? "A executar..." : "Atualizar"}
      </button>
      {action.feedback.message ? (
        <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
          {action.feedback.message}
        </StatusMessage>
      ) : null}
      <SimpleList
        items={listing.items}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.operation}</h3>
            <p>{item.integrationType} · {item.status}</p>
            {item.fileName ? <p>Ficheiro: {item.fileName}</p> : null}
            {typeof item.totalRows === "number" ? (
              <p>
                Linhas: {item.successRows ?? 0} com sucesso, {item.errorRows ?? 0} com erro,
                {" "}num total de {item.totalRows}.
              </p>
            ) : null}
            {item.message ? <p>{item.message}</p> : null}
            <p>{new Date(item.createdAt).toLocaleString("pt-PT")}</p>
          </article>
        )}
      />
      <CursorPaginationButton
        hasNextPage={listing.pageInfo.hasNextPage}
        busy={action.busy}
        label="logs de integração"
        onLoadMore={() => listing.load(true)}
      />
    </PageFrame>
  );
}
