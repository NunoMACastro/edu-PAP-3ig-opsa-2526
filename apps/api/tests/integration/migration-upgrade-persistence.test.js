/**
 * @file Prova PostgreSQL das migrations de sincronização de NIF e tesouraria.
 *
 * Cada cenário usa um schema aleatório dentro da base descartável indicada por
 * TEST_DATABASE_URL. As migrations anteriores são copiadas apenas para /tmp e
 * os schemas são removidos no finally, sem alterar a árvore do projeto.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
    cp,
    copyFile,
    mkdir,
    mkdtemp,
    readdir,
    rm,
    writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

const apiRoot = fileURLToPath(new URL("../..", import.meta.url));
const schemaSource = path.join(apiRoot, "prisma", "schema.prisma");
const migrationsSource = path.join(apiRoot, "prisma", "migrations");
const previousLastMigration = "20260712210000_ai_hardening";
const nifMigration = "20260713110000_sync_company_nif";
const treasuryMigration = "20260713120000_treasury_movements";
const skipPersistenceTests =
    process.env.OPSA_SKIP_PERSISTENCE_TESTS === "true";

/**
 * Exige PostgreSQL descartável antes de criar schemas de teste.
 *
 * @returns {string} URL validada sem a expor em mensagens.
 */
function requireSafeTestDatabaseUrl() {
    const value = String(process.env.TEST_DATABASE_URL ?? "").trim();
    if (!value) {
        throw new Error(
            "TEST_DATABASE_URL é obrigatória para provar as migrations persistidas.",
        );
    }

    let parsed;
    try {
        parsed = new URL(value);
    } catch {
        throw new Error("TEST_DATABASE_URL não é uma URL válida.");
    }
    if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
        throw new Error("TEST_DATABASE_URL deve usar PostgreSQL.");
    }
    const databaseName = decodeURIComponent(
        parsed.pathname.replace(/^\//, ""),
    );
    if (!/(^|[_-])(test|audit|ci)([_-]|$)/i.test(databaseName)) {
        throw new Error(
            "TEST_DATABASE_URL deve identificar uma base descartável com test, audit ou ci no nome.",
        );
    }
    return value;
}

/**
 * Cria uma URL para um schema PostgreSQL isolado, preservando SSL e opções.
 *
 * @param {string} databaseUrl - Ligação descartável validada.
 * @param {string} schemaName - Nome gerado internamente.
 * @returns {string} Ligação limitada ao schema.
 */
function withSchema(databaseUrl, schemaName) {
    assert.match(schemaName, /^[a-z][a-z0-9_]+$/);
    const parsed = new URL(databaseUrl);
    parsed.searchParams.set("schema", schemaName);
    return parsed.toString();
}

/**
 * Constrói em /tmp uma vista das migrations anterior aos dois upgrades.
 *
 * @returns {Promise<{ root: string, schemaPath: string }>} Workspace temporário.
 */
async function createPreviousMigrationWorkspace() {
    const root = await mkdtemp(
        path.join(tmpdir(), "opsa-migration-upgrade-"),
    );
    const schemaPath = path.join(root, "schema.prisma");
    const migrationsTarget = path.join(root, "migrations");
    await mkdir(migrationsTarget, { recursive: true });
    await copyFile(schemaSource, schemaPath);
    try {
        await copyFile(
            path.join(migrationsSource, "migration_lock.toml"),
            path.join(migrationsTarget, "migration_lock.toml"),
        );
    } catch (error) {
        if (error?.code !== "ENOENT") throw error;
        await writeFile(
            path.join(migrationsTarget, "migration_lock.toml"),
            'provider = "postgresql"\n',
            "utf8",
        );
    }

    const entries = await readdir(migrationsSource, { withFileTypes: true });
    const previousMigrations = entries
        .filter(
            (entry) =>
                entry.isDirectory() && entry.name <= previousLastMigration,
        )
        .sort((left, right) => left.name.localeCompare(right.name));
    assert.ok(
        previousMigrations.some(
            (entry) => entry.name === previousLastMigration,
        ),
        "Migration base anterior em falta",
    );

    for (const entry of previousMigrations) {
        await cp(
            path.join(migrationsSource, entry.name),
            path.join(migrationsTarget, entry.name),
            { recursive: true },
        );
    }
    return { root, schemaPath };
}

