/**
 * @file Service de KPIs executivos MF3.
 */

import { recordAuditLog } from "../audit/auditLogService.js";
import {
    calculateAccountingMargin,
    weightedAverageDays,
} from "../ai/aiMetricCatalog.js";

/**
 * Aplica o sinal contabilístico correto a vendas e notas de crédito.
 * Em relatórios executivos, notas de crédito reduzem receita em vez de somarem ao total.
 *
 * @param document - Documento de negócio a processar.
 * @returns Total de venda com sinal contabilístico aplicado.
 */
function signedSaleTotal(document) {
    return document.kind === "CREDIT_NOTE" ? -document.totalCents : document.totalCents;
}

/**
 * Aplica sinal contabilístico correto a compras e notas de crédito em relatórios.
 *
 * @param document - Documento de negócio a processar.
 * @returns Total de compra com sinal contabilístico aplicado.
 */
function signedPurchaseTotal(document) {
    return document.kind === "SUPPLIER_CREDIT_NOTE"
        ? -document.totalCents
        : document.totalCents;
}

/**
 * Calcula uma média protegida contra listas vazias.
 *
 * @param values - Valores normalizados do formulário.
 * @returns Média calculada, ou zero quando não há valores.
 */
function average(values) {
    if (values.length === 0) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Calcula a diferença inteira de dias entre duas datas.
 *
 * @param from - Data inicial do intervalo.
 * @param to - Data final do intervalo.
 * @returns Número inteiro de dias entre as duas datas.
 */
function daysBetween(from, to) {
    return Math.max(0, (to.getTime() - from.getTime()) / 86_400_000);
}

/**
 * Calcula receita, custos, EBITDA MVP, PMR e PMP com fontes.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input - Contexto.
 * @returns {Promise<object>} KPIs calculados.
 */
export async function buildExecutiveKpis(prisma, input) {
    const [receipts, payments, journalLines] =
        await Promise.all([
            prisma.receipt.findMany({
                where: {
                    companyId: input.companyId,
                    receivedAt: { gte: input.fromDate, lte: input.toDate },
                },
                include: { saleDocument: true },
            }),
            prisma.payment.findMany({
                where: {
                    companyId: input.companyId,
                    paidAt: { gte: input.fromDate, lte: input.toDate },
                },
                include: { purchaseDocument: true },
            }),
            prisma.journalEntryLine.findMany({
                where: {
                    journalEntry: {
                        companyId: input.companyId,
                        entryDate: { gte: input.fromDate, lte: input.toDate },
                    },
                },
                select: {
                    debitCents: true,
                    creditCents: true,
                    account: { select: { code: true } },
                },
            }),
        ]);

    const accounting = calculateAccountingMargin(journalLines);
    const revenueCents = accounting.revenueCents;
    const costCents = accounting.operatingExpenseCents;
    const ebitdaCents = accounting.ebitdaCents;
    const pmr = weightedAverageDays(receipts, "receivedAt", "saleDocument");
    const pmp = weightedAverageDays(payments, "paidAt", "purchaseDocument");
    const pmrDays = pmr.days;
    const pmpDays = pmp.days;
    const sources = [
        "JournalEntryLine + Account.code (classes SNC 6/7)",
        "Receipt.receivedAt para PMR",
        "Payment.paidAt para PMP",
    ];

    const run = await prisma.$transaction(async (tx) => {
        const created = await tx.executiveKpiRun.create({
            data: {
                companyId: input.companyId,
                fromDate: input.fromDate,
                toDate: input.toDate,
                revenueCents,
                costCents,
                ebitdaCents,
                operatingResultCents: accounting.operatingResultCents,
                operatingMarginBps: accounting.operatingMarginBps,
                accountingMethod: accounting.method,
                dataQuality: accounting.quality,
                pmrDays,
                pmpDays,
                sources,
                generatedById: input.userId,
            },
        });
        await recordAuditLog(tx, {
            companyId: input.companyId,
            userId: input.userId,
            action: "EXECUTIVE_KPIS_GENERATED",
            entity: "ExecutiveKpiRun",
            entityId: created.id,
            details: { sourceCount: sources.length },
        });
        return created;
    });

    return {
        runId: run.id,
        fromDate: input.fromDate,
        toDate: input.toDate,
        revenueCents,
        costCents,
        ebitdaCents,
        operatingResultCents: accounting.operatingResultCents,
        operatingMarginBps: accounting.operatingMarginBps,
        pmrDays,
        pmpDays,
        pmrCoverage: pmr,
        pmpCoverage: pmp,
        dataQuality: accounting.quality,
        sources,
        formulas: {
            ebitda: accounting.method,
            pmr: "média ponderada pelo valor de cada recebimento parcial",
            pmp: "média ponderada pelo valor de cada pagamento parcial",
        },
        note: accounting.quality === "INSUFFICIENT_DATA"
            ? "INSUFFICIENT_DATA: EBITDA e resultado operacional não foram inventados."
            : "Indicadores operacionais internos; PMR/PMP incluem pagamentos parciais.",
    };
}
