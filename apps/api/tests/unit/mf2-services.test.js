/**
 * @file Testes unitários das regras críticas da MF2.
 */

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { buildBalanceSheetFromTrialBalance } from "../../src/modules/financial-statements/financialStatementService.js";
import { buildTrialBalance } from "../../src/modules/accounting-reports/accountingReportService.js";
import { prepareJournalAttachment } from "../../src/modules/accounting/journalAttachmentStorage.js";
import { LocalObjectStorage } from "../../src/modules/storage/objectStorage.js";
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
    getManualJournalAttachmentDownload,
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
    const rawQueries = [];
    const tx = {
        $queryRaw: async (strings) => {
            rawQueries.push(strings.join(" "));
            return [];
        },
        stockCostLayer: {
            findMany: async ({ where, orderBy }) => {
                assert.equal(where.companyId, "company-1");
                assert.equal(where.itemId, "item-1");
                assert.equal(where.warehouseId, "warehouse-1");
                assert.deepEqual(orderBy, [
                    { createdAt: "asc" },
                    { id: "asc" },
                ]);
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
    assert.equal(rawQueries.length, 1);
    assert.match(rawQueries[0], /FROM "StockCostLayer"/);
    assert.match(rawQueries[0], /FOR UPDATE/);
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
            findMany: async ({ where, orderBy, take }) => {
                assert.deepEqual(where, { companyId: "company-1", isActive: true });
                assert.deepEqual(orderBy, [{ code: "asc" }, { id: "asc" }]);
                assert.equal(take, 51);
                return [
                    { id: "account-1", code: "11", name: "Caixa" },
                    { id: "account-2", code: "71", name: "Vendas" },
                ];
            },
        },
        journalEntryLine: {
            groupBy: async ({ by, where, _sum }) => {
                assert.deepEqual(by, ["accountId"]);
                assert.deepEqual(where.AND[1], {
                    accountId: { in: ["account-1", "account-2"] },
                });
                assert.deepEqual(_sum, { debitCents: true, creditCents: true });
                return [
                    { accountId: "account-1", _sum: { debitCents: 1000, creditCents: 0 } },
                    { accountId: "account-2", _sum: { debitCents: 0, creditCents: 1000 } },
                ];
            },
            aggregate: async ({ where, _sum }) => {
                assert.equal(where.AND[0].journalEntry.companyId, "company-1");
                assert.deepEqual(where.AND[0].journalEntry.entryDate, { gte: from, lte: to });
                assert.deepEqual(_sum, { debitCents: true, creditCents: true });
                return { _sum: { debitCents: 1000, creditCents: 1000 } };
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
            prepareJournalAttachment({
                fileName: "diario.exe",
                mimeType: "application/x-msdownload",
                sizeBytes: 1024,
                sha256: "a".repeat(64),
                head: Buffer.from("MZ"),
                tempPath: "/tmp/test-upload",
            }),
        { code: "UPLOAD_EXTENSION_NOT_ALLOWED" },
    );
});

test("BK-MF2-06: anexo de lançamento manual exige conteúdo real", () => {
    assert.throws(
        () =>
            prepareJournalAttachment({
                fileName: "comprovativo.pdf",
                mimeType: "application/pdf",
                sizeBytes: 1024,
                sha256: "a".repeat(64),
                tempPath: "/tmp/test-upload",
            }),
        { code: "UPLOAD_SIGNATURE_MISMATCH" },
    );
});

test("BK-MF2-06: anexo rejeita conteúdo que não corresponde ao MIME declarado", () => {
    assert.throws(
        () =>
            prepareJournalAttachment({
                fileName: "comprovativo.pdf",
                mimeType: "application/pdf",
                sizeBytes: 11,
                sha256: "a".repeat(64),
                head: Buffer.from("nao e um pdf"),
                tempPath: "/tmp/test-upload",
            }),
        { code: "UPLOAD_SIGNATURE_MISMATCH" },
    );
});

test("BK-MF2-06: anexo de lançamento manual é guardado em storage privado", async () => {
    const storageRoot = await mkdtemp(path.join(tmpdir(), "opsa-attachment-"));
    const content = Buffer.from("%PDF-1.4 comprovativo privado");
    const sourcePath = path.join(storageRoot, "source.pdf");
    await writeFile(sourcePath, content);
    const objectStorage = new LocalObjectStorage(path.join(storageRoot, "objects"));
    let createdAttachment;
    const journalEntry = {
        findFirst: async () => ({
            id: "journal-1",
            companyId: "company-1",
            source: "MANUAL",
            entryDate: new Date("2026-06-01T00:00:00.000Z"),
            lines: [],
            attachments: [],
        }),
    };

    const prisma = {
        journalEntry,
        journalAttachment: { findFirst: async () => null },
        $transaction: async (callback) =>
            callback({
                journalEntry,
                retentionHold: {
                    findFirst: async () => null,
                    upsert: async ({ create }) => ({ id: "hold-1", ...create }),
                },
                fiscalPeriod: {
                    findFirst: async () => ({
                        id: "period-1",
                        status: "OPEN",
                        startDate: new Date("2026-01-01T00:00:00.000Z"),
                        endDate: new Date("2026-12-31T00:00:00.000Z"),
                    }),
                },
                journalAttachment: {
                    create: async ({ data }) => {
                        createdAttachment = { id: "attachment-1", ...data };
                        return createdAttachment;
                    },
                },
                auditLog: {
                    create: async ({ data }) => ({ id: "audit-attachment-1", ...data }),
                },
            }),
    };

    try {
        const attachment = await addManualJournalAttachment(
            prisma,
            objectStorage,
            "company-1",
            "user-1",
            "journal-1",
            {
                fileName: "../comprovativo final.pdf",
                mimeType: "application/pdf",
                sizeBytes: content.length,
                sha256: "b".repeat(64),
                head: content.subarray(0, 16),
                tempPath: sourcePath,
            },
        );

        assert.equal(attachment.sizeBytes, content.length);
        assert.equal("storageKey" in attachment, false);
        assert.match(createdAttachment.storageKey, /^private\/manual-journals\//);
        assert.equal(createdAttachment.storageKey.includes(".."), false);
        assert.equal(createdAttachment.storageKey.includes(" "), false);
        assert.equal(createdAttachment.idempotencyKey, "b".repeat(64));

        const written = await readFile(
            path.join(
                storageRoot,
                "objects",
                ...createdAttachment.storageKey.split("/"),
            ),
        );
        assert.deepEqual(written, content);
        assert.equal(createdAttachment.companyId, "company-1");
    } finally {
        await rm(storageRoot, { recursive: true, force: true });
    }
});

test("BK-MF2-06: retry do mesmo conteúdo reutiliza o anexo ativo", async () => {
    const sha256 = "9".repeat(64);
    const existing = {
        id: "attachment-existing",
        fileName: "comprovativo.pdf",
        mimeType: "application/pdf",
        sizeBytes: 20,
        sha256,
        status: "ACTIVE",
        createdAt: new Date("2026-07-10T12:00:00.000Z"),
        storageKey: "private/manual-journals/existing.pdf",
    };
    let storageWrites = 0;
    const prisma = {
        journalEntry: {
            findFirst: async () => ({
                id: "journal-1",
                companyId: "company-1",
                source: "MANUAL",
                entryDate: new Date("2026-06-01T00:00:00.000Z"),
                lines: [],
                attachments: [],
            }),
        },
        journalAttachment: {
            findFirst: async ({ where }) => {
                assert.deepEqual(where, {
                    companyId: "company-1",
                    journalEntryId: "journal-1",
                    idempotencyKey: sha256,
                    status: "ACTIVE",
                });
                return existing;
            },
        },
        $transaction: async () => assert.fail("retry não deve criar nova metadata"),
    };
    const objectStorage = {
        provider: "TEST",
        putFile: async () => { storageWrites += 1; },
        copyObject: async () => { storageWrites += 1; },
        headObject: async () => { storageWrites += 1; },
        deleteObject: async () => { storageWrites += 1; },
        objectExists: async () => false,
    };

    const attachment = await addManualJournalAttachment(
        prisma,
        objectStorage,
        "company-1",
        "user-1",
        "journal-1",
        {
            fileName: "comprovativo.pdf",
            mimeType: "application/pdf",
            sizeBytes: 20,
            sha256,
            head: Buffer.from("%PDF-1.4 comprovativo"),
            tempPath: "/tmp/comprovativo-retry.pdf",
        },
    );

    assert.equal(attachment.id, existing.id);
    assert.equal("storageKey" in attachment, false);
    assert.equal(storageWrites, 0);
});

test("BK-MF2-06: corrida P2002 limpa apenas os objetos perdedores e devolve o vencedor", async () => {
    const sha256 = "8".repeat(64);
    const storedKeys = new Set();
    const deletedKeys = [];
    let attachmentReads = 0;
    const winner = {
        id: "attachment-winner",
        fileName: "comprovativo.pdf",
        mimeType: "application/pdf",
        sizeBytes: 20,
        sha256,
        status: "ACTIVE",
        createdAt: new Date("2026-07-10T12:00:00.000Z"),
        storageKey: "private/manual-journals/winner.pdf",
    };
    const prisma = {
        journalEntry: {
            findFirst: async () => ({
                id: "journal-1",
                companyId: "company-1",
                source: "MANUAL",
                entryDate: new Date("2026-06-01T00:00:00.000Z"),
                lines: [],
                attachments: [],
            }),
        },
        journalAttachment: {
            findFirst: async ({ where }) => {
                attachmentReads += 1;
                assert.deepEqual(where, {
                    companyId: "company-1",
                    journalEntryId: "journal-1",
                    idempotencyKey: sha256,
                    status: "ACTIVE",
                });
                return attachmentReads === 1 ? null : winner;
            },
        },
        $transaction: async () => {
            throw Object.assign(new Error("unique conflict"), { code: "P2002" });
        },
    };
    const objectStorage = {
        provider: "TEST",
        putFile: async ({ key }) => {
            storedKeys.add(key);
        },
        copyObject: async (sourceKey, destinationKey) => {
            assert.equal(storedKeys.has(sourceKey), true);
            storedKeys.add(destinationKey);
        },
        headObject: async (key) => {
            assert.equal(storedKeys.has(key), true);
            return {
                contentLength: 20,
                contentType: "application/pdf",
                metadata: { sha256 },
            };
        },
        deleteObject: async (key) => {
            deletedKeys.push(key);
            storedKeys.delete(key);
        },
        objectExists: async (key) => storedKeys.has(key),
    };

    const attachment = await addManualJournalAttachment(
        prisma,
        objectStorage,
        "company-1",
        "user-1",
        "journal-1",
        {
            fileName: "comprovativo.pdf",
            mimeType: "application/pdf",
            sizeBytes: 20,
            sha256,
            head: Buffer.from("%PDF-1.4 comprovativo"),
            tempPath: "/tmp/comprovativo-race.pdf",
        },
    );

    assert.equal(attachment.id, winner.id);
    assert.equal(attachmentReads, 2);
    assert.equal(storedKeys.size, 0);
    assert.equal(deletedKeys.includes(winner.storageKey), false);
    assert.equal(
        deletedKeys.some((key) => key.startsWith("private/manual-journals/")),
        true,
    );
});

test("BK-MF2-06: hold legal bloqueia anexo e remove objetos promovidos", async () => {
    const deleted = [];
    const journal = {
        id: "journal-1",
        companyId: "company-1",
        source: "MANUAL",
        entryDate: new Date("2026-06-01T00:00:00.000Z"),
        lines: [],
        attachments: [],
    };
    const objectStorage = {
        provider: "TEST",
        putFile: async () => undefined,
        copyObject: async () => undefined,
        headObject: async () => ({
            contentLength: 20,
            contentType: "application/pdf",
            metadata: { sha256: "a".repeat(64) },
        }),
        deleteObject: async (key) => {
            deleted.push(key);
        },
        objectExists: async () => false,
    };
    const tx = {
        journalEntry: { findFirst: async () => journal },
        retentionHold: {
            findFirst: async () => ({
                retainUntil: new Date("2036-12-31T00:00:00.000Z"),
            }),
        },
        journalAttachment: {
            create: async () => assert.fail("metadata não deve ser persistida"),
        },
    };
    const prisma = {
        journalEntry: { findFirst: async () => journal },
        journalAttachment: { findFirst: async () => null },
        $transaction: async (callback) => callback(tx),
    };

    await assert.rejects(
        () => addManualJournalAttachment(
            prisma,
            objectStorage,
            "company-1",
            "user-1",
            "journal-1",
            {
                fileName: "comprovativo.pdf",
                mimeType: "application/pdf",
                sizeBytes: 20,
                sha256: "a".repeat(64),
                head: Buffer.from("%PDF-1.4 comprovativo"),
                tempPath: "/tmp/comprovativo.pdf",
            },
        ),
        { code: "RETENTION_HOLD_ACTIVE" },
    );
    assert.equal(deleted.length >= 2, true);
});

test("BK-MF2-06: anexo PNG válido é aceite por assinatura real", () => {
    const content = Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        Buffer.from("conteudo-png-minimo"),
    ]);
    const attachment = prepareJournalAttachment({
        fileName: "contagem.png",
        mimeType: "image/png",
        sizeBytes: content.length,
        sha256: "c".repeat(64),
        head: content,
        tempPath: "/tmp/test-upload",
    });

    assert.equal(attachment.sizeBytes, content.length);
    assert.equal(attachment.mimeType, "image/png");
});

