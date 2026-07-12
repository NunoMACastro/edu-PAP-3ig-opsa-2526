/**
 * @file Testes de integração persistida dos fluxos críticos da MF3.
 *
 * A suite só corre contra uma base PostgreSQL efémera indicada por
 * `TEST_DATABASE_URL`. Sem essa variável, falha de propósito para não dar a
 * integração como validada sem persistência real. Em desenvolvimento local, o
 * skip tem de ser explícito com `OPSA_SKIP_PERSISTENCE_TESTS=true`.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { createSaftExport } from "../../src/modules/compliance/saftService.js";
import { importBusinessData } from "../../src/modules/imports/businessImportService.js";
import { buildExecutiveKpis } from "../../src/modules/reports/executiveKpiService.js";
import { buildOperationalReport } from "../../src/modules/reports/operationalReportService.js";
import { buildVatMap } from "../../src/modules/tax/vatMapService.js";
import { createTreasuryAccount } from "../../src/modules/treasury/bankAccountService.js";
import { buildCashflowForecast } from "../../src/modules/treasury/cashflowForecastService.js";
import { importBankStatement } from "../../src/modules/treasury/statementImportService.js";

const apiRoot = fileURLToPath(new URL("../..", import.meta.url));
const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const skipPersistenceTests = process.env.OPSA_SKIP_PERSISTENCE_TESTS === "true";

/**
 * Lê a URL da base de dados de integração e falha cedo quando não está configurada.
 *
 * @returns URL da base de dados de teste configurada.
 */
function requireTestDatabaseUrl() {
    if (!testDatabaseUrl) {
        throw new Error(
            "Definir TEST_DATABASE_URL para correr integração persistida da MF3. " +
                "Usa apenas uma base PostgreSQL efémera cujo nome contenha test, audit ou ci. " +
                "Para saltar deliberadamente em desenvolvimento local, define OPSA_SKIP_PERSISTENCE_TESTS=true.",
        );
    }
    return testDatabaseUrl;
}

/**
 * Impede que testes de integração corram contra uma base de dados que não pareça descartável.
 *
 * @param url - URL da base de dados usada no teste.
 * @returns Não devolve valor; lança erro se a URL não parecer segura para teste.
 */
