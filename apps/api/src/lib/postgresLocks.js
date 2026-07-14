/**
 * @file Locks transacionais PostgreSQL para invariantes entre tabelas.
 *
 * Prisma não expõe um lock pessimista de domínio. Um advisory lock com chave
 * estável permite serializar operações que têm de concordar, como fechar um
 * período fiscal e criar um documento nesse mesmo período.
 */

/**
 * Adquire um advisory lock que vive apenas até ao fim da transação atual.
 *
 * O fallback sem `$executeRaw` existe exclusivamente para doubles unitários já
 * usados no projeto. Clientes Prisma reais executam sempre o lock PostgreSQL.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Cliente da transação Prisma.
 * @param {string} namespace - Domínio do lock, por exemplo `fiscal`.
 * @param {...string} parts - Identificadores que tornam a chave única.
 * @returns {Promise<void>}
 */
export async function acquireTransactionLock(tx, namespace, ...parts) {
    if (typeof tx.$executeRaw !== "function") return;

    const key = [namespace, ...parts].join(":");
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
}
