/**
 * @file Testes de integração persistida dos fluxos críticos da MF2.
 * 
 * Estes testes só correm quando `TEST_DATABASE_URL` aponta para uma base
 * PostgreSQL efémera/segura. Sem essa variável, a suite falha para não deixar o
 * gate de integração passar sem persistência real. Para desenvolvimento local
 * sem base disponível, o skip tem de ser explícito via
 * `OPSA_SKIP_PERSISTENCE_TESTS=true`.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
    addManualJournalAttachment,
    createManualJournal,
    updateManualJournal,
} from "../../src/modules/accounting/manualJournalService.js";
import {
    buildTrialBalance,
} from "../../src/modules/accounting-reports/accountingReportService.js";
import {
    buildBalanceSheet,
    buildIncomeStatement,
} from "../../src/modules/financial-statements/financialStatementService.js";
import { previewFifoCost } from "../../src/modules/inventory/fifoCostService.js";
import {
    createInventoryCount,
    postInventoryCount,
} from "../../src/modules/inventory/inventoryCountService.js";
import {
    createStockMovement,
} from "../../src/modules/inventory/stockMovementService.js";
import {
    listStockAlerts,
    saveStockAlertSetting,
} from "../../src/modules/inventory/stockAlertService.js";
import {
    approvePurchaseDocument,
    listPurchaseApprovalHistory,
    rejectPurchaseDocument,
} from "../../src/modules/purchase-approval/purchaseApprovalService.js";

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
            "Definir TEST_DATABASE_URL para correr integração persistida da MF2. " +
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
 * Remove dados da empresa de teste MF2 para deixar a base pronta para uma nova execução.
 *
 * @param prisma - Cliente Prisma ligado à base de dados de teste.
 * @param companyId - Identificador da empresa de teste.
 * @param userId - Identificador do utilizador de teste.
 * @returns Promise resolvida depois de limpar os dados MF2 de teste.
 */
