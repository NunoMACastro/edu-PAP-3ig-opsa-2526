/**
 * @file Contratos HTTP dos envelopes paginados de reporting e lançamentos MF2.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { buildAccountingReportRoutes } from "../../src/modules/accounting-reports/accountingReportRoutes.js";
import { buildManualJournalRoutes } from "../../src/modules/accounting/manualJournalRoutes.js";

/**
 * Executa apenas o handler funcional de uma rota já montada.
 * Os contratos de autorização permanecem cobertos em `mf2-contracts.test.js`.
 *
 * @param {import("express").Router} router - Router a inspecionar.
 * @param {string} path - Path Express literal.
 * @param {object} request - Pedido já autenticado pelo boundary de teste.
 * @returns {Promise<{status: number, body: object}>} Resposta capturada.
 */
async function executeGetHandler(router, path, request) {
    const layer = router.stack.find(
        (candidate) => candidate.route?.path === path && candidate.route.methods.get,
    );
    assert.ok(layer, `GET ${path} em falta`);
    const handler = layer.route.stack.at(-1).handle;
    const response = {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
    await handler(request, response);
    return { status: response.statusCode, body: response.body };
}

test("P2-011: balancete devolve items/pageInfo e preserva metadata do relatório", async () => {
    const prisma = {
        account: {
            findMany: async () => [{ id: "account-1", code: "11", name: "Caixa" }],
        },
        journalEntryLine: {
            groupBy: async () => [{
                accountId: "account-1",
                _sum: { debitCents: 1000, creditCents: 0 },
            }],
            aggregate: async () => ({
                _sum: { debitCents: 1000, creditCents: 0 },
            }),
        },
    };
    const response = await executeGetHandler(
        buildAccountingReportRoutes({ prisma }),
        "/trial-balance",
        {
            companyId: "company-1",
            query: { from: "2026-01-01", to: "2026-12-31", limit: "25" },
        },
    );

    assert.equal(response.status, 200);
    assert.equal(response.body.items.length, 1);
    assert.deepEqual(response.body.pageInfo, {
        nextCursor: null,
        hasNextPage: false,
    });
    assert.deepEqual(response.body.trialBalance.rows, response.body.items);
    assert.equal(response.body.trialBalance.totals.balanceCents, 1000);
});

test("P2-011: razão devolve saldo acumulado e cursor sem carregar o período inteiro", async () => {
    const prisma = {
        account: {
            findFirst: async () => ({ id: "account-1", code: "11", name: "Caixa" }),
        },
        journalEntryLine: {
            findMany: async ({ take }) => {
                assert.equal(take, 2);
                return [
                    {
                        id: "line-1",
                        journalEntryId: "journal-1",
                        debitCents: 1000,
                        creditCents: 0,
                        memo: null,
                        journalEntry: {
                            entryDate: new Date("2026-01-01T00:00:00.000Z"),
                            description: "Abertura",
                            source: "MANUAL",
                            sourceId: "source-1",
                        },
                    },
                    {
                        id: "line-2",
                        journalEntryId: "journal-2",
                        debitCents: 0,
                        creditCents: 250,
                        memo: null,
                        journalEntry: {
                            entryDate: new Date("2026-01-02T00:00:00.000Z"),
                            description: "Movimento seguinte",
                            source: "MANUAL",
                            sourceId: "source-2",
                        },
                    },
                ];
            },
            aggregate: async () => ({
                _sum: { debitCents: 1000, creditCents: 250 },
            }),
        },
    };
    const response = await executeGetHandler(
        buildAccountingReportRoutes({ prisma }),
        "/ledger",
        {
            companyId: "company-1",
            query: {
                accountId: "account-1",
                from: "2026-01-01",
                to: "2026-12-31",
                limit: "1",
            },
        },
    );

    assert.equal(response.status, 200);
    assert.equal(response.body.items.length, 1);
    assert.equal(response.body.items[0].balanceCents, 1000);
    assert.equal(response.body.pageInfo.hasNextPage, true);
    assert.deepEqual(response.body.ledger.rows, response.body.items);
});

test("P2-002/P2-011: lançamentos manuais devolvem referências legíveis paginadas", async () => {
    const prisma = {
        journalEntry: {
            findMany: async () => [{
                id: "journal-1",
                entryDate: new Date("2026-07-10T00:00:00.000Z"),
                description: "Reclassificação contabilística",
                createdAt: new Date("2026-07-10T10:00:00.000Z"),
                _count: { lines: 2, attachments: 0 },
            }],
        },
    };
    const response = await executeGetHandler(
        buildManualJournalRoutes({ prisma, objectStorage: {} }),
        "/",
        { companyId: "company-1", query: { limit: "25" } },
    );

    assert.equal(response.status, 200);
    assert.equal(response.body.items[0].status, "POSTED");
    assert.equal(
        response.body.items[0].reference,
        "2026-07-10 — Reclassificação contabilística",
    );
    assert.deepEqual(response.body.journalEntries, response.body.items);
    assert.deepEqual(response.body.pageInfo, {
        nextCursor: null,
        hasNextPage: false,
    });
});
