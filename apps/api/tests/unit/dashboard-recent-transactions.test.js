/**
 * @file Contratos do read model de operações recentes do Dashboard PAP.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { listRecentTransactions } from "../../src/modules/dashboard/dashboardService.js";

test("combina, ordena e conta stock sem N+1 e sempre com company scope", async () => {
    const calls = [];
    const prisma = {
        saleDocument: {
            findMany: async (query) => {
                calls.push(["sales", query]);
                return [{
                    id: "sale-1",
                    number: "FT 2026/1",
                    issuedAt: new Date("2026-07-13T00:00:00.000Z"),
                    totalCents: 6150,
                    status: "ISSUED",
                    postedAt: new Date("2026-07-13T10:00:00.000Z"),
                    customer: { name: "Cliente PAP" },
                    lines: [
                        { id: "sale-line-1", item: { type: "PRODUCT" } },
                        { id: "sale-line-2", item: { type: "SERVICE" } },
                    ],
                }];
            },
        },
        purchaseDocument: {
            findMany: async (query) => {
                calls.push(["purchases", query]);
                return [{
                    id: "purchase-1",
                    supplierNumber: "FC PAP/1",
                    issuedAt: new Date("2026-07-14T00:00:00.000Z"),
                    totalCents: 2460,
                    status: "POSTED",
                    postedAt: new Date("2026-07-14T09:00:00.000Z"),
                    supplier: { name: "Fornecedor PAP" },
                    lines: [{ id: "purchase-line-1", item: { type: "PRODUCT" } }],
                }];
            },
        },
        stockMovement: {
            groupBy: async (query) => {
                calls.push(["stock", query]);
                return [
                    { sourceType: "SALE_DOCUMENT_LINE", sourceId: "sale-line-1", _count: { _all: 1 } },
                    { sourceType: "PURCHASE_DOCUMENT_LINE", sourceId: "purchase-line-1", _count: { _all: 1 } },
                ];
            },
        },
    };

    const result = await listRecentTransactions(prisma, "company-1");

    assert.deepEqual(result.map(({ documentType }) => documentType), ["PURCHASE", "SALE"]);
    assert.equal(result[0].counterpartyName, "Fornecedor PAP");
    assert.equal(result[0].stockMovementCount, 1);
    assert.equal(result[1].productLineCount, 1);
    assert.equal(result[1].stockMovementCount, 1);
    assert.equal(calls.filter(([kind]) => kind === "stock").length, 1);
    for (const [, query] of calls) assert.equal(query.where.companyId, "company-1");
});

test("usa rótulos humanos em rascunhos e limita o resultado combinado", async () => {
    const makeDocuments = (prefix, count) => Array.from({ length: count }, (_, index) => ({
        id: `${prefix}-${String(index).padStart(2, "0")}`,
        number: null,
        supplierNumber: null,
        issuedAt: new Date(`2026-07-${String(14 - index).padStart(2, "0")}T00:00:00.000Z`),
        totalCents: 100,
        status: "DRAFT",
        postedAt: null,
        customer: { name: "Cliente" },
        supplier: { name: "Fornecedor" },
        lines: [],
    }));
    const prisma = {
        saleDocument: { findMany: async () => makeDocuments("sale", 8) },
        purchaseDocument: { findMany: async () => makeDocuments("purchase", 8) },
        stockMovement: { groupBy: async () => [] },
    };

    const result = await listRecentTransactions(prisma, "company-1");
    assert.equal(result.length, 10);
    assert.ok(result.every(({ number }) => !/^[0-9a-f-]{36}$/i.test(number)));
    assert.ok(result.some(({ number }) => number === "Rascunho de venda"));
    assert.ok(result.some(({ number }) => number === "Rascunho de compra"));
});
