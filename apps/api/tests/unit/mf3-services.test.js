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

test("BK-MF3-03: extrato rejeita dias impossíveis sem normalização", () => {
    assert.throws(
        () =>
            validateStatementImportPayload({
                treasuryAccountId: "treasury-1",
                format: "CSV",
                content: "data;descricao;valor\n2026-02-30;Erro;10,00",
            }),
        (error) => {
            assert.equal(error.code, "INVALID_STATEMENT_FORMAT");
            assert.match(error.details[0].message, /calendário inválido/i);
            return true;
        },
    );
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
            createMany: async ({ data }) => {
                createdLines.push(...data);
                return { count: data.length };
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
            createMany: async ({ data }) => {
                createdSuggestions.push(...data);
                return { count: data.length };
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
            fileName: "extrato.csv",
            fileBuffer: Buffer.from(
                "data;descricao;referencia;valor\n" +
                    "2026-06-01;Recebimento;R1;125,00\n" +
                    "2026-06-01;Recebimento;R1;125,00",
                "utf8",
            ),
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

test("BK-MF3-03: service rejeita o antigo payload JSON sem ficheiro", async () => {
    let transactionCalls = 0;
    await assert.rejects(
        () =>
            importBankStatement(
                {
                    $transaction: async () => {
                        transactionCalls += 1;
                    },
                },
                {
                    companyId: "company-1",
                    userId: "user-1",
                    input: {
                        treasuryAccountId: "treasury-1",
                        format: "CSV",
                        content: "data;descricao;valor\n2026-06-01;Venda;10,00",
                    },
                },
            ),
        { code: "STATEMENT_FILE_REQUIRED", status: 400 },
    );
    assert.equal(transactionCalls, 0);
});

test("BK-MF3-03: service aceita Buffer multipart e deriva o formato do ficheiro", async () => {
    let persistedImport;
    const tx = {
        treasuryAccount: { findFirst: async () => ({ id: "treasury-1" }) },
        bankStatementImport: {
            create: async ({ data }) => {
                persistedImport = { id: "import-buffer-1", ...data };
                return persistedImport;
            },
        },
        bankStatementLine: {
            createMany: async ({ data }) => ({ count: data.length }),
        },
        receipt: { findMany: async () => [] },
        payment: { findMany: async () => [] },
        bankReconciliationSuggestion: {
            createMany: async ({ data }) => ({ count: data.length }),
        },
        auditLog: { create: async () => ({ id: "audit-buffer-1" }) },
        integrationLog: { create: async () => ({ id: "integration-buffer-1" }) },
    };
    const result = await importBankStatement(
        { $transaction: async (callback) => callback(tx) },
        {
            companyId: "company-1",
            userId: "user-1",
            input: {
                treasuryAccountId: "treasury-1",
                fileName: "extrato.csv",
                fileBuffer: Buffer.from(
                    "data;descricao;referencia;valor\n" +
                        "2026-06-01;Recebimento;R1;125,50",
                ),
            },
        },
    );

    assert.equal(persistedImport.format, "CSV");
    assert.equal(persistedImport.fileName, "extrato.csv");
    assert.equal(result.lines[0].amountCents, 12550);
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
        () =>
            validateBusinessImportPayload({
                type: "UNKNOWN",
                fileName: "dados.csv",
                fileBuffer: Buffer.from("a;b\n1;2"),
            }),
        { code: "INVALID_IMPORT_TYPE" },
    );
    assert.deepEqual(parseCsvRows("name;nif\nCliente;509442013"), [
        { name: "Cliente", nif: "509442013" },
    ]);
});

test("BK-MF3-01: mapa de IVA usa apenas documentos contabilizados", async () => {
    const createdRuns = [];
    const holds = [];
    const audits = [];
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
        retentionHold: {
            upsert: async (args) => {
                holds.push(args.create);
                return { id: `hold-${holds.length}`, ...args.create };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                const audit = { id: "audit-1", ...data };
                audits.push(audit);
                return audit;
            },
        },
    };
    prisma.$transaction = async (callback) => callback(prisma);

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
    assert.deepEqual(
        holds.map((hold) => [hold.entity, hold.entityId]),
        [["VatMapRun", "run-1"], ["AuditLog", "audit-1"]],
    );
    assert.equal(audits[0].action, "VAT_MAP_GENERATED");
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
    const audits = [];
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
        journalEntryLine: {
            findMany: async () => [
                { debitCents: 0, creditCents: 10000, account: { code: "71" } },
                { debitCents: 4000, creditCents: 0, account: { code: "62" } },
            ],
        },
        operationalReportRun: {
            create: async ({ data }) => ({ id: "run-1", ...data }),
        },
        auditLog: {
            create: async ({ data }) => {
                audits.push(data);
                return { id: "audit-1", ...data };
            },
        },
    };
    prisma.$transaction = async (callback) => callback(prisma);

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
    assert.deepEqual(audits[0], {
        companyId: "company-1",
        userId: "user-1",
        action: "OPERATIONAL_REPORT_GENERATED",
        entity: "OperationalReportRun",
        entityId: "run-1",
        details: { sourceCount: 2 },
    });
});

test("BK-MF3-08: KPIs devolvem PMR/PMP null sem dados suficientes", async () => {
    const audits = [];
    const prisma = {
        saleDocument: { findMany: async () => [] },
        purchaseDocument: { findMany: async () => [] },
        receipt: { findMany: async () => [] },
        payment: { findMany: async () => [] },
        journalEntryLine: { findMany: async () => [] },
        executiveKpiRun: {
            create: async ({ data }) => ({ id: "run-1", ...data }),
        },
        auditLog: {
            create: async ({ data }) => {
                audits.push(data);
                return { id: "audit-1", ...data };
            },
        },
    };
    prisma.$transaction = async (callback) => callback(prisma);

    const kpis = await buildExecutiveKpis(prisma, {
        companyId: "company-1",
        userId: "user-1",
        fromDate: new Date("2026-01-01"),
        toDate: new Date("2026-01-31"),
    });

    assert.equal(kpis.revenueCents, null);
    assert.equal(kpis.costCents, null);
    assert.equal(kpis.ebitdaCents, null);
    assert.equal(kpis.dataQuality, "INSUFFICIENT_DATA");
    assert.equal(kpis.pmrDays, null);
    assert.equal(kpis.pmpDays, null);
    assert.equal(audits[0].action, "EXECUTIVE_KPIS_GENERATED");
    assert.equal(audits[0].userId, "user-1");
    assert.deepEqual(audits[0].details, { sourceCount: 3 });
});
