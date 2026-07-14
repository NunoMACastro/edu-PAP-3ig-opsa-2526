/**
 * @file Service de logs de integracao MF4.
 *
 * Logs de integracao registam contagens e estado operacional. Nao guardam
 * ficheiros completos, credenciais, headers, cookies, tokens nem payload bruto.
 */

import {
    buildCursorPage,
    buildKeysetCondition,
    decodePageCursor,
    parsePageLimit,
} from "../../lib/cursorPagination.js";

const FORBIDDEN_MESSAGE_PARTS = [
    "authorization",
    "cookie",
    "password",
    "private_key",
    "secret",
    "token",
];

/**
 * Sanitiza nome de ficheiro para guardar apenas nome curto.
 *
 * @param {unknown} fileName - Nome recebido.
 * @returns {string | null} Nome seguro ou null.
 */
function safeFileName(fileName) {
    if (typeof fileName !== "string" || !fileName.trim()) return null;
    return fileName.trim().split(/[\\/]/).at(-1).slice(0, 120);
}

/**
 * Sanitiza a mensagem operacional antes de a guardar no log.
 * A função corta o texto e redige mensagens que pareçam conter segredos.
 *
 * @param {unknown} message - Mensagem recebida.
 * @returns {string | null} Mensagem truncada ou null.
 */
function safeMessage(message) {
    if (typeof message !== "string" || !message.trim()) return null;
    const normalized = message.trim().slice(0, 300);
    const lower = normalized.toLowerCase();
    if (FORBIDDEN_MESSAGE_PARTS.some((part) => lower.includes(part))) {
        return "Mensagem redigida por conter termos sensiveis.";
    }
    return normalized;
}

/**
 * Normaliza inteiro opcional para contagens.
 *
 * @param {unknown} value - Valor recebido.
 * @returns {number | null} Inteiro ou null.
 */
function optionalInteger(value) {
    return Number.isInteger(value) ? value : null;
}

/**
 * Regista um log de integracao sanitizado.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente ou transacao Prisma.
 * @param {{ companyId: string, userId: string, integrationType: string, operation: string, status: string, sourceId?: string, fileName?: string, totalRows?: number, successRows?: number, errorRows?: number, message?: string }} input - Dados do log.
 * @returns {Promise<object>} Log criado.
 */
export function recordIntegrationLog(prisma, input) {
    return prisma.integrationLog.create({
        data: {
            companyId: input.companyId,
            integrationType: input.integrationType,
            operation: input.operation,
            status: input.status,
            sourceId: input.sourceId ?? null,
            fileName: safeFileName(input.fileName),
            totalRows: optionalInteger(input.totalRows),
            successRows: optionalInteger(input.successRows),
            errorRows: optionalInteger(input.errorRows),
            message: safeMessage(input.message),
            createdById: input.userId,
        },
    });
}

/**
 * Lista logs de integracao da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, cursor?: string, limit?: string | number }} input - Contexto e paginação.
 * @returns {Promise<{items: object[], pageInfo: object}>} Página de logs.
 */
export async function listIntegrationLogs(prisma, input) {
    const limit = parsePageLimit(input.limit);
    const cursor = decodePageCursor(input.cursor, "date");
    const keyset = buildKeysetCondition(cursor, {
        sortField: "createdAt",
        direction: "desc",
    });
    const baseWhere = { companyId: input.companyId };
    const records = await prisma.integrationLog.findMany({
        where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
    });
    return buildCursorPage(records, {
        limit,
        sortField: "createdAt",
        sortType: "date",
    });
}
