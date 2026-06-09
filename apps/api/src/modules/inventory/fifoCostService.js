// apps/api/src/modules/inventory/fifoCostService.js
import { httpError } from "../../lib/httpErrors.js";

function parseRequiredUnitCostCents(input) {
  const unitCostCents = Number(input?.unitCostCents);

  // FIFO sem custo unitário cria camadas inúteis para margem e relatórios.
  if (!Number.isInteger(unitCostCents) || unitCostCents <= 0) {
    throw httpError(
      400,
      "UNIT_COST_REQUIRED",
      "Indica um custo unitário positivo em cêntimos."
    );
  }

  return unitCostCents;
}

export async function createFifoLayer(tx, { companyId, itemId, warehouseId, sourceMovementId, quantity, unitCostCents }) {
  if (!Number.isInteger(unitCostCents) || unitCostCents <= 0) {
    throw httpError(400, "INVALID_UNIT_COST", "Custo unitário inválido.");
  }

  return tx.stockCostLayer.create({
    data: {
      companyId,
      itemId,
      warehouseId,
      sourceMovementId,
      quantity,
      remainingQuantity: quantity,
      unitCostCents,
    },
  });
}

export async function consumeFifoLayers(tx, { companyId, itemId, warehouseId, movementId, quantity }) {
  let remaining = Number(quantity);
  const layers = await tx.stockCostLayer.findMany({
    where: { companyId, itemId, warehouseId, remainingQuantity: { gt: 0 } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  const consumptions = [];

  for (const layer of layers) {
    if (remaining <= 0) break;
    const used = Math.min(Number(layer.remainingQuantity), remaining);

    // A camada mais antiga é reduzida antes de passar à seguinte: esta é a regra FIFO.
    await tx.stockCostLayer.update({
      where: { id: layer.id },
      data: { remainingQuantity: Number(layer.remainingQuantity) - used },
    });

    consumptions.push(await tx.stockCostConsumption.create({
      data: {
        companyId,
        movementId,
        layerId: layer.id,
        quantity: used,
        unitCostCents: layer.unitCostCents,
        totalCostCents: Math.round(used * layer.unitCostCents),
      },
    }));

    remaining -= used;
  }

  if (remaining > 0) throw httpError(409, "FIFO_LAYERS_INSUFFICIENT", "Não existem camadas FIFO suficientes.");
  return { consumptions, totalCostCents: consumptions.reduce((sum, item) => sum + item.totalCostCents, 0) };
}

export async function previewFifoCost(prisma, { companyId, itemId, warehouseId, quantity }) {
  let remaining = Number(quantity);
  if (!Number.isFinite(remaining) || remaining <= 0) throw httpError(400, "INVALID_STOCK_QUANTITY", "Quantidade inválida.");
  const layers = await prisma.stockCostLayer.findMany({
    where: { companyId, itemId, warehouseId, remainingQuantity: { gt: 0 } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  const items = [];

  for (const layer of layers) {
    if (remaining <= 0) break;
    const used = Math.min(Number(layer.remainingQuantity), remaining);
    items.push({
      layerId: layer.id,
      quantity: used,
      unitCostCents: layer.unitCostCents,
      totalCostCents: Math.round(used * layer.unitCostCents),
    });
    remaining -= used;
  }

  if (remaining > 0) throw httpError(409, "FIFO_LAYERS_INSUFFICIENT", "Não existem camadas FIFO suficientes.");
  return { items, totalCostCents: items.reduce((sum, item) => sum + item.totalCostCents, 0) };
}

export async function applyFifoToMovementInTransaction(tx, { companyId, movement, input }) {
  const createsLayer =
    ["ENTRY", "RETURN"].includes(movement.type) ||
    (movement.type === "ADJUSTMENT" && movement.toWarehouseId);

  if (createsLayer) {
    // Entradas, devoluções e ajustes positivos aumentam stock e precisam de custo.
    await createFifoLayer(tx, {
      companyId,
      itemId: movement.itemId,
      warehouseId: movement.toWarehouseId,
      sourceMovementId: movement.id,
      quantity: movement.quantity,
      unitCostCents: parseRequiredUnitCostCents(input),
    });
  }

  const consumesLayer =
    ["EXIT", "TRANSFER"].includes(movement.type) ||
    (movement.type === "ADJUSTMENT" && movement.fromWarehouseId);

  if (consumesLayer) {
    // Saídas, transferências e ajustes negativos retiram quantidade das camadas mais antigas.
    const result = await consumeFifoLayers(tx, {
      companyId,
      itemId: movement.itemId,
      warehouseId: movement.fromWarehouseId,
      movementId: movement.id,
      quantity: movement.quantity,
    });

    if (movement.type === "TRANSFER") {
      // A transferência não cria custo novo: move o custo consumido para o armazém de destino.
      for (const consumption of result.consumptions) {
        await createFifoLayer(tx, {
          companyId,
          itemId: movement.itemId,
          warehouseId: movement.toWarehouseId,
          sourceMovementId: movement.id,
          quantity: consumption.quantity,
          unitCostCents: consumption.unitCostCents,
        });
      }
    }
  }
}