/**
 * @file Testes dos argumentos seguros usados por pg_dump/pg_restore/psql.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    assertDisposableRestoreDatabase,
    postgresCliConnection,
} from "../../scripts/postgres-cli.mjs";
import { assertEmptyTestDatabase } from "../../scripts/assert-empty-test-database.mjs";

test("password PostgreSQL fica no ambiente e nunca nos argumentos", () => {
    const result = postgresCliConnection(
        "postgresql://audit_user:secret-value@db.example.test:5433/opsa_audit?sslmode=require",
    );

    assert.equal(result.databaseName, "opsa_audit");
    assert.equal(result.env.PGPASSWORD, "secret-value");
    assert.equal(result.env.PGSSLMODE, "require");
    assert.equal(result.args.includes("secret-value"), false);
    assert.deepEqual(result.args.slice(-2), ["--dbname", "opsa_audit"]);
});

test("restore recusa nomes que não indicam uma base descartável", () => {
    assert.doesNotThrow(() => assertDisposableRestoreDatabase("opsa_restore_ci"));
    assert.throws(() => assertDisposableRestoreDatabase("opsa_production"));
});

test("gate de migrations exige schema public realmente vazio", async () => {
    let disconnected = 0;
    const emptyPrisma = {
        $queryRaw: async () => [],
        $disconnect: async () => {
            disconnected += 1;
        },
    };
    assert.deepEqual(
        await assertEmptyTestDatabase({
            databaseUrl: "postgresql://user:secret@db.example.test/opsa_test_ci",
            prisma: emptyPrisma,
        }),
        { empty: true, databaseName: "opsa_test_ci" },
    );
    assert.equal(disconnected, 1);

    await assert.rejects(
        () =>
            assertEmptyTestDatabase({
                databaseUrl: "postgresql://user:secret@db.example.test/opsa_test_ci",
                prisma: {
                    $queryRaw: async () => [{ tablename: "User" }],
                    $disconnect: async () => {},
                },
            }),
        /não está vazia/,
    );
});
