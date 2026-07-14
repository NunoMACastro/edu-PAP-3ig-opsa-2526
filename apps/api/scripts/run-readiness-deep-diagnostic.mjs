/**
 * @file Diagnóstico explícito das permissões operacionais usadas pela OPSA.
 *
 * Este comando pode escrever e remover uma chave Redis e um objeto isolado de
 * health. Nunca é chamado pelos endpoints públicos de liveness/readiness.
 */

import { pathToFileURL } from "node:url";
import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { assertApiStartupEnv, loadApiEnv } from "../src/config/env.js";
import { loadLocalEnvFile } from "../src/config/envFile.js";
import {
    checkPostgresOperationalAccess,
    checkRedisOperationalAccess,
} from "../src/modules/ops/healthService.js";
import { createObjectStorage } from "../src/modules/storage/objectStorage.js";

/**
 * Executa as provas profundas com recursos já geridos pelo chamador.
 *
 * @param {{ prisma: object, redisClient: object, redisKeyPrefix: string, objectStorage: object }} deps - Recursos operacionais ligados.
 * @returns {Promise<Array<{name: string, status: "up"}>>} Resultado seguro sem detalhes internos.
 */
export async function runReadinessDeepDiagnostic(deps) {
    await checkPostgresOperationalAccess(deps.prisma);
    await checkRedisOperationalAccess(
        deps.redisClient,
        deps.redisKeyPrefix,
    );
    await deps.objectStorage.checkOperationalAccess();
    return ["postgresql", "redis", "storage"].map((name) => ({
        name,
        status: "up",
    }));
}

/**
 * Compõe os clientes reais apenas para uma execução explícita do comando.
 *
 * @param {NodeJS.ProcessEnv} [env] - Ambiente do processo.
 * @returns {Promise<Array<{name: string, status: "up"}>>} Resultado seguro.
 */
async function main(env = process.env) {
    loadLocalEnvFile();
    const apiEnv = loadApiEnv(env);
    assertApiStartupEnv(apiEnv);
    const prisma = new PrismaClient();
    const redisClient = createClient({ url: apiEnv.redisUrl });
    const objectStorage = createObjectStorage(env);
    try {
        await prisma.$connect();
        await redisClient.connect();
        const results = await runReadinessDeepDiagnostic({
            prisma,
            redisClient,
            redisKeyPrefix: apiEnv.redisKeyPrefix,
            objectStorage,
        });
        console.info(JSON.stringify({ status: "ok", dependencies: results }));
        return results;
    } finally {
        if (redisClient.isOpen) await redisClient.quit().catch(() => undefined);
        await prisma.$disconnect().catch(() => undefined);
    }
}

const isDirectExecution =
    process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirectExecution) {
    main().catch(() => {
        console.error(JSON.stringify({
            status: "failed",
            message: "O diagnóstico profundo falhou; consulta a configuração e os serviços locais.",
        }));
        process.exitCode = 1;
    });
}
