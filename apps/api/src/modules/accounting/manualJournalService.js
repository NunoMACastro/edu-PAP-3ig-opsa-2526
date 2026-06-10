// apps/api/src/modules/accounting/manualJournalService.js
import { randomUUID } from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

const MANUAL_SOURCE = "MANUAL";

export function parseManualJournal(input) {
  const entryDate = new Date(String(input?.entryDate ?? ""));
  const description = String(input?.description ?? "").trim() || "Lançamento manual";
  const lines = Array.isArray(input?.lines) ? input.lines : [];
  const parsed = lines.map((line) => {
    const debitCents = Number(line.debitCents ?? 0);
    const creditCents = Number(line.creditCents ?? 0);

    if (!Number.isInteger(debitCents) || !Number.isInteger(creditCents) || debitCents < 0 || creditCents < 0) {
      throw httpError(400, "INVALID_JOURNAL_LINE_AMOUNT", "Os valores da linha têm de ser cêntimos positivos.");
    }

    if ((debitCents === 0 && creditCents === 0) || (debitCents > 0 && creditCents > 0)) {
      throw httpError(400, "INVALID_JOURNAL_LINE_SIDE", "Cada linha tem débito ou crédito, não ambos.");
    }

    return {
      accountId: String(line.accountId ?? "").trim(),
      debitCents,
      creditCents,
      memo: String(line.memo ?? "").trim(),
    };
  });
  const debit = parsed.reduce((sum, line) => sum + line.debitCents, 0);
  const credit = parsed.reduce((sum, line) => sum + line.creditCents, 0);

  if (Number.isNaN(entryDate.getTime())) throw httpError(400, "INVALID_ENTRY_DATE", "Data do lançamento inválida.");
  if (parsed.some((line) => !line.accountId)) throw httpError(400, "ACCOUNT_REQUIRED", "Todas as linhas precisam de conta SNC.");
  if (parsed.length < 2 || debit !== credit) throw httpError(400, "JOURNAL_NOT_BALANCED", "O lançamento tem de estar equilibrado.");

  return {
    entryDate,
    description,
    lines: parsed,
  };
}

async function assertAccountsBelongToCompany(tx, { companyId, lines }) {
  const accountIds = [...new Set(lines.map((line) => line.accountId))];
  const accounts = await tx.account.findMany({
    where: { id: { in: accountIds }, companyId, isActive: true },
    select: { id: true },
  });
  const foundIds = new Set(accounts.map((account) => account.id));
  const missingId = accountIds.find((accountId) => !foundIds.has(accountId));

  if (missingId) {
    throw httpError(404, "ACCOUNT_NOT_FOUND", "Conta SNC não encontrada.");
  }
}

async function assertManualJournalEditable(tx, { companyId, id }) {
  const entry = await tx.journalEntry.findFirst({
    where: { id, companyId },
    include: {
      lines: { orderBy: { createdAt: "asc" } },
      attachments: {
        select: { id: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!entry) {
    throw httpError(404, "JOURNAL_ENTRY_NOT_FOUND", "Lançamento não encontrado.");
  }

  if (entry.source !== MANUAL_SOURCE) {
    throw httpError(409, "JOURNAL_ENTRY_NOT_MANUAL", "Só lançamentos manuais podem ser editados neste ecrã.");
  }

  return entry;
}

export async function getManualJournal(prisma, { companyId, id }) {
  return prisma.$transaction((tx) => assertManualJournalEditable(tx, { companyId, id }));
}

export async function createManualJournal(prisma, { companyId, userId, input }) {
  const data = parseManualJournal(input);
  return prisma.$transaction(async (tx) => {
    await assertOpenFiscalPeriod(tx, { companyId, documentDate: data.entryDate });
    await assertAccountsBelongToCompany(tx, { companyId, lines: data.lines });

    const entry = await tx.journalEntry.create({
      data: {
        companyId,
        source: MANUAL_SOURCE,
        sourceId: `MANUAL-${randomUUID()}`,
        entryDate: data.entryDate,
        description: data.description,
        createdById: userId,
        lines: { create: data.lines },
      },
      include: { lines: true },
    });

    await tx.auditLog.create({
      data: {
        companyId,
        userId,
        action: "MANUAL_JOURNAL_CREATED",
        entity: "JournalEntry",
        entityId: entry.id,
        details: { lines: data.lines.length, source: MANUAL_SOURCE },
      },
    });

    return entry;
  });
}

export async function updateManualJournal(prisma, { companyId, userId, id, input }) {
  const data = parseManualJournal(input);

  return prisma.$transaction(async (tx) => {
    const currentEntry = await assertManualJournalEditable(tx, { companyId, id });

    await assertOpenFiscalPeriod(tx, { companyId, documentDate: currentEntry.entryDate });
    await assertOpenFiscalPeriod(tx, { companyId, documentDate: data.entryDate });
    await assertAccountsBelongToCompany(tx, { companyId, lines: data.lines });

    const entry = await tx.journalEntry.update({
      where: { id: currentEntry.id },
      data: {
        entryDate: data.entryDate,
        description: data.description,
        lines: {
          deleteMany: {},
          create: data.lines,
        },
      },
      include: {
        lines: { orderBy: { createdAt: "asc" } },
        attachments: {
          select: { id: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        companyId,
        userId,
        action: "MANUAL_JOURNAL_UPDATED",
        entity: "JournalEntry",
        entityId: entry.id,
        details: {
          previousLineCount: currentEntry.lines.length,
          newLineCount: data.lines.length,
          source: MANUAL_SOURCE,
        },
      },
    });

    return entry;
  });
}