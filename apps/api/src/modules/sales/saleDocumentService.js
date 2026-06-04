import { httpError } from "../../lib/httpErrors.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

const saleKinds = new Set(["INVOICE", "INVOICE_RECEIPT", "CREDIT_NOTE"]);

function toDate(value, field) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw httpError(400, "INVALID_DATE", field + " inválida");
    return date;
}

function parseLine(line) {
    const quantity = Number(line.quantity);
    const unitPriceCents = Number(line.unitPriceCents);
    if (!line.itemId) throw httpError(400, "INVALID_ITEM", "Artigo obrigatório");
    if (!line.vatRateId) throw httpError(400, "INVALID_VAT", "Taxa de IVA obrigatória");
    if (!Number.isInteger(quantity) || quantity <= 0) throw httpError(400, "INVALID_QUANTITY", "Quantidade inválida");
    if (!Number.isInteger(unitPriceCents) || unitPriceCents < 0) throw httpError(400, "INVALID_PRICE", "Preço inválido");
    return { itemId: line.itemId, vatRateId: line.vatRateId, description: String(line.description ?? "").trim(), quantity, unitPriceCents };
}

async function nextSaleNumber(tx, companyId, kind, issuedAt) {
    const year = issuedAt.getUTCFullYear();
    const scope = "SALE_" + kind;
    const prefix = kind + "-" + year + "-";
    const sequence = await tx.numberSequence.findUnique({ where: { companyId_scope_year: { companyId, scope, year } } });

    // A sequência só avança dentro da transação que emite o documento definitivo.
    if (!sequence) {
        await tx.numberSequence.create({ data: { companyId, scope, year, prefix, nextValue: 2 } });
        return prefix + "000001";
    }

    await tx.numberSequence.update({ where: { id: sequence.id }, data: { nextValue: { increment: 1 } } });
    return sequence.prefix + String(sequence.nextValue).padStart(6, "0");
}

export async function createSaleDocument(prisma, companyId, userId, input) {
    if (!input || typeof input !== "object") throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    const kind = String(input.kind ?? "").toUpperCase();
    if (!saleKinds.has(kind)) throw httpError(400, "INVALID_KIND", "Tipo de documento inválido");
    if (!input.customerId) throw httpError(400, "INVALID_CUSTOMER", "Cliente obrigatório");
    const issuedAt = toDate(input.issuedAt, "issuedAt");
    const dueDate = input.dueDate ? toDate(input.dueDate, "dueDate") : null;
    const lines = Array.isArray(input.lines) ? input.lines.map(parseLine) : [];
    if (lines.length === 0) throw httpError(400, "EMPTY_LINES", "Documento sem linhas");

    await assertOpenFiscalPeriod(prisma, { companyId, documentDate: issuedAt });

    return prisma.$transaction(async (tx) => {
        const customer = await tx.customer.findFirst({ where: { id: input.customerId, companyId, isActive: true } });
        if (!customer) throw httpError(404, "CUSTOMER_NOT_FOUND", "Cliente não encontrado");

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
            const subtotalCents = line.quantity * line.unitPriceCents;
            const vatCents = Math.round(subtotalCents * vatRate.rateBps / 10000);
            return { ...line, subtotalCents, vatCents, totalCents: subtotalCents + vatCents };
        });
        const subtotalCents = computedLines.reduce((sum, line) => sum + line.subtotalCents, 0);
        const vatCents = computedLines.reduce((sum, line) => sum + line.vatCents, 0);
        const totalCents = subtotalCents + vatCents;
        const document = await tx.saleDocument.create({
            data: { companyId, customerId: customer.id, kind, status: "DRAFT", number: null, issuedAt, dueDate, subtotalCents, vatCents, totalCents, amountPaidCents: 0, createdById: userId, lines: { create: computedLines } },
            include: { lines: true, customer: true },
        });
        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "SALE_DOCUMENT_CREATED",
                entity: "SaleDocument",
                entityId: document.id,
                details: { kind, customerId: customer.id, totalCents },
            },
        });
        return document;
    });
}

export async function issueSaleDocument(prisma, companyId, userId, id) {
    return prisma.$transaction(async (tx) => {
        const document = await tx.saleDocument.findFirst({ where: { id, companyId }, include: { lines: true } });
        if (!document) throw httpError(404, "SALE_DOCUMENT_NOT_FOUND", "Documento de venda não encontrado");
        // Neste BK, a emissão parte de rascunho. O BK-MF1-06 acrescenta o fluxo de aprovação e aperta esta regra para APPROVED.
        if (document.status !== "DRAFT") throw httpError(409, "INVALID_STATUS", "Apenas rascunhos podem ser emitidos neste fluxo");
        if (document.number) throw httpError(409, "DOCUMENT_ALREADY_ISSUED", "Documento já emitido");
        await assertOpenFiscalPeriod(tx, { companyId, documentDate: document.issuedAt });

        const number = await nextSaleNumber(tx, companyId, document.kind, document.issuedAt);
        const settled = document.kind === "INVOICE_RECEIPT";

        const issued = await tx.saleDocument.update({
            where: { id: document.id },
            data: {
                number,
                status: settled ? "SETTLED" : "ISSUED",
                amountPaidCents: settled ? document.totalCents : document.amountPaidCents,
                issuedById: userId,
                issuedDefinitiveAt: new Date(),
            },
            include: { lines: true, customer: true },
        });
        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "SALE_DOCUMENT_ISSUED",
                entity: "SaleDocument",
                entityId: issued.id,
                details: { number, status: issued.status, totalCents: issued.totalCents },
            },
        });
        return issued;
    });
}