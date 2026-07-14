/**
 * @file Prova focada de cursor pagination nas listagens críticas da API.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { listAccounts } from "../../src/modules/accounting/accounts/accountService.js";
import {
    buildLedger,
    buildTrialBalance,
} from "../../src/modules/accounting-reports/accountingReportService.js";
import { listManualJournals } from "../../src/modules/accounting/manualJournalService.js";
import { listAuditLogs } from "../../src/modules/audit/auditLogService.js";
import { listCustomers } from "../../src/modules/customers/customerService.js";
import { listStockMovements } from "../../src/modules/inventory/stockMovementService.js";
import { listItems } from "../../src/modules/items/itemService.js";
import { buildIncomeStatement } from "../../src/modules/financial-statements/financialStatementService.js";
import { listSalesOpenItems } from "../../src/modules/open-items/salesOpenItemsService.js";
import { listPurchaseDocuments } from "../../src/modules/purchases/purchaseDocumentService.js";
import { listSaleDocuments } from "../../src/modules/sales/saleDocumentService.js";
import { listSuppliers } from "../../src/modules/suppliers/supplierService.js";

/**
 * Cria três registos ordenáveis para confirmar o padrão `limit + 1`.
 *
 * @param {"name" | "sku" | "code" | "issuedAt" | "createdAt"} field - Campo de ordenação.
 * @returns {object[]} Registos mínimos.
 */
function recordsFor(field) {
    return Array.from({ length: 3 }, (_, index) => ({
        id: `record-${index + 1}`,
        [field]: ["issuedAt", "createdAt"].includes(field)
            ? new Date(`2026-07-0${index + 1}T00:00:00.000Z`)
            : `${index + 1}`,
        quantity: index + 1,
        isActive: true,
        details: index === 0 ? { token: "must-not-leak" } : null,
    }));
}

/**
 * Cria um model Prisma que regista a query e devolve três itens.
 *
 * @param {string} field - Campo presente nos registos.
 * @returns {{ calls: object[], model: { findMany(args: object): Promise<object[]> } }} Double e chamadas.
 */
function paginatedModel(field) {
    const calls = [];
    return {
        calls,
        model: {
            async findMany(args) {
                calls.push(args);
                return recordsFor(field);
            },
        },
    };
}

test("listagens mestre usam envelope e no máximo limit + 1 na query", async () => {
    const customer = paginatedModel("name");
    const supplier = paginatedModel("name");
    const item = paginatedModel("sku");
    const account = paginatedModel("code");
    const prisma = {
        customer: customer.model,
        supplier: supplier.model,
        item: item.model,
        account: account.model,
    };

    const pages = await Promise.all([
        listCustomers(prisma, "company-1", { limit: 2 }),
        listSuppliers(prisma, "company-1", { limit: 2 }),
        listItems(prisma, "company-1", { limit: 2 }),
        listAccounts(prisma, "company-1", { limit: 2 }),
    ]);

    for (const page of pages) {
        assert.equal(page.items.length, 2);
        assert.equal(page.pageInfo.hasNextPage, true);
        assert.equal(typeof page.pageInfo.nextCursor, "string");
    }
    for (const calls of [customer.calls, supplier.calls, item.calls, account.calls]) {
        assert.equal(calls[0].take, 3);
        assert.equal(calls[0].where.companyId, "company-1");
    }
});

test("documentos, stock e auditoria usam paginação temporal estável", async () => {
    const saleDocument = paginatedModel("issuedAt");
    const purchaseDocument = paginatedModel("issuedAt");
    const stockMovement = paginatedModel("createdAt");
    const auditLog = paginatedModel("createdAt");
    const prisma = {
        saleDocument: saleDocument.model,
        purchaseDocument: purchaseDocument.model,
        stockMovement: stockMovement.model,
        auditLog: auditLog.model,
    };

    const pages = await Promise.all([
        listSaleDocuments(prisma, "company-1", { limit: 2 }),
        listPurchaseDocuments(prisma, "company-1", { limit: 2 }),
        listStockMovements(prisma, "company-1", { limit: 2 }),
        listAuditLogs(prisma, { companyId: "company-1", limit: 2 }),
    ]);

    for (const page of pages) {
        assert.equal(page.items.length, 2);
        assert.equal(page.pageInfo.hasNextPage, true);
    }
    assert.equal(pages[3].items[0].details.token, "[redigido]");
    assert.deepEqual(saleDocument.calls[0].orderBy, [
        { issuedAt: "desc" },
        { id: "desc" },
    ]);
    assert.deepEqual(auditLog.calls[0].orderBy, [
        { createdAt: "desc" },
        { id: "desc" },
    ]);
});

test("lançamentos manuais usam envelope, company scope e referência legível", async () => {
    const calls = [];
    const prisma = {
        journalEntry: {
            async findMany(args) {
                calls.push(args);
                return [
                    {
                        id: "journal-2",
                        entryDate: new Date("2026-07-02T00:00:00.000Z"),
                        description: "Reclassificação de caixa",
                        createdAt: new Date("2026-07-02T10:00:00.000Z"),
                        _count: { lines: 2, attachments: 1 },
                    },
                    {
                        id: "journal-1",
                        entryDate: new Date("2026-07-01T00:00:00.000Z"),
                        description: "Abertura",
                        createdAt: new Date("2026-07-01T10:00:00.000Z"),
                        _count: { lines: 2, attachments: 0 },
                    },
                ];
            },
        },
    };

    const page = await listManualJournals(prisma, "company-1", { limit: 1 });

    assert.equal(page.items.length, 1);
    assert.equal(page.items[0].status, "POSTED");
    assert.equal(
        page.items[0].reference,
        "2026-07-02 — Reclassificação de caixa",
    );
    assert.equal(page.pageInfo.hasNextPage, true);
    assert.deepEqual(calls[0].where, {
        companyId: "company-1",
        source: "MANUAL",
    });
    assert.equal(calls[0].take, 2);
    assert.deepEqual(calls[0].orderBy, [
        { entryDate: "desc" },
        { id: "desc" },
    ]);
});

