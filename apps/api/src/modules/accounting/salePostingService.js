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

export async function postSaleDocument(prisma, companyId, userId, saleDocumentId) {
    return prisma.$transaction(async (tx) => {
        const document = await tx.saleDocument.findFirst({ where: { id: saleDocumentId, companyId }, include: { lines: true } });
        if (!document) throw httpError(404, "SALE_DOCUMENT_NOT_FOUND", "Documento de venda não encontrado");
        if (document.status !== "ISSUED" && document.status !== "SETTLED") throw httpError(409, "DOCUMENT_NOT_ISSUED", "Documento ainda não emitido");
        await assertOpenFiscalPeriod(tx, { companyId, documentDate: document.issuedAt });

        const customerAccount = await accountByCode(tx, companyId, "211");
        const revenueAccount = await accountByCode(tx, companyId, "72");
        const vatAccount = await accountByCode(tx, companyId, "2433");
        const isCreditNote = document.kind === "CREDIT_NOTE";
        const lines = isCreditNote
            ? [
                // A nota de crédito reduz a dívida do cliente e reverte proveito e IVA liquidado.
                { accountId: revenueAccount.id, debitCents: document.subtotalCents, creditCents: 0, memo: "Reversão de venda" },
                { accountId: vatAccount.id, debitCents: document.vatCents, creditCents: 0, memo: "Reversão de IVA liquidado" },
                { accountId: customerAccount.id, debitCents: 0, creditCents: document.totalCents, memo: "Credito ao cliente" },
            ]
            : [
                { accountId: customerAccount.id, debitCents: document.totalCents, creditCents: 0, memo: "Cliente" },
                { accountId: revenueAccount.id, debitCents: 0, creditCents: document.subtotalCents, memo: "Venda" },
                { accountId: vatAccount.id, debitCents: 0, creditCents: document.vatCents, memo: "IVA liquidado" },
            ];
        const nonZeroLines = lines.filter((line) => line.debitCents > 0 || line.creditCents > 0);
        assertBalanced(nonZeroLines);

        try {
            const entry = await tx.journalEntry.create({ data: { companyId, source: "SALE", sourceId: document.id, entryDate: document.issuedAt, description: "Venda " + document.number, createdById: userId, lines: { create: nonZeroLines } }, include: { lines: true } });
            await tx.auditLog.create({
                data: {
                    companyId,
                    userId,
                    action: "SALE_DOCUMENT_POSTED",
                    entity: "JournalEntry",
                    entityId: entry.id,
                    details: { saleDocumentId: document.id, totalCents: document.totalCents, source: "SALE" },
                },
            });
            return entry;
        } catch (error) {
            if (error.code === "P2002") throw httpError(409, "SALE_ALREADY_POSTED", "Venda já contabilizada");
            throw error;
        }
    });
}