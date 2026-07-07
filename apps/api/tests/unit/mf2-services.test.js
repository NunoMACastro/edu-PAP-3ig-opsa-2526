/**
 * @file Testes unitários das regras críticas da MF2.
 */

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { buildBalanceSheetFromTrialBalance } from "../../src/modules/financial-statements/financialStatementService.js";
import { buildTrialBalance } from "../../src/modules/accounting-reports/accountingReportService.js";
import {
    parseJournalAttachment,
} from "../../src/modules/accounting/journalAttachmentStorage.js";
import { consumeFifoLayers } from "../../src/modules/inventory/fifoCostService.js";
import { parseRejectionReason } from "../../src/modules/purchase-approval/purchaseApprovalHistoryValidators.js";
import { parseStockMovement } from "../../src/modules/inventory/stockMovementValidators.js";
import { parseStockAlertSetting } from "../../src/modules/inventory/stockAlertService.js";
import {
    parseInventoryCountLines,
    postInventoryCount,
} from "../../src/modules/inventory/inventoryCountService.js";
import {
    addManualJournalAttachment,
    parseManualJournal,
} from "../../src/modules/accounting/manualJournalService.js";
import { parseDateRange } from "../../src/modules/accounting-reports/accountingReportFilters.js";

test("BK-MF2-01: reprovação exige justificação mínima", () => {
    assert.throws(() => parseRejectionReason({ reason: "curto" }), {
        code: "REJECTION_REASON_REQUIRED",
    });
});

test("BK-MF2-02: transferência para o mesmo armazém é inválida", () => {
    assert.throws(
        () =>
            parseStockMovement({
                type: "TRANSFER",
                itemId: "item-1",
                quantity: 1,
                fromWarehouseId: "warehouse-1",
                toWarehouseId: "warehouse-1",
                reason: "Movimento interno",
            }),
        { code: "INVALID_TRANSFER" },
    );
});

test("BK-MF2-03: entrada valorizada exige custo unitário positivo", () => {
    assert.throws(
        () =>
            parseStockMovement({
                type: "ENTRY",
                itemId: "item-1",
                quantity: 1,
                toWarehouseId: "warehouse-1",
                reason: "Compra",
            }),
        { code: "UNIT_COST_REQUIRED" },
    );
});

test("BK-MF2-03: FIFO consome múltiplas camadas e regista consumos", async () => {
    const updates = [];
    const consumptions = [];
    const tx = {
        stockCostLayer: {
            findMany: async ({ where, orderBy }) => {
                assert.equal(where.companyId, "company-1");
                assert.equal(where.itemId, "item-1");
                assert.equal(where.warehouseId, "warehouse-1");
                assert.deepEqual(orderBy, { createdAt: "asc" });
                return [
                    { id: "layer-1", remainingQuantity: 2, unitCostCents: 100 },
                    { id: "layer-2", remainingQuantity: 3, unitCostCents: 150 },
                ];
            },
            update: async (input) => {
                updates.push(input);
                return input;
            },
        },
        stockCostConsumption: {
            create: async (input) => {
                consumptions.push(input.data);
                return input.data;
            },
        },
    };

    const result = await consumeFifoLayers(tx, {
        companyId: "company-1",
        itemId: "item-1",
        warehouseId: "warehouse-1",
        quantity: 4,
        movementId: "movement-1",
    });

    assert.equal(result.totalCostCents, 500);
    assert.deepEqual(
        updates.map((update) => update.data.remainingQuantity),
        [0, 1],
    );
    assert.deepEqual(
        consumptions.map((consumption) => ({
            layerId: consumption.layerId,
            quantity: consumption.quantity,
            totalCostCents: consumption.totalCostCents,
        })),
        [
            { layerId: "layer-1", quantity: 2, totalCostCents: 200 },
            { layerId: "layer-2", quantity: 2, totalCostCents: 300 },
        ],
    );
});

test("BK-MF2-05: mínimo maior que máximo é inválido", () => {
    assert.throws(
        () =>
            parseStockAlertSetting({
                itemId: "item-1",
                warehouseId: "warehouse-1",
                minQuantity: 10,
                maxQuantity: 5,
            }),
        { code: "MIN_GREATER_THAN_MAX" },
    );
});

