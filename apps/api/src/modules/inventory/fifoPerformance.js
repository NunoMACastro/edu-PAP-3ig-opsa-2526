/**
 * @file Orçamento de performance para cálculo FIFO.
 */

import { httpError } from "../../lib/httpErrors.js";

export const FIFO_COST_BUDGET_MS = 1000;

/**
 * Mede um cálculo FIFO e mantém o resultado original.
 *
 * @template TResult
 * @param {() => Promise<TResult>} operation - Cálculo FIFO real.
 * @returns {Promise<{ result: TResult, durationMs: number, withinBudget: boolean }>}
 */
export async function measureFifoCost(operation) {
    const startedAt = performance.now();
    const result = await operation();
    const durationMs = Math.round(performance.now() - startedAt);

    // A métrica não escolhe camadas; apenas observa o cálculo canónico.
    return {
        result,
        durationMs,
        withinBudget: durationMs <= FIFO_COST_BUDGET_MS,
    };
}

/**
 * Valida se há stock suficiente antes de executar cálculo pesado.
 *
 * @param {number} requestedQuantity - Quantidade pedida pelo movimento.
 * @param {number} availableQuantity - Quantidade disponível nas camadas FIFO.
 * @returns {void}
 */
export function assertEnoughFifoStock(requestedQuantity, availableQuantity) {
    if (requestedQuantity > availableQuantity) {
        // O erro HTTP mantém o contrato da API e evita gravar um movimento impossível.
        throw httpError(
            409,
            "INSUFFICIENT_FIFO_LAYERS",
            "Não existem camadas FIFO suficientes para este movimento",
        );
    }
}