/**
 * @file Contrato expand-only dos indices que suportam cursor pagination critica.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL(
    "../../prisma/migrations/20260710113000_cursor_listing_indexes/migration.sql",
    import.meta.url,
);
const schemaUrl = new URL("../../prisma/schema.prisma", import.meta.url);

test("P2-011: schema e migration materializam os indices das ordenacoes keyset", async () => {
    const [schema, migration] = await Promise.all([
        readFile(schemaUrl, "utf8"),
        readFile(migrationUrl, "utf8"),
    ]);

    assert.match(schema, /@@index\(\[companyId, importedAt, id\]\)/);
    assert.match(schema, /@@index\(\[companyId, createdAt, id\]\)/);
    assert.match(
        migration,
        /CREATE INDEX "BankStatementImport_companyId_importedAt_id_idx"\s+ON "BankStatementImport"\("companyId", "importedAt", "id"\);/,
    );
    assert.match(
        migration,
        /CREATE INDEX "IntegrationLog_companyId_createdAt_id_idx"\s+ON "IntegrationLog"\("companyId", "createdAt", "id"\);/,
    );
    assert.doesNotMatch(migration, /DROP\s+(?:INDEX|TABLE|COLUMN)/i);
});