test("BK-MF2-06: download rejeita tamanho do objeto diferente da metadata", async () => {
    let destroyed = false;
    const attachment = {
        id: "attachment-1",
        journalEntryId: "journal-1",
        companyId: "company-1",
        status: "ACTIVE",
        storageKey: "private/manual-journals/attachment.pdf",
        fileName: "attachment.pdf",
        mimeType: "application/pdf",
        sizeBytes: 100,
        sha256: "d".repeat(64),
    };
    await assert.rejects(
        () =>
            getManualJournalAttachmentDownload(
                {
                    journalAttachment: {
                        findFirst: async ({ where }) => {
                            assert.deepEqual(where, {
                                id: "attachment-1",
                                journalEntryId: "journal-1",
                                companyId: "company-1",
                                status: "ACTIVE",
                            });
                            return attachment;
                        },
                    },
                },
                {
                    getObject: async () => ({
                        contentLength: 99,
                        contentType: "application/pdf",
                        metadata: { sha256: attachment.sha256 },
                        body: {
                            pipe() {},
                            destroy() { destroyed = true; },
                        },
                    }),
                },
                {
                    companyId: "company-1",
                    journalEntryId: "journal-1",
                    attachmentId: "attachment-1",
                },
            ),
        { code: "JOURNAL_ATTACHMENT_INTEGRITY_FAILED", status: 409 },
    );
    assert.equal(destroyed, true);
});

