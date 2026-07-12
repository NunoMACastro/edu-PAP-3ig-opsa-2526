/**
 * @file Provas PostgreSQL reais das invariantes concorrentes críticas da auditoria E2E.
 *
 * A suite usa transações e advisory locks PostgreSQL reais através dos services
 * públicos. Sem `TEST_DATABASE_URL` falha de propósito, salvo quando o operador
 * declara explicitamente o skip local já suportado pelas restantes suites de
 * persistência com `OPSA_SKIP_PERSISTENCE_TESTS=true`.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { createManualJournal } from "../../src/modules/accounting/manualJournalService.js";
import {
    updateCompanyUserRole,
} from "../../src/modules/company-users/companyUserService.js";
import {
    closeFiscalPeriod,
} from "../../src/modules/fiscal-periods/fiscalPeriodService.js";
import {
    createInventoryCount,
    postInventoryCount,
} from "../../src/modules/inventory/inventoryCountService.js";
import {
    createStockMovement,
} from "../../src/modules/inventory/stockMovementService.js";
import {
    approvePurchaseDocument,
    rejectPurchaseDocument,
} from "../../src/modules/purchase-approval/purchaseApprovalService.js";

const apiRoot = fileURLToPath(new URL("../..", import.meta.url));
const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const skipPersistenceTests = process.env.OPSA_SKIP_PERSISTENCE_TESTS === "true";

/**
 * Exige uma base de dados de integração explícita.
 *
 * @returns {string} URL PostgreSQL configurada para os testes.
 */
function requireTestDatabaseUrl() {
    if (!testDatabaseUrl) {
        throw new Error(
            "Definir TEST_DATABASE_URL para provar as invariantes concorrentes. " +
                "A base deve ser efémera e o nome deve conter test, audit ou ci. " +
                "O skip local, quando deliberado, exige OPSA_SKIP_PERSISTENCE_TESTS=true.",
        );
    }
    return testDatabaseUrl;
}

/**
 * Impede execução destrutiva contra uma base cujo nome não indique uso de teste.
 *
 * @param {string} url - URL recebida em TEST_DATABASE_URL.
 * @returns {void}
 */
function assertSafeTestDatabaseUrl(url) {
    const parsed = new URL(url);
    const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    if (!/(^|[_-])(test|audit|ci)([_-]|$)/i.test(databaseName)) {
        throw new Error(
            "TEST_DATABASE_URL deve apontar para uma base efémera cujo nome contenha test, audit ou ci.",
        );
    }
}

/**
 * Aplica todas as migrations antes de iniciar as corridas reais.
 *
 * @param {string} url - URL segura da base descartável.
 * @returns {void}
 */
function runMigrations(url) {
    execFileSync("npx", ["prisma", "migrate", "deploy"], {
        cwd: apiRoot,
        env: { ...process.env, DATABASE_URL: url },
        stdio: "pipe",
    });
}

/**
 * Confirma que um resultado concorrente tem exatamente um vencedor e um conflito 409.
 *
 * @param {PromiseSettledResult<unknown>[]} results - Resultados de duas operações.
 * @param {string[]} expectedConflictCodes - Códigos de domínio admitidos para o conflito.
 * @returns {{ fulfilled: PromiseFulfilledResult<unknown>, rejected: PromiseRejectedResult }} Par vencedor/conflito.
 */
function assertOneWinnerAndOneConflict(results, expectedConflictCodes) {
    const fulfilled = results.filter((result) => result.status === "fulfilled");
    const rejected = results.filter((result) => result.status === "rejected");

    assert.equal(fulfilled.length, 1, "a corrida deve ter exatamente um vencedor");
    assert.equal(rejected.length, 1, "a corrida deve ter exatamente um conflito");
    assert.equal(rejected[0].reason?.status, 409);
    assert.equal(
        expectedConflictCodes.includes(rejected[0].reason?.code),
        true,
        `código inesperado: ${rejected[0].reason?.code ?? "sem código"}`,
    );

    return { fulfilled: fulfilled[0], rejected: rejected[0] };
}

/**
 * Cria utilizador, empresa e membership ADMIN mínimos para um cenário isolado.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente da base de teste.
 * @param {string} prefix - Prefixo único do cenário.
 * @returns {Promise<{ user: object, company: object }>} Contexto criado.
 */
