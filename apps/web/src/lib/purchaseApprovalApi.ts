import { apiClient } from "./apiClient";

export const purchaseApprovalApi = {
  approveDocument: (id: string) => apiClient.purchases.approveDocument(id),
  postState: (id: string) => apiClient.purchases.postState(id),
};
