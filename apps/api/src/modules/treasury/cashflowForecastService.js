/**
 * @file Service de previsão de tesouraria da MF3.
 */

/**
 * Converte uma data para a chave diária usada pela previsão de tesouraria.
 * A chave ISO curta permite agregar entradas e saídas no mesmo balde diário.
 *
 * @param date - Data usada no cálculo.
 * @returns Chave de data em formato ISO curto.
 */
function toDateKey(date) {
    return date.toISOString().slice(0, 10);
}

/**
 * Escolhe a data de vencimento operacional de um documento para a previsão de tesouraria.
 *
 * @param document - Documento de negócio a processar.
 * @param fallbackField - Campo de data alternativo usado quando não existe vencimento.
 * @returns Data de vencimento operacional do documento.
 */
function documentDueDate(document, fallbackField) {
    return document.dueDate ?? document[fallbackField];
}

/**
 * Acumula movimentos previstos no balde diário correto da previsão de tesouraria.
 *
 * @param buckets - Coleção de baldes diários a atualizar.
 * @param date - Data a que o movimento previsto pertence.
 * @param field - Campo numérico a acumular.
 * @param amount - Valor monetário usado no cálculo.
 * @param source - Conteúdo onde o texto esperado é procurado.
 * @returns Não devolve valor; atualiza a coleção de baldes recebida.
 */
function addDailyBucket(buckets, date, field, amount, source) {
    const key = toDateKey(date);
    if (!buckets.has(key)) {
        buckets.set(key, {
            date: key,
            inflowCents: 0,
            outflowCents: 0,
            sources: [],
        });
    }
    const bucket = buckets.get(key);
    bucket[field] += amount;
    bucket.sources.push(source);
}

/**
 * Calcula previsão de entradas/saídas futuras sem alterar documentos.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input - Contexto.
 * @returns {Promise<object>} Forecast explicável.
 */
export async function buildCashflowForecast(prisma, input) {
    const [accounts, saleDocuments, purchaseDocuments] = await Promise.all([
        prisma.treasuryAccount.findMany({
            where: { companyId: input.companyId, isActive: true },
        }),
        prisma.saleDocument.findMany({
            where: {
                companyId: input.companyId,
                kind: { not: "CREDIT_NOTE" },
                status: { in: ["ISSUED", "SETTLED"] },
            },
            orderBy: { issuedAt: "asc" },
        }),
        prisma.purchaseDocument.findMany({
            where: {
                companyId: input.companyId,
                kind: { not: "SUPPLIER_CREDIT_NOTE" },
                status: { in: ["APPROVED", "POSTED", "PAID"] },
            },
            orderBy: { issuedAt: "asc" },
        }),
    ]);

    const openingBalanceCents = accounts.reduce(
        (sum, account) => sum + account.currentBalanceCents,
        0,
    );
    const buckets = new Map();

    for (const document of saleDocuments) {
        const openAmount = document.totalCents - document.amountPaidCents;
        const date = documentDueDate(document, "issuedAt");
        if (openAmount > 0 && date >= input.fromDate && date <= input.toDate) {
            addDailyBucket(buckets, date, "inflowCents", openAmount, {
                type: "SALE_DOCUMENT",
                id: document.id,
                amountCents: openAmount,
            });
        }
    }

    for (const document of purchaseDocuments) {
        const openAmount = document.totalCents - document.amountPaidCents;
        const date = documentDueDate(document, "issuedAt");
        if (openAmount > 0 && date >= input.fromDate && date <= input.toDate) {
            addDailyBucket(buckets, date, "outflowCents", openAmount, {
                type: "PURCHASE_DOCUMENT",
                id: document.id,
                amountCents: openAmount,
            });
        }
    }

    let runningBalanceCents = openingBalanceCents;
    const days = [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
    for (const day of days) {
        runningBalanceCents += day.inflowCents - day.outflowCents;
        day.projectedBalanceCents = runningBalanceCents;
    }

    const inflowCents = days.reduce((sum, day) => sum + day.inflowCents, 0);
    const outflowCents = days.reduce((sum, day) => sum + day.outflowCents, 0);
    const closingBalanceCents = openingBalanceCents + inflowCents - outflowCents;
    const sources = [
        "TreasuryAccount.currentBalanceCents",
        "SaleDocument totalCents - amountPaidCents",
        "PurchaseDocument totalCents - amountPaidCents",
    ];

    const run = await prisma.cashflowForecastRun.create({
        data: {
            companyId: input.companyId,
            fromDate: input.fromDate,
            toDate: input.toDate,
            openingBalanceCents,
            inflowCents,
            outflowCents,
            closingBalanceCents,
            sources,
            generatedById: input.userId,
        },
    });

    return {
        runId: run.id,
        fromDate: input.fromDate,
        toDate: input.toDate,
        openingBalanceCents,
        inflowCents,
        outflowCents,
        closingBalanceCents,
        days,
        sources,
        note: "Previsão analítica; não altera documentos, recebimentos ou pagamentos.",
    };
}
