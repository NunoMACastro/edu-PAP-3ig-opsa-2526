/**
 * @file Primitivas pequenas para persistência em lotes com memória e concorrência limitadas.
 */

export const DEFAULT_WRITE_BATCH_SIZE = 250;
export const DEFAULT_UPSERT_CONCURRENCY = 25;

/**
 * Divide uma coleção em blocos limitados sem copiar payloads além do bloco atual.
 *
 * @param {unknown[]} values - Valores a dividir.
 * @param {number} batchSize - Limite positivo por bloco.
 * @returns {unknown[][]} Blocos na ordem original.
 */
export function chunkValues(values, batchSize = DEFAULT_WRITE_BATCH_SIZE) {
    if (!Array.isArray(values)) throw new TypeError("values deve ser um array");
    if (!Number.isInteger(batchSize) || batchSize < 1) {
        throw new TypeError("batchSize deve ser um inteiro positivo");
    }
    const chunks = [];
    for (let index = 0; index < values.length; index += batchSize) {
        chunks.push(values.slice(index, index + batchSize));
    }
    return chunks;
}

/**
 * Executa `createMany` em chunks e devolve a contagem total confirmada.
 *
 * @param {{createMany(args: {data: object[]}): Promise<{count: number}>}} model - Delegate Prisma.
 * @param {object[]} data - Registos já validados e scoped à empresa.
 * @param {{batchSize?: number}} options - Limite por statement.
 * @returns {Promise<number>} Total criado.
 */
export async function createManyInBatches(model, data, options = {}) {
    let count = 0;
    for (const batch of chunkValues(
        data,
        options.batchSize ?? DEFAULT_WRITE_BATCH_SIZE,
    )) {
        const result = await model.createMany({ data: batch });
        count += Number(result?.count ?? 0);
    }
    return count;
}

/**
 * Aplica uma operação assíncrona por item com concorrência máxima limitada.
 *
 * A ordem do resultado acompanha a ordem original. Uma falha rejeita a chamada,
 * permitindo à transação exterior reverter o lote completo.
 *
 * @template TInput, TResult
 * @param {TInput[]} values - Entradas já validadas.
 * @param {(value: TInput, index: number) => Promise<TResult>} mapper - Operação individual.
 * @param {{concurrency?: number}} options - Máximo de promises por bloco.
 * @returns {Promise<TResult[]>} Resultados pela ordem original.
 */
export async function mapInBatches(values, mapper, options = {}) {
    const concurrency = options.concurrency ?? DEFAULT_UPSERT_CONCURRENCY;
    const results = [];
    let offset = 0;
    for (const batch of chunkValues(values, concurrency)) {
        const batchResults = await Promise.all(
            batch.map((value, index) => mapper(value, offset + index)),
        );
        results.push(...batchResults);
        offset += batch.length;
    }
    return results;
}
