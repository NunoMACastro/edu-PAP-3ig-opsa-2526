/**
 * @file Processo dedicado com polling curto e agendamento horário separado.
 */

import { PrismaClient } from "@prisma/client";
import { loadApiEnv } from "../src/config/env.js";
import { loadLocalEnvFile } from "../src/config/envFile.js";
import { enqueueHourlyCompanyRuns, runAiAnalysisWorkerCycle } from "../src/modules/ai/aiAnalysisWorker.js";
import { createStructuredLogEvent, writeStructuredLog } from "../src/modules/ops/structuredLogger.js";

loadLocalEnvFile();
const apiEnv = loadApiEnv(process.env);
const prisma = new PrismaClient();
let stopping = false;
let running = false;
let scheduling = false;
let pollTimer;
let scheduleTimer;

function log(level, event, context = {}) {
    writeStructuredLog(createStructuredLogEvent({ level, event, module: "ai-worker", requirement: "MF4_AI_PIPELINE", context }));
}

async function poll() {
    if (running || scheduling || stopping) return { skipped: true };
    running = true;
    try {
        const summary = await runAiAnalysisWorkerCycle(prisma, apiEnv.ai, {
            onToolMetric: (metric) => log(metric.withinBudget ? "info" : "warn", "ai.tool.completed", metric),
        });
        log("info", "ai.worker.cycle_completed", summary);
        return summary;
    } finally { running = false; }
}

async function schedule() {
    if (scheduling || running || stopping) return { skipped: true };
    scheduling = true;
    try {
        const created = await enqueueHourlyCompanyRuns(prisma);
        log("info", "ai.worker.schedule_completed", { created });
        return { created };
    } finally { scheduling = false; }
}

async function stop() {
    if (stopping) return;
    stopping = true;
    if (pollTimer) clearInterval(pollTimer);
    if (scheduleTimer) clearInterval(scheduleTimer);
    while (running || scheduling) await new Promise((resolve) => setTimeout(resolve, 25));
    await prisma.$disconnect();
}

for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => void stop().finally(() => process.exit(0)));
}

try {
    await schedule();
    const first = await poll();
    if (process.argv.includes("--drain")) await stop();
    else {
        pollTimer = setInterval(() => void poll().catch((error) => log("error", "ai.worker.cycle_failed", { code: error?.code ?? "FAILED" })), apiEnv.ai.workerPollIntervalMs);
        scheduleTimer = setInterval(() => void schedule().catch((error) => log("error", "ai.worker.schedule_failed", { code: error?.code ?? "FAILED" })), apiEnv.ai.workerIntervalMs);
    }
    void first;
} catch (error) {
    await stop();
    log("error", "ai.worker.start_failed", { code: error?.code ?? "FAILED" });
    process.exitCode = 1;
}
