/**
 * @file Provas da integração atómica entre notificações e EmailOutbox.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { loadApiEnv } from "../../src/config/env.js";
import { encryptEmailOutboxPayload } from "../../src/modules/notifications/emailOutboxCrypto.js";
import { createEmailOutbox } from "../../src/modules/notifications/emailOutboxService.js";
import { createEmailOutboxWorker } from "../../src/modules/notifications/emailOutboxWorker.js";
import { materializeCompanyNotifications } from "../../src/modules/notifications/notificationService.js";
import { runNotificationWorkerCycle } from "../../src/modules/notifications/notificationWorker.js";
import { createEmailProvider } from "../../src/modules/notifications/smtpEmailProvider.js";
import { startEmailOutboxWorker } from "../../scripts/run-email-outbox-worker.mjs";
import {
    createNotificationWorkerRuntime,
    startNotificationWorker,
} from "../../scripts/run-notification-worker.mjs";

const ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");

/**
 * Cria uma fila mínima em memória para exercitar um único claim do worker.
 *
 * @param {{ attempts?: number, type?: string }} options - Tentativas e tipo do email.
 * @returns {{ prisma: object, updates: object[] }} Double Prisma e updates terminais.
 */
function createClaimedEmailPrisma({ attempts = 1, type = "PASSWORD_RESET" } = {}) {
    let available = true;
    const updates = [];
    const email = {
        id: "outbox-demo-1",
        type,
        status: "PENDING",
        attempts,
        encryptedPayload: encryptEmailOutboxPayload(
            {
                to: "person@example.test",
                reason: "PASSWORD_RESET",
                subject: "Recuperação OPSA",
                text: "Use o token super-secret-token apenas uma vez.",
            },
            ENCRYPTION_KEY,
        ),
    };
    const prisma = {
        async $transaction(callback) {
            return callback(prisma);
        },
        emailOutbox: {
            async findFirst() {
                if (!available) return null;
                available = false;
                return email;
            },
            async updateMany() {
                return { count: 1 };
            },
            async findUnique() {
                return email;
            },
            async update(query) {
                updates.push(query.data);
                return { ...email, ...query.data };
            },
        },
        async $disconnect() {},
    };
    return { prisma, updates };
}

test("intervalo do worker de notificações tem default e limites explícitos", () => {
    assert.equal(loadApiEnv({}).notificationWorker.intervalMs, 300_000);
    assert.equal(
        loadApiEnv({ NOTIFICATION_WORKER_INTERVAL_MS: "60000" })
            .notificationWorker.intervalMs,
        60_000,
    );
    assert.equal(
        loadApiEnv({ NOTIFICATION_WORKER_INTERVAL_MS: "86400000" })
            .notificationWorker.intervalMs,
        86_400_000,
    );
    assert.throws(
        () => loadApiEnv({ NOTIFICATION_WORKER_INTERVAL_MS: "59999" }),
        /NOTIFICATION_WORKER_INTERVAL_MS/,
    );
    assert.throws(
        () => loadApiEnv({ NOTIFICATION_WORKER_INTERVAL_MS: "86400001" }),
        /NOTIFICATION_WORKER_INTERVAL_MS/,
    );
});

test("materialização cria notificações, respeita preferências e enfileira email atomicamente", async () => {
    const upsertedNotifications = [];
    const upsertUpdates = [];
    const queued = [];
    let transactions = 0;
    const prisma = {
        $transaction: async (callback) => {
            transactions += 1;
            return callback(prisma);
        },
        companyMembership: {
            findMany: async () => [
                { userId: "user-1", role: "ADMIN", user: { email: "one@example.test" } },
                { userId: "user-2", role: "GESTOR", user: { email: "two@example.test" } },
                { userId: "user-3", role: "OPERACIONAL", user: { email: "three@example.test" } },
            ],
        },
        reminder: {
            findMany: async () => [
                {
                    id: "reminder-1",
                    title: "IVA",
                    dueAt: new Date("2026-07-31T00:00:00.000Z"),
                },
            ],
        },
        smartAlert: {
            findMany: async () => [
                {
                    id: "alert-1",
                    type: "STOCK_RUPTURE_RISK",
                    title: "Stock crítico",
                    message: "O artigo A está abaixo do mínimo.",
                },
            ],
        },
        alertPreference: {
            findMany: async () => [
                { userId: "user-2", type: "deadline", enabled: false },
            ],
        },
        inAppNotification: {
            upsert: async ({ create, update }) => {
                upsertUpdates.push(update);
                const row = { id: `notification-${upsertedNotifications.length + 1}`, ...create };
                upsertedNotifications.push(row);
                return row;
            },
        },
    };
    const emailOutbox = {
        enqueue: async (tx, message, options) => {
            assert.equal(tx, prisma);
            queued.push({ message, options });
            return { id: `outbox-${queued.length}` };
        },
    };

    const summary = await materializeCompanyNotifications(
        prisma,
        { companyId: "company-1" },
        emailOutbox,
    );

    assert.equal(transactions, 1);
    assert.equal(upsertedNotifications.length, 4);
    assert.equal(upsertUpdates.every((update) => !("readAt" in update)), true);
    assert.equal(queued.length, 4);
    assert.equal(
        queued.some(({ options }) =>
            options.dedupeKey.includes("user-2:Reminder:reminder-1"),
        ),
        false,
    );
    assert.equal(queued.some(({ options }) => options.dedupeKey.includes("user-3:SmartAlert")), false);
    assert.equal(queued.some(({ options }) => options.dedupeKey.includes("user-3:Reminder")), true);
    assert.equal(new Set(queued.map(({ options }) => options.dedupeKey)).size, 4);
    assert.deepEqual(summary, {
        recipients: 3,
        sources: 2,
        notificationsMaterialized: 4,
        emailsQueued: 4,
    });
});

