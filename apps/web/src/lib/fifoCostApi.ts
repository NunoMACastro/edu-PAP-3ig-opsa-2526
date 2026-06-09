// apps/web/src/lib/fifoCostApi.ts
export type FifoPreviewLine = { layerId: string; quantity: number; unitCostCents: number; totalCostCents: number };

export async function previewFifoCost(params: { itemId: string; warehouseId: string; quantity: number }) {
  const search = new URLSearchParams({ itemId: params.itemId, warehouseId: params.warehouseId, quantity: String(params.quantity) });
  const response = await fetch(`/api/inventory/fifo-cost/preview?${search.toString()}`, { credentials: "include" });
  if (!response.ok) throw new Error((await response.json()).message ?? "Não foi possível calcular FIFO.");
  return response.json() as Promise<{ items: FifoPreviewLine[]; totalCostCents: number }>;
}