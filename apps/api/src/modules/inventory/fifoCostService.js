/**
 * @file Service FIFO para camadas de custo de inventário.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Consome camadas FIFO sem permitir custo insuficiente.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Cliente Prisma/transação.
 * @param {{ companyId: string, itemId: string, warehouseId: string, quantity: number, movementId?: string, write?: boolean }} input - Pedido FIFO.
 * @returns {Promise<{ totalCostCents: number, consumptions: object[] }>} Consumos.
 */
export async function consumeFifoLayers(tx, input) {
    let remaining = Math.abs(Number(input.quantity));
    const layers = await tx.stockCostLayer.findMany({
        where: {
            companyId: input.companyId,
            itemId: input.itemId,
            warehouseId: input.warehouseId,
            remainingQuantity: { gt: 0 },
        },
        orderBy: { createdAt: "asc" },
    });
    const consumptions = [];
    let totalCostCents = 0;

    for (const layer of layers) {
        if (remaining <= 0) break;
        const available = Number(layer.remainingQuantity);
        const taken = Math.min(available, remaining);
        const lineCost = Math.round(taken * layer.unitCostCents);
        remaining = Number((remaining - taken).toFixed(3));
        totalCostCents += lineCost;
        consumptions.push({
            layerId: layer.id,
            quantity: taken,
            unitCostCents: layer.unitCostCents,
            totalCostCents: lineCost,
        });

        if (input.write !== false) {
            await tx.stockCostLayer.update({
                where: { id: layer.id },
                data: {
                    remainingQuantity: Number((available - taken).toFixed(3)),
                },
            });
            await tx.stockCostConsumption.create({
                data: {
                    companyId: input.companyId,
                    movementId: input.movementId,
                    layerId: layer.id,
                    quantity: taken,
                    unitCostCents: layer.unitCostCents,
                    totalCostCents: lineCost,
                },
            });
        }
    }

    if (remaining > 0) {
        throw httpError(
            409,
            "INSUFFICIENT_FIFO_LAYERS",
            "Não existem camadas FIFO suficientes para este movimento",
        );
    }

    return { totalCostCents, consumptions };
}

/**
 * Cria uma camada valorizada.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Cliente Prisma/transação.
 * @param {{ companyId: string, itemId: string, warehouseId: string, movementId: string, quantity: number, unitCostCents: number }} input - Dados da camada.
 * @returns {Promise<object>} Camada criada.
 */
export async function createCostLayer(tx, input) {
    return tx.stockCostLayer.create({
        data: {
            companyId: input.companyId,
            itemId: input.itemId,
            warehouseId: input.warehouseId,
            sourceMovementId: input.movementId,
            quantity: input.quantity,
            remainingQuantity: input.quantity,
            unitCostCents: input.unitCostCents,
        },
    });
}

/**
 * Simula custo FIFO sem escrever dados.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, itemId: string, warehouseId: string, quantity: number }} input - Pedido de preview.
 * @returns {Promise<object>} Resultado simulado.
 */
export async function previewFifoCost(prisma, input) {
    if (!input.itemId || !input.warehouseId || !Number.isFinite(Number(input.quantity)) || Number(input.quantity) <= 0) {
        throw httpError(400, "INVALID_FIFO_PREVIEW", "Indica artigo, armazém e quantidade positiva");
    }

    return consumeFifoLayers(prisma, {
        companyId: input.companyId,
        itemId: input.itemId,
        warehouseId: input.warehouseId,
        quantity: Number(input.quantity),
        write: false,
    });
}
