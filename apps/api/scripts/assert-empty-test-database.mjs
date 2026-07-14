/**
 * @file Impede que o gate alegue migrations "desde zero" sobre uma BD já usada.
 */

import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnvFile } from "../src/config/envFile.js";
import { assertDisposableRestoreDatabase } from "./postgres-cli.mjs";

/**
 * Confirma que DATABASE_URL aponta para uma base descartável sem tabelas no
 * schema public. Não apaga nem altera qualquer objeto.
 *
 * @param {{ databaseUrl?: string, prisma?: object }} options - Dependências de teste.
 * @returns {Promise<{ empty: true, databaseName: string }>} Evidência segura.
 */
export async function assertEmptyTestDatabase({
    databaseUrl = process.env.DATABASE_URL,
    prisma: prismaOption,
} = {}) {
    if (!databaseUrl) throw new Error("DATABASE_URL de teste é obrigatória.");
    const parsed = new URL(databaseUrl);
    const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    assertDisposableRestoreDatabase(databaseName);
    const prisma = prismaOption ?? new PrismaClient();
    try {
        const tables = await prisma.$queryRaw`
            SELECT tablename
            FROM pg_catalog.pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename
        `;
        if (!Array.isArray(tables) || tables.length !== 0) {
            throw new Error(
                "TEST_DATABASE_URL não está vazia; fornece uma nova base descartável para provar migrations desde zero.",
            );
        }
        return { empty: true, databaseName };
    } finally {
        await prisma.$disconnect();
    }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
    loadLocalEnvFile();
    assertEmptyTestDatabase()
        .then((result) => console.info(JSON.stringify(result)))
        .catch((error) => {
            console.error(error.message);
            process.exitCode = 1;
        });
}
