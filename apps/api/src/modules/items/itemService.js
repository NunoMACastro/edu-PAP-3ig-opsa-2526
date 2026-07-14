/**
 * @file Service de artigos e serviços.
 */

import { httpError } from "../../lib/httpErrors.js";
import { recordAuditLog } from "../audit/auditLogService.js";
import {
    buildCursorPage,
    buildKeysetCondition,
    decodePageCursor,
    parsePageLimit,
} from "../../lib/cursorPagination.js";

/**
 * Serializa item para resposta pública.
 *
 * @param {object} item - Item Prisma.
 * @returns {object} Item público.
 */
function serialize(item) {
    return {
        id: item.id,
        sku: item.sku,
        name: item.name,
        type: item.type,
        costCents: item.costCents,
        priceCents: item.priceCents,
        vatRateBps: item.vatRateBps,
        unitOfMeasure: item.unitOfMeasure,
        isActive: item.isActive,
    };
}

/**
 * Garante unicidade de SKU por empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} sku - SKU normalizado.
 * @param {string | undefined} [ignoreId] - Item a ignorar em updates.
 * @param ignoreId - Identificador a excluir da verificação de unicidade.
 * @returns {Promise<void>}
 */
async function assertUniqueSku(prisma, companyId, sku, ignoreId = undefined) {
    const existing = await prisma.item.findFirst({
        where: { companyId, sku, id: ignoreId ? { not: ignoreId } : undefined },
    });
    if (existing) {
        throw httpError(
            409,
            "ITEM_SKU_EXISTS",
            "Já existe artigo/serviço com este SKU nesta empresa",
        );
    }
}

/**
 * Identifica uma violação de unicidade causada por duas escritas concorrentes.
 *
 * @param {unknown} error - Erro devolvido pelo Prisma.
 * @returns {boolean} Verdadeiro quando o erro é P2002.
 */
function isUniqueConstraintError(error) {
    return Boolean(
        error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "P2002",
    );
}

/**
 * Lista artigos e serviços ativos.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {{ cursor?: string, limit?: string | number }} [page] - Paginação pedida.
 * @returns {Promise<{items: object[], pageInfo: object}>} Página de itens ativos.
 */
export async function listItems(prisma, companyId, page = {}) {
    const limit = parsePageLimit(page.limit);
    const cursor = decodePageCursor(page.cursor, "string");
    const keyset = buildKeysetCondition(cursor, {
        sortField: "sku",
        direction: "asc",
    });
    const baseWhere = { companyId, isActive: true };
    const items = await prisma.item.findMany({
        where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
        orderBy: [{ sku: "asc" }, { id: "asc" }],
        take: limit + 1,
    });
    return buildCursorPage(items, {
        limit,
        sortField: "sku",
        sortType: "string",
        serialize,
    });
}

/**
 * Cria artigo ou serviço.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {object} input - Item validado.
 * @param {string} userId - Utilizador autenticado responsável pela mutação.
 * @returns {Promise<object>} Item criado.
 */
export async function createItem(prisma, companyId, input, userId) {
    await assertUniqueSku(prisma, companyId, input.sku);
    try {
        return await prisma.$transaction(async (tx) => {
            const item = await tx.item.create({
                data: { companyId, ...input },
            });
            await recordAuditLog(tx, {
                companyId,
                userId,
                action: "ITEM_CREATED",
                entity: "Item",
                entityId: item.id,
                details: { changedFields: Object.keys(input).sort() },
            });
            return serialize(item);
        });
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            throw httpError(
                409,
                "ITEM_SKU_EXISTS",
                "Já existe artigo/serviço com este SKU nesta empresa",
            );
        }
        throw error;
    }
}

/**
 * Atualiza artigo ou serviço.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} itemId - Item alvo.
 * @param {object} input - Dados validados.
 * @param {string} userId - Utilizador autenticado responsável pela mutação.
 * @returns {Promise<object>} Item atualizado.
 */
export async function updateItem(prisma, companyId, itemId, input, userId) {
    await assertUniqueSku(prisma, companyId, input.sku, itemId);
    try {
        return await prisma.$transaction(async (tx) => {
            const updated = await tx.item.updateMany({
                where: { id: itemId, companyId },
                data: input,
            });
            if (updated.count === 0) {
                throw httpError(
                    404,
                    "ITEM_NOT_FOUND",
                    "Artigo/serviço não encontrado",
                );
            }

            const item = await tx.item.findFirst({
                where: { id: itemId, companyId },
            });
            await recordAuditLog(tx, {
                companyId,
                userId,
                action: "ITEM_UPDATED",
                entity: "Item",
                entityId: itemId,
                details: { changedFields: Object.keys(input).sort() },
            });
            return serialize(item);
        });
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            throw httpError(
                409,
                "ITEM_SKU_EXISTS",
                "Já existe artigo/serviço com este SKU nesta empresa",
            );
        }
        throw error;
    }
}

/**
 * Desativa item sem apagar histórico.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} itemId - Item alvo.
 * @param {string} userId - Utilizador autenticado responsável pela mutação.
 * @returns {Promise<void>}
 */
export async function deactivateItem(prisma, companyId, itemId, userId) {
    await prisma.$transaction(async (tx) => {
        const updated = await tx.item.updateMany({
            where: { id: itemId, companyId },
            data: { isActive: false },
        });
        if (updated.count === 0) {
            throw httpError(
                404,
                "ITEM_NOT_FOUND",
                "Artigo/serviço não encontrado",
            );
        }
        await recordAuditLog(tx, {
            companyId,
            userId,
            action: "ITEM_DEACTIVATED",
            entity: "Item",
            entityId: itemId,
            details: { changedFields: ["isActive"] },
        });
    });
}
