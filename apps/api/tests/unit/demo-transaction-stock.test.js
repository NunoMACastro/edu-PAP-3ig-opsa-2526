/**
 * @file Testes de domínio focados no posting integrado da demonstração PAP.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { postPurchaseDocument } from "../../src/modules/accounting/purchasePostingService.js";
import { postSaleDocument } from "../../src/modules/accounting/salePostingService.js";
import { listStockBalances } from "../../src/modules/inventory/stockMovementService.js";
import { parseStockMovement } from "../../src/modules/inventory/stockMovementValidators.js";
import { createPurchaseDocument } from "../../src/modules/purchases/purchaseDocumentService.js";
import { createSaleDocument } from "../../src/modules/sales/saleDocumentService.js";

const COMPANY_ID = "company-1";
const USER_ID = "user-1";
const WAREHOUSE_ID = "warehouse-1";

/**
 * Cria um documento base com totais equilibrados e uma linha configurável.
 *
 * @param {"SALE" | "PURCHASE"} type - Domínio do documento.
 * @param {object} [overrides] - Substituições do cenário.
 * @returns {object} Documento persistido simulado.
 */
function postingDocument(type, overrides = {}) {
    const isSale = type === "SALE";
    const itemType = overrides.itemType ?? "PRODUCT";
    const line = {
        id: `${type.toLowerCase()}-line-1`,
        itemId: "item-1",
        vatRateId: "vat-1",
        description: "Artigo PAP",
        quantity: overrides.quantity ?? 2,
        unitPriceCents: 1000,
        unitCostCents: overrides.unitCostCents ?? 400,
        subtotalCents: 2000,
        vatCents: 460,
        totalCents: 2460,
        item: {
            id: "item-1",
            companyId: overrides.itemCompanyId ?? COMPANY_ID,
            type: itemType,
            costCents: overrides.itemCostCents ?? 400,
        },
    };

    return {
        id: `${type.toLowerCase()}-1`,
        companyId: COMPANY_ID,
        customerId: "customer-1",
        supplierId: "supplier-1",
        warehouseId:
            overrides.warehouseId === undefined
                ? itemType === "PRODUCT"
                    ? WAREHOUSE_ID
                    : null
                : overrides.warehouseId,
        kind:
            overrides.kind ??
            (isSale ? "INVOICE" : "SUPPLIER_INVOICE"),
        status: overrides.status ?? (isSale ? "ISSUED" : "APPROVED"),
        number: "INVOICE-2026-000001",
        supplierNumber: "FT-FORN-2026-1",
        issuedAt: new Date("2026-07-14T00:00:00.000Z"),
        subtotalCents: 2000,
        vatCents: 460,
        totalCents: 2460,
        postedAt: overrides.postedAt ?? null,
        postedById: null,
        lines: [line],
    };
}

/**
 * Cria um Prisma transacional em memória com commit/rollback e serialização.
 * O double exerce o comportamento dos serviços sem fingir persistência após erro.
 *
 * @param {object} options - Documentos, saldo e período do cenário.
 * @returns {{ prisma: object, state: object }} Harness observável.
 */