test("worker pagina empresas em blocos de 100 e continua depois de uma falha isolada", async () => {
    const companies = Array.from({ length: 101 }, (_, index) => ({
        id: `company-${String(index + 1).padStart(3, "0")}`,
    }));
    const companyQueries = [];
    let transactionIndex = 0;
    const tx = {
        companyMembership: { findMany: async () => [] },
        reminder: { findMany: async () => [] },
        smartAlert: { findMany: async () => [] },
        alertPreference: { findMany: async () => [] },
        inAppNotification: { upsert: async () => ({}) },
    };
    const prisma = {
        company: {
            findMany: async (query) => {
                companyQueries.push(query);
                return query.cursor ? companies.slice(100) : companies.slice(0, 100);
            },
        },
        $transaction: async (callback) => {
            transactionIndex += 1;
            if (transactionIndex === 50) throw new Error("empresa indisponível");
            return callback(tx);
        },
    };

    const summary = await runNotificationWorkerCycle(prisma, {
        enqueue: async () => ({}),
    });

    assert.deepEqual(summary, {
        companiesProcessed: 100,
        companiesFailed: 1,
        notificationsMaterialized: 0,
        emailsQueued: 0,
    });
    assert.equal(companyQueries.length, 2);
    assert.deepEqual(companyQueries[1].cursor, { id: "company-100" });
    assert.equal(companyQueries[1].skip, 1);
});

test("runtime ignora um segundo ciclo enquanto o primeiro está em execução", async () => {
    let resolveCycle;
    const pendingCycle = new Promise((resolve) => {
        resolveCycle = resolve;
    });
    const runtime = createNotificationWorkerRuntime({
        prisma: {},
        emailOutbox: {},
        intervalMs: 60_000,
        runCycle: async () => pendingCycle,
        writeLog: () => {},
    });

    const first = runtime.runOnce();
    assert.equal(runtime.isRunning(), true);
    assert.deepEqual(await runtime.runOnce(), {
        skipped: true,
        reason: "cycle_in_progress",
    });
    resolveCycle({
        companiesProcessed: 1,
        companiesFailed: 0,
        notificationsMaterialized: 2,
        emailsQueued: 2,
    });
    assert.equal((await first).skipped, false);
    await runtime.stop();
});

test("worker de notificações em modo drain executa um ciclo e termina", async () => {
    let cycles = 0;
    let disconnected = 0;
    const expectedSummary = {
        companiesProcessed: 2,
        companiesFailed: 0,
        notificationsMaterialized: 3,
        emailsQueued: 3,
    };
    const result = await startNotificationWorker({
        env: {
            NODE_ENV: "test",
            APP_BASE_URL: "http://localhost:5173",
            EMAIL_OUTBOX_ENCRYPTION_KEY: ENCRYPTION_KEY,
        },
        prisma: {
            $disconnect: async () => {
                disconnected += 1;
            },
        },
        emailOutbox: { enqueue: async () => ({}) },
        runCycle: async () => {
            cycles += 1;
            return expectedSummary;
        },
        writeLog: () => {},
        drain: true,
        registerSignalHandlers: false,
    });

    assert.equal(result.mode, "drain");
    assert.deepEqual(result.summary, expectedSummary);
    assert.equal(cycles, 1);
    assert.equal(disconnected, 1);
});

