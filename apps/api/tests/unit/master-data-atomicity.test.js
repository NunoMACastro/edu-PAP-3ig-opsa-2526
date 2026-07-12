/**
 * @file Testes das transações e auditoria minimizada de master data.
 *
 * Estes testes usam clientes Prisma distintos para a raiz e para a transação.
 * Assim, uma mutação que escape acidentalmente da callback `$transaction`
 * falha imediatamente em vez de produzir um falso positivo.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    createCustomer,
    deactivateCustomer,
} from "../../src/modules/customers/customerService.js";
import {
    createSupplier,
    updateSupplier,
} from "../../src/modules/suppliers/supplierService.js";
import {
    createItem,
    deactivateItem,
} from "../../src/modules/items/itemService.js";
import {
    createWarehouse,
    createWarehouseLocation,
} from "../../src/modules/warehouses/warehouseService.js";

/**
 * Cria uma raiz Prisma que executa exatamente uma callback transacional.
 *
 * @param {object} rootModels - Modelos apenas para verificações prévias.
 * @param {object} transactionClient - Cliente usado para escrita e auditoria.
 * @returns {{prisma: object, getTransactionCount: () => number}} Harness.
 */
function buildTransactionHarness(rootModels, transactionClient) {
    let transactionCount = 0;
    return {
        prisma: {
            ...rootModels,
            async $transaction(callback) {
                transactionCount += 1;
                return callback(transactionClient);
            },
        },
        getTransactionCount: () => transactionCount,
    };
}

/**
 * Garante que os detalhes não guardam valores pessoais/comerciais do payload.
 *
 * @param {object} details - Detalhes persistidos no AuditLog.
 * @param {string[]} changedFields - Campos esperados.
 * @param {string[]} forbiddenValues - Valores que não podem aparecer no JSON.
 * @returns {void}
 */
function assertMinimizedDetails(details, changedFields, forbiddenValues) {
    assert.deepEqual(details, { changedFields: [...changedFields].sort() });
    const serialized = JSON.stringify(details);
    for (const value of forbiddenValues) {
        assert.equal(serialized.includes(value), false);
    }
}

test("master data: criação de cliente e AuditLog usam a mesma transação sem PII", async () => {
    const auditRows = [];
    const customerInput = {
        name: "Cliente Reservado",
        nif: "123456789",
        email: "cliente@example.test",
        isActive: true,
    };
    const tx = {
        customer: {
            create: async ({ data }) => ({ id: "customer-1", ...data }),
        },
        auditLog: {
            create: async ({ data }) => {
                auditRows.push(data);
                return { id: "audit-1", ...data };
            },
        },
    };
    const { prisma, getTransactionCount } = buildTransactionHarness(
        { customer: { findFirst: async () => null } },
        tx,
    );

    const customer = await createCustomer(
        prisma,
        "company-1",
        customerInput,
        "user-1",
    );

    assert.equal(getTransactionCount(), 1);
    assert.equal(customer.id, "customer-1");
    assert.deepEqual(auditRows[0], {
        companyId: "company-1",
        userId: "user-1",
        action: "CUSTOMER_CREATED",
        entity: "Customer",
        entityId: "customer-1",
        details: {
            changedFields: ["email", "isActive", "name", "nif"],
        },
    });
    assertMinimizedDetails(
        auditRows[0].details,
        Object.keys(customerInput),
        [customerInput.name, customerInput.nif, customerInput.email],
    );
});

test("master data: desativação de cliente limita ownership por empresa e não audita 404", async () => {
    let auditCount = 0;
    const tx = {
        customer: {
            updateMany: async ({ where }) => {
                assert.deepEqual(where, {
                    id: "customer-foreign",
                    companyId: "company-1",
                });
                return { count: 0 };
            },
        },
        auditLog: {
            create: async () => {
                auditCount += 1;
            },
        },
    };
    const { prisma } = buildTransactionHarness({}, tx);

    await assert.rejects(
        () =>
            deactivateCustomer(
                prisma,
                "company-1",
                "customer-foreign",
                "user-1",
            ),
        { status: 404, code: "CUSTOMER_NOT_FOUND" },
    );
    assert.equal(auditCount, 0);
});

