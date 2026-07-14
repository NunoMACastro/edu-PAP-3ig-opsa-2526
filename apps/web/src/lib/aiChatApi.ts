/**
 * @file Cliente tipado das APIs canónicas de chat, consentimento e análise.
 */

import { apiClient, type JsonBody } from "./apiClient";

export interface AiChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export type AiTransactionDocumentType = "SALE" | "PURCHASE";

export interface AiTransactionAnalysis {
  modelVersion: string;
  scoreMeaning: string;
  scoreQuality: "COMPLETE" | "PARTIAL" | "INCONCLUSIVE";
  dataQuality: "COMPLETE" | "PARTIAL" | "INCONSISTENT";
  document: {
    id: string;
    number: string;
    type: AiTransactionDocumentType;
    status: string;
    posted: boolean;
    postedAt: string | null;
    totalCents: number;
    warehouseId: string | null;
  };
  recommendation: "PROCEED" | "PROCEED_WITH_CAUTION" | "REVIEW_BEFORE_PROCEEDING" | "DO_NOT_PROCEED_WITHOUT_REVIEW";
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  score: number | null;
  summary: string;
  riskFactors: Array<{ code: string; label: string; severity: string; value: string; explanation: string; sourceRef: string }>;
  futureActions: string[];
  facts: Array<{ metric: string; value: number | string | null; formattedValue: string; unit: string; sourceRef: string }>;
  sources: Array<{ type: string; id: string; label: string }>;
  limitations: string[];
  guardrail: string;
}

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  answer?: string;
  status: string;
  mode?: "openai" | "deterministic";
  limitations?: string[];
  followUpSuggestions?: string[];
  quality?: string;
  period?: { from: string; to: string; asOf: string; timezone: string } | null;
  sources?: Array<{ ref: string; label: string }>;
  payloadVersion?: 1 | 2;
  facts?: Array<{ id: string; metric: string; value: number | string | null; formattedValue: string; unit: string; sourceRef: string }>;
  analysis?: AiTransactionAnalysis;
  provider: string;
  model?: string | null;
  feedback?: string | null;
  createdAt: string;
}

export interface AiCompletedMessage extends AiChatMessage {
  answer: string;
  claims: Array<{ metric: string; value: number | string | null; sourceRef: string }>;
  sourceRefs: string[];
}

export interface AiPageInfo {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface AiCapabilities {
  chatAvailable: boolean;
  effectiveMode: "disabled" | "deterministic" | "openai";
  providerConfigured: boolean;
  companyOptIn: boolean;
  consentAccepted: boolean;
  policyVersion: string;
  limits: Record<string, number>;
}

export type AiStreamEvent =
  | { event: "message.started"; data: { status: string } }
  | { event: "tool.started" | "tool.completed"; data: { tool: string; status?: string } }
  | { event: "message.completed"; data: AiCompletedMessage }
  | { event: "message.cancelled"; data: { code: string; message: string } }
  | { event: "message.failed"; data: { code: string; message: string; fallbackAvailable: boolean } };

export const aiChatApi = {
  capabilities: () => apiClient.request<{ capabilities: AiCapabilities }>("GET", "/ai/capabilities"),
  sessions: (cursor?: string | null) => apiClient.request<{ sessions: AiChatSession[]; pageInfo: AiPageInfo }>("GET", `/ai/chat/sessions${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`),
  createSession: (title?: string) => apiClient.request<{ session: AiChatSession }>("POST", "/ai/chat/sessions", { body: title ? { title } : {} }),
  messages: (sessionId: string, cursor?: string | null) => apiClient.request<{ messages: AiChatMessage[]; pageInfo: AiPageInfo }>("GET", `/ai/chat/sessions/${encodeURIComponent(sessionId)}/messages${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`),
  deleteSession: (sessionId: string) => apiClient.request<void>("DELETE", `/ai/chat/sessions/${encodeURIComponent(sessionId)}`),
  send: (sessionId: string, body: JsonBody, onEvent: (event: AiStreamEvent) => void, signal?: AbortSignal) => apiClient.requestSse(`/ai/chat/sessions/${encodeURIComponent(sessionId)}/messages`, { body, signal }, (event) => onEvent(event as AiStreamEvent)),
  feedback: (messageId: string, feedback: "USEFUL" | "NOT_USEFUL") => apiClient.request("POST", `/ai/chat/messages/${encodeURIComponent(messageId)}/feedback`, { body: { feedback } }),
  consent: () => apiClient.request<{ consent: { policyVersion: string; accepted: boolean; acceptedAt: string | null } }>("GET", "/ai/consent"),
  acceptConsent: () => apiClient.request("POST", "/ai/consent", { body: {} }),
  revokeConsent: () => apiClient.request<void>("DELETE", "/ai/consent"),
  settings: () => apiClient.request<Record<string, unknown>>("GET", "/ai/settings"),
  updateSettings: (body: JsonBody) => apiClient.request("PATCH", "/ai/settings", { body }),
  createAnalysisRun: (from: string, to: string) => apiClient.request<{ run: { id: string; status: string } }>("POST", "/ai/analysis-runs", { body: { from, to } }),
  analysisRun: (id: string) => apiClient.request<{ run: { id: string; status: string; resultSummary?: Record<string, number> } }>("GET", `/ai/analysis-runs/${encodeURIComponent(id)}`),
  transactionAnalysis: (documentType: AiTransactionDocumentType, documentId: string) => apiClient.request<{ analysis: AiTransactionAnalysis }>("POST", "/ai/transaction-analysis", { body: { documentType, documentId } }),
};
