import { httpError } from "../../lib/httpErrors.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

const kinds = new Set(["SUPPLIER_INVOICE", "SUPPLIER_CREDIT_NOTE"]);

function parseLine(line) {
    const quantity = Number(line.quantity);
    const unitCostCents = Number(line.unitCostCents);
    if (!line.itemId) throw httpError(400, "INVALID_ITEM", "Artigo obrigatório");
    if (!line.vatRateId) throw httpError(400, "INVALID_VAT", "Taxa de IVA obrigatória");
    if (!Number.isInteger(quantity) || quantity <= 0) throw httpError(400, "INVALID_QUANTITY", "Quantidade inválida");
    if (!Number.isInteger(unitCostCents) || unitCostCents < 0) throw httpError(400, "INVALID_COST", "Custo inválido");
    return { itemId: line.itemId, vatRateId: line.vatRateId, description: String(line.description ?? "").trim(), quantity, unitCostCents };
}

export async function createPurchaseDocument(prisma, companyId, userId, input) {
    if (!input || typeof input !== "object") throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    const kind = String(input.kind ?? "").toUpperCase();
    if (!kinds.has(kind)) throw httpError(400, "INVALID_KIND", "Tipo de compra inválido");
    const supplierNumber = String(input.supplierNumber ?? "").trim();
    if (!supplierNumber) throw httpError(400, "INVALID_SUPPLIER_NUMBER", "Numero do fornecedor obrigatório");
    const issuedAt = new Date(input.issuedAt);
    if (Number.isNaN(issuedAt.getTime())) throw httpError(400, "INVALID_DATE", "Data inválida");
    const dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (dueDate && Number.isNaN(dueDate.getTime())) throw httpError(400, "INVALID_DUE_DATE", "Data de vencimento inválida");
    const lines = Array.isArray(input.lines) ? input.lines.map(parseLine) : [];
    if (lines.length === 0) throw httpError(400, "EMPTY_LINES", "Documento sem linhas");
    await assertOpenFiscalPeriod(prisma, { companyId, documentDate: issuedAt });

    return prisma.$transaction(async (tx) => {
        const supplier = await tx.supplier.findFirst({ where: { id: input.supplierId, companyId, isActive: true } });
        if (!supplier) throw httpError(404, "SUPPLIER_NOT_FOUND", "Fornecedor não encontrado");
        const itemIds = [...new Set(lines.map((line) => line.itemId))];
        const vatRateIds = [...new Set(lines.map((line) => line.vatRateId))];
        const items = await tx.item.findMany({ where: { id: { in: itemIds }, companyId, isActive: true } });
        const vatRates = await tx.vatRate.findMany({ where: { id: { in: vatRateIds }, companyId, isActive: true } });
        const itemById = new Map(items.map((item) => [item.id, item]));
        const vatById = new Map(vatRates.map((rate) => [rate.id, rate]));
        const computedLines = lines.map((line) => {
            const item = itemById.get(line.itemId);
            const vatRate = vatById.get(line.vatRateId);
            if (!item) throw httpError(400, "ITEM_NOT_FOUND", "Artigo inválido para esta empresa");
            if (!vatRate) throw httpError(400, "VAT_RATE_NOT_FOUND", "Taxa de IVA inválida");
            const subtotalCents = line.quantity * line.unitCostCents;
            const vatCents = Math.round(subtotalCents * vatRate.rateBps / 10000);
            return { ...line, subtotalCents, vatCents, totalCents: subtotalCents + vatCents };
        });
        const subtotalCents = computedLines.reduce((sum, line) => sum + line.subtotalCents, 0);
        const vatCents = computedLines.reduce((sum, line) => sum + line.vatCents, 0);

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
                    details: { supplierId: supplier.id, supplierNumber, status: "DRAFT", totalCents: document.totalCents },
                },
            });
            return document;
        } catch (error) {
            if (error.code === "P2002") throw httpError(409, "PURCHASE_DOCUMENT_EXISTS", "Número de fornecedor já existe nesta empresa");
            throw error;
        }
    });
}