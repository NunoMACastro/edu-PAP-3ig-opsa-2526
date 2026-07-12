/**
 * @file Testes de revisão imutável e retention hold em lançamentos manuais.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { updateManualJournal } from "../../src/modules/accounting/manualJournalService.js";

const CURRENT_ENTRY = Object.freeze({
    id: "journal-1",
    companyId: "company-1",
    source: "MANUAL",
    entryDate: new Date("2026-03-01T00:00:00.000Z"),
    description: "Versão original",
    lines: [
        { accountId: "account-1", debitCents: 100, creditCents: 0, memo: null },
        { accountId: "account-2", debitCents: 0, creditCents: 100, memo: null },
    ],
    attachments: [],
});

/**
 * Cria um double transacional com ordem de escritas observável.
 *
 * @param {object | null} hold - Hold devolvido pela query.
 * @returns {{ prisma: object, writes: string[], revisions: object[] }} Double e evidência.
 */
function createPrismaDouble(hold = null) {
    const writes = [];
    const revisions = [];
    const tx = {
        journalEntry: {
            findFirst: async () => CURRENT_ENTRY,
            update: async ({ data }) => {
                writes.push("entry.update");
                return {
                    ...CURRENT_ENTRY,
                    ...data,
                    lines: data.lines.create,
                };
            },
        },
        retentionHold: {
            findFirst: async () => hold,
            upsert: async ({ create }) => ({ id: "hold-audit-1", ...create }),
        },
        fiscalPeriod: {
            findFirst: async () => ({
                id: "period-1",
                status: "OPEN",
                startDate: new Date("2026-01-01T00:00:00.000Z"),
                endDate: new Date("2026-12-31T00:00:00.000Z"),
            }),
        },
        account: {
            findMany: async () => [{ id: "account-1" }, { id: "account-2" }],
        },
        journalEntryRevision: {
            count: async () => 0,
            create: async ({ data }) => {
                writes.push("revision.create");
                const revision = { id: "revision-1", ...data };
                revisions.push(revision);
                return revision;
            },
        },
        journalEntryLine: {
            deleteMany: async () => {
                writes.push("lines.delete");
                return { count: 2 };
            },
        },
        auditLog: {
            create: async () => {
                writes.push("audit.create");
                return { id: "audit-1" };
            },
        },
    };
    return {
        writes,
        revisions,
        prisma: {
            ...tx,
            $transaction: async (callback) => callback(tx),
        },
    };
}

const UPDATE = Object.freeze({
    entryDate: "2026-03-02",
    description: "Versão corrigida",
    reason: "Correção da conta de contrapartida",
    lines: [
        { accountId: "account-1", debitCents: 200, creditCents: 0 },
        { accountId: "account-2", debitCents: 0, creditCents: 200 },
    ],
});

test("revisão before/after é criada antes de substituir as linhas", async () => {
    const { prisma, writes, revisions } = createPrismaDouble();
    await updateManualJournal(prisma, "company-1", "user-1", "journal-1", UPDATE);

    assert.deepEqual(writes, [
        "revision.create",
        "lines.delete",
        "entry.update",
        "audit.create",
    ]);
    assert.equal(revisions[0].revisionNumber, 1);
    assert.equal(revisions[0].snapshotBefore.description, "Versão original");
    assert.equal(revisions[0].snapshotAfter.description, "Versão corrigida");
    assert.equal(revisions[0].reason, UPDATE.reason);
});

test("retention hold ativo bloqueia revisão antes de qualquer escrita", async () => {
    const { prisma, writes } = createPrismaDouble({
        retainUntil: new Date("2036-12-31T00:00:00.000Z"),
    });
    await assert.rejects(
        () => updateManualJournal(prisma, "company-1", "user-1", "journal-1", UPDATE),
        { code: "RETENTION_HOLD_ACTIVE" },
    );
    assert.deepEqual(writes, []);
});

test("alteração sem motivo não inicia a transação", async () => {
    const { prisma, writes } = createPrismaDouble();
    await assert.rejects(
        () =>
            updateManualJournal(prisma, "company-1", "user-1", "journal-1", {
                ...UPDATE,
                reason: "",
            }),
        { code: "JOURNAL_REVISION_REASON_REQUIRED" },
    );
    assert.deepEqual(writes, []);
});
