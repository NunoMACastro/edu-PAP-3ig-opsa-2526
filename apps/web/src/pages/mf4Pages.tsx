/**
 * @file Páginas React dos fluxos MF4 de IA assistiva, lembretes, tarefas, notificações e auditoria.
 */

import { FormEvent, ReactNode, useState } from "react";
import { JsonBody } from "../lib/apiClient";
import { assertMf5FormData } from "../lib/mf5FormValidators";
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
import { AiSourceQualityPanel, PageFrame, StatusMessage } from "../ui/opsaUi";
import { type ActionFeedbackState, useActionFeedback } from "../ui/useActionFeedback";

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
 * Mostra dados estruturados sem recorrer a tipos inseguros na página.
 *
 * @param props - Propriedades React.
 * @returns Elemento React.
 */
function JsonResult<TValue>({ value }: { value: TValue | null }) {
  return <pre className="result">{JSON.stringify(value, null, 2)}</pre>;
}

/**
 * Apresenta o estado produzido pelo hook comum de feedback da MF5.
 *
 * @param props - Estado de feedback a renderizar.
 * @returns Mensagem transversal quando existe feedback visivel.
 */
function ActionFeedbackMessage({ feedback }: { feedback: ActionFeedbackState }) {
  if (!feedback.message) return null;
  return (
    <StatusMessage tone={feedback.tone} title={feedback.title}>
      {feedback.message}
    </StatusMessage>
  );
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
          <input name="from" type="date" required defaultValue={firstDayOfMonth()} />
        </label>
        <label>
          <span>Data final</span>
          <input name="to" type="date" required defaultValue={today()} />
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
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [explanation, setExplanation] = useState<InsightExplanation | null>(null);
  const explanationAction = useActionFeedback();
  return (
    <PageFrame title="Insights automáticos">
      <DateRangeForm
        label="Gerar insights"
        startMessage="A gerar insights..."
        successMessage="Insights gerados com sucesso."
        errorMessage="Nao foi possivel gerar os insights."
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
          </article>
        )}
      />
      <ActionFeedbackMessage feedback={explanationAction.feedback} />
      <JsonResult value={explanation} />
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
          </article>
        )}
      />
    </PageFrame>
  );
}

/**
 * Renderiza a página de perguntas à IA com fontes rastreáveis.
 * A resposta fica visível em JSON para apoiar a validação pedagógica do contrato.
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
        <textarea name="question" required rows={4} />
        <ActionFeedbackMessage feedback={action.feedback} />
        <button type="submit" disabled={action.busy}>
          {action.busy ? "A perguntar..." : "Perguntar"}
        </button>
      </form>
      <JsonResult value={answer} />
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
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  return (
    <PageFrame title="Alertas inteligentes">
      <DateRangeForm
        label="Gerar alertas"
        startMessage="A gerar alertas..."
        successMessage="Alertas gerados com sucesso."
        errorMessage="Nao foi possivel gerar os alertas."
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
          <input name="title" placeholder="Titulo" required />
          <input name="type" placeholder="PAYMENT, TAX, DEADLINE ou OTHER" required />
          <input name="dueAt" type="date" placeholder="2026-06-30" required />
          <textarea name="description" rows={3} placeholder="Descrição" />
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
  const action = useActionFeedback();

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
      <form className="operation" onSubmit={submit}>
        <h3>Criar tarefa</h3>
        <div className="fields">
          <input name="title" placeholder="Titulo" required />
          <input name="dueAt" type="date" placeholder="2026-06-30" required />
          <input name="assignedToId" placeholder="User ID opcional" />
          <textarea name="description" rows={3} placeholder="Descrição" />
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
  const action = useActionFeedback();

  /**
   * Recarrega notificações da API e atualiza o estado local.
   * É usada após sincronizar ou marcar notificações como lidas.
   *
   * @returns Promise resolvida quando a lista de notificações fica atualizada.
   */
  async function fetchNotifications() {
    setNotifications((await getNotifications()).notifications);
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
      <button
        type="button"
        disabled={action.busy}
        onClick={async () => {
          try {
            await action.run(
              async () => {
                setNotifications((await syncNotifications()).notifications);
              },
              {
                startMessage: "A sincronizar notificacoes...",
                successMessage: "Notificacoes sincronizadas.",
                errorMessage: "Nao foi possivel sincronizar notificacoes.",
              },
            );
          } catch {
            // O feedback de erro ja esta visivel.
          }
        }}
      >
        Sincronizar
      </button>
      {action.feedback.message ? (
        <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
          {action.feedback.message}
        </StatusMessage>
      ) : null}
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
 * Renderiza a página de auditoria funcional.
 * A página carrega eventos de auditoria e mostra a estrutura devolvida pela API.
 *
 * @returns Elemento React com ação de atualização e resultado JSON.
 */
export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const action = useActionFeedback();
  return (
    <PageFrame title="Auditoria">
      <button
        type="button"
        disabled={action.busy}
        onClick={async () => {
          try {
            await action.run(
              async () => {
                setLogs((await getAuditLogs()).logs);
              },
              {
                startMessage: "A atualizar auditoria...",
                successMessage: "Auditoria atualizada.",
                errorMessage: "Nao foi possivel carregar a auditoria.",
              },
            );
          } catch {
            // O feedback de erro ja esta visivel.
          }
        }}
      >
        {action.busy ? "A executar..." : "Atualizar"}
      </button>
      {action.feedback.message ? (
        <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
          {action.feedback.message}
        </StatusMessage>
      ) : null}
      <JsonResult value={logs} />
    </PageFrame>
  );
}

/**
 * Renderiza a página de logs de integração.
 * A página ajuda a validar importações e integrações mostrando o detalhe técnico registado.
 *
 * @returns Elemento React com ação de atualização e logs em JSON.
 */
export function IntegrationLogsPage() {
  const [logs, setLogs] = useState<IntegrationLogItem[]>([]);
  const action = useActionFeedback();
  return (
    <PageFrame title="Logs de integração">
      <button
        type="button"
        disabled={action.busy}
        onClick={async () => {
          try {
            await action.run(
              async () => {
                setLogs((await getIntegrationLogs()).logs);
              },
              {
                startMessage: "A atualizar logs de integracao...",
                successMessage: "Logs de integracao atualizados.",
                errorMessage: "Nao foi possivel carregar os logs de integracao.",
              },
            );
          } catch {
            // O feedback de erro ja esta visivel.
          }
        }}
      >
        {action.busy ? "A executar..." : "Atualizar"}
      </button>
      {action.feedback.message ? (
        <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
          {action.feedback.message}
        </StatusMessage>
      ) : null}
      <JsonResult value={logs} />
    </PageFrame>
  );
}
