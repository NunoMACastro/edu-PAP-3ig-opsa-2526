/**
 * @file Provas unitárias da atomicidade das configurações de alerta de stock.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { saveStockAlertSetting } from "../../src/modules/inventory/stockAlertService.js";

test("configuração de alerta e auditoria usam a mesma transação", async () => {
    const calls = [];
    const tx = {
        item: {
            findFirst: async ({ where }) => {
                calls.push(["item", where]);
                return { id: "item-1" };
            },
        },
        warehouse: {
            findFirst: async ({ where }) => {
                calls.push(["warehouse", where]);
                return { id: "warehouse-1" };
            },
        },
        stockAlertSetting: {
            upsert: async ({ create }) => {
                calls.push(["setting", create]);
                return { id: "setting-1", ...create };
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
        item: {
            findFirst: async () => assert.fail("leitura fora da transação"),
        },
        stockAlertSetting: {
            upsert: async () => assert.fail("escrita fora da transação"),
        },
        auditLog: {
            create: async () => assert.fail("auditoria fora da transação"),
        },
    };

    const result = await saveStockAlertSetting(prisma, {
        companyId: "company-1",
        userId: "user-1",
        input: {
            itemId: "item-1",
            warehouseId: "warehouse-1",
            minQuantity: 2,
            maxQuantity: 8,
            stoppedAfterDays: 30,
        },
    });

    assert.equal(transactionCount, 1);
    assert.equal(result.id, "setting-1");
    assert.deepEqual(
        calls.map(([name]) => name),
        ["item", "warehouse", "setting", "audit"],
    );
    const audit = calls.find(([name]) => name === "audit")[1];
    assert.equal(audit.companyId, "company-1");
    assert.equal(audit.userId, "user-1");
    assert.equal(audit.entityId, "setting-1");
    assert.deepEqual(audit.details.changedFields, [
        "minQuantity",
        "maxQuantity",
        "stoppedAfterDays",
    ]);
    assert.equal("minQuantity" in audit.details, false);
});

test("falha da auditoria impede a transação de terminar com sucesso", async () => {
    const prisma = {
        $transaction: async (callback) =>
            callback({
                item: { findFirst: async () => ({ id: "item-1" }) },
                warehouse: {
                    findFirst: async () => ({ id: "warehouse-1" }),
                },
                stockAlertSetting: {
                    upsert: async () => ({ id: "setting-1" }),
                },
                auditLog: {
                    create: async () => {
                        throw new Error("audit unavailable");
                    },
                },
            }),
    };

    await assert.rejects(
        saveStockAlertSetting(prisma, {
            companyId: "company-1",
            userId: "user-1",
            input: {
                itemId: "item-1",
                warehouseId: "warehouse-1",
            },
        }),
        /audit unavailable/,
    );
});
