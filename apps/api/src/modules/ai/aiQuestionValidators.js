// apps/api/src/modules/ai/aiQuestionValidators.js
import { httpError } from "../../lib/httpErrors.js";

const blockedVerbs = ["aprovar", "emitir", "pagar", "lançar", "apagar", "alterar", "criar fatura"];

/**
 * Valida pergunta de leitura para RF41.
 *
 * @param {Record<string, unknown>} body Body JSON recebido.
 * @returns {{ question: string }} Pergunta normalizada.
 */
export function validateAiQuestionBody(body) {
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (question.length < 8) throw httpError(400, "QUESTION_TOO_SHORT", "A pergunta deve ter pelo menos 8 caracteres");
    const lowered = question.toLowerCase();
    // Estes verbos indicam intenção de alterar dados. O endpoint RF41 é só leitura,
    // por isso bloqueamos cedo antes de chegar ao service.
    if (blockedVerbs.some((verb) => lowered.includes(verb))) {
        throw httpError(400, "QUESTION_MUTATION_BLOCKED", "A IA só responde a perguntas de leitura");
    }
    // Devolvemos a pergunta já normalizada para o service não repetir validações básicas.
    return { question };
}