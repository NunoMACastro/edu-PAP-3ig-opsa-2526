/**
 * @file Service de lançamentos contabilísticos automáticos por venda.
 */

import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import { recordRetainedAuditLog } from "../audit/auditLogService.js";
import { upsertRetentionHold } from "../compliance/retentionPolicy.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";
import { createStockMovementWithCostInTransaction } from "../inventory/stockMovementService.js";

/**
 * Garante que o lançamento fica debitado e creditado pelo mesmo valor.
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
 * @param {object} document - Venda com linhas e artigos.
 * @returns {Promise<{productLines: object[], warehouse: object | null}>} Contexto de stock validado.
 */
async function resolveSaleStockContext(tx, companyId, document) {
    const invalidLine = document.lines.find(
        (line) => line.item?.companyId !== companyId,
    );
    if (invalidLine) {
        throw httpError(
            409,
            "DOCUMENT_ITEM_SCOPE_INVALID",
            "A venda contém um artigo inválido para esta empresa",
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
            "Define o armazém da venda antes de a contabilizar",
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
 * Cria os movimentos de stock associados às linhas de produto da venda.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma.
 * @param {{ companyId: string, userId: string, document: object, productLines: object[] }} input - Contexto autenticado.
 * @returns {Promise<{movements: object[], direction: "ENTRY" | "EXIT", quantity: string}>} Efeito agregado.
 */
async function createSaleStockMovements(tx, input) {
    const isCreditNote = input.document.kind === "CREDIT_NOTE";
    const movements = [];

    for (const line of input.productLines) {
        const unitCostCents = Number(line.item.costCents);
        if (
            isCreditNote &&
            (!Number.isInteger(unitCostCents) || unitCostCents <= 0)
        ) {
            throw httpError(
                409,
                "RETURN_COST_UNAVAILABLE",
                "Não foi possível determinar o custo da devolução desta venda",
            );
        }

        movements.push(
            await createStockMovementWithCostInTransaction(tx, {
                companyId: input.companyId,
                userId: input.userId,
                movement: {
                    itemId: line.itemId,
                    type: isCreditNote ? "RETURN" : "EXIT",
                    quantity: line.quantity,
                    unitCostCents: isCreditNote ? unitCostCents : null,
                    fromWarehouseId: isCreditNote
                        ? null
                        : input.document.warehouseId,
                    toWarehouseId: isCreditNote
                        ? input.document.warehouseId
                        : null,
                    reason: `Contabilização da venda ${input.document.number}`,
                    sourceType: "SALE_DOCUMENT_LINE",
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
        direction: isCreditNote ? "ENTRY" : "EXIT",
        quantity: quantity.toFixed(3),
    };
}

/**
 * Cria lançamento contabilístico automático de venda.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} saleDocumentId - Documento de venda.
 * @returns {Promise<object>} Lançamento criado.
 */
export async function postSaleDocument(
    prisma,
    companyId,
    userId,
    saleDocumentId,
) {
    return prisma.$transaction(async (tx) => {
        await acquireTransactionLock(tx, "fiscal", companyId);
        const document = await tx.saleDocument.findFirst({
            where: { id: saleDocumentId, companyId },
            include: {
                lines: {
                    include: {
                        item: {
                            select: {
                                id: true,
                                companyId: true,
                                type: true,
                                costCents: true,
                            },
                        },
                    },
                },
            },
        });
        if (!document) {
            throw httpError(
                404,
                "SALE_DOCUMENT_NOT_FOUND",
                "Documento de venda não encontrado",
            );
        }
        if (document.postedAt) {
            throw httpError(
                409,
                "SALE_ALREADY_POSTED",
                "Venda já contabilizada",
            );
        }
        if (!["ISSUED", "SETTLED"].includes(document.status)) {
            throw httpError(
                409,
                "DOCUMENT_NOT_ISSUED",
                "Documento ainda não emitido",
            );
        }
        const fiscalPeriod = await assertOpenFiscalPeriod(tx, {
            companyId,
            documentDate: document.issuedAt,
        });
        const stockContext = await resolveSaleStockContext(
            tx,
            companyId,
            document,
        );

        const customerAccount = await accountByCode(tx, companyId, "211");
        const revenueAccount = await accountByCode(tx, companyId, "72");
        const vatAccount = await accountByCode(tx, companyId, "2433");
        const isCreditNote = document.kind === "CREDIT_NOTE";
        const lines = isCreditNote
            ? [
                  {
                      accountId: revenueAccount.id,
                      debitCents: document.subtotalCents,
                      creditCents: 0,
                      memo: "Reversão de venda",
                  },
                  {
                      accountId: vatAccount.id,
                      debitCents: document.vatCents,
                      creditCents: 0,
                      memo: "Reversão de IVA liquidado",
                  },
                  {
                      accountId: customerAccount.id,
                      debitCents: 0,
                      creditCents: document.totalCents,
                      memo: "Crédito ao cliente",
                  },
              ]
            : [
                  {
                      accountId: customerAccount.id,
                      debitCents: document.totalCents,
                      creditCents: 0,
                      memo: "Cliente",
                  },
                  {
                      accountId: revenueAccount.id,
                      debitCents: 0,
                      creditCents: document.subtotalCents,
                      memo: "Venda",
                  },
                  {
                      accountId: vatAccount.id,
                      debitCents: 0,
                      creditCents: document.vatCents,
                      memo: "IVA liquidado",
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
                    source: "SALE",
                    sourceId: document.id,
                    entryDate: document.issuedAt,
                    description: `Venda ${document.number}`,
                    createdById: userId,
                    lines: { create: nonZeroLines },
                },
                include: { lines: true },
            });
            const stockEffect = await createSaleStockMovements(tx, {
                companyId,
                userId,
                document,
                productLines: stockContext.productLines,
            });
            const postedAt = new Date();
            await tx.saleDocument.update({
                where: { id: document.id },
                data: { postedAt, postedById: userId },
            });
            await recordRetainedAuditLog(tx, {
                companyId,
                userId,
                action: "SALE_DOCUMENT_POSTED",
                entity: "JournalEntry",
                entityId: entry.id,
                periodEndAt: fiscalPeriod.endDate,
                retentionReason: "SALE_POSTING_AUDIT_RETAINED",
                details: {
                    saleDocumentId: document.id,
                    documentNumber: document.number,
                    journalEntryId: entry.id,
                    totalCents: document.totalCents,
                    source: "SALE",
                    stockMovementCount: stockEffect.movements.length,
                    stockDirection: stockEffect.direction,
                },
            });
            await recordRetainedAuditLog(tx, {
                companyId,
                userId,
                action: "SALE_DOCUMENT_POSTED",
                entity: "SaleDocument",
                entityId: document.id,
                periodEndAt: fiscalPeriod.endDate,
                retentionReason: "SALE_DOCUMENT_AUDIT_RETAINED",
                details: {
                    documentNumber: document.number,
                    journalEntryId: entry.id,
                    totalCents: document.totalCents,
                    stockMovementCount: stockEffect.movements.length,
                    stockDirection: stockEffect.direction,
                },
            });
            await upsertRetentionHold(tx, {
                companyId,
                entity: "SaleDocument",
                entityId: document.id,
                periodEndAt: fiscalPeriod.endDate,
                reason: "SALE_DOCUMENT_POSTED",
            });
            await upsertRetentionHold(tx, {
                companyId,
                entity: "JournalEntry",
                entityId: entry.id,
                periodEndAt: fiscalPeriod.endDate,
                reason: "SALE_DOCUMENT_POSTED",
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
                    "SALE_ALREADY_POSTED",
                    "Venda já contabilizada",
                );
            }
            throw error;
        }
    });
}
