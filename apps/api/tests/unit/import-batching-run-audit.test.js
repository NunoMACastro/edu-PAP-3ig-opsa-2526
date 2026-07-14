/**
 * @file Regressões de batching de imports e atomicidade run + AuditLog.
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
    createManyInBatches,
    mapInBatches,
} from "../../src/lib/batchPersistence.js";
import { importBusinessData } from "../../src/modules/imports/businessImportService.js";
import { buildExecutiveKpis } from "../../src/modules/reports/executiveKpiService.js";
import { buildOperationalReport } from "../../src/modules/reports/operationalReportService.js";
import { buildCashflowForecast } from "../../src/modules/treasury/cashflowForecastService.js";
import { importBankStatement } from "../../src/modules/treasury/statementImportService.js";

function importTransaction(overrides) {
    const tx = {
        businessImportRun: {
            create: async ({ data }) => ({ id: "business-run-1", ...data }),
        },
        auditLog: { create: async ({ data }) => ({ id: "audit-1", ...data }) },
        integrationLog: {
            create: async ({ data }) => ({ id: "integration-1", ...data }),
        },
        ...overrides,
    };
    return { $transaction: async (callback) => callback(tx) };
}

test("P2-017: createMany e mapper respeitam limites e ordem", async () => {
    const batches = [];
    const count = await createManyInBatches(
        {
            createMany: async ({ data }) => {
                batches.push(data.length);
                return { count: data.length };
            },
        },
        Array.from({ length: 601 }, (_, index) => ({ index })),
    );
    assert.equal(count, 601);
    assert.deepEqual(batches, [250, 250, 101]);

    let active = 0;
    let maxActive = 0;
    const mapped = await mapInBatches(
        Array.from({ length: 10 }, (_, index) => index),
        async (value) => {
            active += 1;
            maxActive = Math.max(maxActive, active);
            await new Promise((resolve) => setTimeout(resolve, 2));
            active -= 1;
            return value * 2;
        },
        { concurrency: 3 },
    );
    assert.deepEqual(mapped, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
    assert.equal(maxActive, 3);
});

test("P2-017: import grande de clientes usa createMany em chunks e conserva erros", async () => {
    const createdBatches = [];
    const validRows = Array.from(
        { length: 600 },
        (_, index) => `Cliente ${index};;cliente${index}@example.test`,
    );
    const prisma = importTransaction({
        customer: {
            createMany: async ({ data }) => {
                assert.equal(data.every((row) => row.companyId === "company-1"), true);
                createdBatches.push(data);
                return { count: data.length };
            },
            upsert: async () => {
                throw new Error("Não deve fazer upsert sem NIF");
            },
        },
    });

    const result = await importBusinessData(prisma, {
        companyId: "company-1",
        userId: "user-1",
        input: {
            type: "CUSTOMERS",
            fileName: "clientes.csv",
            fileBuffer: Buffer.from(
                `name;nif;email\n${validRows.join("\n")}\nX;;invalido@example.test`,
            ),
        },
    });

    assert.equal(result.acceptedRows, 600);
    assert.equal(result.rejectedRows, 1);
    assert.equal(result.errors[0].rowNumber, 602);
    assert.deepEqual(createdBatches.map((batch) => batch.length), [250, 250, 100]);
});

test("P2-017: bulk upsert reduz statements e a última chave repetida vence", async () => {
    const statements = [];
    const itemRows = Array.from(
        { length: 60 },
        (_, index) => `SKU-${index};Artigo ${index};PRODUCT;100;200;2300`,
    );
    itemRows.push("SKU-0;Artigo final;PRODUCT;150;250;2300");
    const prisma = importTransaction({
        item: {
            createMany: async ({ data }) => ({ count: data.length }),
        },
        $executeRaw: async (statement) => {
            statements.push(statement);
            return 60;
        },
    });

    const result = await importBusinessData(prisma, {
        companyId: "company-1",
        userId: "user-1",
        input: {
            type: "ITEMS",
            fileName: "items.csv",
            fileBuffer: Buffer.from(
                `sku;name;type;costCents;priceCents;vatRateBps\n${itemRows.join("\n")}`,
            ),
        },
    });

    assert.equal(result.acceptedRows, 61);
    assert.equal(statements.length, 1);
    assert.equal(statements[0].values.filter((value) => value === "SKU-0").length, 1);
    assert.equal(statements[0].values.includes("Artigo final"), true);
    assert.equal(statements[0].values.includes("Artigo 0"), false);
    assert.match(statements[0].strings.join("?"), /ON CONFLICT/);
});

test("P2-017: 5 000 artigos produzem vinte statements bulk, não 5 000 upserts", async () => {
    const statements = [];
    const itemRows = Array.from(
        { length: 5_000 },
        (_, index) => `SKU-${index};Artigo ${index};PRODUCT;100;200;2300`,
    );
    const prisma = importTransaction({
        item: {
            createMany: async ({ data }) => ({ count: data.length }),
        },
        $executeRaw: async (statement) => {
            statements.push(statement);
            return 250;
        },
    });

    const result = await importBusinessData(prisma, {
        companyId: "company-1",
        userId: "user-1",
        input: {
            type: "ITEMS",
            fileName: "items.csv",
            fileBuffer: Buffer.from(
                `sku;name;type;costCents;priceCents;vatRateBps\n${itemRows.join("\n")}`,
            ),
        },
    });

    assert.equal(result.acceptedRows, 5_000);
    assert.equal(result.rejectedRows, 0);
    assert.equal(statements.length, 20);
    assert.equal(
        statements.reduce(
            (total, statement) =>
                total + statement.values.filter((value) => /^SKU-\d+$/.test(String(value))).length,
            0,
        ),
        5_000,
    );
});

test("P2-017: falha de escrita aborta import sem criar run ou audit enganadores", async () => {
    let runWrites = 0;
    let auditWrites = 0;
    const tx = {
        item: {
            createMany: async ({ data }) => ({ count: data.length }),
        },
        $executeRaw: async () => {
            throw new Error("DATABASE_WRITE_FAILED");
        },
        businessImportRun: {
            create: async () => {
                runWrites += 1;
            },
        },
        auditLog: {
            create: async () => {
                auditWrites += 1;
            },
        },
        integrationLog: { create: async () => ({ id: "integration-1" }) },
    };

    await assert.rejects(
        () => importBusinessData(
            { $transaction: async (callback) => callback(tx) },
            {
                companyId: "company-1",
                userId: "user-1",
                input: {
                    type: "ITEMS",
                    fileName: "items.csv",
                    fileBuffer: Buffer.from(
                        "sku;name;type;costCents;priceCents;vatRateBps\n" +
                            "SKU-1;Artigo;PRODUCT;100;200;2300",
                    ),
                },
            },
        ),
        /DATABASE_WRITE_FAILED/,
    );
    assert.equal(runWrites, 0);
    assert.equal(auditWrites, 0);
});

test("P2-017: extrato grande cria linhas em bulk sem alterar contagens", async () => {
    const lineBatchSizes = [];
    const suggestionBatchSizes = [];
    const lines = Array.from(
        { length: 301 },
        (_, index) => `2026-06-01;Linha ${index};REF-${index};10,00`,
    );
    const tx = {
        treasuryAccount: { findFirst: async () => ({ id: "treasury-1" }) },
        bankStatementImport: {
            create: async ({ data }) => ({ id: "statement-import-1", ...data }),
        },
        bankStatementLine: {
            createMany: async ({ data }) => {
                lineBatchSizes.push(data.length);
                return { count: data.length };
            },
        },
        receipt: {
            findMany: async () => [{ id: "receipt-1", reference: "REF-1" }],
        },
        payment: { findMany: async () => [] },
        journalEntryLine: { findMany: async () => [] },
        bankReconciliationSuggestion: {
            createMany: async ({ data }) => {
                suggestionBatchSizes.push(data.length);
                return { count: data.length };
            },
        },
        auditLog: { create: async ({ data }) => ({ id: "audit-1", ...data }) },
        integrationLog: {
            create: async ({ data }) => ({ id: "integration-1", ...data }),
        },
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
                    `data;descricao;referencia;valor\n${lines.join("\n")}`,
                ),
            },
        },
    );

    assert.equal(result.import.acceptedLines, 301);
    assert.equal(result.lines.length, 301);
    assert.equal(result.suggestions.length, 301);
    assert.deepEqual(lineBatchSizes, [250, 51]);
    assert.deepEqual(suggestionBatchSizes, [250, 51]);
    assert.equal(result.lines.every((line) => line.createdAt instanceof Date), true);
    assert.equal(
        result.suggestions.every(
            (suggestion) => suggestion.createdAt === result.lines[0].createdAt,
        ),
        true,
    );
});

function runPrisma(modelName, { auditFails }) {
    const committed = [];
    const audits = [];
    const prisma = {
        saleDocument: { findMany: async () => [] },
        purchaseDocument: { findMany: async () => [] },
        stockBalance: { findMany: async () => [] },
        receipt: { findMany: async () => [] },
        payment: { findMany: async () => [] },
        journalEntryLine: { findMany: async () => [] },
        treasuryAccount: { findMany: async () => [] },
    };
    prisma.$transaction = async (callback) => {
        const staged = [];
        const tx = {
            [modelName]: {
                create: async ({ data }) => {
                    const run = { id: `${modelName}-1`, ...data };
                    staged.push(run);
                    return run;
                },
            },
            auditLog: {
                create: async ({ data }) => {
                    if (auditFails) throw new Error("AUDIT_WRITE_FAILED");
                    audits.push(data);
                    return { id: "audit-1", ...data };
                },
            },
        };
        const result = await callback(tx);
        committed.push(...staged);
        return result;
    };
    return { prisma, committed, audits };
}

const runCases = [
    ["operationalReportRun", buildOperationalReport, "OPERATIONAL_REPORT_GENERATED"],
    ["executiveKpiRun", buildExecutiveKpis, "EXECUTIVE_KPIS_GENERATED"],
    ["cashflowForecastRun", buildCashflowForecast, "CASHFLOW_FORECAST_GENERATED"],
];

for (const [modelName, service, action] of runCases) {
    test(`P2-013: ${modelName} e audit são confirmados em conjunto`, async () => {
        const state = runPrisma(modelName, { auditFails: false });
        const result = await service(state.prisma, {
            companyId: "company-1",
            userId: "user-1",
            fromDate: new Date("2026-01-01"),
            toDate: new Date("2026-01-31"),
        });
        assert.equal(state.committed.length, 1);
        assert.equal(state.audits.length, 1);
        assert.equal(state.audits[0].action, action);
        assert.equal(state.audits[0].userId, "user-1");
        assert.equal(state.audits[0].entityId, result.runId);
        assert.equal("payload" in state.audits[0].details, false);
    });

    test(`P2-013: falha de audit reverte ${modelName}`, async () => {
        const state = runPrisma(modelName, { auditFails: true });
        await assert.rejects(
            () => service(state.prisma, {
                companyId: "company-1",
                userId: "user-1",
                fromDate: new Date("2026-01-01"),
                toDate: new Date("2026-01-31"),
            }),
            /AUDIT_WRITE_FAILED/,
        );
        assert.equal(state.committed.length, 0);
    });
}
