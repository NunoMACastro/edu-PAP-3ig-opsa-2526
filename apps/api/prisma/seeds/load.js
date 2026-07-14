/**
 * @file Perfil de carga deterministico para paginacao e performance local OPSA.
 */

import { hashPassword } from "../../src/modules/auth/password.js";
import { buildVatMap } from "../../src/modules/tax/vatMapService.js";
import { buildCashflowForecast } from "../../src/modules/treasury/cashflowForecastService.js";
import { buildOperationalReport } from "../../src/modules/reports/operationalReportService.js";
import { buildExecutiveKpis } from "../../src/modules/reports/executiveKpiService.js";
import {
    COMPANY_BOOTSTRAP_ACCOUNTS,
    COMPANY_BOOTSTRAP_VAT_RATE,
} from "../../src/modules/companies/companyBootstrapCatalog.js";
import {
    LOAD_NAMESPACE,
    addDays,
    calculateDocumentTotals,
    createDeterministicRandom,
    deterministicUuid,
    stableChecksum,
    utcDate,
} from "./config.js";
import { completeNamespaceMarker, createNamespaceMarker } from "./reset.js";

const BATCH_SIZE = 500;

async function createManyBatched(delegate, rows, batchSize = BATCH_SIZE) {
    for (let offset = 0; offset < rows.length; offset += batchSize) {
        await delegate.createMany({ data: rows.slice(offset, offset + batchSize) });
    }
}

/**
 * Cria o perfil load com escrita bulk e invariantes equivalentes ao perfil demo.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ config: object }} input - Configuracao da carga.
 * @returns {Promise<object>} Resumo do perfil.
 */
