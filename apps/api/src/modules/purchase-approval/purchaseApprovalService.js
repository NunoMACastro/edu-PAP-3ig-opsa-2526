// apps/api/src/modules/purchase-approval/purchaseApprovalService.js
import { httpError } from "../../lib/httpErrors.js";
import { postPurchaseDocumentInTransaction } from "../accounting/purchasePostingService.js";
import { parseApprovalReason, parseRejectionReason } from "./purchaseApprovalHistoryValidators.js";

async function findPurchaseDocument(prisma, companyId, id) {
  const document = await prisma.purchaseDocument.findFirst({ where: { id, companyId } });

  if (!document) {
    throw httpError(404, "PURCHASE_DOCUMENT_NOT_FOUND", "Documento de compra não encontrado.");
  }

  return document;
}

async function recordPurchaseApprovalHistory(tx, { companyId, purchaseDocumentId, action, reason, userId }) {
  return tx.purchaseApprovalHistory.create({
    data: {
      companyId,
      purchaseDocumentId,
      action,
      reason,
      decidedById: userId,
    },
  });
}

async function recordPurchaseApprovalAudit(tx, { companyId, userId, purchaseDocumentId, action, details }) {
  await tx.auditLog.create({
    data: {
      companyId,
      userId,
      action,
      entity: "PurchaseDocument",
      entityId: purchaseDocumentId,
      details,
    },
  });
}

export async function approvePurchaseDocument(prisma, companyId, userId, id, input = {}) {
  const reason = parseApprovalReason(input);

  return prisma.$transaction(async (tx) => {
    const document = await findPurchaseDocument(tx, companyId, id);

    if (document.status !== "DRAFT") {
      throw httpError(
        409,
        "PURCHASE_DECISION_INVALID_STATE",
        "Só compras em rascunho podem ser decididas."
      );
    }

    const updated = await tx.purchaseDocument.update({
      where: { id: document.id },
      data: { status: "APPROVED", approvedAt: new Date(), approvedById: userId },
    });

    const history = await recordPurchaseApprovalHistory(tx, {
      companyId,
      purchaseDocumentId: document.id,
      action: "APPROVED",
      reason,
      userId,
    });

    await recordPurchaseApprovalAudit(tx, {
      companyId,
      userId,
      purchaseDocumentId: document.id,
      action: "PURCHASE_DOCUMENT_APPROVED",
      details: {
        previousStatus: document.status,
        nextStatus: "APPROVED",
        reason,
        historyId: history.id,
      },
    });

    return { document: updated, history };
  });
}

export async function rejectPurchaseDocument(prisma, companyId, userId, id, input = {}) {
  const reason = parseRejectionReason(input);

  return prisma.$transaction(async (tx) => {
    const document = await findPurchaseDocument(tx, companyId, id);

    if (document.status !== "DRAFT") {
      throw httpError(
        409,
        "PURCHASE_DECISION_INVALID_STATE",
        "Só compras em rascunho podem ser decididas."
      );
    }

    const updated = await tx.purchaseDocument.update({
      where: { id: document.id },
      data: { status: "REJECTED" },
    });

    const history = await recordPurchaseApprovalHistory(tx, {
      companyId,
      purchaseDocumentId: document.id,
      action: "REJECTED",
      reason,
      userId,
    });

    await recordPurchaseApprovalAudit(tx, {
      companyId,
      userId,
      purchaseDocumentId: document.id,
      action: "PURCHASE_DOCUMENT_REJECTED",
      details: {
        previousStatus: document.status,
        nextStatus: "REJECTED",
        reason,
        historyId: history.id,
      },
    });

    return { document: updated, history };
  });
}

export async function markPurchaseDocumentPosted(prisma, companyId, userId, id) {
  return prisma.$transaction(async (tx) => {
    const document = await findPurchaseDocument(tx, companyId, id);

    if (document.status !== "APPROVED") {
      throw httpError(409, "INVALID_STATUS", "Apenas compras aprovadas podem ser lançadas.");
    }

    const entry = await postPurchaseDocumentInTransaction(tx, companyId, userId, id);

    await tx.purchaseDocument.update({
      where: { id },
      data: { postedAt: new Date(), postedById: userId },
    });

    await recordPurchaseApprovalAudit(tx, {
      companyId,
      userId,
      purchaseDocumentId: id,
      action: "PURCHASE_DOCUMENT_POSTED",
      details: {
        previousStatus: document.status,
        nextStatus: "POSTED",
        journalEntryId: entry.id,
      },
    });

    return entry;
  });
}

export async function listPurchaseApprovalHistory(prisma, { companyId, purchaseDocumentId }) {
  await findPurchaseDocument(prisma, companyId, purchaseDocumentId);

  return prisma.purchaseApprovalHistory.findMany({
    where: { companyId, purchaseDocumentId },
    orderBy: { decidedAt: "asc" },
    include: {
      decidedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}