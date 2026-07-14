/**
 * @file Testes contratuais da readiness SAF-T MF7.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
    assertSaftReadiness,
    assertSaftSourceReadiness,
} from "../../src/modules/compliance/saftComplianceChecklist.js";

const SERVICE_FILE = new URL("../../src/modules/compliance/saftService.js", import.meta.url);
const GENERATOR_FILE = new URL("../../src/modules/compliance/saftGenerator.js", import.meta.url);
const SERVER_FILE = new URL("../../src/server.js", import.meta.url);
const SCHEMA_FILE = new URL("../../prisma/schema.prisma", import.meta.url);
const SOURCE_FIELDS_MIGRATION = new URL(
    "../../prisma/migrations/20260710110000_saft_internal_source_fields/migration.sql",
    import.meta.url,
);
const FISCAL_YEAR_MIGRATION = new URL(
    "../../prisma/migrations/20260710123000_fiscal_period_explicit_fiscal_year/migration.sql",
    import.meta.url,
);

/**
 * Cria um perfil fiscal completo para o caso positivo.
 *
 * @param {Record<string, unknown>} overrides - Campos a substituir no perfil.
 * @returns {Record<string, unknown>} Perfil fiscal de teste.
 */
function completeProfile(overrides = {}) {
    return {
        legalName: "OPSA Demo, Lda.",
        nif: "509999999",
        addressLine1: "Rua da Escola, 1",
        postalCode: "1000-001",
        city: "Lisboa",
        currency: "EUR",
        commercialRegistrationNumber: "CRC Lisboa 12345",
        saftTaxAccountingBasis: "I",
        saftTaxEntity: "Global",
        saftTaxonomyReference: "S",
        saftSelfBillingIndicator: 0,
        saftCashVatSchemeIndicator: 0,
        saftThirdPartiesBillingIndicator: 0,
        softwareCertificateNumber: 0,
        productCompanyTaxId: "509442013",
        productId: "OPSA/Academic",
        productVersion: "1.0.0",
        ...overrides,
    };
}

/**
 * Cria input de readiness com valores validos por defeito.
 *
 * @param {Record<string, unknown>} overrides - Campos de topo a substituir.
 * @returns {{ profile: Record<string, unknown> | null, period: { fromDate: Date, toDate: Date, fiscalYear: number }, counts: { saleDocuments: number, purchaseDocuments: number, journalEntries: number } }} Input de readiness.
 */
function readinessInput(overrides = {}) {
    return {
        profile: completeProfile(),
        period: {
            fromDate: new Date("2026-01-01T00:00:00.000Z"),
            toDate: new Date("2026-01-31T23:59:59.999Z"),
            fiscalYear: 2026,
        },
        counts: {
            saleDocuments: 1,
            purchaseDocuments: 0,
            journalEntries: 2,
        },
        ...overrides,
    };
}

/**
 * Confirma que uma funcao lanca um erro de dominio esperado.
 *
 * @param {() => void} action - Operacao que deve falhar.
 * @param {string} code - Codigo de erro esperado.
 * @returns {void}
 */
function assertDomainError(action, code) {
    assert.throws(action, (error) => error?.code === code);
}

