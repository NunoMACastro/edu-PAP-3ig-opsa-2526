-- Expand-only: associa documentos ao armazem sem escolher um valor para historico.
ALTER TABLE "SaleDocument"
ADD COLUMN "warehouseId" TEXT,
ADD COLUMN "postedAt" TIMESTAMP(3),
ADD COLUMN "postedById" TEXT;

ALTER TABLE "PurchaseDocument"
ADD COLUMN "warehouseId" TEXT;

-- Falha com uma origem concreta antes de criar a garantia de idempotencia.
DO $$
DECLARE
    duplicate_source RECORD;
BEGIN
    SELECT
        "companyId",
        "sourceType",
        "sourceId",
        COUNT(*) AS duplicate_count
    INTO duplicate_source
    FROM "StockMovement"
    WHERE "sourceType" IS NOT NULL
      AND "sourceId" IS NOT NULL
    GROUP BY "companyId", "sourceType", "sourceId"
    HAVING COUNT(*) > 1
    ORDER BY "companyId", "sourceType", "sourceId"
    LIMIT 1;

    IF FOUND THEN
        RAISE EXCEPTION USING
            ERRCODE = '23505',
            MESSAGE = format(
                'Cannot create automatic stock movement idempotency constraint: duplicate origin %s/%s/%s (%s rows).',
                duplicate_source."companyId",
                duplicate_source."sourceType",
                duplicate_source."sourceId",
                duplicate_source.duplicate_count
            ),
            HINT = 'Review duplicated non-null StockMovement origins before re-running this migration; do not delete accounting evidence without approval.';
    END IF;
END $$;

CREATE INDEX "SaleDocument_companyId_warehouseId_idx"
ON "SaleDocument"("companyId", "warehouseId");

CREATE INDEX "PurchaseDocument_companyId_warehouseId_idx"
ON "PurchaseDocument"("companyId", "warehouseId");

CREATE INDEX "StockBalance_companyId_updatedAt_id_idx"
ON "StockBalance"("companyId", "updatedAt", "id");

CREATE UNIQUE INDEX "StockMovement_companyId_sourceType_sourceId_key"
ON "StockMovement"("companyId", "sourceType", "sourceId");

ALTER TABLE "SaleDocument"
ADD CONSTRAINT "SaleDocument_warehouseId_fkey"
FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PurchaseDocument"
ADD CONSTRAINT "PurchaseDocument_warehouseId_fkey"
FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
