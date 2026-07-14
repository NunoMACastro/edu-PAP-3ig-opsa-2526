/**
 * @file Testes de contrato MF3 para permissões, routers e migration.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { buildSaftRoutes } from "../../src/modules/compliance/saftRoutes.js";
import { buildBusinessImportRoutes } from "../../src/modules/imports/businessImportRoutes.js";
import { hasPermission, Permission } from "../../src/modules/permissions/permissions.js";
import { buildExecutiveKpiRoutes } from "../../src/modules/reports/executiveKpiRoutes.js";
import { buildOperationalReportRoutes } from "../../src/modules/reports/operationalReportRoutes.js";
import { buildVatMapRoutes } from "../../src/modules/tax/vatMapRoutes.js";
import { buildTreasuryAccountRoutes } from "../../src/modules/treasury/bankAccountRoutes.js";
import { buildCashflowForecastRoutes } from "../../src/modules/treasury/cashflowForecastRoutes.js";
import { buildStatementRoutes } from "../../src/modules/treasury/statementRoutes.js";

/**
 * Confirma se o router expõe uma rota esperada pelos testes de contrato.
 *
 * @param router - Router Express a inspecionar.
 * @param method - Método HTTP esperado.
 * @param path - Caminho HTTP esperado.
 * @returns Booleano que indica se a rota esperada existe.
 */
function hasRoute(router, method, path) {
    return router.stack.some(
        (layer) => layer.route?.path === path && layer.route.methods[method],
    );
}

test("MF3: permissões backend cobrem fiscalidade, tesouraria, imports, compliance e reports", () => {
    assert.equal(hasPermission("CONTABILISTA", Permission.TAX_READ), true);
    assert.equal(hasPermission("CONTABILISTA", Permission.TREASURY_WRITE), true);
    assert.equal(hasPermission("CONTABILISTA", Permission.IMPORTS_WRITE), true);
    assert.equal(hasPermission("AUDITOR", Permission.COMPLIANCE_READ), true);
    assert.equal(hasPermission("GESTOR", Permission.REPORTS_READ), true);
    assert.equal(hasPermission("OPERACIONAL", Permission.TREASURY_WRITE), true);
    assert.equal(hasPermission("OPERACIONAL", Permission.IMPORTS_WRITE), false);
});

test("MF3: routers principais expõem endpoints canónicos", () => {
    const deps = { prisma: {}, objectStorage: {} };

    assert.equal(hasRoute(buildVatMapRoutes(deps), "get", "/vat-maps"), true);
    assert.equal(hasRoute(buildTreasuryAccountRoutes(deps), "get", "/accounts"), true);
    assert.equal(hasRoute(buildTreasuryAccountRoutes(deps), "post", "/accounts"), true);
    assert.equal(hasRoute(buildStatementRoutes(deps), "post", "/statements/import"), true);
    assert.equal(hasRoute(buildCashflowForecastRoutes(deps), "get", "/forecast"), true);
    assert.equal(hasRoute(buildBusinessImportRoutes(deps), "post", "/business-data"), true);
    const saftRouter = buildSaftRoutes(deps);
    assert.equal(hasRoute(saftRouter, "get", "/saft/status"), true);
    assert.equal(hasRoute(saftRouter, "post", "/saft/exports"), true);
    assert.equal(hasRoute(saftRouter, "get", "/saft/exports/:exportId"), true);
    assert.equal(
        hasRoute(saftRouter, "get", "/saft/exports/:exportId/download"),
        true,
    );
    assert.equal(hasRoute(saftRouter, "get", "/saft"), false);
    assert.equal(hasRoute(buildOperationalReportRoutes(deps), "get", "/operational"), true);
    assert.equal(hasRoute(buildExecutiveKpiRoutes(deps), "get", "/executive-kpis"), true);
});

test("P0-MF3-MIG-01: migration MF3 cria tabelas persistentes da macrofase", () => {
    const migration = readFileSync(
        new URL("../../prisma/migrations/20260615120000_mf3_schema/migration.sql", import.meta.url),
        "utf8",
    );

    assert.match(migration, /CREATE TABLE "VatMapRun"/);
    assert.match(migration, /CREATE TABLE "TreasuryAccount"/);
    assert.match(migration, /CREATE TABLE "BankStatementImport"/);
    assert.match(migration, /CREATE TABLE "SaftExportRun"/);
    assert.match(migration, /CREATE TABLE "ExecutiveKpiRun"/);
});

test("P2-MF3-STATEMENT-INTEGRITY: migrations persistem estados e unicidade de extratos", () => {
    const migrationsRoot = new URL("../../prisma/migrations/", import.meta.url);
    const migration = readdirSync(migrationsRoot)
        .filter((entry) => entry.includes("mf3"))
        .map((entry) =>
            readFileSync(new URL(`${entry}/migration.sql`, migrationsRoot), "utf8"),
        )
        .join("\n");

    assert.match(migration, /"status" TEXT NOT NULL DEFAULT 'IMPORTED'/);
    assert.match(migration, /"status" TEXT NOT NULL DEFAULT 'SUGGESTED'/);
    assert.match(
        migration,
        /CREATE UNIQUE INDEX "BankStatementLine_companyId_importId_entryDate_amountCents_description_key"/,
    );
});
