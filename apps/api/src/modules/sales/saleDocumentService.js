/**
 * @file Service de documentos de venda da MF1.
 */

import { httpError } from "../../lib/httpErrors.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

const saleKinds = new Set(["INVOICE", "INVOICE_RECEIPT", "CREDIT_NOTE"]);

/**
 * Converte valor de data para `Date` válida.
 *
 * @param {unknown} value - Valor recebido.
 * @param {string} field - Nome funcional do campo.
 * @returns {Date} Data validada.
 */
function toDate(value, field) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_DATE", `${field} inválida`);
    }
    return date;
}

/**
 * Valida linha de venda recebida no payload.
 *
 * @param {unknown} line - Linha JSON.
 * @returns {{ itemId: string, vatRateId: string, description: string, quantity: number, unitPriceCents: number }} Linha normalizada.
 */
function parseLine(line) {
    if (!line || typeof line !== "object") {
        throw httpError(400, "INVALID_LINE", "Linha inválida");
    }

    const quantity = Number(line.quantity);
    const unitPriceCents = Number(line.unitPriceCents);
    if (!line.itemId) {
        throw httpError(400, "INVALID_ITEM", "Artigo obrigatório");
    }
    if (!line.vatRateId) {
        throw httpError(400, "INVALID_VAT", "Taxa de IVA obrigatória");
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw httpError(400, "INVALID_QUANTITY", "Quantidade inválida");
    }
    if (!Number.isInteger(unitPriceCents) || unitPriceCents < 0) {
        throw httpError(400, "INVALID_PRICE", "Preço inválido");
    }

    return {
        itemId: String(line.itemId),
        vatRateId: String(line.vatRateId),
        description: String(line.description ?? "").trim(),
        quantity,
        unitPriceCents,
    };
}

/**
 * Gera o próximo número sequencial de venda dentro da transação de emissão.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} kind - Tipo de documento.
 * @param {Date} issuedAt - Data de emissão.
 * @returns {Promise<string>} Número definitivo.
 */
async function nextSaleNumber(tx, companyId, kind, issuedAt) {
    const year = issuedAt.getUTCFullYear();
    const scope = `SALE_${kind}`;
    const prefix = `${kind}-${year}-`;
    const sequence = await tx.numberSequence.upsert({
        where: { companyId_scope_year: { companyId, scope, year } },
        create: { companyId, scope, year, prefix, nextValue: 2 },
        update: { nextValue: { increment: 1 } },
    });

    const reservedValue = sequence.nextValue - 1;
    return `${sequence.prefix}${String(reservedValue).padStart(6, "0")}`;
}

/**
 * Lista documentos de venda da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<object[]>} Documentos de venda.
 */
export async function listSaleDocuments(prisma, companyId) {
    return prisma.saleDocument.findMany({
        where: { companyId },
        include: { customer: true, lines: true },
        orderBy: { issuedAt: "desc" },
    });
}

/**
 * Cria documento de venda em rascunho com totais calculados no backend.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {unknown} input - Payload JSON.
 * @returns {Promise<object>} Documento criado.
 */
export async function createSaleDocument(prisma, companyId, userId, input) {
    if (!input || typeof input !== "object") {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const kind = String(input.kind ?? "").toUpperCase();
    if (!saleKinds.has(kind)) {
        throw httpError(400, "INVALID_KIND", "Tipo de documento inválido");
    }
    if (!input.customerId) {
        throw httpError(400, "INVALID_CUSTOMER", "Cliente obrigatório");
    }

    const issuedAt = toDate(input.issuedAt, "issuedAt");
    const dueDate = input.dueDate ? toDate(input.dueDate, "dueDate") : null;
    const lines = Array.isArray(input.lines) ? input.lines.map(parseLine) : [];
    if (lines.length === 0) {
        throw httpError(400, "EMPTY_LINES", "Documento sem linhas");
    }

    await assertOpenFiscalPeriod(prisma, { companyId, documentDate: issuedAt });

    return prisma.$transaction(async (tx) => {
        const customer = await tx.customer.findFirst({
            where: { id: input.customerId, companyId, isActive: true },
        });
        if (!customer) {
            throw httpError(404, "CUSTOMER_NOT_FOUND", "Cliente não encontrado");
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

            const subtotalCents = line.quantity * line.unitPriceCents;
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
        const totalCents = subtotalCents + vatCents;

        const document = await tx.saleDocument.create({
            data: {
                companyId,
                customerId: customer.id,
                kind,
                status: "DRAFT",
                number: null,
                issuedAt,
                dueDate,
                subtotalCents,
                vatCents,
                totalCents,
                amountPaidCents: 0,
                createdById: userId,
                lines: { create: computedLines },
            },
            include: { customer: true, lines: true },
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

/**
 * Emite definitivamente um documento de venda aprovado.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} id - Documento alvo.
 * @returns {Promise<object>} Documento emitido.
 */
export async function issueSaleDocument(prisma, companyId, userId, id) {
    return prisma.$transaction(async (tx) => {
        const document = await tx.saleDocument.findFirst({
            where: { id, companyId },
            include: { lines: true },
        });
        if (!document) {
            throw httpError(
                404,
                "SALE_DOCUMENT_NOT_FOUND",
                "Documento de venda não encontrado",
            );
        }
        if (document.status !== "APPROVED") {
            throw httpError(
                409,
                "INVALID_STATUS",
                "Apenas documentos aprovados podem ser emitidos",
            );
        }
        if (document.number) {
            throw httpError(
                409,
                "DOCUMENT_ALREADY_ISSUED",
                "Documento já emitido",
            );
        }

        await assertOpenFiscalPeriod(tx, {
            companyId,
            documentDate: document.issuedAt,
        });

        const settled = document.kind === "INVOICE_RECEIPT";
        const issuedAt = new Date();

        const claimed = await tx.saleDocument.updateMany({
            where: {
                id: document.id,
                companyId,
                status: "APPROVED",
                number: null,
            },
            data: {
                status: settled ? "SETTLED" : "ISSUED",
                amountPaidCents: settled
                    ? document.totalCents
                    : document.amountPaidCents,
                issuedById: userId,
                issuedDefinitiveAt: issuedAt,
            },
        });
        if (claimed.count !== 1) {
            throw httpError(
                409,
                "DOCUMENT_ALREADY_ISSUED",
                "Documento já foi emitido por outra operação",
            );
        }

        const number = await nextSaleNumber(
            tx,
            companyId,
            document.kind,
            document.issuedAt,
        );
        const issued = await tx.saleDocument.update({
            where: { id: document.id },
            data: { number },
            include: { customer: true, lines: true },
        });

        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "SALE_DOCUMENT_ISSUED",
                entity: "SaleDocument",
                entityId: issued.id,
                details: {
                    number,
                    status: issued.status,
                    totalCents: issued.totalCents,
                },
            },
        });

        return issued;
    });
}
