-- Reestruturação aditiva da IA OPSA. OpenAI permanece desligada por omissão.

ALTER TABLE "OperationalReportRun"
  ALTER COLUMN "revenueCents" DROP NOT NULL,
  ALTER COLUMN "purchaseCents" DROP NOT NULL,
  ALTER COLUMN "marginCents" DROP NOT NULL,
  ADD COLUMN "operatingResultCents" INTEGER,
  ADD COLUMN "operatingMarginBps" INTEGER,
  ADD COLUMN "accountingMethod" TEXT NOT NULL DEFAULT 'LEGACY_DOCUMENT_TOTALS',
  ADD COLUMN "dataQuality" TEXT NOT NULL DEFAULT 'LEGACY';

ALTER TABLE "ExecutiveKpiRun"
  ALTER COLUMN "revenueCents" DROP NOT NULL,
  ALTER COLUMN "costCents" DROP NOT NULL,
  ALTER COLUMN "ebitdaCents" DROP NOT NULL,
  ADD COLUMN "operatingResultCents" INTEGER,
  ADD COLUMN "operatingMarginBps" INTEGER,
  ADD COLUMN "accountingMethod" TEXT NOT NULL DEFAULT 'LEGACY_DOCUMENT_TOTALS',
  ADD COLUMN "dataQuality" TEXT NOT NULL DEFAULT 'LEGACY';

ALTER TABLE "AiInsight"
  ALTER COLUMN "generatedById" DROP NOT NULL,
  ADD COLUMN "ruleCode" TEXT NOT NULL DEFAULT 'LEGACY',
  ADD COLUMN "ruleVersion" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "fingerprint" TEXT,
  ADD COLUMN "score" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "evidence" JSONB,
  ADD COLUMN "periodFrom" TIMESTAMP(3),
  ADD COLUMN "periodTo" TIMESTAMP(3),
  ADD COLUMN "asOf" TIMESTAMP(3),
  ADD COLUMN "firstDetectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "lastDetectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "resolvedAt" TIMESTAMP(3),
  ADD COLUMN "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "origin" TEXT NOT NULL DEFAULT 'USER';

ALTER TABLE "AiActionSuggestion"
  ALTER COLUMN "createdById" DROP NOT NULL,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "feedback" TEXT,
  ADD COLUMN "feedbackReason" TEXT,
  ADD COLUMN "completedAt" TIMESTAMP(3);

ALTER TABLE "SmartAlert"
  ALTER COLUMN "generatedById" DROP NOT NULL,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "ruleCode" TEXT NOT NULL DEFAULT 'LEGACY',
  ADD COLUMN "ruleVersion" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "fingerprint" TEXT,
  ADD COLUMN "score" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "evidence" JSONB,
  ADD COLUMN "periodFrom" TIMESTAMP(3),
  ADD COLUMN "periodTo" TIMESTAMP(3),
  ADD COLUMN "asOf" TIMESTAMP(3),
  ADD COLUMN "firstDetectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "lastDetectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "resolvedAt" TIMESTAMP(3),
  ADD COLUMN "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "origin" TEXT NOT NULL DEFAULT 'USER';

ALTER TABLE "InAppNotification"
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'OPEN',
  ADD COLUMN "resolvedAt" TIMESTAMP(3);

