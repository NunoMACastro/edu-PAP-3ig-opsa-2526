/**
 * @file Provas da troca atómica de contexto de empresa.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { switchActiveCompany } from "../../src/modules/companies/companyService.js";

test("troca de empresa valida membership, atualiza sessão e audita numa transação", async () => {
    const calls = [];
    const tx = {
        $executeRaw: async () => {
            calls.push(["lock"]);
            return [{ locked: true }];
        },
        companyMembership: {
            findFirst: async ({ where }) => {
                calls.push(["membership", where]);
                return {
                    id: "membership-1",
                    role: "ADMIN",
                    company: {
                        id: "company-1",
                        name: "Empresa",
                        nif: "500000000",
                    },
                };
            },
        },
        session: {
            updateMany: async ({ where, data }) => {
                calls.push(["session", { where, data }]);
                return { count: 1 };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                calls.push(["audit", data]);
                return data;
            },
        },
    };
    let transactionCount = 0;
    const prisma = {
        $transaction: async (callback) => {
            transactionCount += 1;
            return callback(tx);
        },
    };

    const result = await switchActiveCompany(prisma, {
        sessionId: "session-secret",
        userId: "user-1",
        companyId: "company-1",
    });

    assert.equal(transactionCount, 1);
    assert.equal(result.companyId, "company-1");
    assert.deepEqual(calls.map(([name]) => name), [
        "lock",
        "membership",
        "session",
        "audit",
    ]);
    assert.deepEqual(calls[2][1].where, {
        id: "session-secret",
        userId: "user-1",
        revokedAt: null,
    });
    assert.equal(calls[3][1].entityId, "membership-1");
    assert.equal(JSON.stringify(calls[3][1]).includes("session-secret"), false);
});

test("sessão revogada não produz auditoria de troca de empresa", async () => {
    let auditCalled = false;
    const tx = {
        $executeRaw: async () => 1,
        companyMembership: {
            findFirst: async () => ({
                id: "membership-1",
                role: "ADMIN",
                company: { id: "company-1", name: "Empresa", nif: null },
            }),
        },
        session: { updateMany: async () => ({ count: 0 }) },
        auditLog: {
            create: async () => {
                auditCalled = true;
            },
        },
    };

    await assert.rejects(
        switchActiveCompany(
            { $transaction: async (callback) => callback(tx) },
            {
                sessionId: "revoked-session",
                userId: "user-1",
                companyId: "company-1",
            },
        ),
        { code: "INVALID_SESSION" },
    );
    assert.equal(auditCalled, false);
});
