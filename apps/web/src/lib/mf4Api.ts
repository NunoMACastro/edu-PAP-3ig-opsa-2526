export interface SmartAlert {
    id: string;
    type: string;
    severity: string;
    title: string;
    message: string;
    sourceType: string;
    sourceId: string;
    status: string;
}

export interface SmartAlertsResponse {
    alerts: SmartAlert[];
}

/**
 * Cliente HTTP simples baseado em fetch.
 * (Substitui o "client" inexistente no teu projeto)
 */
async function request<T>(
    method: string,
    url: string,
    body?: unknown
): Promise<T> {
    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erro na API");
    }

    return res.json();
}

/** Consulta alertas inteligentes da empresa ativa */
export function getSmartAlerts() {
    return request<SmartAlertsResponse>("GET", "/ai/alerts");
}

// função a adicionar em apps/web/src/lib/mf4Api.ts
export interface InsightExplanation {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  source: AiSourceReference;
  suggestedAction: string | null;
  guardrail: string;
}

/** Consulta explicação e fonte de um insight. */
export function getInsightExplanation(id: string) {
  // O id entra no caminho da URL, por isso é codificado para evitar caracteres
  // problemáticos e manter o pedido HTTP previsível.
  return client.request<{ explanation: InsightExplanation }>(
    "GET",
    "/ai/insights/" + encodeURIComponent(id) + "/explanation",
  );
}
// função a adicionar em apps/web/src/lib/mf4Api.ts
export type ReminderType = "DEADLINE" | "PAYMENT" | "TAX";
export type ReminderStatus = "OPEN" | "DONE" | "CANCELLED";

export interface ReminderItem {
  id: string;
  type: ReminderType;
  title: string;
  dueDate: string;
  status: ReminderStatus;
  notes: string | null;
}

export interface ReminderInput {
  type: ReminderType;
  title: string;
  dueDate: string;
  notes?: string;
}

/** Lista lembretes da empresa ativa. */
export function loadReminders() {
  return client.request<{ items: ReminderItem[] }>("GET", "/reminders");
}

/** Cria lembrete operacional. */
export function createReminder(body: ReminderInput) {
  return client.request<{ item: ReminderItem }>("POST", "/reminders", { body });
}

/** Atualiza estado de um lembrete existente. */
export function updateReminderStatus(id: string, status: ReminderStatus) {
  return client.request<{ item: ReminderItem }>("PATCH", "/reminders/" + encodeURIComponent(id) + "/status", {
    body: { status },
  });
}

// função a adicionar em apps/web/src/lib/mf4Api.ts
export type OperationalTaskStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export interface OperationalTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: OperationalTaskStatus;
  assignedToId: string;
}

export interface OperationalTaskInput {
  title: string;
  description?: string;
  dueDate: string;
  assignedToId: string;
}

/** Lista tarefas operacionais. */
export function loadOperationalTasks() {
  return client.request<{ items: OperationalTask[] }>("GET", "/tasks");
}

/** Cria tarefa atribuída a um membro ativo da empresa. */
export function createOperationalTask(body: OperationalTaskInput) {
  return client.request<{ item: OperationalTask }>("POST", "/tasks", { body });
}

/** Atualiza estado de uma tarefa operacional. */
export function updateOperationalTaskStatus(id: string, status: OperationalTaskStatus) {
  return client.request<{ item: OperationalTask }>("PATCH", "/tasks/" + encodeURIComponent(id) + "/status", {
    body: { status },
  });
}
