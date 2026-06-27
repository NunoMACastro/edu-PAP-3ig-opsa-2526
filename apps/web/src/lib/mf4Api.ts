/**
 * @file Cliente API tipado para os fluxos MF4.
 */

import { createApiClient, JsonBody } from "./apiClient";

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
}

export interface AiActionSuggestion {
  id: string;
  actionType: string;
  title: string;
  rationale: string;
  sourceLabel: string;
  status: string;
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

export interface InAppNotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  sourceType: string;
  sourceId: string;
  readAt?: string | null;
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
    `/ai/insights?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  );
}

export function getAiSuggestions() {
  return client.request<{ suggestions: AiActionSuggestion[] }>("GET", "/ai/suggestions");
}

export function askAiQuestion(question: string) {
  return client.request<{ answer: AiQuestionAnswer }>("POST", "/ai/questions", {
    body: { question },
  });
}

export function getSmartAlerts(from: string, to: string) {
  return client.request<{ alerts: SmartAlert[] }>(
    "GET",
    `/ai/alerts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  );
}

export function getInsightExplanation(id: string) {
  return client.request<{ explanation: InsightExplanation }>(
    "GET",
    `/ai/insights/${encodeURIComponent(id)}/explanation`,
  );
}

export function getReminders() {
  return client.request<{ reminders: ReminderItem[] }>("GET", "/reminders");
}

export function createReminder(body: JsonBody) {
  return client.request<{ reminder: ReminderItem }>("POST", "/reminders", { body });
}

export function updateReminderStatus(id: string, status: string) {
  return client.request<{ reminder: ReminderItem }>(
    "PATCH",
    `/reminders/${encodeURIComponent(id)}`,
    { body: { status } },
  );
}

export function getTasks() {
  return client.request<{ tasks: OperationalTaskItem[] }>("GET", "/tasks");
}

export function createTask(body: JsonBody) {
  return client.request<{ task: OperationalTaskItem }>("POST", "/tasks", { body });
}

export function updateTaskStatus(id: string, status: string) {
  return client.request<{ task: OperationalTaskItem }>(
    "PATCH",
    `/tasks/${encodeURIComponent(id)}/status`,
    { body: { status } },
  );
}

export function getNotifications() {
  return client.request<{ notifications: InAppNotificationItem[] }>("GET", "/notifications");
}

export function syncNotifications() {
  return client.request<{ notifications: InAppNotificationItem[] }>(
    "POST",
    "/notifications/sync",
  );
}

export function markNotificationRead(id: string) {
  return client.request<{ notification: InAppNotificationItem }>(
    "PATCH",
    `/notifications/${encodeURIComponent(id)}/read`,
  );
}

export function getAuditLogs() {
  return client.request<{ logs: AuditLogItem[] }>("GET", "/audit/logs");
}

export function getIntegrationLogs() {
  return client.request<{ logs: IntegrationLogItem[] }>("GET", "/integrations/logs");
}
