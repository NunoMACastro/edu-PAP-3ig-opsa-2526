/**
 * @file Medicao de performance para insercao de documentos financeiros.
 *
 * O BK-MF6-01 mede a operacao real sem remover validacao, transacao,
 * autorizacao ou auditoria. A metrica fica em headers tecnicos e nao expoe
 * payloads financeiros.
 */

export const DOCUMENT_INSERTION_BUDGET_MS = 1000;

/**
 * Mede uma operacao de insercao de documento e preserva o resultado original.
 *
 * @template TResult
 * @param {() => Promise<TResult>} operation - Operacao real a executar.
 * @returns {Promise<{ result: TResult, durationMs: number, budgetMs: number, withinBudget: boolean }>} Resultado medido.
 */
export async function measureDocumentInsertion(operation) {
    const startedAt = performance.now();
    const result = await operation();
    const durationMs = Math.round(performance.now() - startedAt);

    return {
        result,
        durationMs,
        budgetMs: DOCUMENT_INSERTION_BUDGET_MS,
        withinBudget: durationMs <= DOCUMENT_INSERTION_BUDGET_MS,
    };
}

/**
 * Acrescenta headers tecnicos para evidence de performance.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {{ durationMs: number, budgetMs: number, withinBudget: boolean }} measurement - Medicao feita no service.
 * @returns {void}
 */
export function setDocumentPerformanceHeaders(res, measurement) {
    res.set("X-OPSA-Document-Duration-Ms", String(measurement.durationMs));
    res.set("X-OPSA-Document-Budget-Ms", String(measurement.budgetMs));
    res.set(
        "X-OPSA-Document-Within-Budget",
        measurement.withinBudget ? "true" : "false",
    );
}
