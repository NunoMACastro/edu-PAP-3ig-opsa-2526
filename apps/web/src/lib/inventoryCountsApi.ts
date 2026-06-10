// apps/web/src/lib/inventoryCountsApi.ts
export type InventoryCountLineInput = {
  itemId: string;
  countedQuantity: number;
  unitCostCents?: number | null;
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Erro inesperado." }));
    throw new Error(body.message ?? "Erro inesperado.");
  }

  return response.json() as Promise<T>;
}

export async function createInventoryCount(data: { warehouseId: string; reason: string; countedAt?: string }) {
  const response = await fetch("/api/inventory/counts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return readJson<{ count: { id: string; status: string } }>(response);
}

export async function saveInventoryCountLines(countId: string, lines: InventoryCountLineInput[]) {
  const response = await fetch(`/api/inventory/counts/${countId}/lines`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ lines }),
  });

  return readJson<{
    lines: Array<{ id: string; itemId: string; countedQuantity: number; unitCostCents: number | null }>;
  }>(response);
}

export async function postInventoryCount(countId: string) {
  const response = await fetch(`/api/inventory/counts/${countId}/post`, {
    method: "POST",
    credentials: "include",
  });

  return readJson<{ count: { id: string; status: string } }>(response);
}