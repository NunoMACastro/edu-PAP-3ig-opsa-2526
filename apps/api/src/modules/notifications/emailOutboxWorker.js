/**
 * @file Worker com lease e retry para entrega SMTP da EmailOutbox.
 */

import { randomUUID } from "node:crypto";
import { decryptEmailOutboxPayload } from "./emailOutboxCrypto.js";

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_LEASE_MS = 60_000;

/**
 * Reclama uma mensagem pendente sem permitir envio concorrente por dois workers.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ workerId: string, now: Date, leaseMs: number }} input - Contexto do worker.
 * @returns {Promise<object | null>} Mensagem reclamada.
 */
async function claimNextEmail(prisma, input) {
    const staleBefore = new Date(input.now.getTime() - input.leaseMs);

    return prisma.$transaction(async (tx) => {
        const candidate = await tx.emailOutbox.findFirst({
            where: {
                encryptedPayload: { not: null },
                OR: [
                    { status: "PENDING", nextAttemptAt: { lte: input.now } },
                    { status: "PROCESSING", lockedAt: { lt: staleBefore } },
                ],
            },
            orderBy: [{ nextAttemptAt: "asc" }, { createdAt: "asc" }],
        });
        if (!candidate) return null;

        const claimed = await tx.emailOutbox.updateMany({
            where: {
                id: candidate.id,
                OR: [
                    { status: "PENDING", nextAttemptAt: { lte: input.now } },
                    { status: "PROCESSING", lockedAt: { lt: staleBefore } },
                ],
            },
            data: {
                status: "PROCESSING",
                lockedAt: input.now,
                lockedBy: input.workerId,
                attempts: { increment: 1 },
            },
        });
        if (claimed.count !== 1) return null;
        return tx.emailOutbox.findUnique({ where: { id: candidate.id } });
    });
}

/**
 * Cria worker controlável e sem logs de conteúdo das mensagens.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, provider: { send(message: object): Promise<object> }, encryptionKey: string | Buffer, logger?: Console, intervalMs?: number, leaseMs?: number, maxAttempts?: number, unrefTimer?: boolean }} options - Dependências.
 * @returns {{ runOnce(): Promise<boolean>, start(): void, stop(): void }} Worker.
 */
export function createEmailOutboxWorker({
    prisma,
    provider,
    encryptionKey,
    logger = console,
    intervalMs = 5_000,
    leaseMs = DEFAULT_LEASE_MS,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    unrefTimer = true,
}) {
    const workerId = randomUUID();
    let timer = null;
    let running = false;

    async function runOnce() {
        if (running) return false;
        running = true;
        try {
            const email = await claimNextEmail(prisma, {
                workerId,
                now: new Date(),
                leaseMs,
            });
            if (!email) return false;

            try {
                const message = decryptEmailOutboxPayload(
                    email.encryptedPayload,
                    encryptionKey,
                );
                await provider.send(message);
                await prisma.emailOutbox.update({
                    where: { id: email.id },
                    data: {
                        status: "SENT",
                        sentAt: new Date(),
                        encryptedPayload: null,
                        lockedAt: null,
                        lockedBy: null,
                        lastError: null,
                    },
                });
                logger.info({ event: "email_outbox_sent", type: email.type });
            } catch (error) {
                const exhausted = email.attempts >= maxAttempts;
                const delayMs = Math.min(60 * 60 * 1000, 2 ** email.attempts * 1_000);
                await prisma.emailOutbox.update({
                    where: { id: email.id },
                    data: {
                        status: exhausted ? "FAILED" : "PENDING",
                        nextAttemptAt: new Date(Date.now() + delayMs),
                        lockedAt: null,
                        lockedBy: null,
                        lastError: error?.code ? String(error.code).slice(0, 80) : "SMTP_DELIVERY_FAILED",
                    },
                });
                logger.warn({ event: "email_outbox_failed", type: email.type, exhausted });
            }
            return true;
        } finally {
            running = false;
        }
    }

    return {
        runOnce,
        start() {
            if (timer) return;
            timer = setInterval(() => void runOnce(), intervalMs);
            if (unrefTimer) timer.unref?.();
            void runOnce();
        },
        stop() {
            if (timer) clearInterval(timer);
            timer = null;
        },
    };
}
