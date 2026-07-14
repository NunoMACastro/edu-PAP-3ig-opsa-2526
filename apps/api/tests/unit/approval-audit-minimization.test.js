/**
 * @file Provas de minimização do texto livre nos logs de aprovação.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { rejectSaleDocument } from "../../src/modules/sales-approval/saleApprovalService.js";
import { rejectPurchaseDocument } from "../../src/modules/purchase-approval/purchaseApprovalService.js";

test("rejeição de venda mantém motivo no workflow e não o duplica no AuditLog", async () => {
    let updateData;
    let auditData;
    const tx = {
        saleDocument: {
            updateMany: async ({ data }) => {
                updateData = data;
                return { count: 1 };
            },
            findFirst: async () => ({ id: "sale-1", status: "REJECTED" }),
        },
        auditLog: {
            create: async ({ data }) => {
                auditData = data;
                return data;
            },
        },
    };
    const prisma = {
        saleDocument: {
            findFirst: async () => ({
                id: "sale-1",
                status: "SUBMITTED",
                submittedById: "author-1",
            }),
        },
        $transaction: async (callback) => callback(tx),
    };

    await rejectSaleDocument(prisma, "company-1", "reviewer-1", "sale-1", {
        reason: "Texto livre potencialmente pessoal",
    });

    assert.equal(updateData.rejectionReason, "Texto livre potencialmente pessoal");
    assert.deepEqual(auditData.details, { reasonRecordedInWorkflow: true });
    assert.equal(JSON.stringify(auditData).includes("potencialmente pessoal"), false);
});

test("rejeição de compra referencia o histórico sem duplicar o motivo no AuditLog", async () => {
    let historyData;
    let auditData;
    const tx = {
        purchaseDocument: {
            updateMany: async () => ({ count: 1 }),
            findFirst: async () => ({ id: "purchase-1", status: "REJECTED" }),
        },
        purchaseApprovalHistory: {
            create: async ({ data }) => {
                historyData = data;
                return { id: "history-1", ...data };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                auditData = data;
                return data;
            },
        },
    };
    const prisma = {
        purchaseDocument: {
            findFirst: async () => ({ id: "purchase-1", status: "DRAFT" }),
        },
        $transaction: async (callback) => callback(tx),
    };

    await rejectPurchaseDocument(
        prisma,
        "company-1",
        "reviewer-1",
        "purchase-1",
        { reason: "Justificação comercial privada" },
    );

    assert.equal(historyData.reason, "Justificação comercial privada");
    assert.deepEqual(auditData.details, {
        historyId: "history-1",
        reasonRecordedInWorkflow: true,
    });
    assert.equal(JSON.stringify(auditData).includes("comercial privada"), false);
});
