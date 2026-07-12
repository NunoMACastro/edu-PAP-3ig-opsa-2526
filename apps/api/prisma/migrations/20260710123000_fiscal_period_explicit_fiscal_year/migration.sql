-- Expand-only: o exercício fiscal do SAF-T é uma decisão contabilística
-- explícita. Registos existentes permanecem NULL e bloqueiam a exportação até
-- serem classificados por uma pessoa autorizada; não existe inferência nem
-- backfill automático a partir das datas.

ALTER TABLE "FiscalPeriod"
    ADD COLUMN "fiscalYear" INTEGER;

ALTER TABLE "FiscalPeriod"
    ADD CONSTRAINT "FiscalPeriod_fiscalYear_check"
        CHECK ("fiscalYear" IS NULL OR "fiscalYear" BETWEEN 1900 AND 9999) NOT VALID;

ALTER TABLE "FiscalPeriod"
    VALIDATE CONSTRAINT "FiscalPeriod_fiscalYear_check";
