/**
 * @file Testes de contrato MF7 para exportações CSV/XLSX/PDF.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { buildAccountingReportRoutes } from "../../src/modules/accounting-reports/accountingReportRoutes.js";
import {
    buildTabularExport,
    neutralizeSpreadsheetCell,
    normalizeExportFormat,
} from "../../src/modules/exports/exportFormatService.js";

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
 * Confirma se o router expõe uma rota esperada.
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

/**
 * Executa um pedido HTTP contra um router Express isolado.
 *
 * @param router - Router Express isolado.
 * @param {{ method: string, path: string, query?: object, cookie?: string }} input - Pedido simulado.
 * @returns {Promise<{ status: number, headers: object, body: unknown }>} Resposta simulada.
 */
async function requestRouter(router, input) {
    return new Promise((resolve, reject) => {
        const req = {
            method: input.method,
            url: input.path,
            originalUrl: input.path,
            headers: input.cookie ? { cookie: input.cookie } : {},
            query: input.query ?? {},
        };
        const res = {
            statusCode: 200,
            headers: {},
            setHeader(name, value) {
                this.headers[name] = value;
            },
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(payload) {
                resolve({ status: this.statusCode, headers: this.headers, body: payload });
                return this;
            },
            end(payload) {
                resolve({ status: this.statusCode, headers: this.headers, body: payload });
                return this;
            },
        };

        router.handle(req, res, (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve({ status: 404, headers: res.headers, body: null });
        });
    });
}

/**
 * Cria Prisma mockado com contexto multiempresa e dados contabilísticos mínimos.
 *
 * @returns {object} Mock Prisma para testes de contrato.
 */
function buildPrismaMock() {
    return {
        session: { findUnique: async () => session },
        companyMembership: {
            findFirst: async ({ where }) => {
                assert.equal(where.userId, "user-1");
                assert.equal(where.companyId, "company-1");
                return {
                    role: "GESTOR",
                    company: {
                        id: "company-1",
                        name: "Empresa Teste",
                        nif: "500000000",
                    },
                };
            },
        },
        account: {
            findMany: async ({ where, orderBy }) => {
                assert.deepEqual(where, { companyId: "company-1", isActive: true });
                assert.deepEqual(orderBy, { code: "asc" });
                return [
                    {
                        id: "account-1",
                        code: "12",
                        name: "=Nome perigoso",
                    },
                ];
            },
            findFirst: async () => ({
                id: "account-1",
                code: "12",
                name: "Banco",
                isActive: true,
            }),
        },
        journalEntryLine: {
            findMany: async () => [],
        },
    };
}

test("BK-MF7-05: router expõe endpoints novos de exportação por formato", () => {
    const router = buildAccountingReportRoutes({ prisma: {} });

    assert.equal(hasRoute(router, "get", "/trial-balance/export"), true);
    assert.equal(hasRoute(router, "get", "/ledger/export"), true);
    assert.equal(hasRoute(router, "get", "/trial-balance.xlsx"), true);
    assert.equal(hasRoute(router, "get", "/ledger.pdf"), true);
});

test("BK-MF7-05: formatos inválidos são rejeitados antes de gerar ficheiro", () => {
    assert.equal(normalizeExportFormat("CSV"), "csv");
    assert.throws(() => normalizeExportFormat("xml"), {
        code: "INVALID_EXPORT_FORMAT",
    });
});

test("BK-MF7-05: CSV neutraliza células com fórmulas", async () => {
    const file = await buildTabularExport({
        format: "csv",
        baseName: "Balancete Seguro",
        sheetName: "Balancete",
        title: "Balancete",
        source: "Teste",
        columns: [{ key: "name", label: "Nome" }],
        rows: [{ name: "=SUM(1,1)" }],
    });

    assert.equal(file.fileName, "balancete-seguro.csv");
    assert.equal(file.contentType, "text/csv; charset=utf-8");
    assert.equal(neutralizeSpreadsheetCell("@risco"), "'@risco");
    assert.match(file.buffer.toString("utf8"), /'=SUM\(1,1\)/);
});

test("BK-MF7-05 HTTP: balancete CSV usa empresa da sessão e headers de download", async () => {
    const response = await requestRouter(
        buildAccountingReportRoutes({ prisma: buildPrismaMock() }),
        {
            method: "GET",
            path: "/trial-balance/export",
            query: {
                from: "2026-01-01",
                to: "2026-01-31",
                format: "csv",
            },
            cookie: "sid=session-1",
        },
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers["Content-Type"], "text/csv; charset=utf-8");
    assert.equal(
        response.headers["Content-Disposition"],
        'attachment; filename="balancete.csv"',
    );
    assert.match(response.body.toString("utf8"), /'=\s*Nome perigoso|\'=Nome perigoso/);
});
