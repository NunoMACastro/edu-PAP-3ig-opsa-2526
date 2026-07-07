/**
 * @file Testes unitários autocontidos para regras críticas da MF1.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { validateVatRateInput } from "../../src/modules/vat-rates/vatRateService.js";
import {
    createSaleDocument,
    issueSaleDocument,
} from "../../src/modules/sales/saleDocumentService.js";
import { registerReceipt } from "../../src/modules/receipts/receiptService.js";
import { postSaleDocument } from "../../src/modules/accounting/salePostingService.js";
import { listSalesOpenItems } from "../../src/modules/open-items/salesOpenItemsService.js";
import { createPurchaseDocument } from "../../src/modules/purchases/purchaseDocumentService.js";
import { registerPayment } from "../../src/modules/payments/paymentService.js";
import { postPurchaseDocument } from "../../src/modules/accounting/purchasePostingService.js";
import {
    approvePurchaseDocument,
    markPurchaseDocumentPosted,
} from "../../src/modules/purchase-approval/purchaseApprovalService.js";

/**
 * Cria um período fiscal aberto reutilizado pelos testes de serviços MF1.
 *
 * @returns Período fiscal aberto criado para os testes.
 */
function openFiscalPeriod() {
    return {
        id: "period-1",
        status: "OPEN",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-12-31"),
    };
}

test("BK-MF1-01: IVA isento exige motivo de isenção", () => {
    assert.throws(
        () =>
            validateVatRateInput({
                code: "ISE",
                description: "Isento",
                rateBps: 0,
                type: "EXEMPT",
            }),
        { code: "MISSING_EXEMPTION_REASON" },
    );
});

test("BK-MF1-02: venda calcula totais no backend e usa companyId do contexto", async () => {
    let saleCreateData;
    const prisma = {
        fiscalPeriod: { findFirst: async () => openFiscalPeriod() },
        customer: {
            findFirst: async ({ where }) =>
                where.companyId === "company-1" ? { id: "customer-1" } : null,
        },
        item: {
            findMany: async () => [{ id: "item-1", name: "Servico" }],
        },
        vatRate: {
            findMany: async () => [{ id: "vat-1", rateBps: 2300 }],
        },
        saleDocument: {
            create: async ({ data }) => {
                saleCreateData = data;
                return {
                    id: "sale-1",
                    ...data,
                    customer: { id: data.customerId },
                    lines: data.lines.create,
                };
            },
        },
        auditLog: { create: async () => ({ id: "audit-1" }) },
        $transaction: async (callback) => callback(prisma),
    };

    const document = await createSaleDocument(prisma, "company-1", "user-1", {
        kind: "INVOICE",
        customerId: "customer-1",
        issuedAt: "2026-02-10",
        lines: [
            {
                itemId: "item-1",
                vatRateId: "vat-1",
                quantity: 2,
                unitPriceCents: 1000,
            },
        ],
    });

    assert.equal(saleCreateData.companyId, "company-1");
    assert.equal(document.subtotalCents, 2000);
    assert.equal(document.vatCents, 460);
    assert.equal(document.totalCents, 2460);
    assert.equal(document.status, "DRAFT");
});

test("BK-MF1-06: emissão definitiva exige venda aprovada", async () => {
    const prisma = {
        saleDocument: {
            findFirst: async () => ({
                id: "sale-1",
                companyId: "company-1",
                status: "DRAFT",
            }),
        },
        $transaction: async (callback) => callback(prisma),
    };

    await assert.rejects(
        () => issueSaleDocument(prisma, "company-1", "user-1", "sale-1"),
        { code: "INVALID_STATUS" },
    );
});

test("BK-MF1-02: emissão definitiva reserva número por upsert atómico", async () => {
    let sequenceArgs;
    let claimData;
    let updateData;
    const issuedAt = new Date("2026-02-10T00:00:00.000Z");
    const prisma = {
        fiscalPeriod: { findFirst: async () => openFiscalPeriod() },
        numberSequence: {
            upsert: async (args) => {
                sequenceArgs = args;
                return {
                    id: "sequence-1",
                    companyId: "company-1",
                    scope: "SALE_INVOICE",
                    year: 2026,
                    prefix: "INVOICE-2026-",
                    nextValue: 43,
                };
            },
        },
        saleDocument: {
            findFirst: async () => ({
                id: "sale-1",
                companyId: "company-1",
                kind: "INVOICE",
                status: "APPROVED",
                number: null,
                issuedAt,
                totalCents: 1000,
                amountPaidCents: 0,
                lines: [],
            }),
            updateMany: async ({ data }) => {
                claimData = data;
                return { count: 1 };
            },
            update: async ({ data }) => {
                updateData = data;
                return {
                    id: "sale-1",
                    status: "ISSUED",
                    totalCents: 1000,
                    ...data,
                };
            },
        },
        auditLog: { create: async () => ({ id: "audit-1" }) },
        $transaction: async (callback) => callback(prisma),
    };

    const document = await issueSaleDocument(
        prisma,
        "company-1",
        "user-1",
        "sale-1",
    );

    assert.deepEqual(sequenceArgs.where, {
        companyId_scope_year: {
            companyId: "company-1",
            scope: "SALE_INVOICE",
            year: 2026,
        },
    });
    assert.equal(sequenceArgs.create.nextValue, 2);
    assert.deepEqual(sequenceArgs.update, { nextValue: { increment: 1 } });
    assert.equal(claimData.status, "ISSUED");
    assert.equal(updateData.number, "INVOICE-2026-000042");
    assert.equal(document.number, "INVOICE-2026-000042");
});

