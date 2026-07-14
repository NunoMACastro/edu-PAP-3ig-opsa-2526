/**
 * @file Service de lançamentos contabilísticos automáticos por compra.
 */

import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import { recordRetainedAuditLog } from "../audit/auditLogService.js";
import { upsertRetentionHold } from "../compliance/retentionPolicy.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";
import { createStockMovementWithCostInTransaction } from "../inventory/stockMovementService.js";

/**
 * Garante que um lançamento contabilístico tem débitos e créditos iguais.
 * Se a soma não fechar, a função interrompe a contabilização com erro interno de domínio.
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
 * Valida linhas e armazém antes de produzir qualquer efeito contabilístico.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {object} document - Compra com linhas e artigos.
 * @returns {Promise<{productLines: object[], warehouse: object | null}>} Contexto de stock validado.
 */
async function resolvePurchaseStockContext(tx, companyId, document) {
    const invalidLine = document.lines.find(
        (line) => line.item?.companyId !== companyId,
    );
    if (invalidLine) {
        throw httpError(
            409,
            "DOCUMENT_ITEM_SCOPE_INVALID",
            "A compra contém um artigo inválido para esta empresa",
        );
    }

    const productLines = document.lines.filter(
        (line) => line.item.type === "PRODUCT",
    );
    if (productLines.length === 0) {
        return { productLines, warehouse: null };
    }
    if (!document.warehouseId) {
        throw httpError(
            409,
            "WAREHOUSE_REQUIRED_FOR_POSTING",
            "Define o armazém da compra antes de a contabilizar",
        );
    }

    const warehouse = await tx.warehouse.findFirst({
        where: {
            id: document.warehouseId,
            companyId,
            isActive: true,
        },
        select: { id: true, code: true, name: true },
    });
    if (!warehouse) {
        throw httpError(
            404,
            "WAREHOUSE_NOT_FOUND",
            "Armazém não encontrado",
        );
    }
    return { productLines, warehouse };
}

/**
 * Cria os movimentos de stock associados às linhas de produto da compra.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma.
 * @param {{ companyId: string, userId: string, document: object, productLines: object[] }} input - Contexto autenticado.
 * @returns {Promise<{movements: object[], direction: "ENTRY" | "EXIT", quantity: string}>} Efeito agregado.
 */
async function createPurchaseStockMovements(tx, input) {
    const isCreditNote = input.document.kind === "SUPPLIER_CREDIT_NOTE";
    const movements = [];

    for (const line of input.productLines) {
        movements.push(
            await createStockMovementWithCostInTransaction(tx, {
                companyId: input.companyId,
                userId: input.userId,
                movement: {
                    itemId: line.itemId,
                    type: isCreditNote ? "EXIT" : "ENTRY",
                    quantity: line.quantity,
                    unitCostCents: isCreditNote ? null : line.unitCostCents,
                    fromWarehouseId: isCreditNote
                        ? input.document.warehouseId
                        : null,
                    toWarehouseId: isCreditNote
                        ? null
                        : input.document.warehouseId,
                    reason: `Contabilização da compra ${input.document.supplierNumber}`,
                    sourceType: "PURCHASE_DOCUMENT_LINE",
                    sourceId: line.id,
                },
            }),
        );
    }

    const quantity = input.productLines.reduce(
        (total, line) => total + Number(line.quantity),
        0,
    );
    return {
        movements,
        direction: isCreditNote ? "EXIT" : "ENTRY",
        quantity: quantity.toFixed(3),
    };
}

/**
 * Regista a auditoria contabilística e a auditoria de workflow da compra.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Cliente/transação Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {object} document - Documento de compra contabilizado.
 * @param {object} entry - Lançamento contabilístico criado.
 * @param {Date} periodEndAt - Fim do período contabilístico protegido.
 * @param {{ movements: object[], direction: string }} stockEffect - Efeito de stock confirmado.
 * @returns {Promise<void>}
 */
async function recordPurchasePostingAudits(
    tx,
    companyId,
    userId,
    document,
    entry,
    periodEndAt,
    stockEffect,
) {
    await recordRetainedAuditLog(tx, {
        companyId,
        userId,
        action: "PURCHASE_DOCUMENT_POSTED",
        entity: "JournalEntry",
        entityId: entry.id,
        periodEndAt,
        retentionReason: "PURCHASE_POSTING_AUDIT_RETAINED",
        details: {
            purchaseDocumentId: document.id,
            documentNumber: document.supplierNumber,
            journalEntryId: entry.id,
            totalCents: document.totalCents,
            source: "PURCHASE",
            stockMovementCount: stockEffect.movements.length,
            stockDirection: stockEffect.direction,
        },
    });
    await recordRetainedAuditLog(tx, {
        companyId,
        userId,
        action: "PURCHASE_DOCUMENT_POSTED",
        entity: "PurchaseDocument",
        entityId: document.id,
        periodEndAt,
        retentionReason: "PURCHASE_DOCUMENT_AUDIT_RETAINED",
        details: {
            journalEntryId: entry.id,
            documentNumber: document.supplierNumber,
            totalCents: document.totalCents,
            source: "PURCHASE",
            stockMovementCount: stockEffect.movements.length,
            stockDirection: stockEffect.direction,
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
    await acquireTransactionLock(tx, "fiscal", companyId);
    const document = await tx.purchaseDocument.findFirst({
        where: { id: purchaseDocumentId, companyId },
        include: {
            lines: {
                include: {
                    item: {
                        select: {
                            id: true,
                            companyId: true,
                            type: true,
                        },
                    },
                },
            },
        },
    });
    if (!document) {
        throw httpError(
            404,
            "PURCHASE_DOCUMENT_NOT_FOUND",
            "Documento de compra não encontrado",
        );
    }
    if (document.postedAt || document.status === "POSTED") {
        throw httpError(
            409,
            "PURCHASE_ALREADY_POSTED",
            "Compra já contabilizada",
        );
    }
    if (!["APPROVED", "PAID"].includes(document.status)) {
        throw httpError(
            409,
            "INVALID_STATUS",
            "Apenas compras aprovadas ou pagas podem ser contabilizadas",
        );
    }
    const fiscalPeriod = await assertOpenFiscalPeriod(tx, {
        companyId,
        documentDate: document.issuedAt,
    });
    const stockContext = await resolvePurchaseStockContext(
        tx,
        companyId,
        document,
    );

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
        const stockEffect = await createPurchaseStockMovements(tx, {
            companyId,
            userId,
            document,
            productLines: stockContext.productLines,
        });
        const postedAt = new Date();
        await tx.purchaseDocument.update({
            where: { id: document.id },
            data: {
                status: "POSTED",
                postedAt,
                postedById: userId,
            },
        });
        await recordPurchasePostingAudits(
            tx,
            companyId,
            userId,
            document,
            entry,
            fiscalPeriod.endDate,
            stockEffect,
        );
        await upsertRetentionHold(tx, {
            companyId,
            entity: "PurchaseDocument",
            entityId: document.id,
            periodEndAt: fiscalPeriod.endDate,
            reason: "PURCHASE_DOCUMENT_POSTED",
        });
        await upsertRetentionHold(tx, {
            companyId,
            entity: "JournalEntry",
            entityId: entry.id,
            periodEndAt: fiscalPeriod.endDate,
            reason: "PURCHASE_DOCUMENT_POSTED",
        });

        return {
            ...entry,
            stockEffect: {
                movementCount: stockEffect.movements.length,
                direction: stockEffect.direction,
                quantity: stockEffect.quantity,
            },
        };
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
