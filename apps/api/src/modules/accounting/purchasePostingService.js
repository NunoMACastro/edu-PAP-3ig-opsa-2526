import { httpError } from "../../lib/httpErrors.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

function assertBalanced(lines) {
    const debit = lines.reduce((sum, line) => sum + line.debitCents, 0);
    const credit = lines.reduce((sum, line) => sum + line.creditCents, 0);
    if (debit !== credit) throw httpError(500, "UNBALANCED_ENTRY", "Lancamento desequilibrado");
}

async function accountByCode(tx, companyId, code) {
    const account = await tx.account.findFirst({ where: { companyId, code, isActive: true } });
    if (!account) throw httpError(409, "ACCOUNT_NOT_FOUND", "Conta SNC em falta: " + code);
    return account;
}

export async function postPurchaseDocumentInTransaction(tx, companyId, userId, purchaseDocumentId) {
    const document = await tx.purchaseDocument.findFirst({ where: { id: purchaseDocumentId, companyId }, include: { lines: true } });
    if (!document) throw httpError(404, "PURCHASE_DOCUMENT_NOT_FOUND", "Documento de compra não encontrado");
    if (document.status !== "APPROVED" && document.status !== "PAID") throw httpError(409, "INVALID_STATUS", "Apenas compras aprovadas ou pagas podem ser contabilizadas");
    await assertOpenFiscalPeriod(tx, { companyId, documentDate: document.issuedAt });

    const expenseAccount = await accountByCode(tx, companyId, "62");
    const vatAccount = await accountByCode(tx, companyId, "2432");
    const supplierAccount = await accountByCode(tx, companyId, "221");
    const isCreditNote = document.kind === "SUPPLIER_CREDIT_NOTE";
    const lines = isCreditNote
        ? [
            // A nota de crédito reduz a dívida ao fornecedor e reverte gasto e IVA dedutível.
            { accountId: supplierAccount.id, debitCents: document.totalCents, creditCents: 0, memo: "Credito de fornecedor" },
            { accountId: expenseAccount.id, debitCents: 0, creditCents: document.subtotalCents, memo: "Reversão de gasto" },
            { accountId: vatAccount.id, debitCents: 0, creditCents: document.vatCents, memo: "Reversão de IVA dedutível" },
        ]
        : [
            { accountId: expenseAccount.id, debitCents: document.subtotalCents, creditCents: 0, memo: "Compra" },
            { accountId: vatAccount.id, debitCents: document.vatCents, creditCents: 0, memo: "IVA dedutível" },
            { accountId: supplierAccount.id, debitCents: 0, creditCents: document.totalCents, memo: "Fornecedor" },
        ];
    const nonZeroLines = lines.filter((line) => line.debitCents > 0 || line.creditCents > 0);
    assertBalanced(nonZeroLines);

    try {
        const entry = await tx.journalEntry.create({ data: { companyId, source: "PURCHASE", sourceId: document.id, entryDate: document.issuedAt, description: "Compra " + document.supplierNumber, createdById: userId, lines: { create: nonZeroLines } }, include: { lines: true } });
        await tx.purchaseDocument.update({ where: { id: document.id }, data: { status: document.status === "PAID" ? "PAID" : "POSTED" } });
        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "PURCHASE_DOCUMENT_POSTED",
                entity: "JournalEntry",
                entityId: entry.id,
                details: { purchaseDocumentId: document.id, totalCents: document.totalCents, source: "PURCHASE" },
            },
        });
        return entry;
    } catch (error) {
        if (error.code === "P2002") throw httpError(409, "PURCHASE_ALREADY_POSTED", "Compra já contabilizada");
        throw error;
    }
}

export async function postPurchaseDocument(prisma, companyId, userId, purchaseDocumentId) {
    return prisma.$transaction((tx) => postPurchaseDocumentInTransaction(tx, companyId, userId, purchaseDocumentId));
}