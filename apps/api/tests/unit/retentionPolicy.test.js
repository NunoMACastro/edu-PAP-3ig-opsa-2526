/**
 * @file Testes unitarios da retencao legal BK-MF7-02.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { toHttpError } from "../../src/lib/httpErrors.js";
import {
    RetentionHoldActiveError,
    assertRetainedEntity,
    assertRetainedRecordDeletionAllowed,
    calculateRetainUntil,
    isRetentionActive,
    materializeRetentionHoldsForPeriod,
    upsertRetentionHold,
} from "../../src/modules/compliance/retentionPolicy.js";
import {
    RETENTION_AUDIT_ACTION,
    assertSaleDocumentDeletionAllowed,
} from "../../src/modules/compliance/retentionDeletionGate.js";

/**
 * Cria um double minimo de Prisma para testar a politica sem base de dados real.
 *
 * @param {{ retainUntil: Date } | null} hold - Retencao devolvida pela query.
 * @returns {object} Cliente Prisma minimo com registo de chamadas.
 */
function createPrismaDouble(hold) {
    const calls = {
        retentionQueries: [],
        auditWrites: [],
    };

    return {
        calls,
        retentionHold: {
            async findFirst(query) {
                calls.retentionQueries.push(query);
                return hold;
            },
        },
        auditLog: {
            async create(query) {
                calls.auditWrites.push(query);
                return { id: "audit_1", ...query.data };
            },
        },
    };
}

test("BK-MF7-02: calcula a retencao legal de 10 anos", () => {
    const retainUntil = calculateRetainUntil(
        new Date("2026-12-31T00:00:00.000Z"),
    );

    assert.equal(retainUntil.toISOString(), "2036-12-31T00:00:00.000Z");
});

test("BK-MF7-02: materializa hold idempotente com chave multiempresa", async () => {
    const calls = [];
    const prisma = {
        retentionHold: {
            async upsert(args) {
                calls.push(args);
                return { id: "hold_1", ...args.create };
            },
        },
    };

    await upsertRetentionHold(prisma, {
        companyId: "company_1",
        entity: "SaleDocument",
        entityId: "sale_1",
        periodEndAt: new Date("2026-12-31T00:00:00.000Z"),
        reason: "SALE_DOCUMENT_ISSUED",
    });

    assert.deepEqual(calls[0].where, {
        companyId_entity_entityId: {
            companyId: "company_1",
            entity: "SaleDocument",
            entityId: "sale_1",
        },
    });
    assert.equal(
        calls[0].create.retainUntil.toISOString(),
        "2036-12-31T00:00:00.000Z",
    );
});

test("BK-MF7-02: fecho fiscal materializa todas as fontes na mesma transacao", async () => {
    const upserts = [];
    const emptySource = { findMany: async () => [] };
    const tx = {
        saleDocument: { findMany: async () => [{ id: "sale_1" }] },
        purchaseDocument: emptySource,
        receipt: { findMany: async () => [{ id: "receipt_1" }] },
        payment: { findMany: async () => [{ id: "payment_1" }] },
        journalEntry: { findMany: async () => [{ id: "journal_1" }] },
        vatMapRun: emptySource,
        saftExportRun: emptySource,
        auditLog: emptySource,
        retentionHold: {
            async upsert(args) {
                upserts.push(args);
                return { id: `hold_${upserts.length}`, ...args.create };
            },
        },
    };

    const result = await materializeRetentionHoldsForPeriod(tx, {
        companyId: "company_1",
        period: {
            startDate: new Date("2026-01-01T00:00:00.000Z"),
            endDate: new Date("2026-12-31T00:00:00.000Z"),
        },
    });

    assert.equal(result.total, 4);
    assert.equal(result.byEntity.SaleDocument, 1);
    assert.equal(result.byEntity.Receipt, 1);
    assert.equal(result.byEntity.Payment, 1);
    assert.equal(result.byEntity.JournalEntry, 1);
    assert.deepEqual(
        upserts.map((call) => call.create.entity),
        ["SaleDocument", "Receipt", "Payment", "JournalEntry"],
    );
    assert.equal(
        upserts.every(
            (call) => call.create.reason === "FISCAL_PERIOD_CLOSED",
        ),
        true,
    );
});

test("BK-MF7-02: rejeita datas invalidas no calculo de retencao", () => {
    assert.throws(
        () => calculateRetainUntil(new Date("data invalida")),
        /periodEndAt tem de ser uma data valida/,
    );
});

