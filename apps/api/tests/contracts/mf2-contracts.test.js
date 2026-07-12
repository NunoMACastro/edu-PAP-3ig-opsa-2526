/**
 * @file Testes de contrato MF2 para permissões e montagem de routers.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildAccountingReportRoutes } from "../../src/modules/accounting-reports/accountingReportRoutes.js";
import { buildManualJournalRoutes } from "../../src/modules/accounting/manualJournalRoutes.js";
import { buildFinancialStatementRoutes } from "../../src/modules/financial-statements/financialStatementRoutes.js";
import { buildFifoCostRoutes } from "../../src/modules/inventory/fifoCostRoutes.js";
import { buildInventoryCountRoutes } from "../../src/modules/inventory/inventoryCountRoutes.js";
import { buildStockAlertRoutes } from "../../src/modules/inventory/stockAlertRoutes.js";
import { buildStockMovementRoutes } from "../../src/modules/inventory/stockMovementRoutes.js";
import { hasPermission, Permission } from "../../src/modules/permissions/permissions.js";
import { buildPurchaseApprovalRoutes } from "../../src/modules/purchase-approval/purchaseApprovalRoutes.js";

const session = {
    id: "session-1",
    userId: "user-1",
    activeCompanyId: "company-1",
    expiresAt: new Date("2099-01-01T00:00:00.000Z"),
    revokedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    user: {
        id: "user-1",
        email: "user@example.test",
        name: "User",
        isActive: true,
    },
};

/**
 * Confirma se o router expõe uma rota esperada pelos testes de contrato.
 *
 * @param router - Router Express a inspecionar.
 * @param method - Método HTTP esperado.
 * @param path - Caminho HTTP esperado.
 * @returns Booleano que indica se a rota esperada existe.
 */
function hasRoute(router, method, path) {
    return router.stack.some(
        (layer) => layer.route?.path === path && layer.route.methods[method],
    );
}

function routeHandler(router, method, path) {
    const layer = router.stack.find(
        (candidate) => candidate.route?.path === path && candidate.route.methods[method],
    );
    assert.ok(layer, `${method.toUpperCase()} ${path} em falta`);
    return layer.route.stack.at(-1).handle;
}

/**
 * Cria um mock Prisma com permissões específicas para validar contratos de autorização.
 *
 * @param role - Papel funcional simulado no contexto da empresa.
 * @param overrides - Valores parciais que substituem o mock padrão.
 * @returns Mock Prisma configurado com permissões e papel funcional.
 */
function prismaWithRole(role, overrides = {}) {
    const prisma = {
        session: { findUnique: async () => session },
        companyMembership: {
            findFirst: async () => ({
                role,
                company: {
                    id: "company-1",
                    name: "Empresa Teste",
                    nif: "500000000",
                },
            }),
        },
    };

    return { ...prisma, ...overrides };
}

/**
 * Executa um pedido HTTP contra um router Express isolado para testes de contrato.
 *
 * @param router - Router Express isolado usado no teste.
 * @param options - Pedido simulado com método, caminho, cookie e body.
 * @returns Resposta HTTP simulada devolvida pelo router.
 */
async function requestRouter(router, { method, path, cookie, body } = {}) {
    return new Promise((resolve, reject) => {
        const req = {
            method,
            url: path,
            originalUrl: path,
            headers: cookie ? { cookie } : {},
            body,
        };
        const res = {
            statusCode: 200,
            headers: {},
            setHeader(name, value) {
                this.headers[name] = value;
            },
            getHeader(name) {
                return this.headers[name];
            },
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(payload) {
                resolve({ status: this.statusCode, body: payload });
                return this;
            },
            end(payload) {
                resolve({ status: this.statusCode, body: payload ?? null });
                return this;
            },
        };

        router.handle(req, res, (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve({ status: 404, body: null });
        });
    });
}

test("MF2: permissões backend incluem leitura e escrita de inventário por role", () => {
    assert.equal(hasPermission("ADMIN", Permission.INVENTORY_WRITE), true);
    assert.equal(hasPermission("GESTOR", Permission.INVENTORY_WRITE), true);
    assert.equal(hasPermission("OPERACIONAL", Permission.INVENTORY_WRITE), true);
    assert.equal(hasPermission("CONTABILISTA", Permission.INVENTORY_READ), true);
    assert.equal(hasPermission("AUDITOR", Permission.INVENTORY_READ), true);
    assert.equal(hasPermission("AUDITOR", Permission.INVENTORY_WRITE), false);
});

