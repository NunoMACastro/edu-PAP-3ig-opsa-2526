-- Expand-only: campos SAF-T permanecem nullable até configuração fiscal explícita.
-- Não existe qualquer backfill/default porque inferir estes valores alteraria o
-- significado fiscal de registos históricos.

ALTER TABLE "CompanyProfile"
    ADD COLUMN "saftTaxEntity" TEXT,
    ADD COLUMN "saftTaxonomyReference" TEXT,
    ADD COLUMN "saftSelfBillingIndicator" INTEGER,
    ADD COLUMN "saftCashVatSchemeIndicator" INTEGER,
    ADD COLUMN "saftThirdPartiesBillingIndicator" INTEGER;

ALTER TABLE "Customer"
    ADD COLUMN "country" TEXT,
    ADD COLUMN "saftAccountId" TEXT,
    ADD COLUMN "selfBillingIndicator" INTEGER;

ALTER TABLE "Supplier"
    ADD COLUMN "country" TEXT,
    ADD COLUMN "saftAccountId" TEXT,
    ADD COLUMN "selfBillingIndicator" INTEGER;

ALTER TABLE "Item"
    ADD COLUMN "unitOfMeasure" TEXT;

ALTER TABLE "VatRate"
    ADD COLUMN "taxCountryRegion" TEXT;

ALTER TABLE "JournalEntry"
    ADD COLUMN "saftTransactionType" TEXT;

ALTER TABLE "CompanyProfile"
    ADD CONSTRAINT "CompanyProfile_saftTaxonomyReference_check"
        CHECK ("saftTaxonomyReference" IS NULL OR "saftTaxonomyReference" IN ('S', 'M', 'N', 'O')) NOT VALID,
    ADD CONSTRAINT "CompanyProfile_saftSelfBillingIndicator_check"
        CHECK ("saftSelfBillingIndicator" IS NULL OR "saftSelfBillingIndicator" IN (0, 1)) NOT VALID,
    ADD CONSTRAINT "CompanyProfile_saftCashVatSchemeIndicator_check"
        CHECK ("saftCashVatSchemeIndicator" IS NULL OR "saftCashVatSchemeIndicator" IN (0, 1)) NOT VALID,
    ADD CONSTRAINT "CompanyProfile_saftThirdPartiesBillingIndicator_check"
        CHECK ("saftThirdPartiesBillingIndicator" IS NULL OR "saftThirdPartiesBillingIndicator" IN (0, 1)) NOT VALID;

ALTER TABLE "Customer"
    ADD CONSTRAINT "Customer_country_check"
        CHECK ("country" IS NULL OR "country" ~ '^[A-Z]{2}$') NOT VALID,
    ADD CONSTRAINT "Customer_selfBillingIndicator_check"
        CHECK ("selfBillingIndicator" IS NULL OR "selfBillingIndicator" IN (0, 1)) NOT VALID;

ALTER TABLE "Supplier"
    ADD CONSTRAINT "Supplier_country_check"
        CHECK ("country" IS NULL OR "country" ~ '^[A-Z]{2}$') NOT VALID,
    ADD CONSTRAINT "Supplier_selfBillingIndicator_check"
        CHECK ("selfBillingIndicator" IS NULL OR "selfBillingIndicator" IN (0, 1)) NOT VALID;

ALTER TABLE "VatRate"
    ADD CONSTRAINT "VatRate_taxCountryRegion_check"
        CHECK ("taxCountryRegion" IS NULL OR "taxCountryRegion" ~ '^[A-Z]{2}(-(AC|MA))?$') NOT VALID;

ALTER TABLE "JournalEntry"
    ADD CONSTRAINT "JournalEntry_saftTransactionType_check"
        CHECK ("saftTransactionType" IS NULL OR "saftTransactionType" IN ('N', 'R', 'A', 'J')) NOT VALID;

ALTER TABLE "CompanyProfile"
    VALIDATE CONSTRAINT "CompanyProfile_saftTaxonomyReference_check",
    VALIDATE CONSTRAINT "CompanyProfile_saftSelfBillingIndicator_check",
    VALIDATE CONSTRAINT "CompanyProfile_saftCashVatSchemeIndicator_check",
    VALIDATE CONSTRAINT "CompanyProfile_saftThirdPartiesBillingIndicator_check";

ALTER TABLE "Customer"
    VALIDATE CONSTRAINT "Customer_country_check",
    VALIDATE CONSTRAINT "Customer_selfBillingIndicator_check";

ALTER TABLE "Supplier"
    VALIDATE CONSTRAINT "Supplier_country_check",
    VALIDATE CONSTRAINT "Supplier_selfBillingIndicator_check";

ALTER TABLE "VatRate"
    VALIDATE CONSTRAINT "VatRate_taxCountryRegion_check";

ALTER TABLE "JournalEntry"
    VALIDATE CONSTRAINT "JournalEntry_saftTransactionType_check";