test("EmailOutbox usa upsert por dedupeKey e mantém payload cifrado", async () => {
    const calls = [];
    const tx = {
        emailOutbox: {
            upsert: async (query) => {
                calls.push(query);
                return { id: "outbox-1", ...query.create };
            },
        },
    };
    const outbox = createEmailOutbox({ encryptionKey: ENCRYPTION_KEY });
    await outbox.enqueue(
        tx,
        {
            to: "person@example.test",
            reason: "PAYMENT_REMINDER",
            subject: "OPSA — Prazo",
            text: "Notificação OPSA: prazo a terminar.",
        },
        { dedupeKey: "notification:company:user:Reminder:id" },
    );

    assert.equal(calls[0].where.dedupeKey, "notification:company:user:Reminder:id");
    assert.equal(calls[0].update && Object.keys(calls[0].update).length, 0);
    assert.equal(calls[0].create.encryptedPayload.includes("person@example.test"), false);
});

test("processo SMTP separado verifica o provider e drena uma fila vazia", async () => {
    let verified = 0;
    let disconnected = 0;
    const prisma = {
        $transaction: async (callback) => callback(prisma),
        emailOutbox: { findFirst: async () => null },
        $disconnect: async () => {
            disconnected += 1;
        },
    };
    const provider = {
        verify: async () => {
            verified += 1;
            return true;
        },
        send: async () => {
            throw new Error("não deveria enviar numa fila vazia");
        },
    };
    const result = await startEmailOutboxWorker({
        env: {
            NODE_ENV: "test",
            APP_BASE_URL: "http://localhost:5173",
            EMAIL_OUTBOX_ENCRYPTION_KEY: ENCRYPTION_KEY,
            SMTP_HOST: "smtp.example.test",
            SMTP_PORT: "587",
            SMTP_SECURE: "false",
            SMTP_REQUIRE_TLS: "true",
            EMAIL_FROM: "OPSA <no-reply@example.test>",
        },
        prisma,
        provider,
        drain: true,
        registerSignalHandlers: false,
    });

    assert.deepEqual(
        { mode: result.mode, processed: result.processed },
        { mode: "drain", processed: 0 },
    );
    assert.equal(verified, 1);
    assert.equal(disconnected, 1);
});

test("provider simulated conserva cifrado apenas o preview temporário permitido", async () => {
    const { prisma, updates } = createClaimedEmailPrisma();
    const logs = [];
    const result = await startEmailOutboxWorker({
        env: {
            NODE_ENV: "test",
            EMAIL_OUTBOX_ENCRYPTION_KEY: ENCRYPTION_KEY,
        },
        prisma,
        logger: {
            info(entry) { logs.push(entry); },
            warn(entry) { logs.push(entry); },
        },
        drain: true,
        registerSignalHandlers: false,
    });

    assert.equal(result.processed, 1);
    assert.equal(updates[0].status, "SIMULATED");
    assert.equal(updates[0].sentAt, null);
    assert.equal(typeof updates[0].encryptedPayload, "string");
    const serializedLogs = JSON.stringify(logs);
    assert.match(serializedLogs, /email_outbox_simulated/);
    assert.equal(serializedLogs.includes("person@example.test"), false);
    assert.equal(serializedLogs.includes("super-secret-token"), false);
});

test("provider simulated elimina payloads que não pertencem à inbox demo", async () => {
    const { prisma, updates } = createClaimedEmailPrisma({
        type: "PAYMENT_REMINDER",
    });
    const worker = createEmailOutboxWorker({
        prisma,
        provider: { async send() { return { status: "SIMULATED" }; } },
        encryptionKey: ENCRYPTION_KEY,
        logger: { info() {}, warn() {} },
    });

    assert.equal(await worker.runOnce(), true);
    assert.equal(updates[0].encryptedPayload, null);
});

test("provider SMTP mantém retry e FAILED e simulated é impossível em produção", async () => {
    for (const [attempts, expectedStatus] of [[1, "PENDING"], [5, "FAILED"]]) {
        const { prisma, updates } = createClaimedEmailPrisma({ attempts });
        const worker = createEmailOutboxWorker({
            prisma,
            provider: {
                async send() {
                    const error = new Error("SMTP indisponível");
                    error.code = "ECONNECTION";
                    throw error;
                },
            },
            encryptionKey: ENCRYPTION_KEY,
            logger: { info() {}, warn() {} },
        });
        assert.equal(await worker.runOnce(), true);
        assert.equal(updates[0].status, expectedStatus);
        assert.equal(updates[0].lastError, "ECONNECTION");
    }

    assert.throws(
        () =>
            createEmailProvider({
                isProduction: true,
                providers: { email: "simulated" },
            }),
        /não é permitido em produção/,
    );
});
