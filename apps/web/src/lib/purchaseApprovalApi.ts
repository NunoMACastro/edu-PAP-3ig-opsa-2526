import { apiClient } from "./apiClient";

export async function approvePurchaseDocument(id: string) {
    return apiClient.post("/api/purchases/documents/" + id + "/approve", {});
}
export async function markPurchaseDocumentPosted(id: string) {
    return apiClient.post("/api/purchases/documents/" + id + "/post-state", {});
}
