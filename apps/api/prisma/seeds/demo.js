/**
 * @file Perfil demo comprehensive, deterministico e orientado aos workflows reais da OPSA.
 */

import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { hashPassword } from "../../src/modules/auth/password.js";
import { loginUser, logoutUser } from "../../src/modules/auth/authService.js";
import { requestPasswordReset } from "../../src/modules/auth/passwordResetService.js";
import { buildPasswordResetEmailAdapter } from "../../src/modules/auth/passwordResetEmailAdapter.js";
import { createEmailOutbox } from "../../src/modules/notifications/emailOutboxService.js";
import { buildInvitationEmailAdapter } from "../../src/modules/company-users/invitationEmailAdapter.js";
import { inviteUser, revokeCompanyInvitation } from "../../src/modules/company-users/companyUserService.js";
import { createSaleDocument, issueSaleDocument } from "../../src/modules/sales/saleDocumentService.js";
import {
    approveSaleDocument,
    rejectSaleDocument,
    submitSaleDocument,
} from "../../src/modules/sales-approval/saleApprovalService.js";
import { createPurchaseDocument } from "../../src/modules/purchases/purchaseDocumentService.js";
import {
    approvePurchaseDocument,
    rejectPurchaseDocument,
} from "../../src/modules/purchase-approval/purchaseApprovalService.js";
import { postSaleDocument } from "../../src/modules/accounting/salePostingService.js";
import { postPurchaseDocument } from "../../src/modules/accounting/purchasePostingService.js";
import { registerReceipt } from "../../src/modules/receipts/receiptService.js";
import { registerPayment } from "../../src/modules/payments/paymentService.js";
import { createStockMovement } from "../../src/modules/inventory/stockMovementService.js";
import {
    createInventoryCount,
    postInventoryCount,
} from "../../src/modules/inventory/inventoryCountService.js";
import { saveStockAlertSetting } from "../../src/modules/inventory/stockAlertService.js";
import {
    addManualJournalAttachment,
    createManualJournal,
    getManualJournalAttachmentDownload,
    updateManualJournal,
} from "../../src/modules/accounting/manualJournalService.js";
import { createTreasuryAccount } from "../../src/modules/treasury/bankAccountService.js";
import { importBankStatement } from "../../src/modules/treasury/statementImportService.js";
import { importBusinessData } from "../../src/modules/imports/businessImportService.js";
import { buildVatMap } from "../../src/modules/tax/vatMapService.js";
import { buildCashflowForecast } from "../../src/modules/treasury/cashflowForecastService.js";
import { buildOperationalReport } from "../../src/modules/reports/operationalReportService.js";
import { buildExecutiveKpis } from "../../src/modules/reports/executiveKpiService.js";
import { createAnalysisRun, processAnalysisRun } from "../../src/modules/ai/aiAnalysisService.js";
import { createReminder, updateReminderStatus } from "../../src/modules/reminders/reminderService.js";
import { createOperationalTask, updateOperationalTaskStatus } from "../../src/modules/tasks/taskService.js";
import {
    DEMO_NAMESPACE,
    DEMO_USERS,
    addDays,
    addMonths,
    calculateDocumentTotals,
    createDeterministicRandom,
    pick,
    stableChecksum,
    utcDate,
} from "./config.js";
import { completeNamespaceMarker, createNamespaceMarker } from "./reset.js";

const DEMO_COMPANIES = Object.freeze([
    { key: "main", name: "OPSA Demo Comercio, Lda", nif: "510100001", city: "Lisboa", planCode: "yearly", status: "ACTIVE" },
    { key: "cashRisk", name: "OPSA Demo Servicos, Lda", nif: "510100010", city: "Coimbra", planCode: "monthly", status: "ACTIVE" },
    { key: "cancelled", name: "OPSA Demo Cancelada, Lda", nif: "510100029", city: "Braga", planCode: "monthly", status: "CANCELLED" },
    { key: "expired", name: "OPSA Demo Expirada, Lda", nif: "510100037", city: "Porto", planCode: "yearly", status: "EXPIRED" },
    { key: "empty", name: "OPSA Demo Vazia, Lda", nif: "510100045", city: "Faro", planCode: null, status: null },
]);

const REQUIRED_ACCOUNTS = Object.freeze([
    ["1", "Meios financeiros liquidos", null],
    ["11", "Caixa", "1"],
    ["12", "Depositos a ordem", "1"],
    ["2", "Contas a receber e a pagar", null],
    ["21", "Clientes", "2"],
    ["211", "Clientes c/c", "21"],
    ["22", "Fornecedores", "2"],
    ["221", "Fornecedores c/c", "22"],
    ["24", "Estado e outros entes publicos", "2"],
    ["2432", "IVA dedutivel", "24"],
    ["2433", "IVA liquidado", "24"],
    ["3", "Inventarios e ativos biologicos", null],
    ["31", "Compras", "3"],
    ["32", "Mercadorias", "3"],
    ["6", "Gastos", null],
    ["61", "Custo das mercadorias vendidas", "6"],
    ["62", "Fornecimentos e servicos externos", "6"],
    ["7", "Rendimentos", null],
    ["71", "Vendas", "7"],
    ["72", "Prestacoes de servicos", "7"],
    ["8", "Resultados", null],
    ["81", "Resultado liquido do periodo", "8"],
]);

function monthStart(isoDate) {
    return `${isoDate.slice(0, 7)}-01`;
}

function amountLines({ itemId, vatRateId, description, quantity, unitCents, rateBps, purchase = false }) {
    const totals = calculateDocumentTotals(quantity, unitCents, rateBps);
    return {
        totals,
        line: {
            itemId,
            vatRateId,
            description,
            quantity,
            ...(purchase ? { unitCostCents: unitCents } : { unitPriceCents: unitCents }),
            ...totals,
        },
    };
}

async function seedUsers(prisma, config) {
    const passwordHash = await hashPassword(config.password);
    const users = {};
    for (const descriptor of DEMO_USERS) {
        users[descriptor.role] = await prisma.user.create({
            data: {
                email: descriptor.email,
                name: descriptor.name,
                passwordHash,
                isActive: true,
            },
        });
    }
    return users;
}