test("master data: atualização de fornecedor é atómica, scoped e minimizada", async () => {
    const auditRows = [];
    const supplierInput = {
        name: "Fornecedor Privado",
        nif: "987654321",
        email: "supplier@example.test",
        isActive: true,
    };
    const tx = {
        supplier: {
            updateMany: async ({ where, data }) => {
                assert.deepEqual(where, {
                    id: "supplier-1",
                    companyId: "company-1",
                });
                assert.deepEqual(data, supplierInput);
                return { count: 1 };
            },
            findFirst: async ({ where }) => ({
                id: where.id,
                ...supplierInput,
            }),
        },
        auditLog: {
            create: async ({ data }) => {
                auditRows.push(data);
                return { id: "audit-1", ...data };
            },
        },
    };
    const { prisma, getTransactionCount } = buildTransactionHarness(
        { supplier: { findFirst: async () => null } },
        tx,
    );

    await updateSupplier(
        prisma,
        "company-1",
        "supplier-1",
        supplierInput,
        "user-1",
    );

    assert.equal(getTransactionCount(), 1);
    assert.equal(auditRows[0].action, "SUPPLIER_UPDATED");
    assert.equal(auditRows[0].entityId, "supplier-1");
    assertMinimizedDetails(
        auditRows[0].details,
        Object.keys(supplierInput),
        [supplierInput.name, supplierInput.nif, supplierInput.email],
    );
});

test("master data: desativação de item e AuditLog são uma unidade atómica", async () => {
    const auditRows = [];
    const tx = {
        item: {
            updateMany: async ({ where, data }) => {
                assert.deepEqual(where, {
                    id: "item-1",
                    companyId: "company-1",
                });
                assert.deepEqual(data, { isActive: false });
                return { count: 1 };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                auditRows.push(data);
                return { id: "audit-1", ...data };
            },
        },
    };
    const { prisma, getTransactionCount } = buildTransactionHarness({}, tx);

    await deactivateItem(prisma, "company-1", "item-1", "user-1");

    assert.equal(getTransactionCount(), 1);
    assert.deepEqual(auditRows[0], {
        companyId: "company-1",
        userId: "user-1",
        action: "ITEM_DEACTIVATED",
        entity: "Item",
        entityId: "item-1",
        details: { changedFields: ["isActive"] },
    });
});

test("master data: P2002 concorrente de item é devolvido como 409 estável", async () => {
    const tx = {
        item: {
            create: async () => {
                throw { code: "P2002", meta: { target: ["companyId", "sku"] } };
            },
        },
        auditLog: { create: async () => assert.fail("não deve auditar") },
    };
    const { prisma } = buildTransactionHarness(
        { item: { findFirst: async () => null } },
        tx,
    );

    await assert.rejects(
        () =>
            createItem(
                prisma,
                "company-1",
                {
                    sku: "SKU-1",
                    name: "Item",
                    type: "PRODUCT",
                    costCents: 100,
                    priceCents: 200,
                    vatRateBps: 2300,
                    isActive: true,
                },
                "user-1",
            ),
        { status: 409, code: "ITEM_SKU_EXISTS" },
    );
});

test("master data: P2002 concorrente de cliente é devolvido como 409 estável", async () => {
    const tx = {
        customer: {
            create: async () => {
                throw { code: "P2002", meta: { target: ["companyId", "nif"] } };
            },
        },
        auditLog: { create: async () => assert.fail("não deve auditar") },
    };
    const { prisma } = buildTransactionHarness(
        { customer: { findFirst: async () => null } },
        tx,
    );

    await assert.rejects(
        () =>
            createCustomer(
                prisma,
                "company-1",
                { name: "Cliente", nif: "123456789", isActive: true },
                "user-1",
            ),
        { status: 409, code: "CUSTOMER_NIF_EXISTS" },
    );
});

test("master data: P2002 concorrente de fornecedor é devolvido como 409 estável", async () => {
    const tx = {
        supplier: {
            create: async () => {
                throw { code: "P2002", meta: { target: ["companyId", "nif"] } };
            },
        },
        auditLog: { create: async () => assert.fail("não deve auditar") },
    };
    const { prisma } = buildTransactionHarness(
        { supplier: { findFirst: async () => null } },
        tx,
    );

    await assert.rejects(
        () =>
            createSupplier(
                prisma,
                "company-1",
                { name: "Fornecedor", nif: "987654321", isActive: true },
                "user-1",
            ),
        { status: 409, code: "SUPPLIER_NIF_EXISTS" },
    );
});

