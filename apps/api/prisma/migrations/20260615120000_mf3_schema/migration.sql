-- CreateEnum
CREATE TYPE "TreasuryAccountType" AS ENUM ('BANK', 'CASH');

-- CreateEnum
CREATE TYPE "BankStatementFormat" AS ENUM ('CSV', 'OFX');

-- CreateEnum
CREATE TYPE "ReconciliationTargetType" AS ENUM ('RECEIPT', 'PAYMENT');

-- CreateEnum
CREATE TYPE "BusinessImportType" AS ENUM ('CUSTOMERS', 'SUPPLIERS', 'ITEMS', 'STATEMENTS');

-- CreateTable
CREATE TABLE "VatMapRun" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "liquidatedVatCents" INTEGER NOT NULL,
    "deductibleVatCents" INTEGER NOT NULL,
    "vatBalanceCents" INTEGER NOT NULL,
    "generatedById" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VatMapRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreasuryAccount" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "TreasuryAccountType" NOT NULL,
    "name" TEXT NOT NULL,
    "iban" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "initialBalanceCents" INTEGER NOT NULL,
    "currentBalanceCents" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreasuryAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreasuryBalanceSnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "treasuryAccountId" TEXT NOT NULL,
    "balanceCents" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TreasuryBalanceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankStatementImport" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "treasuryAccountId" TEXT NOT NULL,
    "format" "BankStatementFormat" NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalLines" INTEGER NOT NULL,
    "acceptedLines" INTEGER NOT NULL,
    "rejectedLines" INTEGER NOT NULL,
    "errors" JSONB,
    "importedById" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankStatementImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankStatementLine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "treasuryAccountId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "amountCents" INTEGER NOT NULL,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankStatementLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankReconciliationSuggestion" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "statementLineId" TEXT NOT NULL,
    "targetType" "ReconciliationTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "confidenceBps" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankReconciliationSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashflowForecastRun" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "openingBalanceCents" INTEGER NOT NULL,
    "inflowCents" INTEGER NOT NULL,
    "outflowCents" INTEGER NOT NULL,
    "closingBalanceCents" INTEGER NOT NULL,
    "sources" JSONB,
    "generatedById" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashflowForecastRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessImportRun" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "BusinessImportType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "acceptedRows" INTEGER NOT NULL,
    "rejectedRows" INTEGER NOT NULL,
    "errors" JSONB,
    "importedById" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessImportRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaftExportRun" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "fileName" TEXT NOT NULL,
    "saleDocumentCount" INTEGER NOT NULL,
    "purchaseDocumentCount" INTEGER NOT NULL,
    "journalEntryCount" INTEGER NOT NULL,
    "exportedById" TEXT NOT NULL,
    "exportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaftExportRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalReportRun" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "revenueCents" INTEGER NOT NULL,
    "purchaseCents" INTEGER NOT NULL,
    "marginCents" INTEGER NOT NULL,
    "stockValueCents" INTEGER NOT NULL,
    "sources" JSONB,
    "generatedById" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationalReportRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutiveKpiRun" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "revenueCents" INTEGER NOT NULL,
    "costCents" INTEGER NOT NULL,
    "ebitdaCents" INTEGER NOT NULL,
    "pmrDays" DOUBLE PRECISION,
    "pmpDays" DOUBLE PRECISION,
    "sources" JSONB,
    "generatedById" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutiveKpiRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VatMapRun_companyId_fromDate_toDate_idx" ON "VatMapRun"("companyId", "fromDate", "toDate");

