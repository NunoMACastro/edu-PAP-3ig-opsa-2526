-- Associa novos recebimentos e pagamentos a contas de tesouraria.
-- As colunas ficam nullable para preservar movimentos históricos sem associação segura.
ALTER TABLE "Receipt" ADD COLUMN "treasuryAccountId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "treasuryAccountId" TEXT;

CREATE INDEX "Receipt_treasuryAccountId_idx" ON "Receipt"("treasuryAccountId");
CREATE INDEX "Payment_treasuryAccountId_idx" ON "Payment"("treasuryAccountId");

ALTER TABLE "Receipt"
ADD CONSTRAINT "Receipt_treasuryAccountId_fkey"
FOREIGN KEY ("treasuryAccountId") REFERENCES "TreasuryAccount"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment"
ADD CONSTRAINT "Payment_treasuryAccountId_fkey"
FOREIGN KEY ("treasuryAccountId") REFERENCES "TreasuryAccount"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
