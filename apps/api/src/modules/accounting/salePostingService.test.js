import test from "node:test";
import assert from "node:assert/strict";
import { postSaleDocument } from "./salePostingService.js";

test("não duplica diário da mesma venda", async () => {
    const prisma = {
        $transaction: async (callback) => callback({
            saleDocument: { findFirst: async () => ({ id: "sale-1", companyId: "company-1", status: "ISSUED", kind: "INVOICE", number: "INVOICE-2026-000001", issuedAt: new Date("2026-05-31"), subtotalCents: 10000, vatCents: 2300, totalCents: 12300, lines: [] }) },
            fiscalPeriod: { findFirst: async () => ({ id: "period-1", isClosed: false }) },
            account: { findFirst: async ({ where }) => ({ id: "account-" + where.code }) },
            journalEntry: {
                create: async () => {
                    const error = new Error("duplicate");
                    error.code = "P2002";
                    throw error;
                },
            },
            auditLog: { create: async () => assert.fail("Não deve auditar lançamento duplicado") },
        }),
    };

    await assert.rejects(
        () => postSaleDocument(prisma, "company-1", "user-1", "sale-1"),
        (error) => error.status === 409 && error.code === "SALE_ALREADY_POSTED",
    );
});