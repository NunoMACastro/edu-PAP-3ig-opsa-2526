/**
 * @file Service de contagens físicas e ajustes de inventário da MF2.
 */

import { httpError } from "../../lib/httpErrors.js";
import { createStockMovementWithCostInTransaction } from "./stockMovementService.js";

function parseCountLine(line) {
    const itemId = String(line?.itemId ?? "").trim();
    const countedQuantity = Number(line?.countedQuantity);
    const unitCostCents =
        line?.unitCostCents == null || line.unitCostCents === ""
            ? null
            : Number(line.unitCostCents);

    if (!itemId) {
        throw httpError(400, "ITEM_REQUIRED", "Todas as linhas precisam de artigo");
    }
    if (!Number.isFinite(countedQuantity) || countedQuantity < 0) {
        throw httpError(400, "INVALID_COUNTED_QUANTITY", "Quantidade contada inválida");
    }
    if (unitCostCents !== null && (!Number.isInteger(unitCostCents) || unitCostCents <= 0)) {
        throw httpError(400, "INVALID_UNIT_COST", "Custo unitário inválido");
    }
    return { itemId, countedQuantity, unitCostCents };
}

export function parseInventoryCountLines(input) {
    const lines = Array.isArray(input?.lines) ? input.lines.map(parseCountLine) : [];

    if (lines.length === 0) {
        throw httpError(400, "EMPTY_COUNT_LINES", "A contagem precisa de linhas");
    }
    if (new Set(lines.map((line) => line.itemId)).size !== lines.length) {
        throw httpError(400, "DUPLICATED_COUNT_ITEM", "Cada artigo só pode aparecer uma vez na contagem");
    }
    return lines;
}

function parseInventoryCount(input) {
    const warehouseId = String(input?.warehouseId ?? "").trim();
    const reason = String(input?.reason ?? "").trim();
    const countedAt = new Date(String(input?.countedAt ?? new Date().toISOString()));
    const lines = parseInventoryCountLines(input);

    if (!warehouseId) {
        throw httpError(400, "WAREHOUSE_REQUIRED", "Indica o armazém da contagem");
    }
    if (reason.length < 4) {
        throw httpError(400, "COUNT_REASON_REQUIRED", "Indica o motivo da contagem");
    }
    if (Number.isNaN(countedAt.getTime())) {
        throw httpError(400, "INVALID_COUNT_DATE", "Data de contagem inválida");
    }
    return { warehouseId, reason, countedAt, lines };
}

/**
 * Lista contagens da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<object[]>} Contagens recentes.
 */
export async function listInventoryCounts(prisma, companyId) {
    return prisma.inventoryCount.findMany({
        where: { companyId },
        include: { warehouse: true, lines: { include: { item: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
    });
}

/**
 * Cria contagem física em rascunho.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {unknown} input - Payload JSON.
 * @returns {Promise<object>} Contagem criada.
 */
export async function createInventoryCount(prisma, companyId, userId, input) {
    const data = parseInventoryCount(input);
    return prisma.$transaction(async (tx) => {
        const warehouse = await tx.warehouse.findFirst({
            where: { id: data.warehouseId, companyId, isActive: true },
        });
        if (!warehouse) {
            throw httpError(404, "WAREHOUSE_NOT_FOUND", "Armazém não encontrado");
        }

        const itemIds = data.lines.map((line) => line.itemId);
        const items = await tx.item.findMany({
            where: { id: { in: itemIds }, companyId, isActive: true },
        });
        if (items.length !== itemIds.length) {
            throw httpError(404, "ITEM_NOT_FOUND", "Artigo não encontrado");
        }

        const balances = await tx.stockBalance.findMany({
            where: { companyId, warehouseId: data.warehouseId, itemId: { in: itemIds } },
        });
        const balanceByItem = new Map(
            balances.map((balance) => [balance.itemId, Number(balance.quantity)]),
        );

        const count = await tx.inventoryCount.create({
            data: {
                companyId,
                warehouseId: data.warehouseId,
                reason: data.reason,
                countedAt: data.countedAt,
                createdById: userId,
                lines: {
                    create: data.lines.map((line) => ({
                        itemId: line.itemId,
                        expectedQuantity: balanceByItem.get(line.itemId) ?? 0,
                        countedQuantity: line.countedQuantity,
                        unitCostCents: line.unitCostCents,
                    })),
                },
            },
            include: { warehouse: true, lines: { include: { item: true } } },
        });

        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "INVENTORY_COUNT_CREATED",
                entity: "InventoryCount",
                entityId: count.id,
                details: { warehouseId: data.warehouseId, lines: data.lines.length },
            },
        });
        return count;
    });
}

