-- OPSA end-to-end remediation: invitation acceptance, encrypted email outbox
-- and privacy-minimised authentication audit events.

ALTER TABLE "CompanyInvitation"
ADD COLUMN "acceptedById" TEXT,
ADD COLUMN "acceptedAt" TIMESTAMP(3);

CREATE TABLE "EmailOutbox" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "encryptedPayload" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmailOutbox_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SecurityAuditEvent" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "event" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "ipHash" TEXT,
    "subjectHash" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SecurityAuditEvent_pkey" PRIMARY KEY ("id")
);

-- Existing duplicates are safely revoked before enforcing one pending invite
-- per company/email. The newest pending invitation remains usable.
WITH ranked AS (
    SELECT "id",
           ROW_NUMBER() OVER (
               PARTITION BY "companyId", lower("email")
               ORDER BY "createdAt" DESC, "id" DESC
           ) AS position
    FROM "CompanyInvitation"
    WHERE "status" = 'PENDING'
)
UPDATE "CompanyInvitation" AS invitation
SET "status" = 'REVOKED'
FROM ranked
WHERE invitation."id" = ranked."id"
  AND ranked.position > 1;

CREATE UNIQUE INDEX "EmailOutbox_dedupeKey_key" ON "EmailOutbox"("dedupeKey");
CREATE INDEX "EmailOutbox_status_nextAttemptAt_idx" ON "EmailOutbox"("status", "nextAttemptAt");
CREATE INDEX "EmailOutbox_lockedAt_idx" ON "EmailOutbox"("lockedAt");
CREATE INDEX "CompanyInvitation_acceptedById_idx" ON "CompanyInvitation"("acceptedById");
CREATE UNIQUE INDEX "CompanyInvitation_pending_company_email_key"
ON "CompanyInvitation"("companyId", lower("email"))
WHERE "status" = 'PENDING';
CREATE INDEX "SecurityAuditEvent_actorUserId_createdAt_idx"
ON "SecurityAuditEvent"("actorUserId", "createdAt");
CREATE INDEX "SecurityAuditEvent_event_outcome_createdAt_idx"
ON "SecurityAuditEvent"("event", "outcome", "createdAt");

ALTER TABLE "CompanyInvitation"
ADD CONSTRAINT "CompanyInvitation_acceptedById_fkey"
FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SecurityAuditEvent"
ADD CONSTRAINT "SecurityAuditEvent_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
