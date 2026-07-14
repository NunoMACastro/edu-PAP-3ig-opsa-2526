-- CompanyProfile.nif é a fonte fiscal canónica. Antes de sincronizar a
-- projeção em Company, abortar se um NIF pertence atualmente a outra empresa:
-- resolver essa colisão automaticamente poderia trocar identidades fiscais.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "CompanyProfile" AS profile
        INNER JOIN "Company" AS other_company
            ON other_company."nif" = profile."nif"
           AND other_company."id" <> profile."companyId"
    ) THEN
        RAISE EXCEPTION
            'Cannot synchronize Company.nif: cross-company NIF collision detected';
    END IF;

    UPDATE "Company" AS company
       SET "nif" = profile."nif"
      FROM "CompanyProfile" AS profile
     WHERE profile."companyId" = company."id"
       AND company."nif" IS DISTINCT FROM profile."nif";
END $$;
