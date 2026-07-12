/**
 * @file Testes de contrato MF7 para importações CSV/Excel com validação e logs.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import ExcelJS from "exceljs";

import { importBusinessData } from "../../src/modules/imports/businessImportService.js";
import {
    MAX_IMPORT_ROWS,
    parseCsvRows,
    parseImportFileRows,
} from "../../src/modules/imports/importFileParser.js";
import { validateBusinessImportPayload } from "../../src/modules/imports/businessImportValidators.js";
import { validateStatementImportPayload } from "../../src/modules/treasury/statementImportValidators.js";

/**
 * Cria um ficheiro XLSX em base64 com cabeçalhos e linhas fornecidas.
 *
 * @param {string[]} headers - Cabeçalhos da primeira linha.
 * @param {string[][]} rows - Linhas de dados.
 * @returns {Promise<Buffer>} Conteúdo XLSX binário.
 */
async function workbookBuffer(headers, rows) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Import");
    sheet.addRow(headers);
    for (const row of rows) {
        sheet.addRow(row);
    }
    return Buffer.from(await workbook.xlsx.writeBuffer());
}

test("BK-MF7-06: payload base aceita CSV e XLSX mas rejeita tipos desconhecidos", () => {
    assert.equal(
        validateBusinessImportPayload({
            type: "CUSTOMERS",
            fileName: "clientes.csv",
            fileBuffer: Buffer.from("name;nif\nCliente;509442013"),
        }).sourceFormat,
        "CSV",
    );
    assert.equal(
        validateBusinessImportPayload({
            type: "ITEMS",
            fileName: "artigos.xlsx",
            fileBuffer: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
        }).sourceFormat,
        "XLSX",
    );
    assert.throws(
        () =>
            validateBusinessImportPayload({
                type: "CUSTOMERS",
                fileName: "clientes.txt",
                fileBuffer: Buffer.from("name;nif\nCliente;509442013"),
            }),
        { code: "INVALID_IMPORT_FILE_FORMAT" },
    );
});

test("BK-MF7-06: parser aplica limite operacional de linhas", () => {
    const rows = Array.from({ length: MAX_IMPORT_ROWS + 1 }, (_, index) =>
        `Cliente ${index};509442013`,
    );

    assert.throws(
        () => parseCsvRows(`name;nif\n${rows.join("\n")}`),
        { code: "IMPORT_TOO_LARGE" },
    );
});

test("BK-MF7-06: Excel é convertido para linhas normalizadas", async () => {
    const fileBuffer = await workbookBuffer(
        ["name", "nif"],
        [["Cliente XLSX", "509442013"]],
    );

    const parsed = await parseImportFileRows({
        fileName: "clientes.xlsx",
        fileBuffer,
    });

    assert.equal(parsed.sourceFormat, "XLSX");
    assert.deepEqual(parsed.rows, [
        { __rowNumber: 2, name: "Cliente XLSX", nif: "509442013" },
    ]);
});

test("BK-MF7-06: parsing XLSX termina o worker quando excede o timeout", async () => {
    const fileBuffer = await workbookBuffer(
        ["name", "nif"],
        [["Cliente lento", "509442013"]],
    );

    await assert.rejects(
        () =>
            parseImportFileRows({
                fileName: "clientes.xlsx",
                fileBuffer,
                xlsxTimeoutMs: 1,
            }),
        { code: "XLSX_PARSE_TIMEOUT" },
    );
});

test("BK-MF7-06: extratos aceitam linhas XLSX já parseadas", () => {
    const statement = validateStatementImportPayload({
        treasuryAccountId: "treasury-1",
        format: "XLSX",
        fileName: "extrato.xlsx",
        rows: [
            {
                __rowNumber: 2,
                data: "2026-06-01",
                descricao: "Recebimento",
                referencia: "R1",
                valor: "125,50",
            },
        ],
    });

    assert.equal(statement.format, "XLSX");
    assert.equal(statement.rows.length, 1);
    assert.equal(statement.rows[0].amountCents, 12550);
});

test("BK-MF7-06: importação XLSX cria run, auditoria e log sem aceitar companyId do payload", async () => {
    const fileBuffer = await workbookBuffer(
        ["name", "nif"],
        [["Cliente XLSX", "509442013"]],
    );
    const created = {
        customers: [],
        runs: [],
        audits: [],
        integrations: [],
    };
    const tx = {
        customer: {
            createMany: async () => ({ count: 0 }),
        },
        $executeRaw: async (statement) => {
            assert.equal(statement.values.includes("company-forged"), false);
            assert.equal(statement.values.includes("company-real"), true);
            assert.equal(statement.values.includes("Cliente XLSX"), true);
            assert.equal(statement.values.includes("509442013"), true);
            assert.match(statement.strings.join("?"), /ON CONFLICT/);
            created.customers.push(statement);
            return 1;
        },
        businessImportRun: {
            create: async ({ data }) => {
                assert.equal(data.companyId, "company-real");
                assert.equal(data.fileName, "clientes.xlsx");
                const run = { id: "run-1", ...data };
                created.runs.push(run);
                return run;
            },
        },
        auditLog: {
            create: async ({ data }) => {
                created.audits.push(data);
                return { id: "audit-1", ...data };
            },
        },
        integrationLog: {
            create: async ({ data }) => {
                created.integrations.push(data);
                return { id: "integration-1", ...data };
            },
        },
    };
    const prisma = { $transaction: async (callback) => callback(tx) };

    const result = await importBusinessData(prisma, {
        companyId: "company-real",
        userId: "user-1",
        input: {
            companyId: "company-forged",
            type: "CUSTOMERS",
            fileName: "clientes.xlsx",
            fileBuffer,
        },
    });

    assert.equal(result.sourceFormat, "XLSX");
    assert.equal(result.acceptedRows, 1);
    assert.equal(result.rejectedRows, 0);
    assert.equal(created.customers.length, 1);
    assert.equal(created.runs[0].totalRows, 1);
    assert.equal(created.audits[0].details.sourceFormat, "XLSX");
    assert.equal(created.integrations[0].fileName, "clientes.xlsx");
    assert.equal(created.integrations[0].message.includes("XLSX"), true);
});

test("BK-MF7-06: migration acrescenta formato XLSX ao enum de extratos", () => {
    const migrationsRoot = new URL("../../prisma/migrations/", import.meta.url);
    const migration = readdirSync(migrationsRoot)
        .filter((entry) => entry.includes("mf7_import_xlsx_format"))
        .map((entry) =>
            readFileSync(new URL(`${entry}/migration.sql`, migrationsRoot), "utf8"),
        )
        .join("\n");

    assert.match(migration, /ALTER TYPE "BankStatementFormat" ADD VALUE 'XLSX'/);
});
