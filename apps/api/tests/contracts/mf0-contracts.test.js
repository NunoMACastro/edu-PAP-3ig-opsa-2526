/**
 * @file Testes de contrato MF0 para services e adapters sem dependência de BD real.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { resolveSession } from "../../src/modules/auth/authService.js";
import { buildPasswordResetEmailAdapter } from "../../src/modules/auth/passwordResetEmailAdapter.js";
import { assertPasswordResetRateLimit } from "../../src/modules/auth/passwordResetRateLimit.js";
import { buildInvitationEmailAdapter } from "../../src/modules/company-users/invitationEmailAdapter.js";
import { upsertCompanyProfile } from "../../src/modules/company-profile/companyProfileService.js";
import { searchCustomers } from "../../src/modules/customers/customerService.js";
import { searchSuppliers } from "../../src/modules/suppliers/supplierService.js";
import { createWarehouse } from "../../src/modules/warehouses/warehouseService.js";

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

test("BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo", async () => {
    const logs = [];
    const logger = { info: (payload) => logs.push(payload) };

    await buildPasswordResetEmailAdapter({
        appBaseUrl: "http://localhost:5173",
        logger,
    }).sendPasswordReset({
        email: "user@example.com",
        token: "token-reset-secreto",
    });

    await buildInvitationEmailAdapter({
        appBaseUrl: "http://localhost:5173",
        logger,
    }).sendInvitation({
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
});

test("BK05: rate limit em memória falha explicitamente em produção sem opt-in", () => {
    const previous = process.env.ALLOW_IN_MEMORY_PASSWORD_RESET_RATE_LIMIT;
    delete process.env.ALLOW_IN_MEMORY_PASSWORD_RESET_RATE_LIMIT;

    try {
        assert.throws(
            () =>
                assertPasswordResetRateLimit("ip:user@example.com", {
                    isProduction: true,
                }),
            { code: "RATE_LIMIT_STORE_REQUIRED" },
        );
    } finally {
        if (previous === undefined) {
            delete process.env.ALLOW_IN_MEMORY_PASSWORD_RESET_RATE_LIMIT;
        } else {
            process.env.ALLOW_IN_MEMORY_PASSWORD_RESET_RATE_LIMIT = previous;
        }
    }
});

test("BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS", async () => {
    const prisma = {
        companyProfile: {
            upsert: async () => {
                throw {
                    code: "P2002",
                    meta: { target: ["nif"] },
                };
            },
        },
    };

    await assert.rejects(
        () =>
            upsertCompanyProfile(prisma, "company-1", {
                nif: "123456789",
            }),
        { code: "NIF_ALREADY_EXISTS" },
    );
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
