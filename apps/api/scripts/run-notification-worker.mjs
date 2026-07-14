/**
 * @file Processo periódico dedicado à materialização global de notificações.
 */

import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadApiEnv } from "../src/config/env.js";
import { loadLocalEnvFile } from "../src/config/envFile.js";
import { runNotificationWorkerCycle } from "../src/modules/notifications/notificationWorker.js";
import {
    createStructuredLogEvent,
    writeStructuredLog,
} from "../src/modules/ops/structuredLogger.js";
import { createEmailOutbox } from "../src/runtimeDependencies.js";

/**
 * Cria um runtime controlável que impede ciclos sobrepostos no mesmo processo.
 *
 * @param {{ prisma: object, emailOutbox: object, intervalMs: number, runCycle?: Function, writeLog?: Function }} options - Dependências operacionais.
 * @returns {{ runOnce(): Promise<object>, start(): void, stop(): Promise<void>, isRunning(): boolean }} Runtime do worker.
 */
export function createNotificationWorkerRuntime({
    prisma,
    emailOutbox,
    intervalMs,
    runCycle = runNotificationWorkerCycle,
    writeLog = writeStructuredLog,
}) {
    let stopping = false;
    let running = false;
    let timer;

    async function runOnce() {
        if (running || stopping) return { skipped: true, reason: "cycle_in_progress" };
        running = true;
        try {
            const summary = await runCycle(prisma, emailOutbox);
            writeLog(createStructuredLogEvent({
                level: summary.companiesFailed > 0 ? "warn" : "info",
                event: "notifications.worker.cycle_completed",
                module: "notifications",
                requirement: "RF46",
                context: summary,
            }));
            return { skipped: false, summary };
        } finally {
            running = false;
        }
    }

    function start() {
        if (timer || stopping) return;
        timer = setInterval(() => {
            void runOnce().catch((error) => {
                writeLog(createStructuredLogEvent({
                    level: "error",
                    event: "notifications.worker.cycle_failed",
                    module: "notifications",
                    requirement: "RF46",
                    context: { code: error?.code ?? "NOTIFICATION_WORKER_FAILED" },
                }));
            });
        }, intervalMs);
    }

    async function stop() {
        if (stopping) return;
        stopping = true;
        if (timer) clearInterval(timer);
        while (running) {
            await new Promise((resolveWait) => setTimeout(resolveWait, 25));
        }
    }

    return { runOnce, start, stop, isRunning: () => running };
}

/**
 * Inicia o worker contínuo ou executa um único ciclo finito em modo drain.
 *
 * @param {{ env?: NodeJS.ProcessEnv, drain?: boolean, registerSignalHandlers?: boolean, prisma?: object, emailOutbox?: object, runCycle?: Function, writeLog?: Function }} options - Dependências e modo.
 * @returns {Promise<{ mode: string, summary: object, stop(): Promise<void>, runOnce(): Promise<object> }>} Runtime controlável.
 */
export async function startNotificationWorker({
    env = process.env,
    drain = false,
    registerSignalHandlers = true,
    prisma: prismaOption,
    emailOutbox: emailOutboxOption,
    runCycle,
    writeLog,
} = {}) {
    const apiEnv = loadApiEnv(env);
    if (!apiEnv.emailOutboxEncryptionKey) {
        throw new Error("EMAIL_OUTBOX_ENCRYPTION_KEY é obrigatória.");
    }
    const prisma = prismaOption ?? new PrismaClient();
    const emailOutbox = emailOutboxOption ?? createEmailOutbox({
        encryptionKey: apiEnv.emailOutboxEncryptionKey,
    });
    const runtime = createNotificationWorkerRuntime({
        prisma,
        emailOutbox,
        intervalMs: apiEnv.notificationWorker.intervalMs,
        runCycle,
        writeLog,
    });
    let disconnected = false;

    async function stop() {
        await runtime.stop();
        if (!disconnected) {
            disconnected = true;
            await prisma.$disconnect();
        }
    }

    try {
        const firstCycle = await runtime.runOnce();
        if (drain) {
            await stop();
            return {
                mode: "drain",
                summary: firstCycle.summary,
                stop,
                runOnce: runtime.runOnce,
            };
        }

        runtime.start();
        if (registerSignalHandlers) {
            for (const signal of ["SIGINT", "SIGTERM"]) {
                process.once(signal, () => void stop().finally(() => process.exit(0)));
            }
        }
        return {
            mode: "continuous",
            summary: firstCycle.summary,
            stop,
            runOnce: runtime.runOnce,
        };
    } catch (error) {
        await stop();
        throw error;
    }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
    loadLocalEnvFile();
    const drain = process.argv.includes("--drain");
    startNotificationWorker({ drain })
        .then((result) => {
            if (drain) {
                console.info(JSON.stringify({
                    event: "notifications.worker.drained",
                    ...result.summary,
                }));
            }
        })
        .catch((error) => {
            writeStructuredLog(createStructuredLogEvent({
                level: "error",
                event: "notifications.worker.start_failed",
                module: "notifications",
                requirement: "RF46",
                context: { code: error?.code ?? "NOTIFICATION_WORKER_FAILED" },
            }));
            process.exitCode = 1;
        });
}
