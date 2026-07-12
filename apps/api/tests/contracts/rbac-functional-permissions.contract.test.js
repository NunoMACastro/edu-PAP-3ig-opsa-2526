/**
 * @file Matriz role x permissão x endpoint para os fluxos funcionais corrigidos.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { buildCustomerRoutes } from "../../src/modules/customers/customerRoutes.js";
import { buildDashboardRoutes } from "../../src/modules/dashboard/dashboardRoutes.js";
import { buildItemRoutes } from "../../src/modules/items/itemRoutes.js";
import { buildNotificationRoutes } from "../../src/modules/notifications/notificationRoutes.js";
import { Permission, hasPermission } from "../../src/modules/permissions/permissions.js";
import { buildPurchaseApprovalRoutes } from "../../src/modules/purchase-approval/purchaseApprovalRoutes.js";
import { buildReminderRoutes } from "../../src/modules/reminders/reminderRoutes.js";
import { buildExecutiveKpiRoutes } from "../../src/modules/reports/executiveKpiRoutes.js";
import { buildOperationalReportRoutes } from "../../src/modules/reports/operationalReportRoutes.js";
import { buildSubscriptionRoutes } from "../../src/modules/subscriptions/subscriptionRoutes.js";
import { buildSupplierRoutes } from "../../src/modules/suppliers/supplierRoutes.js";
import { buildVatMapRoutes } from "../../src/modules/tax/vatMapRoutes.js";
import { buildTreasuryAccountRoutes } from "../../src/modules/treasury/bankAccountRoutes.js";
import { buildCashflowForecastRoutes } from "../../src/modules/treasury/cashflowForecastRoutes.js";
import { buildWarehouseRoutes } from "../../src/modules/warehouses/warehouseRoutes.js";

const ROLES = ["ADMIN", "GESTOR", "CONTABILISTA", "OPERACIONAL", "AUDITOR"];

const SPECIFIC_MATRIX = new Map([
    [Permission.DASHBOARD_READ, ROLES],
    [Permission.CUSTOMERS_READ, ROLES],
    [Permission.SUPPLIERS_READ, ROLES],
    [Permission.ITEMS_READ, ROLES],
    [Permission.WAREHOUSES_READ, ROLES],
    [Permission.PURCHASE_APPROVAL_HISTORY_READ, ["ADMIN", "GESTOR", "AUDITOR"]],
    [Permission.CASHFLOW_FORECAST_READ, ["ADMIN", "GESTOR"]],
    [Permission.OPERATIONAL_REPORTS_READ, ["ADMIN", "GESTOR", "OPERACIONAL"]],
    [Permission.EXECUTIVE_KPIS_READ, ["ADMIN", "GESTOR"]],
    [Permission.SUBSCRIPTIONS_MANAGE, ["ADMIN", "GESTOR"]],
]);

/**
 * Executa exclusivamente o guard funcional da rota, sem chamar controllers.
 *
 * @param {import("express").Router} router - Router a inspecionar.
 * @param {string} method - Método em minúsculas.
 * @param {string} path - Path Express canónico.
 * @param {string} role - Persona ativa.
 * @returns {{ status: number, nextCalled: boolean }} Resultado do guard.
 */
function runPermissionGuard(router, method, path, role) {
    const routeLayer = router.stack.find(
        (layer) => layer.route?.path === path && layer.route.methods[method],
    );
    assert.ok(routeLayer, `${method.toUpperCase()} ${path} não existe`);
    const permissionLayers = routeLayer.route.stack.filter(
        (layer) => layer.handle.name === "permissionMiddleware",
    );
    assert.equal(permissionLayers.length, 1, `${method.toUpperCase()} ${path} deve ter um guard funcional`);

    let status = 204;
    let nextCalled = false;
    const res = {
        status(value) {
            status = value;
            return this;
        },
        json() {
            return this;
        },
    };
    permissionLayers[0].handle(
        { user: { id: "user-1" }, role },
        res,
        () => {
            nextCalled = true;
        },
    );
    return { status, nextCalled };
}

test("matriz canónica atribui as permissões específicas apenas às roles previstas", () => {
    for (const [permission, allowedRoles] of SPECIFIC_MATRIX) {
        for (const role of ROLES) {
            assert.equal(
                hasPermission(role, permission),
                allowedRoles.includes(role),
                `${role} x ${permission}`,
            );
        }
    }

    assert.equal(hasPermission("GESTOR", Permission.TAX_READ), false);
    assert.equal(hasPermission("GESTOR", Permission.TREASURY_WRITE), false);
    assert.equal(hasPermission("AUDITOR", Permission.REMINDERS_WRITE), true);
    assert.equal(hasPermission("AUDITOR", Permission.NOTIFICATIONS_READ), true);
    assert.equal(hasPermission("GESTOR", Permission.REPORTS_READ), true);
});

const deps = { prisma: {}, objectStorage: {} };
const endpointCases = [
    ["dashboard", buildDashboardRoutes(deps), "get", "/summary", Permission.DASHBOARD_READ],
    ["clientes", buildCustomerRoutes(deps), "get", "/", Permission.CUSTOMERS_READ],
    ["fornecedores", buildSupplierRoutes(deps), "get", "/", Permission.SUPPLIERS_READ],
    ["artigos", buildItemRoutes(deps), "get", "/", Permission.ITEMS_READ],
    ["armazéns", buildWarehouseRoutes(deps), "get", "/", Permission.WAREHOUSES_READ],
    ["histórico de compras", buildPurchaseApprovalRoutes(deps), "get", "/:id/approval-history", Permission.PURCHASE_APPROVAL_HISTORY_READ],
    ["previsão", buildCashflowForecastRoutes(deps), "get", "/forecast", Permission.CASHFLOW_FORECAST_READ],
    ["relatório operacional", buildOperationalReportRoutes(deps), "get", "/operational", Permission.OPERATIONAL_REPORTS_READ],
    ["KPIs executivos", buildExecutiveKpiRoutes(deps), "get", "/executive-kpis", Permission.EXECUTIVE_KPIS_READ],
    ["subscrições", buildSubscriptionRoutes(deps), "get", "/plans", Permission.SUBSCRIPTIONS_MANAGE],
];

for (const [label, router, method, path, permission] of endpointCases) {
    test(`endpoint ${label} devolve passagem/403 conforme a matriz`, () => {
        const allowedRoles = SPECIFIC_MATRIX.get(permission);
        for (const role of ROLES) {
            const result = runPermissionGuard(router, method, path, role);
            const allowed = allowedRoles.includes(role);
            assert.equal(result.nextCalled, allowed, `${role} x ${label}`);
            assert.equal(result.status, allowed ? 204 : 403, `${role} x ${label}`);
        }
    });
}

test("GESTOR recebe 403 nos endpoints de IVA e escrita de tesouraria", () => {
    assert.deepEqual(
        runPermissionGuard(buildVatMapRoutes(deps), "get", "/vat-maps", "GESTOR"),
        { status: 403, nextCalled: false },
    );
    assert.deepEqual(
        runPermissionGuard(buildTreasuryAccountRoutes(deps), "post", "/accounts", "GESTOR"),
        { status: 403, nextCalled: false },
    );
});

test("AUDITOR passa nos endpoints de lembretes e notificações", () => {
    assert.deepEqual(
        runPermissionGuard(buildReminderRoutes(deps), "post", "/", "AUDITOR"),
        { status: 204, nextCalled: true },
    );
    assert.deepEqual(
        runPermissionGuard(buildNotificationRoutes(deps), "get", "/", "AUDITOR"),
        { status: 204, nextCalled: true },
    );
});
