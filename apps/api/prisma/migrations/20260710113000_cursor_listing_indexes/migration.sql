-- Expand-only: suporta a ordenacao keyset usada pela recuperacao de importacoes.
CREATE INDEX "BankStatementImport_companyId_importedAt_id_idx"
ON "BankStatementImport"("companyId", "importedAt", "id");

-- Expand-only: suporta logs de integracao ordenados por data e ID de desempate.
CREATE INDEX "IntegrationLog_companyId_createdAt_id_idx"
ON "IntegrationLog"("companyId", "createdAt", "id");