test("BK-MF1-02: emissão concorrente não reserva número sem claim do documento", async () => {
    const prisma = {
        fiscalPeriod: { findFirst: async () => openFiscalPeriod() },
        numberSequence: {
            upsert: async () => {
                throw new Error("sequence must not be reserved after failed claim");
            },
        },
        saleDocument: {
            findFirst: async () => ({
                id: "sale-1",
                companyId: "company-1",
                kind: "INVOICE",
                status: "APPROVED",
                number: null,
                issuedAt: new Date("2026-02-10T00:00:00.000Z"),
                totalCents: 1000,
                amountPaidCents: 0,
                lines: [],
            }),
            updateMany: async () => ({ count: 0 }),
        },
        $transaction: async (callback) => callback(prisma),
    };

    await assert.rejects(
        () => issueSaleDocument(prisma, "company-1", "user-1", "sale-1"),
        { code: "DOCUMENT_ALREADY_ISSUED" },
    );
});

test("BK-MF1-03: recebimento não pode exceder montante em aberto", async () => {
    const prisma = {
        fiscalPeriod: { findFirst: async () => openFiscalPeriod() },
        saleDocument: {
            findFirst: async () => ({
                id: "sale-1",
                companyId: "company-1",
                kind: "INVOICE",
                status: "ISSUED",
                totalCents: 1000,
                amountPaidCents: 800,
            }),
        },
        $transaction: async (callback) => callback(prisma),
    };

    await assert.rejects(
        () =>
            registerReceipt(
                prisma,
                "company-1",
                "user-1",
                "sale-1",
                {
                    amountCents: 300,
                    receivedAt: "2026-02-11",
                    method: "BANK_TRANSFER",
                },
            ),
        { code: "AMOUNT_EXCEEDS_OPEN" },
    );
});

test("BK-MF1-03: recebimento rejeita saldo alterado em concorrência", async () => {
    const prisma = {
        fiscalPeriod: { findFirst: async () => openFiscalPeriod() },
        saleDocument: {
            findFirst: async () => ({
                id: "sale-1",
                companyId: "company-1",
                kind: "INVOICE",
                status: "ISSUED",
                totalCents: 1000,
                amountPaidCents: 0,
            }),
            updateMany: async ({ where, data }) => {
                assert.equal(where.amountPaidCents, 0);
                assert.deepEqual(data.amountPaidCents, { increment: 700 });
                return { count: 0 };
            },
        },
        receipt: {
            create: async () => {
                throw new Error("receipt must not be created after stale balance");
            },
        },
        $transaction: async (callback) => callback(prisma),
    };

    await assert.rejects(
        () =>
            registerReceipt(
                prisma,
                "company-1",
                "user-1",
                "sale-1",
                {
                    amountCents: 700,
                    receivedAt: "2026-02-11",
                    method: "BANK_TRANSFER",
                },
            ),
        { code: "STALE_BALANCE" },
    );
});

test("BK-MF1-04: lançamento de venda fica balanceado", async () => {
    let journalData;
    const accounts = {
        211: { id: "account-customer" },
        72: { id: "account-revenue" },
        2433: { id: "account-vat" },
    };
    const prisma = {
        fiscalPeriod: { findFirst: async () => openFiscalPeriod() },
        saleDocument: {
            findFirst: async () => ({
                id: "sale-1",
                kind: "INVOICE",
                status: "ISSUED",
                number: "INVOICE-2026-000001",
                issuedAt: new Date("2026-02-10"),
                subtotalCents: 1000,
                vatCents: 230,
                totalCents: 1230,
                lines: [],
            }),
        },
        account: {
            findFirst: async ({ where }) => accounts[where.code],
        },
        journalEntry: {
            create: async ({ data }) => {
                journalData = data;
                return { id: "entry-1", ...data, lines: data.lines.create };
            },
        },
        auditLog: { create: async () => ({ id: "audit-1" }) },
        $transaction: async (callback) => callback(prisma),
    };

    await postSaleDocument(prisma, "company-1", "user-1", "sale-1");

    const debit = journalData.lines.create.reduce(
        (sum, line) => sum + line.debitCents,
        0,
    );
    const credit = journalData.lines.create.reduce(
        (sum, line) => sum + line.creditCents,
        0,
    );
    assert.equal(debit, 1230);
    assert.equal(credit, 1230);
});

