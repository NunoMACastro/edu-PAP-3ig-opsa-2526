// apps/api/src/modules/inventory/stockMovementService.js
import { httpError } from "../../lib/httpErrors.js";
import { parseStockMovement } from "./stockMovementValidators.js";
import { applyFifoToMovementInTransaction } from "./fifoCostService.js";

const MOVEMENT_TYPES = new Set(["ENTRY", "EXIT", "TRANSFER", "RETURN", "ADJUSTMENT"]);

async function assertItemAndWarehousesBelongToCompany(tx, { companyId, itemId, fromWarehouseId, toWarehouseId }) {
  const item = await tx.item.findFirst({ where: { id: itemId, companyId, isActive: true }, select: { id: true } });
  if (!item) throw httpError(404, "ITEM_NOT_FOUND", "Artigo não encontrado nesta empresa.");

  const warehouseIds = [fromWarehouseId, toWarehouseId].filter(Boolean);
  const warehouses = await tx.warehouse.findMany({
    where: { id: { in: warehouseIds }, companyId, isActive: true },
    select: { id: true },
  });

  if (warehouses.length !== warehouseIds.length) {
    throw httpError(404, "WAREHOUSE_NOT_FOUND", "Armazém não encontrado nesta empresa.");
  }
}

async function changeBalance(tx, { companyId, itemId, warehouseId, delta }) {
  const current = await tx.stockBalance.upsert({
    where: { companyId_itemId_warehouseId: { companyId, itemId, warehouseId } },
    update: {},
    create: { companyId, itemId, warehouseId, quantity: 0 },
  });

  const nextQuantity = Number(current.quantity) + delta;
  if (nextQuantity < 0) throw httpError(409, "INSUFFICIENT_STOCK", "Saldo insuficiente.");

  return tx.stockBalance.update({
    where: { id: current.id },
    data: { quantity: nextQuantity },
  });
}

export async function createStockMovementInTransaction(tx, { companyId, userId, input }) {
  const data = parseStockMovement(input);
  await assertItemAndWarehousesBelongToCompany(tx, { companyId, ...data });

  if (data.fromWarehouseId) {
    await changeBalance(tx, {
      companyId,
      itemId: data.itemId,
      warehouseId: data.fromWarehouseId,
      delta: -data.quantity,
    });
  }

  if (data.toWarehouseId) {
    await changeBalance(tx, {
      companyId,
      itemId: data.itemId,
      warehouseId: data.toWarehouseId,
      delta: data.quantity,
    });
  }

  const movement = await tx.stockMovement.create({
    data: { ...data, companyId, createdById: userId },
  });

  // A auditoria permite explicar quem alterou stock, em que empresa e por que motivo.
  await tx.auditLog.create({
    data: {
      companyId,
      userId,
      action: "STOCK_MOVEMENT_CREATED",
      entity: "StockMovement",
      entityId: movement.id,
      details: {
        type: data.type,
        quantity: data.quantity,
        fromWarehouseId: data.fromWarehouseId,
        toWarehouseId: data.toWarehouseId,
      },
    },
  });

  return movement;
}

export async function createStockMovement(prisma, context) {
  return prisma.$transaction((tx) => createStockMovementInTransaction(tx, context));
}

export async function createStockMovementWithCostInTransaction(tx, context) {
  // Esta função reutiliza a criação de movimento do BK-MF2-02 e acrescenta a valorização FIFO.
  const movement = await createStockMovementInTransaction(tx, context);
  await applyFifoToMovementInTransaction(tx, {
    companyId: context.companyId,
    movement,
    input: context.input,
  });

  return movement;
}

export async function createStockMovement(prisma, context) {
  return prisma.$transaction((tx) => createStockMovementWithCostInTransaction(tx, context));
}