/**
 * @file Provas focadas do bootstrap transacional de empresas da demonstração PAP.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { bootstrapCompany } from "../../src/modules/companies/companyBootstrapService.js";
import { validateOnboardingPayload } from "../../src/modules/onboarding/onboardingValidators.js";

function bootstrapInput(overrides = {}) {
    return {
        kind: "INITIAL",
        userId: "user-1",
        sessionId: "session-1",
        name: "Empresa PAP",
        profile: {
            legalName: "Empresa PAP, Lda.",
            nif: "509442013",
            addressLine1: "Rua da Escola, 1",
            addressLine2: null,
            postalCode: "1000-001",
            city: "Lisboa",
            country: "PT",
            currency: "EUR",
            fiscalYearStartMonth: 1,
            fiscalYearStartDay: 1,
        },
        now: new Date("2026-07-14T12:00:00.000Z"),
        ...overrides,
    };
}

function buildFixture({ membershipCount = 0, failAt = null } = {}) {
    const writes = [];
    const item = {
        id: "item-demo",
        companyId: "company-new",
        sku: "PAP-DEMO-001",
        name: "Produto demonstrativo PAP",
        isActive: true,
    };
    const warehouse = {
        id: "warehouse-main",
        companyId: "company-new",
        code: "PRINCIPAL",
        name: "Armazém principal",
        isActive: true,
    };
    const tx = {
        $executeRaw: async () => undefined,
        companyMembership: {
            count: async () => membershipCount,
            create: async ({ data }) => {
                writes.push(["membership", data]);
                return { id: "membership-new", ...data };
            },
        },
        company: {
            create: async ({ data }) => {
                if (failAt === "company") throw new Error("company failed");
                writes.push(["company", data]);
                return { id: "company-new", ...data };
            },
        },
        companyProfile: {
            create: async ({ data }) => {
                writes.push(["profile", data]);
                return { id: "profile-new", ...data };
            },
        },
        fiscalPeriod: {
            create: async ({ data }) => {
                writes.push(["period", data]);
                return { id: "period-new", ...data };
            },
        },
        account: {
            createMany: async ({ data }) => {
                writes.push(["accounts", data]);
                return { count: data.length };
            },
        },
        vatRate: {
            create: async ({ data }) => {
                if (failAt === "vat") throw new Error("vat failed");
                writes.push(["vat", data]);
                return { id: "vat-normal", ...data };
            },
        },
        warehouse: {
            create: async ({ data }) => {
                writes.push(["warehouse", data]);
                return { ...warehouse, ...data };
            },
            findMany: async ({ where }) => {
                writes.push(["warehouseLookup", where]);
                return [warehouse];
            },
        },
        item: {
            create: async ({ data }) => {
                writes.push(["item", data]);
                return { ...item, ...data };
            },
            findFirst: async ({ where }) => {
                writes.push(["itemLookup", where]);
                return item;
            },
        },
        stockMovement: {
            create: async ({ data }) => {
                writes.push(["stockMovement", data]);
                return { id: "movement-opening", ...data };
            },
            update: async ({ data }) => {
                writes.push(["stockMovementCost", data]);
                return { id: "movement-opening", ...data };
            },
        },
        stockBalance: {
            findUnique: async () => null,
            upsert: async ({ create }) => {
                writes.push(["stockBalance", create]);
                return create;
            },
        },
        stockCostLayer: {
            create: async ({ data }) => {
                writes.push(["stockCostLayer", data]);
                return { id: "layer-opening", ...data };
            },
        },
        session: {
            updateMany: async ({ where, data }) => {
                writes.push(["session", { where, data }]);
                return { count: 1 };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                writes.push(["audit", data]);
                return { id: `audit-${writes.length}`, ...data };
            },
        },
    };
    const prisma = {
        $transaction: async (callback) => callback(tx),
    };
    return { prisma, writes };
}

test("primeira empresa cria a base mínima e só ativa a sessão no fim", async () => {
    const { prisma, writes } = buildFixture();
    const result = await bootstrapCompany(prisma, bootstrapInput());

    assert.equal(result.context.role, "ADMIN");
    assert.equal(result.bootstrap.fiscalPeriod.status, "OPEN");
    assert.equal(result.bootstrap.fiscalPeriod.fiscalYear, 2026);
    assert.deepEqual(
        ["211", "221", "2432", "2433", "62", "71", "72"].every((code) =>
            result.bootstrap.accountCodes.includes(code)),
        true,
    );
    assert.equal(result.bootstrap.vatRate.rateBps, 2300);
    assert.equal(result.bootstrap.warehouse.code, "PRINCIPAL");
    assert.equal(result.bootstrap.demoData.prepared, false);
    assert.equal(writes.find(([type]) => type === "membership")[1].role, "ADMIN");
    assert.ok(
        writes.findIndex(([type]) => type === "session") >
            writes.findIndex(([type]) => type === "warehouse"),
    );
    assert.equal("session" in result, false);
});

test("preparação académica usa o serviço FIFO e uma origem de stock estável", async () => {
    const { prisma, writes } = buildFixture();
    const result = await bootstrapCompany(prisma, bootstrapInput({ prepareDemoData: true }));
    const movement = writes.find(([type]) => type === "stockMovement")[1];

    assert.equal(result.bootstrap.demoData.prepared, true);
    assert.equal(result.bootstrap.demoData.openingStock.quantity, 20);
    assert.equal(result.profile.saftTaxAccountingBasis, "C");
    assert.equal(result.profile.softwareCertificateNumber, 0);
    assert.deepEqual(
        {
            type: movement.type,
            sourceType: movement.sourceType,
            sourceId: movement.sourceId,
            quantity: movement.quantity,
            toWarehouseId: movement.toWarehouseId,
        },
        {
            type: "ENTRY",
            sourceType: "COMPANY_BOOTSTRAP_PRODUCT",
            sourceId: "item-demo",
            quantity: 20,
            toWarehouseId: "warehouse-main",
        },
    );
    assert.equal(writes.some(([type]) => type === "stockBalance"), true);
    assert.equal(writes.some(([type]) => type === "stockCostLayer"), true);
});

test("dados demonstrativos são recusados em produção antes de abrir transação", async () => {
    let transactions = 0;
    await assert.rejects(
        () => bootstrapCompany(
            { $transaction: async () => { transactions += 1; } },
            bootstrapInput({ prepareDemoData: true, isProduction: true }),
        ),
        { code: "DEMO_DATA_FORBIDDEN", status: 403 },
    );
    assert.equal(transactions, 0);
});

test("onboarding inicial recusa utilizador já associado e empresa adicional não apaga memberships", async () => {
    const initial = buildFixture({ membershipCount: 1 });
    await assert.rejects(
        () => bootstrapCompany(initial.prisma, bootstrapInput()),
        { code: "ONBOARDING_ALREADY_COMPLETED", status: 409 },
    );
    assert.equal(initial.writes.some(([type]) => type === "company"), false);

    const additional = buildFixture({ membershipCount: 1 });
    const result = await bootstrapCompany(
        additional.prisma,
        bootstrapInput({ kind: "ADDITIONAL" }),
    );
    assert.equal(result.company.id, "company-new");
    assert.equal(
        additional.writes.filter(([type]) => type === "membership").length,
        1,
    );
});

test("falha intermédia não chega a ativar sessão nem a registar sucesso", async () => {
    const { prisma, writes } = buildFixture({ failAt: "vat" });
    await assert.rejects(
        () => bootstrapCompany(prisma, bootstrapInput()),
        /vat failed/,
    );
    assert.equal(writes.some(([type]) => type === "session"), false);
    assert.equal(writes.some(([type]) => type === "audit"), false);
});

test("payload externo não pode escolher identidade, role ou empresa ativa", () => {
    for (const field of ["userId", "ownerUserId", "companyId", "role", "activeCompanyId"]) {
        assert.throws(
            () => validateOnboardingPayload({
                name: "Empresa PAP",
                profile: {},
                [field]: "valor-controlado-pelo-cliente",
            }),
            { code: "SERVER_OWNED_FIELD", status: 400 },
        );
    }
    assert.throws(
        () => validateOnboardingPayload({
            name: "Empresa PAP",
            profile: { companyId: "company-forjada" },
        }),
        { code: "SERVER_OWNED_FIELD", status: 400 },
    );
});
