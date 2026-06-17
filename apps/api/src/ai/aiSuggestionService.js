// real_dev/api/src/modules/ai/aiSuggestionService.js
const actionByInsight = {
    NEGATIVE_MARGIN: "PRICE_REVIEW",
    LOW_STOCK: "STOCK_REPLENISHMENT",
    STOPPED_ITEM: "SUPPLIER_NEGOTIATION",
};

/**
 * Cria sugestões a partir de insights abertos da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma.
 * @param {{ companyId: string, userId: string }} input Contexto autenticado.
 * @returns {Promise<object[]>} Sugestões abertas.
 */
export async function buildActionSuggestions(prisma, input) {
    // Só usamos insights abertos da empresa ativa. Um insight fechado já foi tratado
    // ou deixou de ser relevante, por isso não deve gerar nova sugestão.
    const insights = await prisma.aiInsight.findMany({ where: { companyId: input.companyId, status: "OPEN" } });
    const suggestions = [];
    for (const insight of insights) {
        const actionType = actionByInsight[insight.type];
        // Se o tipo não estiver mapeado, o sistema fica silencioso em vez de inventar
        // uma ação. Este é um guardrail simples contra recomendações sem fundamento.
        if (!actionType) continue;
        suggestions.push(
            // A chave única impede duplicar a mesma sugestão para o mesmo insight.
            // O aluno deve reconhecer este padrão sempre que uma consulta materializa dados.
            await prisma.aiActionSuggestion.upsert({
                where: {
                    companyId_insightId_actionType: {
                        companyId: input.companyId,
                        insightId: insight.id,
                        actionType,
                    },
                },
                update: {
                    title: insight.suggestedAction ?? "Rever insight antes de decidir",
                    rationale: insight.explanation,
                    sourceLabel: insight.sourceLabel,
                    status: "OPEN",
                    createdById: input.userId,
                },
                create: {
                    companyId: input.companyId,
                    insightId: insight.id,
                    actionType,
                    title: insight.suggestedAction ?? "Rever insight antes de decidir",
                    rationale: insight.explanation,
                    sourceLabel: insight.sourceLabel,
                    createdById: input.userId,
                },
            }),
        );
    }
    return suggestions;
}