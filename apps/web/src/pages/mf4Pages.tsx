/**
 * @file Páginas React dos fluxos MF4 de IA assistiva, lembretes, tarefas, notificações e auditoria.
 */

import { FormEvent, ReactNode, useState } from "react";
import { ApiError, JsonBody } from "../lib/apiClient";
import {
  AiActionSuggestion,
  AiInsight,
  AiQuestionAnswer,
  AuditLogItem,
  createReminder,
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
  InsightExplanation,
  IntegrationLogItem,
  markNotificationRead,
  OperationalTaskItem,
  ReminderItem,
  SmartAlert,
  syncNotifications,
  updateReminderStatus,
  updateTaskStatus,
  askAiQuestion,
} from "../lib/mf4Api";

/**
 * Formata erros da API para feedback em português.
 *
 * @param error - Erro capturado.
 * @returns Mensagem curta para UI.
 */
function formatError(error: Error | ApiError): string {
  if (error instanceof ApiError) return `${error.code}: ${error.message}`;
  return error.message;
}

/**
 * Data corrente no formato de input date.
 *
 * @returns Data ISO curta.
 */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Primeiro dia do mês corrente.
 *
 * @returns Data ISO curta.
 */
function firstDayOfMonth() {
  const date = new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}

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
 * Moldura visual comum das páginas MF4.
 *
 * @param props - Propriedades React.
 * @returns Elemento React.
 */
function PageFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="sectionHeader">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

/**
 * Feedback comum de carregamento/erro/sucesso.
 *
 * @param props - Propriedades React.
 * @returns Elemento React.
 */
function Feedback({
  busy,
  error,
  message,
}: {
  busy?: boolean;
  error?: string | null;
  message?: string | null;
}) {
  return (
    <>
      {busy ? <p className="empty">A carregar...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="success">{message}</p> : null}
    </>
  );
}

/**
 * Mostra dados estruturados sem recorrer a tipos inseguros na página.
 *
 * @param props - Propriedades React.
 * @returns Elemento React.
 */
function JsonResult<TValue>({ value }: { value: TValue | null }) {
  return <pre className="result">{JSON.stringify(value, null, 2)}</pre>;
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
}: {
  label: string;
  onSubmit: (from: string, to: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await onSubmit(
        requiredText(form.get("from"), "Data inicial"),
        requiredText(form.get("to"), "Data final"),
      );
    } catch (caught) {
      setError(formatError(caught as Error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="operation" onSubmit={submit}>
      <h3>{label}</h3>
      <div className="fields">
        <label>
          <span>Data inicial</span>
          <input name="from" required defaultValue={firstDayOfMonth()} />
        </label>
        <label>
          <span>Data final</span>
          <input name="to" required defaultValue={today()} />
        </label>
      </div>
      <Feedback busy={busy} error={error} />
      <button type="submit" disabled={busy}>
        Consultar
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

export function AiInsightsPage() {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [explanation, setExplanation] = useState<InsightExplanation | null>(null);
  return (
    <PageFrame title="Insights automáticos">
      <DateRangeForm
        label="Gerar insights"
        onSubmit={async (from, to) => {
          const result = await getAiInsights(from, to);
          setInsights(result.insights);
          setExplanation(null);
        }}
      />
      <SimpleList
        items={insights}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <p>{item.sourceLabel}</p>
            <button
              type="button"
              onClick={async () =>
                setExplanation((await getInsightExplanation(item.id)).explanation)
              }
            >
              Ver explicação
            </button>
          </article>
        )}
      />
      <JsonResult value={explanation} />
    </PageFrame>
  );
}

export function AiSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<AiActionSuggestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      setSuggestions((await getAiSuggestions()).suggestions);
    } catch (caught) {
      setError(formatError(caught as Error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageFrame title="Sugestões de ação">
      <button type="button" onClick={load} disabled={busy}>
        {busy ? "A carregar..." : "Atualizar"}
      </button>
      <Feedback error={error} />
      <SimpleList
        items={suggestions}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.rationale}</p>
            <p>{item.actionType} · {item.sourceLabel}</p>
          </article>
        )}
      />
    </PageFrame>
  );
}

