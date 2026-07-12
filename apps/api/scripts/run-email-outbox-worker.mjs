/**
 * @file Processo SMTP separado que consome a EmailOutbox persistente.
 *
 * A API apenas grava mensagens cifradas na transação de negócio. Este processo
 * verifica o SMTP antes de trabalhar e pode correr continuamente (`worker:email`)
 * ou drenar a fila de teste de forma limitada (`worker:email:drain`).
 */

import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadApiEnv } from "../src/config/env.js";
import { loadLocalEnvFile } from "../src/config/envFile.js";
import { createEmailOutboxWorker } from "../src/modules/notifications/emailOutboxWorker.js";
import { buildSmtpEmailProvider } from "../src/modules/notifications/smtpEmailProvider.js";

/**
 * Inicia o runtime isolado do worker sem abrir qualquer socket HTTP.
 *
 * @param {{ env?: NodeJS.ProcessEnv, logger?: Console, drain?: boolean, maxDrainMessages?: number, registerSignalHandlers?: boolean, prisma?: object, provider?: object }} options - Controlo operacional/testes.
 * @returns {Promise<{ mode: string, processed?: number, stop(): Promise<void> }>} Runtime controlável.
 */
export async function startEmailOutboxWorker({
    env = process.env,
    logger = console,
    drain = false,
    maxDrainMessages = 1000,
    registerSignalHandlers = true,
    prisma: prismaOption,
    provider: providerOption,
} = {}) {
    const apiEnv = loadApiEnv(env);
    if (!apiEnv.emailOutboxEncryptionKey) {
        throw new Error("EMAIL_OUTBOX_ENCRYPTION_KEY é obrigatória.");
    }
    const prisma = prismaOption ?? new PrismaClient();
    const provider = providerOption ?? buildSmtpEmailProvider(apiEnv.smtp);
    let stopped = false;
    const worker = createEmailOutboxWorker({
        prisma,
        provider,
        encryptionKey: apiEnv.emailOutboxEncryptionKey,
        logger,
        unrefTimer: false,
    });
    async function stop() {
        if (stopped) return;
        stopped = true;
        worker.stop();
        await prisma.$disconnect();
    }

    try {
        await provider.verify();
        if (drain) {
            let processed = 0;
            while (processed < maxDrainMessages && (await worker.runOnce())) {
                processed += 1;
            }
            if (processed === maxDrainMessages) {
                throw new Error("EmailOutbox excedeu o limite seguro de drenagem.");
            }
            await stop();
            return { mode: "drain", processed, stop };
        }

        worker.start();
        if (registerSignalHandlers) {
            for (const signal of ["SIGINT", "SIGTERM"]) {
                process.once(signal, () => {
                    void stop()
                        .then(() => process.exit(0))
                        .catch((error) => {
                            logger.error({
                                event: "email_worker_shutdown_failed",
                                code: error?.code ?? "EMAIL_WORKER_SHUTDOWN_FAILED",
                            });
                            process.exit(1);
                        });
                });
            }
        }
        return { mode: "continuous", stop };
    } catch (error) {
        await stop();
        throw error;
    }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
    loadLocalEnvFile();
    const drain = process.argv.includes("--drain");
    startEmailOutboxWorker({ drain })
        .then((result) => {
            if (drain) {
                console.info(JSON.stringify({ event: "email_outbox_drained", processed: result.processed }));
            }
        })
        .catch((error) => {
            console.error({
                event: "email_worker_start_failed",
                code: error?.code ?? "EMAIL_WORKER_FAILED",
            });
            process.exitCode = 1;
        });
}