/**
 * Promove uma migration real para o workspace temporário.
 *
 * @param {string} workspaceRoot - Diretório temporário.
 * @param {string} migrationName - Migration aprovada pelo teste.
 * @returns {Promise<void>}
 */
async function addMigration(workspaceRoot, migrationName) {
    assert.ok(
        [nifMigration, treasuryMigration].includes(migrationName),
        "Migration não autorizada no cenário",
    );
    await cp(
        path.join(migrationsSource, migrationName),
        path.join(workspaceRoot, "migrations", migrationName),
        { recursive: true },
    );
}

/**
 * Executa migrate deploy sem colocar credenciais nos argumentos ou no output.
 *
 * @param {string} databaseUrl - URL do schema isolado.
 * @param {string} schemaPath - Schema Prisma do workspace.
 * @returns {ReturnType<typeof spawnSync>} Resultado capturado.
 */
function deployMigrations(databaseUrl, schemaPath) {
    return spawnSync(
        "npx",
        ["prisma", "migrate", "deploy", "--schema", schemaPath],
        {
            cwd: apiRoot,
            env: {
                ...process.env,
                DATABASE_URL: databaseUrl,
                PRISMA_HIDE_UPDATE_MESSAGE: "true",
            },
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
        },
    );
}

/**
 * Exige sucesso do Prisma sem retransmitir output que possa conter configuração.
 *
 * @param {ReturnType<typeof spawnSync>} result - Processo terminado.
 * @param {string} label - Passo seguro para diagnóstico.
 * @returns {void}
 */
function assertDeploySucceeded(result, label) {
    if (result.error || result.status !== 0) {
        throw new Error(`${label} falhou ao aplicar migrations.`);
    }
}

/**
 * Executa INSERTs estáticos um a um para evitar multi-statements preparados.
 *
 * @param {PrismaClient} prisma - Cliente limitado ao schema do cenário.
 * @param {string[]} statements - SQL exclusivamente definido neste teste.
 * @returns {Promise<void>}
 */
async function executeFixture(prisma, statements) {
    for (const statement of statements) {
        await prisma.$executeRawUnsafe(statement);
    }
}

const companyProfileColumns = `
    "id", "companyId", "legalName", "nif", "addressLine1",
    "postalCode", "city", "fiscalYearStartMonth",
    "fiscalYearStartDay", "updatedAt"
`;

const collisionFixture = [
    `INSERT INTO "Company" ("id", "name", "nif", "updatedAt")
     VALUES ('collision-company-a', 'Empresa A', '501000001', CURRENT_TIMESTAMP)`,
    `INSERT INTO "Company" ("id", "name", "nif", "updatedAt")
     VALUES ('collision-company-b', 'Empresa B', '501000002', CURRENT_TIMESTAMP)`,
    `INSERT INTO "CompanyProfile" (${companyProfileColumns})
     VALUES (
        'collision-profile-a', 'collision-company-a', 'Empresa A, Lda.',
        '501000002', 'Rua A', '1000-001', 'Lisboa', 1, 1,
        CURRENT_TIMESTAMP
     )`,
    `INSERT INTO "CompanyProfile" (${companyProfileColumns})
     VALUES (
        'collision-profile-b', 'collision-company-b', 'Empresa B, Lda.',
        '501000003', 'Rua B', '4000-001', 'Porto', 1, 1,
        CURRENT_TIMESTAMP
     )`,
];