test("BK-MF2-07/BK-MF2-08: gestor pode consultar reporting financeiro", () => {
    assert.equal(hasPermission("GESTOR", Permission.ACCOUNTING_READ), true);
    assert.equal(hasPermission("GESTOR", Permission.ACCOUNTING_WRITE), false);
});

test("MF2: routers principais montam sem dependências inexistentes", () => {
    const deps = { prisma: {}, objectStorage: {} };
    const routers = [
        buildPurchaseApprovalRoutes(deps),
        buildStockMovementRoutes(deps),
        buildFifoCostRoutes(deps),
        buildInventoryCountRoutes(deps),
        buildStockAlertRoutes(deps),
        buildManualJournalRoutes(deps),
        buildAccountingReportRoutes(deps),
        buildFinancialStatementRoutes(deps),
    ];

    assert.equal(routers.every((router) => typeof router === "function"), true);
});

test("BK-MF2-04: router de contagens expõe edição de linhas em rascunho", () => {
    const router = buildInventoryCountRoutes({ prisma: {} });

    assert.equal(hasRoute(router, "patch", "/counts/:id/lines"), true);
});

test("BK-MF2-01: router de compras expõe reprovação e histórico", () => {
    const router = buildPurchaseApprovalRoutes({ prisma: {} });

    assert.equal(hasRoute(router, "post", "/:id/reject"), true);
    assert.equal(hasRoute(router, "get", "/:id/approval-history"), true);
});

test("BK-MF2-01 HTTP: auditor consulta histórico sem poder aprovar", async () => {
    const history = [{ id: "history-1", action: "APPROVED" }];
    const prisma = prismaWithRole("AUDITOR", {
        purchaseDocument: {
            findFirst: async ({ where }) => {
                assert.deepEqual(where, { id: "purchase-1", companyId: "company-1" });
                return { id: "purchase-1", companyId: "company-1" };
            },
        },
        purchaseApprovalHistory: {
            findMany: async ({ where, orderBy }) => {
                assert.deepEqual(where, {
                    companyId: "company-1",
                    purchaseDocumentId: "purchase-1",
                });
                assert.deepEqual(orderBy, { decidedAt: "asc" });
                return history;
            },
        },
    });

    const historyResponse = await requestRouter(
        buildPurchaseApprovalRoutes({ prisma }),
        {
            method: "GET",
            path: "/purchase-1/approval-history",
            cookie: "sid=session-1",
        },
    );
    const approveResponse = await requestRouter(
        buildPurchaseApprovalRoutes({ prisma }),
        {
            method: "POST",
            path: "/purchase-1/approve",
            cookie: "sid=session-1",
        },
    );

    assert.equal(historyResponse.status, 200);
    assert.deepEqual(historyResponse.body.history, history);
    assert.equal(approveResponse.status, 403);
    assert.equal(approveResponse.body.error, "PERMISSION_FORBIDDEN");
});

test("BK-MF2-06: router de lançamentos manuais expõe anexos privados", () => {
    const router = buildManualJournalRoutes({ prisma: {}, objectStorage: {} });

    assert.equal(hasRoute(router, "get", "/"), true);
    assert.equal(hasRoute(router, "post", "/:id/attachments"), true);
    assert.equal(
        hasRoute(router, "get", "/:journalId/attachments/:attachmentId/download"),
        true,
    );
});

test("P0-MF2-MIG-01: migration MF2 cria tabelas persistentes da macrofase", () => {
    const migration = readFileSync(
        new URL("../../prisma/migrations/20260611120000_mf2_schema/migration.sql", import.meta.url),
        "utf8",
    );

    assert.match(migration, /ALTER TYPE "PurchaseDocumentStatus" ADD VALUE 'REJECTED'/);
    assert.match(migration, /CREATE TABLE "StockMovement"/);
    assert.match(migration, /CREATE TABLE "InventoryCount"/);
    assert.match(migration, /CREATE TABLE "JournalAttachment"/);
});

test("P2-002/P2-011: migration indexa listagem paginada de lançamentos manuais", () => {
    const migration = readFileSync(
        new URL(
            "../../prisma/migrations/20260710090000_critical_listing_pagination/migration.sql",
            import.meta.url,
        ),
        "utf8",
    );

    assert.match(
        migration,
        /"JournalEntry"\("companyId", "source", "entryDate", "id"\)/,
    );
    assert.match(
        migration,
        /"SaleDocument"\("companyId", "status", "kind", "dueDate", "issuedAt", "id"\)/,
    );
    assert.match(
        migration,
        /"JournalEntryLine"\("accountId", "journalEntryId", "id"\)/,
    );
});

