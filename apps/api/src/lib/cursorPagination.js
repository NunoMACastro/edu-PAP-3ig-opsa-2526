/**
 * @file Primitivas de cursor pagination para listagens multiempresa.
 *
 * Os cursores são opacos para o cliente, limitados em tamanho e contêm apenas
 * o valor de ordenação e o identificador público do último item. Todas as
 * queries consumidoras continuam obrigadas a aplicar `companyId` no filtro.
 */

import { httpError } from "./httpErrors.js";

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;
const MAX_CURSOR_LENGTH = 2048;

/**
 * Valida o limite pedido e aplica o default académico.
 *
 * @param {unknown} value - Query parameter `limit`.
 * @returns {number} Limite entre 1 e 100.
 */
export function parsePageLimit(value) {
    if (value === undefined || value === null || value === "") {
        return DEFAULT_PAGE_SIZE;
    }
    const limit = Number(value);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
        throw httpError(
            400,
            "INVALID_PAGE_LIMIT",
            `O limite deve ser um inteiro entre 1 e ${MAX_PAGE_SIZE}.`,
        );
    }
    return limit;
}

/**
 * Converte o valor de ordenação para uma representação JSON estável.
 *
 * @param {unknown} value - Valor do último registo.
 * @param {"date" | "string"} sortType - Tipo permitido pelo endpoint.
 * @returns {string} Valor serializado no cursor.
 */
function serializeSortValue(value, sortType) {
    if (sortType === "date") {
        if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
            throw new TypeError("O valor de ordenação deve ser uma Date válida.");
        }
        return value.toISOString();
    }
    if (sortType === "string" && typeof value === "string" && value.length > 0) {
        return value;
    }
    throw new TypeError("O valor de ordenação deve ser texto não vazio.");
}

/**
 * Codifica o último item de uma página num cursor Base64URL opaco.
 *
 * @param {{ id: string, sortValue: unknown, sortType: "date" | "string" }} input - Dados mínimos do cursor.
 * @returns {string} Cursor opaco.
 */
export function encodePageCursor(input) {
    if (typeof input?.id !== "string" || input.id.length === 0) {
        throw new TypeError("O cursor requer um identificador não vazio.");
    }
    const payload = {
        v: 1,
        id: input.id,
        sort: serializeSortValue(input.sortValue, input.sortType),
    };
    return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

/**
 * Valida e descodifica um cursor vindo do browser.
 *
 * @param {unknown} value - Query parameter `cursor`.
 * @param {"date" | "string"} sortType - Tipo de ordenação esperado.
 * @returns {{ id: string, sortValue: Date | string } | null} Cursor interno ou null.
 */
export function decodePageCursor(value, sortType) {
    if (value === undefined || value === null || value === "") return null;
    if (
        typeof value !== "string" ||
        value.length > MAX_CURSOR_LENGTH ||
        !/^[A-Za-z0-9_-]+$/.test(value)
    ) {
        throw httpError(400, "INVALID_PAGE_CURSOR", "Cursor de paginação inválido.");
    }

    try {
        const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
        if (
            payload?.v !== 1 ||
            typeof payload.id !== "string" ||
            payload.id.length === 0 ||
            typeof payload.sort !== "string" ||
            payload.sort.length === 0
        ) {
            throw new Error("invalid cursor payload");
        }
        if (sortType === "string") {
            return { id: payload.id, sortValue: payload.sort };
        }
        if (sortType === "date") {
            const sortValue = new Date(payload.sort);
            if (
                Number.isNaN(sortValue.getTime()) ||
                sortValue.toISOString() !== payload.sort
            ) {
                throw new Error("invalid date cursor");
            }
            return { id: payload.id, sortValue };
        }
        throw new Error("unsupported cursor type");
    } catch {
        throw httpError(400, "INVALID_PAGE_CURSOR", "Cursor de paginação inválido.");
    }
}

/**
 * Constrói o filtro keyset para o próximo bloco, incluindo o `id` como
 * desempate estável quando dois registos têm o mesmo valor de ordenação.
 *
 * @param {{ id: string, sortValue: Date | string } | null} cursor - Cursor descodificado.
 * @param {{ sortField: string, direction: "asc" | "desc" }} options - Ordenação do endpoint.
 * @returns {object | null} Filtro Prisma adicional.
 */
export function buildKeysetCondition(cursor, options) {
    if (!cursor) return null;
    if (!options?.sortField || !["asc", "desc"].includes(options.direction)) {
        throw new TypeError("Configuração de paginação inválida.");
    }
    const operator = options.direction === "asc" ? "gt" : "lt";
    return {
        OR: [
            { [options.sortField]: { [operator]: cursor.sortValue } },
            {
                [options.sortField]: cursor.sortValue,
                id: { [operator]: cursor.id },
            },
        ],
    };
}

/**
 * Converte `limit + 1` registos no envelope público contratado.
 *
 * @param {object[]} records - Registos Prisma, incluindo `id` e sort field.
 * @param {{ limit: number, sortField: string, sortType: "date" | "string", serialize?: (record: object) => object }} options - Contrato da listagem.
 * @returns {{ items: object[], pageInfo: { nextCursor: string | null, hasNextPage: boolean } }} Página pública.
 */
export function buildCursorPage(records, options) {
    const limit = parsePageLimit(options?.limit);
    const hasNextPage = records.length > limit;
    const visibleRecords = records.slice(0, limit);
    const lastRecord = visibleRecords.at(-1);
    const nextCursor =
        hasNextPage && lastRecord
            ? encodePageCursor({
                  id: lastRecord.id,
                  sortValue: lastRecord[options.sortField],
                  sortType: options.sortType,
              })
            : null;
    const serialize = options.serialize ?? ((record) => record);

    return {
        items: visibleRecords.map(serialize),
        pageInfo: { nextCursor, hasNextPage },
    };
}
