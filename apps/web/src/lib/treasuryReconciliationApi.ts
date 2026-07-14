/**
 * @file Cliente tipado para recuperar importações e sugestões de reconciliação bancária.
 */

import { createApiClient } from "./apiClient";
import {
  cursorPaginationQuery,
  type CursorPage,
  type CursorPagination,
} from "./cursorPagination";

export interface ReconciliationSuggestion {
  id?: string;
  statementLineId: string;
  targetType: "RECEIPT" | "PAYMENT";
  targetId: string;
  amountCents: number;
  confidenceBps: number;
  reason: string;
  status?: string;
}

export interface StatementLine {
  id: string;
  entryDate: string;
  description: string;
  reference?: string | null;
  amountCents: number;
  suggestions: ReconciliationSuggestion[];
}

export interface StatementImportSummary {
  id: string;
  fileName: string;
  format: string;
  status: string;
  totalLines: number;
  acceptedLines: number;
  rejectedLines: number;
  importedAt: string;
  treasuryAccount?: { id: string; name: string } | null;
}

export interface StatementImportDetail extends StatementImportSummary {
  lines: StatementLine[];
}

export type StatementImportPage = CursorPage<StatementImportSummary>;

export interface ReconciliationResult {
  statementLineId: string;
  suggestions: ReconciliationSuggestion[];
  status: "complete" | "partial";
  durationMs: number;
  withinBudget: boolean;
  budgetMs: number;
}

const client = createApiClient();

export function listStatementImports(pagination: CursorPagination = {}) {
  return client.request<StatementImportPage>(
    "GET",
    `/treasury/statement-imports${cursorPaginationQuery(pagination)}`,
  );
}

export function getStatementImport(id: string) {
  return client.request<{ statementImport: StatementImportDetail }>(
    "GET",
    `/treasury/statement-imports/${encodeURIComponent(id)}`,
  );
}

export function refreshReconciliationSuggestions(statementLineId: string) {
  return client.request<ReconciliationResult>(
    "POST",
    "/treasury/reconciliations/suggestions",
    { body: { statementLineId, candidateLimit: 50 }, timeoutMs: 3_500 },
  );
}
