/**
 * @file Cliente do contrato assíncrono de exportação SAF-T integral.
 */

import { createApiClient } from "./apiClient";

export type SaftExportStatus =
  | "PENDING"
  | "GENERATING"
  | "VALIDATING"
  | "READY"
  | "FAILED";

export interface SaftExportSummary {
  id: string;
  type: "FULL";
  fiscalPeriodId: string;
  status: SaftExportStatus;
  createdAt: string;
  validationMode: "ACADEMIC" | "EXTERNAL" | null;
  certified: boolean;
  legalValidity: boolean | null;
  openPeriodSnapshot: boolean;
  asOfDate: string | null;
  fromDate: string | null;
  toDate: string | null;
  warning: string | null;
  fileName: string | null;
  sha256: string | null;
  sizeBytes: number | null;
  validation: {
    xsdStatus: string;
    totalsStatus: string;
    externalReviewStatus: string;
  } | null;
  completedAt: string | null;
  downloadAvailable: boolean;
}

export interface SaftRuntimeStatus {
  mode: "DISABLED" | "ACADEMIC" | "EXTERNAL";
  available: boolean;
  certifiedOutput: boolean;
}

export type SaftExportDetail = SaftExportSummary;

const client = createApiClient();

export function getSaftRuntimeStatus() {
  return client.request<SaftRuntimeStatus>("GET", "/compliance/saft/status");
}

export function createFullSaftExport(fiscalPeriodId: string) {
  return client.request<{ export: SaftExportSummary }>(
    "POST",
    "/compliance/saft/exports",
    { body: { type: "FULL", fiscalPeriodId } },
  );
}

export function getSaftExport(id: string, signal?: AbortSignal) {
  return client.request<{ export: SaftExportDetail }>(
    "GET",
    `/compliance/saft/exports/${encodeURIComponent(id)}`,
    { signal },
  );
}

export function downloadSaftExport(id: string) {
  return client.requestFile(
    "GET",
    `/compliance/saft/exports/${encodeURIComponent(id)}/download`,
    { timeoutMs: 60_000 },
  );
}