async function seedCompanies(prisma, users, config) {
    const companies = {};
    const markers = [];
    for (const descriptor of DEMO_COMPANIES) {
        const company = await prisma.company.create({
            data: { name: descriptor.name, nif: descriptor.nif },
        });
        companies[descriptor.key] = company;
        await prisma.companyProfile.create({
            data: {
                companyId: company.id,
                legalName: descriptor.name,
                nif: descriptor.nif,
                addressLine1: `Avenida Demonstracao ${Object.keys(companies).length}`,
                postalCode: "1000-001",
                city: descriptor.city,
                country: "PT",
                currency: "EUR",
                logoUrl: null,
                fiscalYearStartMonth: 1,
                fiscalYearStartDay: 1,
                commercialRegistrationNumber: descriptor.nif,
                saftTaxAccountingBasis: "F",
                saftTaxEntity: "Global",
                saftTaxonomyReference: "S",
                saftSelfBillingIndicator: 0,
                saftCashVatSchemeIndicator: 0,
                saftThirdPartiesBillingIndicator: 0,
                softwareCertificateNumber: 0,
                productCompanyTaxId: "510100001",
                productId: "OPSA/OPSA",
                productVersion: "1.0.0-demo",
            },
        });
        await prisma.companyMembership.create({
            data: { companyId: company.id, userId: users.ADMIN.id, role: "ADMIN" },
        });
        markers.push(await createNamespaceMarker(prisma, {
            companyId: company.id,
            userId: users.ADMIN.id,
            namespace: DEMO_NAMESPACE,
            profile: "demo",
        }));
        if (descriptor.planCode) {
            await prisma.companySubscription.create({
                data: {
                    companyId: company.id,
                    planCode: descriptor.planCode,
                    status: descriptor.status,
                    startsAt: utcDate(addMonths(config.anchorDate, -2)),
                    endsAt: utcDate(descriptor.status === "EXPIRED"
                        ? addDays(config.anchorDate, -1)
                        : addMonths(config.anchorDate, descriptor.planCode === "yearly" ? 10 : 1)),
                    simulated: true,
                },
            });
        }
    }

    for (const descriptor of DEMO_USERS.filter((row) => row.role !== "ADMIN")) {
        await prisma.companyMembership.create({
            data: {
                companyId: companies.main.id,
                userId: users[descriptor.role].id,
                role: descriptor.role,
            },
        });
    }
    await prisma.companyMembership.create({
        data: { companyId: companies.cashRisk.id, userId: users.GESTOR.id, role: "CONTABILISTA" },
    });
    await prisma.companyMembership.create({
        data: { companyId: companies.expired.id, userId: users.GESTOR.id, role: "AUDITOR" },
    });
    return { companies, markers };
}

async function seedPeriodsAndAccounts(prisma, companyId, config) {
    const anchorYear = Number(config.anchorDate.slice(0, 4));
    await prisma.fiscalPeriod.createMany({
        data: [
            {
                companyId,
                name: `DEMO ${anchorYear - 1} encerrado`,
                fiscalYear: anchorYear - 1,
                startDate: utcDate(`${anchorYear - 1}-01-01`),
                endDate: utcDate(`${anchorYear - 1}-12-31`),
                status: "CLOSED",
                closedAt: utcDate(`${anchorYear}-01-10`),
            },
            {
                companyId,
                name: `DEMO ${anchorYear} aberto`,
                fiscalYear: anchorYear,
                startDate: utcDate(`${anchorYear}-01-01`),
                endDate: utcDate(`${anchorYear}-12-31`),
                status: "OPEN",
            },
        ],
    });
    const extraAccounts = Array.from({ length: 48 }, (_, index) => {
        const code = `6${String(index + 30).padStart(2, "0")}`;
        return [code, `Conta analitica demo ${String(index + 1).padStart(2, "0")}`, "6"];
    });
    const rows = [...REQUIRED_ACCOUNTS, ...extraAccounts];
    await prisma.account.createMany({
        data: rows.map(([code, name, parentCode]) => ({
            companyId,
            code,
            name,
            parentCode,
            level: code.length,
            isActive: true,
            saftGroupingCategory: code.startsWith("6") || code.startsWith("7") ? "GM" : "GA",
            saftGroupingCode: parentCode ?? code,
            saftTaxonomyCode: Number(code),
        })),
    });
    return Object.fromEntries(
        (await prisma.account.findMany({ where: { companyId } })).map((account) => [account.code, account]),
    );
}

