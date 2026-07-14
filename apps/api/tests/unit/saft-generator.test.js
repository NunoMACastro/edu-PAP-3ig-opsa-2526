/**
 * @file Provas do gerador interno SAF-T PT 1.04_01.
 *
 * Estes testes verificam construção, encoding e reconciliação interna. Não são
 * apresentados como validação do XSD oficial nem como revisão contabilística externa.
 */

import assert from "node:assert/strict";
import test from "node:test";
import iconvLite from "iconv-lite";
import { generateInternalSaft } from "../../src/modules/compliance/saftGenerator.js";
import { SAFT_NAMESPACE } from "../../src/modules/compliance/saftSchemaContract.js";
import {
    SAFT_TEST_PERIOD,
    buildSaftSources,
} from "../helpers/saftTestFixture.js";

const CREATED_AT = new Date("2027-01-03T12:00:00.000Z");

test("gerador interno produz conteúdo integral, CP1252 e reconciliação determinística", () => {
    const input = {
        sources: buildSaftSources(),
        fiscalPeriod: SAFT_TEST_PERIOD,
        createdAt: CREATED_AT,
    };
    const first = generateInternalSaft(input);
    const second = generateInternalSaft(input);
    const xml = iconvLite.decode(first.artifact, "Windows-1252");

    assert.equal(first.artifact.equals(second.artifact), true);
    assert.equal(first.artifactSha256, second.artifactSha256);
    assert.equal(first.reconciliationSha256, second.reconciliationSha256);
    const saleTransaction = first.reconciliation.generalLedger.transactions.find(
        (transaction) => transaction.sourceType === "SALE",
    );
    const purchaseTransaction = first.reconciliation.generalLedger.transactions.find(
        (transaction) => transaction.sourceType === "PURCHASE",
    );
    assert.match(saleTransaction.transactionId, /^2026-03-02 SALES \S{20}$/);
    assert.match(purchaseTransaction.transactionId, /^2026-02-10 PURCHASES \S{20}$/);
    assert.deepEqual(first.reconciliation.generalLedger, {
        numberOfEntries: 2,
        totalDebitCents: 2460,
        totalCreditCents: 2460,
        transactions: [
            {
                transactionId: saleTransaction.transactionId,
                sourceType: "SALE",
                sourceDocumentId: "sale-1",
                totalDebitCents: 1230,
                totalCreditCents: 1230,
            },
            {
                transactionId: purchaseTransaction.transactionId,
                sourceType: "PURCHASE",
                sourceDocumentId: "purchase-1",
                totalDebitCents: 1230,
                totalCreditCents: 1230,
            },
        ],
    });
    assert.deepEqual(first.reconciliation.salesInvoices, {
        numberOfEntries: 1,
        totalDebitCents: 0,
        totalCreditCents: 1230,
        byType: {
            FT: {
                numberOfEntries: 1,
                netCents: 1000,
                vatCents: 230,
                grossCents: 1230,
                ledgerDebitCents: 1230,
                ledgerCreditCents: 1230,
            },
        },
        documents: [{
            invoiceNo: "FT 2026/1",
            documentType: "FT",
            direction: "CREDIT",
            netCents: 1000,
            vatCents: 230,
            grossCents: 1230,
            transactionId: saleTransaction.transactionId,
            ledgerDebitCents: 1230,
            ledgerCreditCents: 1230,
        }],
    });
    assert.deepEqual(first.reconciliation.purchases, {
        numberOfEntries: 1,
        totalNetCents: 1000,
        totalVatCents: 230,
        totalGrossCents: 1230,
        byType: {
            SUPPLIER_INVOICE: {
                numberOfEntries: 1,
                netCents: 1000,
                vatCents: 230,
                grossCents: 1230,
                ledgerDebitCents: 1230,
                ledgerCreditCents: 1230,
            },
        },
        documents: [{
            supplierDocumentNo: "F 2026/10",
            documentType: "SUPPLIER_INVOICE",
            direction: "DEBIT",
            netCents: 1000,
            vatCents: 230,
            grossCents: 1230,
            transactionId: purchaseTransaction.transactionId,
            ledgerDebitCents: 1230,
            ledgerCreditCents: 1230,
        }],
    });
    assert.match(xml, /^<\?xml version="1\.0" encoding="Windows-1252"\?>/);
    assert.match(xml, new RegExp(`<AuditFile xmlns="${SAFT_NAMESPACE}">`));
    for (const element of [
        "<Header>",
        "<GeneralLedgerAccounts>",
        "<Customer>",
        "<Supplier>",
        "<Product>",
        "<TaxTable>",
        "<GeneralLedgerEntries>",
        "<DebitLine>",
        "<CreditLine>",
        "<SalesInvoices>",
        "<Invoice>",
    ]) {
        assert.equal(xml.includes(element), true, `${element} deve existir`);
    }
    assert.match(xml, /<GeneralLedgerEntries><NumberOfEntries>2<\/NumberOfEntries><TotalDebit>24\.60<\/TotalDebit><TotalCredit>24\.60<\/TotalCredit>/);
    assert.match(xml, /<TaxonomyReference>S<\/TaxonomyReference>/);
    assert.match(xml, /<TaxCode>NOR<\/TaxCode><Description>IVA à taxa normal<\/Description><TaxPercentage>23<\/TaxPercentage>/);
    assert.match(xml, /<DocumentTotals><TaxPayable>2\.30<\/TaxPayable><NetTotal>10\.00<\/NetTotal><GrossTotal>12\.30<\/GrossTotal><\/DocumentTotals>/);
    assert.equal(xml.includes("1.04_01-MVP"), false);
    assert.notEqual(first.artifact.indexOf(Buffer.from([0xe7])), -1, "ç deve usar CP1252");
    assert.equal(first.artifact.includes(Buffer.from([0xc3, 0xa7])), false, "não deve usar UTF-8");
});

