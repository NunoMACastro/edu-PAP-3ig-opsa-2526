/**
 * @file Testes unitários dos validadores e permissões da MF0.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    validateLoginPayload,
    validateRegisterPayload,
} from "../../src/modules/auth/authValidators.js";
import { validateResetPasswordPayload } from "../../src/modules/auth/passwordResetValidators.js";
import { hashPassword } from "../../src/modules/auth/password.js";
import { validateCompanyProfilePayload } from "../../src/modules/company-profile/companyProfileValidators.js";
import {
    validateAccountPayload,
    validateAccountSaftMetadata,
    validateImportPayload,
} from "../../src/modules/accounting/accounts/accountValidators.js";
import { validateFiscalPeriodPayload } from "../../src/modules/fiscal-periods/fiscalPeriodValidators.js";
import { validateSupplierPayload } from "../../src/modules/suppliers/supplierValidators.js";
import {
    AUTH_RATE_LIMIT_POLICIES,
    createRedisRateLimiter,
} from "../../src/modules/auth/redisRateLimit.js";
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

test("OPSA-E2E-P1-016: registo mede o limite bcrypt em bytes UTF-8", () => {
    const exactAsciiLimit = "a".repeat(72);
    const exactMultibyteLimit = "🔐".repeat(18);

    assert.equal(Buffer.byteLength(exactAsciiLimit, "utf8"), 72);
    assert.equal(Buffer.byteLength(exactMultibyteLimit, "utf8"), 72);
    assert.equal(
        validateRegisterPayload({
            email: "user@example.com",
            password: exactAsciiLimit,
        }).password,
        exactAsciiLimit,
    );
    assert.equal(
        validateRegisterPayload({
            email: "user@example.com",
            password: exactMultibyteLimit,
        }).password,
        exactMultibyteLimit,
    );

    for (const password of ["a".repeat(73), `${exactMultibyteLimit}a`]) {
        assert.throws(
            () =>
                validateRegisterPayload({
                    email: "user@example.com",
                    password,
                }),
            { status: 400, code: "PASSWORD_TOO_LONG" },
        );
    }
});

test("OPSA-E2E-P1-016: reset aplica a mesma fronteira bcrypt multibyte", () => {
    const token = "t".repeat(32);
    const exactLimit = `${"€".repeat(23)}abc`;
    const overLimit = `${exactLimit}a`;

    assert.equal(Buffer.byteLength(exactLimit, "utf8"), 72);
    assert.equal(
        validateResetPasswordPayload({ token, password: exactLimit }).password,
        exactLimit,
    );
    assert.throws(
        () => validateResetPasswordPayload({ token, password: overLimit }),
        { status: 400, code: "PASSWORD_TOO_LONG" },
    );
});

test("OPSA-E2E-P1-016: login não cria oracle para passwords acima de 72 bytes", () => {
    const legacyCandidate = "🔐".repeat(30);
    assert.ok(Buffer.byteLength(legacyCandidate, "utf8") > 72);
    assert.equal(
        validateLoginPayload({
            email: "USER@example.com",
            password: legacyCandidate,
        }).password,
        legacyCandidate,
    );
});

test("OPSA-E2E-P1-016: boundary de hashing também rejeita bypass do validator", async () => {
    await assert.rejects(() => hashPassword("a".repeat(73)), {
        status: 400,
        code: "PASSWORD_TOO_LONG",
    });
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

test("BK06: perfil aceita metadata SAF-T explícita sem inventar defaults", () => {
    const payload = validateCompanyProfilePayload({
        legalName: "Empresa Exemplo",
        nif: "123456789",
        addressLine1: "Rua Principal",
        postalCode: "1000-001",
        city: "Lisboa",
        fiscalYearStartMonth: 1,
        fiscalYearStartDay: 1,
        commercialRegistrationNumber: "CRC Lisboa 12345",
        saftTaxAccountingBasis: "I",
        softwareCertificateNumber: 0,
        productCompanyTaxId: "509442013",
        productId: "OPSA Academic",
        productVersion: "1.0.0",
    });
    assert.equal(payload.saftTaxAccountingBasis, "I");
    assert.equal(payload.softwareCertificateNumber, 0);
    assert.equal(payload.productId, "OPSA Academic");
});

test("BK06: perfil rejeita TaxAccountingBasis fora dos códigos SAF-T", () => {
    assert.throws(
        () => validateCompanyProfilePayload({
            legalName: "Empresa Exemplo",
            nif: "123456789",
            addressLine1: "Rua Principal",
            postalCode: "1000-001",
            city: "Lisboa",
            fiscalYearStartMonth: 1,
            fiscalYearStartDay: 1,
            saftTaxAccountingBasis: "X",
        }),
        { code: "INVALID_SAFT_TAX_ACCOUNTING_BASIS" },
    );
});

test("BK07: conta GM exige GroupingCode e TaxonomyCode coerentes", () => {
    const account = validateAccountPayload({
        code: "2111",
        name: "Clientes conta corrente",
        parentCode: "211",
        saftGroupingCategory: "GM",
        saftGroupingCode: "211",
        saftTaxonomyCode: 24,
    });
    assert.equal(account.saftGroupingCategory, "GM");
    assert.equal(account.saftTaxonomyCode, 24);
    assert.throws(
        () => validateAccountSaftMetadata({
            parentCode: "211",
            saftGroupingCategory: "GM",
            saftGroupingCode: "21",
            saftTaxonomyCode: 24,
        }),
        { code: "SAFT_GROUPING_PARENT_MISMATCH" },
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

test("BK08: período fiscal aceita exercício explícito e rejeita valores inferíveis inválidos", () => {
    const payload = validateFiscalPeriodPayload({
        name: "Exercício 2026",
        fiscalYear: 2026,
        startDate: "2025-07-01",
        endDate: "2026-06-30",
    });
    assert.equal(payload.fiscalYear, 2026);

    assert.throws(
        () => validateFiscalPeriodPayload({
            name: "Exercício inválido",
            fiscalYear: "2026",
            startDate: "2025-07-01",
            endDate: "2026-06-30",
        }),
        { code: "INVALID_FISCAL_YEAR" },
    );
});

test("BK01: rate limit Redis bloqueia excesso sem guardar a chave funcional", async () => {
    const keys = [];
    let count = 0;
    const limiter = createRedisRateLimiter({
        hmacKey: "unit-test-rate-limit-hmac-key-32-bytes",
        client: {
            async eval(_script, options) {
                keys.push(options.keys[0]);
                count += 1;
                return [count, 60_000];
            },
            async del() {},
        },
    });
    const policy = { ...AUTH_RATE_LIMIT_POLICIES.LOGIN_ACCOUNT, limit: 1 };
    await limiter.consume("login-account", "user@example.com", policy);
    await assert.rejects(
        () => limiter.consume("login-account", "user@example.com", policy),
        { code: "RATE_LIMITED" },
    );
    assert.equal(keys.some((key) => key.includes("user@example.com")), false);
    assert.equal(keys[0].includes("login-account"), true);
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
