/**
 * @file Testes focados do motor determinístico de risco por transação.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    analyzeTransaction,
    auditTransactionAnalysis,
    parseTransactionAnalysisInput,
    TRANSACTION_ANALYSIS_GUARDRAIL,
} from "../../src/modules/ai/transactionRiskService.js";

const COMPANY_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_COMPANY_ID = "22222222-2222-4222-8222-222222222222";
const SALE_ID = "33333333-3333-4333-8333-333333333333";
const PURCHASE_ID = "44444444-4444-4444-8444-444444444444";
const WAREHOUSE_ID = "55555555-5555-4555-8555-555555555555";
const ITEM_ID = "66666666-6666-4666-8666-666666666666";
const SALE_LINE_ID = "77777777-7777-4777-8777-777777777777";
const PURCHASE_LINE_ID = "88888888-8888-4888-8888-888888888888";
const CUSTOMER_ID = "99999999-9999-4999-8999-999999999999";
const SUPPLIER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const NOW = new Date("2026-07-14T12:00:00.000Z");

function item() {
    return { id: ITEM_ID, companyId: COMPANY_ID, sku: "PAP-01", name: "Produto PAP", type: "PRODUCT", costCents: 1_000 };
}

function saleDocument(overrides = {}) {
    return {
        id: SALE_ID,
        companyId: COMPANY_ID,
        customerId: CUSTOMER_ID,
        warehouseId: WAREHOUSE_ID,
        kind: "INVOICE",
        status: "ISSUED",
        number: "FT 2026/3",
        issuedAt: new Date("2026-07-14T00:00:00.000Z"),
        dueDate: new Date("2026-08-13T00:00:00.000Z"),
        subtotalCents: 4_000,
        vatCents: 920,
        totalCents: 4_920,
        amountPaidCents: 0,
        postedAt: null,
        customer: { id: CUSTOMER_ID, name: "Cliente PAP" },
        warehouse: { id: WAREHOUSE_ID, code: "PRINCIPAL", name: "Armazém principal" },
        lines: [{ id: SALE_LINE_ID, itemId: ITEM_ID, quantity: 2, unitPriceCents: 2_000, subtotalCents: 4_000, vatCents: 920, totalCents: 4_920, item: item(), vatRate: { rateBps: 2_300 } }],
        ...overrides,
    };
}

function purchaseDocument(overrides = {}) {
    return {
        id: PURCHASE_ID,
        companyId: COMPANY_ID,
        supplierId: SUPPLIER_ID,
        warehouseId: WAREHOUSE_ID,
        kind: "SUPPLIER_INVOICE",
        status: "APPROVED",
        supplierNumber: "FAC-PAP-1",
        issuedAt: new Date("2026-07-14T00:00:00.000Z"),
        dueDate: new Date("2026-08-13T00:00:00.000Z"),
        subtotalCents: 3_000,
        vatCents: 690,
        totalCents: 3_690,
        amountPaidCents: 0,
        postedAt: null,
        supplier: { id: SUPPLIER_ID, name: "Fornecedor PAP" },
        warehouse: { id: WAREHOUSE_ID, code: "PRINCIPAL", name: "Armazém principal" },
        lines: [{ id: PURCHASE_LINE_ID, itemId: ITEM_ID, quantity: 3, unitCostCents: 1_000, subtotalCents: 3_000, vatCents: 690, totalCents: 3_690, item: item(), vatRate: { rateBps: 2_300 } }],
        ...overrides,
    };
}

function createPrisma(options = {}) {
    const sale = options.sale ?? saleDocument();
    const purchase = options.purchase ?? purchaseDocument();
    const journal = options.journal ?? null;
    const automaticMovements = options.automaticMovements ?? [];
    const recentMovements = options.recentMovements ?? [
        { id: "out-1", companyId: COMPANY_ID, itemId: ITEM_ID, type: "EXIT", quantity: 1, fromWarehouseId: WAREHOUSE_ID, toWarehouseId: null, createdAt: new Date("2026-07-01T12:00:00.000Z") },
        { id: "out-2", companyId: COMPANY_ID, itemId: ITEM_ID, type: "EXIT", quantity: 1, fromWarehouseId: WAREHOUSE_ID, toWarehouseId: null, createdAt: new Date("2026-07-07T12:00:00.000Z") },
    ];
    const recentSales = options.recentSales ?? [sale, { ...sale, id: "sale-history-1", totalCents: 5_000 }, { ...sale, id: "sale-history-2", customerId: "customer-other", totalCents: 10_000 }];
    const recentPurchases = options.recentPurchases ?? [purchase, { ...purchase, id: "purchase-history-1", totalCents: 4_000, lines: [{ ...purchase.lines[0], unitCostCents: 800 }] }, { ...purchase, id: "purchase-history-2", supplierId: "supplier-other", totalCents: 8_000, lines: [{ ...purchase.lines[0], unitCostCents: 900 }] }];
    const counterpartySales = options.counterpartySales ?? recentSales.filter((entry) => entry.customerId === CUSTOMER_ID);
    const counterpartyPurchases = options.counterpartyPurchases ?? recentPurchases.filter((entry) => entry.supplierId === SUPPLIER_ID);
    let stockMovementQuery = 0;
    const prisma = {
        saleDocument: {
            findFirst: async ({ where }) => where.companyId === COMPANY_ID && where.id === SALE_ID ? sale : null,
            findMany: async ({ where }) => where.customerId ? counterpartySales : recentSales,
        },
        purchaseDocument: {
            findFirst: async ({ where }) => where.companyId === COMPANY_ID && where.id === PURCHASE_ID ? purchase : null,
            findMany: async ({ where }) => where.supplierId ? counterpartyPurchases : recentPurchases,
        },
        journalEntry: { findFirst: async () => journal },
        stockMovement: { findMany: async () => stockMovementQuery++ === 0 ? automaticMovements : recentMovements },
        stockBalance: { findMany: async () => [{ companyId: COMPANY_ID, itemId: ITEM_ID, warehouseId: WAREHOUSE_ID, quantity: options.balance ?? 5 }] },
        stockCostLayer: { findMany: async () => [{ id: "layer-1", companyId: COMPANY_ID, itemId: ITEM_ID, warehouseId: WAREHOUSE_ID, remainingQuantity: 10, unitCostCents: 1_000, createdAt: new Date("2026-01-01") }] },
        stockAlertSetting: { findMany: async () => [{ companyId: COMPANY_ID, itemId: ITEM_ID, warehouseId: WAREHOUSE_ID, minQuantity: 1, maxQuantity: 20 }] },
        treasuryAccount: { findMany: async () => [{ currentBalanceCents: options.cash ?? 10_000 }] },
        auditLog: { create: async ({ data }) => ({ id: "audit-1", ...data }) },
    };
    return prisma;
}

test("input aceita apenas tipo e UUID do documento", () => {
    assert.deepEqual(parseTransactionAnalysisInput({ documentType: "sale", documentId: SALE_ID }), { documentType: "SALE", documentId: SALE_ID });
    assert.throws(() => parseTransactionAnalysisInput({ documentType: "OTHER", documentId: SALE_ID }), { code: "INVALID_AI_DOCUMENT_TYPE" });
    assert.throws(() => parseTransactionAnalysisInput({ documentType: "SALE", documentId: "sale-1" }), { code: "INVALID_AI_DOCUMENT_ID" });
    assert.throws(() => parseTransactionAnalysisInput({ documentType: "SALE", documentId: SALE_ID, companyId: OTHER_COMPANY_ID }), { code: "INVALID_AI_TRANSACTION_INPUT" });
});

test("venda antes do posting projeta stock uma única vez e calcula margem", async () => {
    const result = await analyzeTransaction(createPrisma(), { companyId: COMPANY_ID, documentType: "SALE", documentId: SALE_ID, now: NOW });
    assert.equal(result.analysis.document.number, "FT 2026/3");
    assert.equal(result.analysis.document.posted, false);
    assert.equal(result.analysis.stock[0].current, "5.000");
    assert.equal(result.analysis.stock[0].projected, "3.000");
    assert.equal(result.analysis.metrics.estimatedGrossMarginCents, 2_000);
    assert.equal(result.analysis.guardrail, TRANSACTION_ANALYSIS_GUARDRAIL);
    assert.equal(result.analysis.sources.some((source) => source.type === "SALE_DOCUMENT"), true);
});

test("venda depois do posting mantém o saldo atual sem nova subtração", async () => {
    const movement = { id: "movement-1", companyId: COMPANY_ID, itemId: ITEM_ID, type: "EXIT", quantity: 2, totalCostCents: 2_000, fromWarehouseId: WAREHOUSE_ID, toWarehouseId: null, sourceType: "SALE_DOCUMENT_LINE", sourceId: SALE_LINE_ID, createdAt: NOW };
    const prisma = createPrisma({ sale: saleDocument({ postedAt: NOW }), journal: { id: "journal-1", createdAt: NOW }, automaticMovements: [movement], recentMovements: [movement] , balance: 3 });
    const result = await analyzeTransaction(prisma, { companyId: COMPANY_ID, documentType: "SALE", documentId: SALE_ID, now: NOW });
    assert.equal(result.analysis.document.posted, true);
    assert.equal(result.analysis.posting.stockApplied, true);
    assert.equal(result.analysis.stock[0].current, "3.000");
    assert.equal(result.analysis.stock[0].projected, "3.000");
    assert.equal(result.analysis.riskFactors.some((factor) => factor.code === "DATA_INTEGRITY_RISK"), false);
});

test("journal sem movimento automático fica inconclusivo e não inventa projeção", async () => {
    const result = await analyzeTransaction(createPrisma({ journal: { id: "journal-1", createdAt: NOW } }), { companyId: COMPANY_ID, documentType: "SALE", documentId: SALE_ID, now: NOW });
    assert.equal(result.analysis.dataQuality, "INCONSISTENT");
    assert.equal(result.analysis.stock[0].projected, null);
    assert.equal(result.analysis.score, null);
    assert.equal(result.analysis.scoreQuality, "INCONCLUSIVE");
    assert.equal(result.analysis.recommendation, "REVIEW_BEFORE_PROCEEDING");
    assert.equal(result.analysis.riskFactors.some((factor) => factor.code === "DATA_INTEGRITY_RISK"), true);
});

test("documento rejeitado não recebe indicação para prosseguir", async () => {
    const result = await analyzeTransaction(createPrisma({ sale: saleDocument({ status: "REJECTED" }) }), {
        companyId: COMPANY_ID,
        documentType: "SALE",
        documentId: SALE_ID,
        now: NOW,
    });
    assert.equal(result.analysis.recommendation, "DO_NOT_PROCEED_WITHOUT_REVIEW");
    assert.equal(result.analysis.riskFactors.some((factor) => factor.code === "WORKFLOW_REJECTED"), true);
    assert.equal(result.analysis.futureActions.some((action) => action.includes("workflow")), true);
});

test("serviço sem custo conhecido declara qualidade parcial e não inventa margem", async () => {
    const service = { id: ITEM_ID, companyId: COMPANY_ID, sku: "SERV-01", name: "Serviço", type: "SERVICE", costCents: 0 };
    const sale = saleDocument({
        warehouseId: null,
        warehouse: null,
        lines: [{ id: SALE_LINE_ID, itemId: ITEM_ID, quantity: 1, unitPriceCents: 2_000, subtotalCents: 2_000, vatCents: 460, totalCents: 2_460, item: service, vatRate: { rateBps: 2_300 } }],
    });
    const result = await analyzeTransaction(createPrisma({ sale }), {
        companyId: COMPANY_ID,
        documentType: "SALE",
        documentId: SALE_ID,
        now: NOW,
    });
    assert.deepEqual(result.analysis.stock, []);
    assert.equal(result.analysis.metrics.estimatedGrossMarginCents, null);
    assert.equal(result.analysis.dataQuality, "PARTIAL");
    assert.equal(result.analysis.scoreQuality, "PARTIAL");
    assert.equal(result.analysis.limitations.some((limitation) => limitation.includes("não tem custo conhecido")), true);
});

test("compra projeta entrada antes e não duplica depois do posting", async () => {
    const before = await analyzeTransaction(createPrisma(), { companyId: COMPANY_ID, documentType: "PURCHASE", documentId: PURCHASE_ID, now: NOW });
    assert.equal(before.analysis.stock[0].projected, "8.000");
    const movement = { id: "movement-purchase", companyId: COMPANY_ID, itemId: ITEM_ID, type: "ENTRY", quantity: 3, totalCostCents: 3_000, fromWarehouseId: null, toWarehouseId: WAREHOUSE_ID, sourceType: "PURCHASE_DOCUMENT_LINE", sourceId: PURCHASE_LINE_ID, createdAt: NOW };
    const after = await analyzeTransaction(createPrisma({ purchase: purchaseDocument({ status: "POSTED", postedAt: NOW }), journal: { id: "journal-p", createdAt: NOW }, automaticMovements: [movement], recentMovements: [movement], balance: 8 }), { companyId: COMPANY_ID, documentType: "PURCHASE", documentId: PURCHASE_ID, now: NOW });
    assert.equal(after.analysis.posting.stockApplied, true);
    assert.equal(after.analysis.stock[0].projected, "8.000");
    assert.equal(after.analysis.metrics.cashAfterPurchaseCents, 6_310);
});

test("documento de outra empresa devolve 404 antes de consultar fontes", async () => {
    let sourceRead = false;
    const prisma = createPrisma();
    prisma.saleDocument.findFirst = async () => null;
    prisma.journalEntry.findFirst = async () => { sourceRead = true; return null; };
    await assert.rejects(() => analyzeTransaction(prisma, { companyId: OTHER_COMPANY_ID, documentType: "SALE", documentId: SALE_ID, now: NOW }), { code: "SALE_DOCUMENT_NOT_FOUND" });
    assert.equal(sourceRead, false);
});

test("auditoria da consulta guarda apenas metadados mínimos", async () => {
    const prisma = createPrisma();
    let stored;
    prisma.auditLog.create = async ({ data }) => { stored = data; return { id: "audit-1", ...data }; };
    const result = await analyzeTransaction(prisma, { companyId: COMPANY_ID, documentType: "SALE", documentId: SALE_ID, now: NOW });
    await auditTransactionAnalysis(prisma, { companyId: COMPANY_ID, userId: "user-1", analysis: result.analysis });
    assert.equal(stored.entityId, SALE_ID);
    assert.deepEqual(Object.keys(stored.details).sort(), ["dataQuality", "modelVersion", "recommendation", "riskLevel"]);
    assert.equal(JSON.stringify(stored).includes("Cliente PAP"), false);
    assert.equal(JSON.stringify(stored).includes("totalCents"), false);
});
