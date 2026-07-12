/**
 * @file Provas unitárias do ciclo autenticado de gestão de convites.
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
    inviteUser,
    listCompanyInvitations,
    resendCompanyInvitation,
    revokeCompanyInvitation,
} from "../../src/modules/company-users/companyUserService.js";

const NOW = new Date("2026-07-10T09:00:00.000Z");
const CREATED_AT = new Date("2026-07-01T09:00:00.000Z");
const OLD_EXPIRY = new Date("2026-07-08T09:00:00.000Z");

function invitation(overrides = {}) {
    return {
        id: "invitation-1",
        companyId: "company-1",
        email: "invitee@example.test",
        role: "GESTOR",
        tokenHash: "old-token-hash",
        status: "PENDING",
        expiresAt: OLD_EXPIRY,
        createdBy: "actor-1",
        acceptedById: null,
        acceptedAt: null,
        revokedAt: null,
        createdAt: CREATED_AT,
        updatedAt: CREATED_AT,
        company: { name: "Empresa Segura" },
        ...overrides,
    };
}

/**
 * Cria um double transacional que conserva a versão atual do convite.
 *
 * @param {{ updateCount?: number }} options - Resultado do claim atómico.
 * @returns {{ prisma: object, tx: object, calls: unknown[], getPersisted: Function }} Double e evidência.
 */
function lifecycleDouble({
    updateCount = 1,
    actorRole = "ADMIN",
    invitationRole = "GESTOR",
} = {}) {
    const calls = [];
    let persisted = invitation({ role: invitationRole });
    const tx = {
        $queryRaw: async () => calls.push("lock"),
        companyMembership: {
            findFirst: async () => ({ role: actorRole }),
        },
        companyInvitation: {
            findFirst: async (query) => {
                calls.push(["find", query]);
                return query.include ? persisted : { ...persisted, company: undefined };
            },
            updateMany: async ({ where, data }) => {
                calls.push(["claim", { where, data }]);
                if (updateCount === 1) {
                    persisted = { ...persisted, ...data, updatedAt: NOW };
                }
                return { count: updateCount };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                calls.push(["audit", data]);
                return data;
            },
        },
    };
    return {
        calls,
        getPersisted: () => persisted,
        prisma: { $transaction: async (callback) => callback(tx) },
        tx,
    };
}

test("listagem é company-scoped e nunca serializa tokenHash ou createdBy", async () => {
    const queries = [];
    const records = [invitation(), invitation({ id: "invitation-2" })];
    const result = await listCompanyInvitations(
        {
            companyInvitation: {
                findMany: async (query) => {
                    queries.push(query);
                    return records;
                },
            },
        },
        "company-1",
    );

    assert.deepEqual(queries[0].where, { companyId: "company-1" });
    assert.deepEqual(queries[0].orderBy, [
        { createdAt: "desc" },
        { id: "desc" },
    ]);
    assert.equal(queries[0].take, 100);
    assert.equal(result.length, 2);
    assert.equal(result.some((row) => "tokenHash" in row), false);
    assert.equal(result.some((row) => "createdBy" in row), false);
});

test("criação preserva o contrato e entrega token apenas ao adapter de outbox", async () => {
    const calls = [];
    let createdData;
    let queued;
    const tx = {
        $queryRaw: async () => calls.push("lock"),
        companyMembership: {
            findFirst: async () => ({ role: "ADMIN" }),
        },
        user: { findUnique: async () => null },
        company: {
            findUnique: async () => ({ id: "company-1", name: "Empresa Segura" }),
        },
        companyInvitation: {
            findFirst: async () => null,
            create: async ({ data }) => {
                createdData = data;
                calls.push("create");
                return invitation({
                    ...data,
                    tokenHash: data.tokenHash,
                    expiresAt: data.expiresAt,
                    createdAt: NOW,
                    updatedAt: NOW,
                });
            },
        },
        auditLog: {
            create: async ({ data }) => {
                calls.push("audit");
                return data;
            },
        },
    };
    const result = await inviteUser(
        { $transaction: async (callback) => callback(tx) },
        {
            enqueueInvitation: async (transaction, payload) => {
                assert.equal(transaction, tx);
                queued = payload;
                calls.push("outbox");
                return { id: "outbox-1" };
            },
        },
        {
            companyId: "company-1",
            actorUserId: "actor-1",
            actorRole: "ADMIN",
            email: "invitee@example.test",
            role: "GESTOR",
            now: NOW,
        },
    );

    assert.deepEqual(calls, ["lock", "create", "outbox", "audit"]);
    assert.equal(
        createdData.tokenHash,
        createHash("sha256").update(queued.token).digest("hex"),
    );
    assert.equal(queued.deliveryId.length > 0, true);
    assert.equal(result.expiresAt.toISOString(), "2026-07-17T09:00:00.000Z");
    assert.equal("token" in result, false);
    assert.equal("tokenHash" in result, false);
});

