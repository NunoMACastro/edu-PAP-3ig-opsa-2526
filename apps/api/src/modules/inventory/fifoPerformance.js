/**
 * @file Orcamento de performance para calculo FIFO.
 */

import { httpError } from "../../lib/httpErrors.js";

export const FIFO_COST_BUDGET_MS = 1000;

/**
 * Mede um calculo FIFO e mantem o resultado original.
 *
 * @template TResult
 * @param {() => Promise<TResult>} operation - Calculo FIFO real.
 * @returns {Promise<{ result: TResult, durationMs: number, withinBudget: boolean, budgetMs: number }>}
 */
export async function measureFifoCost(operation) {
    const startedAt = performance.now();
    const result = await operation();
    const durationMs = Math.round(performance.now() - startedAt);

    return {
        result,
        durationMs,
        withinBudget: durationMs <= FIFO_COST_BUDGET_MS,
        budgetMs: FIFO_COST_BUDGET_MS,
    };
}

/**
 * Valida se ha stock suficiente antes de executar calculo pesado.
 *
 * @param {number} requestedQuantity - Quantidade pedida pelo movimento.
 * @param {number} availableQuantity - Quantidade disponivel nas camadas FIFO.
 * @returns {void}
 * @throws {Error} Quando nao ha camadas suficientes.
 */
export function assertEnoughFifoStock(requestedQuantity, availableQuantity) {
    if (requestedQuantity > availableQuantity) {
        throw httpError(
            409,
            "INSUFFICIENT_FIFO_LAYERS",
            "Nao existem camadas FIFO suficientes para este movimento",
        );
    }
}
