-- Expand-only: históricos permanecem NULL e não são reinterpretados/deduplicados.
ALTER TABLE "JournalAttachment"
ADD COLUMN "idempotencyKey" TEXT;

-- PostgreSQL permite múltiplos NULL; apenas novas escritas usam SHA-256 como chave.
CREATE UNIQUE INDEX "JournalAttachment_companyId_journalEntryId_idempotencyKey_key"
ON "JournalAttachment"("companyId", "journalEntryId", "idempotencyKey");
