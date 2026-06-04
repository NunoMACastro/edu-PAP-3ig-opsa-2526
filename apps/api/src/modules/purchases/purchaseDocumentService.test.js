import test from "node:test";
import assert from "node:assert/strict";
import { createPurchaseDocument } from "./purchaseDocumentService.js";

function prismaForItemValidation() {
    const tx = {
        supplier: { findFirst: async () => ({ id: "supplier-1" }) },
        item: { findMany: async () => [] },
        vatRate: { findMany: async () => [{ id: "vat-1", rateBps: 2300 }] },
        purchaseDocument: {
            create: async () => {
                throw new Error("Não deve criar compra quando o artigo não pertence à empresa");
            },
        },
        auditLog: { create: async () => assert.fail("Não deve auditar compra inválida") },
    };
    return {
        fiscalPeriod: { findFirst: async () => ({ id: "period-1", isClosed: false }) },
        $transaction: async (callback) => callback(tx),
    };
}

test("rejeita linha com artigo que não pertence à empresa ativa", async () => {
    const prisma = prismaForItemValidation();
    const input = {
        kind: "SUPPLIER_INVOICE",
        supplierId: "supplier-1",
        supplierNumber: "FT-FORN-1",
        issuedAt: "2026-05-31",
        lines: [
            { itemId: "item-outra-empresa", vatRateId: "vat-1", description: "Mercadoria", quantity: 1, unitCostCents: 10000 },
        ],
    };

    await assert.rejects(
        () => createPurchaseDocument(prisma, "company-1", "user-1", input),
        (error) => error.status === 400 && error.code === "ITEM_NOT_FOUND",
    );
});