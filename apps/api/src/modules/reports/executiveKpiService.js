/**
 * @file Service de KPIs executivos MF3.
 */

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
    const [saleDocuments, purchaseDocuments, receipts, payments] =
        await Promise.all([
            prisma.saleDocument.findMany({
                where: {
                    companyId: input.companyId,
                    issuedAt: { gte: input.fromDate, lte: input.toDate },
                    status: { in: ["ISSUED", "SETTLED"] },
                },
            }),
            prisma.purchaseDocument.findMany({
                where: {
                    companyId: input.companyId,
                    issuedAt: { gte: input.fromDate, lte: input.toDate },
                    status: { in: ["APPROVED", "POSTED", "PAID"] },
                },
            }),
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
        ]);

    const revenueCents = saleDocuments.reduce(
        (sum, document) => sum + signedSaleTotal(document),
        0,
    );
    const costCents = purchaseDocuments.reduce(
        (sum, document) => sum + signedPurchaseTotal(document),
        0,
    );
    const ebitdaCents = revenueCents - costCents;
    const pmrDays = average(
        receipts.map((receipt) =>
            daysBetween(receipt.saleDocument.issuedAt, receipt.receivedAt),
        ),
    );
    const pmpDays = average(
        payments.map((payment) =>
            daysBetween(payment.purchaseDocument.issuedAt, payment.paidAt),
        ),
    );
    const sources = [
        "SaleDocument emitidos/liquidados",
        "PurchaseDocument aprovados/lançados/pagos",
        "Receipt.receivedAt para PMR",
        "Payment.paidAt para PMP",
    ];

    const run = await prisma.executiveKpiRun.create({
        data: {
            companyId: input.companyId,
            fromDate: input.fromDate,
            toDate: input.toDate,
            revenueCents,
            costCents,
            ebitdaCents,
            pmrDays,
            pmpDays,
            sources,
            generatedById: input.userId,
        },
    });

    return {
        runId: run.id,
        fromDate: input.fromDate,
        toDate: input.toDate,
        revenueCents,
        costCents,
        ebitdaCents,
        pmrDays,
        pmpDays,
        sources,
        formulas: {
            ebitda: "receita - custos conhecidos no MVP",
            pmr: "média simples entre data da venda e data do recebimento",
            pmp: "média simples entre data da compra e data do pagamento",
        },
        note: "Indicadores operacionais MVP; sem dados suficientes PMR/PMP devolvem null.",
    };
}