function postingHarness(options = {}) {
    const state = {
        sale: options.sale ?? null,
        purchase: options.purchase ?? null,
        warehouse: {
            id: WAREHOUSE_ID,
            companyId: options.warehouseCompanyId ?? COMPANY_ID,
            code: "WH-DEMO",
            name: "Armazém demonstração",
            isActive: true,
        },
        periodStatus: options.periodStatus ?? "OPEN",
        balance: options.balance ?? 0,
        layers: (options.layers ?? []).map((layer, index) => ({
            id: layer.id ?? `layer-${index + 1}`,
            companyId: COMPANY_ID,
            itemId: "item-1",
            warehouseId: WAREHOUSE_ID,
            quantity: layer.quantity,
            remainingQuantity: layer.remainingQuantity ?? layer.quantity,
            unitCostCents: layer.unitCostCents ?? 400,
            createdAt: new Date(`2026-07-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`),
        })),
        movements: [],
        consumptions: [],
        journals: [],
        audits: [],
        holds: [],
    };
    let serialized = Promise.resolve();

    /**
     * Constrói os modelos Prisma que escrevem apenas no rascunho transacional.
     *
     * @param {object} draft - Snapshot isolado da operação atual.
     * @returns {object} Cliente de transação.
     */
    function buildTx(draft) {
        const documents = [draft.sale, draft.purchase].filter(Boolean);
        const documentItems = documents.flatMap((document) =>
            document.lines.map((line) => line.item),
        );

        return {
            fiscalPeriod: {
                findFirst: async () => ({
                    id: "period-1",
                    status: draft.periodStatus,
                    startDate: new Date("2026-01-01T00:00:00.000Z"),
                    endDate: new Date("2026-12-31T23:59:59.999Z"),
                }),
            },
            saleDocument: {
                findFirst: async ({ where }) =>
                    draft.sale?.id === where.id &&
                    draft.sale.companyId === where.companyId
                        ? draft.sale
                        : null,
                update: async ({ data }) => {
                    Object.assign(draft.sale, data);
                    return draft.sale;
                },
            },
            purchaseDocument: {
                findFirst: async ({ where }) =>
                    draft.purchase?.id === where.id &&
                    draft.purchase.companyId === where.companyId
                        ? draft.purchase
                        : null,
                update: async ({ data }) => {
                    Object.assign(draft.purchase, data);
                    return draft.purchase;
                },
            },
            warehouse: {
                findFirst: async ({ where }) =>
                    draft.warehouse.id === where.id &&
                    draft.warehouse.companyId === where.companyId &&
                    draft.warehouse.isActive
                        ? draft.warehouse
                        : null,
                findMany: async ({ where }) =>
                    where.id.in.includes(draft.warehouse.id) &&
                    draft.warehouse.companyId === where.companyId &&
                    draft.warehouse.isActive
                        ? [draft.warehouse]
                        : [],
            },
            item: {
                findFirst: async ({ where }) =>
                    documentItems.find(
                        (item) =>
                            item.id === where.id &&
                            item.companyId === where.companyId,
                    ) ?? null,
            },
            account: {
                findFirst: async ({ where }) => ({
                    id: `account-${where.code}`,
                    code: where.code,
                    isActive: true,
                }),
            },
            journalEntry: {
                create: async ({ data }) => {
                    if (
                        draft.journals.some(
                            (entry) =>
                                entry.companyId === data.companyId &&
                                entry.source === data.source &&
                                entry.sourceId === data.sourceId,
                        )
                    ) {
                        throw { code: "P2002" };
                    }
                    const entry = {
                        id: `journal-${draft.journals.length + 1}`,
                        ...data,
                        lines: data.lines.create,
                    };
                    draft.journals.push(entry);
                    return entry;
                },
            },
            stockMovement: {
                create: async ({ data }) => {
                    if (
                        data.sourceType &&
                        data.sourceId &&
                        draft.movements.some(
                            (movement) =>
                                movement.companyId === data.companyId &&
                                movement.sourceType === data.sourceType &&
                                movement.sourceId === data.sourceId,
                        )
                    ) {
                        throw { code: "P2002" };
                    }
                    const movement = {
                        id: `movement-${draft.movements.length + 1}`,
                        ...data,
                    };
                    draft.movements.push(movement);
                    return movement;
                },
                update: async ({ where, data }) => {
                    const movement = draft.movements.find(
                        ({ id }) => id === where.id,
                    );
                    Object.assign(movement, data);
                    return movement;
                },
            },
            stockBalance: {
                findUnique: async () => ({ quantity: draft.balance }),
                upsert: async ({ create, update }) => {
                    draft.balance = Number(update.quantity ?? create.quantity);
                    return { ...create, quantity: draft.balance };
                },
            },
            stockCostLayer: {
                findMany: async () =>
                    draft.layers
                        .filter((layer) => Number(layer.remainingQuantity) > 0)
                        .sort(
                            (left, right) =>
                                left.createdAt - right.createdAt ||
                                left.id.localeCompare(right.id),
                        ),
                update: async ({ where, data }) => {
                    const layer = draft.layers.find(({ id }) => id === where.id);
                    Object.assign(layer, data);
                    return layer;
                },
                create: async ({ data }) => {
                    const layer = {
                        id: `layer-${draft.layers.length + 1}`,
                        createdAt: new Date(),
                        ...data,
                    };
                    draft.layers.push(layer);
                    return layer;
                },
            },
            stockCostConsumption: {
                create: async ({ data }) => {
                    const consumption = {
                        id: `consumption-${draft.consumptions.length + 1}`,
                        ...data,
                    };
                    draft.consumptions.push(consumption);
                    return consumption;
                },
            },
            auditLog: {
                create: async ({ data }) => {
                    const audit = {
                        id: `audit-${draft.audits.length + 1}`,
                        ...data,
                    };
                    draft.audits.push(audit);
                    return audit;
                },
            },
            retentionHold: {
                upsert: async ({ create, update }) => {
                    const hold = { ...create, ...update };
                    draft.holds.push(hold);
                    return hold;
                },
            },
        };
    }

    const prisma = {
        $transaction(callback) {
            const operation = serialized.then(async () => {
                const draft = structuredClone(state);
                const result = await callback(buildTx(draft));
                Object.assign(state, draft);
                return result;
            });
            serialized = operation.catch(() => undefined);
            return operation;
        },
    };

    return { prisma, state };
}

