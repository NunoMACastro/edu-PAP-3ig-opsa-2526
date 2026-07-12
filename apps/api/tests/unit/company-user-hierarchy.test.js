/**
 * @file Matriz unitária da hierarquia segura de gestão de memberships.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    removeCompanyUser,
    updateCompanyUserRole,
} from "../../src/modules/company-users/companyUserService.js";

function membershipPrisma({
    targetRole = "OPERACIONAL",
    actorRole = "ADMIN",
    adminCount = 2,
} = {}) {
    const writes = [];
    let membershipReads = 0;
    const tx = {
        $queryRaw: async () => {},
        companyMembership: {
            findFirst: async () => {
                membershipReads += 1;
                return { role: membershipReads === 1 ? actorRole : targetRole };
            },
            count: async () => adminCount,
            updateMany: async ({ data }) => {
                writes.push(data);
                return { count: 1 };
            },
        },
        auditLog: { create: async ({ data }) => data },
    };
    return {
        prisma: { $transaction: async (callback) => callback(tx) },
        writes,
    };
}

test("nenhum ator pode alterar a própria role", async () => {
    const { prisma, writes } = membershipPrisma();
    await assert.rejects(
        () => updateCompanyUserRole(prisma, {
            companyId: "company-1",
            actorUserId: "user-1",
            actorRole: "ADMIN",
            targetUserId: "user-1",
            role: "GESTOR",
        }),
        { status: 409, code: "CANNOT_CHANGE_SELF_ROLE" },
    );
    assert.equal(writes.length, 0);
});

test("GESTOR não pode atribuir ADMIN mesmo através de chamada forjada", async () => {
    const { prisma, writes } = membershipPrisma({ actorRole: "GESTOR" });
    await assert.rejects(
        () => updateCompanyUserRole(prisma, {
            companyId: "company-1",
            actorUserId: "gestor-1",
            actorRole: "GESTOR",
            targetUserId: "operacional-1",
            role: "ADMIN",
        }),
        { status: 403, code: "ADMIN_ROLE_REQUIRES_ADMIN" },
    );
    assert.equal(writes.length, 0);
});

test("GESTOR não pode alterar nem remover um membro ADMIN", async () => {
    for (const operation of ["alterar", "remover"]) {
        const { prisma, writes } = membershipPrisma({
            actorRole: "GESTOR",
            targetRole: "ADMIN",
        });
        const call = operation === "alterar"
            ? () => updateCompanyUserRole(prisma, {
                companyId: "company-1",
                actorUserId: "gestor-1",
                actorRole: "GESTOR",
                targetUserId: "admin-1",
                role: "CONTABILISTA",
            })
            : () => removeCompanyUser(prisma, {
                companyId: "company-1",
                actorUserId: "gestor-1",
                actorRole: "GESTOR",
                targetUserId: "admin-1",
            });
        await assert.rejects(call, {
            status: 403,
            code: "ADMIN_MEMBER_REQUIRES_ADMIN",
        });
        assert.equal(writes.length, 0);
    }
});

test("GESTOR pode alterar e remover memberships não ADMIN", async () => {
    const updateDouble = membershipPrisma({
        actorRole: "GESTOR",
        targetRole: "OPERACIONAL",
    });
    const updated = await updateCompanyUserRole(updateDouble.prisma, {
        companyId: "company-1",
        actorUserId: "gestor-1",
        actorRole: "GESTOR",
        targetUserId: "operacional-1",
        role: "CONTABILISTA",
    });
    assert.deepEqual(updated, { userId: "operacional-1", role: "CONTABILISTA" });
    assert.deepEqual(updateDouble.writes, [{ role: "CONTABILISTA" }]);

    const removeDouble = membershipPrisma({
        actorRole: "GESTOR",
        targetRole: "AUDITOR",
    });
    await removeCompanyUser(removeDouble.prisma, {
        companyId: "company-1",
        actorUserId: "gestor-1",
        actorRole: "GESTOR",
        targetUserId: "auditor-1",
    });
    assert.deepEqual(removeDouble.writes, [{ isActive: false }]);
});

test("proteção do último ADMIN mantém-se após o lock", async () => {
    const { prisma, writes } = membershipPrisma({
        targetRole: "ADMIN",
        adminCount: 1,
    });
    await assert.rejects(
        () => updateCompanyUserRole(prisma, {
            companyId: "company-1",
            actorUserId: "admin-actor",
            actorRole: "ADMIN",
            targetUserId: "admin-target",
            role: "GESTOR",
        }),
        { status: 409, code: "LAST_ADMIN" },
    );
    assert.equal(writes.length, 0);
});

test("uma role sem users.manage efetivo continua bloqueada no service", async () => {
    const { prisma } = membershipPrisma({ actorRole: "CONTABILISTA" });
    await assert.rejects(
        () => updateCompanyUserRole(prisma, {
            companyId: "company-1",
            actorUserId: "forged-actor",
            actorRole: "CONTABILISTA",
            targetUserId: "operacional-1",
            role: "AUDITOR",
        }),
        { status: 403, code: "PERMISSION_FORBIDDEN" },
    );
});
