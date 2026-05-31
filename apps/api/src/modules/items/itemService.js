import { httpError } from "../../lib/httpErrors.js";

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

async function assertUniqueSku(prisma, companyId, sku, ignoreId = undefined) {
    const existing = await prisma.item.findFirst({
        where: { companyId, sku, id: ignoreId ? { not: ignoreId } : undefined },
    });
    if (existing)
        throw httpError(
            409,
            "ITEM_SKU_EXISTS",
            "Ja existe artigo/servico com este SKU nesta empresa",
        );
}

export async function listItems(prisma, companyId) {
    const items = await prisma.item.findMany({
        where: { companyId, isActive: true },
        orderBy: { sku: "asc" },
    });
    return items.map(serialize);
}

export async function createItem(prisma, companyId, input) {
    await assertUniqueSku(prisma, companyId, input.sku);
    const item = await prisma.item.create({ data: { companyId, ...input } });
    return serialize(item);
}

export async function updateItem(prisma, companyId, itemId, input) {
    await assertUniqueSku(prisma, companyId, input.sku, itemId);
    const updated = await prisma.item.updateMany({
        where: { id: itemId, companyId },
        data: input,
    });
    if (updated.count === 0)
        throw httpError(404, "ITEM_NOT_FOUND", "Artigo/servico nao encontrado");

    const item = await prisma.item.findFirst({
        where: { id: itemId, companyId },
    });
    return serialize(item);
}

export async function deactivateItem(prisma, companyId, itemId) {
    const updated = await prisma.item.updateMany({
        where: { id: itemId, companyId },
        data: { isActive: false },
    });
    if (updated.count === 0)
        throw httpError(404, "ITEM_NOT_FOUND", "Artigo/servico nao encontrado");
}