// apps/api/src/modules/accounting-reports/accountingReportService.js
import { httpError } from "../../lib/httpErrors.js";

export async function buildTrialBalance(prisma, { companyId, from, to }) {
  const accounts = await prisma.account.findMany({
    where: { companyId, isActive: true },
    orderBy: { code: "asc" },
  });
  const rows = [];

  for (const account of accounts) {
    const lines = await prisma.journalEntryLine.findMany({
      where: {
        accountId: account.id,
        journalEntry: { companyId, entryDate: { gte: from, lte: to } },
      },
    });
    const debitCents = lines.reduce((sum, line) => sum + line.debitCents, 0);
    const creditCents = lines.reduce((sum, line) => sum + line.creditCents, 0);

    if (debitCents || creditCents) {
      rows.push({
        accountId: account.id,
        code: account.code,
        name: account.name,
        debitCents,
        creditCents,
        balanceCents: debitCents - creditCents,
      });
    }
  }

  return { from, to, rows };
}

export async function buildLedger(prisma, { companyId, accountId, from, to }) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, companyId, isActive: true },
    select: { id: true, code: true, name: true },
  });

  if (!account) throw httpError(404, "ACCOUNT_NOT_FOUND", "Conta SNC não encontrada.");

  const lines = await prisma.journalEntryLine.findMany({
    where: {
      accountId,
      journalEntry: { companyId, entryDate: { gte: from, lte: to } },
    },
    orderBy: [{ journalEntry: { entryDate: "asc" } }, { id: "asc" }],
    include: {
      journalEntry: {
        select: { id: true, entryDate: true, description: true, source: true },
      },
    },
  });

  let runningBalanceCents = 0;
  const rows = lines.map((line) => {
    runningBalanceCents += line.debitCents - line.creditCents;
    return {
      entryId: line.journalEntry.id,
      lineId: line.id,
      date: line.journalEntry.entryDate,
      description: line.journalEntry.description,
      source: line.journalEntry.source,
      debitCents: line.debitCents,
      creditCents: line.creditCents,
      balanceCents: runningBalanceCents,
    };
  });

  return { from, to, account, rows };
}