const legacyMovementFixture = [
    `INSERT INTO "Company" ("id", "name", "nif", "updatedAt")
     VALUES ('legacy-company', 'Empresa Legacy', '502000001', CURRENT_TIMESTAMP)`,
    `INSERT INTO "CompanyProfile" (${companyProfileColumns})
     VALUES (
        'legacy-profile', 'legacy-company', 'Empresa Legacy, Lda.',
        '502000002', 'Rua Legacy', '3000-001', 'Coimbra', 1, 1,
        CURRENT_TIMESTAMP
     )`,
    `INSERT INTO "Customer" ("id", "companyId", "name", "updatedAt")
     VALUES ('legacy-customer', 'legacy-company', 'Cliente Legacy', CURRENT_TIMESTAMP)`,
    `INSERT INTO "Supplier" ("id", "companyId", "name", "updatedAt")
     VALUES ('legacy-supplier', 'legacy-company', 'Fornecedor Legacy', CURRENT_TIMESTAMP)`,
    `INSERT INTO "SaleDocument" (
        "id", "companyId", "customerId", "kind", "status", "number",
        "issuedAt", "subtotalCents", "vatCents", "totalCents",
        "amountPaidCents", "createdById", "updatedAt"
     ) VALUES (
        'legacy-sale', 'legacy-company', 'legacy-customer', 'INVOICE',
        'ISSUED', 'LEGACY-SALE-1', CURRENT_TIMESTAMP, 1000, 230, 1230,
        100, 'legacy-user', CURRENT_TIMESTAMP
     )`,
    `INSERT INTO "PurchaseDocument" (
        "id", "companyId", "supplierId", "kind", "status",
        "supplierNumber", "issuedAt", "subtotalCents", "vatCents",
        "totalCents", "amountPaidCents", "createdById", "updatedAt"
     ) VALUES (
        'legacy-purchase', 'legacy-company', 'legacy-supplier',
        'SUPPLIER_INVOICE', 'APPROVED', 'LEGACY-PURCHASE-1',
        CURRENT_TIMESTAMP, 1000, 230, 1230, 100, 'legacy-user',
        CURRENT_TIMESTAMP
     )`,
    `INSERT INTO "Receipt" (
        "id", "companyId", "saleDocumentId", "amountCents", "receivedAt",
        "method", "createdById"
     ) VALUES (
        'legacy-receipt', 'legacy-company', 'legacy-sale', 100,
        CURRENT_TIMESTAMP, 'CASH', 'legacy-user'
     )`,
    `INSERT INTO "Payment" (
        "id", "companyId", "purchaseDocumentId", "amountCents", "paidAt",
        "method", "createdById"
     ) VALUES (
        'legacy-payment', 'legacy-company', 'legacy-purchase', 100,
        CURRENT_TIMESTAMP, 'CASH', 'legacy-user'
     )`,
];

