/**
 * @file Provas da minimização recursiva de dados em AuditLog.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { recordAuditLog } from "../../src/modules/audit/auditLogService.js";

test("AuditLog redige segredos e PII mesmo quando estão aninhados", async () => {
    let persisted;
    const prisma = {
        auditLog: {
            create: async ({ data }) => {
                persisted = data;
                return data;
            },
        },
    };

    await recordAuditLog(prisma, {
        companyId: "company-1",
        userId: "user-1",
        action: "test.redaction",
        entity: "Test",
        entityId: "test-1",
        details: {
            changedFields: ["name"],
            nested: {
                token: "secret-token",
                email: "person@example.test",
                ip: "192.0.2.1",
                safeCount: 2,
            },
        },
    });

    assert.deepEqual(persisted.details, {
        changedFields: ["name"],
        nested: {
            token: "[redigido]",
            email: "[redigido]",
            ip: "[redigido]",
            safeCount: 2,
        },
    });
    const serialized = JSON.stringify(persisted);
    assert.equal(serialized.includes("secret-token"), false);
    assert.equal(serialized.includes("person@example.test"), false);
    assert.equal(serialized.includes("192.0.2.1"), false);
});

test("AuditLog limita profundidade e não serializa buffers", async () => {
    let details;
    const prisma = {
        auditLog: {
            create: async ({ data }) => {
                details = data.details;
                return data;
            },
        },
    };

    await recordAuditLog(prisma, {
        companyId: "company-1",
        userId: "user-1",
        action: "test.bounds",
        entity: "Test",
        entityId: "test-1",
        details: {
            binary: Buffer.from("private"),
            nested: { one: { two: { three: { four: { five: "hidden" } } } } },
        },
    });

    assert.equal(details.binary, "[redigido]");
    assert.equal(JSON.stringify(details).includes("hidden"), false);
});
