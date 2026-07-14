/**
 * @file Service de títulos de venda em aberto e antiguidade de saldos.
 */

import {
    decodePageCursor,
    encodePageCursor,
    parsePageLimit,
} from "../../lib/cursorPagination.js";
import { httpError } from "../../lib/httpErrors.js";
import { parseStrictDateOnly } from "../../lib/strictDate.js";

const MAX_FILTERED_SCAN_MULTIPLIER = 5;

/**
 * Valida data de referência.
 *
 * @param {unknown} value - Valor opcional recebido por query string.
 * @returns {Date} Data de referência.
 */
function parseAsOfDate(value) {
    if (!value) return new Date();
    return parseStrictDateOnly(value, {
        code: "INVALID_DATE",
        field: "Data de referência",
    });
}

/**
 * Classifica antiguidade do saldo.
 *
 * @param {number} daysOverdue - Dias vencidos.
 * @returns {string} Bucket funcional.
 */
function bucketFor(daysOverdue) {
    if (daysOverdue <= 0) return "NOT_DUE";
    if (daysOverdue <= 30) return "DAYS_1_30";
    if (daysOverdue <= 60) return "DAYS_31_60";
    if (daysOverdue <= 90) return "DAYS_61_90";
    return "DAYS_90_PLUS";
}

/**
 * Codifica a ordenação composta `dueDate/issuedAt/id` num cursor opaco.
 *
 * @param {object} document - Documento Prisma usado como fronteira da página.
 * @returns {string} Cursor Base64URL.
 */
function encodeOpenItemCursor(document) {
    return encodePageCursor({
        id: document.id,
        sortValue: JSON.stringify({
            dueDate: document.dueDate?.toISOString() ?? null,
            issuedAt: document.issuedAt.toISOString(),
        }),
        sortType: "string",
    });
}

/**
 * Valida o cursor composto sem confiar em datas ou JSON fornecidos pelo cliente.
 *
 * @param {unknown} value - Query parameter `cursor`.
 * @returns {{ id: string, dueDate: Date | null, issuedAt: Date } | null} Fronteira validada.
 */
function decodeOpenItemCursor(value) {
    const cursor = decodePageCursor(value, "string");
    if (!cursor) return null;

    try {
        const payload = JSON.parse(cursor.sortValue);
        const issuedAt = new Date(payload.issuedAt);
        const dueDate = payload.dueDate === null ? null : new Date(payload.dueDate);
        if (
            typeof payload.issuedAt !== "string" ||
            issuedAt.toISOString() !== payload.issuedAt ||
            !(
                payload.dueDate === null ||
                (typeof payload.dueDate === "string" &&
                    dueDate.toISOString() === payload.dueDate)
            )
        ) {
            throw new Error("invalid open-item cursor");
        }
        return { id: cursor.id, dueDate, issuedAt };
    } catch {
        throw httpError(400, "INVALID_PAGE_CURSOR", "Cursor de paginação inválido.");
    }
}

/**
 * Constrói a continuação keyset preservando a ordenação funcional por vencimento.
 * Datas de vencimento nulas ficam no fim e usam `issuedAt` como desempate.
 *
 * @param {{ id: string, dueDate: Date | null, issuedAt: Date } | null} cursor - Cursor validado.
 * @returns {object | null} Condição Prisma adicional.
 */
function buildOpenItemKeyset(cursor) {
    if (!cursor) return null;
    const tieBreakers = [
        { issuedAt: { gt: cursor.issuedAt } },
        { issuedAt: cursor.issuedAt, id: { gt: cursor.id } },
    ];
    if (cursor.dueDate === null) {
        return { AND: [{ dueDate: null }, { OR: tieBreakers }] };
    }
    return {
        OR: [
            { dueDate: { gt: cursor.dueDate } },
            { dueDate: cursor.dueDate, OR: tieBreakers },
            { dueDate: null },
        ],
    };
}

/**
 * Converte um documento emitido num título em aberto público.
 *
 * @param {object} document - Documento e cliente devolvidos pelo Prisma.
 * @param {Date} asOfDate - Data de referência da antiguidade.
 * @returns {object | null} Título aberto ou null perante dados legados incoerentes.
 */
function serializeOpenItem(document, asOfDate) {
    const openAmountCents = document.totalCents - document.amountPaidCents;
    if (openAmountCents <= 0) return null;
    const dueDate = document.dueDate ?? document.issuedAt;
    const daysOverdue = Math.floor(
        (asOfDate.getTime() - dueDate.getTime()) / 86400000,
    );
    return {
        id: document.id,
        number: document.number,
        customerName: document.customer.name,
        issuedAt: document.issuedAt,
        dueDate,
        totalCents: document.totalCents,
        amountPaidCents: document.amountPaidCents,
        openAmountCents,
        daysOverdue,
        bucket: bucketFor(daysOverdue),
    };
}

/**
 * Lista documentos de venda emitidos com saldo em aberto.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {{ asOfDate?: unknown, cursor?: unknown, limit?: unknown }} query - Query string.
 * @returns {Promise<{items: object[], pageInfo: {nextCursor: string | null, hasNextPage: boolean}}>} Página de títulos em aberto.
 */
export async function listSalesOpenItems(prisma, companyId, query = {}) {
    const asOfDate = parseAsOfDate(query.asOfDate);
    const limit = parsePageLimit(query.limit);
    let scanCursor = decodeOpenItemCursor(query.cursor);
    const validDocuments = [];
    let lastScanned = null;
    let exhausted = false;
    let scanned = 0;
    const maxScanned = (limit + 1) * MAX_FILTERED_SCAN_MULTIPLIER;

    while (validDocuments.length < limit + 1 && scanned < maxScanned) {
        const take = Math.min(limit + 1, maxScanned - scanned);
        const keyset = buildOpenItemKeyset(scanCursor);
        const baseWhere = {
            companyId,
            totalCents: { gt: 0 },
            status: "ISSUED",
            kind: { not: "CREDIT_NOTE" },
        };
        const documents = await prisma.saleDocument.findMany({
            where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
            include: { customer: true },
            orderBy: [
                { dueDate: { sort: "asc", nulls: "last" } },
                { issuedAt: "asc" },
                { id: "asc" },
            ],
            take,
        });
        if (documents.length === 0) {
            exhausted = true;
            break;
        }

        scanned += documents.length;
        lastScanned = documents.at(-1);
        for (const document of documents) {
            if (serializeOpenItem(document, asOfDate)) {
                validDocuments.push(document);
            }
        }
        scanCursor = decodeOpenItemCursor(encodeOpenItemCursor(lastScanned));
        if (documents.length < take) {
            exhausted = true;
            break;
        }
    }

    const visible = validDocuments.slice(0, limit);
    const hasNextPage = validDocuments.length > limit || !exhausted;
    const nextBoundary = validDocuments.length > limit
        ? visible.at(-1)
        : lastScanned;
    return {
        items: visible.map((document) => serializeOpenItem(document, asOfDate)),
        pageInfo: {
            nextCursor: hasNextPage && nextBoundary
                ? encodeOpenItemCursor(nextBoundary)
                : null,
            hasNextPage,
        },
    };
}
