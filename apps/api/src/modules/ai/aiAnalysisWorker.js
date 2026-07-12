/**
 * @file Ciclo recuperável do worker de análises e retenção do chat.
 */

import crypto from "node:crypto";
import {
    claimNextAnalysisRun,
    createAnalysisRun,
    heartbeatAnalysisRun,
    processAnalysisRun,
} from "./aiAnalysisService.js";
import { purgeExpiredChatSessions } from "./aiChatService.js";
import { zonedDateBoundary } from "./aiMetricCatalog.js";

function currentMonthPeriod(now = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const from = `${values.year}-${values.month}-01`;
    const to = `${values.year}-${values.month}-${values.day}`;
    return { fromDate: zonedDateBoundary(from), toDate: zonedDateBoundary(to, { endOfDay: true }) };
}

/** Bucket horário civil usado como chave idempotente entre workers. */
export function aiScheduleBucket(now = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Lisbon", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
    }).formatToParts(now);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}T${values.hour}`;
}

export async function enqueueHourlyCompanyRuns(prisma, now = new Date()) {
    const companies = await prisma.company.findMany({ select: { id: true }, orderBy: { id: "asc" } });
    const period = currentMonthPeriod(now);
    const scheduleBucket = aiScheduleBucket(now);
    let created = 0;
    for (const company of companies) {
        try {
            await createAnalysisRun(prisma, { companyId: company.id, userId: null, origin: "SYSTEM", scheduleBucket, ...period });
            created += 1;
        } catch (error) {
            if (error?.code !== "P2002") throw error;
        }
    }
    return created;
}

/** Processa uma batch sem agendar implicitamente; o runtime controla os relógios. */
export async function runAiAnalysisWorkerCycle(prisma, aiConfig, options = {}) {
    const workerId = options.workerId ?? `ai-worker-${crypto.randomUUID()}`;
    let processed = 0;
    let failed = 0;
    while (processed + failed < aiConfig.workerBatchSize) {
        const run = await claimNextAnalysisRun(prisma, workerId, {
            now: options.now ?? new Date(),
            leaseMs: aiConfig.workerLeaseMs,
            maxAttempts: aiConfig.workerMaxAttempts,
        });
        if (!run) break;
        try {
            await processAnalysisRun(prisma, run, {
                maxAttempts: aiConfig.workerMaxAttempts,
                onToolMetric: options.onToolMetric,
                heartbeat: () => heartbeatAnalysisRun(prisma, {
                    runId: run.id,
                    workerId,
                    leaseMs: aiConfig.workerLeaseMs,
                }),
            });
            processed += 1;
        } catch { failed += 1; }
    }
    const purged = aiConfig.chatEnabled && aiConfig.chatEncryptionKey
        ? await purgeExpiredChatSessions(prisma, aiConfig, options.now)
        : 0;
    return { processed, failed, purged };
}
