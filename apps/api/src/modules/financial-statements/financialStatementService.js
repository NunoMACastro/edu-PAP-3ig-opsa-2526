/**
 * @file Services de demonstrações financeiras internas da MF2.
 */

import { buildTrialBalance } from "../accounting-reports/accountingReportService.js";

function sum(rows, mapper) {
    return rows.reduce((total, row) => total + mapper(row), 0);
}

/**
 * Demonstração de Resultados interna por período.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, from: Date, to: Date }} input - Filtros.
 * @returns {Promise<object>} DR interna.
 */
export async function buildIncomeStatement(prisma, input) {
    const trialBalance = await buildTrialBalance(prisma, input);
    const revenues = trialBalance.rows.filter((row) => row.code.startsWith("7"));
    const expenses = trialBalance.rows.filter((row) => row.code.startsWith("6"));
    const revenueCents = sum(revenues, (row) => Math.max(0, -row.balanceCents));
    const expenseCents = sum(expenses, (row) => Math.max(0, row.balanceCents));

    return {
        from: input.from,
        to: input.to,
        sections: [
            { key: "revenues", label: "Rendimentos", totalCents: revenueCents, accounts: revenues },
            { key: "expenses", label: "Gastos", totalCents: expenseCents, accounts: expenses },
        ],
        netIncomeCents: revenueCents - expenseCents,
        source: "JournalEntryLine -> TrialBalance",
        note: "Mapa interno explicável; não substitui submissão legal oficial.",
    };
}

/**
 * Constrói Balanço interno a partir de um balancete já calculado.
 *
 * @param {object} trialBalance - Balancete de origem.
 * @param {{ from: Date, to: Date }} input - Filtros originais.
 * @returns {object} Balanço interno.
 */
export function buildBalanceSheetFromTrialBalance(trialBalance, input) {
    const rows = trialBalance.rows.filter(
        (row) => !row.code.startsWith("6") && !row.code.startsWith("7"),
    );
    const assets = rows.filter(
        (row) => row.balanceCents > 0 && !row.code.startsWith("5"),
    );
    const liabilities = rows.filter(
        (row) => row.balanceCents < 0 && !row.code.startsWith("5"),
    );
    const equity = rows.filter((row) => row.code.startsWith("5"));
    const assetCents = sum(assets, (row) => row.balanceCents);
    const liabilityCents = sum(liabilities, (row) => Math.abs(row.balanceCents));
    const equityCents = sum(equity, (row) => Math.abs(row.balanceCents));

    return {
        from: input.from,
        to: input.to,
        sections: [
            {
                key: "assets",
                label: "Ativo",
                totalCents: assetCents,
                accounts: assets,
            },
            {
                key: "liabilities",
                label: "Passivo",
                totalCents: liabilityCents,
                accounts: liabilities,
            },
            {
                key: "equity",
                label: "Capital próprio",
                totalCents: equityCents,
                accounts: equity,
            },
        ],
        checkCents: assetCents - liabilityCents - equityCents,
        source: "JournalEntryLine -> TrialBalance",
        note: "Balanço interno explicável por natureza do saldo; não é demonstração legal oficial completa.",
    };
}

/**
 * Balanço interno derivado do balancete.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, from: Date, to: Date }} input - Filtros.
 * @returns {Promise<object>} Balanço interno.
 */
export async function buildBalanceSheet(prisma, input) {
    const trialBalance = await buildTrialBalance(prisma, input);
    return buildBalanceSheetFromTrialBalance(trialBalance, input);
}