test("BK-MF2-06: download rejeita SHA-256 do objeto diferente do registo", async () => {
    const attachment = {
        id: "attachment-1",
        journalEntryId: "journal-1",
        companyId: "company-1",
        status: "ACTIVE",
        storageKey: "private/manual-journals/attachment.pdf",
        mimeType: "application/pdf",
        sizeBytes: 100,
        sha256: "e".repeat(64),
    };
    await assert.rejects(
        () =>
            getManualJournalAttachmentDownload(
                { journalAttachment: { findFirst: async () => attachment } },
                {
                    getObject: async () => ({
                        contentLength: 100,
                        contentType: "application/pdf",
                        metadata: { sha256: "f".repeat(64) },
                        body: { pipe() {}, destroy() {} },
                    }),
                },
                {
                    companyId: "company-1",
                    journalEntryId: "journal-1",
                    attachmentId: "attachment-1",
                },
            ),
        { code: "JOURNAL_ATTACHMENT_INTEGRITY_FAILED", status: 409 },
    );
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
    let postedAt;
    let reads = 0;
    const rawQueries = [];
    const tx = {
        $executeRaw: async (strings) => {
            rawQueries.push(strings.join(" "));
            return 1;
        },
        $queryRaw: async (strings) => {
            const sql = strings.join(" ");
            rawQueries.push(sql);
            return sql.includes('FROM "StockBalance"')
                ? [{ quantity: 5 }]
                : [];
        },
        inventoryCount: {
            findFirst: async ({ where, include }) => {
                reads += 1;
                if (reads === 2) {
                    assert.deepEqual(where, {
                        id: "count-1",
                        companyId: "company-1",
                        status: "POSTED",
                    });
                    assert.deepEqual(include, {
                        warehouse: true,
                        lines: { include: { item: true } },
                    });
                    return { id: "count-1", status: "POSTED", postedAt };
                }
                assert.deepEqual(where, { id: "count-1", companyId: "company-1" });
                assert.deepEqual(include, {
                    lines: { orderBy: { itemId: "asc" } },
                });
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
            updateMany: async ({ where, data }) => {
                assert.deepEqual(where, {
                    id: "count-1",
                    companyId: "company-1",
                    status: "DRAFT",
                });
                assert.equal(data.status, "POSTED");
                assert.ok(data.postedAt instanceof Date);
                postedAt = data.postedAt;
                return { count: 1 };
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

    assert.ok(rawQueries.some((sql) => sql.includes("pg_advisory_xact_lock")));
    assert.ok(
        rawQueries.some(
            (sql) => sql.includes('FROM "StockBalance"') && sql.includes("FOR UPDATE"),
        ),
    );
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
