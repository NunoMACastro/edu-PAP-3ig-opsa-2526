export type StockMovementType = "ENTRY" | "EXIT" | "TRANSFER" | "RETURN" | "ADJUSTMENT";
export type StockMovementInput = {
  type: StockMovementType;
  itemId: string;
  quantity: number;
  reason: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  unitCostCents?: number;
};

export async function createStockMovement(data: StockMovementInput) {
  const response = await fetch("/api/inventory/stock-movements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Não foi possível criar o movimento." }));
    throw new Error(body.message ?? "Não foi possível criar o movimento.");
  }

  return response.json() as Promise<{ movement: { id: string; type: StockMovementType } }>;
}