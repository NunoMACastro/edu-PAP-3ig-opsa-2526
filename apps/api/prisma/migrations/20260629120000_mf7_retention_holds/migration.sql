-- BK-MF7-02: legal accounting retention holds per active company.

CREATE TABLE "RetentionHold" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "periodEndAt" TIMESTAMP(3) NOT NULL,
    "retainUntil" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetentionHold_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RetentionHold_companyId_entity_entityId_key"
ON "RetentionHold"("companyId", "entity", "entityId");

CREATE INDEX "RetentionHold_companyId_entity_idx"
ON "RetentionHold"("companyId", "entity");

CREATE INDEX "RetentionHold_companyId_retainUntil_idx"
ON "RetentionHold"("companyId", "retainUntil");

ALTER TABLE "RetentionHold"
ADD CONSTRAINT "RetentionHold_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
