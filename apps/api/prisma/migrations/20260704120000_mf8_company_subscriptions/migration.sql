-- BK-MF8-04: simulated subscription persisted per active company.

CREATE TYPE "CompanySubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');

CREATE TABLE "CompanySubscription" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planCode" TEXT NOT NULL,
    "status" "CompanySubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "simulated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CompanySubscription_companyId_key"
ON "CompanySubscription"("companyId");

CREATE INDEX "CompanySubscription_status_idx"
ON "CompanySubscription"("status");

CREATE INDEX "CompanySubscription_planCode_idx"
ON "CompanySubscription"("planCode");

ALTER TABLE "CompanySubscription"
ADD CONSTRAINT "CompanySubscription_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