test("BK-MF1-05: títulos em aberto calculam antiguidade e ignoram liquidados", async () => {
    const prisma = {
        saleDocument: {
            findMany: async () => [
                {
                    id: "sale-1",
                    number: "INVOICE-2026-000001",
                    customer: { name: "Cliente A" },
                    issuedAt: new Date("2026-01-01"),
                    dueDate: new Date("2026-01-31"),
                    totalCents: 1000,
                    amountPaidCents: 250,
                },
                {
                    id: "sale-2",
                    number: "INVOICE-2026-000002",
                    customer: { name: "Cliente B" },
                    issuedAt: new Date("2026-01-01"),
                    dueDate: new Date("2026-01-15"),
                    totalCents: 500,
                    amountPaidCents: 500,
                },
            ],
        },
    };

    const items = await listSalesOpenItems(prisma, "company-1", {
        asOfDate: "2026-03-05",
    });

    assert.equal(items.length, 1);
    assert.equal(items[0].openAmountCents, 750);
    assert.equal(items[0].bucket, "DAYS_31_60");
});

test("BK-MF1-07/BK-MF1-10: compra nasce em rascunho com totais backend", async () => {
    let purchaseCreateData;
    const prisma = {
        fiscalPeriod: { findFirst: async () => openFiscalPeriod() },
        supplier: {
            findFirst: async () => ({ id: "supplier-1" }),
        },
        item: {
            findMany: async () => [{ id: "item-1", name: "Material" }],
        },
        vatRate: {
            findMany: async () => [{ id: "vat-1", rateBps: 2300 }],
        },
        purchaseDocument: {
            create: async ({ data }) => {
                purchaseCreateData = data;
                return {
                    id: "purchase-1",
                    ...data,
                    supplier: { id: data.supplierId },
                    lines: data.lines.create,
                };
            },
        },
        auditLog: { create: async () => ({ id: "audit-1" }) },
        $transaction: async (callback) => callback(prisma),
    };

    const document = await createPurchaseDocument(
        prisma,
        "company-1",
        "user-1",
        {
            kind: "SUPPLIER_INVOICE",
            supplierId: "supplier-1",
            supplierNumber: "F2026-1",
            issuedAt: "2026-02-10",
            lines: [
                {
                    itemId: "item-1",
                    vatRateId: "vat-1",
                    quantity: 1,
                    unitCostCents: 1000,
                },
            ],
        },
    );

    assert.equal(purchaseCreateData.companyId, "company-1");
    assert.equal(document.status, "DRAFT");
    assert.equal(document.totalCents, 1230);
});

test("BK-MF1-08: pagamento rejeita compra ainda em rascunho", async () => {
    const prisma = {
        fiscalPeriod: { findFirst: async () => openFiscalPeriod() },
        purchaseDocument: {
            findFirst: async () => ({
                id: "purchase-1",
                status: "DRAFT",
                kind: "SUPPLIER_INVOICE",
                totalCents: 1000,
                amountPaidCents: 0,
            }),
        },
        $transaction: async (callback) => callback(prisma),
    };

    await assert.rejects(
        () =>
            registerPayment(
                prisma,
                "company-1",
                "user-1",
                "purchase-1",
                {
                    amountCents: 100,
                    paidAt: "2026-02-11",
                    method: "CASH",
                },
            ),
        { code: "INVALID_STATUS" },
    );
});

test("BK-MF1-08: pagamento rejeita saldo alterado em concorrência", async () => {
    const prisma = {
        fiscalPeriod: { findFirst: async () => openFiscalPeriod() },
        purchaseDocument: {
            findFirst: async () => ({
                id: "purchase-1",
                companyId: "company-1",
                kind: "SUPPLIER_INVOICE",
                status: "APPROVED",
                totalCents: 1000,
                amountPaidCents: 200,
            }),
            updateMany: async ({ where, data }) => {
                assert.equal(where.amountPaidCents, 200);
                assert.deepEqual(data.amountPaidCents, { increment: 500 });
                return { count: 0 };
            },
        },
        payment: {
            create: async () => {
                throw new Error("payment must not be created after stale balance");
            },
        },
        $transaction: async (callback) => callback(prisma),
    };

    await assert.rejects(
        () =>
            registerPayment(
                prisma,
                "company-1",
                "user-1",
                "purchase-1",
                {
                    amountCents: 500,
                    paidAt: "2026-02-11",
                    method: "CASH",
                },
            ),
        { code: "STALE_BALANCE" },
    );
});

