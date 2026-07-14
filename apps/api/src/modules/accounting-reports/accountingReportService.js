/**
 * @file Services paginados de balancete e razão da MF2.
 */

import {
    buildCursorPage,
    buildKeysetCondition,
    decodePageCursor,
    parsePageLimit,
} from "../../lib/cursorPagination.js";
import { httpError } from "../../lib/httpErrors.js";

const MAX_EXPORT_ROWS = 25_000;

/**
 * Normaliza somas Prisma que podem ser nulas quando o período não tem linhas.
 *
 * @param {object | null | undefined} aggregate - Resultado de `_sum`.
 * @returns {{debitCents: number, creditCents: number, balanceCents: number}} Totais inteiros.
 */
function monetaryTotals(aggregate) {
    const debitCents = aggregate?.debitCents ?? 0;
    const creditCents = aggregate?.creditCents ?? 0;
    return {
        debitCents,
        creditCents,
        balanceCents: debitCents - creditCents,
    };
}

/**
 * Constrói o filtro multiempresa e temporal comum às linhas contabilísticas.
 *
 * @param {{companyId: string, from: Date, to: Date}} input - Contexto do relatório.
 * @returns {object} Filtro Prisma company-scoped.
 */
function journalLineWhere(input) {
    return {
        journalEntry: {
            companyId: input.companyId,
            entryDate: { gte: input.from, lte: input.to },
        },
    };
}

/**
 * Constrói uma página de balancete sem carregar todas as linhas do diário.
 *
 * As contas são paginadas por `code/id`; apenas os seus totais são agregados.
 * Uma segunda agregação devolve os totais do período completo para que cada
 * página mantenha o contexto contabilístico global.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, from: Date, to: Date, cursor?: unknown, limit?: unknown }} input - Filtros e paginação.
 * @returns {Promise<object>} Página de balancete.
 */
export async function buildTrialBalance(prisma, input) {
    const limit = parsePageLimit(input.limit);
    const cursor = decodePageCursor(input.cursor, "string");
    const keyset = buildKeysetCondition(cursor, {
        sortField: "code",
        direction: "asc",
    });
    const baseAccountWhere = { companyId: input.companyId, isActive: true };
    const accounts = await prisma.account.findMany({
        where: keyset
            ? { AND: [baseAccountWhere, keyset] }
            : baseAccountWhere,
        orderBy: [{ code: "asc" }, { id: "asc" }],
        take: limit + 1,
    });
    const accountPage = buildCursorPage(accounts, {
        limit,
        sortField: "code",
        sortType: "string",
    });
    const accountIds = accountPage.items.map((account) => account.id);
    const lineWhere = journalLineWhere(input);
    const [grouped, fullAggregate] = await Promise.all([
        accountIds.length > 0
            ? prisma.journalEntryLine.groupBy({
                  by: ["accountId"],
                  where: {
                      AND: [lineWhere, { accountId: { in: accountIds } }],
                  },
                  _sum: { debitCents: true, creditCents: true },
              })
            : Promise.resolve([]),
        prisma.journalEntryLine.aggregate({
            where: {
                AND: [
                    lineWhere,
                    {
                        account: {
                            companyId: input.companyId,
                            isActive: true,
                        },
                    },
                ],
            },
            _sum: { debitCents: true, creditCents: true },
        }),
    ]);
    const totalsByAccount = new Map(
        grouped.map((entry) => [entry.accountId, monetaryTotals(entry._sum)]),
    );
    const rows = accountPage.items.map((account) => ({
        accountId: account.id,
        code: account.code,
        name: account.name,
        ...(totalsByAccount.get(account.id) ?? monetaryTotals(null)),
    }));

    return {
        from: input.from,
        to: input.to,
        rows,
        totals: monetaryTotals(fullAggregate._sum),
        pageInfo: accountPage.pageInfo,
        source: "JournalEntryLine grouped by Account",
    };
}

/**
 * Constrói o filtro keyset das linhas posteriores ao cursor do razão.
 *
 * @param {{id: string, sortValue: Date} | null} cursor - Cursor validado.
 * @returns {object | null} Condição Prisma.
 */
function ledgerAfterCursor(cursor) {
    if (!cursor) return null;
    return {
        OR: [
            { journalEntry: { entryDate: { gt: cursor.sortValue } } },
            {
                journalEntry: { entryDate: cursor.sortValue },
                id: { gt: cursor.id },
            },
        ],
    };
}

/**
 * Constrói o filtro usado para calcular o saldo inicial da página atual.
 *
 * @param {{id: string, sortValue: Date} | null} cursor - Cursor validado.
 * @returns {object | null} Condição Prisma.
 */
