-- MF4: IA assistiva explicavel, lembretes, tarefas, notificacoes, auditoria visivel e logs de integracao.

CREATE TABLE "AiInsight" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "suggestedAction" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "generatedById" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiActionSuggestion" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "insightId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiActionSuggestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiQuestionRun" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sources" JSONB NOT NULL,
    "askedById" TEXT NOT NULL,
    "askedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiQuestionRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SmartAlert" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "generatedById" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmartAlert_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationalTask" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InAppNotification" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InAppNotification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntegrationLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "integrationType" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sourceId" TEXT,
    "fileName" TEXT,
    "totalRows" INTEGER,
    "successRows" INTEGER,
    "errorRows" INTEGER,
    "message" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiInsight_companyId_type_sourceType_sourceId_key" ON "AiInsight"("companyId", "type", "sourceType", "sourceId");
CREATE INDEX "AiInsight_companyId_severity_status_idx" ON "AiInsight"("companyId", "severity", "status");
CREATE INDEX "AiInsight_generatedById_generatedAt_idx" ON "AiInsight"("generatedById", "generatedAt");

CREATE UNIQUE INDEX "AiActionSuggestion_companyId_insightId_actionType_key" ON "AiActionSuggestion"("companyId", "insightId", "actionType");
CREATE INDEX "AiActionSuggestion_companyId_status_idx" ON "AiActionSuggestion"("companyId", "status");
CREATE INDEX "AiActionSuggestion_createdById_createdAt_idx" ON "AiActionSuggestion"("createdById", "createdAt");

CREATE INDEX "AiQuestionRun_companyId_askedAt_idx" ON "AiQuestionRun"("companyId", "askedAt");
CREATE INDEX "AiQuestionRun_askedById_askedAt_idx" ON "AiQuestionRun"("askedById", "askedAt");

CREATE UNIQUE INDEX "SmartAlert_companyId_type_sourceType_sourceId_key" ON "SmartAlert"("companyId", "type", "sourceType", "sourceId");
CREATE INDEX "SmartAlert_companyId_severity_status_idx" ON "SmartAlert"("companyId", "severity", "status");
CREATE INDEX "SmartAlert_generatedById_generatedAt_idx" ON "SmartAlert"("generatedById", "generatedAt");

CREATE INDEX "Reminder_companyId_status_dueAt_idx" ON "Reminder"("companyId", "status", "dueAt");
CREATE INDEX "Reminder_createdById_dueAt_idx" ON "Reminder"("createdById", "dueAt");

CREATE INDEX "OperationalTask_companyId_status_dueAt_idx" ON "OperationalTask"("companyId", "status", "dueAt");
CREATE INDEX "OperationalTask_assignedToId_dueAt_idx" ON "OperationalTask"("assignedToId", "dueAt");

CREATE UNIQUE INDEX "InAppNotification_companyId_userId_sourceType_sourceId_key" ON "InAppNotification"("companyId", "userId", "sourceType", "sourceId");
CREATE INDEX "InAppNotification_companyId_userId_readAt_idx" ON "InAppNotification"("companyId", "userId", "readAt");
CREATE INDEX "InAppNotification_companyId_createdAt_idx" ON "InAppNotification"("companyId", "createdAt");

CREATE INDEX "IntegrationLog_companyId_integrationType_createdAt_idx" ON "IntegrationLog"("companyId", "integrationType", "createdAt");
CREATE INDEX "IntegrationLog_companyId_status_createdAt_idx" ON "IntegrationLog"("companyId", "status", "createdAt");

ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiActionSuggestion" ADD CONSTRAINT "AiActionSuggestion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AiActionSuggestion" ADD CONSTRAINT "AiActionSuggestion_insightId_fkey" FOREIGN KEY ("insightId") REFERENCES "AiInsight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AiActionSuggestion" ADD CONSTRAINT "AiActionSuggestion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiQuestionRun" ADD CONSTRAINT "AiQuestionRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AiQuestionRun" ADD CONSTRAINT "AiQuestionRun_askedById_fkey" FOREIGN KEY ("askedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SmartAlert" ADD CONSTRAINT "SmartAlert_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SmartAlert" ADD CONSTRAINT "SmartAlert_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OperationalTask" ADD CONSTRAINT "OperationalTask_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OperationalTask" ADD CONSTRAINT "OperationalTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OperationalTask" ADD CONSTRAINT "OperationalTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InAppNotification" ADD CONSTRAINT "InAppNotification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InAppNotification" ADD CONSTRAINT "InAppNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "IntegrationLog" ADD CONSTRAINT "IntegrationLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IntegrationLog" ADD CONSTRAINT "IntegrationLog_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