/**
 * Soma débitos ou créditos do lançamento persistido.
 *
 * @param {object} entry - Journal em memória.
 * @param {"debitCents" | "creditCents"} field - Coluna contabilística.
 * @returns {number} Total em cêntimos.
 */
function journalTotal(entry, field) {
    return entry.lines.reduce((total, line) => total + line[field], 0);
}

test("D1: venda de produto cria journal, saída FIFO e estado contabilístico", async () => {
    const sale = postingDocument("SALE");
    const { prisma, state } = postingHarness({
        sale,
        balance: 10,
        layers: [{ quantity: 10, unitCostCents: 400 }],
    });

    const entry = await postSaleDocument(prisma, COMPANY_ID, USER_ID, sale.id);

    assert.equal(state.journals.length, 1);
    assert.equal(
        journalTotal(state.journals[0], "debitCents"),
        journalTotal(state.journals[0], "creditCents"),
    );
    assert.equal(state.balance, 8);
    assert.equal(state.movements.length, 1);
    assert.equal(state.movements[0].type, "EXIT");
    assert.equal(state.movements[0].sourceType, "SALE_DOCUMENT_LINE");
    assert.equal(state.movements[0].sourceId, sale.lines[0].id);
    assert.ok(state.sale.postedAt instanceof Date);
    assert.equal(state.sale.postedById, USER_ID);
    assert.deepEqual(entry.stockEffect, {
        movementCount: 1,
        direction: "EXIT",
        quantity: "2.000",
    });
    assert.equal(
        state.audits.some(({ entity }) => entity === "SaleDocument"),
        true,
    );
    assert.equal(state.holds.length > 0, true);
});

test("D2: compra de produto cria entrada, camada FIFO e estado POSTED", async () => {
    const purchase = postingDocument("PURCHASE", {
        quantity: 3,
        unitCostCents: 250,
    });
    const { prisma, state } = postingHarness({ purchase });

    const entry = await postPurchaseDocument(
        prisma,
        COMPANY_ID,
        USER_ID,
        purchase.id,
    );

    assert.equal(state.balance, 3);
    assert.equal(state.movements[0].type, "ENTRY");
    assert.equal(state.movements[0].unitCostCents, 250);
    assert.equal(state.movements[0].sourceType, "PURCHASE_DOCUMENT_LINE");
    assert.equal(state.layers.length, 1);
    assert.equal(state.layers[0].unitCostCents, 250);
    assert.equal(state.purchase.status, "POSTED");
    assert.ok(state.purchase.postedAt instanceof Date);
    assert.deepEqual(entry.stockEffect, {
        movementCount: 1,
        direction: "ENTRY",
        quantity: "3.000",
    });
});