async function cleanupCompany(prisma, companyId, userId) {
    await prisma.stockCostConsumption.deleteMany({ where: { companyId } });
    await prisma.stockCostLayer.deleteMany({ where: { companyId } });
    await prisma.stockMovement.deleteMany({ where: { companyId } });
    await prisma.stockBalance.deleteMany({ where: { companyId } });
    await prisma.stockAlertSetting.deleteMany({ where: { companyId } });
    await prisma.inventoryCountLine.deleteMany({
        where: { inventoryCount: { companyId } },
    });
    await prisma.inventoryCount.deleteMany({ where: { companyId } });
    await prisma.journalAttachment.deleteMany({ where: { companyId } });
    await prisma.journalEntryLine.deleteMany({
        where: { journalEntry: { companyId } },
    });
    await prisma.journalEntry.deleteMany({ where: { companyId } });
    await prisma.purchaseApprovalHistory.deleteMany({ where: { companyId } });
    await prisma.purchaseDocumentLine.deleteMany({
        where: { purchaseDocument: { companyId } },
    });
    await prisma.purchaseDocument.deleteMany({ where: { companyId } });
    await prisma.auditLog.deleteMany({ where: { companyId } });
    await prisma.fiscalPeriod.deleteMany({ where: { companyId } });
    await prisma.account.deleteMany({ where: { companyId } });
    await prisma.vatRate.deleteMany({ where: { companyId } });
    await prisma.item.deleteMany({ where: { companyId } });
    await prisma.warehouseLocation.deleteMany({
        where: { warehouse: { companyId } },
    });
    await prisma.warehouse.deleteMany({ where: { companyId } });
    await prisma.supplier.deleteMany({ where: { companyId } });
    await prisma.companyMembership.deleteMany({ where: { companyId } });
    await prisma.company.deleteMany({ where: { id: companyId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
}

/**
 * Documenta a função seedMf2Baseline no contexto deste módulo.
 *
 * @param prisma - Cliente Prisma ligado à base de dados de teste.
 * @param prefix - Prefixo usado para gerar identificadores únicos de teste.
 * @returns Dados base MF2 criados para os testes persistidos.
 */
async function seedMf2Baseline(prisma, prefix) {
    const user = await prisma.user.create({
        data: {
            email: `${prefix}@example.test`,
            name: "Utilizador MF2",
            passwordHash: "integration-test-hash",
        },
    });
    const company = await prisma.company.create({
        data: { name: `Empresa ${prefix}`, nif: null },
    });
    await prisma.companyMembership.create({
        data: { userId: user.id, companyId: company.id, role: "ADMIN" },
    });
    await prisma.fiscalPeriod.create({
        data: {
            companyId: company.id,
            name: `${prefix}-2026`,
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-12-31"),
            status: "OPEN",
        },
    });
    const [cashAccount, revenueAccount] = await Promise.all([
        prisma.account.create({
            data: {
                companyId: company.id,
                code: "11",
                name: "Caixa",
                level: 1,
            },
        }),
        prisma.account.create({
            data: {
                companyId: company.id,
                code: "71",
                name: "Vendas e serviços",
                level: 1,
            },
        }),
    ]);
    const vatRate = await prisma.vatRate.create({
        data: {
            companyId: company.id,
            code: `${prefix}-IVA23`,
            description: "IVA normal",
            rateBps: 2300,
            type: "NORMAL",
        },
    });
    const item = await prisma.item.create({
        data: {
            companyId: company.id,
            sku: `${prefix}-ART`,
            name: "Artigo integração MF2",
            type: "PRODUCT",
            costCents: 100,
            priceCents: 150,
            vatRateBps: 2300,
        },
    });
    const [warehouseA, warehouseB] = await Promise.all([
        prisma.warehouse.create({
            data: {
                companyId: company.id,
                code: `${prefix}-A`,
                name: `Armazém A ${prefix}`,
            },
        }),
        prisma.warehouse.create({
            data: {
                companyId: company.id,
                code: `${prefix}-B`,
                name: `Armazém B ${prefix}`,
            },
        }),
    ]);
    const supplier = await prisma.supplier.create({
        data: {
            companyId: company.id,
            name: `Fornecedor ${prefix}`,
            nif: null,
        },
    });

    return {
        user,
        company,
        cashAccount,
        revenueAccount,
        vatRate,
        item,
        warehouseA,
        warehouseB,
        supplier,
    };
}

test(
    "MF2: fluxos críticos persistem dados reais e preservam companyId",
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
        const prefix = `mf2_${randomUUID().slice(0, 8)}`;
        const storageRoot = await mkdtemp(path.join(tmpdir(), "opsa-mf2-integration-"));
        let baseline;

        try {
            baseline = await seedMf2Baseline(prisma, prefix);
            const {
                user,
                company,
                cashAccount,
                revenueAccount,
                vatRate,
                item,
                warehouseA,
                warehouseB,
                supplier,
            } = baseline;

            const purchaseDocument = await prisma.purchaseDocument.create({
                data: {
                    companyId: company.id,
                    supplierId: supplier.id,
                    kind: "SUPPLIER_INVOICE",
                    supplierNumber: `${prefix}-FT001`,
                    issuedAt: new Date("2026-03-01"),
                    subtotalCents: 1000,
                    vatCents: 230,
                    totalCents: 1230,
                    createdById: user.id,
                    lines: {
                        create: {
                            itemId: item.id,
                            vatRateId: vatRate.id,
                            description: "Compra de teste",
                            quantity: 1,
                            unitCostCents: 1000,
                            subtotalCents: 1000,
                            vatCents: 230,
                            totalCents: 1230,
                        },
                    },
                },
            });

            await approvePurchaseDocument(
                prisma,
                company.id,
                user.id,
                purchaseDocument.id,
                { reason: "Aprovação de integração" },
            );
            await rejectPurchaseDocument(
                prisma,
                company.id,
                user.id,
                purchaseDocument.id,
                { reason: "Reprovação de integração" },
            );
            const approvalHistory = await listPurchaseApprovalHistory(
                prisma,
                company.id,
                purchaseDocument.id,
            );

            assert.deepEqual(
                approvalHistory.map((entry) => entry.action),
                ["APPROVED", "REJECTED"],
            );
            assert.equal(
                approvalHistory.every((entry) => entry.companyId === company.id),
                true,
            );

            await createStockMovement(prisma, company.id, user.id, {
                type: "ENTRY",
                itemId: item.id,
                quantity: 10,
                unitCostCents: 100,
                toWarehouseId: warehouseA.id,
                reason: "Entrada inicial",
            });
            const fifoPreview = await previewFifoCost(prisma, {
                companyId: company.id,
                itemId: item.id,
                warehouseId: warehouseA.id,
                quantity: 4,
            });
            assert.equal(fifoPreview.totalCostCents, 400);

            await createStockMovement(prisma, company.id, user.id, {
                type: "TRANSFER",
                itemId: item.id,
                quantity: 3,
                fromWarehouseId: warehouseA.id,
                toWarehouseId: warehouseB.id,
                reason: "Transferência de integração",
            });

            const balanceAAfterTransfer = await prisma.stockBalance.findUnique({
                where: {
                    companyId_itemId_warehouseId: {
                        companyId: company.id,
                        itemId: item.id,
                        warehouseId: warehouseA.id,
                    },
                },
            });
            const balanceBAfterTransfer = await prisma.stockBalance.findUnique({
                where: {
                    companyId_itemId_warehouseId: {
                        companyId: company.id,
                        itemId: item.id,
                        warehouseId: warehouseB.id,
                    },
                },
            });
            assert.equal(Number(balanceAAfterTransfer.quantity), 7);
            assert.equal(Number(balanceBAfterTransfer.quantity), 3);

            const count = await createInventoryCount(prisma, company.id, user.id, {
                warehouseId: warehouseA.id,
                reason: "Contagem de integração",
                countedAt: "2026-03-02",
                lines: [{ itemId: item.id, countedQuantity: 5 }],
            });
            const postedCount = await postInventoryCount(
                prisma,
                company.id,
                user.id,
                count.id,
            );
            const balanceAAfterCount = await prisma.stockBalance.findUnique({
                where: {
                    companyId_itemId_warehouseId: {
                        companyId: company.id,
                        itemId: item.id,
                        warehouseId: warehouseA.id,
                    },
                },
            });
            assert.equal(postedCount.status, "POSTED");
            assert.equal(Number(balanceAAfterCount.quantity), 5);

            await saveStockAlertSetting(prisma, {
                companyId: company.id,
                userId: user.id,
                input: {
                    itemId: item.id,
                    warehouseId: warehouseA.id,
                    minQuantity: 6,
                    stoppedAfterDays: 30,
                },
            });
            const alerts = await listStockAlerts(prisma, company.id);
            assert.equal(alerts.some((alert) => alert.type === "LOW_STOCK"), true);

            const manualJournal = await createManualJournal(
                prisma,
                company.id,
                user.id,
                {
                    entryDate: "2026-03-03",
                    description: "Lançamento integração",
                    lines: [
                        { accountId: cashAccount.id, debitCents: 1000 },
                        { accountId: revenueAccount.id, creditCents: 1000 },
                    ],
                },
            );
            const updatedManualJournal = await updateManualJournal(
                prisma,
                company.id,
                user.id,
                manualJournal.id,
                {
                    entryDate: "2026-03-04",
                    description: "Lançamento integração editado",
                    lines: [
                        { accountId: cashAccount.id, debitCents: 1200 },
                        { accountId: revenueAccount.id, creditCents: 1200 },
                    ],
                },
            );
            assert.equal(updatedManualJournal.lines.length, 2);

            const attachmentContent = Buffer.from("%PDF-1.4 integração MF2");
            const attachment = await addManualJournalAttachment(
                prisma,
                company.id,
                user.id,
                manualJournal.id,
                {
                    fileName: "comprovativo.pdf",
                    mimeType: "application/pdf",
                    sizeBytes: attachmentContent.length,
                    contentBase64: attachmentContent.toString("base64"),
                },
                { storageRoot },
            );
            const storedAttachment = await readFile(
                path.join(storageRoot, ...attachment.storageKey.split("/")),
            );
            assert.equal(storedAttachment.equals(attachmentContent), true);

            const range = {
                companyId: company.id,
                from: new Date("2026-01-01"),
                to: new Date("2026-12-31"),
            };
            const trialBalance = await buildTrialBalance(prisma, range);
            const incomeStatement = await buildIncomeStatement(prisma, range);
            const balanceSheet = await buildBalanceSheet(prisma, range);

            assert.equal(trialBalance.totals.balanceCents, 0);
            assert.equal(incomeStatement.netIncomeCents, 1200);
            assert.equal(typeof balanceSheet.checkCents, "number");
        } finally {
            if (baseline) {
                await cleanupCompany(prisma, baseline.company.id, baseline.user.id);
            }
            await prisma.$disconnect();
            await rm(storageRoot, { force: true, recursive: true });
        }
    },
);
