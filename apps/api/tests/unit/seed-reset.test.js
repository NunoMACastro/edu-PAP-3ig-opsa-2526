/**
 * @file Testes unitários das barreiras destrutivas do reset de seeds.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_NAMESPACE } from "../../prisma/seeds/config.js";
import { resetSeedNamespace } from "../../prisma/seeds/reset.js";

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
