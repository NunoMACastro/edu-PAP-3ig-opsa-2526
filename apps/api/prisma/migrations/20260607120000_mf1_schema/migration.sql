-- CreateEnum
CREATE TYPE "VatRateType" AS ENUM ('NORMAL', 'INTERMEDIATE', 'REDUCED', 'EXEMPT', 'OTHER');

-- CreateEnum
CREATE TYPE "SaleDocumentKind" AS ENUM ('INVOICE', 'INVOICE_RECEIPT', 'CREDIT_NOTE');

-- CreateEnum
CREATE TYPE "SaleDocumentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ISSUED', 'SETTLED');

-- CreateEnum
CREATE TYPE "ReceiptMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "JournalSource" AS ENUM ('SALE', 'PURCHASE', 'MANUAL');

-- CreateEnum
CREATE TYPE "PurchaseDocumentKind" AS ENUM ('SUPPLIER_INVOICE', 'SUPPLIER_CREDIT_NOTE');

-- CreateEnum
CREATE TYPE "PurchaseDocumentStatus" AS ENUM ('DRAFT', 'APPROVED', 'POSTED', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'OTHER');

-- CreateTable
CREATE TABLE "VatRate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rateBps" INTEGER NOT NULL,
    "type" "VatRateType" NOT NULL,
    "exemptionReason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VatRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NumberSequence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "prefix" TEXT NOT NULL,
    "nextValue" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NumberSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleDocument" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "kind" "SaleDocumentKind" NOT NULL,
    "status" "SaleDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "number" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "subtotalCents" INTEGER NOT NULL,
    "vatCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "amountPaidCents" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "submittedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "rejectionReason" TEXT,
    "issuedById" TEXT,
    "issuedDefinitiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleDocumentLine" (
    "id" TEXT NOT NULL,
    "saleDocumentId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "vatRateId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "vatCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,

    CONSTRAINT "SaleDocumentLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "saleDocumentId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "method" "ReceiptMethod" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "source" "JournalSource" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntryLine" (
    "id" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "debitCents" INTEGER NOT NULL DEFAULT 0,
    "creditCents" INTEGER NOT NULL DEFAULT 0,
    "memo" TEXT,

    CONSTRAINT "JournalEntryLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseDocument" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "kind" "PurchaseDocumentKind" NOT NULL,
    "status" "PurchaseDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "supplierNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "subtotalCents" INTEGER NOT NULL,
    "vatCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "amountPaidCents" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "postedAt" TIMESTAMP(3),
    "postedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseDocumentLine" (
    "id" TEXT NOT NULL,
    "purchaseDocumentId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "vatRateId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCostCents" INTEGER NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "vatCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,

    CONSTRAINT "PurchaseDocumentLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "purchaseDocumentId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VatRate_companyId_isActive_idx" ON "VatRate"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "VatRate_companyId_code_key" ON "VatRate"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "NumberSequence_companyId_scope_year_key" ON "NumberSequence"("companyId", "scope", "year");

-- CreateIndex
CREATE INDEX "SaleDocument_companyId_customerId_issuedAt_idx" ON "SaleDocument"("companyId", "customerId", "issuedAt");

-- CreateIndex
CREATE INDEX "SaleDocument_companyId_status_issuedAt_idx" ON "SaleDocument"("companyId", "status", "issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SaleDocument_companyId_number_key" ON "SaleDocument"("companyId", "number");

-- CreateIndex
CREATE INDEX "Receipt_companyId_receivedAt_idx" ON "Receipt"("companyId", "receivedAt");

-- CreateIndex
CREATE INDEX "Receipt_saleDocumentId_idx" ON "Receipt"("saleDocumentId");

-- CreateIndex
CREATE INDEX "JournalEntry_companyId_entryDate_idx" ON "JournalEntry"("companyId", "entryDate");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_companyId_source_sourceId_key" ON "JournalEntry"("companyId", "source", "sourceId");

-- CreateIndex
CREATE INDEX "PurchaseDocument_companyId_supplierId_issuedAt_idx" ON "PurchaseDocument"("companyId", "supplierId", "issuedAt");

-- CreateIndex
CREATE INDEX "PurchaseDocument_companyId_status_issuedAt_idx" ON "PurchaseDocument"("companyId", "status", "issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseDocument_companyId_supplierId_supplierNumber_key" ON "PurchaseDocument"("companyId", "supplierId", "supplierNumber");

-- CreateIndex
CREATE INDEX "Payment_companyId_paidAt_idx" ON "Payment"("companyId", "paidAt");

-- CreateIndex
CREATE INDEX "Payment_purchaseDocumentId_idx" ON "Payment"("purchaseDocumentId");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_entity_entityId_idx" ON "AuditLog"("companyId", "entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_createdAt_idx" ON "AuditLog"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "VatRate" ADD CONSTRAINT "VatRate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NumberSequence" ADD CONSTRAINT "NumberSequence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleDocument" ADD CONSTRAINT "SaleDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleDocument" ADD CONSTRAINT "SaleDocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleDocumentLine" ADD CONSTRAINT "SaleDocumentLine_saleDocumentId_fkey" FOREIGN KEY ("saleDocumentId") REFERENCES "SaleDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleDocumentLine" ADD CONSTRAINT "SaleDocumentLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleDocumentLine" ADD CONSTRAINT "SaleDocumentLine_vatRateId_fkey" FOREIGN KEY ("vatRateId") REFERENCES "VatRate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_saleDocumentId_fkey" FOREIGN KEY ("saleDocumentId") REFERENCES "SaleDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseDocument" ADD CONSTRAINT "PurchaseDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseDocument" ADD CONSTRAINT "PurchaseDocument_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseDocumentLine" ADD CONSTRAINT "PurchaseDocumentLine_purchaseDocumentId_fkey" FOREIGN KEY ("purchaseDocumentId") REFERENCES "PurchaseDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseDocumentLine" ADD CONSTRAINT "PurchaseDocumentLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseDocumentLine" ADD CONSTRAINT "PurchaseDocumentLine_vatRateId_fkey" FOREIGN KEY ("vatRateId") REFERENCES "VatRate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_purchaseDocumentId_fkey" FOREIGN KEY ("purchaseDocumentId") REFERENCES "PurchaseDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
