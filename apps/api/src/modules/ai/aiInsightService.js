// real_dev/api/src/modules/ai/aiInsightService.js
/**
 * Cria um título curto para o insight.
 *
 * @param {string} type Tipo funcional do insight.
 * @returns {string} Título em PT-PT.
 */
function insightTitle(type) {
    const titles = {
        NEGATIVE_MARGIN: "Margem operacional negativa",
        LOW_STOCK: "Artigo abaixo do stock mínimo",
        STOPPED_ITEM: "Artigo sem movimento recente",
    };
    return titles[type] ?? "Insight operacional";
}

/**
 * Gera insights determinísticos com fontes reais da OPSA.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input Contexto autenticado.
 * @returns {Promise<object[]>} Insights criados para a empresa ativa.
 */
export async function generateAiInsights(prisma, input) {
    // Lemos as três fontes em paralelo porque são consultas independentes.
    // Isto ensina uma regra prática: quando os dados não dependem uns dos outros,
    // `Promise.all` reduz tempo de espera sem misturar responsabilidades.
    const [lastReport, stockBalances, alertSettings] = await Promise.all([
        prisma.operationalReportRun.findFirst({
            where: { companyId: input.companyId, fromDate: { gte: input.fromDate }, toDate: { lte: input.toDate } },
            orderBy: { generatedAt: "desc" },
        }),
        prisma.stockBalance.findMany({
            where: { companyId: input.companyId },
            include: { item: true, warehouse: true },
        }),
        prisma.stockAlertSetting.findMany({ where: { companyId: input.companyId } }),
    ]);

    // A chave composta item:armazem permite encontrar rapidamente a regra de alerta
    // que corresponde a cada saldo de stock, sem fazer nova query dentro do ciclo.
    const settingsByKey = new Map(alertSettings.map((setting) => [setting.itemId + ":" + setting.warehouseId, setting]));
    const candidates = [];

    // Cada candidato guarda a origem concreta do dado. Isto é obrigatório em IA explicável:
    // o aluno deve conseguir dizer "este insight veio deste relatório".
    if (lastReport && lastReport.marginCents < 0) {
        candidates.push({
            type: "NEGATIVE_MARGIN",
            severity: "HIGH",
            summary: "A margem operacional do período está negativa.",
            explanation: "O cálculo vem de OperationalReportRun.marginCents e indica que compras superaram vendas no relatório operacional.",
            sourceType: "OperationalReportRun",
            sourceId: lastReport.id,
            sourceLabel: "Relatório operacional " + lastReport.id,
            suggestedAction: "Rever preços, compras e artigos com menor rotação antes de decidir alterações.",
        });
    }

    for (const balance of stockBalances) {
        const setting = settingsByKey.get(balance.itemId + ":" + balance.warehouseId);
        const quantity = Number(balance.quantity);
        if (setting?.minQuantity && quantity < Number(setting.minQuantity)) {
            // A regra não decide repor stock automaticamente; só cria um sinal explicável.
            // A ação final continua a pertencer a uma pessoa com contexto de negócio.
            candidates.push({
                type: "LOW_STOCK", severity: "MEDIUM",
                summary: balance.item.name + " está abaixo do stock mínimo.",
                explanation: "O cálculo compara StockBalance.quantity com StockAlertSetting.minQuantity.",
                sourceType: "StockBalance", sourceId: balance.id,
                sourceLabel: balance.item.sku + " em " + balance.warehouse.name,
                suggestedAction: "Avaliar reposição de stock com base em vendas recentes.",
            });
        }
    }

    const insights = [];
    for (const candidate of candidates) {
        insights.push(
            // O upsert torna a geração idempotente: repetir o pedido atualiza o mesmo insight
            // em vez de criar várias cópias iguais para a mesma empresa/fonte.
            await prisma.aiInsight.upsert({
                where: {
                    companyId_type_sourceType_sourceId: {
                        companyId: input.companyId,
                        type: candidate.type,
                        sourceType: candidate.sourceType,
                        sourceId: candidate.sourceId,
                    },
                },
                update: {
                    severity: candidate.severity,
                    summary: candidate.summary,
                    explanation: candidate.explanation,
                    sourceLabel: candidate.sourceLabel,
                    suggestedAction: candidate.suggestedAction,
                    status: "OPEN",
                    generatedById: input.userId,
                    generatedAt: new Date(),
                },
                create: {
                    ...candidate,
                    title: insightTitle(candidate.type),
                    companyId: input.companyId,
                    generatedById: input.userId,
                },
            }),
        );
    }
    return insights;
}