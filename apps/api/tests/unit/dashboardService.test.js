/**
 * @file Testes do resumo read-only, datas e isolamento multiempresa do dashboard.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    buildDashboardSummary,
    parseDashboardAsOf,
} from "../../src/modules/dashboard/dashboardService.js";

function createPrismaDouble() {
    const writes = [];
    return {
        writes,
        fiscalPeriod: {
            findFirst: async ({ where }) => {
                assert.equal(where.companyId, "company-1");
                return {
                    id: "period-1",
                    name: "2026",
                    startDate: new Date("2026-01-01T00:00:00.000Z"),
                    endDate: new Date("2026-12-31T00:00:00.000Z"),
                    status: "OPEN",
                };
            },
        },
        saleDocument: {
            groupBy: async ({ where }) => {
                assert.equal(where.companyId, "company-1");
                return [
                    { status: "DRAFT", _count: { _all: 2 } },
                    { status: "SUBMITTED", _count: { _all: 1 } },
                    { status: "APPROVED", _count: { _all: 3 } },
                ];
            },
            findMany: async ({ where }) => {
                assert.equal(where.companyId, "company-1");
                return [
                    { totalCents: 10000, amountPaidCents: 2500, dueDate: new Date("2026-07-01T00:00:00.000Z"), issuedAt: new Date("2026-06-01T00:00:00.000Z") },
                    { totalCents: 5000, amountPaidCents: 5000, dueDate: new Date("2026-06-01T00:00:00.000Z"), issuedAt: new Date("2026-05-01T00:00:00.000Z") },
                ];
            },
        },
        purchaseDocument: {
            groupBy: async ({ where }) => {
                assert.equal(where.companyId, "company-1");
                return [{ status: "APPROVED", _count: { _all: 4 } }];
            },
        },
        stockAlertSetting: { findMany: async ({ where }) => {
            assert.equal(where.companyId, "company-1");
            return [];
        } },
        inAppNotification: {
            count: async ({ where }) => {
                assert.deepEqual(where, { companyId: "company-1", userId: "user-1", readAt: null });
                return 5;
            },
        },
    };
}

test("parseDashboardAsOf rejeita datas impossíveis", () => {
    assert.throws(
        () => parseDashboardAsOf("2026-02-30"),
        (error) => error.code === "INVALID_DASHBOARD_DATE",
    );
});

test("dashboard agrega apenas a empresa ativa e não executa escritas", async () => {
    const prisma = createPrismaDouble();
    const summary = await buildDashboardSummary(prisma, {
        companyId: "company-1",
        company: { id: "company-1", name: "Empresa 1" },
        userId: "user-1",
        asOf: "2026-07-12",
    });

    assert.equal(summary.company.id, "company-1");
    assert.deepEqual(summary.sales, { draft: 2, submitted: 1, approved: 3 });
    assert.deepEqual(summary.purchases, { draft: 0, approved: 4 });
    assert.deepEqual(summary.receivables, { openCount: 1, overdueCount: 1, overdueCents: 7500 });
    assert.deepEqual(summary.stockAlerts, { total: 0, lowStock: 0, highStock: 0, stoppedItems: 0 });
    assert.equal(summary.notifications.unread, 5);
    assert.equal(prisma.writes.length, 0);
});

test("dashboard aceita ausência de período e dados vazios", async () => {
    const prisma = createPrismaDouble();
    prisma.fiscalPeriod.findFirst = async () => null;
    prisma.saleDocument.groupBy = async () => [];
    prisma.saleDocument.findMany = async () => [];
    prisma.purchaseDocument.groupBy = async () => [];
    prisma.inAppNotification.count = async () => 0;

    const summary = await buildDashboardSummary(prisma, {
        companyId: "company-1",
        company: { id: "company-1", name: "Empresa 1" },
        userId: "user-1",
        asOf: "2026-07-12",
    });
    assert.equal(summary.activeFiscalPeriod, null);
    assert.equal(summary.receivables.openCount, 0);
});
