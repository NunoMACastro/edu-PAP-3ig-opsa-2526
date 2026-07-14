/**
 * @file Reset seguro e estritamente limitado aos namespaces de seed OPSA.
 */

import { DEMO_NAMESPACE, DEMO_USERS, LOAD_NAMESPACE } from "./config.js";

const LEGACY_COMPANIES = Object.freeze([
    { nif: "510000002", name: "OPSA Demo, Lda" },
    { nif: "510000010", name: "OPSA Demo Norte, Lda" },
]);

/**
 * Adquire um advisory lock PostgreSQL para serializar seeds concorrentes.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} namespace - Namespace a proteger.
 * @returns {Promise<void>}
 */
export async function acquireSeedLock(prisma, namespace) {
    await prisma.$executeRaw`SELECT pg_advisory_lock(hashtext(${`opsa-seed:${namespace}`}))`;
}

/**
 * Liberta o advisory lock adquirido pela seed.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} namespace - Namespace protegido.
 * @returns {Promise<void>}
 */
export async function releaseSeedLock(prisma, namespace) {
    await prisma.$executeRaw`SELECT pg_advisory_unlock(hashtext(${`opsa-seed:${namespace}`}))`;
}

/**
 * Regista imediatamente uma empresa como pertencente a um namespace de seed.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, namespace: string, profile: string }} input - Identidade da seed.
 * @returns {Promise<object>} Marcador persistido.
 */
export function createNamespaceMarker(prisma, input) {
    return prisma.integrationLog.create({
        data: {
            companyId: input.companyId,
            createdById: input.userId,
            integrationType: "SEED_NAMESPACE",
            operation: input.profile.toUpperCase(),
            status: "IN_PROGRESS",
            sourceId: input.namespace,
            fileName: "prisma/seed.js",
            totalRows: 0,
            successRows: 0,
            errorRows: 0,
            message: "Namespace reservado pela infraestrutura de seed OPSA.",
        },
    });
}

/**
 * Atualiza o marcador com o resultado final da seed.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ markerId: string, totalRows: number, checksum: string }} input - Resumo final.
 * @returns {Promise<object>} Marcador atualizado.
 */
export function completeNamespaceMarker(prisma, input) {
    return prisma.integrationLog.update({
        where: { id: input.markerId },
        data: {
            status: "IMPORTED",
            totalRows: input.totalRows,
            successRows: input.totalRows,
            errorRows: 0,
            message: `Seed concluida; checksum=${input.checksum}`,
        },
    });
}

async function discoverNamespaceCompanies(prisma, namespace) {
    const markers = await prisma.integrationLog.findMany({
        where: {
            integrationType: "SEED_NAMESPACE",
            sourceId: namespace,
        },
        select: { companyId: true },
    });
    const companyIds = new Set(markers.map((marker) => marker.companyId));

    if (namespace === DEMO_NAMESPACE) {
        const legacyMarker = await prisma.integrationLog.findFirst({
            where: {
                integrationType: "DEMO_SYNC",
                operation: "SEED",
                sourceId: "DEMO-SEED-2026",
            },
            select: {
                companyId: true,
                company: {
                    select: {
                        nif: true,
                        name: true,
                        memberships: { select: { user: { select: { email: true } } } },
                    },
                },
            },
        });
        const expectedMarkerCompany = legacyMarker
            ? LEGACY_COMPANIES.find((row) => row.nif === legacyMarker.company.nif)
            : null;
        const markerEmails = new Set(
            legacyMarker?.company.memberships.map((membership) => membership.user.email) ?? [],
        );
        if (
            legacyMarker &&
            expectedMarkerCompany?.name === legacyMarker.company.name &&
            markerEmails.size > 0
        ) {
            const legacyCompanies = await prisma.company.findMany({
                where: { nif: { in: LEGACY_COMPANIES.map((row) => row.nif) } },
                select: {
                    id: true,
                    nif: true,
                    name: true,
                    memberships: { select: { user: { select: { email: true } } } },
                },
            });
            for (const company of legacyCompanies) {
                const expected = LEGACY_COMPANIES.find((row) => row.nif === company.nif);
                const emails = company.memberships.map((membership) => membership.user.email);
                const emailsMatchMarker = emails.length > 0 && emails.every((email) => markerEmails.has(email));
                if (expected?.name === company.name && emailsMatchMarker) companyIds.add(company.id);
            }
        }
    }
    return [...companyIds];
}