test("reenvio roda token, renova expiração e grava outbox e auditoria na transação", async () => {
    const { prisma, calls, getPersisted } = lifecycleDouble();
    let queued;
    const emailAdapter = {
        enqueueInvitation: async (tx, payload) => {
            assert.ok(tx);
            queued = payload;
            calls.push(["outbox", payload.deliveryId]);
            return { id: "outbox-1" };
        },
    };

    const result = await resendCompanyInvitation(prisma, emailAdapter, {
        companyId: "company-1",
        actorUserId: "actor-1",
        actorRole: "ADMIN",
        invitationId: "invitation-1",
        now: NOW,
    });

    const claim = calls.find(([kind]) => kind === "claim")[1];
    assert.deepEqual(claim.where, {
        id: "invitation-1",
        companyId: "company-1",
        status: "PENDING",
        tokenHash: "old-token-hash",
    });
    assert.notEqual(claim.data.tokenHash, "old-token-hash");
    assert.equal(
        claim.data.tokenHash,
        createHash("sha256").update(queued.token).digest("hex"),
    );
    assert.equal(queued.token.length, 64);
    assert.equal(queued.invitationId, "invitation-1");
    assert.equal(queued.email, "invitee@example.test");
    assert.equal(queued.deliveryId.length > 0, true);
    assert.equal(claim.data.expiresAt.toISOString(), "2026-07-17T09:00:00.000Z");
    assert.equal(result.expiresAt.toISOString(), "2026-07-17T09:00:00.000Z");
    assert.equal("token" in result, false);
    assert.equal("tokenHash" in result, false);
    assert.equal(getPersisted().tokenHash, claim.data.tokenHash);
    assert.deepEqual(
        calls.filter((call) => Array.isArray(call)).map(([kind]) => kind),
        ["find", "claim", "outbox", "audit", "find"],
    );
    const audit = calls.find(([kind]) => kind === "audit")[1];
    assert.equal(audit.action, "company.invitation.resend");
    assert.equal(JSON.stringify(audit).includes("invitee@example.test"), false);
    assert.equal(JSON.stringify(audit).includes(queued.token), false);
});

test("claim perdido no reenvio não envia email nem grava auditoria", async () => {
    const { prisma, calls } = lifecycleDouble({ updateCount: 0 });
    await assert.rejects(
        () => resendCompanyInvitation(
            prisma,
            {
                enqueueInvitation: async () => {
                    throw new Error("não deve enfileirar após claim falhado");
                },
            },
            {
                companyId: "company-1",
                actorUserId: "actor-1",
                actorRole: "ADMIN",
                invitationId: "invitation-1",
                now: NOW,
            },
        ),
        { status: 409, code: "STALE_STATE" },
    );
    assert.equal(calls.some(([kind]) => kind === "audit"), false);
});

test("revogação roda o hash, marca REVOKED e audita no mesmo claim", async () => {
    const { prisma, calls, getPersisted } = lifecycleDouble();
    const result = await revokeCompanyInvitation(prisma, {
        companyId: "company-1",
        actorUserId: "actor-1",
        actorRole: "ADMIN",
        invitationId: "invitation-1",
        now: NOW,
    });

    const claim = calls.find(([kind]) => kind === "claim")[1];
    assert.equal(claim.where.companyId, "company-1");
    assert.equal(claim.where.status, "PENDING");
    assert.equal(claim.where.tokenHash, "old-token-hash");
    assert.equal(claim.data.status, "REVOKED");
    assert.equal(claim.data.revokedAt, NOW);
    assert.notEqual(claim.data.tokenHash, "old-token-hash");
    assert.equal(getPersisted().status, "REVOKED");
    assert.equal(result.status, "REVOKED");
    assert.equal(result.revokedAt, NOW);
    assert.equal("tokenHash" in result, false);
    const audit = calls.find(([kind]) => kind === "audit")[1];
    assert.equal(audit.action, "company.invitation.revoke");
    assert.deepEqual(audit.details, { role: "GESTOR", result: "revoked" });
});

