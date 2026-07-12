/**
 * @file Prova persistida de idempotência e isolamento da seed demo.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildSeedConfig, DEMO_NAMESPACE } from "../../prisma/seeds/config.js";
import { seedDemoProfile } from "../../prisma/seeds/demo.js";
import { resetSeedNamespace } from "../../prisma/seeds/reset.js";
import { verifySeedProfile } from "../../prisma/seeds/verify.js";
import { assertOpenFiscalPeriod } from "../../src/modules/fiscal-periods/fiscalPeriodService.js";
import { createObjectStorage } from "../../src/modules/storage/objectStorage.js";

const apiRoot = fileURLToPath(new URL("../..", import.meta.url));
const skip = process.env.OPSA_SKIP_PERSISTENCE_TESTS === "true";

function requireSafeDatabaseUrl() {
    const value = process.env.TEST_DATABASE_URL;
    if (!value) {
        throw new Error(
            "TEST_DATABASE_URL é obrigatória para a prova da seed. " +
            "Usa uma base efémera com test, audit ou ci no nome.",
        );
    }
    const databaseName = new URL(value).pathname.replace(/^\//, "");
    if (!/(^|[_-])(test|audit|ci)([_-]|$)/i.test(databaseName)) {
        throw new Error("TEST_DATABASE_URL não identifica uma base descartável.");
    }
    return value;
}

test("seed demo é determinística e preserva empresa sentinela", { skip }, async () => {
    const databaseUrl = requireSafeDatabaseUrl();
    execFileSync("npx", ["prisma", "migrate", "deploy"], {
        cwd: apiRoot,
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: "pipe",
    });
    process.env.DATABASE_URL = databaseUrl;
    const { Prisma, PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const storageRoot = await mkdtemp(path.join(tmpdir(), "opsa-seed-storage-"));
    const objectStorage = createObjectStorage(
        { NODE_ENV: "development" },
        { localRoot: storageRoot },
    );
    const config = buildSeedConfig({
        DATABASE_URL: databaseUrl,
        NODE_ENV: "test",
        OPSA_DEMO_ANCHOR_DATE: "2026-07-10",
        OPSA_DEMO_RANDOM_SEED: "seed-integration-proof",
    });
    const sentinel = await prisma.company.create({
        data: { name: "Sentinela fora da seed", nif: "519999991" },
    });
    try {
        await resetSeedNamespace(prisma, { namespace: DEMO_NAMESPACE, objectStorage });
        const first = await seedDemoProfile(prisma, { config, objectStorage });
        const firstVerification = await verifySeedProfile(prisma, {
            namespace: DEMO_NAMESPACE,
            config,
            objectStorage,
        });
        await resetSeedNamespace(prisma, { namespace: DEMO_NAMESPACE, objectStorage });
        const second = await seedDemoProfile(prisma, { config, objectStorage });
        const secondVerification = await verifySeedProfile(prisma, {
            namespace: DEMO_NAMESPACE,
            config,
            objectStorage,
        });

        assert.deepEqual(second.counts, first.counts);
        assert.equal(second.checksum, first.checksum);
        assert.equal(secondVerification.namespace, firstVerification.namespace);
        assert.ok(await prisma.company.findUnique({ where: { id: sentinel.id } }));
        assert.equal(secondVerification.coverage.Company, 5);
        assert.ok(secondVerification.coverage.Session > 0);
        assert.ok(secondVerification.coverage.PasswordResetToken > 0);
        assert.ok(secondVerification.coverage.JournalEntryRevision > 0);
        assert.ok(secondVerification.coverage.RetentionHold > 0);
        assert.deepEqual(
            Object.keys(secondVerification.coverage).sort(),
            Prisma.dmmf.datamodel.models.map((model) => model.name).sort(),
        );
        const closedPeriod = await prisma.fiscalPeriod.findFirstOrThrow({
            where: { companyId: second.company.id, status: "CLOSED" },
        });
        await assert.rejects(
            assertOpenFiscalPeriod(prisma, {
                companyId: second.company.id,
                documentDate: closedPeriod.startDate,
            }),
            (error) => error?.code === "FISCAL_PERIOD_CLOSED",
        );
    } finally {
        await resetSeedNamespace(prisma, { namespace: DEMO_NAMESPACE, objectStorage });
        await prisma.company.deleteMany({ where: { id: sentinel.id } });
        await prisma.$disconnect();
        await rm(storageRoot, { recursive: true, force: true });
    }
});