async function seedMasterData(prisma, companyId) {
    const vatRows = [
        ["IVA23", "IVA normal 23%", 2300, "NORMAL", null, null, true],
        ["IVA13", "IVA intermedio 13%", 1300, "INTERMEDIATE", null, null, true],
        ["IVA06", "IVA reduzido 6%", 600, "REDUCED", null, null, true],
        ["ISEM07", "Isento artigo 9", 0, "EXEMPT", "M07", "Artigo 9 do CIVA", true],
        ["OUT00", "Outra taxa demonstrativa", 0, "OTHER", null, null, true],
        ["IVA23-OFF", "Taxa historica inativa", 2300, "NORMAL", null, null, false],
    ];
    await prisma.vatRate.createMany({
        data: vatRows.map(([code, description, rateBps, type, exemptionCode, exemptionReason, isActive]) => ({
            companyId, code, description, rateBps, type, exemptionCode, exemptionReason, isActive,
        })),
    });
    const vatRates = Object.fromEntries(
        (await prisma.vatRate.findMany({ where: { companyId } })).map((rate) => [rate.code, rate]),
    );

    await prisma.customer.createMany({
        data: Array.from({ length: 75 }, (_, index) => ({
            companyId,
            name: `Cliente Demo ${String(index + 1).padStart(3, "0")}`,
            nif: String(520100000 + index),
            email: `cliente${index + 1}@opsa.demo`,
            phone: `210${String(index + 1).padStart(6, "0")}`,
            addressLine: `Rua Cliente ${index + 1}`,
            postalCode: "1000-100",
            city: pick(() => ((index * 37) % 100) / 100, ["Lisboa", "Porto", "Coimbra", "Braga", "Faro"]),
            isActive: index !== 74,
        })),
    });
    await prisma.supplier.createMany({
        data: Array.from({ length: 30 }, (_, index) => ({
            companyId,
            name: `Fornecedor Demo ${String(index + 1).padStart(3, "0")}`,
            nif: String(530100000 + index),
            email: `fornecedor${index + 1}@opsa.demo`,
            phone: `220${String(index + 1).padStart(6, "0")}`,
            addressLine: `Rua Fornecedor ${index + 1}`,
            postalCode: "4000-100",
            city: "Porto",
            isActive: index !== 29,
        })),
    });
    await prisma.item.createMany({
        data: Array.from({ length: 120 }, (_, index) => ({
            companyId,
            sku: `DEMO-${String(index + 1).padStart(4, "0")}`,
            name: `${index % 10 === 0 ? "Servico" : "Artigo"} Demo ${String(index + 1).padStart(3, "0")}`,
            type: index % 10 === 0 ? "SERVICE" : "PRODUCT",
            costCents: index % 10 === 0 ? 0 : 500 + index * 25,
            priceCents: 1_500 + index * 55,
            vatRateBps: index % 7 === 0 ? 600 : 2300,
            unitOfMeasure: index % 10 === 0 ? "HORA" : "UN",
            isActive: index !== 119,
        })),
    });
    const [mainWarehouse, reserveWarehouse] = await Promise.all([
        prisma.warehouse.create({ data: { companyId, code: "WH-MAIN", name: "Armazem Principal" } }),
        prisma.warehouse.create({ data: { companyId, code: "WH-RES", name: "Armazem Reserva" } }),
    ]);
    await prisma.warehouseLocation.createMany({
        data: [
            [mainWarehouse.id, "A1", "Corredor A1"],
            [mainWarehouse.id, "A2", "Corredor A2"],
            [mainWarehouse.id, "B1", "Corredor B1"],
            [reserveWarehouse.id, "R1", "Reserva R1"],
            [reserveWarehouse.id, "R2", "Reserva R2"],
            [reserveWarehouse.id, "R3", "Reserva R3"],
        ].map(([warehouseId, code, name]) => ({ warehouseId, code, name })),
    });
    return {
        vatRates,
        customers: await prisma.customer.findMany({ where: { companyId, isActive: true }, orderBy: { name: "asc" } }),
        suppliers: await prisma.supplier.findMany({ where: { companyId, isActive: true }, orderBy: { name: "asc" } }),
        items: await prisma.item.findMany({ where: { companyId, isActive: true }, orderBy: { sku: "asc" } }),
        warehouses: { main: mainWarehouse, reserve: reserveWarehouse },
    };
}

async function seedHistoricalCommerce(prisma, context, config) {
    const random = createDeterministicRandom(`${config.randomSeed}:commerce`);
    const activeItems = context.refs.items;
    const saleDocuments = [];
    const purchaseDocuments = [];
    for (let index = 0; index < 208; index += 1) {
        const first = monthStart(addMonths(config.anchorDate, -(index % 18)));
        const issued = addDays(first, index % 20);
        const item = activeItems[index % activeItems.length];
        const vat = index % 9 === 0 ? context.refs.vatRates.ISEM07 : context.refs.vatRates.IVA23;
        const quantity = 1 + (index % 4);
        const unitPriceCents = item.priceCents + Math.floor(random() * 1_000);
        const computed = amountLines({
            itemId: item.id,
            vatRateId: vat.id,
            description: `Venda historica ${index + 1}`,
            quantity,
            unitCents: unitPriceCents,
            rateBps: vat.rateBps,
        });
        const settled = index % 3 === 0;
        const document = await prisma.saleDocument.create({
            data: {
                companyId: context.company.id,
                customerId: context.refs.customers[index % context.refs.customers.length].id,
                kind: index % 17 === 0 ? "CREDIT_NOTE" : "INVOICE",
                status: settled ? "SETTLED" : "ISSUED",
                number: `DEMO-FT-${String(index + 1).padStart(5, "0")}`,
                issuedAt: utcDate(issued),
                dueDate: utcDate(addDays(issued, 20)),
                ...computed.totals,
                amountPaidCents: settled ? computed.totals.totalCents : 0,
                createdById: context.users.ADMIN.id,
                issuedById: context.users.ADMIN.id,
                issuedDefinitiveAt: utcDate(issued),
                lines: { create: computed.line },
            },
        });
        saleDocuments.push(document);
        if (settled && document.kind !== "CREDIT_NOTE") {
            await prisma.receipt.create({
                data: {
                    companyId: context.company.id,
                    saleDocumentId: document.id,
                    amountCents: document.totalCents,
                    receivedAt: utcDate(addDays(issued, 18 + (index % 8))),
                    method: ["CASH", "BANK_TRANSFER", "CARD", "OTHER"][index % 4],
                    reference: `DEMO-R-${index + 1}`,
                    createdById: context.users.ADMIN.id,
                },
            });
        }
    }
    for (let index = 0; index < 138; index += 1) {
        const first = monthStart(addMonths(config.anchorDate, -(index % 18)));
        const issued = addDays(first, index % 18);
        const item = activeItems[(index + 7) % activeItems.length];
        const vat = context.refs.vatRates.IVA23;
        const computed = amountLines({
            itemId: item.id,
            vatRateId: vat.id,
            description: `Compra historica ${index + 1}`,
            quantity: 1 + (index % 5),
            unitCents: Math.max(100, item.costCents || 1_000),
            rateBps: vat.rateBps,
            purchase: true,
        });
        const paid = index % 3 === 0;
        const document = await prisma.purchaseDocument.create({
            data: {
                companyId: context.company.id,
                supplierId: context.refs.suppliers[index % context.refs.suppliers.length].id,
                kind: index % 19 === 0 ? "SUPPLIER_CREDIT_NOTE" : "SUPPLIER_INVOICE",
                status: paid ? "PAID" : index % 2 === 0 ? "POSTED" : "APPROVED",
                supplierNumber: `DEMO-FC-${String(index + 1).padStart(5, "0")}`,
                issuedAt: utcDate(issued),
                dueDate: utcDate(addDays(issued, 15)),
                ...computed.totals,
                amountPaidCents: paid ? computed.totals.totalCents : 0,
                createdById: context.users.ADMIN.id,
                approvedAt: utcDate(issued),
                approvedById: context.users.GESTOR.id,
                postedAt: index % 2 === 0 || paid ? utcDate(addDays(issued, 1)) : null,
                postedById: index % 2 === 0 || paid ? context.users.CONTABILISTA.id : null,
                lines: { create: computed.line },
            },
        });
        purchaseDocuments.push(document);
        if (paid && document.kind !== "SUPPLIER_CREDIT_NOTE") {
            await prisma.payment.create({
                data: {
                    companyId: context.company.id,
                    purchaseDocumentId: document.id,
                    amountCents: document.totalCents,
                    paidAt: utcDate(addDays(issued, 2)),
                    method: ["CASH", "BANK_TRANSFER", "CARD", "OTHER"][index % 4],
                    reference: `DEMO-P-${index + 1}`,
                    createdById: context.users.ADMIN.id,
                },
            });
        }
    }
    return { saleDocuments, purchaseDocuments };
}