test("BK-MF1-08: pagamento total não altera estado contabilístico da compra", async () => {
    let paymentUpdateData;
    const prisma = {
        fiscalPeriod: { findFirst: async () => openFiscalPeriod() },
        purchaseDocument: {
            findFirst: async () => ({
                id: "purchase-1",
                companyId: "company-1",
                kind: "SUPPLIER_INVOICE",
                status: "APPROVED",
                totalCents: 1000,
                amountPaidCents: 200,
            }),
            updateMany: async ({ data }) => {
                paymentUpdateData = data;
                return { count: 1 };
            },
        },
        payment: {
            create: async ({ data }) => ({ id: "payment-1", ...data }),
        },
        auditLog: { create: async () => ({ id: "audit-1" }) },
        $transaction: async (callback) => callback(prisma),
    };

    await registerPayment(prisma, "company-1", "user-1", "purchase-1", {
        amountCents: 800,
        paidAt: "2026-02-11",
        method: "CASH",
    });

    assert.deepEqual(paymentUpdateData.amountPaidCents, { increment: 800 });
    assert.equal("status" in paymentUpdateData, false);
});

test("BK-MF1-09: lançamento de compra fica balanceado", async () => {
    let journalData;
    const auditEntities = [];
    const accounts = {
        62: { id: "account-expense" },
        2432: { id: "account-vat" },
        221: { id: "account-supplier" },
    };
    const prisma = {
        fiscalPeriod: { findFirst: async () => openFiscalPeriod() },
        purchaseDocument: {
            findFirst: async () => ({
                id: "purchase-1",
                kind: "SUPPLIER_INVOICE",
                status: "APPROVED",
                supplierNumber: "F2026-1",
                issuedAt: new Date("2026-02-10"),
                subtotalCents: 1000,
                vatCents: 230,
                totalCents: 1230,
                lines: [],
            }),
            update: async () => ({ id: "purchase-1", status: "POSTED" }),
        },
        account: {
            findFirst: async ({ where }) => accounts[where.code],
        },
        journalEntry: {
            create: async ({ data }) => {
                journalData = data;
                return { id: "entry-1", ...data, lines: data.lines.create };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                auditEntities.push(data.entity);
                return { id: `audit-${auditEntities.length}` };
            },
        },
        $transaction: async (callback) => callback(prisma),
    };

    await postPurchaseDocument(prisma, "company-1", "user-1", "purchase-1");

    const debit = journalData.lines.create.reduce(
        (sum, line) => sum + line.debitCents,
        0,
    );
    const credit = journalData.lines.create.reduce(
        (sum, line) => sum + line.creditCents,
        0,
    );
    assert.equal(debit, 1230);
    assert.equal(credit, 1230);
    assert.deepEqual(auditEntities, ["JournalEntry", "PurchaseDocument"]);
});

test("BK-MF1-10: compra paga pode ser lançada e termina em POSTED", async () => {
    let purchaseUpdateData;
    const accounts = {
        62: { id: "account-expense" },
        2432: { id: "account-vat" },
        221: { id: "account-supplier" },
    };
    const prisma = {
        fiscalPeriod: { findFirst: async () => openFiscalPeriod() },
        purchaseDocument: {
            findFirst: async () => ({
                id: "purchase-1",
                kind: "SUPPLIER_INVOICE",
                status: "PAID",
                supplierNumber: "F2026-1",
                issuedAt: new Date("2026-02-10"),
                subtotalCents: 1000,
                vatCents: 230,
                totalCents: 1230,
                lines: [],
            }),
            update: async ({ data }) => {
                purchaseUpdateData = data;
                return { id: "purchase-1", ...data };
            },
        },
        account: {
            findFirst: async ({ where }) => accounts[where.code],
        },
        journalEntry: {
            create: async ({ data }) => ({
                id: "entry-1",
                ...data,
                lines: data.lines.create,
            }),
        },
        auditLog: { create: async () => ({ id: "audit-1" }) },
        $transaction: async (callback) => callback(prisma),
    };

    await markPurchaseDocumentPosted(
        prisma,
        "company-1",
        "user-1",
        "purchase-1",
    );

    assert.equal(purchaseUpdateData.status, "POSTED");
});

test("BK-MF1-10: aprovação de compra só aceita rascunho", async () => {
    const prisma = {
        purchaseDocument: {
            findFirst: async () => ({
                id: "purchase-1",
                status: "POSTED",
            }),
        },
    };

    await assert.rejects(
        () => approvePurchaseDocument(prisma, "company-1", "user-1", "purchase-1"),
        { code: "INVALID_STATUS" },
    );
});
