-- Hardening aditivo da IA OPSA: leases recuperáveis e agendamento idempotente.

ALTER TABLE "AiAnalysisRun"
  ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "leaseExpiresAt" TIMESTAMP(3),
  ADD COLUMN "lastHeartbeatAt" TIMESTAMP(3),
  ADD COLUMN "scheduleBucket" TEXT;

CREATE INDEX "AiAnalysisRun_status_nextAttemptAt_idx"
  ON "AiAnalysisRun"("status", "nextAttemptAt");

CREATE INDEX "AiAnalysisRun_leaseExpiresAt_idx"
  ON "AiAnalysisRun"("leaseExpiresAt");

CREATE UNIQUE INDEX "AiAnalysisRun_companyId_origin_scheduleBucket_key"
  ON "AiAnalysisRun"("companyId", "origin", "scheduleBucket");