test(
    "migrations preservam identidade fiscal em colisão e movimentos históricos sem conta",
    {
        skip: skipPersistenceTests
            ? "Skip persistido explicitamente pedido pelo operador."
            : false,
        timeout: 300_000,
    },
    async () => {
        const baseUrl = requireSafeTestDatabaseUrl();
        const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
        const collisionSchema = `opsa_migration_collision_${suffix}`;
        const legacySchema = `opsa_migration_legacy_${suffix}`;
        const schemas = [collisionSchema, legacySchema];
        const workspaces = [];
        const scenarioClients = [];
        const admin = new PrismaClient({
            datasources: { db: { url: baseUrl } },
        });
        let primaryError = null;

        try {
            for (const schemaName of schemas) {
                await admin.$executeRawUnsafe(
                    `CREATE SCHEMA "${schemaName}"`,
                );
            }

            const collisionWorkspace =
                await createPreviousMigrationWorkspace();
            workspaces.push(collisionWorkspace.root);
            const collisionUrl = withSchema(baseUrl, collisionSchema);
            assertDeploySucceeded(
                deployMigrations(
                    collisionUrl,
                    collisionWorkspace.schemaPath,
                ),
                "Estado anterior do cenário de colisão",
            );
            const collisionClient = new PrismaClient({
                datasources: { db: { url: collisionUrl } },
            });
            scenarioClients.push(collisionClient);
            await executeFixture(collisionClient, collisionFixture);
            await addMigration(collisionWorkspace.root, nifMigration);

            const collisionDeploy = deployMigrations(
                collisionUrl,
                collisionWorkspace.schemaPath,
            );
            assert.equal(collisionDeploy.error, undefined);
            assert.notEqual(
                collisionDeploy.status,
                0,
                "A migration de NIF deve abortar perante colisão cross-company",
            );

            const [failedMigration, companiesAfterFailure] = await Promise.all([
                collisionClient.$queryRawUnsafe(
                    `SELECT
                        "migration_name" AS "migrationName",
                        "finished_at" AS "finishedAt"
                     FROM "_prisma_migrations"
                     WHERE "migration_name" = '${nifMigration}'`,
                ),
                collisionClient.$queryRawUnsafe(
                    `SELECT "id", "nif"
                     FROM "Company"
                     ORDER BY "id" ASC`,
                ),
            ]);
            assert.equal(failedMigration.length, 1);
            assert.equal(failedMigration[0].migrationName, nifMigration);
            assert.equal(failedMigration[0].finishedAt, null);
            assert.deepEqual(companiesAfterFailure, [
                { id: "collision-company-a", nif: "501000001" },
                { id: "collision-company-b", nif: "501000002" },
            ]);

            const legacyWorkspace = await createPreviousMigrationWorkspace();
            workspaces.push(legacyWorkspace.root);
            const legacyUrl = withSchema(baseUrl, legacySchema);
            assertDeploySucceeded(
                deployMigrations(legacyUrl, legacyWorkspace.schemaPath),
                "Estado anterior do cenário legacy",
            );
            const legacyClient = new PrismaClient({
                datasources: { db: { url: legacyUrl } },
            });
            scenarioClients.push(legacyClient);
            await executeFixture(legacyClient, legacyMovementFixture);
            await addMigration(legacyWorkspace.root, nifMigration);
            await addMigration(legacyWorkspace.root, treasuryMigration);
            assertDeploySucceeded(
                deployMigrations(legacyUrl, legacyWorkspace.schemaPath),
                "Upgrade de NIF e tesouraria",
            );

            const [companyProfile, receipts, payments, nullableColumns] =
                await Promise.all([
                    legacyClient.$queryRawUnsafe(
                        `SELECT
                            company."nif" AS "companyNif",
                            profile."nif" AS "profileNif"
                         FROM "Company" AS company
                         INNER JOIN "CompanyProfile" AS profile
                            ON profile."companyId" = company."id"
                         WHERE company."id" = 'legacy-company'`,
                    ),
                    legacyClient.$queryRawUnsafe(
                        `SELECT "id", "treasuryAccountId"
                         FROM "Receipt"
                         WHERE "id" = 'legacy-receipt'`,
                    ),
                    legacyClient.$queryRawUnsafe(
                        `SELECT "id", "treasuryAccountId"
                         FROM "Payment"
                         WHERE "id" = 'legacy-payment'`,
                    ),
                    legacyClient.$queryRawUnsafe(
                        `SELECT
                            "table_name" AS "tableName",
                            "is_nullable" AS "isNullable"
                         FROM information_schema.columns
                         WHERE "table_schema" = current_schema()
                           AND "column_name" = 'treasuryAccountId'
                           AND "table_name" IN ('Receipt', 'Payment')
                         ORDER BY "table_name" ASC`,
                    ),
                ]);

            assert.deepEqual(companyProfile, [
                { companyNif: "502000002", profileNif: "502000002" },
            ]);
            assert.deepEqual(receipts, [
                { id: "legacy-receipt", treasuryAccountId: null },
            ]);
            assert.deepEqual(payments, [
                { id: "legacy-payment", treasuryAccountId: null },
            ]);
            assert.deepEqual(nullableColumns, [
                { tableName: "Payment", isNullable: "YES" },
                { tableName: "Receipt", isNullable: "YES" },
            ]);
        } catch (error) {
            primaryError = error;
        } finally {
            await Promise.allSettled(
                scenarioClients.map((client) => client.$disconnect()),
            );

            for (const schemaName of schemas.reverse()) {
                try {
                    await admin.$executeRawUnsafe(
                        `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`,
                    );
                } catch (error) {
                    primaryError ??= error;
                }
            }
            await admin.$disconnect().catch((error) => {
                primaryError ??= error;
            });
            await Promise.allSettled(
                workspaces.map((root) =>
                    rm(root, { recursive: true, force: true }),
                ),
            );
        }

        if (primaryError) throw primaryError;
    },
);
