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
import { validateSupplierPayload } from "../../src/modules/suppliers/supplierValidators.js";
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

test("BK07: importação vazia é rejeitada", () => {
    assert.throws(() => validateImportPayload({ rows: [] }), {
        code: "INVALID_IMPORT",
    });
});

test("BK10: fornecedor exige NIF válido", () => {
    assert.throws(() => validateSupplierPayload({ name: "Fornecedor" }), {
        code: "INVALID_NIF",
    });

    const payload = validateSupplierPayload({
        name: "Fornecedor",
        nif: "123456789",
        email: "fornecedor@example.com",
    });

    assert.equal(payload.nif, "123456789");
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