async function assertUsersAreNamespaceSafe(prisma, companyIds, namespace) {
    const emails = namespace === LOAD_NAMESPACE
        ? ["load-admin@opsa.demo"]
        : DEMO_USERS.map((user) => user.email);
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { email: { in: emails } },
                { memberships: { some: { companyId: { in: companyIds } } } },
            ],
        },
        include: { memberships: { select: { companyId: true } } },
    });
    const allowed = new Set(companyIds);
    for (const user of users) {
        const foreign = user.memberships.find((membership) => !allowed.has(membership.companyId));
        if (foreign) {
            throw new Error(
                `Reset ${namespace} recusado: ${user.email} pertence a uma empresa fora do namespace.`,
            );
        }
    }
    return users.map((user) => user.id);
}

/**
 * Remove todo o grafo de empresas indicado, respeitando dependencias Prisma.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx - Transacao Prisma.
 * @param {string[]} companyIds - Empresas autorizadas.
 * @returns {Promise<void>}
 */
async function deleteCompanyGraph(tx, companyIds) {
    const where = { companyId: { in: companyIds } };

    await tx.aiActionSuggestion.deleteMany({ where });
    await tx.aiInsight.deleteMany({ where });
    await tx.aiQuestionRun.deleteMany({ where });
    await tx.smartAlert.deleteMany({ where });
    await tx.inAppNotification.deleteMany({ where });
    await tx.alertPreference.deleteMany({ where });
    await tx.operationalTask.deleteMany({ where });
    await tx.reminder.deleteMany({ where });

    await tx.bankReconciliationSuggestion.deleteMany({ where });
    await tx.bankStatementLine.deleteMany({ where });
    await tx.bankStatementImport.deleteMany({ where });
    await tx.businessImportRun.deleteMany({ where });
    await tx.saftExportRun.deleteMany({ where });
    await tx.cashflowForecastRun.deleteMany({ where });
    await tx.operationalReportRun.deleteMany({ where });
    await tx.executiveKpiRun.deleteMany({ where });
    await tx.vatMapRun.deleteMany({ where });
    await tx.treasuryBalanceSnapshot.deleteMany({ where });

    await tx.inventoryCountLine.deleteMany({
        where: { inventoryCount: { companyId: { in: companyIds } } },
    });
    await tx.inventoryCount.deleteMany({ where });
    await tx.stockCostConsumption.deleteMany({ where });
    await tx.stockCostLayer.deleteMany({ where });
    await tx.stockMovement.deleteMany({ where });
    await tx.stockBalance.deleteMany({ where });
    await tx.stockAlertSetting.deleteMany({ where });

    await tx.journalEntryRevision.deleteMany({ where });
    await tx.journalAttachment.deleteMany({ where });
    await tx.journalEntryLine.deleteMany({
        where: { journalEntry: { companyId: { in: companyIds } } },
    });
    await tx.retentionHold.deleteMany({ where });
    await tx.journalEntry.deleteMany({ where });

    await tx.receipt.deleteMany({ where });
    await tx.payment.deleteMany({ where });
    await tx.treasuryAccount.deleteMany({ where });
    await tx.purchaseApprovalHistory.deleteMany({ where });
    await tx.saleDocumentLine.deleteMany({
        where: { saleDocument: { companyId: { in: companyIds } } },
    });
    await tx.purchaseDocumentLine.deleteMany({
        where: { purchaseDocument: { companyId: { in: companyIds } } },
    });
    await tx.saleDocument.deleteMany({ where });
    await tx.purchaseDocument.deleteMany({ where });
    await tx.numberSequence.deleteMany({ where });

    await tx.auditLog.deleteMany({ where });
    await tx.integrationLog.deleteMany({ where });
    await tx.warehouseLocation.deleteMany({
        where: { warehouse: { companyId: { in: companyIds } } },
    });
    await tx.warehouse.deleteMany({ where });
    await tx.vatRate.deleteMany({ where });
    await tx.item.deleteMany({ where });
    await tx.customer.deleteMany({ where });
    await tx.supplier.deleteMany({ where });
    await tx.account.deleteMany({ where });
    await tx.fiscalPeriod.deleteMany({ where });
    await tx.companyProfile.deleteMany({ where });
    await tx.companySubscription.deleteMany({ where });
    await tx.companyInvitation.deleteMany({ where });
    await tx.companyMembership.deleteMany({ where });
    await tx.company.deleteMany({ where: { id: { in: companyIds } } });
}