test("BK-MF2-07: balancete agrega linhas contabilísticas por empresa e período", async () => {
    const from = new Date("2026-01-01");
    const to = new Date("2026-01-31");
    const prisma = {
        account: {
            findMany: async ({ where, orderBy }) => {
                assert.deepEqual(where, { companyId: "company-1", isActive: true });
                assert.deepEqual(orderBy, { code: "asc" });
                return [
                    { id: "account-1", code: "11", name: "Caixa" },
                    { id: "account-2", code: "71", name: "Vendas" },
                ];
            },
        },
        journalEntryLine: {
            findMany: async ({ where, include }) => {
                assert.equal(where.journalEntry.companyId, "company-1");
                assert.deepEqual(where.journalEntry.entryDate, { gte: from, lte: to });
                assert.deepEqual(include, { account: true });
                return [
                    { accountId: "account-1", debitCents: 1000, creditCents: 0 },
                    { accountId: "account-2", debitCents: 0, creditCents: 1000 },
                ];
            },
        },
    };

    const trialBalance = await buildTrialBalance(prisma, {
        companyId: "company-1",
        from,
        to,
    });

    assert.deepEqual(
        trialBalance.rows.map((row) => ({
            code: row.code,
            debitCents: row.debitCents,
            creditCents: row.creditCents,
            balanceCents: row.balanceCents,
        })),
        [
            { code: "11", debitCents: 1000, creditCents: 0, balanceCents: 1000 },
            { code: "71", debitCents: 0, creditCents: 1000, balanceCents: -1000 },
        ],
    );
    assert.deepEqual(trialBalance.totals, {
        debitCents: 1000,
        creditCents: 1000,
        balanceCents: 0,
    });
});

test("BK-MF2-06: lançamento manual tem de estar equilibrado", () => {
    assert.throws(
        () =>
            parseManualJournal({
                entryDate: "2026-02-01",
                lines: [
                    { accountId: "account-1", debitCents: 1000 },
                    { accountId: "account-2", creditCents: 900 },
                ],
            }),
        { code: "JOURNAL_NOT_BALANCED" },
    );
});

test("BK-MF2-06: anexo de lançamento manual rejeita MIME fora do contrato", () => {
    assert.throws(
        () =>
            parseJournalAttachment({
                fileName: "diario.exe",
                mimeType: "application/x-msdownload",
                sizeBytes: 1024,
            }),
        { code: "INVALID_MIME_TYPE" },
    );
});

test("BK-MF2-06: anexo de lançamento manual exige conteúdo real", () => {
    assert.throws(
        () =>
            parseJournalAttachment({
                fileName: "comprovativo.pdf",
                mimeType: "application/pdf",
                sizeBytes: 1024,
            }),
        { code: "FILE_CONTENT_REQUIRED" },
    );
});

test("BK-MF2-06: anexo rejeita conteúdo que não corresponde ao MIME declarado", () => {
    assert.throws(
        () =>
            parseJournalAttachment({
                fileName: "comprovativo.pdf",
                mimeType: "application/pdf",
                sizeBytes: 11,
                contentBase64: Buffer.from("nao e um pdf").toString("base64"),
            }),
        { code: "INVALID_FILE_SIGNATURE" },
    );
});

