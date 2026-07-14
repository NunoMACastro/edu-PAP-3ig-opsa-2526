/**
 * @file Regressões do preflight de fecho fiscal.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { closeFiscalPeriod } from "../../src/modules/fiscal-periods/fiscalPeriodService.js";

const period = {
    id: "period-1",
    companyId: "company-1",
    name: "Exercício 2026",
    fiscalYear: 2026,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
    endDate: new Date("2026-12-31T00:00:00.000Z"),
    status: "OPEN",
    closedAt: null,
    closedById: null,
};

/**
 * Cria um double mínimo para chegar ao preflight sem persistir o fecho.
 *
 * @param {{ pendingSaleDecisions?: number, issuedSales?: object[], approvedPurchases?: object[], postedSales?: number, postedPurchases?: number }} overrides - Resultados das consultas.
 * @returns {{ prisma: object, getFiscalWrites: () => number }} Double e contador.
 */
function buildPrisma(overrides = {}) {
    let fiscalWrites = 0;
    let closedPeriod = null;
    const emptySource = { findMany: async () => [] };
    const tx = {
        $queryRaw: async () => undefined,
        fiscalPeriod: {
            findFirst: async () => closedPeriod ?? period,
            updateMany: async ({ data }) => {
                fiscalWrites += 1;
                closedPeriod = { ...period, ...data };
                return { count: 1 };
            },
        },
        saleDocument: {
            count: async () => overrides.pendingSaleDecisions ?? 0,
            findMany: async () => overrides.issuedSales ?? [],
        },
        purchaseDocument: {
            findMany: async () => overrides.approvedPurchases ?? [],
        },
        journalEntry: {
            count: async ({ where }) =>
                where.source === "SALE"
                    ? (overrides.postedSales ?? 0)
                    : (overrides.postedPurchases ?? 0),
            findMany: async () => overrides.journalEntries ?? [],
        },
        receipt: emptySource,
        payment: emptySource,
        vatMapRun: emptySource,
        saftExportRun: emptySource,
        auditLog: {
            findMany: async () => [],
            create: async ({ data }) => ({ id: "audit-1", ...data }),
        },
        retentionHold: {
            upsert: async ({ create }) => ({ id: `hold-${create.entityId}` }),
        },
    };
    return {
        prisma: { $transaction: async (callback) => callback(tx) },
        getFiscalWrites: () => fiscalWrites,
    };
}

for (const scenario of [
    {
        name: "venda submetida ou aprovada",
        overrides: { pendingSaleDecisions: 1 },
    },
    {
        name: "venda emitida ainda não contabilizada",
        overrides: { issuedSales: [{ id: "sale-1" }], postedSales: 0 },
    },
    {
        name: "compra aprovada ou paga ainda não contabilizada",
        overrides: {
            approvedPurchases: [{ id: "purchase-1" }],
            postedPurchases: 0,
        },
    },
]) {
    test(`fecho fiscal bloqueia ${scenario.name}`, async () => {
        const { prisma, getFiscalWrites } = buildPrisma(scenario.overrides);

        await assert.rejects(
            () => closeFiscalPeriod(prisma, {
                companyId: "company-1",
                periodId: "period-1",
                actorUserId: "user-1",
            }),
            {
                code: "FISCAL_PERIOD_HAS_PENDING_DOCUMENTS",
                status: 409,
            },
        );
        assert.equal(getFiscalWrites(), 0);
    });
}

test("fecho fiscal aceita documentos definitivos já contabilizados", async () => {
    const { prisma, getFiscalWrites } = buildPrisma({
        issuedSales: [{ id: "sale-1" }],
        postedSales: 1,
        approvedPurchases: [{ id: "purchase-1" }],
        postedPurchases: 1,
        journalEntries: [{ id: "journal-1" }, { id: "journal-2" }],
    });

    const closed = await closeFiscalPeriod(prisma, {
        companyId: "company-1",
        periodId: "period-1",
        actorUserId: "user-1",
        now: new Date("2027-01-02T12:00:00.000Z"),
    });

    assert.equal(closed.status, "CLOSED");
    assert.equal(getFiscalWrites(), 1);
});
