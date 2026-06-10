// apps/api/src/modules/inventory/inventoryCountService.js
import { httpError } from "../../lib/httpErrors.js";
import { createStockMovementWithCostInTransaction } from "./stockMovementService.js";

function parseInventoryCount(input) {
  const warehouseId = String(input?.warehouseId ?? "").trim();
  const reason = String(input?.reason ?? "").trim();
  const countedAt = new Date(String(input?.countedAt ?? new Date().toISOString()));

  if (!warehouseId) throw httpError(400, "WAREHOUSE_REQUIRED", "Indica o armazém da contagem.");
  if (reason.length < 4) throw httpError(400, "COUNT_REASON_REQUIRED", "Indica o motivo da contagem.");
  if (Number.isNaN(countedAt.getTime())) throw httpError(400, "INVALID_COUNT_DATE", "Data de contagem inválida.");

  return { warehouseId, reason, countedAt };
}

function parseInventoryCountLines(input) {
  const lines = Array.isArray(input?.lines) ? input.lines : [];
  if (lines.length === 0) throw httpError(400, "INVENTORY_COUNT_LINES_REQUIRED", "Indica pelo menos uma linha.");

  const parsedLines = lines.map((line) => {
    const itemId = String(line.itemId ?? "").trim();
    const countedQuantity = Number(line.countedQuantity);
    // O custo só é usado quando um excedente físico cria stock novo no FIFO.
    const unitCostCents =
      line.unitCostCents === undefined || line.unitCostCents === null
        ? null
        : Number(line.unitCostCents);

    if (!itemId) throw httpError(400, "ITEM_REQUIRED", "Indica o artigo.");
    if (!Number.isFinite(countedQuantity) || countedQuantity < 0) {
      throw httpError(400, "INVALID_COUNTED_QUANTITY", "A quantidade contada não pode ser negativa.");
    }
    if (unitCostCents !== null && (!Number.isInteger(unitCostCents) || unitCostCents <= 0)) {
      throw httpError(400, "INVALID_UNIT_COST", "O custo unitário deve ser positivo.");
    }

    return { itemId, countedQuantity, unitCostCents };
  });

  const uniqueItemIds = new Set(parsedLines.map((line) => line.itemId));
  if (uniqueItemIds.size !== parsedLines.length) {
    throw httpError(400, "DUPLICATE_COUNT_LINE", "Cada artigo só pode aparecer uma vez na contagem.");
  }

  return parsedLines;
}

export async function createInventoryCount(prisma, { companyId, userId, input }) {
  const data = parseInventoryCount(input);

  return prisma.$transaction(async (tx) => {
    const warehouse = await tx.warehouse.findFirst({
      where: { id: data.warehouseId, companyId, isActive: true },
      select: { id: true },
    });

    if (!warehouse) throw httpError(404, "WAREHOUSE_NOT_FOUND", "Armazém não encontrado.");

    const count = await tx.inventoryCount.create({
      data: {
        companyId,
        warehouseId: data.warehouseId,
        reason: data.reason,
        countedAt: data.countedAt,
        status: "DRAFT",
        createdById: userId,
      },
    });

    await tx.auditLog.create({
      data: {
        companyId,
        userId,
        action: "INVENTORY_COUNT_CREATED",
        entity: "InventoryCount",
        entityId: count.id,
        details: { warehouseId: data.warehouseId },
      },
    });

    return count;
  });
}

export async function saveInventoryCountLines(prisma, { companyId, countId, input }) {
  const lines = parseInventoryCountLines(input);

  return prisma.$transaction(async (tx) => {
    const count = await tx.inventoryCount.findFirst({
      where: { id: countId, companyId },
    });

    if (!count) throw httpError(404, "INVENTORY_COUNT_NOT_FOUND", "Contagem não encontrada.");
    if (count.status !== "DRAFT") throw httpError(409, "INVENTORY_COUNT_NOT_EDITABLE", "Só contagens em rascunho podem ser editadas.");

    const itemIds = lines.map((line) => line.itemId);
    const items = await tx.item.findMany({
      where: { id: { in: itemIds }, companyId, isActive: true },
      select: { id: true },
    });

    if (items.length !== new Set(itemIds).size) throw httpError(404, "ITEM_NOT_FOUND", "Artigo não encontrado.");

    await tx.inventoryCountLine.deleteMany({ where: { inventoryCountId: count.id } });

    const createdLines = [];
    for (const line of lines) {
      const balance = await tx.stockBalance.findUnique({
        where: {
          companyId_itemId_warehouseId: {
            companyId,
            itemId: line.itemId,
            warehouseId: count.warehouseId,
          },
        },
      });

      createdLines.push(
        await tx.inventoryCountLine.create({
          data: {
            inventoryCountId: count.id,
            itemId: line.itemId,
            expectedQuantity: Number(balance?.quantity ?? 0),
            countedQuantity: line.countedQuantity,
            unitCostCents: line.unitCostCents,
          },
        })
      );
    }

    return createdLines;
  });
}

export async function postInventoryCount(prisma, { companyId, userId, countId }) {
  return prisma.$transaction(async (tx) => {
    const count = await tx.inventoryCount.findFirst({
      where: { id: countId, companyId },
      include: { lines: true },
    });

    if (!count) throw httpError(404, "INVENTORY_COUNT_NOT_FOUND", "Contagem não encontrada.");
    if (count.status !== "DRAFT") throw httpError(409, "INVENTORY_COUNT_ALREADY_POSTED", "Contagem já publicada.");
    if (count.lines.length === 0) throw httpError(400, "INVENTORY_COUNT_LINES_REQUIRED", "A contagem não tem linhas.");

    for (const line of count.lines) {
      const difference = Number(line.countedQuantity) - Number(line.expectedQuantity);
      if (difference === 0) continue;

      if (difference > 0 && !line.unitCostCents) {
        throw httpError(
          400,
          "COUNT_ADJUSTMENT_UNIT_COST_REQUIRED",
          "Indica o custo unitário para excedentes de stock."
        );
      }

      await createStockMovementWithCostInTransaction(tx, {
        companyId,
        userId,
        input:
          difference > 0
            ? {
                // Ajuste positivo: entra stock e cria camada FIFO valorizada.
                type: "ADJUSTMENT",
                itemId: line.itemId,
                quantity: difference,
                toWarehouseId: count.warehouseId,
                unitCostCents: line.unitCostCents,
                reason: `Ajuste de contagem ${count.id}`,
              }
            : {
                // Ajuste negativo: sai stock e consome camadas FIFO existentes.
                type: "ADJUSTMENT",
                itemId: line.itemId,
                quantity: Math.abs(difference),
                fromWarehouseId: count.warehouseId,
                reason: `Ajuste de contagem ${count.id}`,
              },
      });
    }

    const posted = await tx.inventoryCount.update({
      where: { id: count.id },
      data: { status: "POSTED", postedAt: new Date() },
      include: { lines: true },
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
          postedAt: posted.postedAt?.toISOString() ?? null,
        },
      },
    });

    return posted;
  });
}