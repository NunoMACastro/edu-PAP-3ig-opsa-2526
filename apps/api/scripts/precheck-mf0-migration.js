/**
 * @file Pré-validação não destrutiva para alterações de dados da MF0.
 *
 * Este script deve correr antes de aplicar migrações que adicionem unicidade
 * por nome em armazéns/localizações.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Converte contagens SQL para número JavaScript.
 *
 * @param {unknown} value - Valor devolvido pelo driver PostgreSQL.
 * @returns {number} Contagem normalizada.
 */
function toCount(value) {
    return Number(value ?? 0);
}

/**
 * Falha explicitamente quando existem dados incompatíveis com o novo contrato.
 *
 * @returns {Promise<void>}
 */
async function main() {
    const [duplicateWarehouseNames] = await prisma.$queryRaw`
        SELECT COUNT(*)::int AS count
        FROM (
            SELECT "companyId", "name"
            FROM "Warehouse"
            GROUP BY "companyId", "name"
            HAVING COUNT(*) > 1
        ) duplicates
    `;

    const [duplicateLocationNames] = await prisma.$queryRaw`
        SELECT COUNT(*)::int AS count
        FROM (
            SELECT "warehouseId", "name"
            FROM "WarehouseLocation"
            GROUP BY "warehouseId", "name"
            HAVING COUNT(*) > 1
        ) duplicates
    `;

    const failures = [
        [
            "DUPLICATE_WAREHOUSE_NAMES",
            toCount(duplicateWarehouseNames?.count),
            "nomes de armazém duplicados por empresa",
        ],
        [
            "DUPLICATE_WAREHOUSE_LOCATION_NAMES",
            toCount(duplicateLocationNames?.count),
            "nomes de localização duplicados por armazém",
        ],
    ].filter(([, count]) => count > 0);

    if (failures.length > 0) {
        console.error({
            event: "mf0_migration_precheck_failed",
            failures: failures.map(([code, count, description]) => ({
                code,
                count,
                description,
            })),
        });
        process.exitCode = 1;
        return;
    }

    console.info({ event: "mf0_migration_precheck_passed" });
}

try {
    await main();
} finally {
    await prisma.$disconnect();
}
