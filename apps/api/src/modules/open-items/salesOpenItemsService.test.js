import test from "node:test";
import assert from "node:assert/strict";
import { listSalesOpenItems } from "./salesOpenItemsService.js";

test("coloca documento vencido ha 45 dias no bucket correto", async () => {
    const prisma = {
        saleDocument: {
            findMany: async ({ where }) => {
                assert.equal(where.companyId, "company-1");
                assert.equal(where.status, "ISSUED");
                assert.deepEqual(where.kind, { not: "CREDIT_NOTE" });
                return [{
                    id: "sale-1",
                    number: "INVOICE-2026-000001",
                    customer: { name: "Cliente Teste" },
                    issuedAt: new Date("2026-04-01"),
                    dueDate: new Date("2026-04-16"),
                    totalCents: 12300,
                    amountPaidCents: 2300,
                }];
            },
        },
    };

    const rows = await listSalesOpenItems(prisma, "company-1", { asOfDate: "2026-05-31" });

    assert.equal(rows[0].openAmountCents, 10000);
    assert.equal(rows[0].bucket, "DAYS_31_60");
});