async function seedCompany(prisma, prefix) {
    const user = await prisma.user.create({
        data: {
            email: `${prefix}@example.test`,
            name: `Ator ${prefix}`,
            passwordHash: "integration-test-hash",
        },
    });
    const company = await prisma.company.create({
        data: { name: `Empresa ${prefix}` },
    });
    await prisma.companyMembership.create({
        data: {
            companyId: company.id,
            userId: user.id,
            role: "ADMIN",
        },
    });
    return { user, company };
}

/**
 * Remove, por ordem de dependências, todos os dados criados por um cenário.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente da base de teste.
 * @param {string} companyId - Empresa isolada do cenário.
 * @param {string[]} userIds - Utilizadores isolados do cenário.
 * @returns {Promise<void>}
 */
async function cleanupScenario(prisma, companyId, userIds) {
    await prisma.inventoryCountLine.deleteMany({
        where: { inventoryCount: { companyId } },
    });
    await prisma.inventoryCount.deleteMany({ where: { companyId } });
    await prisma.stockCostConsumption.deleteMany({ where: { companyId } });
    await prisma.stockCostLayer.deleteMany({ where: { companyId } });
    await prisma.stockMovement.deleteMany({ where: { companyId } });
    await prisma.stockBalance.deleteMany({ where: { companyId } });
    await prisma.purchaseApprovalHistory.deleteMany({ where: { companyId } });
    await prisma.purchaseDocumentLine.deleteMany({
        where: { purchaseDocument: { companyId } },
    });
    await prisma.purchaseDocument.deleteMany({ where: { companyId } });
    await prisma.journalEntryRevision.deleteMany({ where: { companyId } });
    await prisma.journalAttachment.deleteMany({ where: { companyId } });
    await prisma.journalEntryLine.deleteMany({
        where: { journalEntry: { companyId } },
    });
    await prisma.retentionHold.deleteMany({ where: { companyId } });
    await prisma.journalEntry.deleteMany({ where: { companyId } });
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
    await prisma.companySubscription.deleteMany({ where: { companyId } });
    await prisma.companyMembership.deleteMany({ where: { companyId } });
    await prisma.company.deleteMany({ where: { id: companyId } });
    await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.passwordResetToken.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}

