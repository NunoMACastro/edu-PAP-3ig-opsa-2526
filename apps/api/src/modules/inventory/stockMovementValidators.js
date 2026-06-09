// apps/api/src/modules/inventory/stockMovementValidators.js
import { httpError } from "../../lib/httpErrors.js";

const MOVEMENT_TYPES = new Set(["ENTRY", "EXIT", "TRANSFER", "RETURN", "ADJUSTMENT"]);

export function parseStockMovement(input) {
  const type = String(input?.type ?? "").trim().toUpperCase();
  const quantity = Number(input?.quantity);
  const itemId = String(input?.itemId ?? "").trim();
  const reason = String(input?.reason ?? "").trim();
  const fromWarehouseId = input?.fromWarehouseId ? String(input.fromWarehouseId).trim() : null;
  const toWarehouseId = input?.toWarehouseId ? String(input.toWarehouseId).trim() : null;

  if (!MOVEMENT_TYPES.has(type)) {
    throw httpError(400, "INVALID_STOCK_MOVEMENT_TYPE", "Tipo de movimento inválido.");
  }

  if (!itemId) throw httpError(400, "ITEM_REQUIRED", "Indica o artigo.");
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw httpError(400, "INVALID_STOCK_QUANTITY", "Quantidade inválida.");
  }
  if (reason.length < 4) throw httpError(400, "STOCK_REASON_REQUIRED", "Indica o motivo.");

  if (["ENTRY", "RETURN"].includes(type) && !toWarehouseId) {
    throw httpError(400, "DESTINATION_WAREHOUSE_REQUIRED", "Indica o armazém de destino.");
  }

  if (type === "EXIT" && !fromWarehouseId) {
    throw httpError(400, "SOURCE_WAREHOUSE_REQUIRED", "Indica o armazém de origem.");
  }

  if (type === "TRANSFER" && (!fromWarehouseId || !toWarehouseId)) {
    throw httpError(400, "TRANSFER_WAREHOUSES_REQUIRED", "Indica a origem e o destino da transferência.");
  }

  if (type === "TRANSFER" && fromWarehouseId === toWarehouseId) {
    throw httpError(400, "TRANSFER_SAME_WAREHOUSE", "Origem e destino têm de ser diferentes.");
  }

  if (type === "ADJUSTMENT" && Boolean(fromWarehouseId) === Boolean(toWarehouseId)) {
    throw httpError(
      400,
      "ADJUSTMENT_WAREHOUSE_REQUIRED",
      "Um ajuste deve indicar apenas origem ou apenas destino."
    );
  }

  return { type, quantity, itemId, reason, fromWarehouseId, toWarehouseId };
}