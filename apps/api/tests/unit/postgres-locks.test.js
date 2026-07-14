/**
 * @file Testes dos locks transacionais usados por fiscalidade e inventário.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { acquireTransactionLock } from "../../src/lib/postgresLocks.js";
import {
    createStockMovement,
    createStockMovementWithCostInTransaction,
} from "../../src/modules/inventory/stockMovementService.js";

test("advisory lock usa namespace e identificadores sem interpolar SQL", async () => {
    const observed = [];
    const tx = {
        $executeRaw: async (strings, ...values) => {
            observed.push({ strings: [...strings], values });
            return [];
        },
    };

    await acquireTransactionLock(tx, "fiscal", "company-1");

    assert.equal(observed.length, 1);
    assert.equal(observed[0].values[0], "fiscal:company-1");
    assert.match(observed[0].strings.join("?"), /pg_advisory_xact_lock/);
});

test("entrada de stock bloqueia artigo/armazém antes de atualizar saldo e FIFO", async () => {
    const events = [];
    const tx = {
        $executeRaw: async (strings, key) => {
            assert.match(strings.join(" "), /pg_advisory_xact_lock/);
            events.push(`lock:${key}`);
            return 1;
        },
        $queryRaw: async (strings, key) => {
            const sql = strings.join(" ");
            assert.match(sql, /FROM "StockBalance"/);
            assert.match(sql, /FOR UPDATE/);
            events.push("balance-row-lock");
            return [];
        },
        item: {
            findFirst: async () => ({ id: "item-1", isActive: true }),
        },
        warehouse: {
            findMany: async () => [{ id: "warehouse-1", isActive: true }],
        },
        stockMovement: {
            create: async ({ data }) => ({ id: "movement-1", ...data }),
            update: async ({ data }) => ({ id: "movement-1", ...data }),
        },
        stockBalance: {
            findUnique: async () => null,
            upsert: async ({ create }) => {
                events.push("balance");
                return create;
            },
        },
        stockCostLayer: {
            create: async ({ data }) => {
                events.push("fifo");
                return { id: "layer-1", ...data };
            },
        },
        auditLog: { create: async () => ({ id: "audit-1" }) },
    };

    await createStockMovementWithCostInTransaction(tx, {
        companyId: "company-1",
        userId: "user-1",
        movement: {
            itemId: "item-1",
            type: "ENTRY",
            quantity: 5,
            unitCostCents: 100,
            fromWarehouseId: null,
            toWarehouseId: "warehouse-1",
            reason: "Reposição",
            sourceType: null,
            sourceId: null,
        },
    });

    assert.deepEqual(events.slice(0, 4), [
        "lock:stock:company-1:item-1:warehouse-1",
        "balance-row-lock",
        "balance",
        "fifo",
    ]);
});

test("serialização P2010 de raw SQL é repetida e termina em conflito estável", async () => {
    let attempts = 0;
    const prisma = {
        async $transaction() {
            attempts += 1;
            throw {
                code: "P2010",
                meta: {
                    message:
                        "could not serialize access due to read/write dependencies among transactions",
                },
            };
        },
    };

    await assert.rejects(
        () => createStockMovement(prisma, "company-1", "user-1", {
            type: "EXIT",
            itemId: "item-1",
            quantity: 1,
            fromWarehouseId: "warehouse-1",
            reason: "Concorrência",
        }),
        { status: 409, code: "STALE_STATE" },
    );
    assert.equal(attempts, 3);
});
