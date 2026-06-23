/**
 * @file Orçamento de performance para sugestões de reconciliação bancária.
 */

export const RECONCILIATION_BUDGET_MS = 3000;
export const RECONCILIATION_MAX_CANDIDATES = 250;

/**
 * Limita candidatos para proteger a API de lotes demasiado grandes.
 *
 * @template T
 * @param {T[]} candidates - Movimentos candidatos a correspondência.
 * @returns {{ selected: T[], partial: boolean }}
 */
export function limitReconciliationCandidates(candidates) {
    const selected = candidates.slice(0, RECONCILIATION_MAX_CANDIDATES);

    return {
        selected,
        partial: candidates.length > selected.length,
    };
}

/**
 * Mede a geração de sugestões de reconciliação.
 *
 * @template TResult
 * @param {() => Promise<TResult>} operation - Operação real de sugestão.
 * @returns {Promise<{ result: TResult, durationMs: number, withinBudget: boolean }>}
 */
export async function measureReconciliation(operation) {
    const startedAt = performance.now();
    const result = await operation();
    const durationMs = Math.round(performance.now() - startedAt);

    // O limite protege a experiência sem confirmar automaticamente qualquer movimento.
    return {
        result,
        durationMs,
        withinBudget: durationMs <= RECONCILIATION_BUDGET_MS,
    };
}