async function createSaleScenario(prisma, context, descriptor) {
    const item = context.refs.items[descriptor.index % context.refs.items.length];
    const vat = context.refs.vatRates.IVA23;
    const draft = await createSaleDocument(
        prisma,
        context.company.id,
        context.users.ADMIN.id,
        {
            kind: descriptor.kind ?? "INVOICE",
            customerId: context.refs.customers[descriptor.index % context.refs.customers.length].id,
            issuedAt: descriptor.issuedAt,
            dueDate: descriptor.dueDate ?? addDays(descriptor.issuedAt, 15),
            lines: [{
                itemId: item.id,
                vatRateId: vat.id,
                description: descriptor.description,
                quantity: descriptor.quantity ?? 1,
                unitPriceCents: descriptor.unitPriceCents ?? item.priceCents,
            }],
        },
    );
    if (descriptor.state === "DRAFT") return draft;
    await submitSaleDocument(prisma, context.company.id, context.users.ADMIN.id, draft.id);
    if (descriptor.state === "SUBMITTED") return prisma.saleDocument.findUnique({ where: { id: draft.id } });
    if (descriptor.state === "REJECTED") {
        return rejectSaleDocument(prisma, context.company.id, context.users.GESTOR.id, draft.id, { reason: "Cenario demonstrativo de rejeicao" });
    }
    await approveSaleDocument(prisma, context.company.id, context.users.GESTOR.id, draft.id);
    if (descriptor.state === "APPROVED") return prisma.saleDocument.findUnique({ where: { id: draft.id } });
    return issueSaleDocument(prisma, context.company.id, context.users.GESTOR.id, draft.id);
}

async function seedActionableCommerce(prisma, context, config) {
    const issuedAt = addDays(config.anchorDate, -Math.min(5, Number(config.anchorDate.slice(-2)) - 1));
    const scenarios = [
        { state: "DRAFT", index: 0, issuedAt, description: "ACAO 1 - Submeter venda" },
        { state: "SUBMITTED", index: 1, issuedAt, description: "ACAO 2 - Aprovar ou rejeitar venda" },
        { state: "APPROVED", index: 2, issuedAt, description: "ACAO 3 - Emitir venda" },
        { state: "REJECTED", index: 3, issuedAt, description: "Historico de venda rejeitada" },
        { state: "ISSUED", index: 4, issuedAt, dueDate: addDays(config.anchorDate, -2), unitPriceCents: 80_000, description: "ACAO 4 - Contabilizar venda emitida" },
        { state: "ISSUED", index: 5, issuedAt, dueDate: addDays(config.anchorDate, -3), unitPriceCents: 120_000, description: "ACAO 5 - Registar recebimento parcial" },
        { state: "ISSUED", kind: "INVOICE_RECEIPT", index: 6, issuedAt, description: "Fatura-recibo liquidada" },
        { state: "ISSUED", kind: "CREDIT_NOTE", index: 7, issuedAt, description: "Nota de credito demonstrativa" },
    ];
    const sales = [];
    for (const descriptor of scenarios) sales.push(await createSaleScenario(prisma, context, descriptor));
    await postSaleDocument(prisma, context.company.id, context.users.CONTABILISTA.id, sales[6].id);
    await registerReceipt(
        prisma,
        context.company.id,
        context.users.CONTABILISTA.id,
        sales[5].id,
        {
            amountCents: Math.floor(sales[5].totalCents / 3),
            receivedAt: config.anchorDate,
            method: "BANK_TRANSFER",
            reference: "DEMO-RECEIPT-PARTIAL",
            notes: "Recebimento parcial preparado pelo seed.",
        },
    );

    const purchases = [];
    for (let index = 0; index < 6; index += 1) {
        const item = context.refs.items[(index + 10) % context.refs.items.length];
        const draft = await createPurchaseDocument(
            prisma,
            context.company.id,
            context.users.ADMIN.id,
            {
                kind: index === 5 ? "SUPPLIER_CREDIT_NOTE" : "SUPPLIER_INVOICE",
                supplierId: context.refs.suppliers[index].id,
                supplierNumber: `ACAO-FC-${String(index + 1).padStart(3, "0")}`,
                issuedAt,
                dueDate: addDays(config.anchorDate, index === 1 ? -1 : 10),
                lines: [{
                    itemId: item.id,
                    vatRateId: context.refs.vatRates.IVA23.id,
                    description: index === 0 ? "ACAO - Aprovar compra" : `Compra de acao ${index + 1}`,
                    quantity: index === 1 ? 20 : 1,
                    unitCostCents: index === 1 ? 25_000 : Math.max(1_000, item.costCents),
                }],
            },
        );
        if (index === 0) {
            purchases.push(draft);
            continue;
        }
        if (index === 2) {
            purchases.push(await rejectPurchaseDocument(
                prisma,
                context.company.id,
                context.users.GESTOR.id,
                draft.id,
                { reason: "Cenario demonstrativo de rejeicao" },
            ));
            continue;
        }
        await approvePurchaseDocument(
            prisma,
            context.company.id,
            context.users.GESTOR.id,
            draft.id,
            { reason: "Aprovacao demonstrativa" },
        );
        if (index === 1) {
            purchases.push(await prisma.purchaseDocument.findUnique({ where: { id: draft.id } }));
            continue;
        }
        await postPurchaseDocument(prisma, context.company.id, context.users.CONTABILISTA.id, draft.id);
        if (index === 4) {
            const posted = await prisma.purchaseDocument.findUnique({ where: { id: draft.id } });
            await registerPayment(prisma, context.company.id, context.users.CONTABILISTA.id, draft.id, {
                amountCents: posted.totalCents,
                paidAt: config.anchorDate,
                method: "BANK_TRANSFER",
                reference: "DEMO-PAYMENT-TOTAL",
                notes: "Pagamento total preparado pelo seed.",
            });
            await prisma.purchaseDocument.update({ where: { id: draft.id }, data: { status: "PAID" } });
        }
        purchases.push(await prisma.purchaseDocument.findUnique({ where: { id: draft.id } }));
    }
    return { sales, purchases };
}

