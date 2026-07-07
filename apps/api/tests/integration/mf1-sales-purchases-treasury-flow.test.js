/**
 * @file Prova de integracao leve para os fluxos MF1 de recebimentos e pagamentos.
 *
 * O inventario BK-MF8-16 exige uma camada de integracao para MF1. Este teste
 * liga services reais a uma transacao in-memory controlada para provar que
 * recebimentos e pagamentos continuam separados, multiempresa e auditados.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { registerPayment } from "../../src/modules/payments/paymentService.js";
import { registerReceipt } from "../../src/modules/receipts/receiptService.js";

/**
 * Cria periodo fiscal aberto para os guards contabilisticos dos services.
 *
 * @param {string} companyId - Empresa ativa.
 * @returns {object} Periodo fiscal aberto.
 */
function openFiscalPeriod(companyId) {
    return {
        id: `period-${companyId}`,
        companyId,
        status: "OPEN",
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-12-31T23:59:59.999Z"),
    };
}

/**
 * Aplica incrementos Prisma simples usados pelos services MF1.
 *
 * @param {number} currentValue - Valor atual.
 * @param {unknown} operation - Operacao Prisma simulada.
 * @returns {number} Valor atualizado.
 */
function applyIncrement(currentValue, operation) {
    if (operation && typeof operation === "object" && Number.isInteger(operation.increment)) {
        return currentValue + operation.increment;
    }
    return Number(operation);
}

/**
 * Cria um cliente Prisma minimo para integrar services MF1 sem base real.
 *
 * @returns {object} Prisma fake e colecoes observaveis.
 */
function createMf1IntegrationPrisma() {
    const saleDocument = {
        id: "sale-1",
        companyId: "company-1",
        kind: "INVOICE",
        status: "ISSUED",
        totalCents: 2460,
        amountPaidCents: 0,
    };
    const purchaseDocument = {
        id: "purchase-1",
        companyId: "company-1",
        kind: "SUPPLIER_INVOICE",
        status: "APPROVED",
        totalCents: 1230,
        amountPaidCents: 0,
    };
    const receipts = [];
    const payments = [];
    const auditEntries = [];

    const prisma = {
        fiscalPeriod: {
            findFirst: async ({ where }) => {
                return where.companyId ? openFiscalPeriod(where.companyId) : null;
            },
        },
        saleDocument: {
            findFirst: async ({ where }) => {
                return where.id === saleDocument.id && where.companyId === saleDocument.companyId
                    ? { ...saleDocument }
                    : null;
            },
            updateMany: async ({ where, data }) => {
                if (
                    where.id !== saleDocument.id ||
                    where.companyId !== saleDocument.companyId ||
                    where.amountPaidCents !== saleDocument.amountPaidCents ||
                    where.status !== saleDocument.status
                ) {
                    return { count: 0 };
                }

                saleDocument.amountPaidCents = applyIncrement(
                    saleDocument.amountPaidCents,
                    data.amountPaidCents,
                );
                saleDocument.status = data.status ?? saleDocument.status;
                return { count: 1 };
            },
        },
        receipt: {
            create: async ({ data }) => {
                const receipt = { id: `receipt-${receipts.length + 1}`, ...data };
                receipts.push(receipt);
                return receipt;
            },
        },
        purchaseDocument: {
            findFirst: async ({ where }) => {
                return where.id === purchaseDocument.id && where.companyId === purchaseDocument.companyId
                    ? { ...purchaseDocument }
                    : null;
            },
            updateMany: async ({ where, data }) => {
                if (
                    where.id !== purchaseDocument.id ||
                    where.companyId !== purchaseDocument.companyId ||
                    where.amountPaidCents !== purchaseDocument.amountPaidCents ||
                    where.status !== purchaseDocument.status
                ) {
                    return { count: 0 };
                }

                purchaseDocument.amountPaidCents = applyIncrement(
                    purchaseDocument.amountPaidCents,
                    data.amountPaidCents,
                );
                return { count: 1 };
            },
        },
        payment: {
            create: async ({ data }) => {
                const payment = { id: `payment-${payments.length + 1}`, ...data };
                payments.push(payment);
                return payment;
            },
        },
        auditLog: {
            create: async ({ data }) => {
                auditEntries.push(data);
                return { id: `audit-${auditEntries.length}`, ...data };
            },
        },
        $transaction: async (callback) => callback(prisma),
    };

    return { prisma, saleDocument, purchaseDocument, receipts, payments, auditEntries };
}

test("MF1 integracao: recebimentos e pagamentos preservam empresa ativa e auditoria", async () => {
    const { prisma, saleDocument, purchaseDocument, receipts, payments, auditEntries } =
        createMf1IntegrationPrisma();

    const receipt = await registerReceipt(prisma, "company-1", "user-1", "sale-1", {
        amountCents: 2460,
        receivedAt: "2026-02-10",
        method: "BANK_TRANSFER",
    });
    const payment = await registerPayment(prisma, "company-1", "user-1", "purchase-1", {
        amountCents: 1230,
        paidAt: "2026-02-11",
        method: "BANK_TRANSFER",
    });

    assert.equal(receipt.companyId, "company-1");
    assert.equal(receipt.saleDocumentId, "sale-1");
    assert.equal(payment.companyId, "company-1");
    assert.equal(payment.purchaseDocumentId, "purchase-1");
    assert.equal(saleDocument.status, "SETTLED");
    assert.equal(saleDocument.amountPaidCents, 2460);
    assert.equal(purchaseDocument.status, "APPROVED");
    assert.equal(purchaseDocument.amountPaidCents, 1230);
    assert.equal(receipts.length, 1);
    assert.equal(payments.length, 1);
    assert.deepEqual(
        auditEntries.map((entry) => entry.action),
        ["RECEIPT_REGISTERED", "PAYMENT_REGISTERED"],
    );
});

test("MF1 negativo: companyId errado nao liquida documento de outra empresa", async () => {
    const { prisma } = createMf1IntegrationPrisma();

    await assert.rejects(
        () =>
            registerReceipt(prisma, "company-2", "user-1", "sale-1", {
                amountCents: 100,
                receivedAt: "2026-02-10",
                method: "BANK_TRANSFER",
            }),
        { code: "SALE_DOCUMENT_NOT_FOUND" },
    );
});
