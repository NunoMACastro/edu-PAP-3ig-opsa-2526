import test from "node:test";
import assert from "node:assert/strict";
import { postPurchaseDocument } from "./purchasePostingService.js";

test("não duplica diário da mesma compra", async () => {
    const prisma = {
        $transaction: async (callback) => callback({
            purchaseDocument: { findFirst: async () => ({ id: "purchase-1", companyId: "company-1", status: "APPROVED", kind: "SUPPLIER_INVOICE", supplierNumber: "FT-FORN-1", issuedAt: new Date("2026-05-31"), subtotalCents: 10000, vatCents: 2300, totalCents: 12300, lines: [] }) },
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
        () => postPurchaseDocument(prisma, "company-1", "user-1", "purchase-1"),
        (error) => error.status === 409 && error.code === "PURCHASE_ALREADY_POSTED",
    );
});