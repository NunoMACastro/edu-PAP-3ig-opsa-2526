/**
 * @file Provas dos campos de origem necessários ao gerador SAF-T interno.
 *
 * Os validadores persistem apenas valores explícitos; ausência nunca é
 * convertida em defaults fiscais.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { validateCompanyProfilePayload } from "../../src/modules/company-profile/companyProfileValidators.js";
import { validateCustomerPayload } from "../../src/modules/customers/customerValidators.js";
import { validateSupplierPayload } from "../../src/modules/suppliers/supplierValidators.js";
import { validateItemPayload } from "../../src/modules/items/itemValidators.js";
import {
    updateVatRateSaftMetadata,
    validateVatRateInput,
} from "../../src/modules/vat-rates/vatRateService.js";
import { parseManualJournal } from "../../src/modules/accounting/manualJournalService.js";

function profilePayload(overrides = {}) {
    return {
        legalName: "Empresa Exemplo",
        nif: "123456789",
        addressLine1: "Rua Principal",
        postalCode: "1000-001",
        city: "Lisboa",
        fiscalYearStartMonth: 1,
        fiscalYearStartDay: 1,
        ...overrides,
    };
}

function itemPayload(overrides = {}) {
    return {
        sku: "srv-1",
        name: "Serviço",
        type: "SERVICE",
        costCents: 0,
        priceCents: 100,
        vatRateBps: 2300,
        ...overrides,
    };
}

function journalPayload(overrides = {}) {
    return {
        entryDate: "2026-03-01",
        description: "Ajustamento confirmado",
        lines: [
            { accountId: "account-1", debitCents: 100, creditCents: 0 },
            { accountId: "account-2", debitCents: 0, creditCents: 100 },
        ],
        ...overrides,
    };
}

test("perfil persiste tax entity, taxonomia e indicadores apenas quando explícitos", () => {
    const omitted = validateCompanyProfilePayload(profilePayload());
    for (const field of [
        "saftTaxEntity",
        "saftTaxonomyReference",
        "saftSelfBillingIndicator",
        "saftCashVatSchemeIndicator",
        "saftThirdPartiesBillingIndicator",
    ]) {
        assert.equal(Object.hasOwn(omitted, field), false);
    }

    const explicit = validateCompanyProfilePayload(profilePayload({
        saftTaxEntity: "Global",
        saftTaxonomyReference: "s",
        saftSelfBillingIndicator: 0,
        saftCashVatSchemeIndicator: 1,
        saftThirdPartiesBillingIndicator: 0,
    }));
    assert.deepEqual(
        {
            taxEntity: explicit.saftTaxEntity,
            taxonomy: explicit.saftTaxonomyReference,
            indicators: [
                explicit.saftSelfBillingIndicator,
                explicit.saftCashVatSchemeIndicator,
                explicit.saftThirdPartiesBillingIndicator,
            ],
        },
        { taxEntity: "Global", taxonomy: "S", indicators: [0, 1, 0] },
    );
});

test("terceiros e artigos não recebem metadata SAF-T por omissão", () => {
    const customerOmitted = validateCustomerPayload({ name: "Cliente" });
    const supplierOmitted = validateSupplierPayload({ name: "Fornecedor" });
    const itemOmitted = validateItemPayload(itemPayload());
    for (const result of [customerOmitted, supplierOmitted]) {
        assert.equal(Object.hasOwn(result, "country"), false);
        assert.equal(Object.hasOwn(result, "saftAccountId"), false);
        assert.equal(Object.hasOwn(result, "selfBillingIndicator"), false);
    }
    assert.equal(Object.hasOwn(itemOmitted, "unitOfMeasure"), false);

    const customer = validateCustomerPayload({
        name: "Cliente",
        country: "pt",
        saftAccountId: "211",
        selfBillingIndicator: 0,
    });
    const supplier = validateSupplierPayload({
        name: "Fornecedor",
        country: "pt",
        saftAccountId: "221",
        selfBillingIndicator: 1,
    });
    const item = validateItemPayload(itemPayload({ unitOfMeasure: "UN" }));
    assert.deepEqual(
        [customer.country, customer.saftAccountId, customer.selfBillingIndicator],
        ["PT", "211", 0],
    );
    assert.deepEqual(
        [supplier.country, supplier.saftAccountId, supplier.selfBillingIndicator],
        ["PT", "221", 1],
    );
    assert.equal(item.unitOfMeasure, "UN");
});

test("região fiscal de IVA é opcional na criação e atualizável em taxa não isenta", async () => {
    const omitted = validateVatRateInput({
        code: "IVA23",
        description: "IVA normal",
        type: "NORMAL",
        rateBps: 2300,
    });
    assert.equal(Object.hasOwn(omitted, "taxCountryRegion"), false);
    assert.equal(
        validateVatRateInput({
            code: "IVA23",
            description: "IVA normal",
            type: "NORMAL",
            rateBps: 2300,
            taxCountryRegion: "pt-ac",
        }).taxCountryRegion,
        "PT-AC",
    );

    let updatedData;
    const tx = {
        vatRate: {
            findFirst: async () => ({ id: "vat-1", type: "NORMAL", rateBps: 2300 }),
            update: async ({ data }) => {
                updatedData = data;
                return { id: "vat-1", ...data };
            },
        },
        auditLog: { create: async () => ({ id: "audit-1" }) },
    };
    const result = await updateVatRateSaftMetadata(
        { $transaction: async (callback) => callback(tx) },
        {
            companyId: "company-1",
            userId: "user-1",
            id: "vat-1",
            input: { taxCountryRegion: "PT" },
        },
    );
    assert.deepEqual(updatedData, { taxCountryRegion: "PT" });
    assert.equal(result.taxCountryRegion, "PT");
});

test("lançamento manual persiste TransactionType apenas quando explícito", () => {
    const omitted = parseManualJournal(journalPayload());
    assert.equal(omitted.saftTransactionType, undefined);
    assert.equal(parseManualJournal(journalPayload({ saftTransactionType: "j" })).saftTransactionType, "J");
    assert.throws(
        () => parseManualJournal(journalPayload({ saftTransactionType: "X" })),
        { code: "INVALID_SAFT_TRANSACTION_TYPE", status: 400 },
    );
});