-- CreateIndex
CREATE INDEX "VatMapRun_generatedById_generatedAt_idx" ON "VatMapRun"("generatedById", "generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TreasuryAccount_companyId_name_key" ON "TreasuryAccount"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TreasuryAccount_companyId_iban_key" ON "TreasuryAccount"("companyId", "iban");

-- CreateIndex
CREATE INDEX "TreasuryAccount_companyId_isActive_idx" ON "TreasuryAccount"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "TreasuryBalanceSnapshot_companyId_treasuryAccountId_snapshotAt_idx" ON "TreasuryBalanceSnapshot"("companyId", "treasuryAccountId", "snapshotAt");

-- CreateIndex
CREATE INDEX "BankStatementImport_companyId_treasuryAccountId_importedAt_idx" ON "BankStatementImport"("companyId", "treasuryAccountId", "importedAt");

-- CreateIndex
CREATE INDEX "BankStatementImport_importedById_importedAt_idx" ON "BankStatementImport"("importedById", "importedAt");

-- CreateIndex
CREATE INDEX "BankStatementLine_companyId_entryDate_idx" ON "BankStatementLine"("companyId", "entryDate");

-- CreateIndex
CREATE INDEX "BankStatementLine_companyId_reference_idx" ON "BankStatementLine"("companyId", "reference");

-- CreateIndex
CREATE INDEX "BankStatementLine_importId_idx" ON "BankStatementLine"("importId");

-- CreateIndex
CREATE INDEX "BankReconciliationSuggestion_companyId_targetType_targetId_idx" ON "BankReconciliationSuggestion"("companyId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "BankReconciliationSuggestion_statementLineId_idx" ON "BankReconciliationSuggestion"("statementLineId");

-- CreateIndex
CREATE INDEX "CashflowForecastRun_companyId_fromDate_toDate_idx" ON "CashflowForecastRun"("companyId", "fromDate", "toDate");

-- CreateIndex
CREATE INDEX "BusinessImportRun_companyId_type_importedAt_idx" ON "BusinessImportRun"("companyId", "type", "importedAt");

-- CreateIndex
CREATE INDEX "SaftExportRun_companyId_fromDate_toDate_idx" ON "SaftExportRun"("companyId", "fromDate", "toDate");

-- CreateIndex
CREATE INDEX "OperationalReportRun_companyId_fromDate_toDate_idx" ON "OperationalReportRun"("companyId", "fromDate", "toDate");

-- CreateIndex
CREATE INDEX "ExecutiveKpiRun_companyId_fromDate_toDate_idx" ON "ExecutiveKpiRun"("companyId", "fromDate", "toDate");

-- AddForeignKey
ALTER TABLE "VatMapRun" ADD CONSTRAINT "VatMapRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VatMapRun" ADD CONSTRAINT "VatMapRun_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreasuryAccount" ADD CONSTRAINT "TreasuryAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreasuryAccount" ADD CONSTRAINT "TreasuryAccount_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreasuryBalanceSnapshot" ADD CONSTRAINT "TreasuryBalanceSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreasuryBalanceSnapshot" ADD CONSTRAINT "TreasuryBalanceSnapshot_treasuryAccountId_fkey" FOREIGN KEY ("treasuryAccountId") REFERENCES "TreasuryAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankStatementImport" ADD CONSTRAINT "BankStatementImport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankStatementImport" ADD CONSTRAINT "BankStatementImport_treasuryAccountId_fkey" FOREIGN KEY ("treasuryAccountId") REFERENCES "TreasuryAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankStatementImport" ADD CONSTRAINT "BankStatementImport_importedById_fkey" FOREIGN KEY ("importedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankStatementLine" ADD CONSTRAINT "BankStatementLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankStatementLine" ADD CONSTRAINT "BankStatementLine_importId_fkey" FOREIGN KEY ("importId") REFERENCES "BankStatementImport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankStatementLine" ADD CONSTRAINT "BankStatementLine_treasuryAccountId_fkey" FOREIGN KEY ("treasuryAccountId") REFERENCES "TreasuryAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliationSuggestion" ADD CONSTRAINT "BankReconciliationSuggestion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliationSuggestion" ADD CONSTRAINT "BankReconciliationSuggestion_importId_fkey" FOREIGN KEY ("importId") REFERENCES "BankStatementImport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliationSuggestion" ADD CONSTRAINT "BankReconciliationSuggestion_statementLineId_fkey" FOREIGN KEY ("statementLineId") REFERENCES "BankStatementLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashflowForecastRun" ADD CONSTRAINT "CashflowForecastRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashflowForecastRun" ADD CONSTRAINT "CashflowForecastRun_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessImportRun" ADD CONSTRAINT "BusinessImportRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessImportRun" ADD CONSTRAINT "BusinessImportRun_importedById_fkey" FOREIGN KEY ("importedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaftExportRun" ADD CONSTRAINT "SaftExportRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaftExportRun" ADD CONSTRAINT "SaftExportRun_exportedById_fkey" FOREIGN KEY ("exportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalReportRun" ADD CONSTRAINT "OperationalReportRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalReportRun" ADD CONSTRAINT "OperationalReportRun_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutiveKpiRun" ADD CONSTRAINT "ExecutiveKpiRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutiveKpiRun" ADD CONSTRAINT "ExecutiveKpiRun_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
