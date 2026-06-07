/**
 * @file Service de artigos e serviços.
 */

import { httpError } from "../../lib/httpErrors.js";

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
 * Lista artigos e serviços ativos.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<object[]>} Itens ativos.
 */
export async function listItems(prisma, companyId) {
    const items = await prisma.item.findMany({
        where: { companyId, isActive: true },
        orderBy: { sku: "asc" },
    });
    return items.map(serialize);
}

/**
 * Cria artigo ou serviço.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {object} input - Item validado.
 * @returns {Promise<object>} Item criado.
 */
export async function createItem(prisma, companyId, input) {
    await assertUniqueSku(prisma, companyId, input.sku);
    const item = await prisma.item.create({ data: { companyId, ...input } });
    return serialize(item);
}

/**
 * Atualiza artigo ou serviço.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} itemId - Item alvo.
 * @param {object} input - Dados validados.
 * @returns {Promise<object>} Item atualizado.
 */
export async function updateItem(prisma, companyId, itemId, input) {
    await assertUniqueSku(prisma, companyId, input.sku, itemId);
    const updated = await prisma.item.updateMany({
        where: { id: itemId, companyId },
        data: input,
    });
    if (updated.count === 0) {
        throw httpError(404, "ITEM_NOT_FOUND", "Artigo/serviço não encontrado");
    }

    const item = await prisma.item.findFirst({
        where: { id: itemId, companyId },
    });
    return serialize(item);
}

/**
 * Desativa item sem apagar histórico.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} itemId - Item alvo.
 * @returns {Promise<void>}
 */
export async function deactivateItem(prisma, companyId, itemId) {
    const updated = await prisma.item.updateMany({
        where: { id: itemId, companyId },
        data: { isActive: false },
    });
    if (updated.count === 0) {
        throw httpError(404, "ITEM_NOT_FOUND", "Artigo/serviço não encontrado");
    }
}
