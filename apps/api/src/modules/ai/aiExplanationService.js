// apps/api/src/modules/ai/aiExplanationService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Obtém explicação e fonte de um insight da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma.
 * @param {{ companyId: string, insightId: string }} input Contexto.
 * @returns {Promise<object>} Detalhe explicável do insight.
 */
export async function getInsightExplanation(prisma, input) {
    // O filtro por id + companyId transforma "não existe" e "não pertence à empresa"
    // na mesma resposta 404, evitando fuga de informação entre empresas.
    const insight = await prisma.aiInsight.findFirst({ where: { id: input.insightId, companyId: input.companyId } });
    if (!insight) throw httpError(404, "INSIGHT_NOT_FOUND", "Insight não encontrado na empresa ativa");
    return {
        // A resposta separa conteúdo, fonte e guardrail para a UI conseguir
        // mostrar cada parte de forma clara ao utilizador.
        id: insight.id, title: insight.title, summary: insight.summary, explanation: insight.explanation,
        source: { type: insight.sourceType, id: insight.sourceId, label: insight.sourceLabel },
        suggestedAction: insight.suggestedAction,
        guardrail: "A IA recomenda e explica; a decisão e a execução pertencem a utilizadores autorizados.",
    };
}