/**
 * @file Medição de performance para inserções críticas do RNF08.
 */

// O orçamento fica centralizado para vendas, compras e lançamentos manuais usarem o mesmo limite.
export const DOCUMENT_INSERT_BUDGET_MS = 1000;

/**
 * Mede uma operação de criação de documento sem alterar a regra de negócio.
 *
 * @template TResult
 * @param {string} operationName - Nome funcional da operação medida.
 * @param {() => Promise<TResult>} operation - Operação real já validada pelo service.
 * @returns {Promise<{ result: TResult, metric: { operationName: string, durationMs: number, withinBudget: boolean } }>}
 */
export async function measureDocumentInsert(operationName, operation) {
    const startedAt = performance.now();
    const result = await operation();
    const durationMs = Math.round(performance.now() - startedAt);

    const metric = {
        operationName,
        durationMs,
        withinBudget: durationMs <= DOCUMENT_INSERT_BUDGET_MS,
    };

    // A medição envolve a operação real para não esconder validações, transações ou auditoria.
    return { result, metric };
}

/**
 * Formata a métrica para logs ou evidence sem expor dados financeiros.
 *
 * @param {{ operationName: string, durationMs: number, withinBudget: boolean }} metric - Resultado da medição.
 * @returns {{ event: string, operationName: string, durationMs: number, withinBudget: boolean }}
 */
export function toDocumentInsertLog(metric) {
    return {
        event: "document_insert_measured",
        operationName: metric.operationName,
        durationMs: metric.durationMs,
        withinBudget: metric.withinBudget,
    };
}