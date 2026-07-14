/**
 * @file Provas de atomicidade para configuração contabilística e fiscal sensível.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    createAccount,
    importAccountsFromRows,
    updateAccountSaftMetadata,
} from "../../src/modules/accounting/accounts/accountService.js";
import {
    createVatRate,
    setVatRateActive,
    updateVatRateSaftMetadata,
} from "../../src/modules/vat-rates/vatRateService.js";
import { createFiscalPeriod } from "../../src/modules/fiscal-periods/fiscalPeriodService.js";

function transactionalPrisma(tx) {
    return {
        $transaction: async (callback) => callback(tx),
    };
}

test("criação de conta e auditoria são atómicas", async () => {
    const calls = [];
    const tx = {
        account: {
            findUnique: async () => null,
            create: async ({ data }) => {
                calls.push(["account", data]);
                return { id: "account-1", ...data, isActive: true };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                calls.push(["audit", data]);
                return data;
            },
        },
    };

    const account = await createAccount(transactionalPrisma(tx), {
        companyId: "company-1",
        userId: "user-1",
        input: { code: "11", name: "Caixa", level: 1, parentCode: null },
    });

    assert.equal(account.id, "account-1");
    assert.deepEqual(calls.map(([name]) => name), ["account", "audit"]);
    assert.equal(calls[1][1].entityId, "account-1");
    assert.equal(JSON.stringify(calls[1][1]).includes("Caixa"), false);
});

test("importação de contas grava apenas a contagem no audit log", async () => {
    let audit;
    const tx = {
        account: {
            findMany: async () => [],
            createMany: async ({ data }) => ({ count: data.length }),
        },
        auditLog: {
            create: async ({ data }) => {
                audit = data;
                return data;
            },
        },
    };

    const result = await importAccountsFromRows(transactionalPrisma(tx), {
        companyId: "company-1",
        userId: "user-1",
        rows: [
            { code: "11", name: "Caixa" },
            { code: "12", name: "Depósitos" },
        ],
    });

    assert.deepEqual(result, { imported: 2 });
    assert.deepEqual(audit.details, { imported: 2 });
    assert.equal(JSON.stringify(audit).includes("Depósitos"), false);
});

test("classificação SAF-T de conta valida ownership, parent e auditoria", async () => {
    const calls = [];
    const tx = {
        account: {
            findFirst: async ({ where }) => {
                calls.push(["target", where]);
                return { id: "account-21", code: "21", parentCode: "2" };
            },
            findUnique: async ({ where }) => {
                calls.push(["grouping", where]);
                return { id: "account-2" };
            },
            update: async ({ data }) => {
                calls.push(["update", data]);
                return {
                    id: "account-21",
                    code: "21",
                    name: "Clientes",
                    parentCode: "2",
                    level: 2,
                    isActive: true,
                    ...data,
                };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                calls.push(["audit", data]);
                return data;
            },
        },
    };
    const account = await updateAccountSaftMetadata(transactionalPrisma(tx), {
        companyId: "company-1",
        userId: "user-1",
        accountId: "account-21",
        input: {
            saftGroupingCategory: "GM",
            saftGroupingCode: "2",
            saftTaxonomyCode: 24,
        },
    });
    assert.equal(account.saftTaxonomyCode, 24);
    assert.deepEqual(calls.map(([name]) => name), [
        "target",
        "grouping",
        "update",
        "audit",
    ]);
});

test("criação de taxa de IVA e auditoria são atómicas", async () => {
    const calls = [];
    const tx = {
        vatRate: {
            create: async ({ data }) => {
                calls.push(["vat", data]);
                return { id: "vat-1", ...data };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                calls.push(["audit", data]);
                return data;
            },
        },
    };

    const vatRate = await createVatRate(transactionalPrisma(tx), {
        companyId: "company-1",
        userId: "user-1",
        input: {
            code: "ISE",
            description: "Isento",
            type: "EXEMPT",
            exemptionReason: "Artigo aplicável",
            exemptionCode: "M07",
            rateBps: 0,
        },
    });

    assert.equal(vatRate.id, "vat-1");
    assert.deepEqual(calls.map(([name]) => name), ["vat", "audit"]);
    assert.equal(JSON.stringify(calls[1][1]).includes("Artigo aplicável"), false);
});

test("ativação de IVA usa claim company-scoped antes da auditoria", async () => {
    const calls = [];
    const tx = {
        vatRate: {
            updateMany: async ({ where, data }) => {
                calls.push(["claim", { where, data }]);
                return { count: 1 };
            },
            findFirst: async ({ where }) => {
                calls.push(["read", where]);
                return { id: "vat-1", isActive: false };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                calls.push(["audit", data]);
                return data;
            },
        },
    };

    await setVatRateActive(transactionalPrisma(tx), {
        companyId: "company-1",
        userId: "user-1",
        id: "vat-1",
        isActive: false,
    });

    assert.deepEqual(calls.map(([name]) => name), ["claim", "read", "audit"]);
    assert.deepEqual(calls[0][1].where, {
        id: "vat-1",
        companyId: "company-1",
    });
    assert.equal(calls[2][1].action, "VAT_RATE_DEACTIVATED");
});

test("metadata SAF-T de IVA só atualiza uma taxa EXEMPT da empresa", async () => {
    const calls = [];
    const tx = {
        vatRate: {
            findFirst: async ({ where }) => {
                calls.push(["read", where]);
                return { id: "vat-1", type: "EXEMPT", rateBps: 0 };
            },
            update: async ({ data }) => {
                calls.push(["update", data]);
                return { id: "vat-1", type: "EXEMPT", rateBps: 0, ...data };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                calls.push(["audit", data]);
                return data;
            },
        },
    };
    const vatRate = await updateVatRateSaftMetadata(transactionalPrisma(tx), {
        companyId: "company-1",
        userId: "user-1",
        id: "vat-1",
        input: {
            exemptionReason: "Isento ao abrigo do artigo 9.º do CIVA",
            exemptionCode: "M07",
        },
    });
    assert.equal(vatRate.exemptionCode, "M07");
    assert.deepEqual(calls.map(([name]) => name), ["read", "update", "audit"]);
});

test("abertura de período fiscal usa o lock e audita na mesma transação", async () => {
    const calls = [];
    const tx = {
        $executeRaw: async () => {
            calls.push(["lock"]);
            return [{ locked: true }];
        },
        fiscalPeriod: {
            findFirst: async () => null,
            create: async ({ data }) => {
                calls.push(["period", data]);
                return { id: "period-1", status: "OPEN", ...data };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                calls.push(["audit", data]);
                return data;
            },
        },
    };

    const period = await createFiscalPeriod(transactionalPrisma(tx), {
        companyId: "company-1",
        actorUserId: "user-1",
        input: {
            name: "2026",
            startDate: new Date("2026-01-01T00:00:00.000Z"),
            endDate: new Date("2026-12-31T00:00:00.000Z"),
        },
    });

    assert.equal(period.id, "period-1");
    assert.deepEqual(calls.map(([name]) => name), ["lock", "period", "audit"]);
    assert.equal(calls[2][1].action, "fiscalPeriod.create");
    assert.equal(calls[2][1].entityId, "period-1");
    assert.equal(JSON.stringify(calls[2][1]).includes("2026-01-01"), false);
});