async function seedHistoricalJournals(prisma, context, commerce) {
    const rows = [];
    for (const sale of commerce.saleDocuments.slice(0, 30)) {
        rows.push({ source: "SALE", sourceId: sale.id, entryDate: sale.issuedAt, description: `Venda ${sale.number}`, total: sale.totalCents, debit: context.accounts["211"].id, credit: context.accounts["72"].id });
    }
    for (const purchase of commerce.purchaseDocuments.slice(0, 30)) {
        rows.push({ source: "PURCHASE", sourceId: purchase.id, entryDate: purchase.issuedAt, description: `Compra ${purchase.supplierNumber}`, total: purchase.totalCents, debit: context.accounts["62"].id, credit: context.accounts["221"].id });
    }
    for (const row of rows) {
        await prisma.journalEntry.create({
            data: {
                companyId: context.company.id,
                source: row.source,
                sourceId: row.sourceId,
                entryDate: row.entryDate,
                description: row.description,
                createdById: context.users.CONTABILISTA.id,
                lines: {
                    create: [
                        { accountId: row.debit, debitCents: row.total, creditCents: 0 },
                        { accountId: row.credit, debitCents: 0, creditCents: row.total },
                    ],
                },
            },
        });
    }
}

async function seedInventory(prisma, context, config) {
    const products = context.refs.items.filter((item) => item.type === "PRODUCT");
    const movements = [];
    for (const item of products) {
        for (let batch = 0; batch < 2; batch += 1) {
            movements.push(await createStockMovement(prisma, context.company.id, context.users.OPERACIONAL.id, {
                type: "ENTRY",
                itemId: item.id,
                quantity: batch === 0 ? 100 : 40,
                unitCostCents: item.costCents,
                toWarehouseId: context.refs.warehouses.main.id,
                reason: `Entrada demo lote ${batch + 1}`,
                sourceType: "DEMO_SEED",
                sourceId: `ENTRY:${item.sku}:${batch + 1}`,
            }));
        }
    }
    for (const item of products.slice(0, 40)) {
        movements.push(await createStockMovement(prisma, context.company.id, context.users.OPERACIONAL.id, {
            type: "EXIT", itemId: item.id, quantity: 5,
            fromWarehouseId: context.refs.warehouses.main.id,
            reason: "Saida demo", sourceType: "DEMO_SEED", sourceId: `EXIT:${item.sku}`,
        }));
    }
    for (const item of products.slice(40, 80)) {
        movements.push(await createStockMovement(prisma, context.company.id, context.users.OPERACIONAL.id, {
            type: "TRANSFER", itemId: item.id, quantity: 5,
            fromWarehouseId: context.refs.warehouses.main.id,
            toWarehouseId: context.refs.warehouses.reserve.id,
            reason: "Transferencia demo", sourceType: "DEMO_SEED", sourceId: `TRANSFER:${item.sku}`,
        }));
    }
    for (const item of products.slice(80, 100)) {
        movements.push(await createStockMovement(prisma, context.company.id, context.users.OPERACIONAL.id, {
            type: "RETURN", itemId: item.id, quantity: 3, unitCostCents: item.costCents,
            toWarehouseId: context.refs.warehouses.main.id,
            reason: "Devolucao demo", sourceType: "DEMO_SEED", sourceId: `RETURN:${item.sku}`,
        }));
    }
    for (const item of products.slice(0, 22)) {
        movements.push(await createStockMovement(prisma, context.company.id, context.users.OPERACIONAL.id, {
            type: "ADJUSTMENT", itemId: item.id, quantity: 2, unitCostCents: item.costCents,
            toWarehouseId: context.refs.warehouses.main.id,
            reason: "Ajuste positivo demo", sourceType: "DEMO_SEED", sourceId: `ADJ-IN:${item.sku}`,
        }));
        movements.push(await createStockMovement(prisma, context.company.id, context.users.OPERACIONAL.id, {
            type: "ADJUSTMENT", itemId: item.id, quantity: -2,
            fromWarehouseId: context.refs.warehouses.main.id,
            reason: "Ajuste negativo demo", sourceType: "DEMO_SEED", sourceId: `ADJ-OUT:${item.sku}`,
        }));
    }

    await saveStockAlertSetting(prisma, {
        companyId: context.company.id,
        userId: context.users.OPERACIONAL.id,
        input: { itemId: products[0].id, warehouseId: context.refs.warehouses.main.id, minQuantity: 1, maxQuantity: 100, stoppedAfterDays: 30 },
    });
    await saveStockAlertSetting(prisma, {
        companyId: context.company.id,
        userId: context.users.OPERACIONAL.id,
        input: { itemId: products[40].id, warehouseId: context.refs.warehouses.reserve.id, minQuantity: 10, maxQuantity: 20, stoppedAfterDays: 30 },
    });
    await saveStockAlertSetting(prisma, {
        companyId: context.company.id,
        userId: context.users.OPERACIONAL.id,
        input: { itemId: products[80].id, warehouseId: context.refs.warehouses.main.id, minQuantity: 1, maxQuantity: 500, stoppedAfterDays: 30 },
    });
    await prisma.stockMovement.updateMany({
        where: { companyId: context.company.id, itemId: products[80].id },
        data: { createdAt: utcDate(addDays(config.anchorDate, -120)) },
    });

    for (let index = 0; index < 12; index += 1) {
        const balance = await prisma.stockBalance.findUnique({
            where: {
                companyId_itemId_warehouseId: {
                    companyId: context.company.id,
                    itemId: products[index].id,
                    warehouseId: context.refs.warehouses.main.id,
                },
            },
        });
        const expected = Number(balance?.quantity ?? 0);
        const count = await createInventoryCount(prisma, context.company.id, context.users.OPERACIONAL.id, {
            warehouseId: context.refs.warehouses.main.id,
            reason: `Contagem demo ${String(index + 1).padStart(2, "0")}`,
            countedAt: addDays(config.anchorDate, -index),
            lines: [{ itemId: products[index].id, countedQuantity: expected + (index < 4 ? 1 : 0), unitCostCents: products[index].costCents }],
        });
        if (index < 4) await postInventoryCount(prisma, context.company.id, context.users.OPERACIONAL.id, count.id);
        if (index >= 4 && index < 8) {
            await prisma.inventoryCount.update({ where: { id: count.id }, data: { status: "CANCELLED" } });
        }
    }
    return movements;
}

