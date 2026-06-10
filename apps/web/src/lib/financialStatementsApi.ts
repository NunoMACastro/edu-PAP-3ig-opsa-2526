// apps/web/src/lib/financialStatementsApi.ts
export type StatementSection = {
  key: string;
  totalCents: number;
  accounts: Array<{
    accountId: string;
    code: string;
    name: string;
    balanceCents: number;
  }>;
};

export type IncomeStatement = {
  sections: StatementSection[];
  netIncomeCents: number;
  source: string;
};

export type BalanceSheet = {
  sections: StatementSection[];
  checkCents: number;
  source: string;
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Erro inesperado." }));
    throw new Error(body.message ?? "Erro inesperado.");
  }

  return response.json() as Promise<T>;
}

function toQuery(params: { from: string; to: string }) {
  return new URLSearchParams(params).toString();
}

export async function fetchIncomeStatement(params: { from: string; to: string }) {
  const response = await fetch(`/api/accounting/statements/income-statement?${toQuery(params)}`, {
    credentials: "include",
  });

  return readJson<{ statement: IncomeStatement }>(response);
}

export async function fetchBalanceSheet(params: { from: string; to: string }) {
  const response = await fetch(`/api/accounting/statements/balance-sheet?${toQuery(params)}`, {
    credentials: "include",
  });

  return readJson<{ statement: BalanceSheet }>(response);
}