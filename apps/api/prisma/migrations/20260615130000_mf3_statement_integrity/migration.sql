-- Add explicit lifecycle state to statement imports and reconciliation suggestions.
ALTER TABLE "BankStatementImport"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'IMPORTED';

ALTER TABLE "BankReconciliationSuggestion"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'SUGGESTED';

-- Prevent duplicated statement lines inside the same import/company context.
CREATE UNIQUE INDEX "BankStatementLine_companyId_importId_entryDate_amountCents_description_key"
ON "BankStatementLine"("companyId", "importId", "entryDate", "amountCents", "description");