function assertSafeTestDatabaseUrl(url) {
    const databaseName = new URL(url).pathname.replace(/^\//, "");
    if (!/(^|[_-])(test|audit|ci)([_-]|$)/i.test(databaseName)) {
        throw new Error(
            "TEST_DATABASE_URL deve apontar para uma base efémera cujo nome contenha test, audit ou ci.",
        );
    }
}

/**
 * Executa as migrations Prisma antes dos testes persistidos para alinhar o schema da base.
 *
 * @param url - URL da base de dados usada no teste.
 * @returns Promise resolvida depois de executar as migrations.
 */
function runMigrations(url) {
    execFileSync("npx", ["prisma", "migrate", "deploy"], {
        cwd: apiRoot,
        env: { ...process.env, DATABASE_URL: url },
        stdio: "pipe",
    });
}

/**
 * Remove dados da empresa de teste MF3 para evitar colisões entre execuções persistidas.
 *
 * @param prisma - Cliente Prisma ligado à base de dados de teste.
 * @param companyId - Identificador da empresa de teste MF3.
 * @param userId - Identificador do utilizador de teste MF3.
 * @returns Promise resolvida depois de limpar os dados MF3 de teste.
 */
async function cleanupMf3Company(prisma, companyId, userId) {
    await prisma.bankReconciliationSuggestion.deleteMany({ where: { companyId } });
    await prisma.bankStatementLine.deleteMany({ where: { companyId } });
    await prisma.bankStatementImport.deleteMany({ where: { companyId } });
    await prisma.treasuryBalanceSnapshot.deleteMany({ where: { companyId } });
    await prisma.treasuryAccount.deleteMany({ where: { companyId } });
    await prisma.vatMapRun.deleteMany({ where: { companyId } });
    await prisma.cashflowForecastRun.deleteMany({ where: { companyId } });
    await prisma.businessImportRun.deleteMany({ where: { companyId } });
    await prisma.saftExportRun.deleteMany({ where: { companyId } });
    await prisma.operationalReportRun.deleteMany({ where: { companyId } });
    await prisma.executiveKpiRun.deleteMany({ where: { companyId } });
    await prisma.retentionHold.deleteMany({ where: { companyId } });
    await prisma.auditLog.deleteMany({ where: { companyId } });
    await prisma.receipt.deleteMany({ where: { companyId } });
    await prisma.payment.deleteMany({ where: { companyId } });
    await prisma.journalEntryLine.deleteMany({
        where: { journalEntry: { companyId } },
    });
    await prisma.journalEntry.deleteMany({ where: { companyId } });
    await prisma.saleDocumentLine.deleteMany({
        where: { saleDocument: { companyId } },
    });
    await prisma.purchaseDocumentLine.deleteMany({
        where: { purchaseDocument: { companyId } },
    });
    await prisma.saleDocument.deleteMany({ where: { companyId } });
    await prisma.purchaseDocument.deleteMany({ where: { companyId } });
    await prisma.stockBalance.deleteMany({ where: { companyId } });
    await prisma.warehouse.deleteMany({ where: { companyId } });
    await prisma.item.deleteMany({ where: { companyId } });
    await prisma.vatRate.deleteMany({ where: { companyId } });
    await prisma.customer.deleteMany({ where: { companyId } });
    await prisma.supplier.deleteMany({ where: { companyId } });
    await prisma.companyProfile.deleteMany({ where: { companyId } });
    await prisma.companyMembership.deleteMany({ where: { companyId } });
    await prisma.company.deleteMany({ where: { id: companyId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
}

/**
 * Documenta a função seedMf3Baseline no contexto deste módulo.
 *
 * @param prisma - Cliente Prisma ligado à base de dados de teste.
 * @param prefix - Prefixo usado para gerar identificadores únicos de teste.
 * @returns Dados base MF3 criados para os testes persistidos.
 */
async function seedMf3Baseline(prisma, prefix) {
    const user = await prisma.user.create({
        data: {
            email: `${prefix}@example.test`,
            name: "Utilizador MF3",
            passwordHash: "integration-test-hash",
        },
    });
    const company = await prisma.company.create({
        data: { name: `Empresa ${prefix}`, nif: null },
    });
    await prisma.companyMembership.create({
        data: { userId: user.id, companyId: company.id, role: "ADMIN" },
    });
    await prisma.companyProfile.create({
        data: {
            companyId: company.id,
            legalName: `Empresa ${prefix}, Lda`,
            nif: `NIF-${prefix}`,
            addressLine1: "Rua da Integração 1",
            postalCode: "1000-001",
            city: "Lisboa",
            currency: "EUR",
            fiscalYearStartMonth: 1,
            fiscalYearStartDay: 1,
        },
    });

    const vatRate = await prisma.vatRate.create({
        data: {
            companyId: company.id,
            code: `${prefix}-IVA23`,
            description: "IVA normal",
            rateBps: 2300,
            type: "NORMAL",
        },
    });
    const customer = await prisma.customer.create({
        data: { companyId: company.id, name: `Cliente ${prefix}`, nif: null },
    });
    const supplier = await prisma.supplier.create({
        data: { companyId: company.id, name: `Fornecedor ${prefix}`, nif: null },
    });
    const item = await prisma.item.create({
        data: {
            companyId: company.id,
            sku: `${prefix}-ART`,
            name: "Artigo MF3",
            type: "PRODUCT",
            costCents: 400,
            priceCents: 1000,
            vatRateBps: 2300,
        },
    });
    const warehouse = await prisma.warehouse.create({
        data: { companyId: company.id, code: `${prefix}-WH`, name: "Principal" },
    });
    await prisma.stockBalance.create({
        data: {
            companyId: company.id,
            itemId: item.id,
            warehouseId: warehouse.id,
            quantity: "2.000",
        },
    });

    const saleDocument = await prisma.saleDocument.create({
        data: {
            companyId: company.id,
            customerId: customer.id,
            kind: "INVOICE",
            status: "ISSUED",
            number: `${prefix}-FT001`,
            issuedAt: new Date("2026-06-01"),
            dueDate: new Date("2026-06-10"),
            subtotalCents: 1000,
            vatCents: 230,
            totalCents: 1230,
            createdById: user.id,
            lines: {
                create: {
                    itemId: item.id,
                    vatRateId: vatRate.id,
                    description: "Venda MF3",
                    quantity: 1,
                    unitPriceCents: 1000,
                    subtotalCents: 1000,
                    vatCents: 230,
                    totalCents: 1230,
                },
            },
        },
    });
    const purchaseDocument = await prisma.purchaseDocument.create({
        data: {
            companyId: company.id,
            supplierId: supplier.id,
            kind: "SUPPLIER_INVOICE",
            status: "APPROVED",
            supplierNumber: `${prefix}-FC001`,
            issuedAt: new Date("2026-06-02"),
            dueDate: new Date("2026-06-12"),
            subtotalCents: 400,
            vatCents: 92,
            totalCents: 492,
            createdById: user.id,
            lines: {
                create: {
                    itemId: item.id,
                    vatRateId: vatRate.id,
                    description: "Compra MF3",
                    quantity: 1,
                    unitCostCents: 400,
                    subtotalCents: 400,
                    vatCents: 92,
                    totalCents: 492,
                },
            },
        },
    });
    await prisma.journalEntry.createMany({
        data: [
            {
                companyId: company.id,
                source: "SALE",
                sourceId: saleDocument.id,
                entryDate: saleDocument.issuedAt,
                description: "Venda MF3",
                createdById: user.id,
            },
            {
                companyId: company.id,
                source: "PURCHASE",
                sourceId: purchaseDocument.id,
                entryDate: purchaseDocument.issuedAt,
                description: "Compra MF3",
                createdById: user.id,
            },
        ],
    });
    await prisma.receipt.create({
        data: {
            companyId: company.id,
            saleDocumentId: saleDocument.id,
            amountCents: 1230,
            receivedAt: new Date("2026-06-03"),
            method: "BANK_TRANSFER",
            reference: `${prefix}-REC`,
            createdById: user.id,
        },
    });
    await prisma.payment.create({
        data: {
            companyId: company.id,
            purchaseDocumentId: purchaseDocument.id,
            amountCents: 492,
            paidAt: new Date("2026-06-04"),
            method: "BANK_TRANSFER",
            reference: `${prefix}-PAY`,
            createdById: user.id,
        },
    });

    return { user, company, saleDocument, purchaseDocument };
}

test(
    "MF3: runs persistem dados reais e preservam integridade de extratos",
    {
        skip: skipPersistenceTests
            ? "Skip explícito por OPSA_SKIP_PERSISTENCE_TESTS=true."
            : false,
    },
    async () => {
        const databaseUrl = requireTestDatabaseUrl();
        assertSafeTestDatabaseUrl(databaseUrl);
        process.env.DATABASE_URL = databaseUrl;
        runMigrations(databaseUrl);

        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();
        const prefix = `mf3_${randomUUID().slice(0, 8)}`;
        let baseline;

        try {
            baseline = await seedMf3Baseline(prisma, prefix);
            const { user, company } = baseline;
            const fromDate = new Date("2026-06-01");
            const toDate = new Date("2026-06-30");
            const treasuryAccount = await createTreasuryAccount(prisma, {
                companyId: company.id,
                userId: user.id,
                input: {
                    type: "BANK",
                    name: `${prefix}-Banco`,
                    iban: "PT50000201231234567890154",
                    currency: "EUR",
                    initialBalanceCents: 5000,
                },
            });

            const statement = await importBankStatement(prisma, {
                companyId: company.id,
                userId: user.id,
                input: {
                    treasuryAccountId: treasuryAccount.id,
                    fileName: `${prefix}.csv`,
                    fileBuffer: Buffer.from(
                        "data;descricao;referencia;valor\n" +
                            `2026-06-03;Recebimento;${prefix}-REC;12,30\n` +
                            `2026-06-03;Recebimento;${prefix}-REC;12,30`,
                        "utf8",
                    ),
                },
            });

            assert.equal(statement.import.status, "PARTIAL");
            assert.equal(statement.import.acceptedLines, 1);
            assert.equal(statement.import.rejectedLines, 1);
            assert.equal(statement.suggestions[0].status, "SUGGESTED");

            const [vatMap, forecast, businessImport, operational, kpis] =
                await Promise.all([
                    buildVatMap(prisma, { companyId: company.id, userId: user.id, fromDate, toDate }),
                    buildCashflowForecast(prisma, { companyId: company.id, userId: user.id, fromDate, toDate }),
                    importBusinessData(prisma, {
                        companyId: company.id,
                        userId: user.id,
                        input: {
                            type: "CUSTOMERS",
                            fileName: `${prefix}-customers.csv`,
                            fileBuffer: Buffer.from(
                                "name;nif;email\nCliente Importado;;importado@example.test",
                            ),
                        },
                    }),
                    buildOperationalReport(prisma, { companyId: company.id, userId: user.id, fromDate, toDate }),
                    buildExecutiveKpis(prisma, { companyId: company.id, userId: user.id, fromDate, toDate }),
                ]);

            await assert.rejects(
                () =>
                    createSaftExport(
                        prisma,
                        {},
                        {
                            companyId: company.id,
                            userId: user.id,
                            type: "FULL",
                            fiscalPeriodId: "period-not-used-while-disabled",
                            featureFlag: false,
                        },
                    ),
                { code: "SAFT_EXPORT_DISABLED", status: 503 },
            );

            assert.equal(vatMap.vatBalanceCents, 138);
            assert.equal(forecast.openingBalanceCents, 5000);
            assert.equal(businessImport.acceptedRows, 1);
            assert.equal(operational.margin.totalCents, 738);
            assert.equal(kpis.ebitdaCents, 738);

            assert.equal(await prisma.vatMapRun.count({ where: { companyId: company.id } }), 1);
            assert.equal(
                await prisma.retentionHold.count({
                    where: {
                        companyId: company.id,
                        entity: { in: ["VatMapRun", "AuditLog"] },
                    },
                }),
                2,
            );
            assert.equal(
                await prisma.auditLog.count({
                    where: {
                        companyId: company.id,
                        action: "VAT_MAP_GENERATED",
                        entity: "VatMapRun",
                        entityId: vatMap.runId,
                    },
                }),
                1,
            );
            assert.equal(await prisma.bankStatementLine.count({ where: { companyId: company.id } }), 1);
            assert.equal(await prisma.cashflowForecastRun.count({ where: { companyId: company.id } }), 1);
            assert.equal(await prisma.businessImportRun.count({ where: { companyId: company.id } }), 1);
            assert.equal(await prisma.saftExportRun.count({ where: { companyId: company.id } }), 0);
            assert.equal(await prisma.operationalReportRun.count({ where: { companyId: company.id } }), 1);
            assert.equal(await prisma.executiveKpiRun.count({ where: { companyId: company.id } }), 1);
            const generatedRunAudits = await prisma.auditLog.findMany({
                where: {
                    companyId: company.id,
                    action: {
                        in: [
                            "CASHFLOW_FORECAST_GENERATED",
                            "OPERATIONAL_REPORT_GENERATED",
                            "EXECUTIVE_KPIS_GENERATED",
                        ],
                    },
                },
                orderBy: { action: "asc" },
            });
            assert.equal(generatedRunAudits.length, 3);
            assert.equal(
                generatedRunAudits.every((audit) => audit.userId === user.id),
                true,
            );
            assert.equal(
                generatedRunAudits.every((audit) =>
                    Object.keys(audit.details ?? {}).every((key) =>
                        ["sourceCount", "projectedDayCount"].includes(key),
                    ),
                ),
                true,
            );
        } finally {
            if (baseline) {
                await cleanupMf3Company(prisma, baseline.company.id, baseline.user.id);
            }
            await prisma.$disconnect();
        }
    },
);
