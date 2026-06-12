/**
 * @file Services de balancete e razão da MF2.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Constrói balancete por empresa e período.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, from: Date, to: Date }} input - Filtros.
 * @returns {Promise<object>} Balancete.
 */
export async function buildTrialBalance(prisma, input) {
    const accounts = await prisma.account.findMany({
        where: { companyId: input.companyId, isActive: true },
        orderBy: { code: "asc" },
    });
    const lines = await prisma.journalEntryLine.findMany({
        where: {
            journalEntry: {
                companyId: input.companyId,
                entryDate: { gte: input.from, lte: input.to },
            },
        },
        include: { account: true },
    });
    const totalsByAccount = new Map(
        accounts.map((account) => [
            account.id,
            {
                accountId: account.id,
                code: account.code,
                name: account.name,
                debitCents: 0,
                creditCents: 0,
                balanceCents: 0,
            },
        ]),
    );

    for (const line of lines) {
        const row = totalsByAccount.get(line.accountId);
        if (!row) continue;
        row.debitCents += line.debitCents;
        row.creditCents += line.creditCents;
        row.balanceCents = row.debitCents - row.creditCents;
    }

    const rows = [...totalsByAccount.values()];
    return {
        from: input.from,
        to: input.to,
        rows,
        totals: {
            debitCents: rows.reduce((sum, row) => sum + row.debitCents, 0),
            creditCents: rows.reduce((sum, row) => sum + row.creditCents, 0),
            balanceCents: rows.reduce((sum, row) => sum + row.balanceCents, 0),
        },
        source: "JournalEntryLine grouped by Account",
    };
}

/**
 * Constrói razão de uma conta.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, accountId: string, from: Date, to: Date }} input - Filtros.
 * @returns {Promise<object>} Razão.
 */
export async function buildLedger(prisma, input) {
    const account = await prisma.account.findFirst({
        where: { id: input.accountId, companyId: input.companyId, isActive: true },
    });
    if (!account) {
        throw httpError(404, "ACCOUNT_NOT_FOUND", "Conta SNC não encontrada");
    }

    const lines = await prisma.journalEntryLine.findMany({
        where: {
            accountId: account.id,
            journalEntry: {
                companyId: input.companyId,
                entryDate: { gte: input.from, lte: input.to },
            },
        },
        include: { journalEntry: true },
        orderBy: { journalEntry: { entryDate: "asc" } },
    });
    let runningBalanceCents = 0;
    const rows = lines.map((line) => {
        runningBalanceCents += line.debitCents - line.creditCents;
        return {
            journalEntryId: line.journalEntryId,
            entryDate: line.journalEntry.entryDate,
            description: line.journalEntry.description,
            source: line.journalEntry.source,
            sourceId: line.journalEntry.sourceId,
            debitCents: line.debitCents,
            creditCents: line.creditCents,
            balanceCents: runningBalanceCents,
            memo: line.memo,
        };
    });

    return {
        from: input.from,
        to: input.to,
        account,
        rows,
        totals: {
            debitCents: rows.reduce((sum, row) => sum + row.debitCents, 0),
            creditCents: rows.reduce((sum, row) => sum + row.creditCents, 0),
            balanceCents: runningBalanceCents,
        },
        source: "JournalEntryLine filtered by Account",
    };
}