test("BK-MF2-06: anexo de lançamento manual é guardado em storage privado", async () => {
    const storageRoot = await mkdtemp(path.join(tmpdir(), "opsa-attachment-"));
    const content = Buffer.from("%PDF-1.4 comprovativo privado");
    let createdAttachment;

    const prisma = {
        journalEntry: {
            findFirst: async () => ({
                id: "journal-1",
                companyId: "company-1",
                source: "MANUAL",
            }),
        },
        $transaction: async (callback) =>
            callback({
                journalAttachment: {
                    create: async ({ data }) => {
                        createdAttachment = { id: "attachment-1", ...data };
                        return createdAttachment;
                    },
                },
                auditLog: { create: async ({ data }) => data },
            }),
    };

    try {
        const attachment = await addManualJournalAttachment(
            prisma,
            "company-1",
            "user-1",
            "journal-1",
            {
                fileName: "../comprovativo final.pdf",
                mimeType: "application/pdf",
                sizeBytes: content.length,
                contentBase64: content.toString("base64"),
            },
            { storageRoot },
        );

        assert.equal(attachment.sizeBytes, content.length);
        assert.match(attachment.storageKey, /^private\/manual-journals\//);
        assert.equal(attachment.storageKey.includes(".."), false);
        assert.equal(attachment.storageKey.includes(" "), false);

        const written = await readFile(
            path.join(storageRoot, ...attachment.storageKey.split("/")),
        );
        assert.deepEqual(written, content);
        assert.equal(createdAttachment.companyId, "company-1");
    } finally {
        await rm(storageRoot, { recursive: true, force: true });
    }
});

test("BK-MF2-06: anexo PNG válido é aceite por assinatura real", () => {
    const content = Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        Buffer.from("conteudo-png-minimo"),
    ]);
    const attachment = parseJournalAttachment({
        fileName: "contagem.png",
        mimeType: "image/png",
        sizeBytes: content.length,
        contentBase64: content.toString("base64"),
    });

    assert.equal(attachment.sizeBytes, content.length);
    assert.equal(attachment.mimeType, "image/png");
});

test("BK-MF2-07: filtros rejeitam período invertido", () => {
    assert.throws(() => parseDateRange({ from: "2026-12-31", to: "2026-01-01" }), {
        code: "INVALID_DATE_RANGE",
    });
});

test("BK-MF2-04: linhas de contagem não aceitam artigo duplicado", () => {
    assert.throws(
        () =>
            parseInventoryCountLines({
                lines: [
                    { itemId: "item-1", countedQuantity: 1 },
                    { itemId: "item-1", countedQuantity: 2 },
                ],
            }),
        { code: "DUPLICATED_COUNT_ITEM" },
    );
});

test("BK-MF2-04: publicação de contagem regista AuditLog com detalhes", async () => {
    let auditLogData;
    const postedAt = new Date("2026-06-12T10:00:00.000Z");
    const tx = {
        inventoryCount: {
            findFirst: async ({ where, include }) => {
                assert.deepEqual(where, { id: "count-1", companyId: "company-1" });
                assert.deepEqual(include, { lines: true });
                return {
                    id: "count-1",
                    companyId: "company-1",
                    warehouseId: "warehouse-1",
                    status: "DRAFT",
                    reason: "Contagem mensal",
                    lines: [
                        {
                            itemId: "item-1",
                            expectedQuantity: 5,
                            countedQuantity: 5,
                            unitCostCents: null,
                        },
                    ],
                };
            },
            update: async ({ where, data, include }) => {
                assert.deepEqual(where, { id: "count-1" });
                assert.deepEqual(data, { status: "POSTED", postedAt: data.postedAt });
                assert.deepEqual(include, {
                    warehouse: true,
                    lines: { include: { item: true } },
                });
                return {
                    id: "count-1",
                    status: "POSTED",
                    postedAt,
                };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                auditLogData = data;
                return data;
            },
        },
    };
    const prisma = { $transaction: async (callback) => callback(tx) };

    await postInventoryCount(prisma, "company-1", "user-1", "count-1");

    assert.deepEqual(auditLogData.details, {
        warehouseId: "warehouse-1",
        lines: 1,
        adjustments: [],
        postedAt: postedAt.toISOString(),
    });
});

test("BK-MF2-08: balanço separa classe 2 por sinal e devolve checkCents", () => {
    const from = new Date("2026-01-01");
    const to = new Date("2026-12-31");
    const balanceSheet = buildBalanceSheetFromTrialBalance(
        {
            rows: [
                { code: "11", balanceCents: 1000 },
                { code: "221", balanceCents: -500 },
                { code: "51", balanceCents: -500 },
                { code: "62", balanceCents: 200 },
                { code: "72", balanceCents: -300 },
            ],
        },
        { from, to },
    );

    assert.deepEqual(
        balanceSheet.sections.map((section) => ({
            key: section.key,
            codes: section.accounts.map((account) => account.code),
            totalCents: section.totalCents,
        })),
        [
            { key: "assets", codes: ["11"], totalCents: 1000 },
            { key: "liabilities", codes: ["221"], totalCents: 500 },
            { key: "equity", codes: ["51"], totalCents: 500 },
        ],
    );
    assert.equal(balanceSheet.checkCents, 0);
});