test("master data: criação de armazém audita apenas campos alterados", async () => {
    const auditRows = [];
    const tx = {
        warehouse: {
            create: async ({ data }) => ({
                id: "warehouse-1",
                isActive: true,
                ...data,
            }),
        },
        auditLog: {
            create: async ({ data }) => {
                auditRows.push(data);
                return { id: "audit-1", ...data };
            },
        },
    };
    const { prisma, getTransactionCount } = buildTransactionHarness(
        {
            warehouse: {
                findUnique: async () => null,
                findFirst: async () => null,
            },
        },
        tx,
    );

    const warehouse = await createWarehouse(
        prisma,
        "company-1",
        { code: "A1", name: "Principal" },
        "user-1",
    );

    assert.equal(getTransactionCount(), 1);
    assert.equal(warehouse.id, "warehouse-1");
    assert.deepEqual(auditRows[0], {
        companyId: "company-1",
        userId: "user-1",
        action: "WAREHOUSE_CREATED",
        entity: "Warehouse",
        entityId: "warehouse-1",
        details: { changedFields: ["code", "name"] },
    });
});

test("master data: P2002 concorrente de armazém preserva 409 específico", async () => {
    const tx = {
        warehouse: {
            create: async () => {
                throw {
                    code: "P2002",
                    meta: { target: ["companyId", "code"] },
                };
            },
        },
        auditLog: { create: async () => assert.fail("não deve auditar") },
    };
    const { prisma } = buildTransactionHarness(
        {
            warehouse: {
                findUnique: async () => null,
                findFirst: async () => null,
            },
        },
        tx,
    );

    await assert.rejects(
        () =>
            createWarehouse(
                prisma,
                "company-1",
                { code: "A1", name: "Principal" },
                "user-1",
            ),
        { status: 409, code: "WAREHOUSE_CODE_EXISTS" },
    );
});

test("master data: localização confirma ownership e audita na mesma transação", async () => {
    const auditRows = [];
    const tx = {
        warehouse: {
            findFirst: async ({ where }) => {
                assert.deepEqual(where, {
                    id: "warehouse-1",
                    companyId: "company-1",
                });
                return { id: "warehouse-1" };
            },
        },
        warehouseLocation: {
            findUnique: async () => null,
            findFirst: async () => null,
            create: async ({ data }) => ({
                id: "location-1",
                isActive: true,
                ...data,
            }),
        },
        auditLog: {
            create: async ({ data }) => {
                auditRows.push(data);
                return { id: "audit-1", ...data };
            },
        },
    };
    const { prisma, getTransactionCount } = buildTransactionHarness({}, tx);

    const location = await createWarehouseLocation(
        prisma,
        "company-1",
        "warehouse-1",
        { code: "R1", name: "Receção" },
        "user-1",
    );

    assert.equal(getTransactionCount(), 1);
    assert.equal(location.id, "location-1");
    assert.deepEqual(auditRows[0], {
        companyId: "company-1",
        userId: "user-1",
        action: "WAREHOUSE_LOCATION_CREATED",
        entity: "WarehouseLocation",
        entityId: "location-1",
        details: { changedFields: ["code", "name"] },
    });
});

test("master data: P2002 concorrente de localização preserva 409 específico", async () => {
    const tx = {
        warehouse: { findFirst: async () => ({ id: "warehouse-1" }) },
        warehouseLocation: {
            findUnique: async () => null,
            findFirst: async () => null,
            create: async () => {
                throw {
                    code: "P2002",
                    meta: { target: ["warehouseId", "name"] },
                };
            },
        },
        auditLog: { create: async () => assert.fail("não deve auditar") },
    };
    const { prisma } = buildTransactionHarness({}, tx);

    await assert.rejects(
        () =>
            createWarehouseLocation(
                prisma,
                "company-1",
                "warehouse-1",
                { code: "R1", name: "Receção" },
                "user-1",
            ),
        { status: 409, code: "WAREHOUSE_LOCATION_NAME_EXISTS" },
    );
});