async function createDemoPdfDescriptor(config) {
    const tempPath = path.join(tmpdir(), `opsa-demo-${process.pid}-${Date.now()}.pdf`);
    await new Promise((resolve, reject) => {
        const document = new PDFDocument({ size: "A4", margin: 50 });
        const output = createWriteStream(tempPath, { flags: "wx" });
        output.on("finish", resolve);
        output.on("error", reject);
        document.on("error", reject);
        document.pipe(output);
        document.fontSize(20).text("OPSA - Comprovativo demonstrativo");
        document.moveDown().fontSize(12).text(`Data ancora: ${config.anchorDate}`);
        document.text("Documento privado criado pelo seed e validado no object storage.");
        document.end();
    });
    const bytes = await readFile(tempPath);
    return {
        fileName: "comprovativo-opsa-demo.pdf",
        mimeType: "application/pdf",
        sizeBytes: (await stat(tempPath)).size,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        head: bytes.subarray(0, 8_192),
        tempPath,
    };
}

async function seedAccountingAttachment(prisma, context, config, objectStorage) {
    const journal = await createManualJournal(prisma, context.company.id, context.users.CONTABILISTA.id, {
        entryDate: config.anchorDate,
        description: "Lancamento manual demonstrativo",
        saftTransactionType: "N",
        lines: [
            { accountId: context.accounts["12"].id, debitCents: 250_000, creditCents: 0, memo: "Saldo bancario" },
            { accountId: context.accounts["81"].id, debitCents: 0, creditCents: 250_000, memo: "Contrapartida" },
        ],
    });
    await updateManualJournal(prisma, context.company.id, context.users.CONTABILISTA.id, journal.id, {
        entryDate: config.anchorDate,
        description: "Lancamento manual demonstrativo revisto",
        reason: "Correcao demonstrativa da descricao",
        saftTransactionType: "N",
        lines: [
            { accountId: context.accounts["12"].id, debitCents: 250_000, creditCents: 0, memo: "Saldo bancario revisto" },
            { accountId: context.accounts["81"].id, debitCents: 0, creditCents: 250_000, memo: "Contrapartida" },
        ],
    });
    const descriptor = await createDemoPdfDescriptor(config);
    try {
        const attachment = await addManualJournalAttachment(
            prisma,
            objectStorage,
            context.company.id,
            context.users.CONTABILISTA.id,
            journal.id,
            descriptor,
        );
        const downloaded = await getManualJournalAttachmentDownload(prisma, objectStorage, {
            companyId: context.company.id,
            journalEntryId: journal.id,
            attachmentId: attachment.id,
        });
        downloaded.object.body.destroy?.();
        return { journal, attachment };
    } finally {
        await rm(descriptor.tempPath, { force: true });
    }
}

