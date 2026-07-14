/**
 * @file Testes unitários das barreiras destrutivas do reset de seeds.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_NAMESPACE } from "../../prisma/seeds/config.js";
import {
    acquireSeedLock,
    releaseSeedLock,
    resetSeedNamespace,
} from "../../prisma/seeds/reset.js";

test("lock da seed usa executeRaw sem desserializar o void do PostgreSQL 17", async () => {
    const calls = [];
    const prisma = {
        async $executeRaw(strings, ...values) {
            calls.push({ sql: strings.join("?"), values });
            return 1;
        },
    };

    await acquireSeedLock(prisma, DEMO_NAMESPACE);
    await releaseSeedLock(prisma, DEMO_NAMESPACE);

    assert.equal(calls.length, 2);
    assert.match(calls[0].sql, /pg_advisory_lock/);
    assert.match(calls[1].sql, /pg_advisory_unlock/);
    assert.deepEqual(calls[0].values, [`opsa-seed:${DEMO_NAMESPACE}`]);
});

test("reset rejeita qualquer namespace fora da allowlist", async () => {
    await assert.rejects(
        resetSeedNamespace({}, { namespace: "qualquer-outro" }),
        /nao autorizado/,
    );
});

test("reset aborta antes de apagar quando um utilizador demo tem empresa externa", async () => {
    let transactionStarted = false;
    const prisma = {
        integrationLog: {
            findMany: async () => [{ companyId: "company-demo" }],
            findFirst: async () => null,
        },
        user: {
            findMany: async () => [{
                id: "user-demo",
                email: "admin@opsa.demo",
                memberships: [
                    { companyId: "company-demo" },
                    { companyId: "company-real" },
                ],
            }],
        },
        $transaction: async () => {
            transactionStarted = true;
        },
    };

    await assert.rejects(
        resetSeedNamespace(prisma, { namespace: DEMO_NAMESPACE }),
        /empresa fora do namespace/,
    );
    assert.equal(transactionStarted, false);
});
