/**
 * @file Testes de claims atómicos nos workflows de aprovação.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    postInventoryCount,
    saveInventoryCountLines,
} from "../../src/modules/inventory/inventoryCountService.js";
import { approvePurchaseDocument } from "../../src/modules/purchase-approval/purchaseApprovalService.js";
import { approveSaleDocument } from "../../src/modules/sales-approval/saleApprovalService.js";
import { runSimulatedSubscriptionAction } from "../../src/modules/subscriptions/subscriptionService.js";

test("aprovação de venda perde com STALE_STATE quando outro pedido já decidiu", async () => {
    let auditWrites = 0;
    const prisma = {
        saleDocument: {
            findFirst: async () => ({
                id: "sale-1",
                companyId: "company-1",
                status: "SUBMITTED",
                submittedById: "operator-1",
            }),
            updateMany: async () => ({ count: 0 }),
        },
        auditLog: { create: async () => { auditWrites += 1; } },
        $transaction: async (callback) => callback(prisma),
    };

    await assert.rejects(
        () => approveSaleDocument(prisma, "company-1", "manager-1", "sale-1"),
        { code: "STALE_STATE", status: 409 },
    );
    assert.equal(auditWrites, 0);
});

test("aprovação de compra não cria histórico quando o claim concorrente falha", async () => {
    let historyWrites = 0;
    let auditWrites = 0;
    const prisma = {
        fiscalPeriod: {
            findFirst: async () => ({
                status: "OPEN",
                startDate: new Date("2026-01-01T00:00:00.000Z"),
                endDate: new Date("2026-12-31T00:00:00.000Z"),
            }),
        },
        purchaseDocument: {
            findFirst: async () => ({
                id: "purchase-1",
                companyId: "company-1",
                status: "DRAFT",
                issuedAt: new Date("2026-02-10T00:00:00.000Z"),
            }),
            updateMany: async () => ({ count: 0 }),
        },
        purchaseApprovalHistory: {
            create: async () => { historyWrites += 1; },
        },
        auditLog: { create: async () => { auditWrites += 1; } },
        $transaction: async (callback) => callback(prisma),
    };

    await assert.rejects(
        () => approvePurchaseDocument(
            prisma,
            "company-1",
            "manager-1",
            "purchase-1",
            { reason: "Validado" },
        ),
        { code: "STALE_STATE", status: 409 },
    );
    assert.equal(historyWrites, 0);
    assert.equal(auditWrites, 0);
});

test("publicação de contagem não ajusta stock nem audita quando perde o claim DRAFT", async () => {
    let auditWrites = 0;
    let locks = 0;
    const tx = {
        $executeRaw: async () => { locks += 1; },
        inventoryCount: {
            findFirst: async () => ({
                id: "count-1",
                companyId: "company-1",
                warehouseId: "warehouse-1",
                status: "DRAFT",
                reason: "Contagem concorrente",
                lines: [],
            }),
            updateMany: async () => ({ count: 0 }),
        },
        auditLog: { create: async () => { auditWrites += 1; } },
    };
    const prisma = { $transaction: async (callback) => callback(tx) };

    await assert.rejects(
        () => postInventoryCount(prisma, "company-1", "user-1", "count-1"),
        { code: "STALE_STATE", status: 409 },
    );
    assert.equal(locks, 1);
    assert.equal(auditWrites, 0);
});

test("edição de linhas perde com STALE_STATE antes de substituir dados", async () => {
    let lineDeletes = 0;
    const tx = {
        $executeRaw: async () => undefined,
        inventoryCount: {
            findFirst: async () => ({
                id: "count-1",
                companyId: "company-1",
                warehouseId: "warehouse-1",
                status: "DRAFT",
            }),
            updateMany: async () => ({ count: 0 }),
        },
        inventoryCountLine: {
            deleteMany: async () => { lineDeletes += 1; },
        },
    };
    const prisma = { $transaction: async (callback) => callback(tx) };

    await assert.rejects(
        () => saveInventoryCountLines(
            prisma,
            "company-1",
            "user-1",
            "count-1",
            { lines: [{ itemId: "item-1", countedQuantity: 1 }] },
        ),
        { code: "STALE_STATE", status: 409 },
    );
    assert.equal(lineDeletes, 0);
});

test("lifecycle de subscrição não audita quando o claim por versão perde", async () => {
    let auditWrites = 0;
    const current = {
        id: "subscription-1",
        companyId: "company-1",
        planCode: "monthly",
        status: "ACTIVE",
        startsAt: new Date("2026-07-01T00:00:00.000Z"),
        endsAt: new Date("2026-08-01T00:00:00.000Z"),
        updatedAt: new Date("2026-07-01T00:00:00.000Z"),
    };
    const tx = {
        $executeRaw: async () => undefined,
        companySubscription: {
            findUnique: async () => current,
            updateMany: async ({ where }) => {
                assert.equal(where.updatedAt, current.updatedAt);
                return { count: 0 };
            },
        },
        auditLog: { create: async () => { auditWrites += 1; } },
    };
    const prisma = { $transaction: async (callback) => callback(tx) };

    await assert.rejects(
        () => runSimulatedSubscriptionAction(prisma, {
            companyId: "company-1",
            userId: "user-1",
            action: "cancel",
        }),
        { code: "STALE_STATE", status: 409 },
    );
    assert.equal(auditWrites, 0);
});
