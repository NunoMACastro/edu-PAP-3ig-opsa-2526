import test from "node:test";
import assert from "node:assert/strict";
import { approveSaleDocument, rejectSaleDocument } from "./saleApprovalService.js";

test("obriga motivo ao rejeitar venda", async () => {
    await assert.rejects(
        () => rejectSaleDocument({}, "company-1", "user-2", "sale-1", { reason: "" }),
        (error) => error.status === 400 && error.code === "INVALID_REASON",
    );
});

test("impede que o mesmo utilizador aprove o documento que submeteu", async () => {
    const prisma = {
        saleDocument: { findFirst: async () => ({ id: "sale-1", companyId: "company-1", status: "SUBMITTED", submittedById: "user-1" }) },
        $transaction: async () => assert.fail("Não deve abrir transação quando a segregação falha"),
    };

    await assert.rejects(
        () => approveSaleDocument(prisma, "company-1", "user-1", "sale-1"),
        (error) => error.status === 403 && error.code === "SEGREGATION_REQUIRED",
    );
});