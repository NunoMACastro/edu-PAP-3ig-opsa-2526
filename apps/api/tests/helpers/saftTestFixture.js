/**
 * @file Snapshot fiscal completo usado exclusivamente pelos testes SAF-T.
 *
 * Todos os campos têm origem explícita na fixture. A helper não representa uma
 * validação oficial nem introduz defaults no código de aplicação.
 */

export const SAFT_TEST_PERIOD = Object.freeze({
    id: "period-1",
    companyId: "company-1",
    fiscalYear: 2026,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
    endDate: new Date("2026-12-31T00:00:00.000Z"),
    status: "CLOSED",
    closedAt: new Date("2027-01-02T00:00:00.000Z"),
});

/**
 * Constrói um snapshot persistido coerente para o gerador interno.
 *
 * @returns {object} Fontes master, contabilísticas e documentais.
 */
export function buildSaftSources() {
    const profile = {
        legalName: "Empresa de Teste, Lda.",
        nif: "509442013",
        addressLine1: "Rua da Constituição 1",
        postalCode: "1000-001",
        city: "Lisboa",
        country: "PT",
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
    };
    const customer = {
        id: "customer-1",
        name: "Cliente Açores, Lda.",
        nif: "501964843",
        email: "cliente@example.test",
        phone: "210000001",
        addressLine: "Rua do Cliente 1",
        postalCode: "9500-001",
        city: "Ponta Delgada",
        country: "PT",
        saftAccountId: "10",
        selfBillingIndicator: 0,
    };
    const supplier = {
        id: "supplier-1",
        name: "Fornecedor, Lda.",
        nif: "503123456",
        email: "fornecedor@example.test",
        phone: "210000002",
        addressLine: "Rua do Fornecedor 2",
        postalCode: "4000-002",
        city: "Porto",
        country: "PT",
        saftAccountId: "11",
        selfBillingIndicator: 0,
    };
    const item = {
        id: "item-1",
        sku: "SKU-1",
        name: "Serviço de configuração",
        type: "SERVICE",
        unitOfMeasure: "UN",
    };
    const vatRate = {
        id: "vat-1",
        code: "IVA23",
        description: "IVA à taxa normal",
        rateBps: 2300,
        type: "NORMAL",
        taxCountryRegion: "PT",
        exemptionReason: null,
        exemptionCode: null,
    };
    const accounts = [
        {
            id: "account-1",
            code: "10",
            name: "Disponibilidades",
            saftGroupingCategory: "GR",
            saftGroupingCode: null,
            saftTaxonomyCode: null,
        },
        {
            id: "account-2",
            code: "11",
            name: "Conta de movimento",
            saftGroupingCategory: "GM",
            saftGroupingCode: "10",
            saftTaxonomyCode: 1,
        },
    ];
    const saleDocument = {
        id: "sale-1",
        customerId: customer.id,
        customer,
        kind: "INVOICE",
        status: "ISSUED",
        number: "FT 2026/1",
        issuedAt: new Date("2026-03-02T00:00:00.000Z"),
        subtotalCents: 1000,
        vatCents: 230,
        totalCents: 1230,
        createdById: "user-1",
        issuedById: "user-1",
        createdAt: new Date("2026-03-02T09:10:00.000Z"),
        issuedDefinitiveAt: new Date("2026-03-02T09:15:00.000Z"),
        atcud: "CSDF7T5H-1",
        saftHash: "hash-fiscal-atestado",
        saftHashControl: "1",
        lines: [{
            id: "sale-line-1",
            itemId: item.id,
            item,
            vatRateId: vatRate.id,
            vatRate,
            description: "Configuração inicial",
            quantity: 1,
            unitPriceCents: 1000,
            subtotalCents: 1000,
            vatCents: 230,
            totalCents: 1230,
        }],
    };
    const purchaseDocument = {
        id: "purchase-1",
        supplierId: supplier.id,
        supplier,
        kind: "SUPPLIER_INVOICE",
        status: "POSTED",
        supplierNumber: "F 2026/10",
        issuedAt: new Date("2026-02-10T00:00:00.000Z"),
        subtotalCents: 1000,
        vatCents: 230,
        totalCents: 1230,
        lines: [{
            id: "purchase-line-1",
            itemId: item.id,
            item,
            vatRateId: vatRate.id,
            vatRate,
            description: "Aquisição de serviço",
            quantity: 1,
            unitCostCents: 1000,
            subtotalCents: 1000,
            vatCents: 230,
            totalCents: 1230,
        }],
    };
    const journalEntry = {
        id: "018f6c4d-12ab-4abc-8def-1234567890ab",
        source: "SALE",
        sourceId: saleDocument.id,
        entryDate: new Date("2026-03-02T00:00:00.000Z"),
        description: "Venda FT 2026/1",
        createdById: "user-1",
        createdAt: new Date("2026-03-02T09:15:01.000Z"),
        lines: [
            {
                id: "journal-line-1",
                accountId: accounts[0].id,
                account: accounts[0],
                debitCents: 1230,
                creditCents: 0,
            },
            {
                id: "journal-line-2",
                accountId: accounts[1].id,
                account: accounts[1],
                debitCents: 0,
                creditCents: 1230,
            },
        ],
    };
    const purchaseJournalEntry = {
        id: "028f6c4d-12ab-4abc-8def-1234567890ab",
        source: "PURCHASE",
        sourceId: purchaseDocument.id,
        entryDate: new Date("2026-02-10T00:00:00.000Z"),
        description: "Compra F 2026/10",
        createdById: "user-1",
        createdAt: new Date("2026-02-10T09:15:01.000Z"),
        lines: [
            {
                id: "purchase-journal-line-1",
                accountId: accounts[0].id,
                account: accounts[0],
                debitCents: 1230,
                creditCents: 0,
            },
            {
                id: "purchase-journal-line-2",
                accountId: accounts[1].id,
                account: accounts[1],
                debitCents: 0,
                creditCents: 1230,
            },
        ],
    };
    return {
        profile,
        saleDocuments: [saleDocument],
        purchaseDocuments: [purchaseDocument],
        openingJournalEntries: [],
        journalEntries: [purchaseJournalEntry, journalEntry],
        accounts,
        customers: [customer],
        suppliers: [supplier],
        items: [item],
        vatRates: [vatRate],
    };
}