test("gerador recusa campo fiscal obrigatório não persistido em vez de o fabricar", () => {
    const sources = buildSaftSources();
    delete sources.profile.saftTaxEntity;
    assert.throws(
        () => generateInternalSaft({ sources, fiscalPeriod: SAFT_TEST_PERIOD, createdAt: CREATED_AT }),
        { code: "SAFT_SOURCE_NOT_READY", status: 422 },
    );
});

test("gerador recusa unidade em falta e lançamentos manuais sem TransactionType", () => {
    const withoutUnit = buildSaftSources();
    delete withoutUnit.items[0].unitOfMeasure;
    assert.throws(
        () => generateInternalSaft({
            sources: withoutUnit,
            fiscalPeriod: SAFT_TEST_PERIOD,
            createdAt: CREATED_AT,
        }),
        { code: "SAFT_SOURCE_NOT_READY", status: 422 },
    );

    const manual = buildSaftSources();
    manual.journalEntries[0].source = "MANUAL";
    manual.journalEntries[0].sourceId = "manual-1";
    assert.throws(
        () => generateInternalSaft({ sources: manual, fiscalPeriod: SAFT_TEST_PERIOD, createdAt: CREATED_AT }),
        { code: "SAFT_SOURCE_NOT_READY", status: 422 },
    );
});

test("gerador recusa totais documentais ou contabilísticos não reconciliados", () => {
    const documentMismatch = buildSaftSources();
    documentMismatch.saleDocuments[0].totalCents += 1;
    assert.throws(
        () => generateInternalSaft({
            sources: documentMismatch,
            fiscalPeriod: SAFT_TEST_PERIOD,
            createdAt: CREATED_AT,
        }),
        { code: "SAFT_SOURCE_NOT_READY", status: 422 },
    );

    const ledgerMismatch = buildSaftSources();
    ledgerMismatch.journalEntries[0].lines[1].creditCents -= 1;
    assert.throws(
        () => generateInternalSaft({
            sources: ledgerMismatch,
            fiscalPeriod: SAFT_TEST_PERIOD,
            createdAt: CREATED_AT,
        }),
        { code: "SAFT_SOURCE_NOT_READY", status: 422 },
    );
});

