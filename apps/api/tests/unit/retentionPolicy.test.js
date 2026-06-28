// apps/api/tests/unit/retentionPolicy.test.js
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
    RetentionHoldActiveError,
    assertRetainedEntity,
    assertRetainedRecordDeletionAllowed,
    calculateRetainUntil,
    isRetentionActive,
} from "../../src/modules/compliance/retentionPolicy.js";
import {
    RETENTION_AUDIT_ACTION,
    assertSaleDocumentDeletionAllowed,
} from "../../src/modules/compliance/retentionDeletionGate.js";

/**
 * Cria um double mínimo de Prisma para testar a política sem base de dados real.
 *
 * @param {{ retainUntil: Date } | null} hold - Retenção devolvida pela query.
 * @returns {object} Cliente Prisma mínimo com registo de chamadas.
 */
function createPrismaDouble(hold) {
    const calls = {
        retentionQueries: [],
        auditWrites: [],
        saleDocumentDeletes: [],
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
        saleDocument: {
            async deleteMany(query) {
                calls.saleDocumentDeletes.push(query);
                return { count: 1 };
            },
        },
    };
}

describe("retentionPolicy", () => {
    it("calcula a retenção legal de 10 anos a partir do fim do período", () => {
        const retainUntil = calculateRetainUntil(new Date("2026-12-31T00:00:00.000Z"));

        assert.equal(retainUntil.toISOString(), "2036-12-31T00:00:00.000Z");
    });

    it("rejeita datas inválidas no cálculo de retenção", () => {
        assert.throws(
            () => calculateRetainUntil(new Date("data inválida")),
            /periodEndAt tem de ser uma data válida/,
        );
    });

    it("valida apenas entidades contabilísticas protegidas", () => {
        assert.equal(assertRetainedEntity("SaleDocument"), "SaleDocument");

        assert.throws(
            () => assertRetainedEntity("MarketingLead"),
            /não está abrangida pela retenção contabilística/,
        );
    });

    it("indica retenção ativa enquanto retainUntil for posterior ao instante atual", () => {
        const active = isRetentionActive({
            retainUntil: new Date("2036-12-31T00:00:00.000Z"),
            now: new Date("2030-01-01T00:00:00.000Z"),
        });

        assert.equal(active, true);
    });

    it("bloqueia a remoção quando existe retenção ativa", async () => {
        const prisma = createPrismaDouble({
            retainUntil: new Date("2036-12-31T00:00:00.000Z"),
        });

        await assert.rejects(
            () => assertRetainedRecordDeletionAllowed(prisma, {
                companyId: "company_1",
                entity: "SaleDocument",
                entityId: "sale_1",
                now: new Date("2030-01-01T00:00:00.000Z"),
            }),
            (error) => {
                assert.equal(error instanceof RetentionHoldActiveError, true);
                assert.equal(error.code, "RETENTION_HOLD_ACTIVE");
                assert.equal(error.statusCode, 409);
                return true;
            },
        );
    });

    it("autoriza a remoção quando não existe retenção persistida", async () => {
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
    });

    it("autoriza a remoção depois de terminar a retenção", async () => {
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
});

describe("retentionDeletionGate", () => {
    it("regista auditoria sensível quando a remoção é autorizada", async () => {
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
        // Os detalhes guardam apenas metadados mínimos e não payloads completos.
        assert.deepEqual(prisma.calls.auditWrites[0].data.details, {
            retainUntil: "2030-01-01T00:00:00.000Z",
            retentionStatus: "expired",
        });
    });

    it("não regista auditoria quando a retenção ainda bloqueia a remoção", async () => {
        const prisma = createPrismaDouble({
            retainUntil: new Date("2036-12-31T00:00:00.000Z"),
        });

        await assert.rejects(
            () => assertSaleDocumentDeletionAllowed(prisma, {
                companyId: "company_1",
                userId: "user_1",
                saleDocumentId: "sale_1",
                now: new Date("2030-01-01T00:00:00.000Z"),
            }),
            /retenção legal/,
        );

        assert.equal(prisma.calls.auditWrites.length, 0);
    });
});