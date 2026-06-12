-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GESTOR', 'CONTABILISTA', 'OPERACIONAL', 'AUDITOR');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "FiscalPeriodStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activeCompanyId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nif" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyInvitation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'PT',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "logoUrl" TEXT,
    "fiscalYearStartMonth" INTEGER NOT NULL,
    "fiscalYearStartDay" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentCode" TEXT,
    "level" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalPeriod" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "FiscalPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nif" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "addressLine" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nif" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "addressLine" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "costCents" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "vatRateBps" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseLocation" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WarehouseLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_activeCompanyId_idx" ON "Session"("activeCompanyId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Company_nif_key" ON "Company"("nif");

-- CreateIndex
CREATE INDEX "CompanyMembership_companyId_idx" ON "CompanyMembership"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMembership_userId_companyId_key" ON "CompanyMembership"("userId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyInvitation_tokenHash_key" ON "CompanyInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "CompanyInvitation_companyId_idx" ON "CompanyInvitation"("companyId");

-- CreateIndex
CREATE INDEX "CompanyInvitation_email_idx" ON "CompanyInvitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProfile_companyId_key" ON "CompanyProfile"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProfile_nif_key" ON "CompanyProfile"("nif");

-- CreateIndex
CREATE INDEX "Account_companyId_idx" ON "Account"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_companyId_code_key" ON "Account"("companyId", "code");

-- CreateIndex
CREATE INDEX "FiscalPeriod_companyId_startDate_endDate_idx" ON "FiscalPeriod"("companyId", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalPeriod_companyId_name_key" ON "FiscalPeriod"("companyId", "name");

-- CreateIndex
CREATE INDEX "Customer_companyId_idx" ON "Customer"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_companyId_nif_key" ON "Customer"("companyId", "nif");

-- CreateIndex
CREATE INDEX "Supplier_companyId_idx" ON "Supplier"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_companyId_nif_key" ON "Supplier"("companyId", "nif");

-- CreateIndex
CREATE INDEX "Item_companyId_idx" ON "Item"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_companyId_sku_key" ON "Item"("companyId", "sku");

-- CreateIndex
CREATE INDEX "Warehouse_companyId_idx" ON "Warehouse"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_companyId_code_key" ON "Warehouse"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_companyId_name_key" ON "Warehouse"("companyId", "name");

-- CreateIndex
CREATE INDEX "WarehouseLocation_warehouseId_idx" ON "WarehouseLocation"("warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseLocation_warehouseId_code_key" ON "WarehouseLocation"("warehouseId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseLocation_warehouseId_name_key" ON "WarehouseLocation"("warehouseId", "name");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMembership" ADD CONSTRAINT "CompanyMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMembership" ADD CONSTRAINT "CompanyMembership_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInvitation" ADD CONSTRAINT "CompanyInvitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalPeriod" ADD CONSTRAINT "FiscalPeriod_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseLocation" ADD CONSTRAINT "WarehouseLocation_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
