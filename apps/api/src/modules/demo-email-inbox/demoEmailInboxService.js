/**
 * @file Leitura mínima e temporária dos emails simulados da demonstração.
 *
 * Os payloads continuam cifrados na base. Este módulo só decifra convites e
 * recuperações já processados pelo provider simulado e nunca devolve o corpo.
 */

import { decryptEmailOutboxPayload } from "../notifications/emailOutboxCrypto.js";
import { TransactionalEmailReason } from "../notifications/transactionalEmailAdapter.js";

export const DEMO_EMAIL_PREVIEW_RETENTION_MS = 24 * 60 * 60 * 1000;
export const DEMO_EMAIL_PREVIEW_TYPES = Object.freeze([
    TransactionalEmailReason.COMPANY_INVITATION,
    TransactionalEmailReason.PASSWORD_RESET,
]);

/**
 * Remove payloads de preview que ultrapassaram as 24 horas permitidas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {Date} now - Relógio injetável para testes.
 * @returns {Promise<number>} Número de payloads eliminados.
 */
export async function cleanupExpiredDemoEmailPreviews(prisma, now = new Date()) {
    const expiredBefore = new Date(
        now.getTime() - DEMO_EMAIL_PREVIEW_RETENTION_MS,
    );
    const result = await prisma.emailOutbox.updateMany({
        where: {
            type: { in: [...DEMO_EMAIL_PREVIEW_TYPES] },
            status: "SIMULATED",
            encryptedPayload: { not: null },
            updatedAt: { lte: expiredBefore },
        },
        data: { encryptedPayload: null },
    });
    return result.count;
}

/**
 * Extrai a única ligação de ação necessária sem devolver o corpo da mensagem.
 *
 * @param {string} text - Texto transacional previamente validado.
 * @returns {string | null} URL HTTP(S) segura ou null.
 */
function extractActionUrl(text) {
    const candidate = String(text ?? "")
        .match(/https?:\/\/[^\s]+/u)?.[0]
        ?.replace(/[),.;]+$/u, "");
    if (!candidate) return null;
    try {
        const parsed = new URL(candidate);
        return ["http:", "https:"].includes(parsed.protocol)
            ? parsed.toString()
            : null;
    } catch {
        return null;
    }
}

/**
 * Lista previews válidos, limitados e sem conteúdo adicional do email.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ encryptionKey: string | Buffer, now?: Date }} input - Chave e relógio.
 * @returns {Promise<Array<{recipient: string, subject: string, type: string, actionUrl: string, createdAt: string}>>} Previews mínimos.
 */
export async function listDemoEmailPreviews(
    prisma,
    { encryptionKey, now = new Date() },
) {
    await cleanupExpiredDemoEmailPreviews(prisma, now);
    const availableAfter = new Date(
        now.getTime() - DEMO_EMAIL_PREVIEW_RETENTION_MS,
    );
    const rows = await prisma.emailOutbox.findMany({
        where: {
            type: { in: [...DEMO_EMAIL_PREVIEW_TYPES] },
            status: "SIMULATED",
            encryptedPayload: { not: null },
            updatedAt: { gt: availableAfter },
        },
        select: {
            type: true,
            encryptedPayload: true,
            createdAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 50,
    });

    return rows.flatMap((row) => {
        try {
            const message = decryptEmailOutboxPayload(
                row.encryptedPayload,
                encryptionKey,
            );
            const actionUrl = extractActionUrl(message.text);
            if (!actionUrl) return [];
            return [{
                recipient: message.to,
                subject: message.subject,
                type: row.type,
                actionUrl,
                createdAt: row.createdAt.toISOString(),
            }];
        } catch {
            // Um envelope inválido não deve bloquear nem ser exposto pela inbox.
            return [];
        }
    });
}