test("BK-MF7-02: valida apenas entidades contabilisticas protegidas", () => {
    assert.equal(assertRetainedEntity("SaleDocument"), "SaleDocument");
    assert.equal(assertRetainedEntity("Receipt"), "Receipt");
    assert.equal(assertRetainedEntity("Payment"), "Payment");

    assert.throws(
        () => assertRetainedEntity("MarketingLead"),
        /nao esta abrangida pela retencao contabilistica/,
    );
});

test("BK-MF7-02: indica retencao ativa antes do fim do prazo", () => {
    const active = isRetentionActive({
        retainUntil: new Date("2036-12-31T00:00:00.000Z"),
        now: new Date("2030-01-01T00:00:00.000Z"),
    });

    assert.equal(active, true);
});

test("BK-MF7-02: bloqueia remocao com retencao ativa e erro HTTP 409", async () => {
    const prisma = createPrismaDouble({
        retainUntil: new Date("2036-12-31T00:00:00.000Z"),
    });

    await assert.rejects(
        () =>
            assertRetainedRecordDeletionAllowed(prisma, {
                companyId: "company_1",
                entity: "SaleDocument",
                entityId: "sale_1",
                now: new Date("2030-01-01T00:00:00.000Z"),
            }),
        (error) => {
            assert.equal(error instanceof RetentionHoldActiveError, true);
            assert.equal(error.code, "RETENTION_HOLD_ACTIVE");
            assert.equal(error.statusCode, 409);

            const httpError = toHttpError(error);
            assert.equal(httpError.status, 409);
            assert.equal(httpError.code, "RETENTION_HOLD_ACTIVE");
            return true;
        },
    );
});

test("BK-MF7-02: autoriza remocao quando nao existe retencao persistida", async () => {
    const prisma = createPrismaDouble(null);

    const result = await assertRetainedRecordDeletionAllowed(prisma, {
        companyId: "company_1",
        entity: "SaleDocument",
        entityId: "sale_1",
        now: new Date("2030-01-01T00:00:00.000Z"),
    });

    assert.deepEqual(result, {
        allowed: true,
        retainUntil: null,
    });
    assert.deepEqual(prisma.calls.retentionQueries[0].where, {
        companyId: "company_1",
        entity: "SaleDocument",
        entityId: "sale_1",
    });
});

test("BK-MF7-02: autoriza remocao depois de terminar a retencao", async () => {
    const prisma = createPrismaDouble({
        retainUntil: new Date("2030-01-01T00:00:00.000Z"),
    });

    const result = await assertRetainedRecordDeletionAllowed(prisma, {
        companyId: "company_1",
        entity: "SaleDocument",
        entityId: "sale_1",
        now: new Date("2031-01-01T00:00:00.000Z"),
    });

    assert.equal(result.allowed, true);
    assert.equal(result.retainUntil.toISOString(), "2030-01-01T00:00:00.000Z");
});

test("BK-MF7-02: gate regista auditoria sensivel quando a remocao e autorizada", async () => {
    const prisma = createPrismaDouble({
        retainUntil: new Date("2030-01-01T00:00:00.000Z"),
    });

    await assertSaleDocumentDeletionAllowed(prisma, {
        companyId: "company_1",
        userId: "user_1",
        saleDocumentId: "sale_1",
        now: new Date("2031-01-01T00:00:00.000Z"),
    });

    assert.equal(prisma.calls.auditWrites.length, 1);
    assert.equal(prisma.calls.auditWrites[0].data.action, RETENTION_AUDIT_ACTION);
    assert.equal(prisma.calls.auditWrites[0].data.entity, "SaleDocument");
    assert.equal(prisma.calls.auditWrites[0].data.entityId, "sale_1");
    assert.deepEqual(prisma.calls.auditWrites[0].data.details, {
        retainUntil: "2030-01-01T00:00:00.000Z",
        retentionStatus: "expired",
    });
});

test("BK-MF7-02: gate nao audita quando a retencao ainda bloqueia", async () => {
    const prisma = createPrismaDouble({
        retainUntil: new Date("2036-12-31T00:00:00.000Z"),
    });

    await assert.rejects(
        () =>
            assertSaleDocumentDeletionAllowed(prisma, {
                companyId: "company_1",
                userId: "user_1",
                saleDocumentId: "sale_1",
                now: new Date("2030-01-01T00:00:00.000Z"),
            }),
        /retencao legal/,
    );

    assert.equal(prisma.calls.auditWrites.length, 0);
});