test("convite aceite não pode ser reenviado nem revogado", async () => {
    for (const operation of ["resend", "revoke"]) {
        const { prisma, tx } = lifecycleDouble();
        tx.companyInvitation.findFirst = async () => invitation({ status: "ACCEPTED" });
        const call = operation === "resend"
            ? () => resendCompanyInvitation(
                prisma,
                { enqueueInvitation: async () => ({}) },
                {
                    companyId: "company-1",
                    actorUserId: "actor-1",
                    actorRole: "ADMIN",
                    invitationId: "invitation-1",
                    now: NOW,
                },
            )
            : () => revokeCompanyInvitation(prisma, {
                companyId: "company-1",
                actorUserId: "actor-1",
                actorRole: "ADMIN",
                invitationId: "invitation-1",
                now: NOW,
            });
        await assert.rejects(call, {
            status: 409,
            code: "INVITATION_NOT_PENDING",
        });
    }
});

test("ID de outra empresa é tratado como inexistente antes de qualquer claim", async () => {
    for (const operation of ["resend", "revoke"]) {
        const { prisma, tx, calls } = lifecycleDouble();
        tx.companyInvitation.findFirst = async (query) => {
            calls.push(["find", query]);
            return null;
        };
        const call = operation === "resend"
            ? () => resendCompanyInvitation(
                prisma,
                { enqueueInvitation: async () => ({}) },
                {
                    companyId: "company-other",
                    actorUserId: "actor-1",
                    actorRole: "ADMIN",
                    invitationId: "invitation-1",
                    now: NOW,
                },
            )
            : () => revokeCompanyInvitation(prisma, {
                companyId: "company-other",
                actorUserId: "actor-1",
                actorRole: "ADMIN",
                invitationId: "invitation-1",
                now: NOW,
            });

        await assert.rejects(call, {
            status: 404,
            code: "INVITATION_NOT_FOUND",
        });
        const query = calls.find(([kind]) => kind === "find")[1];
        assert.deepEqual(query.where, {
            id: "invitation-1",
            companyId: "company-other",
        });
        assert.equal(calls.some(([kind]) => kind === "claim"), false);
        assert.equal(calls.some(([kind]) => kind === "audit"), false);
    }
});

test("GESTOR não pode criar, reenviar ou revogar convites ADMIN", async () => {
    await assert.rejects(
        () => inviteUser(
            {
                $transaction: async (callback) => callback({
                    $queryRaw: async () => {},
                    companyMembership: {
                        findFirst: async () => ({ role: "GESTOR" }),
                    },
                }),
            },
            { enqueueInvitation: async () => ({}) },
            {
                companyId: "company-1",
                actorUserId: "gestor-1",
                actorRole: "GESTOR",
                email: "admin@example.test",
                role: "ADMIN",
                now: NOW,
            },
        ),
        { status: 403, code: "ADMIN_ROLE_REQUIRES_ADMIN" },
    );

    for (const operation of ["resend", "revoke"]) {
        const { prisma } = lifecycleDouble({
            actorRole: "GESTOR",
            invitationRole: "ADMIN",
        });
        const call = operation === "resend"
            ? () => resendCompanyInvitation(
                prisma,
                { enqueueInvitation: async () => ({}) },
                {
                    companyId: "company-1",
                    actorUserId: "gestor-1",
                    actorRole: "GESTOR",
                    invitationId: "invitation-1",
                    now: NOW,
                },
            )
            : () => revokeCompanyInvitation(prisma, {
                companyId: "company-1",
                actorUserId: "gestor-1",
                actorRole: "GESTOR",
                invitationId: "invitation-1",
                now: NOW,
            });
        await assert.rejects(
            call,
            { status: 403, code: "ADMIN_MEMBER_REQUIRES_ADMIN" },
        );
    }
});
