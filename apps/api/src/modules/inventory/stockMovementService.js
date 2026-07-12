/**
 * @file Service transacional de movimentos de stock da MF2.
 */

import {
    buildCursorPage,
    buildKeysetCondition,
    decodePageCursor,
    parsePageLimit,
} from "../../lib/cursorPagination.js";
import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import { createCostLayer, consumeFifoLayers } from "./fifoCostService.js";
import { parseStockMovement } from "./stockMovementValidators.js";

/**
 * Confirma que artigo e armazéns pertencem à empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Cliente Prisma/transação.
 * @param {string} companyId - Empresa ativa.
 * @param {object} movement - Movimento validado.
 * @returns {Promise<void>}
 */
async function assertInventoryRefs(tx, companyId, movement) {
    const item = await tx.item.findFirst({
        where: { id: movement.itemId, companyId, isActive: true },
    });
    if (!item) {
        throw httpError(404, "ITEM_NOT_FOUND", "Artigo não encontrado");
    }

    const warehouseIds = [
        movement.fromWarehouseId,
        movement.toWarehouseId,
    ].filter(Boolean);
    if (warehouseIds.length === 0) return;
    const warehouses = await tx.warehouse.findMany({
        where: { id: { in: warehouseIds }, companyId, isActive: true },
    });
    if (warehouses.length !== new Set(warehouseIds).size) {
        throw httpError(404, "WAREHOUSE_NOT_FOUND", "Armazém não encontrado");
    }
}

/**
 * Serializa todas as mutações do mesmo artigo/armazém numa ordem determinística.
 *
 * A ordenação evita deadlocks em transferências A -> B concorrentes com B -> A.
 * O lock cobre saldo e camadas FIFO porque ambos usam a mesma chave de recurso.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {object} movement - Movimento validado.
 * @returns {Promise<void>}
 */
async function lockInventoryResources(tx, companyId, movement) {
    const warehouseIds = [
        movement.fromWarehouseId,
        movement.toWarehouseId,
    ]
        .filter(Boolean)
        .sort();

    for (const warehouseId of new Set(warehouseIds)) {
        await acquireTransactionLock(
            tx,
            "stock",
            companyId,
            movement.itemId,
            warehouseId,
        );
    }
}

/**
 * Obtém saldo atual para validações.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Cliente Prisma/transação.
 * @param {string} companyId - Empresa ativa.
 * @param {string} itemId - Artigo.
 * @param {string} warehouseId - Armazém.
 * @returns {Promise<number>} Quantidade atual.
 */
async function getBalanceQuantity(tx, companyId, itemId, warehouseId) {
    if (typeof tx.$queryRaw === "function") {
        const rows = await tx.$queryRaw`
            SELECT "quantity"
            FROM "StockBalance"
            WHERE "companyId" = ${companyId}
              AND "itemId" = ${itemId}
              AND "warehouseId" = ${warehouseId}
            FOR UPDATE
        `;
        return Number(rows[0]?.quantity ?? 0);
    }

    // Compatibilidade exclusiva com doubles unitários sem cliente SQL real.
    const balance = await tx.stockBalance.findUnique({
        where: { companyId_itemId_warehouseId: { companyId, itemId, warehouseId } },
    });
    return balance ? Number(balance.quantity) : 0;
}

/**
 * Aplica delta ao saldo, criando a linha quando necessário.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Cliente Prisma/transação.
 * @param {string} companyId - Empresa ativa.
 * @param {string} itemId - Artigo.
 * @param {string} warehouseId - Armazém.
 * @param {number} delta - Diferença.
 * @returns {Promise<void>}
 */
async function applyBalanceDelta(tx, companyId, itemId, warehouseId, delta) {
    const current = await getBalanceQuantity(tx, companyId, itemId, warehouseId);
    const next = Number((current + delta).toFixed(3));
    if (next < 0) {
        throw httpError(409, "INSUFFICIENT_STOCK", "Saldo insuficiente para o movimento");
    }
    await tx.stockBalance.upsert({
        where: { companyId_itemId_warehouseId: { companyId, itemId, warehouseId } },
        create: { companyId, itemId, warehouseId, quantity: next },
        update: { quantity: next },
    });
}

/**
 * Cria movimento já validado dentro de transação externa.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Cliente Prisma/transação.
 * @param {{ companyId: string, userId: string, movement: object }} input - Contexto.
 * @returns {Promise<object>} Movimento criado.
 */