CREATE TABLE "CompanyAiSettings" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "openAiEnabled" BOOLEAN NOT NULL DEFAULT false,
  "policyVersion" TEXT NOT NULL DEFAULT '2026-01',
  "userDailyTurnLimit" INTEGER NOT NULL DEFAULT 50,
  "companyDailyTurnLimit" INTEGER NOT NULL DEFAULT 500,
  "enabledById" TEXT,
  "enabledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyAiSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiUserConsent" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "policyVersion" TEXT NOT NULL,
  "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiUserConsent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiChatSession" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "titleEncrypted" TEXT,
  "aliasMapEncrypted" TEXT,
  "summaryEncrypted" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiChatSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiChatMessage" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'COMPLETED',
  "payloadEncrypted" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT,
  "inputTokens" INTEGER NOT NULL DEFAULT 0,
  "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "feedback" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiUsageEvent" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sessionId" TEXT,
  "provider" TEXT NOT NULL,
  "model" TEXT,
  "toolCodes" JSONB,
  "outcome" TEXT NOT NULL,
  "durationMs" INTEGER NOT NULL,
  "inputTokens" INTEGER NOT NULL DEFAULT 0,
  "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiUsageEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiRuleSetting" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "ruleCode" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "parameters" JSONB,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiRuleSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiAnalysisRun" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "requestedById" TEXT,
  "origin" TEXT NOT NULL DEFAULT 'USER',
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "fromDate" TIMESTAMP(3) NOT NULL,
  "toDate" TIMESTAMP(3) NOT NULL,
  "scopes" JSONB,
  "resultSummary" JSONB,
  "errorCode" TEXT,
  "claimedBy" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiAnalysisRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiDeletionAudit" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "deletedOwnerId" TEXT NOT NULL,
  "sessionIdHash" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiDeletionAudit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CompanyAiSettings_companyId_key" ON "CompanyAiSettings"("companyId");
CREATE UNIQUE INDEX "AiUserConsent_companyId_userId_key" ON "AiUserConsent"("companyId", "userId");
CREATE UNIQUE INDEX "AiRuleSetting_companyId_ruleCode_key" ON "AiRuleSetting"("companyId", "ruleCode");
CREATE INDEX "AiInsight_companyId_status_score_idx" ON "AiInsight"("companyId", "status", "score");
CREATE INDEX "AiInsight_companyId_ruleCode_fingerprint_idx" ON "AiInsight"("companyId", "ruleCode", "fingerprint");
CREATE INDEX "SmartAlert_companyId_status_score_idx" ON "SmartAlert"("companyId", "status", "score");
CREATE INDEX "SmartAlert_companyId_ruleCode_fingerprint_idx" ON "SmartAlert"("companyId", "ruleCode", "fingerprint");
CREATE INDEX "AiUserConsent_userId_revokedAt_idx" ON "AiUserConsent"("userId", "revokedAt");
CREATE INDEX "AiChatSession_companyId_userId_updatedAt_idx" ON "AiChatSession"("companyId", "userId", "updatedAt");
CREATE INDEX "AiChatSession_expiresAt_idx" ON "AiChatSession"("expiresAt");
CREATE INDEX "AiChatMessage_sessionId_createdAt_idx" ON "AiChatMessage"("sessionId", "createdAt");
CREATE INDEX "AiUsageEvent_companyId_createdAt_idx" ON "AiUsageEvent"("companyId", "createdAt");
CREATE INDEX "AiUsageEvent_userId_createdAt_idx" ON "AiUsageEvent"("userId", "createdAt");
CREATE INDEX "AiAnalysisRun_status_createdAt_idx" ON "AiAnalysisRun"("status", "createdAt");
CREATE INDEX "AiAnalysisRun_companyId_createdAt_idx" ON "AiAnalysisRun"("companyId", "createdAt");
CREATE INDEX "AiDeletionAudit_companyId_deletedAt_idx" ON "AiDeletionAudit"("companyId", "deletedAt");

ALTER TABLE "CompanyAiSettings" ADD CONSTRAINT "CompanyAiSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyAiSettings" ADD CONSTRAINT "CompanyAiSettings_enabledById_fkey" FOREIGN KEY ("enabledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiUserConsent" ADD CONSTRAINT "AiUserConsent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiUserConsent" ADD CONSTRAINT "AiUserConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiChatSession" ADD CONSTRAINT "AiChatSession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiChatSession" ADD CONSTRAINT "AiChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiChatMessage" ADD CONSTRAINT "AiChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AiChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiUsageEvent" ADD CONSTRAINT "AiUsageEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiUsageEvent" ADD CONSTRAINT "AiUsageEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiRuleSetting" ADD CONSTRAINT "AiRuleSetting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiRuleSetting" ADD CONSTRAINT "AiRuleSetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiAnalysisRun" ADD CONSTRAINT "AiAnalysisRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAnalysisRun" ADD CONSTRAINT "AiAnalysisRun_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiDeletionAudit" ADD CONSTRAINT "AiDeletionAudit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
