/**
 * @file Testes de contrato MF1 para permissões e routers.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    hasPermission,
    Permission,
} from "../../src/modules/permissions/permissions.js";
import { buildVatRateRoutes } from "../../src/modules/vat-rates/vatRateRoutes.js";
import { buildSaleDocumentRoutes } from "../../src/modules/sales/saleDocumentRoutes.js";
import { buildReceiptRoutes } from "../../src/modules/receipts/receiptRoutes.js";
import { buildSalePostingRoutes } from "../../src/modules/accounting/salePostingRoutes.js";
import { buildSalesOpenItemsRoutes } from "../../src/modules/open-items/salesOpenItemsRoutes.js";
import { buildSaleApprovalRoutes } from "../../src/modules/sales-approval/saleApprovalRoutes.js";
import { buildPurchaseDocumentRoutes } from "../../src/modules/purchases/purchaseDocumentRoutes.js";
import { buildPaymentRoutes } from "../../src/modules/payments/paymentRoutes.js";
import { buildPurchasePostingRoutes } from "../../src/modules/accounting/purchasePostingRoutes.js";
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

test("MF1: permissões backend separam escrita operacional, aprovação e contabilidade", () => {
    assert.equal(hasPermission("ADMIN", Permission.SALES_APPROVE), true);
    assert.equal(hasPermission("GESTOR", Permission.PURCHASES_APPROVE), true);
    assert.equal(hasPermission("CONTABILISTA", Permission.ACCOUNTING_WRITE), true);
    assert.equal(hasPermission("OPERACIONAL", Permission.VAT_RATES_READ), true);
    assert.equal(hasPermission("OPERACIONAL", Permission.VAT_RATES_WRITE), false);
    assert.equal(hasPermission("OPERACIONAL", Permission.SALES_WRITE), true);
    assert.equal(hasPermission("OPERACIONAL", Permission.ACCOUNTING_WRITE), false);
    assert.equal(hasPermission("CONTABILISTA", Permission.SALES_APPROVE), false);
    assert.equal(hasPermission("AUDITOR", Permission.VAT_RATES_READ), true);
    assert.equal(hasPermission("AUDITOR", Permission.SALES_READ), true);
    assert.equal(hasPermission("AUDITOR", Permission.PURCHASES_WRITE), false);
});

test("MF1: routers principais montam sem dependências inexistentes", () => {
    const deps = { prisma: {} };
    const routers = [
        buildVatRateRoutes(deps),
        buildSaleDocumentRoutes(deps),
        buildReceiptRoutes(deps),
        buildSalePostingRoutes(deps),
        buildSalesOpenItemsRoutes(deps),
        buildSaleApprovalRoutes(deps),
        buildPurchaseDocumentRoutes(deps),
        buildPaymentRoutes(deps),
        buildPurchasePostingRoutes(deps),
        buildPurchaseApprovalRoutes(deps),
    ];

    assert.equal(routers.every((router) => typeof router === "function"), true);
});

test("MF1 HTTP: criar venda sem sessão devolve erro de autenticação", async () => {
    const response = await requestRouter(
        buildSaleDocumentRoutes({ prisma: {} }),
        {
            method: "POST",
            path: "/",
            body: { kind: "INVOICE" },
        },
    );

    assert.equal(response.status, 401);
    assert.equal(response.body.error, "SESSION_REQUIRED");
});

test("MF1 HTTP: operacional não pode aprovar venda", async () => {
    const response = await requestRouter(
        buildSaleApprovalRoutes({ prisma: prismaWithRole("OPERACIONAL") }),
        {
            method: "POST",
            path: "/sale-1/approve",
            cookie: "sid=session-1",
        },
    );

    assert.equal(response.status, 403);
    assert.equal(response.body.error, "PERMISSION_FORBIDDEN");
});

test("MF1 HTTP: pagamento em compra rascunho devolve regra de estado", async () => {
    const prisma = prismaWithRole("OPERACIONAL", {
        fiscalPeriod: {
            findFirst: async () => ({
                id: "period-1",
                status: "OPEN",
            }),
        },
        purchaseDocument: {
            findFirst: async () => ({
                id: "purchase-1",
                companyId: "company-1",
                kind: "SUPPLIER_INVOICE",
                status: "DRAFT",
                totalCents: 1000,
                amountPaidCents: 0,
            }),
        },
    });
    prisma.$transaction = async (callback) => callback(prisma);

    const response = await requestRouter(buildPaymentRoutes({ prisma }), {
        method: "POST",
        path: "/purchase-1/payments",
        cookie: "sid=session-1",
        body: {
            amountCents: 1000,
            paidAt: "2026-02-10",
            method: "BANK_TRANSFER",
        },
    });

    assert.equal(response.status, 409);
    assert.equal(response.body.error, "INVALID_STATUS");
});
