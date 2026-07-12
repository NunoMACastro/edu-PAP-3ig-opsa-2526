/**
 * @file Ciclo interno e paginado do worker global de notificações.
 */

import { materializeCompanyNotifications } from "./notificationService.js";

const COMPANY_PAGE_SIZE = 100;

/**
 * Materializa notificações para todas as empresas sem misturar transações.
 *
 * Cada empresa é uma unidade independente: uma falha é contabilizada e o
 * ciclo continua, evitando que uma empresa bloqueie as restantes.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ enqueue(tx: object, message: object, options: { dedupeKey: string }): Promise<object> }} emailOutbox - Outbox transacional.
 * @returns {Promise<{companiesProcessed: number, companiesFailed: number, notificationsMaterialized: number, emailsQueued: number}>} Resumo operacional.
 */
export async function runNotificationWorkerCycle(prisma, emailOutbox) {
    const summary = {
        companiesProcessed: 0,
        companiesFailed: 0,
        notificationsMaterialized: 0,
        emailsQueued: 0,
    };
    let cursor;

    do {
        const companies = await prisma.company.findMany({
            select: { id: true },
            orderBy: { id: "asc" },
            take: COMPANY_PAGE_SIZE,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });

        for (const company of companies) {
            try {
                const result = await materializeCompanyNotifications(
                    prisma,
                    { companyId: company.id },
                    emailOutbox,
                );
                summary.companiesProcessed += 1;
                summary.notificationsMaterialized += result.notificationsMaterialized;
                summary.emailsQueued += result.emailsQueued;
            } catch {
                summary.companiesFailed += 1;
            }
        }

        cursor = companies.at(-1)?.id;
        if (companies.length < COMPANY_PAGE_SIZE) break;
    } while (cursor);

    return summary;
}
