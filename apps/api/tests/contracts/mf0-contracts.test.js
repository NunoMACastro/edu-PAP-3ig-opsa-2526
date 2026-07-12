/**
 * @file Testes de contrato MF0 para services e adapters sem dependência de BD real.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { resolveSession } from "../../src/modules/auth/authService.js";
import {
    validateLoginPayload,
    validateRegisterPayload,
} from "../../src/modules/auth/authValidators.js";
import { validateResetPasswordPayload } from "../../src/modules/auth/passwordResetValidators.js";
import { buildPasswordResetEmailAdapter } from "../../src/modules/auth/passwordResetEmailAdapter.js";
import { buildInvitationEmailAdapter } from "../../src/modules/company-users/invitationEmailAdapter.js";
import { upsertCompanyProfile } from "../../src/modules/company-profile/companyProfileService.js";
import { searchCustomers } from "../../src/modules/customers/customerService.js";
import { searchSuppliers } from "../../src/modules/suppliers/supplierService.js";
import { createWarehouse } from "../../src/modules/warehouses/warehouseService.js";

test("OPSA-E2E-P1-016: contratos de registo/reset limitam bcrypt a 72 bytes sem alterar login", () => {
    const resetToken = "r".repeat(32);
    const exactLimit = "🔐".repeat(18);
    const overLimit = `${exactLimit}a`;

    assert.equal(Buffer.byteLength(exactLimit, "utf8"), 72);
    assert.equal(
        validateRegisterPayload({
            email: "user@example.com",
            password: exactLimit,
        }).password,
        exactLimit,
    );
    assert.equal(
        validateResetPasswordPayload({
            token: resetToken,
            password: exactLimit,
        }).password,
        exactLimit,
    );
    assert.throws(
        () =>
            validateRegisterPayload({
                email: "user@example.com",
                password: overLimit,
            }),
        { status: 400, code: "PASSWORD_TOO_LONG" },
    );
    assert.throws(
        () =>
            validateResetPasswordPayload({
                token: resetToken,
                password: overLimit,
            }),
        { status: 400, code: "PASSWORD_TOO_LONG" },
    );
    assert.equal(
        validateLoginPayload({
            email: "user@example.com",
            password: overLimit,
        }).password,
        overLimit,
    );
});

test("BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público", async () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const prisma = {
        session: {
            findUnique: async () => ({
                id: "session-1",
                userId: "user-1",
                activeCompanyId: "company-1",
                expiresAt: new Date("2026-01-01T01:00:00.000Z"),
                revokedAt: null,
                createdAt: now,
                user: {
                    id: "user-1",
                    email: "user@example.com",
                    name: "User",
                    isActive: true,
                    passwordHash: "hash-secreto",
                },
            }),
        },
    };

    const result = await resolveSession(prisma, "session-1", now);

    assert.equal("passwordHash" in result.user, false);
    assert.equal("user" in result.session, false);
});

test("BK04/BK05: adapters reais não registam tokens, URLs secretas ou email completo", async () => {
    const logs = [];
    const logger = { info: (payload) => logs.push(payload) };
    const sent = [];
    const queued = [];

    await buildPasswordResetEmailAdapter({
        appBaseUrl: "http://localhost:5173",
        logger,
        provider: { send: async (message) => sent.push(message) },
    }).sendPasswordReset({
        email: "user@example.com",
        token: "token-reset-secreto",
    });

    await buildInvitationEmailAdapter({
        appBaseUrl: "http://localhost:5173",
        emailOutbox: {
            enqueue: async (_tx, message) => queued.push(message),
        },
    }).enqueueInvitation({}, {
        invitationId: "invitation-1",
        deliveryId: "delivery-1",
        email: "user@example.com",
        companyName: "Empresa",
        token: "token-convite-secreto",
    });

    const serialized = JSON.stringify(logs);
    assert.equal(serialized.includes("token-reset-secreto"), false);
    assert.equal(serialized.includes("token-convite-secreto"), false);
    assert.equal(serialized.includes("recuperar-password"), false);
    assert.equal(serialized.includes("convites"), false);
    assert.equal(serialized.includes("user@example.com"), false);
    assert.equal(sent.length, 1);
    assert.equal(queued.length, 1);
    assert.match(sent[0].text, /\/recuperar-password#token=token-reset-secreto/);
    assert.equal(sent[0].text.includes("?token="), false);
    assert.match(
        queued[0].text,
        /\/aceitar-convite#token=token-convite-secreto/,
    );
    assert.equal(queued[0].text.includes("introduz este token"), false);
});

test("BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS", async () => {
    const transactionClient = {
        companyProfile: {
            findUnique: async () => null,
            upsert: async () => {
                throw {
                    code: "P2002",
                    meta: { target: ["nif"] },
                };
            },
        },
        auditLog: {
            create: async () => {
                throw new Error("audit não deve executar após conflito");
            },
        },
    };
    const prisma = {
        ...transactionClient,
        $transaction: async (callback) => callback(transactionClient),
    };

    await assert.rejects(
        () =>
            upsertCompanyProfile(
                prisma,
                "company-1",
                "user-1",
                { nif: "123456789" },
            ),
        { code: "NIF_ALREADY_EXISTS" },
    );
});

test("BK06: perfil e auditoria são persistidos na mesma transação", async () => {
    const calls = { audit: [], transactions: 0 };
    const transactionClient = {
        companyProfile: {
            findUnique: async () => ({ id: "profile-1" }),
            upsert: async ({ update }) => ({ id: "profile-1", ...update }),
        },
        auditLog: {
            create: async (args) => {
                calls.audit.push(args);
                return { id: "audit-1", ...args.data };
            },
        },
    };
    const prisma = {
        ...transactionClient,
        async $transaction(callback) {
            calls.transactions += 1;
            return callback(transactionClient);
        },
    };

    await upsertCompanyProfile(
        prisma,
        "company-1",
        "user-1",
        { legalName: "Empresa de teste", city: "Porto" },
    );

    assert.equal(calls.transactions, 1);
    assert.deepEqual(calls.audit[0].data, {
        companyId: "company-1",
        userId: "user-1",
        action: "company.profile.update",
        entity: "CompanyProfile",
        entityId: "profile-1",
        details: { changedFields: ["city", "legalName"] },
    });
});

test("BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base", async () => {
    const calls = [];
    const prisma = {
        customer: {
            findMany: async (query) => {
                calls.push(["customer", query]);
                return [];
            },
        },
        supplier: {
            findMany: async (query) => {
                calls.push(["supplier", query]);
                return [];
            },
        },
    };

    await searchCustomers(prisma, "company-1", "ana");
    await searchSuppliers(prisma, "company-1", "123");

    assert.deepEqual(calls[0][1].where.OR, [
        { name: { contains: "ana", mode: "insensitive" } },
        { nif: { contains: "ana", mode: "insensitive" } },
    ]);
    assert.deepEqual(calls[1][1].where.OR, [
        { name: { contains: "123", mode: "insensitive" } },
        { nif: { contains: "123", mode: "insensitive" } },
    ]);
});

test("BK12: nome de armazém duplicado é rejeitado", async () => {
    const prisma = {
        warehouse: {
            findUnique: async () => null,
            findFirst: async () => ({ id: "warehouse-1" }),
        },
    };

    await assert.rejects(
        () =>
            createWarehouse(prisma, "company-1", {
                code: "A1",
                name: "Principal",
            }),
        { code: "WAREHOUSE_NAME_EXISTS" },
    );
});
