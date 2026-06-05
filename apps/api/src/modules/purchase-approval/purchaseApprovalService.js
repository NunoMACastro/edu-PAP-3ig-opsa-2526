import { httpError } from "../../lib/httpErrors.js";
import { postPurchaseDocumentInTransaction } from "../accounting/purchasePostingService.js";

async function findPurchaseDocument(prisma, companyId, id) {
    const document = await prisma.purchaseDocument.findFirst({ where: { id, companyId } });
    if (!document) throw httpError(404, "PURCHASE_DOCUMENT_NOT_FOUND", "Documento de compra não encontrado");
    return document;
}

async function recordPurchaseApprovalAudit(tx, companyId, userId, purchaseDocumentId, action) {
    await tx.auditLog.create({
        data: { companyId, userId, action, entity: "PurchaseDocument", entityId: purchaseDocumentId },
    });
}

export async function approvePurchaseDocument(prisma, companyId, userId, id) {
    const document = await findPurchaseDocument(prisma, companyId, id);
    if (document.status !== "DRAFT") throw httpError(409, "INVALID_STATUS", "Apenas rascunhos podem ser aprovados");
    return prisma.$transaction(async (tx) => {
        const updated = await tx.purchaseDocument.update({ where: { id }, data: { status: "APPROVED", approvedAt: new Date(), approvedById: userId } });
        await recordPurchaseApprovalAudit(tx, companyId, userId, id, "PURCHASE_DOCUMENT_APPROVED");
        return updated;
    });
}

export async function markPurchaseDocumentPosted(prisma, companyId, userId, id) {
    return prisma.$transaction(async (tx) => {
        const document = await findPurchaseDocument(tx, companyId, id);
        if (document.status !== "APPROVED") throw httpError(409, "INVALID_STATUS", "Apenas compras aprovadas podem ser lançadas");
        const entry = await postPurchaseDocumentInTransaction(tx, companyId, userId, id);
        // O estado POSTED só fica registado depois de existir diário contabilístico.
        await tx.purchaseDocument.update({ where: { id }, data: { postedAt: new Date(), postedById: userId } });
        await recordPurchaseApprovalAudit(tx, companyId, userId, id, "PURCHASE_DOCUMENT_POSTED");
        return entry;
    });
}
import test from "node:test";
import assert from "node:assert/strict";
import { markPurchaseDocumentPosted } from "./purchaseApprovalService.js";

test("impede lancar compra antes de aprovar", async () => {
    const prisma = {
        $transaction: async (callback) => callback({
            purchaseDocument: {
                findFirst: async () => ({ id: "purchase-1", companyId: "company-1", status: "DRAFT" }),
                update: async () => assert.fail("Não deve atualizar compra sem aprovação"),
            },
            journalEntry: { create: async () => assert.fail("Não deve criar diário sem aprovação") },
            auditLog: { create: async () => assert.fail("Não deve auditar lançamento recusado") },
        }),
    };

    await assert.rejects(
        () => markPurchaseDocumentPosted(prisma, "company-1", "user-1", "purchase-1"),
        (error) => error.status === 409 && error.code === "INVALID_STATUS",
    );
});