-- AlterEnum
ALTER TYPE "PurchaseDocumentStatus" ADD VALUE 'REJECTED';

-- CreateEnum
CREATE TYPE "PurchaseDecisionAction" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('ENTRY', 'EXIT', 'TRANSFER', 'RETURN', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "InventoryCountStatus" AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "PurchaseApprovalHistory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "purchaseDocumentId" TEXT NOT NULL,
    "action" "PurchaseDecisionAction" NOT NULL,
    "reason" TEXT NOT NULL,
    "decidedById" TEXT NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseApprovalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockBalance" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL,
    "unitCostCents" INTEGER,
    "totalCostCents" INTEGER,
    "fromWarehouseId" TEXT,
    "toWarehouseId" TEXT,
    "reason" TEXT NOT NULL,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockCostLayer" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "sourceMovementId" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL,
    "remainingQuantity" DECIMAL(18,3) NOT NULL,
    "unitCostCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockCostLayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockCostConsumption" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "movementId" TEXT NOT NULL,
    "layerId" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL,
    "unitCostCents" INTEGER NOT NULL,
    "totalCostCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockCostConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryCount" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "status" "InventoryCountStatus" NOT NULL DEFAULT 'DRAFT',
    "reason" TEXT NOT NULL,
    "countedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryCountLine" (
    "id" TEXT NOT NULL,
    "inventoryCountId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "expectedQuantity" DECIMAL(18,3) NOT NULL,
    "countedQuantity" DECIMAL(18,3) NOT NULL,
    "unitCostCents" INTEGER,

    CONSTRAINT "InventoryCountLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockAlertSetting" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "minQuantity" DECIMAL(18,3),
    "maxQuantity" DECIMAL(18,3),
    "stoppedAfterDays" INTEGER DEFAULT 90,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockAlertSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalAttachment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PurchaseApprovalHistory_companyId_purchaseDocumentId_decidedAt_idx" ON "PurchaseApprovalHistory"("companyId", "purchaseDocumentId", "decidedAt");

-- CreateIndex
CREATE INDEX "StockBalance_companyId_warehouseId_idx" ON "StockBalance"("companyId", "warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "StockBalance_companyId_itemId_warehouseId_key" ON "StockBalance"("companyId", "itemId", "warehouseId");

-- CreateIndex
CREATE INDEX "StockMovement_companyId_itemId_createdAt_idx" ON "StockMovement"("companyId", "itemId", "createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_companyId_fromWarehouseId_idx" ON "StockMovement"("companyId", "fromWarehouseId");

-- CreateIndex
CREATE INDEX "StockMovement_companyId_toWarehouseId_idx" ON "StockMovement"("companyId", "toWarehouseId");

-- CreateIndex
CREATE INDEX "StockCostLayer_companyId_itemId_warehouseId_createdAt_idx" ON "StockCostLayer"("companyId", "itemId", "warehouseId", "createdAt");

-- CreateIndex
CREATE INDEX "StockCostConsumption_companyId_movementId_idx" ON "StockCostConsumption"("companyId", "movementId");

-- CreateIndex
CREATE INDEX "InventoryCount_companyId_warehouseId_status_idx" ON "InventoryCount"("companyId", "warehouseId", "status");

-- CreateIndex
CREATE INDEX "InventoryCountLine_itemId_idx" ON "InventoryCountLine"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryCountLine_inventoryCountId_itemId_key" ON "InventoryCountLine"("inventoryCountId", "itemId");

-- CreateIndex
CREATE INDEX "StockAlertSetting_companyId_warehouseId_idx" ON "StockAlertSetting"("companyId", "warehouseId");

-- CreateIndex
CREATE INDEX "StockAlertSetting_itemId_idx" ON "StockAlertSetting"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "StockAlertSetting_companyId_itemId_warehouseId_key" ON "StockAlertSetting"("companyId", "itemId", "warehouseId");

-- CreateIndex
CREATE INDEX "JournalAttachment_companyId_journalEntryId_idx" ON "JournalAttachment"("companyId", "journalEntryId");

-- CreateIndex
CREATE INDEX "JournalAttachment_uploadedById_idx" ON "JournalAttachment"("uploadedById");

-- AddForeignKey
ALTER TABLE "PurchaseApprovalHistory" ADD CONSTRAINT "PurchaseApprovalHistory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseApprovalHistory" ADD CONSTRAINT "PurchaseApprovalHistory_purchaseDocumentId_fkey" FOREIGN KEY ("purchaseDocumentId") REFERENCES "PurchaseDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseApprovalHistory" ADD CONSTRAINT "PurchaseApprovalHistory_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBalance" ADD CONSTRAINT "StockBalance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBalance" ADD CONSTRAINT "StockBalance_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBalance" ADD CONSTRAINT "StockBalance_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCostLayer" ADD CONSTRAINT "StockCostLayer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCostLayer" ADD CONSTRAINT "StockCostLayer_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCostLayer" ADD CONSTRAINT "StockCostLayer_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCostLayer" ADD CONSTRAINT "StockCostLayer_sourceMovementId_fkey" FOREIGN KEY ("sourceMovementId") REFERENCES "StockMovement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCostConsumption" ADD CONSTRAINT "StockCostConsumption_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCostConsumption" ADD CONSTRAINT "StockCostConsumption_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "StockMovement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCostConsumption" ADD CONSTRAINT "StockCostConsumption_layerId_fkey" FOREIGN KEY ("layerId") REFERENCES "StockCostLayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCount" ADD CONSTRAINT "InventoryCount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCount" ADD CONSTRAINT "InventoryCount_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCount" ADD CONSTRAINT "InventoryCount_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCountLine" ADD CONSTRAINT "InventoryCountLine_inventoryCountId_fkey" FOREIGN KEY ("inventoryCountId") REFERENCES "InventoryCount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCountLine" ADD CONSTRAINT "InventoryCountLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlertSetting" ADD CONSTRAINT "StockAlertSetting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlertSetting" ADD CONSTRAINT "StockAlertSetting_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlertSetting" ADD CONSTRAINT "StockAlertSetting_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalAttachment" ADD CONSTRAINT "JournalAttachment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalAttachment" ADD CONSTRAINT "JournalAttachment_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalAttachment" ADD CONSTRAINT "JournalAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