test("P2-017: migration de idempotência de anexos é expand-only", () => {
    const migration = readFileSync(
        new URL(
            "../../prisma/migrations/20260710120000_attachment_content_idempotency/migration.sql",
            import.meta.url,
        ),
        "utf8",
    );

    assert.match(migration, /ADD COLUMN "idempotencyKey" TEXT/);
    assert.match(
        migration,
        /ON "JournalAttachment"\("companyId", "journalEntryId", "idempotencyKey"\)/,
    );
    assert.doesNotMatch(migration, /\bUPDATE\s+"JournalAttachment"/i);
    assert.doesNotMatch(migration, /"idempotencyKey"\s+TEXT\s+NOT NULL/i);
    assert.doesNotMatch(migration, /"idempotencyKey"\s+TEXT\s+DEFAULT/i);
});

test("anexo manual só responde 201 depois de confirmar cleanup", async () => {
    const events = [];
    const quarantinePath = `/tmp/opsa-manual-route-${randomUUID()}`;
    const router = buildManualJournalRoutes({
        prisma: {},
        objectStorage: {},
        multipartParser: async () => ({
            fields: {},
            file: { tempPath: `${quarantinePath}/file.pdf` },
            quarantinePath,
            cleanup: async () => {
                events.push("cleanup");
            },
        }),
        attachmentCreator: async () => {
            events.push("persist");
            return { id: "attachment-1" };
        },
    });
    const handler = routeHandler(router, "post", "/:id/attachments");
    const response = {
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            events.push(`response:${this.statusCode}`);
            this.body = body;
            return this;
        },
    };

    await handler({
        is: () => true,
        companyId: "company-1",
        user: { id: "user-1" },
        params: { id: "journal-1" },
    }, response);

    assert.deepEqual(events, ["persist", "cleanup", "response:201"]);
    assert.equal(response.body.attachment.id, "attachment-1");
});

test("falha de cleanup do anexo impede resposta 201", async () => {
    const events = [];
    const quarantinePath = `/tmp/opsa-manual-route-${randomUUID()}`;
    const router = buildManualJournalRoutes({
        prisma: {},
        objectStorage: {},
        multipartParser: async () => ({
            fields: {},
            file: { tempPath: `${quarantinePath}/file.pdf` },
            quarantinePath,
            cleanup: async () => {
                events.push("cleanup-failed");
                throw new Error("cleanup failed");
            },
        }),
        attachmentCreator: async () => ({ id: "attachment-1" }),
    });
    const handler = routeHandler(router, "post", "/:id/attachments");
    const response = {
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            events.push(`response:${this.statusCode}`);
            this.body = body;
            return this;
        },
    };

    await handler({
        is: () => true,
        companyId: "company-1",
        user: { id: "user-1" },
        params: { id: "journal-1" },
    }, response);

    assert.deepEqual(events, ["cleanup-failed", "response:500"]);
    assert.equal(response.body.error, "INTERNAL_ERROR");
});

test("retry após cleanup local falhado reutiliza o anexo criado", async () => {
    const quarantinePath = `/tmp/opsa-manual-route-${randomUUID()}`;
    const activeAttachments = new Map();
    let cleanupAttempts = 0;
    let creatorCalls = 0;
    const router = buildManualJournalRoutes({
        prisma: {},
        objectStorage: {},
        multipartParser: async () => ({
            fields: {},
            file: {
                tempPath: `${quarantinePath}/file.pdf`,
                sha256: "7".repeat(64),
            },
            quarantinePath,
            cleanup: async () => {
                cleanupAttempts += 1;
                if (cleanupAttempts === 1) throw new Error("cleanup failed");
            },
        }),
        attachmentCreator: async (_prisma, _storage, _companyId, _userId, journalId, file) => {
            creatorCalls += 1;
            const key = `${journalId}:${file.sha256}`;
            if (!activeAttachments.has(key)) {
                activeAttachments.set(key, { id: "attachment-idempotent" });
            }
            return activeAttachments.get(key);
        },
    });
    const handler = routeHandler(router, "post", "/:id/attachments");
    const makeResponse = () => ({
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    });
    const request = {
        is: () => true,
        companyId: "company-1",
        user: { id: "user-1" },
        params: { id: "journal-1" },
    };
    const firstResponse = makeResponse();
    const retryResponse = makeResponse();

    await handler(request, firstResponse);
    await handler(request, retryResponse);

    assert.equal(firstResponse.statusCode, 500);
    assert.equal(firstResponse.body.error, "INTERNAL_ERROR");
    assert.equal(retryResponse.statusCode, 201);
    assert.equal(retryResponse.body.attachment.id, "attachment-idempotent");
    assert.equal(activeAttachments.size, 1);
    assert.equal(creatorCalls, 2);
    assert.equal(cleanupAttempts, 2);
});
