// apps/web/src/lib/accountingReportsApi.ts
export type TrialBalanceRow = {
  accountId: string;
  code: string;
  name: string;
  debitCents: number;
  creditCents: number;
  balanceCents: number;
};

export type LedgerRow = {
  entryId: string;
  lineId: string;
  date: string;
  description: string;
  debitCents: number;
  creditCents: number;
  balanceCents: number;
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Erro inesperado." }));
    throw new Error(body.message ?? "Erro inesperado.");
  }

  return response.json() as Promise<T>;
}

function toQuery(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

export async function fetchTrialBalance(params: { from: string; to: string }) {
  const response = await fetch(`/api/accounting/reports/trial-balance?${toQuery(params)}`, {
    credentials: "include",
  });

  return readJson<{ report: { rows: TrialBalanceRow[] } }>(response);
}

export async function fetchLedger(params: { from: string; to: string; accountId: string }) {
  const response = await fetch(`/api/accounting/reports/ledger?${toQuery(params)}`, {
    credentials: "include",
  });

  return readJson<{ report: { rows: LedgerRow[] } }>(response);
}