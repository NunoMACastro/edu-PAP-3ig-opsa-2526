// apps/web/src/lib/purchaseApprovalApi.ts
export type PurchaseDecisionAction = "APPROVED" | "REJECTED";

export type PurchaseApprovalHistoryItem = {
  id: string;
  action: PurchaseDecisionAction;
  reason: string;
  decidedAt: string;
  decidedBy: {
    id: string;
    name: string | null;
    email: string;
  };
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Erro inesperado." }));
    throw new Error(body.message ?? "Erro inesperado.");
  }
  return response.json() as Promise<T>;
}

export async function approvePurchaseDocument(id: string, data: { reason?: string } = {}) {
  const response = await fetch(`/api/purchases/documents/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return readJson<{ data: { document: { id: string; status: string }; history: PurchaseApprovalHistoryItem } }>(response);
}

export async function rejectPurchaseDocument(id: string, data: { reason: string }) {
  const response = await fetch(`/api/purchases/documents/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return readJson<{ data: { document: { id: string; status: string }; history: PurchaseApprovalHistoryItem } }>(response);
}

export async function markPurchaseDocumentPosted(id: string) {
  const response = await fetch(`/api/purchases/documents/${id}/post-state`, {
    method: "POST",
    credentials: "include",
  });

  return readJson<{ data: { id: string } }>(response);
}

export async function fetchPurchaseApprovalHistory(documentId: string) {
  const response = await fetch(`/api/purchases/documents/${documentId}/approval-history`, {
    credentials: "include",
  });

  return readJson<{ items: PurchaseApprovalHistoryItem[] }>(response);
}