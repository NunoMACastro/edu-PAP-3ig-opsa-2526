/**
 * @file Service FIFO para camadas de custo de inventário.
 */

import { httpError } from "../../lib/httpErrors.js";
import { assertEnoughFifoStock, measureFifoCost } from "./fifoPerformance.js";

/**
 * Consome camadas FIFO sem permitir custo insuficiente.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Cliente Prisma/transação.
 * @param {{ companyId: string, itemId: string, warehouseId: string, quantity: number, movementId?: string, write?: boolean }} input - Pedido FIFO.
 * @returns {Promise<{ totalCostCents: number, consumptions: object[] }>} Consumos.
 */
export async function consumeFifoLayers(tx, input) {
    const requestedQuantity = Math.abs(Number(input.quantity));

    if (input.write !== false && typeof tx.$queryRaw === "function") {
        // O advisory lock de stock coordena todos os writers da aplicação; o
        // lock de linha acrescenta a barreira PostgreSQL sobre as camadas que
        // serão consumidas nesta transação.
        await tx.$queryRaw`
            SELECT "id"
            FROM "StockCostLayer"
            WHERE "companyId" = ${input.companyId}
              AND "itemId" = ${input.itemId}
              AND "warehouseId" = ${input.warehouseId}
              AND "remainingQuantity" > 0
            ORDER BY "createdAt" ASC, "id" ASC
            FOR UPDATE
        `;
    }

    const layers = await tx.stockCostLayer.findMany({
        where: {
            companyId: input.companyId,
            itemId: input.itemId,
            warehouseId: input.warehouseId,
            remainingQuantity: { gt: 0 },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    const availableQuantity = layers.reduce(
        (total, layer) =>
            Number((total + Number(layer.remainingQuantity)).toFixed(3)),
        0,
    );

    // Falha cedo antes de escrever consumos parciais em stock insuficiente.
    assertEnoughFifoStock(requestedQuantity, availableQuantity);

    const measured = await measureFifoCost(async () => {
        let remaining = requestedQuantity;
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
                // So movimentos definitivos consomem camadas; preview usa write: false.
                await tx.stockCostLayer.update({
                    where: { id: layer.id },
                    data: {
                        remainingQuantity: Number(
                            (available - taken).toFixed(3),
                        ),
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

        return { totalCostCents, consumptions };
    });

    return {
        ...measured.result,
        durationMs: measured.durationMs,
        budgetMs: measured.budgetMs,
        withinBudget: measured.withinBudget,
    };
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
