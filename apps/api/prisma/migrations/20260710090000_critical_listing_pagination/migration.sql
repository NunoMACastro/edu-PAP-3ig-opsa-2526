-- Suporta keyset pagination de lançamentos manuais por empresa, origem e data.
CREATE INDEX "JournalEntry_companyId_source_entryDate_id_idx"
ON "JournalEntry"("companyId", "source", "entryDate", "id");

-- Suporta títulos em aberto ordenados por vencimento sem varrer todas as vendas.
CREATE INDEX "SaleDocument_companyId_status_kind_dueDate_issuedAt_id_idx"
ON "SaleDocument"("companyId", "status", "kind", "dueDate", "issuedAt", "id");

-- Suporta o razão filtrado por conta e o join para a data do lançamento.
CREATE INDEX "JournalEntryLine_accountId_journalEntryId_id_idx"
ON "JournalEntryLine"("accountId", "journalEntryId", "id");