test("D3/D4: serviços não movimentam stock e produto histórico exige armazém", async () => {
    const serviceSale = postingDocument("SALE", { itemType: "SERVICE" });
    const serviceHarness = postingHarness({ sale: serviceSale, balance: 7 });
    await postSaleDocument(
        serviceHarness.prisma,
        COMPANY_ID,
        USER_ID,
        serviceSale.id,
    );
    assert.equal(serviceHarness.state.movements.length, 0);
    assert.equal(serviceHarness.state.balance, 7);
    assert.equal(serviceHarness.state.journals.length, 1);

    const mixedSale = postingDocument("SALE", { quantity: 1 });
    mixedSale.lines.push({
        id: "sale-line-service",
        itemId: "service-1",
        vatRateId: "vat-1",
        description: "Serviço associado",
        quantity: 1,
        unitPriceCents: 100,
        subtotalCents: 100,
        vatCents: 23,
        totalCents: 123,
        item: {
            id: "service-1",
            companyId: COMPANY_ID,
            type: "SERVICE",
            costCents: 0,
        },
    });
    const mixedHarness = postingHarness({
        sale: mixedSale,
        balance: 3,
        layers: [{ quantity: 3 }],
    });
    await postSaleDocument(
        mixedHarness.prisma,
        COMPANY_ID,
        USER_ID,
        mixedSale.id,
    );
    assert.equal(mixedHarness.state.movements.length, 1);
    assert.equal(mixedHarness.state.movements[0].itemId, "item-1");
    assert.equal(mixedHarness.state.balance, 2);

    const historicalSale = postingDocument("SALE", { warehouseId: null });
    const historicalHarness = postingHarness({ sale: historicalSale, balance: 7 });
    await assert.rejects(
        () =>
            postSaleDocument(
                historicalHarness.prisma,
                COMPANY_ID,
                USER_ID,
                historicalSale.id,
            ),
        { status: 409, code: "WAREHOUSE_REQUIRED_FOR_POSTING" },
    );
    assert.equal(historicalHarness.state.journals.length, 0);
});

test("D5: notas de crédito invertem o efeito de stock e rollbackam sem saldo", async () => {
    const saleCredit = postingDocument("SALE", {
        kind: "CREDIT_NOTE",
        itemCostCents: 325,
    });
    const saleHarness = postingHarness({ sale: saleCredit });
    await postSaleDocument(
        saleHarness.prisma,
        COMPANY_ID,
        USER_ID,
        saleCredit.id,
    );
    assert.equal(saleHarness.state.balance, 2);
    assert.equal(saleHarness.state.movements[0].type, "RETURN");
    assert.equal(saleHarness.state.layers[0].unitCostCents, 325);

    const purchaseCredit = postingDocument("PURCHASE", {
        kind: "SUPPLIER_CREDIT_NOTE",
        quantity: 2,
    });
    const purchaseHarness = postingHarness({
        purchase: purchaseCredit,
        balance: 1,
        layers: [{ quantity: 1 }],
    });
    await assert.rejects(
        () =>
            postPurchaseDocument(
                purchaseHarness.prisma,
                COMPANY_ID,
                USER_ID,
                purchaseCredit.id,
            ),
        { status: 409, code: "INSUFFICIENT_STOCK" },
    );
    assert.equal(purchaseHarness.state.balance, 1);
    assert.equal(purchaseHarness.state.movements.length, 0);
    assert.equal(purchaseHarness.state.journals.length, 0);
    assert.equal(purchaseHarness.state.audits.length, 0);
    assert.equal(purchaseHarness.state.purchase.status, "APPROVED");
});

test("D6/D7: falta de stock faz rollback e concorrência deixa um vencedor", async () => {
    const insufficientSale = postingDocument("SALE", { quantity: 2 });
    const insufficientHarness = postingHarness({
        sale: insufficientSale,
        balance: 1,
        layers: [{ quantity: 1 }],
    });
    await assert.rejects(
        () =>
            postSaleDocument(
                insufficientHarness.prisma,
                COMPANY_ID,
                USER_ID,
                insufficientSale.id,
            ),
        { status: 409, code: "INSUFFICIENT_STOCK" },
    );
    assert.equal(insufficientHarness.state.journals.length, 0);
    assert.equal(insufficientHarness.state.movements.length, 0);
    assert.equal(insufficientHarness.state.sale.postedAt, null);

    const concurrentSale = postingDocument("SALE", { quantity: 1 });
    const concurrentHarness = postingHarness({
        sale: concurrentSale,
        balance: 2,
        layers: [{ quantity: 2 }],
    });
    const outcomes = await Promise.allSettled([
        postSaleDocument(
            concurrentHarness.prisma,
            COMPANY_ID,
            USER_ID,
            concurrentSale.id,
        ),
        postSaleDocument(
            concurrentHarness.prisma,
            COMPANY_ID,
            USER_ID,
            concurrentSale.id,
        ),
    ]);
    assert.equal(outcomes.filter(({ status }) => status === "fulfilled").length, 1);
    assert.equal(outcomes.filter(({ status }) => status === "rejected").length, 1);
    assert.equal(outcomes.find(({ status }) => status === "rejected").reason.code, "SALE_ALREADY_POSTED");
    assert.equal(concurrentHarness.state.journals.length, 1);
    assert.equal(concurrentHarness.state.movements.length, 1);
    assert.equal(concurrentHarness.state.balance, 1);

    const repeatedPurchase = postingDocument("PURCHASE", { quantity: 1 });
    const repeatedHarness = postingHarness({ purchase: repeatedPurchase });
    await postPurchaseDocument(
        repeatedHarness.prisma,
        COMPANY_ID,
        USER_ID,
        repeatedPurchase.id,
    );
    await assert.rejects(
        () =>
            postPurchaseDocument(
                repeatedHarness.prisma,
                COMPANY_ID,
                USER_ID,
                repeatedPurchase.id,
            ),
        { status: 409, code: "PURCHASE_ALREADY_POSTED" },
    );
    assert.equal(repeatedHarness.state.journals.length, 1);
    assert.equal(repeatedHarness.state.movements.length, 1);
});