test("aceita readiness SAF-T com perfil, periodo e movimentos", () => {
    const readiness = assertSaftReadiness(readinessInput());

    assert.equal(readiness.ready, true);
    assert.equal(readiness.totalRows, 3);
    assert.match(readiness.checkedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test("rejeita periodo SAF-T invertido", () => {
    assertDomainError(
        () =>
            assertSaftReadiness(
                readinessInput({
                    period: {
                        fromDate: new Date("2026-02-01T00:00:00.000Z"),
                        toDate: new Date("2026-01-01T00:00:00.000Z"),
                        fiscalYear: 2026,
                    },
                }),
            ),
        "INVALID_SAFT_RANGE",
    );
});

test("rejeita período SAF-T sem exercício fiscal explícito", () => {
    assertDomainError(
        () => assertSaftReadiness(readinessInput({
            period: {
                fromDate: new Date("2025-07-01T00:00:00.000Z"),
                toDate: new Date("2026-06-30T00:00:00.000Z"),
                fiscalYear: null,
            },
        })),
        "SAFT_FISCAL_YEAR_REQUIRED",
    );
});

test("rejeita perfil fiscal sem NIF", () => {
    assertDomainError(
        () =>
            assertSaftReadiness(
                readinessInput({
                    profile: completeProfile({ nif: "" }),
                }),
            ),
        "COMPANY_PROFILE_INCOMPLETE",
    );
});

test("rejeita periodo sem documentos nem lancamentos", () => {
    assertDomainError(
        () =>
            assertSaftReadiness(
                readinessInput({
                    counts: {
                        saleDocuments: 0,
                        purchaseDocuments: 0,
                        journalEntries: 0,
                    },
                }),
            ),
        "EMPTY_SAFT_PERIOD",
    );
});

test("preflight rejeita documento definitivo sem ATCUD/hash", () => {
    assertDomainError(
        () => assertSaftSourceReadiness({
            saleDocuments: [{ number: "FT 1", lines: [] }],
            purchaseDocuments: [],
            accounts: [{
                code: "1",
                saftGroupingCategory: "GR",
                saftGroupingCode: null,
                saftTaxonomyCode: null,
            }],
        }),
        "SAFT_FISCAL_TRACE_INCOMPLETE",
    );
});

test("preflight rejeita IVA isento sem exemptionCode", () => {
    assertDomainError(
        () => assertSaftSourceReadiness({
            saleDocuments: [{
                number: "FT 1",
                atcud: "CSDF7T5H-1",
                saftHash: "hash",
                saftHashControl: "1",
                lines: [{
                    vatRate: {
                        type: "EXEMPT",
                        exemptionReason: "Artigo 9.º do CIVA",
                        exemptionCode: null,
                    },
                }],
            }],
            purchaseDocuments: [],
            accounts: [{
                code: "1",
                saftGroupingCategory: "GR",
                saftGroupingCode: null,
                saftTaxonomyCode: null,
            }],
        }),
        "SAFT_VAT_EXEMPTION_INCOMPLETE",
    );
});

test("preflight rejeita conta GM sem taxonomia", () => {
    assertDomainError(
        () => assertSaftSourceReadiness({
            saleDocuments: [],
            purchaseDocuments: [],
            accounts: [
                {
                    code: "2",
                    saftGroupingCategory: "GR",
                    saftGroupingCode: null,
                    saftTaxonomyCode: null,
                },
                {
                    code: "21",
                    saftGroupingCategory: "GM",
                    saftGroupingCode: "2",
                    saftTaxonomyCode: null,
                },
            ],
        }),
        "SAFT_ACCOUNT_TAXONOMY_INCOMPLETE",
    );
});

test("service SAF-T chama readiness, cria run e regista log de integracao", () => {
    const source = readFileSync(SERVICE_FILE, "utf8");

    // Esta leitura estatica protege a ligacao entre o contrato MF7 e o fluxo real do service.
    assert.match(source, /assertSaftReadiness/);
    assert.match(source, /saftExportRun\.create/);
    assert.match(source, /recordIntegrationLog/);
    assert.match(source, /generateInternalSaft/);
    assert.match(source, /artifact:\s*Buffer\.from\(generated\.artifact\)/);
    assert.match(source, /SAFT_EXTERNAL_ARTIFACT_REPLACEMENT/);
    assert.match(source, /validation\?\.schemaVersion !== SAFT_VERSION/);
    assert.match(
        source,
        /validation\?\.xsdProcessorVersion !== XSD_PROCESSOR_VERSION/,
    );
});

test("gerador SAF-T é interno, usa XML/CP1252 e não contém fallback MVP", () => {
    const source = readFileSync(GENERATOR_FILE, "utf8");
    assert.match(source, /from "xmlbuilder2"/);
    assert.match(source, /from "iconv-lite"/);
    assert.match(source, /GeneralLedgerAccounts/);
    assert.match(source, /GeneralLedgerEntries/);
    assert.match(source, /SalesInvoices/);
    assert.match(source, /reconciliationSha256/);
    assert.doesNotMatch(source, /1\.04_01-MVP/);
});

test("schema expande fontes fiscais nullable sem defaults inventados", () => {
    const schema = readFileSync(SCHEMA_FILE, "utf8");
    const migration = readFileSync(SOURCE_FIELDS_MIGRATION, "utf8");
    for (const field of [
        "saftTaxEntity",
        "saftTaxonomyReference",
        "saftSelfBillingIndicator",
        "saftCashVatSchemeIndicator",
        "saftThirdPartiesBillingIndicator",
        "saftAccountId",
        "selfBillingIndicator",
        "unitOfMeasure",
        "taxCountryRegion",
        "saftTransactionType",
    ]) {
        assert.match(schema, new RegExp(`\\b${field}\\s+(?:String|Int)\\?`));
        assert.doesNotMatch(
            schema,
            new RegExp(`\\b${field}\\s+(?:String|Int)\\?[^\\n]*@default`),
        );
        assert.match(migration, new RegExp(`ADD COLUMN "${field}"`));
    }
    assert.doesNotMatch(migration, /^\s*UPDATE\b|ADD COLUMN[^;]*\bDEFAULT\b/im);
});

test("schema persiste fiscalYear explicitamente sem default nem backfill", () => {
    const schema = readFileSync(SCHEMA_FILE, "utf8");
    const migration = readFileSync(FISCAL_YEAR_MIGRATION, "utf8");
    assert.match(schema, /\bfiscalYear\s+Int\?/);
    assert.match(migration, /ADD COLUMN "fiscalYear" INTEGER/);
    assert.doesNotMatch(migration, /^\s*UPDATE\b|\bDEFAULT\b/im);
});

test("composição injeta pipeline SAF-T explicitamente e mantém null por defeito", () => {
    const source = readFileSync(SERVER_FILE, "utf8");
    assert.match(source, /saftExternalPipeline\s*=\s*null/);
    assert.match(source, /externalPipeline:\s*saftExternalPipeline/);
});