export async function seedLoadProfile(prisma, input) {
    const startedAt = Date.now();
    const random = createDeterministicRandom(`${input.config.randomSeed}:load:${input.config.loadScale}`);
    const counts = input.config.loadCounts;
    const passwordHash = await hashPassword(input.config.password);
    const user = await prisma.user.create({
        data: {
            email: "load-admin@opsa.demo",
            name: "Admin OPSA Load",
            passwordHash,
        },
    });
    const company = await prisma.company.create({
        data: { name: "OPSA Load Performance, Lda", nif: "510900001" },
    });
    await prisma.companyMembership.create({
        data: { companyId: company.id, userId: user.id, role: "ADMIN" },
    });
    const marker = await createNamespaceMarker(prisma, {
        companyId: company.id,
        userId: user.id,
        namespace: LOAD_NAMESPACE,
        profile: "load",
    });
    await prisma.companyProfile.create({
        data: {
            companyId: company.id,
            legalName: company.name,
            nif: company.nif,
            addressLine1: "Avenida Performance 1",
            postalCode: "1000-900",
            city: "Lisboa",
            country: "PT",
            currency: "EUR",
            fiscalYearStartMonth: 1,
            fiscalYearStartDay: 1,
            commercialRegistrationNumber: company.nif,
            saftTaxAccountingBasis: "C",
            saftTaxEntity: "Global",
            saftTaxonomyReference: "S",
            saftSelfBillingIndicator: 0,
            saftCashVatSchemeIndicator: 0,
            saftThirdPartiesBillingIndicator: 0,
            softwareCertificateNumber: 0,
            productCompanyTaxId: "510100001",
            productId: "OPSA/OPSA",
            productVersion: "1.0.0-load",
        },
    });
    const year = Number(input.config.anchorDate.slice(0, 4));
    await prisma.fiscalPeriod.create({
        data: {
            companyId: company.id,
            name: `LOAD ${year}`,
            fiscalYear: year,
            startDate: utcDate(`${year}-01-01`),
            endDate: utcDate(`${year}-12-31`),
            status: "OPEN",
        },
    });
    await prisma.account.createMany({
        data: COMPANY_BOOTSTRAP_ACCOUNTS.map((account) => ({
            companyId: company.id,
            ...account,
            isActive: true,
        })),
    });
    const accounts = Object.fromEntries(
        (await prisma.account.findMany({ where: { companyId: company.id } })).map((row) => [row.code, row]),
    );
    const vat = await prisma.vatRate.create({
        data: { companyId: company.id, ...COMPANY_BOOTSTRAP_VAT_RATE, code: "LOAD23" },
    });
    const warehouse = await prisma.warehouse.create({
        data: { companyId: company.id, code: "LOAD-WH", name: "Armazem Load" },
    });

    await createManyBatched(prisma.customer, Array.from({ length: counts.customers }, (_, index) => ({
        companyId: company.id,
        name: `Load Cliente ${String(index + 1).padStart(6, "0")}`,
        nif: String(600000000 + index),
        email: `load.customer.${index + 1}@example.test`,
        city: ["Lisboa", "Porto", "Coimbra", "Braga"][index % 4],
        addressLine: `Rua Load Cliente ${index + 1}`,
        postalCode: "1000-100",
        country: "PT",
        saftAccountId: "211",
        selfBillingIndicator: 0,
    })));
    await createManyBatched(prisma.supplier, Array.from({ length: counts.suppliers }, (_, index) => ({
        companyId: company.id,
        name: `Load Fornecedor ${String(index + 1).padStart(6, "0")}`,
        nif: String(610000000 + index),
        email: `load.supplier.${index + 1}@example.test`,
        addressLine: `Rua Load Fornecedor ${index + 1}`,
        postalCode: "4000-100",
        city: "Porto",
        country: "PT",
        saftAccountId: "221",
        selfBillingIndicator: 0,
    })));
    await createManyBatched(prisma.item, Array.from({ length: counts.items }, (_, index) => ({
        companyId: company.id,
        sku: `LOAD-${String(index + 1).padStart(7, "0")}`,
        name: `Load Artigo ${String(index + 1).padStart(7, "0")}`,
        type: "PRODUCT",
        costCents: 100 + (index % 1_000),
        priceCents: 250 + (index % 2_000),
        vatRateBps: 2300,
        unitOfMeasure: "UN",
        unitOfMeasure: "UN",
    })));
    const [customers, suppliers, items] = await Promise.all([
        prisma.customer.findMany({
            where: { companyId: company.id },
            select: { id: true },
            orderBy: { name: "asc" },
        }),
        prisma.supplier.findMany({
            where: { companyId: company.id },
            select: { id: true },
            orderBy: { name: "asc" },
        }),
        prisma.item.findMany({
            where: { companyId: company.id },
            select: { id: true, costCents: true, priceCents: true },
            orderBy: { sku: "asc" },
        }),
    ]);

    const saleRows = [];
    const saleLineRows = [];
    const receiptRows = [];
    for (let index = 0; index < counts.sales; index += 1) {
        const id = deterministicUuid(`${input.config.randomSeed}:load`, `sale:${index}`);
        const item = items[index % items.length];
        const quantity = 1 + (index % 5);
        const totals = calculateDocumentTotals(quantity, item.priceCents + Math.floor(random() * 500));
        const isCreditNote = index % 31 === 0;
        const settled = !isCreditNote && index % 4 === 0;
        const issuedAt = utcDate(addDays(input.config.anchorDate, -(index % 330)));
        saleRows.push({
            id,
            companyId: company.id,
            customerId: customers[index % customers.length].id,
            warehouseId: warehouse.id,
            kind: isCreditNote ? "CREDIT_NOTE" : "INVOICE",
            status: settled ? "SETTLED" : "ISSUED",
            number: `LOAD-FT-${String(index + 1).padStart(8, "0")}`,
            issuedAt,
            dueDate: new Date(issuedAt.getTime() + 30 * 86_400_000),
            ...totals,
            amountPaidCents: settled ? totals.totalCents : 0,
            createdById: user.id,
            issuedById: user.id,
            issuedDefinitiveAt: issuedAt,
        });
        saleLineRows.push({
            saleDocumentId: id,
            itemId: item.id,
            vatRateId: vat.id,
            description: `Linha load venda ${index + 1}`,
            quantity,
            unitPriceCents: Math.floor(totals.subtotalCents / quantity),
            ...totals,
        });
        if (settled) {
            receiptRows.push({
                companyId: company.id,
                saleDocumentId: id,
                amountCents: totals.totalCents,
                receivedAt: new Date(issuedAt.getTime() + 15 * 86_400_000),
                method: ["CASH", "BANK_TRANSFER", "CARD", "OTHER"][index % 4],
                reference: `LOAD-R-${index + 1}`,
                createdById: user.id,
            });
        }
    }
    await createManyBatched(prisma.saleDocument, saleRows);
    await createManyBatched(prisma.saleDocumentLine, saleLineRows);
    await createManyBatched(prisma.receipt, receiptRows);

    const purchaseRows = [];
    const purchaseLineRows = [];
    const paymentRows = [];
    for (let index = 0; index < counts.purchases; index += 1) {
        const id = deterministicUuid(`${input.config.randomSeed}:load`, `purchase:${index}`);
        const item = items[(index + 17) % items.length];
        const quantity = 1 + (index % 8);
        const totals = calculateDocumentTotals(quantity, item.costCents);
        const isCreditNote = index % 37 === 0;
        const paid = !isCreditNote && index % 4 === 0;
        const issuedAt = utcDate(addDays(input.config.anchorDate, -(index % 330)));
        purchaseRows.push({
            id,
            companyId: company.id,
            supplierId: suppliers[index % suppliers.length].id,
            warehouseId: warehouse.id,
            kind: isCreditNote ? "SUPPLIER_CREDIT_NOTE" : "SUPPLIER_INVOICE",
            status: paid ? "PAID" : index % 2 === 0 ? "POSTED" : "APPROVED",
            supplierNumber: `LOAD-FC-${String(index + 1).padStart(8, "0")}`,
            issuedAt,
            dueDate: new Date(issuedAt.getTime() + 20 * 86_400_000),
            ...totals,
            amountPaidCents: paid ? totals.totalCents : 0,
            createdById: user.id,
            approvedAt: issuedAt,
            approvedById: user.id,
            postedAt: index % 2 === 0 || paid ? issuedAt : null,
            postedById: index % 2 === 0 || paid ? user.id : null,
        });
        purchaseLineRows.push({
            purchaseDocumentId: id,
            itemId: item.id,
            vatRateId: vat.id,
            description: `Linha load compra ${index + 1}`,
            quantity,
            unitCostCents: item.costCents,
            ...totals,
        });
        if (paid) {
            paymentRows.push({
                companyId: company.id,
                purchaseDocumentId: id,
                amountCents: totals.totalCents,
                paidAt: new Date(issuedAt.getTime() + 7 * 86_400_000),
                method: ["CASH", "BANK_TRANSFER", "CARD", "OTHER"][index % 4],
                reference: `LOAD-P-${index + 1}`,
                createdById: user.id,
            });
        }
    }
    await createManyBatched(prisma.purchaseDocument, purchaseRows);
    await createManyBatched(prisma.purchaseDocumentLine, purchaseLineRows);
    await createManyBatched(prisma.payment, paymentRows);

    const movementRows = [];
    const layerRows = [];
    const balances = new Map();
    for (let index = 0; index < counts.movements; index += 1) {
        const item = items[index % items.length];
        const movementId = deterministicUuid(`${input.config.randomSeed}:load`, `movement:${index}`);
        const quantity = 10;
        movementRows.push({
            id: movementId,
            companyId: company.id,
            itemId: item.id,
            type: "ENTRY",
            quantity,
            unitCostCents: item.costCents,
            toWarehouseId: warehouse.id,
            reason: "Entrada bulk load",
            sourceType: "LOAD_SEED",
            sourceId: `LOAD-MOVEMENT-${index + 1}`,
            createdById: user.id,
        });
        layerRows.push({
            companyId: company.id,
            itemId: item.id,
            warehouseId: warehouse.id,
            sourceMovementId: movementId,
            quantity,
            remainingQuantity: quantity,
            unitCostCents: item.costCents,
        });
        balances.set(item.id, (balances.get(item.id) ?? 0) + quantity);
    }
    await createManyBatched(prisma.stockMovement, movementRows);
    await createManyBatched(prisma.stockCostLayer, layerRows);
    await createManyBatched(prisma.stockBalance, [...balances.entries()].map(([itemId, quantity]) => ({
        companyId: company.id,
        itemId,
        warehouseId: warehouse.id,
        quantity,
    })));

    const journalEntries = saleRows.slice(0, Math.min(1_000, saleRows.length)).map((sale, index) => ({
        id: deterministicUuid(`${input.config.randomSeed}:load`, `journal:${index}`),
        companyId: company.id,
        source: "SALE",
        sourceId: sale.id,
        entryDate: sale.issuedAt,
        description: `Load ${sale.number}`,
        createdById: user.id,
    }));
    await createManyBatched(prisma.journalEntry, journalEntries);
    await createManyBatched(prisma.journalEntryLine, journalEntries.flatMap((entry, index) => [
        { journalEntryId: entry.id, accountId: accounts["211"].id, debitCents: saleRows[index].totalCents, creditCents: 0 },
        { journalEntryId: entry.id, accountId: accounts["72"].id, debitCents: 0, creditCents: saleRows[index].totalCents },
    ]));

    const halfLogs = Math.ceil(counts.logs / 2);
    await createManyBatched(prisma.auditLog, Array.from({ length: halfLogs }, (_, index) => ({
        companyId: company.id,
        userId: user.id,
        action: "LOAD_SEED_EVENT",
        entity: "LoadRow",
        entityId: String(index + 1),
        details: { index, scale: input.config.loadScale },
    })));
    await createManyBatched(prisma.integrationLog, Array.from({ length: counts.logs - halfLogs }, (_, index) => ({
        companyId: company.id,
        createdById: user.id,
        integrationType: "LOAD_GENERATOR",
        operation: "BATCH",
        status: index % 10 === 0 ? "PARTIAL" : "IMPORTED",
        sourceId: `LOAD-${index + 1}`,
        totalRows: 100,
        successRows: index % 10 === 0 ? 99 : 100,
        errorRows: index % 10 === 0 ? 1 : 0,
    })));

    await createTreasuryAndReports(prisma, { company, user, anchorDate: input.config.anchorDate });
    const summaryCounts = {
        customers: counts.customers,
        suppliers: counts.suppliers,
        items: counts.items,
        sales: counts.sales,
        purchases: counts.purchases,
        movements: counts.movements,
        logs: counts.logs,
    };
    const checksum = stableChecksum({ anchorDate: input.config.anchorDate, scale: input.config.loadScale, counts: summaryCounts });
    await completeNamespaceMarker(prisma, {
        markerId: marker.id,
        totalRows: Object.values(summaryCounts).reduce((sum, value) => sum + value, 0),
        checksum,
    });
    return {
        profile: "load",
        namespace: LOAD_NAMESPACE,
        anchorDate: input.config.anchorDate,
        scale: input.config.loadScale,
        company,
        counts: summaryCounts,
        checksum,
        durationMs: Date.now() - startedAt,
    };
}

async function createTreasuryAndReports(prisma, context) {
    await prisma.treasuryAccount.create({
        data: {
            companyId: context.company.id,
            type: "BANK",
            name: "Load Banco",
            iban: "PT50000201231234567890154",
            currency: "EUR",
            initialBalanceCents: 10_000_000,
            currentBalanceCents: 10_000_000,
            createdById: context.user.id,
        },
    });
    const fromDate = utcDate(`${context.anchorDate.slice(0, 7)}-01`);
    const toDate = utcDate(context.anchorDate);
    const input = {
        companyId: context.company.id,
        userId: context.user.id,
        fromDate,
        toDate,
    };
    await buildVatMap(prisma, input);
    await buildCashflowForecast(prisma, input);
    await buildOperationalReport(prisma, input);
    await buildExecutiveKpis(prisma, input);
}
