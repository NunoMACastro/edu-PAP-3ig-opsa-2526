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

/* ============================================================
 * INSIGHTS IA
 * ============================================================
 */

export interface AiSourceReference {
  type: string;
  id: string;
  label: string;
}

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
  return request<{ explanation: InsightExplanation }>(
    "GET",
    "/ai/insights/" + encodeURIComponent(id) + "/explanation"
  );
}

/* ============================================================
 * LEMBRETES
 * ============================================================
 */

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
  return request<{ items: ReminderItem[] }>(
    "GET",
    "/reminders"
  );
}

/** Cria lembrete operacional. */
export function createReminder(body: ReminderInput) {
  return request<{ item: ReminderItem }>(
    "POST",
    "/reminders",
    body
  );
}

/** Atualiza estado de um lembrete existente. */
export function updateReminderStatus(
  id: string,
  status: ReminderStatus
) {
  return request<{ item: ReminderItem }>(
    "PATCH",
    "/reminders/" + encodeURIComponent(id) + "/status",
    { status }
  );
}

/* ============================================================
 * TAREFAS
 * ============================================================
 */

export type OperationalTaskStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELLED";

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
  return request<{ items: OperationalTask[] }>(
    "GET",
    "/tasks"
  );
}

/** Cria tarefa atribuída a um membro ativo da empresa. */
export function createOperationalTask(
  body: OperationalTaskInput
) {
  return request<{ item: OperationalTask }>(
    "POST",
    "/tasks",
    body
  );
}

/** Atualiza estado de uma tarefa operacional. */
export function updateOperationalTaskStatus(
  id: string,
  status: OperationalTaskStatus
) {
  return request<{ item: OperationalTask }>(
    "PATCH",
    "/tasks/" + encodeURIComponent(id) + "/status",
    { status }
  );
}

/* ============================================================
 * NOTIFICAÇÕES
 * ============================================================
 */

export interface InAppNotification {
  id: string;
  sourceType: string;
  sourceId: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

/** Lista notificações do utilizador autenticado. */
export function loadNotifications() {
  return request<{ notifications: InAppNotification[] }>(
    "GET",
    "/notifications"
  );
}

/** Sincroniza notificações a partir de lembretes e alertas. */
export function syncNotifications() {
  return request<{ notifications: InAppNotification[] }>(
    "POST",
    "/notifications/sync"
  );
}

/** Marca uma notificação como lida. */
export function markNotificationAsRead(id: string) {
  return request<{ notification: InAppNotification }>(
    "PATCH",
    "/notifications/" + encodeURIComponent(id) + "/read"
  );
}