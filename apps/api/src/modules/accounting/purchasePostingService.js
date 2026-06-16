/**
 * @file Service de lançamentos contabilísticos automáticos por compra.
 */

import { httpError } from "../../lib/httpErrors.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

/**
 * Garante lançamento balanceado.
 *
 * @param {{ debitCents: number, creditCents: number }[]} lines - Linhas contabilísticas.
 * @returns {void}
 */
function assertBalanced(lines) {
    const debit = lines.reduce((sum, line) => sum + line.debitCents, 0);
    const credit = lines.reduce((sum, line) => sum + line.creditCents, 0);
    if (debit !== credit) {
        throw httpError(500, "UNBALANCED_ENTRY", "Lançamento desequilibrado");
    }
}

/**
 * Resolve conta ativa pelo código SNC simplificado definido no BK.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Cliente/transação Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} code - Código da conta.
 * @returns {Promise<object>} Conta ativa.
 */
async function accountByCode(tx, companyId, code) {
    const account = await tx.account.findFirst({
        where: { companyId, code, isActive: true },
    });
    if (!account) {
        throw httpError(
            409,
            "ACCOUNT_NOT_FOUND",
            `Conta SNC em falta: ${code}`,
        );
    }
    return account;
}

/**
 * Regista a auditoria contabilística e a auditoria de workflow da compra.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Cliente/transação Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {object} document - Documento de compra contabilizado.
 * @param {object} entry - Lançamento contabilístico criado.
 * @returns {Promise<void>}
 */
async function recordPurchasePostingAudits(tx, companyId, userId, document, entry) {
    await tx.auditLog.create({
        data: {
            companyId,
            userId,
            action: "PURCHASE_DOCUMENT_POSTED",
            entity: "JournalEntry",
            entityId: entry.id,
            details: {
                purchaseDocumentId: document.id,
                totalCents: document.totalCents,
                source: "PURCHASE",
            },
        },
    });
    await tx.auditLog.create({
        data: {
            companyId,
            userId,
            action: "PURCHASE_DOCUMENT_POSTED",
            entity: "PurchaseDocument",
            entityId: document.id,
            details: {
                journalEntryId: entry.id,
                totalCents: document.totalCents,
                source: "PURCHASE",
            },
        },
    });
}

/**
 * Contabiliza compra dentro de uma transação já aberta.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} purchaseDocumentId - Documento de compra.
 * @returns {Promise<object>} Lançamento criado.
 */
export async function postPurchaseDocumentInTransaction(
    tx,
    companyId,
    userId,
    purchaseDocumentId,
) {
    const document = await tx.purchaseDocument.findFirst({
        where: { id: purchaseDocumentId, companyId },
        include: { lines: true },
    });
    if (!document) {
        throw httpError(
            404,
            "PURCHASE_DOCUMENT_NOT_FOUND",
            "Documento de compra não encontrado",
        );
    }
    if (!["APPROVED", "PAID"].includes(document.status)) {
        throw httpError(
            409,
            "INVALID_STATUS",
            "Apenas compras aprovadas ou pagas podem ser contabilizadas",
        );
    }
    await assertOpenFiscalPeriod(tx, {
        companyId,
        documentDate: document.issuedAt,
    });

    const expenseAccount = await accountByCode(tx, companyId, "62");
    const vatAccount = await accountByCode(tx, companyId, "2432");
    const supplierAccount = await accountByCode(tx, companyId, "221");
    const isCreditNote = document.kind === "SUPPLIER_CREDIT_NOTE";
    const lines = isCreditNote
        ? [
              {
                  accountId: supplierAccount.id,
                  debitCents: document.totalCents,
                  creditCents: 0,
                  memo: "Crédito de fornecedor",
              },
              {
                  accountId: expenseAccount.id,
                  debitCents: 0,
                  creditCents: document.subtotalCents,
                  memo: "Reversão de gasto",
              },
              {
                  accountId: vatAccount.id,
                  debitCents: 0,
                  creditCents: document.vatCents,
                  memo: "Reversão de IVA dedutível",
              },
          ]
        : [
              {
                  accountId: expenseAccount.id,
                  debitCents: document.subtotalCents,
                  creditCents: 0,
                  memo: "Compra",
              },
              {
                  accountId: vatAccount.id,
                  debitCents: document.vatCents,
                  creditCents: 0,
                  memo: "IVA dedutível",
              },
              {
                  accountId: supplierAccount.id,
                  debitCents: 0,
                  creditCents: document.totalCents,
                  memo: "Fornecedor",
              },
          ];
    const nonZeroLines = lines.filter(
        (line) => line.debitCents > 0 || line.creditCents > 0,
    );
    assertBalanced(nonZeroLines);

    try {
        const entry = await tx.journalEntry.create({
            data: {
                companyId,
                source: "PURCHASE",
                sourceId: document.id,
                entryDate: document.issuedAt,
                description: `Compra ${document.supplierNumber}`,
                createdById: userId,
                lines: { create: nonZeroLines },
            },
            include: { lines: true },
        });
        await tx.purchaseDocument.update({
            where: { id: document.id },
            data: {
                status: "POSTED",
                postedAt: new Date(),
                postedById: userId,
            },
        });
        await recordPurchasePostingAudits(tx, companyId, userId, document, entry);

        return entry;
    } catch (error) {
        if (error.code === "P2002") {
            throw httpError(
                409,
                "PURCHASE_ALREADY_POSTED",
                "Compra já contabilizada",
            );
        }
        throw error;
    }
}

/**
 * Cria lançamento contabilístico automático de compra.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} purchaseDocumentId - Documento de compra.
 * @returns {Promise<object>} Lançamento criado.
 */
export async function postPurchaseDocument(
    prisma,
    companyId,
    userId,
    purchaseDocumentId,
) {
    return prisma.$transaction((tx) =>
        postPurchaseDocumentInTransaction(
            tx,
            companyId,
            userId,
            purchaseDocumentId,
        ),
    );
}
