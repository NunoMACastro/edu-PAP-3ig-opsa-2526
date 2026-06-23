/**
 * @file Testes unitários das regras críticas da MF3.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { validateBusinessImportPayload, parseCsvRows } from "../../src/modules/imports/businessImportValidators.js";
import { buildExecutiveKpis } from "../../src/modules/reports/executiveKpiService.js";
import { buildOperationalReport } from "../../src/modules/reports/operationalReportService.js";
import { buildVatMap } from "../../src/modules/tax/vatMapService.js";
import { validateVatMapQuery } from "../../src/modules/tax/vatMapFilters.js";
import { importBankStatement } from "../../src/modules/treasury/statementImportService.js";
import { isValidIban, validateTreasuryAccountPayload } from "../../src/modules/treasury/bankAccountValidators.js";
import { validateForecastQuery } from "../../src/modules/treasury/cashflowForecastFilters.js";
import { validateStatementImportPayload } from "../../src/modules/treasury/statementImportValidators.js";

test("BK-MF3-02: conta bancária exige IBAN válido", () => {
    assert.equal(isValidIban("PT50000201231234567890154"), true);
    assert.throws(
        () =>
            validateTreasuryAccountPayload({
                type: "BANK",
                name: "Banco principal",
                initialBalanceCents: 0,
            }),
        { code: "INVALID_IBAN" },
    );
});

test("BK-MF3-03: CSV de extrato é parseado para cêntimos e linhas", () => {
    const parsed = validateStatementImportPayload({
        treasuryAccountId: "treasury-1",
        format: "CSV",
        content: "data;descricao;referencia;valor\n2026-06-01;Recebimento;R1;125,50",
    });

    assert.equal(parsed.rows.length, 1);
    assert.equal(parsed.rows[0].amountCents, 12550);
    assert.equal(parsed.rows[0].reference, "R1");
});

test("BK-MF3-03: importação deduplica linhas e mantém sugestões SUGGESTED", async () => {
    const statementImports = [];
    const createdLines = [];
    const createdSuggestions = [];
    const tx = {
        treasuryAccount: {
            findFirst: async () => ({ id: "treasury-1" }),
        },
        bankStatementImport: {
            create: async ({ data }) => {
                const row = { id: "import-1", ...data };
                statementImports.push(row);
                return row;
            },
        },
        bankStatementLine: {
            create: async ({ data }) => {
                const row = { id: `line-${createdLines.length + 1}`, ...data };
                createdLines.push(row);
                return row;
            },
        },
        receipt: {
            findMany: async () => [
                {
                    id: "receipt-1",
                    amountCents: 12500,
                    receivedAt: new Date("2026-06-01"),
                    reference: "R1",
                },
            ],
        },
        payment: { findMany: async () => [] },
        bankReconciliationSuggestion: {
            create: async ({ data }) => {
                const row = { id: `suggestion-${createdSuggestions.length + 1}`, ...data };
                createdSuggestions.push(row);
                return row;
            },
        },
        auditLog: { create: async () => ({ id: "audit-1" }) },
        integrationLog: { create: async () => ({ id: "integration-log-1" }) },
    };
    const prisma = {
        $transaction: async (callback) => callback(tx),
    };

    const result = await importBankStatement(prisma, {
        companyId: "company-1",
        userId: "user-1",
        input: {
            treasuryAccountId: "treasury-1",
            format: "CSV",
            content:
                "data;descricao;referencia;valor\n" +
                "2026-06-01;Recebimento;R1;125,00\n" +
                "2026-06-01;Recebimento;R1;125,00",
        },
    });

    assert.equal(statementImports[0].status, "PARTIAL");
    assert.equal(statementImports[0].acceptedLines, 1);
    assert.equal(statementImports[0].rejectedLines, 1);
    assert.equal(statementImports[0].errors[0].code, "DUPLICATE_STATEMENT_LINE");
    assert.equal(createdLines.length, 1);
    assert.equal(result.lines.length, 1);
    assert.equal(createdSuggestions[0].status, "SUGGESTED");
});

test("BK-MF3-04: previsão bloqueia intervalo inclusivo superior a 180 dias", () => {
    assert.doesNotThrow(() =>
        validateForecastQuery({ from: "2026-01-01", to: "2026-06-29" }),
    );
    assert.throws(
        () => validateForecastQuery({ from: "2026-01-01", to: "2026-06-30" }),
        { code: "FORECAST_RANGE_TOO_LONG" },
    );
});

test("BK-MF3-05: importação aceita apenas tipos canónicos e CSV com cabeçalho", () => {
    assert.throws(
        () => validateBusinessImportPayload({ type: "UNKNOWN", content: "a;b\n1;2" }),
        { code: "INVALID_IMPORT_TYPE" },
    );
    assert.deepEqual(parseCsvRows("name;nif\nCliente;509442013"), [
        { name: "Cliente", nif: "509442013" },
    ]);
});

test("BK-MF3-01: mapa de IVA usa apenas documentos contabilizados", async () => {
    const createdRuns = [];
    const prisma = {
        journalEntry: {
            findMany: async () => [
                { source: "SALE", sourceId: "sale-1" },
                { source: "PURCHASE", sourceId: "purchase-1" },
            ],
        },
        saleDocument: {
            findMany: async ({ where }) => {
                assert.deepEqual(where.id, { in: ["sale-1"] });
                return [
                    {
                        kind: "INVOICE",
                        lines: [
                            {
                                vatRateId: "vat-23",
                                vatCents: 2300,
                                vatRate: { code: "NOR", description: "Normal", rateBps: 2300 },
                            },
                        ],
                    },
                ];
            },
        },
        purchaseDocument: {
            findMany: async ({ where }) => {
                assert.deepEqual(where.id, { in: ["purchase-1"] });
                return [
                    {
                        kind: "SUPPLIER_INVOICE",
                        lines: [
                            {
                                vatRateId: "vat-23",
                                vatCents: 1000,
                                vatRate: { code: "NOR", description: "Normal", rateBps: 2300 },
                            },
                        ],
                    },
                ];
            },
        },
        vatMapRun: {
            create: async ({ data }) => {
                createdRuns.push(data);
                return { id: "run-1", ...data };
            },
        },
    };

    const vatMap = await buildVatMap(prisma, {
        companyId: "company-1",
        userId: "user-1",
        fromDate: new Date("2026-01-01"),
        toDate: new Date("2026-01-31"),
    });

    assert.equal(vatMap.liquidatedVatCents, 2300);
    assert.equal(vatMap.deductibleVatCents, 1000);
    assert.equal(vatMap.vatBalanceCents, 1300);
    assert.equal(createdRuns[0].companyId, "company-1");
});

test("BK-MF3-01: mapa de IVA bloqueia intervalo inclusivo superior a 366 dias", () => {
    assert.doesNotThrow(() =>
        validateVatMapQuery({ from: "2026-01-01", to: "2027-01-01" }),
    );
    assert.throws(
        () => validateVatMapQuery({ from: "2026-01-01", to: "2027-01-02" }),
        { code: "INVALID_DATE_RANGE" },
    );
});

test("BK-MF3-07: relatório operacional calcula margem e stock com fontes", async () => {
    const prisma = {
        saleDocument: {
            findMany: async () => [{ kind: "INVOICE", totalCents: 10000 }],
        },
        purchaseDocument: {
            findMany: async () => [{ kind: "SUPPLIER_INVOICE", totalCents: 4000 }],
        },
        stockBalance: {
            findMany: async () => [
                {
                    itemId: "item-1",
                    warehouseId: "warehouse-1",
                    quantity: 2,
                    item: { sku: "SKU", name: "Artigo", costCents: 1500 },
                    warehouse: { name: "Principal" },
                },
            ],
        },
        operationalReportRun: {
            create: async ({ data }) => ({ id: "run-1", ...data }),
        },
    };

    const report = await buildOperationalReport(prisma, {
        companyId: "company-1",
        userId: "user-1",
        fromDate: new Date("2026-01-01"),
        toDate: new Date("2026-01-31"),
    });

    assert.equal(report.sales.totalCents, 10000);
    assert.equal(report.purchases.totalCents, 4000);
    assert.equal(report.margin.totalCents, 6000);
    assert.equal(report.stock.totalValueCents, 3000);
});

test("BK-MF3-08: KPIs devolvem PMR/PMP null sem dados suficientes", async () => {
    const prisma = {
        saleDocument: { findMany: async () => [] },
        purchaseDocument: { findMany: async () => [] },
        receipt: { findMany: async () => [] },
        payment: { findMany: async () => [] },
        executiveKpiRun: {
            create: async ({ data }) => ({ id: "run-1", ...data }),
        },
    };

    const kpis = await buildExecutiveKpis(prisma, {
        companyId: "company-1",
        userId: "user-1",
        fromDate: new Date("2026-01-01"),
        toDate: new Date("2026-01-31"),
    });

    assert.equal(kpis.revenueCents, 0);
    assert.equal(kpis.costCents, 0);
    assert.equal(kpis.ebitdaCents, 0);
    assert.equal(kpis.pmrDays, null);
    assert.equal(kpis.pmpDays, null);
});