function ledgerBeforeCursor(cursor) {
    if (!cursor) return null;
    return {
        OR: [
            { journalEntry: { entryDate: { lt: cursor.sortValue } } },
            {
                journalEntry: { entryDate: cursor.sortValue },
                id: { lt: cursor.id },
            },
        ],
    };
}

/**
 * Constrói uma página do razão de uma conta, incluindo saldo acumulado real.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, accountId: string, from: Date, to: Date, cursor?: unknown, limit?: unknown }} input - Filtros e paginação.
 * @returns {Promise<object>} Página do razão.
 */
export async function buildLedger(prisma, input) {
    const account = await prisma.account.findFirst({
        where: { id: input.accountId, companyId: input.companyId, isActive: true },
    });
    if (!account) {
        throw httpError(404, "ACCOUNT_NOT_FOUND", "Conta SNC não encontrada");
    }

    const limit = parsePageLimit(input.limit);
    const cursor = decodePageCursor(input.cursor, "date");
    const baseWhere = {
        accountId: account.id,
        ...journalLineWhere(input),
    };
    const afterCursor = ledgerAfterCursor(cursor);
    const beforeCursor = ledgerBeforeCursor(cursor);
    const [lines, fullAggregate, priorAggregate] = await Promise.all([
        prisma.journalEntryLine.findMany({
            where: afterCursor
                ? { AND: [baseWhere, afterCursor] }
                : baseWhere,
            include: { journalEntry: true },
            orderBy: [
                { journalEntry: { entryDate: "asc" } },
                { id: "asc" },
            ],
            take: limit + 1,
        }),
        prisma.journalEntryLine.aggregate({
            where: baseWhere,
            _sum: { debitCents: true, creditCents: true },
        }),
        beforeCursor
            ? prisma.journalEntryLine.aggregate({
                  where: { AND: [baseWhere, beforeCursor] },
                  _sum: { debitCents: true, creditCents: true },
              })
            : Promise.resolve({ _sum: null }),
    ]);
    let runningBalanceCents = monetaryTotals(priorAggregate._sum).balanceCents;
    const page = buildCursorPage(
        lines.map((line) => ({
            ...line,
            entryDate: line.journalEntry.entryDate,
        })),
        {
            limit,
            sortField: "entryDate",
            sortType: "date",
            serialize: (line) => {
                runningBalanceCents += line.debitCents - line.creditCents;
                return {
                    journalEntryId: line.journalEntryId,
                    entryDate: line.entryDate,
                    description: line.journalEntry.description,
                    source: line.journalEntry.source,
                    sourceId: line.journalEntry.sourceId,
                    debitCents: line.debitCents,
                    creditCents: line.creditCents,
                    balanceCents: runningBalanceCents,
                    memo: line.memo,
                };
            },
        },
    );

    return {
        from: input.from,
        to: input.to,
        account,
        rows: page.items,
        totals: monetaryTotals(fullAggregate._sum),
        pageInfo: page.pageInfo,
        source: "JournalEntryLine filtered by Account",
    };
}

/**
 * Percorre páginas internas para produzir uma exportação completa com teto.
 *
 * @param {(page: {cursor?: string, limit: number}) => Promise<object>} loader - Loader paginado.
 * @returns {Promise<object>} Relatório completo sem query ilimitada.
 */
async function collectReportForExport(loader) {
    const rows = [];
    let cursor;
    let report;
    do {
        report = await loader({ cursor, limit: 100 });
        rows.push(...report.rows);
        if (rows.length > MAX_EXPORT_ROWS) {
            throw httpError(
                413,
                "ACCOUNTING_REPORT_EXPORT_TOO_LARGE",
                `A exportação excede o limite de ${MAX_EXPORT_ROWS} linhas. Reduz o período.`,
            );
        }
        cursor = report.pageInfo.nextCursor ?? undefined;
    } while (cursor);

    return {
        ...report,
        rows,
        pageInfo: { nextCursor: null, hasNextPage: false },
    };
}

/**
 * Constrói balancete completo através de páginas limitadas para exportação.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{companyId: string, from: Date, to: Date}} input - Filtros autorizados.
 * @returns {Promise<object>} Balancete completo dentro do teto.
 */
export function buildTrialBalanceForExport(prisma, input) {
    return collectReportForExport((page) =>
        buildTrialBalance(prisma, { ...input, ...page }),
    );
}

/**
 * Constrói razão completo através de páginas limitadas para exportação.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{companyId: string, accountId: string, from: Date, to: Date}} input - Filtros autorizados.
 * @returns {Promise<object>} Razão completo dentro do teto.
 */
export function buildLedgerForExport(prisma, input) {
    return collectReportForExport((page) =>
        buildLedger(prisma, { ...input, ...page }),
    );
}