test("D8/D10: armazém de outra empresa e período fechado falham antes do journal", async () => {
    const foreignWarehouseSale = postingDocument("SALE");
    const foreignHarness = postingHarness({
        sale: foreignWarehouseSale,
        warehouseCompanyId: "company-2",
        balance: 5,
        layers: [{ quantity: 5 }],
    });
    await assert.rejects(
        () =>
            postSaleDocument(
                foreignHarness.prisma,
                COMPANY_ID,
                USER_ID,
                foreignWarehouseSale.id,
            ),
        { status: 404, code: "WAREHOUSE_NOT_FOUND" },
    );
    assert.equal(foreignHarness.state.journals.length, 0);

    const closedPurchase = postingDocument("PURCHASE");
    const closedHarness = postingHarness({
        purchase: closedPurchase,
        periodStatus: "CLOSED",
    });
    await assert.rejects(
        () =>
            postPurchaseDocument(
                closedHarness.prisma,
                COMPANY_ID,
                USER_ID,
                closedPurchase.id,
            ),
        { status: 409, code: "FISCAL_PERIOD_CLOSED" },
    );
    assert.equal(closedHarness.state.journals.length, 0);
});

/**
 * Cria um double mínimo para validar o armazém na criação de documentos.
 *
 * @param {"PRODUCT" | "SERVICE"} itemType - Tipo de artigo devolvido.
 * @returns {{ prisma: object, writes: object[] }} Double e escritas observadas.
 */
function creationHarness(itemType) {
    const writes = [];
    const prisma = {
        fiscalPeriod: {
            findFirst: async () => ({
                id: "period-1",
                status: "OPEN",
                startDate: new Date("2026-01-01T00:00:00.000Z"),
                endDate: new Date("2026-12-31T23:59:59.999Z"),
            }),
        },
        customer: { findFirst: async () => ({ id: "customer-1" }) },
        supplier: { findFirst: async () => ({ id: "supplier-1" }) },
        item: {
            findMany: async () => [
                { id: "item-1", name: "Artigo", type: itemType },
            ],
        },
        vatRate: {
            findMany: async () => [{ id: "vat-1", rateBps: 2300 }],
        },
        warehouse: {
            findFirst: async ({ where }) =>
                where.id === WAREHOUSE_ID && where.companyId === COMPANY_ID
                    ? { id: WAREHOUSE_ID, code: "WH", name: "Principal" }
                    : null,
        },
        saleDocument: {
            create: async ({ data }) => {
                writes.push(data);
                return { id: "sale-1", ...data, lines: data.lines.create };
            },
        },
        purchaseDocument: {
            create: async ({ data }) => {
                writes.push(data);
                return { id: "purchase-1", ...data, lines: data.lines.create };
            },
        },
        auditLog: { create: async () => ({ id: "audit-1" }) },
        $transaction: async (callback) => callback(prisma),
    };
    return { prisma, writes };
}

