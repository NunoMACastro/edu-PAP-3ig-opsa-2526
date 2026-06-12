import { apiClient } from "./apiClient";

export const purchaseApprovalApi = {
  approveDocument: (id: string) => apiClient.purchases.approveDocument(id),
  rejectDocument: (id: string, reason: string) =>
    apiClient.purchases.rejectDocument(id, { reason }),
  approvalHistory: (id: string) => apiClient.purchases.approvalHistory(id),
  postState: (id: string) => apiClient.purchases.postState(id),
};