export async function createStockMovementWithCostInTransaction(tx, input) {
    const movement = input.movement;
    await lockInventoryResources(tx, input.companyId, movement);
    await assertInventoryRefs(tx, input.companyId, movement);

    const stockMovement = await tx.stockMovement.create({
        data: {
            companyId: input.companyId,
            itemId: movement.itemId,
            type: movement.type,
            quantity: movement.quantity,
            unitCostCents: movement.unitCostCents,
            fromWarehouseId: movement.fromWarehouseId,
            toWarehouseId: movement.toWarehouseId,
            reason: movement.reason,
            sourceType: movement.sourceType,
            sourceId: movement.sourceId,
            createdById: input.userId,
        },
    });

    let totalCostCents = null;
    if (movement.type === "ENTRY" || movement.type === "RETURN") {
        await applyBalanceDelta(
            tx,
            input.companyId,
            movement.itemId,
            movement.toWarehouseId,
            movement.quantity,
        );
        await createCostLayer(tx, {
            companyId: input.companyId,
            itemId: movement.itemId,
            warehouseId: movement.toWarehouseId,
            movementId: stockMovement.id,
            quantity: movement.quantity,
            unitCostCents: movement.unitCostCents,
        });
        totalCostCents = Math.round(movement.quantity * movement.unitCostCents);
    }

    if (movement.type === "EXIT") {
        await applyBalanceDelta(
            tx,
            input.companyId,
            movement.itemId,
            movement.fromWarehouseId,
            -movement.quantity,
        );
        const fifo = await consumeFifoLayers(tx, {
            companyId: input.companyId,
            itemId: movement.itemId,
            warehouseId: movement.fromWarehouseId,
            quantity: movement.quantity,
            movementId: stockMovement.id,
        });
        totalCostCents = fifo.totalCostCents;
    }

    if (movement.type === "TRANSFER") {
        await applyBalanceDelta(
            tx,
            input.companyId,
            movement.itemId,
            movement.fromWarehouseId,
            -movement.quantity,
        );
        await applyBalanceDelta(
            tx,
            input.companyId,
            movement.itemId,
            movement.toWarehouseId,
            movement.quantity,
        );
        const fifo = await consumeFifoLayers(tx, {
            companyId: input.companyId,
            itemId: movement.itemId,
            warehouseId: movement.fromWarehouseId,
            quantity: movement.quantity,
            movementId: stockMovement.id,
        });
        for (const consumed of fifo.consumptions) {
            await createCostLayer(tx, {
                companyId: input.companyId,
                itemId: movement.itemId,
                warehouseId: movement.toWarehouseId,
                movementId: stockMovement.id,
                quantity: consumed.quantity,
                unitCostCents: consumed.unitCostCents,
            });
        }
        totalCostCents = fifo.totalCostCents;
    }

    if (movement.type === "ADJUSTMENT") {
        if (movement.quantity > 0) {
            await applyBalanceDelta(
                tx,
                input.companyId,
                movement.itemId,
                movement.toWarehouseId,
                movement.quantity,
            );
            await createCostLayer(tx, {
                companyId: input.companyId,
                itemId: movement.itemId,
                warehouseId: movement.toWarehouseId,
                movementId: stockMovement.id,
                quantity: movement.quantity,
                unitCostCents: movement.unitCostCents,
            });
            totalCostCents = Math.round(movement.quantity * movement.unitCostCents);
        } else {
            const quantity = Math.abs(movement.quantity);
            await applyBalanceDelta(
                tx,
                input.companyId,
                movement.itemId,
                movement.fromWarehouseId,
                -quantity,
            );
            const fifo = await consumeFifoLayers(tx, {
                companyId: input.companyId,
                itemId: movement.itemId,
                warehouseId: movement.fromWarehouseId,
                quantity,
                movementId: stockMovement.id,
            });
            totalCostCents = fifo.totalCostCents;
        }
    }

    await tx.auditLog.create({
        data: {
            companyId: input.companyId,
            userId: input.userId,
            action: "STOCK_MOVEMENT_CREATED",
            entity: "StockMovement",
            entityId: stockMovement.id,
            details: {
                type: movement.type,
                itemId: movement.itemId,
                quantity: movement.quantity,
                totalCostCents,
            },
        },
    });

    if (totalCostCents !== null) {
        return tx.stockMovement.update({
            where: { id: stockMovement.id },
            data: { totalCostCents },
        });
    }
    return stockMovement;
}

/**
 * Cria movimento de stock a partir de payload externo.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {unknown} input - Payload JSON.
 * @returns {Promise<object>} Movimento criado.
 */
export async function createStockMovement(prisma, companyId, userId, input) {
    const movement = parseStockMovement(input);
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            return await prisma.$transaction(
                (tx) => createStockMovementWithCostInTransaction(tx, {
                    companyId,
                    userId,
                    movement,
                }),
                { isolationLevel: "Serializable" },
            );
        } catch (error) {
            if (error?.code !== "P2034" || attempt === maxAttempts) throw error;
        }
    }

    throw httpError(409, "STALE_STATE", "Não foi possível serializar o movimento");
}

/**
 * Lista movimentos de stock da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {{ cursor?: string, limit?: string | number }} [page] - Paginação pedida.
 * @returns {Promise<{items: object[], pageInfo: object}>} Página de movimentos.
 */
export async function listStockMovements(prisma, companyId, page = {}) {
    const limit = parsePageLimit(page.limit);
    const cursor = decodePageCursor(page.cursor, "date");
    const keyset = buildKeysetCondition(cursor, {
        sortField: "createdAt",
        direction: "desc",
    });
    const baseWhere = { companyId };
    const records = await prisma.stockMovement.findMany({
        where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
        include: { item: true, fromWarehouse: true, toWarehouse: true },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
    });
    return buildCursorPage(records, {
        limit,
        sortField: "createdAt",
        sortType: "date",
    });
}