test(
    "E2E concorrência: PostgreSQL preserva stock, workflows, fecho fiscal e último ADMIN",
    {
        skip: skipPersistenceTests
            ? "Skip local explícito por OPSA_SKIP_PERSISTENCE_TESTS=true; não constitui PASS do gate."
            : false,
    },
    async (t) => {
        const databaseUrl = requireTestDatabaseUrl();
        assertSafeTestDatabaseUrl(databaseUrl);
        process.env.DATABASE_URL = databaseUrl;
        runMigrations(databaseUrl);

        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();

        try {
            await t.test("duas saídas de 4 sobre stock 5 deixam saldo 1 e uma recebe 409", async () => {
                const prefix = `race_stock_${randomUUID().slice(0, 8)}`;
                const { user, company } = await seedCompany(prisma, prefix);
                const item = await prisma.item.create({
                    data: {
                        companyId: company.id,
                        sku: `${prefix}-ITEM`,
                        name: "Artigo concorrente",
                        type: "PRODUCT",
                        costCents: 125,
                        priceCents: 200,
                        vatRateBps: 2300,
                    },
                });
                const warehouse = await prisma.warehouse.create({
                    data: {
                        companyId: company.id,
                        code: `${prefix}-WH`,
                        name: `Armazém ${prefix}`,
                    },
                });

                try {
                    await createStockMovement(prisma, company.id, user.id, {
                        type: "ENTRY",
                        itemId: item.id,
                        quantity: 5,
                        unitCostCents: 125,
                        toWarehouseId: warehouse.id,
                        reason: "Entrada para a prova concorrente",
                    });

                    const exit = () => createStockMovement(
                        prisma,
                        company.id,
                        user.id,
                        {
                            type: "EXIT",
                            itemId: item.id,
                            quantity: 4,
                            fromWarehouseId: warehouse.id,
                            reason: "Saída concorrente de quatro unidades",
                        },
                    );
                    const results = await Promise.allSettled([exit(), exit()]);
                    assertOneWinnerAndOneConflict(results, ["INSUFFICIENT_STOCK"]);

                    const [balance, exits, consumptions, layers] = await Promise.all([
                        prisma.stockBalance.findUnique({
                            where: {
                                companyId_itemId_warehouseId: {
                                    companyId: company.id,
                                    itemId: item.id,
                                    warehouseId: warehouse.id,
                                },
                            },
                        }),
                        prisma.stockMovement.findMany({
                            where: { companyId: company.id, type: "EXIT" },
                        }),
                        prisma.stockCostConsumption.findMany({
                            where: { companyId: company.id },
                        }),
                        prisma.stockCostLayer.findMany({
                            where: { companyId: company.id },
                        }),
                    ]);

                    assert.equal(Number(balance.quantity), 1);
                    assert.equal(exits.length, 1);
                    assert.equal(
                        consumptions.reduce(
                            (sum, consumption) => sum + Number(consumption.quantity),
                            0,
                        ),
                        4,
                    );
                    assert.equal(
                        layers.reduce(
                            (sum, layer) => sum + Number(layer.remainingQuantity),
                            0,
                        ),
                        1,
                    );
                } finally {
                    await cleanupScenario(prisma, company.id, [user.id]);
                }
            });

            await t.test("duas publicações da mesma contagem criam um único ajuste", async () => {
                const prefix = `race_count_${randomUUID().slice(0, 8)}`;
                const { user, company } = await seedCompany(prisma, prefix);
                const item = await prisma.item.create({
                    data: {
                        companyId: company.id,
                        sku: `${prefix}-ITEM`,
                        name: "Artigo da contagem concorrente",
                        type: "PRODUCT",
                        costCents: 125,
                        priceCents: 200,
                        vatRateBps: 2300,
                    },
                });
                const warehouse = await prisma.warehouse.create({
                    data: {
                        companyId: company.id,
                        code: `${prefix}-WH`,
                        name: `Armazém ${prefix}`,
                    },
                });

                try {
                    await createStockMovement(prisma, company.id, user.id, {
                        type: "ENTRY",
                        itemId: item.id,
                        quantity: 5,
                        unitCostCents: 125,
                        toWarehouseId: warehouse.id,
                        reason: "Entrada para a contagem concorrente",
                    });
                    const count = await createInventoryCount(
                        prisma,
                        company.id,
                        user.id,
                        {
                            warehouseId: warehouse.id,
                            countedAt: "2026-07-10",
                            reason: "Contagem física concorrente",
                            lines: [{ itemId: item.id, countedQuantity: 4 }],
                        },
                    );
                    await createStockMovement(prisma, company.id, user.id, {
                        type: "ENTRY",
                        itemId: item.id,
                        quantity: 2,
                        unitCostCents: 125,
                        toWarehouseId: warehouse.id,
                        reason: "Entrada posterior ao snapshot da contagem",
                    });
                    const results = await Promise.allSettled([
                        postInventoryCount(prisma, company.id, user.id, count.id),
                        postInventoryCount(prisma, company.id, user.id, count.id),
                    ]);
                    assertOneWinnerAndOneConflict(results, [
                        "INVENTORY_COUNT_ALREADY_POSTED",
                        "STALE_STATE",
                    ]);

                    const [persisted, movements, balance, audits] = await Promise.all([
                        prisma.inventoryCount.findUnique({ where: { id: count.id } }),
                        prisma.stockMovement.findMany({
                            where: {
                                companyId: company.id,
                                sourceType: "INVENTORY_COUNT",
                                sourceId: count.id,
                            },
                        }),
                        prisma.stockBalance.findUnique({
                            where: {
                                companyId_itemId_warehouseId: {
                                    companyId: company.id,
                                    itemId: item.id,
                                    warehouseId: warehouse.id,
                                },
                            },
                        }),
                        prisma.auditLog.findMany({
                            where: {
                                companyId: company.id,
                                action: "INVENTORY_COUNT_POSTED",
                                entityId: count.id,
                            },
                        }),
                    ]);
                    assert.equal(persisted.status, "POSTED");
                    assert.equal(movements.length, 1);
                    assert.equal(Number(balance.quantity), 4);
                    assert.equal(audits.length, 1);
                } finally {
                    await cleanupScenario(prisma, company.id, [user.id]);
                }
            });

            await t.test("aprovação e rejeição concorrentes persistem uma só decisão", async () => {
                const prefix = `race_approval_${randomUUID().slice(0, 8)}`;
                const { user, company } = await seedCompany(prisma, prefix);
                const supplier = await prisma.supplier.create({
                    data: { companyId: company.id, name: `Fornecedor ${prefix}` },
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
                const item = await prisma.item.create({
                    data: {
                        companyId: company.id,
                        sku: `${prefix}-ITEM`,
                        name: "Artigo aprovação",
                        type: "PRODUCT",
                        costCents: 1000,
                        priceCents: 1230,
                        vatRateBps: 2300,
                    },
                });
                const purchase = await prisma.purchaseDocument.create({
                    data: {
                        companyId: company.id,
                        supplierId: supplier.id,
                        kind: "SUPPLIER_INVOICE",
                        supplierNumber: `${prefix}-FT-1`,
                        issuedAt: new Date("2026-05-10T00:00:00.000Z"),
                        subtotalCents: 1000,
                        vatCents: 230,
                        totalCents: 1230,
                        createdById: user.id,
                        lines: {
                            create: {
                                itemId: item.id,
                                vatRateId: vatRate.id,
                                description: "Linha concorrente",
                                quantity: 1,
                                unitCostCents: 1000,
                                subtotalCents: 1000,
                                vatCents: 230,
                                totalCents: 1230,
                            },
                        },
                    },
                });

                try {
                    const results = await Promise.allSettled([
                        approvePurchaseDocument(
                            prisma,
                            company.id,
                            user.id,
                            purchase.id,
                            { reason: "Aprovação concorrente" },
                        ),
                        rejectPurchaseDocument(
                            prisma,
                            company.id,
                            user.id,
                            purchase.id,
                            { reason: "Rejeição concorrente validada" },
                        ),
                    ]);
                    assertOneWinnerAndOneConflict(results, ["STALE_STATE"]);

                    const [persisted, history, audit] = await Promise.all([
                        prisma.purchaseDocument.findUnique({ where: { id: purchase.id } }),
                        prisma.purchaseApprovalHistory.findMany({
                            where: {
                                companyId: company.id,
                                purchaseDocumentId: purchase.id,
                            },
                        }),
                        prisma.auditLog.findMany({
                            where: {
                                companyId: company.id,
                                entity: "PurchaseDocument",
                                entityId: purchase.id,
                            },
                        }),
                    ]);

                    assert.equal(["APPROVED", "REJECTED"].includes(persisted.status), true);
                    assert.equal(history.length, 1);
                    assert.equal(audit.length, 1);
                    assert.equal(history[0].action, persisted.status);
                } finally {
                    await cleanupScenario(prisma, company.id, [user.id]);
                }
            });

            await t.test("fecho fiscal concorrente nunca permite lançamento posterior ao fecho", async () => {
                const prefix = `race_fiscal_${randomUUID().slice(0, 8)}`;
                const { user, company } = await seedCompany(prisma, prefix);
                const period = await prisma.fiscalPeriod.create({
                    data: {
                        companyId: company.id,
                        name: `${prefix}-2026`,
                        startDate: new Date("2026-01-01T00:00:00.000Z"),
                        endDate: new Date("2026-12-31T23:59:59.999Z"),
                        status: "OPEN",
                    },
                });
                const [debitAccount, creditAccount] = await Promise.all([
                    prisma.account.create({
                        data: {
                            companyId: company.id,
                            code: `${prefix}-11`,
                            name: "Caixa",
                            level: 1,
                        },
                    }),
                    prisma.account.create({
                        data: {
                            companyId: company.id,
                            code: `${prefix}-71`,
                            name: "Rendimentos",
                            level: 1,
                        },
                    }),
                ]);

                try {
                    const results = await Promise.allSettled([
                        closeFiscalPeriod(prisma, {
                            companyId: company.id,
                            periodId: period.id,
                            actorUserId: user.id,
                        }),
                        createManualJournal(prisma, company.id, user.id, {
                            entryDate: "2026-06-15",
                            description: "Lançamento concorrente com fecho",
                            lines: [
                                { accountId: debitAccount.id, debitCents: 500 },
                                { accountId: creditAccount.id, creditCents: 500 },
                            ],
                        }),
                    ]);

                    const closeResult = results[0];
                    const journalResult = results[1];
                    assert.equal(closeResult.status, "fulfilled");
                    if (journalResult.status === "rejected") {
                        assert.equal(journalResult.reason?.status, 409);
                        assert.equal(journalResult.reason?.code, "FISCAL_PERIOD_CLOSED");
                    }

                    const [closedPeriod, journals] = await Promise.all([
                        prisma.fiscalPeriod.findUnique({ where: { id: period.id } }),
                        prisma.journalEntry.findMany({
                            where: { companyId: company.id, source: "MANUAL" },
                            orderBy: { createdAt: "asc" },
                        }),
                    ]);
                    assert.equal(closedPeriod.status, "CLOSED");
                    assert.ok(closedPeriod.closedAt instanceof Date);
                    assert.equal(journals.length <= 1, true);
                    assert.equal(
                        journals.every(
                            (journal) => journal.createdAt.getTime() <= closedPeriod.closedAt.getTime(),
                        ),
                        true,
                        "não pode existir lançamento confirmado depois do instante de fecho",
                    );

                    const postCloseAttempt = await Promise.allSettled([
                        createManualJournal(prisma, company.id, user.id, {
                            entryDate: "2026-06-16",
                            description: "Tentativa inequivocamente posterior ao fecho",
                            lines: [
                                { accountId: debitAccount.id, debitCents: 700 },
                                { accountId: creditAccount.id, creditCents: 700 },
                            ],
                        }),
                    ]);
                    assert.equal(postCloseAttempt[0].status, "rejected");
                    assert.equal(postCloseAttempt[0].reason?.status, 409);
                    assert.equal(postCloseAttempt[0].reason?.code, "FISCAL_PERIOD_CLOSED");
                } finally {
                    await cleanupScenario(prisma, company.id, [user.id]);
                }
            });

            await t.test("GESTOR não consegue despromover ADMIN em chamadas concorrentes", async () => {
                const prefix = `race_admin_${randomUUID().slice(0, 8)}`;
                const { user: actor, company } = await seedCompany(prisma, prefix);
                await prisma.companyMembership.update({
                    where: {
                        userId_companyId: {
                            userId: actor.id,
                            companyId: company.id,
                        },
                    },
                    data: { role: "GESTOR" },
                });
                const admins = await Promise.all(
                    ["a", "b"].map(async (suffix) => {
                        const user = await prisma.user.create({
                            data: {
                                email: `${prefix}-${suffix}@example.test`,
                                name: `Admin ${suffix.toUpperCase()}`,
                                passwordHash: "integration-test-hash",
                            },
                        });
                        await prisma.companyMembership.create({
                            data: {
                                companyId: company.id,
                                userId: user.id,
                                role: "ADMIN",
                            },
                        });
                        return user;
                    }),
                );
                const userIds = [actor.id, ...admins.map((admin) => admin.id)];

                try {
                    const results = await Promise.allSettled(
                        admins.map((admin) => updateCompanyUserRole(prisma, {
                            companyId: company.id,
                            actorUserId: actor.id,
                            actorRole: "GESTOR",
                            targetUserId: admin.id,
                            role: "GESTOR",
                        })),
                    );
                    for (const result of results) {
                        assert.equal(result.status, "rejected");
                        assert.equal(result.reason?.status, 403);
                        assert.equal(result.reason?.code, "ADMIN_MEMBER_REQUIRES_ADMIN");
                    }

                    const [activeAdmins, memberships, audit] = await Promise.all([
                        prisma.companyMembership.count({
                            where: {
                                companyId: company.id,
                                role: "ADMIN",
                                isActive: true,
                            },
                        }),
                        prisma.companyMembership.findMany({
                            where: {
                                companyId: company.id,
                                userId: { in: admins.map((admin) => admin.id) },
                                isActive: true,
                            },
                        }),
                        prisma.auditLog.findMany({
                            where: {
                                companyId: company.id,
                                action: "permissions.update",
                            },
                        }),
                    ]);

                    assert.equal(activeAdmins, 2);
                    assert.equal(
                        memberships.filter((membership) => membership.role === "ADMIN").length,
                        2,
                    );
                    assert.equal(
                        memberships.filter((membership) => membership.role === "GESTOR").length,
                        0,
                    );
                    assert.equal(audit.length, 0);
                } finally {
                    await cleanupScenario(prisma, company.id, userIds);
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    },
);
