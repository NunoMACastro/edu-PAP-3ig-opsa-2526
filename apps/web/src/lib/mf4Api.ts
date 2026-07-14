/**
 * @file Cliente API tipado para os fluxos MF4.
 */

import { createApiClient, JsonBody } from "./apiClient";
import {
  cursorPaginationQuery,
  type CursorPage,
  type CursorPagination,
} from "./cursorPagination";

const client = createApiClient();

export interface AiInsight {
  id: string;
  type: string;
  severity: string;
  title: string;
  summary: string;
  explanation: string;
  sourceType: string;
  sourceId: string;
  sourceLabel: string;
  suggestedAction?: string | null;
  status: string;
  score?: number;
  periodFrom?: string | null;
  periodTo?: string | null;
  asOf?: string | null;
  evidence?: Record<string, unknown> | null;
}

export interface AiSourceQuality {
  confidence: "low" | "medium" | "high";
  limitation: string;
  source: {
    type: string;
    id: string;
    label: string;
  };
}

export interface AiActionSuggestion {
  id: string;
  actionType: string;
  title: string;
  rationale: string;
  sourceLabel: string;
  status: string;
  sourceQuality?: AiSourceQuality;
  guardrail?: string;
}

export interface AiQuestionAnswer {
  id: string;
  question: string;
  intent: string;
  answer: string;
  sources: Array<{ type: string; id: string }>;
}

export interface SmartAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  sourceLabel: string;
  status: string;
  score?: number;
  periodFrom?: string | null;
  periodTo?: string | null;
  asOf?: string | null;
}

export interface InsightExplanation {
  id: string;
  title: string;
  explanation: string;
  source: { type: string; id: string; label: string };
  guardrail: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  dueAt: string;
  status: string;
}

export interface OperationalTaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  dueAt: string;
  assignedToId?: string | null;
}

export interface TaskAssignee {
  id: string;
  name: string;
}

export interface InAppNotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  sourceType: string;
  sourceId: string;
  readAt?: string | null;
}

export interface AlertPreferenceItem {
  type: string;
  label: string;
  enabled: boolean;
  defaultEnabled: boolean;
  canDisable: boolean;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, string | number | boolean | null> | null;
  createdAt: string;
}

export interface IntegrationLogItem {
  id: string;
  integrationType: string;
  operation: string;
  status: string;
  sourceId?: string | null;
  fileName?: string | null;
  totalRows?: number | null;
  successRows?: number | null;
  errorRows?: number | null;
  message?: string | null;
  createdAt: string;
}

/**
 * Consulta insights com intervalo de datas validado no backend.
 *
 * @param from - Data inicial YYYY-MM-DD.
 * @param to - Data final YYYY-MM-DD.
 * @returns Lista de insights.
 */
export function getAiInsights(from: string, to: string) {
  return client.request<{ insights: AiInsight[] }>(
    "GET",
    `/ai/insights?page=1&pageSize=50&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  );
}

/**
 * Consulta sugestões de ação geradas pela IA para revisão humana.
 * A função não recebe filtros porque o backend usa a sessão e a empresa ativa.
 *
 * @returns Lista de sugestões abertas ou históricas devolvidas pela API.
 */
export function getAiSuggestions() {
  return client.request<{ suggestions: AiActionSuggestion[] }>("GET", "/ai/suggestions");
}

/**
 * Envia uma pergunta livre para o assistente de IA com fontes rastreáveis.
 * O texto é enviado no corpo do pedido para o backend aplicar validação e guardrails.
 *
 * @param question - Pergunta escrita pelo utilizador no formulário.
 * @returns Resposta estruturada com intenção, texto final e fontes usadas.
 */
export function askAiQuestion(question: string) {
  return client.request<{ answer: AiQuestionAnswer }>("POST", "/ai/questions", {
    body: { question },
  });
}

/**
 * Consulta alertas inteligentes para um intervalo temporal validado pela API.
 * As datas seguem o formato usado pelos inputs HTML e são codificadas na query string.
 *
 * @param from - Data inicial no formato YYYY-MM-DD.
 * @param to - Data final no formato YYYY-MM-DD.
 * @returns Lista de alertas calculados para a empresa ativa.
 */
export function getSmartAlerts(from: string, to: string) {
  return client.request<{ alerts: SmartAlert[] }>(
    "GET",
    `/ai/alerts?page=1&pageSize=50&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  );
}

export function createAiAnalysisRun(from: string, to: string) {
  return client.request<{ run: { id: string; status: string } }>("POST", "/ai/analysis-runs", { body: { from, to } });
}

export function getAiAnalysisRun(id: string) {
  return client.request<{ run: { id: string; status: string; resultSummary?: Record<string, number> } }>("GET", `/ai/analysis-runs/${encodeURIComponent(id)}`);
}

export function updateAiInsightStatus(id: string, status: string) {
  return client.request("PATCH", `/ai/insights/${encodeURIComponent(id)}/status`, { body: { status } });
}

export function updateAiSuggestionStatus(id: string, status: string, feedback?: string) {
  return client.request("PATCH", `/ai/suggestions/${encodeURIComponent(id)}/status`, { body: { status, feedback } });
}

export function updateSmartAlertStatus(id: string, status: string) {
  return client.request("PATCH", `/ai/alerts/${encodeURIComponent(id)}/status`, { body: { status } });
}

/**
 * Obtém a explicação pedagógica e auditável de um insight específico.
 * O identificador é codificado no caminho para evitar caracteres inseguros no URL.
 *
 * @param id - Identificador do insight cuja explicação deve ser consultada.
 * @returns Explicação do insight com fonte e guardrail associado.
 */
