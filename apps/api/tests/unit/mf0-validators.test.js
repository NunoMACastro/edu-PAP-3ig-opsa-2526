/**
 * @file Testes unitários dos validadores e permissões da MF0.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    validateLoginPayload,
    validateRegisterPayload,
} from "../../src/modules/auth/authValidators.js";
import { validateCompanyProfilePayload } from "../../src/modules/company-profile/companyProfileValidators.js";
import { validateImportPayload } from "../../src/modules/accounting/accounts/accountValidators.js";
import { validateFiscalPeriodPayload } from "../../src/modules/fiscal-periods/fiscalPeriodValidators.js";
import { validateSupplierPayload } from "../../src/modules/suppliers/supplierValidators.js";
import { assertAuthRateLimit } from "../../src/modules/auth/authRateLimit.js";
import { getPermissionsForRole, Permission } from "../../src/modules/permissions/permissions.js";

test("BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas", () => {
    const payload = validateLoginPayload({
        email: "USER@example.com",
        password: "x",
    });

    assert.deepEqual(payload, {
        email: "user@example.com",
        password: "x",
    });
});

test("BK01: registo mantém política de password forte", () => {
    assert.throws(
        () =>
            validateRegisterPayload({
                email: "user@example.com",
                password: "curta",
            }),
        { code: "WEAK_PASSWORD" },
    );
});

test("BK06: perfil da empresa assume EUR quando currency é omitida", () => {
    const payload = validateCompanyProfilePayload({
        legalName: "Empresa Exemplo",
        nif: "123456789",
        addressLine1: "Rua Principal",
        postalCode: "1000-001",
        city: "Lisboa",
        fiscalYearStartMonth: 1,
        fiscalYearStartDay: 1,
    });

    assert.equal(payload.currency, "EUR");
});

test("BK06: perfil da empresa rejeita dia fiscal impossível", () => {
    assert.throws(
        () =>
            validateCompanyProfilePayload({
                legalName: "Empresa Exemplo",
                nif: "123456789",
                addressLine1: "Rua Principal",
                postalCode: "1000-001",
                city: "Lisboa",
                fiscalYearStartMonth: 2,
                fiscalYearStartDay: 31,
            }),
        { code: "INVALID_FISCAL_PERIOD" },
    );
});

test("BK07: importação vazia é rejeitada", () => {
    assert.throws(() => validateImportPayload({ rows: [] }), {
        code: "INVALID_IMPORT",
    });
});

test("BK10: fornecedor aceita NIF vazio e valida quando preenchido", () => {
    const supplierWithoutNif = validateSupplierPayload({ name: "Fornecedor" });
    assert.equal(supplierWithoutNif.nif, null);
    assert.throws(
        () =>
            validateSupplierPayload({
                name: "Fornecedor",
                nif: "123",
            }),
        { code: "INVALID_NIF" },
    );
    const payload = validateSupplierPayload({
        name: "Fornecedor",
        nif: "123456789",
        email: "fornecedor@example.com",
    });

    assert.equal(payload.nif, "123456789");
});

test("BK08: período fiscal rejeita datas normalizadas pelo JavaScript", () => {
    assert.throws(
        () =>
            validateFiscalPeriodPayload({
                name: "Periodo invalido",
                startDate: "2026-02-31",
                endDate: "2026-12-31",
            }),
        { code: "INVALID_DATE" },
    );
});

test("BK01: rate limit de autenticação bloqueia excesso e exige store em produção", () => {
    const key = "login:unit-test:rate-limit";
    for (let attempt = 0; attempt < 5; attempt += 1) {
        assertAuthRateLimit(key, { now: 1000 });
    }
    assert.throws(() => assertAuthRateLimit(key, { now: 1000 }), {
        code: "RATE_LIMITED",
    });
    assert.throws(
        () =>
            assertAuthRateLimit("register:unit-test:production", {
                isProduction: true,
            }),
        { code: "RATE_LIMIT_STORE_REQUIRED" },
    );
});

test("BK02: permissões de escrita seguem os atores documentados na MF0", () => {
    const gestorPermissions = getPermissionsForRole("GESTOR");
    const contabilistaPermissions = getPermissionsForRole("CONTABILISTA");
    const operacionalPermissions = getPermissionsForRole("OPERACIONAL");

    assert.equal(gestorPermissions.includes(Permission.SUPPLIERS_WRITE), false);
    assert.equal(gestorPermissions.includes(Permission.ITEMS_WRITE), false);
    assert.equal(gestorPermissions.includes(Permission.WAREHOUSES_WRITE), false);
    assert.equal(contabilistaPermissions.includes(Permission.SUPPLIERS_WRITE), true);
    assert.equal(operacionalPermissions.includes(Permission.SUPPLIERS_WRITE), true);
    assert.equal(operacionalPermissions.includes(Permission.ITEMS_WRITE), true);
    assert.equal(operacionalPermissions.includes(Permission.WAREHOUSES_WRITE), true);
});