async function seedTreasuryAndImports(prisma, context, config) {
    const treasuryAccounts = [];
    for (const descriptor of [
        { type: "BANK", name: "Banco Principal Demo", iban: "PT50000201231234567890154", initialBalanceCents: 25_000 },
        { type: "BANK", name: "Banco Operacional Demo", iban: "PT45003501231234567890154", initialBalanceCents: 15_000 },
        { type: "CASH", name: "Caixa Lisboa Demo", iban: null, initialBalanceCents: 5_000 },
        { type: "CASH", name: "Caixa Porto Demo", iban: null, initialBalanceCents: 2_500 },
    ]) {
        treasuryAccounts.push(await createTreasuryAccount(prisma, {
            companyId: context.company.id,
            userId: context.users.CONTABILISTA.id,
            input: { ...descriptor, currency: "EUR" },
        }));
    }
    const firstAccount = treasuryAccounts[0];
    await importBankStatement(prisma, {
        companyId: context.company.id,
        userId: context.users.CONTABILISTA.id,
        input: {
            treasuryAccountId: firstAccount.id,
            fileName: "demo-extrato-valido.csv",
            fileBuffer: Buffer.from(
                "data;descricao;referencia;valor\n" +
                `${config.anchorDate};Recebimento demonstrativo;DEMO-RECEIPT-PARTIAL;400,00\n` +
                `${config.anchorDate};Pagamento demonstrativo;DEMO-PAYMENT-TOTAL;-300,00`,
                "utf8",
            ),
        },
    });
    await importBankStatement(prisma, {
        companyId: context.company.id,
        userId: context.users.CONTABILISTA.id,
        input: {
            treasuryAccountId: firstAccount.id,
            fileName: "demo-extrato-parcial.csv",
            fileBuffer: Buffer.from(
                "data;descricao;referencia;valor\n" +
                `${config.anchorDate};Linha valida;REF-VALIDA;125,00\n` +
                `${config.anchorDate};Linha valida;REF-VALIDA;125,00\n` +
                "data-invalida;Linha rejeitada;REF-ERRO;abc",
                "utf8",
            ),
        },
    });

    const ofxDate = config.anchorDate.replaceAll("-", "");
    await importBankStatement(prisma, {
        companyId: context.company.id,
        userId: context.users.CONTABILISTA.id,
        input: {
            treasuryAccountId: treasuryAccounts[1].id,
            fileName: "demo-extrato.ofx",
            fileBuffer: Buffer.from(
                "OFXHEADER:100\nDATA:OFXSGML\nVERSION:102\nENCODING:UTF-8\n\n" +
                "<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKTRANLIST>" +
                `<STMTTRN><DTPOSTED>${ofxDate}<TRNAMT>55.00<FITID>OFX-001<NAME>Movimento OFX` +
                "</BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>",
                "utf8",
            ),
        },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Extrato");
    sheet.addRow(["data", "descricao", "referencia", "valor"]);
    sheet.addRow([config.anchorDate, "Movimento XLSX", "XLSX-001", "75,00"]);
    await importBankStatement(prisma, {
        companyId: context.company.id,
        userId: context.users.CONTABILISTA.id,
        input: {
            treasuryAccountId: treasuryAccounts[1].id,
            fileName: "demo-extrato.xlsx",
            fileBuffer: Buffer.from(await workbook.xlsx.writeBuffer()),
        },
    });

    for (const descriptor of [
        { type: "CUSTOMERS", fileName: "demo-import-clientes.csv", content: "name;nif;email;city\nCliente Importado Valido;540100001;importado.cliente@opsa.demo;Setubal\n;123;email-invalido;" },
        { type: "SUPPLIERS", fileName: "demo-import-fornecedores.csv", content: "name;nif;email;city\nFornecedor Importado Valido;540100010;importado.fornecedor@opsa.demo;Leiria" },
        { type: "ITEMS", fileName: "demo-import-artigos.csv", content: "sku;name;type;costCents;priceCents;vatRateBps\nDEMO-IMPORT-1;Artigo Importado;PRODUCT;500;900;2300" },
    ]) {
        await importBusinessData(prisma, {
            companyId: context.company.id,
            userId: context.users.CONTABILISTA.id,
            input: {
                type: descriptor.type,
                fileName: descriptor.fileName,
                fileBuffer: Buffer.from(descriptor.content, "utf8"),
            },
        });
    }
    return treasuryAccounts;
}

async function seedAnalyticsAndAi(prisma, context, config) {
    const analytics = [];
    for (let offset = 17; offset >= 0; offset -= 1) {
        const from = monthStart(addMonths(config.anchorDate, -offset));
        const nextMonth = addMonths(from, 1);
        const naturalEnd = addDays(nextMonth, -1);
        const to = naturalEnd > config.anchorDate ? config.anchorDate : naturalEnd;
        const input = {
            companyId: context.company.id,
            userId: context.users.CONTABILISTA.id,
            fromDate: utcDate(from),
            toDate: utcDate(to),
        };
        analytics.push({
            vat: await buildVatMap(prisma, input),
            cashflow: await buildCashflowForecast(prisma, input),
            operational: await buildOperationalReport(prisma, input),
            kpis: await buildExecutiveKpis(prisma, input),
        });
    }
    const currentRange = {
        companyId: context.company.id,
        userId: context.users.GESTOR.id,
        fromDate: utcDate(monthStart(config.anchorDate)),
        toDate: utcDate(config.anchorDate),
    };
    const run = await createAnalysisRun(prisma, currentRange);
    const claimedBy = "demo-seed";
    await prisma.aiAnalysisRun.update({
        where: { id: run.id },
        data: { status: "RUNNING", claimedBy, attempts: 1, startedAt: new Date(), leaseExpiresAt: addDays(new Date(), 1) },
    });
    await processAnalysisRun(prisma, { ...run, status: "RUNNING", claimedBy, attempts: 1 });
    const [insights, suggestions, alerts] = await Promise.all([
        prisma.aiInsight.findMany({ where: { companyId: context.company.id } }),
        prisma.aiActionSuggestion.findMany({ where: { companyId: context.company.id } }),
        prisma.smartAlert.findMany({ where: { companyId: context.company.id } }),
    ]);
    return { analytics, insights, suggestions, alerts };
}

async function seedOperations(prisma, context, config) {
    for (let index = 0; index < 24; index += 1) {
        const reminder = await createReminder(prisma, {
            companyId: context.company.id,
            userId: context.users.ADMIN.id,
            body: {
                title: `Lembrete demo ${String(index + 1).padStart(2, "0")}`,
                description: "Lembrete operacional representativo.",
                type: ["PAYMENT", "TAX", "DEADLINE"][index % 3],
                dueAt: addDays(config.anchorDate, index - 12),
            },
        });
        if (index % 3 === 0) {
            await updateReminderStatus(prisma, {
                companyId: context.company.id,
                userId: context.users.ADMIN.id,
                reminderId: reminder.id,
                body: { status: "DONE" },
            });
        }
        const task = await createOperationalTask(prisma, {
            companyId: context.company.id,
            userId: context.users.ADMIN.id,
            body: {
                title: `Tarefa demo ${String(index + 1).padStart(2, "0")}`,
                description: "Tarefa operacional representativa.",
                dueAt: addDays(config.anchorDate, index - 10),
                assignedToId: context.users.OPERACIONAL.id,
            },
        });
        if (index % 4 === 0) {
            await updateOperationalTaskStatus(prisma, {
                companyId: context.company.id,
                userId: context.users.OPERACIONAL.id,
                taskId: task.id,
                body: { status: "DONE" },
            });
        }
    }
    await prisma.alertPreference.createMany({
        data: ["LOW_STOCK", "CUSTOMER_COLLECTION_RISK", "TAX_DEADLINE"].map((type, index) => ({
            companyId: context.company.id,
            userId: context.users.ADMIN.id,
            type,
            enabled: index !== 2,
        })),
    });
    await prisma.inAppNotification.createMany({
        data: Array.from({ length: 60 }, (_, index) => ({
            companyId: context.company.id,
            userId: context.users.ADMIN.id,
            type: index % 5 === 0 ? "WARNING" : "INFO",
            title: `Notificacao demo ${String(index + 1).padStart(2, "0")}`,
            message: "Notificacao criada para demonstrar listagem, leitura e volume.",
            sourceType: "DEMO_SEED",
            sourceId: `NOTIFICATION-${index + 1}`,
            readAt: index % 2 === 0 ? utcDate(addDays(config.anchorDate, -1)) : null,
        })),
    });
}

async function seedSecurityLifecycle(prisma, context, config) {
    const encryptionKey = process.env.EMAIL_OUTBOX_ENCRYPTION_KEY
        ?? "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    const emailOutbox = createEmailOutbox({ encryptionKey });
    const invitationAdapter = buildInvitationEmailAdapter({
        appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:5173",
        emailOutbox,
    });
    const invitation = await inviteUser(prisma, invitationAdapter, {
        companyId: context.company.id,
        actorUserId: context.users.ADMIN.id,
        actorRole: "ADMIN",
        email: "convidado@opsa.demo",
        role: "OPERACIONAL",
        now: utcDate(config.anchorDate),
    });
    const invitationOutbox = await prisma.emailOutbox.findFirst({
        where: { dedupeKey: { startsWith: `company-invitation:${invitation.id}:` } },
    });
    if (invitationOutbox) {
        await prisma.emailOutbox.update({
            where: { id: invitationOutbox.id },
            data: { dedupeKey: `demo:${invitationOutbox.dedupeKey}` },
        });
    }
    await revokeCompanyInvitation(prisma, {
        companyId: context.company.id,
        actorUserId: context.users.ADMIN.id,
        actorRole: "ADMIN",
        invitationId: invitation.id,
        now: utcDate(config.anchorDate),
    });
    const passwordAdapter = buildPasswordResetEmailAdapter({
        appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:5173",
        emailOutbox,
    });
    await requestPasswordReset(prisma, passwordAdapter, {
        email: context.users.ADMIN.email,
        now: utcDate(config.anchorDate),
        auditContext: { subjectHash: "demo-seed" },
    });
    const token = await prisma.passwordResetToken.findFirst({
        where: { userId: context.users.ADMIN.id },
        orderBy: { createdAt: "desc" },
    });
    if (token) {
        const outbox = await prisma.emailOutbox.findUnique({
            where: { dedupeKey: `password-reset:${token.tokenHash}` },
        });
        if (outbox) {
            await prisma.emailOutbox.update({
                where: { id: outbox.id },
                data: { dedupeKey: `demo:${outbox.dedupeKey}` },
            });
        }
    }
    const login = await loginUser(
        prisma,
        { email: context.users.AUDITOR.email, password: config.password },
        utcDate(config.anchorDate),
        { subjectHash: "demo-seed" },
    );
    await logoutUser(prisma, login.sessionId, utcDate(config.anchorDate), {
        subjectHash: "demo-seed",
    });
}

/**
 * Executa o perfil demo completo.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ config: object, objectStorage: object }} input - Dependencias da seed.
 * @returns {Promise<object>} Resumo verificavel.
 */
export async function seedDemoProfile(prisma, input) {
    const startedAt = Date.now();
    const users = await seedUsers(prisma, input.config);
    const { companies, markers } = await seedCompanies(prisma, users, input.config);
    const company = companies.main;
    const accounts = await seedPeriodsAndAccounts(prisma, company.id, input.config);
    const refs = await seedMasterData(prisma, company.id);
    const context = { company, companies, users, accounts, refs };

    const historical = await seedHistoricalCommerce(prisma, context, input.config);
    await seedHistoricalJournals(prisma, context, historical);
    const actionable = await seedActionableCommerce(prisma, context, input.config);
    const inventory = await seedInventory(prisma, context, input.config);
    const attachment = await seedAccountingAttachment(prisma, context, input.config, input.objectStorage);
    const treasury = await seedTreasuryAndImports(prisma, context, input.config);
    const analytics = await seedAnalyticsAndAi(prisma, context, input.config);
    await seedOperations(prisma, context, input.config);
    await seedSecurityLifecycle(prisma, context, input.config);

    const counts = {
        companies: await prisma.company.count({ where: { id: { in: Object.values(companies).map((row) => row.id) } } }),
        users: DEMO_USERS.length,
        accounts: await prisma.account.count({ where: { companyId: company.id } }),
        customers: await prisma.customer.count({ where: { companyId: company.id } }),
        suppliers: await prisma.supplier.count({ where: { companyId: company.id } }),
        items: await prisma.item.count({ where: { companyId: company.id } }),
        sales: await prisma.saleDocument.count({ where: { companyId: company.id } }),
        purchases: await prisma.purchaseDocument.count({ where: { companyId: company.id } }),
        movements: await prisma.stockMovement.count({ where: { companyId: company.id } }),
        auditLogs: await prisma.auditLog.count({ where: { companyId: company.id } }),
    };
    const checksum = stableChecksum({ anchorDate: input.config.anchorDate, counts });
    for (const marker of markers) {
        await completeNamespaceMarker(prisma, {
            markerId: marker.id,
            totalRows: Object.values(counts).reduce((sum, value) => sum + value, 0),
            checksum,
        });
    }
    return {
        profile: "demo",
        namespace: DEMO_NAMESPACE,
        anchorDate: input.config.anchorDate,
        company,
        users: DEMO_USERS.map(({ email, role }) => ({ email, role })),
        counts,
        checksum,
        durationMs: Date.now() - startedAt,
        artifacts: {
            actionableSaleIds: actionable.sales.map((row) => row.id),
            actionablePurchaseIds: actionable.purchases.map((row) => row.id),
            attachmentId: attachment.attachment.id,
            treasuryAccountIds: treasury.map((row) => row.id),
            generatedInsightCount: analytics.insights.length,
            generatedAlertCount: analytics.alerts.length,
            seededMovementCount: inventory.length,
        },
    };
}