/**
 * Repoe apenas o namespace pedido e preserva qualquer dado externo.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ namespace: string, objectStorage?: object }} input - Namespace e storage opcional.
 * @returns {Promise<{ companiesDeleted: number, usersDeleted: number, objectsDeleted: number }>} Resumo.
 */
export async function resetSeedNamespace(prisma, input) {
    if (![DEMO_NAMESPACE, LOAD_NAMESPACE].includes(input.namespace)) {
        throw new Error("Namespace de seed nao autorizado para reset.");
    }
    const companyIds = await discoverNamespaceCompanies(prisma, input.namespace);
    if (companyIds.length === 0) {
        return { companiesDeleted: 0, usersDeleted: 0, objectsDeleted: 0 };
    }
    const userIds = await assertUsersAreNamespaceSafe(prisma, companyIds, input.namespace);
    const [attachments, saftExports, invitations, resetTokens] = await Promise.all([
        prisma.journalAttachment.findMany({
            where: { companyId: { in: companyIds } },
            select: { storageKey: true },
        }),
        prisma.saftExportRun.findMany({
            where: {
                companyId: { in: companyIds },
                storageKey: { not: null },
            },
            select: { storageKey: true },
        }),
        prisma.companyInvitation.findMany({
            where: { companyId: { in: companyIds } },
            select: { id: true },
        }),
        prisma.passwordResetToken.findMany({
            where: { userId: { in: userIds } },
            select: { tokenHash: true },
        }),
    ]);
    const prefix = input.namespace === LOAD_NAMESPACE ? "load:" : "demo:";
    const outboxOwnershipFilters = [
        { dedupeKey: { startsWith: prefix } },
        ...invitations.map(({ id }) => ({
            dedupeKey: { startsWith: `company-invitation:${id}:` },
        })),
        ...resetTokens.map(({ tokenHash }) => ({
            dedupeKey: `password-reset:${tokenHash}`,
        })),
    ];
    const storageKeys = new Set(
        [...attachments, ...saftExports]
            .map(({ storageKey }) => storageKey)
            .filter(Boolean),
    );

    await prisma.$transaction(async (tx) => {
        await deleteCompanyGraph(tx, companyIds);
        await tx.session.deleteMany({ where: { userId: { in: userIds } } });
        await tx.passwordResetToken.deleteMany({ where: { userId: { in: userIds } } });
        await tx.securityAuditEvent.deleteMany({ where: { actorUserId: { in: userIds } } });
        await tx.user.deleteMany({ where: { id: { in: userIds } } });
        await tx.emailOutbox.deleteMany({
            where: { OR: outboxOwnershipFilters },
        });
    }, { timeout: 120_000 });

    let objectsDeleted = 0;
    if (input.objectStorage?.deleteObject) {
        for (const storageKey of storageKeys) {
            await input.objectStorage.deleteObject(storageKey);
            objectsDeleted += 1;
        }
    }
    return {
        companiesDeleted: companyIds.length,
        usersDeleted: userIds.length,
        objectsDeleted,
    };
}
