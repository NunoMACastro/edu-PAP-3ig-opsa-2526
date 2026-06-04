import { httpError } from "../../lib/httpErrors.js";

async function findSaleDocument(prisma, companyId, id) {
    const document = await prisma.saleDocument.findFirst({ where: { id, companyId } });
    if (!document) throw httpError(404, "SALE_DOCUMENT_NOT_FOUND", "Documento de venda não encontrado");
    return document;
}

async function recordSaleApprovalAudit(tx, companyId, userId, saleDocumentId, action, details = {}) {
    await tx.auditLog.create({
        data: { companyId, userId, action, entity: "SaleDocument", entityId: saleDocumentId, details },
    });
}

export async function submitSaleDocument(prisma, companyId, userId, id) {
    const document = await findSaleDocument(prisma, companyId, id);
    if (document.status !== "DRAFT") throw httpError(409, "INVALID_STATUS", "Apenas rascunhos podem ser submetidos");
    return prisma.$transaction(async (tx) => {
        const updated = await tx.saleDocument.update({ where: { id }, data: { status: "SUBMITTED", submittedAt: new Date(), submittedById: userId, rejectionReason: null } });
        await recordSaleApprovalAudit(tx, companyId, userId, id, "SALE_DOCUMENT_SUBMITTED");
        return updated;
    });
}

export async function approveSaleDocument(prisma, companyId, userId, id) {
    const document = await findSaleDocument(prisma, companyId, id);
    if (document.status !== "SUBMITTED") throw httpError(409, "INVALID_STATUS", "Apenas documentos submetidos podem ser aprovados");
    if (document.submittedById === userId) throw httpError(403, "SEGREGATION_REQUIRED", "Outro utilizador deve aprovar o documento");
    return prisma.$transaction(async (tx) => {
        const updated = await tx.saleDocument.update({ where: { id }, data: { status: "APPROVED", approvedAt: new Date(), approvedById: userId } });
        await recordSaleApprovalAudit(tx, companyId, userId, id, "SALE_DOCUMENT_APPROVED");
        return updated;
    });
}

export async function rejectSaleDocument(prisma, companyId, userId, id, input) {
    const reason = String(input?.reason ?? "").trim();
    if (reason.length < 3) throw httpError(400, "INVALID_REASON", "Motivo de rejeição obrigatório");
    const document = await findSaleDocument(prisma, companyId, id);
    if (document.status !== "SUBMITTED") throw httpError(409, "INVALID_STATUS", "Apenas documentos submetidos podem ser rejeitados");
    if (document.submittedById === userId) throw httpError(403, "SEGREGATION_REQUIRED", "Outro utilizador deve rejeitar o documento");
    return prisma.$transaction(async (tx) => {
        const updated = await tx.saleDocument.update({ where: { id }, data: { status: "REJECTED", rejectedAt: new Date(), rejectedById: userId, rejectionReason: reason } });
        await recordSaleApprovalAudit(tx, companyId, userId, id, "SALE_DOCUMENT_REJECTED", { reason });
        return updated;
    });
}