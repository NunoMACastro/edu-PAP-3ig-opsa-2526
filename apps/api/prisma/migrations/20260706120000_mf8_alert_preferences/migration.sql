-- BK-MF8-12: alert preferences per active company, authenticated user and type.

CREATE TABLE "AlertPreference" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AlertPreference_companyId_userId_type_key"
ON "AlertPreference"("companyId", "userId", "type");

CREATE INDEX "AlertPreference_companyId_userId_idx"
ON "AlertPreference"("companyId", "userId");

CREATE INDEX "AlertPreference_type_idx"
ON "AlertPreference"("type");

ALTER TABLE "AlertPreference"
ADD CONSTRAINT "AlertPreference_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AlertPreference"
ADD CONSTRAINT "AlertPreference_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