export function AiQuestionsPage() {
  const [answer, setAnswer] = useState<AiQuestionAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      setAnswer((await askAiQuestion(requiredText(form.get("question"), "Pergunta"))).answer);
    } catch (caught) {
      setError(formatError(caught as Error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageFrame title="Perguntas com fonte">
      <form className="operation" onSubmit={submit}>
        <h3>Perguntar</h3>
        <textarea name="question" required rows={4} />
        <Feedback busy={busy} error={error} />
        <button type="submit" disabled={busy}>Perguntar</button>
      </form>
      <JsonResult value={answer} />
    </PageFrame>
  );
}

export function SmartAlertsPage() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  return (
    <PageFrame title="Alertas inteligentes">
      <DateRangeForm
        label="Gerar alertas"
        onSubmit={async (from, to) => setAlerts((await getSmartAlerts(from, to)).alerts)}
      />
      <SimpleList
        items={alerts}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.message}</p>
            <p>{item.severity} · {item.sourceLabel}</p>
          </article>
        )}
      />
    </PageFrame>
  );
}

export function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      setReminders((await getReminders()).reminders);
    } catch (caught) {
      setError(formatError(caught as Error));
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body: JsonBody = {
      title: requiredText(form.get("title"), "Titulo"),
      description: optionalText(form.get("description")),
      type: requiredText(form.get("type"), "Tipo"),
      dueAt: requiredText(form.get("dueAt"), "Prazo"),
    };
    await createReminder(body);
    await load();
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Lembretes">
      <button type="button" onClick={load}>Atualizar</button>
      <Feedback error={error} />
      <form className="operation" onSubmit={submit}>
        <h3>Criar lembrete</h3>
        <div className="fields">
          <input name="title" placeholder="Titulo" required />
          <input name="type" placeholder="PAYMENT, TAX, DEADLINE ou OTHER" required />
          <input name="dueAt" placeholder="2026-06-30" required />
          <textarea name="description" rows={3} placeholder="Descrição" />
        </div>
        <button type="submit">Criar</button>
      </form>
      <SimpleList
        items={reminders}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.type} · {item.status} · {item.dueAt.slice(0, 10)}</p>
            <button type="button" onClick={async () => {
              await updateReminderStatus(item.id, "DONE");
              await load();
            }}>
              Concluir
            </button>
          </article>
        )}
      />
    </PageFrame>
  );
}

export function TasksPage() {
  const [tasks, setTasks] = useState<OperationalTaskItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      setTasks((await getTasks()).tasks);
    } catch (caught) {
      setError(formatError(caught as Error));
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body: JsonBody = {
      title: requiredText(form.get("title"), "Titulo"),
      description: optionalText(form.get("description")),
      dueAt: requiredText(form.get("dueAt"), "Prazo"),
      assignedToId: optionalText(form.get("assignedToId")),
    };
    await createTask(body);
    await load();
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Tarefas">
      <button type="button" onClick={load}>Atualizar</button>
      <Feedback error={error} />
      <form className="operation" onSubmit={submit}>
        <h3>Criar tarefa</h3>
        <div className="fields">
          <input name="title" placeholder="Titulo" required />
          <input name="dueAt" placeholder="2026-06-30" required />
          <input name="assignedToId" placeholder="User ID opcional" />
          <textarea name="description" rows={3} placeholder="Descrição" />
        </div>
        <button type="submit">Criar</button>
      </form>
      <SimpleList
        items={tasks}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.status} · {item.dueAt.slice(0, 10)}</p>
            <button type="button" onClick={async () => {
              await updateTaskStatus(item.id, "DONE");
              await load();
            }}>
              Concluir
            </button>
          </article>
        )}
      />
    </PageFrame>
  );
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<InAppNotificationItem[]>([]);

  async function load() {
    setNotifications((await getNotifications()).notifications);
  }

  return (
    <PageFrame title="Notificações">
      <button type="button" onClick={load}>Atualizar</button>
      <button type="button" onClick={async () => setNotifications((await syncNotifications()).notifications)}>
        Sincronizar
      </button>
      <SimpleList
        items={notifications}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.message}</p>
            <p>{item.readAt ? "Lida" : "Por ler"}</p>
            <button type="button" onClick={async () => {
              await markNotificationRead(item.id);
              await load();
            }}>
              Marcar lida
            </button>
          </article>
        )}
      />
    </PageFrame>
  );
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  return (
    <PageFrame title="Auditoria">
      <button type="button" onClick={async () => setLogs((await getAuditLogs()).logs)}>
        Atualizar
      </button>
      <JsonResult value={logs} />
    </PageFrame>
  );
}

export function IntegrationLogsPage() {
  const [logs, setLogs] = useState<IntegrationLogItem[]>([]);
  return (
    <PageFrame title="Logs de integração">
      <button type="button" onClick={async () => setLogs((await getIntegrationLogs()).logs)}>
        Atualizar
      </button>
      <JsonResult value={logs} />
    </PageFrame>
  );
}
