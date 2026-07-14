/**
 * @file Service de documentos de compra da MF1.
 */

import {
    buildCursorPage,
    buildKeysetCondition,
    decodePageCursor,
    parsePageLimit,
} from "../../lib/cursorPagination.js";
import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import {
    parseOptionalStrictDateOnly,
    parseStrictDateOnly,
} from "../../lib/strictDate.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

const kinds = new Set(["SUPPLIER_INVOICE", "SUPPLIER_CREDIT_NOTE"]);

/**
 * Valida linha de compra.
 *
 * @param {unknown} line - Linha JSON.
 * @returns {{ itemId: string, vatRateId: string, description: string, quantity: number, unitCostCents: number }} Linha normalizada.
 */
function parseLine(line) {
    if (!line || typeof line !== "object") {
        throw httpError(400, "INVALID_LINE", "Linha inválida");
    }

    const quantity = Number(line.quantity);
    const unitCostCents = Number(line.unitCostCents);
    if (!line.itemId) {
        throw httpError(400, "INVALID_ITEM", "Artigo obrigatório");
    }
    if (!line.vatRateId) {
        throw httpError(400, "INVALID_VAT", "Taxa de IVA obrigatória");
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw httpError(400, "INVALID_QUANTITY", "Quantidade inválida");
    }
    if (!Number.isInteger(unitCostCents) || unitCostCents < 0) {
        throw httpError(400, "INVALID_COST", "Custo inválido");
    }

    return {
        itemId: String(line.itemId),
        vatRateId: String(line.vatRateId),
        description: String(line.description ?? "").trim(),
        quantity,
        unitCostCents,
    };
}

/**
 * Lista documentos de compra da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {{ cursor?: string, limit?: string | number }} [page] - Paginação pedida.
 * @returns {Promise<{items: object[], pageInfo: object}>} Página de documentos.
 */
export async function listPurchaseDocuments(prisma, companyId, page = {}) {
    const limit = parsePageLimit(page.limit);
    const cursor = decodePageCursor(page.cursor, "date");
    const keyset = buildKeysetCondition(cursor, {
        sortField: "issuedAt",
        direction: "desc",
    });
    const baseWhere = { companyId };
    const records = await prisma.purchaseDocument.findMany({
        where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
        include: { supplier: true, lines: true },
        orderBy: [{ issuedAt: "desc" }, { id: "desc" }],
        take: limit + 1,
    });
    return buildCursorPage(records, {
        limit,
        sortField: "issuedAt",
        sortType: "date",
    });
}

/**
 * Cria documento de compra em rascunho.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {unknown} input - Payload JSON.
 * @returns {Promise<object>} Documento criado.
 */
export async function createPurchaseDocument(prisma, companyId, userId, input) {
    if (!input || typeof input !== "object") {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const kind = String(input.kind ?? "").toUpperCase();
    if (!kinds.has(kind)) {
        throw httpError(400, "INVALID_KIND", "Tipo de compra inválido");
    }
    if (!input.supplierId) {
        throw httpError(400, "INVALID_SUPPLIER", "Fornecedor obrigatório");
    }
    const supplierNumber = String(input.supplierNumber ?? "").trim();
    if (!supplierNumber) {
        throw httpError(
            400,
            "INVALID_SUPPLIER_NUMBER",
            "Número do fornecedor obrigatório",
        );
    }

    const issuedAt = parseStrictDateOnly(input.issuedAt, {
        code: "INVALID_DATE",
        field: "Data de emissão",
    });
    const dueDate = parseOptionalStrictDateOnly(input.dueDate, {
        code: "INVALID_DUE_DATE",
        field: "Data de vencimento",
    });
    if (dueDate && dueDate < issuedAt) {
        throw httpError(
            400,
            "DUE_DATE_BEFORE_ISSUE_DATE",
            "A data de vencimento não pode ser anterior à data de emissão",
        );
    }
    const lines = Array.isArray(input.lines) ? input.lines.map(parseLine) : [];
    if (lines.length === 0) {
        throw httpError(400, "EMPTY_LINES", "Documento sem linhas");
    }

    return prisma.$transaction(async (tx) => {
        await acquireTransactionLock(tx, "fiscal", companyId);
        await assertOpenFiscalPeriod(tx, { companyId, documentDate: issuedAt });
        const supplier = await tx.supplier.findFirst({
            where: { id: input.supplierId, companyId, isActive: true },
        });
        if (!supplier) {
            throw httpError(
                404,
                "SUPPLIER_NOT_FOUND",
                "Fornecedor não encontrado",
            );
        }

        const itemIds = [...new Set(lines.map((line) => line.itemId))];
        const vatRateIds = [...new Set(lines.map((line) => line.vatRateId))];
        const items = await tx.item.findMany({
            where: { id: { in: itemIds }, companyId, isActive: true },
        });
        const vatRates = await tx.vatRate.findMany({
            where: { id: { in: vatRateIds }, companyId, isActive: true },
        });
        const itemById = new Map(items.map((item) => [item.id, item]));
        const vatById = new Map(vatRates.map((rate) => [rate.id, rate]));

        const computedLines = lines.map((line) => {
            const item = itemById.get(line.itemId);
            const vatRate = vatById.get(line.vatRateId);
            if (!item) {
                throw httpError(
                    400,
                    "ITEM_NOT_FOUND",
                    "Artigo inválido para esta empresa",
                );
            }
            if (!vatRate) {
                throw httpError(
                    400,
                    "VAT_RATE_NOT_FOUND",
                    "Taxa de IVA inválida",
                );
            }

            const subtotalCents = line.quantity * line.unitCostCents;
            const vatCents = Math.round((subtotalCents * vatRate.rateBps) / 10000);
            return {
                ...line,
                description: line.description || item.name,
                subtotalCents,
                vatCents,
                totalCents: subtotalCents + vatCents,
            };
        });
        const subtotalCents = computedLines.reduce(
            (sum, line) => sum + line.subtotalCents,
            0,
        );
        const vatCents = computedLines.reduce(
            (sum, line) => sum + line.vatCents,
            0,
        );

        try {
            const document = await tx.purchaseDocument.create({
                data: {
                    companyId,
                    supplierId: supplier.id,
                    kind,
                    status: "DRAFT",
                    supplierNumber,
                    issuedAt,
                    dueDate,
                    subtotalCents,
                    vatCents,
                    totalCents: subtotalCents + vatCents,
                    createdById: userId,
                    lines: { create: computedLines },
                },
                include: { supplier: true, lines: true },
            });
            await tx.auditLog.create({
                data: {
                    companyId,
                    userId,
                    action: "PURCHASE_DOCUMENT_CREATED",
                    entity: "PurchaseDocument",
                    entityId: document.id,
                    details: {
                        supplierId: supplier.id,
                        supplierNumber,
                        status: "DRAFT",
                        totalCents: document.totalCents,
                    },
                },
            });
            return document;
        } catch (error) {
            if (error.code === "P2002") {
                throw httpError(
                    409,
                    "PURCHASE_DOCUMENT_EXISTS",
                    "Número de fornecedor já existe nesta empresa",
                );
            }
            throw error;
        }
    });
}
