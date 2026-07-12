/**
 * @file Orcamento de performance para sugestoes de reconciliacao bancaria.
 */

export const RECONCILIATION_BUDGET_MS = 3000;
export const RECONCILIATION_MAX_CANDIDATES = 250;

/**
 * Limita candidatos para proteger a API de lotes demasiado grandes.
 *
 * @template T
 * @param {T[]} candidates - Movimentos candidatos a correspondencia.
 * @param {number} limit - Limite operacional do pedido.
 * @returns {{ selected: T[], partial: boolean }}
 */
export function limitReconciliationCandidates(
    candidates,
    limit = RECONCILIATION_MAX_CANDIDATES,
) {
    const selected = candidates.slice(0, limit);

    return {
        selected,
        partial: candidates.length > selected.length,
    };
}

/**
 * Mede a geracao de sugestoes de reconciliacao.
 *
 * @template TResult
 * @param {() => Promise<TResult>} operation - Operacao real de sugestao.
 * @returns {Promise<{ result: TResult, durationMs: number, withinBudget: boolean, budgetMs: number }>}
 */
export async function measureReconciliation(operation) {
    const startedAt = performance.now();
    const result = await operation();
    const durationMs = Math.round(performance.now() - startedAt);

    return {
        result,
        durationMs,
        withinBudget: durationMs <= RECONCILIATION_BUDGET_MS,
        budgetMs: RECONCILIATION_BUDGET_MS,
    };
}
