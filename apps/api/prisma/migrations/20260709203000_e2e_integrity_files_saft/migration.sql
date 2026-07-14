-- OPSA end-to-end remediation: immutable journal revisions, private object
-- metadata, SAF-T 1.04_01 readiness fields and cursor-pagination indexes.
-- This is the expand step; no legacy column or contract is removed here.

ALTER TABLE "CompanyInvitation"
ADD COLUMN "revokedAt" TIMESTAMP(3);

ALTER TABLE "CompanyProfile"
ADD COLUMN "commercialRegistrationNumber" TEXT,
ADD COLUMN "saftTaxAccountingBasis" TEXT,
ADD COLUMN "softwareCertificateNumber" INTEGER,
ADD COLUMN "productCompanyTaxId" TEXT,
ADD COLUMN "productId" TEXT,
ADD COLUMN "productVersion" TEXT;

ALTER TABLE "Account"
ADD COLUMN "saftGroupingCategory" TEXT,
ADD COLUMN "saftGroupingCode" TEXT,
ADD COLUMN "saftTaxonomyCode" INTEGER;

ALTER TABLE "VatRate"
ADD COLUMN "exemptionCode" TEXT;

ALTER TABLE "SaleDocument"
ADD COLUMN "atcud" TEXT,
ADD COLUMN "saftHash" TEXT,
ADD COLUMN "saftHashControl" TEXT;

CREATE TABLE "JournalEntryRevision" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "snapshotBefore" JSONB NOT NULL,
    "snapshotAfter" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JournalEntryRevision_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "JournalAttachment"
ADD COLUMN "sha256" TEXT,
ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'LOCAL',
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "storageMetadata" JSONB;

ALTER TABLE "SaftExportRun"
ADD COLUMN "type" TEXT NOT NULL DEFAULT 'FULL',
ADD COLUMN "fiscalPeriodId" TEXT,
ADD COLUMN "storageKey" TEXT,
ADD COLUMN "sha256" TEXT,
ADD COLUMN "sizeBytes" INTEGER,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'LEGACY',
ADD COLUMN "xsdStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN "totalsStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN "externalReviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN "validationDetails" JSONB,
ADD COLUMN "completedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "JournalEntryRevision_journalEntryId_revisionNumber_key"
ON "JournalEntryRevision"("journalEntryId", "revisionNumber");
CREATE INDEX "JournalEntryRevision_companyId_createdAt_idx"
ON "JournalEntryRevision"("companyId", "createdAt");
CREATE INDEX "JournalEntryRevision_changedById_createdAt_idx"
ON "JournalEntryRevision"("changedById", "createdAt");

CREATE INDEX "Account_companyId_code_id_idx"
ON "Account"("companyId", "code", "id");
CREATE INDEX "Customer_companyId_isActive_name_id_idx"
ON "Customer"("companyId", "isActive", "name", "id");
CREATE INDEX "Supplier_companyId_isActive_name_id_idx"
ON "Supplier"("companyId", "isActive", "name", "id");
CREATE INDEX "Item_companyId_isActive_sku_id_idx"
ON "Item"("companyId", "isActive", "sku", "id");
CREATE INDEX "SaleDocument_companyId_issuedAt_id_idx"
ON "SaleDocument"("companyId", "issuedAt", "id");
CREATE INDEX "PurchaseDocument_companyId_issuedAt_id_idx"
ON "PurchaseDocument"("companyId", "issuedAt", "id");
CREATE INDEX "AuditLog_companyId_createdAt_id_idx"
ON "AuditLog"("companyId", "createdAt", "id");
CREATE INDEX "StockMovement_companyId_createdAt_id_idx"
ON "StockMovement"("companyId", "createdAt", "id");
CREATE INDEX "JournalAttachment_companyId_status_createdAt_idx"
ON "JournalAttachment"("companyId", "status", "createdAt");
CREATE INDEX "SaftExportRun_company_period_type_exported_idx"
ON "SaftExportRun"("companyId", "fiscalPeriodId", "type", "exportedAt");
CREATE INDEX "SaftExportRun_status_exportedAt_idx"
ON "SaftExportRun"("status", "exportedAt");

ALTER TABLE "JournalEntryRevision"
ADD CONSTRAINT "JournalEntryRevision_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntryRevision"
ADD CONSTRAINT "JournalEntryRevision_journalEntryId_fkey"
FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntryRevision"
ADD CONSTRAINT "JournalEntryRevision_changedById_fkey"
FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaftExportRun"
ADD CONSTRAINT "SaftExportRun_fiscalPeriodId_fkey"
FOREIGN KEY ("fiscalPeriodId") REFERENCES "FiscalPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