test("gerador exige ligação contabilística para cada venda e compra definitiva", () => {
    const withoutSalePosting = buildSaftSources();
    withoutSalePosting.journalEntries = withoutSalePosting.journalEntries.filter(
        (entry) => entry.source !== "SALE",
    );
    assert.throws(
        () => generateInternalSaft({
            sources: withoutSalePosting,
            fiscalPeriod: SAFT_TEST_PERIOD,
            createdAt: CREATED_AT,
        }),
        { code: "SAFT_SOURCE_NOT_READY", status: 422 },
    );

    const withoutPurchasePosting = buildSaftSources();
    withoutPurchasePosting.journalEntries = withoutPurchasePosting.journalEntries.filter(
        (entry) => entry.source !== "PURCHASE",
    );
    assert.throws(
        () => generateInternalSaft({
            sources: withoutPurchasePosting,
            fiscalPeriod: SAFT_TEST_PERIOD,
            createdAt: CREATED_AT,
        }),
        { code: "SAFT_SOURCE_NOT_READY", status: 422 },
    );
});

test("gerador rejeita lançamento órfão ou total contabilístico diferente do documento", () => {
    const orphanPosting = buildSaftSources();
    orphanPosting.journalEntries.find((entry) => entry.source === "PURCHASE").sourceId =
        "purchase-inexistente";
    assert.throws(
        () => generateInternalSaft({
            sources: orphanPosting,
            fiscalPeriod: SAFT_TEST_PERIOD,
            createdAt: CREATED_AT,
        }),
        { code: "SAFT_SOURCE_NOT_READY", status: 422 },
    );

    const postingMismatch = buildSaftSources();
    const salePosting = postingMismatch.journalEntries.find((entry) => entry.source === "SALE");
    salePosting.lines[0].debitCents -= 1;
    salePosting.lines[1].creditCents -= 1;
    assert.throws(
        () => generateInternalSaft({
            sources: postingMismatch,
            fiscalPeriod: SAFT_TEST_PERIOD,
            createdAt: CREATED_AT,
        }),
        { code: "SAFT_SOURCE_NOT_READY", status: 422 },
    );
});

test("gerador usa fiscalYear explícito e não o infere das datas", () => {
    const sources = buildSaftSources();
    const crossCalendarPeriod = {
        ...SAFT_TEST_PERIOD,
        fiscalYear: 2026,
        startDate: new Date("2025-07-01T00:00:00.000Z"),
        endDate: new Date("2026-06-30T00:00:00.000Z"),
    };
    const generated = generateInternalSaft({
        sources,
        fiscalPeriod: crossCalendarPeriod,
        createdAt: CREATED_AT,
    });
    const xml = iconvLite.decode(generated.artifact, "Windows-1252");
    assert.match(xml, /<FiscalYear>2026<\/FiscalYear>/);

    const missingFiscalYear = { ...SAFT_TEST_PERIOD };
    delete missingFiscalYear.fiscalYear;
    assert.throws(
        () => generateInternalSaft({
            sources: buildSaftSources(),
            fiscalPeriod: missingFiscalYear,
            createdAt: CREATED_AT,
        }),
        { code: "SAFT_SOURCE_NOT_READY", status: 422 },
    );
});

test("gerador rejeita número fiscal incompatível com o tipo do documento", () => {
    const sources = buildSaftSources();
    sources.saleDocuments[0].number = "NC 2026/1";
    assert.throws(
        () => generateInternalSaft({
            sources,
            fiscalPeriod: SAFT_TEST_PERIOD,
            createdAt: CREATED_AT,
        }),
        { code: "SAFT_SOURCE_NOT_READY", status: 422 },
    );
});
