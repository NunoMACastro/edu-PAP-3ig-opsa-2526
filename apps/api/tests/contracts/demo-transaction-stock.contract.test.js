/**
 * @file Contratos públicos de Prisma, migration e endpoint de saldos da demo.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildStockMovementRoutes } from "../../src/modules/inventory/stockMovementRoutes.js";

const schema = readFileSync(
    new URL("../../prisma/schema.prisma", import.meta.url),
    "utf8",
);
const migration = readFileSync(
    new URL(
        "../../prisma/migrations/20260714120000_demo_transaction_stock/migration.sql",
        import.meta.url,
    ),
    "utf8",
);

/**
 * Recorta um model Prisma para asserções focadas e legíveis.
 *
 * @param {string} name - Nome do model.
 * @returns {string} Corpo textual do model.
 */
function prismaModel(name) {
    const match = schema.match(
        new RegExp(`model ${name} \\{[\\s\\S]*?\\n\\}`, "u"),
    );
    assert.ok(match, `Model Prisma em falta: ${name}`);
    return match[0];
}

test("schema publica warehouse, estado contabilístico e origem idempotente", () => {
    const sale = prismaModel("SaleDocument");
    const purchase = prismaModel("PurchaseDocument");
    const warehouse = prismaModel("Warehouse");
    const movement = prismaModel("StockMovement");

    assert.match(sale, /warehouseId\s+String\?/u);
    assert.match(sale, /postedAt\s+DateTime\?/u);
    assert.match(sale, /postedById\s+String\?/u);
    assert.match(sale, /@relation\("SaleDocumentWarehouse"/u);
    assert.match(purchase, /warehouseId\s+String\?/u);
    assert.match(purchase, /@relation\("PurchaseDocumentWarehouse"/u);
    assert.match(warehouse, /saleDocuments\s+SaleDocument\[\]/u);
    assert.match(warehouse, /purchaseDocuments\s+PurchaseDocument\[\]/u);
    assert.match(
        movement,
        /@@unique\(\[companyId, sourceType, sourceId\]\)/u,
    );
});

test("migration é expand-only, não escolhe armazém e valida duplicados antes da unique", () => {
    assert.match(migration, /ADD COLUMN "warehouseId" TEXT/u);
    assert.match(migration, /ADD COLUMN "postedAt" TIMESTAMP\(3\)/u);
    assert.match(migration, /ADD COLUMN "postedById" TEXT/u);
    assert.match(
        migration,
        /WHERE "sourceType" IS NOT NULL\s+AND "sourceId" IS NOT NULL/u,
    );
    assert.match(migration, /HAVING COUNT\(\*\) > 1/u);
    assert.match(
        migration,
        /CREATE UNIQUE INDEX "StockMovement_companyId_sourceType_sourceId_key"/u,
    );
    assert.match(migration, /ON DELETE SET NULL ON UPDATE CASCADE/u);
    assert.doesNotMatch(migration, /UPDATE\s+"(?:Sale|Purchase)Document"/iu);
    assert.doesNotMatch(migration, /WH-MAIN|LIMIT\s+1\s*;\s*UPDATE/iu);
    assert.doesNotMatch(migration, /NULLS NOT DISTINCT/iu);
});

/**
 * Executa um pedido contra um router Express isolado.
 *
 * @param {import("express").Router} router - Router em teste.
 * @param {object} options - Método, caminho e cookie.
 * @returns {Promise<{status: number, body: object}>} Resposta capturada.
 */
async function requestRouter(router, options) {
    return new Promise((resolve, reject) => {
        const req = {
            method: options.method,
            url: options.path,
            originalUrl: options.path,
            headers: options.cookie ? { cookie: options.cookie } : {},
            query: {},
        };
        const res = {
            statusCode: 200,
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(body) {
                resolve({ status: this.statusCode, body });
                return this;
            },
            setHeader() {},
            getHeader() {
                return undefined;
            },
            end(body) {
                resolve({ status: this.statusCode, body });
                return this;
            },
        };
        router.handle(req, res, (error) => {
            if (error) reject(error);
            else resolve({ status: 404, body: null });
        });
    });
}

test("GET /stock-balances exige sessão e devolve envelope paginado", async () => {
    const unauthenticated = await requestRouter(
        buildStockMovementRoutes({ prisma: {} }),
        { method: "GET", path: "/stock-balances" },
    );
    assert.equal(unauthenticated.status, 401);
    assert.equal(unauthenticated.body.error, "SESSION_REQUIRED");

    const prisma = {
        session: {
            findUnique: async () => ({
                id: "session-1",
                userId: "user-1",
                activeCompanyId: "company-1",
                expiresAt: new Date("2099-01-01T00:00:00.000Z"),
                revokedAt: null,
                user: {
                    id: "user-1",
                    email: "admin@example.test",
                    isActive: true,
                },
            }),
        },
        companyMembership: {
            findFirst: async () => ({
                role: "ADMIN",
                company: { id: "company-1", name: "Empresa PAP" },
            }),
        },
        stockBalance: { findMany: async () => [] },
    };
    const response = await requestRouter(
        buildStockMovementRoutes({ prisma }),
        {
            method: "GET",
            path: "/stock-balances",
            cookie: "sid=session-1",
        },
    );

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
        items: [],
        pageInfo: {
            nextCursor: null,
            hasNextPage: false,
            endCursor: null,
        },
    });
});
