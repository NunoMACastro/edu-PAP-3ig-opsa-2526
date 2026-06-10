import { buildTrialBalance } from "../accounting-reports/accountingReportService.js";

/**
 * Demonstração de Resultados (DR)
 */
export async function buildIncomeStatement(
  prisma,
  { companyId, from, to }
) {
  const trialBalance = await buildTrialBalance(prisma, {
    companyId,
    from,
    to,
  });

  const revenues = trialBalance.rows.filter((row) =>
    row.code.startsWith("7")
  );

  const expenses = trialBalance.rows.filter((row) =>
    row.code.startsWith("6")
  );

  const revenueCents = revenues.reduce(
    (sum, row) => sum + Math.max(0, -row.balanceCents),
    0
  );

  const expenseCents = expenses.reduce(
    (sum, row) => sum + Math.max(0, row.balanceCents),
    0
  );

  return {
    from,
    to,
    sections: [
      {
        key: "revenues",
        totalCents: revenueCents,
        accounts: revenues,
      },
      {
        key: "expenses",
        totalCents: expenseCents,
        accounts: expenses,
      },
    ],
    netIncomeCents: revenueCents - expenseCents,
    source: "JournalEntryLine -> TrialBalance",
  };
}

/**
 * Balanço Patrimonial
 * (calculado à data final do intervalo)
 */
export async function buildBalanceSheet(
  prisma,
  { companyId, from, to }
) {
  const trialBalance = await buildTrialBalance(prisma, {
    companyId,
    from,
    to,
  });

  const rows = trialBalance.rows.filter(
    (row) =>
      !row.code.startsWith("6") &&
      !row.code.startsWith("7")
  );

  const assets = rows.filter(
    (row) =>
      row.balanceCents > 0 &&
      !row.code.startsWith("5")
  );

  const liabilities = rows.filter(
    (row) =>
      row.balanceCents < 0 &&
      !row.code.startsWith("5")
  );

  const equity = rows.filter((row) =>
    row.code.startsWith("5")
  );

  const assetCents = assets.reduce(
    (sum, row) => sum + row.balanceCents,
    0
  );

  const liabilityCents = liabilities.reduce(
    (sum, row) => sum + Math.abs(row.balanceCents),
    0
  );

  const equityCents = equity.reduce(
    (sum, row) => sum + Math.abs(row.balanceCents),
    0
  );

  return {
    from,
    to,
    sections: [
      {
        key: "assets",
        totalCents: assetCents,
        accounts: assets,
      },
      {
        key: "liabilities",
        totalCents: liabilityCents,
        accounts: liabilities,
      },
      {
        key: "equity",
        totalCents: equityCents,
        accounts: equity,
      },
    ],
    checkCents:
      assetCents - liabilityCents - equityCents,
    source: "JournalEntryLine -> TrialBalance",
  };
}