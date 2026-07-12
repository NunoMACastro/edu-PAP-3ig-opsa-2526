/**
 * @file Provas unitárias das remediações de autenticação, convite e onboarding.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    decryptEmailOutboxPayload,
    encryptEmailOutboxPayload,
} from "../../src/modules/notifications/emailOutboxCrypto.js";
import { acceptInvitation } from "../../src/modules/invitations/invitationService.js";
import { createInitialCompany } from "../../src/modules/onboarding/onboardingService.js";
import { updateCompanyUserRole } from "../../src/modules/company-users/companyUserService.js";
import { resetPassword } from "../../src/modules/auth/passwordResetService.js";

const KEY = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

test("EmailOutbox usa cifra autenticada e não persiste destinatário ou token", () => {
    const payload = {
        to: "user@example.com",
        reason: "PASSWORD_RESET",
        subject: "Recuperação OPSA",
        text: "token-super-secreto-com-dados-temporarios",
    };
    const envelope = encryptEmailOutboxPayload(payload, KEY);
    assert.equal(envelope.includes(payload.to), false);
    assert.equal(envelope.includes("token-super-secreto"), false);
    assert.deepEqual(decryptEmailOutboxPayload(envelope, KEY), payload);
    const tamperedParts = envelope.split(".");
    tamperedParts[2] = `${tamperedParts[2][0] === "A" ? "B" : "A"}${tamperedParts[2].slice(1)}`;
    assert.throws(
        () => decryptEmailOutboxPayload(tamperedParts.join("."), KEY),
        /authenticate|autenticar|Unsupported state/i,
    );
});

test("onboarding cria empresa, perfil, ADMIN, sessão e auditoria numa transação", async () => {
    const calls = [];
    const tx = {
        $queryRaw: async () => calls.push("lock"),
        companyMembership: {
            count: async () => 0,
            create: async ({ data }) => {
                calls.push(["membership", data]);
                return data;
            },
        },
        company: {
            create: async ({ data }) => ({ id: "company-1", ...data }),
        },
        companyProfile: {
            create: async ({ data }) => ({ id: "profile-1", ...data }),
        },
        session: { updateMany: async () => ({ count: 1 }) },
        auditLog: {
            create: async ({ data }) => {
                calls.push(["audit", data]);
                return data;
            },
        },
    };
    const prisma = { $transaction: async (callback) => callback(tx) };
    const result = await createInitialCompany(prisma, {
        userId: "user-1",
        sessionId: "session-1",
        name: "Empresa Segura",
        profile: { nif: "123456789", legalName: "Empresa Segura, Lda." },
    });
    assert.equal(result.context.role, "ADMIN");
    assert.equal(calls[0], "lock");
    assert.equal(calls.find(([type]) => type === "membership")[1].userId, "user-1");
    assert.equal(calls.find(([type]) => type === "audit")[1].companyId, "company-1");
});

test("aceitação reclama o convite e deriva email, user e role do servidor", async () => {
    const writes = [];
    const tx = {
        $queryRaw: async () => {},
        companyInvitation: {
            findUnique: async () => ({
                id: "invite-1",
                companyId: "company-1",
                email: "user@example.com",
                role: "GESTOR",
                status: "PENDING",
                expiresAt: new Date("2027-01-01T00:00:00.000Z"),
                company: { name: "Empresa" },
            }),
            updateMany: async ({ where, data }) => {
                writes.push(["invitation", { where, data }]);
                return { count: 1 };
            },
        },
        companyMembership: {
            upsert: async ({ create }) => {
                writes.push(["membership", create]);
                return create;
            },
        },
        session: { updateMany: async () => ({ count: 1 }) },
        auditLog: { create: async ({ data }) => data },
    };
    const context = await acceptInvitation(
        { $transaction: async (callback) => callback(tx) },
        {
            token: "a".repeat(64),
            userId: "user-1",
            userEmail: "USER@example.com",
            sessionId: "session-1",
            now: new Date("2026-07-09T00:00:00.000Z"),
        },
    );
    assert.deepEqual(context, {
        companyId: "company-1",
        companyName: "Empresa",
        role: "GESTOR",
    });
    assert.equal(writes[0][1].data.acceptedById, "user-1");
    assert.equal(
        typeof writes[0][1].where.tokenHash === "string" &&
            writes[0][1].where.tokenHash.length === 64,
        true,
    );
    assert.equal(writes[1][1].role, "GESTOR");
});

test("alteração de role bloqueia a empresa antes do check e audita atomicamente", async () => {
    const calls = [];
    const tx = {
        $queryRaw: async () => calls.push("lock"),
        companyMembership: {
            count: async () => 2,
            findFirst: async () => ({ role: "ADMIN" }),
            updateMany: async () => {
                calls.push("update");
                return { count: 1 };
            },
        },
        auditLog: {
            create: async () => {
                calls.push("audit");
                return {};
            },
        },
    };
    await updateCompanyUserRole(
        { $transaction: async (callback) => callback(tx) },
        {
            companyId: "company-1",
            actorUserId: "actor-1",
            actorRole: "ADMIN",
            targetUserId: "target-1",
            role: "GESTOR",
        },
    );
    assert.deepEqual(calls, ["lock", "update", "audit"]);
});

test("reset de password reclama token e revoga todas as sessões na mesma transação", async () => {
    const calls = [];
    const now = new Date("2026-07-10T00:00:00.000Z");
    const tx = {
        passwordResetToken: {
            findUnique: async () => ({
                id: "reset-1",
                userId: "user-1",
                usedAt: null,
                expiresAt: new Date("2026-07-10T00:30:00.000Z"),
            }),
            updateMany: async () => {
                calls.push("claim-token");
                return { count: 1 };
            },
        },
        user: {
            update: async ({ data }) => {
                calls.push("password");
                assert.equal(data.passwordHash.includes("Nova-Password-123!"), false);
                return {};
            },
        },
        session: {
            updateMany: async ({ where, data }) => {
                calls.push("revoke-sessions");
                assert.deepEqual(where, { userId: "user-1", revokedAt: null });
                assert.equal(data.revokedAt, now);
                return { count: 2 };
            },
        },
        securityAuditEvent: {
            create: async () => {
                calls.push("security-audit");
                return {};
            },
        },
    };
    await resetPassword(
        { $transaction: async (callback) => callback(tx) },
        {
            token: "a".repeat(64),
            password: "Nova-Password-123!",
            now,
        },
    );
    assert.deepEqual(calls, [
        "claim-token",
        "password",
        "revoke-sessions",
        "security-audit",
    ]);
});