test("D3/D4/D8: criação exige warehouse apenas para produtos e valida company scope", async () => {
    const product = creationHarness("PRODUCT");
    await assert.rejects(
        () =>
            createSaleDocument(product.prisma, COMPANY_ID, USER_ID, {
                kind: "INVOICE",
                customerId: "customer-1",
                issuedAt: "2026-07-14",
                lines: [{
                    itemId: "item-1",
                    vatRateId: "vat-1",
                    quantity: 1,
                    unitPriceCents: 100,
                }],
            }),
        { status: 400, code: "WAREHOUSE_REQUIRED" },
    );
    assert.equal(product.writes.length, 0);

    await assert.rejects(
        () =>
            createPurchaseDocument(product.prisma, COMPANY_ID, USER_ID, {
                kind: "SUPPLIER_INVOICE",
                supplierId: "supplier-1",
                supplierNumber: "FT-1",
                warehouseId: "warehouse-from-company-2",
                issuedAt: "2026-07-14",
                lines: [{
                    itemId: "item-1",
                    vatRateId: "vat-1",
                    quantity: 1,
                    unitCostCents: 100,
                }],
            }),
        { status: 404, code: "WAREHOUSE_NOT_FOUND" },
    );

    const service = creationHarness("SERVICE");
    const document = await createSaleDocument(
        service.prisma,
        COMPANY_ID,
        USER_ID,
        {
            kind: "INVOICE",
            customerId: "customer-1",
            issuedAt: "2026-07-14",
            lines: [{
                itemId: "item-1",
                vatRateId: "vat-1",
                quantity: 1,
                unitPriceCents: 100,
            }],
        },
    );
    assert.equal(document.warehouseId, null);
});

test("D9: saldos usam filtros company-scoped, Decimal estável e cursor keyset", async () => {
    const calls = [];
    const records = [18, 7, 3].map((quantity, index) => ({
        id: `balance-${index + 1}`,
        quantity: { toFixed: () => `${quantity}.000` },
        updatedAt: new Date(`2026-07-1${4 - index}T10:00:00.000Z`),
        item: {
            id: "item-1",
            sku: "DEMO-0001",
            name: "Produto PAP",
            type: "PRODUCT",
        },
        warehouse: {
            id: WAREHOUSE_ID,
            code: "WH-DEMO",
            name: "Armazém demonstração",
        },
    }));
    const prisma = {
        item: { findFirst: async ({ where }) => ({ id: where.id }) },
        warehouse: { findFirst: async ({ where }) => ({ id: where.id }) },
        stockBalance: {
            findMany: async (args) => {
                calls.push(args);
                return records;
            },
        },
    };

    const page = await listStockBalances(prisma, COMPANY_ID, {
        itemId: "item-1",
        warehouseId: WAREHOUSE_ID,
        limit: 2,
    });

    assert.equal(page.items.length, 2);
    assert.equal(page.items[0].quantity, "18.000");
    assert.equal(page.pageInfo.hasNextPage, true);
    assert.equal(page.pageInfo.endCursor, page.pageInfo.nextCursor);
    assert.deepEqual(calls[0].where, {
        companyId: COMPANY_ID,
        itemId: "item-1",
        warehouseId: WAREHOUSE_ID,
    });
    assert.deepEqual(calls[0].orderBy, [
        { updatedAt: "desc" },
        { id: "desc" },
    ]);
    assert.equal(calls[0].take, 3);

    await assert.rejects(
        () => listStockBalances(prisma, "", {}),
        { status: 400, code: "COMPANY_CONTEXT_REQUIRED" },
    );
    const foreign = {
        ...prisma,
        warehouse: { findFirst: async () => null },
    };
    await assert.rejects(
        () =>
            listStockBalances(foreign, COMPANY_ID, {
                warehouseId: "warehouse-from-company-2",
            }),
        { status: 404, code: "WAREHOUSE_NOT_FOUND" },
    );
});

test("D7: API manual não pode forjar origem automática nem referência incompleta", () => {
    assert.throws(
        () =>
            parseStockMovement({
                type: "EXIT",
                itemId: "item-1",
                quantity: 1,
                fromWarehouseId: WAREHOUSE_ID,
                reason: "Tentativa externa",
                sourceType: "SALE_DOCUMENT_LINE",
                sourceId: "sale-line-1",
            }),
        { status: 400, code: "RESERVED_STOCK_SOURCE" },
    );
    assert.throws(
        () =>
            parseStockMovement({
                type: "EXIT",
                itemId: "item-1",
                quantity: 1,
                fromWarehouseId: WAREHOUSE_ID,
                reason: "Referência incompleta",
                sourceType: "IMPORT",
            }),
        { status: 400, code: "INVALID_SOURCE_REFERENCE" },
    );
});
