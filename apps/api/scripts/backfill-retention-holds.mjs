/**
 * @file Backfill idempotente dos holds legais para períodos fiscais fechados.
 *
 * O comando deve ser executado com uma DATABASE_URL de desenvolvimento/teste.
 * Apenas escreve contagens e identificadores de períodos; nunca imprime a URL,
 * credenciais, dados contabilísticos ou identificadores das entidades retidas.
 */

import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnvFile } from "../src/config/envFile.js";
import { materializeRetentionHoldsForPeriod } from "../src/modules/compliance/retentionPolicy.js";

/**
 * Materializa os holds de todos os períodos fechados por ordem cronológica.
 * Cada período corre numa transação própria para evitar um backfill global
 * excessivamente longo e permitir reexecução segura após uma falha intermédia.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma ligado à base alvo.
 * @returns {Promise<{ periods: number, holdsBefore: number, holdsAfter: number, materialized: number, results: Array<object> }>} Contagens do backfill.
 */
export async function backfillRetentionHolds(prisma) {
    const periods = await prisma.fiscalPeriod.findMany({
        where: { status: "CLOSED" },
        orderBy: [{ companyId: "asc" }, { endDate: "asc" }, { id: "asc" }],
        select: {
            id: true,
            companyId: true,
            startDate: true,
            endDate: true,
        },
    });
    const holdsBefore = await prisma.retentionHold.count();
    const results = [];

    for (const period of periods) {
        const result = await prisma.$transaction((tx) =>
            materializeRetentionHoldsForPeriod(tx, {
                companyId: period.companyId,
                period,
            }),
        );
        results.push({ periodId: period.id, ...result });
    }

    const holdsAfter = await prisma.retentionHold.count();
    return {
        periods: periods.length,
        holdsBefore,
        holdsAfter,
        materialized: results.reduce((sum, result) => sum + result.total, 0),
        results,
    };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
    loadLocalEnvFile();

    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL em falta para executar o backfill de retencao.");
        process.exitCode = 1;
    } else {
        const prisma = new PrismaClient();
        backfillRetentionHolds(prisma)
            .then((result) => console.log(JSON.stringify(result, null, 2)))
            .catch((error) => {
                console.error(`Backfill de retencao falhou: ${error.message}`);
                process.exitCode = 1;
            })
            .finally(() => prisma.$disconnect());
    }
}