export function getInsightExplanation(id: string) {
  return client.request<{ explanation: InsightExplanation }>(
    "GET",
    `/ai/insights/${encodeURIComponent(id)}/explanation`,
  );
}

/**
 * Lista os lembretes operacionais visíveis na empresa ativa.
 * O backend resolve a sessão através dos cookies HttpOnly partilhados pelo client.
 *
 * @returns Coleção de lembretes ordenada pela API.
 */
export function getReminders() {
  return client.request<{ reminders: ReminderItem[] }>("GET", "/reminders");
}

/**
 * Cria um lembrete operacional com os campos normalizados pelo formulário.
 * A validação final continua no backend para proteger o contrato da API.
 *
 * @param body - Payload JSON com título, tipo, prazo e descrição opcional.
 * @returns Lembrete criado e persistido.
 */
export function createReminder(body: JsonBody) {
  return client.request<{ reminder: ReminderItem }>("POST", "/reminders", { body });
}

/**
 * Atualiza o estado funcional de um lembrete existente.
 * É usado pela UI para marcar lembretes como concluídos sem reescrever os restantes campos.
 *
 * @param id - Identificador do lembrete a atualizar.
 * @param status - Novo estado funcional, por exemplo `DONE`.
 * @returns Lembrete atualizado devolvido pela API.
 */
export function updateReminderStatus(id: string, status: string) {
  return client.request<{ reminder: ReminderItem }>(
    "PATCH",
    `/reminders/${encodeURIComponent(id)}`,
    { body: { status } },
  );
}

/**
 * Lista tarefas operacionais da empresa ativa.
 * A função centraliza o endpoint usado pelas páginas MF4 para manter a UI desacoplada do URL.
 *
 * @returns Lista de tarefas operacionais devolvida pelo backend.
 */
export function getTasks() {
  return client.request<{ tasks: OperationalTaskItem[] }>("GET", "/tasks");
}

/**
 * Lista membros ativos que podem receber uma tarefa na empresa atual.
 * O endpoint devolve apenas identificador e nome, sem exigir users.manage.
 *
 * @returns Responsáveis disponíveis para o seletor de tarefas.
 */
export function getTaskAssignees() {
  return client.request<{ assignees: TaskAssignee[] }>("GET", "/tasks/assignees");
}

/**
 * Cria uma tarefa operacional a partir dos dados recolhidos no formulário.
 * O payload é mantido genérico para acompanhar o contrato JSON validado pelo backend.
 *
 * @param body - Payload JSON com título, prazo, descrição e responsável opcional.
 * @returns Tarefa criada e persistida.
 */
export function createTask(body: JsonBody) {
  return client.request<{ task: OperationalTaskItem }>("POST", "/tasks", { body });
}

/**
 * Atualiza apenas o estado de uma tarefa operacional.
 * A UI usa esta chamada para concluir tarefas sem alterar título, prazo ou responsável.
 *
 * @param id - Identificador da tarefa a atualizar.
 * @param status - Novo estado funcional, por exemplo `DONE`.
 * @returns Tarefa atualizada devolvida pela API.
 */
export function updateTaskStatus(id: string, status: string) {
  return client.request<{ task: OperationalTaskItem }>(
    "PATCH",
    `/tasks/${encodeURIComponent(id)}/status`,
    { body: { status } },
  );
}

/**
 * Lista notificações internas disponíveis para o utilizador autenticado.
 * O resultado alimenta a página de notificações sem expor detalhes do transporte HTTP.
 *
 * @returns Notificações internas devolvidas pela API.
 */
export function getNotifications() {
  return client.request<{ notifications: InAppNotificationItem[] }>("GET", "/notifications");
}

export function getNotificationPreferences() {
  return client.request<{ preferences: AlertPreferenceItem[] }>("GET", "/notifications/preferences");
}

export function updateNotificationPreference(type: string, enabled: boolean) {
  return client.request<{ preference: AlertPreferenceItem }>("PATCH", `/notifications/preferences/${encodeURIComponent(type)}`, { body: { enabled } });
}

/**
 * Marca uma notificação interna como lida.
 * O identificador é codificado no URL e a API devolve o registo atualizado.
 *
 * @param id - Identificador da notificação a marcar como lida.
 * @returns Notificação atualizada com `readAt` preenchido quando aplicável.
 */
export function markNotificationRead(id: string) {
  return client.request<{ notification: InAppNotificationItem }>(
    "PATCH",
    `/notifications/${encodeURIComponent(id)}/read`,
  );
}

/**
 * Consulta logs de auditoria funcionais da empresa ativa.
 * A função agrega o contrato de leitura usado pela página de auditoria MF4.
 *
 * @returns Lista de eventos de auditoria devolvidos pelo backend.
 */
export function getAuditLogs(pagination: CursorPagination = {}) {
  return client.request<CursorPage<AuditLogItem>>(
    "GET",
    `/audit/logs${cursorPaginationQuery(pagination)}`,
  );
}

/**
 * Consulta logs de integração técnica e operacional.
 * A chamada alimenta a página MF4 que mostra importações, sincronizações e estados externos.
 *
 * @returns Lista de logs de integração devolvidos pela API.
 */
export function getIntegrationLogs(pagination: CursorPagination = {}) {
  return client.request<CursorPage<IntegrationLogItem>>(
    "GET",
    `/integrations/logs${cursorPaginationQuery(pagination)}`,
  );
}
