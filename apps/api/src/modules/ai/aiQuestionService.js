// apps/api/src/modules/ai/aiQuestionService.js
/**
 * Responde a pergunta de leitura com fontes reais.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma.
 * @param {{ companyId: string, userId: string, question: string }} input Contexto.
 * @returns {Promise<object>} Resposta guardada.
 */
export async function answerAiQuestion(prisma, input) {
    // A resposta nasce do último relatório operacional da empresa ativa.
    // Se não existir relatório, o sistema deve admitir falta de fonte.
    const report = await prisma.operationalReportRun.findFirst({ where: { companyId: input.companyId }, orderBy: { generatedAt: "desc" } });
    const lowered = input.question.toLowerCase();
    // A intenção é deliberadamente simples para o MVP: palavras-chave conhecidas
    // escolhem que métrica do relatório será explicada.
    const intent = lowered.includes("stock") ? "STOCK" : lowered.includes("compra") ? "PURCHASES" : lowered.includes("margem") ? "MARGIN" : "SALES";
    if (!report) {
        return { answer: "Ainda não existe relatório operacional para responder com fonte.", intent, sources: [] };
    }
    // Os valores continuam em cêntimos, como no resto da app financeira,
    // para evitar erros de arredondamento.
    const values = { SALES: report.revenueCents, PURCHASES: report.purchaseCents, MARGIN: report.marginCents, STOCK: report.stockValueCents };
    const answer = "Valor consultado para " + intent + ": " + values[intent] + " cêntimos.";
    const sources = [{ type: "OperationalReportRun", id: report.id, label: "Último relatório operacional" }];
    // Guardar a pergunta ajuda a auditar o que foi perguntado e que fonte sustentou a resposta.
    const run = await prisma.aiQuestionRun.create({ data: { companyId: input.companyId, question: input.question, answer, intent, sources, askedById: input.userId } });
    return { queryId: run.id, answer, intent, sources };
}