/**
 * Substitui linhas de uma contagem em rascunho.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} id - Contagem.
 * @param {unknown} input - Payload JSON com linhas.
 * @returns {Promise<object[]>} Linhas guardadas.
 */
export async function saveInventoryCountLines(prisma, companyId, userId, id, input) {
    const lines = parseInventoryCountLines(input);
    return prisma.$transaction(async (tx) => {
        const count = await tx.inventoryCount.findFirst({
            where: { id, companyId },
        });
        if (!count) {
            throw httpError(404, "INVENTORY_COUNT_NOT_FOUND", "Contagem não encontrada");
        }
        if (count.status !== "DRAFT") {
            throw httpError(409, "INVENTORY_COUNT_ALREADY_POSTED", "A contagem já foi publicada");
        }

        const itemIds = lines.map((line) => line.itemId);
        const items = await tx.item.findMany({
            where: { id: { in: itemIds }, companyId, isActive: true },
        });
        if (items.length !== itemIds.length) {
            throw httpError(404, "ITEM_NOT_FOUND", "Artigo não encontrado");
        }

        const balances = await tx.stockBalance.findMany({
            where: { companyId, warehouseId: count.warehouseId, itemId: { in: itemIds } },
        });
        const balanceByItem = new Map(
            balances.map((balance) => [balance.itemId, Number(balance.quantity)]),
        );

        await tx.inventoryCountLine.deleteMany({
            where: { inventoryCountId: count.id },
        });
        await tx.inventoryCountLine.createMany({
            data: lines.map((line) => ({
                inventoryCountId: count.id,
                itemId: line.itemId,
                expectedQuantity: balanceByItem.get(line.itemId) ?? 0,
                countedQuantity: line.countedQuantity,
                unitCostCents: line.unitCostCents,
            })),
        });
        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "INVENTORY_COUNT_LINES_UPDATED",
                entity: "InventoryCount",
                entityId: count.id,
                details: { lines: lines.length },
            },
        });

        return tx.inventoryCountLine.findMany({
            where: { inventoryCountId: count.id },
            include: { item: true },
            orderBy: { itemId: "asc" },
        });
    });
}

/**
 * Publica contagem e cria ajustes transacionais.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} id - Contagem.
 * @returns {Promise<object>} Contagem publicada.
 */
export async function postInventoryCount(prisma, companyId, userId, id) {
    return prisma.$transaction(async (tx) => {
        const count = await tx.inventoryCount.findFirst({
            where: { id, companyId },
            include: { lines: true },
        });
        if (!count) {
            throw httpError(404, "INVENTORY_COUNT_NOT_FOUND", "Contagem não encontrada");
        }
        if (count.status !== "DRAFT") {
            throw httpError(409, "INVENTORY_COUNT_ALREADY_POSTED", "A contagem já foi publicada");
        }

        const adjustments = [];
        for (const line of count.lines) {
            const diff = Number((Number(line.countedQuantity) - Number(line.expectedQuantity)).toFixed(3));
            if (diff === 0) continue;
            if (diff > 0 && !line.unitCostCents) {
                throw httpError(400, "UNIT_COST_REQUIRED", "Excedente físico exige custo unitário");
            }
            const movement = await createStockMovementWithCostInTransaction(tx, {
                companyId,
                userId,
                movement: {
                    type: "ADJUSTMENT",
                    itemId: line.itemId,
                    quantity: diff,
                    unitCostCents: line.unitCostCents,
                    fromWarehouseId: diff < 0 ? count.warehouseId : null,
                    toWarehouseId: diff > 0 ? count.warehouseId : null,
                    reason: `Ajuste da contagem ${count.id}: ${count.reason}`,
                    sourceType: "INVENTORY_COUNT",
                    sourceId: count.id,
                },
            });
            adjustments.push({
                itemId: line.itemId,
                movementId: movement.id,
                diff,
            });
        }

        const posted = await tx.inventoryCount.update({
            where: { id: count.id },
            data: { status: "POSTED", postedAt: new Date() },
            include: { warehouse: true, lines: { include: { item: true } } },
        });
        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "INVENTORY_COUNT_POSTED",
                entity: "InventoryCount",
                entityId: count.id,
                details: {
                    warehouseId: count.warehouseId,
                    lines: count.lines.length,
                    adjustments,
                    postedAt: posted.postedAt?.toISOString() ?? null,
                },
            },
        });
        return posted;
    });
}