test("títulos em aberto preservam ordem de vencimento com query limitada", async () => {
    const calls = [];
    const documents = Array.from({ length: 3 }, (_, index) => ({
        id: `sale-${index + 1}`,
        number: `FT 2026/${index + 1}`,
        customer: { name: `Cliente ${index + 1}` },
        issuedAt: new Date(`2026-01-0${index + 1}T00:00:00.000Z`),
        dueDate: new Date(`2026-02-0${index + 1}T00:00:00.000Z`),
        totalCents: 1000,
        amountPaidCents: 0,
    }));
    const prisma = {
        saleDocument: {
            async findMany(args) {
                calls.push(args);
                return documents;
            },
        },
    };

    const page = await listSalesOpenItems(prisma, "company-1", {
        asOfDate: "2026-03-01",
        limit: 2,
    });

    assert.equal(page.items.length, 2);
    assert.equal(page.pageInfo.hasNextPage, true);
    assert.equal(calls[0].take, 3);
    assert.deepEqual(calls[0].orderBy, [
        { dueDate: { sort: "asc", nulls: "last" } },
        { issuedAt: "asc" },
        { id: "asc" },
    ]);
});

test("balancete e razão agregam totais sem listagens ilimitadas", async () => {
    const from = new Date("2026-01-01T00:00:00.000Z");
    const to = new Date("2026-12-31T00:00:00.000Z");
    const accountCalls = [];
    const lineCalls = [];
    const accounts = Array.from({ length: 3 }, (_, index) => ({
        id: `account-${index + 1}`,
        code: `${index + 1}1`,
        name: `Conta ${index + 1}`,
    }));
    const ledgerLines = Array.from({ length: 3 }, (_, index) => ({
        id: `line-${index + 1}`,
        journalEntryId: `journal-${index + 1}`,
        debitCents: index === 0 ? 1000 : 0,
        creditCents: index === 0 ? 0 : 500,
        memo: null,
        journalEntry: {
            entryDate: new Date(`2026-01-0${index + 1}T00:00:00.000Z`),
            description: `Movimento ${index + 1}`,
            source: "MANUAL",
            sourceId: `source-${index + 1}`,
        },
    }));
    const prisma = {
        account: {
            async findMany(args) {
                accountCalls.push(args);
                return accounts;
            },
            async findFirst() {
                return accounts[0];
            },
        },
        journalEntryLine: {
            async groupBy() {
                return [
                    { accountId: "account-1", _sum: { debitCents: 1000, creditCents: 0 } },
                    { accountId: "account-2", _sum: { debitCents: 0, creditCents: 500 } },
                ];
            },
            async aggregate(args) {
                lineCalls.push(["aggregate", args]);
                return { _sum: { debitCents: 1000, creditCents: 1000 } };
            },
            async findMany(args) {
                lineCalls.push(["findMany", args]);
                return ledgerLines;
            },
        },
    };

    const trialBalance = await buildTrialBalance(prisma, {
        companyId: "company-1",
        from,
        to,
        limit: 2,
    });
    const ledger = await buildLedger(prisma, {
        companyId: "company-1",
        accountId: "account-1",
        from,
        to,
        limit: 2,
    });

    assert.equal(trialBalance.rows.length, 2);
    assert.equal(trialBalance.pageInfo.hasNextPage, true);
    assert.equal(accountCalls[0].take, 3);
    assert.equal(ledger.rows.length, 2);
    assert.equal(ledger.pageInfo.hasNextPage, true);
    const ledgerQuery = lineCalls.find(([kind]) => kind === "findMany")[1];
    assert.equal(ledgerQuery.take, 3);
    assert.deepEqual(ledgerQuery.orderBy, [
        { journalEntry: { entryDate: "asc" } },
        { id: "asc" },
    ]);
});

test("demonstrações financeiras percorrem todas as páginas internas do balancete", async () => {
    const accounts = Array.from({ length: 101 }, (_, index) => ({
        id: `account-${index + 1}`,
        code: `7${String(index + 1).padStart(3, "0")}`,
        name: `Rendimento ${index + 1}`,
    }));
    let accountQueries = 0;
    const prisma = {
        account: {
            async findMany({ where }) {
                accountQueries += 1;
                return where.AND ? accounts.slice(100) : accounts;
            },
        },
        journalEntryLine: {
            async groupBy({ where }) {
                return where.AND[1].accountId.in.map((accountId) => ({
                    accountId,
                    _sum: { debitCents: 0, creditCents: 100 },
                }));
            },
            async aggregate() {
                return { _sum: { debitCents: 0, creditCents: 10_100 } };
            },
        },
    };

    const statement = await buildIncomeStatement(prisma, {
        companyId: "company-1",
        from: new Date("2026-01-01T00:00:00.000Z"),
        to: new Date("2026-12-31T00:00:00.000Z"),
    });

    assert.equal(accountQueries, 2);
    assert.equal(statement.sections[0].accounts.length, 101);
    assert.equal(statement.sections[0].totalCents, 10_100);
    assert.equal(statement.netIncomeCents, 10_100);
});
