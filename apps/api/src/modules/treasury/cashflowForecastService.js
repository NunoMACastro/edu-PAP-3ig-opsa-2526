// apps/api/src/modules/treasury/cashflowForecastService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte uma data para chave diária ISO.
 *
 * @param {Date} date Data a agregar.
 * @returns {string} Chave `YYYY-MM-DD`.
 */
function dayKey(date) {
    return date.toISOString().slice(0, 10);
}

/**
 * Soma entrada ou saída prevista ao dia correto.
 *
 * @param {Map<string, { date: string, expectedInCents: number, expectedOutCents: number, sources: string[] }>} map Linhas diárias.
 * @param {Date} date Data de vencimento.
 * @param {{ expectedInCents?: number, expectedOutCents?: number, source: string }} patch Valor e fonte.
 * @returns {void}
 */
function addLine(map, date, patch) {
    const key = dayKey(date);
    const current = map.get(key) ?? { date: key, expectedInCents: 0, expectedOutCents: 0, sources: [] };
    current.expectedInCents += patch.expectedInCents ?? 0;
    current.expectedOutCents += patch.expectedOutCents ?? 0;
    current.sources.push(patch.source);
    map.set(key, current);
}

/**
 * Soma apenas o snapshot mais recente de cada conta de tesouraria.
 *
 * @param {Array<{ treasuryAccountId: string, balanceCents: number, capturedAt: Date }>} snapshots Snapshots ordenados por conta e data descendente.
 * @returns {number} Saldo inicial agregado em cêntimos.
 */
function sumLatestBalancesByAccount(snapshots) {
    const latestByAccount = new Map();
    for (const snapshot of snapshots) {
        if (!latestByAccount.has(snapshot.treasuryAccountId)) {
            latestByAccount.set(snapshot.treasuryAccountId, snapshot);
        }
    }
    return [...latestByAccount.values()].reduce((sum, snapshot) => sum + snapshot.balanceCents, 0);
}

/**
 * Calcula previsão de tesouraria por dia para a empresa ativa.
 *
 * A função é apenas analítica: não altera documentos, recebimentos, pagamentos nem contabilidade.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input Contexto multiempresa e período validado.
 * @returns {Promise<{ runId: string, from: string, to: string, openingBalanceCents: number, expectedInCents: number, expectedOutCents: number, closingBalanceCents: number, rows: Array<{ date: string, expectedInCents: number, expectedOutCents: number, projectedBalanceCents: number, sources: string[] }> }>} Forecast pronto para UI e IA explicável futura.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 quando não há empresa ativa.
 */
export async function buildCashflowForecast(prisma, { companyId, userId, fromDate, toDate }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    const [snapshots, salesOpen, purchasesOpen] = await Promise.all([
        prisma.treasuryBalanceSnapshot.findMany({
            where: { companyId },
            orderBy: [{ treasuryAccountId: "asc" }, { capturedAt: "desc" }],
            select: { treasuryAccountId: true, balanceCents: true, capturedAt: true },
        }),
        prisma.saleDocument.findMany({
            where: { companyId, status: { in: ["ISSUED", "SETTLED"] }, dueDate: { not: null, gte: fromDate, lte: toDate } },
            select: { id: true, dueDate: true, totalCents: true, amountPaidCents: true },
        }),
        prisma.purchaseDocument.findMany({
            where: { companyId, status: { in: ["APPROVED", "POSTED", "PAID"] }, dueDate: { not: null, gte: fromDate, lte: toDate } },
            select: { id: true, dueDate: true, totalCents: true, amountPaidCents: true },
        }),
    ]);

    const openingBalanceCents = sumLatestBalancesByAccount(snapshots);
    const days = new Map();

    // Para prever futuro usamos valores em aberto; recebimentos/pagamentos já realizados reduzem amountPaidCents.
    for (const document of salesOpen) {
        const openAmountCents = Math.max(0, document.totalCents - document.amountPaidCents);
        if (openAmountCents > 0) addLine(days, document.dueDate, { expectedInCents: openAmountCents, source: `SaleDocument:${document.id}` });
    }

    for (const document of purchasesOpen) {
        const openAmountCents = Math.max(0, document.totalCents - document.amountPaidCents);
        if (openAmountCents > 0) addLine(days, document.dueDate, { expectedOutCents: openAmountCents, source: `PurchaseDocument:${document.id}` });
    }

    let runningBalanceCents = openingBalanceCents;
    const rows = [...days.values()].sort((a, b) => a.date.localeCompare(b.date)).map((row) => {
        runningBalanceCents += row.expectedInCents - row.expectedOutCents;
        return { ...row, projectedBalanceCents: runningBalanceCents };
    });

    const expectedInCents = [...days.values()].reduce((sum, item) => sum + item.expectedInCents, 0);
    const expectedOutCents = [...days.values()].reduce((sum, item) => sum + item.expectedOutCents, 0);
    const closingBalanceCents = openingBalanceCents + expectedInCents - expectedOutCents;

    const run = await prisma.cashflowForecastRun.create({ data: { companyId, fromDate, toDate, openingBalanceCents, expectedInCents, expectedOutCents, closingBalanceCents, generatedById: userId } });
    return { runId: run.id, from: dayKey(fromDate), to: dayKey(toDate), openingBalanceCents, expectedInCents, expectedOutCents, closingBalanceCents, rows };
}